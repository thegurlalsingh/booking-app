import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";

interface ExperienceCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  location?: string;
}

const ExperienceCard = ({ id, name, description, price, imageUrl, location }: ExperienceCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
      <div className="aspect-video overflow-hidden">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
        />
      </div>
      <CardHeader>
        <CardTitle className="text-xl">{name}</CardTitle>
        {location && (
          <div className="flex items-center gap-1 text-muted-foreground text-sm">
            <MapPin className="h-4 w-4" />
            <span>{location}</span>
          </div>
        )}
        <CardDescription className="line-clamp-2">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold text-primary">₹{price.toLocaleString()}</p>
        <p className="text-sm text-muted-foreground">per person</p>
      </CardContent>
      <CardFooter>
        <Button onClick={() => navigate(`/details/${id}`)} className="w-full">
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ExperienceCard;
