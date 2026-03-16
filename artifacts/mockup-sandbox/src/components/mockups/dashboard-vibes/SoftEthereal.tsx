import React, { useState } from "react";
import { 
  Users, Palette, Flame, Settings, HelpCircle, 
  ChevronRight, Star, Plus, Copy, Check, Play, Square,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

const ACTIVE_SESSIONS = [
  { id: "s1", title: "Anxiety Mapping", client: "Sarah J.", time: "10:00 AM", code: "AX-849", type: "DBT House" },
];

const TOOLS_LIBRARY = [
  { id: "t1", name: "DBT House", desc: "Build emotional safety and structure", icon: "🏡" },
  { id: "t2", name: "Thought Court", desc: "Examine cognitive distortions", icon: "⚖️" },
  { id: "t3", name: "Values Compass", desc: "Align actions with core values", icon: "🧭" },
  { id: "t4", name: "Inner Council", desc: "IFS parts mapping and dialogue", icon: "⚔️" },
  { id: "t5", name: "Motivation Garden", desc: "Cultivate change and growth", icon: "🌱" },
  { id: "t6", name: "Grounding Grove", desc: "Somatic regulation exercises", icon: "🌳" },
  { id: "t7", name: "Miracle Bridge", desc: "Solution-focused visualization", icon: "🌉" },
  { id: "t8", name: "Narrative Quest", desc: "Externalize and rewrite stories", icon: "📖" },
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
    <div className="min-h-screen bg-[#1E1A17] font-sans text-[#E8DDD0] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#2A2118]/80 via-[#1E1A17] to-[#1A1520]/60 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#C9956B]/[0.06] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#8B6D5C]/[0.05] rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 p-8 flex justify-center">
        <div className="w-full max-w-6xl mx-auto flex flex-col gap-10">
          
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-2">
            <div className="space-y-2">
              <h1 className="font-['Playfair_Display'] text-4xl md:text-5xl font-light text-[#F0E6D8] tracking-tight">
                Welcome, Dr. Elara
              </h1>
              <div className="flex items-center gap-3">
                <span className="text-[#A09080] font-light text-lg">Your clinical workspace</span>
                <span className="inline-flex items-center bg-[#C9956B]/10 border border-[#C9956B]/20 text-[#C9956B] font-normal px-3 py-0.5 rounded-full text-xs">
                  Pro Plan
                </span>
              </div>
            </div>
            <button className="bg-gradient-to-r from-[#C9956B] to-[#B8845E] hover:from-[#D4A57A] hover:to-[#C9956B] text-[#1E1A17] rounded-full px-7 py-3.5 shadow-lg shadow-[#C9956B]/20 transition-all duration-300 font-medium flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4" />
              Start New Session
            </button>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            <div className="lg:col-span-2 space-y-10">
              
              <section className="space-y-5">
                <div className="flex items-center gap-3 px-1">
                  <div className="p-2 rounded-xl bg-[#C9956B]/10 border border-[#C9956B]/15 text-[#C9956B]">
                    <Users className="w-4 h-4" />
                  </div>
                  <h2 className="text-xl font-['Playfair_Display'] text-[#E8DDD0] font-light tracking-wide">Active Sessions</h2>
                  <span className="ml-1 bg-[#C9956B]/15 text-[#C9956B] text-xs px-2.5 py-0.5 rounded-full font-medium">1</span>
                </div>

                <div className="grid gap-4">
                  {ACTIVE_SESSIONS.map((session) => (
                    <div key={session.id} className="group bg-[#252019]/80 backdrop-blur-md border border-[#3A3028]/60 rounded-2xl p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-xl shadow-black/10 transition-all duration-300 hover:border-[#C9956B]/20 hover:shadow-[#C9956B]/5">
                      
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#C9956B]/15 to-[#8B6D5C]/10 flex items-center justify-center text-2xl border border-[#C9956B]/10">
                          {TOOLS_LIBRARY.find(t => t.name === session.type)?.icon || "✨"}
                        </div>
                        <div>
                          <h3 className="font-['Playfair_Display'] text-lg text-[#F0E6D8] mb-1">{session.title}</h3>
                          <div className="flex items-center gap-3 text-sm text-[#8A7A6A]">
                            <span>{session.client}</span>
                            <span className="w-1 h-1 rounded-full bg-[#4A3F34]" />
                            <span>{session.time}</span>
                            <span className="w-1 h-1 rounded-full bg-[#4A3F34]" />
                            <span className="text-[#C9956B]/70">{session.type}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 w-full md:w-auto">
                        <div 
                          className="flex items-center gap-2 px-3 py-2 bg-[#1E1A17]/60 rounded-xl border border-[#3A3028] cursor-pointer hover:border-[#C9956B]/20 transition-colors"
                          onClick={() => handleCopy(session.code)}
                        >
                          <span className="font-mono text-sm text-[#A09080]">{session.code}</span>
                          {copied === session.code ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[#6A5A4A]" />}
                        </div>
                        
                        <button className="flex-1 md:flex-none rounded-xl bg-[#C9956B]/15 hover:bg-[#C9956B]/25 text-[#C9956B] px-4 py-2.5 text-sm font-medium transition-colors flex items-center gap-2">
                          <Play className="w-4 h-4 opacity-70" />
                          Enter
                        </button>
                        
                        <button className="rounded-xl p-2.5 text-[#6A5A4A] hover:text-red-400/70 hover:bg-red-400/5 transition-colors">
                          <Square className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="space-y-5">
                <div className="flex items-center gap-3 px-1">
                  <div className="p-2 rounded-xl bg-[#C9956B]/10 border border-[#C9956B]/15 text-[#C9956B]">
                    <Palette className="w-4 h-4" />
                  </div>
                  <h2 className="text-xl font-['Playfair_Display'] text-[#E8DDD0] font-light tracking-wide">All Tools</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {TOOLS_LIBRARY.map((tool) => (
                    <div 
                      key={tool.id} 
                      className="group relative bg-[#252019]/60 backdrop-blur-sm border border-[#3A3028]/50 rounded-2xl p-6 transition-all duration-500 hover:border-[#C9956B]/20 hover:bg-[#2A2219]/80 hover:shadow-lg hover:shadow-[#C9956B]/5 hover:-translate-y-0.5"
                    >
                      <button 
                        onClick={(e) => toggleFavorite(tool.id, e)}
                        className="absolute top-5 right-5 text-[#4A3F34] hover:text-[#C9956B] transition-colors"
                      >
                        <Star className={`w-4 h-4 ${favorites[tool.id] ? "fill-[#C9956B] text-[#C9956B]" : ""}`} />
                      </button>
                      
                      <div className="text-3xl mb-4 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3 origin-bottom-left">
                        {tool.icon}
                      </div>
                      
                      <h3 className="font-['Playfair_Display'] text-lg text-[#F0E6D8] mb-1.5">{tool.name}</h3>
                      <p className="text-[#8A7A6A] text-sm leading-relaxed font-light mb-5 line-clamp-2">
                        {tool.desc}
                      </p>
                      
                      <div className="flex items-center text-sm font-medium text-[#C9956B]/60 group-hover:text-[#C9956B] transition-colors">
                        Launch <ChevronRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="space-y-5">
              
              <div className="bg-[#252019]/80 backdrop-blur-md border border-[#3A3028]/60 rounded-2xl p-6 flex flex-col items-center text-center shadow-xl shadow-black/10 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-[#C9956B]/[0.06] to-transparent" />
                
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#C9956B] to-[#8B6D5C] flex items-center justify-center text-white font-['Playfair_Display'] text-2xl shadow-lg shadow-[#C9956B]/20 mb-4 relative z-10 border-2 border-[#C9956B]/30">
                  EV
                </div>
                
                <h3 className="font-['Playfair_Display'] text-xl text-[#F0E6D8] mb-1 relative z-10">Dr. Elara Vance</h3>
                <p className="text-[#8A7A6A] text-sm font-light mb-3 relative z-10">elara.vance@example.com</p>
                
                <span className="bg-[#C9956B]/10 text-[#C9956B] text-xs font-medium px-3 py-1 rounded-full mb-5">
                  Clinical Pro
                </span>
                
                <div className="w-full grid grid-cols-2 gap-3 relative z-10">
                  <button className="rounded-xl border border-[#3A3028] text-[#A09080] hover:border-[#C9956B]/20 hover:text-[#C9956B] py-2.5 text-sm transition-colors flex items-center justify-center gap-2">
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                  <button className="rounded-xl border border-[#3A3028] text-[#A09080] hover:border-[#C9956B]/20 hover:text-[#C9956B] py-2.5 text-sm transition-colors flex items-center justify-center gap-2">
                    <HelpCircle className="w-4 h-4" />
                    Support
                  </button>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#2A2118] to-[#252019] border border-[#C9956B]/15 rounded-2xl p-6 shadow-xl shadow-black/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-[#C9956B]/10 text-[#C9956B]">
                    <Flame className="w-5 h-5" />
                  </div>
                  <h3 className="font-['Playfair_Display'] text-lg text-[#F0E6D8]">Founding Member</h3>
                </div>
                
                <div className="mb-5">
                  <div className="text-2xl font-light text-[#F0E6D8] mb-1">$99 <span className="text-sm text-[#8A7A6A]">/ lifetime</span></div>
                  <p className="text-sm text-[#8A7A6A] font-light leading-relaxed">Lock in lifetime access before we launch to the public.</p>
                </div>
                
                <div className="space-y-2 mb-5">
                  <div className="flex justify-between text-xs text-[#8A7A6A]">
                    <span>82% Claimed</span>
                    <span className="text-[#C9956B]">18 spots left</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#3A3028] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#C9956B] to-[#D4A57A] rounded-full" style={{ width: "82%" }} />
                  </div>
                </div>
                
                <button className="w-full bg-gradient-to-r from-[#C9956B] to-[#B8845E] hover:from-[#D4A57A] hover:to-[#C9956B] text-[#1E1A17] rounded-xl py-3 font-medium shadow-lg shadow-[#C9956B]/15 transition-all text-sm">
                  Claim Founding Spot
                </button>
              </div>

              <div className="bg-[#252019]/60 backdrop-blur-sm border border-[#3A3028]/50 rounded-2xl p-6 shadow-xl shadow-black/10">
                <h3 className="font-['Playfair_Display'] text-lg text-[#E8DDD0] mb-5">Workspace Activity</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#1E1A17]/60 rounded-xl p-4 border border-[#3A3028]/40">
                    <div className="text-[#6A5A4A] text-[10px] mb-1 font-medium tracking-widest uppercase">Total Sessions</div>
                    <div className="text-3xl font-light text-[#E8DDD0] font-['Playfair_Display']">124</div>
                  </div>
                  <div className="bg-[#C9956B]/[0.05] rounded-xl p-4 border border-[#C9956B]/10">
                    <div className="text-[#C9956B]/60 text-[10px] mb-1 font-medium tracking-widest uppercase">Active Now</div>
                    <div className="text-3xl font-light text-[#C9956B] font-['Playfair_Display']">1</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
