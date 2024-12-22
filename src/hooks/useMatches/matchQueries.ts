import { supabase } from "@/lib/supabase";
import { MatchPlayerResponse } from "./types";

export const fetchMatchesData = async () => {
  const { data: matchesData, error: matchesError } = await supabase
    .from('matches')
    .select('*')
    .order('date', { ascending: true })
    .order('start_time', { ascending: true });

  if (matchesError) throw matchesError;
  return matchesData;
};

export const fetchCreatorProfile = async (createdBy: string) => {
  const { data: creatorProfile } = await supabase
    .from('profiles')
    .select('name, nickname')
    .eq('id', createdBy)
    .single();
  
  return creatorProfile;
};

export const fetchMatchPlayers = async (matchId: string) => {
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
    .eq('match_id', matchId);

  if (playersError) throw playersError;
  return playersData as unknown as MatchPlayerResponse[];
};