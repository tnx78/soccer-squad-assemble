import { useState, useEffect } from "react";
import { MatchList } from "@/components/matches/MatchList";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { Header } from "@/components/layout/Header";
import { useMatches } from "@/hooks/useMatches";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{ avatar_url?: string; name?: string } | null>(null);
  const { matches, createMatch, joinMatch, leaveMatch, deleteMatch } = useMatches();
  const { toast } = useToast();

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
    });

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("Auth state changed:", _event, session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        await fetchProfile(currentUser.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url, name')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Error",
          description: "Failed to fetch profile",
          variant: "destructive",
        });
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleCreateMatch = async (data: any) => {
    try {
      const success = await createMatch(data);
      if (success) {
        toast({
          title: "Success",
          description: "Match created successfully",
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error creating match:', error);
      toast({
        title: "Error",
        description: "Failed to create match",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleJoinMatch = async (matchId: string) => {
    try {
      await joinMatch(matchId);
      toast({
        title: "Success",
        description: "Successfully joined the match",
      });
    } catch (error: any) {
      console.error('Error joining match:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to join match",
        variant: "destructive",
      });
    }
  };

  const handleLeaveMatch = async (matchId: string) => {
    try {
      await leaveMatch(matchId);
      toast({
        title: "Success",
        description: "Successfully left the match",
      });
    } catch (error: any) {
      console.error('Error leaving match:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to leave match",
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
    } catch (error: any) {
      console.error('Error deleting match:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete match",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <Header 
          user={user} 
          profile={profile} 
          onCreateMatch={handleCreateMatch}
        />
        <MatchList
          matches={matches}
          currentUserId={user?.id}
          onJoinMatch={handleJoinMatch}
          onLeaveMatch={handleLeaveMatch}
          onDeleteMatch={handleDeleteMatch}
          isAuthenticated={!!user}
        />
      </div>
    </div>
  );
};

export default Index;