import { useEffect } from "react";
import { MatchList } from "@/components/matches/MatchList";
import { useToast } from "@/components/ui/use-toast";
import { Header } from "@/components/layout/Header";
import { useMatches } from "@/hooks/useMatches";
import { useAuthState } from "@/hooks/useAuthState";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const Index = () => {
  const { toast } = useToast();
  const { user, isLoading: isAuthLoading, profile } = useAuthState();
  const { 
    matches, 
    createMatch, 
    joinMatch, 
    leaveMatch, 
    deleteMatch,
    isLoading: isMatchesLoading 
  } = useMatches();

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

  if (isAuthLoading) {
    return <LoadingSpinner />;
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
          {isMatchesLoading ? (
            <LoadingSpinner />
          ) : (
            <MatchList
              matches={matches}
              currentUserId={user?.id}
              onJoinMatch={handleJoinMatch}
              onLeaveMatch={handleLeaveMatch}
              onDeleteMatch={handleDeleteMatch}
              isAuthenticated={!!user}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;