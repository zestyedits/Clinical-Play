import { Navbar } from "@/components/layout/navbar";
import { GlassCard } from "@/components/ui/glass-card";
import { motion } from "framer-motion";
import { ArrowRight, Lock, CheckCircle2, Star } from "lucide-react";
import { Link } from "wouter";

export default function LandingPage() {
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
                <Link href="/dashboard">
                  <button className="h-14 px-8 rounded-full bg-primary text-primary-foreground font-medium text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer">
                    Start Free Trial <ArrowRight size={18} />
                  </button>
                </Link>
                <button className="h-14 px-8 rounded-full bg-white border border-border text-foreground font-medium text-lg hover:bg-secondary/30 transition-colors cursor-pointer">
                  View Demo
                </button>
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
              <img 
                src="/images/hero-luxury.jpg" 
                alt="Luxury Therapy Office" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="glass p-4 rounded-xl flex items-center justify-between">
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

      {/* Game Suite */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-serif text-primary mb-4">The Clinical Suite</h2>
            <p className="text-muted-foreground text-lg">
              Interactive tools designed to bridge the physical distance without losing the therapeutic connection.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                title: "Digital Sandtray", 
                desc: "Expressive world-building with infinite assets.",
                img: "/images/game-sandtray.jpg"
              },
              { 
                title: "CBT Thought Bridge", 
                desc: "Visualizing cognitive restructuring in real-time.",
                img: "/images/game-cbt.jpg"
              },
              { 
                title: "Sensory Fidgets", 
                desc: "Calming tactile interactions for emotional regulation.",
                img: "/images/game-fidgets.jpg"
              }
            ].map((game, i) => (
              <GlassCard key={i} className="group cursor-pointer">
                <div className="aspect-[4/3] overflow-hidden">
                  <img 
                    src={game.img} 
                    alt={game.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-serif text-primary mb-2 group-hover:text-accent transition-colors">{game.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{game.desc}</p>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6 bg-white/50">
        <div className="max-w-3xl mx-auto text-center">
          <GlassCard className="p-12 border-primary/10">
            <h2 className="text-sm font-bold tracking-widest text-accent uppercase mb-4">Membership</h2>
            <h3 className="text-4xl font-serif text-primary mb-6">One Simple Plan</h3>
            <div className="flex justify-center items-baseline mb-8">
              <span className="text-6xl font-serif text-primary">$49</span>
              <span className="text-muted-foreground ml-2">/ month</span>
            </div>
            
            <ul className="space-y-4 mb-10 text-left max-w-sm mx-auto">
              {[
                "Unlimited Clinical Sessions",
                "Full Access to Game Library",
                "HIPAA Compliant Security",
                "Session Notes & Syncing"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-foreground/80">
                  <CheckCircle2 size={20} className="text-accent" />
                  {item}
                </li>
              ))}
            </ul>

            <button className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-medium shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all cursor-pointer">
              Start Your 14-Day Free Trial
            </button>
            <p className="mt-4 text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Lock size={12} /> Secure 256-bit encryption
            </p>
          </GlassCard>
        </div>
      </section>
    </div>
  );
}
