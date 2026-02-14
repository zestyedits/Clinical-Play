import { Link } from "wouter";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function EmailConfirmed() {
  return (
    <div className="min-h-screen bg-linear-to-b from-background to-secondary/20">
      <div className="flex items-center justify-center min-h-screen px-4 pt-24 pb-12">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-3xl shadow-2xl shadow-primary/5 p-8 md:p-10 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 size={32} className="text-emerald-500" />
            </div>
            <h1 className="text-3xl font-serif text-primary mb-3" data-testid="text-email-confirmed-title">Email Verified</h1>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Your email has been successfully verified. You're all set to start using ClinicalPlay.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-2xl font-medium shadow-lg shadow-primary/20 btn-luxury no-underline"
              data-testid="link-go-to-dashboard"
            >
              Go to Dashboard <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
