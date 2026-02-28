import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight, Mail, Lock, CheckCircle2, Clock } from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { OAuthButtons } from "@/components/auth/oauth-buttons";

export default function Login() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [adminMode, setAdminMode] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = await getSupabase();
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }
      navigate("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
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
    } catch {
      setForgotError("Something went wrong. Please try again.");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-center min-h-screen px-4 pt-24 pb-12">
        <div className="w-full max-w-md">
          {adminMode ? (
            <div className="bg-card border border-border rounded-2xl shadow-lg p-8 md:p-10">
              <div className="text-center mb-8">
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

              {forgotMode ? (
                forgotSent ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-4"
                  >
                    <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-emerald-50 flex items-center justify-center">
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

                  <div className="mt-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      Don't have an account?{" "}
                      <Link href="/signup" className="text-primary underline font-medium" data-testid="link-signup">
                        Create one
                      </Link>
                    </p>
                  </div>
                </>
              )}
            </div>
          ) : (
            /* Waitlist / Coming Soon state */
            <div className="relative">
              {/* Blurred login card behind */}
              <div className="bg-card border border-border rounded-2xl shadow-lg p-8 md:p-10 blur-[6px] pointer-events-none select-none" aria-hidden="true">
                <div className="text-center mb-8">
                  <div className="w-18 h-18 mx-auto mb-5 rounded-full bg-muted" />
                  <div className="h-8 bg-muted rounded-lg w-48 mx-auto mb-2" />
                  <div className="h-4 bg-muted rounded w-56 mx-auto" />
                </div>
                <div className="space-y-5">
                  <div className="h-12 bg-muted rounded-xl" />
                  <div className="h-12 bg-muted rounded-xl" />
                  <div className="h-12 bg-primary/30 rounded-xl" />
                </div>
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex-1 h-px bg-muted" />
                  <div className="h-4 bg-muted rounded w-8" />
                  <div className="flex-1 h-px bg-muted" />
                </div>
                <div className="mt-4 h-12 bg-muted rounded-xl" />
              </div>

              {/* Overlay note */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="bg-card border border-border rounded-2xl shadow-2xl p-8 mx-4 max-w-sm w-full text-center"
                >
                  <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Clock size={28} className="text-primary" />
                  </div>
                  <img src="/images/logo-icon.png" alt="ClinicalPlay" className="w-14 h-14 mx-auto mb-4 object-contain" />
                  <h2 className="text-xl font-serif text-primary mb-2">Coming Soon</h2>
                  <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                    ClinicalPlay is currently in development. Join our waitlist to be the first to know when we launch.
                  </p>
                  <Link
                    href="/waitlist"
                    className="inline-flex items-center justify-center gap-2 w-full h-12 bg-primary text-primary-foreground rounded-xl font-medium btn-warm cursor-pointer transition-all hover:opacity-90"
                  >
                    Join the Waitlist <ArrowRight size={16} />
                  </Link>
                </motion.div>
              </div>
            </div>
          )}

          {/* Admin login - small, subtle link at the bottom */}
          {!adminMode && (
            <div className="mt-8 text-center">
              <button
                onClick={() => setAdminMode(true)}
                className="text-[11px] text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors cursor-pointer"
              >
                Admin
              </button>
            </div>
          )}

          {adminMode && (
            <p className="text-center text-xs text-muted-foreground mt-6">
              By signing in you agree to our{" "}
              <Link href="/terms" className="underline hover:text-foreground">Terms</Link> and{" "}
              <Link href="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
