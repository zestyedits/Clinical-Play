import React, { useState } from "react";
import { 
  Users, Palette, Flame, Settings, HelpCircle, 
  ChevronRight, Star, Plus, Copy, Check, Play, Square, X,
  Compass, Scale, Home, BookOpen, TreeDeciduous, Sprout, Heart, Leaf
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

// Mock Data
const ACTIVE_SESSIONS = [
  { id: "s1", title: "Anxiety Mapping", client: "Sarah J.", time: "10:00 AM", code: "AX-849", type: "DBT House" },
];

const TOOLS_LIBRARY = [
  { id: "t1", name: "DBT House", desc: "Build emotional safety and structure", icon: "🏡", color: "bg-rose-50/50", border: "border-rose-100/50" },
  { id: "t2", name: "Thought Court", desc: "Examine cognitive distortions", icon: "⚖️", color: "bg-blue-50/50", border: "border-blue-100/50" },
  { id: "t3", name: "Values Compass", desc: "Align actions with core values", icon: "🧭", color: "bg-emerald-50/50", border: "border-emerald-100/50" },
  { id: "t4", name: "Inner Council", desc: "IFS parts mapping and dialogue", icon: "⚔️", color: "bg-amber-50/50", border: "border-amber-100/50" },
  { id: "t5", name: "Motivation Garden", desc: "Cultivate change and growth", icon: "🌱", color: "bg-green-50/50", border: "border-green-100/50" },
  { id: "t6", name: "Grounding Grove", desc: "Somatic regulation exercises", icon: "🌳", color: "bg-teal-50/50", border: "border-teal-100/50" },
  { id: "t7", name: "Miracle Bridge", desc: "Solution-focused visualization", icon: "🌉", color: "bg-indigo-50/50", border: "border-indigo-100/50" },
  { id: "t8", name: "Narrative Quest", desc: "Externalize and rewrite stories", icon: "📖", color: "bg-purple-50/50", border: "border-purple-100/50" },
];

export function SoftEthereal() {
  const [copied, setCopied] = useState("");
  const [favorites, setFavorites] = useState<Record<string, boolean>>({ t1: true, t3: true });

  const handleCopy = (code: string) => {
    setCopied(code);
    setTimeout(() => setCopied(""), 2000);
  };

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/40 via-purple-50/30 to-rose-50/40 font-sans text-slate-600 p-8 flex justify-center">
      {/* Container to simulate iframe viewport limits while allowing content to flow naturally */}
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-10">
        
        {/* Header Area */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-2">
          <div className="space-y-2">
            <h1 className="font-serif text-4xl md:text-5xl font-light text-slate-700 tracking-tight">
              Welcome, Dr. Elara
            </h1>
            <div className="flex items-center gap-3">
              <span className="text-slate-500 font-light text-lg">Your clinical workspace</span>
              <Badge variant="outline" className="bg-white/40 border-purple-200/50 text-purple-600/80 font-normal px-3 py-0.5 rounded-full shadow-sm shadow-purple-900/5">
                Pro Plan
              </Badge>
            </div>
          </div>
          <Button className="bg-purple-200/50 hover:bg-purple-200/70 text-purple-800 border border-purple-300/30 rounded-full px-6 py-6 shadow-sm shadow-purple-900/5 transition-all duration-300 font-medium">
            <Plus className="w-5 h-5 mr-2 text-purple-700/70" />
            Start New Session
          </Button>
        </header>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          
          {/* Left Column (2/3) */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Active Sessions */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 px-1">
                <div className="p-2 rounded-xl bg-white/60 shadow-sm border border-white/80 text-purple-400">
                  <Users className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-serif text-slate-700 font-light tracking-wide">Active Sessions</h2>
                <Badge className="ml-2 bg-purple-100/50 text-purple-600 hover:bg-purple-100/50 border-none rounded-full px-2.5">
                  1
                </Badge>
              </div>

              <div className="grid gap-4">
                {ACTIVE_SESSIONS.length > 0 ? (
                  ACTIVE_SESSIONS.map((session) => (
                    <div key={session.id} className="group relative bg-white/70 backdrop-blur-md border border-white rounded-3xl p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all duration-300 hover:shadow-[0_8px_40px_rgb(0,0,0,0.04)]">
                      
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-50 to-orange-50 flex items-center justify-center text-2xl shadow-sm border border-rose-100/30">
                          {TOOLS_LIBRARY.find(t => t.name === session.type)?.icon || "✨"}
                        </div>
                        <div>
                          <h3 className="font-serif text-xl text-slate-700 mb-1">{session.title}</h3>
                          <div className="flex items-center gap-3 text-sm text-slate-500">
                            <span>{session.client}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span>{session.time}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span className="text-purple-500/80">{session.type}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 w-full md:w-auto">
                        <div 
                          className="flex items-center gap-2 px-3 py-2 bg-slate-50/50 rounded-xl border border-slate-100/50 cursor-pointer hover:bg-white transition-colors"
                          onClick={() => handleCopy(session.code)}
                        >
                          <span className="font-mono text-sm text-slate-600">{session.code}</span>
                          {copied === session.code ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                        </div>
                        
                        <Button className="flex-1 md:flex-none rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 border-none shadow-none transition-colors">
                          <Play className="w-4 h-4 mr-2 opacity-70" />
                          Enter
                        </Button>
                        
                        <Button variant="ghost" size="icon" className="rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50/50">
                          <Square className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white/40 backdrop-blur-sm border border-white/60 rounded-3xl p-10 flex flex-col items-center justify-center text-center shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
                    <span className="text-4xl mb-4">🏖️</span>
                    <h3 className="font-serif text-xl text-slate-700 mb-2">No active sessions</h3>
                    <p className="text-slate-500 mb-6 font-light">Your workspace is quiet right now.</p>
                    <Button variant="outline" className="rounded-full bg-white/50 border-purple-200 text-purple-600 hover:bg-purple-50">
                      Choose a Tool to Begin
                    </Button>
                  </div>
                )}
              </div>
            </section>

            {/* Tool Library */}
            <section className="space-y-6">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white/60 shadow-sm border border-white/80 text-sage-500">
                    <Palette className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-serif text-slate-700 font-light tracking-wide">All Tools</h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {TOOLS_LIBRARY.map((tool) => (
                  <div 
                    key={tool.id} 
                    className={`group relative ${tool.color} backdrop-blur-sm border ${tool.border} rounded-3xl p-6 transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:-translate-y-1`}
                  >
                    <button 
                      onClick={(e) => toggleFavorite(tool.id, e)}
                      className="absolute top-5 right-5 text-slate-300 hover:text-amber-400 transition-colors"
                    >
                      <Star className={`w-5 h-5 ${favorites[tool.id] ? "fill-amber-300 text-amber-300" : ""}`} />
                    </button>
                    
                    <div className="text-4xl mb-4 opacity-90 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3 origin-bottom-left">
                      {tool.icon}
                    </div>
                    
                    <h3 className="font-serif text-xl text-slate-700 mb-2">{tool.name}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed font-light mb-6 line-clamp-2">
                      {tool.desc}
                    </p>
                    
                    <div className="flex items-center text-sm font-medium text-slate-600 opacity-70 group-hover:opacity-100 transition-opacity">
                      Launch <ChevronRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column (1/3) */}
          <div className="space-y-6">
            
            {/* Profile Card */}
            <div className="bg-white/70 backdrop-blur-md border border-white rounded-3xl p-6 flex flex-col items-center text-center shadow-[0_8px_30px_rgb(0,0,0,0.02)] relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-purple-50/80 to-transparent"></div>
              
              <Avatar className="w-24 h-24 border-4 border-white shadow-sm mb-4 relative z-10">
                <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Dr. Elara" />
                <AvatarFallback className="bg-purple-100 text-purple-700 font-serif text-2xl">EL</AvatarFallback>
              </Avatar>
              
              <h3 className="font-serif text-2xl text-slate-700 mb-1 relative z-10">Dr. Elara Vance</h3>
              <p className="text-slate-500 text-sm font-light mb-4 relative z-10">elara.vance@example.com</p>
              
              <Badge variant="secondary" className="bg-sage-100/50 text-sage-700 hover:bg-sage-100/50 border-none rounded-full px-4 mb-6">
                Clinical Pro
              </Badge>
              
              <div className="w-full grid grid-cols-2 gap-3 relative z-10">
                <Button variant="outline" className="rounded-2xl border-purple-100 text-slate-600 hover:bg-purple-50/50">
                  <Settings className="w-4 h-4 mr-2 text-purple-400" />
                  Settings
                </Button>
                <Button variant="outline" className="rounded-2xl border-purple-100 text-slate-600 hover:bg-purple-50/50">
                  <HelpCircle className="w-4 h-4 mr-2 text-purple-400" />
                  Support
                </Button>
              </div>
            </div>

            {/* Founding Member Card */}
            <div className="bg-gradient-to-br from-amber-50/60 to-orange-50/40 backdrop-blur-sm border border-amber-100/50 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-amber-100/50 text-amber-500">
                  <Flame className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg text-amber-900/80">Founding Member</h3>
              </div>
              
              <div className="mb-5">
                <div className="text-2xl font-light text-amber-900 mb-1">$99 <span className="text-sm text-amber-700/60">/ lifetime</span></div>
                <p className="text-sm text-amber-800/70 font-light leading-relaxed">Lock in lifetime access before we launch to the public.</p>
              </div>
              
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-xs text-amber-800/60">
                  <span>82% Claimed</span>
                  <span>18 spots left</span>
                </div>
                <Progress value={82} className="h-1.5 bg-amber-200/30" indicatorClassName="bg-amber-400/80" />
              </div>
              
              <Button className="w-full bg-amber-200/50 hover:bg-amber-200/80 text-amber-800 border border-amber-300/30 rounded-2xl py-5 shadow-none transition-all">
                Claim Founding Spot
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="bg-white/60 backdrop-blur-sm border border-white/80 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
              <h3 className="font-serif text-lg text-slate-700 mb-5">Workspace Activity</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100/50">
                  <div className="text-slate-400 text-xs mb-1 font-medium tracking-wide uppercase">Total Sessions</div>
                  <div className="text-3xl font-light text-slate-700">124</div>
                </div>
                <div className="bg-purple-50/30 rounded-2xl p-4 border border-purple-100/30">
                  <div className="text-purple-400/70 text-xs mb-1 font-medium tracking-wide uppercase">Active Now</div>
                  <div className="text-3xl font-light text-purple-700/80">1</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
