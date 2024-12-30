import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { Match } from "./types";
import { fetchMatchesData, fetchCreatorProfile, fetchMatchPlayers } from "./matchQueries";
import { joinMatch, leaveMatch, deleteMatch } from "./matchMutations";

export const useMatches = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const { toast } = useToast();

  const fetchMatches = async () => {
    try {
      const matchesData = await fetchMatchesData();

      const matchesWithDetails = await Promise.all(
        matchesData.map(async (match) => {
          const creatorProfile = await fetchCreatorProfile(match.created_by);
          const playersData = await fetchMatchPlayers(match.id);

          const players = playersData.map(player => ({
            id: player.profiles.id,
            name: player.profiles.nickname || player.profiles.name || 'Anonymous',
            avatar: player.profiles.avatar_url,
          }));

          const availableSlots = match.max_players - players.length;

          return {
            id: match.id,
            title: match.title,
            location: match.location,
            date: new Date(match.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
            startTime: match.start_time.slice(0, 5),
            endTime: match.end_time.slice(0, 5),
            players,
            maxPlayers: match.max_players,
            fee: match.fee,
            createdBy: match.created_by,
            createdByName: creatorProfile?.nickname || creatorProfile?.name || 'Anonymous',
            availableSlots
          };
        })
      );

      setMatches(matchesWithDetails);
    } catch (error) {
      console.error('Error fetching matches:', error);
      toast({
        title: "Error",
        description: "Failed to load matches",
        variant: "destructive",
      });
    }
  };

  const handleJoinMatch = async (matchId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      toast({
        title: "Error",
        description: "You must be logged in to join a match",
        variant: "destructive",
      });
      return;
    }

    try {
      await joinMatch(matchId, session.user.id);
      toast({
        title: "Success!",
        description: "You've joined the match.",
      });
      await fetchMatches();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message === "You have already joined this match" 
          ? error.message 
          : "Failed to join match",
        variant: "destructive",
      });
    }
  };

  const handleLeaveMatch = async (matchId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      toast({
        title: "Error",
        description: "You must be logged in to leave a match",
        variant: "destructive",
      });
      return;
    }

    try {
      await leaveMatch(matchId, session.user.id);
      toast({
        title: "Success!",
        description: "You've left the match.",
      });
      await fetchMatches();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to leave match",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMatch = async (matchId: string) => {
    try {
      await deleteMatch(matchId);
      toast({
        title: "Success",
        description: "Match deleted successfully",
      });
      await fetchMatches();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete match",
        variant: "destructive",
      });
    }
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

export type { Match } from './types';