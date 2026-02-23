import { LegalDisclaimer } from "@/components/shared/legal-disclaimer";
import { LogoMark } from "@/components/shared/logo-mark";
import { ArrowRight, CheckCircle2, Shield, FileText, Lock, Cookie, Mail, ArrowUp, Sparkles, Heart } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

/* ── Interactive Demo: Feeling Wheel Explorer ── */

interface DemoEmotion {
  id: string;
  label: string;
  emoji: string;
  color: string;
  question?: string;
  children?: { id: string; label: string; emoji: string; children?: { id: string; label: string; emoji: string }[] }[];
}

const DEMO_EMOTIONS: DemoEmotion[] = [
  {
    id: "joy", label: "Joy", emoji: "\u{1F60A}", color: "#f59e0b",
    question: "What kind of joy are you feeling?",
    children: [
      { id: "happy", label: "Happy", emoji: "\u{1F604}", children: [
        { id: "playful", label: "Playful", emoji: "\u{1F938}" },
        { id: "content", label: "Content", emoji: "\u{263A}\uFE0F" },
        { id: "cheerful", label: "Cheerful", emoji: "\u{1F31E}" },
      ]},
      { id: "grateful", label: "Grateful", emoji: "\u{1F64F}", children: [
        { id: "thankful", label: "Thankful", emoji: "\u{1F49B}" },
        { id: "appreciative", label: "Appreciative", emoji: "\u{2728}" },
      ]},
      { id: "proud", label: "Proud", emoji: "\u{1F4AA}", children: [
        { id: "accomplished", label: "Accomplished", emoji: "\u{1F3C6}" },
        { id: "confident", label: "Confident", emoji: "\u{1F451}" },
      ]},
      { id: "peaceful", label: "Peaceful", emoji: "\u{1F54A}\uFE0F", children: [
        { id: "calm", label: "Calm", emoji: "\u{1F30A}" },
        { id: "serene", label: "Serene", emoji: "\u{1F338}" },
      ]},
    ],
  },
  {
    id: "sadness", label: "Sadness", emoji: "\u{1F622}", color: "#3b82f6",
    question: "What kind of sadness is this?",
    children: [
      { id: "lonely", label: "Lonely", emoji: "\u{1F614}", children: [
        { id: "isolated", label: "Isolated", emoji: "\u{1F3DD}\uFE0F" },
        { id: "invisible", label: "Invisible", emoji: "\u{1F47B}" },
      ]},
      { id: "hurt", label: "Hurt", emoji: "\u{1F494}", children: [
        { id: "disappointed", label: "Disappointed", emoji: "\u{1F61E}" },
        { id: "let-down", label: "Let Down", emoji: "\u{1F4A7}" },
      ]},
      { id: "grief", label: "Grief", emoji: "\u{1F5A4}", children: [
        { id: "mourning", label: "Mourning", emoji: "\u{1F3B5}" },
        { id: "heartbroken", label: "Heartbroken", emoji: "\u{1F48D}" },
      ]},
    ],
  },
  {
    id: "anger", label: "Anger", emoji: "\u{1F621}", color: "#ef4444",
    question: "What's driving this anger?",
    children: [
      { id: "frustrated", label: "Frustrated", emoji: "\u{1F624}", children: [
        { id: "annoyed", label: "Annoyed", emoji: "\u{1F612}" },
        { id: "stuck", label: "Stuck", emoji: "\u{1F9F1}" },
      ]},
      { id: "resentful", label: "Resentful", emoji: "\u{1F620}", children: [
        { id: "bitter", label: "Bitter", emoji: "\u{1F48A}" },
        { id: "jealous", label: "Jealous", emoji: "\u{1F49A}" },
      ]},
    ],
  },
  {
    id: "fear", label: "Fear", emoji: "\u{1F628}", color: "#8b5cf6",
    question: "What kind of fear is this?",
    children: [
      { id: "anxious", label: "Anxious", emoji: "\u{1F630}", children: [
        { id: "worried", label: "Worried", emoji: "\u{1F61F}" },
        { id: "overwhelmed", label: "Overwhelmed", emoji: "\u{1F32A}\uFE0F" },
      ]},
      { id: "insecure", label: "Insecure", emoji: "\u{1F616}", children: [
        { id: "inadequate", label: "Inadequate", emoji: "\u{1F4CF}" },
        { id: "self-doubting", label: "Self-Doubting", emoji: "\u{2753}" },
      ]},
    ],
  },
  {
    id: "surprise", label: "Surprise", emoji: "\u{1F62E}", color: "#f97316",
    question: "What surprised you?",
    children: [
      { id: "amazed", label: "Amazed", emoji: "\u{1F929}", children: [
        { id: "awestruck", label: "Awestruck", emoji: "\u{1F31F}" },
        { id: "astonished", label: "Astonished", emoji: "\u{1F4AB}" },
      ]},
      { id: "confused", label: "Confused", emoji: "\u{1F615}", children: [
        { id: "disoriented", label: "Disoriented", emoji: "\u{1F300}" },
        { id: "perplexed", label: "Perplexed", emoji: "\u{1F914}" },
      ]},
    ],
  },
  {
    id: "love", label: "Love", emoji: "\u{2764}\uFE0F", color: "#ec4899",
    question: "What does this love feel like?",
    children: [
      { id: "affectionate", label: "Affectionate", emoji: "\u{1F917}", children: [
        { id: "warm", label: "Warm", emoji: "\u{2615}" },
        { id: "tender", label: "Tender", emoji: "\u{1F33C}" },
      ]},
      { id: "connected", label: "Connected", emoji: "\u{1F91D}", children: [
        { id: "belonging", label: "Belonging", emoji: "\u{1F3E1}" },
        { id: "accepted", label: "Accepted", emoji: "\u{1F49C}" },
      ]},
    ],
  },
  {
    id: "shame", label: "Shame", emoji: "\u{1F636}", color: "#a855f7",
    question: "Where does this shame come from?",
    children: [
      { id: "embarrassed", label: "Embarrassed", emoji: "\u{1F633}", children: [
        { id: "self-conscious", label: "Self-Conscious", emoji: "\u{1F648}" },
        { id: "exposed", label: "Exposed", emoji: "\u{1F4A2}" },
      ]},
      { id: "worthless", label: "Worthless", emoji: "\u{1F614}", children: [
        { id: "not-enough", label: "Not Enough", emoji: "\u{1F4A7}" },
        { id: "broken", label: "Broken", emoji: "\u{1FAE5}" },
      ]},
    ],
  },
  {
    id: "disgust", label: "Disgust", emoji: "\u{1F922}", color: "#22c55e",
    question: "What's triggering this feeling?",
    children: [
      { id: "repulsed", label: "Repulsed", emoji: "\u{1F92E}", children: [
        { id: "revolted", label: "Revolted", emoji: "\u{1F645}" },
        { id: "appalled", label: "Appalled", emoji: "\u{1F627}" },
      ]},
      { id: "contempt", label: "Contemptuous", emoji: "\u{1F612}", children: [
        { id: "judgmental", label: "Judgmental", emoji: "\u{2696}\uFE0F" },
        { id: "disdainful", label: "Disdainful", emoji: "\u{1F44E}" },
      ]},
    ],
  },
];

