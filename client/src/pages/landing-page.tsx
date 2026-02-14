import { GlassCard } from "@/components/ui/glass-card";
import { LegalDisclaimer } from "@/components/shared/legal-disclaimer";
import { LogoMark } from "@/components/shared/logo-mark";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Lock, CheckCircle2, Star, Shield, FileText, Crown, Zap, Flame, Heart, Cookie, Sparkles, Mail, ArrowUp } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

function ZenCircleIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <circle cx="18" cy="18" r="14" stroke="url(#sandGrad)" strokeWidth="2.5" opacity="0.4" style={{ animation: "zen-spin 20s linear infinite" }} />
      <circle cx="18" cy="18" r="9" stroke="url(#sandGrad)" strokeWidth="2" opacity="0.7" style={{ animation: "zen-spin 14s linear infinite reverse" }} />
      <circle cx="18" cy="18" r="4" fill="url(#sandGrad)" opacity="0.9" />
      <path d="M4 28 Q12 22 18 24 Q24 26 32 20" stroke="url(#sandGrad)" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" fill="none" />
      <path d="M4 32 Q14 26 20 28 Q26 30 32 24" stroke="url(#sandGrad)" strokeWidth="1" strokeLinecap="round" opacity="0.3" fill="none" />
      <defs><linearGradient id="sandGrad" x1="0" y1="0" x2="36" y2="36"><stop stopColor="#c4956a" /><stop offset="1" stopColor="#8B6914" /></linearGradient></defs>
    </svg>
  );
}

function AuraPulseIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <circle cx="18" cy="18" r="15" stroke="url(#breathGrad)" strokeWidth="1" opacity="0.2" style={{ animation: "aura-pulse 4s ease-in-out infinite" }} />
      <circle cx="18" cy="18" r="11" stroke="url(#breathGrad)" strokeWidth="1.5" opacity="0.35" style={{ animation: "aura-pulse 4s ease-in-out infinite 0.5s" }} />
      <circle cx="18" cy="18" r="7" stroke="url(#breathGrad)" strokeWidth="2" opacity="0.55" style={{ animation: "aura-pulse 4s ease-in-out infinite 1s" }} />
      <circle cx="18" cy="18" r="3.5" fill="url(#breathGrad)" opacity="0.85" />
      <defs><linearGradient id="breathGrad" x1="0" y1="0" x2="36" y2="36"><stop stopColor="#7fb99b" /><stop offset="1" stopColor="#1a5c3a" /></linearGradient></defs>
    </svg>
  );
}

function CompassWheelIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <circle cx="18" cy="18" r="15" stroke="url(#compassGrad)" strokeWidth="1.5" opacity="0.3" />
      <circle cx="18" cy="18" r="11" stroke="url(#compassGrad)" strokeWidth="1" opacity="0.2" strokeDasharray="3 3" />
      <circle cx="18" cy="18" r="3" fill="url(#compassGrad)" opacity="0.9" />
      <g style={{ transformOrigin: "18px 18px", animation: "compass-tick 3s ease-in-out infinite" }}>
        <path d="M18 5 L20 18 L18 20 L16 18 Z" fill="url(#compassGrad)" opacity="0.8" />
        <path d="M18 31 L16 18 L18 16 L20 18 Z" fill="url(#compassGrad)" opacity="0.35" />
      </g>
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <circle key={angle} cx={18 + 13 * Math.cos((angle * Math.PI) / 180)} cy={18 + 13 * Math.sin((angle * Math.PI) / 180)} r={angle % 90 === 0 ? 1.5 : 0.8} fill="url(#compassGrad)" opacity={angle % 90 === 0 ? 0.7 : 0.35} />
      ))}
      <defs><linearGradient id="compassGrad" x1="0" y1="0" x2="36" y2="36"><stop stopColor="#a78bda" /><stop offset="1" stopColor="#5b21b6" /></linearGradient></defs>
    </svg>
  );
}

function TimelineRiverIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <path d="M6 30 Q12 20 18 22 Q24 24 30 12 Q33 6 34 4" stroke="url(#timeGrad)" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7" />
      <path d="M6 32 Q13 24 18 25 Q23 26 30 16" stroke="url(#timeGrad)" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.25" />
      <circle cx="10" cy="26" r="2.5" fill="url(#timeGrad)" opacity="0.8" />
      <circle cx="18" cy="22" r="2.5" fill="url(#timeGrad)" opacity="0.6" />
      <circle cx="27" cy="14" r="2.5" fill="url(#timeGrad)" opacity="0.45" />
      <circle cx="33" cy="5" r="1.5" fill="url(#timeGrad)" opacity="0.3" />
      <defs><linearGradient id="timeGrad" x1="0" y1="36" x2="36" y2="0"><stop stopColor="#67c5c9" /><stop offset="1" stopColor="#0d5e6e" /></linearGradient></defs>
    </svg>
  );
}

function CardStackIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <rect x="8" y="12" width="20" height="16" rx="3" stroke="url(#valGrad)" strokeWidth="1.5" fill="url(#valGrad)" fillOpacity="0.1" opacity="0.3" transform="rotate(-6 18 20)" />
      <rect x="8" y="10" width="20" height="16" rx="3" stroke="url(#valGrad)" strokeWidth="1.5" fill="url(#valGrad)" fillOpacity="0.15" opacity="0.5" transform="rotate(-2 18 18)" />
      <rect x="8" y="8" width="20" height="16" rx="3" stroke="url(#valGrad)" strokeWidth="2" fill="url(#valGrad)" fillOpacity="0.2" opacity="0.8" />
      <line x1="12" y1="13" x2="24" y2="13" stroke="url(#valGrad)" strokeWidth="1.5" opacity="0.5" strokeLinecap="round" />
      <line x1="12" y1="17" x2="20" y2="17" stroke="url(#valGrad)" strokeWidth="1" opacity="0.3" strokeLinecap="round" />
      <defs><linearGradient id="valGrad" x1="0" y1="0" x2="36" y2="36"><stop stopColor="#e88fa5" /><stop offset="1" stopColor="#9f1239" /></linearGradient></defs>
    </svg>
  );
}

function DBTHouseIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <path d="M20 4 L36 16 L36 36 L4 36 L4 16 Z" stroke="url(#dbtGrad)" strokeWidth="1.5" fill="url(#dbtGrad)" fillOpacity="0.06" />
      <path d="M20 4 L36 16" stroke="url(#dbtGrad)" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
      <path d="M20 4 L4 16" stroke="url(#dbtGrad)" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
      <line x1="4" y1="36" x2="36" y2="36" stroke="url(#dbtGrad)" strokeWidth="2" opacity="0.6" />
      <line x1="4" y1="26" x2="36" y2="26" stroke="url(#dbtGrad)" strokeWidth="0.8" opacity="0.25" strokeDasharray="3 2" />
      <line x1="20" y1="16" x2="20" y2="36" stroke="url(#dbtGrad)" strokeWidth="0.8" opacity="0.25" strokeDasharray="3 2" />
      <rect x="15" y="28" width="10" height="8" rx="1" stroke="url(#dbtGrad)" strokeWidth="1.2" fill="url(#dbtGrad)" fillOpacity="0.12" />
      <rect x="7" y="18" width="5" height="5" rx="0.8" stroke="url(#dbtGrad)" strokeWidth="0.8" fill="url(#dbtGrad)" fillOpacity="0.08" />
      <rect x="28" y="18" width="5" height="5" rx="0.8" stroke="url(#dbtGrad)" strokeWidth="0.8" fill="url(#dbtGrad)" fillOpacity="0.08" />
      <circle cx="20" cy="10" r="1.5" fill="url(#dbtGrad)" opacity="0.5" />
      <defs><linearGradient id="dbtGrad" x1="0" y1="0" x2="40" y2="40"><stop stopColor="#f59e6b" /><stop offset="1" stopColor="#c2410c" /></linearGradient></defs>
    </svg>
  );
}

function PuppetTheaterIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <path d="M4 8 Q4 4 8 4 L32 4 Q36 4 36 8 L36 10 Q36 12 34 13 L22 18 L18 18 L6 13 Q4 12 4 10 Z" stroke="url(#ifsGrad)" strokeWidth="1.5" fill="url(#ifsGrad)" fillOpacity="0.08" />
      <path d="M8 4 L8 2 L10 2 L10 4" stroke="url(#ifsGrad)" strokeWidth="1" opacity="0.4" />
      <path d="M30 4 L30 2 L32 2 L32 4" stroke="url(#ifsGrad)" strokeWidth="1" opacity="0.4" />
      <circle cx="14" cy="26" r="5" stroke="url(#ifsGrad)" strokeWidth="1.5" fill="url(#ifsGrad)" fillOpacity="0.1" />
      <circle cx="26" cy="26" r="5" stroke="url(#ifsGrad)" strokeWidth="1.5" fill="url(#ifsGrad)" fillOpacity="0.1" />
      <circle cx="13" cy="25" r="0.8" fill="url(#ifsGrad)" opacity="0.7" />
      <circle cx="15.5" cy="25" r="0.8" fill="url(#ifsGrad)" opacity="0.7" />
      <circle cx="25" cy="25" r="0.8" fill="url(#ifsGrad)" opacity="0.7" />
      <circle cx="27.5" cy="25" r="0.8" fill="url(#ifsGrad)" opacity="0.7" />
      <path d="M12.5 28.5 Q14 30 15.5 28.5" stroke="url(#ifsGrad)" strokeWidth="0.8" fill="none" opacity="0.5" />
      <path d="M24.5 28.5 Q26 29.5 27.5 28.5" stroke="url(#ifsGrad)" strokeWidth="0.8" fill="none" opacity="0.5" />
      <line x1="14" y1="18" x2="14" y2="21" stroke="url(#ifsGrad)" strokeWidth="1" opacity="0.35" strokeDasharray="1.5 1.5" />
      <line x1="26" y1="18" x2="26" y2="21" stroke="url(#ifsGrad)" strokeWidth="1" opacity="0.35" strokeDasharray="1.5 1.5" />
      <line x1="10" y1="31" x2="8" y2="37" stroke="url(#ifsGrad)" strokeWidth="1" opacity="0.3" />
      <line x1="18" y1="31" x2="20" y2="37" stroke="url(#ifsGrad)" strokeWidth="1" opacity="0.3" />
      <line x1="22" y1="31" x2="20" y2="37" stroke="url(#ifsGrad)" strokeWidth="1" opacity="0.3" />
      <line x1="30" y1="31" x2="32" y2="37" stroke="url(#ifsGrad)" strokeWidth="1" opacity="0.3" />
      <defs><linearGradient id="ifsGrad" x1="0" y1="0" x2="40" y2="40"><stop stopColor="#8db4e8" /><stop offset="1" stopColor="#1e40af" /></linearGradient></defs>
    </svg>
  );
}

function GrowthGardenIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect x="4" y="32" width="32" height="6" rx="3" fill="url(#gardenGrad)" fillOpacity="0.15" stroke="url(#gardenGrad)" strokeWidth="1.2" />
      <path d="M14 32 Q14 22 10 18 Q8 16 10 14 Q12 12 14 14 Q16 16 14 18" stroke="url(#gardenGrad)" strokeWidth="1.5" fill="url(#gardenGrad)" fillOpacity="0.08" />
      <circle cx="12" cy="12" r="4" fill="url(#gardenGrad)" fillOpacity="0.2" stroke="url(#gardenGrad)" strokeWidth="1.2" />
      <path d="M20 32 Q20 16 20 12" stroke="url(#gardenGrad)" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="20" cy="8" r="5" fill="url(#gardenGrad)" fillOpacity="0.25" stroke="url(#gardenGrad)" strokeWidth="1.5" />
      <circle cx="20" cy="8" r="2" fill="url(#gardenGrad)" fillOpacity="0.5" />
      <path d="M28 32 Q28 26 26 22 Q24 18 28 16 Q32 18 30 22 Q28 26 28 32" stroke="url(#gardenGrad)" strokeWidth="1.2" fill="url(#gardenGrad)" fillOpacity="0.1" />
      <circle cx="28" cy="14" r="3" fill="url(#gardenGrad)" fillOpacity="0.15" stroke="url(#gardenGrad)" strokeWidth="1" />
      <defs><linearGradient id="gardenGrad" x1="0" y1="0" x2="40" y2="40"><stop stopColor="#86c97e" /><stop offset="1" stopColor="#2d6a30" /></linearGradient></defs>
    </svg>
  );
}

function FidgetToolsIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="8" stroke="url(#fidgetGrad)" strokeWidth="2" fill="url(#fidgetGrad)" fillOpacity="0.08" />
      <circle cx="20" cy="20" r="3" fill="url(#fidgetGrad)" fillOpacity="0.6" />
      <circle cx="20" cy="8" r="4.5" stroke="url(#fidgetGrad)" strokeWidth="1.5" fill="url(#fidgetGrad)" fillOpacity="0.12" />
      <circle cx="9.6" cy="26" r="4.5" stroke="url(#fidgetGrad)" strokeWidth="1.5" fill="url(#fidgetGrad)" fillOpacity="0.12" />
      <circle cx="30.4" cy="26" r="4.5" stroke="url(#fidgetGrad)" strokeWidth="1.5" fill="url(#fidgetGrad)" fillOpacity="0.12" />
      <line x1="20" y1="12.5" x2="20" y2="12" stroke="url(#fidgetGrad)" strokeWidth="1.5" />
      <line x1="13.5" y1="23" x2="14" y2="22.5" stroke="url(#fidgetGrad)" strokeWidth="1.5" />
      <line x1="26.5" y1="23" x2="26" y2="22.5" stroke="url(#fidgetGrad)" strokeWidth="1.5" />
      <defs><linearGradient id="fidgetGrad" x1="0" y1="0" x2="40" y2="40"><stop stopColor="#c084fc" /><stop offset="1" stopColor="#7c3aed" /></linearGradient></defs>
    </svg>
  );
}

function SafetyMapIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="16" stroke="url(#safetyGrad)" strokeWidth="1" opacity="0.2" />
      <circle cx="20" cy="20" r="11" stroke="url(#safetyGrad)" strokeWidth="1.2" opacity="0.3" strokeDasharray="4 3" />
      <circle cx="20" cy="20" r="6" stroke="url(#safetyGrad)" strokeWidth="1.5" opacity="0.5" fill="url(#safetyGrad)" fillOpacity="0.08" />
      <circle cx="20" cy="20" r="2.5" fill="url(#safetyGrad)" opacity="0.7" />
      <circle cx="12" cy="10" r="2" fill="url(#safetyGrad)" opacity="0.4" />
      <circle cx="30" cy="12" r="1.5" fill="url(#safetyGrad)" opacity="0.3" />
      <circle cx="8" cy="24" r="1.8" fill="url(#safetyGrad)" opacity="0.35" />
      <circle cx="32" cy="28" r="2.2" fill="url(#safetyGrad)" opacity="0.3" />
      <circle cx="14" cy="34" r="1.5" fill="url(#safetyGrad)" opacity="0.25" />
      <line x1="20" y1="20" x2="12" y2="10" stroke="url(#safetyGrad)" strokeWidth="0.8" opacity="0.2" strokeDasharray="2 2" />
      <line x1="20" y1="20" x2="30" y2="12" stroke="url(#safetyGrad)" strokeWidth="0.8" opacity="0.2" strokeDasharray="2 2" />
      <line x1="20" y1="20" x2="8" y2="24" stroke="url(#safetyGrad)" strokeWidth="0.8" opacity="0.2" strokeDasharray="2 2" />
      <defs><linearGradient id="safetyGrad" x1="0" y1="0" x2="40" y2="40"><stop stopColor="#60a5fa" /><stop offset="1" stopColor="#1d4ed8" /></linearGradient></defs>
    </svg>
  );
}

function CopingDeckIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect x="6" y="14" width="18" height="22" rx="3" stroke="url(#copingGrad)" strokeWidth="1" fill="url(#copingGrad)" fillOpacity="0.06" opacity="0.3" transform="rotate(-8 15 25)" />
      <rect x="8" y="12" width="18" height="22" rx="3" stroke="url(#copingGrad)" strokeWidth="1.2" fill="url(#copingGrad)" fillOpacity="0.1" opacity="0.5" transform="rotate(-3 17 23)" />
      <rect x="10" y="10" width="18" height="22" rx="3" stroke="url(#copingGrad)" strokeWidth="1.5" fill="url(#copingGrad)" fillOpacity="0.15" />
      <path d="M15 18 L19 22 L23 16" stroke="url(#copingGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" fill="none" />
      <line x1="14" y1="26" x2="24" y2="26" stroke="url(#copingGrad)" strokeWidth="1" opacity="0.3" strokeLinecap="round" />
      <line x1="14" y1="29" x2="21" y2="29" stroke="url(#copingGrad)" strokeWidth="0.8" opacity="0.2" strokeLinecap="round" />
      <circle cx="30" cy="8" r="6" stroke="url(#copingGrad)" strokeWidth="1.2" fill="url(#copingGrad)" fillOpacity="0.08" />
      <path d="M28 8 L30 10 L33 6" stroke="url(#copingGrad)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" fill="none" />
      <defs><linearGradient id="copingGrad" x1="0" y1="0" x2="40" y2="40"><stop stopColor="#fb923c" /><stop offset="1" stopColor="#c2410c" /></linearGradient></defs>
    </svg>
  );
}

function SocialStoryIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect x="4" y="6" width="32" height="28" rx="4" stroke="url(#storyGrad)" strokeWidth="1.5" fill="url(#storyGrad)" fillOpacity="0.06" />
      <line x1="20" y1="6" x2="20" y2="34" stroke="url(#storyGrad)" strokeWidth="1" opacity="0.2" />
      <rect x="8" y="10" width="8" height="6" rx="1.5" fill="url(#storyGrad)" fillOpacity="0.15" stroke="url(#storyGrad)" strokeWidth="0.8" />
      <circle cx="12" cy="13" r="1.5" fill="url(#storyGrad)" opacity="0.5" />
      <line x1="8" y1="19" x2="16" y2="19" stroke="url(#storyGrad)" strokeWidth="0.8" opacity="0.3" strokeLinecap="round" />
      <line x1="8" y1="21.5" x2="14" y2="21.5" stroke="url(#storyGrad)" strokeWidth="0.8" opacity="0.2" strokeLinecap="round" />
      <rect x="24" y="10" width="8" height="6" rx="1.5" fill="url(#storyGrad)" fillOpacity="0.12" stroke="url(#storyGrad)" strokeWidth="0.8" />
      <path d="M26 13 L28 11 L30 13" stroke="url(#storyGrad)" strokeWidth="0.8" opacity="0.4" fill="none" />
      <line x1="24" y1="19" x2="32" y2="19" stroke="url(#storyGrad)" strokeWidth="0.8" opacity="0.3" strokeLinecap="round" />
      <line x1="24" y1="21.5" x2="30" y2="21.5" stroke="url(#storyGrad)" strokeWidth="0.8" opacity="0.2" strokeLinecap="round" />
      <rect x="8" y="25" width="8" height="5" rx="1.5" fill="url(#storyGrad)" fillOpacity="0.1" stroke="url(#storyGrad)" strokeWidth="0.8" />
      <rect x="24" y="25" width="8" height="5" rx="1.5" fill="url(#storyGrad)" fillOpacity="0.1" stroke="url(#storyGrad)" strokeWidth="0.8" />
      <defs><linearGradient id="storyGrad" x1="0" y1="0" x2="40" y2="40"><stop stopColor="#f472b6" /><stop offset="1" stopColor="#be185d" /></linearGradient></defs>
    </svg>
  );
}

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [showBackToTop, setShowBackToTop] = useState(false);
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);

  const waitlistMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.status === 409) {
        throw new Error("You're already on the waitlist!");
      }
      if (!res.ok) throw new Error("Failed to join waitlist");
      return res.json();
    },
    onSuccess: () => {
      setWaitlistSubmitted(true);
      setWaitlistEmail("");
    },
    onError: (err: Error) => {
      toast({ title: err.message, variant: "destructive" });
    },
  });

  const { data: foundingSlots } = useQuery<{ total: number; remaining: number }>({
    queryKey: ["/api/billing/founding-slots"],
    queryFn: async () => {
      const res = await fetch("/api/billing/founding-slots");
      return res.json();
    },
  });

  const remaining = foundingSlots?.remaining ?? 100;
  const total = foundingSlots?.total ?? 100;
  const percentClaimed = Math.round(((total - remaining) / total) * 100);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isLoading, isAuthenticated, navigate]);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 600);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    "Unlimited Clinical Sessions",
    "Full 5-Tool Clinical Suite",
    "Real-time Collaboration",
    "Clinical Insights & Prompts",
    "HIPAA-Safe No-PHI Architecture",
    "Priority Access to New Tools",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FDFBF7] via-[#F8F6F1] to-secondary/20 pb-0">
      <section className="relative pt-36 pb-24 md:pt-52 md:pb-36 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-gradient-to-r from-accent/10 via-accent/5 to-primary/5 border border-accent/25 text-primary text-xs font-bold tracking-[0.2em] uppercase mb-6 social-proof-glow">
                <Star size={13} className="fill-accent text-accent" />
                Built for Licensed Clinicians
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif font-medium leading-[1.1] text-primary mb-6">
                Therapy, <br />
                <span className="italic text-accent">Reimagined.</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-lg mb-8">
                A premium telehealth hub designed for evidence-based engagement. 
                Experience the intersection of clinical sophistication and interactive play.
              </p>
              <motion.div
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link href="/signup">
                  <motion.button
                    className="h-14 px-8 rounded-full bg-gradient-to-r from-[#2E8B57] to-[#236B43] text-white border border-[#D4AF37]/40 shadow-xl shadow-[#2E8B57]/20 hover:shadow-2xl hover:shadow-[#2E8B57]/30 font-medium text-lg btn-luxury flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    data-testid="button-get-started"
                  >
                    Get Started <ArrowRight size={18} />
                  </motion.button>
                </Link>
                <Link href="/login">
                  <motion.button
                    className="h-14 px-8 rounded-full bg-white/80 backdrop-blur-sm border border-white/40 text-foreground font-medium text-lg hover:bg-white transition-colors cursor-pointer w-full sm:w-auto"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    data-testid="button-sign-in"
                  >
                    Sign In
                  </motion.button>
                </Link>
              </motion.div>
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

      <section className="py-24 md:py-32 px-6 relative overflow-hidden" id="features">
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-emerald-200/20 blur-3xl" style={{ animation: "parallax-float 12s ease-in-out infinite" }} />
          <div className="absolute top-1/3 -right-16 w-64 h-64 rounded-full bg-purple-200/15 blur-3xl" style={{ animation: "parallax-float-slow 10s ease-in-out infinite" }} />
          <div className="absolute bottom-10 left-1/4 w-48 h-48 rounded-full bg-accent/10 blur-3xl" style={{ animation: "parallax-float 14s ease-in-out infinite 2s" }} />
          <div className="absolute top-10 right-1/3 w-32 h-32 rounded-full bg-teal-200/15 blur-2xl" style={{ animation: "parallax-float-slow 8s ease-in-out infinite 1s" }} />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            className="text-center mb-16 md:mb-20 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xs font-bold tracking-[0.25em] text-accent uppercase mb-4">Your Digital Office</p>
            <h2 className="text-3xl md:text-5xl font-serif text-primary mb-4">The Clinical Suite</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Five evidence-based interactive tools — ready on day one. Each one designed to bridge the physical distance without losing the therapeutic connection.
            </p>
          </motion.div>

          {(() => {
            const tools = [
              {
                title: "Zen Sandtray",
                desc: "A physics-based shared canvas where clients drag emoji assets to build expressive worlds. Features lift shadows, soft collision nudging, sand dust particles, and clinician moderator controls — all synchronized in real-time across devices.",
                IconComponent: ZenCircleIcon,
                iconClass: "icon-sandtray",
                gradient: "from-amber-50 via-amber-100/60 to-orange-50",
                borderGlow: "hover:shadow-amber-200/40",
                tags: ["Expressive Arts", "Ages 5+"],
              },
              {
                title: "Calm Breathing Guide",
                desc: "A beautiful SVG breathing bubble with a 4-phase cycle (inhale, hold, exhale, rest) that the clinician controls and every participant follows in sync. Perfect for grounding, co-regulation, and session warm-ups.",
                IconComponent: AuraPulseIcon,
                iconClass: "icon-breathing",
                gradient: "from-emerald-50 via-green-100/50 to-teal-50",
                borderGlow: "hover:shadow-emerald-200/40",
                tags: ["Somatic", "Co-Regulation"],
              },
              {
                title: "Feeling Wheel",
                desc: "An interactive three-layer emotion wheel that guides clients from broad feelings to nuanced emotions. Selections sync in real-time and feed into Clinical Insights so you always know where the session is headed.",
                IconComponent: CompassWheelIcon,
                iconClass: "icon-feeling",
                gradient: "from-purple-50 via-violet-100/50 to-fuchsia-50",
                borderGlow: "hover:shadow-purple-200/40",
                tags: ["Emotional Literacy", "CBT"],
              },
              {
                title: "Narrative Timeline",
                desc: "A scrollable visual river where clients place event stones to map their life story. Drag to reorder, color-code by theme, and explore patterns across time — a powerful tool for trauma-informed narrative therapy.",
                IconComponent: TimelineRiverIcon,
                iconClass: "icon-timeline",
                gradient: "from-cyan-50 via-teal-100/50 to-sky-50",
                borderGlow: "hover:shadow-teal-200/40",
                tags: ["Narrative Therapy", "Trauma-Informed"],
              },
              {
                title: "Values Card Sort",
                desc: "A tactile drag-and-drop card deck for identifying and prioritizing personal values. Clients sort 30+ value cards into columns — a cornerstone exercise for ACT, motivational interviewing, and life transitions work.",
                IconComponent: CardStackIcon,
                iconClass: "icon-values",
                gradient: "from-rose-50 via-pink-100/50 to-red-50",
                borderGlow: "hover:shadow-rose-200/40",
                tags: ["ACT", "Motivational Interviewing"],
              },
            ];
            const topRow = tools.slice(0, 3);
            const bottomRow = tools.slice(3);
            const renderCard = (tool: typeof tools[number], i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -6, transition: { duration: 0.3 } }}
              >
                <GlassCard className={`group cursor-pointer h-full hover:shadow-xl ${tool.borderGlow} transition-shadow duration-500`}>
                  <div className={`aspect-[5/3] overflow-hidden bg-gradient-to-br ${tool.gradient} flex items-center justify-center relative`}>
                    <motion.div
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 4 + i * 0.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <div className={`glass-icon ${tool.iconClass}`}>
                        <tool.IconComponent />
                      </div>
                    </motion.div>
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase text-[#2E8B57] border border-[#2E8B57]/20 shadow-sm">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#2E8B57] mr-1.5 align-middle" />
                      Active
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-serif text-primary mb-2 group-hover:text-accent transition-colors duration-300">{tool.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-3">{tool.desc}</p>
                    {tool.tags && (
                      <div className="flex flex-wrap gap-1.5">
                        {tool.tags.map((tag: string) => (
                          <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full font-semibold tracking-wide bg-[#2E8B57]/8 text-[#2E8B57] border border-[#2E8B57]/15">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </GlassCard>
              </motion.div>
            );
            return (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7 max-w-6xl mx-auto">
                  {topRow.map((tool, i) => renderCard(tool, i))}
                </div>
                <div className="grid md:grid-cols-2 gap-7 mt-7 max-w-4xl mx-auto">
                  {bottomRow.map((tool, i) => renderCard(tool, i + 3))}
                </div>
              </>
            );
          })()}
        </div>
      </section>

      <section className="py-24 md:py-32 px-6 bg-gradient-to-b from-white/30 via-white/20 to-transparent relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div className="absolute -bottom-10 -right-20 w-60 h-60 rounded-full bg-orange-100/25 blur-3xl" style={{ animation: "parallax-float 16s ease-in-out infinite" }} />
          <div className="absolute top-20 -left-10 w-40 h-40 rounded-full bg-blue-100/20 blur-3xl" style={{ animation: "parallax-float-slow 11s ease-in-out infinite 3s" }} />
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            className="text-center mb-14 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F52BA]/5 border border-[#0F52BA]/20 text-[#0F52BA] text-xs font-bold tracking-[0.2em] uppercase mb-6">
              <span className="w-2 h-2 rounded-full bg-[#0F52BA] animate-pulse" />
              Actively Building
            </div>
            <h2 className="text-3xl md:text-5xl font-serif text-primary mb-4">What's Coming Next</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Our clinical library keeps growing. These premium tools are actively being built — and will be included free with every plan at launch.
            </p>
          </motion.div>

          {(() => {
            const upcomingTools = [
              {
                title: "The DBT House",
                desc: "A room-by-room interactive framework for exploring emotional regulation, distress tolerance, mindfulness, and interpersonal effectiveness. Clients furnish each room with skills they're building — a visual, tactile way to internalize core DBT concepts.",
                IconComponent: DBTHouseIcon,
                iconClass: "icon-dbt",
                gradient: "from-orange-50 via-amber-50/60 to-rose-50",
                borderGlow: "hover:shadow-orange-200/30",
                tags: ["DBT", "Skills Training"],
              },
              {
                title: "Parts Puppet Theater",
                desc: "An IFS-inspired stage where clients give voice to internal parts through interactive puppet figures. Drag characters onto the stage, assign them emotions and roles, create dialogues between parts — externalize, explore, and integrate in real-time.",
                IconComponent: PuppetTheaterIcon,
                iconClass: "icon-ifs",
                gradient: "from-sky-50 via-blue-50/60 to-indigo-50",
                borderGlow: "hover:shadow-blue-200/30",
                tags: ["IFS", "Parts Work"],
              },
              {
                title: "Growth Garden",
                desc: "A collaborative virtual garden where clients and clinicians plant seeds that grow over multiple sessions. Each plant represents a goal, coping skill, or positive habit. Watch the garden flourish as therapeutic progress unfolds — a living metaphor for growth.",
                IconComponent: GrowthGardenIcon,
                iconClass: "icon-garden",
                gradient: "from-green-50 via-emerald-50/60 to-lime-50",
                borderGlow: "hover:shadow-green-200/30",
                tags: ["Rapport Building", "Goal Tracking"],
              },
              {
                title: "Fidget Toolbox",
                desc: "A calming sensory toolkit with interactive fidget spinners, breathing sand, a digital worry stone, and a color-mixing canvas. Designed for clients who need tactile regulation during talk therapy — especially effective for ADHD and anxiety.",
                IconComponent: FidgetToolsIcon,
                iconClass: "icon-fidgets",
                gradient: "from-violet-50 via-purple-50/60 to-fuchsia-50",
                borderGlow: "hover:shadow-violet-200/30",
                tags: ["Sensory", "ADHD-Friendly"],
              },
              {
                title: "Safety & Support Map",
                desc: "An interactive concentric-circle map where clients plot their support network — from inner circle (trusted people) to outer ring (community resources). Visualize connection strength, identify gaps, and build safety plans collaboratively.",
                IconComponent: SafetyMapIcon,
                iconClass: "icon-safety",
                gradient: "from-blue-50 via-sky-50/60 to-cyan-50",
                borderGlow: "hover:shadow-blue-200/30",
                tags: ["Safety Planning", "Crisis Intervention"],
              },
              {
                title: "Coping Skills Deck",
                desc: "A beautifully illustrated card deck with 50+ evidence-based coping strategies organized by category — grounding, distraction, self-soothing, opposite action, and more. Clients swipe, save favorites, and build a personalized coping toolkit.",
                IconComponent: CopingDeckIcon,
                iconClass: "icon-coping",
                gradient: "from-amber-50 via-orange-50/60 to-yellow-50",
                borderGlow: "hover:shadow-amber-200/30",
                tags: ["CBT", "DBT Skills"],
              },
              {
                title: "Social Story Builder",
                desc: "A visual storyboard editor for creating personalized social stories. Clinicians and clients choose scenes, add characters, write captions, and sequence events — ideal for autism spectrum work, social skills groups, and pediatric therapy.",
                IconComponent: SocialStoryIcon,
                iconClass: "icon-social",
                gradient: "from-pink-50 via-rose-50/60 to-red-50",
                borderGlow: "hover:shadow-pink-200/30",
                tags: ["Autism Spectrum", "Pediatric"],
              },
            ];

            const topRow = upcomingTools.slice(0, 3);
            const middleRow = upcomingTools.slice(3, 5);
            const bottomRow = upcomingTools.slice(5);

            const renderUpcomingCard = (tool: typeof upcomingTools[number], i: number) => (
              <motion.div
                key={tool.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.08 }}
                whileHover={{ y: -5, transition: { duration: 0.3 } }}
              >
                <GlassCard className={`group h-full hover:shadow-xl ${tool.borderGlow} transition-shadow duration-500`} hoverEffect={true}>
                  <div className={`aspect-[5/3] overflow-hidden bg-gradient-to-br ${tool.gradient} flex items-center justify-center relative`}>
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 5 + i * 0.3, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
                    >
                      <div className={`glass-icon ${tool.iconClass}`}>
                        <tool.IconComponent />
                      </div>
                    </motion.div>
                    <div className="absolute top-4 right-4 bg-[#0F52BA]/5 backdrop-blur-sm px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase text-[#0F52BA] border border-[#0F52BA]/20 shadow-sm flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0F52BA] animate-pulse" />
                      In Development
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-serif text-primary mb-2 group-hover:text-accent transition-colors duration-300">{tool.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-3">{tool.desc}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {tool.tags.map((tag) => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full font-semibold tracking-wide bg-[#0F52BA]/6 text-[#0F52BA] border border-[#0F52BA]/12">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            );

            return (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7 max-w-6xl mx-auto">
                  {topRow.map((tool, i) => renderUpcomingCard(tool, i))}
                </div>
                <div className="grid md:grid-cols-2 gap-7 mt-7 max-w-4xl mx-auto">
                  {middleRow.map((tool, i) => renderUpcomingCard(tool, i + 3))}
                </div>
                <div className="grid md:grid-cols-2 gap-7 mt-7 max-w-4xl mx-auto">
                  {bottomRow.map((tool, i) => renderUpcomingCard(tool, i + 5))}
                </div>
              </>
            );
          })()}
        </div>
      </section>

      <section className="py-24 md:py-32 px-6" id="pricing">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <GlassCard className="p-10 md:p-14 text-center border-accent/20" hoverEffect={false}>
              <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6">
                <Sparkles size={12} />
                Coming Soon
              </div>
              <h3 className="text-3xl md:text-4xl font-serif text-primary mb-4">Pricing Plans on the Way</h3>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6 max-w-md mx-auto">
                We're putting the finishing touches on our plans — including a generous free tier, affordable monthly options, and exclusive founding member pricing.
              </p>
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                {["Free Tier", "$7/mo Community", "$67/yr Annual", "$99 Founding Member"].map((plan) => (
                  <span key={plan} className="bg-primary/5 text-primary/70 px-3 py-1.5 rounded-full text-xs font-medium">
                    {plan}
                  </span>
                ))}
              </div>
              <div className="mt-8 max-w-sm mx-auto" id="waitlist">
                {waitlistSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 justify-center text-emerald-600 bg-emerald-50 px-4 py-3 rounded-full text-sm font-medium"
                  >
                    <CheckCircle2 size={16} />
                    You're on the list! We'll be in touch.
                  </motion.div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (waitlistEmail.trim()) waitlistMutation.mutate(waitlistEmail.trim());
                    }}
                    className="flex gap-2"
                    data-testid="form-waitlist"
                  >
                    <div className="relative flex-1">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                      <input
                        type="email"
                        required
                        placeholder="your@email.com"
                        value={waitlistEmail}
                        onChange={(e) => setWaitlistEmail(e.target.value)}
                        className="w-full h-11 pl-10 pr-4 rounded-full border border-white/40 bg-white/60 backdrop-blur-sm text-sm text-primary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/40 transition-all"
                        data-testid="input-waitlist-email"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={waitlistMutation.isPending}
                      className="h-11 px-5 rounded-full bg-gradient-to-r from-[#2E8B57] to-[#236B43] text-white text-sm font-medium hover:scale-105 transition-transform active:scale-95 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                      data-testid="button-waitlist-submit"
                    >
                      {waitlistMutation.isPending ? "Joining..." : "Join Waitlist"}
                    </button>
                  </form>
                )}
                <p className="text-xs text-muted-foreground/60 mt-2 text-center">
                  No spam. Just launch updates.
                </p>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      <section className="py-20 md:py-28 px-6" id="founding">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <GlassCard className="p-8 md:p-12 border-primary/20 bg-gradient-to-br from-primary/[0.03] to-accent/[0.03] relative overflow-hidden" hoverEffect={false}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
              <div className="relative">
                <div className="flex items-center justify-center gap-2 mb-6">
                  <div className="bg-gradient-to-r from-[#2E8B57] to-[#236B43] border border-[#D4AF37]/40 text-white px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase flex items-center gap-1.5 shadow-lg shadow-[#2E8B57]/20">
                    <Flame size={12} /> Founder's Circle
                  </div>
                  {remaining > 0 && (
                    <span className="bg-accent/10 text-accent px-3 py-1.5 rounded-full text-xs font-bold">
                      {remaining} of {total} left
                    </span>
                  )}
                </div>
                <h3 className="text-2xl md:text-3xl font-serif text-primary text-center mb-3 flex items-center justify-center gap-2">
                  <Crown size={22} className="text-accent" /> Founding Member Access
                </h3>
                <p className="text-muted-foreground text-center leading-relaxed mb-6 max-w-lg mx-auto">
                  Lock in lifetime access to ClinicalPlay for a one-time payment of <span className="font-bold text-primary">$99</span>. No subscription. No recurring fees. Just full access, forever.
                </p>

                {remaining > 0 && (
                  <div className="max-w-sm mx-auto mb-6">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                      <span>{percentClaimed}% claimed</span>
                      <span className="font-semibold text-primary">{remaining} spots remaining</span>
                    </div>
                    <div className="w-full bg-primary/10 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-accent to-primary rounded-full"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${percentClaimed}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.3 }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link href="/signup">
                    <button
                      className="h-12 px-8 rounded-full bg-gradient-to-r from-[#2E8B57] to-[#236B43] text-white border border-[#D4AF37]/40 shadow-xl shadow-[#2E8B57]/20 hover:scale-105 transition-transform active:scale-95 font-medium flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      data-testid="button-founding-member-cta"
                      disabled={remaining <= 0}
                    >
                      <Crown size={16} />
                      {remaining > 0 ? "Claim Your Founding Spot — $99" : "Sold Out"}
                    </button>
                  </Link>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Lock size={10} /> One-time payment. Lifetime access.
                  </p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      <section className="py-20 md:py-28 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <GlassCard className="p-8 md:p-10 text-center" hoverEffect={false}>
              <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-linear-to-tr from-[#2E8B57] to-[#D4AF37] flex items-center justify-center shadow-lg">
                <Heart size={28} className="text-white" />
              </div>
              <h3 className="text-2xl md:text-3xl font-serif text-primary mb-3" data-testid="text-about-founder">About the Founder</h3>
              <p className="text-muted-foreground leading-relaxed max-w-xl mx-auto mb-4">
                Created by a Social Worker and Veteran with a mission to bridge the gap between clinical efficacy and digital engagement.
              </p>
              <p className="text-sm text-muted-foreground/70 italic">
                "I got tired of boring telehealth sessions, so I built us a digital playroom."
              </p>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-white/30 bg-white/20 backdrop-blur-sm py-16 md:py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-10 md:gap-12 mb-10">
            <div>
              <div className="mb-5">
                <LogoMark size="md" />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                A premium telehealth platform for evidence-based therapeutic engagement.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-semibold tracking-[0.15em] uppercase text-muted-foreground mb-5">Legal</h4>
              <div className="space-y-3.5">
                <Link href="/privacy" className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-primary transition-colors no-underline" data-testid="link-footer-privacy">
                  <Shield size={14} className="shrink-0" />
                  Privacy Policy
                </Link>
                <Link href="/terms" className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-primary transition-colors no-underline" data-testid="link-footer-terms">
                  <FileText size={14} className="shrink-0" />
                  Terms of Service
                </Link>
                <Link href="/cookies" className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-primary transition-colors no-underline" data-testid="link-footer-cookies">
                  <Cookie size={14} className="shrink-0" />
                  Cookie Policy
                </Link>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold tracking-[0.15em] uppercase text-muted-foreground mb-5">Platform</h4>
              <div className="space-y-3.5">
                <Link href="/login" className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-primary transition-colors no-underline" data-testid="link-footer-signin">
                  Clinician Sign In
                </Link>
                <p className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <Lock size={14} className="shrink-0 text-muted-foreground/50" />
                  No PHI Collected
                </p>
                <p className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <Shield size={14} className="shrink-0 text-muted-foreground/50" />
                  256-bit TLS Encryption
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-white/30 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground/70">
              &copy; {new Date().getFullYear()} ClinicalPlay. All rights reserved.
            </p>
            <div className="flex items-center gap-5">
              <Link href="/privacy" className="text-xs text-muted-foreground/70 hover:text-primary transition-colors no-underline">
                Privacy
              </Link>
              <Link href="/terms" className="text-xs text-muted-foreground/70 hover:text-primary transition-colors no-underline">
                Terms
              </Link>
              <Link href="/cookies" className="text-xs text-muted-foreground/70 hover:text-primary transition-colors no-underline">
                Cookies
              </Link>
            </div>
          </div>
          <LegalDisclaimer />
        </div>
      </footer>

      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-20 right-5 md:bottom-8 md:right-8 z-40 w-11 h-11 md:w-12 md:h-12 rounded-full bg-primary/90 text-primary-foreground shadow-lg shadow-primary/30 backdrop-blur-sm flex items-center justify-center hover:bg-primary transition-colors cursor-pointer active:scale-90"
            data-testid="button-back-to-top"
          >
            <ArrowUp size={20} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
