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
import { useState, useEffect } from "react";

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
      name: "",
      nickname: "",
      skill_level: 3,
      phone: "",
      email: user?.email || "",
    },
  });

  // Update form when profile data changes
  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name || "",
        nickname: profile.nickname || "",
        skill_level: profile.skill_level || 3,
        phone: profile.phone || "",
        email: profile.email || user?.email || "",
      });
    }
  }, [profile, user, form]);

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
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <FormLabel className="w-20">Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your name" {...field} />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nickname"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <FormLabel className="w-20">Nickname</FormLabel>
                      <FormControl>
                        <Input placeholder="Nickname" {...field} />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="skill_level"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormLabel className="w-20">Skill Level</FormLabel>
                    <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select skill level" />
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
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormLabel className="w-20">Phone</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="Phone number" {...field} />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormLabel className="w-20">Email</FormLabel>
                    <FormControl>
                      <Input type="email" disabled value={user?.email || ''} />
                    </FormControl>
                  </div>
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