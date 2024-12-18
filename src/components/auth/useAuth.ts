import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { AuthForm } from "./authSchema";

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const getRedirectUrl = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/auth/callback`;
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: getRedirectUrl(),
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      
      if (error) throw error;
      if (!data.url) throw new Error("No redirect URL returned");
      
      window.location.href = data.url;
    } catch (error: any) {
      console.error("Social login error:", error);
      toast.error("Login failed", { 
        description: error.message || "Please try again later"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (data: AuthForm, isRegister: boolean) => {
    try {
      setIsLoading(true);
      
      if (isRegister) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            emailRedirectTo: getRedirectUrl(),
          },
        });
        
        if (signUpError) throw signUpError;
        if (!signUpData.user?.id) throw new Error("No user ID returned");

        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: signUpData.user.id,
              name: data.email.split('@')[0],
            }
          ]);

        if (profileError) throw profileError;

        toast.success("Registration successful! Please check your email.");
        setOpen(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });
        
        if (error) throw error;
        toast.success("Login successful!");
        setOpen(false);
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      toast.error(error.message || "Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    open,
    setOpen,
    handleSocialLogin,
    handleEmailAuth,
  };
};