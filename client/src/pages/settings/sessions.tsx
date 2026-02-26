import { GlassCard } from "@/components/ui/glass-card";
import { useAuth, createAuthFetch } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Play, Eye, EyeOff, Save, CheckCircle2, FileText,
  ChevronDown, Tag, ExternalLink, ShieldAlert, Sparkles
} from "lucide-react";
import { SettingsLayout } from "./settings-layout";

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  professionalTitle: string | null;
  clinicalSpecialty: string | null;
  defaultAnonymous: boolean;
  profileImageUrl: string | null;
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
    <button onClick={onToggle} className={`relative w-12 h-7 rounded-full transition-all cursor-pointer ${enabled ? color : "bg-secondary/60"}`}>
      <div className="absolute top-0.5 w-6 h-6 rounded-full bg-background shadow-md transition-all duration-200" style={{ left: enabled ? 22 : 2 }} />
    </button>
  );
}

export default function SessionSettings() {
  const { session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const authFetch = createAuthFetch(session?.access_token);

  const [defaultAnonymous, setDefaultAnonymous] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
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
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workspace"] });
      setHasChanges(false);
      toast({ title: "Settings updated", description: "Your session defaults have been saved." });
    },
    onError: () => {
      toast({ title: "Update failed", description: "Please try again.", variant: "destructive" });
    },
  });

  const handleSave = () => {
    updateProfile.mutate({ defaultAnonymous });
  };

  return (
    <SettingsLayout title="Session Defaults" subtitle="Default session behavior & export history" icon={Play} iconColor="bg-gradient-to-br from-purple-500/15 to-purple-500/5 text-purple-600">
      <GlassCard className="p-6 md:p-8" hoverEffect={false}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 flex items-center justify-center">
            <Play size={18} className="text-purple-600" />
          </div>
          <h2 className="font-serif text-lg text-foreground">Default Behavior</h2>
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

        {MOCK_ARTIFACTS.length === 0 && (
          <div className="text-center py-8">
            <FileText size={28} className="text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground/60">No session exports yet</p>
            <p className="text-xs text-muted-foreground/40 mt-1">Session outputs will appear here as you use tools</p>
          </div>
        )}
      </GlassCard>

      {hasChanges && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <button
            onClick={handleSave}
            disabled={updateProfile.isPending}
            className="w-full btn-warm px-6 py-3.5 rounded-2xl bg-primary text-primary-foreground font-medium shadow-lg transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:bg-primary/90"
            data-testid="button-save-sessions"
          >
            {updateProfile.isPending ? <>Saving...</> : updateProfile.isSuccess && !hasChanges ? <><CheckCircle2 size={18} /> Saved</> : <><Save size={18} /> Save Changes</>}
          </button>
        </motion.div>
      )}
    </SettingsLayout>
  );
}
