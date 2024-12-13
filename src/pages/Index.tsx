import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MatchCard } from "@/components/MatchCard";
import { SearchBar } from "@/components/SearchBar";
import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
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

// Mock data for initial version
const mockMatches = [
  {
    id: 1,
    title: "Sunday Friendly Match",
    location: "Central Park Field",
    date: "Sun, Mar 24 • 3:00 PM",
    players: 8,
    maxPlayers: 12,
  },
  {
    id: 2,
    title: "5-a-side Tournament",
    location: "Sports Complex",
    date: "Sat, Mar 23 • 2:00 PM",
    players: 6,
    maxPlayers: 10,
  },
  {
    id: 3,
    title: "Casual Pickup Game",
    location: "Community Field",
    date: "Fri, Mar 22 • 5:00 PM",
    players: 4,
    maxPlayers: 8,
  },
];

const Index = () => {
  const [matches, setMatches] = useState(mockMatches);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
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

  const handleSearch = (query: string) => {
    console.log("Searching for:", query);
    // Implement search functionality in future iteration
  };

  const handleJoinMatch = (matchId: number) => {
    setMatches(currentMatches =>
      currentMatches.map(match =>
        match.id === matchId
          ? { ...match, players: match.players + 1 }
          : match
      )
    );
    
    toast({
      title: "Success!",
      description: "You've joined the match. Check your email for details.",
    });
  };

  const onSubmit = (data: CreateMatchForm) => {
    const newMatch = {
      id: matches.length + 1,
      title: data.title,
      location: data.location,
      date: `${data.date} • ${data.time}`,
      players: 0,
      maxPlayers: data.maxPlayers,
    };

    setMatches([...matches, newMatch]);
    setOpen(false);
    form.reset();

    toast({
      title: "Success!",
      description: "Match created successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Soccer Matches</h1>
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
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
        </div>
        
        <SearchBar onSearch={handleSearch} />

        <div className="space-y-4">
          {matches.map((match) => (
            <MatchCard
              key={match.id}
              title={match.title}
              location={match.location}
              date={match.date}
              players={match.players}
              maxPlayers={match.maxPlayers}
              onJoin={() => handleJoinMatch(match.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;