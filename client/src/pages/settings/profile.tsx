import { GlassCard } from "@/components/ui/glass-card";
import { useAuth, createAuthFetch } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  User, Briefcase, Save, CheckCircle2, Eye, EyeOff,
  ChevronRight, ShieldAlert
} from "lucide-react";
import { SettingsLayout } from "./settings-layout";

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

function ToggleSwitch({ enabled, onToggle, color = "bg-primary" }: { enabled: boolean; onToggle: () => void; color?: string }) {
  return (
    <button onClick={onToggle} className={`relative w-12 h-7 rounded-full transition-all cursor-pointer ${enabled ? color : "bg-secondary/60"}`}>
      <div className="absolute top-0.5 w-6 h-6 rounded-full bg-background shadow-md transition-all duration-200" style={{ left: enabled ? 22 : 2 }} />
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

export default function ProfileSettings() {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const authFetch = createAuthFetch(session?.access_token);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [professionalTitle, setProfessionalTitle] = useState("");
  const [clinicalSpecialty, setClinicalSpecialty] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  const [localProfile, setLocalProfile] = useState<LocalProfileData>(getLocalProfile);
  const [hasLocalChanges, setHasLocalChanges] = useState(false);
  const [showCredentials, setShowCredentials] = useState(getShowCredentials);

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

  const anyChanges = hasChanges || hasLocalChanges;

  return (
    <SettingsLayout title="Profile" subtitle="Personal information & professional details" icon={User} iconColor="bg-primary/10 text-primary">
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
          <ToggleSwitch enabled={showCredentials} onToggle={handleToggleCredentials} />
        </div>

        {!showCredentials && (
          <button
            onClick={handleToggleCredentials}
            className="mt-4 w-full flex items-center justify-between p-3 rounded-xl bg-secondary/15 border border-border hover:bg-secondary/30 transition-all cursor-pointer text-left"
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
              <div className="space-y-4 mt-6">
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

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={!anyChanges || updateProfile.isPending}
          className={`flex-1 btn-warm px-6 py-3.5 rounded-2xl text-primary-foreground font-medium shadow-lg transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
            anyChanges ? "bg-primary hover:bg-primary/90" : "bg-muted-foreground"
          }`}
          data-testid="button-save-profile"
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
    </SettingsLayout>
  );
}
