import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, Ticket, CheckCircle2, X, QrCode, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

interface BuyTicketModalProps {
  open: boolean;
  onClose: () => void;
  event: {
    id: number;
    title: string;
    venue: string;
    city: string;
    eventDate: string;
    ticketPrice: number;
    totalTickets: number;
    soldTickets: number;
  };
  onSuccess?: () => void;
}

type Step = "select" | "confirm" | "success";

export function BuyTicketModal({ open, onClose, event, onSuccess }: BuyTicketModalProps) {
  const [step, setStep] = useState<Step>("select");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ticket, setTicket] = useState<{ id: number; qrCode: string } | null>(null);

  const remaining = event.totalTickets - event.soldTickets;
  const maxQty = Math.min(10, remaining);
  const total = event.ticketPrice * quantity;

  function handleClose() {
    if (step === "success" && onSuccess) onSuccess();
    setStep("select");
    setQuantity(1);
    setError(null);
    setTicket(null);
    onClose();
  }

  async function handlePurchase() {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFetch(`/api/events/${event.id}/buy-ticket`, {
        method: "POST",
        body: JSON.stringify({ quantity }),
      });
      setTicket(result);
      setStep("success");
      if (onSuccess) onSuccess();
    } catch (e: any) {
      setError(e.message || "Purchase failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const eventDate = new Date(event.eventDate);
  const formattedDate = eventDate.toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  const formattedTime = eventDate.toLocaleTimeString("en-US", {
    hour: "numeric", minute: "2-digit",
  });

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="bg-[#0f0d1a] border border-white/10 text-white max-w-md p-0 overflow-hidden rounded-2xl">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
                <Ticket className="w-5 h-5 text-primary" />
              </div>
              <DialogTitle className="text-lg font-bold text-white">
                {step === "success" ? "Tickets Confirmed!" : "Get Tickets"}
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === "select" && (
            <motion.div
              key="select"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="px-6 pb-6 pt-4 space-y-5"
            >
              {/* Event info */}
              <div className="rounded-xl bg-white/5 border border-white/8 p-4">
                <p className="font-semibold text-white text-base leading-tight mb-1">{event.title}</p>
                <p className="text-sm text-white/55">{event.venue}, {event.city}</p>
                <p className="text-sm text-white/55">{formattedDate} · {formattedTime}</p>
              </div>

              {/* Quantity selector */}
              <div>
                <p className="text-sm text-white/60 mb-3">Number of tickets</p>
                <div className="flex items-center gap-4">
                  <button
                    className="w-10 h-10 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors disabled:opacity-30"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-3xl font-bold text-white w-8 text-center tabular-nums">{quantity}</span>
                  <button
                    className="w-10 h-10 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors disabled:opacity-30"
                    onClick={() => setQuantity(q => Math.min(maxQty, q + 1))}
                    disabled={quantity >= maxQty}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-white/40 ml-2">{remaining} remaining</span>
                </div>
              </div>

              {/* Price breakdown */}
              <div className="rounded-xl bg-white/5 border border-white/8 p-4 space-y-2">
                <div className="flex justify-between text-sm text-white/60">
                  <span>${event.ticketPrice.toLocaleString()} × {quantity} ticket{quantity > 1 ? "s" : ""}</span>
                  <span>${(event.ticketPrice * quantity).toLocaleString()}</span>
                </div>
                <div className="border-t border-white/10 pt-2 flex justify-between font-bold text-white">
                  <span>Total</span>
                  <span className="text-primary text-lg">${total.toLocaleString()}</span>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full h-13 text-base font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25"
                onClick={() => setStep("confirm")}
              >
                Continue
              </Button>
            </motion.div>
          )}

          {step === "confirm" && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="px-6 pb-6 pt-4 space-y-5"
            >
              <div className="rounded-xl bg-white/5 border border-white/8 p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-white/55">Event</span>
                  <span className="text-white font-medium text-right max-w-[60%]">{event.title}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/55">Date</span>
                  <span className="text-white">{formattedDate}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/55">Venue</span>
                  <span className="text-white">{event.venue}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/55">Tickets</span>
                  <span className="text-white">{quantity}</span>
                </div>
                <div className="border-t border-white/10 pt-3 flex justify-between font-bold">
                  <span className="text-white">Total</span>
                  <span className="text-primary text-lg">${total.toLocaleString()}</span>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <p className="text-xs text-white/35 text-center">
                By confirming, you agree to the StageLink ticket terms. No refunds after purchase.
              </p>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 border-white/15 bg-white/5 hover:bg-white/10 text-white"
                  onClick={() => setStep("select")}
                  disabled={loading}
                >
                  Back
                </Button>
                <Button
                  className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold"
                  onClick={handlePurchase}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing…
                    </span>
                  ) : (
                    "Confirm Purchase"
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {step === "success" && ticket && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-6 pb-6 pt-4 space-y-5 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.1 }}
                className="mx-auto w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center"
              >
                <CheckCircle2 className="w-9 h-9 text-emerald-400" />
              </motion.div>

              <div>
                <p className="font-bold text-white text-lg mb-1">You're going!</p>
                <p className="text-white/55 text-sm">{event.title}</p>
                <p className="text-white/40 text-sm">{formattedDate}</p>
              </div>

              {/* QR code placeholder */}
              <div className="rounded-xl bg-white/5 border border-white/8 p-4 space-y-2">
                <div className="flex items-center justify-center gap-2 text-sm text-white/60 mb-3">
                  <QrCode className="w-4 h-4" />
                  <span>Your Ticket QR Code</span>
                </div>
                <div className="bg-white rounded-xl p-4 mx-auto w-32 h-32 flex items-center justify-center">
                  {/* QR code rendered as a simple grid pattern from the hex code */}
                  <div className="grid grid-cols-8 gap-[1px]">
                    {ticket.qrCode.slice(0, 64).split("").map((c, i) => (
                      <div
                        key={i}
                        className="w-[11px] h-[11px] rounded-[1px]"
                        style={{ background: parseInt(c, 16) > 7 ? "#000" : "#fff" }}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-white/30 font-mono break-all">{ticket.qrCode}</p>
                <div className="flex justify-between text-sm text-white/55 pt-1">
                  <span>Order #{ticket.id}</span>
                  <span>{quantity} ticket{quantity > 1 ? "s" : ""}</span>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold"
                onClick={handleClose}
              >
                Done
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
