import { GlassCard } from "@/components/ui/glass-card";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crown, CreditCard, Receipt, ChevronDown,
  Check, Sparkles
} from "lucide-react";
import {
  MOCK_INVOICES, MOCK_PAYMENT_METHODS
} from "@/lib/mock-data/billing-data";
import { SettingsLayout } from "./settings-layout";

function StatusBadge({ status }: { status: "paid" | "pending" | "failed" }) {
  const styles = {
    paid: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    failed: "bg-red-500/10 text-red-600 border-red-500/20",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border uppercase tracking-wider ${styles[status]}`}>
      {status}
    </span>
  );
}

export default function BillingSettings() {
  const [showInvoices, setShowInvoices] = useState(false);
  const paymentMethod = MOCK_PAYMENT_METHODS[0];

  return (
    <SettingsLayout title="Plan & Billing" subtitle="Subscription, payment method & invoices" icon={Crown} iconColor="bg-gradient-to-br from-amber-500/15 to-amber-500/5 text-amber-600">
      <GlassCard className="p-6 md:p-8" hoverEffect={false}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center">
            <Crown size={18} className="text-accent" />
          </div>
          <div>
            <h2 className="font-serif text-lg text-foreground">Your Plan</h2>
            <p className="text-xs text-muted-foreground">Manage your subscription</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-accent/25 bg-gradient-to-br from-accent/5 to-primary/3">
          <div className="flex items-center gap-3 mb-3">
            <div className="px-3 py-1 rounded-full bg-accent/15 border border-accent/25">
              <span className="text-xs font-bold text-accent flex items-center gap-1">
                <Sparkles size={12} /> Founding Member
              </span>
            </div>
            <span className="text-xs text-muted-foreground">Lifetime Access</span>
          </div>
          <p className="text-2xl font-serif text-foreground font-bold">$99 <span className="text-sm font-sans font-normal text-muted-foreground">one-time</span></p>
          <p className="text-xs text-muted-foreground mt-1">All tools, unlimited sessions, priority support, early access to new features</p>
          <div className="flex flex-wrap gap-2 mt-3">
            {["Unlimited Sessions", "All Tools", "Priority Support", "Early Access"].map(f => (
              <span key={f} className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium" data-testid={`text-plan-feature-${f.toLowerCase().replace(/\s+/g, "-")}`}>
                <Check size={10} /> {f}
              </span>
            ))}
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-6 md:p-8" hoverEffect={false}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
            <CreditCard size={18} className="text-primary" />
          </div>
          <h2 className="font-serif text-lg text-foreground">Payment Method</h2>
        </div>

        {paymentMethod && (
          <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/15 border border-border/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-7 rounded bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                <span className="text-white text-[9px] font-bold">{paymentMethod.brand.toUpperCase()}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground" data-testid="text-payment-card">
                  {paymentMethod.brand} ending in {paymentMethod.last4}
                </p>
                <p className="text-xs text-muted-foreground">
                  Expires {String(paymentMethod.expMonth).padStart(2, "0")}/{paymentMethod.expYear}
                </p>
              </div>
            </div>
            <span className="text-[10px] text-emerald-600 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full">Default</span>
          </div>
        )}

        <p className="text-[11px] text-muted-foreground/60 mt-3">
          To update your payment method, contact support or use the Stripe customer portal.
        </p>
      </GlassCard>

      <GlassCard className="p-6 md:p-8" hoverEffect={false}>
        <button
          onClick={() => setShowInvoices(!showInvoices)}
          className="w-full flex items-center gap-3 cursor-pointer"
          data-testid="button-toggle-invoices"
        >
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Receipt size={18} className="text-primary" />
          </div>
          <h2 className="font-serif text-lg text-foreground flex-1 text-left">Billing History</h2>
          <motion.div animate={{ rotate: showInvoices ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={18} className="text-muted-foreground" />
          </motion.div>
        </button>

        <AnimatePresence>
          {showInvoices && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="mt-4 space-y-2">
                {MOCK_INVOICES.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/10 border border-border/20" data-testid={`row-invoice-${inv.id}`}>
                    <div>
                      <p className="text-sm font-medium text-foreground">{inv.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(inv.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        <span className="mx-1.5 text-border">|</span>
                        {inv.id}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-foreground">{inv.amount}</span>
                      <StatusBadge status={inv.status} />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    </SettingsLayout>
  );
}
