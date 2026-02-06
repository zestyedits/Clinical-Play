import { Navbar } from "@/components/layout/navbar";
import { GlassCard } from "@/components/ui/glass-card";
import { motion } from "framer-motion";
import { Send, Mail, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const submitTicket = useMutation({
    mutationFn: async (data: { name: string; email: string; message: string }) => {
      const res = await fetch("/api/support-tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to send message");
      }
      return res.json();
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({ title: "Message Sent", description: "We'll get back to you as soon as possible." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast({ title: "Missing Fields", description: "Please fill in all fields.", variant: "destructive" });
      return;
    }
    submitTicket.mutate(form);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-linear-to-b from-background to-secondary/20 pb-24 md:pb-10 pt-24 md:pt-32 px-4 md:px-8">
        <Navbar />
        <div className="max-w-lg mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 size={32} className="text-green-600" />
            </div>
            <h1 className="text-2xl md:text-3xl font-serif text-primary mb-3" data-testid="text-contact-success">
              Message Received
            </h1>
            <p className="text-muted-foreground mb-8">
              Thank you for reaching out. We'll get back to you within 24–48 hours.
            </p>
            <button
              onClick={() => { setSubmitted(false); setForm({ name: "", email: "", message: "" }); }}
              className="text-sm text-accent hover:text-primary transition-colors cursor-pointer underline active:scale-95"
              data-testid="button-send-another"
            >
              Send another message
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-secondary/20 pb-24 md:pb-10 pt-24 md:pt-32 px-4 md:px-8">
      <Navbar />

      <div className="max-w-lg mx-auto">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-14 h-14 mx-auto mb-6 rounded-2xl bg-accent/10 flex items-center justify-center">
            <Mail size={28} className="text-accent" />
          </div>
          <h1 className="text-3xl md:text-4xl font-serif text-primary mb-3" data-testid="text-contact-title">
            Get in Touch
          </h1>
          <p className="text-muted-foreground">
            Have a question, feedback, or need support? We'd love to hear from you.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <GlassCard className="p-6 md:p-8" hoverEffect={false}>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-primary mb-1.5">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your name"
                  className="w-full px-4 py-3 rounded-xl border border-border/50 bg-white/50 backdrop-blur-sm text-sm text-primary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
                  data-testid="input-contact-name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-primary mb-1.5">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 rounded-xl border border-border/50 bg-white/50 backdrop-blur-sm text-sm text-primary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
                  data-testid="input-contact-email"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-primary mb-1.5">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Tell us how we can help..."
                  className="w-full px-4 py-3 rounded-xl border border-border/50 bg-white/50 backdrop-blur-sm text-sm text-primary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all resize-none"
                  data-testid="input-contact-message"
                />
              </div>
              <button
                type="submit"
                disabled={submitTicket.isPending}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.98]"
                data-testid="button-contact-submit"
              >
                <Send size={16} />
                {submitTicket.isPending ? "Sending..." : "Send Message"}
              </button>
            </form>
          </GlassCard>
        </motion.div>

        <motion.p
          className="text-center text-xs text-muted-foreground mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          You can also email us directly at{" "}
          <a href="mailto:support@clinicalplay.app" className="text-accent hover:underline" data-testid="link-contact-email">
            support@clinicalplay.app
          </a>
        </motion.p>
      </div>
    </div>
  );
}
