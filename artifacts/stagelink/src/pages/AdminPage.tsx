import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Ticket, CalendarDays, Users, DollarSign, TrendingUp,
  Search, RefreshCw, ChevronDown, Shield, QrCode,
  CheckCircle, XCircle, Clock, AlertCircle, Eye
} from "lucide-react";
import { PageTransition } from "@/components/layout/PageTransition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

async function apiFetch(path: string, opts?: RequestInit) {
  const r = await fetch(`${basePath}${path}`, {
    ...opts,
    headers: { "Content-Type": "application/json", ...(opts?.headers ?? {}) },
    credentials: "include",
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || `API error ${r.status}`);
  return data;
}

/* ─── Types ─────────────────────────────────────────── */
interface Stats {
  totalTicketsSold: number;
  totalOrders: number;
  totalRevenue: number;
  totalBookings: number;
  totalUsers: number;
  totalEvents: number;
}

interface TicketOrder {
  id: number;
  eventId: number;
  eventTitle: string;
  eventDate: string | null;
  venue: string | null;
  city: string | null;
  ticketPrice: number;
  userId: number;
  buyerName: string;
  buyerAvatar: string | null;
  quantity: number;
  totalValue: number;
  qrCode: string;
  purchasedAt: string;
}

interface AdminBooking {
  id: number;
  artistId: number;
  artistName: string;
  artistAvatar: string | null;
  clientId: number;
  clientName: string;
  clientAvatar: string | null;
  eventType: string;
  eventDate: string;
  location: string;
  budget: number;
  status: string;
  message: string;
  createdAt: string;
}

/* ─── Stat card ─────────────────────────────────────── */
function StatCard({ label, value, icon: Icon, color, sub }: {
  label: string; value: string | number; icon: React.ElementType; color: string; sub?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5 rounded-2xl"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-2xl font-bold text-white mb-0.5">{value}</p>
      <p className="text-sm text-white/55">{label}</p>
      {sub && <p className="text-xs text-white/35 mt-0.5">{sub}</p>}
    </motion.div>
  );
}

/* ─── Booking status badge ──────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { label: string; class: string; icon: React.ElementType }> = {
    pending:  { label: "Pending",  class: "bg-amber-500/10 text-amber-400 border-amber-500/20",  icon: Clock },
    accepted: { label: "Accepted", class: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: CheckCircle },
    declined: { label: "Declined", class: "bg-red-500/10 text-red-400 border-red-500/20", icon: XCircle },
  };
  const c = cfg[status] ?? { label: status, class: "bg-white/10 text-white/60 border-white/10", icon: AlertCircle };
  return (
    <Badge className={`${c.class} border flex items-center gap-1 px-2 py-0.5 text-xs font-medium`}>
      <c.icon className="w-3 h-3" />
      {c.label}
    </Badge>
  );
}

/* ─── Main page ─────────────────────────────────────── */
export default function AdminPage() {
  const [tab, setTab] = useState<"tickets" | "bookings" | "users">("tickets");
  const [stats, setStats] = useState<Stats | null>(null);
  const [tickets, setTickets] = useState<TicketOrder[]>([]);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, t, b] = await Promise.all([
        apiFetch("/api/admin/stats"),
        apiFetch("/api/admin/tickets"),
        apiFetch("/api/admin/bookings"),
      ]);
      setStats(s);
      setTickets(t);
      setBookings(b);
    } catch (e: any) {
      if (e.message?.includes("403") || e.message?.toLowerCase().includes("forbidden")) {
        setForbidden(true);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function updateBookingStatus(bookingId: number, status: string) {
    try {
      await apiFetch(`/api/admin/bookings/${bookingId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b));
      toast({ title: "Booking updated", description: `Status changed to ${status}` });
    } catch {
      toast({ title: "Error", description: "Failed to update booking status", variant: "destructive" });
    }
  }

  /* Forbidden */
  if (forbidden) {
    return (
      <PageTransition>
        <div className="container mx-auto px-4 py-24 text-center">
          <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-3xl font-heading font-bold text-white mb-3">Access Denied</h1>
          <p className="text-white/55">You don't have admin privileges to view this page.</p>
        </div>
      </PageTransition>
    );
  }

  const filteredTickets = tickets.filter(t =>
    !search ||
    t.eventTitle.toLowerCase().includes(search.toLowerCase()) ||
    t.buyerName.toLowerCase().includes(search.toLowerCase()) ||
    t.qrCode.includes(search)
  );

  const filteredBookings = bookings.filter(b =>
    !search ||
    b.artistName.toLowerCase().includes(search.toLowerCase()) ||
    b.clientName.toLowerCase().includes(search.toLowerCase()) ||
    b.eventType.toLowerCase().includes(search.toLowerCase()) ||
    b.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-8 space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-heading font-bold text-white">Admin Dashboard</h1>
              <p className="text-sm text-white/45">Full platform access</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-white/15 bg-white/5 hover:bg-white/10 text-white gap-2"
            onClick={load}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard label="Total Revenue" value={`$${stats.totalRevenue.toLocaleString()}`} icon={DollarSign} color="bg-emerald-500/10 text-emerald-400" />
            <StatCard label="Tickets Sold" value={stats.totalTicketsSold.toLocaleString()} icon={Ticket} color="bg-primary/10 text-primary" />
            <StatCard label="Orders" value={stats.totalOrders.toLocaleString()} icon={TrendingUp} color="bg-blue-500/10 text-blue-400" />
            <StatCard label="Bookings" value={stats.totalBookings.toLocaleString()} icon={CalendarDays} color="bg-amber-500/10 text-amber-400" />
            <StatCard label="Users" value={stats.totalUsers.toLocaleString()} icon={Users} color="bg-fuchsia-500/10 text-fuchsia-400" />
            <StatCard label="Events" value={stats.totalEvents.toLocaleString()} icon={CalendarDays} color="bg-cyan-500/10 text-cyan-400" />
          </div>
        )}

        {/* Tabs + Search */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex gap-1 bg-white/5 rounded-xl p-1 border border-white/8">
            {(["tickets", "bookings"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setSearch(""); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                  tab === t ? "bg-primary text-white shadow-lg shadow-primary/25" : "text-white/55 hover:text-white"
                }`}
              >
                {t === "tickets" ? `Ticket Orders (${tickets.length})` : `Bookings (${bookings.length})`}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/35" />
            <Input
              placeholder="Search…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-9"
            />
          </div>
        </div>

        {/* Tickets Table */}
        {tab === "tickets" && (
          <div className="rounded-2xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/3">
                    <th className="text-left px-4 py-3 text-white/45 font-medium">Order</th>
                    <th className="text-left px-4 py-3 text-white/45 font-medium">Event</th>
                    <th className="text-left px-4 py-3 text-white/45 font-medium">Buyer</th>
                    <th className="text-center px-4 py-3 text-white/45 font-medium">Qty</th>
                    <th className="text-right px-4 py-3 text-white/45 font-medium">Value</th>
                    <th className="text-left px-4 py-3 text-white/45 font-medium">Purchased</th>
                    <th className="text-left px-4 py-3 text-white/45 font-medium">QR</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b border-white/5">
                        {Array.from({ length: 7 }).map((_, j) => (
                          <td key={j} className="px-4 py-3">
                            <div className="h-4 bg-white/8 rounded animate-pulse" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : filteredTickets.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-white/35">
                        {search ? "No orders match your search" : "No ticket orders yet"}
                      </td>
                    </tr>
                  ) : (
                    filteredTickets.map((t) => (
                      <tr key={t.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-mono text-white/60 text-xs">#{t.id}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-white font-medium leading-tight">{t.eventTitle}</p>
                            {t.venue && <p className="text-white/40 text-xs">{t.venue}{t.city ? `, ${t.city}` : ""}</p>}
                            {t.eventDate && (
                              <p className="text-white/35 text-xs">
                                {new Date(t.eventDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={t.buyerAvatar ?? undefined} />
                              <AvatarFallback className="bg-primary/20 text-primary text-xs">
                                {t.buyerName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-white text-xs">{t.buyerName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-white font-medium">{t.quantity}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-emerald-400 font-semibold">${t.totalValue.toLocaleString()}</span>
                          <p className="text-white/35 text-xs">${t.ticketPrice}/ea</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-white/55 text-xs">
                            {new Date(t.purchasedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                          <p className="text-white/35 text-xs">
                            {new Date(t.purchasedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <QrCode className="w-3 h-3 text-white/35" />
                            <span className="font-mono text-white/35 text-[10px]">{t.qrCode.slice(0, 8)}…</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {!loading && filteredTickets.length > 0 && (
              <div className="px-4 py-3 border-t border-white/8 bg-white/2 text-xs text-white/35 flex justify-between">
                <span>{filteredTickets.length} orders</span>
                <span>Total: ${filteredTickets.reduce((s, t) => s + t.totalValue, 0).toLocaleString()}</span>
              </div>
            )}
          </div>
        )}

        {/* Bookings Table */}
        {tab === "bookings" && (
          <div className="rounded-2xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/3">
                    <th className="text-left px-4 py-3 text-white/45 font-medium">ID</th>
                    <th className="text-left px-4 py-3 text-white/45 font-medium">Artist</th>
                    <th className="text-left px-4 py-3 text-white/45 font-medium">Client</th>
                    <th className="text-left px-4 py-3 text-white/45 font-medium">Event Type</th>
                    <th className="text-left px-4 py-3 text-white/45 font-medium">Date</th>
                    <th className="text-right px-4 py-3 text-white/45 font-medium">Budget</th>
                    <th className="text-center px-4 py-3 text-white/45 font-medium">Status</th>
                    <th className="text-center px-4 py-3 text-white/45 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b border-white/5">
                        {Array.from({ length: 8 }).map((_, j) => (
                          <td key={j} className="px-4 py-3">
                            <div className="h-4 bg-white/8 rounded animate-pulse" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-white/35">
                        {search ? "No bookings match your search" : "No bookings yet"}
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((b) => (
                      <tr key={b.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-mono text-white/60 text-xs">#{b.id}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-7 h-7">
                              <AvatarImage src={b.artistAvatar ?? undefined} />
                              <AvatarFallback className="bg-primary/20 text-primary text-xs">
                                {b.artistName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-white text-xs">{b.artistName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-7 h-7">
                              <AvatarImage src={b.clientAvatar ?? undefined} />
                              <AvatarFallback className="bg-white/10 text-white/60 text-xs">
                                {b.clientName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-white text-xs">{b.clientName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-white text-xs capitalize">{b.eventType}</span>
                          <p className="text-white/35 text-xs">{b.location}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-white/60 text-xs">
                            {new Date(b.eventDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-emerald-400 font-semibold">${b.budget.toLocaleString()}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <StatusBadge status={b.status} />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-white/55 hover:text-white hover:bg-white/10 gap-1"
                              >
                                <Eye className="w-3 h-3" />
                                <ChevronDown className="w-3 h-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              {["pending", "accepted", "declined"].map((s) => (
                                <DropdownMenuItem
                                  key={s}
                                  onClick={() => updateBookingStatus(b.id, s)}
                                  disabled={b.status === s}
                                  className="capitalize"
                                >
                                  Set {s}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {!loading && filteredBookings.length > 0 && (
              <div className="px-4 py-3 border-t border-white/8 bg-white/2 text-xs text-white/35 flex justify-between">
                <span>{filteredBookings.length} bookings</span>
                <span>Total budgets: ${filteredBookings.reduce((s, b) => s + b.budget, 0).toLocaleString()}</span>
              </div>
            )}
          </div>
        )}

        {/* Message about setting admin role */}
        <div className="rounded-xl bg-primary/5 border border-primary/15 p-4 text-sm text-white/55">
          <p className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary flex-shrink-0" />
            To grant admin access, update a user's role to <code className="bg-white/10 px-1.5 py-0.5 rounded text-primary text-xs font-mono">admin</code> in the database:
            <code className="bg-white/10 px-2 py-0.5 rounded text-white/70 text-xs font-mono">
              UPDATE users SET role = 'admin' WHERE id = &lt;user_id&gt;;
            </code>
          </p>
        </div>
      </div>
    </PageTransition>
  );
}
