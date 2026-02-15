import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Wind, Type, VolumeX, Hash, MessageSquare, Circle, Gauge, BarChart3, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { playClickSound } from "@/lib/audio-feedback";
import { playThemedBreathSound } from "@/lib/audio-feedback";
import { ClinicianToolbar, type ToolbarControl } from "./clinician-toolbar";
import { getTechnique, getTotalCycle, type BreathingTechnique } from "@/lib/breathing-techniques";
import { BreathingTechniqueSelector } from "./breathing-technique-selector";
import { OceanWaves } from "./breathing-themes/ocean-waves";
import { BalloonRise } from "./breathing-themes/balloon-rise";
import { StarryNight } from "./breathing-themes/starry-night";
import { CampfireGlow } from "./breathing-themes/campfire-glow";
import { NorthernLights } from "./breathing-themes/northern-lights";
import type { BreathingThemeProps } from "./breathing-themes/types";

// ─── Guided Child Prompts ────────────────────────────────────────────────────

const CHILD_PROMPTS: Record<string, string[]> = {
  inhale: [
    "Smell the flowers...",
    "Fill up like a balloon...",
    "Breathe in the calm...",
    "Imagine warm sunshine...",
    "Drink in the fresh air...",
  ],
  hold: [
    "Hold it gently...",
    "Like a pause button...",
    "Keep it inside...",
    "Stay nice and still...",
    "Feel it warm you up...",
  ],
  exhale: [
    "Blow out the candles...",
    "Let it all go...",
    "Slowly like a whisper...",
    "Melt like warm butter...",
    "Release like a balloon...",
  ],
  rest: [
    "Be still...",
    "Feel the quiet...",
    "Nice and easy...",
    "Float gently...",
    "Just be...",
  ],
};

// ─── Session Statistics Helpers ──────────────────────────────────────────────

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function computeCoherenceScore(cycleTimes: number[]): number {
  if (cycleTimes.length < 2) return 100;
  const mean = cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length;
  if (mean === 0) return 100;
  const variance =
    cycleTimes.reduce((acc, t) => acc + (t - mean) ** 2, 0) / cycleTimes.length;
  const stdDev = Math.sqrt(variance);
  const cv = stdDev / mean;
  return Math.max(0, Math.min(100, Math.round((1 - cv * 5) * 100)));
}

// ─── Mini Waveform SVG ──────────────────────────────────────────────────────

function BreathWaveform({ cycleTimes, maxCycles = 8, color }: { cycleTimes: number[]; maxCycles?: number; color: string }) {
  const last = cycleTimes.slice(-maxCycles);
  if (last.length === 0) return null;
  const width = 120;
  const height = 32;
  const padding = 2;
  const maxTime = Math.max(...last);
  const minTime = Math.min(...last);
  const range = maxTime - minTime || 1;

  const points = last.map((t, i) => {
    const x = padding + (i / Math.max(last.length - 1, 1)) * (width - padding * 2);
    const normalized = (t - minTime) / range;
    const y = height - padding - normalized * (height - padding * 2);
    return `${x},${y}`;
  });

  const pathData =
    last.length === 1
      ? `M ${padding},${height / 2} L ${width - padding},${height / 2}`
      : `M ${points.join(" L ")}`;

  return (
    <svg width={width} height={height} className="opacity-80">
      <path d={pathData} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {last.map((_, i) => {
        const x = padding + (i / Math.max(last.length - 1, 1)) * (width - padding * 2);
        const normalized = (last[i] - minTime) / range;
        const y = height - padding - normalized * (height - padding * 2);
        return <circle key={i} cx={x} cy={y} r={2} fill={color} opacity={0.9} />;
      })}
    </svg>
  );
}

// ─── Session Statistics Panel ────────────────────────────────────────────────

