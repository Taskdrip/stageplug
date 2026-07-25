import { Link } from "wouter";
import { ArtistCard as ArtistCardType } from "@workspace/api-client-react";
import { Star, MapPin, Users, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ArtistCardProps {
  artist: ArtistCardType;
}

export function ArtistCard({ artist }: ArtistCardProps) {
  return (
    <div className="glass-card group flex flex-col h-full">
      <div className="relative aspect-square overflow-hidden">
        <img 
          src={artist.coverImageUrl || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2070&auto=format&fit=crop"} 
          alt={artist.displayName}
          className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge variant="secondary" className="bg-black/50 hover:bg-black/70 backdrop-blur-md text-white border-white/10">
            {artist.artistType}
          </Badge>
          {artist.verified && (
            <Badge variant="secondary" className="bg-primary/20 hover:bg-primary/30 text-primary border-primary/20 backdrop-blur-md px-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </Badge>
          )}
        </div>
        
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="font-heading font-bold text-xl text-white line-clamp-1">{artist.displayName}</h3>
          <div className="flex items-center text-white/70 text-sm mt-1 gap-3">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {artist.city ? `${artist.city}, ` : ''}{artist.country}
            </span>
          </div>
        </div>
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex flex-wrap gap-1.5 mb-4">
          {artist.genres?.slice(0, 3).map((genre) => (
            <span key={genre} className="text-xs px-2 py-0.5 rounded-full bg-secondary/50 text-secondary-foreground border border-white/5">
              {genre}
            </span>
          ))}
          {artist.genres && artist.genres.length > 3 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/50 text-secondary-foreground border border-white/5">
              +{artist.genres.length - 3}
            </span>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500/20" />
              {artist.rating.toFixed(1)}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {artist.followersCount >= 1000 ? `${(artist.followersCount/1000).toFixed(1)}k` : artist.followersCount}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {artist.bookingPrice && (
              <span className="text-sm font-semibold">${artist.bookingPrice}</span>
            )}
            <Link href={`/artists/${artist.id}`} className="block">
              <Button size="sm" variant="outline" className="h-8 border-primary/20 hover:bg-primary hover:text-white transition-colors">
                View
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
