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

export function SettingsLayout({ title, subtitle, icon: Icon, iconColor = "bg-primary/10 text-primary", children }: SettingsLayoutProps) {
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
          <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center animate-pulse ${iconColor}`}>
            <Icon size={24} />
          </div>
          <p className="text-muted-foreground font-medium">Loading...</p>
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
          <div className="flex items-center gap-3 mb-8">
            <Link href="/settings" className="no-underline">
              <button className="p-2.5 rounded-xl hover:bg-secondary/50 transition-colors cursor-pointer" data-testid="button-settings-back">
                <ArrowLeft size={20} className="text-foreground" />
              </button>
            </Link>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${iconColor}`}>
              <Icon size={18} />
            </div>
            <div className="flex-1">
              <h1 className="text-xl md:text-2xl font-serif text-foreground">{title}</h1>
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            </div>
          </div>

          <div className="space-y-6">
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
