import { useEffect, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { getSupabase } from "@/lib/supabase";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      try {
        const supabase = await getSupabase();
        const { data: { session } } = await supabase.auth.getSession();

        if (cancelled) return;

        if (session) {
          if (window.location.hash) {
            window.history.replaceState(null, "", window.location.pathname + window.location.search);
          }
          setStatus("ready");
        } else {
          await new Promise((r) => setTimeout(r, 800));
          const { data: { session: retry } } = await supabase.auth.getSession();
          if (cancelled) return;
          if (retry) {
            if (window.location.hash) {
              window.history.replaceState(null, "", window.location.pathname + window.location.search);
            }
            setStatus("ready");
          } else {
            setStatus("error");
            setErrorMsg("This reset link has expired or was already used. Please request a new one.");
          }
        }
      } catch {
        if (cancelled) return;
        setStatus("error");
        setErrorMsg("Something went wrong. Please try again.");
      }
    }

    checkSession();
    return () => { cancelled = true; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMsg("Passwords don't match.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const supabase = await getSupabase();
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setErrorMsg(error.message);
        setSubmitting(false);
        return;
      }

      setStatus("success");
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="text-primary animate-spin" />
          <p className="text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 pt-24 pb-12">
        <div className="w-full max-w-md text-center">
          <div className="bg-card border border-border rounded-2xl p-8 md:p-10">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-amber-50 flex items-center justify-center">
              <AlertCircle size={32} className="text-amber-600" />
            </div>
            <h1 className="text-2xl font-serif text-foreground mb-3">Link expired</h1>
            <p className="text-muted-foreground mb-6">{errorMsg}</p>
            <Link
              href="/forgot-password"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-2xl font-medium no-underline"
            >
              Request new link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 pt-24 pb-12">
        <div className="w-full max-w-md text-center">
          <div className="bg-card border border-border rounded-2xl shadow-lg p-8 md:p-10">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 size={32} className="text-emerald-500" />
            </div>
            <h1 className="text-2xl font-serif text-primary mb-2">Password updated</h1>
            <p className="text-muted-foreground mb-6">
              Your password has been changed. You can now sign in with your new password.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-2xl font-medium btn-warm no-underline"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 pt-24 pb-12">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-2xl shadow-lg p-8 md:p-10">
          <div className="text-center mb-8">
            <img src="/images/logo-icon.png" alt="ClinicalPlay" className="w-18 h-18 mx-auto mb-5 object-contain" />
            <h1 className="text-2xl font-serif text-primary mb-2">Set new password</h1>
            <p className="text-muted-foreground text-sm">
              Enter your new password below.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-foreground/70 uppercase tracking-[0.15em] mb-2">New password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                  className="w-full h-12 pl-11 pr-12 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  data-testid="input-new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground/70 uppercase tracking-[0.15em] mb-2">Confirm password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your new password"
                  required
                  minLength={6}
                  className="w-full h-12 pl-11 pr-4 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  data-testid="input-confirm-password"
                />
              </div>
            </div>

            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-destructive bg-destructive/10 px-4 py-3 rounded-xl"
              >
                {errorMsg}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-medium btn-warm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              data-testid="button-reset-password"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>Update password</>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
