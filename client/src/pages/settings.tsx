import { GlassCard } from "@/components/ui/glass-card";
import { useAuth, createAuthFetch } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useTheme, accentPresets } from "@/hooks/use-theme";
import { getSupabase } from "@/lib/supabase";
import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation, useRoute, Link } from "wouter";
import { cn } from "@/lib/utils";
import {
  User, Briefcase, Palette, Play, Crown, Users, Shield, Lock,
  Settings, Save, CheckCircle2, Eye, EyeOff, ChevronRight,
  ShieldAlert, Volume2, VolumeX, SlidersHorizontal, Info,
  Check, CreditCard, Receipt, ChevronDown, UserPlus, Clock,
  Zap, Smartphone, Monitor, Tablet, Mail, KeyRound, Download,
  Trash2, AlertTriangle, ArrowLeft, Lightbulb
} from "lucide-react";
import {
  MOCK_INVOICES, MOCK_PAYMENT_METHODS, MOCK_ORG_MEMBERS,
  MOCK_DEVICES, ROLE_PERMISSIONS, type DeviceSession
} from "@/lib/mock-data/billing-data";

const SPECIALTY_OPTIONS = [
  "General Practice", "Child & Adolescent", "Trauma & PTSD",
  "Anxiety & Depression", "Family Therapy", "Couples Therapy",
  "Play Therapy", "Art Therapy", "Behavioral Health",
  "Substance Abuse", "Grief & Loss", "Neuropsychology",
  "School Counseling", "Other",
];

const PRONOUN_OPTIONS = [
  "she/her", "he/him", "they/them", "she/they",
  "he/they", "ze/zir", "Prefer not to say",
];

const MODALITY_OPTIONS = [
  "CBT", "DBT", "ACT", "EMDR", "ART", "IFS", "Somatic Experiencing",
  "Attachment-Based", "Play Therapy", "Sand Tray", "Narrative Therapy",
  "Solution-Focused", "Psychodynamic", "Motivational Interviewing",
  "Mindfulness-Based", "Family Systems", "Gestalt",
];

const POPULATION_OPTIONS = [
  "Children (3-12)", "Adolescents (13-17)", "Young Adults (18-25)",
  "Adults", "Older Adults", "Couples", "Families", "Groups",
  "LGBTQ+", "Veterans", "First Responders", "Neurodivergent",
];

const STYLE_LABELS: Record<string, string[]> = {
  tone: ["Warm & Gentle", "Balanced", "Direct & Structured"],
  immersion: ["Minimal", "Moderate", "Fully Immersive"],
  humor: ["None", "Light & Occasional", "Playful"],
};

const SECTIONS = [
  { id: "profile", label: "Profile", icon: User, subtitle: "Personal information & contact", color: "from-primary/15 to-primary/5", iconColor: "text-primary" },
  { id: "professional", label: "Professional", icon: Briefcase, subtitle: "Credentials & modalities", color: "from-primary/15 to-primary/5", iconColor: "text-primary" },
  { id: "appearance", label: "Appearance", icon: Palette, subtitle: "Theme, style & display", color: "from-accent/15 to-accent/5", iconColor: "text-accent" },
  { id: "sessions", label: "Session Defaults", icon: Play, subtitle: "Default session behavior", color: "from-purple-500/15 to-purple-500/5", iconColor: "text-purple-400" },
  { id: "billing", label: "Plan & Billing", icon: Crown, subtitle: "Subscription & payments", color: "from-amber-500/15 to-amber-500/5", iconColor: "text-amber-400" },
  { id: "team", label: "Team", icon: Users, subtitle: "Members & invitations", color: "from-blue-500/15 to-blue-500/5", iconColor: "text-blue-400" },
  { id: "security", label: "Security", icon: Shield, subtitle: "Password & devices", color: "from-emerald-500/15 to-emerald-500/5", iconColor: "text-emerald-400" },
  { id: "privacy", label: "Data & Privacy", icon: Lock, subtitle: "PHI, export & deletion", color: "from-rose-500/15 to-rose-500/5", iconColor: "text-rose-400" },
];

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  professionalTitle: string | null;
  clinicalSpecialty: string | null;
  defaultAnonymous: boolean;
  profileImageUrl: string | null;
  themePreference?: string;
}

interface LocalProfileData {
  pronouns: string;
  location: string;
  practiceName: string;
  bio: string;
  modalities: string[];
  populations: string[];
}

interface AccountPreferences {
  animations: boolean;
  sounds: boolean;
  reducedMotion: boolean;
}

interface LocalStyleData {
  tone: number;
  immersion: number;
  humor: number;
  showProgress: boolean;
}

const DEFAULT_LOCAL: LocalProfileData = {
  pronouns: "", location: "", practiceName: "", bio: "",
  modalities: [], populations: [],
};

