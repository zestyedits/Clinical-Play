import { Link, useParams } from "wouter";
import { ChevronRight, PanelRightClose, LogOut, Users, Ghost, Shield, Wrench, Camera } from "lucide-react";
import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ZenCanvas, type CanvasItem } from "@/components/sandtray/zen-canvas";
import { AssetLibrary } from "@/components/sandtray/asset-library";
import { ModeratorBar } from "@/components/sandtray/moderator-bar";
import { ToolSelector } from "@/components/tools/tool-selector";
import { BreathingGuide } from "@/components/tools/breathing-guide";
import { ClinicalInsights } from "@/components/tools/clinical-insights";
import { FeelingWheel, type FeelingSelection } from "@/components/tools/feeling-wheel";
import { NarrativeTimeline, type TimelineEventData } from "@/components/tools/narrative-timeline";
import { ValuesCardSort, type CardPlacement } from "@/components/tools/values-card-sort";
import { useSessionSocket } from "@/hooks/use-session-socket";
import { useAuth } from "@/hooks/use-auth";
import type { TherapySession, Participant } from "@shared/schema";

interface OnlineUser {
  participantId: string;
  displayName: string;
  lastActive?: number;
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
  const { user, isAuthenticated } = useAuth();

  const isClinician = !!(isAuthenticated && user);
  const [session, setSession] = useState<TherapySession | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [items, setItems] = useState<CanvasItem[]>([]);
  const [remoteCursors, setRemoteCursors] = useState<RemoteCursor[]>([]);
  const [assetLibraryOpen, setAssetLibraryOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [activeTool, setActiveTool] = useState("sandtray");
  const [joinNotification, setJoinNotification] = useState<string | null>(null);
  const [toolSelectorOpen, setToolSelectorOpen] = useState(false);
  const [breathingActive, setBreathingActive] = useState(false);
  const [insightsOpen, setInsightsOpen] = useState(false);

  const [feelingSelections, setFeelingSelections] = useState<FeelingSelection[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEventData[]>([]);
  const [valuesCards, setValuesCards] = useState<CardPlacement[]>([]);

  const isCanvasLocked = session?.isCanvasLocked ?? false;
  const isAnonymous = session?.isAnonymous ?? false;

  const myParticipantId = useRef(`local-${Date.now()}`);
  const myDisplayName = isClinician
    ? (user?.firstName ? `Dr. ${user.firstName}` : "Clinician")
    : "Guest";
  const throttleRef = useRef(0);
  const toolAreaRef = useRef<HTMLDivElement>(null);

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
        if (msg.activeTool) setActiveTool(msg.activeTool);
        if (msg.breathingActive !== undefined) setBreathingActive(msg.breathingActive);
        if (msg.feelingSelections) setFeelingSelections(msg.feelingSelections);
        if (msg.timelineEvents) setTimelineEvents(msg.timelineEvents.map((e: any) => ({
          id: e.id,
          label: e.label,
          description: e.description,
          position: e.position,
          color: e.color,
          placedBy: e.placedBy,
        })));
        if (msg.valuesCards) setValuesCards(msg.valuesCards.map((c: any) => ({
          id: c.id,
          cardId: c.cardId,
          label: c.label,
          column: c.column,
          orderIndex: c.orderIndex,
          placedBy: c.placedBy,
        })));
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
          lastActive: Date.now(),
        }]);
        setJoinNotification(msg.displayName);
        setTimeout(() => setJoinNotification(null), 3000);
        break;
      case "user-left":
        setOnlineUsers(prev => prev.filter(u => u.participantId !== msg.participantId));
        setRemoteCursors(prev => prev.filter(c => c.participantId !== msg.participantId));
        break;
      case "tool-changed":
        setActiveTool(msg.tool);
        break;
      case "breathing-toggled":
        setBreathingActive(msg.isActive);
        break;
      case "activity-pulse":
        setOnlineUsers(prev => prev.map(u =>
          u.participantId === msg.participantId ? { ...u, lastActive: Date.now() } : u
        ));
        break;

      // Feeling Wheel
      case "feeling-selected":
        setFeelingSelections(prev => [...prev, msg.selection]);
        break;
      case "feelings-cleared":
        setFeelingSelections([]);
        break;

      // Narrative Timeline
      case "timeline-event-added":
        setTimelineEvents(prev => [...prev, {
          id: msg.event.id,
          label: msg.event.label,
          description: msg.event.description,
          position: msg.event.position,
          color: msg.event.color,
          placedBy: msg.event.placedBy,
        }]);
        break;
      case "timeline-event-updated":
        setTimelineEvents(prev => prev.map(e =>
          e.id === msg.event.id ? { ...e, ...msg.event } : e
        ));
        break;
      case "timeline-event-removed":
        setTimelineEvents(prev => prev.filter(e => e.id !== msg.eventId));
        break;
      case "timeline-cleared":
        setTimelineEvents([]);
        break;

      // Values Card Sort
      case "values-card-placed":
        setValuesCards(prev => [...prev, {
          id: msg.card.id,
          cardId: msg.card.cardId,
          label: msg.card.label,
          column: msg.card.column,
          orderIndex: msg.card.orderIndex,
          placedBy: msg.card.placedBy,
        }]);
        break;
      case "values-card-moved":
        setValuesCards(prev => prev.map(c =>
          c.id === msg.card.id ? { ...c, column: msg.card.column, orderIndex: msg.card.orderIndex } : c
        ));
        break;
      case "values-card-removed":
        setValuesCards(prev => prev.filter(c => c.id !== msg.cardId));
        break;
      case "values-cleared":
        setValuesCards([]);
        break;
    }
  }, []);

  const { connected, send } = useSessionSocket(
    sessionId,
    myParticipantId.current,
    myDisplayName,
    handleMessage
  );

  useEffect(() => {
    if (!sessionId) return;
    fetch(`/api/therapy-sessions/${sessionId}`)
      .then(r => {
        if (r.ok) return r.json();
        return null;
      })
      .then(s => { if (s) setSession(s); })
      .catch(() => {});
  }, [sessionId]);

  // Sandtray handlers
  const handleItemDrop = useCallback((icon: string, category: string, x: number, y: number) => {
    send({ type: "item-placed", icon, category, x, y, scale: 1, rotation: 0 });
    send({ type: "activity-pulse" });
  }, [send]);

  const handleItemMove = useCallback((itemId: string, x: number, y: number) => {
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, x, y } : i));
    send({ type: "item-moved", itemId, x, y });
    send({ type: "activity-pulse" });
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

  const handleSelectTool = useCallback((toolId: string) => {
    setActiveTool(toolId);
    send({ type: "tool-change", tool: toolId });
  }, [send]);

  const handleToggleBreathing = useCallback(() => {
    const next = !breathingActive;
    setBreathingActive(next);
    send({ type: "breathing-toggle", isActive: next });
  }, [send, breathingActive]);

  // Feeling Wheel handlers
  const handleFeelingSelect = useCallback((primary: string, secondary: string | null, tertiary: string | null) => {
    send({ type: "feeling-select", primaryEmotion: primary, secondaryEmotion: secondary, tertiaryEmotion: tertiary });
    send({ type: "activity-pulse" });
  }, [send]);

  const handleFeelingClear = useCallback(() => {
    send({ type: "feeling-clear" });
    setFeelingSelections([]);
  }, [send]);

  // Timeline handlers
  const handleTimelineAdd = useCallback((label: string, description: string | null, position: number, color: string) => {
    send({ type: "timeline-event-add", label, description, position, color });
    send({ type: "activity-pulse" });
  }, [send]);

  const handleTimelineRemove = useCallback((eventId: string) => {
    send({ type: "timeline-event-remove", eventId });
    setTimelineEvents(prev => prev.filter(e => e.id !== eventId));
  }, [send]);

  const handleTimelineUpdate = useCallback((eventId: string, label: string, description: string | null, position: number, color: string) => {
    send({ type: "timeline-event-update", eventId, label, description, position, color });
  }, [send]);

  const handleTimelineClear = useCallback(() => {
    send({ type: "timeline-clear" });
    setTimelineEvents([]);
  }, [send]);

  // Values Card Sort handlers
  const handleValuesPlace = useCallback((cardId: string, label: string, column: string, orderIndex: number) => {
    send({ type: "values-card-place", cardId, label, column, orderIndex });
    send({ type: "activity-pulse" });
  }, [send]);

  const handleValuesMove = useCallback((placementId: string, column: string, orderIndex: number) => {
    send({ type: "values-card-move", cardId: placementId, column, orderIndex });
    send({ type: "activity-pulse" });
  }, [send]);

  const handleValuesRemove = useCallback((placementId: string) => {
    send({ type: "values-card-remove", cardId: placementId });
    setValuesCards(prev => prev.filter(c => c.id !== placementId));
  }, [send]);

  const handleValuesClear = useCallback(() => {
    send({ type: "values-clear" });
    setValuesCards([]);
  }, [send]);

  // Snapshot export
  const handleSnapshot = useCallback(async () => {
    const el = toolAreaRef.current;
    if (!el) return;
    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(el, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const link = document.createElement("a");
      link.download = `ClinicalPlay_${activeTool}_${new Date().toISOString().slice(0,10)}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Snapshot failed:", err);
    }
  }, [activeTool]);

  const toolDisplayName = (tool: string) => {
    switch (tool) {
      case "sandtray": return "Zen Sandtray";
      case "breathing": return "Calm Breathing";
      case "feelings": return "Feeling Wheel";
      case "narrative": return "Narrative Timeline";
      case "values-sort": return "Values Card Sort";
      default: return tool;
    }
  };

  return (
    <div className="h-screen w-full bg-background overflow-hidden flex flex-col font-sans">
      {/* Header */}
      <motion.header
        className="h-14 md:h-16 bg-white/60 backdrop-blur-xl border-b border-white/20 flex items-center justify-between px-4 z-20 shrink-0"
        initial={{ y: -60 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
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

        <div className="flex items-center gap-2">
          {session?.inviteCode && (
            <div className="hidden lg:flex items-center gap-2 bg-accent/10 text-accent px-3 py-1.5 rounded-full text-xs font-mono font-bold border border-accent/20">
              {session.inviteCode}
            </div>
          )}

          {isClinician && (
            <>
              <div className="hidden lg:flex items-center gap-2 bg-accent/5 px-3 py-1.5 rounded-full border border-accent/20">
                <Shield size={12} className="text-accent fill-accent/20" />
                <span className="text-xs font-medium text-accent">Clinician</span>
              </div>

              <button
                onClick={handleSnapshot}
                className="p-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-secondary/50 transition-colors cursor-pointer"
                data-testid="button-snapshot"
                title="Export Session Summary"
              >
                <Camera size={20} />
              </button>

              <button
                onClick={() => setToolSelectorOpen(true)}
                className="p-2 rounded-xl text-primary hover:bg-secondary/50 transition-colors cursor-pointer"
                data-testid="button-open-tool-selector"
                title="Clinical Tools"
              >
                <Wrench size={20} />
              </button>
            </>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <button className="md:hidden p-2 text-primary hover:bg-secondary rounded-xl transition-colors relative cursor-pointer" data-testid="button-mobile-participants">
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
                {onlineUsers.map(u => {
                  const isActive = u.lastActive && (Date.now() - u.lastActive < 5000);
                  return (
                    <div key={u.participantId} className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/30 transition-colors">
                      <div className="relative">
                        <Avatar className="h-11 w-11 border-2 border-white shadow-sm">
                          <AvatarFallback className={cn("bg-secondary text-primary", isAnonymous && "bg-neutral-200")}>
                            {isAnonymous ? <Ghost size={18} className="text-muted-foreground" /> : u.displayName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className={cn(
                          "absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full",
                          isActive ? "bg-accent animate-pulse" : "bg-green-500"
                        )} />
                      </div>
                      <div>
                        <div className="font-medium text-primary text-sm flex items-center gap-2">
                          {isAnonymous ? "Anonymous" : u.displayName}
                          {u.displayName.startsWith("Dr") && <Shield size={12} className="text-accent fill-accent/20" />}
                        </div>
                        <div className={cn("text-xs", isActive ? "text-accent font-medium" : "text-green-600")}>
                          {isActive ? "Active" : "Online"}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {onlineUsers.length === 0 && (
                  <p className="text-muted-foreground text-sm text-center py-8">No other participants yet</p>
                )}
              </div>
            </SheetContent>
          </Sheet>

          <button
            onClick={() => setToolsOpen(!toolsOpen)}
            className={cn("p-2 rounded-xl transition-colors cursor-pointer hidden md:block", toolsOpen ? "bg-primary text-white" : "text-muted-foreground hover:bg-secondary")}
            data-testid="button-toggle-tools"
          >
            <PanelRightClose size={20} />
          </button>
          <Link href="/dashboard">
            <button className="p-2 text-destructive hover:bg-destructive/10 rounded-xl transition-colors cursor-pointer" data-testid="button-leave">
              <LogOut size={20} />
            </button>
          </Link>
        </div>
      </motion.header>

      {/* Main */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* Tool Area */}
        <div className="flex-1 relative" ref={toolAreaRef}>
          <AnimatePresence mode="wait">
            {activeTool === "sandtray" && (
              <motion.div
                key="sandtray"
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
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
              </motion.div>
            )}

            {activeTool === "breathing" && (
              <motion.div
                key="breathing"
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <BreathingGuide
                  isActive={breathingActive}
                  isClinician={isClinician}
                  onToggle={handleToggleBreathing}
                />
              </motion.div>
            )}

            {activeTool === "feelings" && (
              <motion.div
                key="feelings"
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <FeelingWheel
                  selections={feelingSelections}
                  onSelect={handleFeelingSelect}
                  onClear={handleFeelingClear}
                  isClinician={isClinician}
                />
              </motion.div>
            )}

            {activeTool === "narrative" && (
              <motion.div
                key="narrative"
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <NarrativeTimeline
                  events={timelineEvents}
                  onAddEvent={handleTimelineAdd}
                  onRemoveEvent={handleTimelineRemove}
                  onUpdateEvent={handleTimelineUpdate}
                  onClear={handleTimelineClear}
                  isClinician={isClinician}
                />
              </motion.div>
            )}

            {activeTool === "values-sort" && (
              <motion.div
                key="values-sort"
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <ValuesCardSort
                  placements={valuesCards}
                  onPlaceCard={handleValuesPlace}
                  onMoveCard={handleValuesMove}
                  onRemoveCard={handleValuesRemove}
                  onClear={handleValuesClear}
                  isClinician={isClinician}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Moderator Bar — only on sandtray */}
          <AnimatePresence>
            {isClinician && activeTool === "sandtray" && (
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

          {/* Clinical Insights — clinician only */}
          {isClinician && (
            <ClinicalInsights
              isOpen={insightsOpen}
              onToggle={() => setInsightsOpen(!insightsOpen)}
              activeTool={activeTool}
            />
          )}
        </div>

        {/* Tools Sidebar (Desktop) */}
        <AnimatePresence>
          {toolsOpen && (
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-72 bg-white/60 backdrop-blur-2xl border-l border-white/20 shadow-2xl z-30 hidden md:flex flex-col"
            >
              <div className="p-5 border-b border-white/20">
                <h2 className="font-serif text-primary text-lg">Session Panel</h2>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 px-1">
                  Online ({onlineUsers.length})
                </h3>
                <div className="space-y-2">
                  {onlineUsers.map(u => {
                    const isActive = u.lastActive && (Date.now() - u.lastActive < 5000);
                    return (
                      <div key={u.participantId} className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-white/50 transition-colors">
                        <div className="relative">
                          <Avatar className="h-9 w-9 border border-white shadow-sm">
                            <AvatarFallback className={cn("bg-secondary text-primary text-xs", isAnonymous && "bg-neutral-200")}>
                              {isAnonymous ? <Ghost size={13} className="text-muted-foreground" /> : u.displayName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className={cn(
                            "absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-white rounded-full",
                            isActive ? "bg-accent animate-pulse" : "bg-green-500"
                          )} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-primary truncate block">
                            {isAnonymous ? "Anonymous" : u.displayName}
                          </span>
                          <span className={cn("text-[10px]", isActive ? "text-accent" : "text-green-600")}>
                            {isActive ? "Active" : "Online"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {onlineUsers.length === 0 && (
                    <p className="text-muted-foreground text-xs text-center py-4">Waiting for participants...</p>
                  )}
                </div>

                {session?.inviteCode && (
                  <div className="mt-4 p-4 rounded-2xl bg-accent/5 border border-accent/20">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-accent mb-1">Invite Code</p>
                    <p className="text-lg font-mono font-bold text-primary tracking-widest" data-testid="text-invite-code">{session.inviteCode}</p>
                  </div>
                )}

                <div className="mt-4 p-4 rounded-2xl bg-white/40">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-2">Active Tool</p>
                  <p className="text-sm font-medium text-primary">{toolDisplayName(activeTool)}</p>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* Tool Selector Modal */}
      <ToolSelector
        isOpen={toolSelectorOpen}
        onClose={() => setToolSelectorOpen(false)}
        activeTool={activeTool}
        onSelectTool={handleSelectTool}
      />

      {/* User Joined Notification */}
      <AnimatePresence>
        {joinNotification && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="bg-white/80 backdrop-blur-xl px-5 py-2.5 rounded-full shadow-xl text-primary text-sm font-medium border border-white/30 flex items-center gap-2">
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
