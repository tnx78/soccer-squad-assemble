import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Match } from '@/components/matches/MatchList';

export const useMatches = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const { toast } = useToast();

  const fetchMatches = async () => {
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        match_players (
          player_id,
          player:player_id (
            profiles (
              name,
              avatar_url
            )
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
        name: mp.player?.profiles?.name || 'Anonymous',
        avatar: mp.player?.profiles?.avatar_url,
      })),
      maxPlayers: match.max_players,
      fee: match.fee,
    }));

    setMatches(formattedMatches);
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

  const createMatch = async (data: any) => {
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

  const leaveMatch = async (matchId: number) => {
    const { data: { user } } = await supabase.auth.getUser();
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

  return {
    matches,
    createMatch,
    joinMatch,
    leaveMatch,
  };
};