function getLocalProfile(): LocalProfileData {
  try {
    const stored = localStorage.getItem("cp-local-profile");
    if (stored) return { ...DEFAULT_LOCAL, ...JSON.parse(stored) };
  } catch {}
  return { ...DEFAULT_LOCAL };
}

function saveLocalProfile(data: LocalProfileData) {
  try { localStorage.setItem("cp-local-profile", JSON.stringify(data)); } catch {}
}

function getShowCredentials(): boolean {
  try { return localStorage.getItem("cp-show-credentials") === "true"; } catch {}
  return false;
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

function getLocalStyle(): LocalStyleData {
  try {
    const stored = localStorage.getItem("cp-local-profile");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.clinicianStyle) return { tone: 2, immersion: 2, humor: 1, showProgress: true, ...parsed.clinicianStyle };
    }
  } catch {}
  return { tone: 2, immersion: 2, humor: 1, showProgress: true };
}

function saveLocalStyle(style: LocalStyleData) {
  try {
    const stored = localStorage.getItem("cp-local-profile");
    const parsed = stored ? JSON.parse(stored) : {};
    parsed.clinicianStyle = style;
    localStorage.setItem("cp-local-profile", JSON.stringify(parsed));
  } catch {}
}

const inputClass = "w-full px-4 py-3 rounded-xl bg-secondary/30 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-muted-foreground/40";
const labelClass = "text-xs font-semibold text-foreground/60 uppercase tracking-[0.15em] block mb-2";

function PhiWarning({ text }: { text: string }) {
  return (
    <p className="flex items-start gap-1.5 mt-1.5 text-[11px] text-amber-600/70 leading-relaxed">
      <ShieldAlert size={11} className="shrink-0 mt-0.5" />
      <span>{text}</span>
    </p>
  );
}

function ToggleSwitch({ enabled, onToggle, color = "bg-primary" }: { enabled: boolean; onToggle: () => void; color?: string }) {
  return (
    <button onClick={onToggle} className={cn("relative w-12 h-7 rounded-full transition-all cursor-pointer", enabled ? color : "bg-secondary/60")}>
      <motion.div className="absolute top-0.5 w-6 h-6 rounded-full bg-background shadow-md" animate={{ left: enabled ? 22 : 2 }} transition={{ type: "spring", stiffness: 400, damping: 25 }} />
    </button>
  );
}

