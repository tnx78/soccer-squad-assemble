import { supabase } from '@/lib/supabase';

export const useMatchMutations = () => {
  const joinMatch = async (matchId: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Authentication required");

    const { error } = await supabase
      .from('match_players')
      .insert({
        match_id: matchId,
        player_id: user.id,
      });

    if (error) throw error;
  };

  const leaveMatch = async (matchId: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase
      .from('match_players')
      .delete()
      .eq('match_id', matchId)
      .eq('player_id', user.id);

    if (error) throw error;
  };

  return {
    joinMatch,
    leaveMatch,
  };
};