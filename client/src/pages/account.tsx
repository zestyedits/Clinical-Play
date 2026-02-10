import { Navbar } from "@/components/layout/navbar";
import { GlassCard } from "@/components/ui/glass-card";
import { useAuth, createAuthFetch } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Crown, CreditCard, Receipt, Users, UserPlus, Shield,
  Lock, Smartphone, Monitor, Tablet, KeyRound, Eye, Download, Trash2,
  ChevronDown, ChevronRight, Check, X, Copy, Volume2, VolumeX,
  Zap, Sparkles, AlertTriangle, Mail, Clock
} from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  MOCK_INVOICES, MOCK_PAYMENT_METHODS, MOCK_ORG_MEMBERS, MOCK_DEVICES,
  ROLE_PERMISSIONS,
  type Invoice, type OrgMember, type DeviceSession
} from "@/lib/mock-data/billing-data";

interface AccountPreferences {
  animations: boolean;
  sounds: boolean;
  reducedMotion: boolean;
}

function getPreferences(): AccountPreferences {
  try {
    const stored = localStorage.getItem("cp-account-prefs");
    if (stored) return { animations: true, sounds: false, reducedMotion: false, ...JSON.parse(stored) };
  } catch {}
  return { animations: true, sounds: false, reducedMotion: false };
}

function savePreferences(prefs: AccountPreferences) {
  try { localStorage.setItem("cp-account-prefs", JSON.stringify(prefs)); } catch {}
}

const labelClass = "text-xs font-semibold text-primary/60 uppercase tracking-[0.15em] block mb-2";

function ToggleSwitch({ enabled, onToggle, color = "bg-accent" }: { enabled: boolean; onToggle: () => void; color?: string }) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-12 h-7 rounded-full transition-all cursor-pointer ${enabled ? color : "bg-secondary/60"}`}
    >
      <motion.div
        className="absolute top-0.5 w-6 h-6 rounded-full bg-background shadow-md"
        animate={{ left: enabled ? 22 : 2 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      />
    </button>
  );
}

function SectionNav({ sections, active, onSelect }: { sections: { id: string; label: string; icon: React.ElementType }[]; active: string; onSelect: (id: string) => void }) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide mb-6">
      {sections.map((s) => {
        const isActive = active === s.id;
        return (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer active:scale-95 ${
              isActive
                ? "bg-primary/10 text-primary border border-primary/15"
                : "text-muted-foreground hover:bg-secondary/40 border border-transparent"
            }`}
          >
            <s.icon size={14} />
            {s.label}
          </button>
        );
      })}
    </div>
  );
}

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

