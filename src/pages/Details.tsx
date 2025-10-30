import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, MapPin, Calendar, Clock } from "lucide-react";
import { toast } from "sonner";
import { Session } from "@supabase/supabase-js";

interface Experience {
  id: string;
  name: string;
  description: string;
  long_description: string;
  price: number;
  image_url: string;
  location: string;
}

interface Slot {
  id: string;
  date: string;
  time: string;
  remaining_seats: number;
}

const Details = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [experience, setExperience] = useState<Experience | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (id) {
      fetchExperience();
      fetchSlots();
    }
  }, [id]);

  const fetchExperience = async () => {
    try {
      const { data, error } = await supabase
        .from("experiences")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setExperience(data);
    } catch (error) {
      console.error("Error fetching experience:", error);
      toast.error("Failed to load experience details");
    } finally {
      setLoading(false);
    }
  };

  const fetchSlots = async () => {
    try {
      const { data, error } = await supabase
        .from("slots")
        .select("*")
        .eq("experience_id", id)
        .gt("remaining_seats", 0)
        .order("date", { ascending: true })
        .order("time", { ascending: true });

      if (error) throw error;
      setSlots(data || []);
    } catch (error) {
      console.error("Error fetching slots:", error);
    }
  };

  const uniqueDates = Array.from(new Set(slots.map((slot) => slot.date)));
  const availableTimes = slots.filter((slot) => slot.date === selectedDate);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime("");
    setSelectedSlot(null);
  };

  const handleTimeSelect = (time: string, slot: Slot) => {
    setSelectedTime(time);
    setSelectedSlot(slot);
  };

  const handleConfirm = () => {
    if (!session) {
      toast.error("Please log in to continue");
      navigate("/login");
      return;
    }

    if (!selectedSlot || !experience) {
      toast.error("Please select both date and time");
      return;
    }

    navigate("/checkout", {
      state: {
        experience,
        slot: selectedSlot,
        date: selectedDate,
        time: selectedTime,
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary/30">
        <Navbar />
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="min-h-screen bg-secondary/30">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-xl text-muted-foreground">Experience not found</p>
          <Button onClick={() => navigate("/")} className="mt-4">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl overflow-hidden">
              <img
                src={experience.image_url}
                alt={experience.name}
                className="w-full h-[400px] object-cover"
              />
            </div>

            <div>
              <h1 className="text-4xl font-bold mb-2">{experience.name}</h1>
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <MapPin className="h-5 w-5" />
                <span>{experience.location}</span>
              </div>
              <p className="text-lg text-muted-foreground">{experience.description}</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Choose Date
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {uniqueDates.map((date) => (
                    <Button
                      key={date}
                      variant={selectedDate === date ? "default" : "outline"}
                      onClick={() => handleDateSelect(date)}
                      className="min-w-[120px]"
                    >
                      {new Date(date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {selectedDate && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Choose Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {availableTimes.map((slot) => (
                      <Button
                        key={slot.id}
                        variant={selectedTime === slot.time ? "default" : "outline"}
                        onClick={() => handleTimeSelect(slot.time, slot)}
                        className="min-w-[140px] flex flex-col h-auto py-3"
                      >
                        <span>{slot.time}</span>
                        <span className="text-xs mt-1 opacity-80">
                          {slot.remaining_seats} seats left
                        </span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>About This Experience</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-line">
                  {experience.long_description}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="text-3xl font-bold text-primary">
                    ₹{experience.price.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">per person</p>
                </div>

                {selectedDate && (
                  <div>
                    <p className="text-sm text-muted-foreground">Selected Date</p>
                    <p className="font-semibold">
                      {new Date(selectedDate).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                )}

                {selectedTime && (
                  <div>
                    <p className="text-sm text-muted-foreground">Selected Time</p>
                    <p className="font-semibold">{selectedTime}</p>
                  </div>
                )}

                {selectedSlot && (
                  <div>
                    <p className="text-sm text-muted-foreground">Available Seats</p>
                    <p className="font-semibold">{selectedSlot.remaining_seats} remaining</p>
                  </div>
                )}

                <Button
                  onClick={handleConfirm}
                  disabled={!selectedDate || !selectedTime}
                  className="w-full"
                  size="lg"
                >
                  Confirm & Continue
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Details;
