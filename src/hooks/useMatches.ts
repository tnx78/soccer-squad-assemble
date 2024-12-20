import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Match } from "@/components/matches/MatchList";

export const useMatches = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const { toast } = useToast();

  const fetchMatches = async () => {
    try {
      // First, get all matches
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select('*')
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      if (matchesError) throw matchesError;

      // Then, for each match, get its players
      const matchesWithPlayers = await Promise.all(
        matchesData.map(async (match) => {
          const { data: playersData, error: playersError } = await supabase
            .from('match_players')
            .select(`
              player_id,
              profiles!match_players_player_id_fkey (
                id,
                name,
                nickname,
                avatar_url
              )
            `)
            .eq('match_id', match.id);

          if (playersError) throw playersError;

          const players = playersData.map(player => ({
            id: player.profiles.id,
            name: player.profiles.nickname || player.profiles.name,
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
          };
        })
      );

      setMatches(matchesWithPlayers);
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
    const { error } = await supabase
      .from('match_players')
      .insert([{ match_id: matchId }]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to join match",
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
    const { error } = await supabase
      .from('match_players')
      .delete()
      .eq('match_id', matchId);

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