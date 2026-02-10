import { Navbar } from "@/components/layout/navbar";
import { GlassCard } from "@/components/ui/glass-card";
import { useAuth, createAuthFetch } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Save, User, Briefcase, Shield, Eye, EyeOff, CheckCircle2,
  Palette, Check, MapPin, Building2, Heart, Sparkles, SlidersHorizontal,
  FileText, Tag, ExternalLink, ChevronDown, X
} from "lucide-react";
import { Link } from "wouter";
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
  sessionName: string;
  toolName: string;
  date: string;
  tags: string[];
  type: "sandtray" | "breathing" | "feelings" | "narrative" | "values";
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
  { id: "a1", sessionName: "Tuesday Check-in", toolName: "Zen Sandtray", date: "2026-02-08T14:30:00Z", tags: ["attachment", "family"], type: "sandtray" },
  { id: "a2", sessionName: "Coping Skills Review", toolName: "Feeling Wheel", date: "2026-02-06T10:00:00Z", tags: ["emotional-regulation", "progress"], type: "feelings" },
  { id: "a3", sessionName: "Life Story Mapping", toolName: "Narrative Timeline", date: "2026-02-04T15:00:00Z", tags: ["trauma", "resilience"], type: "narrative" },
  { id: "a4", sessionName: "Values Exploration", toolName: "Values Card Sort", date: "2026-02-01T11:00:00Z", tags: ["identity", "transitions"], type: "values" },
  { id: "a5", sessionName: "Grounding Session", toolName: "Calm Breathing", date: "2026-01-28T09:00:00Z", tags: ["anxiety", "grounding"], type: "breathing" },
];

