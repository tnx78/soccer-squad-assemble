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
  const [isLoading, setIsLoading] = useState(true);
  const { matches, createMatch, joinMatch, leaveMatch, deleteMatch } = useMatches();
  const { toast } = useToast();

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

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        
        // Initial session check
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user ?? null;
        
        setUser(currentUser);
        if (currentUser) {
          await fetchProfile(currentUser.id);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        console.log("Auth state changed:", _event, session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        
        if (currentUser) {
          await fetchProfile(currentUser.id);
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <Header 
          user={user} 
          profile={profile} 
          onCreateMatch={handleCreateMatch}
        />
        <div className="px-4 py-6">
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
    </div>
  );
};

export default Index;