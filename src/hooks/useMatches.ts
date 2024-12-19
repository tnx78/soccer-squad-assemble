import { useState, useEffect } from 'react';
import { toast } from "sonner";
import { Match } from '@/types/match';
import { fetchMatchesWithPlayers, fetchPlayerProfiles, createMatchInDb, deleteMatchFromDb } from './matches/useMatchQueries';
import { useMatchMutations } from './matches/useMatchMutations';
import { supabase } from '@/lib/supabase';

export const useMatches = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { joinMatch: joinMatchMutation, leaveMatch: leaveMatchMutation } = useMatchMutations();

  const fetchMatches = async () => {
    try {
      setIsLoading(true);
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
      toast.error("Error loading matches", {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createMatch = async (data: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in to create a match");

      await createMatchInDb({
        ...data,
        created_by: user.id
      });
      
      await fetchMatches();
      return true;
    } catch (error: any) {
      console.error('Error creating match:', error);
      toast.error("Failed to create match", {
        description: error.message
      });
      return false;
    }
  };

  const joinMatch = async (matchId: string) => {
    try {
      await joinMatchMutation(matchId);
      await fetchMatches();
    } catch (error: any) {
      console.error('Error joining match:', error);
      throw error;
    }
  };

  const leaveMatch = async (matchId: string) => {
    try {
      await leaveMatchMutation(matchId);
      await fetchMatches();
    } catch (error: any) {
      console.error('Error leaving match:', error);
      throw error;
    }
  };

  const deleteMatch = async (matchId: string) => {
    try {
      await deleteMatchFromDb(matchId);
      await fetchMatches();
    } catch (error: any) {
      console.error('Error deleting match:', error);
      throw error;
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
    isLoading,
    createMatch,
    joinMatch,
    leaveMatch,
    deleteMatch,
  };
};
