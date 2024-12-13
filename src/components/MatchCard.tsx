import { Calendar, MapPin, Users } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface MatchCardProps {
  title: string;
  location: string;
  date: string;
  players: number;
  maxPlayers: number;
  onJoin: () => void;
}

export const MatchCard = ({ title, location, date, players, maxPlayers, onJoin }: MatchCardProps) => {
  return (
    <Card className="w-full animate-fade-in hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>{location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>{players}/{maxPlayers} players</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <Badge variant="secondary">{maxPlayers - players} spots left</Badge>
        <Button onClick={onJoin} className="bg-primary hover:bg-primary/90">
          Join Match
        </Button>
      </CardFooter>
    </Card>
  );
};