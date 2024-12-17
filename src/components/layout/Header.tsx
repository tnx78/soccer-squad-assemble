import { User } from "@supabase/supabase-js";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { CreateMatchDialog } from "@/components/matches/CreateMatchDialog";
import { ProfileDialog } from "@/components/profile/ProfileDialog";
import { Button } from "@/components/ui/button";
import { LogOut, Settings } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  user: User | null;
  profile: { avatar_url?: string; name?: string } | null;
  onCreateMatch: (data: any) => Promise<boolean>;
}

export const Header = ({ user, profile, onCreateMatch }: HeaderProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Signed out successfully",
    });
    navigate('/');
  };

  return (
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold text-gray-900">Soccer Matches</h1>
      <div className="flex gap-2 items-center">
        {user ? (
          <>
            <span className="text-sm font-medium">
              {profile?.name || user.email?.split('@')[0]}
            </span>
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