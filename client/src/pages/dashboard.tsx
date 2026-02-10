import { Navbar } from "@/components/layout/navbar";
import { GlassCard } from "@/components/ui/glass-card";
import { LegalDisclaimer } from "@/components/shared/legal-disclaimer";
import {
  Plus, Users, Calendar, ArrowRight, Copy, CheckCircle2, Crown, Flame,
  CreditCard, Star, Lock, Sparkles, Lightbulb, ExternalLink, HelpCircle, AlertTriangle,
  Palette, Wind, Target, Clock, Layers, House, Brain, Gamepad2, TreePine, Theater,
  X, UserPlus, Mail, RefreshCw, User
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback, useMemo } from "react";
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
  { id: "sandtray", label: "Zen Sandtray", desc: "Expressive world-building with drag-and-drop assets", icon: Palette, tier: "free", emoji: "🏖️" },
  { id: "breathing", label: "Calm Breathing", desc: "Synchronized breathing exercise for the group", icon: Wind, tier: "free", emoji: "🫧" },
  { id: "feelings", label: "Feeling Wheel", desc: "Multi-layered emotional identification", icon: Target, tier: "free", emoji: "🎯" },
  { id: "narrative", label: "Narrative Timeline", desc: "Visual life story and event mapping", icon: Clock, tier: "pro", emoji: "🌊" },
  { id: "values-sort", label: "Values Card Sort", desc: "Interactive values prioritization", icon: Layers, tier: "pro", emoji: "🃏" },
  { id: "garden", label: "Growth Garden", desc: "Collaborative planting for rapport building", icon: TreePine, tier: "pro", emoji: "🌱" },
  { id: "fidgets", label: "Fidget Tools", desc: "Calming sensory interactions", icon: Gamepad2, tier: "pro", emoji: "🔮" },
  { id: "parts-theater", label: "Parts Theater", desc: "IFS-inspired internal parts mapping and exploration", icon: Theater, tier: "free", emoji: "🎭" },
];

const CLINICAL_TIPS = [
  { tip: "Use the Sandtray at the start of a session to help clients externalize their inner world.", tool: "Zen Sandtray" },
  { tip: "The Breathing Guide is a great warm-up before diving into deeper therapeutic work.", tool: "Calm Breathing" },
  { tip: "Try the Feeling Wheel when a client says 'I don't know how I feel' — it gives them language.", tool: "Feeling Wheel" },
  { tip: "End sessions with the Growth Garden to reinforce progress and build rapport.", tool: "Growth Garden" },
  { tip: "The Narrative Timeline helps clients see patterns across their life events.", tool: "Narrative Timeline" },
  { tip: "Fidget Tools can help regulate clients who need sensory input during talk therapy.", tool: "Fidget Tools" },
  { tip: "Values Card Sort is powerful for clients navigating major life transitions.", tool: "Values Card Sort" },
];