function SessionStatsPanel({
  cycleCount,
  elapsed,
  techniqueName,
  coherenceScore,
  cycleTimes,
  phaseColor,
}: {
  cycleCount: number;
  elapsed: number;
  techniqueName: string;
  coherenceScore: number;
  cycleTimes: number[];
  phaseColor: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute top-3 left-3 z-20 pointer-events-auto"
    >
      <button
        onClick={() => {
          playClickSound();
          setIsOpen((v) => !v);
        }}
        className="min-h-[44px] flex items-center gap-2 px-3 py-2 rounded-xl bg-[#1B2A4A]/80 backdrop-blur-xl border border-white/10 text-white/80 text-xs font-medium hover:bg-[#1B2A4A]/95 transition-all cursor-pointer"
      >
        <BarChart3 size={14} />
        <span>Session Stats</span>
        {isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 8 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="overflow-hidden rounded-xl bg-[#1B2A4A]/90 backdrop-blur-xl border border-white/10 shadow-2xl"
          >
            <div className="p-3 space-y-2.5 min-w-[180px]">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-white/40 uppercase tracking-wider">Breaths</span>
                <span className="text-xs text-white/90 font-medium">{cycleCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-white/40 uppercase tracking-wider">Duration</span>
                <span className="text-xs text-white/90 font-medium font-mono">{formatDuration(elapsed)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-white/40 uppercase tracking-wider">Technique</span>
                <span className="text-xs text-white/90 font-medium">{techniqueName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-white/40 uppercase tracking-wider">Coherence</span>
                <span
                  className={cn(
                    "text-xs font-bold",
                    coherenceScore >= 80
                      ? "text-emerald-400"
                      : coherenceScore >= 50
                        ? "text-amber-400"
                        : "text-rose-400"
                  )}
                >
                  {coherenceScore}%
                </span>
              </div>
              {cycleTimes.length > 0 && (
                <div className="pt-1 border-t border-white/10">
                  <span className="text-[10px] text-white/40 uppercase tracking-wider block mb-1">
                    Breath Pattern
                  </span>
                  <BreathWaveform cycleTimes={cycleTimes} color={phaseColor} />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Breathing Pace Ring ─────────────────────────────────────────────────────

function BreathPaceRing({
  phaseProgress,
  phaseType,
  technique,
  isActive,
}: {
  phaseProgress: number;
  phaseType: string;
  technique: BreathingTechnique;
  isActive: boolean;
}) {
  const size = 180;
  const strokeWidth = 3;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference * (1 - phaseProgress);

  const color = getPhaseColor(technique, phaseType);

  const scale =
    phaseType === "inhale"
      ? 0.85 + phaseProgress * 0.15
      : phaseType === "exhale"
        ? 1.0 - phaseProgress * 0.15
        : phaseType === "hold"
          ? 1.0
          : 0.85;

  if (!isActive) return null;

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ width: size, height: size }}
      animate={{ scale }}
      transition={{ duration: 0.15, ease: "linear" }}
    >
      {/* Glow layer */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{
          boxShadow: `0 0 ${20 + phaseProgress * 15}px ${color}30, inset 0 0 ${10 + phaseProgress * 10}px ${color}15`,
        }}
        transition={{ duration: 0.15, ease: "linear" }}
      />
      <svg width={size} height={size} className="absolute inset-0">
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`${color}20`}
          strokeWidth={strokeWidth}
        />
        {/* Progress ring */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={progressOffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          animate={{ stroke: color }}
          transition={{ duration: 0.5 }}
          opacity={0.8}
        />
      </svg>
    </motion.div>
  );
}

// ─── Session Completion Celebration ──────────────────────────────────────────

function CelebrationOverlay({
  cycleCount,
  techniqueEmoji,
  onComplete,
}: {
  cycleCount: number;
  techniqueEmoji: string;
  onComplete: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const sparkles = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 0.5,
        size: 4 + Math.random() * 8,
        duration: 0.8 + Math.random() * 0.6,
      })),
    []
  );

  return (
    <motion.div
      className="absolute inset-0 z-40 flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Sparkle particles */}
      {sparkles.map((s) => (
        <motion.div
          key={s.id}
          className="absolute text-yellow-300"
          style={{ left: `${s.x}%`, top: `${s.y}%` }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 1, 0],
            scale: [0, 1.2, 1, 0],
            y: [0, -30],
          }}
          transition={{
            duration: s.duration,
            delay: s.delay,
            ease: "easeOut",
          }}
        >
          <Sparkles size={s.size} />
        </motion.div>
      ))}

      {/* Celebration message */}
      <motion.div
        className="text-center z-10 px-4"
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -10 }}
        transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          className="text-5xl mb-4"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {techniqueEmoji}
        </motion.div>
        <h2 className="font-display text-2xl md:text-3xl text-white tracking-tight mb-2">
          Great job!
        </h2>
        <p className="text-white/70 text-sm md:text-base">
          You completed {cycleCount} breath{cycleCount !== 1 ? "s" : ""}
        </p>
      </motion.div>

      {/* Fade overlay that grows over 2s */}
      <motion.div
        className="absolute inset-0 bg-black/60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1.0 }}
      />
    </motion.div>
  );
}

