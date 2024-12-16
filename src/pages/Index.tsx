import { useState, useEffect } from "react";
import { Match } from "@/components/matches/MatchList";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { Header } from "@/components/layout/Header";
import { MatchList } from "@/components/matches/MatchList";

const Index = () => {
  const [matches, setMatches] = useState<Match[]>([]);
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

    // Load matches
    fetchMatches();

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

  const fetchMatches = async () => {
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        match_players (
          player_id,
          profiles (
            name,
            avatar_url
          )
        )
      `)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching matches:', error);
      toast({
        title: "Error loading matches",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    const formattedMatches = data.map(match => ({
      id: match.id,
      title: match.title,
      location: match.location,
      date: new Date(match.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      startTime: match.start_time.slice(0, 5),
      endTime: match.end_time.slice(0, 5),
      players: match.match_players.map((mp: any) => ({
        id: mp.player_id,
        name: mp.profiles.name || 'Anonymous',
        avatar: mp.profiles.avatar_url,
      })),
      maxPlayers: match.max_players,
      fee: match.fee,
    }));

    setMatches(formattedMatches);
  };

  const handleCreateMatch = async (data: any) => {
    if (!user) return;

    const { error: matchError } = await supabase
      .from('matches')
      .insert({
        title: data.title,
        location: data.location,
        date: data.date,
        start_time: data.time,
        end_time: calculateEndTime(data.time, parseInt(data.duration)),
        max_players: data.maxPlayers,
        fee: data.fee,
        created_by: user.id,
      });

    if (matchError) {
      toast({
        title: "Error creating match",
        description: matchError.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Match created successfully!",
      description: "Your match has been added to the list.",
    });

    fetchMatches();
  };

  const calculateEndTime = (startTime: string, durationMinutes: number) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes);
    date.setMinutes(date.getMinutes() + durationMinutes);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const handleJoinMatch = async (matchId: number) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to join matches",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('match_players')
      .insert({
        match_id: matchId,
        player_id: user.id,
      });

    if (error) {
      toast({
        title: "Error joining match",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success!",
      description: "You've joined the match.",
    });

    fetchMatches();
  };

  const handleLeaveMatch = async (matchId: number) => {
    if (!user) return;

    const { error } = await supabase
      .from('match_players')
      .delete()
      .eq('match_id', matchId)
      .eq('player_id', user.id);

    if (error) {
      toast({
        title: "Error leaving match",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success!",
      description: "You've left the match.",
    });

    fetchMatches();
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <Header 
          user={user} 
          profile={profile} 
          onCreateMatch={handleCreateMatch}
        />
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