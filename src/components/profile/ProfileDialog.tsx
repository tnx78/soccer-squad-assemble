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

const positions = ["goalkeeper", "defender", "midfielder", "attacker"] as const;
type Position = typeof positions[number];

const skillLevels = [1, 2, 3, 4, 5] as const;
type SkillLevel = typeof skillLevels[number];

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  nickname: z.string().optional(),
  age: z.coerce.number().min(16, "Must be at least 16 years old"),
  position: z.enum(positions),
  player_number: z.coerce.number().min(1, "Number must be at least 1").optional(),
  skill_level: z.enum(["1", "2", "3", "4", "5"]).transform(Number),
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
      age: profile?.age || 16,
      position: (profile?.position as Position) || "midfielder",
      player_number: profile?.player_number || undefined,
      skill_level: (profile?.skill_level?.toString() as "1" | "2" | "3" | "4" | "5") || "3",
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
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age</FormLabel>
                  <FormControl>
                    <Input type="number" min="16" placeholder="Enter your age" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Position</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your position" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {positions.map((pos) => (
                        <SelectItem key={pos} value={pos}>
                          {pos.charAt(0).toUpperCase() + pos.slice(1)}
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
              name="player_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Player Number (optional)</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" placeholder="Enter your player number" {...field} />
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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