// ─── Clinician Toolbar Settings ──────────────────────────────────────────────

interface BreathingGuideSettings {
  showPhaseText: boolean;
  muteSounds: boolean;
  cycleLimit: number;
  showGuidancePrompts: boolean;
  showBreathRing: boolean;
  paceMultiplier: number;
}

const DEFAULT_BREATHING_GUIDE_SETTINGS: BreathingGuideSettings = {
  showPhaseText: true,
  muteSounds: false,
  cycleLimit: 0,
  showGuidancePrompts: true,
  showBreathRing: true,
  paceMultiplier: 1,
};

const PACE_OPTIONS = [
  { value: 0.5, label: "0.5x Pace" },
  { value: 0.75, label: "0.75x Pace" },
  { value: 1, label: "1x Pace" },
  { value: 1.25, label: "1.25x Pace" },
  { value: 1.5, label: "1.5x Pace" },
];

const BREATHING_GUIDE_TOOLBAR_CONTROLS: ToolbarControl[] = [
  {
    type: "toggle",
    key: "showPhaseText",
    icon: Type,
    label: "Phase Text",
    activeColor: "sky",
  },
  {
    type: "toggle",
    key: "muteSounds",
    icon: VolumeX,
    label: "Mute",
    activeLabel: "Muted",
    activeColor: "rose",
  },
  {
    type: "number",
    key: "cycleLimit",
    icon: Hash,
    label: "Cycle Limit",
    steps: [0, 3, 5, 8, 12],
    activeColor: "amber",
  },
  {
    type: "toggle",
    key: "showGuidancePrompts",
    icon: MessageSquare,
    label: "Guidance Prompts",
    activeColor: "emerald",
  },
  {
    type: "toggle",
    key: "showBreathRing",
    icon: Circle,
    label: "Breath Ring",
    activeColor: "cyan",
  },
  {
    type: "cycle",
    key: "paceMultiplier",
    icon: Gauge,
    options: PACE_OPTIONS,
    label: "Pace",
    activeColor: "purple",
    showBadge: false,
  },
];

interface BreathingGuideProps {
  isActive: boolean;
  isClinician: boolean;
  onToggle: () => void;
  startTime?: number | null;
  techniqueId: string;
  onTechniqueChange: (id: string) => void;
  toolSettings?: Record<string, any>;
  onSettingsUpdate?: (updates: Record<string, any>) => void;
}

const THEMES: Record<string, React.ComponentType<BreathingThemeProps>> = {
  "ocean-waves": OceanWaves,
  "balloon-rise": BalloonRise,
  "starry-night": StarryNight,
  "campfire-glow": CampfireGlow,
  "northern-lights": NorthernLights,
};

