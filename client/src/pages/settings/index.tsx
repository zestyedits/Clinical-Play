import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Palette, Play, Crown, Users, Shield, Lock,
  ChevronRight, Settings, Sparkles, Search, X, Briefcase
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
    keywords: ["name", "first", "last", "email", "bio", "pronouns", "location", "practice"],
  },
  {
    id: "appearance",
    label: "Appearance",
    description: "Theme colors, style & display preferences",
    icon: Palette,
    path: "/settings/appearance",
    iconBg: "bg-gradient-to-br from-accent/15 to-accent/5",
    iconText: "text-accent",
    keywords: ["theme", "color", "palette", "dark", "light", "animations", "sound", "motion", "style", "tone"],
  },
  {
    id: "sessions",
    label: "Session Defaults",
    description: "Default session behavior & export history",
    icon: Play,
    path: "/settings/sessions",
    iconBg: "bg-gradient-to-br from-purple-500/15 to-purple-500/5",
    iconText: "text-purple-600",
    keywords: ["session", "anonymous", "default", "export", "artifact"],
  },
  {
    id: "billing",
    label: "Plan & Billing",
    description: "Subscription, payment method & invoices",
    icon: Crown,
    path: "/settings/billing",
    iconBg: "bg-gradient-to-br from-amber-500/15 to-amber-500/5",
    iconText: "text-amber-600",
    keywords: ["plan", "billing", "subscription", "payment", "card", "invoice", "stripe", "upgrade"],
  },
  {
    id: "team",
    label: "Team",
    description: "Organization members & invitations",
    icon: Users,
    path: "/settings/team",
    iconBg: "bg-gradient-to-br from-blue-500/15 to-blue-500/5",
    iconText: "text-blue-600",
    keywords: ["team", "organization", "member", "invite", "role", "admin"],
  },
  {
    id: "security",
    label: "Security",
    description: "Password, two-factor & active devices",
    icon: Shield,
    path: "/settings/security",
    iconBg: "bg-gradient-to-br from-emerald-500/15 to-emerald-500/5",
    iconText: "text-emerald-600",
    keywords: ["password", "reset", "two-factor", "2fa", "device", "login"],
  },
  {
    id: "privacy",
    label: "Data & Privacy",
    description: "PHI policy, data export & account deletion",
    icon: Lock,
    path: "/settings/privacy",
    iconBg: "bg-gradient-to-br from-rose-500/15 to-rose-500/5",
    iconText: "text-rose-500",
    keywords: ["privacy", "data", "delete", "account", "export", "phi", "hipaa"],
  },
];

function UserHeader({ user }: { user: any }) {
  const initials = [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join("").toUpperCase() || "?";
  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Clinician";

  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/15 flex items-center justify-center shadow-sm">
        <span className="text-base md:text-lg font-serif font-bold text-primary">{initials}</span>
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
  );
}

function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative mb-6">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search size={16} className="text-muted-foreground/50" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search settings..."
        className="w-full pl-11 pr-10 py-3 rounded-2xl bg-card border border-border/60 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all placeholder:text-muted-foreground/40"
        data-testid="input-settings-search"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer text-muted-foreground/50 hover:text-muted-foreground transition-colors"
          data-testid="button-clear-search"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}

export default function SettingsHub() {
  const { isLoading: authLoading, isAuthenticated, user } = useAuth();
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [authLoading, isAuthenticated]);

  const filteredSections = useMemo(() => {
    if (!search.trim()) return SETTINGS_SECTIONS;
    const q = search.toLowerCase().trim();
    return SETTINGS_SECTIONS.filter(s =>
      s.label.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.keywords.some(k => k.includes(q))
    );
  }, [search]);

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
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <UserHeader user={user} />

          <SearchBar value={search} onChange={setSearch} />

          <div className="mb-4">
            <p className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-[0.18em] px-1">
              {search ? `${filteredSections.length} result${filteredSections.length !== 1 ? "s" : ""}` : "Settings"}
            </p>
          </div>

          <AnimatePresence mode="popLayout">
            {filteredSections.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {filteredSections.map((section, i) => (
                  <motion.div
                    key={section.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: search ? 0 : 0.08 + i * 0.04, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link href={section.path} className="no-underline block h-full">
                      <div
                        className="flex items-center gap-4 px-5 py-4 rounded-2xl cursor-pointer group transition-all duration-200 bg-card/60 hover:bg-card hover:shadow-md border border-border/40 hover:border-border/70 active:scale-[0.99] h-full"
                        data-testid={`card-settings-${section.id}`}
                      >
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${section.iconBg} shadow-sm`}>
                          <section.icon size={20} className={section.iconText} strokeWidth={1.8} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground leading-snug">{section.label}</p>
                          <p className="text-[11px] text-muted-foreground/70 mt-0.5 leading-relaxed">{section.description}</p>
                        </div>
                        <ChevronRight size={16} className="text-muted-foreground/30 group-hover:text-muted-foreground/60 group-hover:translate-x-0.5 transition-all duration-200 shrink-0" />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <Search size={32} className="text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground/60 font-medium">No settings found for "{search}"</p>
                <p className="text-xs text-muted-foreground/40 mt-1">Try a different search term</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-10 text-center">
            <p className="text-[10px] text-muted-foreground/40 tracking-wide">ClinicalPlay v1.0</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
