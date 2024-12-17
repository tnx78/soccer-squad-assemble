import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";

interface ProfileAvatarProps {
  user: User | null;
  avatarUrl: string | null;
  onAvatarUpdate: (url: string) => Promise<void>;
}

export const ProfileAvatar = ({ user, avatarUrl, onAvatarUpdate }: ProfileAvatarProps) => {
  const [uploading, setUploading] = useState(false);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || !event.target.files[0] || !user) {
        throw new Error('No file selected');
      }
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { 
          upsert: true,
          contentType: file.type 
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      await onAvatarUpdate(publicUrl);
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast.error("Failed to upload avatar", {
        description: error.message
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <Avatar className="h-24 w-24">
        <AvatarImage src={avatarUrl || ""} />
        <AvatarFallback>
          {user?.email?.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <Input
        type="file"
        accept="image/*"
        onChange={handleAvatarUpload}
        disabled={uploading}
        className="max-w-[200px]"
      />
    </div>
  );
};