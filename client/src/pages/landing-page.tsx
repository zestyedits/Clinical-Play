import { LegalDisclaimer } from "@/components/shared/legal-disclaimer";
import { LogoMark } from "@/components/shared/logo-mark";
import { ArrowRight, CheckCircle2, Shield, Lock, Mail, ArrowUp, Heart } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

import { DemoDBTHouse, DemoAnxietyLadder, DemoThoughtCourt } from "@/components/landing/landing-demos";

/* ── Waitlist Form ── */

function WaitlistForm({ variant = "default" }: { variant?: "default" | "bottom" }) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const waitlistMutation = useMutation({
    mutationFn: async ({ email, name }: { email: string; name: string }) => {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: name || null }),
      });
      if (res.status === 409) throw new Error("You're already on the waitlist!");
      if (!res.ok) {
        let message = "Failed to join waitlist";
        try {
          const body = await res.json();
          if (body?.message && typeof body.message === "string") {
            message = body.message;
          }
        } catch {
          // ignore JSON parse errors and use default message
        }
        throw new Error(message);
      }
      return res.json();
    },
    onSuccess: () => {
      setSubmitted(true);
      setEmail("");
      setName("");
    },
    onError: (err: Error) => {
      toast({ title: err.message, variant: "destructive" });
    },
  });

  if (submitted) {
    return (
      <div className="flex items-center gap-2 justify-center text-primary bg-primary/8 px-5 py-3.5 rounded-xl text-sm font-medium">
        <CheckCircle2 size={16} />
        You're on the list! We'll be in touch.
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (email.trim()) waitlistMutation.mutate({ email: email.trim(), name: name.trim() });
      }}
      className="space-y-3"
      data-testid="form-waitlist"
    >
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          placeholder="Your name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 h-11 px-4 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          data-testid="input-waitlist-name"
        />
        <div className="relative flex-1">
          <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
          <input
            type="email"
            required
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            data-testid="input-waitlist-email"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={waitlistMutation.isPending}
        className="w-full sm:w-auto h-11 px-6 rounded-xl bg-primary text-primary-foreground text-sm font-medium btn-warm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        data-testid="button-waitlist-submit"
      >
        {waitlistMutation.isPending ? "Joining..." : (
          <>Join the Waitlist <ArrowRight size={15} /></>
        )}
      </button>
      <p className="text-xs text-muted-foreground/60 text-center sm:text-left">
        No spam, ever. Just a launch notification.
      </p>
    </form>
  );
}

/* ── Upcoming Tools (landing showcase) ── */

type UpcomingToolPreview = "house" | "theater" | "garden" | "fidget" | "map" | "board" | "story";

interface UpcomingTool {
  name: string;
  desc: string;
  tags: string[];
  emoji: string;
  accent: string;
  accent2: string;
  preview: UpcomingToolPreview;
}

const upcomingTools: UpcomingTool[] = [
  {
    name: "The DBT House",
    desc: "Room-by-room emotional regulation, distress tolerance, and mindfulness.",
    tags: ["DBT", "Skills Training"],
    emoji: "\u{1F3E0}",
    accent: "#c9956b",
    accent2: "#8b5a2b",
    preview: "house",
  },
  {
    name: "Parts Puppet Theater",
    desc: "IFS-inspired stage for giving voice to internal parts through interactive puppets.",
    tags: ["IFS", "Parts Work"],
    emoji: "\u{1F3AD}",
    accent: "#a78bfa",
    accent2: "#5b21b6",
    preview: "theater",
  },
  {
    name: "Growth Garden",
    desc: "A living garden metaphor — plant seeds that grow across sessions as therapy progresses.",
    tags: ["Goals", "Rapport"],
    emoji: "\u{1F331}",
    accent: "#4ade80",
    accent2: "#166534",
    preview: "garden",
  },
  {
    name: "Fidget Toolbox",
    desc: "Calming sensory toolkit with interactive fidgets for regulation during talk therapy.",
    tags: ["Sensory", "ADHD"],
    emoji: "\u{1F9F8}",
    accent: "#f472b6",
    accent2: "#be185d",
    preview: "fidget",
  },
  {
    name: "Safety & Support Map",
    desc: "Interactive concentric-circle map for visualizing support networks and safety plans.",
    tags: ["Safety Planning", "Crisis"],
    emoji: "\u{1F5FA}\uFE0F",
    accent: "#38bdf8",
    accent2: "#0369a1",
    preview: "map",
  },
  {
    name: "Communication Board",
    desc: "Customizable AAC-style visual communication board for nonverbal or limited-speech clients.",
    tags: ["SLP", "AAC", "Autism"],
    emoji: "\u{1F4AC}",
    accent: "#fbbf24",
    accent2: "#b45309",
    preview: "board",
  },
  {
    name: "Social Story Builder",
    desc: "Visual storyboard editor for creating personalized social stories.",
    tags: ["Autism", "Pediatric"],
    emoji: "\u{1F4D6}",
    accent: "#818cf8",
    accent2: "#4338ca",
    preview: "story",
  },
];

