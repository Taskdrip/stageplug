import { useState } from "react";
import { PageTransition } from "@/components/layout/PageTransition";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Clock, Users, ArrowRight, Star } from "lucide-react";
import { useGetCompetitions } from "@workspace/api-client-react";

export default function CompetitionsPage() {
  const { data: competitions, isLoading } = useGetCompetitions();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 animate-pulse space-y-8">
        <div className="h-32 bg-white/5 rounded-3xl" />
        <div className="grid md:grid-cols-2 gap-8">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-white/5 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <PageTransition className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="relative overflow-hidden rounded-3xl bg-black p-8 md:p-12 mb-12 border border-white/10 shadow-2xl shadow-primary/20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-background to-background" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay" />
        
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-black text-white">Talent Arena</h1>
          </div>
          <p className="text-xl text-white/70 mb-8">
            Compete in global challenges, win prizes, and get discovered by top labels and brands.
          </p>
          <div className="flex gap-4">
            <div className="flex flex-col bg-white/5 rounded-xl p-4 border border-white/10 min-w-[120px]">
              <span className="text-sm text-muted-foreground">Active</span>
              <span className="text-2xl font-bold text-white">{competitions?.filter(c => c.status === 'open').length || 0}</span>
            </div>
            <div className="flex flex-col bg-white/5 rounded-xl p-4 border border-white/10 min-w-[120px]">
              <span className="text-sm text-muted-foreground">Prize Pool</span>
              <span className="text-2xl font-bold text-primary">$100k+</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {competitions?.map(comp => {
          const isEndingSoon = new Date(comp.endsAt).getTime() - new Date().getTime() < 86400000 * 3; // 3 days

          return (
            <div key={comp.id} className="group glass-card flex flex-col overflow-hidden">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={comp.coverImageUrl || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070"} 
                  alt={comp.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                
                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge variant="outline" className={`backdrop-blur-md px-2 py-1 ${comp.status === 'open' ? 'bg-green-500/20 text-green-400 border-green-500/20' : 'bg-primary/20 text-primary border-primary/20'} uppercase tracking-wider text-[10px] font-bold`}>
                    {comp.status}
                  </Badge>
                  <Badge variant="outline" className="bg-black/50 text-white border-white/10 backdrop-blur-md">
                    {comp.category}
                  </Badge>
                </div>

                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-primary/30 flex items-center gap-2">
                  <Star className="w-4 h-4 text-primary fill-primary" />
                  <span className="font-bold text-white text-sm">${comp.prizePool.toLocaleString()} Prize</span>
                </div>
              </div>

              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-2xl font-heading font-bold text-white mb-2">{comp.title}</h3>
                <p className="text-white/60 text-sm mb-6 line-clamp-2">{comp.description}</p>
                
                <div className="mt-auto grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-white/5 rounded-lg p-2.5">
                    <Users className="w-4 h-4 text-primary" />
                    <span><strong className="text-white">{comp.entriesCount}</strong> entries</span>
                  </div>
                  <div className={`flex items-center gap-2 text-sm rounded-lg p-2.5 ${isEndingSoon ? 'bg-red-500/10 text-red-400' : 'bg-white/5 text-muted-foreground'}`}>
                    <Clock className="w-4 h-4" />
                    <span>Ends {new Date(comp.endsAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold text-lg group-hover:shadow-[0_0_20px_-5px] group-hover:shadow-primary/50 transition-all">
                  {comp.status === 'open' ? 'Enter Competition' : 'View Leaderboard'}
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </PageTransition>
  );
}
