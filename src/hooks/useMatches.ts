import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Match } from '@/components/matches/MatchList';

export const useMatches = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const { toast } = useToast();

  const fetchMatches = async () => {
    try {
      // First, fetch matches with their players
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select(`
          *,
          match_players (
            player_id
          )
        `)
        .order('date', { ascending: true });

      if (matchesError) throw matchesError;

      // Then, fetch profiles for all players
      const playerIds = matchesData
        .flatMap(match => match.match_players)
        .map(mp => mp.player_id);

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, avatar_url')
        .in('id', playerIds);

      if (profilesError) throw profilesError;

      // Map profiles to a lookup object for easier access
      const profilesMap = profilesData.reduce((acc, profile) => {
        acc[profile.id] = profile;
        return acc;
      }, {} as Record<string, any>);

      // Format matches with player information
      const formattedMatches = matchesData.map(match => ({
        id: match.id,
        title: match.title,
        location: match.location,
        date: new Date(match.date).toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        }),
        startTime: match.start_time.slice(0, 5),
        endTime: match.end_time.slice(0, 5),
        players: match.match_players.map((mp: any) => {
          const profile = profilesMap[mp.player_id];
          return {
            id: mp.player_id,
            name: profile?.name || 'Anonymous',
            avatar: profile?.avatar_url,
          };
        }),
        maxPlayers: match.max_players,
        fee: match.fee,
      }));

      setMatches(formattedMatches);
    } catch (error: any) {
      console.error('Error fetching matches:', error);
      toast({
        title: "Error loading matches",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const createMatch = async (data: any) => {
    try {
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
          created_by: (await supabase.auth.getUser()).data.user?.id,
        });

      if (matchError) throw matchError;

      toast({
        title: "Match created successfully!",
        description: "Your match has been added to the list.",
      });

      fetchMatches();
    } catch (error: any) {
      toast({
        title: "Error creating match",
        description: error.message,
        variant: "destructive",
      });
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

  const joinMatch = async (matchId: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to join matches",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('match_players')
        .insert({
          match_id: matchId,
          player_id: user.id,
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "You've joined the match.",
      });

      fetchMatches();
    } catch (error: any) {
      toast({
        title: "Error joining match",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const leaveMatch = async (matchId: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('match_players')
        .delete()
        .eq('match_id', matchId)
        .eq('player_id', user.id);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "You've left the match.",
      });

      fetchMatches();
    } catch (error: any) {
      toast({
        title: "Error leaving match",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchMatches();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('public:matches')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches'
        },
        () => {
          fetchMatches();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    matches,
    createMatch,
    joinMatch,
    leaveMatch,
  };
};