function ToolPreviewMicro({
  type,
  accent,
  accent2,
}: {
  type: UpcomingToolPreview;
  accent: string;
  accent2: string;
}) {
  switch (type) {
    case "house":
      return (
        <div className="relative h-full w-full flex items-end justify-center gap-1 px-4 pb-3">
          <div
            className="w-[20%] h-[48%] rounded-t-lg rounded-b-sm landing-preview-float"
            style={{ background: `${accent}45`, border: `1px solid ${accent}65`, animationDelay: "0s" }}
          />
          <div
            className="w-[34%] h-[68%] rounded-t-lg rounded-b-sm relative landing-preview-float"
            style={{ background: `${accent}30`, border: `1px solid ${accent}55`, animationDelay: "0.15s" }}
          >
            <div
              className="absolute bottom-2 left-1/2 -translate-x-1/2 w-3.5 h-5 rounded-sm"
              style={{ background: accent2, opacity: 0.85 }}
            />
          </div>
          <div
            className="w-[20%] h-[40%] rounded-t-lg rounded-b-sm landing-preview-float"
            style={{ background: `${accent}22`, border: `1px solid ${accent}50`, animationDelay: "0.3s" }}
          />
        </div>
      );
    case "theater":
      return (
        <div className="relative h-full w-full flex flex-col items-center justify-end pb-2 overflow-hidden">
          <div
            className="absolute top-0 left-0 right-0 h-[52%] landing-curtain-sway"
            style={{
              background: `linear-gradient(180deg, ${accent2}dd 0%, ${accent}aa 55%, ${accent}44 100%)`,
              borderRadius: "0 0 50% 50% / 0 0 28% 28%",
            }}
          />
          <div
            className="absolute top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full opacity-70 blur-lg landing-spot-pulse"
            style={{ background: "#fde047" }}
          />
          <div className="relative z-[1] flex gap-2.5 mb-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-6 h-10 rounded-full border-2 landing-preview-bob"
                style={{ borderColor: accent, background: `${accent}25`, animationDelay: `${i * 0.12}s` }}
              />
            ))}
          </div>
        </div>
      );
    case "garden":
      return (
        <div className="relative h-full w-full px-4 pt-6 flex items-end justify-center gap-3 pb-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-col items-center gap-0.5">
              <div
                className="w-1.5 h-6 rounded-full landing-stem-grow"
                style={{ background: `${accent2}99`, animationDelay: `${i * 0.2}s` }}
              />
              <div
                className="w-8 h-8 rounded-full landing-leaf-sway"
                style={{
                  background: `radial-gradient(circle at 30% 30%, ${accent}aa, ${accent2}88)`,
                  animationDelay: `${i * 0.25}s`,
                }}
              />
            </div>
          ))}
        </div>
      );
    case "fidget":
      return (
        <div className="relative h-full w-full flex items-center justify-center gap-3 p-3">
          <div
            className="w-12 h-12 rounded-full border-[3px] landing-spin-slow"
            style={{ borderColor: `${accent}55`, borderTopColor: accent }}
          />
          <div className="flex flex-col gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-1.5 rounded-full landing-fidget-shimmer"
                style={{
                  width: `${46 + i * 8}%`,
                  background: `linear-gradient(90deg, ${accent}30, ${accent2}70, ${accent}30)`,
                  animationDelay: `${i * 0.15}s`,
                }}
              />
            ))}
          </div>
        </div>
      );
    case "map":
      return (
        <div className="relative h-full w-full flex items-center justify-center p-3">
          {[72, 54, 36].map((size, i) => (
            <div
              key={i}
              className="absolute rounded-full border-2 landing-ring-pulse"
              style={{
                width: size,
                height: size,
                borderColor: `${accent}${i === 0 ? "cc" : i === 1 ? "88" : "55"}`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
          <div
            className="relative z-[1] w-2.5 h-2.5 rounded-full"
            style={{ background: accent2, boxShadow: `0 0 12px ${accent}` }}
          />
        </div>
      );
    case "board":
      return (
        <div className="relative h-full w-full p-3 grid grid-cols-4 gap-1.5 content-center">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-md landing-tile-pop"
              style={{
                background:
                  i % 3 === 0
                    ? `linear-gradient(135deg, ${accent}55, ${accent2}44)`
                    : `${accent}22`,
                border: `1px solid ${accent}40`,
                animationDelay: `${i * 0.05}s`,
              }}
            />
          ))}
        </div>
      );
    case "story":
      return (
        <div className="relative h-full w-full flex flex-col gap-1.5 p-3 justify-center">
          {[0.55, 0.4, 0.65].map((w, i) => (
            <div key={i} className="flex gap-1.5 items-stretch landing-panel-slide" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="w-8 shrink-0 rounded-md" style={{ background: `${accent}40`, border: `1px solid ${accent}55` }} />
              <div
                className="flex-1 rounded-md min-h-[22px]"
                style={{
                  width: `${w * 100}%`,
                  background: `linear-gradient(90deg, ${accent}18, ${accent2}12)`,
                  border: `1px solid ${accent}35`,
                }}
              />
            </div>
          ))}
        </div>
      );
    default:
      return null;
  }
}

const landingToolContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.06 },
  },
};

const landingToolItem = {
  hidden: { opacity: 0, y: 32, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 320, damping: 26 },
  },
};

function LandingToolCard({ tool }: { tool: UpcomingTool }) {
  const slug = tool.name
    .toLowerCase()
    .replace(/^the\s+/, "")
    .replace(/\s+/g, "-")
    .replace(/&/g, "");
  const testId = `card-tool-${tool.name.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <motion.article variants={landingToolItem} className="group relative h-full" data-testid={testId}>
      <motion.div
        className="relative h-full flex flex-col rounded-2xl overflow-hidden bg-card/50 backdrop-blur-md border border-border/60 shadow-sm"
        whileHover={{ y: -6, transition: { type: "spring", stiffness: 400, damping: 22 } }}
        style={{
          boxShadow: `0 4px 24px -4px ${tool.accent}15`,
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-[2]"
          style={{
            boxShadow: `inset 0 0 0 1px ${tool.accent}55, 0 20px 50px -20px ${tool.accent}35`,
          }}
        />

        <div className="relative flex items-center gap-2 px-3 py-2.5 border-b border-border/50 bg-muted/30">
          <span className="flex gap-1 shrink-0">
            <span className="w-2 h-2 rounded-full bg-[#ff5f57]/90 shadow-sm" />
            <span className="w-2 h-2 rounded-full bg-[#febc2e]/90 shadow-sm" />
            <span className="w-2 h-2 rounded-full bg-[#28c840]/90 shadow-sm" />
          </span>
          <span className="text-[10px] font-mono text-muted-foreground/70 truncate text-center flex-1 tracking-tight">
            {slug}.clinicalplay
          </span>
          <span
            className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0"
            style={{ background: `${tool.accent}22`, color: tool.accent2 }}
          >
            Live
          </span>
        </div>

        <div
          className="relative h-[7.5rem] md:h-[8.25rem] mx-3 mt-3 rounded-xl overflow-hidden ring-1 ring-black/[0.06] dark:ring-white/[0.08]"
          style={{
            background: `linear-gradient(165deg, ${tool.accent}20 0%, transparent 55%, ${tool.accent2}0d 100%)`,
          }}
        >
          <ToolPreviewMicro type={tool.preview} accent={tool.accent} accent2={tool.accent2} />
        </div>

        <div className="relative p-4 pt-3 flex-1 flex flex-col min-h-0">
          <div className="flex items-start gap-3 mb-2">
            <motion.span
              className="text-[2rem] leading-none select-none shrink-0"
              style={{ filter: `drop-shadow(0 6px 14px ${tool.accent}50)` }}
              whileHover={{ scale: 1.12, rotate: [0, -6, 6, 0] }}
              transition={{ type: "spring", stiffness: 400, damping: 14 }}
            >
              {tool.emoji}
            </motion.span>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-foreground leading-snug">{tool.name}</h3>
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed flex-1">{tool.desc}</p>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {tool.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-md border border-transparent group-hover:border-current/20 transition-colors"
                style={{
                  background: `${tool.accent}16`,
                  color: tool.accent2,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="landing-tool-shine pointer-events-none absolute inset-0 rounded-2xl overflow-hidden" />
      </motion.div>
    </motion.article>
  );
}

/* ── Demo Tab Switcher ── */

const DEMO_TABS = [
  {
    id: "dbt" as const,
    emoji: "\u{1F3E1}",
    label: "DBT House",
    color: "#2d6a3e",
    heading: "Stack DBT skills like you’re building a real house.",
  },
  {
    id: "ladder" as const,
    emoji: "\u{1F4CF}",
    label: "Anxiety Ladder",
    color: "#1d4ed8",
    heading: "Exposure steps with SUDS — structured, not a static worksheet.",
  },
  {
    id: "court" as const,
    emoji: "\u2696\uFE0F",
    label: "Thought Court",
    color: "#5b21b6",
    heading: "Put harsh thoughts on trial with evidence for both sides.",
  },
] as const;

type DemoTabId = (typeof DEMO_TABS)[number]["id"];

/* ── Main Component ── */

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [activeDemo, setActiveDemo] = useState<DemoTabId>("dbt");

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isLoading, isAuthenticated, navigate]);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 600);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background">

      {/* ── Hero ── */}
      <section className="pt-28 md:pt-36 lg:pt-40 pb-16 md:pb-24 lg:pb-28 px-4 sm:px-6 lg:px-10 xl:px-16">
        <div className="max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-medium leading-[1.08] text-foreground mb-6" data-testid="text-hero-heading">
            Therapy tools<br />
            <span className="text-primary">that connect.</span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-10">
            Interactive digital tools for clinicians who want telehealth sessions that actually engage.
          </p>
          <div className="max-w-md mx-auto mb-14">
            <WaitlistForm />
          </div>
          <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground/50 font-medium">
            <span className="flex items-center gap-1.5"><Shield size={12} className="text-primary/40" /> HIPAA-ready</span>
            <span className="flex items-center gap-1.5"><Lock size={12} className="text-primary/40" /> End-to-end encrypted</span>
            <span className="flex items-center gap-1.5"><Heart size={12} className="text-primary/40" /> Built by a clinician</span>
          </div>
        </div>
      </section>

      {/* ── Interactive Demos ── */}
      <section className="pb-16 md:pb-24 lg:pb-28 px-4 sm:px-6 lg:px-10 xl:px-16" id="features">
        <div className="max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto">
          <div className="text-center mb-6 md:mb-8">
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary/50 mb-2">From the digital playroom</p>
            <h2 className="text-2xl md:text-3xl font-serif text-foreground">
              {DEMO_TABS.find(t => t.id === activeDemo)?.heading}
            </h2>
          </div>

          {/* Tab pills — tactile app-style switcher */}
          <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
            {DEMO_TABS.map((tab) => {
              const isActive = activeDemo === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveDemo(tab.id)}
                  className={`relative flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs font-semibold cursor-pointer overflow-hidden ${
                    isActive ? "" : "bg-slate-100/90 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300"
                  }`}
                  style={{
                    ...(isActive
                      ? {
                          background: `${tab.color}1e`,
                          color: tab.color,
                          border: `1.5px solid ${tab.color}55`,
                          boxShadow: `0 8px 24px -8px ${tab.color}45, inset 0 1px 0 rgba(255,255,255,0.4)`,
                        }
                      : {
                          border: "1.5px solid rgba(15,23,42,0.08)",
                          boxShadow: "0 2px 8px -4px rgba(0,0,0,0.06)",
                        }),
                  }}
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  layout
                >
                  <span className="relative z-[1] text-base leading-none">{tab.emoji}</span>
                  <span className="relative z-[1] hidden sm:inline">{tab.label}</span>
                  {isActive && (
                    <motion.span
                      layoutId="demoTabGlow"
                      className="absolute inset-0 rounded-2xl opacity-25 pointer-events-none"
                      style={{ background: `radial-gradient(circle at 50% 0%, ${tab.color}, transparent 70%)` }}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Device-style frame around live demos */}
          <div className="relative mx-auto rounded-[1.35rem] p-1 sm:p-1.5 bg-gradient-to-br from-border/70 via-muted/40 to-border/50 shadow-[0_28px_56px_-18px_rgba(0,0,0,0.22)] dark:shadow-[0_28px_56px_-18px_rgba(0,0,0,0.45)] max-w-3xl lg:max-w-none">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 h-1 w-16 rounded-full bg-foreground/10 sm:hidden" aria-hidden />
            <div className="rounded-[1.05rem] overflow-hidden ring-1 ring-black/[0.04] dark:ring-white/[0.08] bg-background/80">
              <div key={activeDemo} className="demo-tab-enter">
                {activeDemo === "dbt" && <DemoDBTHouse />}
                {activeDemo === "ladder" && <DemoAnxietyLadder />}
                {activeDemo === "court" && <DemoThoughtCourt />}
              </div>
            </div>
          </div>
        </div>

        {/* Tab enter + landing tool micro-animations */}
        <style>{`
          .demo-tab-enter { animation: demoTabIn 420ms cubic-bezier(0.34, 1.56, 0.64, 1) both; }
          @keyframes demoTabIn { 0% { opacity: 0; transform: scale(0.97) translateY(10px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
          .landing-tool-shine {
            background: linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.2) 50%, transparent 65%);
            transform: translateX(-120%);
            opacity: 0;
          }
          .group:hover .landing-tool-shine {
            animation: landingToolShine 0.9s ease-out forwards;
          }
          @keyframes landingToolShine {
            0% { transform: translateX(-120%); opacity: 0.4; }
            40% { opacity: 0.7; }
            100% { transform: translateX(120%); opacity: 0; }
          }
          .landing-preview-float { animation: landingPreviewFloat 4s ease-in-out infinite; }
          @keyframes landingPreviewFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
          .landing-curtain-sway { animation: landingCurtain 5s ease-in-out infinite; transform-origin: 50% 0; }
          @keyframes landingCurtain { 0%, 100% { transform: scaleX(1); } 50% { transform: scaleX(1.03); } }
          .landing-spot-pulse { animation: landingSpot 2.4s ease-in-out infinite; }
          @keyframes landingSpot { 0%, 100% { opacity: 0.45; transform: translate(-50%, 0) scale(1); } 50% { opacity: 0.85; transform: translate(-50%, 0) scale(1.15); } }
          .landing-preview-bob { animation: landingBob 2.2s ease-in-out infinite; }
          @keyframes landingBob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
          .landing-stem-grow { animation: landingStem 3s ease-in-out infinite; transform-origin: 50% 100%; }
          @keyframes landingStem { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(1.08); } }
          .landing-leaf-sway { animation: landingLeaf 3.5s ease-in-out infinite; }
          @keyframes landingLeaf { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(6deg); } }
          .landing-spin-slow { animation: landingSpin 8s linear infinite; }
          @keyframes landingSpin { to { transform: rotate(360deg); } }
          .landing-fidget-shimmer { animation: landingShimmer 2s ease-in-out infinite; background-size: 200% 100%; }
          @keyframes landingShimmer { 0%, 100% { opacity: 0.7; } 50% { opacity: 1; } }
          .landing-ring-pulse { animation: landingRing 3s ease-in-out infinite; }
          @keyframes landingRing { 0%, 100% { transform: scale(1); opacity: 0.9; } 50% { transform: scale(1.06); opacity: 0.65; } }
          .landing-tile-pop { animation: landingTile 2.4s ease-in-out infinite; }
          @keyframes landingTile { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.06); } }
          .landing-panel-slide { animation: landingPanel 3s ease-in-out infinite; }
          @keyframes landingPanel { 0%, 100% { transform: translateX(0); opacity: 1; } 50% { transform: translateX(4px); opacity: 0.92; } }
        `}</style>
      </section>

      {/* ── What's Coming — interactive app-style cards ── */}
      <section className="py-20 md:py-28 lg:py-32 px-4 sm:px-6 lg:px-10 xl:px-16 relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-[0.2]"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(201,149,107,0.12), transparent), radial-gradient(ellipse 60% 40% at 100% 50%, rgba(129,140,248,0.08), transparent), radial-gradient(ellipse 50% 35% at 0% 80%, rgba(56,189,248,0.07), transparent)",
          }}
        />
        <div className="max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto relative">
          <div className="text-center mb-12">
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary/50 mb-2">Coming soon</p>
            <h2 className="text-2xl md:text-3xl font-serif text-foreground mb-3">Inside the playroom</h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Each tool is a small interactive world — draggable, visual, and built for co-regulation on screen. All included at launch.
            </p>
          </div>

          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5"
            variants={landingToolContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px", amount: 0.15 }}
          >
            {upcomingTools.map((tool) => (
              <LandingToolCard key={tool.name} tool={tool} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Quote ── */}
      <section className="py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-10 xl:px-16">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-lg md:text-xl font-serif italic text-foreground/70 leading-relaxed mb-4" data-testid="text-founder-quote">
            "I got tired of boring telehealth sessions, so I built us a digital playroom."
          </p>
          <p className="text-xs text-muted-foreground/50 font-medium uppercase tracking-wider">
            — Social Worker &amp; Founder
          </p>
        </div>
      </section>

      {/* ── Bottom Waitlist CTA ── */}
      <section className="py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-10 xl:px-16" id="waitlist">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-xl md:text-2xl font-serif text-foreground mb-2">Be the first to know</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Early supporters get founding member pricing.
          </p>
          <WaitlistForm variant="bottom" />
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border/60 py-8 px-4 sm:px-6 lg:px-10 xl:px-16">
        <div className="max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <LogoMark size="sm" />
            <span className="text-xs text-muted-foreground/50">&copy; {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/login" className="text-xs text-muted-foreground/60 hover:text-foreground transition-colors no-underline" data-testid="link-footer-signin">Sign In</Link>
            <Link href="/privacy" className="text-xs text-muted-foreground/60 hover:text-foreground transition-colors no-underline" data-testid="link-footer-privacy">Privacy</Link>
            <Link href="/terms" className="text-xs text-muted-foreground/60 hover:text-foreground transition-colors no-underline" data-testid="link-footer-terms">Terms</Link>
            <Link href="/cookies" className="text-xs text-muted-foreground/60 hover:text-foreground transition-colors no-underline" data-testid="link-footer-cookies">Cookies</Link>
          </div>
        </div>
        <div className="max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto mt-4">
          <LegalDisclaimer />
        </div>
      </footer>

      {/* Back to top */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-20 right-5 md:bottom-8 md:right-8 z-40 w-10 h-10 rounded-full bg-primary text-primary-foreground shadow-md flex items-center justify-center hover:bg-primary/90 transition-colors cursor-pointer"
          data-testid="button-back-to-top"
        >
          <ArrowUp size={18} />
        </button>
      )}
    </div>
  );
}
