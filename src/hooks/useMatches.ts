import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Match } from "@/components/matches/MatchList";

interface Profile {
  id: string;
  name: string | null;
  nickname: string | null;
  avatar_url: string | null;
}

interface MatchPlayerResponse {
  player_id: string;
  profiles: Profile;
}

export const useMatches = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const { toast } = useToast();

  const fetchMatches = async () => {
    try {
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select(`
          *,
          match_players (
            count
          )
        `)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      if (matchesError) throw matchesError;

      const matchesWithDetails = await Promise.all(
        matchesData.map(async (match) => {
          const { data: creatorProfile } = await supabase
            .from('profiles')
            .select('name, nickname')
            .eq('id', match.created_by)
            .single();

          const { data: playersData, error: playersError } = await supabase
            .from('match_players')
            .select(`
              player_id,
              profiles!inner (
                id,
                name,
                nickname,
                avatar_url
              )
            `)
            .eq('match_id', match.id);

          if (playersError) throw playersError;

          const typedPlayersData = playersData as unknown as MatchPlayerResponse[];
          const players = typedPlayersData.map(player => ({
            id: player.profiles.id,
            name: player.profiles.nickname || player.profiles.name || 'Anonymous',
            avatar: player.profiles.avatar_url,
          }));

          return {
            id: match.id,
            title: match.title,
            location: match.location,
            date: new Date(match.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
            startTime: match.start_time.slice(0, 5),
            endTime: match.end_time.slice(0, 5),
            players,
            maxPlayers: match.max_players,
            fee: match.fee,
            createdBy: match.created_by,
            createdByName: creatorProfile?.nickname || creatorProfile?.name || 'Anonymous',
            availableSlots: match.available_slots
          };
        })
      );

      setMatches(matchesWithDetails);
    } catch (error) {
      console.error('Error fetching matches:', error);
      toast({
        title: "Error",
        description: "Failed to load matches",
        variant: "destructive",
      });
    }
  };

  const handleJoinMatch = async (matchId: string) => {
    // Get the current user's session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      toast({
        title: "Error",
        description: "You must be logged in to join a match",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('match_players')
      .insert([{ 
        match_id: matchId,
        player_id: session.user.id  // Set the player_id to the current user's ID
      }]);

    if (error) {
      console.error('Error joining match:', error);
      toast({
        title: "Error",
        description: error.message === "new row violates row-level security policy for table \"match_players\"" 
          ? "This match is full or you're already joined"
          : "Failed to join match",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success!",
      description: "You've joined the match.",
    });
    await fetchMatches();
  };

  const handleLeaveMatch = async (matchId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      toast({
        title: "Error",
        description: "You must be logged in to leave a match",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('match_players')
      .delete()
      .eq('match_id', matchId)
      .eq('player_id', session.user.id);  // Ensure we're only deleting the current user's entry

    if (error) {
      toast({
        title: "Error",
        description: "Failed to leave match",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success!",
      description: "You've left the match.",
    });
    await fetchMatches();
  };

  const handleDeleteMatch = async (matchId: string) => {
    const { error } = await supabase
      .from('matches')
      .delete()
      .eq('id', matchId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete match",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Match deleted successfully",
    });
    await fetchMatches();
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  return {
    matches,
    handleJoinMatch,
    handleLeaveMatch,
    handleDeleteMatch,
    fetchMatches,
  };
};
