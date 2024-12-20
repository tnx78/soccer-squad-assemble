import { AuthDialog } from "@/components/auth/AuthDialog";
import { CreateMatchDialog } from "@/components/matches/CreateMatchDialog";
import { MatchList } from "@/components/matches/MatchList";
import { ProfileDialog } from "@/components/profile/ProfileDialog";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthState } from "@/hooks/useAuthState";
import { useMatches } from "@/hooks/useMatches";
import { CreateMatchForm } from "@/components/matches/CreateMatchDialog";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { user, profile, handleSignOut } = useAuthState();
  const { matches, handleJoinMatch, handleLeaveMatch, handleDeleteMatch } = useMatches();

  const handleCreateMatch = async (data: CreateMatchForm) => {
    if (!user) return;

    const endTime = new Date(`2000-01-01T${data.time}`);
    endTime.setMinutes(endTime.getMinutes() + parseInt(data.duration));

    const { error } = await supabase.from('matches').insert({
      title: data.title,
      location: data.location,
      date: data.date,
      start_time: data.time,
      end_time: endTime.toTimeString().slice(0, 5),
      max_players: data.maxPlayers,
      fee: data.fee,
      created_by: user.id
    });

    if (error) {
      console.error('Error creating match:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Soccer Matches</h1>
          <div className="flex gap-2 items-center">
            {user ? (
              <>
                <div className="flex items-center gap-2">
                  <ProfileDialog user={user}>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profile?.avatar_url} />
                        <AvatarFallback>{profile?.name?.[0] || user.email?.[0]}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </ProfileDialog>
                  <span className="text-sm font-medium">
                    {profile?.name || user.email?.split('@')[0]}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSignOut}
                  className="rounded-full"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
                <CreateMatchDialog onCreateMatch={handleCreateMatch} />
              </>
            ) : (
              <AuthDialog />
            )}
          </div>
        </div>
        
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