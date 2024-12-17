import { supabase } from '@/lib/supabase';

export const fetchMatchesWithPlayers = async () => {
  const { data: matchesData, error: matchesError } = await supabase
    .from('matches')
    .select(`
      *,
      match_players (
        player_id
      )
    `)
    .order('date', { ascending: true });

  if (matchesError) {
    console.error('Error fetching matches:', matchesError);
    throw matchesError;
  }
  
  return matchesData;
};

export const fetchPlayerProfiles = async (playerIds: string[]) => {
  if (!playerIds.length) return [];
  
  const { data: profilesData, error: profilesError } = await supabase
    .from('profiles')
    .select('id, name, avatar_url')
    .in('id', playerIds);

  if (profilesError) {
    console.error('Error fetching profiles:', profilesError);
    throw profilesError;
  }
  
  return profilesData;
};

export const createMatchInDb = async (matchData: any) => {
  const { error: matchError } = await supabase
    .from('matches')
    .insert({
      title: matchData.title,
      location: matchData.location,
      date: matchData.date,
      start_time: matchData.time,
      end_time: calculateEndTime(matchData.time, parseInt(matchData.duration)),
      max_players: matchData.maxPlayers,
      fee: matchData.fee,
      created_by: matchData.created_by,
    });

  if (matchError) {
    console.error('Error creating match:', matchError);
    throw matchError;
  }
};

export const deleteMatchFromDb = async (matchId: string) => {
  const { error } = await supabase
    .from('matches')
    .delete()
    .eq('id', matchId);

  if (error) {
    console.error('Error deleting match:', error);
    throw error;
  }
};

const calculateEndTime = (startTime: string, durationMinutes: number) => {
  const [hours, minutes] = startTime.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes);
  date.setMinutes(date.getMinutes() + durationMinutes);
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: false 
  });
};