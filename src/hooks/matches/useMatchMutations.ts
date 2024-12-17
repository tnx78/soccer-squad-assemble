import { supabase } from '@/lib/supabase';

export const useMatchMutations = () => {
  const joinMatch = async (matchId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("You must be logged in to join a match");

    const { error } = await supabase
      .from('match_players')
      .insert({
        match_id: matchId,
        player_id: user.id,
      });

    if (error) {
      console.error('Error joining match:', error);
      throw new Error(error.message);
    }
  };

  const leaveMatch = async (matchId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase
      .from('match_players')
      .delete()
      .eq('match_id', matchId)
      .eq('player_id', user.id);

    if (error) {
      console.error('Error leaving match:', error);
      throw new Error(error.message);
    }
  };

  return {
    joinMatch,
    leaveMatch,
  };
};