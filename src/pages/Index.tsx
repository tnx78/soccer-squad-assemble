import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MatchCard } from "@/components/MatchCard";
import { SearchBar } from "@/components/SearchBar";
import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Mock data for initial version
const mockMatches = [
  {
    id: 1,
    title: "Sunday Friendly Match",
    location: "Central Park Field",
    date: "Sun, Mar 24 • 3:00 PM",
    players: 8,
    maxPlayers: 12,
  },
  {
    id: 2,
    title: "5-a-side Tournament",
    location: "Sports Complex",
    date: "Sat, Mar 23 • 2:00 PM",
    players: 6,
    maxPlayers: 10,
  },
  {
    id: 3,
    title: "Casual Pickup Game",
    location: "Community Field",
    date: "Fri, Mar 22 • 5:00 PM",
    players: 4,
    maxPlayers: 8,
  },
];

const Index = () => {
  const [matches, setMatches] = useState(mockMatches);
  const { toast } = useToast();

  const handleSearch = (query: string) => {
    console.log("Searching for:", query);
    // Implement search functionality in future iteration
  };

  const handleJoinMatch = (matchId: number) => {
    setMatches(currentMatches =>
      currentMatches.map(match =>
        match.id === matchId
          ? { ...match, players: match.players + 1 }
          : match
      )
    );
    
    toast({
      title: "Success!",
      description: "You've joined the match. Check your email for details.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Soccer Matches</h1>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Create Match
          </Button>
        </div>
        
        <SearchBar onSearch={handleSearch} />

        <div className="space-y-4">
          {matches.map((match) => (
            <MatchCard
              key={match.id}
              title={match.title}
              location={match.location}
              date={match.date}
              players={match.players}
              maxPlayers={match.maxPlayers}
              onJoin={() => handleJoinMatch(match.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;