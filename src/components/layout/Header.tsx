import { User } from "@supabase/supabase-js";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { CreateMatchDialog } from "@/components/matches/CreateMatchDialog";
import { ProfileDialog } from "@/components/profile/ProfileDialog";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface HeaderProps {
  user: User | null;
  profile: { avatar_url?: string; name?: string } | null;
  onCreateMatch: (data: any) => Promise<boolean>;
}

export const Header = ({ user, profile, onCreateMatch }: HeaderProps) => {
  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast.success("Signed out successfully");
      // Clear local storage and reload the page
      localStorage.clear();
      window.location.href = '/';
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast.error("Error signing out", {
        description: error.message
      });
    }
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