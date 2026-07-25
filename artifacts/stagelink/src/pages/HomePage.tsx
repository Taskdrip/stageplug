import { useEffect, useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/layout/PageTransition";
import { ArtistCard } from "@/components/ui/artist-card";
import { EventCard } from "@/components/ui/event-card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Trophy, Users, Star, ChevronRight } from "lucide-react";
import {
  useGetPlatformStats,
  useGetTrendingArtists,
  useGetFeaturedEvents,
  useGetUpcomingEvents,
  useGetTopProducers,
  useGetTopDJs,
  useGetRisingArtists,
  useGetCompetitions,
  useGetPosts,
  useGetLeaderboard,
} from "@workspace/api-client-react";

const heroSlides = [
  { image: "/attached_assets/generated_images/hero-1.jpg", title: "Own the Stage", subtitle: "Connect with venues that match your energy." },
  { image: "/attached_assets/generated_images/hero-2.jpg", title: "Find Your Sound", subtitle: "Discover the producers that elevate your voice." },
  { image: "/attached_assets/generated_images/hero-3.jpg", title: "Electrify the Crowd", subtitle: "Book gigs that build your legacy." },
  { image: "/attached_assets/generated_images/hero-4.jpg", title: "Master Your Craft", subtitle: "Access premium studios and collaborators." },
  { image: "/attached_assets/generated_images/hero-5.jpg", title: "Command the Arena", subtitle: "Step into the spotlight and never look back." },
  { image: "/attached_assets/generated_images/hero-6.jpg", title: "Unleash the Bass", subtitle: "Headlining festivals is just a click away." },
  { image: "/attached_assets/generated_images/hero-7.jpg", title: "Spin the Night", subtitle: "The world's best clubs are looking for you." },
  { image: "/attached_assets/generated_images/hero-8.jpg", title: "Raw Energy", subtitle: "Turn your passion into a global movement." },
  { image: "/attached_assets/generated_images/hero-9.jpg", title: "Defy Gravity", subtitle: "Showcase your movement to millions." },
  { image: "/attached_assets/generated_images/hero-10.jpg", title: "Build the Beat", subtitle: "Produce the next global anthem." },
];

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const { data: stats } = useGetPlatformStats();
  const { data: trendingArtists } = useGetTrendingArtists();
  const { data: featuredEvents } = useGetFeaturedEvents();
  const { data: upcomingEvents } = useGetUpcomingEvents();
  const { data: topProducers } = useGetTopProducers();
  const { data: topDJs } = useGetTopDJs();
  const { data: risingArtists } = useGetRisingArtists();
  const { data: competitionsData } = useGetCompetitions();
  const { data: postsData } = useGetPosts({ limit: 4 });
  const { data: leaderboard } = useGetLeaderboard();

  return (
    <PageTransition>
      {/* Hero Section */}
      <section className="relative h-[85vh] min-h-[600px] w-full overflow-hidden bg-black">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${heroSlides[currentSlide].image})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent" />
          </motion.div>
        </AnimatePresence>

        <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center">
          <div className="max-w-3xl space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <span className="inline-block py-1 px-3 rounded-full bg-primary/20 text-primary border border-primary/20 backdrop-blur-sm text-sm font-medium mb-4">
                The Global Artist Platform
              </span>
              <AnimatePresence mode="wait">
                <motion.h1 
                  key={`title-${currentSlide}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-5xl md:text-7xl font-heading font-black tracking-tight text-white leading-[1.1]"
                >
                  {heroSlides[currentSlide].title}
                </motion.h1>
              </AnimatePresence>
              <AnimatePresence mode="wait">
                <motion.p 
                  key={`sub-${currentSlide}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: 0.1 }}
                  className="text-xl md:text-2xl text-white/70 mt-4 max-w-2xl"
                >
                  {heroSlides[currentSlide].subtitle}
                </motion.p>
              </AnimatePresence>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap items-center gap-4 pt-4"
            >
              <Link href="/discover">
                <Button size="lg" className="h-12 px-8 text-base bg-primary hover:bg-primary/90 text-white shadow-[0_0_30px_-5px] shadow-primary/50">
                  Discover Talent
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button size="lg" variant="outline" className="h-12 px-8 text-base border-white/20 hover:bg-white/10 text-white backdrop-blur-sm">
                  Join as Artist
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center gap-2">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-12 h-1.5 rounded-full transition-all duration-300 ${
                idx === currentSlide ? "bg-primary shadow-[0_0_10px] shadow-primary" : "bg-white/20 hover:bg-white/40"
              }`}
            />
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-b border-white/5 bg-background relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[100px] bg-primary/5 blur-[100px] rounded-[100%]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Global Artists", value: stats?.totalArtists || "50k+", icon: Users },
              { label: "Live Events", value: stats?.totalEvents || "12k+", icon: Play },
              { label: "Bookings Made", value: stats?.totalBookings || "100k+", icon: Star },
              { label: "Active Fans", value: stats?.totalFans || "2M+", icon: Trophy },
            ].map((stat, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="flex flex-col items-center justify-center text-center space-y-2"
              >
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-2 text-primary">
                  <stat.icon className="w-6 h-6" />
                </div>
                <h3 className="text-3xl md:text-4xl font-heading font-bold text-white">{stat.value}</h3>
                <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Sections */}
      <div className="container mx-auto px-4 py-20 space-y-32">
        
        {/* Trending Artists */}
        <section>
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-heading font-bold text-white mb-2">Trending Artists</h2>
              <p className="text-muted-foreground">The most booked and followed talent this week.</p>
            </div>
            <Link href="/discover?sort=trending">
              <Button variant="ghost" className="text-primary hover:text-primary/80 hover:bg-primary/10">
                View All <ChevronRight className="ml-1 w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingArtists?.slice(0, 4).map((artist, i) => (
              <motion.div key={artist.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <ArtistCard artist={artist} />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Featured Events */}
        <section>
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-heading font-bold text-white mb-2">Featured Events</h2>
              <p className="text-muted-foreground">Premium shows and exclusive showcases.</p>
            </div>
            <Link href="/events?featured=true">
              <Button variant="ghost" className="text-primary hover:text-primary/80 hover:bg-primary/10">
                View All <ChevronRight className="ml-1 w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredEvents?.slice(0, 3).map((event, i) => (
              <motion.div key={event.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <EventCard event={event} />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Top Producers & DJs */}
        <section className="grid md:grid-cols-2 gap-12">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-heading font-bold text-white">Top Producers</h2>
              <Link href="/discover?type=producer" className="text-sm text-primary hover:underline">See all</Link>
            </div>
            <div className="space-y-4">
              {topProducers?.slice(0, 3).map((artist) => (
                <Link key={artist.id} href={`/artists/${artist.id}`}>
                  <div className="group flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                    <img src={artist.avatarUrl || artist.coverImageUrl || ""} alt={artist.displayName} className="w-16 h-16 rounded-lg object-cover" />
                    <div className="flex-1">
                      <h4 className="font-bold text-white group-hover:text-primary transition-colors">{artist.displayName}</h4>
                      <p className="text-sm text-muted-foreground">{artist.genres?.join(", ")}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-white flex items-center justify-end gap-1">
                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                        {artist.rating.toFixed(1)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">{artist.followersCount} followers</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-heading font-bold text-white">Popular DJs</h2>
              <Link href="/discover?type=dj" className="text-sm text-primary hover:underline">See all</Link>
            </div>
            <div className="space-y-4">
              {topDJs?.slice(0, 3).map((artist) => (
                <Link key={artist.id} href={`/artists/${artist.id}`}>
                  <div className="group flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                    <img src={artist.avatarUrl || artist.coverImageUrl || ""} alt={artist.displayName} className="w-16 h-16 rounded-lg object-cover" />
                    <div className="flex-1">
                      <h4 className="font-bold text-white group-hover:text-primary transition-colors">{artist.displayName}</h4>
                      <p className="text-sm text-muted-foreground">{artist.genres?.join(", ")}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-white flex items-center justify-end gap-1">
                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                        {artist.rating.toFixed(1)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">{artist.followersCount} followers</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative rounded-3xl overflow-hidden py-24 px-8 text-center bg-black">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-background to-fuchsia-600/20" />
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay" />
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-white tracking-tight">
              Ready to take the stage?
            </h2>
            <p className="text-lg text-white/70">
              Join 50,000+ independent artists who are building real careers, booking more gigs, and connecting with global audiences.
            </p>
            <div className="pt-4">
              <Link href="/sign-up">
                <Button size="lg" className="h-14 px-10 text-lg bg-white text-black hover:bg-white/90 shadow-xl shadow-white/10">
                  Create Your Profile
                </Button>
              </Link>
            </div>
          </div>
        </section>

      </div>

      {/* Footer */}
      <footer className="bg-background border-t border-white/5 py-12 mt-20">
        <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-heading font-bold text-xl mb-4 text-white">StageLink</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              The premium career platform for independent artists worldwide. Discover, perform, earn, and grow.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/discover" className="hover:text-primary">Discover</Link></li>
              <li><Link href="/events" className="hover:text-primary">Events</Link></li>
              <li><Link href="/competitions" className="hover:text-primary">Competitions</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Community</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/community" className="hover:text-primary">Feed</Link></li>
              <li><Link href="/leaderboard" className="hover:text-primary">Leaderboard</Link></li>
              <li><Link href="/ai-studio" className="hover:text-primary">AI Studio</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-12 pt-8 border-t border-white/5 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} StageLink. All rights reserved.
        </div>
      </footer>
    </PageTransition>
  );
}
