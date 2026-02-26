import { GlassCard } from "@/components/ui/glass-card";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  User, Palette, Play, Crown, Users, Shield, Lock,
  ChevronRight, Settings, Sparkles
} from "lucide-react";
import { Link, useLocation } from "wouter";

const SETTINGS_SECTIONS = [
  {
    id: "profile",
    label: "Profile",
    description: "Name, credentials & professional details",
    icon: User,
    path: "/settings/profile",
    iconBg: "bg-gradient-to-br from-primary/15 to-primary/5",
    iconText: "text-primary",
  },
  {
    id: "appearance",
    label: "Appearance",
    description: "Theme colors, style & display preferences",
    icon: Palette,
    path: "/settings/appearance",
    iconBg: "bg-gradient-to-br from-accent/15 to-accent/5",
    iconText: "text-accent",
  },
  {
    id: "sessions",
    label: "Session Defaults",
    description: "Default session behavior & export history",
    icon: Play,
    path: "/settings/sessions",
    iconBg: "bg-gradient-to-br from-purple-500/15 to-purple-500/5",
    iconText: "text-purple-600",
  },
  {
    id: "billing",
    label: "Plan & Billing",
    description: "Subscription, payment method & invoices",
    icon: Crown,
    path: "/settings/billing",
    iconBg: "bg-gradient-to-br from-amber-500/15 to-amber-500/5",
    iconText: "text-amber-600",
  },
  {
    id: "team",
    label: "Team",
    description: "Organization members & invitations",
    icon: Users,
    path: "/settings/team",
    iconBg: "bg-gradient-to-br from-blue-500/15 to-blue-500/5",
    iconText: "text-blue-600",
  },
  {
    id: "security",
    label: "Security",
    description: "Password, two-factor & active devices",
    icon: Shield,
    path: "/settings/security",
    iconBg: "bg-gradient-to-br from-emerald-500/15 to-emerald-500/5",
    iconText: "text-emerald-600",
  },
  {
    id: "privacy",
    label: "Data & Privacy",
    description: "PHI policy, data export & account deletion",
    icon: Lock,
    path: "/settings/privacy",
    iconBg: "bg-gradient-to-br from-rose-500/15 to-rose-500/5",
    iconText: "text-rose-500",
  },
];

function UserHeader({ user }: { user: any }) {
  const initials = [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join("").toUpperCase() || "?";
  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Clinician";

  return (
    <div className="relative mb-8 p-6 md:p-8 rounded-3xl overflow-hidden border border-border/50 bg-gradient-to-br from-card via-card to-secondary/30">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(var(--primary)/0.04),_transparent_60%)]" />
      <div className="absolute top-0 right-0 w-48 h-48 bg-[radial-gradient(circle,_hsl(var(--accent)/0.06),_transparent_70%)] blur-2xl" />

      <div className="relative flex items-center gap-4">
        <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/15 flex items-center justify-center shadow-sm">
          <span className="text-lg md:text-xl font-serif font-bold text-primary">{initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl md:text-2xl font-serif text-foreground tracking-tight" data-testid="text-settings-title">{displayName}</h1>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{user?.email || ""}</p>
          {user?.professionalTitle && (
            <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/8 border border-primary/10">
              <Sparkles size={10} className="text-primary" />
              <span className="text-[10px] font-medium text-primary">{user.professionalTitle}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SettingsHub() {
  const { isLoading: authLoading, isAuthenticated, user } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [authLoading, isAuthenticated]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/15 to-accent/10 flex items-center justify-center">
            <Settings size={24} className="text-primary animate-pulse" />
          </div>
          <p className="text-sm text-muted-foreground font-medium">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-12 pt-18 md:pt-22 px-4 md:px-8">
      <div className="max-w-xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <UserHeader user={user} />

          <div className="mb-4">
            <p className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-[0.18em] px-1">Settings</p>
          </div>

          <div className="space-y-1.5">
            {SETTINGS_SECTIONS.map((section, i) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link href={section.path} className="no-underline block">
                  <div
                    className="flex items-center gap-4 px-4 py-3.5 rounded-2xl cursor-pointer group transition-all duration-200 hover:bg-card hover:shadow-sm hover:border-border/60 border border-transparent active:scale-[0.99]"
                    data-testid={`card-settings-${section.id}`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${section.iconBg} shadow-sm`}>
                      <section.icon size={18} className={section.iconText} strokeWidth={1.8} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-foreground leading-snug">{section.label}</p>
                      <p className="text-[11px] text-muted-foreground/70 mt-0.5 leading-relaxed">{section.description}</p>
                    </div>
                    <ChevronRight size={16} className="text-muted-foreground/30 group-hover:text-muted-foreground/60 group-hover:translate-x-0.5 transition-all duration-200 shrink-0" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-[10px] text-muted-foreground/40 tracking-wide">ClinicalPlay v1.0</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
