import { GlassCard } from "@/components/ui/glass-card";
import { useAuth, createAuthFetch } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft, Save, User, Briefcase, Shield, Eye, EyeOff, CheckCircle2,
  Palette, Check, Heart, Sparkles, SlidersHorizontal,
  FileText, Tag, ExternalLink, ChevronDown, ShieldAlert, ChevronRight
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useTheme, accentPresets } from "@/hooks/use-theme";

const SPECIALTY_OPTIONS = [
  "General Practice",
  "Child & Adolescent",
  "Trauma & PTSD",
  "Anxiety & Depression",
  "Family Therapy",
  "Couples Therapy",
  "Play Therapy",
  "Art Therapy",
  "Behavioral Health",
  "Substance Abuse",
  "Grief & Loss",
  "Neuropsychology",
  "School Counseling",
  "Other",
];

const PRONOUN_OPTIONS = [
  "she/her",
  "he/him",
  "they/them",
  "she/they",
  "he/they",
  "ze/zir",
  "Prefer not to say",
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

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  professionalTitle: string | null;
  clinicalSpecialty: string | null;
  defaultAnonymous: boolean;
  profileImageUrl: string | null;
}

interface LocalProfileData {
  pronouns: string;
  location: string;
  practiceName: string;
  bio: string;
  modalities: string[];
  populations: string[];
  clinicianStyle: {
    tone: number;
    immersion: number;
    humor: number;
    showProgress: boolean;
  };
}

interface SavedArtifact {
  id: string;
  toolName: string;
  date: string;
  tags: string[];
  type: "volume-mixer";
}

const DEFAULT_LOCAL_PROFILE: LocalProfileData = {
  pronouns: "",
  location: "",
  practiceName: "",
  bio: "",
  modalities: [],
  populations: [],
  clinicianStyle: {
    tone: 2,
    immersion: 2,
    humor: 1,
    showProgress: true,
  },
};

const MOCK_ARTIFACTS: SavedArtifact[] = [
  { id: "a1", toolName: "Volume Mixer", date: "2026-02-08T14:30:00Z", tags: ["IFS", "parts-work"], type: "volume-mixer" },
];

const TOOL_COLORS: Record<string, string> = {
  "volume-mixer": "hsl(var(--accent))",
};

function getLocalProfile(): LocalProfileData {
  try {
    const stored = localStorage.getItem("cp-local-profile");
    if (stored) return { ...DEFAULT_LOCAL_PROFILE, ...JSON.parse(stored) };
  } catch {}
  return { ...DEFAULT_LOCAL_PROFILE };
}

function saveLocalProfile(data: LocalProfileData) {
  try { localStorage.setItem("cp-local-profile", JSON.stringify(data)); } catch {}
}

function getShowCredentials(): boolean {
  try {
    return localStorage.getItem("cp-show-credentials") === "true";
  } catch {}
  return false;
}

function setShowCredentialsStorage(value: boolean) {
  try { localStorage.setItem("cp-show-credentials", value ? "true" : "false"); } catch {}
}

const STYLE_LABELS: Record<string, string[]> = {
  tone: ["Warm & Gentle", "Balanced", "Direct & Structured"],
  immersion: ["Minimal", "Moderate", "Fully Immersive"],
  humor: ["None", "Light & Occasional", "Playful"],
};

const inputClass = "w-full px-4 py-3 rounded-xl bg-secondary/30 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all";
const labelClass = "text-xs font-semibold text-foreground/60 uppercase tracking-[0.15em] block mb-2";

function PhiWarning({ text }: { text: string }) {
  return (
    <p className="flex items-start gap-1.5 mt-1.5 text-[11px] text-amber-600/70 leading-relaxed">
      <ShieldAlert size={11} className="shrink-0 mt-0.5" />
      <span>{text}</span>
    </p>
  );
}

