import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { User } from "@supabase/supabase-js";
import { useProfile } from "@/hooks/useProfile";
import { ProfileAvatar } from "./ProfileAvatar";
import { useState } from "react";

const skillLevels = [1, 2, 3, 4, 5] as const;
type SkillLevel = typeof skillLevels[number];

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  nickname: z.string().optional(),
  skill_level: z.coerce.number().min(1).max(5),
  phone: z.string().optional(),
  email: z.string().email().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

interface ProfileDialogProps {
  user: User | null;
  children: React.ReactNode;
  onProfileUpdate?: () => Promise<void>;
}

export const ProfileDialog = ({ user, children, onProfileUpdate }: ProfileDialogProps) => {
  const { profile, updateProfile } = useProfile(user);
  const [open, setOpen] = useState(false);
  
  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile?.name || "",
      nickname: profile?.nickname || "",
      skill_level: profile?.skill_level || 3,
      phone: profile?.phone || "",
      email: profile?.email || user?.email || "",
    },
  });

  const onSubmit = async (data: ProfileForm) => {
    await updateProfile(data);
    if (onProfileUpdate) {
      await onProfileUpdate();
    }
    setOpen(false);
  };

  const handleAvatarUpdate = async (url: string) => {
    await updateProfile({ avatar_url: url });
    if (onProfileUpdate) {
      await onProfileUpdate();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        
        <ProfileAvatar 
          user={user}
          avatarUrl={profile?.avatar_url || null}
          onAvatarUpdate={handleAvatarUpdate}
        />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nickname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nickname (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your nickname" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="skill_level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skill Level</FormLabel>
                  <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your skill level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {skillLevels.map((level) => (
                        <SelectItem key={level} value={level.toString()}>
                          {level} {level === 1 ? '(Beginner)' : level === 5 ? '(Expert)' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number (optional)</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="Enter your phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" disabled value={user?.email || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">Save Changes</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};