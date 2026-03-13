import { GlassCard } from "@/components/ui/glass-card";
import { useAuth, createAuthFetch } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useState, useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Palette, SlidersHorizontal, Volume2, VolumeX, Eye, Info,
  Check, CheckCircle2
} from "lucide-react";
import { useTheme, accentPresets } from "@/hooks/use-theme";
import { SettingsLayout } from "./settings-layout";

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

interface LocalStyleData {
  tone: number;
  immersion: number;
  humor: number;
  showProgress: boolean;
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

const STYLE_LABELS: Record<string, string[]> = {
  tone: ["Warm & Gentle", "Balanced", "Direct & Structured"],
  immersion: ["Minimal", "Moderate", "Fully Immersive"],
  humor: ["None", "Light & Occasional", "Playful"],
};

function ToggleSwitch({ enabled, onToggle, color = "bg-primary" }: { enabled: boolean; onToggle: () => void; color?: string }) {
  return (
    <button onClick={onToggle} className={`relative w-12 h-7 rounded-full transition-all cursor-pointer ${enabled ? color : "bg-secondary/60"}`}>
      <motion.div className="absolute top-0.5 w-6 h-6 rounded-full bg-background shadow-md" animate={{ left: enabled ? 22 : 2 }} transition={{ type: "spring", stiffness: 400, damping: 25 }} />
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
            className={`flex-1 h-2.5 rounded-full transition-all cursor-pointer ${i <= value ? "bg-primary" : "bg-secondary/40"}`}
            title={l}
            data-testid={`slider-${label.toLowerCase().replace(/\s+/g, "-")}-${i}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function AppearanceSettings() {
  const { accentId, setAccentId, initFromServer } = useTheme();
  const { session } = useAuth();
  const { toast } = useToast();
  const authFetch = createAuthFetch(session?.access_token);
  const [prefs, setPrefs] = useState<AccountPreferences>(getPreferences);
  const [style, setStyle] = useState<LocalStyleData>(getLocalStyle);
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const hasInitialized = useRef(false);

  const { data: workspace } = useQuery<{ themePreference?: string }>({
    queryKey: ["/api/workspace"],
    queryFn: async () => {
      const res = await authFetch("/api/workspace");
      if (!res.ok) throw new Error("Failed to fetch workspace");
      return res.json();
    },
    enabled: !!session,
  });

  useEffect(() => {
    if (workspace?.themePreference && !hasInitialized.current) {
      initFromServer(workspace.themePreference);
      hasInitialized.current = true;
    }
  }, [workspace, initFromServer]);

  const handleThemeChange = useCallback(async (id: string) => {
    setAccentId(id);
    setSavedId(null);
    setSaving(true);
    try {
      const res = await authFetch("/api/workspace", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ themePreference: id }),
      });
      if (res.ok) {
        setSavedId(id);
        setTimeout(() => setSavedId(null), 2000);
      }
    } catch {} finally {
      setSaving(false);
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

  return (
    <SettingsLayout title="Appearance" subtitle="Theme, style & display preferences" icon={Palette} iconColor="bg-gradient-to-br from-accent/15 to-accent/5 text-accent">
      <GlassCard className="p-6 md:p-8" hoverEffect={false}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/12 to-accent/4 flex items-center justify-center shadow-sm">
            <Palette size={18} className="text-accent" strokeWidth={1.8} />
          </div>
          <div className="flex-1">
            <h2 className="font-serif text-lg text-foreground tracking-tight">Color Palette</h2>
          </div>
          {savedId && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1 text-emerald-600 text-xs font-medium"
            >
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
                <span className={`text-sm font-medium leading-tight ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                  {preset.name}
                </span>
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                  >
                    <Check size={12} className="text-primary-foreground" strokeWidth={2.5} />
                  </motion.div>
                )}
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-muted-foreground/60 mt-4 px-1">
          Your color palette is saved to your account and syncs across devices.
        </p>
      </GlassCard>

      <GlassCard className="p-6 md:p-8" hoverEffect={false}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/12 to-primary/4 flex items-center justify-center shadow-sm">
            <SlidersHorizontal size={18} className="text-primary" strokeWidth={1.8} />
          </div>
          <div>
            <h2 className="font-serif text-lg text-foreground tracking-tight">Clinician Style</h2>
            <p className="text-xs text-muted-foreground">These preferences set defaults for new sessions</p>
          </div>
        </div>

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
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/12 to-accent/4 flex items-center justify-center shadow-sm">
            <SlidersHorizontal size={18} className="text-accent" strokeWidth={1.8} />
          </div>
          <h2 className="font-serif text-lg text-foreground tracking-tight">Experience</h2>
        </div>

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

        <p className="text-[11px] text-muted-foreground/60 mt-4 px-1">
          These preferences are saved locally on this device.
        </p>
      </GlassCard>
    </SettingsLayout>
  );
}
