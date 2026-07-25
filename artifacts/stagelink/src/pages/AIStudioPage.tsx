import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/layout/PageTransition";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles, Wand2, Music2, FileText, Image, Mic, Zap,
  ArrowRight, ChevronRight, Copy, RefreshCw, Lock
} from "lucide-react";

interface Tool {
  id: string;
  icon: React.ElementType;
  label: string;
  description: string;
  placeholder: string;
  badge?: string;
  comingSoon?: boolean;
  gradient: string;
}

const tools: Tool[] = [
  {
    id: "bio",
    icon: FileText,
    label: "Bio Writer",
    description: "Generate a compelling artist biography that captivates bookers and fans.",
    placeholder: "Tell me about yourself: your genre, style, influences, and what makes you unique...",
    gradient: "from-blue-500/20 to-primary/20",
  },
  {
    id: "lyrics",
    icon: Music2,
    label: "Lyric Generator",
    description: "Create original lyrics in any style, mood, or genre.",
    placeholder: "Describe the vibe and theme: e.g. 'a melancholic R&B song about late-night drives...'",
    gradient: "from-primary/20 to-fuchsia-500/20",
  },
  {
    id: "pitch",
    icon: Mic,
    label: "Booking Pitch",
    description: "Write a professional pitch message to send to venues or brands.",
    placeholder: "What type of event are you pitching for? Describe the venue and your act...",
    gradient: "from-fuchsia-500/20 to-pink-500/20",
  },
  {
    id: "press",
    icon: FileText,
    label: "Press Release",
    description: "Create a professional press release for your next release or event.",
    placeholder: "Describe your upcoming release or event: name, date, genre, key highlights...",
    gradient: "from-green-500/20 to-teal-500/20",
  },
  {
    id: "caption",
    icon: Image,
    label: "Social Caption",
    description: "Write viral-worthy captions for Instagram, TikTok, Twitter and more.",
    placeholder: "What's the post about? Your vibe, the platform, and any hashtag style preference...",
    gradient: "from-orange-500/20 to-yellow-500/20",
  },
  {
    id: "strategy",
    icon: Zap,
    label: "Growth Strategy",
    description: "Get a personalized 30-day growth plan tailored to your artist profile.",
    placeholder: "Tell me your current situation: followers, monthly listeners, goals, and budget...",
    badge: "PRO",
    gradient: "from-yellow-500/20 to-primary/20",
  },
];