type DemoTier = "primary" | "secondary" | "tertiary";

interface DemoSelection {
  primary: { label: string; emoji: string; color: string } | null;
  secondary: { label: string; emoji: string } | null;
  tertiary: { label: string; emoji: string } | null;
}

function DemoFeelingWheel() {
  const [tier, setTier] = useState<DemoTier>("primary");
  const [selection, setSelection] = useState<DemoSelection>({ primary: null, secondary: null, tertiary: null });
  const [activeEmotion, setActiveEmotion] = useState<DemoEmotion | null>(null);
  const [activeSecondary, setActiveSecondary] = useState<DemoEmotion["children"]>(undefined);
  const [activeQuestion, setActiveQuestion] = useState<string>("");
  const [completed, setCompleted] = useState(false);

  const resetDemo = () => {
    setTier("primary");
    setSelection({ primary: null, secondary: null, tertiary: null });
    setActiveEmotion(null);
    setActiveSecondary(undefined);
    setActiveQuestion("");
    setCompleted(false);
  };

  const selectPrimary = (emotion: DemoEmotion) => {
    setSelection({ primary: { label: emotion.label, emoji: emotion.emoji, color: emotion.color }, secondary: null, tertiary: null });
    setActiveEmotion(emotion);
    setActiveQuestion(emotion.question || "");
    setTier("secondary");
  };

  const selectSecondary = (child: NonNullable<DemoEmotion["children"]>[0], color: string) => {
    setSelection(prev => ({ ...prev, secondary: { label: child.label, emoji: child.emoji }, tertiary: null }));
    setActiveSecondary(undefined);
    setActiveQuestion("");
    if (child.children && child.children.length > 0) {
      setActiveSecondary(child.children.map(c => ({ ...c })) as DemoEmotion["children"]);
      setTier("tertiary");
    } else {
      setCompleted(true);
    }
  };

  const selectTertiary = (child: { label: string; emoji: string }) => {
    setSelection(prev => ({ ...prev, tertiary: { label: child.label, emoji: child.emoji } }));
    setCompleted(true);
  };

  const activeColor = selection.primary?.color || "#4A7A56";

  return (
    <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
      {/* Window chrome */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-secondary/50">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-destructive/40" />
          <div className="w-2.5 h-2.5 rounded-full bg-accent/40" />
          <div className="w-2.5 h-2.5 rounded-full bg-primary/40" />
        </div>
        <span className="text-xs text-muted-foreground font-medium">Feeling Wheel — Demo Session</span>
        <button onClick={resetDemo} className="text-[10px] font-medium text-muted-foreground hover:text-foreground px-2 py-0.5 rounded-md hover:bg-secondary transition-colors cursor-pointer">
          Reset
        </button>
      </div>

      {/* Content area */}
      <div className="p-5 md:p-8">
        {/* Breadcrumb trail */}
        {selection.primary && (
          <div className="flex items-center gap-1.5 mb-5 flex-wrap">
            <button onClick={resetDemo} className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">All emotions</button>
            {selection.primary && (
              <>
                <span className="text-muted-foreground/40 text-xs">/</span>
                <button
                  onClick={() => { if (activeEmotion) { setTier("secondary"); setSelection(s => ({ ...s, secondary: null, tertiary: null })); setActiveSecondary(undefined); setActiveQuestion(activeEmotion.question || ""); setCompleted(false); } }}
                  className="text-xs font-medium transition-colors cursor-pointer"
                  style={{ color: activeColor }}
                >
                  {selection.primary.emoji} {selection.primary.label}
                </button>
              </>
            )}
            {selection.secondary && (
              <>
                <span className="text-muted-foreground/40 text-xs">/</span>
                <span className="text-xs font-medium text-foreground">{selection.secondary.emoji} {selection.secondary.label}</span>
              </>
            )}
            {selection.tertiary && (
              <>
                <span className="text-muted-foreground/40 text-xs">/</span>
                <span className="text-xs font-medium text-foreground">{selection.tertiary.emoji} {selection.tertiary.label}</span>
              </>
            )}
          </div>
        )}

        {/* Question prompt */}
        {activeQuestion && !completed && (
          <p className="text-sm text-muted-foreground italic mb-4 text-center">"{activeQuestion}"</p>
        )}

        {/* Primary tier */}
        {tier === "primary" && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {DEMO_EMOTIONS.map((emotion) => (
              <button
                key={emotion.id}
                onClick={() => selectPrimary(emotion)}
                className="group flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-background hover:shadow-md transition-all duration-150 cursor-pointer"
                style={{ borderColor: undefined }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = emotion.color + "40"; e.currentTarget.style.backgroundColor = emotion.color + "08"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = ""; e.currentTarget.style.backgroundColor = ""; }}
              >
                <span className="text-2xl sm:text-3xl transition-transform duration-150 group-hover:scale-110">{emotion.emoji}</span>
                <span className="text-xs font-medium text-foreground">{emotion.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Secondary tier */}
        {tier === "secondary" && activeEmotion?.children && (
          <div className="grid grid-cols-2 gap-2.5">
            {activeEmotion.children.map((child) => (
              <button
                key={child.id}
                onClick={() => selectSecondary(child, activeColor)}
                className="group flex items-center gap-3 p-3.5 rounded-xl border border-border bg-background hover:shadow-md transition-all duration-150 cursor-pointer text-left"
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = activeColor + "40"; e.currentTarget.style.backgroundColor = activeColor + "08"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = ""; e.currentTarget.style.backgroundColor = ""; }}
              >
                <span className="text-xl transition-transform duration-150 group-hover:scale-110">{child.emoji}</span>
                <span className="text-sm font-medium text-foreground">{child.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Tertiary tier */}
        {tier === "tertiary" && activeSecondary && !completed && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {activeSecondary.map((child) => (
              <button
                key={child.id}
                onClick={() => selectTertiary(child)}
                className="group flex items-center gap-3 p-3.5 rounded-xl border border-border bg-background hover:shadow-md transition-all duration-150 cursor-pointer text-left"
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = activeColor + "40"; e.currentTarget.style.backgroundColor = activeColor + "08"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = ""; e.currentTarget.style.backgroundColor = ""; }}
              >
                <span className="text-xl transition-transform duration-150 group-hover:scale-110">{child.emoji}</span>
                <span className="text-sm font-medium text-foreground">{child.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Completed state */}
        {completed && (
          <div className="text-center py-4">
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-background mb-4">
              <span className="text-lg">{selection.primary?.emoji}</span>
              <span className="text-muted-foreground/40">→</span>
              {selection.secondary && <span className="text-lg">{selection.secondary.emoji}</span>}
              {selection.tertiary && (
                <>
                  <span className="text-muted-foreground/40">→</span>
                  <span className="text-lg">{selection.tertiary.emoji}</span>
                </>
              )}
            </div>
            <p className="text-sm text-foreground font-medium mb-1">
              {selection.tertiary?.label || selection.secondary?.label || selection.primary?.label}
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              In a real session, your clinician would see this selection in real-time and guide the conversation.
            </p>
            <button
              onClick={resetDemo}
              className="text-xs font-medium px-4 py-2 rounded-lg bg-secondary border border-border text-foreground hover:bg-secondary/80 transition-colors cursor-pointer"
            >
              Try another emotion
            </button>
          </div>
        )}

        {/* Hint bar */}
        {!completed && (
          <div className="mt-5 pt-3 border-t border-border flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: activeColor }} />
            <span className="text-[10px] text-muted-foreground font-medium tracking-wide uppercase">
              {tier === "primary" ? "Tap an emotion to explore deeper" : tier === "secondary" ? "Now narrow it down" : "Find the most specific feeling"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

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
      if (!res.ok) throw new Error("Failed to join waitlist");
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

/* ── Upcoming Tools Data ── */

const upcomingTools = [
  { name: "The DBT House", desc: "Room-by-room emotional regulation, distress tolerance, and mindfulness.", tags: ["DBT", "Skills Training"], emoji: "🏠" },
  { name: "Parts Puppet Theater", desc: "IFS-inspired stage for giving voice to internal parts through interactive puppets.", tags: ["IFS", "Parts Work"], emoji: "🎭" },
  { name: "Growth Garden", desc: "A living garden metaphor — plant seeds that grow across sessions as therapy progresses.", tags: ["Goals", "Rapport"], emoji: "🌱" },
  { name: "Fidget Toolbox", desc: "Calming sensory toolkit with interactive fidgets for regulation during talk therapy.", tags: ["Sensory", "ADHD"], emoji: "🧸" },
  { name: "Safety & Support Map", desc: "Interactive concentric-circle map for visualizing support networks and safety plans.", tags: ["Safety Planning", "Crisis"], emoji: "🗺️" },
  { name: "Coping Skills Deck", desc: "50+ evidence-based coping strategies organized by category. Build a personalized toolkit.", tags: ["CBT", "DBT"], emoji: "🃏" },
  { name: "Social Story Builder", desc: "Visual storyboard editor for creating personalized social stories.", tags: ["Autism", "Pediatric"], emoji: "📖" },
];

/* ── Main Component ── */

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const [showBackToTop, setShowBackToTop] = useState(false);

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
      <section className="pt-28 md:pt-36 pb-16 md:pb-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/8 border border-primary/15 text-primary text-xs font-medium tracking-wide uppercase mb-6">
            <Sparkles size={12} />
            Built for Licensed Clinicians
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-medium leading-[1.1] text-foreground mb-5">
            Therapy tools<br />
            <span className="text-primary">that connect.</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto mb-10">
            Interactive tools designed for real therapeutic engagement. Share your screen, share an invite code, and start working together — wherever you are.
          </p>
          <div className="max-w-md mx-auto">
            <WaitlistForm />
          </div>
        </div>
      </section>

      {/* ── Interactive Demo ── */}
      <section className="pb-16 md:pb-24 px-6" id="features">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-serif text-foreground mb-2">Try it yourself</h2>
            <p className="text-muted-foreground text-sm">
              Explore our Feeling Wheel — tap an emotion and drill down to name exactly what you're feeling.
            </p>
          </div>
          <DemoFeelingWheel />
        </div>
      </section>

      {/* ── What's Coming ── */}
      <section className="py-16 md:py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/8 border border-accent/15 text-accent text-xs font-medium tracking-wide uppercase mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              Actively Building
            </div>
            <h2 className="text-2xl md:text-4xl font-serif text-foreground mb-3">What's coming next</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Our clinical library keeps growing. These tools are actively in development and will be included with every plan at launch.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingTools.map((tool) => (
              <div key={tool.name} className="bg-card border border-border rounded-2xl p-5 hover:shadow-md hover:border-border/80 transition-[box-shadow,border-color] duration-200">
                <div className="text-3xl mb-3">{tool.emoji}</div>
                <h3 className="text-base font-serif text-foreground mb-1.5">{tool.name}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">{tool.desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {tool.tags.map((tag) => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-muted text-muted-foreground border border-border">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About ── */}
      <section className="py-16 md:py-24 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card border border-border rounded-2xl p-8 md:p-10 text-center">
            <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-primary/10 flex items-center justify-center">
              <Heart size={24} className="text-primary" />
            </div>
            <h3 className="text-xl md:text-2xl font-serif text-foreground mb-3" data-testid="text-about-founder">About the Founder</h3>
            <p className="text-muted-foreground leading-relaxed max-w-lg mx-auto mb-3">
              Created by a licensed clinical social worker and veteran with a mission to make telehealth sessions more engaging, interactive, and clinically effective.
            </p>
            <p className="text-sm text-muted-foreground/70 italic">
              "I got tired of boring telehealth sessions, so I built us a digital playroom."
            </p>
          </div>
        </div>
      </section>

      {/* ── Bottom Waitlist CTA ── */}
      <section className="py-16 md:py-24 px-6 bg-secondary/30" id="waitlist">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-serif text-foreground mb-3">Be the first to know</h2>
          <p className="text-muted-foreground mb-8">
            Join our waitlist and get notified when ClinicalPlay launches. Early supporters get founding member pricing.
          </p>
          <WaitlistForm variant="bottom" />
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border bg-muted/30 py-12 md:py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="mb-4">
                <LogoMark size="sm" />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                Interactive therapy tools for evidence-based clinical engagement.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-medium tracking-[0.08em] uppercase text-muted-foreground mb-4">Legal</h4>
              <div className="space-y-3">
                <Link href="/privacy" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors no-underline" data-testid="link-footer-privacy">
                  <Shield size={13} className="shrink-0" />
                  Privacy Policy
                </Link>
                <Link href="/terms" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors no-underline" data-testid="link-footer-terms">
                  <FileText size={13} className="shrink-0" />
                  Terms of Service
                </Link>
                <Link href="/cookies" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors no-underline" data-testid="link-footer-cookies">
                  <Cookie size={13} className="shrink-0" />
                  Cookie Policy
                </Link>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-medium tracking-[0.08em] uppercase text-muted-foreground mb-4">Platform</h4>
              <div className="space-y-3">
                <Link href="/login" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors no-underline" data-testid="link-footer-signin">
                  Clinician Sign In
                </Link>
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Lock size={13} className="shrink-0 text-muted-foreground/50" />
                  No PHI Collected
                </p>
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield size={13} className="shrink-0 text-muted-foreground/50" />
                  256-bit TLS Encryption
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground/70">
              &copy; {new Date().getFullYear()} ClinicalPlay. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="text-xs text-muted-foreground/70 hover:text-foreground transition-colors no-underline">Privacy</Link>
              <Link href="/terms" className="text-xs text-muted-foreground/70 hover:text-foreground transition-colors no-underline">Terms</Link>
              <Link href="/cookies" className="text-xs text-muted-foreground/70 hover:text-foreground transition-colors no-underline">Cookies</Link>
            </div>
          </div>
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
