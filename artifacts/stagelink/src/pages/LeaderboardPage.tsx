import { PageTransition } from "@/components/layout/PageTransition";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Trophy, Zap, Crown, Award, Star } from "lucide-react";
import { useGetLeaderboard } from "@workspace/api-client-react";

const rankColors: Record<number, string> = {
  1: "text-yellow-400",
  2: "text-gray-300",
  3: "text-amber-600",
};

const rankBg: Record<number, string> = {
  1: "bg-yellow-500/10 border-yellow-500/20",
  2: "bg-gray-400/10 border-gray-400/20",
  3: "bg-amber-600/10 border-amber-600/20",
};

const rankIcon = (rank: number) => {
  if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400 fill-yellow-400" />;
  if (rank === 2) return <Trophy className="w-5 h-5 text-gray-300" />;
  if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />;
  return <span className="text-muted-foreground font-mono font-bold text-sm w-5 text-center">{rank}</span>;
};

export default function LeaderboardPage() {
  const { data: entries, isLoading } = useGetLeaderboard();

  const top3 = entries?.slice(0, 3) || [];
  const rest = entries?.slice(3) || [];

  return (
    <PageTransition className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Header */}
      <div className="relative rounded-3xl overflow-hidden bg-black p-8 mb-12 border border-white/10 shadow-2xl shadow-primary/20">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-primary/20 to-background pointer-events-none" />
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        <div className="relative z-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-yellow-500/20 border border-yellow-500/20 mb-4">
            <Trophy className="w-8 h-8 text-yellow-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-black text-white mb-3">
            Global Leaderboard
          </h1>
          <p className="text-xl text-white/60 max-w-xl mx-auto">
            The most active, booked, and celebrated artists on StageLink. Earn XP, climb the ranks, and get discovered.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          <div className="grid grid-cols-3 gap-4 mb-10">
            {[1, 2, 3].map((i) => <div key={i} className="h-52 bg-white/5 rounded-2xl" />)}
          </div>
          {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-16 bg-white/5 rounded-xl" />)}
        </div>
      ) : (
        <>
          {/* Top 3 Podium */}
          {top3.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-12">
              {/* Reorder: 2nd, 1st, 3rd visually */}
              {[top3[1], top3[0], top3[2]].map((entry, visualIdx) => {
                if (!entry) return <div key={visualIdx} />;
                const isFirst = entry.rank === 1;
                return (
                  <motion.div
                    key={entry.userId}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: visualIdx * 0.1 }}
                    className={`relative flex flex-col items-center gap-3 p-6 rounded-2xl border text-center ${rankBg[entry.rank] || "bg-white/5 border-white/10"} ${isFirst ? "ring-2 ring-yellow-500/30 shadow-xl shadow-yellow-500/10 -mt-6" : ""}`}
                  >
                    {isFirst && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <Crown className="w-8 h-8 text-yellow-400 fill-yellow-400/30" />
                      </div>
                    )}
                    <div className="relative">
                      <Avatar className={`border-2 ${isFirst ? "w-20 h-20 border-yellow-500/50" : "w-16 h-16 border-white/20"}`}>
                        <AvatarImage src={entry.avatarUrl || undefined} />
                        <AvatarFallback className="bg-primary/20 text-primary font-bold text-xl">
                          {entry.displayName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border-2 border-background ${entry.rank === 1 ? "bg-yellow-500 text-black" : entry.rank === 2 ? "bg-gray-400 text-black" : "bg-amber-700 text-white"}`}>
                        {entry.rank}
                      </div>
                    </div>
                    <div>
                      <h3 className={`font-heading font-bold ${isFirst ? "text-lg" : "text-base"} text-white`}>{entry.displayName}</h3>
                      <p className="text-xs text-muted-foreground capitalize">{entry.role}</p>
                    </div>
                    <div className="flex items-center gap-1 bg-primary/10 rounded-full px-3 py-1">
                      <Zap className="w-3.5 h-3.5 text-primary fill-primary" />
                      <span className="text-sm font-bold text-primary">{entry.xp.toLocaleString()} XP</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Level {entry.level}</div>
                    {entry.badges && entry.badges.length > 0 && (
                      <div className="flex gap-1 flex-wrap justify-center">
                        {entry.badges.slice(0, 2).map((b) => (
                          <Badge key={b} variant="outline" className="text-[9px] border-white/10 bg-white/5 py-0 px-2">{b}</Badge>
                        ))}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Rest of leaderboard */}
          <div className="space-y-2">
            {rest.map((entry, i) => (
              <motion.div
                key={entry.userId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-4 p-4 glass rounded-xl hover:bg-white/10 transition-colors"
              >
                <div className="w-8 flex items-center justify-center flex-shrink-0">
                  {rankIcon(entry.rank)}
                </div>

                <Avatar className="w-12 h-12 border border-white/10 flex-shrink-0">
                  <AvatarImage src={entry.avatarUrl || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {entry.displayName.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white truncate">{entry.displayName}</span>
                    <Badge variant="secondary" className="text-[9px] uppercase tracking-wider bg-white/5 text-white/50 hidden sm:inline-flex">
                      {entry.role}
                    </Badge>
                  </div>
                  {entry.badges && entry.badges.length > 0 && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {entry.badges.slice(0, 3).map((b) => (
                        <Badge key={b} variant="outline" className="text-[9px] border-white/10 bg-white/5 py-0 px-1.5">{b}</Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="flex items-center gap-1 justify-end">
                    <Zap className="w-3.5 h-3.5 text-primary" />
                    <span className="font-bold text-white text-sm">{entry.xp.toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">Lv.{entry.level}</div>
                </div>
              </motion.div>
            ))}

            {(!entries || entries.length === 0) && (
              <div className="text-center py-16 glass rounded-2xl">
                <Trophy className="w-12 h-12 text-white/10 mx-auto mb-4" />
                <p className="text-white font-bold text-lg">The leaderboard is empty</p>
                <p className="text-muted-foreground mt-2">Be the first to earn XP and claim the top spot!</p>
              </div>
            )}
          </div>
        </>
      )}
    </PageTransition>
  );
}
