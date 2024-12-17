import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Match } from '@/types/match';
import { fetchMatchesWithPlayers, fetchPlayerProfiles, createMatchInDb, deleteMatchFromDb } from './matches/useMatchQueries';
import { useMatchMutations } from './matches/useMatchMutations';
import { supabase } from '@/lib/supabase';

export const useMatches = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const { toast } = useToast();
  const { joinMatch: joinMatchMutation, leaveMatch: leaveMatchMutation } = useMatchMutations();

  const fetchMatches = async () => {
    try {
      const matchesData = await fetchMatchesWithPlayers();
      
      const playerIds = matchesData
        .flatMap(match => match.match_players)
        .map(mp => mp.player_id);

      const profilesData = await fetchPlayerProfiles(playerIds);

      const profilesMap = profilesData.reduce((acc, profile) => {
        acc[profile.id] = profile;
        return acc;
      }, {} as Record<string, any>);

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
        createdBy: match.created_by,
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
      await createMatchInDb(data);
      
      toast({
        title: "Match created successfully!",
        description: "Your match has been added to the list.",
      });

      return true; // Return true to indicate success
    } catch (error: any) {
      toast({
        title: "Error creating match",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteMatch = async (matchId: string) => {
    try {
      await deleteMatchFromDb(matchId);
      
      toast({
        title: "Success!",
        description: "Match deleted successfully.",
      });
      
      fetchMatches();
    } catch (error: any) {
      toast({
        title: "Error deleting match",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const joinMatch = async (matchId: number) => {
    try {
      await joinMatchMutation(matchId);
      
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
    try {
      await leaveMatchMutation(matchId);
      
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
    deleteMatch,
  };
};