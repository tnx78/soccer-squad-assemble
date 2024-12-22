import { supabase } from "@/lib/supabase";

export const joinMatch = async (matchId: string, userId: string) => {
  const { error } = await supabase
    .from('match_players')
    .insert([{ 
      match_id: matchId,
      player_id: userId
    }]);

  if (error) throw error;
};

export const leaveMatch = async (matchId: string, userId: string) => {
  const { error } = await supabase
    .from('match_players')
    .delete()
    .eq('match_id', matchId)
    .eq('player_id', userId);

  if (error) throw error;
};

export const deleteMatch = async (matchId: string) => {
  const { error } = await supabase
    .from('matches')
    .delete()
    .eq('id', matchId);

  if (error) throw error;
};