function NewSessionModal({ isOpen, onClose, onSubmit, isPending }: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, mode: "solo" | "group") => void;
  isPending: boolean;
}) {
  const [name, setName] = useState("");
  const [mode, setMode] = useState<"solo" | "group">("solo");

  const containsPotentialName = useMemo(() => {
    return /\b[A-Z][a-z]+\s+[A-Z][a-z]+/.test(name);
  }, [name]);

  useEffect(() => {
    if (isOpen) {
      setName("");
      setMode("solo");
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed inset-x-4 top-[10%] bottom-auto max-h-[85vh] overflow-y-auto md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[460px] md:max-h-[90vh] z-50 bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/40"
          >
            <div className="p-6 pb-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-2xl text-primary" data-testid="text-new-session-title">New Session</h2>
                <button onClick={onClose} className="p-2 hover:bg-secondary/50 rounded-xl transition-colors cursor-pointer" data-testid="button-close-new-session">
                  <X size={20} className="text-muted-foreground" />
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="text-xs font-semibold text-primary/60 uppercase tracking-[0.15em] block mb-2">Session Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={`Session — ${new Date().toLocaleDateString()}`}
                    className="w-full px-4 py-3.5 rounded-2xl bg-white/60 border border-white/40 text-primary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/30 text-sm"
                    autoFocus
                    data-testid="input-session-name"
                  />
                  <p
                    className="mt-2 text-xs text-muted-foreground/70 leading-relaxed"
                    data-testid="text-phi-reminder"
                  >
                    Reminder: Do not include client names. Use initials or session codes only.
                  </p>
                  <AnimatePresence>
                    {containsPotentialName && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-2 px-3.5 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs leading-relaxed flex items-start gap-2"
                        data-testid="warning-phi-name-detected"
                      >
                        <span className="mt-0.5 shrink-0">⚠️</span>
                        <span>This may contain a client name. Consider using initials instead.</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <label className="text-xs font-semibold text-primary/60 uppercase tracking-[0.15em] block mb-2">Session Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setMode("solo")}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer text-left ${
                        mode === "solo"
                          ? "border-[#2E8B57] bg-[#2E8B57]/5 shadow-md"
                          : "border-white/40 bg-white/40 hover:border-primary/30"
                      }`}
                      data-testid="button-mode-solo"
                    >
                      <User size={24} className={mode === "solo" ? "text-[#2E8B57] mb-2" : "text-muted-foreground mb-2"} />
                      <div className="font-medium text-sm text-primary">Solo</div>
                      <div className="text-xs text-muted-foreground mt-0.5">1-on-1 session</div>
                    </button>
                    <button
                      onClick={() => setMode("group")}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer text-left ${
                        mode === "group"
                          ? "border-[#2E8B57] bg-[#2E8B57]/5 shadow-md"
                          : "border-white/40 bg-white/40 hover:border-primary/30"
                      }`}
                      data-testid="button-mode-group"
                    >
                      <UserPlus size={24} className={mode === "group" ? "text-[#2E8B57] mb-2" : "text-muted-foreground mb-2"} />
                      <div className="font-medium text-sm text-primary">Group</div>
                      <div className="text-xs text-muted-foreground mt-0.5">Multiple clients</div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 pt-2">
              <button
                onClick={() => onSubmit(name || `Session — ${new Date().toLocaleDateString()}`, mode)}
                disabled={isPending}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#2E8B57] to-[#236B43] text-white font-medium shadow-lg shadow-[#2E8B57]/20 border border-[#D4AF37]/30 hover:brightness-110 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                data-testid="button-create-session-submit"
              >
                <Sparkles size={16} />
                {isPending ? "Creating..." : "Start Session"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function OnboardingModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [step, setStep] = useState(0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-md z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            className="fixed inset-x-4 top-[8%] bottom-auto max-h-[88vh] overflow-y-auto md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[500px] md:max-h-[90vh] z-50 bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/40"
          >
            <div className="relative">
              <div className="flex justify-center gap-2 pt-6 pb-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      i === step ? "w-8 bg-[#2E8B57]" : i < step ? "w-4 bg-accent" : "w-4 bg-primary/15"
                    }`}
                  />
                ))}
              </div>

              <AnimatePresence mode="wait">
                {step === 0 && (
                  <motion.div
                    key="step0"
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    className="p-8 pt-4 text-center"
                  >
                    <div className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                      <span className="text-4xl">✨</span>
                    </div>
                    <h2 className="font-serif text-2xl text-primary mb-3" data-testid="text-onboarding-welcome">Welcome to the Community</h2>
                    <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
                      ClinicalPlay gives you interactive therapy tools that work in real time with your clients. No downloads, no installs — just share an invite code and you're connected.
                    </p>
                  </motion.div>
                )}

                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    className="p-8 pt-4 text-center"
                  >
                    <div className="w-full max-w-[280px] mx-auto mb-5 rounded-2xl bg-gradient-to-br from-[#E8F0E6] to-[#D4E4D1] p-6 relative overflow-hidden">
                      <div className="text-5xl mb-3 animate-bounce" style={{ animationDuration: "3s" }}>🏖️</div>
                      <div className="flex flex-wrap justify-center gap-2">
                        {["🌲", "🌸", "⛰️", "🌊", "☀️", "🏠"].map((emoji, i) => (
                          <motion.span
                            key={i}
                            className="text-2xl"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 + i * 0.15 }}
                          >
                            {emoji}
                          </motion.span>
                        ))}
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-24 h-24 bg-accent/10 rounded-full blur-xl" />
                    </div>
                    <h2 className="font-serif text-2xl text-primary mb-3">The Zen Sandtray</h2>
                    <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
                      Your clients drag and drop expressive items onto a shared canvas. Watch their world unfold in real time — no words needed.
                    </p>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    className="p-8 pt-4 text-center"
                  >
                    <div className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-gradient-to-br from-accent/20 to-primary/10 flex items-center justify-center">
                      <Sparkles size={36} className="text-accent" />
                    </div>
                    <h2 className="font-serif text-2xl text-primary mb-3">You're All Set</h2>
                    <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
                      Create your first session, share the invite code with a client, and start exploring together. It's that simple.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="p-6 pt-0 flex gap-3">
                {step > 0 && (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="px-5 py-3 rounded-2xl bg-secondary/50 text-primary font-medium text-sm hover:bg-secondary transition-colors cursor-pointer"
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
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-[#2E8B57] to-[#236B43] text-white font-medium shadow-lg shadow-[#2E8B57]/20 border border-[#D4AF37]/30 hover:brightness-110 transition-all cursor-pointer flex items-center justify-center gap-2"
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
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function Dashboard() {
  const [, navigate] = useLocation();
  const [copied, setCopied] = useState<string | null>(null);
  const [showNewSession, setShowNewSession] = useState(false);
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
      content: "Create a new session room here. You'll get a unique invite code to share with your client — they just click the link to join.",
      position: "bottom",
      emoji: "🎮",
    },
    {
      target: "dashboard-sessions",
      title: "Your Sessions",
      content: "All your active and past sessions live here. Copy an invite code or jump right back into a session with one tap.",
      position: "top",
      emoji: "📋",
    },
    {
      target: "dashboard-tools",
      title: "Clinical Tool Library",
      content: "Browse all 8 interactive therapy tools. Star your favorites for quick access, and try new ones in any session.",
      position: "top",
      emoji: "🧰",
    },
    {
      target: "dashboard-account",
      title: "Your Account",
      content: "Manage your subscription, view session stats, and get quick clinical tips right from your sidebar.",
      position: "left",
      emoji: "👤",
    },
  ];

  const [tipIndex] = useState(() => Math.floor(Math.random() * CLINICAL_TIPS.length));

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({ title: "Please sign in", description: "Please sign in to access your clinical tools.", variant: "destructive" });
      setTimeout(() => { window.location.href = "/login"; }, 500);
    }
  }, [authLoading, isAuthenticated]);

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
      setShowNewSession(true);
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

  const { data: billingStatus } = useQuery<{ isPro: boolean; subscriptionType: string; paymentFailed: boolean }>({
    queryKey: ["/api/billing/status"],
    queryFn: async () => {
      const res = await authFetch("/api/billing/status");
      if (!res.ok) return { isPro: false, subscriptionType: "free", paymentFailed: false };
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

  const createSession = useMutation({
    mutationFn: async ({ name, mode }: { name: string; mode: string }) => {
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
      navigate(`/playroom/${session.id}`);
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

  const manageSubscription = useMutation({
    mutationFn: async () => {
      const res = await authFetch("/api/create-portal-session", {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to open billing portal");
      return res.json();
    },
    onSuccess: (data: { url: string }) => {
      if (data.url) window.open(data.url, "_blank");
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

  const activeSessions = sessions.filter(s => s.status === "active");
  const pastSessions = sessions.filter(s => s.status !== "active");
  const favoritedTools = ALL_TOOLS.filter(t => favorites.includes(t.id));

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/20">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center animate-pulse">
            <span className="text-2xl">✨</span>
          </div>
          <p className="text-muted-foreground font-medium" data-testid="text-loading">Loading...</p>
        </div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen px-6">
          <GlassCard className="max-w-md w-full p-10 text-center" hoverEffect={false}>
            <div className="w-16 h-16 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
              <Lock size={28} className="text-primary/60" />
            </div>
            <h2 className="text-2xl font-serif text-primary mb-3">We Haven't Launched Yet</h2>
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
        <h2 className="text-lg font-medium text-primary flex items-center gap-2">
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
            <span className="text-3xl">🏖️</span>
          </div>
          <h3 className="text-xl font-serif text-primary mb-2">No active sessions</h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">Create a session room and share the invite code with your client to get started.</p>
          <button
            onClick={() => setShowNewSession(true)}
            className="px-6 py-3 rounded-2xl inline-flex items-center gap-2 shadow-lg cursor-pointer hover:brightness-110 transition-all text-white font-medium border-2"
            style={{
              background: "linear-gradient(135deg, #2E8B57 0%, #256D47 100%)",
              borderColor: "#D4AF37",
              boxShadow: "0 4px 16px rgba(46,139,87,0.2)",
            }}
            data-testid="button-new-session-empty"
          >
            <Plus size={18} /> Create Session
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
        activeSessions.map((sess, i) => (
          <motion.div
            key={sess.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
          >
            <GlassCard className="p-5 flex flex-col md:flex-row items-center gap-5" hoverEffect={true}>
              <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center shrink-0">
                <span className="text-xl">🎮</span>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-base font-serif text-primary">{sess.name}</h3>
                <div className="flex items-center justify-center md:justify-start gap-3 mt-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar size={13} />
                    {new Date(sess.createdAt).toLocaleDateString()}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: "rgba(46,139,87,0.12)", color: "#2E8B57" }}>active</span>
                </div>
              </div>
              <div className="flex gap-2 w-full md:w-auto flex-col sm:flex-row">
                <button
                  onClick={() => copyInvite(sess.inviteCode)}
                  className="min-h-[48px] px-4 py-3 bg-white/80 backdrop-blur-sm border border-white/40 text-foreground rounded-2xl text-sm font-medium hover:bg-white transition-colors flex items-center justify-center gap-2 cursor-pointer font-mono tracking-wider"
                  data-testid={`button-copy-invite-${sess.id}`}
                >
                  {copied === sess.inviteCode ? <CheckCircle2 size={16} className="text-green-600" /> : <Copy size={16} />}
                  {copied === sess.inviteCode ? "Copied!" : sess.inviteCode}
                </button>
                <Link href={`/playroom/${sess.id}`} className="flex-1 no-underline">
                  <button
                    className="w-full min-h-[48px] px-5 py-3 text-white rounded-2xl text-sm font-medium shadow-md hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer border"
                    style={{
                      background: "linear-gradient(135deg, #2E8B57 0%, #256D47 100%)",
                      borderColor: "rgba(212,175,55,0.4)",
                      boxShadow: "0 4px 12px rgba(46,139,87,0.2)",
                    }}
                    data-testid={`button-join-${sess.id}`}
                  >
                    Enter <ArrowRight size={16} />
                  </button>
                </Link>
              </div>
            </GlassCard>
          </motion.div>
        ))
      )}

      {pastSessions.length > 0 && (
        <div className="mt-8 space-y-4">
          <h2 className="text-lg font-medium text-primary flex items-center gap-2">
            <Calendar size={18} className="text-muted-foreground" /> Past Sessions
          </h2>
          {pastSessions.slice(0, 5).map((sess, i) => (
            <motion.div
              key={sess.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <GlassCard className="p-4 flex items-center gap-4 opacity-80" hoverEffect={false}>
                <div className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center shrink-0">
                  <Calendar size={18} className="text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-primary">{sess.name}</h4>
                  <p className="text-xs text-muted-foreground">{new Date(sess.createdAt).toLocaleDateString()}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">{sess.status}</span>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  const ToolLibraryView = () => (
    <div className="space-y-6" data-tour="dashboard-tools">
      {favoritedTools.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-medium text-primary flex items-center gap-2">
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
                  <h4 className="text-sm font-medium text-primary">{tool.label}</h4>
                  {isLocked ? (
                    <button
                      onClick={() => checkout.mutate("monthly")}
                      className="mt-2 text-xs text-accent font-medium flex items-center gap-1 cursor-pointer"
                      data-testid={`button-upgrade-fav-${tool.id}`}
                    >
                      <Lock size={10} /> Upgrade
                    </button>
                  ) : (
                    <Link href="/dashboard" onClick={() => { setShowNewSession(true); }} className="no-underline">
                      <span className="mt-2 text-xs text-accent font-medium flex items-center gap-1 cursor-pointer">
                        Launch <ArrowRight size={10} />
                      </span>
                    </Link>
                  )}
                </GlassCard>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h2 className="text-lg font-medium text-primary flex items-center gap-2">
          <Palette size={18} className="text-accent" /> All Tools
        </h2>
        <div className="columns-1 sm:columns-2 gap-3 space-y-3">
          {ALL_TOOLS.map((tool, i) => {
            const isLocked = tool.tier === "pro" && !isPro;
            const isFavorited = favorites.includes(tool.id);
            const isExpanded = i === 0 || i === 3 || i === 5;

            return (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="break-inside-avoid"
              >
                <GlassCard className={`relative ${isLocked ? "opacity-75" : ""} ${isExpanded ? "p-6" : "p-5"}`} hoverEffect={!isLocked}>
                  {isLocked && (
                    <div className="absolute inset-0 bg-white/30 backdrop-blur-[1px] rounded-3xl z-10 flex items-center justify-center">
                      <button
                        onClick={() => checkout.mutate("monthly")}
                        className="bg-gradient-to-r from-[#2E8B57] to-[#236B43] text-white px-5 py-2.5 rounded-2xl text-sm font-medium shadow-lg flex items-center gap-2 cursor-pointer hover:brightness-110 transition-all border border-[#D4AF37]/30"
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
                    <h3 className="font-medium text-primary text-sm">{tool.label}</h3>
                    {tool.tier === "pro" && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold border" style={{ backgroundColor: "rgba(15,82,186,0.08)", color: "#0F52BA", borderColor: "rgba(15,82,186,0.2)" }}>PRO</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{tool.desc}</p>

                  {!isLocked && (
                    <button
                      onClick={() => setShowNewSession(true)}
                      className="w-full px-4 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer flex items-center justify-center gap-1 border"
                      style={{
                        backgroundColor: "rgba(46,139,87,0.08)",
                        color: "#2E8B57",
                        borderColor: "rgba(46,139,87,0.15)",
                      }}
                      data-testid={`button-launch-${tool.id}`}
                    >
                      Launch <ArrowRight size={12} />
                    </button>
                  )}
                </GlassCard>
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
        <GlassCard className="p-5" hoverEffect={false}>
          <div className="flex items-center gap-4 mb-4">
            {user.profileImageUrl ? (
              <img src={user.profileImageUrl} alt="" className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-sm" />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-serif text-xl shadow-md">
                {user.firstName?.charAt(0) || "C"}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <p className="font-serif text-primary font-medium">{user.firstName} {user.lastName}</p>
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
            <Link href="/workspace" className="no-underline">
              <button className="w-full py-2.5 rounded-xl bg-secondary/50 text-primary text-sm font-medium hover:bg-secondary transition-colors cursor-pointer flex items-center justify-center gap-2" data-testid="button-workspace">
                <User size={14} />
                Workspace
              </button>
            </Link>
            {isPro && (subscriptionType === "community" || subscriptionType === "annual") && (
              <button
                onClick={() => manageSubscription.mutate()}
                disabled={manageSubscription.isPending}
                className="w-full py-2.5 rounded-xl bg-secondary/50 text-primary text-sm font-medium hover:bg-secondary transition-colors cursor-pointer flex items-center justify-center gap-2"
                data-testid="button-manage-billing"
              >
                <CreditCard size={14} />
                Manage Billing
              </button>
            )}
            <Link href="/contact" className="no-underline">
              <button className="w-full py-2.5 rounded-xl bg-secondary/50 text-primary text-sm font-medium hover:bg-secondary transition-colors cursor-pointer flex items-center justify-center gap-2" data-testid="button-support-link">
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
            <h3 className="font-serif text-lg text-primary">Founding Member</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Lifetime access for a one-time <span className="font-bold text-primary">$99</span>.
          </p>
          <div className="mb-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span>{percentClaimed}% claimed</span>
              <span className="font-semibold text-primary" data-testid="text-founding-remaining">{remaining} left</span>
            </div>
            <div className="w-full bg-primary/10 rounded-full h-2 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-accent to-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${percentClaimed}%` }}
                transition={{ duration: 1, delay: 0.3 }}
              />
            </div>
          </div>
          <button
            onClick={() => checkout.mutate("founding")}
            disabled={checkout.isPending}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#2E8B57] to-[#236B43] text-white font-medium shadow-lg shadow-[#2E8B57]/20 border border-[#D4AF37]/30 hover:brightness-110 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
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
            <h3 className="font-serif text-lg text-primary">Upgrade to Pro</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Unlock all tools for <span className="font-bold text-accent">$7/month</span>.
          </p>
          <button
            onClick={() => checkout.mutate("monthly")}
            disabled={checkout.isPending}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#2E8B57] to-[#236B43] text-white font-medium shadow-lg shadow-[#2E8B57]/20 border border-[#D4AF37]/30 hover:brightness-110 transition-all cursor-pointer disabled:opacity-50"
            data-testid="button-checkout-community-only"
          >
            {checkout.isPending ? "Loading..." : "Start Community Plan"}
          </button>
        </GlassCard>
      )}

      <GlassCard className="p-5 border-accent/10" hoverEffect={false}>
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb size={18} className="text-accent" />
          <h3 className="font-serif text-sm text-primary">Clinician's Corner</h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed italic">
          "{CLINICAL_TIPS[tipIndex].tip}"
        </p>
        <p className="text-xs text-accent font-medium mt-2">— {CLINICAL_TIPS[tipIndex].tool}</p>
      </GlassCard>

      <GlassCard className="p-5" hoverEffect={false}>
        <h3 className="font-serif text-sm text-primary mb-3">Quick Stats</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 rounded-2xl bg-secondary/30">
            <p className="text-2xl font-serif text-primary" data-testid="text-session-count">{sessions.length}</p>
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Total Sessions</p>
          </div>
          <div className="text-center p-3 rounded-2xl bg-secondary/30">
            <p className="text-2xl font-serif text-primary" data-testid="text-active-count">{activeSessions.length}</p>
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Active</p>
          </div>
        </div>
      </GlassCard>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 pb-28 md:pb-10 pt-24 md:pt-32 px-4 md:px-8">
      <Navbar />

      {isAuthenticated && !emailConfirmed && (
        <div className="max-w-7xl mx-auto mb-4">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/60 backdrop-blur-sm"
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
          </motion.div>
        </div>
      )}

      {billingStatus?.paymentFailed && (
        <div className="max-w-7xl mx-auto mb-4">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-red-50/80 border border-red-200/60 backdrop-blur-sm"
            data-testid="banner-payment-failed"
          >
            <div className="shrink-0 w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center">
              <AlertTriangle size={16} className="text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-red-900">Your payment method needs updating</p>
              <p className="text-xs text-red-700/70">We were unable to process your latest payment. Please update your payment method to keep your subscription active.</p>
            </div>
            <button
              onClick={() => manageSubscription.mutate()}
              disabled={manageSubscription.isPending}
              className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-100 hover:bg-red-200/80 text-red-800 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
              data-testid="button-update-payment"
            >
              <CreditCard size={12} />
              Update Payment
            </button>
          </motion.div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <motion.div
          className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-serif text-primary mb-1" data-testid="text-dashboard-title">
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
          <motion.button
            onClick={() => setShowNewSession(true)}
            disabled={createSession.isPending}
            className="px-7 py-3.5 rounded-2xl flex items-center gap-2.5 shadow-lg cursor-pointer w-full md:w-auto justify-center disabled:opacity-50 text-white font-medium border-2"
            style={{
              background: "linear-gradient(135deg, #2E8B57 0%, #256D47 100%)",
              borderColor: "#D4AF37",
              boxShadow: "0 4px 20px rgba(46,139,87,0.25), 0 0 0 1px rgba(212,175,55,0.15)",
            }}
            whileHover={{ scale: 1.02, boxShadow: "0 6px 24px rgba(46,139,87,0.35), 0 0 0 1px rgba(212,175,55,0.3)" }}
            whileTap={{ scale: 0.97 }}
            data-testid="button-new-session"
          >
            <Plus size={20} /> Start New Session
          </motion.button>
        </motion.div>

        <div className="hidden md:grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <SessionsView />
            <ToolLibraryView />
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <AccountSidebar />
          </motion.div>
        </div>

        <div className="md:hidden">
          <AnimatePresence mode="wait">
            {mobileTab === "sessions" && (
              <motion.div key="sessions" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <SessionsView />
              </motion.div>
            )}
            {mobileTab === "library" && (
              <motion.div key="library" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <ToolLibraryView />
              </motion.div>
            )}
            {mobileTab === "account" && (
              <motion.div key="account" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <AccountSidebar />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-24 md:pb-8">
        <LegalDisclaimer />
      </div>

      <NewSessionModal
        isOpen={showNewSession}
        onClose={() => setShowNewSession(false)}
        onSubmit={(name, mode) => createSession.mutate({ name, mode })}
        isPending={createSession.isPending}
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
          setShowNewSession(true);
        }}
        onSkip={() => {
          dashboardTour.skip();
          setShowNewSession(true);
        }}
      />
    </div>
  );
}
