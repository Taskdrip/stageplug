import { useParams } from "wouter";
import { PageTransition } from "@/components/layout/PageTransition";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, MapPin, Ticket, Clock, Share2, Users } from "lucide-react";
import { useGetEvent } from "@workspace/api-client-react";
import { format } from "date-fns";
import { ArtistCard } from "@/components/ui/artist-card";

export default function EventDetailPage() {
  const params = useParams();
  const eventId = parseInt(params.id || "0");
  
  const { data: event, isLoading } = useGetEvent(eventId, { query: { enabled: !!eventId } });

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-[50vh] bg-white/5" />
      </div>
    );
  }

  if (!event) return <div className="p-8 text-center text-white">Event not found</div>;

  const percentSold = (event.soldTickets / event.totalTickets) * 100;
  const eventDate = new Date(event.eventDate);

  return (
    <PageTransition>
      {/* Hero Section */}
      <div className="relative h-[60vh] min-h-[400px] w-full bg-black">
        <img 
          src={event.coverImageUrl || "https://images.unsplash.com/photo-1540039155732-680874b8ce4e?q=80&w=2067"} 
          alt={event.title} 
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 container mx-auto">
          <Badge className="bg-primary/20 text-primary border-primary/20 hover:bg-primary/30 mb-4 px-3 py-1 text-xs tracking-widest uppercase">
            {event.status}
          </Badge>
          <h1 className="text-4xl md:text-6xl font-heading font-black text-white max-w-4xl leading-tight mb-4">
            {event.title}
          </h1>
          <div className="flex flex-wrap items-center gap-6 text-white/80">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <span className="font-medium">{format(eventDate, "EEEE, MMMM do, yyyy")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <span className="font-medium">{format(eventDate, "h:mm a")}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              <span className="font-medium">{event.venue}, {event.city}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="text-2xl font-heading font-bold text-white mb-4">About this Event</h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-white/70 text-lg leading-relaxed whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>
            </section>

            {event.artists && event.artists.length > 0 && (
              <section>
                <h2 className="text-2xl font-heading font-bold text-white mb-6">Lineup</h2>
                <div className="grid sm:grid-cols-2 gap-6">
                  {event.artists.map(artist => (
                    <ArtistCard key={artist.id} artist={artist} />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar / Ticket Card */}
          <div className="space-y-6">
            <div className="glass-card p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/10">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Ticket Price</div>
                  <div className="text-4xl font-bold text-white flex items-center">
                    <span className="text-2xl text-primary mr-1">$</span>
                    {event.ticketPrice}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Ticket className="w-6 h-6 text-primary" />
                </div>
              </div>

              {event.status === 'upcoming' && (
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-sm">
                    <span className="text-white font-medium">{event.soldTickets} sold</span>
                    <span className="text-muted-foreground">{event.totalTickets - event.soldTickets} remaining</span>
                  </div>
                  <Progress value={percentSold} className="h-2 bg-white/10" />
                  {percentSold > 80 && (
                    <p className="text-sm text-orange-400 font-medium">Selling out fast!</p>
                  )}
                </div>
              )}

              <Button 
                size="lg" 
                className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 mb-4"
                disabled={event.status !== 'upcoming' || event.soldTickets >= event.totalTickets}
              >
                {event.status !== 'upcoming' 
                  ? 'Event Unavailable' 
                  : event.soldTickets >= event.totalTickets 
                    ? 'Sold Out' 
                    : 'Get Tickets'}
              </Button>

              <div className="flex justify-center">
                <Button variant="ghost" className="text-muted-foreground hover:text-white gap-2">
                  <Share2 className="w-4 h-4" /> Share Event
                </Button>
              </div>
            </div>

            <div className="glass p-6 rounded-2xl">
              <h3 className="font-bold text-white mb-4">Event Organizer</h3>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-white/50" />
                </div>
                <div>
                  <div className="font-medium text-white">{event.organizerName || 'StageLink Organizer'}</div>
                  <div className="text-xs text-muted-foreground">Verified Promoter</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
