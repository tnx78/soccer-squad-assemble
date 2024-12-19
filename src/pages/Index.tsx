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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  const [profile, setProfile] = useState<{ avatar_url?: string; name?: string } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('avatar_url, name')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return;
    }

    setProfile(data);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out successfully",
    });
  };

  const handleCreateMatch = (data: any) => {
    const newMatch: Match = {
      id: matches.length + 1,
      title: data.title,
      location: data.location,
      date: new Date(data.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      startTime: data.time,
      endTime: calculateEndTime(data.time, parseInt(data.duration)),
      players: [],
      maxPlayers: data.maxPlayers,
      fee: data.fee,
    };
    
    setMatches(prev => [...prev, newMatch]);
    toast({
      title: "Match created successfully!",
      description: "Your match has been added to the list.",
    });
  };

  const calculateEndTime = (startTime: string, durationMinutes: number) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes);
    date.setMinutes(date.getMinutes() + durationMinutes);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const handleJoinMatch = (matchId: number) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to join matches",
        variant: "destructive",
      });
      return;
    }

    setMatches(currentMatches =>
      currentMatches.map(match =>
        match.id === matchId
          ? {
              ...match,
              players: [...match.players, { 
                id: user.id, 
                name: profile?.name || user.email?.split('@')[0] || "User", 
                avatar: profile?.avatar_url 
              }]
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
              players: match.players.filter(player => player.id !== user?.id)
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
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback>{profile?.name?.[0] || user.email?.[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">
                    {profile?.name || user.email?.split('@')[0]}
                  </span>
                </div>
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
          isAuthenticated={!!user}
        />
      </div>
    </div>
  );
};

export default Index;
