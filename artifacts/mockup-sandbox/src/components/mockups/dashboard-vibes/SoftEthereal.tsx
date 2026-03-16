import React, { useState } from "react";
import { 
  Users, Palette, Flame, Settings, HelpCircle, 
  ChevronRight, Star, Plus, Copy, Check, Play, Square,
} from "lucide-react";

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
    <div className="min-h-screen bg-[#FBF7F2] font-sans text-[#5C4E42] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#E8C9A8]/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#D4A57A]/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 p-8 flex justify-center">
        <div className="w-full max-w-6xl mx-auto flex flex-col gap-10">
          
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-2">
            <div className="space-y-2">
              <h1 className="font-['Playfair_Display'] text-4xl md:text-5xl font-normal text-[#3A2E24] tracking-tight">
                Welcome, Dr. Elara
              </h1>
              <div className="flex items-center gap-3">
                <span className="text-[#9A8A78] font-light text-lg">Your clinical workspace</span>
                <span className="inline-flex items-center bg-[#C9956B]/10 border border-[#C9956B]/20 text-[#B07D4F] font-medium px-3 py-0.5 rounded-full text-xs">
                  Pro Plan
                </span>
              </div>
            </div>
            <button className="bg-gradient-to-r from-[#C9956B] to-[#B8845E] hover:from-[#D4A57A] hover:to-[#C9956B] text-white rounded-full px-7 py-3.5 shadow-lg shadow-[#C9956B]/25 transition-all duration-300 font-medium flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4" />
              Start New Session
            </button>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            <div className="lg:col-span-2 space-y-10">
              
              <section className="space-y-5">
                <div className="flex items-center gap-3 px-1">
                  <div className="p-2 rounded-xl bg-[#C9956B]/10 text-[#C9956B]">
                    <Users className="w-4 h-4" />
                  </div>
                  <h2 className="text-xl font-['Playfair_Display'] text-[#3A2E24] tracking-wide">Active Sessions</h2>
                  <span className="ml-1 bg-[#C9956B]/12 text-[#B07D4F] text-xs px-2.5 py-0.5 rounded-full font-medium">1</span>
                </div>

                <div className="grid gap-4">
                  {ACTIVE_SESSIONS.map((session) => (
                    <div key={session.id} className="group bg-white/80 backdrop-blur-sm border border-[#E8D9C8] rounded-2xl p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-sm shadow-[#D4C4B0]/20 transition-all duration-300 hover:shadow-md hover:shadow-[#D4C4B0]/30 hover:border-[#D4C4B0]">
                      
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F5EDE3] to-[#EEDDCC] flex items-center justify-center text-2xl border border-[#E8D9C8]/60">
                          {TOOLS_LIBRARY.find(t => t.name === session.type)?.icon || "✨"}
                        </div>
                        <div>
                          <h3 className="font-['Playfair_Display'] text-lg text-[#3A2E24] mb-1">{session.title}</h3>
                          <div className="flex items-center gap-3 text-sm text-[#9A8A78]">
                            <span>{session.client}</span>
                            <span className="w-1 h-1 rounded-full bg-[#D4C4B0]" />
                            <span>{session.time}</span>
                            <span className="w-1 h-1 rounded-full bg-[#D4C4B0]" />
                            <span className="text-[#B07D4F]">{session.type}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 w-full md:w-auto">
                        <div 
                          className="flex items-center gap-2 px-3 py-2 bg-[#F5EDE3] rounded-xl border border-[#E8D9C8] cursor-pointer hover:bg-[#EEDDCC] transition-colors"
                          onClick={() => handleCopy(session.code)}
                        >
                          <span className="font-mono text-sm text-[#7A6B5C]">{session.code}</span>
                          {copied === session.code ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-[#B0A090]" />}
                        </div>
                        
                        <button className="flex-1 md:flex-none rounded-xl bg-[#C9956B] hover:bg-[#B8845E] text-white px-5 py-2.5 text-sm font-medium transition-colors flex items-center gap-2 shadow-sm shadow-[#C9956B]/20">
                          <Play className="w-4 h-4" />
                          Enter
                        </button>
                        
                        <button className="rounded-xl p-2.5 text-[#C4B4A0] hover:text-red-400 hover:bg-red-50 transition-colors">
                          <Square className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="space-y-5">
                <div className="flex items-center gap-3 px-1">
                  <div className="p-2 rounded-xl bg-[#C9956B]/10 text-[#C9956B]">
                    <Palette className="w-4 h-4" />
                  </div>
                  <h2 className="text-xl font-['Playfair_Display'] text-[#3A2E24] tracking-wide">All Tools</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {TOOLS_LIBRARY.map((tool) => (
                    <div 
                      key={tool.id} 
                      className="group relative bg-white/70 backdrop-blur-sm border border-[#E8D9C8]/80 rounded-2xl p-6 transition-all duration-400 hover:bg-white hover:border-[#D4C4B0] hover:shadow-md hover:shadow-[#D4C4B0]/20 hover:-translate-y-0.5"
                    >
                      <button 
                        onClick={(e) => toggleFavorite(tool.id, e)}
                        className="absolute top-5 right-5 text-[#D4C4B0] hover:text-[#C9956B] transition-colors"
                      >
                        <Star className={`w-4 h-4 ${favorites[tool.id] ? "fill-[#C9956B] text-[#C9956B]" : ""}`} />
                      </button>
                      
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F5EDE3] to-[#EEDDCC] border border-[#E8D9C8]/60 flex items-center justify-center text-2xl mb-4 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3 origin-bottom-left">
                        {tool.icon}
                      </div>
                      
                      <h3 className="font-['Playfair_Display'] text-lg text-[#3A2E24] mb-1.5">{tool.name}</h3>
                      <p className="text-[#9A8A78] text-sm leading-relaxed mb-5 line-clamp-2">
                        {tool.desc}
                      </p>
                      
                      <div className="flex items-center text-sm font-medium text-[#C9956B]/70 group-hover:text-[#C9956B] transition-colors">
                        Launch <ChevronRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="space-y-5">
              
              <div className="bg-white/80 backdrop-blur-sm border border-[#E8D9C8] rounded-2xl p-6 flex flex-col items-center text-center shadow-sm shadow-[#D4C4B0]/15 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#F5EDE3] to-transparent" />
                
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#C9956B] to-[#A07850] flex items-center justify-center text-white font-['Playfair_Display'] text-2xl shadow-lg shadow-[#C9956B]/25 mb-4 relative z-10">
                  EV
                </div>
                
                <h3 className="font-['Playfair_Display'] text-xl text-[#3A2E24] mb-1 relative z-10">Dr. Elara Vance</h3>
                <p className="text-[#9A8A78] text-sm mb-3 relative z-10">elara.vance@example.com</p>
                
                <span className="bg-[#C9956B]/10 text-[#B07D4F] text-xs font-medium px-3 py-1 rounded-full mb-5">
                  Clinical Pro
                </span>
                
                <div className="w-full grid grid-cols-2 gap-3 relative z-10">
                  <button className="rounded-xl border border-[#E8D9C8] text-[#7A6B5C] hover:border-[#C9956B]/30 hover:text-[#C9956B] py-2.5 text-sm transition-colors flex items-center justify-center gap-2 bg-white/50">
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                  <button className="rounded-xl border border-[#E8D9C8] text-[#7A6B5C] hover:border-[#C9956B]/30 hover:text-[#C9956B] py-2.5 text-sm transition-colors flex items-center justify-center gap-2 bg-white/50">
                    <HelpCircle className="w-4 h-4" />
                    Support
                  </button>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#F5EDE3] to-[#EEDDCC]/60 border border-[#D4C4B0]/40 rounded-2xl p-6 shadow-sm shadow-[#D4C4B0]/15">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-[#C9956B]/15 text-[#C9956B]">
                    <Flame className="w-5 h-5" />
                  </div>
                  <h3 className="font-['Playfair_Display'] text-lg text-[#3A2E24]">Founding Member</h3>
                </div>
                
                <div className="mb-5">
                  <div className="text-2xl text-[#3A2E24] mb-1 font-['Playfair_Display']">$99 <span className="text-sm text-[#9A8A78] font-sans">/ lifetime</span></div>
                  <p className="text-sm text-[#9A8A78] leading-relaxed">Lock in lifetime access before we launch to the public.</p>
                </div>
                
                <div className="space-y-2 mb-5">
                  <div className="flex justify-between text-xs text-[#9A8A78]">
                    <span>82% Claimed</span>
                    <span className="text-[#B07D4F] font-medium">18 spots left</span>
                  </div>
                  <div className="w-full h-2 bg-[#E8D9C8]/60 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#C9956B] to-[#D4A57A] rounded-full" style={{ width: "82%" }} />
                  </div>
                </div>
                
                <button className="w-full bg-gradient-to-r from-[#C9956B] to-[#B8845E] hover:from-[#D4A57A] hover:to-[#C9956B] text-white rounded-xl py-3 font-medium shadow-md shadow-[#C9956B]/20 transition-all text-sm">
                  Claim Founding Spot
                </button>
              </div>

              <div className="bg-white/60 backdrop-blur-sm border border-[#E8D9C8]/80 rounded-2xl p-6 shadow-sm shadow-[#D4C4B0]/10">
                <h3 className="font-['Playfair_Display'] text-lg text-[#3A2E24] mb-5">Workspace Activity</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#F5EDE3]/60 rounded-xl p-4 border border-[#E8D9C8]/50">
                    <div className="text-[#B0A090] text-[10px] mb-1 font-medium tracking-widest uppercase">Total Sessions</div>
                    <div className="text-3xl font-['Playfair_Display'] text-[#3A2E24]">124</div>
                  </div>
                  <div className="bg-[#C9956B]/[0.06] rounded-xl p-4 border border-[#C9956B]/10">
                    <div className="text-[#C9956B]/70 text-[10px] mb-1 font-medium tracking-widest uppercase">Active Now</div>
                    <div className="text-3xl font-['Playfair_Display'] text-[#C9956B]">1</div>
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
