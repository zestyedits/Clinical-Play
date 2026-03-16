import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { getSupabase } from "@/lib/supabase";

export default function EmailConfirmed() {
  const [, navigate] = useLocation();
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function handleTokens() {
      try {
        const supabase = await getSupabase();
        // Supabase client auto-detects tokens in the URL hash and exchanges them.
        // Calling getSession after a brief wait ensures the exchange completes.
        const hash = window.location.hash;
        if (hash && hash.includes("access_token")) {
          // Let Supabase process the hash tokens
          await new Promise((resolve) => setTimeout(resolve, 500));
          await supabase.auth.getSession();
        }
      } catch (err) {
        console.error("Error processing email confirmation tokens:", err);
      }

      if (mounted) {
        setProcessing(false);
        // Auto-redirect to dashboard after showing success
        setTimeout(() => {
          if (mounted) navigate("/dashboard");
        }, 2500);
      }
    }

    handleTokens();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-secondary/20">
      <div className="flex items-center justify-center min-h-screen px-4 pt-24 pb-12">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="bg-card border border-border rounded-3xl shadow-2xl shadow-primary/5 p-8 md:p-10 text-center">
            {processing ? (
              <>
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
                </div>
                <h1 className="text-3xl font-serif text-primary mb-3">Verifying...</h1>
                <p className="text-muted-foreground leading-relaxed">
                  Confirming your email address.
                </p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle2 size={32} className="text-emerald-500" />
                </div>
                <h1 className="text-3xl font-serif text-primary mb-3" data-testid="text-email-confirmed-title">Email Verified</h1>
                <p className="text-muted-foreground mb-2 leading-relaxed">
                  Your email has been successfully verified. Redirecting to your dashboard...
                </p>
                <div className="flex items-center justify-center gap-1.5 mt-4 mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse" style={{ animationDelay: "300ms" }} />
                </div>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-2xl font-medium shadow-lg shadow-primary/20 btn-warm no-underline"
                  data-testid="link-go-to-dashboard"
                >
                  Go to Dashboard <ArrowRight size={16} />
                </Link>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
