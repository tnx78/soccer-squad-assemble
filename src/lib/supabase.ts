import { createClient } from '@supabase/supabase-js';

// These values will be automatically injected by Lovable when connected to Supabase
const supabaseUrl = 'https://jhtozjkvrlzpmzcdcvmi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpodG96amt2cmx6cG16Y2Rjdm1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDI3MzA5NjcsImV4cCI6MjAxODMwNjk2N30.Nh83ebqzf1iGHTaI0tq0aNfDtXzICJBjvYaLhyZBVs4';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Please connect your Supabase project in Lovable.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to get user's profile
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
};

// Helper to update user's credit
export const updateUserCredit = async (userId: string, amount: number) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ credit: amount })
    .eq('id', userId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};