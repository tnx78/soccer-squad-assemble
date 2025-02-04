import { MatchCard } from "@/components/MatchCard";

interface Player {
  id: string;
  name: string;
  avatar?: string;
}

export interface Match {
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
  createdByName: string;
  availableSlots: number;
}

interface MatchListProps {
  matches: Match[];
  currentUserId?: string;
  onJoinMatch: (matchId: string) => void;
  onLeaveMatch: (matchId: string) => void;
  onDeleteMatch: (matchId: string) => void;
  isAuthenticated: boolean;
}

export const MatchList = ({ 
  matches, 
  currentUserId, 
  onJoinMatch, 
  onLeaveMatch, 
  onDeleteMatch,
  isAuthenticated 
}: MatchListProps) => {
  return (
    <div className="space-y-4">
      {matches.map((match) => (
        <MatchCard
          key={match.id}
          title={match.title}
          location={match.location}
          date={match.date}
          startTime={match.startTime}
          endTime={match.endTime}
          players={match.players}
          maxPlayers={match.maxPlayers}
          fee={match.fee}
          onJoin={() => onJoinMatch(match.id)}
          onLeave={() => onLeaveMatch(match.id)}
          onDelete={() => onDeleteMatch(match.id)}
          hasJoined={currentUserId ? match.players.some(player => player.id === currentUserId) : false}
          isAuthenticated={isAuthenticated}
          isOwner={currentUserId === match.createdBy}
          createdBy={match.createdByName}
          availableSlots={match.availableSlots}
        />
      ))}
    </div>
  );
};