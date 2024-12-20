import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Match } from "@/components/matches/MatchList";

export const useMatches = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const { toast } = useToast();

  const fetchMatches = async () => {
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        players:match_players(
          player:profiles(id, name, avatar_url)
        )
      `);

    if (error) {
      console.error('Error fetching matches:', error);
      toast({
        title: "Error",
        description: "Failed to load matches",
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
      players: match.players.map((p: any) => ({
        id: p.player.id,
        name: p.player.name,
        avatar: p.player.avatar_url,
      })),
      maxPlayers: match.max_players,
      fee: match.fee,
      createdBy: match.created_by,
    }));

    setMatches(formattedMatches);
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