function MultiSelectChips({ options, selected, onToggle }: { options: string[]; selected: string[]; onToggle: (opt: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isSelected = selected.includes(opt);
        return (
          <button
            key={opt}
            onClick={() => onToggle(opt)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer active:scale-95",
              isSelected
                ? "bg-primary/10 text-primary border border-primary/20"
                : "bg-secondary/30 text-muted-foreground border border-border hover:bg-secondary/50"
            )}
            data-testid={`chip-${opt.toLowerCase().replace(/\s+/g, "-")}`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function StyleSlider({ label, value, onChange, labels }: { label: string; value: number; onChange: (v: number) => void; labels: string[] }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-xs text-primary font-medium">{labels[value]}</span>
      </div>
      <div className="flex gap-1.5">
        {labels.map((l, i) => (
          <button
            key={i}
            onClick={() => onChange(i)}
            className={cn("flex-1 h-2.5 rounded-full transition-all cursor-pointer", i <= value ? "bg-primary" : "bg-secondary/40")}
            title={l}
            data-testid={`slider-${label.toLowerCase().replace(/\s+/g, "-")}-${i}`}
          />
        ))}
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, subtitle, iconColor }: { icon: React.ElementType; title: string; subtitle?: string; iconColor?: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-sm", iconColor || "bg-gradient-to-br from-primary/12 to-primary/4")}>
        <Icon size={18} className="text-primary" strokeWidth={1.8} />
      </div>
      <div>
        <h2 className="font-serif text-lg text-foreground tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: "paid" | "pending" | "failed" }) {
  const styles = {
    paid: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    failed: "bg-red-500/10 text-red-400 border-red-500/20",
  };
  return (
    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold border uppercase tracking-wider", styles[status])}>
      {status}
    </span>
  );
}

function RoleBadge({ role }: { role: "owner" | "admin" | "clinician" }) {
  const styles = {
    owner: "bg-accent/10 text-accent border-accent/20",
    admin: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    clinician: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  };
  return (
    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold border capitalize", styles[role])}>
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

export default function SettingsPage() {
  const { isLoading: authLoading, isAuthenticated, user, session, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const authFetch = createAuthFetch(session?.access_token);
  const { accentId, setAccentId, initFromServer } = useTheme();

  const [, params] = useRoute("/settings/:section");
  const activeSection = params?.section || null;

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [professionalTitle, setProfessionalTitle] = useState("");
  const [clinicalSpecialty, setClinicalSpecialty] = useState("");
  const [hasProfileChanges, setHasProfileChanges] = useState(false);
  const [localProfile, setLocalProfile] = useState<LocalProfileData>(getLocalProfile);
  const [hasLocalChanges, setHasLocalChanges] = useState(false);
  const [showCredentials, setShowCredentials] = useState(getShowCredentials);

  const [prefs, setPrefs] = useState<AccountPreferences>(getPreferences);
  const [style, setStyle] = useState<LocalStyleData>(getLocalStyle);
  const [themeSaving, setThemeSaving] = useState(false);
  const [themeSavedId, setThemeSavedId] = useState<string | null>(null);
  const themeInitialized = useRef(false);

  const [defaultAnonymous, setDefaultAnonymous] = useState(false);
  const [hasSessionChanges, setHasSessionChanges] = useState(false);

  const [showInvoices, setShowInvoices] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "clinician">("clinician");
  const [showInvite, setShowInvite] = useState(false);
  const [expandedMember, setExpandedMember] = useState<string | null>(null);

  const [showDevices, setShowDevices] = useState(true);
  const [resettingPassword, setResettingPassword] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTyped, setDeleteTyped] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: profile } = useQuery<ProfileData>({
    queryKey: ["/api/workspace"],
    queryFn: async () => {
      const res = await authFetch("/api/workspace");
      if (!res.ok) throw new Error("Failed to fetch profile");
      return res.json();
    },
    enabled: !!session,
  });

  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName || "");
      setLastName(profile.lastName || "");
      setProfessionalTitle(profile.professionalTitle || "");
      setClinicalSpecialty(profile.clinicalSpecialty || "");
      setDefaultAnonymous(profile.defaultAnonymous || false);
      setHasProfileChanges(false);
      setHasSessionChanges(false);
    }
  }, [profile]);

  useEffect(() => {
    if (profile?.themePreference && !themeInitialized.current) {
      initFromServer(profile.themePreference);
      themeInitialized.current = true;
    }
  }, [profile, initFromServer]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [authLoading, isAuthenticated]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<ProfileData>) => {
      const res = await authFetch("/api/workspace", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workspace"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setHasProfileChanges(false);
      setHasSessionChanges(false);
    },
    onError: () => {
      toast({ title: "Update failed", description: "Please try again.", variant: "destructive" });
    },
  });

  const handleSaveProfile = () => {
    updateProfileMutation.mutate({
      firstName, lastName,
      professionalTitle: professionalTitle || null,
      clinicalSpecialty: clinicalSpecialty || null,
    });
    if (hasLocalChanges) {
      saveLocalProfile(localProfile);
      setHasLocalChanges(false);
    }
    toast({ title: "Profile updated", description: "Your changes have been saved." });
  };

  const handleSaveSessionDefaults = () => {
    updateProfileMutation.mutate({ defaultAnonymous });
    toast({ title: "Session defaults updated" });
  };

  const handleProfileChange = () => setHasProfileChanges(true);

  const updateLocal = useCallback((updates: Partial<LocalProfileData>) => {
    setLocalProfile(prev => ({ ...prev, ...updates }));
    setHasLocalChanges(true);
  }, []);

  const toggleArrayItem = useCallback((field: "modalities" | "populations", item: string) => {
    setLocalProfile(prev => {
      const arr = prev[field];
      const next = arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item];
      return { ...prev, [field]: next };
    });
    setHasLocalChanges(true);
  }, []);

  const handleToggleCredentials = useCallback(() => {
    const next = !showCredentials;
    setShowCredentials(next);
    try { localStorage.setItem("cp-show-credentials", next ? "true" : "false"); } catch {}
  }, [showCredentials]);

  const handleThemeChange = useCallback(async (id: string) => {
    setAccentId(id);
    setThemeSavedId(null);
    setThemeSaving(true);
    try {
      const res = await authFetch("/api/workspace", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ themePreference: id }),
      });
      if (res.ok) {
        setThemeSavedId(id);
        setTimeout(() => setThemeSavedId(null), 2000);
      }
    } catch {} finally {
      setThemeSaving(false);
    }
  }, [setAccentId, authFetch]);

  const togglePref = useCallback((key: keyof AccountPreferences) => {
    setPrefs(prev => {
      const next = { ...prev, [key]: !prev[key] };
      savePreferences(next);
      return next;
    });
  }, []);

  const updateStyle = useCallback((key: keyof LocalStyleData, value: number | boolean) => {
    setStyle(prev => {
      const next = { ...prev, [key]: value };
      saveLocalStyle(next);
      return next;
    });
  }, []);

  const handleInvite = () => {
    if (!inviteEmail.includes("@")) {
      toast({ title: "Invalid email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }
    toast({ title: "Invitation sent", description: `Invite sent to ${inviteEmail} as ${inviteRole}.` });
    setInviteEmail("");
    setShowInvite(false);
  };

  const handlePasswordReset = async () => {
    const email = user?.email;
    if (!email) {
      toast({ title: "Error", description: "No email found for this account.", variant: "destructive" });
      return;
    }
    setResettingPassword(true);
    try {
      const supabase = await getSupabase();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
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

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/15 to-accent/10 flex items-center justify-center">
            <Settings size={24} className="text-primary animate-pulse" />
          </div>
          <p className="text-sm text-muted-foreground font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  const initials = [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join("").toUpperCase() || "?";
  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Clinician";
  const anyProfileChanges = hasProfileChanges || hasLocalChanges;
  const paymentMethod = MOCK_PAYMENT_METHODS[0];

  const validSectionIds = SECTIONS.map(s => s.id);
  const currentSectionDef = SECTIONS.find(s => s.id === activeSection);

  useEffect(() => {
    if (activeSection && !validSectionIds.includes(activeSection)) {
      navigate("/settings");
    }
  }, [activeSection]);

  const renderSectionContent = () => {
    switch (activeSection) {
      case "profile":
        return (
          <div className="space-y-5">
            <GlassCard className="p-6 md:p-8" hoverEffect={false}>
              <SectionHeader icon={User} title="Personal Information" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>First Name</label>
                  <input type="text" value={firstName} onChange={(e) => { setFirstName(e.target.value); handleProfileChange(); }} className={inputClass} data-testid="input-first-name" />
                </div>
                <div>
                  <label className={labelClass}>Last Name</label>
                  <input type="text" value={lastName} onChange={(e) => { setLastName(e.target.value); handleProfileChange(); }} className={inputClass} data-testid="input-last-name" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className={labelClass}>Pronouns <span className="text-muted-foreground/50 normal-case font-normal">(optional)</span></label>
                  <select value={localProfile.pronouns} onChange={(e) => updateLocal({ pronouns: e.target.value })} className={cn(inputClass, "appearance-none cursor-pointer")} data-testid="select-pronouns">
                    <option value="">Select pronouns...</option>
                    {PRONOUN_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Location <span className="text-muted-foreground/50 normal-case font-normal">(optional)</span></label>
                  <input type="text" value={localProfile.location} onChange={(e) => updateLocal({ location: e.target.value })} placeholder="e.g., Portland, OR" className={inputClass} data-testid="input-location" />
                  <PhiWarning text="This is your practice location, not a client's." />
                </div>
              </div>

              <div className="mt-4">
                <label className={labelClass}>Practice Name <span className="text-muted-foreground/50 normal-case font-normal">(optional)</span></label>
                <input type="text" value={localProfile.practiceName} onChange={(e) => updateLocal({ practiceName: e.target.value })} placeholder="e.g., Willow Creek Counseling" className={inputClass} data-testid="input-practice-name" />
                <PhiWarning text="Do not enter client names or protected health information." />
              </div>

              <div className="mt-4">
                <label className={labelClass}>Email</label>
                <div className="w-full px-4 py-3 rounded-xl bg-secondary/20 border border-border text-muted-foreground text-sm" data-testid="text-email">
                  {profile?.email || user?.email || "\u2014"}
                </div>
                <p className="text-[11px] text-muted-foreground/60 mt-1">Email cannot be changed here</p>
              </div>

              <div className="mt-4">
                <label className={labelClass}>Bio</label>
                <textarea
                  value={localProfile.bio}
                  onChange={(e) => updateLocal({ bio: e.target.value })}
                  placeholder="A brief description of your clinical approach..."
                  rows={3}
                  maxLength={300}
                  className={cn(inputClass, "resize-none")}
                  data-testid="input-bio"
                />
                <div className="flex items-center justify-between mt-1">
                  <PhiWarning text="Do not include client names, case details, or protected health information." />
                  <p className="text-[11px] text-muted-foreground/60 shrink-0 ml-3">{localProfile.bio.length}/300</p>
                </div>
              </div>
            </GlassCard>

            {anyProfileChanges && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <button
                  onClick={handleSaveProfile}
                  disabled={updateProfileMutation.isPending}
                  className="w-full px-6 py-3.5 rounded-2xl bg-primary text-primary-foreground font-medium shadow-lg hover:shadow-xl transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98]"
                  data-testid="button-save-profile"
                >
                  {updateProfileMutation.isPending ? "Saving..." : <><Save size={16} strokeWidth={1.8} /> Save Changes</>}
                </button>
              </motion.div>
            )}
          </div>
        );

      case "professional":
        return (
          <div className="space-y-5">
            <GlassCard className="p-6 md:p-8" hoverEffect={false}>
              <div className="flex items-center justify-between">
                <SectionHeader icon={Briefcase} title="Professional Details" subtitle="Credentials for organization and peer verification" />
                <ToggleSwitch enabled={showCredentials} onToggle={handleToggleCredentials} />
              </div>

              {!showCredentials && (
                <button
                  onClick={handleToggleCredentials}
                  className="mt-2 w-full flex items-center justify-between p-3 rounded-xl bg-secondary/15 border border-border hover:bg-secondary/30 transition-all cursor-pointer text-left"
                  data-testid="button-show-credentials"
                >
                  <span className="text-sm text-muted-foreground">Enable to display professional credentials</span>
                  <ChevronRight size={16} className="text-muted-foreground/40" />
                </button>
              )}

              <AnimatePresence>
                {showCredentials && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-4 mt-4">
                      <div>
                        <label className={labelClass}>Professional Title</label>
                        <input type="text" value={professionalTitle} onChange={(e) => { setProfessionalTitle(e.target.value); handleProfileChange(); }} placeholder="e.g., LCSW, LMFT, PhD, PsyD" className={inputClass} data-testid="input-professional-title" />
                        <PhiWarning text="Your credential or license type only. No client information." />
                      </div>

                      <div>
                        <label className={labelClass}>Clinical Specialty</label>
                        <select value={clinicalSpecialty} onChange={(e) => { setClinicalSpecialty(e.target.value); handleProfileChange(); }} className={cn(inputClass, "appearance-none cursor-pointer")} data-testid="select-specialty">
                          <option value="">Select your specialty...</option>
                          {SPECIALTY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className={labelClass}>Therapeutic Modalities</label>
                        <MultiSelectChips options={MODALITY_OPTIONS} selected={localProfile.modalities} onToggle={(item) => toggleArrayItem("modalities", item)} />
                        <p className="text-[11px] text-muted-foreground/60 mt-2">Select all modalities you practice</p>
                      </div>

                      <div>
                        <label className={labelClass}>Populations Served</label>
                        <MultiSelectChips options={POPULATION_OPTIONS} selected={localProfile.populations} onToggle={(item) => toggleArrayItem("populations", item)} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassCard>

            {anyProfileChanges && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <button
                  onClick={handleSaveProfile}
                  disabled={updateProfileMutation.isPending}
                  className="w-full px-6 py-3.5 rounded-2xl bg-primary text-primary-foreground font-medium shadow-lg transition-all cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98]"
                  data-testid="button-save-professional"
                >
                  {updateProfileMutation.isPending ? "Saving..." : <><Save size={16} /> Save Changes</>}
                </button>
              </motion.div>
            )}
          </div>
        );

      case "appearance":
        return (
          <div className="space-y-5">
            <GlassCard className="p-6 md:p-8" hoverEffect={false}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/12 to-accent/4 flex items-center justify-center shadow-sm">
                  <Palette size={18} className="text-accent" strokeWidth={1.8} />
                </div>
                <div className="flex-1">
                  <h2 className="font-serif text-lg text-foreground tracking-tight">Color Palette</h2>
                </div>
                {themeSavedId && (
                  <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-1 text-emerald-400 text-xs font-medium">
                    <CheckCircle2 size={14} /> Saved
                  </motion.div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {accentPresets.map((preset) => {
                  const isActive = accentId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => handleThemeChange(preset.id)}
                      className={cn(
                        "relative flex items-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer active:scale-[0.97]",
                        isActive
                          ? "border-primary bg-primary/6 shadow-md ring-1 ring-primary/15"
                          : "border-border/50 bg-card/80 hover:bg-card hover:border-border hover:shadow-sm"
                      )}
                      data-testid={`button-theme-${preset.id}`}
                    >
                      <div className="flex -space-x-1 shrink-0">
                        <div className="w-8 h-8 rounded-full border-2 border-background shadow-sm" style={{ backgroundColor: preset.swatch }} />
                        <div className="w-8 h-8 rounded-full border-2 border-background shadow-sm" style={{ backgroundColor: preset.swatchSecondary }} />
                      </div>
                      <span className={cn("text-sm font-medium leading-tight", isActive ? "text-foreground" : "text-muted-foreground")}>
                        {preset.name}
                      </span>
                      {isActive && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <Check size={12} className="text-primary-foreground" strokeWidth={2.5} />
                        </motion.div>
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-muted-foreground/60 mt-4 px-1">Your color palette is saved to your account and syncs across devices.</p>
            </GlassCard>

            <GlassCard className="p-6 md:p-8" hoverEffect={false}>
              <SectionHeader icon={SlidersHorizontal} title="Clinician Style" subtitle="These preferences set defaults for new sessions" />
              <div className="space-y-6">
                <StyleSlider label="Session Tone" value={style.tone} onChange={(v) => updateStyle("tone", v)} labels={STYLE_LABELS.tone} />
                <StyleSlider label="Immersion Level" value={style.immersion} onChange={(v) => updateStyle("immersion", v)} labels={STYLE_LABELS.immersion} />
                <StyleSlider label="Humor" value={style.humor} onChange={(v) => updateStyle("humor", v)} labels={STYLE_LABELS.humor} />

                <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/20 border border-border">
                  <div className="flex items-center gap-3">
                    <Eye size={18} className="text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Show Progress to Clients</p>
                      <p className="text-xs text-muted-foreground">Display session progress bars and step counts</p>
                    </div>
                  </div>
                  <ToggleSwitch enabled={style.showProgress} onToggle={() => updateStyle("showProgress", !style.showProgress)} />
                </div>
              </div>

              <div className="mt-5 p-3 rounded-xl bg-primary/5 border border-primary/15">
                <p className="text-[11px] text-muted-foreground/80">
                  <Info size={11} className="inline mr-1 text-primary" />
                  These style preferences shape the default feel of your sessions. You can adjust them on a per-session basis.
                </p>
              </div>
            </GlassCard>

            <GlassCard className="p-6 md:p-8" hoverEffect={false}>
              <SectionHeader icon={SlidersHorizontal} title="Experience" iconColor="bg-gradient-to-br from-accent/12 to-accent/4" />
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/15 border border-border/25">
                  <div className="flex items-center gap-3">
                    <SlidersHorizontal size={18} className="text-accent" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Animations</p>
                      <p className="text-xs text-muted-foreground">Enable smooth transitions and micro-interactions</p>
                    </div>
                  </div>
                  <ToggleSwitch enabled={prefs.animations} onToggle={() => togglePref("animations")} color="bg-accent" />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/15 border border-border/25">
                  <div className="flex items-center gap-3">
                    {prefs.sounds ? <Volume2 size={18} className="text-emerald-500" /> : <VolumeX size={18} className="text-muted-foreground" />}
                    <div>
                      <p className="text-sm font-medium text-foreground">Sound Effects</p>
                      <p className="text-xs text-muted-foreground">Play subtle audio cues during tool interactions</p>
                    </div>
                  </div>
                  <ToggleSwitch enabled={prefs.sounds} onToggle={() => togglePref("sounds")} color="bg-emerald-500" />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/15 border border-border/25">
                  <div className="flex items-center gap-3">
                    <Eye size={18} className="text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Reduced Motion</p>
                      <p className="text-xs text-muted-foreground">Minimize motion for accessibility or preference</p>
                    </div>
                  </div>
                  <ToggleSwitch enabled={prefs.reducedMotion} onToggle={() => togglePref("reducedMotion")} color="bg-blue-500" />
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground/60 mt-4 px-1">These preferences are saved locally on this device.</p>
            </GlassCard>
          </div>
        );

      case "sessions":
        return (
          <div className="space-y-5">
            <GlassCard className="p-6 md:p-8" hoverEffect={false}>
              <SectionHeader icon={Play} title="Default Behavior" iconColor="bg-purple-500/10" />
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/20 border border-border">
                  <div className="flex items-center gap-3">
                    {defaultAnonymous ? <EyeOff size={18} className="text-purple-400" /> : <Eye size={18} className="text-muted-foreground" />}
                    <div>
                      <p className="text-sm font-medium text-foreground">Anonymous Mode</p>
                      <p className="text-xs text-muted-foreground">Start new sessions in anonymous mode by default</p>
                    </div>
                  </div>
                  <ToggleSwitch enabled={defaultAnonymous} onToggle={() => { setDefaultAnonymous(!defaultAnonymous); setHasSessionChanges(true); }} color="bg-purple-500" />
                </div>
                <p className="text-[11px] text-muted-foreground/60 px-1">
                  When enabled, all new sessions you create will have participant names hidden by default. You can always toggle this during a session.
                </p>
              </div>

              <div className="mt-5 p-3 rounded-xl bg-purple-500/5 border border-purple-500/15">
                <p className="text-[11px] text-muted-foreground/80">
                  <Info size={11} className="inline mr-1 text-purple-400" />
                  More session defaults (tool preferences, timer settings) will be available as new tools are added.
                </p>
              </div>
            </GlassCard>

            {hasSessionChanges && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <button
                  onClick={handleSaveSessionDefaults}
                  disabled={updateProfileMutation.isPending}
                  className="w-full px-6 py-3.5 rounded-2xl bg-primary text-primary-foreground font-medium shadow-lg transition-all cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98]"
                  data-testid="button-save-sessions"
                >
                  {updateProfileMutation.isPending ? "Saving..." : <><Save size={16} /> Save Changes</>}
                </button>
              </motion.div>
            )}
          </div>
        );

      case "billing":
        return (
          <div className="space-y-5">
            <GlassCard className="p-6 md:p-8" hoverEffect={false}>
              <SectionHeader icon={Crown} title="Your Plan" subtitle="Manage your subscription" iconColor="bg-accent/10" />
              <div className="p-4 rounded-2xl border border-accent/25 bg-gradient-to-br from-accent/5 to-primary/3">
                <div className="flex items-center gap-3 mb-3">
                  <div className="px-3 py-1 rounded-full bg-accent/15 border border-accent/25">
                    <span className="text-xs font-bold text-accent flex items-center gap-1">
                      <Crown size={12} /> Founding Member
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">Lifetime Access</span>
                </div>
                <p className="text-2xl font-serif text-foreground font-bold">$99 <span className="text-sm font-sans font-normal text-muted-foreground">one-time</span></p>
                <p className="text-xs text-muted-foreground mt-1">All tools, unlimited sessions, priority support, early access to new features</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {["Unlimited Sessions", "All Tools", "Priority Support", "Early Access"].map(f => (
                    <span key={f} className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium" data-testid={`text-plan-feature-${f.toLowerCase().replace(/\s+/g, "-")}`}>
                      <Check size={10} /> {f}
                    </span>
                  ))}
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6 md:p-8" hoverEffect={false}>
              <SectionHeader icon={CreditCard} title="Payment Method" />
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
                  <span className="text-[10px] text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full">Default</span>
                </div>
              )}
              <p className="text-[11px] text-muted-foreground/60 mt-3">To update your payment method, contact support or use the Stripe customer portal.</p>
            </GlassCard>

            <GlassCard className="p-6 md:p-8" hoverEffect={false}>
              <button onClick={() => setShowInvoices(!showInvoices)} className="w-full flex items-center gap-3 cursor-pointer" data-testid="button-toggle-invoices">
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
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
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
          </div>
        );

      case "team":
        return (
          <div className="space-y-5">
            <GlassCard className="p-6 md:p-8" hoverEffect={false}>
              <div className="flex items-center justify-between mb-6">
                <SectionHeader icon={Users} title="Team Members" subtitle={`${MOCK_ORG_MEMBERS.length} members`} />
                <button
                  onClick={() => setShowInvite(!showInvite)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-accent hover:bg-accent/10 transition-all cursor-pointer active:scale-95 border border-accent/20"
                  data-testid="button-invite-member"
                >
                  <UserPlus size={14} /> Invite
                </button>
              </div>

              <AnimatePresence>
                {showInvite && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                    <div className="p-4 rounded-xl bg-accent/5 border border-accent/15 mb-4 space-y-3">
                      <div>
                        <label className={labelClass}>Email Address</label>
                        <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="colleague@practice.com" className={inputClass} data-testid="input-invite-email" />
                      </div>
                      <div>
                        <label className={labelClass}>Role</label>
                        <div className="flex gap-2">
                          {(["clinician", "admin"] as const).map(role => (
                            <button
                              key={role}
                              onClick={() => setInviteRole(role)}
                              className={cn(
                                "flex-1 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer capitalize",
                                inviteRole === role
                                  ? "bg-accent/15 text-accent border border-accent/30"
                                  : "bg-secondary/20 text-muted-foreground border border-border/30"
                              )}
                              data-testid={`button-role-${role}`}
                            >
                              {role}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={handleInvite} className="flex-1 px-4 py-2.5 rounded-xl text-xs font-medium bg-primary text-primary-foreground cursor-pointer active:scale-95 transition-all" data-testid="button-send-invite">
                          <Mail size={12} className="inline mr-1" /> Send Invitation
                        </button>
                        <button onClick={() => setShowInvite(false)} className="px-4 py-2.5 rounded-xl text-xs font-medium text-muted-foreground bg-secondary/30 border border-border/30 cursor-pointer active:scale-95 transition-all">
                          Cancel
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                {MOCK_ORG_MEMBERS.map((member, i) => (
                  <motion.div key={member.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                    <button
                      onClick={() => setExpandedMember(expandedMember === member.id ? null : member.id)}
                      className="w-full text-left p-3 rounded-xl bg-secondary/10 border border-border/20 hover:bg-secondary/25 transition-all cursor-pointer group"
                      data-testid={`card-member-${member.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                          <span className="text-sm font-serif font-bold text-foreground">{member.avatarInitial}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground truncate">{member.name}</span>
                            <RoleBadge role={member.role} />
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                        </div>
                        <motion.div animate={{ rotate: expandedMember === member.id ? 90 : 0 }} transition={{ duration: 0.2 }}>
                          <ChevronRight size={14} className="text-muted-foreground/40" />
                        </motion.div>
                      </div>
                    </button>

                    <AnimatePresence>
                      {expandedMember === member.id && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
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
                                  <span key={perm} className="px-2 py-0.5 rounded-full text-[10px] bg-primary/5 text-primary/60">{perm}</span>
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

      case "security":
        return (
          <div className="space-y-5">
            <GlassCard className="p-6 md:p-8" hoverEffect={false}>
              <SectionHeader icon={KeyRound} title="Password" />
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
              <SectionHeader icon={Shield} title="Two-Factor Authentication" />
              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Shield size={16} className="text-amber-400" />
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
              <button onClick={() => setShowDevices(!showDevices)} className="w-full flex items-center gap-3 cursor-pointer" data-testid="button-toggle-devices">
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
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
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
                                  <span className="text-[10px] text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full">This device</span>
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
          </div>
        );

      case "privacy":
        return (
          <div className="space-y-5">
            <GlassCard className="p-6 md:p-8" hoverEffect={false}>
              <SectionHeader icon={Shield} title="Protected Health Information" />
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
              <SectionHeader icon={Download} title="Export Your Data" />
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
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-destructive/5 border border-destructive/20 space-y-4">
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
                    <label className={labelClass}>Type DELETE to confirm</label>
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
          </div>
        );

      default:
        return null;
    }
  };

  if (!activeSection) {
    return (
      <div className="min-h-screen bg-background pb-24 md:pb-12 pt-16 md:pt-18">
        <div className="max-w-2xl mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center gap-4 pt-4 md:pt-6 pb-6">
              <div className="w-11 h-11 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/15 flex items-center justify-center shadow-sm">
                <span className="text-sm md:text-base font-serif font-bold text-primary">{initials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg md:text-xl font-serif text-foreground tracking-tight" data-testid="text-settings-title">Settings</h1>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{displayName} &middot; {user?.email || ""}</p>
              </div>
            </div>

            <div className="space-y-2">
              {SECTIONS.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link href={`/settings/${s.id}`}>
                    <div
                      className="flex items-center gap-4 p-4 rounded-2xl bg-card/60 border border-border/30 hover:bg-card hover:border-border/50 hover:shadow-sm transition-all cursor-pointer group"
                      data-testid={`nav-${s.id}`}
                    >
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br", s.color)}>
                        <s.icon size={18} className={s.iconColor} strokeWidth={1.8} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{s.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{s.subtitle}</p>
                      </div>
                      <ChevronRight size={16} className="text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors shrink-0" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            <p className="text-[10px] text-muted-foreground/30 text-center mt-8 tracking-wide">ClinicalPlay v1.0</p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-12 pt-16 md:pt-18">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex gap-8">
            <aside className="hidden md:block w-52 shrink-0">
              <div className="sticky top-24 space-y-0.5">
                {SECTIONS.map((s) => {
                  const isActive = activeSection === s.id;
                  return (
                    <Link key={s.id} href={`/settings/${s.id}`}>
                      <div
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer text-left",
                          isActive
                            ? "bg-primary/8 text-primary"
                            : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                        )}
                        data-testid={`nav-${s.id}`}
                      >
                        <s.icon size={16} strokeWidth={isActive ? 2 : 1.5} />
                        {s.label}
                      </div>
                    </Link>
                  );
                })}
                <div className="h-px bg-border/40 my-3" />
                <p className="text-[10px] text-muted-foreground/40 tracking-wide px-3">ClinicalPlay v1.0</p>
              </div>
            </aside>

            <main className="flex-1 min-w-0">
              <div className="mb-6">
                <Link href="/settings">
                  <span className="md:hidden inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer mb-4">
                    <ArrowLeft size={16} /> Settings
                  </span>
                </Link>

                {currentSectionDef && (
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm bg-gradient-to-br", currentSectionDef.color)}>
                      <currentSectionDef.icon size={20} strokeWidth={1.8} className={currentSectionDef.iconColor} />
                    </div>
                    <div>
                      <h2 className="text-lg md:text-xl font-serif text-foreground tracking-tight">{currentSectionDef.label}</h2>
                      <p className="text-[11px] text-muted-foreground/70 mt-0.5">{currentSectionDef.subtitle}</p>
                    </div>
                  </div>
                )}
                <div className="mt-5 h-px bg-gradient-to-r from-border/60 via-border/30 to-transparent" />
              </div>

              {renderSectionContent()}
              <div className="h-20" />
            </main>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