export function BreathingGuide({ isActive, isClinician, onToggle, startTime, techniqueId, onTechniqueChange, toolSettings, onSettingsUpdate }: BreathingGuideProps) {
  const settings = { ...DEFAULT_BREATHING_GUIDE_SETTINGS, ...toolSettings } as BreathingGuideSettings;
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationCycleCount, setCelebrationCycleCount] = useState(0);

  // Track cycle completion timestamps for coherence scoring
  const cycleTimesRef = useRef<number[]>([]);
  const lastCycleTimestampRef = useRef<number>(0);
  const [cycleTimes, setCycleTimes] = useState<number[]>([]);

  // Track which prompt index to show per phase type
  const promptIndexRef = useRef(0);
  const [promptIndex, setPromptIndex] = useState(0);

  const technique = getTechnique(techniqueId);
  const paceMultiplier = settings.paceMultiplier || 1;

  // Compute scaled phases and total cycle based on pace multiplier
  const scaledPhases = useMemo(
    () =>
      technique.phases.map((p) => ({
        ...p,
        duration: p.duration / paceMultiplier,
      })),
    [technique.phases, paceMultiplier]
  );
  const totalCycle = useMemo(
    () => scaledPhases.reduce((sum, p) => sum + p.duration, 0),
    [scaledPhases]
  );

  const phases = scaledPhases;

  useEffect(() => {
    if (!isActive) {
      setPhaseIndex(0);
      setElapsed(0);
      setCycleCount(0);
      cycleTimesRef.current = [];
      lastCycleTimestampRef.current = 0;
      setCycleTimes([]);
      promptIndexRef.current = 0;
      setPromptIndex(0);
      return;
    }

    const initialElapsed = startTime ? Date.now() - startTime : 0;
    setElapsed(initialElapsed);
    setCycleCount(Math.floor(initialElapsed / totalCycle));
    lastCycleTimestampRef.current = Date.now();

    const interval = setInterval(() => {
      setElapsed(prev => {
        const next = prev + 50;
        const cyclePos = next % totalCycle;
        const newCycle = Math.floor(next / totalCycle);
        if (newCycle > Math.floor(prev / totalCycle)) {
          setCycleCount(newCycle);
          // Record cycle time for coherence
          const now = Date.now();
          if (lastCycleTimestampRef.current > 0) {
            const dt = now - lastCycleTimestampRef.current;
            cycleTimesRef.current = [...cycleTimesRef.current.slice(-7), dt];
            setCycleTimes([...cycleTimesRef.current]);
          }
          lastCycleTimestampRef.current = now;
          // Advance prompt index
          promptIndexRef.current = promptIndexRef.current + 1;
          setPromptIndex(promptIndexRef.current);
        }
        let acc = 0;
        for (let i = 0; i < phases.length; i++) {
          acc += phases[i].duration;
          if (cyclePos < acc) {
            setPhaseIndex(i);
            break;
          }
        }
        return next;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isActive, startTime, totalCycle, phases]);

  // Auto-stop when cycle limit is reached (with celebration)
  useEffect(() => {
    if (isActive && settings.cycleLimit > 0 && cycleCount >= settings.cycleLimit && !showCelebration) {
      setCelebrationCycleCount(cycleCount);
      setShowCelebration(true);
    }
  }, [isActive, cycleCount, settings.cycleLimit, showCelebration]);

  const handleCelebrationComplete = useCallback(() => {
    setShowCelebration(false);
    onToggle();
  }, [onToggle]);

  // Play themed sound on inhale/exhale transitions
  useEffect(() => {
    if (isActive && !settings.muteSounds) {
      const phase = phases[phaseIndex];
      if (phase && (phase.type === "inhale" || phase.type === "exhale")) {
        playThemedBreathSound(technique.audioTheme, phase.type);
      }
    }
  }, [isActive, phaseIndex, technique.audioTheme, phases, settings.muteSounds]);

  const currentPhase = phases[phaseIndex];

  const phaseProgress = useMemo(() => {
    let acc = 0;
    for (let i = 0; i < phaseIndex; i++) acc += phases[i].duration;
    const inPhase = (elapsed % totalCycle) - acc;
    return Math.max(0, Math.min(1, inPhase / currentPhase.duration));
  }, [elapsed, phaseIndex, currentPhase.duration, totalCycle, phases]);

  const phaseColor = getPhaseColor(technique, currentPhase.type);

  const coherenceScore = useMemo(() => computeCoherenceScore(cycleTimes), [cycleTimes]);

  // Get current child prompt for this phase type
  const currentPrompt = useMemo(() => {
    const prompts = CHILD_PROMPTS[currentPhase.type] || CHILD_PROMPTS.inhale;
    return prompts[promptIndex % prompts.length];
  }, [currentPhase.type, promptIndex]);

  // Use the unscaled original technique for theme (themes use their own timing logic)
  const originalTotalCycle = getTotalCycle(technique);
  const ThemeComponent = THEMES[technique.id] || OceanWaves;

  return (
    <div className="w-full h-full relative overflow-hidden select-none">
      {/* Layer 1: Full-screen theme background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={technique.id}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          <ThemeComponent
            technique={technique}
            isActive={isActive}
            phaseIndex={phaseIndex}
            phaseProgress={phaseProgress}
            elapsed={elapsed}
            totalCycle={originalTotalCycle}
          />
        </motion.div>
      </AnimatePresence>

      {/* Layer 2: Phase HUD overlay */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pb-28 md:pb-36 pointer-events-none">
        {/* Cycle counter */}
        <AnimatePresence>
          {isActive && cycleCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 mb-4"
            >
              <Wind size={12} className="text-white/50" />
              <span className="text-xs font-medium text-white/60 tracking-widest uppercase">
                Breath {cycleCount + 1}
                {settings.cycleLimit > 0 && ` / ${settings.cycleLimit}`}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Phase indicator dots */}
        {isActive && (
          <motion.div
            className="flex items-center gap-3 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {phases.map((phase, i) => (
              <motion.div
                key={`${phase.label}-${i}`}
                className="flex items-center gap-1.5"
                animate={{ opacity: i === phaseIndex ? 1 : 0.3 }}
                transition={{ duration: 0.4 }}
              >
                <motion.div
                  className="rounded-full"
                  style={{ backgroundColor: getPhaseColor(technique, phase.type) }}
                  animate={{
                    width: i === phaseIndex ? 24 : 6,
                    height: 6,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Breathing Pace Ring */}
        {isActive && settings.showBreathRing && (
          <div className="relative flex items-center justify-center mb-2">
            <BreathPaceRing
              phaseProgress={phaseProgress}
              phaseType={currentPhase.type}
              technique={technique}
              isActive={isActive}
            />
            {/* Spacer to reserve room for the ring so text doesn't overlap */}
            <div style={{ width: 180, height: 180 }} className="flex items-center justify-center">
              {/* Phase label inside ring */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={isActive ? `${currentPhase.label}-${phaseIndex}` : `idle-${technique.id}`}
                  initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="text-center"
                >
                  {settings.showPhaseText && (
                    <>
                      <motion.h2
                        className="font-display text-3xl md:text-4xl tracking-tight mb-1"
                        animate={{ color: phaseColor }}
                        transition={{ duration: 1 }}
                      >
                        {currentPhase.label}
                      </motion.h2>
                      <p className="text-white/50 text-xs">
                        {technique.name}
                      </p>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Phase label (when breath ring is hidden) */}
        {(!settings.showBreathRing || !isActive) && (
          <AnimatePresence mode="wait">
            <motion.div
              key={isActive ? `${currentPhase.label}-${phaseIndex}` : `idle-${technique.id}`}
              initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="text-center"
            >
              {isActive ? (
                <>
                  {settings.showPhaseText && (
                    <>
                      <motion.h2
                        className="font-display text-4xl md:text-5xl tracking-tight mb-1"
                        animate={{ color: phaseColor }}
                        transition={{ duration: 1 }}
                      >
                        {currentPhase.label}
                      </motion.h2>
                      <p className="text-white/50 text-sm">
                        {technique.name} — {technique.subtitle}
                      </p>
                    </>
                  )}
                </>
              ) : (
                <div className="space-y-1">
                  <h2 className="font-display text-3xl md:text-4xl tracking-tight text-white/90">
                    {technique.emoji} {technique.name}
                  </h2>
                  <p className="text-white/50 text-sm">{technique.description}</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Guided child prompts */}
        <AnimatePresence mode="wait">
          {isActive && settings.showPhaseText && settings.showGuidancePrompts && (
            <motion.p
              key={`prompt-${currentPhase.type}-${promptIndex}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="text-white/45 text-sm md:text-base italic mt-2 text-center px-4"
            >
              {currentPrompt}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Phase progress bar */}
        {isActive && (
          <motion.div
            className="w-32 h-1 mx-auto mt-4 rounded-full overflow-hidden"
            style={{ backgroundColor: `${phaseColor}30` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{
                width: `${phaseProgress * 100}%`,
                backgroundColor: phaseColor,
                boxShadow: `0 0 8px ${phaseColor}60`,
              }}
            />
          </motion.div>
        )}

        {/* Pace indicator text */}
        {isActive && paceMultiplier !== 1 && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[10px] text-white/30 mt-2 tracking-wider"
          >
            {paceMultiplier}x pace
          </motion.span>
        )}
      </div>

      {/* Session Statistics Panel (clinician only, after 1+ cycle) */}
      {isClinician && isActive && cycleCount >= 1 && (
        <SessionStatsPanel
          cycleCount={cycleCount}
          elapsed={elapsed}
          techniqueName={technique.name}
          coherenceScore={coherenceScore}
          cycleTimes={cycleTimes}
          phaseColor={phaseColor}
        />
      )}

      {/* Layer 3: Controls overlay */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-end pb-8 md:pb-12 pointer-events-none">
        {/* Technique selector (idle + clinician) */}
        {!isActive && (
          <div className="pointer-events-auto mb-6 w-full">
            <BreathingTechniqueSelector
              selectedId={technique.id}
              onSelect={onTechniqueChange}
              isClinician={isClinician}
            />
          </div>
        )}

        {/* Start/Stop button */}
        {isClinician && (
          <motion.button
            onClick={onToggle}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "pointer-events-auto btn-luxury px-8 py-4 rounded-2xl font-medium text-sm flex items-center gap-3 transition-all cursor-pointer min-h-[44px]",
              isActive
                ? "bg-red-600/90 text-white hover:bg-red-600 shadow-[0_4px_24px_rgba(220,38,38,0.3)]"
                : "bg-white/15 backdrop-blur-md text-white hover:bg-white/25 shadow-[0_4px_24px_rgba(0,0,0,0.2)] ring-1 ring-white/20"
            )}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            data-testid="button-toggle-breathing"
          >
            {isActive ? <Pause size={18} /> : <Play size={18} />}
            {isActive ? "Stop Breathing Exercise" : "Start Breathing Exercise"}
          </motion.button>
        )}

        {!isClinician && !isActive && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-sm text-white/50 italic pointer-events-none"
          >
            Waiting for your clinician to start the exercise...
          </motion.p>
        )}
      </div>

      {/* Session Completion Celebration */}
      <AnimatePresence>
        {showCelebration && (
          <CelebrationOverlay
            cycleCount={celebrationCycleCount}
            techniqueEmoji={technique.emoji}
            onComplete={handleCelebrationComplete}
          />
        )}
      </AnimatePresence>

      {/* Clinician Toolbar */}
      {isClinician && onSettingsUpdate && (
        <ClinicianToolbar
          controls={BREATHING_GUIDE_TOOLBAR_CONTROLS}
          settings={settings}
          onUpdate={onSettingsUpdate}
        />
      )}
    </div>
  );
}

function getPhaseColor(technique: BreathingTechnique, phaseType: string): string {
  switch (phaseType) {
    case "inhale": return technique.colors.inhale;
    case "hold": return technique.colors.hold;
    case "exhale": return technique.colors.exhale;
    case "rest": return technique.colors.rest;
    default: return technique.colors.inhale;
  }
}
