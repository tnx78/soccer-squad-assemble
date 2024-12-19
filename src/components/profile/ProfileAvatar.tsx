import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { User } from "@supabase/supabase-js";

interface ProfileAvatarProps {
  user: User | null;
  avatarUrl: string | null;
  onAvatarUpdate: (url: string) => Promise<void>;
}

export const ProfileAvatar = ({ user, avatarUrl, onAvatarUpdate }: ProfileAvatarProps) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || !event.target.files[0] || !user) return;
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      await onAvatarUpdate(publicUrl);

      toast({
        title: "Success",
        description: "Avatar updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload avatar",
        variant: "destructive",
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