import { GlassCard } from "@/components/ui/glass-card";
import { LegalDisclaimer } from "@/components/shared/legal-disclaimer";
import {
  Plus, Users, Calendar, ArrowRight, Copy, CheckCircle2, Crown, Flame,
  CreditCard, Star, Lock, Sparkles, Lightbulb, HelpCircle, AlertTriangle,
  Palette, Layers, X, Mail, RefreshCw, User, Square, Play
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth, createAuthFetch } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { GuidedTour, useTour, type TourStep } from "@/components/guided-tour";
import type { TherapySession } from "@shared/schema";

interface DashboardTool {
  id: string;
  label: string;
  desc: string;
  icon: React.ElementType;
  tier: "free" | "pro";
  emoji: string;
}

const ALL_TOOLS: DashboardTool[] = [
  { id: "volume-mixer", label: "Volume Mixer", desc: "Externalize internal parts as tactile audio faders", icon: Layers, tier: "free", emoji: "🎚️" },
  { id: "feelings", label: "Feeling Wheel", desc: "Three-tier emotional identification through guided card exploration", icon: Layers, tier: "free", emoji: "🎯" },
  { id: "thought-bridge", label: "Thought Bridge", desc: "CBT thought record — examine evidence and build balanced perspectives", icon: Layers, tier: "free", emoji: "🧠" },
];

const CLINICAL_TIPS: { tip: string; tool: string }[] = [
  // Tips will be added as tools are developed
];

// ---------- Session Creation Modal ----------

function SessionCreationModal({ isOpen, onClose, onSubmit, isPending, initialTool }: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, mode: "solo" | "group", tool: string) => void;
  isPending: boolean;
  initialTool?: string;
}) {
  useEffect(() => {
    if (isOpen && !initialTool) {
      onClose();
    }
  }, [isOpen, initialTool, onClose]);

  if (!isOpen || !initialTool) return null;

  const toolInfo = ALL_TOOLS.find(t => t.id === initialTool);
  const todayStr = new Date().toLocaleDateString();
  const defaultName = `Session \u2014 ${todayStr}`;

  const handleStart = () => {
    const sessionName = toolInfo ? `${toolInfo.label} \u2014 ${todayStr}` : defaultName;
    onSubmit(sessionName, "solo", initialTool);
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 z-50"
        onClick={onClose}
      />
      <div
        className="fixed inset-x-4 top-[10%] bottom-auto max-h-[85vh] overflow-y-auto md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[440px] md:max-h-[90vh] z-50 bg-card border border-border rounded-2xl shadow-2xl"
      >
        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-serif text-2xl text-foreground" data-testid="text-new-session-title">
              Start Session
            </h2>
            <button onClick={onClose} className="p-2.5 hover:bg-secondary/50 rounded-xl transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center" data-testid="button-close-new-session">
              <X size={20} className="text-muted-foreground" />
            </button>
          </div>

          {toolInfo && (
            <div className="rounded-2xl bg-secondary/50 border border-border p-5 flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary/60 to-secondary/30 flex items-center justify-center shrink-0">
                <span className="text-3xl">{toolInfo.emoji}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground text-base mb-1">{toolInfo.label}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{toolInfo.desc}</p>
              </div>
            </div>
          )}

          <button
            onClick={handleStart}
            disabled={isPending}
            className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-medium shadow-md hover:brightness-105 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2.5 text-sm sm:text-base btn-warm min-h-[52px]"
            data-testid="button-quick-start"
          >
            <Play size={18} />
            {isPending ? "Creating..." : `Start ${toolInfo?.label || "Session"}`}
          </button>
          <p className="text-xs text-muted-foreground text-center -mt-2">
            Solo session with {toolInfo?.label || "selected tool"} — jump right in
          </p>
        </div>
      </div>
    </>
  );
}

// ---------- Onboarding Modal ----------

function OnboardingModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" />
      <div className="fixed inset-x-4 top-[8%] bottom-auto max-h-[88vh] overflow-y-auto md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[500px] md:max-h-[90vh] z-50 bg-card border border-border rounded-2xl shadow-2xl">
        <div className="relative">
          <div className="flex justify-center gap-2 pt-6 pb-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === step ? "w-8 bg-primary" : i < step ? "w-4 bg-accent" : "w-4 bg-primary/15"
                }`}
              />
            ))}
          </div>

          {step === 0 && (
            <div className="p-8 pt-4 text-center">
              <div className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                <span className="text-4xl">{"\u2728"}</span>
              </div>
              <h2 className="font-serif text-2xl text-foreground mb-3" data-testid="text-onboarding-welcome">Welcome to the Community</h2>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
                ClinicalPlay gives you interactive therapy tools that work in real time with your clients. No downloads, no installs — just share an invite code and you're connected.
              </p>
            </div>
          )}

          {step === 1 && (
            <div className="p-8 pt-4 text-center">
              <div className="w-full max-w-[280px] mx-auto mb-5 rounded-2xl bg-gradient-to-br from-secondary to-secondary/60 p-6 relative overflow-hidden">
                <div className="text-5xl mb-3">{"\u{1F3D6}\uFE0F"}</div>
                <div className="flex flex-wrap justify-center gap-2">
                  {["\u{1F332}", "\u{1F338}", "\u26F0\uFE0F", "\u{1F30A}", "\u2600\uFE0F", "\u{1F3E0}"].map((emoji, i) => (
                    <span key={i} className="text-2xl">{emoji}</span>
                  ))}
                </div>
                <div className="absolute -bottom-2 -right-2 w-24 h-24 bg-accent/10 rounded-full blur-xl" />
              </div>
              <h2 className="font-serif text-2xl text-foreground mb-3">The Zen Sandtray</h2>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
                Your clients drag and drop expressive items onto a shared canvas. Watch their world unfold in real time — no words needed.
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="p-8 pt-4 text-center">
              <div className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-gradient-to-br from-accent/20 to-primary/10 flex items-center justify-center">
                <Sparkles size={36} className="text-accent" />
              </div>
              <h2 className="font-serif text-2xl text-foreground mb-3">You're All Set</h2>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
                Create your first session, share the invite code with a client, and start exploring together. It's that simple.
              </p>
            </div>
          )}

          <div className="p-6 pt-0 flex gap-3">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-5 py-3 rounded-2xl bg-secondary/50 text-foreground font-medium text-sm hover:bg-secondary transition-colors cursor-pointer"
                data-testid="button-onboarding-back"
              >
                Back
              </button>
            )}
            <button
              onClick={() => {
                if (step < 2) setStep(step + 1);
                else onClose();
              }}
              className="flex-1 py-3 rounded-2xl bg-primary text-primary-foreground font-medium shadow-md hover:brightness-105 transition-all cursor-pointer flex items-center justify-center gap-2 btn-warm"
              data-testid="button-onboarding-next"
            >
              {step === 2 ? (
                <>
                  <Sparkles size={16} />
                  Start Your First Session
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
          {step === 2 && (
            <div className="px-6 pb-6 pt-0 text-center">
              <Link href="/playroom/demo" className="no-underline">
                <button
                  className="text-sm text-accent hover:text-accent/80 transition-colors cursor-pointer underline underline-offset-2"
                  data-testid="button-try-demo-onboarding"
                >
                  Or try a demo first
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ---------- Main Dashboard ----------

export default function Dashboard() {
  const [, navigate] = useLocation();
  const [copied, setCopied] = useState<string | null>(null);
  const [showNewSession, setShowNewSession] = useState(false);
  const [preselectedTool, setPreselectedTool] = useState("");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("cp_favorites") || "[]"); } catch { return []; }
  });
  const [mobileTab, setMobileTab] = useState<"sessions" | "library" | "account">(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash === "tools") return "library";
    if (hash === "account") return "account";
    return "sessions";
  });
  const queryClient = useQueryClient();
  const { user, isLoading: authLoading, isAuthenticated, hasSession, emailConfirmed, accessDenied, session, logout } = useAuth();
  const { toast } = useToast();
  const authFetch = createAuthFetch(session?.access_token);
  const dashboardTour = useTour("dashboard");

  const dashboardTourSteps: TourStep[] = [
    {
      target: "button-new-session",
      title: "Start a Session",
      content: "Create a new session room here. You'll get a unique invite code to share with your client \u2014 they just click the link to join.",
      position: "bottom",
      emoji: "\u{1F3AE}",
    },
    {
      target: "dashboard-sessions",
      title: "Your Sessions",
      content: "All your active and past sessions live here. Copy an invite code or jump right back into a session with one tap.",
      position: "top",
      emoji: "\u{1F4CB}",
    },
    {
      target: "dashboard-tools",
      title: "Clinical Tool Library",
      content: "Browse all 8 interactive therapy tools. Star your favorites for quick access, and try new ones in any session.",
      position: "top",
      emoji: "\u{1F9F0}",
    },
    {
      target: "dashboard-account",
      title: "Your Account",
      content: "Manage your subscription, view session stats, and get quick clinical tips right from your sidebar.",
      position: "left",
      emoji: "\u{1F464}",
    },
  ];

  const [tipIndex] = useState(() => CLINICAL_TIPS.length > 0 ? Math.floor(Math.random() * CLINICAL_TIPS.length) : 0);

  useEffect(() => {
    // Only redirect if there's genuinely no session (not logged in at all)
    // Don't redirect if we have a session but the user query failed
    if (!authLoading && !hasSession) {
      navigate("/login");
    }
  }, [authLoading, hasSession, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("session") === "success") {
      const plan = params.get("plan");
      toast({
        title: plan === "founding" ? "Welcome, Founding Member!" : "Subscription Active!",
        description: plan === "founding"
          ? "You now have lifetime access to ClinicalPlay."
          : plan === "annual"
          ? "Your Annual plan is now active."
          : "Your Community plan is now active.",
      });
      window.history.replaceState({}, "", "/dashboard");
      queryClient.invalidateQueries({ queryKey: ["/api/billing/status"] });
    }
  }, []);

  useEffect(() => {
    if (user && !localStorage.getItem("cp_onboarded")) {
      setShowOnboarding(true);
    }
  }, [user]);

  useEffect(() => {
    const handler = (e: Event) => {
      const tab = (e as CustomEvent).detail as "sessions" | "library" | "account";
      setMobileTab(tab);
    };
    window.addEventListener("dashboard-tab", handler);
    return () => window.removeEventListener("dashboard-tab", handler);
  }, []);

  const handleOnboardingClose = useCallback(() => {
    setShowOnboarding(false);
    localStorage.setItem("cp_onboarded", "true");
    if (!dashboardTour.hasCompleted()) {
      setTimeout(() => dashboardTour.start(), 600);
    } else {
      // Navigate to tools section so user can pick a tool
      setMobileTab("library");
      setTimeout(() => {
        const toolsEl = document.querySelector('[data-tour="dashboard-tools"]');
        if (toolsEl) toolsEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [dashboardTour]);

  const toggleFavorite = useCallback((toolId: string) => {
    setFavorites(prev => {
      const next = prev.includes(toolId) ? prev.filter(f => f !== toolId) : [...prev, toolId];
      localStorage.setItem("cp_favorites", JSON.stringify(next));
      return next;
    });
  }, []);

  const { data: sessions = [], isLoading } = useQuery<TherapySession[]>({
    queryKey: ["/api/therapy-sessions/mine"],
    queryFn: async () => {
      const res = await authFetch("/api/therapy-sessions/mine");
      if (!res.ok) return [];
      return res.json();
    },
    enabled: isAuthenticated,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const { data: billingStatus } = useQuery<{ isPro: boolean; subscriptionType: string; paymentFailed: boolean; trialEndsAt: number | null; trialActive: boolean; trialExpired: boolean }>({
    queryKey: ["/api/billing/status"],
    queryFn: async () => {
      const res = await authFetch("/api/billing/status");
      if (!res.ok) return { isPro: false, subscriptionType: "free", paymentFailed: false, trialEndsAt: null, trialActive: false, trialExpired: false };
      return res.json();
    },
    enabled: isAuthenticated,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const { data: foundingSlots } = useQuery<{ total: number; remaining: number }>({
    queryKey: ["/api/billing/founding-slots"],
    queryFn: async () => {
      const res = await fetch("/api/billing/founding-slots");
      return res.json();
    },
    staleTime: 5 * 60_000,
  });

  const pendingToolRef = useRef("");

  const createSession = useMutation({
    mutationFn: async ({ name, mode, tool }: { name: string; mode: string; tool: string }) => {
      pendingToolRef.current = tool || ALL_TOOLS[0]?.id || "volume-mixer";
      const res = await authFetch("/api/therapy-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: `${name}${mode === "group" ? " (Group)" : ""}` }),
      });
      return res.json();
    },
    onSuccess: (session: TherapySession) => {
      setShowNewSession(false);
      queryClient.invalidateQueries({ queryKey: ["/api/therapy-sessions/mine"] });
      navigate(`/playroom/${session.id}?tool=${pendingToolRef.current}`);
    },
  });

  const [endingSessionId, setEndingSessionId] = useState<string | null>(null);

  const endSession = useMutation({
    mutationFn: async (sessionId: string) => {
      const res = await authFetch(`/api/therapy-sessions/${sessionId}/end`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to end session");
      return res.json();
    },
    onSuccess: () => {
      setEndingSessionId(null);
      queryClient.invalidateQueries({ queryKey: ["/api/therapy-sessions/mine"] });
      toast({ title: "Session ended", description: "The session has been ended for all participants." });
    },
    onError: () => {
      setEndingSessionId(null);
      toast({ title: "Error", description: "Could not end the session. Please try again.", variant: "destructive" });
    },
  });

  const checkout = useMutation({
    mutationFn: async (plan: "monthly" | "annual" | "founding") => {
      const res = await authFetch("/api/billing/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Checkout failed");
      }
      return res.json();
    },
    onSuccess: (data: { url: string }) => {
      if (data.url) window.location.href = data.url;
    },
    onError: (err: Error) => {
      toast({ title: "Checkout Error", description: err.message, variant: "destructive" });
    },
  });

  const resendVerification = useMutation({
    mutationFn: async () => {
      const res = await authFetch("/api/auth/resend-verification", { method: "POST" });
      if (!res.ok) throw new Error("Failed to resend verification email");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Verification email sent", description: "Please check your inbox and spam folder." });
    },
    onError: () => {
      toast({ title: "Could not send email", description: "Please try again in a moment.", variant: "destructive" });
    },
  });

  const copyInvite = (code: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/join/${code}`);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const isPro = billingStatus?.isPro ?? false;
  const subscriptionType = billingStatus?.subscriptionType ?? "free";
  const remaining = foundingSlots?.remaining ?? 0;
  const total = foundingSlots?.total ?? 100;
  const percentClaimed = Math.round(((total - remaining) / total) * 100);
  const trialActive = billingStatus?.trialActive ?? false;
  const trialExpired = billingStatus?.trialExpired ?? false;
  const trialDaysLeft = billingStatus?.trialEndsAt
    ? Math.max(0, Math.ceil((billingStatus.trialEndsAt - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  const activeSessions = sessions.filter(s => s.status === "active");
  const pastSessions = sessions.filter(s => s.status !== "active");
  const favoritedTools = ALL_TOOLS.filter(t => favorites.includes(t.id));

  if (authLoading || !hasSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center animate-pulse">
            <span className="text-2xl">{"\u2728"}</span>
          </div>
          <p className="text-muted-foreground font-medium" data-testid="text-loading">Loading...</p>
        </div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-screen px-6">
          <GlassCard className="max-w-md w-full p-10 text-center" hoverEffect={false}>
            <div className="w-16 h-16 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
              <Lock size={28} className="text-primary/60" />
            </div>
            <h2 className="text-2xl font-serif text-foreground mb-3">We Haven't Launched Yet</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              ClinicalPlay is currently in private preview. We're putting the finishing touches on the platform and will be opening access soon.
            </p>
            <p className="text-sm text-muted-foreground/70 mb-6">
              Stay tuned — we'll let you know as soon as you can get started.
            </p>
            <button
              onClick={() => logout()}
              className="w-full py-3 rounded-xl bg-primary/10 text-primary font-medium hover:bg-primary/15 transition-colors cursor-pointer text-sm"
              data-testid="button-access-denied-logout"
            >
              Sign Out
            </button>
          </GlassCard>
        </div>
      </div>
    );
  }

  const SessionsView = () => (
    <div className="space-y-6" data-tour="dashboard-sessions">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-foreground flex items-center gap-2">
          <Users size={18} className="text-accent" /> Active Sessions
        </h2>
        <span className="text-xs text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full">{activeSessions.length} active</span>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <GlassCard key={i} className="p-5 flex flex-col md:flex-row items-center gap-5 animate-pulse" hoverEffect={false}>
              <div className="w-12 h-12 rounded-2xl bg-secondary/60" />
              <div className="flex-1 space-y-2 w-full">
                <div className="h-4 bg-secondary/60 rounded-xl w-3/5" />
                <div className="h-3 bg-secondary/40 rounded-xl w-2/5" />
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <div className="h-12 bg-secondary/50 rounded-2xl w-28" />
                <div className="h-12 bg-accent/20 rounded-2xl w-24" />
              </div>
            </GlassCard>
          ))}
        </div>
      ) : activeSessions.length === 0 ? (
        <GlassCard className="p-10 text-center" hoverEffect={false}>
          <div className="w-16 h-16 mx-auto mb-5 rounded-3xl bg-gradient-to-br from-primary/5 to-accent/10 flex items-center justify-center">
            <span className="text-3xl">{"\u{1F3D6}\uFE0F"}</span>
          </div>
          <h3 className="text-xl font-serif text-foreground mb-2">No active sessions</h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">Create a session room and share the invite code with your client to get started.</p>
          <button
            onClick={() => {
              setMobileTab("library");
              const toolsEl = document.querySelector('[data-tour="dashboard-tools"]');
              if (toolsEl) toolsEl.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="px-6 py-3 rounded-2xl inline-flex items-center gap-2 shadow-md cursor-pointer hover:brightness-105 transition-all bg-primary text-primary-foreground font-medium btn-warm"
            data-testid="button-new-session-empty"
          >
            <Plus size={18} /> Choose a Tool to Begin
          </button>
          <div className="mt-3">
            <button
              onClick={() => navigate("/playroom/demo")}
              className="text-sm text-accent hover:text-accent/80 transition-colors cursor-pointer underline underline-offset-2"
              data-testid="button-try-demo"
            >
              Or try a demo first
            </button>
          </div>
        </GlassCard>
      ) : (
        activeSessions.map((sess) => (
          <div key={sess.id}>
            <GlassCard className="p-5 flex flex-col md:flex-row items-center gap-5" hoverEffect={true}>
              <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center shrink-0">
                <span className="text-xl">{"\u{1F3AE}"}</span>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-base font-serif text-foreground">{sess.name}</h3>
                <div className="flex items-center justify-center md:justify-start gap-3 mt-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar size={13} />
                    {new Date(sess.createdAt).toLocaleDateString()}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">active</span>
                </div>
              </div>
              <div className="flex gap-2 w-full md:w-auto flex-col sm:flex-row items-center">
                <button
                  onClick={() => copyInvite(sess.inviteCode)}
                  className="min-h-[48px] px-4 py-3 bg-secondary border border-border text-foreground rounded-2xl text-sm font-medium hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2 cursor-pointer font-mono tracking-wider"
                  data-testid={`button-copy-invite-${sess.id}`}
                >
                  {copied === sess.inviteCode ? <CheckCircle2 size={16} className="text-primary" /> : <Copy size={16} />}
                  {copied === sess.inviteCode ? "Copied!" : sess.inviteCode}
                </button>
                <Link href={`/playroom/${sess.id}`} className="flex-1 no-underline">
                  <button
                    className="w-full min-h-[48px] px-5 py-3 bg-primary text-primary-foreground rounded-2xl text-sm font-medium shadow-md hover:brightness-105 transition-all flex items-center justify-center gap-2 cursor-pointer btn-warm"
                    data-testid={`button-join-${sess.id}`}
                  >
                    Enter <ArrowRight size={16} />
                  </button>
                </Link>
                {endingSessionId === sess.id ? (
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setEndingSessionId(null)}
                      className="min-h-[48px] px-3 py-3 bg-secondary border border-border text-muted-foreground rounded-2xl text-xs font-medium cursor-pointer hover:bg-secondary/80 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => endSession.mutate(sess.id)}
                      disabled={endSession.isPending}
                      className="min-h-[48px] px-3 py-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-2xl text-xs font-medium cursor-pointer hover:bg-destructive/20 transition-colors disabled:opacity-50"
                      data-testid={`button-confirm-end-${sess.id}`}
                    >
                      {endSession.isPending ? "Ending..." : "End"}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEndingSessionId(sess.id)}
                    className="min-h-[48px] px-3 py-3 text-destructive/60 hover:text-destructive hover:bg-destructive/5 rounded-2xl transition-colors cursor-pointer"
                    title="End Session"
                    data-testid={`button-end-${sess.id}`}
                  >
                    <Square size={16} className="fill-destructive/20" />
                  </button>
                )}
              </div>
            </GlassCard>
          </div>
        ))
      )}

      {pastSessions.length > 0 && (
        <div className="mt-8 space-y-4">
          <h2 className="text-lg font-medium text-foreground flex items-center gap-2">
            <Calendar size={18} className="text-muted-foreground" /> Past Sessions
          </h2>
          {pastSessions.slice(0, 5).map((sess) => (
            <div key={sess.id}>
              <GlassCard className="p-4 flex items-center gap-4 opacity-80" hoverEffect={false}>
                <div className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center shrink-0">
                  <Calendar size={18} className="text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-foreground">{sess.name}</h4>
                  <p className="text-xs text-muted-foreground">{new Date(sess.createdAt).toLocaleDateString()}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">{sess.status}</span>
              </GlassCard>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const ToolLibraryView = () => (
    <div className="space-y-6" data-tour="dashboard-tools">
      {favoritedTools.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-medium text-foreground flex items-center gap-2">
            <Star size={18} className="text-amber-500 fill-amber-500" /> Frequently Used
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {favoritedTools.map((tool) => {
              const isLocked = tool.tier === "pro" && !isPro;
              return (
                <GlassCard key={tool.id} className="p-4 relative" hoverEffect={!isLocked}>
                  <button
                    onClick={() => toggleFavorite(tool.id)}
                    className="absolute top-3 right-3 p-1 cursor-pointer z-10"
                    data-testid={`button-unfavorite-${tool.id}`}
                  >
                    <Star size={14} className="text-amber-500 fill-amber-500" />
                  </button>
                  <span className="text-2xl mb-2 block">{tool.emoji}</span>
                  <h4 className="text-sm font-medium text-foreground">{tool.label}</h4>
                  {isLocked ? (
                    <button
                      onClick={() => checkout.mutate("monthly")}
                      className="mt-2 text-xs text-accent font-medium flex items-center gap-1 cursor-pointer"
                      data-testid={`button-upgrade-fav-${tool.id}`}
                    >
                      <Lock size={10} /> Upgrade
                    </button>
                  ) : (
                    <button onClick={() => { setPreselectedTool(tool.id); setShowNewSession(true); }} className="mt-2 text-xs text-accent font-medium flex items-center gap-1 cursor-pointer bg-transparent border-none p-0">
                      Launch <ArrowRight size={10} />
                    </button>
                  )}
                </GlassCard>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h2 className="text-lg font-medium text-foreground flex items-center gap-2">
          <Palette size={18} className="text-accent" /> All Tools
        </h2>
        <div className="columns-1 sm:columns-2 gap-3 space-y-3">
          {ALL_TOOLS.map((tool, i) => {
            const isLocked = tool.tier === "pro" && !isPro;
            const isFavorited = favorites.includes(tool.id);
            const isExpanded = i === 0 || i === 3 || i === 5;

            return (
              <div
                key={tool.id}
                className="break-inside-avoid"
              >
                <GlassCard className={`relative ${isLocked ? "opacity-75" : ""} ${isExpanded ? "p-6" : "p-5"}`} hoverEffect={!isLocked}>
                  {isLocked && (
                    <div className="absolute inset-0 bg-card/60 rounded-2xl z-10 flex items-center justify-center">
                      <button
                        onClick={() => checkout.mutate("monthly")}
                        className="bg-primary text-primary-foreground px-5 py-2.5 rounded-2xl text-sm font-medium shadow-md flex items-center gap-2 cursor-pointer hover:brightness-105 transition-all btn-warm"
                        data-testid={`button-upgrade-${tool.id}`}
                      >
                        <Lock size={14} /> Upgrade to Unlock
                      </button>
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-3">
                    <div className={`${isExpanded ? "w-14 h-14" : "w-12 h-12"} rounded-2xl bg-gradient-to-br from-secondary/60 to-secondary/30 flex items-center justify-center shrink-0`}>
                      <span className={isExpanded ? "text-3xl" : "text-2xl"}>{tool.emoji}</span>
                    </div>
                    <button
                      onClick={() => toggleFavorite(tool.id)}
                      className="p-1.5 rounded-xl hover:bg-secondary/50 transition-colors cursor-pointer"
                      data-testid={`button-favorite-${tool.id}`}
                    >
                      <Star size={14} className={isFavorited ? "text-amber-500 fill-amber-500" : "text-muted-foreground/40"} />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-foreground text-sm">{tool.label}</h3>
                    {tool.tier === "pro" && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold border bg-primary/10 text-primary border-primary/20">PRO</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{tool.desc}</p>

                  {!isLocked && (
                    <button
                      onClick={() => { setPreselectedTool(tool.id); setShowNewSession(true); }}
                      className="w-full px-4 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer flex items-center justify-center gap-1 border bg-primary/10 text-primary border-primary/15 hover:bg-primary/15"
                      data-testid={`button-launch-${tool.id}`}
                    >
                      Launch <ArrowRight size={12} />
                    </button>
                  )}
                </GlassCard>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const AccountSidebar = () => (
    <div className="space-y-5" data-tour="dashboard-account">
      {user && (
        <GlassCard className="p-5" hoverEffect={false}>
          <div className="flex items-center gap-4 mb-4">
            {user.profileImageUrl ? (
              <img src={user.profileImageUrl} alt="" className="w-14 h-14 rounded-2xl object-cover border-2 border-border shadow-sm" />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-serif text-xl shadow-md">
                {user.firstName?.charAt(0) || "C"}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <p className="font-serif text-foreground font-medium">{user.firstName} {user.lastName}</p>
                {subscriptionType === "founding" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-amber-100 to-yellow-50 text-amber-700 border border-amber-200/60 shadow-sm" data-testid="badge-founding-member">
                    <Crown size={10} className="text-amber-600" />
                    Founder
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{user.email}</p>
              <p className="text-xs text-accent font-medium mt-0.5">
                {isPro
                  ? subscriptionType === "founding" ? "Founding Member" : subscriptionType === "annual" ? "Annual Plan" : "Community Plan"
                  : "Free Plan"
                }
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <Link href="/settings" className="no-underline">
              <button className="w-full py-2.5 rounded-xl bg-secondary/50 text-foreground text-sm font-medium hover:bg-secondary transition-colors cursor-pointer flex items-center justify-center gap-2" data-testid="button-settings">
                <User size={14} />
                Settings
              </button>
            </Link>
            {isPro && (subscriptionType === "community" || subscriptionType === "annual") && (
              <Link href="/settings" className="no-underline">
                <button
                  className="w-full py-2.5 rounded-xl bg-secondary/50 text-foreground text-sm font-medium hover:bg-secondary transition-colors cursor-pointer flex items-center justify-center gap-2"
                  data-testid="button-manage-billing"
                >
                  <CreditCard size={14} />
                  Manage Billing
                </button>
              </Link>
            )}
            <Link href="/contact" className="no-underline">
              <button className="w-full py-2.5 rounded-xl bg-secondary/50 text-foreground text-sm font-medium hover:bg-secondary transition-colors cursor-pointer flex items-center justify-center gap-2" data-testid="button-support-link">
                <HelpCircle size={14} />
                Support
              </button>
            </Link>
          </div>
        </GlassCard>
      )}

      {!isPro && remaining > 0 && (
        <GlassCard className="p-5 border-primary/20 bg-primary/[0.02]" hoverEffect={false}>
          <div className="flex items-center gap-2 mb-3">
            <Flame size={18} className="text-accent" />
            <h3 className="font-serif text-lg text-foreground">Founding Member</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Lifetime access for a one-time <span className="font-bold text-foreground">$99</span>.
          </p>
          <div className="mb-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span>{percentClaimed}% claimed</span>
              <span className="font-semibold text-foreground" data-testid="text-founding-remaining">{remaining} left</span>
            </div>
            <div className="w-full bg-primary/10 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-accent to-primary rounded-full transition-all duration-1000"
                style={{ width: `${percentClaimed}%` }}
              />
            </div>
          </div>
          <button
            onClick={() => checkout.mutate("founding")}
            disabled={checkout.isPending}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium shadow-md hover:brightness-105 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 btn-warm"
            data-testid="button-checkout-founding"
          >
            <Crown size={16} />
            {checkout.isPending ? "Loading..." : "Claim Founding Spot"}
          </button>
          <div className="mt-3 text-center">
            <button
              onClick={() => checkout.mutate("monthly")}
              disabled={checkout.isPending}
              className="text-xs text-muted-foreground hover:text-accent transition-colors cursor-pointer underline"
              data-testid="button-checkout-community"
            >
              Or start at $7/mo
            </button>
          </div>
        </GlassCard>
      )}

      {!isPro && remaining <= 0 && (
        <GlassCard className="p-5 border-accent/20" hoverEffect={false}>
          <div className="flex items-center gap-2 mb-3">
            <CreditCard size={18} className="text-accent" />
            <h3 className="font-serif text-lg text-foreground">Upgrade to Pro</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Unlock all tools for <span className="font-bold text-accent">$7/month</span>.
          </p>
          <button
            onClick={() => checkout.mutate("monthly")}
            disabled={checkout.isPending}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium shadow-md hover:brightness-105 transition-all cursor-pointer disabled:opacity-50 btn-warm"
            data-testid="button-checkout-community-only"
          >
            {checkout.isPending ? "Loading..." : "Start Community Plan"}
          </button>
        </GlassCard>
      )}

      {CLINICAL_TIPS.length > 0 && (
        <GlassCard className="p-5 border-accent/10" hoverEffect={false}>
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={18} className="text-accent" />
            <h3 className="font-serif text-sm text-foreground">Clinician's Corner</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed italic">
            "{CLINICAL_TIPS[tipIndex].tip}"
          </p>
          <p className="text-xs text-accent font-medium mt-2">— {CLINICAL_TIPS[tipIndex].tool}</p>
        </GlassCard>
      )}

      <GlassCard className="p-5" hoverEffect={false}>
        <h3 className="font-serif text-sm text-foreground mb-3">Quick Stats</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 rounded-2xl bg-secondary/30">
            <p className="text-2xl font-serif text-foreground" data-testid="text-session-count">{sessions.length}</p>
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Total Sessions</p>
          </div>
          <div className="text-center p-3 rounded-2xl bg-secondary/30">
            <p className="text-2xl font-serif text-foreground" data-testid="text-active-count">{activeSessions.length}</p>
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Active</p>
          </div>
        </div>
      </GlassCard>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0 pt-20 md:pt-24 px-4 md:px-8">
      {isAuthenticated && !emailConfirmed && (
        <div className="max-w-7xl mx-auto mb-4">
          <div
            className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/60"
            data-testid="banner-email-verification"
          >
            <div className="shrink-0 w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
              <Mail size={16} className="text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-amber-900">Please verify your email</p>
              <p className="text-xs text-amber-700/70">Check your inbox for a confirmation link to activate your account.</p>
            </div>
            <button
              onClick={() => resendVerification.mutate()}
              disabled={resendVerification.isPending}
              className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-100 hover:bg-amber-200/80 text-amber-800 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
              data-testid="button-resend-verification"
            >
              <RefreshCw size={12} className={resendVerification.isPending ? "animate-spin" : ""} />
              Resend
            </button>
          </div>
        </div>
      )}

      {billingStatus?.paymentFailed && (
        <div className="max-w-7xl mx-auto mb-4">
          <div
            className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-red-50/80 border border-red-200/60"
            data-testid="banner-payment-failed"
          >
            <div className="shrink-0 w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center">
              <AlertTriangle size={16} className="text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-red-900">Your payment method needs updating</p>
              <p className="text-xs text-red-700/70">We were unable to process your latest payment. Please update your payment method to keep your subscription active.</p>
            </div>
            <Link href="/settings" className="no-underline">
              <button
                className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-100 hover:bg-red-200/80 text-red-800 text-xs font-medium transition-colors cursor-pointer"
                data-testid="button-update-payment"
              >
                <CreditCard size={12} />
                Update Payment
              </button>
            </Link>
          </div>
        </div>
      )}

      {trialActive && !isPro && (
        <div className="max-w-7xl mx-auto mb-4">
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/5 border border-primary/10"
            data-testid="banner-trial"
          >
            <Sparkles size={14} className="text-primary/60 shrink-0" />
            <p className="text-xs text-primary/70 font-medium">
              Free trial — {trialDaysLeft} {trialDaysLeft === 1 ? "day" : "days"} remaining
            </p>
            <Link href="/settings" className="ml-auto no-underline">
              <span className="text-xs text-primary/50 hover:text-primary font-medium transition-colors cursor-pointer">
                Upgrade
              </span>
            </Link>
          </div>
        </div>
      )}

      {trialExpired && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50" />
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Lock size={28} className="text-primary/60" />
              </div>
              <h2 className="text-2xl font-serif text-foreground mb-3">Your free trial has ended</h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Your 7-day free trial has expired. Upgrade to a paid plan to continue using ClinicalPlay's interactive therapy tools.
              </p>
              <Link href="/settings" className="no-underline">
                <button className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-medium btn-warm cursor-pointer flex items-center justify-center gap-2">
                  <Crown size={16} />
                  View Plans & Upgrade
                </button>
              </Link>
              <button
                onClick={() => logout()}
                className="mt-3 w-full py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif text-foreground mb-1" data-testid="text-dashboard-title">
              Welcome back{user?.firstName ? `, ${user.firstName}` : ""}
            </h1>
            <p className="text-muted-foreground text-sm flex items-center gap-2">
              Your clinical workspace
              {isPro && (
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                  subscriptionType === "founding"
                    ? "bg-primary/10 text-primary"
                    : "bg-accent/10 text-accent"
                }`} data-testid="text-plan-badge">
                  {subscriptionType === "founding" ? <Crown size={12} /> : <CheckCircle2 size={12} />}
                  {subscriptionType === "founding" ? "Founding Member" : subscriptionType === "annual" ? "Annual" : "Community"}
                </span>
              )}
            </p>
          </div>
          <button
            onClick={() => {
              setMobileTab("library");
              const toolsEl = document.querySelector('[data-tour="dashboard-tools"]');
              if (toolsEl) toolsEl.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="px-7 py-3.5 rounded-2xl flex items-center gap-2.5 shadow-md cursor-pointer w-full md:w-auto justify-center bg-primary text-primary-foreground font-medium btn-warm"
            data-testid="button-new-session"
          >
            <Plus size={20} /> Start New Session
          </button>
        </div>

        <div className="hidden md:grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <SessionsView />
            <ToolLibraryView />
          </div>
          <div>
            <AccountSidebar />
          </div>
        </div>

        <div className="md:hidden">
          {mobileTab === "sessions" && (
            <div>
              <SessionsView />
            </div>
          )}
          {mobileTab === "library" && (
            <div>
              <ToolLibraryView />
            </div>
          )}
          {mobileTab === "account" && (
            <div>
              <AccountSidebar />
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-24 md:pb-8">
        <LegalDisclaimer />
      </div>

      <SessionCreationModal
        isOpen={showNewSession}
        onClose={() => setShowNewSession(false)}
        onSubmit={(name, mode, tool) => createSession.mutate({ name, mode, tool })}
        isPending={createSession.isPending}
        initialTool={preselectedTool}
      />

      <OnboardingModal
        isOpen={showOnboarding}
        onClose={handleOnboardingClose}
      />

      <GuidedTour
        steps={dashboardTourSteps}
        tourKey="dashboard"
        isActive={dashboardTour.isActive}
        onComplete={() => {
          dashboardTour.complete();
          setMobileTab("library");
          setTimeout(() => {
            const toolsEl = document.querySelector('[data-tour="dashboard-tools"]');
            if (toolsEl) toolsEl.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 100);
        }}
        onSkip={() => {
          dashboardTour.skip();
          setMobileTab("library");
          setTimeout(() => {
            const toolsEl = document.querySelector('[data-tour="dashboard-tools"]');
            if (toolsEl) toolsEl.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 100);
        }}
      />
    </div>
  );
}
