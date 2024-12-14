import { createClient } from '@supabase/supabase-js';

// These values will be automatically injected by Lovable when connected to Supabase
export const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
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