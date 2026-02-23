import { Link, useParams, useLocation } from "wouter";
import { ChevronRight, PanelRightClose, LogOut, Users, Ghost, Shield, Wrench, Camera, Crown, Square, Clock, CheckCircle2, Download, Check, Copy } from "lucide-react";
import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ToolSelector } from "@/components/tools/tool-selector";
import { ClinicalInsights } from "@/components/tools/clinical-insights";
import { VolumeMixer } from "@/components/tools/volume-mixer";
import { FeelingWheel } from "@/components/tools/feeling-wheel";
import { ConnectionStatus } from "@/components/ui/connection-status";
import { useSessionSocket } from "@/hooks/use-session-socket";
import { useAuth } from "@/hooks/use-auth";
import { GuidedTour, useTour, type TourStep } from "@/components/guided-tour";
import { GlassCard } from "@/components/ui/glass-card";
import { getSupabase } from "@/lib/supabase";
import type { TherapySession, Participant } from "@shared/schema";

interface OnlineUser {
  participantId: string;
  displayName: string;
  lastActive?: number;
  status?: "online" | "disconnected";
}

export default function Playroom() {
  const { id } = useParams();
  const isDemo = id === "demo";
  const sessionId = isDemo ? null : (id || null);
  const { user, isAuthenticated } = useAuth();

  const isClinician = isDemo ? true : !!(isAuthenticated && user);
  const [session, setSession] = useState<TherapySession | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [activeTool, setActiveTool] = useState("volume-mixer");
  const [joinNotification, setJoinNotification] = useState<string | null>(null);
  const [toolSelectorOpen, setToolSelectorOpen] = useState(false);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [toolSettings, setToolSettings] = useState<Record<string, Record<string, any>>>({});

  const [subscriptionType, setSubscriptionType] = useState<string>("free");
  const [sessionEnded, setSessionEnded] = useState(false);
  const [endingSession, setEndingSession] = useState(false);
  const [toolTransitionLabel, setToolTransitionLabel] = useState<string | null>(null);
  const [inviteCopied, setInviteCopied] = useState(false);

  const [, navigate] = useLocation();
  const playroomTour = useTour("playroom");

  const playroomTourSteps: TourStep[] = isClinician ? [
    {
      target: "playroom-invite-code",
      title: "Share the Invite Code",
      content: "Tap this code to copy the invite link. Send it to your client — they'll join instantly, no account needed.",
      position: "bottom",
      emoji: "🔗",
    },
    {
      target: "button-open-tool-selector",
      title: "Switch Tools",
      content: "Open the tool selector to browse and switch between available clinical tools during your session.",
      position: "bottom",
      emoji: "🧰",
    },
    {
      target: "button-snapshot",
      title: "Save a Snapshot",
      content: "Export the current tool as an image. Useful for session notes or sharing progress with your client.",
      position: "bottom",
      emoji: "📸",
    },
    {
      target: "button-end-session",
      title: "End the Session",
      content: "When you're done, end the session here. All participants will be disconnected and the session will be saved.",
      position: "bottom",
      emoji: "🏁",
    },
  ] : [];

  const isAnonymous = session?.isAnonymous ?? false;

  const myParticipantId = useRef(`local-${Date.now()}`);
  const myDisplayName = isClinician
    ? (user?.firstName ? `Dr. ${user.firstName}` : "Clinician")
    : "Guest";
  const toolAreaRef = useRef<HTMLDivElement>(null);
  const peakParticipants = useRef(0);
  const toolsUsed = useRef<Set<string>>(new Set(["volume-mixer"]));

  const handleMessage = useCallback((msg: any) => {
    switch (msg.type) {
      case "init":
        setParticipants(msg.participants || []);
        setOnlineUsers(msg.onlineUsers || []);
        if (msg.session) setSession(msg.session);
        if (msg.activeTool) setActiveTool(msg.activeTool);
        if (msg.toolSettings) setToolSettings(msg.toolSettings);
        break;
      case "session-updated":
        if (msg.session) setSession(msg.session);
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
        break;
      case "user-disconnected":
        setOnlineUsers(prev => prev.map(u =>
          u.participantId === msg.participantId ? { ...u, status: "disconnected" } : u
        ));
        break;
      case "tool-changed":
        setActiveTool(msg.tool);
        break;
      case "activity-pulse":
        setOnlineUsers(prev => prev.map(u =>
          u.participantId === msg.participantId ? { ...u, lastActive: Date.now() } : u
        ));
        break;
      case "session-ended":
        setSessionEnded(true);
        break;
      case "tool-settings-updated":
        setToolSettings(prev => ({ ...prev, [msg.toolId]: msg.settings }));
        break;
    }
  }, []);

  const { connected: wsConnected, send: wsSend } = useSessionSocket(
    sessionId,
    myParticipantId.current,
    myDisplayName,
    handleMessage
  );

  const connected = isDemo ? true : wsConnected;
  const send = useCallback((msg: any) => {
    if (isDemo) {
      switch (msg.type) {
        case "session-update":
          if (msg.data) setSession(prev => prev ? { ...prev, ...msg.data } : prev);
          break;
        case "tool-change":
          setActiveTool(msg.tool);
          break;
        case "tool-settings-update":
          setToolSettings(prev => ({ ...prev, [msg.toolId]: { ...(prev[msg.toolId] || {}), ...msg.settings } }));
          break;
      }
      return;
    }
    wsSend(msg);
  }, [isDemo, wsSend]);

  useEffect(() => {
    if (isDemo) {
      const params = new URLSearchParams(window.location.search);
      const toolParam = params.get("tool");
      if (toolParam) setActiveTool(toolParam);
      setSession({
        id: "demo",
        name: "Demo Playroom",
        inviteCode: "DEMO",
        isCanvasLocked: false,
        isAnonymous: false,
        status: "active",
        clinicianId: "demo-clinician",
        createdAt: new Date(),
        activeTool: toolParam || "volume-mixer",
        endedAt: null,
      } as TherapySession);
      setOnlineUsers([{
        participantId: myParticipantId.current,
        displayName: myDisplayName,
        lastActive: Date.now(),
        status: "online" as const,
      }]);
      return;
    }
    if (!sessionId) return;
    fetch(`/api/therapy-sessions/${sessionId}`)
      .then(r => {
        if (r.ok) return r.json();
        return null;
      })
      .then(s => {
        if (s) {
          setSession(s);
          if (s.status === "ended") setSessionEnded(true);
        }
      })
      .catch(() => {});
  }, [sessionId, isDemo]);

  const initialToolApplied = useRef(false);
  useEffect(() => {
    if (isDemo || !connected || initialToolApplied.current) return;
    const params = new URLSearchParams(window.location.search);
    const toolParam = params.get("tool");
    if (toolParam && toolParam !== activeTool) {
      initialToolApplied.current = true;
      setActiveTool(toolParam);
      send({ type: "tool-change", tool: toolParam });
    } else {
      initialToolApplied.current = true;
    }
  }, [connected, isDemo]);

  useEffect(() => {
    if (isClinician && session && connected && !playroomTour.hasCompleted() && !sessionEnded) {
      const timer = setTimeout(() => playroomTour.start(), 1200);
      return () => clearTimeout(timer);
    }
  }, [isClinician, session, connected, sessionEnded, playroomTour]);

  useEffect(() => {
    if (!isClinician || isDemo) return;
    fetch("/api/billing/status")
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.subscriptionType) setSubscriptionType(data.subscriptionType); })
      .catch(() => {});
  }, [isClinician, isDemo]);

  useEffect(() => {
    if (onlineUsers.length > peakParticipants.current) {
      peakParticipants.current = onlineUsers.length;
    }
  }, [onlineUsers]);

  useEffect(() => {
    if (activeTool) {
      toolsUsed.current.add(activeTool);
    }
  }, [activeTool]);

  const toolDisplayName = (tool: string) => {
    const names: Record<string, string> = {
      "volume-mixer": "Volume Mixer",
      "feelings": "Feeling Wheel",
    };
    return names[tool] || tool;
  };

  const handleSelectTool = useCallback((toolId: string) => {
    if (toolId === activeTool) return;
    const label = toolDisplayName(toolId);
    setToolTransitionLabel(label);
    setTimeout(() => setToolTransitionLabel(null), 900);
    if (!isDemo) setActiveTool(toolId);
    send({ type: "tool-change", tool: toolId });
  }, [send, isDemo, activeTool]);

  const handleToolSettingsUpdate = useCallback((toolId: string, updates: Record<string, any>) => {
    setToolSettings(prev => ({ ...prev, [toolId]: { ...(prev[toolId] || {}), ...updates } }));
    send({ type: "tool-settings-update", toolId, settings: updates });
  }, [send]);

  const handleEndSession = useCallback(async () => {
    if (!sessionId) return;
    setEndingSession(true);
    try {
      const supabase = await getSupabase();
      const { data: { session: sbSession } } = await supabase.auth.getSession();
      const token = sbSession?.access_token || "";
      const res = await fetch(`/api/therapy-sessions/${sessionId}/end`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        setSessionEnded(true);
      }
    } catch (err) {
      console.error("Failed to end session:", err);
    } finally {
      setEndingSession(false);
    }
  }, [sessionId]);

  const handleSnapshot = useCallback(async () => {
    const el = toolAreaRef.current;
    if (!el) return;
    try {
      const { default: html2canvas } = await import("html2canvas");
      const captured = await html2canvas(el, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const scale = 2;
      const barHeight = 40 * scale;
      const watermarked = document.createElement("canvas");
      watermarked.width = captured.width;
      watermarked.height = captured.height + barHeight;
      const ctx = watermarked.getContext("2d")!;

      ctx.drawImage(captured, 0, 0);

      ctx.fillStyle = "rgba(27, 42, 74, 0.9)";
      ctx.fillRect(0, captured.height, watermarked.width, barHeight);

      const now = new Date();
      const formattedDate = now.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }) + " at " + now.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      const sessionName = session?.name || "Untitled";
      const toolName = toolDisplayName(activeTool);
      const watermarkText = `ClinicalPlay.app  |  Session: ${sessionName}  |  ${formattedDate}  |  Tool: ${toolName}`;

      ctx.fillStyle = "#FFFFFF";
      ctx.font = `${12 * scale}px sans-serif`;
      ctx.textBaseline = "middle";
      ctx.fillText(watermarkText, 16 * scale, captured.height + barHeight / 2);

      const link = document.createElement("a");
      link.download = `ClinicalPlay_${activeTool}_${now.toISOString().slice(0,10)}.png`;
      link.href = watermarked.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Snapshot failed:", err);
    }
  }, [activeTool, session]);


  return (
    <div className="h-screen w-full bg-background overflow-hidden flex flex-col font-sans">
      {/* Header */}
      <motion.header
        className="h-14 md:h-16 bg-card border-b border-border flex items-center justify-between px-4 z-20 shrink-0"
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <button className="p-2 hover:bg-secondary rounded-full transition-colors cursor-pointer" data-testid="button-back">
              <ChevronRight className="rotate-180 text-muted-foreground" size={20} />
            </button>
          </Link>
          <div>
            <h1 className="font-serif text-base md:text-lg text-foreground leading-tight flex items-center gap-2">
              {session?.name || `Session ${id}`}
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

        <div className="flex items-center gap-1.5 md:gap-2">
          {session?.inviteCode && (
            <motion.button
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/join/${session.inviteCode}`);
                setInviteCopied(true);
                setTimeout(() => setInviteCopied(false), 2000);
              }}
              className="flex items-center gap-2 bg-accent/10 text-accent px-3 py-1.5 rounded-full text-xs font-mono font-bold border border-accent/20 cursor-pointer hover:bg-accent/15 transition-colors"
              whileTap={{ scale: 0.95 }}
              title="Copy invite link"
              data-tour="playroom-invite-code"
            >
              <AnimatePresence mode="wait">
                {inviteCopied ? (
                  <motion.span
                    key="copied"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-1.5"
                  >
                    <Check size={12} className="text-green-600" />
                    <span className="text-green-600">Copied</span>
                  </motion.span>
                ) : (
                  <motion.span
                    key="code"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-1.5"
                  >
                    <Copy size={11} />
                    {session.inviteCode}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          )}

          {isClinician && (
            <>
              <div className="hidden lg:flex items-center gap-2 bg-accent/5 px-3 py-1.5 rounded-full border border-accent/20">
                <Shield size={12} className="text-accent fill-accent/20" />
                <span className="text-xs font-medium text-accent">Clinician</span>
              </div>
              {subscriptionType === "founding" && (
                <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-100 to-yellow-50 border border-amber-200/60 shadow-sm shadow-amber-100/50" data-testid="badge-playroom-founding">
                  <Crown size={11} className="text-amber-600" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Founder</span>
                </div>
              )}

              <motion.button
                onClick={handleSnapshot}
                className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors cursor-pointer"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                data-testid="button-snapshot"
                title="Export Session Summary"
              >
                <Camera size={20} />
              </motion.button>

              <motion.button
                onClick={() => setToolSelectorOpen(true)}
                className="p-2.5 rounded-xl text-primary hover:bg-secondary/50 transition-colors cursor-pointer"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                data-testid="button-open-tool-selector"
                title="Clinical Tools"
              >
                <Wrench size={20} />
              </motion.button>
            </>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <button className="md:hidden p-2 text-primary hover:bg-secondary rounded-xl transition-colors relative cursor-pointer" data-testid="button-mobile-participants">
                <Users size={20} />
                <AnimatePresence>
                  {onlineUsers.length > 0 && (
                    <motion.span
                      key={onlineUsers.length}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                      className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-accent text-white text-[9px] font-bold rounded-full flex items-center justify-center"
                    >
                      {onlineUsers.length}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[60vh] rounded-t-3xl">
              <SheetHeader className="mb-6">
                <SheetTitle className="font-serif text-xl text-foreground text-left">Participants</SheetTitle>
              </SheetHeader>
              <div className="space-y-3">
                {onlineUsers.map(u => {
                  const isDisconnected = u.status === "disconnected";
                  const isActive = !isDisconnected && u.lastActive && (Date.now() - u.lastActive < 5000);
                  return (
                    <div key={u.participantId} className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/30 transition-colors">
                      <div className="relative">
                        <Avatar className="h-11 w-11 border-2 border-border shadow-sm">
                          <AvatarFallback className={cn("bg-secondary text-foreground", isAnonymous && "bg-neutral-200")}>
                            {isAnonymous ? <Ghost size={18} className="text-muted-foreground" /> : u.displayName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className={cn(
                          "absolute bottom-0 right-0 w-3 h-3 border-2 border-border rounded-full",
                          isDisconnected ? "bg-red-500" : isActive ? "bg-accent animate-pulse" : "bg-green-500"
                        )} />
                      </div>
                      <div>
                        <div className="font-medium text-foreground text-sm flex items-center gap-2">
                          {isAnonymous ? "Anonymous" : u.displayName}
                          {u.displayName.startsWith("Dr") && <Shield size={12} className="text-accent fill-accent/20" />}
                        </div>
                        <div className={cn("text-xs", isDisconnected ? "text-red-500 font-medium" : isActive ? "text-accent font-medium" : "text-green-600")}>
                          {isDisconnected ? "Disconnected" : isActive ? "Active" : "Online"}
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

          <motion.button
            onClick={() => setToolsOpen(!toolsOpen)}
            className={cn("p-2 rounded-xl transition-colors cursor-pointer hidden md:block", toolsOpen ? "bg-primary text-white" : "text-muted-foreground hover:bg-secondary")}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            data-testid="button-toggle-tools"
          >
            <motion.div
              animate={{ rotate: toolsOpen ? 180 : 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <PanelRightClose size={20} />
            </motion.div>
          </motion.button>
          {isClinician && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  className="p-2 text-destructive hover:bg-destructive/10 rounded-xl transition-colors cursor-pointer"
                  data-testid="button-end-session"
                  title="End Session"
                  disabled={endingSession}
                >
                  <Square size={18} className="fill-destructive/20" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-card border border-border shadow-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-serif text-foreground">End This Session?</AlertDialogTitle>
                  <AlertDialogDescription className="text-muted-foreground leading-relaxed">
                    This will end the session for all participants. Everyone will be disconnected and the session will be marked as complete. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleEndSession}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
                    disabled={endingSession}
                    data-testid="button-confirm-end-session"
                  >
                    {endingSession ? "Ending..." : "End Session"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Link href="/dashboard">
            <motion.button
              className="p-2 text-muted-foreground hover:bg-secondary rounded-xl transition-colors cursor-pointer"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              data-testid="button-leave"
            >
              <LogOut size={18} />
            </motion.button>
          </Link>
        </div>
      </motion.header>

      <AnimatePresence>
      {isDemo && (
        <div className="bg-amber-50 border-b border-amber-200/60 px-4 py-2 flex items-center justify-center gap-3 shrink-0 z-20" data-testid="banner-demo-mode">
          <span className="text-xs text-amber-700 font-medium">Demo Mode — changes won't be saved</span>
          <Link href="/dashboard" className="no-underline">
            <span className="text-xs text-accent font-semibold hover:text-accent/80 transition-colors cursor-pointer underline underline-offset-2" data-testid="link-start-real-session">
              Start a Real Session
            </span>
          </Link>
        </div>
      )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* Tool Area */}
        <div className="flex-1 relative overflow-hidden" ref={toolAreaRef}>
          <AnimatePresence mode="wait">
            {activeTool === "volume-mixer" && (
              <motion.div key="volume-mixer" className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2, ease: "easeOut" }}>
                <VolumeMixer />
              </motion.div>
            )}

            {activeTool === "feelings" && (
              <motion.div key="feelings" className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2, ease: "easeOut" }}>
                <FeelingWheel />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tool Transition Label */}
          <AnimatePresence>
            {toolTransitionLabel && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
              >
                <div className="bg-card px-8 py-4 rounded-2xl shadow-xl border border-border">
                  <p className="font-serif text-lg text-foreground tracking-tight">{toolTransitionLabel}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Clinical Insights — clinician only */}
          {isClinician && (
            <ClinicalInsights
              isOpen={insightsOpen}
              onToggle={() => setInsightsOpen(!insightsOpen)}
              activeTool={activeTool}
              sessionContext={{}}
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
              className="w-72 bg-card border-l border-border shadow-2xl z-30 hidden md:flex flex-col"
            >
              <div className="p-5 border-b border-border">
                <h2 className="font-serif text-foreground text-lg">Session Panel</h2>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 px-1">
                  Online ({onlineUsers.length})
                </h3>
                <div className="space-y-2">
                  {onlineUsers.map(u => {
                    const isDisconnected = u.status === "disconnected";
                    const isActive = !isDisconnected && u.lastActive && (Date.now() - u.lastActive < 5000);
                    return (
                      <div key={u.participantId} className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-secondary transition-colors">
                        <div className="relative">
                          <Avatar className="h-9 w-9 border border-border shadow-sm">
                            <AvatarFallback className={cn("bg-secondary text-foreground text-xs", isAnonymous && "bg-neutral-200")}>
                              {isAnonymous ? <Ghost size={13} className="text-muted-foreground" /> : u.displayName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className={cn(
                            "absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-border rounded-full",
                            isDisconnected ? "bg-red-500" : isActive ? "bg-accent animate-pulse" : "bg-green-500"
                          )} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-foreground truncate block">
                            {isAnonymous ? "Anonymous" : u.displayName}
                          </span>
                          <span className={cn("text-[10px]", isDisconnected ? "text-red-500 font-medium" : isActive ? "text-accent" : "text-green-600")}>
                            {isDisconnected ? "Disconnected" : isActive ? "Active" : "Online"}
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
                    <p className="text-lg font-mono font-bold text-foreground tracking-widest" data-testid="text-invite-code">{session.inviteCode}</p>
                  </div>
                )}

                <div className="mt-4 p-4 rounded-2xl bg-secondary">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-2">Active Tool</p>
                  <p className="text-sm font-medium text-foreground">{toolDisplayName(activeTool)}</p>
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
            <div className="bg-card px-5 py-2.5 rounded-full shadow-xl text-foreground text-sm font-medium border border-border flex items-center gap-2">
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

      {isClinician && playroomTourSteps.length > 0 && (
        <GuidedTour
          steps={playroomTourSteps}
          tourKey="playroom"
          isActive={playroomTour.isActive}
          onComplete={playroomTour.complete}
          onSkip={playroomTour.skip}
        />
      )}

      <ConnectionStatus connected={connected} sessionEnded={sessionEnded} />

      {/* Session Ended Overlay */}
      <AnimatePresence>
        {sessionEnded && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(20px)" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[100] bg-background/95 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20, filter: "blur(6px)" }}
              animate={{ scale: 1, opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="text-center max-w-lg mx-auto px-6 w-full"
            >
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 300, damping: 20 }}
                className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center"
              >
                <CheckCircle2 size={32} className="text-primary" />
              </motion.div>
              <h2 className="font-serif text-2xl text-foreground mb-2" data-testid="text-session-complete">Session Complete</h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                {isClinician
                  ? "The session has been ended successfully. All participants have been disconnected."
                  : "This session has ended. Thank you for participating."}
              </p>

              <GlassCard hoverEffect={false} className="text-left p-5 mb-6" data-testid="card-session-summary">
                <h3 className="font-serif text-sm font-semibold text-foreground mb-3">Session Summary</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Shield size={14} className="text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Session Name</p>
                      <p className="text-sm font-medium text-foreground" data-testid="text-session-name">{session?.name || "Untitled Session"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock size={14} className="text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Date & Time</p>
                      <p className="text-sm font-medium text-foreground" data-testid="text-session-datetime">
                        {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        {" at "}
                        {new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Wrench size={14} className="text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Tools Used</p>
                      <div className="flex flex-wrap gap-1.5 mt-1" data-testid="text-tools-used">
                        {Array.from(toolsUsed.current).map(tool => (
                          <span key={tool} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-accent/10 text-accent border border-accent/20">
                            {toolDisplayName(tool)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users size={14} className="text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Participants</p>
                      <p className="text-sm font-medium text-foreground" data-testid="text-participant-count">
                        {peakParticipants.current > 0 ? `${peakParticipants.current} (peak)` : "No participants joined"}
                      </p>
                    </div>
                  </div>
                </div>
              </GlassCard>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
                {isClinician && (
                  <button
                    onClick={handleSnapshot}
                    className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 text-foreground px-6 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer w-full sm:w-auto justify-center"
                    data-testid="button-save-snapshot"
                  >
                    <Download size={16} />
                    Save Snapshot
                  </button>
                )}
                <button
                  onClick={() => navigate(isClinician ? "/dashboard" : "/")}
                  className="btn-warm bg-primary text-primary-foreground px-8 py-3 rounded-xl text-sm font-medium shadow-lg cursor-pointer w-full sm:w-auto"
                  data-testid="button-session-ended-navigate"
                >
                  {isClinician ? "Back to Dashboard" : "Return Home"}
                </button>
              </div>

              {isClinician && (
                <p className="text-xs text-muted-foreground/70 italic" data-testid="text-ehr-reminder">
                  Don't forget to save your session notes to your EHR system.
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