function RoleBadge({ role }: { role: "owner" | "admin" | "clinician" }) {
  const styles = {
    owner: "bg-accent/10 text-accent border-accent/20",
    admin: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    clinician: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border capitalize ${styles[role]}`}>
      {role}
    </span>
  );
}

function DeviceIcon({ name }: { name: string }) {
  const lower = name.toLowerCase();
  if (lower.includes("iphone") || lower.includes("phone") || lower.includes("android")) return <Smartphone size={18} className="text-muted-foreground" />;
  if (lower.includes("ipad") || lower.includes("tablet")) return <Tablet size={18} className="text-muted-foreground" />;
  return <Monitor size={18} className="text-muted-foreground" />;
}

/* Plan & Billing Section */
function PlanBillingSection() {
  const [showInvoices, setShowInvoices] = useState(false);
  const paymentMethod = MOCK_PAYMENT_METHODS[0];

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <GlassCard className="p-6 md:p-8" hoverEffect={false}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.05))" }}>
            <Crown size={18} style={{ color: "#D4AF37" }} />
          </div>
          <div>
            <h2 className="font-serif text-lg text-primary">Your Plan</h2>
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
          <p className="text-2xl font-serif text-primary font-bold">$99 <span className="text-sm font-sans font-normal text-muted-foreground">one-time</span></p>
          <p className="text-xs text-muted-foreground mt-1">All tools, unlimited sessions, priority support, early access to new features</p>
          <div className="flex flex-wrap gap-2 mt-3">
            {["Unlimited Sessions", "All Tools", "Priority Support", "Early Access"].map(f => (
              <span key={f} className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                <Check size={10} /> {f}
              </span>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Payment Method */}
      <GlassCard className="p-6 md:p-8" hoverEffect={false}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(15,82,186,0.1), rgba(212,175,55,0.1))" }}>
            <CreditCard size={18} style={{ color: "#0F52BA" }} />
          </div>
          <h2 className="font-serif text-lg text-primary">Payment Method</h2>
        </div>

        {paymentMethod && (
          <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/15 border border-border/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-7 rounded bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                <span className="text-white text-[9px] font-bold">{paymentMethod.brand.toUpperCase()}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-primary">
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

      {/* Billing History */}
      <GlassCard className="p-6 md:p-8" hoverEffect={false}>
        <button
          onClick={() => setShowInvoices(!showInvoices)}
          className="w-full flex items-center gap-3 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(46,139,87,0.1), rgba(212,175,55,0.1))" }}>
            <Receipt size={18} style={{ color: "#2E8B57" }} />
          </div>
          <h2 className="font-serif text-lg text-primary flex-1 text-left">Billing History</h2>
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
                  <div key={inv.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/10 border border-border/20">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-sm font-medium text-primary">{inv.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(inv.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          <span className="mx-1.5 text-border">|</span>
                          {inv.id}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-primary">{inv.amount}</span>
                      <StatusBadge status={inv.status} />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    </div>
  );
}

/* Organization Section */
function OrganizationSection() {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "clinician">("clinician");
  const [showInvite, setShowInvite] = useState(false);
  const [expandedMember, setExpandedMember] = useState<string | null>(null);
  const { toast } = useToast();

  const handleInvite = () => {
    if (!inviteEmail.includes("@")) {
      toast({ title: "Invalid email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }
    toast({ title: "Invitation sent", description: `Invite sent to ${inviteEmail} as ${inviteRole}.` });
    setInviteEmail("");
    setShowInvite(false);
  };

  return (
    <div className="space-y-6">
      <GlassCard className="p-6 md:p-8" hoverEffect={false}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(123,82,171,0.1), rgba(212,175,55,0.1))" }}>
              <Users size={18} style={{ color: "#7B52AB" }} />
            </div>
            <div>
              <h2 className="font-serif text-lg text-primary">Team Members</h2>
              <p className="text-xs text-muted-foreground">{MOCK_ORG_MEMBERS.length} members</p>
            </div>
          </div>
          <button
            onClick={() => setShowInvite(!showInvite)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-accent hover:bg-accent/10 transition-all cursor-pointer active:scale-95 border border-accent/20"
          >
            <UserPlus size={14} /> Invite
          </button>
        </div>

        <AnimatePresence>
          {showInvite && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-4 rounded-xl bg-accent/5 border border-accent/15 mb-4 space-y-3">
                <div>
                  <label className={labelClass}>Email Address</label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@practice.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-secondary/30 border border-border/40 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all placeholder:text-muted-foreground/40"
                  />
                </div>
                <div>
                  <label className={labelClass}>Role</label>
                  <div className="flex gap-2">
                    {(["clinician", "admin"] as const).map(role => (
                      <button
                        key={role}
                        onClick={() => setInviteRole(role)}
                        className={`flex-1 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer capitalize ${
                          inviteRole === role
                            ? "bg-accent/15 text-accent border border-accent/30"
                            : "bg-secondary/20 text-muted-foreground border border-border/30"
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleInvite}
                    className="flex-1 px-4 py-2.5 rounded-xl text-xs font-medium text-white cursor-pointer active:scale-95 transition-all"
                    style={{ background: "linear-gradient(135deg, #2E8B57 0%, #256D47 100%)" }}
                  >
                    <Mail size={12} className="inline mr-1" /> Send Invitation
                  </button>
                  <button
                    onClick={() => setShowInvite(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-medium text-muted-foreground bg-secondary/30 border border-border/30 cursor-pointer active:scale-95 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-2">
          {MOCK_ORG_MEMBERS.map((member, i) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <button
                onClick={() => setExpandedMember(expandedMember === member.id ? null : member.id)}
                className="w-full text-left p-3 rounded-xl bg-secondary/10 border border-border/20 hover:bg-secondary/25 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, rgba(27,42,74,0.1), rgba(212,175,55,0.1))" }}>
                    <span className="text-sm font-serif font-bold text-primary">{member.avatarInitial}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-primary truncate">{member.name}</span>
                      <RoleBadge role={member.role} />
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                  </div>
                  <motion.div
                    animate={{ rotate: expandedMember === member.id ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight size={14} className="text-muted-foreground/40" />
                  </motion.div>
                </div>
              </button>

              <AnimatePresence>
                {expandedMember === member.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 py-2 ml-12 space-y-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock size={11} /> Joined {new Date(member.joinedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Zap size={11} /> Last active {new Date(member.lastActive).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider mb-1">Permissions</p>
                        <div className="flex flex-wrap gap-1">
                          {ROLE_PERMISSIONS[member.role]?.map(perm => (
                            <span key={perm} className="px-2 py-0.5 rounded-full text-[10px] bg-primary/5 text-primary/60">
                              {perm}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

/* Preferences Section */
function PreferencesSection() {
  const [prefs, setPrefs] = useState<AccountPreferences>(getPreferences);

  const togglePref = useCallback((key: keyof AccountPreferences) => {
    setPrefs(prev => {
      const next = { ...prev, [key]: !prev[key] };
      savePreferences(next);
      return next;
    });
  }, []);

  return (
    <div className="space-y-6">
      <GlassCard className="p-6 md:p-8" hoverEffect={false}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(212,175,55,0.1), rgba(46,139,87,0.1))" }}>
            <Zap size={18} style={{ color: "#D4AF37" }} />
          </div>
          <h2 className="font-serif text-lg text-primary">Experience Preferences</h2>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/15 border border-border/25">
            <div className="flex items-center gap-3">
              <Sparkles size={18} className="text-accent" />
              <div>
                <p className="text-sm font-medium text-primary">Animations</p>
                <p className="text-xs text-muted-foreground">Enable smooth transitions and micro-interactions</p>
              </div>
            </div>
            <ToggleSwitch enabled={prefs.animations} onToggle={() => togglePref("animations")} />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/15 border border-border/25">
            <div className="flex items-center gap-3">
              {prefs.sounds ? <Volume2 size={18} className="text-emerald-500" /> : <VolumeX size={18} className="text-muted-foreground" />}
              <div>
                <p className="text-sm font-medium text-primary">Sound Effects</p>
                <p className="text-xs text-muted-foreground">Play subtle audio cues during tool interactions</p>
              </div>
            </div>
            <ToggleSwitch enabled={prefs.sounds} onToggle={() => togglePref("sounds")} color="bg-emerald-500" />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/15 border border-border/25">
            <div className="flex items-center gap-3">
              <Eye size={18} className="text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-primary">Reduced Motion</p>
                <p className="text-xs text-muted-foreground">Minimize motion for accessibility or preference</p>
              </div>
            </div>
            <ToggleSwitch enabled={prefs.reducedMotion} onToggle={() => togglePref("reducedMotion")} color="bg-blue-500" />
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground/60 mt-4 px-1">
          These preferences are saved locally on this device.
        </p>
      </GlassCard>
    </div>
  );
}

/* Security Section */
function SecuritySection() {
  const { toast } = useToast();
  const [showDevices, setShowDevices] = useState(true);

  const handleRevokeDevice = (device: DeviceSession) => {
    toast({ title: "Session revoked", description: `Signed out of ${device.deviceName}.` });
  };

  return (
    <div className="space-y-6">
      {/* Password */}
      <GlassCard className="p-6 md:p-8" hoverEffect={false}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(15,82,186,0.1), rgba(212,175,55,0.1))" }}>
            <KeyRound size={18} style={{ color: "#0F52BA" }} />
          </div>
          <h2 className="font-serif text-lg text-primary">Password</h2>
        </div>

        <div className="p-4 rounded-xl bg-secondary/15 border border-border/25">
          <p className="text-sm text-muted-foreground mb-3">
            Your password is managed through Supabase authentication. Use the button below to initiate a password reset.
          </p>
          <button
            onClick={() => toast({ title: "Password reset email sent", description: "Check your inbox for instructions." })}
            className="px-4 py-2.5 rounded-xl text-xs font-medium text-primary bg-secondary/30 border border-border/30 hover:bg-secondary/50 transition-all cursor-pointer active:scale-95"
          >
            <Lock size={12} className="inline mr-1.5" /> Send Password Reset Email
          </button>
        </div>
      </GlassCard>

      {/* Two-Factor Authentication */}
      <GlassCard className="p-6 md:p-8" hoverEffect={false}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(46,139,87,0.1), rgba(212,175,55,0.1))" }}>
            <Shield size={18} style={{ color: "#2E8B57" }} />
          </div>
          <h2 className="font-serif text-lg text-primary">Two-Factor Authentication</h2>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
              <Shield size={16} className="text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-primary">Not yet available</p>
              <p className="text-xs text-muted-foreground mt-1">
                Two-factor authentication is on our roadmap. We take security seriously and will notify you when this feature becomes available.
              </p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Active Devices */}
      <GlassCard className="p-6 md:p-8" hoverEffect={false}>
        <button
          onClick={() => setShowDevices(!showDevices)}
          className="w-full flex items-center gap-3 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(123,82,171,0.1), rgba(212,175,55,0.1))" }}>
            <Smartphone size={18} style={{ color: "#7B52AB" }} />
          </div>
          <div className="flex-1 text-left">
            <h2 className="font-serif text-lg text-primary">Active Devices</h2>
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
                  >
                    <div className="flex items-center gap-3">
                      <DeviceIcon name={device.deviceName} />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-primary">{device.deviceName}</p>
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
    </div>
  );
}

/* Data & Privacy Section */
function DataPrivacySection() {
  const { toast } = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <div className="space-y-6">
      {/* PHI Statement */}
      <GlassCard className="p-6 md:p-8" hoverEffect={false}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(15,82,186,0.1), rgba(46,139,87,0.1))" }}>
            <Shield size={18} style={{ color: "#0F52BA" }} />
          </div>
          <h2 className="font-serif text-lg text-primary">Protected Health Information</h2>
        </div>

        <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/15 space-y-3">
          <p className="text-sm text-primary/80 leading-relaxed">
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

      {/* Export Data */}
      <GlassCard className="p-6 md:p-8" hoverEffect={false}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(46,139,87,0.1), rgba(212,175,55,0.1))" }}>
            <Download size={18} style={{ color: "#2E8B57" }} />
          </div>
          <h2 className="font-serif text-lg text-primary">Export Your Data</h2>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Download a copy of your account data including profile information, session history, and saved preferences.
        </p>

        <button
          onClick={() => toast({ title: "Export started", description: "Your data export is being prepared. You'll receive an email when it's ready." })}
          className="px-4 py-2.5 rounded-xl text-xs font-medium text-primary bg-secondary/30 border border-border/30 hover:bg-secondary/50 transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
        >
          <Download size={12} /> Request Data Export
        </button>
      </GlassCard>

      {/* Delete Account */}
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
            >
              <Trash2 size={12} className="inline mr-1.5" /> Delete My Account
            </button>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-destructive/5 border border-destructive/20 space-y-3"
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
            <div className="flex gap-2">
              <button
                onClick={() => {
                  toast({ title: "Account deletion requested", description: "Our team will process your request within 48 hours.", variant: "destructive" });
                  setShowDeleteConfirm(false);
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-medium text-white bg-destructive hover:bg-destructive/90 transition-all cursor-pointer active:scale-95"
              >
                Yes, Delete My Account
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-medium text-muted-foreground bg-secondary/30 border border-border/30 cursor-pointer active:scale-95 transition-all"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </GlassCard>
    </div>
  );
}

const SECTIONS = [
  { id: "plan", label: "Plan & Billing", icon: Crown },
  { id: "org", label: "Organization", icon: Users },
  { id: "prefs", label: "Preferences", icon: Zap },
  { id: "security", label: "Security", icon: Shield },
  { id: "data", label: "Data & Privacy", icon: Lock },
];

export default function AccountPage() {
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [activeSection, setActiveSection] = useState("plan");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [authLoading, isAuthenticated]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/20">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center animate-pulse">
            <Crown size={24} className="text-accent" />
          </div>
          <p className="text-muted-foreground font-medium">Loading account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 pb-10 pt-24 md:pt-32 px-4 md:px-8">
      <Navbar />

      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Link href="/dashboard" className="no-underline">
              <button className="p-2.5 rounded-xl hover:bg-secondary/50 transition-colors cursor-pointer">
                <ArrowLeft size={20} className="text-primary" />
              </button>
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-serif text-primary">Account</h1>
              <p className="text-sm text-muted-foreground">Manage billing, team, preferences, and security</p>
            </div>
          </div>

          <SectionNav
            sections={SECTIONS}
            active={activeSection}
            onSelect={setActiveSection}
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {activeSection === "plan" && <PlanBillingSection />}
              {activeSection === "org" && <OrganizationSection />}
              {activeSection === "prefs" && <PreferencesSection />}
              {activeSection === "security" && <SecuritySection />}
              {activeSection === "data" && <DataPrivacySection />}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
