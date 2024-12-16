import { User } from "@supabase/supabase-js";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { CreateMatchDialog } from "@/components/matches/CreateMatchDialog";
import { ProfileDialog } from "@/components/profile/ProfileDialog";
import { Button } from "@/components/ui/button";
import { UserRound, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

interface HeaderProps {
  user: User | null;
  profile: { avatar_url?: string; name?: string } | null;
  onCreateMatch: (data: any) => void;
}

export const Header = ({ user, profile, onCreateMatch }: HeaderProps) => {
  const { toast } = useToast();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out successfully",
    });
  };

  return (
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold text-gray-900">Soccer Matches</h1>
      <div className="flex gap-2 items-center">
        {user ? (
          <>
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback>{profile?.name?.[0] || user.email?.[0]}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">
                {profile?.name || user.email?.split('@')[0]}
              </span>
            </div>
            <ProfileDialog user={user} />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="rounded-full"
            >
              <LogOut className="h-5 w-5" />
            </Button>
            <CreateMatchDialog onCreateMatch={onCreateMatch} />
          </>
        ) : (
          <AuthDialog />
        )}
      </div>
    </div>
  );
};