// Deterministic mock outputs keyed by tool
const mockOutputs: Record<string, string> = {
  bio: `Born in the crossroads of soul and innovation, [Artist Name] is redefining what it means to be an independent artist in the 21st century. With a sound that weaves together hypnotic rhythms, heartfelt lyricism, and cinematic production, they have built a reputation as a must-see live act across three continents.

From intimate underground venues to sold-out festival stages, [Artist Name]'s performances are immersive journeys that leave audiences breathless. Their debut EP garnered over 2 million streams, catching the attention of industry heavyweights and landing placements on curated playlists across Spotify and Apple Music.

Available for bookings worldwide. Let's build something unforgettable together.`,

  lyrics: `[Verse 1]
Street lights painting gold on the rain-slick road
Your voice still echoes through this static I can't decode
I keep the windows down to breathe away the weight
But every mile I drive just feels like running late

[Pre-Chorus]
And maybe that's the cost of chasing something real
The hollow kind of ache that only distance heals

[Chorus]
Late night drives, just the engine and my mind
Tracing back the outline of a life I left behind
Every city looks the same when you're searching for a sign
So I'll keep moving forward through this late-night drive

[Bridge]
Some things you can't outrun, you just learn to ride alongside
Till the silence starts to feel like an old familiar guide`,

  pitch: `Subject: Performance Inquiry – [Artist Name] | [Date/Event]

Dear [Venue Name] Team,

My name is [Artist Name], a [genre] artist based in [City] with a growing international fanbase of 45,000+ followers across platforms. I'm reaching out because your venue's reputation for supporting breakthrough talent aligns perfectly with the experience I deliver on stage.

My live set blends [describe your set] with high-energy crowd engagement, running approximately [X] minutes. I've recently performed at [example venues/festivals] to audiences of [X] people, consistently achieving strong merchandise and ticket revenue.

I believe my sound would be an excellent fit for [specific event type], and I'm prepared to provide EPK, press materials, and rider requirements on request.

Would you be available for a brief call this week?

Warm regards,
[Artist Name]`,

  press: `FOR IMMEDIATE RELEASE

[ARTIST NAME] ANNOUNCES HIGHLY ANTICIPATED NEW SINGLE "[TITLE]"
The boundary-pushing [genre] artist returns with their most personal work yet

[CITY, DATE] — Independent artist [Name] today announces the release of their latest single "[Title]", available everywhere on [Release Date]. The track marks a bold new chapter in the artist's evolving sonic universe, blending [production style] with deeply personal storytelling.

"[Quote from artist about the track]" says [Name].

"[Title]" was produced by [Producer Name] and recorded at [Studio] in [City]. The accompanying visuals, directed by [Director], will premiere on [Platform] on [Date].

[Artist Name] will support the release with a run of headline dates across [regions], with tickets available now at [website].

For press inquiries, interviews, and media assets, contact: press@example.com

###`,

  caption: `🎵 Some nights, the music writes itself.

This one started at 2am and didn't stop until sunrise. New single dropping [DATE] — and trust me, you're not ready for what we've been cooking 🔥

Pre-save link in bio. Save your spot. ⚡

#NewMusic #IndependentArtist #StageLink #ComingSoon #MusicRelease`,

  strategy: `**Your 30-Day Growth Blueprint**

**Week 1 — Foundation**
• Audit and optimize all social profiles (bio, links, header art)
• Post 3x behind-the-scenes clips from studio sessions (Reels/TikTok)
• Identify 5 artists in your niche and engage authentically on their posts

**Week 2 — Content Blitz**
• Release one short-form video per day (30-60 seconds)
• Launch a "studio diary" series to build anticipation for upcoming release
• Submit to 20 independent playlist curators via SubmitHub

**Week 3 — Collaboration**
• Reach out to 3 producers/artists for collaboration opportunities
• Host a live session on Instagram or TikTok (aim for 30+ minutes)
• Guest on one podcast or YouTube channel in your genre niche

**Week 4 — Monetization & Booking**
• Update your StageLink profile with current booking rates
• Apply to 5 open calls for events, festivals, or brand partnerships
• Set up a Patreon or Bandcamp for direct fan support

**Key Metric to Track:** Follower-to-engagement ratio (target >4%)`,
};

