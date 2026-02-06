import { Link, useParams } from "wouter";
import { Mic, Video, MonitorUp, ChevronRight, PanelRightClose, Palette, Shapes, Brain, LogOut, Users, Ghost, Shield } from "lucide-react";
import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ZenCanvas, type CanvasItem } from "@/components/sandtray/zen-canvas";
import { AssetLibrary } from "@/components/sandtray/asset-library";
import { ModeratorBar } from "@/components/sandtray/moderator-bar";
import { useSessionSocket } from "@/hooks/use-session-socket";
import type { Session, Participant } from "@shared/schema";

interface OnlineUser {
  participantId: string;
  displayName: string;
}

interface RemoteCursor {
  participantId: string;
  displayName: string;
  x: number;
  y: number;
}

export default function Playroom() {
  const { id } = useParams();
  const sessionId = id || null;

  const [isClinician, setIsClinician] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [items, setItems] = useState<CanvasItem[]>([]);
  const [remoteCursors, setRemoteCursors] = useState<RemoteCursor[]>([]);
  const [assetLibraryOpen, setAssetLibraryOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [activeTool, setActiveTool] = useState("sandtray");
  const [joinNotification, setJoinNotification] = useState<string | null>(null);

  const isCanvasLocked = session?.isCanvasLocked ?? false;
  const isAnonymous = session?.isAnonymous ?? false;

  const myParticipantId = useRef(`local-${Date.now()}`);
  const myDisplayName = isClinician ? "Dr. Thompson" : "Guest";
  const throttleRef = useRef(0);

  const handleMessage = useCallback((msg: any) => {
    switch (msg.type) {
      case "init":
        setItems(msg.items.map((i: any) => ({
          id: i.id,
          icon: i.icon,
          category: i.category,
          x: i.x,
          y: i.y,
          scale: i.scale,
          rotation: i.rotation,
          placedBy: i.placedBy,
        })));
        setParticipants(msg.participants || []);
        setOnlineUsers(msg.onlineUsers || []);
        if (msg.session) setSession(msg.session);
        break;
      case "item-placed":
        setItems(prev => [...prev, {
          id: msg.item.id,
          icon: msg.item.icon,
          category: msg.item.category,
          x: msg.item.x,
          y: msg.item.y,
          scale: msg.item.scale,
          rotation: msg.item.rotation,
          placedBy: msg.item.placedBy,
        }]);
        break;
      case "item-moved":
        setItems(prev => prev.map(i =>
          i.id === msg.itemId ? { ...i, x: msg.x, y: msg.y } : i
        ));
        break;
      case "item-removed":
        setItems(prev => prev.filter(i => i.id !== msg.itemId));
        break;
      case "canvas-cleared":
        setItems([]);
        break;
      case "session-updated":
        if (msg.session) setSession(msg.session);
        break;
      case "cursor-move":
        setRemoteCursors(prev => {
          const existing = prev.filter(c => c.participantId !== msg.participantId);
          return [...existing, {
            participantId: msg.participantId,
            displayName: msg.displayName,
            x: msg.x,
            y: msg.y,
          }];
        });
        break;
      case "user-joined":
        setOnlineUsers(prev => [...prev.filter(u => u.participantId !== msg.participantId), {
          participantId: msg.participantId,
          displayName: msg.displayName,
        }]);
        setJoinNotification(msg.displayName);
        setTimeout(() => setJoinNotification(null), 3000);
        break;
      case "user-left":
        setOnlineUsers(prev => prev.filter(u => u.participantId !== msg.participantId));
        setRemoteCursors(prev => prev.filter(c => c.participantId !== msg.participantId));
        break;
    }
  }, []);

  const { connected, send } = useSessionSocket(
    sessionId,
    myParticipantId.current,
    myDisplayName,
    handleMessage
  );

  // Create session if it doesn't exist yet
  useEffect(() => {
    if (!sessionId) return;
    fetch(`/api/sessions/${sessionId}`)
      .then(r => {
        if (r.ok) return r.json();
        return fetch("/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: `Session ${sessionId}` }),
        }).then(r => r.json());
      })
      .then(s => setSession(s))
      .catch(() => {});
  }, [sessionId]);

  const handleItemDrop = useCallback((icon: string, category: string, x: number, y: number) => {
    send({
      type: "item-placed",
      icon,
      category,
      x,
      y,
      scale: 1,
      rotation: 0,
    });
  }, [send]);

  const handleItemMove = useCallback((itemId: string, x: number, y: number) => {
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, x, y } : i));
    send({ type: "item-moved", itemId, x, y });
  }, [send]);

  const handleItemRemove = useCallback((itemId: string) => {
    setItems(prev => prev.filter(i => i.id !== itemId));
    send({ type: "item-removed", itemId });
  }, [send]);

  const handleCursorMove = useCallback((x: number, y: number) => {
    const now = Date.now();
    if (now - throttleRef.current < 50) return;
    throttleRef.current = now;
    send({ type: "cursor-move", x, y });
  }, [send]);

  const handleToggleLock = useCallback(() => {
    send({ type: "session-update", data: { isCanvasLocked: !isCanvasLocked } });
    setSession(prev => prev ? { ...prev, isCanvasLocked: !prev.isCanvasLocked } : prev);
  }, [send, isCanvasLocked]);

  const handleToggleAnonymity = useCallback(() => {
    send({ type: "session-update", data: { isAnonymous: !isAnonymous } });
    setSession(prev => prev ? { ...prev, isAnonymous: !prev.isAnonymous } : prev);
  }, [send, isAnonymous]);

  const handleClearCanvas = useCallback(() => {
    send({ type: "clear-canvas" });
    setItems([]);
  }, [send]);

  return (
    <div className="h-screen w-full bg-neutral-100 overflow-hidden flex flex-col font-sans">
      {/* Header */}
      <header className="h-14 md:h-16 bg-white/80 backdrop-blur-md border-b border-border/50 flex items-center justify-between px-4 z-20 shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <button className="p-2 hover:bg-secondary rounded-full transition-colors cursor-pointer" data-testid="button-back">
              <ChevronRight className="rotate-180 text-muted-foreground" size={20} />
            </button>
          </Link>
          <div>
            <h1 className="font-serif text-base md:text-lg text-primary leading-tight flex items-center gap-2">
              {session?.name || `Session ${id}`}
              {isCanvasLocked && (
                <span className="inline-flex items-center gap-1 text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">
                  Locked
                </span>
              )}
            </h1>
            <div className="flex items-center gap-2">
              <span className={cn("w-2 h-2 rounded-full", connected ? "bg-green-500 animate-pulse" : "bg-red-400")} />
              <span className="text-[11px] text-muted-foreground">
                {connected ? "Synced" : "Connecting..."}
                {onlineUsers.length > 0 && ` · ${onlineUsers.length} online`}
              </span>
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
          {/* Invite Code Badge */}
          {session?.inviteCode && (
            <div className="hidden lg:flex items-center gap-2 bg-accent/10 text-accent px-3 py-1.5 rounded-full text-xs font-mono font-bold border border-accent/20">
              {session.inviteCode}
            </div>
          )}

          {/* Clinician Toggle */}
          <div className="hidden lg:flex items-center gap-2 bg-yellow-50 px-2 py-1 rounded border border-yellow-200">
            <Switch checked={isClinician} onCheckedChange={setIsClinician} id="role-mode" />
            <label htmlFor="role-mode" className="text-xs font-medium text-yellow-800 cursor-pointer">Clinician</label>
          </div>

          {/* Mobile Participants */}
          <Sheet>
            <SheetTrigger asChild>
              <button className="md:hidden p-2 text-primary hover:bg-secondary rounded-lg transition-colors relative cursor-pointer" data-testid="button-mobile-participants">
                <Users size={20} />
                {onlineUsers.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-accent text-white text-[9px] font-bold rounded-full flex items-center justify-center">{onlineUsers.length}</span>
                )}
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[60vh] rounded-t-3xl">
              <SheetHeader className="mb-6">
                <SheetTitle className="font-serif text-xl text-primary text-left">Participants</SheetTitle>
              </SheetHeader>
              <div className="space-y-3">
                {onlineUsers.map(u => (
                  <div key={u.participantId} className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/30 transition-colors">
                    <div className="relative">
                      <Avatar className="h-11 w-11 border-2 border-white shadow-sm">
                        <AvatarFallback className={cn("bg-secondary text-primary", isAnonymous && "bg-neutral-200")}>
                          {isAnonymous ? <Ghost size={18} className="text-muted-foreground" /> : u.displayName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                    </div>
                    <div>
                      <div className="font-medium text-primary text-sm flex items-center gap-2">
                        {isAnonymous ? "Anonymous" : u.displayName}
                        {u.displayName.startsWith("Dr") && <Shield size={12} className="text-accent fill-accent/20" />}
                      </div>
                      <div className="text-xs text-green-600">Online</div>
                    </div>
                  </div>
                ))}
                {onlineUsers.length === 0 && (
                  <p className="text-muted-foreground text-sm text-center py-8">No other participants yet</p>
                )}
              </div>
            </SheetContent>
          </Sheet>

          <button
            onClick={() => setToolsOpen(!toolsOpen)}
            className={cn("p-2 rounded-lg transition-colors cursor-pointer hidden md:block", toolsOpen ? "bg-primary text-white" : "text-muted-foreground hover:bg-secondary")}
            data-testid="button-toggle-tools"
          >
            <PanelRightClose size={20} />
          </button>
          <Link href="/dashboard">
            <button className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer" data-testid="button-leave">
              <LogOut size={20} />
            </button>
          </Link>
        </div>
      </header>

      {/* Main */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Canvas */}
        <div className="flex-1 relative">
          {activeTool === "sandtray" ? (
            <>
              <ZenCanvas
                items={items}
                isLocked={isCanvasLocked && !isClinician}
                isAnonymous={isAnonymous}
                remoteCursors={remoteCursors}
                onItemMove={handleItemMove}
                onItemDrop={handleItemDrop}
                onItemRemove={handleItemRemove}
                onCursorMove={handleCursorMove}
              />
              <AssetLibrary
                isOpen={assetLibraryOpen}
                onToggle={() => setAssetLibraryOpen(!assetLibraryOpen)}
                disabled={isCanvasLocked && !isClinician}
              />
            </>
          ) : activeTool === "cbt" ? (
            <div className="w-full h-full flex items-center justify-center bg-white">
              <img src="/images/game-cbt.jpg" className="w-full h-full object-cover opacity-60" alt="CBT" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-serif text-3xl text-primary/30">Thought Bridge — Coming Soon</span>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-white">
              <span className="font-serif text-3xl text-primary/20">Shared Whiteboard — Coming Soon</span>
            </div>
          )}

          {/* Moderator Overlay */}
          <AnimatePresence>
            {isClinician && (
              <ModeratorBar
                isCanvasLocked={isCanvasLocked}
                isAnonymous={isAnonymous}
                onToggleLock={handleToggleLock}
                onToggleAnonymity={handleToggleAnonymity}
                onClearCanvas={handleClearCanvas}
                participantCount={onlineUsers.length}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Tools Sidebar (Desktop) */}
        <AnimatePresence>
          {toolsOpen && (
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-72 bg-white border-l border-border shadow-2xl z-30 hidden md:flex flex-col"
            >
              <div className="p-5 border-b border-border/50">
                <h2 className="font-serif text-primary text-lg">Toolkit</h2>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {[
                  { id: "sandtray", label: "Zen Sandtray", icon: Palette, desc: "Expressive world-building" },
                  { id: "cbt", label: "Thought Bridge", icon: Brain, desc: "CBT exercises" },
                  { id: "draw", label: "Whiteboard", icon: Shapes, desc: "Free drawing" },
                ].map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => setActiveTool(tool.id)}
                    className={cn(
                      "w-full p-3 rounded-xl border text-left transition-all duration-200 flex items-start gap-3 hover:shadow-md cursor-pointer",
                      activeTool === tool.id
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-white border-border hover:border-accent/50"
                    )}
                    data-testid={`button-tool-${tool.id}`}
                  >
                    <div className={cn("p-2 rounded-lg", activeTool === tool.id ? "bg-white/10" : "bg-secondary")}>
                      <tool.icon size={18} />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{tool.label}</div>
                      <div className={cn("text-xs mt-0.5", activeTool === tool.id ? "text-primary-foreground/70" : "text-muted-foreground")}>
                        {tool.desc}
                      </div>
                    </div>
                  </button>
                ))}

                {/* Online Users */}
                <div className="mt-6 pt-6 border-t border-border/50">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 px-1">
                    Online ({onlineUsers.length})
                  </h3>
                  <div className="space-y-2">
                    {onlineUsers.map(u => (
                      <div key={u.participantId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/30 transition-colors">
                        <div className="relative">
                          <Avatar className="h-8 w-8 border border-white shadow-sm">
                            <AvatarFallback className={cn("bg-secondary text-primary text-xs", isAnonymous && "bg-neutral-200")}>
                              {isAnonymous ? <Ghost size={12} className="text-muted-foreground" /> : u.displayName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 border border-white rounded-full" />
                        </div>
                        <span className="text-sm font-medium text-primary truncate">
                          {isAnonymous ? "Anonymous" : u.displayName}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Invite Code */}
                {session?.inviteCode && (
                  <div className="mt-4 p-3 rounded-xl bg-accent/5 border border-accent/20">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-accent mb-1">Invite Code</p>
                    <p className="text-lg font-mono font-bold text-primary tracking-widest">{session.inviteCode}</p>
                  </div>
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* User Joined Notification */}
      <AnimatePresence>
        {joinNotification && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-full shadow-lg text-primary text-sm font-medium border border-accent/20 flex items-center gap-2">
              <motion.span
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ duration: 0.6 }}
                className="w-2 h-2 rounded-full bg-accent inline-block"
              />
              {joinNotification} joined
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
