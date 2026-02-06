import { Navbar } from "@/components/layout/navbar";
import { motion } from "framer-motion";
import { Compass } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export default function NotFound() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-secondary/20 flex items-center justify-center px-4">
      <Navbar />

      <motion.div
        className="text-center max-w-md mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          className="w-20 h-20 mx-auto mb-8 rounded-full bg-accent/10 flex items-center justify-center"
          animate={{ rotate: [0, 10, -10, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        >
          <Compass size={36} className="text-accent" />
        </motion.div>

        <h1 className="text-6xl md:text-7xl font-serif text-primary mb-4 tracking-tight" data-testid="text-404-title">
          404
        </h1>
        <p className="text-lg md:text-xl font-serif text-primary/80 mb-3">
          This page seems to have wandered off the path.
        </p>
        <p className="text-muted-foreground mb-8">
          Let's get you back somewhere familiar.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href={isAuthenticated ? "/dashboard" : "/"}
            className="bg-primary text-primary-foreground px-8 py-3 rounded-full text-sm font-medium shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity no-underline active:scale-95"
            data-testid="link-404-home"
          >
            {isAuthenticated ? "Back to Dashboard" : "Back to Home"}
          </Link>
          <Link
            href="/contact"
            className="text-sm font-medium text-muted-foreground hover:text-accent transition-colors no-underline active:scale-95"
            data-testid="link-404-contact"
          >
            Need help? Contact us
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
