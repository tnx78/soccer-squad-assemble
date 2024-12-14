import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const createMatchSchema = z.object({
  title: z.string().min(1, "Title is required"),
  location: z.string().min(1, "Location is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  maxPlayers: z.string().transform((val) => parseInt(val, 10)),
});

type CreateMatchForm = z.infer<typeof createMatchSchema>;

interface CreateMatchDialogProps {
  onCreateMatch: (data: CreateMatchForm) => void;
}

export const CreateMatchDialog = ({ onCreateMatch }: CreateMatchDialogProps) => {
  const form = useForm<CreateMatchForm>({
    resolver: zodResolver(createMatchSchema),
    defaultValues: {
      title: "",
      location: "",
      date: "",
      time: "",
      maxPlayers: "",
    },
  });

  return (
    <Dialog>
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
          <form onSubmit={form.handleSubmit(onCreateMatch)} className="space-y-4">
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
                    <Input type="date" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
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
            <Button type="submit" className="w-full">Create Match</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};