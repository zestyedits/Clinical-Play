import { Navbar } from "@/components/layout/navbar";
import { GlassCard } from "@/components/ui/glass-card";
import { motion } from "framer-motion";
import { ArrowRight, Lock, CheckCircle2, Star, Palette, Wind, House, Clock, Layers, Shield, FileText, Target } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { useEffect } from "react";

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isLoading, isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-secondary/20 pb-20 md:pb-0">
      <Navbar />

      {/* Hero Section */}
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
                    <p className="text-white font-serif text-lg">Dr. Sarah & Michael</p>
                  </div>
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-xs font-bold text-primary border-2 border-white/20">S</div>
                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs font-bold text-white border-2 border-white/20">M</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Active Clinical Suite */}
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

      {/* Coming Next */}
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

      {/* Pricing */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <GlassCard className="p-12 border-primary/10" hoverEffect={false}>
              <h2 className="text-sm font-bold tracking-widest text-accent uppercase mb-4">Membership</h2>
              <h3 className="text-4xl font-serif text-primary mb-6">One Simple Plan</h3>
              <div className="flex justify-center items-baseline mb-8">
                <span className="text-6xl font-serif text-primary">$49</span>
                <span className="text-muted-foreground ml-2">/ month</span>
              </div>
              
              <ul className="space-y-4 mb-10 text-left max-w-sm mx-auto">
                {[
                  "Unlimited Clinical Sessions",
                  "Full Access to Growing Tool Library",
                  "HIPAA-Safe No-PHI Architecture",
                  "Clinical Insights & On-The-Job Prompts",
                  "Priority Access to New Tools"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-foreground/80">
                    <CheckCircle2 size={20} className="text-accent shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <a href="/api/login">
                <button className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-medium shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all cursor-pointer" data-testid="button-start-trial">
                  Start Your 14-Day Free Trial
                </button>
              </a>
              <p className="mt-4 text-xs text-muted-foreground flex items-center justify-center gap-1">
                <Lock size={12} /> Secure 256-bit encryption
              </p>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
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
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
