import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight, Mail, Lock } from "lucide-react";
import { getSupabase } from "@/lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAdminForm, setShowAdminForm] = useState(false);

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
      // Full-page nav so SessionProvider picks up the new session on init (avoids race)
      window.location.href = "/dashboard";
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-center min-h-screen px-4 pt-24 pb-12">
        <div className="w-full max-w-md">
          {/* Banner: Sign-up closed, join waitlist */}
          <div className="mb-6 p-4 rounded-xl bg-primary/8 border border-primary/20 text-center">
            <p className="text-sm font-medium text-foreground">
              We&apos;re not fully launched yet.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Join the waitlist to get early access when we go live.
            </p>
            <Link href="/#waitlist" className="mt-3 inline-block text-sm font-medium text-primary hover:underline" data-testid="link-join-waitlist">
              Join the waitlist →
            </Link>
          </div>

          <div className="bg-card border border-border rounded-2xl shadow-lg p-8 md:p-10 relative">
            {/* Grey overlay when admin form hidden - pointer-events-none so Admin button stays clickable */}
            {!showAdminForm && (
              <div
                className="absolute inset-0 rounded-2xl bg-background/60 backdrop-blur-[2px] z-10 pointer-events-none"
                aria-hidden
              />
            )}

            <div className="text-center mb-8">
              <img src="/images/logo-icon.png" alt="ClinicalPlay" className="w-18 h-18 mx-auto mb-5 object-contain" />
              <h1 className="text-3xl font-serif text-primary mb-2" data-testid="text-login-title">Welcome Back</h1>
              <p className="text-muted-foreground text-sm">Sign in to your ClinicalPlay account</p>
            </div>

            <form onSubmit={handleLogin} className={showAdminForm ? "space-y-5 relative z-20" : "space-y-5 opacity-50 pointer-events-none select-none"}>
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
                <label className="block text-xs font-semibold text-foreground/70 uppercase tracking-[0.15em] mb-2">Password</label>
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
                <div className="mt-1.5 text-right">
                  <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-primary transition-colors" data-testid="link-forgot-password">
                    Forgot password?
                  </Link>
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

            <div className="mt-6 text-center">
              {showAdminForm ? (
                <p className="text-sm text-muted-foreground">
                  <button
                    type="button"
                    onClick={() => setShowAdminForm(false)}
                    className="text-muted-foreground/70 hover:text-muted-foreground text-xs cursor-pointer"
                  >
                    ← Back
                  </button>
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Want early access?{" "}
                  <Link href="/#waitlist" className="text-primary underline font-medium">
                    Join the waitlist
                  </Link>
                </p>
              )}
            </div>

            {/* Lowkey admin sign-in toggle - stays clickable above overlay */}
            <div className="mt-4 pt-4 border-t border-border/50 text-center relative z-20">
              <button
                type="button"
                onClick={() => setShowAdminForm(!showAdminForm)}
                className="text-[11px] text-muted-foreground/50 hover:text-muted-foreground/70 transition-colors cursor-pointer"
                data-testid="button-admin-toggle"
              >
                {showAdminForm ? "Hide" : "Admin"}
              </button>
            </div>
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
