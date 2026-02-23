import { LegalDisclaimer } from "@/components/shared/legal-disclaimer";
import { LogoMark } from "@/components/shared/logo-mark";
import { ArrowRight, CheckCircle2, Shield, FileText, Lock, Cookie, Mail, ArrowUp, Sparkles, Heart } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { useEffect, useState, useRef, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

/* ── Interactive Demo: Mini Volume Mixer ── */

interface DemoFader {
  id: string;
  name: string;
  value: number;
  color: string;
  glowColor: string;
}

const DEMO_PARTS: DemoFader[] = [
  { id: "protector", name: "Protector", value: 72, color: "#64748b", glowColor: "rgba(100,116,139,0.3)" },
  { id: "inner-child", name: "Inner Child", value: 35, color: "#7e57c2", glowColor: "rgba(126,87,194,0.3)" },
  { id: "critic", name: "Critic", value: 85, color: "#e53935", glowColor: "rgba(229,57,53,0.3)" },
  { id: "caretaker", name: "Caretaker", value: 50, color: "#4A7A56", glowColor: "rgba(74,122,86,0.3)" },
  { id: "exile", name: "Exile", value: 20, color: "#C8836A", glowColor: "rgba(200,131,106,0.3)" },
];

function DemoFaderComponent({ fader, onChange }: { fader: DemoFader; onChange: (value: number) => void }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const updateValue = useCallback((clientY: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const y = clientY - rect.top;
    const pct = Math.max(0, Math.min(100, 100 - (y / rect.height) * 100));
    onChange(Math.round(pct));
  }, [onChange]);

  useEffect(() => {
    if (!isDragging) return;
    const handleMove = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      updateValue(clientY);
    };
    const handleUp = () => setIsDragging(false);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    window.addEventListener("touchmove", handleMove, { passive: false });
    window.addEventListener("touchend", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleUp);
    };
  }, [isDragging, updateValue]);

  const fillHeight = `${fader.value}%`;
  const thumbPosition = `${100 - fader.value}%`;

  return (
    <div className="flex flex-col items-center gap-2 select-none">
      <div className="text-xs font-mono text-white/50 tabular-nums">{fader.value}</div>
      <div
        ref={trackRef}
        className="relative w-3 rounded-full cursor-pointer"
        style={{ height: 140, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
        onMouseDown={(e) => { setIsDragging(true); updateValue(e.clientY); }}
        onTouchStart={(e) => { setIsDragging(true); updateValue(e.touches[0].clientY); }}
      >
        {/* Fill */}
        <div
          className="absolute bottom-0 left-0 right-0 rounded-full transition-all"
          style={{
            height: fillHeight,
            background: `linear-gradient(to top, ${fader.color}, ${fader.color}88)`,
            boxShadow: isDragging ? `0 0 12px ${fader.glowColor}` : "none",
            transitionDuration: isDragging ? "0ms" : "150ms",
          }}
        />
        {/* Thumb */}
        <div
          className="absolute left-1/2 -translate-x-1/2 w-7 h-3 rounded-sm transition-all"
          style={{
            top: thumbPosition,
            transform: `translate(-50%, -50%)`,
            background: `linear-gradient(180deg, ${fader.color}cc 0%, ${fader.color} 100%)`,
            boxShadow: isDragging
              ? `0 0 16px ${fader.glowColor}, 0 2px 8px rgba(0,0,0,0.4)`
              : `0 1px 4px rgba(0,0,0,0.3)`,
            transitionDuration: isDragging ? "0ms" : "150ms",
          }}
        />
      </div>
      <div className="text-[10px] font-medium text-white/70 text-center leading-tight max-w-[60px]">
        {fader.name}
      </div>
    </div>
  );
}

function DemoVolumeMixer() {
  const [parts, setParts] = useState<DemoFader[]>(DEMO_PARTS);

  const updatePart = (id: string, value: number) => {
    setParts(prev => prev.map(p => p.id === id ? { ...p, value } : p));
  };

  return (
    <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
      {/* Fake toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-secondary/50">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-destructive/40" />
          <div className="w-2.5 h-2.5 rounded-full bg-accent/40" />
          <div className="w-2.5 h-2.5 rounded-full bg-primary/40" />
        </div>
        <span className="text-xs text-muted-foreground font-medium">Volume Mixer — Demo Session</span>
        <div className="w-16" />
      </div>
      {/* Mixer area */}
      <div className="p-6 md:p-8" style={{ background: "linear-gradient(180deg, #1a1a1c 0%, #121214 100%)" }}>
        <div className="flex items-end justify-center gap-6 md:gap-8">
          {parts.map((fader) => (
            <DemoFaderComponent
              key={fader.id}
              fader={fader}
              onChange={(value) => updatePart(fader.id, value)}
            />
          ))}
        </div>
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] text-white/30 font-medium tracking-wide uppercase">Drag the faders to adjust each part's volume</span>
        </div>
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
              Drag the faders to explore our Volume Mixer — an IFS-inspired tool for parts work.
            </p>
          </div>
          <DemoVolumeMixer />
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
