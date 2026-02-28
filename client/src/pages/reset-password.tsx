import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight, Lock, CheckCircle2 } from "lucide-react";
import { getSupabase } from "@/lib/supabase";

export default function ResetPassword() {
  const [, navigate] = useLocation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const supabase = await getSupabase();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }
      setSuccess(true);
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-screen px-4 pt-24 pb-12">
          <motion.div
            className="w-full max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="bg-card border border-border rounded-2xl shadow-lg p-8 md:p-10 text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-emerald-50 flex items-center justify-center">
                <CheckCircle2 size={32} className="text-emerald-500" />
              </div>
              <h1 className="text-3xl font-serif text-primary mb-3">Password Updated</h1>
              <p className="text-muted-foreground mb-2 leading-relaxed">
                Your password has been reset successfully. Redirecting to your dashboard...
              </p>
              <div className="flex items-center justify-center gap-1.5 mt-4">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-center min-h-screen px-4 pt-24 pb-12">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-2xl shadow-lg p-8 md:p-10">
            <div className="text-center mb-8">
              <img src="/images/logo-icon.png" alt="ClinicalPlay" className="w-18 h-18 mx-auto mb-5 object-contain" />
              <h1 className="text-3xl font-serif text-primary mb-2">Reset Password</h1>
              <p className="text-muted-foreground text-sm">Enter your new password below</p>
            </div>

            <form onSubmit={handleReset} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-foreground/70 uppercase tracking-[0.15em] mb-2">New Password</label>
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
                <label className="block text-xs font-semibold text-foreground/70 uppercase tracking-[0.15em] mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    required
                    minLength={6}
                    className="w-full h-12 pl-11 pr-4 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-destructive bg-destructive/10 px-4 py-3 rounded-xl"
                >
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-medium btn-warm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <>Update Password <ArrowRight size={16} /></>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
