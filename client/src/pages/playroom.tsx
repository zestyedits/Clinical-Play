import { Link, useParams } from "wouter";
import { GlassCard } from "@/components/ui/glass-card";
import { Mic, Video, MonitorUp, Settings, ChevronRight, PanelRightClose, Palette, Shapes, Brain, LogOut, Lock, Unlock, Users, Eye, EyeOff, RotateCcw, Ghost, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Participant {
  id: string;
  name: string;
  role: 'clinician' | 'client';
  avatar: string;
  status: 'active' | 'idle';
  isAnonymous?: boolean;
}

export default function Playroom() {
  const { id } = useParams();
  const [toolsOpen, setToolsOpen] = useState(true);
  const [activeTool, setActiveTool] = useState("sandtray");
  const [isClinician, setIsClinician] = useState(true); // Toggle for demo
  const [isAnonymousMode, setIsAnonymousMode] = useState(false);
  const [isCanvasLocked, setIsCanvasLocked] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([
    { id: '1', name: 'Dr. Thompson', role: 'clinician', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DrThompson', status: 'active' },
    { id: '2', name: 'Alex M.', role: 'client', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix', status: 'active' },
    { id: '3', name: 'Sarah J.', role: 'client', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', status: 'idle' },
  ]);

  // Simulate real-time sync pulses
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly update status for demo effect
      setParticipants(prev => prev.map(p => ({
        ...p,
        status: Math.random() > 0.7 ? 'idle' : 'active'
      })));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const toggleAnonymity = () => {
    setIsAnonymousMode(!isAnonymousMode);
    // Simulate updating all clients
    setParticipants(prev => prev.map(p => 
      p.role === 'client' ? { ...p, isAnonymous: !isAnonymousMode } : p
    ));
  };

  return (
    <div className="h-screen w-full bg-neutral-100 overflow-hidden flex flex-col font-sans">
      {/* Playroom Header */}
      <header className="h-16 bg-white/80 backdrop-blur-md border-b border-border/50 flex items-center justify-between px-4 z-20 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <button className="p-2 hover:bg-secondary rounded-full transition-colors cursor-pointer">
              <ChevronRight className="rotate-180 text-muted-foreground" size={20} />
            </button>
          </Link>
          <div>
            <h1 className="font-serif text-lg text-primary leading-tight flex items-center gap-2">
              Session Room {id}
              {isCanvasLocked && <Lock size={14} className="text-destructive" />}
            </h1>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-muted-foreground">Sync Active &lt;40ms</span>
            </div>
          </div>
        </div>

        {/* Center Actions */}
        <div className="hidden md:flex items-center gap-1 bg-secondary/30 p-1 rounded-full border border-border/50 absolute left-1/2 -translate-x-1/2">
          <button className="p-2.5 rounded-full bg-white shadow-sm text-primary hover:text-accent transition-colors cursor-pointer"><Mic size={18} /></button>
          <button className="p-2.5 rounded-full hover:bg-white/50 text-muted-foreground hover:text-primary transition-colors cursor-pointer"><Video size={18} /></button>
          <button className="p-2.5 rounded-full hover:bg-white/50 text-muted-foreground hover:text-primary transition-colors cursor-pointer"><MonitorUp size={18} /></button>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile Participant Drawer Trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <button className="md:hidden p-2 text-primary hover:bg-secondary rounded-lg transition-colors relative">
                <Users size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full border border-white" />
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl">
              <SheetHeader className="mb-6">
                <SheetTitle className="font-serif text-2xl text-primary text-left">Session Participants</SheetTitle>
              </SheetHeader>
              <div className="space-y-4">
                 {participants.map(p => (
                   <div key={p.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/30 transition-colors">
                     <div className="relative">
                       <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                         <AvatarImage src={p.isAnonymous ? '' : p.avatar} />
                         <AvatarFallback className={cn("bg-secondary text-primary", p.isAnonymous && "bg-neutral-200")}>
                           {p.isAnonymous ? <Ghost size={20} className="text-muted-foreground" /> : p.name.charAt(0)}
                         </AvatarFallback>
                       </Avatar>
                       {p.status === 'active' && <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />}
                     </div>
                     <div>
                       <div className="font-medium text-primary flex items-center gap-2">
                         {p.isAnonymous ? "Anonymous User" : p.name}
                         {p.role === 'clinician' && <Shield size={14} className="text-accent fill-accent/20" />}
                       </div>
                       <div className="text-xs text-muted-foreground capitalize">{p.role} • {p.status}</div>
                     </div>
                   </div>
                 ))}
              </div>
            </SheetContent>
          </Sheet>

          {/* Clinician Toggle (Demo Only) */}
          <div className="hidden lg:flex items-center gap-2 mr-4 bg-yellow-50 px-2 py-1 rounded border border-yellow-200">
            <Switch checked={isClinician} onCheckedChange={setIsClinician} id="role-mode" />
            <label htmlFor="role-mode" className="text-xs font-medium text-yellow-800 cursor-pointer">Clinician View</label>
          </div>

          <button 
            onClick={() => setToolsOpen(!toolsOpen)}
            className={cn("p-2 rounded-lg transition-colors cursor-pointer hidden md:block", toolsOpen ? "bg-primary text-white" : "text-muted-foreground hover:bg-secondary")}
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
        <div className="flex-1 bg-linear-to-br from-neutral-100 to-neutral-200 relative p-4 md:p-8 flex items-center justify-center">
           {/* Mock Game Canvas */}
           <motion.div 
             className={cn(
               "w-full h-full max-w-5xl aspect-video bg-white rounded-3xl shadow-xl shadow-neutral-200/50 overflow-hidden relative border-8 transition-all duration-300",
               isCanvasLocked ? "border-destructive/20 grayscale-[0.2]" : "border-white"
             )}
             initial={{ scale: 0.95, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             transition={{ duration: 0.5 }}
           >
             {/* Locked Overlay */}
             <AnimatePresence>
               {isCanvasLocked && (
                 <motion.div 
                   initial={{ opacity: 0 }} 
                   animate={{ opacity: 1 }} 
                   exit={{ opacity: 0 }}
                   className="absolute inset-0 z-30 bg-black/10 backdrop-blur-[2px] flex items-center justify-center"
                 >
                   <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-lg flex items-center gap-3 text-destructive font-medium border border-destructive/20">
                     <Lock size={18} />
                     Session Paused by Clinician
                   </div>
                 </motion.div>
               )}
             </AnimatePresence>

             <div className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-primary border border-border uppercase tracking-widest shadow-sm">
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

             {/* Mock Cursors (Multi-User) */}
             {!isCanvasLocked && participants.filter(p => p.status === 'active' && p.id !== '1').map((p, i) => (
               <motion.div 
                 key={p.id}
                 className="absolute z-20"
                 style={{ top: `${40 + i * 10}%`, left: `${30 + i * 20}%` }}
                 animate={{ 
                   x: [0, 50, -30, 0], 
                   y: [0, -40, 20, 0],
                 }}
                 transition={{ 
                   duration: 8 + i * 2, 
                   repeat: Infinity, 
                   ease: "easeInOut" 
                 }}
               >
                  <div className="flex flex-col items-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="drop-shadow-md">
                      <path d="M3 3L10.07 19.97L12.58 12.58L19.97 10.07L3 3Z" fill={p.isAnonymous ? "#94a3b8" : "#D4AF37"} stroke="white" strokeWidth="2"/>
                    </svg>
                    <span className={cn(
                      "text-white text-[10px] px-2 py-0.5 rounded-full shadow-sm mt-1 transition-all",
                      p.isAnonymous ? "bg-slate-400" : "bg-accent"
                    )}>
                      {p.isAnonymous ? "Anon" : p.name.split(' ')[0]}
                    </span>
                  </div>
               </motion.div>
             ))}
           </motion.div>

           {/* Moderator Overlay (Clinician Only) */}
           <AnimatePresence>
             {isClinician && (
               <motion.div
                 initial={{ y: 100, opacity: 0 }}
                 animate={{ y: 0, opacity: 1 }}
                 exit={{ y: 100, opacity: 0 }}
                 className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 z-40"
               >
                 <div className="bg-primary/90 backdrop-blur-xl text-primary-foreground p-2 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-1 md:gap-2 ring-1 ring-black/5">
                   <div className="hidden md:flex flex-col px-3 border-r border-white/10 mr-1">
                     <span className="text-[10px] font-bold uppercase tracking-widest text-accent">Moderator</span>
                     <span className="text-xs opacity-70">Controls</span>
                   </div>

                   <button 
                     onClick={() => setIsCanvasLocked(!isCanvasLocked)}
                     className={cn(
                       "flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all active:scale-95 gap-1",
                       isCanvasLocked ? "bg-destructive text-white shadow-inner shadow-black/20" : "hover:bg-white/10"
                     )}
                   >
                     {isCanvasLocked ? <Unlock size={20} /> : <Lock size={20} />}
                     <span className="text-[9px] font-medium">{isCanvasLocked ? "Unlock" : "Lock"}</span>
                   </button>

                   <button 
                     className="flex flex-col items-center justify-center w-14 h-14 rounded-xl hover:bg-white/10 transition-all active:scale-95 gap-1 group"
                     onClick={() => {
                        // Demo reset flash
                        const el = document.querySelector('.bg-white.rounded-3xl');
                        el?.classList.add('brightness-150');
                        setTimeout(() => el?.classList.remove('brightness-150'), 200);
                     }}
                   >
                     <RotateCcw size={20} className="group-hover:-rotate-90 transition-transform" />
                     <span className="text-[9px] font-medium">Reset</span>
                   </button>

                   <div className="w-px h-8 bg-white/10 mx-1" />

                   <button 
                     onClick={toggleAnonymity}
                     className={cn(
                       "flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all active:scale-95 gap-1",
                       isAnonymousMode ? "bg-purple-500/80 text-white" : "hover:bg-white/10"
                     )}
                   >
                     {isAnonymousMode ? <Ghost size={20} /> : <Eye size={20} />}
                     <span className="text-[9px] font-medium">{isAnonymousMode ? "Anon On" : "Visible"}</span>
                   </button>

                   <div className="md:hidden">
                     <Sheet>
                       <SheetTrigger asChild>
                         <button className="flex flex-col items-center justify-center w-14 h-14 rounded-xl hover:bg-white/10 transition-all active:scale-95 gap-1">
                           <Users size={20} />
                           <span className="text-[9px] font-medium">Users</span>
                         </button>
                       </SheetTrigger>
                     </Sheet>
                   </div>
                 </div>
               </motion.div>
             )}
           </AnimatePresence>
        </div>

        {/* Tools & Participants Sidebar (Desktop) */}
        <AnimatePresence>
          {toolsOpen && (
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-80 bg-white border-l border-border shadow-2xl z-30 hidden md:flex flex-col"
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

                <div className="mt-8 pt-8 border-t border-border/50">
                   <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 px-2">Participants ({participants.length})</h3>
                   <div className="space-y-3">
                     {participants.map(p => (
                       <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/30 transition-colors">
                         <div className="relative">
                           <Avatar className="h-9 w-9 border border-white shadow-sm">
                             <AvatarImage src={p.isAnonymous ? '' : p.avatar} />
                             <AvatarFallback className={cn("bg-secondary text-primary text-xs", p.isAnonymous && "bg-neutral-200")}>
                               {p.isAnonymous ? <Ghost size={14} className="text-muted-foreground" /> : p.name.charAt(0)}
                             </AvatarFallback>
                           </Avatar>
                           {p.status === 'active' && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full animate-pulse" />}
                         </div>
                         <div className="flex-1 min-w-0">
                           <div className="text-sm font-medium text-primary flex items-center justify-between">
                             <span className="truncate">{p.isAnonymous ? "Anonymous" : p.name}</span>
                             {p.role === 'clinician' && <Shield size={12} className="text-accent fill-accent/20" />}
                           </div>
                           <div className="text-[10px] text-muted-foreground capitalize">{p.role}</div>
                         </div>
                       </div>
                     ))}
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
