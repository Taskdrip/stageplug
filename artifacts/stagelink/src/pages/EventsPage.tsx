import { useState } from "react";
import { PageTransition } from "@/components/layout/PageTransition";
import { EventCard } from "@/components/ui/event-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Calendar, MapPin, Ticket } from "lucide-react";
import { useGetEvents } from "@workspace/api-client-react";

export default function EventsPage() {
  const [city, setCity] = useState("");
  const [upcomingOnly, setUpcomingOnly] = useState(true);

  const { data: events, isLoading } = useGetEvents({
    city: city || undefined,
    upcoming: upcomingOnly || undefined,
  });

  return (
    <PageTransition className="container mx-auto px-4 py-8">
      {/* Hero Header */}
      <div className="relative rounded-3xl overflow-hidden mb-12 bg-black">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-fuchsia-600/10" />
        <div className="relative z-10 px-8 py-16 md:py-24 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-heading font-black text-white mb-4">
            Live Events & Concerts
          </h1>
          <p className="text-lg text-white/70 mb-8">
            Discover premium showcases, underground gigs, and massive festivals featuring the best independent talent.
          </p>
          
          {/* Quick Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
              <Input 
                placeholder="Search by city..." 
                className="pl-10 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-md"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <Button className="h-12 px-8 bg-primary hover:bg-primary/90 text-white">
              Find Events
            </Button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div className="flex gap-2">
          <Button 
            variant={upcomingOnly ? "default" : "outline"} 
            className={upcomingOnly ? "bg-white text-black hover:bg-white/90" : "border-white/10"}
            onClick={() => setUpcomingOnly(true)}
          >
            Upcoming
          </Button>
          <Button 
            variant={!upcomingOnly ? "default" : "outline"}
            className={!upcomingOnly ? "bg-white text-black hover:bg-white/90" : "border-white/10"}
            onClick={() => setUpcomingOnly(false)}
          >
            All Events
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-xl bg-white/5 animate-pulse aspect-video" />
          ))}
        </div>
      ) : events && events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-white/5 rounded-2xl bg-white/5 border-dashed">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <Calendar className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No events found</h3>
          <p className="text-muted-foreground max-w-md">
            There are no events matching your current filters. Try searching in a different city.
          </p>
        </div>
      )}
    </PageTransition>
  );
}
