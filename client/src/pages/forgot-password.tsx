import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import { getSupabase } from "@/lib/supabase";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = await getSupabase();
      const redirectTo = `${window.location.origin}/reset-password`;
      const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo,
      });
      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 pt-24 pb-12">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-2xl shadow-lg p-8 md:p-10 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 size={32} className="text-emerald-500" />
            </div>
            <h1 className="text-2xl font-serif text-primary mb-2">Check your email</h1>
            <p className="text-muted-foreground text-sm mb-6">
              If an account exists for <strong className="text-foreground">{email}</strong>, you'll receive a password reset link shortly.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
            >
              <ArrowLeft size={16} /> Back to Sign In
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
            <h1 className="text-2xl font-serif text-primary mb-2">Reset password</h1>
            <p className="text-muted-foreground text-sm">
              Enter your email and we'll send you a link to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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
                  data-testid="input-forgot-email"
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
              data-testid="button-send-reset"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>Send reset link</>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft size={14} /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
