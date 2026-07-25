import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { useUser } from "@clerk/react";
import {
  Music, Disc3, Sliders, Mic2, Users, Activity, Heart,
  ChevronRight, ChevronLeft, Check, Sparkles, Globe, MapPin,
  DollarSign, Instagram, Twitter, Youtube, ExternalLink,
} from "lucide-react";
import { MusicBackground } from "@/components/MusicBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/* ─── Types ─────────────────────────────────────────── */

type Role = "fan" | "artist" | "dj" | "producer" | "mc" | "band" | "dancer";

const ROLES: {
  id: Role;
  label: string;
  icon: React.ElementType;
  desc: string;
  color: string;
}[] = [
  { id: "fan",      label: "Fan",       icon: Heart,    desc: "Discover & support your favourite artists", color: "from-rose-500/20 to-pink-600/10 border-rose-500/30" },
  { id: "artist",   label: "Artist",    icon: Music,    desc: "Singer, rapper, or instrumentalist",        color: "from-violet-500/20 to-purple-600/10 border-violet-500/30" },
  { id: "dj",       label: "DJ",        icon: Disc3,    desc: "Club, festival, and event DJ",              color: "from-blue-500/20 to-indigo-600/10 border-blue-500/30" },
  { id: "producer", label: "Producer",  icon: Sliders,  desc: "Beat maker and music producer",            color: "from-amber-500/20 to-orange-600/10 border-amber-500/30" },
  { id: "mc",       label: "MC",        icon: Mic2,     desc: "Host, hype man, and emcee",                color: "from-green-500/20 to-emerald-600/10 border-green-500/30" },
  { id: "band",     label: "Band",      icon: Users,    desc: "Music group or ensemble",                  color: "from-cyan-500/20 to-sky-600/10 border-cyan-500/30" },
  { id: "dancer",   label: "Dancer",    icon: Activity, desc: "Performer and choreographer",              color: "from-fuchsia-500/20 to-pink-600/10 border-fuchsia-500/30" },
];

const GENRES = [
  "Afrobeats","Hip-Hop","R&B","Pop","Dancehall","Reggae","Electronic","House",
  "Amapiano","Jazz","Soul","Gospel","Trap","Drill","Highlife","Fuji",
  "Contemporary","Rock","Alternative","Indie","Classical","Funk",
];

const STEPS = ["Your Role", "Basic Profile", "Artist Details", "All Done!"] as const;

/* ─── Helpers ────────────────────────────────────────── */

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

async function apiFetch(path: string, opts?: RequestInit) {
  const r = await fetch(`${basePath}${path}`, {
    ...opts,
    headers: { "Content-Type": "application/json", ...(opts?.headers ?? {}) },
    credentials: "include",
  });
  if (!r.ok) throw new Error(`API error ${r.status}`);
  return r.json();
}

/* ─── Step indicators ────────────────────────────────── */

function StepDots({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-2 justify-center mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          animate={{ width: i === step ? 28 : 8, opacity: i <= step ? 1 : 0.3 }}
          className="h-2 rounded-full bg-primary"
          transition={{ duration: 0.3 }}
        />
      ))}
    </div>
  );
}

/* ─── Genre chip ─────────────────────────────────────── */

function GenreChip({ genre, selected, onClick }: { genre: string; selected: boolean; onClick(): void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-200",
        selected
          ? "bg-primary text-white border-primary shadow-[0_0_12px_rgba(124,58,237,0.5)]"
          : "bg-white/5 text-white/60 border-white/10 hover:border-primary/40 hover:text-white/90"
      )}
    >
      {genre}
    </button>
  );
}

/* ─── Main component ─────────────────────────────────── */

