import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useRef, type ReactNode } from "react";
import {
  User, Briefcase, Palette, Play, Crown, Users, Shield, Lock, Settings
} from "lucide-react";

const SECTIONS = [
  { id: "profile", label: "Profile", icon: User, path: "/settings/profile" },
  { id: "appearance", label: "Appearance", icon: Palette, path: "/settings/appearance" },
  { id: "sessions", label: "Sessions", icon: Play, path: "/settings/sessions" },
  { id: "billing", label: "Plan & Billing", icon: Crown, path: "/settings/billing" },
  { id: "team", label: "Team", icon: Users, path: "/settings/team" },
  { id: "security", label: "Security", icon: Shield, path: "/settings/security" },
  { id: "privacy", label: "Data & Privacy", icon: Lock, path: "/settings/privacy" },
];

interface SettingsLayoutProps {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  iconColor?: string;
  children: ReactNode;
}

export function SettingsLayout({ title, subtitle, icon: Icon, iconColor = "bg-gradient-to-br from-primary/15 to-primary/5 text-primary", children }: SettingsLayoutProps) {
  const { isLoading: authLoading, isAuthenticated, user } = useAuth();
  const [location, navigate] = useLocation();
  const tabsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    if (tabsRef.current) {
      const activeTab = tabsRef.current.querySelector("[data-active='true']");
      if (activeTab) {
        activeTab.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }
  }, [location]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/15 to-accent/10 flex items-center justify-center">
            <Settings size={24} className="text-primary animate-pulse" />
          </div>
          <p className="text-sm text-muted-foreground font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  const initials = [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join("").toUpperCase() || "?";
  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Clinician";

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-12 pt-16 md:pt-18">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* User header */}
        <div className="flex items-center gap-4 pt-4 md:pt-6 pb-4">
          <div className="w-11 h-11 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/15 flex items-center justify-center shadow-sm">
            <span className="text-sm md:text-base font-serif font-bold text-primary">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg md:text-xl font-serif text-foreground tracking-tight" data-testid="text-settings-title">Settings</h1>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{displayName} &middot; {user?.email || ""}</p>
          </div>
        </div>

        {/* Mobile horizontal tabs */}
        <div ref={tabsRef} className="md:hidden -mx-4 px-4 pb-4 overflow-x-auto scrollbar-hide">
          <div className="flex gap-1.5 min-w-max">
            {SECTIONS.map((s) => {
              const isActive = location === s.path;
              return (
                <Link key={s.id} href={s.path} className="no-underline">
                  <button
                    data-active={isActive}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "bg-secondary/30 text-muted-foreground border border-border/40 hover:bg-secondary/50"
                    }`}
                    data-testid={`tab-${s.id}`}
                  >
                    <s.icon size={14} />
                    {s.label}
                  </button>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden md:block w-52 shrink-0">
            <div className="sticky top-24 space-y-0.5">
              {SECTIONS.map((s) => {
                const isActive = location === s.path;
                return (
                  <Link key={s.id} href={s.path} className="no-underline">
                    <button
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer text-left ${
                        isActive
                          ? "bg-primary/8 text-primary"
                          : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                      }`}
                      data-testid={`nav-${s.id}`}
                    >
                      <s.icon size={16} strokeWidth={isActive ? 2 : 1.5} />
                      {s.label}
                    </button>
                  </Link>
                );
              })}
              <div className="h-px bg-border/40 my-3" />
              <p className="text-[10px] text-muted-foreground/40 tracking-wide px-3">ClinicalPlay v1.0</p>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            <motion.div
              key={location}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${iconColor}`}>
                    <Icon size={20} strokeWidth={1.8} />
                  </div>
                  <div>
                    <h2 className="text-lg md:text-xl font-serif text-foreground tracking-tight">{title}</h2>
                    <p className="text-[11px] text-muted-foreground/70 mt-0.5">{subtitle}</p>
                  </div>
                </div>
                <div className="mt-5 h-px bg-gradient-to-r from-border/60 via-border/30 to-transparent" />
              </div>

              <div className="space-y-6">
                {children}
              </div>
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
}
