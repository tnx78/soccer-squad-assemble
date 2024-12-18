import { User } from "@supabase/supabase-js";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { CreateMatchDialog } from "@/components/matches/CreateMatchDialog";
import { ProfileDialog } from "@/components/profile/ProfileDialog";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
      
      // Clear local storage and force a page reload
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
    <div className="flex justify-between items-center p-4 bg-white shadow-sm">
      <h1 className="text-2xl font-bold text-gray-900">Soccer Matches</h1>
      <div className="flex gap-4 items-center">
        {user ? (
          <>
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage 
                  src={profile?.avatar_url || ''} 
                  alt={profile?.name || user.email || 'Profile'} 
                />
                <AvatarFallback>
                  {profile?.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-gray-700">
                {profile?.name || user.email?.split('@')[0]}
              </span>
            </div>
            <ProfileDialog user={user} />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="rounded-full hover:bg-gray-100"
            >
              <LogOut className="h-5 w-5 text-gray-600" />
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