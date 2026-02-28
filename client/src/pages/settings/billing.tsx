import { GlassCard } from "@/components/ui/glass-card";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crown, CreditCard, Receipt, ChevronDown, Trash2,
  Check, Sparkles, AlertTriangle, RefreshCw, X
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth, createAuthFetch } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { SettingsLayout } from "./settings-layout";

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

interface Invoice {
  id: string;
  number: string;
  amount: number;
  currency: string;
  status: string;
  date: number;
  description: string;
  pdfUrl: string | null;
}

interface SubscriptionInfo {
  plan: string;
  isPro: boolean;
  status?: string;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: number | null;
  cancelAt: number | null;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    paid: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    open: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    uncollectible: "bg-red-500/10 text-red-600 border-red-500/20",
    void: "bg-muted text-muted-foreground border-border",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border uppercase tracking-wider ${styles[status] || styles.open}`}>
      {status}
    </span>
  );
}

function CardBrandBadge({ brand }: { brand: string }) {
  const colors: Record<string, string> = {
    visa: "from-blue-600 to-blue-800",
    mastercard: "from-red-500 to-orange-500",
    amex: "from-blue-400 to-blue-600",
  };
  return (
    <div className={`w-10 h-7 rounded bg-gradient-to-br ${colors[brand] || "from-gray-500 to-gray-700"} flex items-center justify-center`}>
      <span className="text-white text-[9px] font-bold">{brand.toUpperCase()}</span>
    </div>
  );
}

const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  community: "Community (Monthly)",
  annual: "Annual",
  founding: "Founding Member",
};

export default function BillingSettings() {
  const [showInvoices, setShowInvoices] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const { session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const authFetch = createAuthFetch(session?.access_token);

  const { data: subscription } = useQuery<SubscriptionInfo>({
    queryKey: ["/api/billing/subscription"],
    queryFn: async () => {
      const res = await authFetch("/api/billing/subscription");
      if (!res.ok) return { plan: "free", isPro: false, cancelAtPeriodEnd: false, currentPeriodEnd: null, cancelAt: null };
      return res.json();
    },
    staleTime: 60_000,
  });

  const { data: paymentMethods = [] } = useQuery<PaymentMethod[]>({
    queryKey: ["/api/billing/payment-methods"],
    queryFn: async () => {
      const res = await authFetch("/api/billing/payment-methods");
      if (!res.ok) return [];
      return res.json();
    },
    staleTime: 60_000,
  });

  const { data: invoices = [] } = useQuery<Invoice[]>({
    queryKey: ["/api/billing/invoices"],
    queryFn: async () => {
      const res = await authFetch("/api/billing/invoices");
      if (!res.ok) return [];
      return res.json();
    },
    staleTime: 60_000,
  });

  const cancelSubscription = useMutation({
    mutationFn: async () => {
      const res = await authFetch("/api/billing/cancel-subscription", { method: "POST" });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message); }
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: "Subscription cancelled", description: data.message });
      setConfirmCancel(false);
      queryClient.invalidateQueries({ queryKey: ["/api/billing/subscription"] });
      queryClient.invalidateQueries({ queryKey: ["/api/billing/status"] });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const resumeSubscription = useMutation({
    mutationFn: async () => {
      const res = await authFetch("/api/billing/resume-subscription", { method: "POST" });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message); }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Subscription resumed", description: "Your subscription will continue." });
      queryClient.invalidateQueries({ queryKey: ["/api/billing/subscription"] });
      queryClient.invalidateQueries({ queryKey: ["/api/billing/status"] });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const removePaymentMethod = useMutation({
    mutationFn: async (id: string) => {
      const res = await authFetch(`/api/billing/payment-methods/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to remove payment method");
    },
    onSuccess: () => {
      toast({ title: "Payment method removed" });
      queryClient.invalidateQueries({ queryKey: ["/api/billing/payment-methods"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Could not remove payment method", variant: "destructive" });
    },
  });

  const setDefaultMethod = useMutation({
    mutationFn: async (id: string) => {
      const res = await authFetch("/api/billing/set-default-payment-method", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethodId: id }),
      });
      if (!res.ok) throw new Error("Failed to set default");
    },
    onSuccess: () => {
      toast({ title: "Default payment method updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/billing/payment-methods"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Could not update default method", variant: "destructive" });
    },
  });

  const plan = subscription?.plan || "free";
  const isFounder = plan === "founding";
  const hasActiveSub = subscription?.isPro && !isFounder && !!subscription.currentPeriodEnd;
  const isCancelling = subscription?.cancelAtPeriodEnd;

  return (
    <SettingsLayout title="Plan & Billing" subtitle="Subscription, payment method & invoices" icon={Crown} iconColor="bg-gradient-to-br from-amber-500/15 to-amber-500/5 text-amber-600">
      {/* Current Plan */}
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
                {isFounder && <Sparkles size={12} />}
                {PLAN_LABELS[plan] || plan}
              </span>
            </div>
            {isFounder && <span className="text-xs text-muted-foreground">Lifetime Access</span>}
          </div>

          {subscription?.isPro && (
            <div className="flex flex-wrap gap-2 mt-3">
              {["Unlimited Sessions", "All Tools", "Priority Support", "Early Access"].map(f => (
                <span key={f} className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                  <Check size={10} /> {f}
                </span>
              ))}
            </div>
          )}

          {subscription?.currentPeriodEnd && !isFounder && (
            <p className="text-xs text-muted-foreground mt-3">
              {isCancelling
                ? `Access until ${new Date(subscription.currentPeriodEnd).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`
                : `Renews ${new Date(subscription.currentPeriodEnd).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`}
            </p>
          )}

          {isCancelling && (
            <div className="mt-3 flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <AlertTriangle size={14} className="text-amber-600" />
                <span className="text-xs text-amber-700 font-medium">Cancellation pending</span>
              </div>
              <button
                onClick={() => resumeSubscription.mutate()}
                disabled={resumeSubscription.isPending}
                className="px-3 py-2 rounded-xl text-xs font-medium text-primary bg-primary/10 hover:bg-primary/15 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                <RefreshCw size={12} className={resumeSubscription.isPending ? "animate-spin" : ""} />
                Resume
              </button>
            </div>
          )}

          {hasActiveSub && !isCancelling && (
            <div className="mt-4">
              {confirmCancel ? (
                <div className="p-3 rounded-xl bg-red-50/80 border border-red-200/50 space-y-3">
                  <p className="text-xs text-red-800">Are you sure? You'll retain access until the end of your current billing period.</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => cancelSubscription.mutate()}
                      disabled={cancelSubscription.isPending}
                      className="px-3 py-2 rounded-xl text-xs font-medium text-white bg-red-500 hover:bg-red-600 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {cancelSubscription.isPending ? "Cancelling..." : "Confirm Cancel"}
                    </button>
                    <button
                      onClick={() => setConfirmCancel(false)}
                      className="px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground bg-secondary hover:bg-secondary/80 transition-colors cursor-pointer"
                    >
                      Keep Subscription
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmCancel(true)}
                  className="text-xs text-muted-foreground hover:text-destructive transition-colors cursor-pointer underline underline-offset-2"
                >
                  Cancel subscription
                </button>
              )}
            </div>
          )}
        </div>
      </GlassCard>

      {/* Payment Methods */}
      <GlassCard className="p-6 md:p-8" hoverEffect={false}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
            <CreditCard size={18} className="text-primary" />
          </div>
          <h2 className="font-serif text-lg text-foreground">Payment Methods</h2>
        </div>

        {paymentMethods.length === 0 ? (
          <div className="p-4 rounded-xl bg-secondary/15 border border-border/30 text-center">
            <p className="text-sm text-muted-foreground">No payment methods on file.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center justify-between p-4 rounded-xl bg-secondary/15 border border-border/30">
                <div className="flex items-center gap-3">
                  <CardBrandBadge brand={method.brand} />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {method.brand} ending in {method.last4}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Expires {String(method.expMonth).padStart(2, "0")}/{method.expYear}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {method.isDefault ? (
                    <span className="text-[10px] text-emerald-600 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full">Default</span>
                  ) : (
                    <button
                      onClick={() => setDefaultMethod.mutate(method.id)}
                      disabled={setDefaultMethod.isPending}
                      className="text-[10px] text-primary font-medium bg-primary/10 px-2 py-0.5 rounded-full cursor-pointer hover:bg-primary/20 transition-colors"
                    >
                      Set default
                    </button>
                  )}
                  {!method.isDefault && (
                    <button
                      onClick={() => removePaymentMethod.mutate(method.id)}
                      disabled={removePaymentMethod.isPending}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Billing History */}
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
          <span className="text-xs text-muted-foreground mr-2">{invoices.length} invoices</span>
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
                {invoices.length === 0 ? (
                  <div className="p-4 rounded-xl bg-secondary/10 text-center">
                    <p className="text-sm text-muted-foreground">No invoices yet.</p>
                  </div>
                ) : (
                  invoices.map((inv) => (
                    <div key={inv.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/10 border border-border/20">
                      <div>
                        <p className="text-sm font-medium text-foreground">{inv.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(inv.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          {inv.number && <><span className="mx-1.5 text-border">|</span>{inv.number}</>}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-foreground">
                          ${inv.amount.toFixed(2)}
                        </span>
                        <StatusBadge status={inv.status || "paid"} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    </SettingsLayout>
  );
}
