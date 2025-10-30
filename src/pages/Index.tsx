import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ExperienceCard from "@/components/ExperienceCard";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface Experience {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  location: string;
}

const Index = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExperiences();
  }, [searchQuery]);

  const fetchExperiences = async () => {
    try {
      setLoading(true);
      let query = supabase.from("experiences").select("*");

      if (searchQuery) {
        query = query.or(
          `name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`
        );
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      setExperiences(data || []);
    } catch (error) {
      console.error("Error fetching experiences:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary/30">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">Discover Amazing Experiences</h1>
          <p className="text-muted-foreground text-lg">
            Book unforgettable adventures across India
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : experiences.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground">
              {searchQuery
                ? `No experiences found for "${searchQuery}"`
                : "No experiences available"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {experiences.map((experience) => (
              <ExperienceCard
                key={experience.id}
                id={experience.id}
                name={experience.name}
                description={experience.description}
                price={experience.price}
                imageUrl={experience.image_url}
                location={experience.location}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
