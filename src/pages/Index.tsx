import { useState } from "react";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { CreateMatchDialog } from "@/components/matches/CreateMatchDialog";
import { MatchList, Match } from "@/components/matches/MatchList";
import { useToast } from "@/components/ui/use-toast";

// Mock data for initial version
const mockMatches: Match[] = [
  {
    id: 1,
    title: "Sunday Friendly Match",
    location: "Central Park Field",
    date: "Sun, Mar 24 • 3:00 PM",
    players: [
      { id: "1", name: "John Doe", avatar: "/placeholder.svg" },
      { id: "2", name: "Jane Smith", avatar: "/placeholder.svg" }
    ],
    maxPlayers: 12,
  },
  {
    id: 2,
    title: "5-a-side Tournament",
    location: "Sports Complex",
    date: "Sat, Mar 23 • 2:00 PM",
    players: [
      { id: "3", name: "Mike Johnson", avatar: "/placeholder.svg" }
    ],
    maxPlayers: 10,
  },
];

const Index = () => {
  const [matches, setMatches] = useState<Match[]>(mockMatches);
  const { toast } = useToast();
  
  // Mock user ID for testing - this would come from auth context in real app
  const currentUserId = "1";

  const handleCreateMatch = (data: any) => {
    const newMatch: Match = {
      id: matches.length + 1,
      title: data.title,
      location: data.location,
      date: `${data.date} • ${data.time}`,
      players: [],
      maxPlayers: Number(data.maxPlayers),
    };

    setMatches([...matches, newMatch]);
    toast({
      title: "Success!",
      description: "Match created successfully.",
    });
  };

  const handleJoinMatch = (matchId: number) => {
    setMatches(currentMatches =>
      currentMatches.map(match =>
        match.id === matchId
          ? {
              ...match,
              players: [...match.players, { id: currentUserId, name: "Current User", avatar: "/placeholder.svg" }]
            }
          : match
      )
    );
    
    toast({
      title: "Success!",
      description: "You've joined the match.",
    });
  };

  const handleLeaveMatch = (matchId: number) => {
    setMatches(currentMatches =>
      currentMatches.map(match =>
        match.id === matchId
          ? {
              ...match,
              players: match.players.filter(player => player.id !== currentUserId)
            }
          : match
      )
    );
    
    toast({
      title: "Success!",
      description: "You've left the match.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Soccer Matches</h1>
          <div className="flex gap-2">
            <AuthDialog />
            <CreateMatchDialog onCreateMatch={handleCreateMatch} />
          </div>
        </div>
        
        <MatchList
          matches={matches}
          currentUserId={currentUserId}
          onJoinMatch={handleJoinMatch}
          onLeaveMatch={handleLeaveMatch}
        />
      </div>
    </div>
  );
};

export default Index;