const TOOL_COLORS: Record<string, string> = {
  sandtray: "#D4AF37",
  breathing: "#2E8B57",
  feelings: "#E86C5D",
  narrative: "#0F52BA",
  values: "#7B52AB",
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

const STYLE_LABELS: Record<string, string[]> = {
  tone: ["Warm & Gentle", "Balanced", "Direct & Structured"],
  immersion: ["Minimal", "Moderate", "Fully Immersive"],
  humor: ["None", "Light & Occasional", "Playful"],
};

const inputClass = "w-full px-4 py-3 rounded-xl bg-secondary/30 border border-border/40 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all";
const labelClass = "text-xs font-semibold text-primary/60 uppercase tracking-[0.15em] block mb-2";

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
                    : "border-border/40 bg-secondary/20 hover:bg-secondary/40"
                }`}
              >
                <div className="flex -space-x-1.5 shrink-0">
                  <div className="w-6 h-6 rounded-full border-2 border-background shadow-sm" style={{ backgroundColor: preset.swatch }} />
                  <div className="w-6 h-6 rounded-full border-2 border-background shadow-sm" style={{ backgroundColor: preset.swatchSecondary }} />
                </div>
                <span className={`text-xs font-medium leading-tight ${isActive ? "text-primary" : "text-muted-foreground"}`}>
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

function StyleSlider({ label, value, onChange, labels }: { label: string; value: number; onChange: (v: number) => void; labels: string[] }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-primary">{label}</span>
        <span className="text-xs text-accent font-medium">{labels[value]}</span>
      </div>
      <div className="flex gap-1.5">
        {labels.map((l, i) => (
          <button
            key={i}
            onClick={() => onChange(i)}
            className={`flex-1 h-2.5 rounded-full transition-all cursor-pointer ${
              i <= value ? "bg-accent" : "bg-secondary/40"
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
                ? "bg-accent/15 text-accent border border-accent/30"
                : "bg-secondary/30 text-muted-foreground border border-border/30 hover:bg-secondary/50"
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function ProfilePreviewCard({ firstName, lastName, professionalTitle, clinicalSpecialty, pronouns, location, practiceName, modalities }: {
  firstName: string; lastName: string; professionalTitle: string; clinicalSpecialty: string;
  pronouns: string; location: string; practiceName: string; modalities: string[];
}) {
  const initials = `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "?";
  return (
    <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 border border-border/30">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, rgba(27,42,74,0.15), rgba(212,175,55,0.15))" }}>
          <span className="text-lg font-serif text-primary font-bold">{initials}</span>
        </div>
        <div className="min-w-0">
          <p className="text-base font-serif text-primary font-semibold truncate">
            {firstName || "First"} {lastName || "Last"}
            {professionalTitle && <span className="text-muted-foreground font-sans text-xs ml-1.5">{professionalTitle}</span>}
          </p>
          {pronouns && <p className="text-xs text-muted-foreground/70">{pronouns}</p>}
          {(practiceName || clinicalSpecialty) && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {practiceName}{practiceName && clinicalSpecialty ? " · " : ""}{clinicalSpecialty}
            </p>
          )}
          {location && (
            <p className="text-xs text-muted-foreground/60 flex items-center gap-1 mt-0.5">
              <MapPin size={10} /> {location}
            </p>
          )}
          {modalities.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {modalities.slice(0, 4).map(m => (
                <span key={m} className="px-2 py-0.5 rounded-full text-[10px] bg-accent/10 text-accent font-medium">{m}</span>
              ))}
              {modalities.length > 4 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-secondary/40 text-muted-foreground">+{modalities.length - 4}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, isLoading: authLoading, isAuthenticated, session } = useAuth();
  const { toast } = useToast();
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

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({ title: "Please sign in", description: "Please sign in to access your profile.", variant: "destructive" });
      setTimeout(() => { window.location.href = "/login"; }, 500);
    }
  }, [authLoading, isAuthenticated]);

  const { data: profile, isLoading: profileLoading } = useQuery<ProfileData>({
    queryKey: ["/api/profile"],
    queryFn: async () => {
      const res = await authFetch("/api/profile");
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
      const res = await authFetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
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
    toast({ title: "Profile updated", description: "Your changes have been saved." });
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

  const anyChanges = hasChanges || hasLocalChanges;

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/20">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center animate-pulse">
            <User size={24} className="text-accent" />
          </div>
          <p className="text-muted-foreground font-medium">Loading profile...</p>
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
          <div className="flex items-center gap-3 mb-8">
            <Link href="/dashboard" className="no-underline">
              <button className="p-2.5 rounded-xl hover:bg-secondary/50 transition-colors cursor-pointer">
                <ArrowLeft size={20} className="text-primary" />
              </button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-serif text-primary">Your Profile</h1>
              <p className="text-sm text-muted-foreground">Manage your clinician information, preferences, and style</p>
            </div>
          </div>

          {/* Profile Preview Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <p className="text-xs font-semibold text-primary/50 uppercase tracking-[0.15em] mb-2 flex items-center gap-1.5">
              <Eye size={12} /> Public Preview
            </p>
            <ProfilePreviewCard
              firstName={firstName}
              lastName={lastName}
              professionalTitle={professionalTitle}
              clinicalSpecialty={clinicalSpecialty}
              pronouns={localProfile.pronouns}
              location={localProfile.location}
              practiceName={localProfile.practiceName}
              modalities={localProfile.modalities}
            />
          </motion.div>

          <div className="space-y-6">
            {/* Section 1: Personal Information */}
            <GlassCard className="p-6 md:p-8" hoverEffect={false}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(27,42,74,0.1), rgba(212,175,55,0.1))" }}>
                  <User size={18} className="text-primary" />
                </div>
                <h2 className="font-serif text-lg text-primary">Personal Information</h2>
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
              </div>

              <div className="mt-4">
                <label className={labelClass}>Email</label>
                <div className="w-full px-4 py-3 rounded-xl bg-secondary/20 border border-border/30 text-muted-foreground text-sm">
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
                <p className="text-[11px] text-muted-foreground/60 mt-1 text-right">{localProfile.bio.length}/300</p>
              </div>
            </GlassCard>

            {/* Section 2: Professional Details */}
            <GlassCard className="p-6 md:p-8" hoverEffect={false}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(46,139,87,0.1), rgba(212,175,55,0.1))" }}>
                  <Briefcase size={18} style={{ color: "#2E8B57" }} />
                </div>
                <h2 className="font-serif text-lg text-primary">Professional Details</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Professional Title</label>
                  <input
                    type="text"
                    value={professionalTitle}
                    onChange={(e) => { setProfessionalTitle(e.target.value); handleChange(); }}
                    placeholder="e.g., LCSW, LMFT, PhD, PsyD"
                    className={`${inputClass} placeholder:text-muted-foreground/40`}
                  />
                  <p className="text-[11px] text-muted-foreground/60 mt-1">Your professional credential or license type</p>
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
            </GlassCard>

            {/* Section 3: Clinician Style */}
            <GlassCard className="p-6 md:p-8" hoverEffect={false}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(212,175,55,0.1), rgba(123,82,171,0.1))" }}>
                  <SlidersHorizontal size={18} style={{ color: "#7B52AB" }} />
                </div>
                <div>
                  <h2 className="font-serif text-lg text-primary">Clinician Style</h2>
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

                <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/20 border border-border/30">
                  <div className="flex items-center gap-3">
                    <Eye size={18} className="text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-primary">Show Progress Indicators to Clients</p>
                      <p className="text-xs text-muted-foreground">Display session progress bars and step counts</p>
                    </div>
                  </div>
                  <ToggleSwitch
                    enabled={localProfile.clinicianStyle.showProgress}
                    onToggle={() => updateStyle("showProgress", !localProfile.clinicianStyle.showProgress)}
                    color="bg-accent"
                  />
                </div>
              </div>

              <div className="mt-5 p-3 rounded-xl bg-accent/5 border border-accent/15">
                <p className="text-[11px] text-muted-foreground/80">
                  <Sparkles size={11} className="inline mr-1 text-accent" />
                  These style preferences shape the default feel of your sessions. You can adjust them on a per-session basis.
                </p>
              </div>
            </GlassCard>

            {/* Section 4: Theme & Appearance */}
            <GlassCard className="p-6 md:p-8" hoverEffect={false}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(212,175,55,0.1), rgba(139,92,246,0.1))" }}>
                  <Palette size={18} style={{ color: "#D4AF37" }} />
                </div>
                <h2 className="font-serif text-lg text-primary">Theme & Appearance</h2>
              </div>
              <ThemeSection />
            </GlassCard>

            {/* Section 5: Default Session Settings */}
            <GlassCard className="p-6 md:p-8" hoverEffect={false}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(15,82,186,0.1), rgba(212,175,55,0.1))" }}>
                  <Shield size={18} style={{ color: "#0F52BA" }} />
                </div>
                <h2 className="font-serif text-lg text-primary">Default Session Settings</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/20 border border-border/30">
                  <div className="flex items-center gap-3">
                    {defaultAnonymous ? <EyeOff size={18} className="text-purple-500" /> : <Eye size={18} className="text-muted-foreground" />}
                    <div>
                      <p className="text-sm font-medium text-primary">Anonymous Mode</p>
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

            {/* Section 6: Saved Artifacts */}
            <GlassCard className="p-6 md:p-8" hoverEffect={false}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(232,108,93,0.1), rgba(212,175,55,0.1))" }}>
                  <FileText size={18} style={{ color: "#E86C5D" }} />
                </div>
                <div>
                  <h2 className="font-serif text-lg text-primary">Saved Artifacts</h2>
                  <p className="text-xs text-muted-foreground">Recent session outputs and exports</p>
                </div>
              </div>

              <div className="space-y-2">
                {MOCK_ARTIFACTS.map((artifact, i) => (
                  <motion.div
                    key={artifact.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <button
                      onClick={() => setExpandedArtifact(expandedArtifact === artifact.id ? null : artifact.id)}
                      className="w-full text-left p-3 rounded-xl bg-secondary/15 border border-border/25 hover:bg-secondary/30 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${TOOL_COLORS[artifact.type]}15` }}
                        >
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: TOOL_COLORS[artifact.type] }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-primary truncate">{artifact.sessionName}</span>
                            <span className="text-[10px] text-muted-foreground/60 shrink-0">{artifact.toolName}</span>
                          </div>
                          <p className="text-xs text-muted-foreground/60">
                            {new Date(artifact.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </p>
                        </div>
                        <motion.div
                          animate={{ rotate: expandedArtifact === artifact.id ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown size={16} className="text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
                        </motion.div>
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
                              <ExternalLink size={11} /> View Full Artifact
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>

              {MOCK_ARTIFACTS.length === 0 && (
                <div className="text-center py-8">
                  <FileText size={28} className="text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground/60">No saved artifacts yet</p>
                  <p className="text-xs text-muted-foreground/40 mt-1">Session outputs will appear here as you use tools</p>
                </div>
              )}
            </GlassCard>

            {/* Save Button */}
            <motion.div
              className="flex gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <button
                onClick={handleSave}
                disabled={!anyChanges || updateProfile.isPending}
                className="flex-1 px-6 py-3.5 rounded-2xl text-white font-medium shadow-lg transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 border-2"
                style={{
                  background: anyChanges ? "linear-gradient(135deg, #2E8B57 0%, #256D47 100%)" : "#9ca3af",
                  borderColor: anyChanges ? "#D4AF37" : "transparent",
                  boxShadow: anyChanges ? "0 4px 16px rgba(46,139,87,0.2)" : "none",
                }}
              >
                {updateProfile.isPending ? (
                  <>Saving...</>
                ) : updateProfile.isSuccess && !anyChanges ? (
                  <><CheckCircle2 size={18} /> Saved</>
                ) : (
                  <><Save size={18} /> Save Changes</>
                )}
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
