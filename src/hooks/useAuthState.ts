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
      // Clear local state first
      setUser(null);
      setProfile(null);

      // Then attempt to sign out - if it fails, we've already cleared local state
      const { error } = await supabase.auth.signOut();
      
      // Only show success message if there was no error
      if (!error) {
        toast.success("Signed out successfully");
      }
    } catch (error) {
      // No need to show error toast since local state is already cleared
      console.error('Error during sign out:', error);
    }
  };

  return {
    user,
    profile,
    handleSignOut,
    refreshProfile,
  };
};