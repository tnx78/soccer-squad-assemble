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
      // First check if we have a session
      const { data: { session } } = await supabase.auth.getSession();
      
      // Clear local state regardless of session status
      setUser(null);
      setProfile(null);

      // If we have a session, try to sign out
      if (session) {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      }
      
      toast.success("Signed out successfully");
    } catch (error: any) {
      console.error('Error signing out:', error);
      // Don't show error toast for session-related errors
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