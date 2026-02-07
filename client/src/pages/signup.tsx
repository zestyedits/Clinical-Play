import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/navbar";
import { Eye, EyeOff, ArrowRight, Mail, Lock, User } from "lucide-react";
import { getSupabase } from "@/lib/supabase";

export default function Signup() {
  const [, navigate] = useLocation();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      // Create account via backend (sends branded welcome email)
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, firstName, lastName }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to create account.");
        setLoading(false);
        return;
      }

      // Sign in to establish session
      const supabase = await getSupabase();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      navigate("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-secondary/20">
      <Navbar />
      <div className="flex items-center justify-center min-h-screen px-4 pt-24 pb-12">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-3xl shadow-2xl shadow-primary/5 p-8 md:p-10">
            <div className="text-center mb-8">
              <img src="/images/logo-icon.png" alt="ClinicalPlay" className="w-18 h-18 mx-auto mb-5 object-contain" />
              <h1 className="text-3xl font-serif text-primary mb-2" data-testid="text-signup-title">Create Account</h1>
              <p className="text-muted-foreground text-sm">Join ClinicalPlay and start your first session</p>
            </div>

            <form onSubmit={handleSignup} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground/70 uppercase tracking-[0.15em] mb-2">First Name</label>
                  <div className="relative">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Jane"
                      required
                      className="w-full h-12 pl-11 pr-4 rounded-xl bg-white/80 border border-border/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
                      data-testid="input-first-name"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground/70 uppercase tracking-[0.15em] mb-2">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Smith"
                    required
                    className="w-full h-12 px-4 rounded-xl bg-white/80 border border-border/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
                    data-testid="input-last-name"
                  />
                </div>
              </div>

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
                    className="w-full h-12 pl-11 pr-4 rounded-xl bg-white/80 border border-border/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
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
                    placeholder="At least 6 characters"
                    required
                    minLength={6}
                    className="w-full h-12 pl-11 pr-12 rounded-xl bg-white/80 border border-border/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
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
                  data-testid="text-signup-error"
                >
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-medium shadow-lg shadow-primary/20 btn-luxury cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                data-testid="button-signup"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <>Create Account <ArrowRight size={16} /></>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-accent font-medium hover:underline no-underline" data-testid="link-login">
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            By creating an account you agree to our{" "}
            <Link href="/terms" className="underline hover:text-foreground">Terms</Link> and{" "}
            <Link href="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
