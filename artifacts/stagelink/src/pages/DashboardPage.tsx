import { Link } from "wouter";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/layout/PageTransition";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  DollarSign, CalendarDays, Users, Music2, Play, TrendingUp,
  Star, Award, Bell, Zap, ArrowRight, CheckCircle2, Clock, MapPin
} from "lucide-react";
import {
  useGetArtistDashboard,
  useGetMe,
  useGetMyArtistProfile,
  BookingStatus,
} from "@workspace/api-client-react";
import { format, formatDistanceToNow } from "date-fns";

const xpForLevel = (level: number) => level * 1000;

const statusColor: Record<BookingStatus, string> = {
  pending: "bg-orange-500/20 text-orange-400 border-orange-500/20",
  accepted: "bg-green-500/20 text-green-400 border-green-500/20",
  declined: "bg-red-500/20 text-red-400 border-red-500/20",
  completed: "bg-blue-500/20 text-blue-400 border-blue-500/20",
  cancelled: "bg-gray-500/20 text-gray-400 border-gray-500/20",
};

export default function DashboardPage() {
  const { data: me } = useGetMe();
  const { data: dashboard, isLoading } = useGetArtistDashboard();
  const { data: artistProfile } = useGetMyArtistProfile();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 space-y-8 animate-pulse max-w-7xl">
        <div className="h-40 bg-white/5 rounded-3xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 bg-white/5 rounded-2xl" />)}
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 h-64 bg-white/5 rounded-2xl" />
          <div className="h-64 bg-white/5 rounded-2xl" />
        </div>
      </div>
    );
  }

  const xpNeeded = dashboard ? xpForLevel(dashboard.level + 1) : 1000;
  const xpProgress = dashboard ? Math.min((dashboard.xp / xpNeeded) * 100, 100) : 0;

  return (
    <PageTransition className="container mx-auto px-4 py-10 max-w-7xl space-y-8">

      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-black p-8 border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-background to-fuchsia-600/10 pointer-events-none" />
        <div className="absolute top-0 right-0 w-1/3 h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
          <Avatar className="w-20 h-20 border-2 border-white/20 shadow-xl">
            <AvatarImage src={me?.avatarUrl || undefined} />
            <AvatarFallback className="bg-primary/20 text-primary text-2xl font-bold">
              {me?.displayName?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-heading font-black text-white">
                Welcome back, {me?.displayName?.split(" ")[0] || "Artist"}!
              </h1>
              {artistProfile?.verified && (
                <CheckCircle2 className="w-6 h-6 text-primary" />
              )}
            </div>
            <p className="text-muted-foreground mb-4">
              {artistProfile?.artistType
                ? `${artistProfile.artistType} · ${artistProfile.city ? `${artistProfile.city}, ` : ""}${artistProfile.country || ""}`
                : "Complete your artist profile to start getting booked."}
            </p>

            {/* XP Progress */}
            {dashboard && (
              <div className="space-y-1.5 max-w-sm">
                <div className="flex justify-between text-xs">
                  <span className="text-primary font-bold flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 fill-primary" /> Level {dashboard.level}
                  </span>
                  <span className="text-muted-foreground">{dashboard.xp.toLocaleString()} / {xpNeeded.toLocaleString()} XP</span>
                </div>
                <Progress value={xpProgress} className="h-2 bg-white/10" />
              </div>
            )}
          </div>

          <div className="flex gap-3">
            {artistProfile ? (
              <Link href={`/artists/${artistProfile.id}`}>
                <Button variant="outline" className="border-white/20 hover:bg-white/10">
                  View Profile
                </Button>
              </Link>
            ) : (
              <Link href="/settings">
                <Button className="bg-primary hover:bg-primary/90 text-white">
                  Set Up Profile
                </Button>
              </Link>
            )}
            <Link href="/bookings">
              <Button variant="outline" className="border-white/20 hover:bg-white/10">
                My Bookings
              </Button>
            </Link>
          </div>
        </div>

        {/* Badges */}
        {dashboard?.badges && dashboard.badges.length > 0 && (
          <div className="relative z-10 mt-6 flex flex-wrap gap-2 pt-6 border-t border-white/10">
            {dashboard.badges.map((badge) => (
              <Badge key={badge} variant="outline" className="border-primary/30 bg-primary/10 text-primary gap-1.5 py-1 px-3">
                <Award className="w-3.5 h-3.5" /> {badge}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Total Earnings", value: `$${(dashboard?.totalEarnings || 0).toLocaleString()}`, icon: DollarSign, color: "text-green-400", bg: "bg-green-500/10" },
          { label: "Total Bookings", value: dashboard?.totalBookings || 0, icon: CalendarDays, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Pending", value: dashboard?.pendingBookings || 0, icon: Clock, color: "text-orange-400", bg: "bg-orange-500/10" },
          { label: "Followers", value: (dashboard?.totalFollowers || 0).toLocaleString(), icon: Users, color: "text-fuchsia-400", bg: "bg-fuchsia-500/10" },
          { label: "Tracks", value: dashboard?.totalTracks || 0, icon: Music2, color: "text-purple-400", bg: "bg-purple-500/10" },
          { label: "Total Plays", value: (dashboard?.totalPlays || 0).toLocaleString(), icon: Play, color: "text-primary", bg: "bg-primary/10" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="glass rounded-2xl p-5 flex flex-col gap-3"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg}`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-2xl font-heading font-bold text-white">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid md:grid-cols-3 gap-6">

        {/* Recent Bookings */}
        <div className="md:col-span-2 glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-heading font-bold text-white">Recent Bookings</h2>
            <Link href="/bookings">
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          {dashboard?.recentBookings && dashboard.recentBookings.length > 0 ? (
            <div className="space-y-3">
              {dashboard.recentBookings.slice(0, 5).map((booking) => (
                <div key={booking.id} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-white truncate">{booking.artistName}</span>
                      <Badge variant="outline" className={`${statusColor[booking.status]} uppercase text-[9px] font-bold tracking-wider flex-shrink-0`}>
                        {booking.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" />
                        {format(new Date(booking.eventDate), "MMM d, yyyy")}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {booking.location}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-white font-bold text-sm">${booking.budget}</div>
                    <div className="text-xs text-muted-foreground">{booking.eventType}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CalendarDays className="w-12 h-12 text-white/10 mb-3" />
              <p className="text-muted-foreground">No bookings yet</p>
              <Link href="/discover">
                <Button variant="ghost" size="sm" className="mt-3 text-primary hover:bg-primary/10">
                  Discover Artists
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Notifications & Quick Actions */}
        <div className="space-y-4">
          {/* Recent Notifications */}
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" /> Notifications
              </h3>
              <Link href="/notifications">
                <Button variant="ghost" size="sm" className="text-xs text-primary hover:bg-primary/10 h-7 px-2">
                  See all
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {dashboard?.recentNotifications && dashboard.recentNotifications.length > 0 ? (
                dashboard.recentNotifications.slice(0, 4).map((n) => (
                  <div key={n.id} className={`flex gap-3 p-2.5 rounded-lg transition-colors ${!n.read ? "bg-primary/10 border border-primary/10" : "hover:bg-white/5"}`}>
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.read ? "bg-primary" : "bg-white/20"}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{n.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{n.message}</p>
                      <p className="text-xs text-white/30 mt-0.5">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm text-center py-4">All caught up!</p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="glass rounded-2xl p-5">
            <h3 className="font-heading font-bold text-white mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { href: "/discover", label: "Discover Artists", icon: TrendingUp },
                { href: "/events", label: "Browse Events", icon: CalendarDays },
                { href: "/competitions", label: "Enter Competition", icon: Star },
                { href: "/settings", label: "Edit Profile", icon: CheckCircle2 },
              ].map((action) => (
                <Link key={action.href} href={action.href}>
                  <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer group">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                      <action.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                    </div>
                    <span className="text-sm text-white/80 group-hover:text-white transition-colors">{action.label}</span>
                    <ArrowRight className="w-4 h-4 ml-auto text-white/20 group-hover:text-primary transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
