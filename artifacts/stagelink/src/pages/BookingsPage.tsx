import { useState } from "react";
import { PageTransition } from "@/components/layout/PageTransition";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarDays, MapPin, DollarSign, Check, X, Clock, Calendar } from "lucide-react";
import { useGetBookings, useUpdateBookingStatus, Booking, BookingStatus } from "@workspace/api-client-react";
import { format } from "date-fns";

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState<"client" | "artist">("client");
  const { data: bookings, isLoading } = useGetBookings();
  const updateStatus = useUpdateBookingStatus();

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case "pending": return "bg-orange-500/20 text-orange-400 border-orange-500/20";
      case "accepted": return "bg-green-500/20 text-green-400 border-green-500/20";
      case "declined": return "bg-red-500/20 text-red-400 border-red-500/20";
      case "completed": return "bg-blue-500/20 text-blue-400 border-blue-500/20";
      case "cancelled": return "bg-gray-500/20 text-gray-400 border-gray-500/20";
      default: return "bg-white/10 text-white border-white/20";
    }
  };

  const handleUpdateStatus = (id: number, status: "accepted" | "declined" | "completed" | "cancelled") => {
    updateStatus.mutate({ bookingId: id, data: { status } });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 animate-pulse">
        <div className="h-10 w-48 bg-white/10 rounded mb-8" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-40 bg-white/5 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  // Split bookings if needed based on roles, but for now we'll just show all bookings in one list
  // The API likely returns bookings where the user is either the client or the artist.
  const displayBookings = bookings || [];

  return (
    <PageTransition className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-heading font-bold text-white mb-2">My Bookings</h1>
          <p className="text-muted-foreground">Manage your event requests and confirmed gigs.</p>
        </div>
        
        <div className="flex p-1 bg-white/5 rounded-lg border border-white/10">
          <button 
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'client' ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground hover:text-white'}`}
            onClick={() => setActiveTab('client')}
          >
            Requests Sent
          </button>
          <button 
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'artist' ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground hover:text-white'}`}
            onClick={() => setActiveTab('artist')}
          >
            Gig Offers
          </button>
        </div>
      </div>

      {displayBookings.length > 0 ? (
        <div className="space-y-4">
          {displayBookings.map((booking) => (
            <div key={booking.id} className="glass p-6 rounded-2xl border border-white/10 hover:bg-white-[0.02] transition-colors">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex gap-4">
                  <Avatar className="w-16 h-16 border-2 border-background">
                    <AvatarImage src={booking.artistAvatarUrl || undefined} />
                    <AvatarFallback>{booking.artistName?.charAt(0) || "A"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-xl font-bold text-white">
                        {activeTab === 'client' ? booking.artistName : booking.clientName}
                      </h3>
                      <Badge variant="outline" className={`${getStatusColor(booking.status)} uppercase text-[10px] font-bold tracking-wider`}>
                        {booking.status}
                      </Badge>
                    </div>
                    <div className="text-primary font-medium text-sm mb-2">{booking.eventType}</div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {format(new Date(booking.eventDate), "MMM d, yyyy")}</span>
                      <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {booking.location}</span>
                      <span className="flex items-center gap-1.5 text-white"><DollarSign className="w-4 h-4 text-primary" /> {booking.budget}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-between md:items-end gap-4 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
                  {booking.status === 'pending' && activeTab === 'artist' && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                        onClick={() => handleUpdateStatus(booking.id, "declined")}>
                        <X className="w-4 h-4 mr-1" /> Decline
                      </Button>
                      <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white"
                        onClick={() => handleUpdateStatus(booking.id, "accepted")}>
                        <Check className="w-4 h-4 mr-1" /> Accept
                      </Button>
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Requested {format(new Date(booking.createdAt), "MMM d")}
                  </div>
                </div>
              </div>
              
              {booking.message && (
                <div className="mt-6 pt-4 border-t border-white/5">
                  <p className="text-sm text-white/70 italic">"{booking.message}"</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 glass rounded-3xl border-dashed border-white/10">
          <CalendarDays className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">No bookings found</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {activeTab === 'client' 
              ? "You haven't sent any booking requests yet. Discover artists to get started." 
              : "You don't have any gig offers right now. Make sure your profile is complete to attract organizers."}
          </p>
        </div>
      )}
    </PageTransition>
  );
}
