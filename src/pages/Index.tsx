import { useState, useEffect } from "react";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { CreateMatchDialog } from "@/components/matches/CreateMatchDialog";
import { MatchList, Match } from "@/components/matches/MatchList";
import { ProfileDialog } from "@/components/profile/ProfileDialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { UserRound, LogOut } from "lucide-react";

const mockMatches: Match[] = [
  {
    id: 1,
    title: "Sunday Friendly Match",
    location: "Central Park Field",
    date: "Sun, Mar 24",
    startTime: "15:00",
    endTime: "16:00",
    players: [
      { id: "1", name: "John Doe", avatar: "/placeholder.svg" },
      { id: "2", name: "Jane Smith", avatar: "/placeholder.svg" }
    ],
    maxPlayers: 12,
    fee: 5000,
  },
  {
    id: 2,
    title: "5-a-side Tournament",
    location: "Sports Complex",
    date: "Sat, Mar 23",
    startTime: "14:00",
    endTime: "15:30",
    players: [
      { id: "3", name: "Mike Johnson", avatar: "/placeholder.svg" }
    ],
    maxPlayers: 10,
    fee: 3000,
  },
];

const Index = () => {
  const [matches, setMatches] = useState<Match[]>(mockMatches);
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out successfully",
    });
  };

  const calculateEndTime = (startTime: string, duration: string) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const durationMinutes = parseInt(duration);
    
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  };

  const handleCreateMatch = (data: any) => {
    const endTime = calculateEndTime(data.time, data.duration);
    
    const newMatch: Match = {
      id: matches.length + 1,
      title: data.title,
      location: data.location,
      date: data.date,
      startTime: data.time,
      endTime: endTime,
      players: [],
      maxPlayers: Number(data.maxPlayers),
      fee: Number(data.fee),
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
          <div className="flex gap-2 items-center">
            {user ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {}}
                  className="rounded-full"
                >
                  <UserRound className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSignOut}
                  className="rounded-full"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
                <CreateMatchDialog onCreateMatch={handleCreateMatch} />
              </>
            ) : (
              <AuthDialog />
            )}
          </div>
        </div>
        
        <MatchList
          matches={matches}
          currentUserId={user?.id}
          onJoinMatch={handleJoinMatch}
          onLeaveMatch={handleLeaveMatch}
        />
      </div>
    </div>
  );
};

export default Index;
