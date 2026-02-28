import { useEffect, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { getSupabase } from "@/lib/supabase";

export default function EmailConfirmed() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function processCallback() {
      try {
        const supabase = await getSupabase();
        const { data: { session }, error } = await supabase.auth.getSession();

        if (cancelled) return;

        if (error) {
          setStatus("error");
          setErrorMsg(error.message);
          return;
        }

        if (session) {
          // Clear hash from URL (tokens no longer needed, cleaner and safer)
          if (window.location.hash) {
            window.history.replaceState(null, "", window.location.pathname + window.location.search);
          }
          setStatus("success");
        } else {
          // No session yet - wait briefly; Supabase may still be processing the hash
          await new Promise((r) => setTimeout(r, 800));
          const { data: { session: retry } } = await supabase.auth.getSession();
          if (cancelled) return;
          if (retry) {
            if (window.location.hash) {
              window.history.replaceState(null, "", window.location.pathname + window.location.search);
            }
            setStatus("success");
          } else {
            setStatus("error");
            setErrorMsg("Verification link may have expired or already been used. Try signing in—your email may already be verified.");
          }
        }
      } catch (err: unknown) {
        if (cancelled) return;
        setStatus("error");
        setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      }
    }

    processCallback();
    return () => { cancelled = true; };
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-linear-to-b from-background to-secondary/20 flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="text-primary animate-spin" />
          <p className="text-muted-foreground">Confirming your email…</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-linear-to-b from-background to-secondary/20 flex items-center justify-center px-4 pt-24 pb-12">
        <div className="w-full max-w-md text-center">
          <div className="bg-card border border-border rounded-3xl p-8 md:p-10">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-amber-50 flex items-center justify-center">
              <AlertCircle size={32} className="text-amber-600" />
            </div>
            <h1 className="text-2xl font-serif text-foreground mb-3">Verification issue</h1>
            <p className="text-muted-foreground mb-6">{errorMsg}</p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-2xl font-medium no-underline"
            >
              Go to Sign In <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 size={32} className="text-emerald-500" />
            </div>
            <h1 className="text-3xl font-serif text-primary mb-3" data-testid="text-email-confirmed-title">Email Verified</h1>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Your email has been successfully verified. You're all set to start using ClinicalPlay.
            </p>
            <EmailConfirmedRedirect />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function EmailConfirmedRedirect() {
  const [countdown, setCountdown] = useState(4);

  useEffect(() => {
    if (countdown <= 0) {
      window.location.href = "/dashboard";
      return;
    }
    const t = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  return (
    <div className="space-y-3">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-2xl font-medium shadow-lg shadow-primary/20 btn-warm no-underline"
        data-testid="link-go-to-dashboard"
      >
        Go to Dashboard <ArrowRight size={16} />
      </Link>
      <p className="text-sm text-muted-foreground">
        Redirecting in {countdown} second{countdown !== 1 ? "s" : ""}…
      </p>
    </div>
  );
}
