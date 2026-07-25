import { useState } from "react";
import { PageTransition } from "@/components/layout/PageTransition";
import { ArtistCard } from "@/components/ui/artist-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, SlidersHorizontal, MapPin, CheckCircle2 } from "lucide-react";
import { useGetArtists } from "@workspace/api-client-react";

const GENRES = ["Hip Hop", "Electronic", "R&B", "Pop", "Rock", "Jazz", "Classical", "Afrobeat"];
const ARTIST_TYPES = ["Artist", "DJ", "Producer", "MC", "Band", "Dancer"];

export default function DiscoverPage() {
  const [search, setSearch] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string>("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [city, setCity] = useState("");

  const { data, isLoading } = useGetArtists({
    q: search || undefined,
    genre: selectedGenres.length > 0 ? selectedGenres[0] : undefined, // simplified for API
    artistType: selectedType || undefined,
    city: city || undefined,
    verified: verifiedOnly || undefined,
  });

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    );
  };

  return (
    <PageTransition className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Filters */}
        <div className="w-full md:w-64 flex-shrink-0 space-y-8">
          <div>
            <h2 className="text-xl font-heading font-bold text-white mb-4 flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5" /> Filters
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search artists..." 
                className="pl-9 bg-white/5 border-white/10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-white">Artist Type</h3>
            <div className="flex flex-wrap gap-2">
              {ARTIST_TYPES.map(type => (
                <Badge 
                  key={type}
                  variant={selectedType === type ? "default" : "outline"}
                  className={`cursor-pointer ${selectedType === type ? 'bg-primary' : 'hover:bg-white/10 border-white/10'}`}
                  onClick={() => setSelectedType(type === selectedType ? "" : type)}
                >
                  {type}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-white">Genres</h3>
            <div className="flex flex-wrap gap-2">
              {GENRES.map(genre => (
                <Badge 
                  key={genre}
                  variant={selectedGenres.includes(genre) ? "default" : "outline"}
                  className={`cursor-pointer ${selectedGenres.includes(genre) ? 'bg-primary' : 'hover:bg-white/10 border-white/10'}`}
                  onClick={() => toggleGenre(genre)}
                >
                  {genre}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-white">Location</h3>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="City (e.g. London)" 
                className="pl-9 bg-white/5 border-white/10"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-2">
            <button 
              className={`flex items-center gap-2 text-sm w-full p-2 rounded-lg transition-colors ${verifiedOnly ? 'bg-primary/20 text-primary' : 'hover:bg-white/5 text-muted-foreground'}`}
              onClick={() => setVerifiedOnly(!verifiedOnly)}
            >
              <CheckCircle2 className={`w-5 h-5 ${verifiedOnly ? 'text-primary' : 'text-muted-foreground'}`} />
              Verified Artists Only
            </button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="flex-1">
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-3xl font-heading font-bold text-white">Discover</h1>
            <span className="text-muted-foreground text-sm">
              {data?.total || 0} artists found
            </span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="rounded-xl bg-white/5 animate-pulse aspect-[3/4]" />
              ))}
            </div>
          ) : data?.artists && data.artists.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.artists.map((artist) => (
                <ArtistCard key={artist.id} artist={artist} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center border border-white/5 rounded-2xl bg-white/5 border-dashed">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No artists found</h3>
              <p className="text-muted-foreground max-w-md">
                Try adjusting your filters or search terms to find what you're looking for.
              </p>
              <Button 
                variant="outline" 
                className="mt-6 border-white/10"
                onClick={() => {
                  setSearch("");
                  setSelectedGenres([]);
                  setSelectedType("");
                  setCity("");
                  setVerifiedOnly(false);
                }}
              >
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
