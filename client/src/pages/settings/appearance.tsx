import { GlassCard } from "@/components/ui/glass-card";
import { useToast } from "@/hooks/use-toast";
import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Palette, Sparkles, Volume2, VolumeX, Eye,
  SlidersHorizontal, Check
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
  const { accentId, setAccentId } = useTheme();
  const [prefs, setPrefs] = useState<AccountPreferences>(getPreferences);
  const [style, setStyle] = useState<LocalStyleData>(getLocalStyle);

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
    <SettingsLayout title="Appearance" subtitle="Theme, style & display preferences" icon={Palette} iconColor="bg-accent/10 text-accent">
      <GlassCard className="p-6 md:p-8" hoverEffect={false}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center">
            <Palette size={18} className="text-accent" />
          </div>
          <h2 className="font-serif text-lg text-foreground">Color Palette</h2>
        </div>

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
                data-testid={`button-theme-${preset.id}`}
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
        <p className="text-[11px] text-muted-foreground/60 mt-3 px-1">
          Your theme preference is saved locally on this device
        </p>
      </GlassCard>

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
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center">
            <Sparkles size={18} className="text-accent" />
          </div>
          <h2 className="font-serif text-lg text-foreground">Experience</h2>
        </div>

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

        <p className="text-[11px] text-muted-foreground/60 mt-4 px-1">
          These preferences are saved locally on this device.
        </p>
      </GlassCard>
    </SettingsLayout>
  );
}
