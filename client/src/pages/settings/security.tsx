import { GlassCard } from "@/components/ui/glass-card";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, KeyRound, Lock, Smartphone, Monitor, Tablet, ChevronDown
} from "lucide-react";
import { MOCK_DEVICES, type DeviceSession } from "@/lib/mock-data/billing-data";
import { getSupabase } from "@/lib/supabase";
import { SettingsLayout } from "./settings-layout";

function DeviceIcon({ name }: { name: string }) {
  const lower = name.toLowerCase();
  if (lower.includes("iphone") || lower.includes("phone") || lower.includes("android")) return <Smartphone size={18} className="text-muted-foreground" />;
  if (lower.includes("ipad") || lower.includes("tablet")) return <Tablet size={18} className="text-muted-foreground" />;
  return <Monitor size={18} className="text-muted-foreground" />;
}

export default function SecuritySettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showDevices, setShowDevices] = useState(true);
  const [resettingPassword, setResettingPassword] = useState(false);

  const handlePasswordReset = async () => {
    const email = user?.email;
    if (!email) {
      toast({ title: "Error", description: "No email found for this account.", variant: "destructive" });
      return;
    }
    setResettingPassword(true);
    try {
      const supabase = await getSupabase();
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      toast({ title: "Password reset email sent", description: "Check your inbox for instructions to reset your password." });
    } catch (err: any) {
      toast({ title: "Failed to send reset email", description: err?.message || "Please try again later.", variant: "destructive" });
    } finally {
      setResettingPassword(false);
    }
  };

  const handleRevokeDevice = (device: DeviceSession) => {
    toast({ title: "Session revoked", description: `Signed out of ${device.deviceName}.` });
  };

  return (
    <SettingsLayout title="Security" subtitle="Password, two-factor & active devices" icon={Shield} iconColor="bg-emerald-500/10 text-emerald-600">
      <GlassCard className="p-6 md:p-8" hoverEffect={false}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
            <KeyRound size={18} className="text-primary" />
          </div>
          <h2 className="font-serif text-lg text-foreground">Password</h2>
        </div>

        <div className="p-4 rounded-xl bg-secondary/15 border border-border/25">
          <p className="text-sm text-muted-foreground mb-3">
            Your password is managed through secure authentication. Use the button below to receive a password reset link via email.
          </p>
          <button
            onClick={handlePasswordReset}
            disabled={resettingPassword}
            className="px-4 py-2.5 rounded-xl text-xs font-medium text-primary bg-secondary/30 border border-border/30 hover:bg-secondary/50 transition-all cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="button-reset-password"
          >
            <Lock size={12} className="inline mr-1.5" />
            {resettingPassword ? "Sending..." : "Send Password Reset Email"}
          </button>
        </div>
      </GlassCard>

      <GlassCard className="p-6 md:p-8" hoverEffect={false}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Shield size={18} className="text-primary" />
          </div>
          <h2 className="font-serif text-lg text-foreground">Two-Factor Authentication</h2>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
              <Shield size={16} className="text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Not yet available</p>
              <p className="text-xs text-muted-foreground mt-1">
                Two-factor authentication is on our roadmap. We take security seriously and will notify you when this feature becomes available.
              </p>
            </div>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-6 md:p-8" hoverEffect={false}>
        <button
          onClick={() => setShowDevices(!showDevices)}
          className="w-full flex items-center gap-3 cursor-pointer"
          data-testid="button-toggle-devices"
        >
          <div className="w-10 h-10 rounded-2xl bg-secondary flex items-center justify-center">
            <Smartphone size={18} className="text-primary" />
          </div>
          <div className="flex-1 text-left">
            <h2 className="font-serif text-lg text-foreground">Active Devices</h2>
            <p className="text-xs text-muted-foreground">{MOCK_DEVICES.length} sessions</p>
          </div>
          <motion.div animate={{ rotate: showDevices ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={18} className="text-muted-foreground" />
          </motion.div>
        </button>

        <AnimatePresence>
          {showDevices && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="mt-4 space-y-2">
                {MOCK_DEVICES.map((device, i) => (
                  <motion.div
                    key={device.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-center justify-between p-3 rounded-xl bg-secondary/10 border border-border/20"
                    data-testid={`row-device-${device.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <DeviceIcon name={device.deviceName} />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground">{device.deviceName}</p>
                          {device.isCurrent && (
                            <span className="text-[10px] text-emerald-600 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full">This device</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {device.browser} &middot; {device.location} &middot; {new Date(device.lastActive).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                      </div>
                    </div>
                    {!device.isCurrent && (
                      <button
                        onClick={() => handleRevokeDevice(device)}
                        className="text-xs text-destructive hover:text-destructive/80 transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-destructive/5"
                        data-testid={`button-revoke-${device.id}`}
                      >
                        Revoke
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    </SettingsLayout>
  );
}
