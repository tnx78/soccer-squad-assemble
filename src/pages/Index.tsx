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
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const { user, profile, handleSignOut, refreshProfile } = useAuthState();
  const { matches, handleJoinMatch, handleLeaveMatch, handleDeleteMatch, fetchMatches } = useMatches();
  const { toast } = useToast();

  const handleCreateMatch = async (data: CreateMatchForm) => {
    if (!user) return;

    const startTime = `${data.hours}:${data.minutes}`;
    const endTime = new Date();
    endTime.setHours(parseInt(data.hours));
    endTime.setMinutes(parseInt(data.minutes) + parseInt(data.duration));
    const formattedEndTime = `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;

    try {
      const title = generateTitle(data.date, data.hours);
      const { error } = await supabase.from('matches').insert({
        title,
        location: data.location,
        date: data.date,
        start_time: startTime,
        end_time: formattedEndTime,
        max_players: parseInt(data.maxPlayers),
        fee: parseInt(data.fee),
        created_by: user.id
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Match created successfully",
      });

      await fetchMatches();
    } catch (error) {
      console.error('Error creating match:', error);
      toast({
        title: "Error",
        description: "Failed to create match",
        variant: "destructive",
      });
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
                  <ProfileDialog user={user} onProfileUpdate={refreshProfile}>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profile?.avatar_url} />
                        <AvatarFallback>{profile?.nickname?.[0] || profile?.name?.[0] || user.email?.[0]}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </ProfileDialog>
                  <span className="text-sm font-medium">
                    {profile?.nickname || profile?.name || user.email?.split('@')[0]}
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

const generateTitle = (date: string, hours: string) => {
  const dateObj = new Date(date);
  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
  const hour = parseInt(hours);
  
  let timeOfDay;
  if (hour < 12) timeOfDay = "Morning";
  else if (hour < 17) timeOfDay = "Afternoon";
  else timeOfDay = "Evening";
  
  return `${dayName} ${timeOfDay} Game`;
};

export default Index;