export default function OnboardingPage() {
  const [, setLocation] = useLocation();
  const { user } = useUser();

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [role, setRole] = useState<Role | null>(null);
  const [displayName, setDisplayName] = useState(user?.fullName ?? "");
  const [bio, setBio] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [genres, setGenres] = useState<string[]>([]);
  const [bookingPrice, setBookingPrice] = useState("");
  const [instagram, setInstagram] = useState("");
  const [twitter, setTwitter] = useState("");
  const [youtube, setYoutube] = useState("");
  const [spotify, setSpotify] = useState("");

  const isFan = role === "fan";
  const totalSteps = isFan ? 3 : 4; // fans skip "Artist Details"

  function toggleGenre(g: string) {
    setGenres((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));
  }

  async function saveAndFinish() {
    setSaving(true);
    setError(null);
    try {
      // Save base user
      await apiFetch("/api/users/me", {
        method: "PUT",
        body: JSON.stringify({ displayName: displayName || user?.fullName, bio, role }),
      });

      // Save artist profile for non-fans
      if (!isFan) {
        await apiFetch("/api/artists/me", {
          method: "PUT",
          body: JSON.stringify({
            displayName,
            artistType: role,
            bio,
            genres,
            country,
            city,
            bookingPrice: bookingPrice ? parseInt(bookingPrice, 10) : null,
            socialLinks: {
              instagram: instagram || null,
              twitter: twitter || null,
              youtube: youtube || null,
              spotify: spotify || null,
            },
          }),
        });
      }

      setStep(isFan ? 2 : 3);
    } catch (e) {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleNext() {
    setError(null);
    if (step === 0) {
      if (!role) { setError("Please pick a role to continue."); return; }
      setStep(1);
    } else if (step === 1) {
      if (!displayName.trim()) { setError("Please enter your display name."); return; }
      if (isFan) {
        await saveAndFinish();
      } else {
        setStep(2);
      }
    } else if (step === 2) {
      await saveAndFinish();
    }
  }

  const slide = { initial: { opacity: 0, x: 40 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -40 } };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
      <MusicBackground />

      <div className="relative z-10 w-full max-w-2xl mx-auto px-4 py-12">
        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-white/10 shadow-2xl shadow-black/60 overflow-hidden"
          style={{ background: "rgba(13,10,30,0.85)", backdropFilter: "blur(24px)" }}
        >
          {/* Header */}
          <div className="px-8 pt-8 pb-0">
            <div className="flex items-center gap-3 mb-6">
              <img src={`${basePath}/logo.svg`} alt="StageLink" className="w-8 h-8" />
              <span className="text-white font-heading font-bold text-lg tracking-tight">StageLink</span>
            </div>

            {step < (isFan ? 2 : 3) && (
              <>
                <StepDots step={step} total={isFan ? 2 : 3} />
                <p className="text-white/40 text-sm text-center mb-1">
                  Step {step + 1} of {isFan ? 2 : 3}
                </p>
              </>
            )}
          </div>

          {/* Step content */}
          <div className="px-8 pb-8 pt-4 min-h-[420px]">
            <AnimatePresence mode="wait">

              {/* ── Step 0: Role selection ── */}
              {step === 0 && (
                <motion.div key="step0" {...slide} transition={{ duration: 0.25 }}>
                  <h1 className="text-2xl font-heading font-bold text-white mb-2">
                    How will you use StageLink?
                  </h1>
                  <p className="text-white/50 text-sm mb-6">
                    This helps us personalise your experience. You can change it later.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {ROLES.map((r) => {
                      const Icon = r.icon;
                      const active = role === r.id;
                      return (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setRole(r.id)}
                          className={cn(
                            "relative group p-4 rounded-2xl border text-left transition-all duration-200 bg-gradient-to-br",
                            r.color,
                            active
                              ? "ring-2 ring-primary ring-offset-2 ring-offset-transparent scale-[1.02] shadow-[0_0_20px_rgba(124,58,237,0.4)]"
                              : "hover:scale-[1.01] hover:border-white/20"
                          )}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <Icon className={cn("w-5 h-5", active ? "text-primary" : "text-white/50")} />
                            {active && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                              >
                                <Check className="w-3 h-3 text-white" />
                              </motion.div>
                            )}
                          </div>
                          <div className="font-heading font-semibold text-white text-sm">{r.label}</div>
                          <div className="text-white/45 text-xs mt-0.5 leading-snug">{r.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* ── Step 1: Basic profile ── */}
              {step === 1 && (
                <motion.div key="step1" {...slide} transition={{ duration: 0.25 }} className="space-y-5">
                  <div>
                    <h1 className="text-2xl font-heading font-bold text-white mb-1">
                      Set up your profile
                    </h1>
                    <p className="text-white/50 text-sm">Tell the world who you are.</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-white/70 text-sm font-medium mb-1.5 block">Display Name *</label>
                      <Input
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Your artist or fan name"
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary/60 focus:ring-primary/30 rounded-xl h-11"
                      />
                    </div>

                    <div>
                      <label className="text-white/70 text-sm font-medium mb-1.5 block">Bio</label>
                      <Textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder={isFan ? "Tell artists what you love about music…" : "Tell the world about your artistry…"}
                        rows={3}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary/60 resize-none rounded-xl"
                      />
                    </div>

                    {!isFan && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-white/70 text-sm font-medium mb-1.5 flex items-center gap-1.5 block">
                            <Globe className="w-3.5 h-3.5" /> Country
                          </label>
                          <Input
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            placeholder="e.g. Nigeria"
                            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary/60 rounded-xl h-11"
                          />
                        </div>
                        <div>
                          <label className="text-white/70 text-sm font-medium mb-1.5 flex items-center gap-1.5 block">
                            <MapPin className="w-3.5 h-3.5" /> City
                          </label>
                          <Input
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="e.g. Lagos"
                            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary/60 rounded-xl h-11"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ── Step 2: Artist details (non-fans) ── */}
              {step === 2 && !isFan && (
                <motion.div key="step2" {...slide} transition={{ duration: 0.25 }} className="space-y-5">
                  <div>
                    <h1 className="text-2xl font-heading font-bold text-white mb-1">
                      Your artist profile
                    </h1>
                    <p className="text-white/50 text-sm">Help bookers and fans discover you.</p>
                  </div>

                  {/* Genres */}
                  <div>
                    <label className="text-white/70 text-sm font-medium mb-2 block">Genres</label>
                    <div className="flex flex-wrap gap-2">
                      {GENRES.map((g) => (
                        <GenreChip key={g} genre={g} selected={genres.includes(g)} onClick={() => toggleGenre(g)} />
                      ))}
                    </div>
                  </div>

                  {/* Booking price */}
                  <div>
                    <label className="text-white/70 text-sm font-medium mb-1.5 flex items-center gap-1.5 block">
                      <DollarSign className="w-3.5 h-3.5" /> Booking Price (USD, optional)
                    </label>
                    <Input
                      type="number"
                      value={bookingPrice}
                      onChange={(e) => setBookingPrice(e.target.value)}
                      placeholder="e.g. 500"
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary/60 rounded-xl h-11"
                    />
                  </div>

                  {/* Social links */}
                  <div>
                    <label className="text-white/70 text-sm font-medium mb-2 block">
                      Social links <span className="text-white/30">(optional)</span>
                    </label>
                    <div className="space-y-2">
                      {[
                        { icon: Instagram, key: "instagram", val: instagram, set: setInstagram, ph: "instagram.com/yourname" },
                        { icon: Twitter, key: "twitter", val: twitter, set: setTwitter, ph: "twitter.com/yourname" },
                        { icon: Youtube, key: "youtube", val: youtube, set: setYoutube, ph: "youtube.com/@yourchannel" },
                        { icon: ExternalLink, key: "spotify", val: spotify, set: setSpotify, ph: "open.spotify.com/artist/..." },
                      ].map(({ icon: Icon, key, val, set, ph }) => (
                        <div key={key} className="relative">
                          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                          <Input
                            value={val}
                            onChange={(e) => set(e.target.value)}
                            placeholder={ph}
                            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary/60 rounded-xl h-10 pl-9"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── Step 3 / Final: Success ── */}
              {step === (isFan ? 2 : 3) && (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-8 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-fuchsia-500 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(124,58,237,0.6)]"
                  >
                    <Sparkles className="w-10 h-10 text-white" />
                  </motion.div>

                  <h1 className="text-3xl font-heading font-bold text-white mb-3">
                    You're all set!
                  </h1>
                  <p className="text-white/50 text-base mb-2 max-w-sm">
                    {isFan
                      ? "Welcome to StageLink. Discover incredible artists and show them your love."
                      : "Your profile is live. Start getting discovered by fans and bookers worldwide."}
                  </p>
                  <p className="text-white/30 text-sm mb-8">
                    Signed in as <span className="text-primary/80">{displayName || user?.fullName}</span>
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={() => setLocation("/discover")}
                      variant="outline"
                      className="border-white/15 text-white/70 hover:text-white hover:border-white/30 rounded-xl px-6"
                    >
                      Browse Artists
                    </Button>
                    <Button
                      onClick={() => setLocation("/dashboard")}
                      className="bg-primary hover:bg-primary/90 text-white rounded-xl px-8 shadow-[0_0_20px_rgba(124,58,237,0.4)]"
                    >
                      Go to Dashboard
                      <ChevronRight className="ml-1.5 w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>

            {/* Error */}
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm mt-4 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2"
              >
                {error}
              </motion.p>
            )}

            {/* Navigation buttons */}
            {step < (isFan ? 2 : 3) && (
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/8">
                {step > 0 ? (
                  <Button
                    variant="ghost"
                    onClick={() => setStep((s) => s - 1)}
                    disabled={saving}
                    className="text-white/50 hover:text-white gap-1.5"
                  >
                    <ChevronLeft className="w-4 h-4" /> Back
                  </Button>
                ) : (
                  <div />
                )}

                <Button
                  onClick={handleNext}
                  disabled={saving}
                  className="bg-primary hover:bg-primary/90 text-white rounded-xl px-7 gap-2 shadow-[0_0_20px_rgba(124,58,237,0.35)] disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      />
                      Saving…
                    </>
                  ) : step === 1 && isFan ? (
                    <>Finish <Sparkles className="w-4 h-4" /></>
                  ) : step === 2 && !isFan ? (
                    <>Finish <Sparkles className="w-4 h-4" /></>
                  ) : (
                    <>Continue <ChevronRight className="w-4 h-4" /></>
                  )}
                </Button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Skip link */}
        {step < (isFan ? 2 : 3) && (
          <p className="text-center mt-4 text-white/25 text-sm">
            <button
              type="button"
              className="underline-offset-2 hover:text-white/50 transition-colors"
              onClick={() => setLocation("/dashboard")}
            >
              Skip for now
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
