import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { 
  Search, CalendarDays, Users, Trophy, Sparkles, 
  Home, LayoutDashboard, Settings, User
} from "lucide-react";
import { useClerk } from "@clerk/react";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { user } = useClerk();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        <CommandGroup heading="Discover">
          <CommandItem onSelect={() => runCommand(() => setLocation("/"))}>
            <Home className="mr-2 h-4 w-4" />
            <span>Home</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setLocation("/discover"))}>
            <Search className="mr-2 h-4 w-4" />
            <span>Discover Artists</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setLocation("/events"))}>
            <CalendarDays className="mr-2 h-4 w-4" />
            <span>Events</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setLocation("/competitions"))}>
            <Trophy className="mr-2 h-4 w-4" />
            <span>Competitions</span>
          </CommandItem>
        </CommandGroup>
        
        <CommandSeparator />
        
        <CommandGroup heading="Platform">
          <CommandItem onSelect={() => runCommand(() => setLocation("/community"))}>
            <Users className="mr-2 h-4 w-4" />
            <span>Community</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setLocation("/leaderboard"))}>
            <Trophy className="mr-2 h-4 w-4" />
            <span>Leaderboard</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setLocation("/ai-studio"))}>
            <Sparkles className="mr-2 h-4 w-4" />
            <span>AI Studio</span>
          </CommandItem>
        </CommandGroup>

        {user && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Account">
              <CommandItem onSelect={() => runCommand(() => setLocation("/dashboard"))}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => setLocation("/bookings"))}>
                <CalendarDays className="mr-2 h-4 w-4" />
                <span>My Bookings</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => setLocation("/settings"))}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </CommandItem>
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
