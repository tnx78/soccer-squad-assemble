import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Match } from "@/components/matches/MatchList";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { Header } from "@/components/layout/Header";
import { MatchList } from "@/components/matches/MatchList";
import { useMatches } from "@/hooks/useMatches";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{ avatar_url?: string; name?: string } | null>(null);
  const navigate = useNavigate();
  const { matches, createMatch, joinMatch, leaveMatch } = useMatches();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('avatar_url, name')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return;
    }

    setProfile(data);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <Header 
          user={user} 
          profile={profile} 
          onCreateMatch={createMatch}
        />
        <MatchList
          matches={matches}
          currentUserId={user?.id}
          onJoinMatch={joinMatch}
          onLeaveMatch={leaveMatch}
          isAuthenticated={!!user}
        />
      </div>
    </div>
  );
};

export default Index;