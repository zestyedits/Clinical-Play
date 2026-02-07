import { Navbar } from "@/components/layout/navbar";
import { GlassCard } from "@/components/ui/glass-card";
import { useAuth, createAuthFetch } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Save, User, Briefcase, Shield, Eye, EyeOff, CheckCircle2, Palette, Check } from "lucide-react";
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

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  professionalTitle: string | null;
  clinicalSpecialty: string | null;
  defaultAnonymous: boolean;
  profileImageUrl: string | null;
}

function ThemeSection() {
  const { accentId, setAccentId } = useTheme();

  return (
    <div className="space-y-6">
      <div>
        <label className="text-xs font-semibold text-primary/60 uppercase tracking-[0.15em] block mb-3">Color Palette</label>
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
                data-testid={`button-accent-${preset.id}`}
              >
                <div className="flex -space-x-1.5 shrink-0">
                  <div
                    className="w-6 h-6 rounded-full border-2 border-background shadow-sm"
                    style={{ backgroundColor: preset.swatch }}
                  />
                  <div
                    className="w-6 h-6 rounded-full border-2 border-background shadow-sm"
                    style={{ backgroundColor: preset.swatchSecondary }}
                  />
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

export default function ProfilePage() {
  const { user, isLoading: authLoading, isAuthenticated, session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const authFetch = createAuthFetch(session?.access_token);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [professionalTitle, setProfessionalTitle] = useState("");
  const [clinicalSpecialty, setClinicalSpecialty] = useState("");
  const [defaultAnonymous, setDefaultAnonymous] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

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
      toast({ title: "Profile updated", description: "Your changes have been saved." });
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
  };

  const handleChange = () => setHasChanges(true);

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/20">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center animate-pulse">
            <span className="text-2xl">👤</span>
          </div>
          <p className="text-muted-foreground font-medium" data-testid="text-loading">Loading profile...</p>
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
              <button className="p-2.5 rounded-xl hover:bg-secondary/50 transition-colors cursor-pointer" data-testid="button-back-dashboard">
                <ArrowLeft size={20} className="text-primary" />
              </button>
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-serif text-primary" data-testid="text-profile-title">Your Profile</h1>
              <p className="text-sm text-muted-foreground">Manage your clinician information and preferences</p>
            </div>
          </div>

          <div className="space-y-6">
            <GlassCard className="p-6 md:p-8" hoverEffect={false}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(27,42,74,0.1), rgba(212,175,55,0.1))" }}>
                  <User size={18} className="text-primary" />
                </div>
                <h2 className="font-serif text-lg text-primary">Personal Information</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-primary/60 uppercase tracking-[0.15em] block mb-2">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => { setFirstName(e.target.value); handleChange(); }}
                    className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-border/40 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                    data-testid="input-first-name"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-primary/60 uppercase tracking-[0.15em] block mb-2">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => { setLastName(e.target.value); handleChange(); }}
                    className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-border/40 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                    data-testid="input-last-name"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="text-xs font-semibold text-primary/60 uppercase tracking-[0.15em] block mb-2">Email</label>
                <div className="w-full px-4 py-3 rounded-xl bg-secondary/20 border border-border/30 text-muted-foreground text-sm">
                  {profile?.email || user?.email || "—"}
                </div>
                <p className="text-[11px] text-muted-foreground/60 mt-1">Email cannot be changed here</p>
              </div>
            </GlassCard>

            <GlassCard className="p-6 md:p-8" hoverEffect={false}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(46,139,87,0.1), rgba(212,175,55,0.1))" }}>
                  <Briefcase size={18} style={{ color: "#2E8B57" }} />
                </div>
                <h2 className="font-serif text-lg text-primary">Professional Details</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-primary/60 uppercase tracking-[0.15em] block mb-2">Professional Title</label>
                  <input
                    type="text"
                    value={professionalTitle}
                    onChange={(e) => { setProfessionalTitle(e.target.value); handleChange(); }}
                    placeholder="e.g., LCSW, LMFT, PhD, PsyD"
                    className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-border/40 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all placeholder:text-muted-foreground/40"
                    data-testid="input-professional-title"
                  />
                  <p className="text-[11px] text-muted-foreground/60 mt-1">Your professional credential or license type</p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-primary/60 uppercase tracking-[0.15em] block mb-2">Clinical Specialty</label>
                  <select
                    value={clinicalSpecialty}
                    onChange={(e) => { setClinicalSpecialty(e.target.value); handleChange(); }}
                    className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-border/40 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all appearance-none cursor-pointer"
                    data-testid="select-clinical-specialty"
                  >
                    <option value="">Select your specialty...</option>
                    {SPECIALTY_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6 md:p-8" hoverEffect={false}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(212,175,55,0.1), rgba(139,92,246,0.1))" }}>
                  <Palette size={18} style={{ color: "#D4AF37" }} />
                </div>
                <h2 className="font-serif text-lg text-primary">Theme & Appearance</h2>
              </div>

              <ThemeSection />
            </GlassCard>

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
                    {defaultAnonymous ? (
                      <EyeOff size={18} className="text-purple-500" />
                    ) : (
                      <Eye size={18} className="text-muted-foreground" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-primary">Anonymous Mode</p>
                      <p className="text-xs text-muted-foreground">Start new sessions in anonymous mode by default</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setDefaultAnonymous(!defaultAnonymous); handleChange(); }}
                    className={`relative w-12 h-7 rounded-full transition-all cursor-pointer ${
                      defaultAnonymous ? "bg-purple-500" : "bg-secondary/60"
                    }`}
                    data-testid="toggle-default-anonymous"
                  >
                    <motion.div
                      className="absolute top-0.5 w-6 h-6 rounded-full bg-background shadow-md"
                      animate={{ left: defaultAnonymous ? 22 : 2 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    />
                  </button>
                </div>

                <p className="text-[11px] text-muted-foreground/60 px-1">
                  When enabled, all new sessions you create will have participant names hidden by default. You can always toggle this during a session.
                </p>
              </div>
            </GlassCard>

            <motion.div
              className="flex gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <button
                onClick={handleSave}
                disabled={!hasChanges || updateProfile.isPending}
                className="flex-1 px-6 py-3.5 rounded-2xl text-white font-medium shadow-lg transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 border-2"
                style={{
                  background: hasChanges ? "linear-gradient(135deg, #2E8B57 0%, #256D47 100%)" : "#9ca3af",
                  borderColor: hasChanges ? "#D4AF37" : "transparent",
                  boxShadow: hasChanges ? "0 4px 16px rgba(46,139,87,0.2)" : "none",
                }}
                data-testid="button-save-profile"
              >
                {updateProfile.isPending ? (
                  <>Saving...</>
                ) : updateProfile.isSuccess && !hasChanges ? (
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
