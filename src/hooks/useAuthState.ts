import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  name: string;
  nickname?: string;
  avatar_url?: string;
  age?: number;
  position?: string;
}

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await loadProfile(user.id);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      // First clear local state
      setUser(null);
      setProfile(null);

      // Then attempt to sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      // If there's an error about session not found, we can ignore it
      // since we've already cleared the local state
      if (error) {
        if (error.message.includes('session_not_found')) {
          // Session already cleared, just show success message
          toast.success("Signed out successfully");
          return;
        }
        // For any other error, throw it
        throw error;
      }
      
      toast.success("Signed out successfully");
    } catch (error: any) {
      console.error('Error signing out:', error);
      // Only show error toast for non-session-not-found errors
      if (!error.message.includes('session_not_found')) {
        toast.error("Failed to sign out", {
          description: error.message
        });
      }
    }
  };

  return {
    user,
    profile,
    handleSignOut,
    refreshProfile,
  };
};