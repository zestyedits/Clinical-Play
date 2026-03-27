import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight, Mail, Lock, CheckCircle2 } from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { useAuth } from "@/hooks/use-auth";

export default function Login() {
  const [, navigate] = useLocation();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotError, setForgotError] = useState("");

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate("/dashboard");
    }
  }, [authLoading, isAuthenticated, navigate]);

  const ADMIN_EMAIL = "clinicalplayapp@gmail.com";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (email.trim().toLowerCase() !== ADMIN_EMAIL) {
      setError("ClinicalPlay is not yet open to the public. Join the waitlist to be notified when we launch.");
      setLoading(false);
      return;
    }

    try {
      const supabase = await getSupabase();
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }
    } catch (err) {
      console.error("[login]", err);
      const msg = err instanceof Error ? err.message : String(err);
      if (
        msg.includes("missing from server") ||
        msg.includes("/api/auth/config") ||
        msg.includes("SUPABASE_URL") ||
        msg.includes("SUPABASE_ANON_KEY") ||
        msg.includes("HTTP 503")
      ) {
        setError(
          "The live site can't reach Supabase: the server doesn't have SUPABASE_URL and SUPABASE_ANON_KEY (or they're empty). In Vercel → your project → Settings → Environment Variables, add both from Supabase → Project Settings → API, enable them for Production (and Preview if you use preview links), then Redeploy. This is not your password.",
        );
      } else if (msg.includes("aborted") || (err instanceof Error && err.name === "AbortError")) {
        setError("Connection timed out. Check your network and try again.");
      } else if (msg.includes("JSON") || msg.includes("Unexpected token")) {
        setError("Login service returned an invalid response. Try again or contact support if this persists.");
      } else {
        setError(
          msg.length > 0 && msg.length < 120
            ? msg
            : "Something went wrong before sign-in. Open the browser console (F12) for details, or verify the site URL and try again.",
        );
      }
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");

    if (!email.trim()) {
      setForgotError("Please enter your email address.");
      return;
    }

    setForgotLoading(true);

    try {
      const supabase = await getSupabase();
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        setForgotError(error.message);
        setForgotLoading(false);
        return;
      }
      setForgotSent(true);
    } catch (err) {
      console.error("[login forgot-password]", err);
      const msg = err instanceof Error ? err.message : "";
      if (
        msg.includes("missing from server") ||
        msg.includes("/api/auth/config") ||
        msg.includes("SUPABASE_URL") ||
        msg.includes("HTTP 503")
      ) {
        setForgotError(
          "Password reset needs Supabase env vars on the server (SUPABASE_URL + SUPABASE_ANON_KEY in Vercel, then redeploy).",
        );
      } else {
        setForgotError("Something went wrong. Please try again.");
      }
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-center min-h-screen px-4 pt-24 pb-12">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-2xl shadow-lg p-8 md:p-10">
            <div className="text-center mb-6">
              <img src="/images/logo-icon.png" alt="ClinicalPlay" className="w-18 h-18 mx-auto mb-5 object-contain" />
              <h1 className="text-3xl font-serif text-primary mb-2" data-testid="text-login-title">
                {forgotMode ? "Reset Password" : "Welcome Back"}
              </h1>
              <p className="text-muted-foreground text-sm">
                {forgotMode
                  ? "Enter your email and we'll send you a reset link"
                  : "Sign in to your ClinicalPlay account"}
              </p>
            </div>

            {!forgotMode && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mb-6 rounded-xl bg-primary/5 border border-primary/15 p-4 text-center"
                data-testid="text-prelaunch-notice"
              >
                <p className="text-sm font-medium text-primary mb-1">We're still getting ready</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  ClinicalPlay is currently in private development. Public access will open soon.
                  <Link href="/" className="text-primary font-medium ml-1 hover:underline cursor-pointer">
                    Join the waitlist
                  </Link>{" "}
                  to be first in line.
                </p>
              </motion.div>
            )}

            {forgotMode ? (
              forgotSent ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-4"
                >
                  <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle2 size={28} className="text-emerald-500" />
                  </div>
                  <p className="text-sm text-foreground font-medium mb-1">Check your inbox</p>
                  <p className="text-xs text-muted-foreground mb-6">
                    We sent a password reset link to <strong>{email}</strong>. Check your spam folder if you don't see it.
                  </p>
                  <button
                    onClick={() => { setForgotMode(false); setForgotSent(false); }}
                    className="text-sm text-primary underline font-medium cursor-pointer"
                  >
                    Back to sign in
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-foreground/70 uppercase tracking-[0.15em] mb-2">Email</label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className="w-full h-12 pl-11 pr-4 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        data-testid="input-email"
                      />
                    </div>
                  </div>

                  {forgotError && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-destructive bg-destructive/10 px-4 py-3 rounded-xl"
                    >
                      {forgotError}
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-medium btn-warm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {forgotLoading ? (
                      <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    ) : (
                      <>Send Reset Link <ArrowRight size={16} /></>
                    )}
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => { setForgotMode(false); setForgotError(""); }}
                      className="text-sm text-primary underline font-medium cursor-pointer"
                    >
                      Back to sign in
                    </button>
                  </div>
                </form>
              )
            ) : (
              <>
                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-foreground/70 uppercase tracking-[0.15em] mb-2">Email</label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className="w-full h-12 pl-11 pr-4 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        data-testid="input-email"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-semibold text-foreground/70 uppercase tracking-[0.15em]">Password</label>
                      <button
                        type="button"
                        onClick={() => setForgotMode(true)}
                        className="text-xs text-primary/70 hover:text-primary font-medium transition-colors cursor-pointer"
                        data-testid="link-forgot-password"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                        className="w-full h-12 pl-11 pr-12 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        data-testid="input-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        data-testid="button-toggle-password"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-destructive bg-destructive/10 px-4 py-3 rounded-xl"
                      data-testid="text-login-error"
                    >
                      {error}
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-medium btn-warm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    data-testid="button-login"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    ) : (
                      <>Sign In <ArrowRight size={16} /></>
                    )}
                  </button>
                </form>

                <OAuthButtons />
              </>
            )}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            By signing in you agree to our{" "}
            <Link href="/terms" className="underline hover:text-foreground">Terms</Link> and{" "}
            <Link href="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
