import { Link } from "wouter";
import { Event } from "@workspace/api-client-react";
import { MapPin, Calendar, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const percentSold = (event.soldTickets / event.totalTickets) * 100;
  
  const statusColors = {
    upcoming: "bg-blue-500/20 text-blue-400 border-blue-500/20",
    live: "bg-red-500/20 text-red-400 border-red-500/20",
    ended: "bg-gray-500/20 text-gray-400 border-gray-500/20",
    cancelled: "bg-orange-500/20 text-orange-400 border-orange-500/20"
  };

  return (
    <div className="glass-card group flex flex-col h-full">
      <div className="relative aspect-[16/9] overflow-hidden">
        <img 
          src={event.coverImageUrl || "https://images.unsplash.com/photo-1540039155732-680874b8ce4e?q=80&w=2067&auto=format&fit=crop"} 
          alt={event.title}
          className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge variant="outline" className={`backdrop-blur-md uppercase text-[10px] font-bold tracking-wider px-2 py-0.5 ${statusColors[event.status]}`}>
            {event.status}
          </Badge>
          {event.featured && (
            <Badge variant="outline" className="bg-primary/20 text-primary border-primary/20 backdrop-blur-md uppercase text-[10px] font-bold tracking-wider px-2 py-0.5">
              Featured
            </Badge>
          )}
        </div>
        
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="font-heading font-bold text-xl text-white line-clamp-2 leading-tight">{event.title}</h3>
        </div>
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <div className="space-y-2.5 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-foreground/80">{format(new Date(event.eventDate), "MMM d, yyyy • h:mm a")}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-foreground/80 line-clamp-1">{event.venue}, {event.city}</span>
          </div>
        </div>
        
        <div className="mt-auto space-y-4 pt-3 border-t border-white/5">
          {event.status === 'upcoming' && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{event.soldTickets} sold</span>
                <span>{event.totalTickets - event.soldTickets} left</span>
              </div>
              <Progress value={percentSold} className="h-1.5" />
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 font-heading">
              <span className="text-xs text-muted-foreground">From</span>
              <span className="text-lg font-bold text-primary">${event.ticketPrice}</span>
            </div>
            <Link href={`/events/${event.id}`} className="block">
              <Button size="sm" className="h-8 shadow-primary/20 shadow-lg">
                <Ticket className="w-4 h-4 mr-2" />
                Tickets
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
