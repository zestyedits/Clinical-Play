import { GlassCard } from "@/components/ui/glass-card";
import { useAuth, createAuthFetch } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "wouter";
import { getSupabase } from "@/lib/supabase";
import { useTheme, accentPresets } from "@/hooks/use-theme";
import {
  User, Briefcase, Palette, Play, Crown, Users, Shield, Lock,
  Save, CheckCircle2, Eye, EyeOff, ChevronRight, ChevronDown,
  ShieldAlert, Sparkles, SlidersHorizontal, Check, Volume2, VolumeX,
  CreditCard, Receipt, UserPlus, Clock, Zap, Smartphone, Monitor,
  Tablet, Mail, KeyRound, Download, Trash2, AlertTriangle,
  FileText, Tag, ExternalLink, Settings
} from "lucide-react";
import {
  MOCK_INVOICES, MOCK_PAYMENT_METHODS, MOCK_ORG_MEMBERS,
  MOCK_DEVICES, ROLE_PERMISSIONS, type DeviceSession
} from "@/lib/mock-data/billing-data";

const SECTIONS = [
  { id: "profile", label: "Profile", icon: User, color: "text-primary", bg: "from-primary/15 to-primary/5" },
  { id: "professional", label: "Professional", icon: Briefcase, color: "text-primary", bg: "from-primary/12 to-primary/4" },
  { id: "appearance", label: "Appearance", icon: Palette, color: "text-accent", bg: "from-accent/15 to-accent/5" },
  { id: "sessions", label: "Sessions", icon: Play, color: "text-purple-600", bg: "from-purple-500/15 to-purple-500/5" },
  { id: "billing", label: "Plan & Billing", icon: Crown, color: "text-amber-600", bg: "from-amber-500/15 to-amber-500/5" },
  { id: "team", label: "Team", icon: Users, color: "text-blue-600", bg: "from-blue-500/15 to-blue-500/5" },
  { id: "security", label: "Security", icon: Shield, color: "text-emerald-600", bg: "from-emerald-500/15 to-emerald-500/5" },
  { id: "privacy", label: "Data & Privacy", icon: Lock, color: "text-rose-500", bg: "from-rose-500/15 to-rose-500/5" },
] as const;

type SectionId = typeof SECTIONS[number]["id"];

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

const inputClass = "w-full px-4 py-3 rounded-xl bg-secondary/30 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all";
const labelClass = "text-xs font-semibold text-foreground/60 uppercase tracking-[0.15em] block mb-2";

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  professionalTitle: string | null;
  clinicalSpecialty: string | null;
  defaultAnonymous: boolean;
  profileImageUrl: string | null;
  themePreference?: string | null;
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

interface SavedArtifact {
  id: string;
  toolName: string;
  date: string;
  tags: string[];
  type: "volume-mixer";
}

const MOCK_ARTIFACTS: SavedArtifact[] = [
  { id: "a1", toolName: "Volume Mixer", date: "2026-02-08T14:30:00Z", tags: ["IFS", "parts-work"], type: "volume-mixer" },
];

