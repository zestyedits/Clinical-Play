import { GlassCard } from "@/components/ui/glass-card";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  User, Palette, Play, Crown, Users, Shield, Lock,
  ChevronRight, Settings
} from "lucide-react";
import { Link, useLocation } from "wouter";

const SETTINGS_SECTIONS = [
  {
    id: "profile",
    label: "Profile",
    description: "Name, credentials, bio & professional details",
    icon: User,
    path: "/settings/profile",
    color: "bg-primary/10 text-primary",
  },
  {
    id: "appearance",
    label: "Appearance",
    description: "Theme colors, animations & display preferences",
    icon: Palette,
    path: "/settings/appearance",
    color: "bg-accent/10 text-accent",
  },
  {
    id: "sessions",
    label: "Session Defaults",
    description: "Default session behavior & export history",
    icon: Play,
    path: "/settings/sessions",
    color: "bg-purple-500/10 text-purple-600",
  },
  {
    id: "billing",
    label: "Plan & Billing",
    description: "Subscription, payment method & invoices",
    icon: Crown,
    path: "/settings/billing",
    color: "bg-amber-500/10 text-amber-600",
  },
  {
    id: "team",
    label: "Team",
    description: "Organization members & invitations",
    icon: Users,
    path: "/settings/team",
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    id: "security",
    label: "Security",
    description: "Password, two-factor & active devices",
    icon: Shield,
    path: "/settings/security",
    color: "bg-emerald-500/10 text-emerald-600",
  },
  {
    id: "privacy",
    label: "Data & Privacy",
    description: "PHI policy, data export & account deletion",
    icon: Lock,
    path: "/settings/privacy",
    color: "bg-red-500/10 text-red-500",
  },
];

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
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
            <Settings size={24} className="text-primary" />
          </div>
          <p className="text-muted-foreground font-medium">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-12 pt-20 md:pt-24 px-4 md:px-8">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-serif text-foreground" data-testid="text-settings-title">Settings</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {user?.firstName ? `Welcome, ${user.firstName}` : "Manage your account"}
            </p>
          </div>

          <div className="space-y-2.5">
            {SETTINGS_SECTIONS.map((section, i) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
              >
                <Link href={section.path} className="no-underline block">
                  <GlassCard
                    className="p-4 md:p-5 cursor-pointer group"
                    hoverEffect={true}
                    data-testid={`card-settings-${section.id}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${section.color}`}>
                        <section.icon size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">{section.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{section.description}</p>
                      </div>
                      <ChevronRight size={18} className="text-muted-foreground/40 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all shrink-0" />
                    </div>
                  </GlassCard>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
