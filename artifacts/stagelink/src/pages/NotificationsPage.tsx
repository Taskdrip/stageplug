import { motion } from "framer-motion";
import { PageTransition } from "@/components/layout/PageTransition";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bell, CalendarDays, UserPlus, Star, Trophy, Zap,
  CheckCheck, Music2, DollarSign, MessageCircle, Info
} from "lucide-react";
import {
  useGetNotifications,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  NotificationType,
} from "@workspace/api-client-react";
import { formatDistanceToNow } from "date-fns";

const typeConfig: Record<
  NotificationType,
  { icon: React.ElementType; color: string; bg: string }
> = {
  booking_request:   { icon: CalendarDays,    color: "text-blue-400",    bg: "bg-blue-500/10" },
  booking_accepted:  { icon: CheckCheck,       color: "text-green-400",   bg: "bg-green-500/10" },
  booking_declined:  { icon: CalendarDays,     color: "text-red-400",     bg: "bg-red-500/10" },
  booking_completed: { icon: CheckCheck,       color: "text-teal-400",    bg: "bg-teal-500/10" },
  new_follower:      { icon: UserPlus,         color: "text-fuchsia-400", bg: "bg-fuchsia-500/10" },
  new_review:        { icon: Star,             color: "text-yellow-400",  bg: "bg-yellow-500/10" },
  competition_result:{ icon: Trophy,           color: "text-primary",     bg: "bg-primary/10" },
  xp_earned:         { icon: Zap,              color: "text-primary",     bg: "bg-primary/10" },
  new_track:         { icon: Music2,           color: "text-purple-400",  bg: "bg-purple-500/10" },
  payment_received:  { icon: DollarSign,       color: "text-green-400",   bg: "bg-green-500/10" },
  comment:           { icon: MessageCircle,    color: "text-blue-400",    bg: "bg-blue-500/10" },
  system:            { icon: Info,             color: "text-muted-foreground", bg: "bg-white/5" },
};

function getConfig(type: NotificationType) {
  return typeConfig[type] ?? { icon: Bell, color: "text-muted-foreground", bg: "bg-white/5" };
}

export default function NotificationsPage() {
  const { data: notifications, isLoading, refetch } = useGetNotifications();
  const markAll = useMarkAllNotificationsRead();
  const markOne = useMarkNotificationRead();

  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0;

  const handleMarkAll = () => {
    markAll.mutate(undefined, { onSuccess: () => refetch() });
  };

  const handleMarkOne = (id: number) => {
    markOne.mutate({ notificationId: id }, { onSuccess: () => refetch() });
  };

  return (
    <PageTransition className="container mx-auto px-4 py-12 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-heading font-black text-white mb-2 flex items-center gap-3">
            <Bell className="w-8 h-8 text-primary" />
            Notifications
            {unreadCount > 0 && (
              <Badge className="bg-primary/20 text-primary border-primary/20 text-sm px-2.5 py-0.5">
                {unreadCount} new
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground">Stay up to date with your bookings, fans, and activity.</p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            className="border-white/10 hover:bg-white/10 text-sm"
            onClick={handleMarkAll}
            disabled={markAll.isPending}
          >
            <CheckCheck className="w-4 h-4 mr-2" />
            {markAll.isPending ? "Marking..." : "Mark all read"}
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 bg-white/5 rounded-2xl" />
          ))}
        </div>
      ) : notifications && notifications.length > 0 ? (
        <div className="space-y-2">
          {notifications.map((n, i) => {
            const cfg = getConfig(n.type);
            const Icon = cfg.icon;
            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => !n.read && handleMarkOne(n.id)}
                className={`relative flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
                  !n.read
                    ? "bg-primary/5 border-primary/15 hover:bg-primary/10"
                    : "bg-white/[0.03] border-white/5 hover:bg-white/[0.06]"
                }`}
              >
                {/* Unread dot */}
                {!n.read && (
                  <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary" />
                )}

                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                  <Icon className={`w-5 h-5 ${cfg.color}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`font-semibold text-sm ${!n.read ? "text-white" : "text-white/70"}`}>
                      {n.title}
                    </p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0 mt-0.5">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{n.message}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-24 glass rounded-3xl border-dashed border-white/10">
          <Bell className="w-16 h-16 text-white/10 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">All quiet here</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            You don't have any notifications yet. Book artists, follow creators, and engage with the community to get started.
          </p>
        </div>
      )}
    </PageTransition>
  );
}
