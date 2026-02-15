import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { playClickSound } from "@/lib/audio-feedback";
import { RotateCcw, Plus, MessageSquare, MapPin, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { ClinicianToolbar, type ToolbarControl } from "./clinician-toolbar";

// ─── Data Interfaces ──────────────────────────────────────────────────────────

export interface ThermometerReadingData {
  id: string;
  emotionLabel: string;
  intensity: number; // 0-10
  bodyLocation: string | null;
  triggerNote: string | null;
  createdBy: string | null;
  createdAt: string;
}

export interface EmotionThermometerProps {
  readings: ThermometerReadingData[];
  onAddReading: (emotionLabel: string, intensity: number, bodyLocation: string | null, triggerNote: string | null) => void;
  onRemoveReading: (readingId: string) => void;
  onClear: () => void;
  isClinician: boolean;
  toolSettings?: Record<string, any>;
  onSettingsUpdate?: (updates: Record<string, any>) => void;
}

// ─── Clinician Toolbar Settings ──────────────────────────────────────────────

interface EmotionThermometerSettings {
  showBodyLocation: boolean;
  showTriggerNotes: boolean;
  showInsights: boolean;
}

const DEFAULT_EMOTION_THERMOMETER_SETTINGS: EmotionThermometerSettings = {
  showBodyLocation: true,
  showTriggerNotes: true,
  showInsights: true,
};

const EMOTION_THERMOMETER_TOOLBAR_CONTROLS: ToolbarControl[] = [
  { type: "toggle", key: "showBodyLocation", icon: MapPin, label: "Body Location", activeColor: "sky" },
  { type: "toggle", key: "showTriggerNotes", icon: MessageSquare, label: "Trigger Notes", activeColor: "amber" },
  { type: "toggle", key: "showInsights", icon: Sparkles, label: "Insights", activeColor: "purple" },
];

// ─── Constants ────────────────────────────────────────────────────────────────

const EMOTION_CHIPS: { label: string; emoji: string }[] = [
  { label: "Happy", emoji: "\u{1F60A}" },
  { label: "Sad", emoji: "\u{1F622}" },
  { label: "Angry", emoji: "\u{1F621}" },
  { label: "Anxious", emoji: "\u{1F630}" },
  { label: "Scared", emoji: "\u{1F628}" },
  { label: "Excited", emoji: "\u{1F929}" },
  { label: "Calm", emoji: "\u{1F60C}" },
  { label: "Frustrated", emoji: "\u{1F624}" },
  { label: "Hopeful", emoji: "\u{1F31F}" },
  { label: "Overwhelmed", emoji: "\u{1F635}" },
];

const BODY_LOCATIONS: { label: string; icon: string }[] = [
  { label: "Head", icon: "\u{1F9E0}" },
  { label: "Chest", icon: "\u{1FAC0}" },
  { label: "Stomach", icon: "\u{1F4AB}" },
  { label: "Hands", icon: "\u{1F590}" },
  { label: "Legs", icon: "\u{1F9B5}" },
  { label: "All Over", icon: "\u{2728}" },
];

const INTENSITY_LABELS: Record<number, string> = {
  0: "None",
  1: "Barely there",
  2: "Mild",
  3: "Noticeable",
  4: "Moderate",
  5: "Strong",
  6: "Intense",
  7: "Very intense",
  8: "Overwhelming",
  9: "Extreme",
  10: "Maximum",
};

// ─── Color utilities ──────────────────────────────────────────────────────────

function intensityToColor(intensity: number): string {
  const t = intensity / 10;
  if (t <= 0.5) {
    // Blue to yellow
    const s = t * 2;
    const r = Math.round(59 + (245 - 59) * s);
    const g = Math.round(130 + (158 - 130) * s);
    const b = Math.round(246 + (11 - 246) * s);
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    // Yellow to red
    const s = (t - 0.5) * 2;
    const r = Math.round(245 + (239 - 245) * s);
    const g = Math.round(158 + (68 - 158) * s);
    const b = Math.round(11 + (68 - 11) * s);
    return `rgb(${r}, ${g}, ${b})`;
  }
}

function intensityToHex(intensity: number): string {
  const t = intensity / 10;
  if (t <= 0.5) {
    const s = t * 2;
    const r = Math.round(59 + (245 - 59) * s);
    const g = Math.round(130 + (158 - 130) * s);
    const b = Math.round(246 + (11 - 246) * s);
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  } else {
    const s = (t - 0.5) * 2;
    const r = Math.round(245 + (239 - 245) * s);
    const g = Math.round(158 + (68 - 158) * s);
    const b = Math.round(11 + (68 - 11) * s);
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  }
}

// ─── Thermometer SVG Component ────────────────────────────────────────────────

function ThermometerSVG({ intensity, animate }: { intensity: number; animate: boolean }) {
  const mercuryHeight = (intensity / 10) * 240;
  const fillColor = intensityToColor(intensity);
  const glowColor = intensityToHex(intensity);
  const uid = `therm-${Math.round(intensity * 10)}`;

  return (
    <svg
      viewBox="0 0 120 380"
      className="w-full h-full"
      style={{ filter: "drop-shadow(0 4px 24px rgba(0,0,0,0.25))" }}
    >
      <defs>
        {/* Glass gradient */}
        <linearGradient id={`${uid}-glass`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="white" stopOpacity="0.14" />
          <stop offset="35%" stopColor="white" stopOpacity="0.06" />
          <stop offset="65%" stopColor="white" stopOpacity="0.03" />
          <stop offset="100%" stopColor="white" stopOpacity="0.1" />
        </linearGradient>

        {/* Mercury gradient */}
        <linearGradient id={`${uid}-mercury`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="30%" stopColor="#60A5FA" />
          <stop offset="50%" stopColor="#F5A00B" />
          <stop offset="75%" stopColor="#EF4444" />
          <stop offset="100%" stopColor="#DC2626" />
        </linearGradient>

        {/* Mercury glow filter */}
        <filter id={`${uid}-glow`} x="-50%" y="-10%" width="200%" height="120%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
          <feFlood floodColor={glowColor} floodOpacity="0.4" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Glass highlight */}
        <linearGradient id={`${uid}-highlight`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="white" stopOpacity="0.25" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>

        {/* Bulb radial gradient */}
        <radialGradient id={`${uid}-bulb`} cx="0.4" cy="0.4" r="0.6">
          <stop offset="0%" stopColor="white" stopOpacity="0.15" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>

        {/* Clip for mercury fill */}
        <clipPath id={`${uid}-tube-clip`}>
          <rect x="45" y="40" width="30" height="260" rx="15" />
          <circle cx="60" cy="320" r="28" />
        </clipPath>
      </defs>

      {/* ── Degree markings ── */}
      {Array.from({ length: 11 }, (_, i) => {
        const y = 280 - i * 24;
        const isMajor = i % 5 === 0 || i === 10;
        return (
          <g key={i}>
            <line
              x1={isMajor ? 18 : 25}
              y1={y}
              x2="42"
              y2={y}
              stroke="white"
              strokeOpacity={isMajor ? 0.4 : 0.2}
              strokeWidth={isMajor ? 1.5 : 0.8}
              strokeLinecap="round"
            />
            <text
              x={isMajor ? 12 : 20}
              y={y + 1}
              fill="white"
              fillOpacity={isMajor ? 0.6 : 0.35}
              fontSize={isMajor ? 11 : 9}
              fontWeight={isMajor ? 600 : 400}
              textAnchor="middle"
              dominantBaseline="middle"
              fontFamily="system-ui, sans-serif"
            >
              {i}
            </text>
            {/* Right-side small ticks */}
            <line
              x1="78"
              y1={y}
              x2={isMajor ? 95 : 88}
              y2={y}
              stroke="white"
              strokeOpacity={isMajor ? 0.3 : 0.15}
              strokeWidth={isMajor ? 1 : 0.6}
              strokeLinecap="round"
            />
          </g>
        );
      })}

      {/* ── Glass tube outer ── */}
      <rect
        x="42"
        y="36"
        width="36"
        height="268"
        rx="18"
        fill={`url(#${uid}-glass)`}
        stroke="white"
        strokeOpacity="0.18"
        strokeWidth="1.2"
      />

      {/* ── Glass bulb outer ── */}
      <circle
        cx="60"
        cy="320"
        r="30"
        fill={`url(#${uid}-glass)`}
        stroke="white"
        strokeOpacity="0.18"
        strokeWidth="1.2"
      />

      {/* ── Mercury fill (animated) ── */}
      <g clipPath={`url(#${uid}-tube-clip)`}>
        {/* Bulb always filled */}
        <circle
          cx="60"
          cy="320"
          r="28"
          fill={fillColor}
          filter={`url(#${uid}-glow)`}
        />

        {/* Mercury column */}
        <motion.rect
          x="46"
          y={animate ? 280 : 280 - mercuryHeight}
          width="28"
          height={animate ? 0 : mercuryHeight + 22}
          rx="14"
          fill={fillColor}
          filter={`url(#${uid}-glow)`}
          animate={{
            y: 280 - mercuryHeight,
            height: mercuryHeight + 22,
          }}
          transition={{
            type: "spring",
            stiffness: 80,
            damping: 18,
            mass: 1.2,
          }}
        />

        {/* Meniscus highlight at top of mercury */}
        <motion.ellipse
          cx="60"
          ry="3"
          rx="10"
          fill="white"
          fillOpacity="0.25"
          animate={{
            cy: 280 - mercuryHeight,
          }}
          transition={{
            type: "spring",
            stiffness: 80,
            damping: 18,
            mass: 1.2,
          }}
        />
      </g>

      {/* ── Glass highlight (left refraction) ── */}
      <rect
        x="47"
        y="44"
        width="8"
        height="248"
        rx="4"
        fill={`url(#${uid}-highlight)`}
      />

      {/* ── Bulb highlight ── */}
      <circle cx="52" cy="312" r="12" fill={`url(#${uid}-bulb)`} />

      {/* ── Top cap ── */}
      <rect
        x="46"
        y="30"
        width="28"
        height="10"
        rx="5"
        fill="white"
        fillOpacity="0.08"
        stroke="white"
        strokeOpacity="0.15"
        strokeWidth="0.8"
      />
    </svg>
  );
}

// ─── Intensity Slider ─────────────────────────────────────────────────────────

function IntensitySlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const fillColor = intensityToColor(value);
  const glowHex = intensityToHex(value);
  const percentage = (value / 10) * 100;

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/50 font-medium">Intensity</span>
        <motion.span
          key={value}
          initial={{ scale: 1.3, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-sm font-bold"
          style={{ color: fillColor }}
        >
          {value}/10
        </motion.span>
      </div>

      <div className="relative h-10 flex items-center">
        {/* Track background */}
        <div className="absolute inset-x-0 h-3 rounded-full bg-white/8 border border-white/10 overflow-hidden">
          {/* Filled portion */}
          <motion.div
            className="h-full rounded-full"
            animate={{
              width: `${percentage}%`,
              backgroundColor: fillColor,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{
              boxShadow: `0 0 12px ${glowHex}60`,
            }}
          />
        </div>

        {/* Tick marks */}
        <div className="absolute inset-x-0 h-3 flex items-center pointer-events-none">
          {Array.from({ length: 11 }, (_, i) => (
            <div
              key={i}
              className="absolute w-px h-2 bg-white/20"
              style={{ left: `${(i / 10) * 100}%` }}
            />
          ))}
        </div>

        {/* Native range input (invisible, full width) */}
        <input
          type="range"
          min="0"
          max="10"
          step="1"
          value={value}
          onChange={(e) => {
            const newVal = parseInt(e.target.value, 10);
            if (newVal !== value) {
              playClickSound();
            }
            onChange(newVal);
          }}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />

        {/* Custom thumb */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 pointer-events-none z-20"
          animate={{
            left: `calc(${percentage}% - 12px)`,
            borderColor: fillColor,
            boxShadow: `0 0 16px ${glowHex}50, 0 0 4px ${glowHex}80`,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          style={{
            backgroundColor: "rgba(15, 15, 30, 0.8)",
          }}
        >
          <motion.div
            className="absolute inset-1 rounded-full"
            animate={{ backgroundColor: fillColor }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </motion.div>
      </div>

      {/* Label */}
      <motion.p
        key={value}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center text-xs font-medium"
        style={{ color: fillColor }}
      >
        {INTENSITY_LABELS[value]}
      </motion.p>
    </div>
  );
}

// ─── Reading History Card ─────────────────────────────────────────────────────

function ReadingCard({
  reading,
  onRemove,
  isClinician,
}: {
  reading: ThermometerReadingData;
  onRemove: () => void;
  isClinician: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const color = intensityToColor(reading.intensity);
  const hex = intensityToHex(reading.intensity);
  const chip = EMOTION_CHIPS.find((c) => c.label === reading.emotionLabel);
  const dateStr = new Date(reading.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 30, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -30, scale: 0.85 }}
      transition={{ type: "spring", stiffness: 350, damping: 30 }}
      className="relative rounded-xl overflow-hidden"
    >
      {/* Card glow border */}
      <div
        className="absolute inset-0 rounded-xl pointer-events-none"
        style={{
          boxShadow: `inset 0 0 0 1px ${hex}25, 0 2px 12px ${hex}15`,
        }}
      />

      <div
        className="relative bg-white/8 backdrop-blur-sm border border-white/10 rounded-xl
          p-3 cursor-pointer hover:bg-white/12 transition-colors duration-200"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2.5">
          {/* Intensity dot */}
          <motion.div
            className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center
              text-xs font-bold"
            style={{
              backgroundColor: `${hex}20`,
              color: color,
              boxShadow: `0 0 8px ${hex}30`,
            }}
            whileHover={{ scale: 1.1 }}
          >
            {reading.intensity}
          </motion.div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-white/90 truncate">
                {chip?.emoji ?? ""} {reading.emotionLabel}
              </span>
            </div>
            <span className="text-xs text-white/40">{dateStr}</span>
          </div>

          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-white/30"
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="pt-2.5 mt-2.5 border-t border-white/10 space-y-1.5">
                {reading.bodyLocation && (
                  <div className="flex items-center gap-1.5 text-xs text-white/50">
                    <MapPin className="w-3 h-3" />
                    <span>Felt in: {reading.bodyLocation}</span>
                  </div>
                )}
                {reading.triggerNote && (
                  <div className="flex items-start gap-1.5 text-xs text-white/50">
                    <MessageSquare className="w-3 h-3 mt-0.5 shrink-0" />
                    <span className="leading-relaxed">{reading.triggerNote}</span>
                  </div>
                )}
                {reading.createdBy && (
                  <div className="text-xs text-white/30">
                    Added by {reading.createdBy}
                  </div>
                )}
                {isClinician && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove();
                    }}
                    className="mt-1 text-xs text-red-300/60 hover:text-red-300
                      transition-colors duration-200"
                  >
                    Remove reading
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Reading Timeline Dot ─────────────────────────────────────────────────────

function TimelineDot({
  reading,
  index,
  isLatest,
}: {
  reading: ThermometerReadingData;
  index: number;
  isLatest: boolean;
}) {
  const color = intensityToColor(reading.intensity);
  const hex = intensityToHex(reading.intensity);
  const chip = EMOTION_CHIPS.find((c) => c.label === reading.emotionLabel);

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: index * 0.05, type: "spring", stiffness: 400, damping: 25 }}
      className="relative group"
    >
      <motion.div
        className="w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-default"
        style={{
          borderColor: color,
          backgroundColor: `${hex}30`,
          boxShadow: isLatest ? `0 0 12px ${hex}50` : `0 0 4px ${hex}20`,
        }}
        whileHover={{ scale: 1.4 }}
        title={`${chip?.emoji ?? ""} ${reading.emotionLabel}: ${reading.intensity}/10`}
      >
        <span className="text-[7px] font-bold" style={{ color }}>
          {reading.intensity}
        </span>
      </motion.div>

      {/* Tooltip on hover */}
      <div
        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5
          rounded-lg bg-black/70 backdrop-blur-sm border border-white/15
          text-xs text-white/90 whitespace-nowrap opacity-0 group-hover:opacity-100
          pointer-events-none transition-opacity duration-200 z-30"
      >
        {chip?.emoji ?? ""} {reading.emotionLabel} ({reading.intensity}/10)
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function EmotionThermometer({
  readings,
  onAddReading,
  onRemoveReading,
  onClear,
  isClinician,
  toolSettings,
  onSettingsUpdate,
}: EmotionThermometerProps) {
  const settings = { ...DEFAULT_EMOTION_THERMOMETER_SETTINGS, ...toolSettings } as EmotionThermometerSettings;

  const [selectedEmotion, setSelectedEmotion] = useState<string>("");
  const [customEmotion, setCustomEmotion] = useState("");
  const [intensity, setIntensity] = useState(5);
  const [bodyLocation, setBodyLocation] = useState<string | null>(null);
  const [triggerNote, setTriggerNote] = useState("");
  const [showBodyPicker, setShowBodyPicker] = useState(false);
  const [showTriggerInput, setShowTriggerInput] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [animateThermometer, setAnimateThermometer] = useState(false);

  const activeEmotionLabel = useMemo(() => {
    return selectedEmotion || customEmotion.trim();
  }, [selectedEmotion, customEmotion]);

  const currentColor = useMemo(() => intensityToColor(intensity), [intensity]);
  const currentHex = useMemo(() => intensityToHex(intensity), [intensity]);

  const latestReading = useMemo(() => {
    if (readings.length === 0) return null;
    return readings[readings.length - 1];
  }, [readings]);

  const displayIntensity = useMemo(() => {
    return latestReading ? latestReading.intensity : intensity;
  }, [latestReading, intensity]);

  const displayColor = useMemo(() => intensityToColor(displayIntensity), [displayIntensity]);
  const displayHex = useMemo(() => intensityToHex(displayIntensity), [displayIntensity]);

  const averageIntensity = useMemo(() => {
    if (readings.length === 0) return null;
    const sum = readings.reduce((acc, r) => acc + r.intensity, 0);
    return Math.round((sum / readings.length) * 10) / 10;
  }, [readings]);

  const handleSelectEmotion = useCallback((label: string) => {
    playClickSound();
    setSelectedEmotion((prev) => (prev === label ? "" : label));
    setCustomEmotion("");
  }, []);

  const handleCustomEmotionChange = useCallback((val: string) => {
    setCustomEmotion(val);
    if (val.trim()) {
      setSelectedEmotion("");
    }
  }, []);

  const handleAddReading = useCallback(() => {
    if (!activeEmotionLabel) return;
    playClickSound();
    onAddReading(
      activeEmotionLabel,
      intensity,
      bodyLocation,
      triggerNote.trim() || null,
    );
    // Reset form but keep intensity for quick repeated entries
    setSelectedEmotion("");
    setCustomEmotion("");
    setBodyLocation(null);
    setTriggerNote("");
    setShowBodyPicker(false);
    setShowTriggerInput(false);
    setAnimateThermometer(true);
    setTimeout(() => setAnimateThermometer(false), 100);
  }, [activeEmotionLabel, intensity, bodyLocation, triggerNote, onAddReading]);

  const handleClear = useCallback(() => {
    playClickSound();
    onClear();
  }, [onClear]);

  const sortedReadings = useMemo(() => {
    return [...readings].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [readings]);

  const timelineReadings = useMemo(() => {
    return [...readings].slice(-20);
  }, [readings]);

  return (
    <div className="relative w-full max-w-lg mx-auto flex flex-col items-center gap-4 select-none">
      {/* ── Ambient background glow (changes with intensity) ── */}
      <motion.div
        className="absolute inset-0 -z-10 rounded-3xl pointer-events-none"
        animate={{
          background: `radial-gradient(ellipse at 50% 60%, ${displayHex}18 0%, ${displayHex}08 40%, transparent 70%)`,
        }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />

      {/* Secondary ambient pulse */}
      <motion.div
        className="absolute inset-0 -z-10 rounded-3xl pointer-events-none opacity-30"
        animate={{
          background: `radial-gradient(circle at 50% 70%, ${displayHex}20 0%, transparent 50%)`,
          scale: [1, 1.02, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* ── Header: reading count + clinician clear ── */}
      <div className="w-full flex items-center justify-between px-2">
        <div className="flex items-center gap-2 text-sm text-white/60">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full
              bg-white/10 backdrop-blur-sm border border-white/10"
          >
            <Sparkles className="w-3.5 h-3.5" style={{ color: displayColor }} />
            <span className="font-medium text-white/80">{readings.length}</span>
            <span>reading{readings.length !== 1 ? "s" : ""}</span>
          </span>
          {averageIntensity !== null && (
            <span
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full
                bg-white/5 border border-white/8 text-xs"
            >
              <span className="text-white/40">avg:</span>
              <span className="font-semibold" style={{ color: intensityToColor(averageIntensity) }}>
                {averageIntensity}
              </span>
            </span>
          )}
        </div>
        </div>

      {/* ── Main visualization area ── */}
      <div className="w-full flex gap-4 items-stretch">
        {/* Thermometer column */}
        <div className="relative flex-shrink-0" style={{ width: 100, height: 320 }}>
          <ThermometerSVG
            intensity={displayIntensity}
            animate={animateThermometer}
          />

          {/* Current reading label overlay */}
          {latestReading && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute top-0 -right-1 px-2 py-1 rounded-lg
                bg-white/10 backdrop-blur-sm border border-white/15
                text-xs text-white/80 whitespace-nowrap"
              style={{ boxShadow: `0 0 8px ${displayHex}20` }}
            >
              {EMOTION_CHIPS.find((c) => c.label === latestReading.emotionLabel)?.emoji ?? ""}{" "}
              {latestReading.emotionLabel}
            </motion.div>
          )}
        </div>

        {/* Timeline column */}
        <div className="flex-1 min-w-0">
          {/* Minimap timeline dots */}
          {timelineReadings.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-white/40 mb-2 font-medium">Recent Readings</p>
              <div className="flex flex-wrap gap-1.5">
                <AnimatePresence>
                  {timelineReadings.map((r, i) => (
                    <TimelineDot
                      key={r.id}
                      reading={r}
                      index={i}
                      isLatest={i === timelineReadings.length - 1}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Expand/collapse history */}
          {readings.length > 0 && (
            <button
              onClick={() => {
                playClickSound();
                setShowHistory(!showHistory);
              }}
              className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70
                transition-colors duration-200 mb-2"
            >
              {showHistory ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
              {showHistory ? "Hide" : "Show"} details ({readings.length})
            </button>
          )}

          {/* Detailed history cards */}
          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
                  <AnimatePresence>
                    {sortedReadings.map((r) => (
                      <ReadingCard
                        key={r.id}
                        reading={r}
                        onRemove={() => onRemoveReading(r.id)}
                        isClinician={isClinician}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty state */}
          {readings.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full text-center px-4 py-8"
            >
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [0.4, 0.6, 0.4],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3"
              >
                <Sparkles className="w-6 h-6 text-white/20" />
              </motion.div>
              <p className="text-sm text-white/40 leading-relaxed">
                Check in with yourself.
                <br />
                <span className="text-white/25">
                  Name an emotion and rate its intensity.
                </span>
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* ── Intensity Slider ── */}
      <div
        className="w-full rounded-2xl p-4
          bg-white/8 backdrop-blur-xl border border-white/12 shadow-lg"
      >
        <IntensitySlider value={intensity} onChange={setIntensity} />
      </div>

      {/* ── Input panel — glassmorphic ── */}
      <div
        className="w-full rounded-2xl p-4 space-y-3
          bg-white/10 backdrop-blur-xl border border-white/15 shadow-lg"
      >
        {/* Emotion chip selector */}
        <div>
          <p className="text-xs text-white/40 mb-2 font-medium">What are you feeling?</p>
          <div className="flex flex-wrap gap-1.5">
            {EMOTION_CHIPS.map((chip) => (
              <motion.button
                key={chip.label}
                onClick={() => handleSelectEmotion(chip.label)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
                  selectedEmotion === chip.label
                    ? "text-white scale-105"
                    : "text-white/60 hover:text-white/80 bg-white/5 hover:bg-white/10",
                )}
                style={
                  selectedEmotion === chip.label
                    ? {
                        backgroundColor: `${currentHex}35`,
                        boxShadow: `0 0 14px ${currentHex}25, inset 0 0 0 1px ${currentHex}40`,
                      }
                    : undefined
                }
              >
                <span className="mr-1">{chip.emoji}</span>
                {chip.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Custom emotion input */}
        <div>
          <input
            type="text"
            value={customEmotion}
            onChange={(e) => handleCustomEmotionChange(e.target.value)}
            placeholder="Or type a custom emotion..."
            className="w-full px-4 py-2.5 rounded-xl bg-white/8 border border-white/10
              text-sm text-white/90 placeholder:text-white/25
              focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20
              transition-all duration-200"
          />
        </div>

        {/* Optional fields toggle row */}
        <div className="flex gap-2">
          {settings.showBodyLocation && (
            <button
              onClick={() => {
                playClickSound();
                setShowBodyPicker(!showBodyPicker);
              }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all duration-200",
                showBodyPicker || bodyLocation
                  ? "bg-white/15 text-white/80 border border-white/20"
                  : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60 border border-white/8",
              )}
            >
              <MapPin className="w-3.5 h-3.5" />
              Body location
              {bodyLocation && (
                <span className="ml-1 px-1.5 py-0.5 rounded bg-white/10 text-white/60">
                  {bodyLocation}
                </span>
              )}
            </button>
          )}

          {settings.showTriggerNotes && (
            <button
              onClick={() => {
                playClickSound();
                setShowTriggerInput(!showTriggerInput);
              }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all duration-200",
                showTriggerInput || triggerNote.trim()
                  ? "bg-white/15 text-white/80 border border-white/20"
                  : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60 border border-white/8",
              )}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Trigger
            </button>
          )}
        </div>

        {/* Body location picker */}
        {settings.showBodyLocation && (
          <AnimatePresence>
            {showBodyPicker && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {BODY_LOCATIONS.map((loc) => (
                    <motion.button
                      key={loc.label}
                      onClick={() => {
                        playClickSound();
                        setBodyLocation(
                          bodyLocation === loc.label ? null : loc.label,
                        );
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
                        bodyLocation === loc.label
                          ? "bg-white/20 text-white/90 border border-white/25"
                          : "bg-white/5 text-white/50 hover:bg-white/10 border border-white/8",
                      )}
                    >
                      <span className="mr-1">{loc.icon}</span>
                      {loc.label}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Trigger note input */}
        {settings.showTriggerNotes && (
          <AnimatePresence>
            {showTriggerInput && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <textarea
                  value={triggerNote}
                  onChange={(e) => setTriggerNote(e.target.value)}
                  placeholder="What triggered this feeling?"
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/8 border border-white/10
                    text-sm text-white/90 placeholder:text-white/25 resize-none
                    focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20
                    transition-all duration-200"
                />
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Add reading button */}
        <motion.button
          onClick={handleAddReading}
          disabled={!activeEmotionLabel}
          whileHover={activeEmotionLabel ? { scale: 1.02 } : undefined}
          whileTap={activeEmotionLabel ? { scale: 0.98 } : undefined}
          className={cn(
            "w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all duration-300",
            activeEmotionLabel
              ? "text-white shadow-lg cursor-pointer"
              : "bg-white/5 text-white/25 cursor-not-allowed border border-white/8",
          )}
          style={
            activeEmotionLabel
              ? {
                  backgroundColor: `${currentHex}40`,
                  boxShadow: `0 4px 24px ${currentHex}25, inset 0 0 0 1px ${currentHex}30`,
                }
              : undefined
          }
        >
          <Plus className="w-4 h-4" />
          {activeEmotionLabel ? (
            <span>
              Record{" "}
              <span style={{ color: currentColor }}>{activeEmotionLabel}</span> at{" "}
              <span style={{ color: currentColor }}>{intensity}/10</span>
            </span>
          ) : (
            <span>Select an emotion to record</span>
          )}
        </motion.button>
      </div>

      {/* ── Insight card (shown when 3+ readings) ── */}
      {settings.showInsights && (
        <AnimatePresence>
          {readings.length >= 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="w-full rounded-2xl p-4
                bg-white/6 backdrop-blur-xl border border-white/10"
            >
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-white/40" />
                <span className="text-xs font-medium text-white/50">Session Insight</span>
              </div>
              <InsightSummary readings={readings} />
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* ── Clinician Toolbar ── */}
      {isClinician && onSettingsUpdate && (
        <ClinicianToolbar
          controls={EMOTION_THERMOMETER_TOOLBAR_CONTROLS}
          settings={settings}
          onUpdate={onSettingsUpdate}
          onClear={onClear}
        />
      )}
    </div>
  );
}

// ─── Insight Summary Sub-Component ────────────────────────────────────────────

function InsightSummary({ readings }: { readings: ThermometerReadingData[] }) {
  const stats = useMemo(() => {
    if (readings.length === 0) return null;

    const intensities = readings.map((r) => r.intensity);
    const avg = intensities.reduce((a, b) => a + b, 0) / intensities.length;
    const max = Math.max(...intensities);
    const min = Math.min(...intensities);

    // Most frequent emotion
    const emotionCounts = new Map<string, number>();
    for (const r of readings) {
      emotionCounts.set(r.emotionLabel, (emotionCounts.get(r.emotionLabel) ?? 0) + 1);
    }
    let topEmotion = readings[0].emotionLabel;
    let topCount = 0;
    for (const [emotion, count] of Array.from(emotionCounts)) {
      if (count > topCount) {
        topCount = count;
        topEmotion = emotion;
      }
    }

    // Most common body location
    const bodyCounts = new Map<string, number>();
    for (const r of readings) {
      if (r.bodyLocation) {
        bodyCounts.set(r.bodyLocation, (bodyCounts.get(r.bodyLocation) ?? 0) + 1);
      }
    }
    let topBody: string | null = null;
    let topBodyCount = 0;
    for (const [loc, count] of Array.from(bodyCounts)) {
      if (count > topBodyCount) {
        topBodyCount = count;
        topBody = loc;
      }
    }

    // Trend
    let trend: "rising" | "falling" | "stable" = "stable";
    if (readings.length >= 2) {
      const recent = readings.slice(-3);
      const older = readings.slice(0, Math.max(1, readings.length - 3));
      const recentAvg = recent.reduce((a, r) => a + r.intensity, 0) / recent.length;
      const olderAvg = older.reduce((a, r) => a + r.intensity, 0) / older.length;
      if (recentAvg - olderAvg > 1) trend = "rising";
      else if (olderAvg - recentAvg > 1) trend = "falling";
    }

    return { avg: Math.round(avg * 10) / 10, max, min, topEmotion, topCount, topBody, trend };
  }, [readings]);

  if (!stats) return null;

  const trendText =
    stats.trend === "rising"
      ? "Intensity has been rising"
      : stats.trend === "falling"
        ? "Intensity has been easing"
        : "Intensity has been steady";

  const trendColor =
    stats.trend === "rising"
      ? "text-red-300/70"
      : stats.trend === "falling"
        ? "text-blue-300/70"
        : "text-white/40";

  const chip = EMOTION_CHIPS.find((c) => c.label === stats.topEmotion);

  return (
    <div className="space-y-2">
      {/* Emotion frequency */}
      <div className="flex items-center gap-2 text-xs text-white/60">
        <span>
          Most felt: {chip?.emoji ?? ""} <span className="font-medium text-white/80">{stats.topEmotion}</span>{" "}
          <span className="text-white/30">({stats.topCount}x)</span>
        </span>
      </div>

      {/* Intensity range */}
      <div className="flex items-center gap-3 text-xs">
        <span className="text-white/40">Range:</span>
        <span style={{ color: intensityToColor(stats.min) }} className="font-medium">
          {stats.min}
        </span>
        <div className="flex-1 h-1.5 rounded-full bg-white/8 overflow-hidden relative">
          <motion.div
            className="absolute h-full rounded-full"
            initial={{ width: 0 }}
            animate={{
              left: `${(stats.min / 10) * 100}%`,
              width: `${((stats.max - stats.min) / 10) * 100}%`,
            }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{
              background: `linear-gradient(to right, ${intensityToColor(stats.min)}, ${intensityToColor(stats.max)})`,
              opacity: 0.7,
            }}
          />
          {/* Average marker */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border border-white/50"
            initial={{ left: "50%" }}
            animate={{ left: `${(stats.avg / 10) * 100}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ backgroundColor: intensityToColor(stats.avg) }}
          />
        </div>
        <span style={{ color: intensityToColor(stats.max) }} className="font-medium">
          {stats.max}
        </span>
      </div>

      {/* Trend */}
      <div className={cn("text-xs", trendColor)}>
        {trendText}
      </div>

      {/* Body location */}
      {stats.topBody && (
        <div className="flex items-center gap-1.5 text-xs text-white/40">
          <MapPin className="w-3 h-3" />
          <span>
            Most felt in: <span className="text-white/60 font-medium">{stats.topBody}</span>
          </span>
        </div>
      )}
    </div>
  );
}
