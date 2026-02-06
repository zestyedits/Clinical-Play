import { Navbar } from "@/components/layout/navbar";
import { GlassCard } from "@/components/ui/glass-card";
import { motion } from "framer-motion";
import { ArrowRight, Lock, CheckCircle2, Star, Palette, Wind, House, Clock, Layers, Shield, FileText, Target, Crown, Zap, Flame, Heart, Cookie } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();

  const { data: foundingSlots } = useQuery<{ total: number; remaining: number }>({
    queryKey: ["/api/billing/founding-slots"],
    queryFn: async () => {
      const res = await fetch("/api/billing/founding-slots");
      return res.json();
    },
  });

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isLoading, isAuthenticated, navigate]);

  const remaining = foundingSlots?.remaining ?? 100;
  const total = foundingSlots?.total ?? 100;
  const percentClaimed = Math.round(((total - remaining) / total) * 100);

  const features = [
    "Unlimited Clinical Sessions",
    "Full 5-Tool Clinical Suite",
    "Real-time Collaboration",
    "Clinical Insights & Prompts",
    "HIPAA-Safe No-PHI Architecture",
    "Priority Access to New Tools",
  ];

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-secondary/20 pb-20 md:pb-0">
      <Navbar />

      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-primary text-xs font-semibold tracking-wider uppercase mb-6">
                <Star size={12} className="fill-primary" />
                Trusted by 2,000+ Clinicians
              </div>
              <h1 className="text-5xl md:text-7xl font-serif font-medium leading-[1.1] text-primary mb-6">
                Therapy, <br />
                <span className="italic text-accent">Reimagined.</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-lg mb-8">
                A premium telehealth hub designed for evidence-based engagement. 
                Experience the intersection of clinical sophistication and interactive play.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="/api/login">
                  <button className="h-14 px-8 rounded-full bg-primary text-primary-foreground font-medium text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto" data-testid="button-get-started">
                    Get Started <ArrowRight size={18} />
                  </button>
                </a>
                <a href="/api/login">
                  <button className="h-14 px-8 rounded-full bg-white/80 backdrop-blur-sm border border-white/40 text-foreground font-medium text-lg hover:bg-white transition-colors cursor-pointer w-full sm:w-auto" data-testid="button-sign-in">
                    Sign In
                  </button>
                </a>
              </div>
            </motion.div>
          </div>

          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="absolute -inset-4 bg-accent/20 blur-3xl rounded-full opacity-50" />
            <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white/50">
              <div className="w-full h-full" style={{
                background: "linear-gradient(145deg, #1B2A4A 0%, #2d3e5f 40%, #C9A96E 100%)",
              }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-8xl mb-4 opacity-80">🧩</div>
                    <p className="text-white/80 font-serif text-2xl">Interactive Therapy</p>
                    <p className="text-white/50 text-sm mt-1">Real-time collaborative play</p>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl flex items-center justify-between border border-white/20">
                  <div>
                    <p className="text-white/80 text-xs uppercase tracking-widest font-medium">Session Active</p>
                    <p className="text-white font-serif text-lg">Playroom — 2 Connected</p>
                  </div>
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-xs border-2 border-white/20"><Shield size={14} className="text-primary" /></div>
                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs font-bold text-white border-2 border-white/20">?</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-5xl font-serif text-primary mb-4">The Clinical Suite</h2>
            <p className="text-muted-foreground text-lg">
              Interactive tools designed to bridge the physical distance without losing the therapeutic connection.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              { 
                title: "Zen Sandtray", 
                desc: "Expressive world-building with drag-and-drop emoji assets. Real-time collaborative placement with moderator controls.",
                icon: Palette,
                gradient: "from-amber-100 to-amber-50",
              },
              { 
                title: "Calm Breathing Guide", 
                desc: "Synchronized 4-phase breathing exercises that pulse on every participant's screen in real-time.",
                icon: Wind,
                gradient: "from-emerald-100 to-emerald-50",
              },
              { 
                title: "Feeling Wheel", 
                desc: "Multi-layered emotional exploration — primary, secondary, and tertiary emotions with real-time highlighting.",
                icon: Target,
                gradient: "from-purple-100 to-purple-50",
              },
              { 
                title: "Narrative Timeline", 
                desc: "A visual river where clients drop stones to map life events. Collaborative, scrollable, and deeply personal.",
                icon: Clock,
                gradient: "from-teal-100 to-teal-50",
              },
              { 
                title: "Values Card Sort", 
                desc: "Drag-and-drop card deck for prioritizing personal values — a cornerstone of ACT and motivational interviewing.",
                icon: Layers,
                gradient: "from-rose-100 to-rose-50",
              },
            ].map((tool, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                <GlassCard className="group cursor-pointer h-full">
                  <div className={`aspect-[3/2] overflow-hidden bg-linear-to-br ${tool.gradient} flex items-center justify-center relative`}>
                    <tool.icon size={64} className="text-primary/10 group-hover:text-primary/20 transition-colors duration-500" />
                    <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-green-700 border border-green-200">
                      Active
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-serif text-primary mb-2 group-hover:text-accent transition-colors">{tool.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{tool.desc}</p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white/30">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-12 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/5 border border-blue-500/10 text-blue-600 text-xs font-semibold tracking-wider uppercase mb-6">
              Actively Building
            </div>
            <h2 className="text-3xl md:text-5xl font-serif text-primary mb-4">What's Coming Next</h2>
            <p className="text-muted-foreground text-lg">
              Our library keeps growing. The DBT House is next in line.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-lg mx-auto"
          >
            <GlassCard className="group opacity-90 hover:opacity-100" hoverEffect={true}>
              <div className="aspect-[4/3] overflow-hidden bg-rose-50 flex items-center justify-center relative">
                <House size={72} className="text-rose-500 opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
                <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-blue-600 border border-blue-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  In Development
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-xl font-serif text-primary mb-2 group-hover:text-accent transition-colors">The DBT House</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  A room-by-room framework for exploring emotional regulation, distress tolerance, mindfulness, and interpersonal effectiveness — core DBT skills, visualized.
                </p>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-6" id="pricing">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-sm font-bold tracking-widest text-accent uppercase mb-4">Pricing</h2>
            <h3 className="text-3xl md:text-5xl font-serif text-primary mb-4">Choose Your Plan</h3>
            <p className="text-muted-foreground text-lg">Start free, go monthly, save with annual, or lock in lifetime access.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0 }}
            >
              <GlassCard className="p-6 border-primary/5 h-full" hoverEffect={false}>
                <div className="text-center mb-6">
                  <h4 className="text-lg font-serif text-primary mb-1">Free</h4>
                  <p className="text-xs text-muted-foreground mb-3">Explore the platform</p>
                  <div className="flex justify-center items-baseline">
                    <span className="text-4xl font-serif text-primary">$0</span>
                  </div>
                </div>
                <ul className="space-y-2.5 mb-6">
                  {["1 Active Session", "Zen Sandtray Only", "No-PHI Architecture"].map((item, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-foreground/70 text-sm">
                      <CheckCircle2 size={14} className="text-muted-foreground/50 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <a href="/api/login">
                  <button className="w-full py-3 rounded-xl bg-white border border-primary/10 text-primary font-medium hover:bg-primary/5 transition-colors cursor-pointer text-sm" data-testid="button-plan-free">
                    Get Started
                  </button>
                </a>
              </GlassCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative"
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                <div className="bg-accent text-white px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase flex items-center gap-1.5 shadow-lg shadow-accent/30">
                  <Zap size={11} /> Most Popular
                </div>
              </div>
              <GlassCard className="p-6 border-accent/30 ring-2 ring-accent/20 h-full relative" hoverEffect={false}>
                <div className="text-center mb-6">
                  <h4 className="text-lg font-serif text-primary mb-1">Community</h4>
                  <p className="text-xs text-muted-foreground mb-3">Full access, monthly</p>
                  <div className="flex justify-center items-baseline">
                    <span className="text-4xl font-serif text-primary">$7</span>
                    <span className="text-muted-foreground ml-1">/ mo</span>
                  </div>
                </div>
                <ul className="space-y-2.5 mb-6">
                  {features.map((item, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-foreground/80 text-sm">
                      <CheckCircle2 size={14} className="text-accent shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <a href="/api/login">
                  <button className="w-full py-3 rounded-xl bg-accent text-white font-medium shadow-lg shadow-accent/20 hover:brightness-110 transition-all cursor-pointer text-sm" data-testid="button-plan-community">
                    Start Monthly Plan
                  </button>
                </a>
                <p className="mt-2.5 text-xs text-muted-foreground text-center">Cancel anytime</p>
              </GlassCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="relative"
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                <div className="bg-emerald-600 text-white px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase flex items-center gap-1.5 shadow-lg shadow-emerald-600/30">
                  <Star size={11} /> Best Value
                </div>
              </div>
              <GlassCard className="p-6 border-emerald-500/20 ring-1 ring-emerald-500/10 h-full relative" hoverEffect={false}>
                <div className="text-center mb-6">
                  <h4 className="text-lg font-serif text-primary mb-1">Annual</h4>
                  <p className="text-xs text-muted-foreground mb-3">Save 20% vs monthly</p>
                  <div className="flex justify-center items-baseline">
                    <span className="text-4xl font-serif text-primary">$67</span>
                    <span className="text-muted-foreground ml-1">/ yr</span>
                  </div>
                  <p className="text-xs text-emerald-600 font-semibold mt-1">$5.58/mo — save $17/yr</p>
                </div>
                <ul className="space-y-2.5 mb-6">
                  {[...features, "Priority Email Support"].map((item, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-foreground/80 text-sm">
                      <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <a href="/api/login">
                  <button className="w-full py-3 rounded-xl bg-emerald-600 text-white font-medium shadow-lg shadow-emerald-600/20 hover:brightness-110 transition-all cursor-pointer text-sm" data-testid="button-plan-annual">
                    Start Annual Plan
                  </button>
                </a>
                <p className="mt-2.5 text-xs text-muted-foreground text-center">Billed yearly</p>
              </GlassCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              {remaining > 0 && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <div className="bg-primary text-primary-foreground px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase flex items-center gap-1.5 shadow-lg shadow-primary/30">
                    <Flame size={11} /> Limited Offer
                  </div>
                </div>
              )}
              <GlassCard className="p-6 border-primary/20 bg-primary/[0.02] h-full" hoverEffect={false}>
                <div className="text-center mb-6">
                  <h4 className="text-lg font-serif text-primary mb-1 flex items-center justify-center gap-2">
                    <Crown size={16} className="text-accent" /> Founding Member
                  </h4>
                  <p className="text-xs text-muted-foreground mb-3">Lifetime access, one payment</p>
                  <div className="flex justify-center items-baseline">
                    <span className="text-4xl font-serif text-primary">$99</span>
                    <span className="text-muted-foreground ml-1.5 line-through text-xs">$84/yr</span>
                  </div>
                </div>
                <ul className="space-y-2.5 mb-4">
                  {[...features, "Founding Member Badge", "Lifetime Updates"].map((item, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-foreground/80 text-sm">
                      <CheckCircle2 size={14} className="text-primary shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>

                {remaining > 0 && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>{percentClaimed}% claimed</span>
                      <span className="font-semibold text-primary">{remaining} left</span>
                    </div>
                    <div className="w-full bg-primary/10 rounded-full h-1.5 overflow-hidden">
                      <motion.div
                        className="h-full bg-linear-to-r from-accent to-primary rounded-full"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${percentClaimed}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.3 }}
                      />
                    </div>
                  </div>
                )}

                <a href="/api/login">
                  <button
                    className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium shadow-lg shadow-primary/20 hover:brightness-110 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    data-testid="button-plan-founding"
                    disabled={remaining <= 0}
                  >
                    {remaining > 0 ? "Claim Founding Spot" : "Sold Out"}
                  </button>
                </a>
                <p className="mt-2.5 text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
                  <Lock size={10} /> One-time. No subscription.
                </p>
                <p className="mt-1.5 text-[10px] text-muted-foreground/60 text-center leading-relaxed">
                  "Lifetime" = platform lifespan. Non-transferable.{" "}
                  <Link href="/terms" className="underline hover:text-primary transition-colors no-underline" data-testid="link-founding-terms">
                    Full terms
                  </Link>
                </p>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <GlassCard className="p-8 md:p-10 text-center" hoverEffect={false}>
              <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-linear-to-tr from-primary to-accent flex items-center justify-center shadow-lg">
                <Heart size={28} className="text-white" />
              </div>
              <h3 className="text-2xl md:text-3xl font-serif text-primary mb-3" data-testid="text-about-founder">About the Founder</h3>
              <p className="text-muted-foreground leading-relaxed max-w-xl mx-auto mb-4">
                Created by a Clinical Social Worker (CSW-I) and Veteran with a mission to bridge the gap between clinical efficacy and digital engagement.
              </p>
              <p className="text-sm text-muted-foreground/70 italic">
                "I got tired of boring telehealth sessions, so I built us a digital playroom."
              </p>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-white/30 bg-white/20 backdrop-blur-sm py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-linear-to-tr from-primary to-accent flex items-center justify-center">
                  <span className="text-white font-serif font-bold text-sm">C</span>
                </div>
                <span className="font-serif font-bold text-lg text-primary">ClinicalPlay</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                A premium telehealth platform for evidence-based therapeutic engagement.
              </p>
            </div>

            <div>
              <h4 className="font-serif text-primary font-medium mb-4">Legal</h4>
              <div className="space-y-3">
                <Link href="/privacy" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors no-underline" data-testid="link-footer-privacy">
                  <Shield size={14} />
                  Privacy Policy
                </Link>
                <Link href="/terms" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors no-underline" data-testid="link-footer-terms">
                  <FileText size={14} />
                  Terms of Service
                </Link>
                <Link href="/cookies" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors no-underline" data-testid="link-footer-cookies">
                  <Cookie size={14} />
                  Cookie Policy
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-serif text-primary font-medium mb-4">Platform</h4>
              <div className="space-y-3">
                <a href="/api/login" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors no-underline" data-testid="link-footer-signin">
                  Clinician Sign In
                </a>
                <p className="text-sm text-muted-foreground">
                  No PHI Collected
                </p>
                <p className="text-sm text-muted-foreground">
                  256-bit TLS Encryption
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-white/30 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} ClinicalPlay. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="text-xs text-muted-foreground hover:text-primary transition-colors no-underline">
                Privacy
              </Link>
              <span className="text-muted-foreground/30">|</span>
              <Link href="/terms" className="text-xs text-muted-foreground hover:text-primary transition-colors no-underline">
                Terms
              </Link>
              <span className="text-muted-foreground/30">|</span>
              <Link href="/cookies" className="text-xs text-muted-foreground hover:text-primary transition-colors no-underline">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