function ThemeSection() {
  const { accentId, setAccentId } = useTheme();

  return (
    <div className="space-y-6">
      <div>
        <label className={labelClass}>Color Palette</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {accentPresets.map((preset) => {
            const isActive = accentId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => setAccentId(preset.id)}
                className={`relative flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer active:scale-95 ${
                  isActive
                    ? "border-accent bg-accent/8 shadow-sm ring-1 ring-accent/20"
                    : "border-border bg-secondary/20 hover:bg-secondary/40"
                }`}
              >
                <div className="flex -space-x-1.5 shrink-0">
                  <div className="w-6 h-6 rounded-full border-2 border-background shadow-sm" style={{ backgroundColor: preset.swatch }} />
                  <div className="w-6 h-6 rounded-full border-2 border-background shadow-sm" style={{ backgroundColor: preset.swatchSecondary }} />
                </div>
                <span className={`text-xs font-medium leading-tight ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                  {preset.name}
                </span>
                {isActive && (
                  <div className="absolute top-1.5 right-1.5">
                    <Check size={12} className="text-accent" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-muted-foreground/60 mt-2 px-1">
          Your theme preference is saved locally on this device
        </p>
      </div>
    </div>
  );
}

function ToggleSwitch({ enabled, onToggle, color = "bg-primary" }: { enabled: boolean; onToggle: () => void; color?: string }) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-12 h-7 rounded-full transition-all cursor-pointer ${enabled ? color : "bg-secondary/60"}`}
    >
      <div
        className="absolute top-0.5 w-6 h-6 rounded-full bg-background shadow-md transition-all duration-200"
        style={{ left: enabled ? 22 : 2 }}
      />
    </button>
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
            className={`flex-1 h-2.5 rounded-full transition-all cursor-pointer ${
              i <= value ? "bg-primary" : "bg-secondary/40"
            }`}
            title={l}
          />
        ))}
      </div>
    </div>
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
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

export default function WorkspacePage() {
  const { user, isLoading: authLoading, isAuthenticated, session } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const authFetch = createAuthFetch(session?.access_token);

  // Server-synced fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [professionalTitle, setProfessionalTitle] = useState("");
  const [clinicalSpecialty, setClinicalSpecialty] = useState("");
  const [defaultAnonymous, setDefaultAnonymous] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Local-only fields
  const [localProfile, setLocalProfile] = useState<LocalProfileData>(getLocalProfile);
  const [hasLocalChanges, setHasLocalChanges] = useState(false);
  const [expandedArtifact, setExpandedArtifact] = useState<string | null>(null);
  const [showCredentials, setShowCredentials] = useState(getShowCredentials);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [authLoading, isAuthenticated]);

  const { data: profile, isLoading: profileLoading } = useQuery<ProfileData>({
    queryKey: ["/api/workspace"],
    queryFn: async () => {
      const res = await authFetch("/api/workspace");
      if (!res.ok) throw new Error("Failed to fetch profile");
      return res.json();
    },
    enabled: isAuthenticated,
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
    },
    onError: () => {
      toast({ title: "Update failed", description: "Please try again.", variant: "destructive" });
    },
  });

  const handleSave = () => {
    updateProfile.mutate({
      firstName,
      lastName,
      professionalTitle: professionalTitle || null,
      clinicalSpecialty: clinicalSpecialty || null,
      defaultAnonymous,
    });
    if (hasLocalChanges) {
      saveLocalProfile(localProfile);
      setHasLocalChanges(false);
    }
    toast({ title: "Workspace updated", description: "Your changes have been saved." });
  };

  const handleChange = () => setHasChanges(true);

  const updateLocal = useCallback((updates: Partial<LocalProfileData>) => {
    setLocalProfile(prev => {
      const next = { ...prev, ...updates };
      return next;
    });
    setHasLocalChanges(true);
  }, []);

  const updateStyle = useCallback((key: keyof LocalProfileData["clinicianStyle"], value: number | boolean) => {
    setLocalProfile(prev => ({
      ...prev,
      clinicianStyle: { ...prev.clinicianStyle, [key]: value },
    }));
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
    setShowCredentialsStorage(next);
  }, [showCredentials]);

  const anyChanges = hasChanges || hasLocalChanges;

  if (authLoading || !isAuthenticated || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
            <SlidersHorizontal size={24} className="text-primary" />
          </div>
          <p className="text-muted-foreground font-medium">Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-10 pt-20 md:pt-24 px-4 md:px-8">
      <div className="max-w-2xl mx-auto">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <Link href="/dashboard" className="no-underline">
              <button className="p-2.5 rounded-xl hover:bg-secondary/50 transition-colors cursor-pointer">
                <ArrowLeft size={20} className="text-foreground" />
              </button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-serif text-foreground">Workspace</h1>
              <p className="text-sm text-muted-foreground">Manage your preferences, credentials, and session settings</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Section 1: Personal Information */}
            <GlassCard className="p-6 md:p-8" hoverEffect={false}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-primary/8 flex items-center justify-center">
                  <User size={18} className="text-primary" />
                </div>
                <h2 className="font-serif text-lg text-foreground">Personal Information</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => { setFirstName(e.target.value); handleChange(); }}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => { setLastName(e.target.value); handleChange(); }}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className={labelClass}>Pronouns <span className="text-muted-foreground/50 normal-case font-normal">(optional)</span></label>
                  <select
                    value={localProfile.pronouns}
                    onChange={(e) => updateLocal({ pronouns: e.target.value })}
                    className={`${inputClass} appearance-none cursor-pointer`}
                  >
                    <option value="">Select pronouns...</option>
                    {PRONOUN_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Location <span className="text-muted-foreground/50 normal-case font-normal">(optional)</span></label>
                  <input
                    type="text"
                    value={localProfile.location}
                    onChange={(e) => updateLocal({ location: e.target.value })}
                    placeholder="e.g., Portland, OR"
                    className={`${inputClass} placeholder:text-muted-foreground/40`}
                  />
                  <PhiWarning text="This is your practice location, not a client's." />
                </div>
              </div>

              <div className="mt-4">
                <label className={labelClass}>Practice Name <span className="text-muted-foreground/50 normal-case font-normal">(optional)</span></label>
                <input
                  type="text"
                  value={localProfile.practiceName}
                  onChange={(e) => updateLocal({ practiceName: e.target.value })}
                  placeholder="e.g., Willow Creek Counseling"
                  className={`${inputClass} placeholder:text-muted-foreground/40`}
                />
                <PhiWarning text="Do not enter client names or protected health information." />
              </div>

              <div className="mt-4">
                <label className={labelClass}>Email</label>
                <div className="w-full px-4 py-3 rounded-xl bg-secondary/20 border border-border text-muted-foreground text-sm">
                  {profile?.email || user?.email || "\u2014"}
                </div>
                <p className="text-[11px] text-muted-foreground/60 mt-1">Email cannot be changed here</p>
              </div>

              <div className="mt-4">
                <label className={labelClass}>Bio</label>
                <textarea
                  value={localProfile.bio}
                  onChange={(e) => updateLocal({ bio: e.target.value })}
                  placeholder="A brief description of your clinical approach and what brings you to ClinicalPlay..."
                  rows={3}
                  maxLength={300}
                  className={`${inputClass} resize-none placeholder:text-muted-foreground/40`}
                />
                <div className="flex items-center justify-between mt-1">
                  <PhiWarning text="Do not include client names, case details, or protected health information." />
                  <p className="text-[11px] text-muted-foreground/60 shrink-0 ml-3">{localProfile.bio.length}/300</p>
                </div>
              </div>
            </GlassCard>

            {/* Section 2: Professional Details — behind credentials toggle */}
            <GlassCard className="p-6 md:p-8" hoverEffect={false}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-primary/8 flex items-center justify-center">
                    <Briefcase size={18} className="text-primary" />
                  </div>
                  <div>
                    <h2 className="font-serif text-lg text-foreground">Professional Details</h2>
                    <p className="text-xs text-muted-foreground">Credentials for organization and peer verification</p>
                  </div>
                </div>
                <ToggleSwitch
                  enabled={showCredentials}
                  onToggle={handleToggleCredentials}
                  color="bg-primary"
                />
              </div>

              {!showCredentials && (
                <button
                  onClick={handleToggleCredentials}
                  className="mt-4 w-full flex items-center justify-between p-3 rounded-xl bg-secondary/15 border border-border hover:bg-secondary/30 transition-all cursor-pointer text-left"
                >
                  <span className="text-sm text-muted-foreground">
                    Enable to display professional credentials
                  </span>
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
                    <div className="space-y-4 mt-6">
                      <div>
                        <label className={labelClass}>Professional Title</label>
                        <input
                          type="text"
                          value={professionalTitle}
                          onChange={(e) => { setProfessionalTitle(e.target.value); handleChange(); }}
                          placeholder="e.g., LCSW, LMFT, PhD, PsyD"
                          className={`${inputClass} placeholder:text-muted-foreground/40`}
                        />
                        <PhiWarning text="Your credential or license type only. No client information." />
                      </div>

                      <div>
                        <label className={labelClass}>Clinical Specialty</label>
                        <select
                          value={clinicalSpecialty}
                          onChange={(e) => { setClinicalSpecialty(e.target.value); handleChange(); }}
                          className={`${inputClass} appearance-none cursor-pointer`}
                        >
                          <option value="">Select your specialty...</option>
                          {SPECIALTY_OPTIONS.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className={labelClass}>Therapeutic Modalities</label>
                        <MultiSelectChips
                          options={MODALITY_OPTIONS}
                          selected={localProfile.modalities}
                          onToggle={(item) => toggleArrayItem("modalities", item)}
                        />
                        <p className="text-[11px] text-muted-foreground/60 mt-2">Select all modalities you practice</p>
                      </div>

                      <div>
                        <label className={labelClass}>Populations Served</label>
                        <MultiSelectChips
                          options={POPULATION_OPTIONS}
                          selected={localProfile.populations}
                          onToggle={(item) => toggleArrayItem("populations", item)}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassCard>

            {/* Section 3: Clinician Style */}
            <GlassCard className="p-6 md:p-8" hoverEffect={false}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-primary/8 flex items-center justify-center">
                  <SlidersHorizontal size={18} className="text-primary" />
                </div>
                <div>
                  <h2 className="font-serif text-lg text-foreground">Clinician Style</h2>
                  <p className="text-xs text-muted-foreground">These preferences set defaults for new sessions</p>
                </div>
              </div>

              <div className="space-y-6">
                <StyleSlider
                  label="Session Tone"
                  value={localProfile.clinicianStyle.tone}
                  onChange={(v) => updateStyle("tone", v)}
                  labels={STYLE_LABELS.tone}
                />
                <StyleSlider
                  label="Immersion Level"
                  value={localProfile.clinicianStyle.immersion}
                  onChange={(v) => updateStyle("immersion", v)}
                  labels={STYLE_LABELS.immersion}
                />
                <StyleSlider
                  label="Humor"
                  value={localProfile.clinicianStyle.humor}
                  onChange={(v) => updateStyle("humor", v)}
                  labels={STYLE_LABELS.humor}
                />

                <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/20 border border-border">
                  <div className="flex items-center gap-3">
                    <Eye size={18} className="text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Show Progress Indicators to Clients</p>
                      <p className="text-xs text-muted-foreground">Display session progress bars and step counts</p>
                    </div>
                  </div>
                  <ToggleSwitch
                    enabled={localProfile.clinicianStyle.showProgress}
                    onToggle={() => updateStyle("showProgress", !localProfile.clinicianStyle.showProgress)}
                    color="bg-primary"
                  />
                </div>
              </div>

              <div className="mt-5 p-3 rounded-xl bg-primary/5 border border-primary/15">
                <p className="text-[11px] text-muted-foreground/80">
                  <Sparkles size={11} className="inline mr-1 text-primary" />
                  These style preferences shape the default feel of your sessions. You can adjust them on a per-session basis.
                </p>
              </div>
            </GlassCard>

            {/* Section 4: Theme & Appearance */}
            <GlassCard className="p-6 md:p-8" hoverEffect={false}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-primary/8 flex items-center justify-center">
                  <Palette size={18} className="text-primary" />
                </div>
                <h2 className="font-serif text-lg text-foreground">Theme & Appearance</h2>
              </div>
              <ThemeSection />
            </GlassCard>

            {/* Section 5: Default Session Settings */}
            <GlassCard className="p-6 md:p-8" hoverEffect={false}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-primary/8 flex items-center justify-center">
                  <Shield size={18} className="text-primary" />
                </div>
                <h2 className="font-serif text-lg text-foreground">Default Session Settings</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/20 border border-border">
                  <div className="flex items-center gap-3">
                    {defaultAnonymous ? <EyeOff size={18} className="text-purple-500" /> : <Eye size={18} className="text-muted-foreground" />}
                    <div>
                      <p className="text-sm font-medium text-foreground">Anonymous Mode</p>
                      <p className="text-xs text-muted-foreground">Start new sessions in anonymous mode by default</p>
                    </div>
                  </div>
                  <ToggleSwitch
                    enabled={defaultAnonymous}
                    onToggle={() => { setDefaultAnonymous(!defaultAnonymous); handleChange(); }}
                    color="bg-purple-500"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground/60 px-1">
                  When enabled, all new sessions you create will have participant names hidden by default. You can always toggle this during a session.
                </p>
              </div>
            </GlassCard>

            {/* Section 6: Session Exports (renamed from Saved Artifacts) */}
            <GlassCard className="p-6 md:p-8" hoverEffect={false}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-primary/8 flex items-center justify-center">
                  <FileText size={18} className="text-primary" />
                </div>
                <div>
                  <h2 className="font-serif text-lg text-foreground">Session Exports</h2>
                  <p className="text-xs text-muted-foreground">Recent session outputs and exports</p>
                </div>
              </div>

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
                          <div
                            className="transition-transform duration-200"
                            style={{ transform: expandedArtifact === artifact.id ? "rotate(180deg)" : "rotate(0deg)" }}
                          >
                            <ChevronDown size={16} className="text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
                          </div>
                        </div>
                      </button>

                      <AnimatePresence>
                        {expandedArtifact === artifact.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
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

              {MOCK_ARTIFACTS.length === 0 && (
                <div className="text-center py-8">
                  <FileText size={28} className="text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground/60">No session exports yet</p>
                  <p className="text-xs text-muted-foreground/40 mt-1">Session outputs will appear here as you use tools</p>
                </div>
              )}
            </GlassCard>

            {/* Save Button */}
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={!anyChanges || updateProfile.isPending}
                className={`flex-1 btn-warm px-6 py-3.5 rounded-2xl text-primary-foreground font-medium shadow-lg transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                  anyChanges ? "bg-primary hover:bg-primary/90" : "bg-muted-foreground"
                }`}
              >
                {updateProfile.isPending ? (
                  <>Saving...</>
                ) : updateProfile.isSuccess && !anyChanges ? (
                  <><CheckCircle2 size={18} /> Saved</>
                ) : (
                  <><Save size={18} /> Save Changes</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
