import * as React from "react";
import { Link, useLocation } from "wouter";
import { useUser, useClerk, Show } from "@clerk/react";
import { 
  Zap, Bell, Search, Menu, 
  User, Dashboard, LayoutDashboard, Settings, LogOut,
  CalendarDays, Users, Trophy, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Navbar() {
  const [location] = useLocation();
  const { user } = useUser();
  const { signOut } = useClerk();
  
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

  const navLinks = [
    { href: "/discover", label: "Discover", icon: Search },
    { href: "/events", label: "Events", icon: CalendarDays },
    { href: "/community", label: "Community", icon: Users },
    { href: "/competitions", label: "Competitions", icon: Trophy },
    { href: "/ai-studio", label: "AI Studio", icon: Sparkles },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-fuchsia-500 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="font-heading font-bold text-xl hidden sm:inline-block tracking-tight">StageLink</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-1 ml-4">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location === link.href 
                    ? "bg-white/10 text-foreground" 
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            className="hidden sm:flex h-9 bg-white/5 border-white/10 text-muted-foreground gap-2 w-48 justify-start"
            onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
          >
            <Search className="w-4 h-4" />
            <span>Search...</span>
            <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-white/10 bg-white/5 px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>

          <Show when="signed-in">
            <Link href="/notifications">
              <Button variant="ghost" size="icon" className="relative h-9 w-9 hover:bg-white/10">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
              </Button>
            </Link>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full ml-1">
                  <Avatar className="h-9 w-9 border border-white/10">
                    <AvatarImage src={user?.imageUrl} alt={user?.fullName || ""} />
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {user?.firstName?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.fullName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.primaryEmailAddress?.emailAddress}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="cursor-pointer flex items-center">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/bookings" className="cursor-pointer flex items-center">
                    <CalendarDays className="w-4 h-4 mr-2" />
                    Bookings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer flex items-center">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer text-destructive focus:text-destructive"
                  onClick={() => signOut({ redirectUrl: basePath || "/" })}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </Show>

          <Show when="signed-out">
            <div className="flex items-center gap-2">
              <Link href="/sign-in">
                <Button variant="ghost" className="hidden sm:inline-flex hover:bg-white/10">Sign In</Button>
              </Link>
              <Link href="/sign-up">
                <Button className="bg-white text-black hover:bg-white/90">Sign Up</Button>
              </Link>
            </div>
          </Show>

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden h-9 w-9">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[350px] bg-background border-l-white/10">
              <nav className="flex flex-col gap-4 mt-8">
                {navLinks.map((link) => (
                  <Link 
                    key={link.href} 
                    href={link.href}
                    className="flex items-center gap-3 px-2 py-2 text-lg font-medium hover:text-primary transition-colors"
                  >
                    <link.icon className="w-5 h-5 text-muted-foreground" />
                    {link.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
