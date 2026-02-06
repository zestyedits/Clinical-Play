import { Link, useParams } from "wouter";
import { GlassCard } from "@/components/ui/glass-card";
import { Mic, Video, MonitorUp, Settings, ChevronRight, PanelRightClose, Palette, Shapes, Brain, LogOut } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function Playroom() {
  const { id } = useParams();
  const [toolsOpen, setToolsOpen] = useState(true);
  const [activeTool, setActiveTool] = useState("sandtray");

  return (
    <div className="h-screen w-full bg-neutral-100 overflow-hidden flex flex-col">
      {/* Playroom Header */}
      <header className="h-16 bg-white/80 backdrop-blur-md border-b border-border/50 flex items-center justify-between px-4 z-20 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <button className="p-2 hover:bg-secondary rounded-full transition-colors cursor-pointer">
              <ChevronRight className="rotate-180 text-muted-foreground" size={20} />
            </button>
          </Link>
          <div>
            <h1 className="font-serif text-lg text-primary leading-tight">Session Room {id}</h1>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-muted-foreground">Connected</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1 bg-secondary/30 p-1 rounded-full border border-border/50">
            <button className="p-2.5 rounded-full bg-white shadow-sm text-primary hover:text-accent transition-colors cursor-pointer"><Mic size={18} /></button>
            <button className="p-2.5 rounded-full hover:bg-white/50 text-muted-foreground hover:text-primary transition-colors cursor-pointer"><Video size={18} /></button>
            <button className="p-2.5 rounded-full hover:bg-white/50 text-muted-foreground hover:text-primary transition-colors cursor-pointer"><MonitorUp size={18} /></button>
          </div>
          <div className="w-px h-8 bg-border/50 mx-2 hidden md:block" />
          <button 
            onClick={() => setToolsOpen(!toolsOpen)}
            className={cn("p-2 rounded-lg transition-colors cursor-pointer", toolsOpen ? "bg-primary text-white" : "text-muted-foreground hover:bg-secondary")}
          >
            <PanelRightClose size={20} />
          </button>
          <Link href="/dashboard">
             <button className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors ml-2 cursor-pointer">
               <LogOut size={20} />
             </button>
          </Link>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Canvas Area */}
        <div className="flex-1 bg-linear-to-br from-neutral-100 to-neutral-200 relative p-8 flex items-center justify-center">
           {/* Mock Game Canvas */}
           <motion.div 
             className="w-full h-full max-w-5xl aspect-video bg-white rounded-3xl shadow-xl shadow-neutral-200/50 overflow-hidden relative border-8 border-white"
             initial={{ scale: 0.95, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             transition={{ duration: 0.5 }}
           >
             <div className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-primary border border-border uppercase tracking-widest">
               {activeTool === 'sandtray' ? 'Digital Sandtray' : activeTool === 'cbt' ? 'Thought Bridge' : 'Canvas'}
             </div>
             
             {activeTool === 'sandtray' && (
               <img src="/images/game-sandtray.jpg" className="w-full h-full object-cover opacity-80" alt="Sandtray" />
             )}
             {activeTool === 'cbt' && (
               <img src="/images/game-cbt.jpg" className="w-full h-full object-cover opacity-80" alt="CBT" />
             )}
             {activeTool === 'draw' && (
               <div className="w-full h-full bg-white flex items-center justify-center text-muted-foreground/30 font-serif text-4xl">
                 Shared Whiteboard Canvas
               </div>
             )}

             {/* Mock Cursor */}
             <motion.div 
               className="absolute z-20 top-1/2 left-1/2"
               animate={{ x: [0, 100, 50, 0], y: [0, -50, 50, 0] }}
               transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
             >
                <div className="flex flex-col items-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="drop-shadow-lg">
                    <path d="M3 3L10.07 19.97L12.58 12.58L19.97 10.07L3 3Z" fill="#D4AF37" stroke="white" strokeWidth="2"/>
                  </svg>
                  <span className="bg-accent text-white text-[10px] px-2 py-0.5 rounded-full shadow-sm mt-1">Client</span>
                </div>
             </motion.div>
           </motion.div>
        </div>

        {/* Tools Sidebar */}
        <AnimatePresence>
          {toolsOpen && (
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-80 bg-white border-l border-border shadow-2xl z-30 flex flex-col"
            >
              <div className="p-6 border-b border-border/50">
                <h2 className="font-serif text-primary text-lg">Toolkit</h2>
                <p className="text-xs text-muted-foreground mt-1">Select an activity to launch</p>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {[
                  { id: 'sandtray', label: 'Sandtray', icon: Palette, desc: 'World building' },
                  { id: 'cbt', label: 'Thought Bridge', icon: Brain, desc: 'CBT Exercises' },
                  { id: 'draw', label: 'Whiteboard', icon: Shapes, desc: 'Free draw' },
                ].map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => setActiveTool(tool.id)}
                    className={cn(
                      "w-full p-4 rounded-xl border text-left transition-all duration-200 flex items-start gap-4 hover:shadow-md cursor-pointer",
                      activeTool === tool.id 
                        ? "bg-primary text-primary-foreground border-primary" 
                        : "bg-white border-border hover:border-accent/50"
                    )}
                  >
                    <div className={cn("p-2 rounded-lg", activeTool === tool.id ? "bg-white/10" : "bg-secondary")}>
                      <tool.icon size={20} />
                    </div>
                    <div>
                      <div className="font-medium">{tool.label}</div>
                      <div className={cn("text-xs mt-0.5", activeTool === tool.id ? "text-primary-foreground/70" : "text-muted-foreground")}>
                        {tool.desc}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="p-4 border-t border-border/50 bg-secondary/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white border border-border overflow-hidden">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Client" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-primary">Alex M.</div>
                    <div className="text-xs text-muted-foreground">Client • Online</div>
                  </div>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
