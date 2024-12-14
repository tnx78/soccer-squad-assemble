import { createClient } from '@supabase/supabase-js';

// These values will be automatically injected by Lovable when connected to Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Please connect your Supabase project in Lovable.');
}

export const supabase = createClient(
  supabaseUrl || 'https://your-project.supabase.co',
  supabaseAnonKey || 'your-anon-key'
);

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