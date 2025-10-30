import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

const Success = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { experience, date, time, total } = location.state || {};

  useEffect(() => {
    if (!experience) {
      navigate("/");
    }
  }, [experience, navigate]);

  if (!experience) {
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-secondary/30">
        <Navbar />
        <main className="container mx-auto px-4 py-20">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <div className="flex justify-center">
              <CheckCircle className="h-24 w-24 text-green-500 animate-in zoom-in duration-500" />
            </div>

            <div className="space-y-2">
              <h1 className="text-4xl font-bold">Booking Confirmed!</h1>
              <p className="text-xl text-muted-foreground">
                Your adventure awaits! We've sent a confirmation email with all the details.
              </p>
            </div>

            <Card className="text-left">
              <CardHeader>
                <CardTitle>Booking Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Experience</p>
                  <p className="font-semibold text-lg">{experience.name}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-semibold">
                      {new Date(date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Time</p>
                    <p className="font-semibold">{time}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total Paid</span>
                    <span className="text-2xl font-bold text-primary">
                      ₹{total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4 justify-center">
              <Button onClick={() => navigate("/")} size="lg">
                Browse More Experiences
              </Button>
              <Button onClick={() => navigate("/profile")} variant="outline" size="lg">
                View My Bookings
              </Button>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default Success;
