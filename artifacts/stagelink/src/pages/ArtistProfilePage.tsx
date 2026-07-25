import { useState } from "react";
import { useParams } from "wouter";
import { PageTransition } from "@/components/layout/PageTransition";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  CheckCircle2, MapPin, Users, Star, 
  Instagram, Twitter, Youtube, Play, Music2, 
  CalendarDays, MessageSquare, Plus
} from "lucide-react";
import { useGetArtist, useGetArtistReviews } from "@workspace/api-client-react";

export default function ArtistProfilePage() {
  const params = useParams();
  const artistId = parseInt(params.id || "0");
  
  const { data: artist, isLoading: artistLoading } = useGetArtist(artistId, { query: { enabled: !!artistId } });
  const { data: reviews } = useGetArtistReviews(artistId, { query: { enabled: !!artistId } });
  
  const [activeTab, setActiveTab] = useState("overview");

  if (artistLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-[40vh] bg-white/5" />
        <div className="container mx-auto px-4 -mt-20">
          <div className="flex items-end gap-6">
            <div className="w-40 h-40 rounded-full bg-white/10 border-4 border-background" />
            <div className="flex-1 pb-4 space-y-4">
              <div className="h-8 w-64 bg-white/10 rounded" />
              <div className="h-4 w-32 bg-white/10 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!artist) return <div className="p-8 text-center">Artist not found</div>;

  return (
    <PageTransition>
      {/* Cover Header */}
      <div className="relative h-[40vh] min-h-[300px] w-full bg-black">
        <img 
          src={artist.coverImageUrl || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2070"} 
          alt="Cover" 
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
      </div>

      <div className="container mx-auto px-4 -mt-24 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end gap-6 mb-8">
          <Avatar className="w-32 h-32 md:w-48 md:h-48 border-4 border-background shadow-2xl">
            <AvatarImage src={artist.avatarUrl || undefined} className="object-cover" />
            <AvatarFallback className="bg-primary/20 text-4xl text-primary font-bold">
              {artist.displayName.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 pb-2 md:pb-6">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <Badge variant="secondary" className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md">
                {artist.artistType}
              </Badge>
              {artist.verified && (
                <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/20 backdrop-blur-md gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                </Badge>
              )}
            </div>
            
            <h1 className="text-4xl md:text-5xl font-heading font-black text-white mb-2">
              {artist.displayName}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" /> {artist.city ? `${artist.city}, ` : ''}{artist.country}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" /> {artist.followersCount.toLocaleString()} followers
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500" /> {artist.rating.toFixed(1)} ({artist.reviewCount} reviews)
              </span>
            </div>
          </div>

          <div className="flex gap-3 md:pb-6">
            <Button size="lg" variant="outline" className="border-white/20 hover:bg-white/10 backdrop-blur-md">
              Follow
            </Button>
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25">
              Book Now
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-8 border-b border-white/10 mb-8 overflow-x-auto no-scrollbar">
          {["overview", "music", "reviews", "book"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-medium capitalize whitespace-nowrap transition-colors relative ${
                activeTab === tab ? "text-primary" : "text-muted-foreground hover:text-white"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full shadow-[0_0_10px] shadow-primary/50" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px] mb-20">
          {activeTab === "overview" && (
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-8">
                <div className="glass p-6 rounded-2xl">
                  <h3 className="text-xl font-bold text-white mb-4">About</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {artist.bio || "This artist hasn't added a bio yet."}
                  </p>
                </div>
                
                <div className="glass p-6 rounded-2xl">
                  <h3 className="text-xl font-bold text-white mb-4">Genres</h3>
                  <div className="flex flex-wrap gap-2">
                    {artist.genres?.map(genre => (
                      <Badge key={genre} variant="outline" className="border-white/10 bg-white/5 py-1.5 px-3">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="glass p-6 rounded-2xl">
                  <h3 className="font-bold text-white mb-4">Social Links</h3>
                  <div className="flex gap-4">
                    {artist.socialLinks?.instagram && (
                      <a href={artist.socialLinks.instagram} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-colors">
                        <Instagram className="w-5 h-5" />
                      </a>
                    )}
                    {artist.socialLinks?.twitter && (
                      <a href={artist.socialLinks.twitter} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-colors">
                        <Twitter className="w-5 h-5" />
                      </a>
                    )}
                    {artist.socialLinks?.youtube && (
                      <a href={artist.socialLinks.youtube} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-colors">
                        <Youtube className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="glass p-6 rounded-2xl">
                  <h3 className="font-bold text-white mb-4">Stats</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Platform Level</span>
                      <span className="text-white font-bold">{artist.level}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total XP</span>
                      <span className="text-primary font-bold">{artist.xp.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "music" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Popular Tracks</h3>
              </div>
              
              {artist.tracks && artist.tracks.length > 0 ? (
                artist.tracks.map((track, idx) => (
                  <div key={track.id} className="group glass p-4 rounded-xl flex items-center gap-4 hover:bg-white/10 transition-colors">
                    <div className="text-muted-foreground w-6 text-center font-mono text-sm">{idx + 1}</div>
                    <div className="relative w-12 h-12 rounded-md overflow-hidden bg-white/10">
                      <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <Play className="w-5 h-5 text-white fill-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{track.title}</h4>
                      <p className="text-xs text-muted-foreground">{track.genre} • {track.trackType}</p>
                    </div>
                    <div className="hidden md:block text-sm text-muted-foreground mr-8">
                      {Math.floor(track.durationSeconds / 60)}:{(track.durationSeconds % 60).toString().padStart(2, '0')}
                    </div>
                    <div className="text-sm font-medium text-white/80">
                      {track.plays.toLocaleString()} plays
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 glass rounded-2xl">
                  <Music2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-white font-medium">No tracks available</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Client Reviews</h3>
                <Button variant="outline" className="border-white/10">Write a Review</Button>
              </div>

              {reviews && reviews.length > 0 ? (
                <div className="grid gap-6">
                  {reviews.map(review => (
                    <div key={review.id} className="glass p-6 rounded-2xl">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={review.reviewerAvatarUrl || undefined} />
                            <AvatarFallback>{review.reviewerName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-white">{review.reviewerName}</div>
                            <div className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                        <div className="flex text-yellow-500">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < review.rating ? "fill-yellow-500" : "fill-transparent opacity-30"}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-white/80 text-sm leading-relaxed">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 glass rounded-2xl">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-white font-medium">No reviews yet</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "book" && (
            <div className="max-w-2xl mx-auto glass p-8 rounded-3xl">
              <h3 className="text-2xl font-bold text-white mb-2">Book {artist.displayName}</h3>
              <p className="text-muted-foreground mb-8">Send a booking request. The artist will review and respond to your proposal.</p>
              
              <form className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Event Type</label>
                  <select className="w-full h-10 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50">
                    <option value="festival" className="bg-background">Festival</option>
                    <option value="club" className="bg-background">Club Night</option>
                    <option value="private" className="bg-background">Private Event</option>
                    <option value="corporate" className="bg-background">Corporate Event</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Date</label>
                    <input type="date" className="w-full h-10 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Budget (USD)</label>
                    <input type="number" defaultValue={artist.bookingPrice || ""} placeholder="E.g. 1000" className="w-full h-10 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Location / Venue</label>
                  <input type="text" placeholder="E.g. The Grand Arena, London" className="w-full h-10 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Message to Artist</label>
                  <textarea rows={4} placeholder="Describe your event and what you're looking for..." className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>

                <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-white text-lg">
                  Submit Booking Request
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