function ToggleSwitch({ enabled, onToggle, color = "bg-primary" }: { enabled: boolean; onToggle: () => void; color?: string }) {
  return (
    <button onClick={onToggle} className={`relative w-12 h-7 rounded-full transition-all cursor-pointer shrink-0 ${enabled ? color : "bg-secondary/60"}`} data-testid="toggle-switch">
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
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer active:scale-95 ${
              isSelected
                ? "bg-primary/10 text-primary border border-primary/20"
                : "bg-secondary/30 text-muted-foreground border border-border hover:bg-secondary/50"
            }`}
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
            className={`flex-1 h-2.5 rounded-full transition-all cursor-pointer ${i <= value ? "bg-primary" : "bg-secondary/40"}`}
            title={l}
            data-testid={`slider-${label.toLowerCase().replace(/\s+/g, "-")}-${i}`}
          />
        ))}
      </div>
    </div>
  );
}

function PhiWarning({ text }: { text: string }) {
  return (
    <p className="flex items-start gap-1.5 mt-1.5 text-[11px] text-amber-600/70 leading-relaxed">
      <ShieldAlert size={11} className="shrink-0 mt-0.5" />
      <span>{text}</span>
    </p>
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

function SectionHeader({ icon: Icon, title, subtitle, color, bg, children }: { icon: React.ElementType; title: string; subtitle?: string; color: string; bg: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${bg} flex items-center justify-center shadow-sm`}>
          <Icon size={18} className={color} strokeWidth={1.8} />
        </div>
        <div>
          <h2 className="font-serif text-lg text-foreground tracking-tight">{title}</h2>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const { isLoading: authLoading, isAuthenticated, user, session, logout } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const authFetch = createAuthFetch(session?.access_token);
  const { accentId, setAccentId, initFromServer } = useTheme();

  const [activeSection, setActiveSection] = useState<SectionId>("profile");
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const isScrollingTo = useRef(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [professionalTitle, setProfessionalTitle] = useState("");
  const [clinicalSpecialty, setClinicalSpecialty] = useState("");
  const [defaultAnonymous, setDefaultAnonymous] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const [localProfile, setLocalProfile] = useState<LocalProfileData>(getLocalProfile);
  const [hasLocalChanges, setHasLocalChanges] = useState(false);
  const [showCredentials, setShowCredentials] = useState(getShowCredentials);

  const [prefs, setPrefs] = useState<AccountPreferences>(getPreferences);
  const [style, setStyle] = useState<LocalStyleData>(getLocalStyle);
  const [themeSavedId, setThemeSavedId] = useState<string | null>(null);
  const themeInitialized = useRef(false);

  const [showInvoices, setShowInvoices] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "clinician">("clinician");
  const [showInvite, setShowInvite] = useState(false);
  const [expandedMember, setExpandedMember] = useState<string | null>(null);

  const [resettingPassword, setResettingPassword] = useState(false);
  const [showDevices, setShowDevices] = useState(true);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTyped, setDeleteTyped] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const [expandedArtifact, setExpandedArtifact] = useState<string | null>(null);

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
      setHasChanges(false);
    }
  }, [profile]);

  useEffect(() => {
    if (profile?.themePreference && !themeInitialized.current) {
      initFromServer(profile.themePreference);
      themeInitialized.current = true;
    }
  }, [profile, initFromServer]);

  const updateProfile = useMutation({
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
      setHasChanges(false);
      toast({ title: "Settings saved", description: "Your changes have been applied." });
    },
    onError: () => {
      toast({ title: "Update failed", description: "Please try again.", variant: "destructive" });
    },
  });

  const handleSaveProfile = () => {
    updateProfile.mutate({
      firstName, lastName,
      professionalTitle: professionalTitle || null,
      clinicalSpecialty: clinicalSpecialty || null,
      defaultAnonymous,
    });
    if (hasLocalChanges) {
      saveLocalProfile(localProfile);
      setHasLocalChanges(false);
    }
  };

  const handleChange = () => setHasChanges(true);

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
    } catch {}
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

  const handleInvite = () => {
    if (!inviteEmail.includes("@")) {
      toast({ title: "Invalid email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }
    toast({ title: "Invitation sent", description: `Invite sent to ${inviteEmail} as ${inviteRole}.` });
    setInviteEmail("");
    setShowInvite(false);
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

  const scrollToSection = useCallback((id: SectionId) => {
    setActiveSection(id);
    const el = sectionRefs.current[id];
    if (el) {
      isScrollingTo.current = true;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => { isScrollingTo.current = false; }, 800);
    }
    const tabEl = document.querySelector(`[data-tab="${id}"]`);
    if (tabEl) {
      tabEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrollingTo.current) return;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("data-section") as SectionId;
            if (id) setActiveSection(id);
          }
        }
      },
      { rootMargin: "-100px 0px -60% 0px", threshold: 0.1 }
    );
    Object.values(sectionRefs.current).forEach(el => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [authLoading, isAuthenticated]);

  const anyChanges = hasChanges || hasLocalChanges;

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/15 to-accent/10 flex items-center justify-center">
            <Settings size={24} className="text-primary animate-pulse" />
          </div>
          <p className="text-sm text-muted-foreground font-medium">Loading settings...</p>
        </div>
      </div>
    );
  }

  const initials = [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join("").toUpperCase() || "?";
  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Clinician";

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-12 pt-16 md:pt-18">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-center gap-4 pt-4 md:pt-6 pb-5">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/15 flex items-center justify-center shadow-sm">
              <span className="text-base md:text-lg font-serif font-bold text-primary">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl md:text-2xl font-serif text-foreground tracking-tight" data-testid="text-settings-title">{displayName}</h1>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{user?.email || ""}</p>
            </div>
          </div>

          {/* Mobile horizontal tabs */}
          <div ref={tabsRef} className="md:hidden -mx-4 px-4 pb-4 overflow-x-auto scrollbar-hide">
            <div className="flex gap-1.5 min-w-max">
              {SECTIONS.map((s) => (
                <button
                  key={s.id}
                  data-tab={s.id}
                  onClick={() => scrollToSection(s.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                    activeSection === s.id
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "bg-secondary/30 text-muted-foreground border border-border/40 hover:bg-secondary/50"
                  }`}
                  data-testid={`tab-${s.id}`}
                >
                  <s.icon size={14} />
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-8">
            {/* Desktop sidebar */}
            <aside className="hidden md:block w-56 shrink-0">
              <div className="sticky top-24 space-y-0.5">
                {SECTIONS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => scrollToSection(s.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer text-left ${
                      activeSection === s.id
                        ? "bg-primary/8 text-primary"
                        : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                    }`}
                    data-testid={`nav-${s.id}`}
                  >
                    <s.icon size={16} strokeWidth={activeSection === s.id ? 2 : 1.5} />
                    {s.label}
                  </button>
                ))}
                <div className="h-px bg-border/40 my-3" />
                <p className="text-[10px] text-muted-foreground/40 tracking-wide px-3">ClinicalPlay v1.0</p>
              </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 min-w-0 space-y-10" ref={scrollContainerRef}>

              {/* ========== PROFILE ========== */}
              <section ref={(el) => { sectionRefs.current.profile = el; }} data-section="profile" className="scroll-mt-28">
                <GlassCard className="p-6 md:p-8" hoverEffect={false}>
                  <SectionHeader icon={User} title="Personal Information" color="text-primary" bg="from-primary/12 to-primary/4" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>First Name</label>
                      <input type="text" value={firstName} onChange={(e) => { setFirstName(e.target.value); handleChange(); }} className={inputClass} data-testid="input-first-name" />
                    </div>
                    <div>
                      <label className={labelClass}>Last Name</label>
                      <input type="text" value={lastName} onChange={(e) => { setLastName(e.target.value); handleChange(); }} className={inputClass} data-testid="input-last-name" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className={labelClass}>Pronouns <span className="text-muted-foreground/50 normal-case font-normal">(optional)</span></label>
                      <select value={localProfile.pronouns} onChange={(e) => updateLocal({ pronouns: e.target.value })} className={`${inputClass} appearance-none cursor-pointer`} data-testid="select-pronouns">
                        <option value="">Select pronouns...</option>
                        {PRONOUN_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Location <span className="text-muted-foreground/50 normal-case font-normal">(optional)</span></label>
                      <input type="text" value={localProfile.location} onChange={(e) => updateLocal({ location: e.target.value })} placeholder="e.g., Portland, OR" className={`${inputClass} placeholder:text-muted-foreground/40`} data-testid="input-location" />
                      <PhiWarning text="This is your practice location, not a client's." />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className={labelClass}>Practice Name <span className="text-muted-foreground/50 normal-case font-normal">(optional)</span></label>
                    <input type="text" value={localProfile.practiceName} onChange={(e) => updateLocal({ practiceName: e.target.value })} placeholder="e.g., Willow Creek Counseling" className={`${inputClass} placeholder:text-muted-foreground/40`} data-testid="input-practice-name" />
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
                      className={`${inputClass} resize-none placeholder:text-muted-foreground/40`}
                      data-testid="input-bio"
                    />
                    <div className="flex items-center justify-between mt-1">
                      <PhiWarning text="Do not include client names, case details, or protected health information." />
                      <p className="text-[11px] text-muted-foreground/60 shrink-0 ml-3">{localProfile.bio.length}/300</p>
                    </div>
                  </div>
                </GlassCard>
              </section>

              {/* ========== PROFESSIONAL ========== */}
              <section ref={(el) => { sectionRefs.current.professional = el; }} data-section="professional" className="scroll-mt-28">
                <GlassCard className="p-6 md:p-8" hoverEffect={false}>
                  <SectionHeader icon={Briefcase} title="Professional Details" subtitle="Credentials for organization and peer verification" color="text-primary" bg="from-primary/12 to-primary/4">
                    <ToggleSwitch enabled={showCredentials} onToggle={handleToggleCredentials} />
                  </SectionHeader>

                  {!showCredentials && (
                    <button
                      onClick={handleToggleCredentials}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-secondary/15 border border-border hover:bg-secondary/30 transition-all cursor-pointer text-left"
                      data-testid="button-show-credentials"
                    >
                      <span className="text-sm text-muted-foreground">Enable to display professional credentials</span>
                      <ChevronRight size={16} className="text-muted-foreground/40" />
                    </button>
                  )}

                  <AnimatePresence>
                    {showCredentials && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                        <div className="space-y-4">
                          <div>
                            <label className={labelClass}>Professional Title</label>
                            <input type="text" value={professionalTitle} onChange={(e) => { setProfessionalTitle(e.target.value); handleChange(); }} placeholder="e.g., LCSW, LMFT, PhD, PsyD" className={`${inputClass} placeholder:text-muted-foreground/40`} data-testid="input-professional-title" />
                            <PhiWarning text="Your credential or license type only. No client information." />
                          </div>
                          <div>
                            <label className={labelClass}>Clinical Specialty</label>
                            <select value={clinicalSpecialty} onChange={(e) => { setClinicalSpecialty(e.target.value); handleChange(); }} className={`${inputClass} appearance-none cursor-pointer`} data-testid="select-specialty">
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
              </section>

              {/* ========== APPEARANCE ========== */}
              <section ref={(el) => { sectionRefs.current.appearance = el; }} data-section="appearance" className="scroll-mt-28 space-y-6">
                <GlassCard className="p-6 md:p-8" hoverEffect={false}>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/12 to-accent/4 flex items-center justify-center shadow-sm">
                        <Palette size={18} className="text-accent" strokeWidth={1.8} />
                      </div>
                      <h2 className="font-serif text-lg text-foreground tracking-tight">Color Palette</h2>
                    </div>
                    {themeSavedId && (
                      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-1 text-emerald-600 text-xs font-medium">
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
                          className={`relative flex items-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer active:scale-[0.97] ${
                            isActive
                              ? "border-primary bg-primary/6 shadow-md ring-1 ring-primary/15"
                              : "border-border/50 bg-card/80 hover:bg-card hover:border-border hover:shadow-sm"
                          }`}
                          data-testid={`button-theme-${preset.id}`}
                        >
                          <div className="flex -space-x-1 shrink-0">
                            <div className="w-8 h-8 rounded-full border-2 border-background shadow-sm" style={{ backgroundColor: preset.swatch }} />
                            <div className="w-8 h-8 rounded-full border-2 border-background shadow-sm" style={{ backgroundColor: preset.swatchSecondary }} />
                          </div>
                          <span className={`text-sm font-medium leading-tight text-left ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
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
                  <SectionHeader icon={SlidersHorizontal} title="Clinician Style" subtitle="These preferences set defaults for new sessions" color="text-primary" bg="from-primary/12 to-primary/4" />
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
                      <Sparkles size={11} className="inline mr-1 text-primary" />
                      These style preferences shape the default feel of your sessions. You can adjust them on a per-session basis.
                    </p>
                  </div>
                </GlassCard>

                <GlassCard className="p-6 md:p-8" hoverEffect={false}>
                  <SectionHeader icon={Sparkles} title="Experience" color="text-accent" bg="from-accent/12 to-accent/4" />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/15 border border-border/25">
                      <div className="flex items-center gap-3">
                        <Sparkles size={18} className="text-accent" />
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
              </section>

              {/* ========== SESSION DEFAULTS ========== */}
              <section ref={(el) => { sectionRefs.current.sessions = el; }} data-section="sessions" className="scroll-mt-28 space-y-6">
                <GlassCard className="p-6 md:p-8" hoverEffect={false}>
                  <SectionHeader icon={Play} title="Default Behavior" color="text-purple-600" bg="from-purple-500/15 to-purple-500/5" />
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/20 border border-border">
                      <div className="flex items-center gap-3">
                        {defaultAnonymous ? <EyeOff size={18} className="text-purple-500" /> : <Eye size={18} className="text-muted-foreground" />}
                        <div>
                          <p className="text-sm font-medium text-foreground">Anonymous Mode</p>
                          <p className="text-xs text-muted-foreground">Start new sessions in anonymous mode by default</p>
                        </div>
                      </div>
                      <ToggleSwitch enabled={defaultAnonymous} onToggle={() => { setDefaultAnonymous(!defaultAnonymous); setHasChanges(true); }} color="bg-purple-500" />
                    </div>
                    <p className="text-[11px] text-muted-foreground/60 px-1">
                      When enabled, all new sessions you create will have participant names hidden by default. You can always toggle this during a session.
                    </p>
                  </div>
                  <div className="mt-5 p-3 rounded-xl bg-purple-500/5 border border-purple-500/15">
                    <p className="text-[11px] text-muted-foreground/80">
                      <Sparkles size={11} className="inline mr-1 text-purple-500" />
                      More session defaults (tool preferences, timer settings) will be available as new tools are added.
                    </p>
                  </div>
                </GlassCard>

                <GlassCard className="p-6 md:p-8" hoverEffect={false}>
                  <SectionHeader icon={FileText} title="Session Exports" subtitle="Recent session outputs and exports" color="text-primary" bg="from-primary/8 to-primary/3" />
                  <div className="mb-4 p-3 rounded-xl bg-amber-50/60 border border-amber-200/40">
                    <p className="text-[11px] text-amber-700/70 flex items-start gap-1.5">
                      <ShieldAlert size={12} className="shrink-0 mt-0.5" />
                      <span>Exports are stored locally on this device. No client-identifying information is included.</span>
                    </p>
                  </div>
                  <div className="space-y-2">
                    {MOCK_ARTIFACTS.map((artifact, i) => {
                      const exportLabel = `Export #${i + 1}`;
                      return (
                        <div key={artifact.id}>
                          <button
                            onClick={() => setExpandedArtifact(expandedArtifact === artifact.id ? null : artifact.id)}
                            className="w-full text-left p-3 rounded-xl bg-secondary/15 border border-border hover:bg-secondary/30 transition-all cursor-pointer group"
                            data-testid={`button-export-${artifact.id}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center shrink-0">
                                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-foreground truncate">{exportLabel}</span>
                                  <span className="text-[10px] text-muted-foreground/60 shrink-0">{artifact.toolName}</span>
                                </div>
                                <p className="text-xs text-muted-foreground/60">
                                  {new Date(artifact.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                </p>
                              </div>
                              <div className="transition-transform duration-200" style={{ transform: expandedArtifact === artifact.id ? "rotate(180deg)" : "rotate(0deg)" }}>
                                <ChevronDown size={16} className="text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
                              </div>
                            </div>
                          </button>
                          <AnimatePresence>
                            {expandedArtifact === artifact.id && (
                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                                <div className="px-3 pt-2 pb-3 ml-11">
                                  <div className="flex flex-wrap gap-1.5 mb-2">
                                    {artifact.tags.map(tag => (
                                      <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] bg-primary/5 text-primary/60 flex items-center gap-1">
                                        <Tag size={8} /> {tag}
                                      </span>
                                    ))}
                                  </div>
                                  <button className="text-xs text-accent hover:text-accent/80 transition-colors flex items-center gap-1 cursor-pointer">
                                    <ExternalLink size={11} /> View Full Export
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </GlassCard>
              </section>

              {/* ========== PLAN & BILLING ========== */}
              <section ref={(el) => { sectionRefs.current.billing = el; }} data-section="billing" className="scroll-mt-28 space-y-6">
                <GlassCard className="p-6 md:p-8" hoverEffect={false}>
                  <SectionHeader icon={Crown} title="Your Plan" subtitle="Manage your subscription" color="text-accent" bg="from-accent/10 to-accent/3" />
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
                  <SectionHeader icon={CreditCard} title="Payment Method" color="text-primary" bg="from-primary/10 to-primary/3" />
                  {MOCK_PAYMENT_METHODS[0] && (
                    <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/15 border border-border/30">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-7 rounded bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                          <span className="text-white text-[9px] font-bold">{MOCK_PAYMENT_METHODS[0].brand.toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground" data-testid="text-payment-card">
                            {MOCK_PAYMENT_METHODS[0].brand} ending in {MOCK_PAYMENT_METHODS[0].last4}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Expires {String(MOCK_PAYMENT_METHODS[0].expMonth).padStart(2, "0")}/{MOCK_PAYMENT_METHODS[0].expYear}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] text-emerald-600 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full">Default</span>
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
              </section>

              {/* ========== TEAM ========== */}
              <section ref={(el) => { sectionRefs.current.team = el; }} data-section="team" className="scroll-mt-28">
                <GlassCard className="p-6 md:p-8" hoverEffect={false}>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-secondary flex items-center justify-center">
                        <Users size={18} className="text-primary" />
                      </div>
                      <div>
                        <h2 className="font-serif text-lg text-foreground">Team Members</h2>
                        <p className="text-xs text-muted-foreground">{MOCK_ORG_MEMBERS.length} members</p>
                      </div>
                    </div>
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
                            <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="colleague@practice.com" className="w-full px-4 py-2.5 rounded-xl bg-secondary/30 border border-border/40 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all placeholder:text-muted-foreground/40" data-testid="input-invite-email" />
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
              </section>

              {/* ========== SECURITY ========== */}
              <section ref={(el) => { sectionRefs.current.security = el; }} data-section="security" className="scroll-mt-28 space-y-6">
                <GlassCard className="p-6 md:p-8" hoverEffect={false}>
                  <SectionHeader icon={KeyRound} title="Password" color="text-primary" bg="from-primary/10 to-primary/3" />
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
                  <SectionHeader icon={Shield} title="Two-Factor Authentication" color="text-primary" bg="from-primary/10 to-primary/3" />
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
              </section>

              {/* ========== DATA & PRIVACY ========== */}
              <section ref={(el) => { sectionRefs.current.privacy = el; }} data-section="privacy" className="scroll-mt-28 space-y-6">
                <GlassCard className="p-6 md:p-8" hoverEffect={false}>
                  <SectionHeader icon={Shield} title="Protected Health Information" color="text-primary" bg="from-primary/10 to-primary/3" />
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
                  <SectionHeader icon={Download} title="Export Your Data" color="text-primary" bg="from-primary/10 to-primary/3" />
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
                  <SectionHeader icon={Trash2} title="Delete Account" color="text-destructive" bg="from-red-500/10 to-red-500/5" />
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
                        <label className="text-xs font-semibold text-foreground/60 uppercase tracking-[0.15em] block mb-2">Type DELETE to confirm</label>
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
              </section>

              <div className="h-8" />
            </main>
          </div>

          {/* Floating save bar */}
          <AnimatePresence>
            {anyChanges && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50"
              >
                <button
                  onClick={handleSaveProfile}
                  disabled={updateProfile.isPending}
                  className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-primary text-primary-foreground font-medium shadow-xl hover:shadow-2xl transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 active:scale-[0.97]"
                  data-testid="button-save-settings"
                >
                  {updateProfile.isPending ? (
                    <>Saving...</>
                  ) : (
                    <><Save size={16} strokeWidth={1.8} /> Save Changes</>
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
