import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, type ReactNode } from "react";

interface SettingsLayoutProps {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  iconColor?: string;
  children: ReactNode;
}

export function SettingsLayout({ title, subtitle, icon: Icon, iconColor = "bg-gradient-to-br from-primary/15 to-primary/5 text-primary", children }: SettingsLayoutProps) {
  const { isLoading: authLoading, isAuthenticated } = useAuth();
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
          <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center ${iconColor}`}>
            <Icon size={24} className="animate-pulse" />
          </div>
          <p className="text-sm text-muted-foreground font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-12 pt-18 md:pt-22 px-4 md:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Link href="/settings" className="no-underline">
                <button className="p-2 rounded-xl hover:bg-secondary/50 transition-all duration-200 cursor-pointer active:scale-95" data-testid="button-settings-back">
                  <ArrowLeft size={18} className="text-muted-foreground" />
                </button>
              </Link>
              <span className="text-xs text-muted-foreground/50">Settings</span>
            </div>

            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${iconColor}`}>
                <Icon size={22} strokeWidth={1.8} />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-serif text-foreground tracking-tight">{title}</h1>
                <p className="text-[11px] text-muted-foreground/70 mt-0.5">{subtitle}</p>
              </div>
            </div>

            <div className="mt-6 h-px bg-gradient-to-r from-border/60 via-border/30 to-transparent" />
          </div>

          <div className="space-y-6">
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
