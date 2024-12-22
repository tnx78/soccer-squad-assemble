import { useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

export interface CreateMatchForm {
  location: string;
  date: string;
  hours: string;
  minutes: string;
  duration: string;
  maxPlayers: string;
  availableSlots: string;
  fee: string;
}

const generateTitle = (date: string, hours: string) => {
  const dateObj = new Date(date);
  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
  const hour = parseInt(hours);
  
  let timeOfDay;
  if (hour < 12) timeOfDay = "Morning";
  else if (hour < 17) timeOfDay = "Afternoon";
  else timeOfDay = "Evening";
  
  return `${dayName} ${timeOfDay} Game`;
};

interface CreateMatchDialogProps {
  onCreateMatch: (data: CreateMatchForm) => Promise<void>;
}

export const CreateMatchDialog = ({ onCreateMatch }: CreateMatchDialogProps) => {
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset, watch, formState: { isSubmitting } } = useForm<CreateMatchForm>();

  // Get tomorrow's date in YYYY-MM-DD format
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const maxPlayers = watch('maxPlayers');
  const availableSlots = watch('availableSlots');

  const onSubmit = async (data: CreateMatchForm) => {
    if (parseInt(data.availableSlots) > parseInt(data.maxPlayers)) {
      alert("Available slots cannot be greater than maximum players");
      return;
    }
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
          <div className="flex items-center gap-2">
            <Label htmlFor="location" className="w-20">Location</Label>
            <Input id="location" {...register("location", { required: true })} />
          </div>
          
          <div className="flex items-center gap-2">
            <Label htmlFor="date" className="w-20">Date</Label>
            <Input 
              id="date" 
              type="date" 
              min={minDate}
              {...register("date", { required: true })} 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="hours" className="w-20">Hours</Label>
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
            <div className="flex items-center gap-2">
              <Label htmlFor="minutes" className="w-20">Minutes</Label>
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

          <div className="flex items-center gap-2">
            <Label htmlFor="duration" className="w-20">Duration</Label>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="maxPlayers" className="w-20">Max Players</Label>
              <Input 
                id="maxPlayers" 
                type="number" 
                {...register("maxPlayers", { required: true, min: 2 })} 
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="availableSlots" className="w-20">Available</Label>
              <Input 
                id="availableSlots" 
                type="number"
                {...register("availableSlots", { 
                  required: true,
                  min: 0,
                  validate: (value) => 
                    parseInt(value) <= parseInt(maxPlayers) || 
                    "Available slots must be less than max players"
                })} 
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Label htmlFor="fee" className="w-20">Fee (HUF)</Label>
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