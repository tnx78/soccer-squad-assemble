import { MatchCard } from "@/components/MatchCard";

interface Player {
  id: string;
  name: string;
  avatar?: string;
}

export interface Match {
  id: number;
  title: string;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
  players: Player[];
  maxPlayers: number;
  fee: number;
}

interface MatchListProps {
  matches: Match[];
  currentUserId?: string;
  onJoinMatch: (matchId: number) => void;
  onLeaveMatch: (matchId: number) => void;
}

export const MatchList = ({ matches, currentUserId, onJoinMatch, onLeaveMatch }: MatchListProps) => {
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
          hasJoined={currentUserId ? match.players.some(player => player.id === currentUserId) : false}
        />
      ))}
    </div>
  );
};