export default function AIStudioPage() {
  const [activeTool, setActiveTool] = useState<Tool>(tools[0]);
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setOutput("");
    // Simulate streaming effect
    await new Promise((r) => setTimeout(r, 1200));
    const result = mockOutputs[activeTool.id] || "Output will appear here once connected to the AI backend.";
    setIsGenerating(false);
    // Typewriter-like reveal
    let i = 0;
    const step = () => {
      i += 8;
      setOutput(result.slice(0, i));
      if (i < result.length) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <PageTransition>
      {/* Header */}
      <div className="relative overflow-hidden bg-black border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-fuchsia-600/10 to-background pointer-events-none" />
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-primary/20 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" /> AI-Powered Creative Studio
            </div>
            <h1 className="text-4xl md:text-6xl font-heading font-black text-white tracking-tight mb-4">
              Your Creative <br />
              <span className="text-gradient">AI Partner</span>
            </h1>
            <p className="text-xl text-white/60 leading-relaxed">
              Supercharge your music career with AI tools built specifically for independent artists. Write better bios, craft powerful pitches, and grow your fanbase faster.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Tool Sidebar */}
          <div className="lg:w-72 flex-shrink-0">
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-4 px-1">Tools</p>
            <div className="space-y-1.5">
              {tools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => { setActiveTool(tool); setOutput(""); setPrompt(""); }}
                  className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTool.id === tool.id
                      ? "bg-primary/20 border border-primary/30 text-white shadow-lg shadow-primary/10"
                      : "hover:bg-white/5 text-muted-foreground hover:text-white border border-transparent"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activeTool.id === tool.id ? "bg-primary/30 text-primary" : "bg-white/5"}`}>
                    <tool.icon className="w-4 h-4" />
                  </div>
                  <span className="font-medium flex-1 text-sm">{tool.label}</span>
                  {tool.badge && (
                    <Badge className="text-[9px] bg-primary/20 text-primary border-primary/20 px-1.5 py-0">{tool.badge}</Badge>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Main Area */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTool.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* Tool Header */}
                <div className={`relative overflow-hidden rounded-2xl p-6 border border-white/10 bg-gradient-to-br ${activeTool.gradient}`}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                      <activeTool.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-heading font-bold text-white mb-1">{activeTool.label}</h2>
                      <p className="text-white/60">{activeTool.description}</p>
                    </div>
                  </div>
                </div>

                {/* Input */}
                <div className="glass rounded-2xl p-6 space-y-4">
                  <label className="text-sm font-medium text-white/80">Your Prompt</label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={activeTool.placeholder}
                    rows={5}
                    className="w-full bg-black/20 rounded-xl border border-white/10 p-4 text-white placeholder:text-white/30 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm leading-relaxed"
                  />
                  <div className="flex gap-3">
                    <Button
                      className="h-11 px-6 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 font-bold"
                      onClick={handleGenerate}
                      disabled={!prompt.trim() || isGenerating}
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4 mr-2" />
                          Generate
                        </>
                      )}
                    </Button>
                    {output && (
                      <Button variant="outline" className="border-white/10 hover:bg-white/10" onClick={handleCopy}>
                        <Copy className="w-4 h-4 mr-2" />
                        {copied ? "Copied!" : "Copy"}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Output */}
                <AnimatePresence>
                  {(isGenerating || output) && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="glass rounded-2xl p-6"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-primary">AI Output</span>
                        {isGenerating && (
                          <div className="ml-2 flex gap-1">
                            {[0, 1, 2].map((i) => (
                              <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                            ))}
                          </div>
                        )}
                      </div>
                      {isGenerating ? (
                        <div className="space-y-2">
                          {[80, 65, 90, 55, 70].map((w, i) => (
                            <div key={i} className={`h-4 bg-white/10 rounded animate-pulse`} style={{ width: `${w}%` }} />
                          ))}
                        </div>
                      ) : (
                        <pre className="text-white/85 text-sm leading-relaxed whitespace-pre-wrap font-sans">{output}</pre>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Empty state */}
                {!output && !isGenerating && (
                  <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl">
                    <Sparkles className="w-10 h-10 text-white/10 mx-auto mb-4" />
                    <p className="text-muted-foreground">Enter your prompt above and click Generate to see the magic.</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Feature teaser */}
        <div className="mt-16 grid md:grid-cols-3 gap-4">
          {[
            { icon: Music2, title: "AI Mastering", desc: "Upload your track and get a professionally mastered version in minutes.", soon: true },
            { icon: Image, title: "Cover Art Generator", desc: "Generate stunning album artwork that matches your music's mood.", soon: true },
            { icon: Mic, title: "Vocal Coach", desc: "AI-powered feedback on your recorded vocals to help you improve.", soon: true },
          ].map((f) => (
            <div key={f.title} className="glass rounded-2xl p-6 opacity-60 relative overflow-hidden group">
              <div className="absolute top-3 right-3">
                <Badge variant="outline" className="text-[9px] border-white/20 bg-white/5 text-white/50 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> Coming Soon
                </Badge>
              </div>
              <f.icon className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-bold text-white mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
