import { GlassCard } from "@/components/ui/glass-card";
import { LegalDisclaimer } from "@/components/shared/legal-disclaimer";
import {
  Plus, Users, Calendar, ArrowRight, Copy, CheckCircle2, Crown, Flame,
  CreditCard, Star, Lock, CheckCircle, Lightbulb, HelpCircle, AlertTriangle, Clock,
  Palette, Layers, X, Mail, RefreshCw, User, Square, Play, Compass, Shield, Sprout,
  ChevronRight, BarChart3, Settings,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
  { id: "dbt-house", label: "The DBT House", desc: "Build a house layer by layer while exploring core DBT skills", icon: Layers, tier: "free", emoji: "🏡" },
  { id: "cbt-thought-court", label: "The Thought Court", desc: "Put negative thoughts on trial using CBT cognitive restructuring", icon: Square, tier: "free", emoji: "⚖️" },
  { id: "act-values-compass", label: "The Values Compass", desc: "Map your values, spot barriers, and chart a course toward what matters", icon: Compass, tier: "free", emoji: "🧭" },
  { id: "ifs-inner-council", label: "The Inner Council", desc: "Discover your inner parts, seat them at a council table, and respond from Self", icon: Shield, tier: "free", emoji: "\u2694\uFE0F" },
  { id: "mi-motivation-garden", label: "The Motivation Garden", desc: "Grow your motivation for change using seeds, water, and a commitment bouquet", icon: Sprout, tier: "free", emoji: "\uD83C\uDF31" },
  { id: "somatic-grounding-grove", label: "The Grounding Grove", desc: "Explore your body, rate tension, and practice somatic grounding techniques", icon: Layers, tier: "free", emoji: "\u{1F333}" },
  { id: "sfbt-miracle-bridge", label: "The Miracle Bridge", desc: "Walk toward your preferred future using solution-focused questions", icon: Layers, tier: "free", emoji: "\u{1F309}" },
  { id: "narrative-quest", label: "The Narrative Quest", desc: "Externalize problems, find exceptions, and rewrite your story", icon: Layers, tier: "free", emoji: "📖" },
];

const TOOL_ACCENT_COLORS: Record<string, string> = {
  "dbt-house": "#7B9E87",
  "cbt-thought-court": "#8B7BA8",
  "act-values-compass": "#C9956B",
  "ifs-inner-council": "#7B8FA8",
  "mi-motivation-garden": "#7B9E87",
  "somatic-grounding-grove": "#9E8B7B",
  "sfbt-miracle-bridge": "#7B8FA8",
  "narrative-quest": "#A8877B",
};

const CLINICAL_TIPS: { tip: string; tool: string }[] = [];

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

  const toolInfo = initialTool ? ALL_TOOLS.find(t => t.id === initialTool) : null;
  const todayStr = new Date().toLocaleDateString();
  const defaultName = `Session \u2014 ${todayStr}`;

  const handleStart = () => {
    if (!initialTool) return;
    const sessionName = toolInfo ? `${toolInfo.label} \u2014 ${todayStr}` : defaultName;
    onSubmit(sessionName, "solo", initialTool);
  };

  if (!isOpen || !initialTool) return null;

  const accentColor = TOOL_ACCENT_COLORS[initialTool] || "#C9956B";

  return (
    <>
      <motion.div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      />
      <motion.div
        className="fixed inset-x-4 top-[10%] bottom-auto max-h-[85vh] overflow-y-auto md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[440px] md:max-h-[90vh] z-50 bg-[#4A3E32] border border-[#5A4E40] rounded-2xl shadow-2xl"
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 8 }}
        transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-['Playfair_Display'] text-2xl text-[#F0E6D8]" data-testid="text-new-session-title">
              Start Session
            </h2>
            <button onClick={onClose} className="p-2.5 hover:bg-[#5A4E40]/50 rounded-xl transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center" data-testid="button-close-new-session">
              <X size={20} className="text-[#A89880]" />
            </button>
          </div>

          {toolInfo && (
            <div className="rounded-2xl bg-[#3D3228]/80 border border-[#5A4E40]/60 p-5 flex items-start gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border"
                style={{
                  background: `linear-gradient(135deg, ${accentColor}20, ${accentColor}08)`,
                  borderColor: `${accentColor}20`,
                }}
              >
                <span className="text-3xl">{toolInfo.emoji}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-[#F0E6D8] text-base mb-1">{toolInfo.label}</h3>
                <p className="text-xs text-[#A89880] leading-relaxed">{toolInfo.desc}</p>
              </div>
            </div>
          )}

          <button
            onClick={handleStart}
            disabled={isPending}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#C9956B] to-[#B8845E] hover:from-[#D4A57A] hover:to-[#C9956B] text-white font-medium shadow-lg shadow-[#C9956B]/20 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2.5 text-sm sm:text-base min-h-[52px]"
            data-testid="button-quick-start"
          >
            <Play size={18} />
            {isPending ? "Creating..." : `Start ${toolInfo?.label || "Session"}`}
          </button>
          <p className="text-xs text-[#A89880] text-center -mt-2">
            Solo session with {toolInfo?.label || "selected tool"} — jump right in
          </p>
        </div>
      </motion.div>
    </>
  );
}

function OnboardingModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" />
      <div className="fixed inset-x-4 top-[8%] bottom-auto max-h-[88vh] overflow-y-auto md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[500px] md:max-h-[90vh] z-50 bg-[#4A3E32] border border-[#5A4E40] rounded-2xl shadow-2xl">
        <div className="relative">
          <div className="flex justify-center gap-2 pt-6 pb-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === step ? "w-8 bg-[#C9956B]" : i < step ? "w-4 bg-[#7B9E87]" : "w-4 bg-[#5A4E40]"
                }`}
              />
            ))}
          </div>

          {step === 0 && (
            <div className="p-8 pt-4 text-center">
              <div className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-gradient-to-br from-[#C9956B]/15 to-[#7B9E87]/15 flex items-center justify-center">
                <span className="text-4xl">{"\u2728"}</span>
              </div>
              <h2 className="font-['Playfair_Display'] text-2xl text-[#F0E6D8] mb-3" data-testid="text-onboarding-welcome">Welcome to the Community</h2>
              <p className="text-[#A89880] text-sm leading-relaxed max-w-xs mx-auto">
                ClinicalPlay gives you interactive therapy tools that work in real time with your clients. No downloads, no installs — just share an invite code and you're connected.
              </p>
            </div>
          )}

          {step === 1 && (
            <div className="p-8 pt-4 text-center">
              <div className="w-full max-w-[280px] mx-auto mb-5 rounded-2xl bg-gradient-to-br from-[#4A3E32] to-[#3D3228] p-6 relative overflow-hidden border border-[#5A4E40]/40">
                <div className="text-5xl mb-3">{"\u{1F3D6}\uFE0F"}</div>
                <div className="flex flex-wrap justify-center gap-2">
                  {["\u{1F332}", "\u{1F338}", "\u26F0\uFE0F", "\u{1F30A}", "\u2600\uFE0F", "\u{1F3E0}"].map((emoji, i) => (
                    <span key={i} className="text-2xl">{emoji}</span>
                  ))}
                </div>
                <div className="absolute -bottom-2 -right-2 w-24 h-24 bg-[#C9956B]/10 rounded-full blur-xl" />
              </div>
              <h2 className="font-['Playfair_Display'] text-2xl text-[#F0E6D8] mb-3">The Zen Sandtray</h2>
              <p className="text-[#A89880] text-sm leading-relaxed max-w-xs mx-auto">
                Your clients drag and drop expressive items onto a shared canvas. Watch their world unfold in real time — no words needed.
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="p-8 pt-4 text-center">
              <div className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-gradient-to-br from-[#7B9E87]/20 to-[#C9956B]/10 flex items-center justify-center">
                <CheckCircle size={36} className="text-[#8DB89A]" />
              </div>
              <h2 className="font-['Playfair_Display'] text-2xl text-[#F0E6D8] mb-3">You're All Set</h2>
              <p className="text-[#A89880] text-sm leading-relaxed max-w-xs mx-auto">
                Create your first session, share the invite code with a client, and start exploring together. It's that simple.
              </p>
            </div>
          )}

          <div className="p-6 pt-0 flex gap-3">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-5 py-3 rounded-2xl bg-[#5A4E40]/50 text-[#D8CABB] font-medium text-sm hover:bg-[#5A4E40] transition-colors cursor-pointer"
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
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-[#C9956B] to-[#B8845E] text-white font-medium shadow-lg shadow-[#C9956B]/20 hover:from-[#D4A57A] hover:to-[#C9956B] transition-all cursor-pointer flex items-center justify-center gap-2"
              data-testid="button-onboarding-next"
            >
              {step === 2 ? (
                <>
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
                  className="text-sm text-[#8DB89A] hover:text-[#7B9E87] transition-colors cursor-pointer underline underline-offset-2"
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
  const { user, isLoading: authLoading, isAuthenticated, emailConfirmed, accessDenied, session, logout } = useAuth();
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
    if (!authLoading && !isAuthenticated && !accessDenied) {
      navigate("/login");
    }
  }, [authLoading, isAuthenticated, accessDenied, navigate]);

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

  if (authLoading || (!isAuthenticated && !accessDenied)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#3D3228]">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#C9956B]/10 flex items-center justify-center animate-pulse">
            <span className="text-2xl">{"\u2728"}</span>
          </div>
          <p className="text-[#A89880] font-medium" data-testid="text-loading">Loading...</p>
        </div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-[#3D3228]">
        <div className="flex items-center justify-center min-h-screen px-6">
          <div className="max-w-md w-full p-10 text-center bg-[#4A3E32]/80 border border-[#5A4E40]/50 rounded-2xl shadow-xl">
            <div className="w-16 h-16 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-[#C9956B]/15 to-[#8B7BA8]/15 flex items-center justify-center">
              <Lock size={28} className="text-[#C9956B]/60" />
            </div>
            <h2 className="text-2xl font-['Playfair_Display'] text-[#F0E6D8] mb-3">We Haven't Launched Yet</h2>
            <p className="text-[#A89880] leading-relaxed mb-6">
              ClinicalPlay is currently in private preview. We're putting the finishing touches on the platform and will be opening access soon.
            </p>
            <p className="text-sm text-[#7A6E60] mb-6">
              Stay tuned — we'll let you know as soon as you can get started.
            </p>
            <button
              onClick={() => logout()}
              className="w-full py-3 rounded-xl bg-[#5A4E40]/50 text-[#D8CABB] font-medium hover:bg-[#5A4E40] transition-colors cursor-pointer text-sm"
              data-testid="button-access-denied-logout"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  const SessionsView = () => (
    <div className="space-y-5" data-tour="dashboard-sessions">
      <div className="flex items-center gap-3 px-1">
        <div className="p-2 rounded-xl bg-[#7B9E87]/12 text-[#8DB89A]">
          <Users className="w-4 h-4" />
        </div>
        <h2 className="text-xl font-['Playfair_Display'] text-[#F0E6D8] tracking-wide">Active Sessions</h2>
        <span className="ml-1 bg-[#7B9E87]/15 text-[#8DB89A] text-xs px-2.5 py-0.5 rounded-full font-medium">{activeSessions.length}</span>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="p-5 flex flex-col md:flex-row items-center gap-5 animate-pulse bg-[#4A3E32]/70 border border-[#5A4E40]/50 rounded-2xl">
              <div className="w-14 h-14 rounded-2xl bg-[#5A4E40]/60" />
              <div className="flex-1 space-y-2 w-full">
                <div className="h-4 bg-[#5A4E40]/60 rounded-xl w-3/5" />
                <div className="h-3 bg-[#5A4E40]/40 rounded-xl w-2/5" />
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <div className="h-12 bg-[#5A4E40]/50 rounded-2xl w-28" />
                <div className="h-12 bg-[#7B9E87]/20 rounded-2xl w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : activeSessions.length === 0 ? (
        <div className="p-10 text-center bg-[#4A3E32]/70 border border-[#5A4E40]/50 rounded-2xl">
          <div className="w-16 h-16 mx-auto mb-5 rounded-3xl bg-gradient-to-br from-[#7B9E87]/10 to-[#C9956B]/10 flex items-center justify-center">
            <span className="text-3xl">{"\u{1F3D6}\uFE0F"}</span>
          </div>
          <h3 className="text-xl font-['Playfair_Display'] text-[#F0E6D8] mb-2">No active sessions</h3>
          <p className="text-[#A89880] text-sm mb-6 max-w-xs mx-auto">Create a session room and share the invite code with your client to get started.</p>
          <button
            onClick={() => {
              setMobileTab("library");
              const toolsEl = document.querySelector('[data-tour="dashboard-tools"]');
              if (toolsEl) toolsEl.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="px-6 py-3 rounded-2xl inline-flex items-center gap-2 shadow-lg shadow-[#C9956B]/20 cursor-pointer hover:from-[#D4A57A] hover:to-[#C9956B] transition-all bg-gradient-to-r from-[#C9956B] to-[#B8845E] text-white font-medium"
            data-testid="button-new-session-empty"
          >
            <Plus size={18} /> Choose a Tool to Begin
          </button>
          <div className="mt-3">
            <button
              onClick={() => navigate("/playroom/demo")}
              className="text-sm text-[#8DB89A] hover:text-[#7B9E87] transition-colors cursor-pointer underline underline-offset-2"
              data-testid="button-try-demo"
            >
              Or try a demo first
            </button>
          </div>
        </div>
      ) : (
        activeSessions.map((sess) => (
          <div key={sess.id}>
            <div className="group bg-[#4A3E32]/70 backdrop-blur-sm border border-[#5A4E40]/50 rounded-2xl p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-lg shadow-black/10 transition-all duration-300 hover:border-[#7B9E87]/25 hover:shadow-xl">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#7B9E87]/15 to-[#5A8068]/10 flex items-center justify-center text-2xl border border-[#7B9E87]/15 shrink-0">
                  <span className="text-xl">{"\u{1F3AE}"}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-['Playfair_Display'] text-lg text-[#F0E6D8] mb-1">{sess.name}</h3>
                  <div className="flex items-center gap-3 text-sm text-[#A89880]">
                    <span className="flex items-center gap-1">
                      <Calendar size={13} />
                      {new Date(sess.createdAt).toLocaleDateString()}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-[#5A4E40]" />
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#7B9E87]/12 text-[#8DB89A]">active</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  onClick={() => copyInvite(sess.inviteCode)}
                  className="flex items-center gap-2 px-3 py-2.5 bg-[#3D3228]/80 rounded-xl border border-[#5A4E40]/50 cursor-pointer hover:border-[#7B9E87]/20 transition-colors font-mono text-sm min-h-[44px]"
                  data-testid={`button-copy-invite-${sess.id}`}
                >
                  <span className="text-[#B0A090]">{sess.inviteCode}</span>
                  {copied === sess.inviteCode ? <CheckCircle2 size={16} className="text-[#8DB89A]" /> : <Copy size={16} className="text-[#7A6E60]" />}
                </button>
                <Link href={`/playroom/${sess.id}`} className="flex-1 md:flex-none no-underline">
                  <button
                    className="w-full min-h-[44px] rounded-xl bg-[#7B9E87] hover:bg-[#6B8E77] text-white px-5 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#7B9E87]/20"
                    data-testid={`button-join-${sess.id}`}
                  >
                    <Play size={16} />
                    Enter
                  </button>
                </Link>
                {endingSessionId === sess.id ? (
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setEndingSessionId(null)}
                      className="min-h-[44px] px-3 py-2.5 bg-[#5A4E40]/50 border border-[#5A4E40] text-[#A89880] rounded-xl text-xs font-medium cursor-pointer hover:bg-[#5A4E40] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => endSession.mutate(sess.id)}
                      disabled={endSession.isPending}
                      className="min-h-[44px] px-3 py-2.5 bg-[#C27878]/10 border border-[#C27878]/20 text-[#C27878] rounded-xl text-xs font-medium cursor-pointer hover:bg-[#C27878]/20 transition-colors disabled:opacity-50"
                      data-testid={`button-confirm-end-${sess.id}`}
                    >
                      {endSession.isPending ? "Ending..." : "End"}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEndingSessionId(sess.id)}
                    className="min-h-[44px] px-3 py-2.5 text-[#7A6E60] hover:text-[#C27878] hover:bg-[#C27878]/5 rounded-xl transition-colors cursor-pointer"
                    title="End Session"
                    data-testid={`button-end-${sess.id}`}
                  >
                    <Square size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))
      )}

      {pastSessions.length > 0 && (
        <div className="mt-8 space-y-4">
          <div className="flex items-center gap-3 px-1">
            <div className="p-2 rounded-xl bg-[#5A4E40]/30 text-[#7A6E60]">
              <Calendar className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-['Playfair_Display'] text-[#D8CABB] tracking-wide">Past Sessions</h2>
          </div>
          {pastSessions.slice(0, 5).map((sess) => (
            <div key={sess.id} className="bg-[#4A3E32]/40 border border-[#5A4E40]/30 rounded-2xl p-4 flex items-center gap-4 opacity-80">
              <div className="w-10 h-10 rounded-xl bg-[#5A4E40]/40 flex items-center justify-center shrink-0">
                <Calendar size={18} className="text-[#7A6E60]" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-[#D8CABB]">{sess.name}</h4>
                <p className="text-xs text-[#7A6E60]">{new Date(sess.createdAt).toLocaleDateString()}</p>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#5A4E40]/30 text-[#7A6E60]">{sess.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const ToolLibraryView = () => (
    <div className="space-y-6" data-tour="dashboard-tools">
      {favoritedTools.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-1">
            <div className="p-2 rounded-xl bg-[#C9956B]/12 text-[#C9956B]">
              <Star className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-['Playfair_Display'] text-[#F0E6D8] tracking-wide">Frequently Used</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {favoritedTools.map((tool) => {
              const isLocked = tool.tier === "pro" && !isPro;
              const accentColor = TOOL_ACCENT_COLORS[tool.id] || "#C9956B";
              return (
                <div key={tool.id} className="relative bg-[#4A3E32]/60 border border-[#5A4E40]/40 rounded-2xl p-4 transition-all duration-300 hover:border-[#5A4E40] hover:shadow-lg">
                  <button
                    onClick={() => toggleFavorite(tool.id)}
                    className="absolute top-3 right-3 p-1 cursor-pointer z-10"
                    data-testid={`button-unfavorite-${tool.id}`}
                  >
                    <Star size={14} className="text-[#C9956B] fill-[#C9956B]" />
                  </button>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-2 border"
                    style={{
                      background: `linear-gradient(135deg, ${accentColor}20, ${accentColor}08)`,
                      borderColor: `${accentColor}20`,
                    }}
                  >
                    <span className="text-xl">{tool.emoji}</span>
                  </div>
                  <h4 className="text-sm font-medium text-[#F0E6D8]">{tool.label}</h4>
                  {isLocked ? (
                    <button
                      onClick={() => checkout.mutate("monthly")}
                      className="mt-2 text-xs text-[#C9956B] font-medium flex items-center gap-1 cursor-pointer"
                      data-testid={`button-upgrade-fav-${tool.id}`}
                    >
                      <Lock size={10} /> Upgrade
                    </button>
                  ) : (
                    <button
                      onClick={() => { setPreselectedTool(tool.id); setShowNewSession(true); }}
                      className="mt-2 text-xs font-medium flex items-center gap-1 cursor-pointer bg-transparent border-none p-0"
                      style={{ color: `${accentColor}` }}
                    >
                      Launch <ArrowRight size={10} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center gap-3 px-1">
          <div className="p-2 rounded-xl bg-[#8B7BA8]/12 text-[#A898C0]">
            <Palette className="w-4 h-4" />
          </div>
          <h2 className="text-xl font-['Playfair_Display'] text-[#F0E6D8] tracking-wide">All Tools</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ALL_TOOLS.map((tool, i) => {
            const isLocked = tool.tier === "pro" && !isPro;
            const isFavorited = favorites.includes(tool.id);
            const accentColor = TOOL_ACCENT_COLORS[tool.id] || "#C9956B";

            return (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04, ease: [0.25, 0.1, 0.25, 1] }}
              >
              <div
                className={`group relative bg-[#4A3E32]/50 backdrop-blur-sm border border-[#5A4E40]/40 rounded-2xl p-6 transition-all duration-300 hover:bg-[#4A3E32]/80 hover:shadow-lg hover:-translate-y-0.5 ${isLocked ? "opacity-75" : ""}`}
                onMouseEnter={(e) => {
                  if (!isLocked) {
                    e.currentTarget.style.borderColor = `${accentColor}33`;
                    e.currentTarget.style.boxShadow = `0 10px 25px -5px ${accentColor}15`;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '';
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                {isLocked && (
                  <div className="absolute inset-0 bg-[#3D3228]/70 rounded-2xl z-10 flex items-center justify-center">
                    <button
                      onClick={() => checkout.mutate("monthly")}
                      className="bg-gradient-to-r from-[#C9956B] to-[#B8845E] text-white px-4 py-2 rounded-xl text-xs font-medium shadow-lg shadow-[#C9956B]/20 flex items-center gap-1.5 cursor-pointer hover:from-[#D4A57A] hover:to-[#C9956B] transition-all"
                      data-testid={`button-upgrade-${tool.id}`}
                    >
                      <Lock size={12} /> Unlock
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl border transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3 origin-bottom-left"
                    style={{
                      background: `linear-gradient(135deg, ${accentColor}20, ${accentColor}08)`,
                      borderColor: `${accentColor}20`,
                    }}
                  >
                    {tool.emoji}
                  </div>
                  <button
                    onClick={() => toggleFavorite(tool.id)}
                    className="p-1.5 rounded-lg hover:bg-[#5A4E40]/50 transition-colors cursor-pointer"
                    data-testid={`button-favorite-${tool.id}`}
                  >
                    <Star size={14} className={isFavorited ? "text-[#C9956B] fill-[#C9956B]" : "text-[#5A4E40]"} />
                  </button>
                </div>

                <div className="flex items-center gap-1.5 mb-1.5">
                  <h3 className="font-['Playfair_Display'] text-lg text-[#F0E6D8] leading-tight">{tool.label}</h3>
                  {tool.tier === "pro" && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold border bg-[#C9956B]/10 text-[#C9956B] border-[#C9956B]/20">PRO</span>
                  )}
                </div>
                <p className="text-[#A89880] text-sm leading-relaxed mb-5 line-clamp-2">{tool.desc}</p>

                {!isLocked && (
                  <button
                    onClick={() => { setPreselectedTool(tool.id); setShowNewSession(true); }}
                    className="flex items-center text-sm font-medium transition-colors cursor-pointer bg-transparent border-none p-0"
                    style={{ color: `${accentColor}99` }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = accentColor; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = `${accentColor}99`; }}
                    data-testid={`button-launch-${tool.id}`}
                  >
                    Launch <ChevronRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                  </button>
                )}
              </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const AccountSidebar = () => (
    <div className="space-y-5" data-tour="dashboard-account">
      {user && (
        <div className="bg-[#4A3E32]/70 backdrop-blur-sm border border-[#5A4E40]/50 rounded-2xl p-6 flex flex-col items-center text-center shadow-lg shadow-black/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-[#8B7BA8]/[0.06] to-transparent" />

          {user.profileImageUrl ? (
            <img src={user.profileImageUrl} alt="" className="w-20 h-20 rounded-2xl object-cover shadow-lg shadow-[#8B7BA8]/20 mb-4 relative z-10 border-2 border-[#8B7BA8]/20" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#8B7BA8] to-[#6B5B88] flex items-center justify-center text-white font-['Playfair_Display'] text-2xl shadow-lg shadow-[#8B7BA8]/25 mb-4 relative z-10">
              {user.firstName?.charAt(0) || "C"}
            </div>
          )}

          <div className="relative z-10">
            <div className="flex items-center justify-center gap-2 mb-1">
              <h3 className="font-['Playfair_Display'] text-xl text-[#F0E6D8]">{user.firstName} {user.lastName}</h3>
              {subscriptionType === "founding" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#C9956B]/15 text-[#D4A57A] border border-[#C9956B]/20" data-testid="badge-founding-member">
                  <Crown size={10} />
                  Founder
                </span>
              )}
            </div>
            <p className="text-[#A89880] text-sm mb-1">{user.email}</p>
            <span className="bg-[#8B7BA8]/12 text-[#A898C0] text-xs font-medium px-3 py-1 rounded-full inline-block mb-4">
              {isPro
                ? subscriptionType === "founding" ? "Founding Member" : subscriptionType === "annual" ? "Annual Plan" : "Community Plan"
                : "Free Plan"
              }
            </span>
          </div>

          <div className="w-full grid grid-cols-2 gap-3 relative z-10">
            <Link href="/settings" className="no-underline">
              <button className="w-full rounded-xl border border-[#5A4E40]/60 text-[#B0A090] hover:border-[#8B7BA8]/30 hover:text-[#A898C0] py-2.5 text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer" data-testid="button-settings">
                <Settings className="w-4 h-4" />
                Settings
              </button>
            </Link>
            <Link href="/contact" className="no-underline">
              <button className="w-full rounded-xl border border-[#5A4E40]/60 text-[#B0A090] hover:border-[#8B7BA8]/30 hover:text-[#A898C0] py-2.5 text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer" data-testid="button-support-link">
                <HelpCircle className="w-4 h-4" />
                Support
              </button>
            </Link>
          </div>
        </div>
      )}

      {!isPro && remaining > 0 && (
        <div className="bg-gradient-to-br from-[#4E3E2E] to-[#443828] border border-[#C9956B]/15 rounded-2xl p-6 shadow-lg shadow-black/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-[#C9956B]/15 text-[#C9956B]">
              <Flame className="w-5 h-5" />
            </div>
            <h3 className="font-['Playfair_Display'] text-lg text-[#F0E6D8]">Founding Member</h3>
          </div>

          <div className="mb-5">
            <div className="text-2xl text-[#F0E6D8] mb-1 font-['Playfair_Display']">$99 <span className="text-sm text-[#A89880] font-sans">/ lifetime</span></div>
            <p className="text-sm text-[#A89880] leading-relaxed">Lock in lifetime access before we launch to the public.</p>
          </div>

          <div className="space-y-2 mb-5">
            <div className="flex justify-between text-xs text-[#A89880]">
              <span>{percentClaimed}% Claimed</span>
              <span className="text-[#D4A57A] font-medium" data-testid="text-founding-remaining">{remaining} spots left</span>
            </div>
            <div className="w-full h-2 bg-[#5A4E40]/50 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#C9956B] to-[#D4A57A] rounded-full transition-all duration-1000" style={{ width: `${percentClaimed}%` }} />
            </div>
          </div>

          <button
            onClick={() => checkout.mutate("founding")}
            disabled={checkout.isPending}
            className="w-full bg-gradient-to-r from-[#C9956B] to-[#B8845E] hover:from-[#D4A57A] hover:to-[#C9956B] text-white rounded-xl py-3 font-medium shadow-lg shadow-[#C9956B]/20 transition-all text-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            data-testid="button-checkout-founding"
          >
            <Crown size={16} />
            {checkout.isPending ? "Loading..." : "Claim Founding Spot"}
          </button>
          <div className="mt-3 text-center">
            <button
              onClick={() => checkout.mutate("monthly")}
              disabled={checkout.isPending}
              className="text-xs text-[#A89880] hover:text-[#D4A57A] transition-colors cursor-pointer underline"
              data-testid="button-checkout-community"
            >
              Or start at $7/mo
            </button>
          </div>
        </div>
      )}

      {!isPro && remaining <= 0 && (
        <div className="bg-[#4A3E32]/70 border border-[#C9956B]/15 rounded-2xl p-6 shadow-lg shadow-black/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-[#C9956B]/15 text-[#C9956B]">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="font-['Playfair_Display'] text-lg text-[#F0E6D8]">Upgrade to Pro</h3>
          </div>
          <p className="text-sm text-[#A89880] mb-4">
            Unlock all tools for <span className="font-bold text-[#D4A57A]">$7/month</span>.
          </p>
          <button
            onClick={() => checkout.mutate("monthly")}
            disabled={checkout.isPending}
            className="w-full bg-gradient-to-r from-[#C9956B] to-[#B8845E] hover:from-[#D4A57A] hover:to-[#C9956B] text-white rounded-xl py-3 font-medium shadow-lg shadow-[#C9956B]/20 transition-all cursor-pointer disabled:opacity-50"
            data-testid="button-checkout-community-only"
          >
            {checkout.isPending ? "Loading..." : "Start Community Plan"}
          </button>
        </div>
      )}

      {isPro && (subscriptionType === "community" || subscriptionType === "annual") && (
        <Link href="/settings" className="no-underline block">
          <button
            className="w-full bg-[#4A3E32]/50 border border-[#5A4E40]/40 rounded-2xl p-4 flex items-center gap-3 hover:border-[#5A4E40] transition-colors cursor-pointer text-left"
            data-testid="button-manage-billing"
          >
            <div className="p-2 rounded-xl bg-[#C9956B]/10 text-[#C9956B]">
              <CreditCard className="w-4 h-4" />
            </div>
            <span className="text-sm text-[#B0A090] font-medium">Manage Billing</span>
            <ChevronRight className="w-4 h-4 text-[#5A4E40] ml-auto" />
          </button>
        </Link>
      )}

      {CLINICAL_TIPS.length > 0 && (
        <div className="bg-[#4A3E32]/50 border border-[#5A4E40]/40 rounded-2xl p-5 shadow-lg shadow-black/10">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={18} className="text-[#C9956B]" />
            <h3 className="font-['Playfair_Display'] text-sm text-[#F0E6D8]">Clinician's Corner</h3>
          </div>
          <p className="text-sm text-[#A89880] leading-relaxed italic">
            "{CLINICAL_TIPS[tipIndex].tip}"
          </p>
          <p className="text-xs text-[#C9956B] font-medium mt-2">— {CLINICAL_TIPS[tipIndex].tool}</p>
        </div>
      )}

      <div className="bg-[#4A3E32]/50 backdrop-blur-sm border border-[#5A4E40]/40 rounded-2xl p-6 shadow-lg shadow-black/10">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 rounded-xl bg-[#7B8FA8]/12 text-[#8DA0B8]">
            <BarChart3 className="w-4 h-4" />
          </div>
          <h3 className="font-['Playfair_Display'] text-lg text-[#F0E6D8]">Workspace Activity</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#3D3228]/60 rounded-xl p-4 border border-[#7B8FA8]/10">
            <div className="text-[#8DA0B8] text-[10px] mb-1 font-medium tracking-widest uppercase">Total Sessions</div>
            <div className="text-3xl font-['Playfair_Display'] text-[#F0E6D8]" data-testid="text-session-count">{sessions.length}</div>
          </div>
          <div className="bg-[#7B9E87]/[0.07] rounded-xl p-4 border border-[#7B9E87]/12">
            <div className="text-[#8DB89A] text-[10px] mb-1 font-medium tracking-widest uppercase">Active Now</div>
            <div className="text-3xl font-['Playfair_Display'] text-[#8DB89A]" data-testid="text-active-count">{activeSessions.length}</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#3D3228] text-[#D8CABB] pb-24 md:pb-0 pt-20 md:pt-24 px-4 md:px-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#C9956B]/[0.06] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#7B9E87]/[0.04] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-[#8B7BA8]/[0.03] rounded-full blur-[150px] pointer-events-none" />

      {isAuthenticated && !emailConfirmed && (
        <div className="max-w-6xl mx-auto mb-4 relative z-10">
          <div
            className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-[#C9956B]/10 border border-[#C9956B]/20"
            data-testid="banner-email-verification"
          >
            <div className="shrink-0 w-9 h-9 rounded-xl bg-[#C9956B]/15 flex items-center justify-center">
              <Mail size={16} className="text-[#D4A57A]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#F0E6D8]">Please verify your email</p>
              <p className="text-xs text-[#A89880]">Check your inbox for a confirmation link to activate your account.</p>
            </div>
            <button
              onClick={() => resendVerification.mutate()}
              disabled={resendVerification.isPending}
              className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C9956B]/15 hover:bg-[#C9956B]/25 text-[#D4A57A] text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
              data-testid="button-resend-verification"
            >
              <RefreshCw size={12} className={resendVerification.isPending ? "animate-spin" : ""} />
              Resend
            </button>
          </div>
        </div>
      )}

      {billingStatus?.paymentFailed && (
        <div className="max-w-6xl mx-auto mb-4 relative z-10">
          <div
            className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-[#C27878]/10 border border-[#C27878]/20"
            data-testid="banner-payment-failed"
          >
            <div className="shrink-0 w-9 h-9 rounded-xl bg-[#C27878]/15 flex items-center justify-center">
              <AlertTriangle size={16} className="text-[#C27878]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#F0E6D8]">Your payment method needs updating</p>
              <p className="text-xs text-[#A89880]">We were unable to process your latest payment. Please update your payment method to keep your subscription active.</p>
            </div>
            <Link href="/settings" className="no-underline">
              <button
                className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C27878]/15 hover:bg-[#C27878]/25 text-[#C27878] text-xs font-medium transition-colors cursor-pointer"
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
        <div className="max-w-6xl mx-auto mb-4 relative z-10">
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#7B9E87]/8 border border-[#7B9E87]/12"
            data-testid="banner-trial"
          >
            <Clock size={14} className="text-[#8DB89A]/60 shrink-0" />
            <p className="text-xs text-[#8DB89A]/70 font-medium">
              Free trial — {trialDaysLeft} {trialDaysLeft === 1 ? "day" : "days"} remaining
            </p>
            <Link href="/settings" className="ml-auto no-underline">
              <span className="text-xs text-[#8DB89A]/50 hover:text-[#8DB89A] font-medium transition-colors cursor-pointer">
                Upgrade
              </span>
            </Link>
          </div>
        </div>
      )}

      {trialExpired && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" />
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="bg-[#4A3E32] border border-[#5A4E40] rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-[#C9956B]/10 flex items-center justify-center">
                <Lock size={28} className="text-[#C9956B]/60" />
              </div>
              <h2 className="text-2xl font-['Playfair_Display'] text-[#F0E6D8] mb-3">Your free trial has ended</h2>
              <p className="text-[#A89880] text-sm leading-relaxed mb-6">
                Your 7-day free trial has expired. Upgrade to a paid plan to continue using ClinicalPlay's interactive therapy tools.
              </p>
              <Link href="/settings" className="no-underline">
                <button className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#C9956B] to-[#B8845E] text-white font-medium cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-[#C9956B]/20">
                  <Crown size={16} />
                  View Plans & Upgrade
                </button>
              </Link>
              <button
                onClick={() => logout()}
                className="mt-3 w-full py-2.5 rounded-xl text-sm text-[#A89880] hover:text-[#D8CABB] transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-5xl font-['Playfair_Display'] font-normal text-[#F0E6D8] tracking-tight" data-testid="text-dashboard-title">
              Welcome{user?.firstName ? `, ${user.firstName}` : " back"}
            </h1>
            <div className="flex items-center gap-3">
              <span className="text-[#A89880] font-light text-lg">Your clinical workspace</span>
              {isPro && (
                <span className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-medium ${
                  subscriptionType === "founding"
                    ? "bg-[#C9956B]/15 border border-[#C9956B]/25 text-[#D4A57A]"
                    : "bg-[#7B9E87]/15 border border-[#7B9E87]/25 text-[#8DB89A]"
                }`} data-testid="text-plan-badge">
                  {subscriptionType === "founding" ? <Crown size={12} /> : <CheckCircle2 size={12} />}
                  {subscriptionType === "founding" ? "Founding Member" : subscriptionType === "annual" ? "Annual" : "Community"}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => {
              setMobileTab("library");
              const toolsEl = document.querySelector('[data-tour="dashboard-tools"]');
              if (toolsEl) toolsEl.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="bg-gradient-to-r from-[#C9956B] to-[#B8845E] hover:from-[#D4A57A] hover:to-[#C9956B] text-white rounded-full px-7 py-3.5 shadow-lg shadow-[#C9956B]/25 transition-all duration-300 font-medium flex items-center gap-2 text-sm cursor-pointer w-full md:w-auto justify-center"
            data-testid="button-new-session"
          >
            <Plus size={20} /> Start New Session
          </button>
        </div>

        <div className="hidden md:grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-10">
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

      <div className="max-w-6xl mx-auto px-6 pb-24 md:pb-8 relative z-10">
        <LegalDisclaimer />
      </div>

      <AnimatePresence>
        {showNewSession && preselectedTool && (
          <SessionCreationModal
            isOpen={showNewSession}
            onClose={() => setShowNewSession(false)}
            onSubmit={(name, mode, tool) => createSession.mutate({ name, mode, tool })}
            isPending={createSession.isPending}
            initialTool={preselectedTool}
          />
        )}
      </AnimatePresence>

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
