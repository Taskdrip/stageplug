import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Ticket, Calendar, MapPin, QrCode, Clock, Search } from "lucide-react";
import { PageTransition } from "@/components/layout/PageTransition";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

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

interface MyTicket {
  id: number;
  eventId: number;
  eventTitle: string;
  eventDate: string | null;
  venue: string | null;
  city: string | null;
  coverImageUrl: string | null;
  ticketPrice: number;
  quantity: number;
  qrCode: string;
  purchasedAt: string;
  eventStatus: string | null;
}

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<MyTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    apiFetch("/api/events/me/tickets")
      .then(setTickets)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = tickets.filter(t =>
    !search ||
    t.eventTitle.toLowerCase().includes(search.toLowerCase()) ||
    (t.city ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const upcoming = filtered.filter(t => {
    if (!t.eventDate) return true;
    return new Date(t.eventDate) > new Date();
  });
  const past = filtered.filter(t => {
    if (!t.eventDate) return false;
    return new Date(t.eventDate) <= new Date();
  });

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-10 max-w-3xl space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-black text-white mb-1">My Tickets</h1>
            <p className="text-white/45 text-sm">
              {tickets.length} ticket order{tickets.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/35" />
            <Input
              placeholder="Search events…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-9"
            />
          </div>
        </div>

        {loading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Ticket className="w-8 h-8 text-primary/60" />
            </div>
            <p className="text-white/60 font-medium mb-2">No tickets found</p>
            <p className="text-white/35 text-sm mb-6">
              {search ? "Try a different search" : "Buy tickets to upcoming events and they'll appear here"}
            </p>
            <Link href="/events">
              <button className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors">
                Browse Events
              </button>
            </Link>
          </div>
        )}

        {/* Upcoming */}
        {!loading && upcoming.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-white/40 uppercase tracking-widest">Upcoming</h2>
            {upcoming.map((t, i) => (
              <TicketCard key={t.id} ticket={t} expanded={expanded === t.id} onToggle={() => setExpanded(expanded === t.id ? null : t.id)} delay={i * 0.05} />
            ))}
          </div>
        )}

        {/* Past */}
        {!loading && past.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-white/40 uppercase tracking-widest">Past Events</h2>
            {past.map((t, i) => (
              <TicketCard key={t.id} ticket={t} expanded={expanded === t.id} onToggle={() => setExpanded(expanded === t.id ? null : t.id)} delay={i * 0.05} past />
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}

function TicketCard({ ticket: t, expanded, onToggle, delay = 0, past = false }: {
  ticket: MyTicket; expanded: boolean; onToggle: () => void; delay?: number; past?: boolean;
}) {
  const eventDate = t.eventDate ? new Date(t.eventDate) : null;
  const purchasedAt = new Date(t.purchasedAt);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`rounded-2xl border overflow-hidden transition-colors ${past ? "border-white/6 opacity-70" : "border-white/12"}`}
    >
      {/* Card header */}
      <button
        className="w-full flex items-start gap-4 p-4 text-left hover:bg-white/3 transition-colors"
        onClick={onToggle}
      >
        {/* Cover image */}
        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-white/8">
          {t.coverImageUrl ? (
            <img src={t.coverImageUrl} alt={t.eventTitle} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Ticket className="w-7 h-7 text-primary/40" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold text-white leading-tight mb-1 truncate">{t.eventTitle}</p>
            <Badge className={`flex-shrink-0 text-[10px] px-2 py-0.5 border ${past ? "bg-white/5 text-white/40 border-white/10" : "bg-primary/10 text-primary border-primary/20"}`}>
              {t.quantity} ticket{t.quantity > 1 ? "s" : ""}
            </Badge>
          </div>

          <div className="space-y-1">
            {eventDate && (
              <p className="flex items-center gap-1.5 text-xs text-white/55">
                <Calendar className="w-3 h-3" />
                {eventDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                · {eventDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
              </p>
            )}
            {t.venue && (
              <p className="flex items-center gap-1.5 text-xs text-white/45">
                <MapPin className="w-3 h-3" />
                {t.venue}{t.city ? `, ${t.city}` : ""}
              </p>
            )}
          </div>
        </div>
      </button>

      {/* Expanded QR section */}
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="border-t border-white/8 bg-white/3 px-4 py-5"
        >
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
            {/* QR code */}
            <div className="flex-shrink-0 text-center">
              <div className="bg-white rounded-xl p-3 mx-auto w-28 h-28 flex items-center justify-center mb-2">
                <div className="grid grid-cols-8 gap-[1px]">
                  {t.qrCode.slice(0, 64).split("").map((c, i) => (
                    <div key={i} className="w-[11px] h-[11px] rounded-[1px]"
                      style={{ background: parseInt(c, 16) > 7 ? "#000" : "#fff" }} />
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-center gap-1 text-white/35 text-xs">
                <QrCode className="w-3 h-3" />
                Show at entry
              </div>
            </div>

            {/* Details */}
            <div className="flex-1 space-y-3 text-sm w-full">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-xl p-3">
                  <p className="text-white/40 text-xs mb-0.5">Order ID</p>
                  <p className="text-white font-mono">#{t.id}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3">
                  <p className="text-white/40 text-xs mb-0.5">Tickets</p>
                  <p className="text-white font-semibold">{t.quantity}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3">
                  <p className="text-white/40 text-xs mb-0.5">Price per ticket</p>
                  <p className="text-white font-semibold">${t.ticketPrice.toLocaleString()}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3">
                  <p className="text-white/40 text-xs mb-0.5">Total paid</p>
                  <p className="text-emerald-400 font-bold">${(t.ticketPrice * t.quantity).toLocaleString()}</p>
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-white/40 text-xs mb-0.5">QR Code</p>
                <p className="text-white/60 font-mono text-xs break-all">{t.qrCode}</p>
              </div>
              <p className="flex items-center gap-1.5 text-xs text-white/35">
                <Clock className="w-3 h-3" />
                Purchased {purchasedAt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
