import { useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

export interface CreateMatchForm {
  title: string;
  location: string;
  date: string;
  hours: string;
  minutes: string;
  duration: string;
  maxPlayers: string;
  fee: string;
}

interface CreateMatchDialogProps {
  onCreateMatch: (data: CreateMatchForm) => Promise<void>;
}

export const CreateMatchDialog = ({ onCreateMatch }: CreateMatchDialogProps) => {
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<CreateMatchForm>();

  const onSubmit = async (data: CreateMatchForm) => {
    await onCreateMatch(data);
    setOpen(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Match
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a New Match</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register("title", { required: true })} />
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Input id="location" {...register("location", { required: true })} />
          </div>
          <div>
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" {...register("date", { required: true })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="hours">Start Time (Hours)</Label>
              <select 
                id="hours" 
                className="w-full border rounded-md h-10 px-3"
                {...register("hours", { required: true })}
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i.toString().padStart(2, '0')}>
                    {i.toString().padStart(2, '0')}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="minutes">Minutes</Label>
              <select 
                id="minutes" 
                className="w-full border rounded-md h-10 px-3"
                {...register("minutes", { required: true })}
              >
                {['00', '15', '30', '45'].map((minute) => (
                  <option key={minute} value={minute}>
                    {minute}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <Label htmlFor="duration">Duration (minutes)</Label>
            <select 
              id="duration" 
              className="w-full border rounded-md h-10 px-3"
              {...register("duration", { required: true })}
            >
              {[60, 90, 120].map((duration) => (
                <option key={duration} value={duration}>
                  {duration} minutes
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="maxPlayers">Maximum Players</Label>
            <Input 
              id="maxPlayers" 
              type="number" 
              {...register("maxPlayers", { required: true, min: 2 })} 
            />
          </div>
          <div>
            <Label htmlFor="fee">Fee (HUF)</Label>
            <Input 
              id="fee" 
              type="number" 
              {...register("fee", { required: true, min: 0 })} 
            />
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            Create Match
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};