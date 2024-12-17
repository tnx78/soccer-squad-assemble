import { Calendar, MapPin, Users, Clock, DollarSign, Trash2 } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/lib/supabase";

interface Player {
  id: string;
  name: string;
  avatar?: string;
}

interface MatchCardProps {
  id: string;
  title: string;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
  players: Player[];
  maxPlayers: number;
  fee: number;
  createdBy: string;
  onJoin: () => void;
  onLeave: () => void;
  onDelete: () => void;
  hasJoined: boolean;
  isAuthenticated: boolean;
}

export const MatchCard = ({ 
  id,
  title, 
  location, 
  date,
  startTime,
  endTime,
  players, 
  maxPlayers,
  fee,
  createdBy,
  onJoin,
  onLeave,
  onDelete,
  hasJoined,
  isAuthenticated
}: MatchCardProps) => {
  const isFull = players.length >= maxPlayers;
  const isOwner = createdBy === supabase.auth.getUser()?.data?.user?.id;

  return (
    <Card className="w-full animate-fade-in hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg">{title}</h3>
          {isOwner && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{startTime} - {endTime}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <button 
              className="text-blue-600 hover:underline"
              onClick={() => {
                // TODO: Implement map view
                console.log("Show map for location:", location);
              }}
            >
              {location}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>{players.length}/{maxPlayers} players</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            <span>{fee.toLocaleString('hu-HU')} HUF</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            {players.map((player) => (
              <TooltipProvider key={player.id}>
                <Tooltip>
                  <TooltipTrigger>
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={player.avatar} alt={player.name} />
                      <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{player.name}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <Badge variant="secondary">
          {isFull ? "Match Full" : `${maxPlayers - players.length} spots left`}
        </Badge>
        {hasJoined ? (
          <Button 
            onClick={onLeave}
            variant="destructive"
          >
            Leave Match
          </Button>
        ) : (
          <Button 
            onClick={onJoin} 
            disabled={isFull || !isAuthenticated}
            className="bg-primary hover:bg-primary/90 disabled:opacity-50"
          >
            {!isAuthenticated ? "Login to Join" : isFull ? "Match Full" : "Join Match"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
