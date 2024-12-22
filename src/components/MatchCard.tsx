import { Calendar, MapPin, Users, Clock, DollarSign, Trash2 } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface Player {
  id: string;
  name: string;
  avatar?: string;
}

interface MatchCardProps {
  title: string;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
  players: Player[];
  maxPlayers: number;
  fee: number;
  onJoin: () => void;
  onLeave: () => void;
  onDelete: () => void;
  hasJoined: boolean;
  isAuthenticated: boolean;
  isOwner: boolean;
  createdBy: string;
}

export const MatchCard = ({ 
  title, 
  location, 
  date,
  startTime,
  endTime,
  players, 
  maxPlayers,
  fee,
  onJoin,
  onLeave,
  onDelete,
  hasJoined,
  isAuthenticated,
  isOwner,
  createdBy
}: MatchCardProps) => {
  const availableSlots = maxPlayers - players.length;
  const isFull = availableSlots <= 0;

  return (
    <Card className="w-full animate-fade-in hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg mb-1">{title}</h3>
            <span className="text-sm text-gray-500">(by {createdBy})</span>
          </div>
          {isOwner && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the match.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onDelete} className="bg-red-500 hover:bg-red-600">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
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
          {isFull ? "Match Full" : `${availableSlots} spots left`}
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