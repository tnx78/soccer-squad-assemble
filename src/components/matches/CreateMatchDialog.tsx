import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { addDays, format } from "date-fns";
import { useState } from "react";

const createMatchSchema = z.object({
  title: z.string().min(1, "Title is required"),
  location: z.string().min(1, "Location is required"),
  date: z.string().min(1, "Date is required").refine((date) => {
    const selectedDate = new Date(date);
    const tomorrow = addDays(new Date(), 1);
    tomorrow.setHours(0, 0, 0, 0);
    return selectedDate >= tomorrow;
  }, "Date must be tomorrow or later"),
  hours: z.string().min(1, "Hours required"),
  minutes: z.string().min(1, "Minutes required"),
  duration: z.enum(["60", "90", "120"], {
    required_error: "Please select a match duration",
  }),
  maxPlayers: z.coerce.number().min(2, "Minimum 2 players required"),
  fee: z.coerce.number().min(0, "Fee cannot be negative"),
});

export type CreateMatchForm = z.infer<typeof createMatchSchema>;

interface CreateMatchDialogProps {
  onCreateMatch: (data: CreateMatchForm) => void;
}

export const CreateMatchDialog = ({ onCreateMatch }: CreateMatchDialogProps) => {
  const [open, setOpen] = useState(false);
  const form = useForm<CreateMatchForm>({
    resolver: zodResolver(createMatchSchema),
    defaultValues: {
      title: "",
      location: "",
      date: "",
      hours: "12",
      minutes: "00",
      duration: "60",
      maxPlayers: 2,
      fee: 0,
    },
  });

  const handleSubmit = async (data: CreateMatchForm) => {
    await onCreateMatch(data);
    setOpen(false);
    form.reset();
  };

  const generateHourOptions = () => {
    return Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  };

  const generateMinuteOptions = () => {
    return ['00', '15', '30', '45'];
  };

  const tomorrow = addDays(new Date(), 1);
  const minDate = format(tomorrow, 'yyyy-MM-dd');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Create Match
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Match</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter match title" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter location" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" min={minDate} {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="hours"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Hours</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="HH" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {generateHourOptions().map((hour) => (
                          <SelectItem key={hour} value={hour}>
                            {hour}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="minutes"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Minutes</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="MM" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {generateMinuteOptions().map((minute) => (
                          <SelectItem key={minute} value={minute}>
                            {minute}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Match Duration</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">90 minutes</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="maxPlayers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Players</FormLabel>
                  <FormControl>
                    <Input type="number" min="2" placeholder="Enter max players" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Match Fee (HUF)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" placeholder="Enter match fee" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">Create Match</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};