import { GlassCard } from "@/components/ui/glass-card";
import { useAuth, createAuthFetch } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Lock, Shield, Download, Trash2, Check, AlertTriangle
} from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { SettingsLayout } from "./settings-layout";

export default function PrivacySettings() {
  const { user, session, logout } = useAuth();
  const { toast } = useToast();
  const authFetch = createAuthFetch(session?.access_token);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTyped, setDeleteTyped] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (deleteTyped !== "DELETE") return;
    setIsDeleting(true);
    try {
      const res = await authFetch("/api/account", { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete account");
      }
      toast({ title: "Account deleted", description: "Your account has been permanently removed." });
      const supabase = await getSupabase();
      await supabase.auth.signOut();
      window.location.href = "/";
    } catch (err: any) {
      toast({ title: "Deletion failed", description: err?.message || "Please try again or contact support.", variant: "destructive" });
      setIsDeleting(false);
    }
  };

  return (
    <SettingsLayout title="Data & Privacy" subtitle="PHI policy, data export & account deletion" icon={Lock} iconColor="bg-gradient-to-br from-rose-500/15 to-rose-500/5 text-rose-500">
      <GlassCard className="p-6 md:p-8" hoverEffect={false}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Shield size={18} className="text-primary" />
          </div>
          <h2 className="font-serif text-lg text-foreground">Protected Health Information</h2>
        </div>

        <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/15 space-y-3">
          <p className="text-sm text-foreground/80 leading-relaxed">
            ClinicalPlay is designed with clinician privacy in mind. We do not store identifiable client data on our servers.
          </p>
          <ul className="text-xs text-muted-foreground space-y-1.5 list-none">
            <li className="flex items-start gap-2"><Check size={12} className="text-emerald-500 shrink-0 mt-0.5" /> Session content is processed in real-time and not persisted</li>
            <li className="flex items-start gap-2"><Check size={12} className="text-emerald-500 shrink-0 mt-0.5" /> No client names, diagnoses, or treatment notes are stored</li>
            <li className="flex items-start gap-2"><Check size={12} className="text-emerald-500 shrink-0 mt-0.5" /> Sandtray snapshots and artifacts are saved locally by choice</li>
            <li className="flex items-start gap-2"><Check size={12} className="text-emerald-500 shrink-0 mt-0.5" /> We recommend reviewing your organization's HIPAA policies</li>
          </ul>
        </div>
      </GlassCard>

      <GlassCard className="p-6 md:p-8" hoverEffect={false}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Download size={18} className="text-primary" />
          </div>
          <h2 className="font-serif text-lg text-foreground">Export Your Data</h2>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Download a copy of your account data including profile information, session history, and saved preferences.
        </p>

        <button
          onClick={() => toast({ title: "Export started", description: "Your data export is being prepared. You'll receive an email when it's ready." })}
          className="px-4 py-2.5 rounded-xl text-xs font-medium text-primary bg-secondary/30 border border-border/30 hover:bg-secondary/50 transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
          data-testid="button-export-data"
        >
          <Download size={12} /> Request Data Export
        </button>
      </GlassCard>

      <GlassCard className="p-6 md:p-8" hoverEffect={false}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(220,38,38,0.1), rgba(220,38,38,0.05))" }}>
            <Trash2 size={18} className="text-destructive" />
          </div>
          <h2 className="font-serif text-lg text-destructive">Delete Account</h2>
        </div>

        {!showDeleteConfirm ? (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-destructive bg-destructive/5 border border-destructive/15 hover:bg-destructive/10 transition-all cursor-pointer active:scale-95"
              data-testid="button-delete-account"
            >
              <Trash2 size={12} className="inline mr-1.5" /> Delete My Account
            </button>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-destructive/5 border border-destructive/20 space-y-4"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle size={18} className="text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-destructive">Are you absolutely sure?</p>
                <p className="text-xs text-muted-foreground mt-1">
                  This will permanently delete your account, remove you from your organization, and revoke all active sessions. This cannot be undone.
                </p>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground/60 uppercase tracking-[0.15em] block mb-2">
                Type DELETE to confirm
              </label>
              <input
                type="text"
                value={deleteTyped}
                onChange={(e) => setDeleteTyped(e.target.value)}
                placeholder="DELETE"
                className="w-full px-4 py-2.5 rounded-xl bg-secondary/30 border border-destructive/30 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-destructive/30 transition-all placeholder:text-muted-foreground/40"
                data-testid="input-delete-confirm"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleDeleteAccount}
                disabled={deleteTyped !== "DELETE" || isDeleting}
                className="px-4 py-2.5 rounded-xl text-xs font-medium text-white bg-destructive hover:bg-destructive/90 transition-all cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                data-testid="button-confirm-delete"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete My Account"}
              </button>
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeleteTyped(""); }}
                className="px-4 py-2.5 rounded-xl text-xs font-medium text-muted-foreground bg-secondary/30 border border-border/30 cursor-pointer active:scale-95 transition-all"
                data-testid="button-cancel-delete"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </GlassCard>
    </SettingsLayout>
  );
}
