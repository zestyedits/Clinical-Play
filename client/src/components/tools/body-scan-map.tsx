import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { playClickSound } from "@/lib/audio-feedback";
import { RotateCcw, Plus, X, ChevronDown, Wind, Sparkles } from "lucide-react";

// ─── Data Interfaces ──────────────────────────────────────────────────────────

export interface BodyScanMarkerData {
  id: string;
  bodyRegion: string;
  sensationType: string;
  intensity: number;
  emotionLink: string | null;
  breathReaches: boolean | null;
  movementImpulse: string | null;
  notes: string | null;
  color: string | null;
  createdBy: string | null;
  createdAt: string;
}

interface BodyScanMapProps {
  markers: BodyScanMarkerData[];
  onAddMarker: (
    bodyRegion: string,
    sensationType: string,
    intensity: number,
    emotionLink: string | null,
    breathReaches: boolean | null,
    movementImpulse: string | null,
    notes: string | null,
    color: string | null,
  ) => void;
  onUpdateMarker: (markerId: string, fields: Partial<BodyScanMarkerData>) => void;
  onRemoveMarker: (markerId: string) => void;
  onClear: () => void;
  isClinician: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SENSATION_TYPES: { label: string; color: string }[] = [
  { label: "Tension", color: "#EF4444" },
  { label: "Pain", color: "#DC2626" },
  { label: "Tingling", color: "#A855F7" },
  { label: "Numbness", color: "#6B7280" },
  { label: "Warmth", color: "#F59E0B" },
  { label: "Coldness", color: "#38BDF8" },
  { label: "Pressure", color: "#F97316" },
  { label: "Lightness", color: "#34D399" },
  { label: "Heaviness", color: "#78716C" },
  { label: "Pulsing", color: "#EC4899" },
];

const EMOTION_OPTIONS = [
  "Happy",
  "Sad",
  "Angry",
  "Anxious",
  "Scared",
  "Excited",
  "Calm",
  "Frustrated",
  "Hopeful",
  "Overwhelmed",
  "Confused",
  "Numb",
  "Relieved",
  "Ashamed",
];

const INTENSITY_LABELS: Record<number, string> = {
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

// ─── Body Region Definitions ─────────────────────────────────────────────────

interface BodyRegion {
  id: string;
  label: string;
  path: string;
  cx: number;
  cy: number;
}

const BODY_REGIONS: BodyRegion[] = [
  {
    id: "head",
    label: "Head",
    path: "M85,28 C85,14 95,4 110,4 C125,4 135,14 135,28 C135,42 125,52 110,52 C95,52 85,42 85,28 Z",
    cx: 110,
    cy: 28,
  },
  {
    id: "face",
    label: "Face",
    path: "M93,32 C93,24 100,18 110,18 C120,18 127,24 127,32 C127,44 120,50 110,50 C100,50 93,44 93,32 Z",
    cx: 110,
    cy: 36,
  },
  {
    id: "neck",
    label: "Neck",
    path: "M103,52 L117,52 L117,68 L103,68 Z",
    cx: 110,
    cy: 60,
  },
  {
    id: "left-shoulder",
    label: "Left Shoulder",
    path: "M68,68 C68,68 85,64 103,68 L103,82 C90,78 75,78 68,82 Z",
    cx: 85,
    cy: 74,
  },
  {
    id: "right-shoulder",
    label: "Right Shoulder",
    path: "M117,68 C135,64 152,68 152,68 L152,82 C145,78 130,78 117,82 Z",
    cx: 135,
    cy: 74,
  },
  {
    id: "chest",
    label: "Chest",
    path: "M82,82 L138,82 L138,120 L82,120 Z",
    cx: 110,
    cy: 100,
  },
  {
    id: "upper-back",
    label: "Upper Back",
    path: "M86,84 L134,84 L134,118 L86,118 Z",
    cx: 110,
    cy: 101,
  },
  {
    id: "left-arm",
    label: "Left Arm",
    path: "M52,82 L68,82 L68,84 L64,120 L60,160 L48,160 L52,120 L52,82 Z",
    cx: 58,
    cy: 120,
  },
  {
    id: "right-arm",
    label: "Right Arm",
    path: "M152,82 L168,82 L168,120 L172,160 L160,160 L156,120 L152,84 Z",
    cx: 162,
    cy: 120,
  },
  {
    id: "stomach",
    label: "Stomach",
    path: "M85,120 L135,120 L135,160 L85,160 Z",
    cx: 110,
    cy: 140,
  },
  {
    id: "lower-back",
    label: "Lower Back",
    path: "M88,122 L132,122 L132,158 L88,158 Z",
    cx: 110,
    cy: 140,
  },
  {
    id: "left-hand",
    label: "Left Hand",
    path: "M40,160 L56,160 L58,180 L52,188 L44,188 L38,180 Z",
    cx: 48,
    cy: 174,
  },
  {
    id: "right-hand",
    label: "Right Hand",
    path: "M164,160 L180,160 L182,180 L176,188 L168,188 L162,180 Z",
    cx: 172,
    cy: 174,
  },
  {
    id: "hips",
    label: "Hips",
    path: "M82,160 L138,160 L142,180 L78,180 Z",
    cx: 110,
    cy: 170,
  },
  {
    id: "left-leg",
    label: "Left Leg",
    path: "M82,180 L104,180 L100,260 L78,260 Z",
    cx: 92,
    cy: 220,
  },
  {
    id: "right-leg",
    label: "Right Leg",
    path: "M116,180 L138,180 L142,260 L120,260 Z",
    cx: 128,
    cy: 220,
  },
  {
    id: "left-foot",
    label: "Left Foot",
    path: "M74,260 L100,260 L100,278 L96,284 L70,284 L68,278 Z",
    cx: 86,
    cy: 272,
  },
  {
    id: "right-foot",
    label: "Right Foot",
    path: "M120,260 L146,260 L152,278 L150,284 L124,284 L120,278 Z",
    cx: 134,
    cy: 272,
  },
];

// Regions that overlap (upper-back overlaps chest, lower-back overlaps stomach)
// We hide the back regions from the front-view SVG and use only the front-facing ones
const FRONT_REGIONS = BODY_REGIONS.filter(
  (r) => r.id !== "upper-back" && r.id !== "lower-back",
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getSensationColor(sensationType: string): string {
  return SENSATION_TYPES.find((s) => s.label === sensationType)?.color ?? "#8B5CF6";
}

function intensityToGlow(intensity: number, color: string): string {
  const spread = 4 + intensity * 2;
  const opacity = 0.2 + (intensity / 10) * 0.5;
  return `0 0 ${spread}px ${color}${Math.round(opacity * 255).toString(16).padStart(2, "0")}`;
}

function intensityToSize(intensity: number): number {
  return 6 + intensity * 1.2;
}

// ─── Body Silhouette SVG ──────────────────────────────────────────────────────

function BodySilhouetteSVG({
  markers,
  hoveredRegion,
  onRegionClick,
  onRegionHover,
  onMarkerClick,
}: {
  markers: BodyScanMarkerData[];
  hoveredRegion: string | null;
  onRegionClick: (regionId: string) => void;
  onRegionHover: (regionId: string | null) => void;
  onMarkerClick: (marker: BodyScanMarkerData) => void;
}) {
  const markersByRegion = useMemo(() => {
    const map = new Map<string, BodyScanMarkerData[]>();
    for (const m of markers) {
      const existing = map.get(m.bodyRegion) ?? [];
      existing.push(m);
      map.set(m.bodyRegion, existing);
    }
    return map;
  }, [markers]);

  return (
    <svg
      viewBox="0 0 220 300"
      className="w-full h-full"
      style={{ filter: "drop-shadow(0 4px 24px rgba(0,0,0,0.3))" }}
    >
      <defs>
        {/* Body silhouette gradient */}
        <linearGradient id="body-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0.06" />
          <stop offset="100%" stopColor="white" stopOpacity="0.02" />
        </linearGradient>

        {/* Glow filter for markers */}
        <filter id="marker-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Pulse animation filter */}
        <filter id="pulse-glow" x="-150%" y="-150%" width="400%" height="400%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Outer body silhouette path */}
        <path
          id="body-outline"
          d="
            M110,4
            C125,4 136,14 136,30
            C136,44 126,54 116,56
            L118,68
            C140,64 158,70 160,76
            L170,82
            L172,90
            L170,120
            L174,160
            L182,178
            L178,188
            L168,190
            L162,180
            L156,124
            L140,82
            L140,160
            L144,182
            L146,260
            L154,278
            L152,286
            L122,286
            L120,278
            L118,260
            L116,182
            L110,180
            L104,182
            L102,260
            L100,278
            L98,286
            L68,286
            L66,278
            L74,260
            L76,182
            L80,160
            L80,82
            L64,124
            L58,180
            L52,190
            L42,188
            L38,178
            L46,160
            L50,120
            L48,90
            L50,82
            L60,76
            C62,70 80,64 102,68
            L104,56
            C94,54 84,44 84,30
            C84,14 95,4 110,4
            Z
          "
        />
      </defs>

      {/* Background body outline */}
      <use
        href="#body-outline"
        fill="url(#body-fill)"
        stroke="white"
        strokeOpacity="0.12"
        strokeWidth="1"
      />

      {/* Clickable body regions */}
      {FRONT_REGIONS.map((region) => {
        const isHovered = hoveredRegion === region.id;
        const hasMarkers = markersByRegion.has(region.id);
        const regionMarkers = markersByRegion.get(region.id) ?? [];
        const avgIntensity = regionMarkers.length > 0
          ? regionMarkers.reduce((s, m) => s + m.intensity, 0) / regionMarkers.length
          : 0;
        const dominantColor = regionMarkers.length > 0
          ? getSensationColor(regionMarkers[0].sensationType)
          : "white";

        return (
          <g key={region.id}>
            {/* Clickable region overlay */}
            <path
              d={region.path}
              fill={
                isHovered
                  ? "rgba(255,255,255,0.12)"
                  : hasMarkers
                    ? `${dominantColor}18`
                    : "transparent"
              }
              stroke={
                isHovered
                  ? "rgba(255,255,255,0.3)"
                  : hasMarkers
                    ? `${dominantColor}40`
                    : "transparent"
              }
              strokeWidth={isHovered ? 1.5 : 0.8}
              className="cursor-pointer transition-all duration-200"
              onClick={() => onRegionClick(region.id)}
              onMouseEnter={() => onRegionHover(region.id)}
              onMouseLeave={() => onRegionHover(null)}
              style={{ pointerEvents: "all" }}
            />

            {/* Region label on hover */}
            {isHovered && (
              <text
                x={region.cx}
                y={region.cy - 12}
                fill="white"
                fillOpacity="0.7"
                fontSize="7"
                fontWeight="500"
                textAnchor="middle"
                fontFamily="system-ui, sans-serif"
                className="pointer-events-none select-none"
              >
                {region.label}
              </text>
            )}

            {/* Intensity heatmap overlay */}
            {hasMarkers && avgIntensity > 0 && (
              <path
                d={region.path}
                fill={dominantColor}
                fillOpacity={0.05 + (avgIntensity / 10) * 0.2}
                className="pointer-events-none"
              />
            )}
          </g>
        );
      })}

      {/* Marker dots */}
      {markers.map((marker, idx) => {
        const region = BODY_REGIONS.find((r) => r.id === marker.bodyRegion);
        if (!region) return null;

        const color = marker.color ?? getSensationColor(marker.sensationType);
        const size = intensityToSize(marker.intensity);
        const offset = idx * 3 - (markers.filter((m) => m.bodyRegion === marker.bodyRegion).length - 1) * 1.5;

        return (
          <g key={marker.id} className="cursor-pointer" onClick={() => onMarkerClick(marker)}>
            {/* Outer glow */}
            <circle
              cx={region.cx + offset}
              cy={region.cy}
              r={size + 4}
              fill={color}
              fillOpacity={0.15}
              filter="url(#pulse-glow)"
            >
              <animate
                attributeName="r"
                values={`${size + 2};${size + 6};${size + 2}`}
                dur="2.5s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="fill-opacity"
                values="0.15;0.08;0.15"
                dur="2.5s"
                repeatCount="indefinite"
              />
            </circle>

            {/* Inner dot */}
            <circle
              cx={region.cx + offset}
              cy={region.cy}
              r={size}
              fill={color}
              fillOpacity="0.8"
              stroke={color}
              strokeOpacity="0.5"
              strokeWidth="1"
              filter="url(#marker-glow)"
            />

            {/* Intensity number */}
            <text
              x={region.cx + offset}
              y={region.cy + 1}
              fill="white"
              fillOpacity="0.9"
              fontSize="7"
              fontWeight="700"
              textAnchor="middle"
              dominantBaseline="middle"
              fontFamily="system-ui, sans-serif"
              className="pointer-events-none select-none"
            >
              {marker.intensity}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Intensity Slider ─────────────────────────────────────────────────────────

function IntensitySlider({
  value,
  onChange,
  color,
}: {
  value: number;
  onChange: (v: number) => void;
  color: string;
}) {
  const percentage = ((value - 1) / 9) * 100;

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wider text-white/40 font-medium">
          Intensity
        </span>
        <motion.span
          key={value}
          initial={{ scale: 1.3, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-sm font-bold"
          style={{ color }}
        >
          {value}/10
        </motion.span>
      </div>

      <div className="relative h-10 flex items-center">
        {/* Track background */}
        <div className="absolute inset-x-0 h-3 rounded-full bg-white/[0.06] border border-white/[0.08] overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            animate={{
              width: `${percentage}%`,
              backgroundColor: color,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{ boxShadow: `0 0 12px ${color}60` }}
          />
        </div>

        {/* Tick marks */}
        <div className="absolute inset-x-0 h-3 flex items-center pointer-events-none">
          {Array.from({ length: 10 }, (_, i) => (
            <div
              key={i}
              className="absolute w-px h-2 bg-white/20"
              style={{ left: `${(i / 9) * 100}%` }}
            />
          ))}
        </div>

        {/* Native range input */}
        <input
          type="range"
          min="1"
          max="10"
          step="1"
          value={value}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10);
            if (v !== value) playClickSound();
            onChange(v);
          }}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />

        {/* Custom thumb */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 pointer-events-none z-20"
          animate={{
            left: `calc(${percentage}% - 12px)`,
            borderColor: color,
            boxShadow: `0 0 16px ${color}50, 0 0 4px ${color}80`,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          style={{ backgroundColor: "rgba(15, 15, 30, 0.8)" }}
        >
          <motion.div
            className="absolute inset-1 rounded-full"
            animate={{ backgroundColor: color }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </motion.div>
      </div>

      <motion.p
        key={value}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center text-xs font-medium"
        style={{ color }}
      >
        {INTENSITY_LABELS[value]}
      </motion.p>
    </div>
  );
}

// ─── Side Panel ───────────────────────────────────────────────────────────────

function SidePanel({
  mode,
  regionId,
  marker,
  onClose,
  onAdd,
  onUpdate,
  onRemove,
}: {
  mode: "add" | "edit";
  regionId: string;
  marker: BodyScanMarkerData | null;
  onClose: () => void;
  onAdd: (
    bodyRegion: string,
    sensationType: string,
    intensity: number,
    emotionLink: string | null,
    breathReaches: boolean | null,
    movementImpulse: string | null,
    notes: string | null,
    color: string | null,
  ) => void;
  onUpdate: (markerId: string, fields: Partial<BodyScanMarkerData>) => void;
  onRemove: (markerId: string) => void;
}) {
  const [sensationType, setSensationType] = useState(marker?.sensationType ?? "");
  const [intensity, setIntensity] = useState(marker?.intensity ?? 5);
  const [emotionLink, setEmotionLink] = useState(marker?.emotionLink ?? "");
  const [breathReaches, setBreathReaches] = useState<boolean | null>(marker?.breathReaches ?? null);
  const [movementImpulse, setMovementImpulse] = useState(marker?.movementImpulse ?? "");
  const [notes, setNotes] = useState(marker?.notes ?? "");
  const [showEmotionDropdown, setShowEmotionDropdown] = useState(false);

  const regionLabel = BODY_REGIONS.find((r) => r.id === regionId)?.label ?? regionId;
  const activeColor = sensationType ? getSensationColor(sensationType) : "#8B5CF6";

  const handleSubmit = useCallback(() => {
    if (!sensationType) return;
    playClickSound();
    if (mode === "add") {
      onAdd(
        regionId,
        sensationType,
        intensity,
        emotionLink.trim() || null,
        breathReaches,
        movementImpulse.trim() || null,
        notes.trim() || null,
        activeColor,
      );
    } else if (marker) {
      onUpdate(marker.id, {
        sensationType,
        intensity,
        emotionLink: emotionLink.trim() || null,
        breathReaches,
        movementImpulse: movementImpulse.trim() || null,
        notes: notes.trim() || null,
        color: activeColor,
      });
    }
    onClose();
  }, [sensationType, intensity, emotionLink, breathReaches, movementImpulse, notes, mode, regionId, marker, onAdd, onUpdate, onClose, activeColor]);

  const handleRemove = useCallback(() => {
    if (!marker) return;
    playClickSound();
    onRemove(marker.id);
    onClose();
  }, [marker, onRemove, onClose]);

  return (
    <motion.div
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 40, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="w-full h-full flex flex-col rounded-2xl overflow-hidden
        bg-white/[0.04] backdrop-blur-xl border border-white/[0.08]"
      style={{ boxShadow: `0 0 40px ${activeColor}10` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <motion.div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: activeColor }}
            animate={{ boxShadow: `0 0 8px ${activeColor}60` }}
          />
          <span className="text-sm font-semibold text-white/90">{regionLabel}</span>
          <span className="text-[11px] uppercase tracking-wider text-white/30 ml-1">
            {mode === "add" ? "New Marker" : "Edit Marker"}
          </span>
        </div>
        <motion.button
          onClick={() => { playClickSound(); onClose(); }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-7 h-7 rounded-full bg-white/[0.06] border border-white/[0.08]
            flex items-center justify-center text-white/40 hover:text-white/70
            hover:bg-white/[0.1] transition-colors duration-200"
        >
          <X className="w-3.5 h-3.5" />
        </motion.button>
      </div>

      {/* Scrollable form */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
        {/* Sensation type selector */}
        <div>
          <p className="text-[11px] uppercase tracking-wider text-white/40 font-medium mb-2.5">
            Sensation Type
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {SENSATION_TYPES.map((s) => {
              const isActive = sensationType === s.label;
              return (
                <motion.button
                  key={s.label}
                  onClick={() => { playClickSound(); setSensationType(s.label); }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 text-left",
                    isActive
                      ? "text-white"
                      : "text-white/50 hover:text-white/70 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06]",
                  )}
                  style={
                    isActive
                      ? {
                          backgroundColor: `${s.color}25`,
                          boxShadow: `0 0 14px ${s.color}20, inset 0 0 0 1px ${s.color}40`,
                        }
                      : undefined
                  }
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: s.color, boxShadow: `0 0 6px ${s.color}50` }}
                    />
                    {s.label}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Intensity slider */}
        {sensationType && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <IntensitySlider value={intensity} onChange={setIntensity} color={activeColor} />
          </motion.div>
        )}

        {/* Emotion link dropdown */}
        <div>
          <p className="text-[11px] uppercase tracking-wider text-white/40 font-medium mb-2">
            Linked Emotion
          </p>
          <div className="relative">
            <motion.button
              onClick={() => { playClickSound(); setShowEmotionDropdown(!showEmotionDropdown); }}
              whileHover={{ scale: 1.02 }}
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08]
                text-sm text-left flex items-center justify-between
                hover:bg-white/[0.1] transition-colors duration-200"
            >
              <span className={emotionLink ? "text-white/80" : "text-white/30"}>
                {emotionLink || "Select an emotion..."}
              </span>
              <motion.div animate={{ rotate: showEmotionDropdown ? 180 : 0 }}>
                <ChevronDown className="w-4 h-4 text-white/30" />
              </motion.div>
            </motion.button>

            <AnimatePresence>
              {showEmotionDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scaleY: 0.8 }}
                  animate={{ opacity: 1, y: 0, scaleY: 1 }}
                  exit={{ opacity: 0, y: -8, scaleY: 0.8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute z-30 mt-1 w-full rounded-xl overflow-hidden
                    bg-slate-800/95 backdrop-blur-xl border border-white/[0.1]
                    shadow-xl max-h-40 overflow-y-auto custom-scrollbar"
                  style={{ transformOrigin: "top" }}
                >
                  <button
                    onClick={() => { setEmotionLink(""); setShowEmotionDropdown(false); }}
                    className="w-full px-4 py-2 text-xs text-white/30 hover:bg-white/[0.06]
                      text-left transition-colors duration-150"
                  >
                    None
                  </button>
                  {EMOTION_OPTIONS.map((emotion) => (
                    <button
                      key={emotion}
                      onClick={() => {
                        playClickSound();
                        setEmotionLink(emotion);
                        setShowEmotionDropdown(false);
                      }}
                      className={cn(
                        "w-full px-4 py-2 text-xs text-left transition-colors duration-150",
                        emotionLink === emotion
                          ? "text-white/90 bg-white/[0.1]"
                          : "text-white/60 hover:bg-white/[0.06] hover:text-white/80",
                      )}
                    >
                      {emotion}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Breath reaches toggle */}
        <div>
          <p className="text-[11px] uppercase tracking-wider text-white/40 font-medium mb-2">
            Can Your Breath Reach Here?
          </p>
          <div className="flex gap-2">
            {[
              { label: "Yes", value: true },
              { label: "No", value: false },
              { label: "Unsure", value: null },
            ].map((option) => (
              <motion.button
                key={option.label}
                onClick={() => { playClickSound(); setBreathReaches(option.value); }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "flex-1 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200",
                  breathReaches === option.value
                    ? "text-white"
                    : "text-white/40 bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08]",
                )}
                style={
                  breathReaches === option.value
                    ? {
                        backgroundColor: option.value === true
                          ? "rgba(52, 211, 153, 0.2)"
                          : option.value === false
                            ? "rgba(239, 68, 68, 0.15)"
                            : "rgba(148, 163, 184, 0.15)",
                        boxShadow: option.value === true
                          ? "inset 0 0 0 1px rgba(52, 211, 153, 0.3)"
                          : option.value === false
                            ? "inset 0 0 0 1px rgba(239, 68, 68, 0.25)"
                            : "inset 0 0 0 1px rgba(148, 163, 184, 0.2)",
                      }
                    : undefined
                }
              >
                <div className="flex items-center justify-center gap-1.5">
                  {option.value === true && <Wind className="w-3 h-3" />}
                  {option.label}
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Movement impulse */}
        <div>
          <p className="text-[11px] uppercase tracking-wider text-white/40 font-medium mb-2">
            Movement Impulse
          </p>
          <input
            type="text"
            value={movementImpulse}
            onChange={(e) => setMovementImpulse(e.target.value)}
            placeholder="e.g. clench fist, run, curl up..."
            className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08]
              text-sm text-white/80 placeholder:text-white/20
              focus:outline-none focus:ring-2 focus:ring-white/15 focus:border-white/15
              transition-all duration-200"
          />
        </div>

        {/* Notes */}
        <div>
          <p className="text-[11px] uppercase tracking-wider text-white/40 font-medium mb-2">
            Notes
          </p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Describe what you notice..."
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08]
              text-sm text-white/80 placeholder:text-white/20 resize-none
              focus:outline-none focus:ring-2 focus:ring-white/15 focus:border-white/15
              transition-all duration-200"
          />
        </div>
      </div>

      {/* Footer buttons */}
      <div className="p-4 border-t border-white/[0.08] space-y-2">
        <motion.button
          onClick={handleSubmit}
          disabled={!sensationType}
          whileHover={sensationType ? { scale: 1.02 } : undefined}
          whileTap={sensationType ? { scale: 0.98 } : undefined}
          className={cn(
            "w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all duration-300",
            sensationType
              ? "text-white cursor-pointer"
              : "bg-white/[0.04] text-white/20 cursor-not-allowed border border-white/[0.06]",
          )}
          style={
            sensationType
              ? {
                  backgroundColor: `${activeColor}30`,
                  boxShadow: `0 4px 24px ${activeColor}20, inset 0 0 0 1px ${activeColor}35`,
                }
              : undefined
          }
        >
          {mode === "add" ? (
            <>
              <Plus className="w-4 h-4" />
              <span>Add Marker</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Update Marker</span>
            </>
          )}
        </motion.button>

        {mode === "edit" && marker && (
          <motion.button
            onClick={handleRemove}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-2.5 rounded-xl text-xs font-medium text-red-300/60
              hover:text-red-300 bg-white/[0.03] hover:bg-red-500/10
              border border-white/[0.06] hover:border-red-400/20
              transition-all duration-200 flex items-center justify-center gap-1.5"
          >
            <X className="w-3.5 h-3.5" />
            Remove Marker
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

// ─── Marker Summary Card ──────────────────────────────────────────────────────

function MarkerSummaryCard({
  marker,
  onClick,
}: {
  marker: BodyScanMarkerData;
  onClick: () => void;
}) {
  const color = marker.color ?? getSensationColor(marker.sensationType);
  const regionLabel = BODY_REGIONS.find((r) => r.id === marker.bodyRegion)?.label ?? marker.bodyRegion;
  const dateStr = new Date(marker.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 350, damping: 30 }}
      onClick={onClick}
      className="relative rounded-xl overflow-hidden cursor-pointer group"
    >
      <div
        className="absolute inset-0 rounded-xl pointer-events-none"
        style={{ boxShadow: `inset 0 0 0 1px ${color}20, 0 2px 12px ${color}10` }}
      />

      <div
        className="relative bg-white/[0.06] backdrop-blur-sm border border-white/[0.08] rounded-xl
          p-3 hover:bg-white/[0.1] transition-colors duration-200"
      >
        <div className="flex items-center gap-2.5">
          {/* Intensity indicator */}
          <motion.div
            className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
            style={{
              backgroundColor: `${color}20`,
              color: color,
              boxShadow: intensityToGlow(marker.intensity, color),
            }}
            whileHover={{ scale: 1.1 }}
          >
            {marker.intensity}
          </motion.div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className="text-sm font-medium text-white/85 truncate">
                {marker.sensationType}
              </span>
              <span className="text-xs text-white/30 truncate">
                in {regionLabel}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              {marker.emotionLink && (
                <span className="text-[11px] text-white/40">
                  {marker.emotionLink}
                </span>
              )}
              {marker.breathReaches !== null && (
                <span className="text-[11px] text-white/30 flex items-center gap-0.5">
                  <Wind className="w-2.5 h-2.5" />
                  {marker.breathReaches ? "yes" : "no"}
                </span>
              )}
              <span className="text-[11px] text-white/20 ml-auto">{dateStr}</span>
            </div>
          </div>
        </div>

        {marker.notes && (
          <p className="mt-2 text-[11px] text-white/35 leading-relaxed line-clamp-2 pl-11">
            {marker.notes}
          </p>
        )}
      </div>
    </motion.div>
  );
}

// ─── Legend Bar ────────────────────────────────────────────────────────────────

function LegendBar({ markers }: { markers: BodyScanMarkerData[] }) {
  const activeSensations = useMemo(() => {
    const seen = new Set<string>();
    return markers
      .filter((m) => {
        if (seen.has(m.sensationType)) return false;
        seen.add(m.sensationType);
        return true;
      })
      .map((m) => ({
        label: m.sensationType,
        color: m.color ?? getSensationColor(m.sensationType),
      }));
  }, [markers]);

  if (activeSensations.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full rounded-2xl px-4 py-3
        bg-white/[0.04] backdrop-blur-xl border border-white/[0.08]"
    >
      <p className="text-[11px] uppercase tracking-wider text-white/30 font-medium mb-2">
        Active Sensations
      </p>
      <div className="flex flex-wrap gap-2">
        {activeSensations.map((s) => (
          <motion.div
            key={s.label}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full
              bg-white/[0.06] border border-white/[0.08]"
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: s.color, boxShadow: `0 0 6px ${s.color}50` }}
            />
            <span className="text-[11px] text-white/60 font-medium">{s.label}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function BodyScanMap({
  markers,
  onAddMarker,
  onUpdateMarker,
  onRemoveMarker,
  onClear,
  isClinician,
}: BodyScanMapProps) {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [panelState, setPanelState] = useState<{
    mode: "add" | "edit";
    regionId: string;
    marker: BodyScanMarkerData | null;
  } | null>(null);

  const handleRegionClick = useCallback((regionId: string) => {
    playClickSound();
    setPanelState({ mode: "add", regionId, marker: null });
  }, []);

  const handleMarkerClick = useCallback((marker: BodyScanMarkerData) => {
    playClickSound();
    setPanelState({ mode: "edit", regionId: marker.bodyRegion, marker });
  }, []);

  const handleClosePanel = useCallback(() => {
    setPanelState(null);
  }, []);

  const handleClear = useCallback(() => {
    playClickSound();
    onClear();
    setPanelState(null);
  }, [onClear]);

  const regionCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const m of markers) {
      counts.set(m.bodyRegion, (counts.get(m.bodyRegion) ?? 0) + 1);
    }
    return counts;
  }, [markers]);

  const totalRegions = regionCounts.size;

  return (
    <div className="relative w-full max-w-2xl mx-auto flex flex-col gap-3 select-none">
      {/* Ambient background */}
      <motion.div
        className="absolute inset-0 -z-10 rounded-3xl pointer-events-none"
        animate={{
          background: markers.length > 0
            ? `radial-gradient(ellipse at 40% 50%, ${getSensationColor(markers[0].sensationType)}10 0%, transparent 60%)`
            : "radial-gradient(ellipse at 40% 50%, rgba(139,92,246,0.05) 0%, transparent 60%)",
        }}
        transition={{ duration: 2, ease: "easeInOut" }}
      />

      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-sm text-white/60">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full
              bg-white/[0.06] backdrop-blur-sm border border-white/[0.08]"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400/70" />
            <span className="font-medium text-white/70">{markers.length}</span>
            <span className="text-white/40">marker{markers.length !== 1 ? "s" : ""}</span>
          </span>
          {totalRegions > 0 && (
            <span
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full
                bg-white/[0.04] border border-white/[0.06] text-xs"
            >
              <span className="text-white/30">{totalRegions} region{totalRegions !== 1 ? "s" : ""}</span>
            </span>
          )}
        </div>
        {isClinician && markers.length > 0 && (
          <motion.button
            onClick={handleClear}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs
              bg-white/[0.06] hover:bg-red-500/15 border border-white/[0.08]
              hover:border-red-400/25 text-white/40 hover:text-red-300
              transition-all duration-200"
          >
            <RotateCcw className="w-3 h-3" />
            Clear All
          </motion.button>
        )}
      </div>

      {/* Main layout: body SVG + panel */}
      <div className="flex gap-3 items-stretch" style={{ minHeight: 420 }}>
        {/* Body SVG column */}
        <div
          className={cn(
            "relative rounded-2xl overflow-hidden transition-all duration-300",
            "bg-white/[0.04] backdrop-blur-xl border border-white/[0.08]",
            panelState ? "w-1/2" : "w-full",
          )}
        >
          {/* Subtle grid lines background */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />

          <div className="relative p-4 h-full flex flex-col items-center justify-center">
            {/* Body SVG */}
            <div className="w-full max-w-[240px] mx-auto">
              <BodySilhouetteSVG
                markers={markers}
                hoveredRegion={hoveredRegion}
                onRegionClick={handleRegionClick}
                onRegionHover={setHoveredRegion}
                onMarkerClick={handleMarkerClick}
              />
            </div>

            {/* Hovered region label */}
            <AnimatePresence>
              {hoveredRegion && !panelState && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2
                    px-3 py-1.5 rounded-full
                    bg-white/[0.1] backdrop-blur-sm border border-white/[0.15]
                    text-xs text-white/70 font-medium whitespace-nowrap"
                >
                  Click to add marker on {BODY_REGIONS.find((r) => r.id === hoveredRegion)?.label}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Empty state overlay */}
            {markers.length === 0 && !panelState && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center"
              >
                <motion.div
                  animate={{ scale: [1, 1.05, 1], opacity: [0.4, 0.6, 0.4] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="w-10 h-10 rounded-full bg-white/[0.04] flex items-center justify-center mx-auto mb-2"
                >
                  <Plus className="w-5 h-5 text-white/20" />
                </motion.div>
                <p className="text-xs text-white/30 leading-relaxed">
                  Click any body area
                  <br />
                  to begin scanning
                </p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Side panel */}
        <AnimatePresence>
          {panelState && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "50%", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="overflow-hidden"
            >
              <SidePanel
                mode={panelState.mode}
                regionId={panelState.regionId}
                marker={panelState.marker}
                onClose={handleClosePanel}
                onAdd={onAddMarker}
                onUpdate={onUpdateMarker}
                onRemove={onRemoveMarker}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Legend bar */}
      <LegendBar markers={markers} />

      {/* Marker summary list (when panel closed) */}
      <AnimatePresence>
        {!panelState && markers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div
              className="rounded-2xl p-4
                bg-white/[0.04] backdrop-blur-xl border border-white/[0.08]"
            >
              <p className="text-[11px] uppercase tracking-wider text-white/30 font-medium mb-3">
                All Markers
              </p>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                <AnimatePresence>
                  {markers.map((m) => (
                    <MarkerSummaryCard
                      key={m.id}
                      marker={m}
                      onClick={() => handleMarkerClick(m)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Session insight (3+ markers) */}
      <AnimatePresence>
        {markers.length >= 3 && !panelState && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="rounded-2xl p-4
              bg-white/[0.04] backdrop-blur-xl border border-white/[0.08]"
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-purple-400/50" />
              <span className="text-[11px] uppercase tracking-wider text-white/40 font-medium">
                Body Scan Insight
              </span>
            </div>
            <BodyInsight markers={markers} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Body Insight Sub-Component ───────────────────────────────────────────────

function BodyInsight({ markers }: { markers: BodyScanMarkerData[] }) {
  const stats = useMemo(() => {
    if (markers.length === 0) return null;

    const intensities = markers.map((m) => m.intensity);
    const avg = intensities.reduce((a, b) => a + b, 0) / intensities.length;
    const max = Math.max(...intensities);
    const highestMarker = markers.find((m) => m.intensity === max);

    // Most common sensation
    const sensationCounts = new Map<string, number>();
    for (const m of markers) {
      sensationCounts.set(m.sensationType, (sensationCounts.get(m.sensationType) ?? 0) + 1);
    }
    let topSensation = markers[0].sensationType;
    let topCount = 0;
    for (const [s, c] of Array.from(sensationCounts)) {
      if (c > topCount) { topCount = c; topSensation = s; }
    }

    // Regions with markers
    const regionSet = new Set(markers.map((m) => m.bodyRegion));

    // Breath reach stats
    const breathMarkers = markers.filter((m) => m.breathReaches !== null);
    const breathReachCount = breathMarkers.filter((m) => m.breathReaches === true).length;

    // Upper vs lower body
    const upperRegions = new Set(["head", "face", "neck", "left-shoulder", "right-shoulder", "chest", "upper-back", "left-arm", "right-arm", "left-hand", "right-hand"]);
    const upperMarkers = markers.filter((m) => upperRegions.has(m.bodyRegion));
    const lowerMarkers = markers.filter((m) => !upperRegions.has(m.bodyRegion));
    const upperAvg = upperMarkers.length > 0
      ? upperMarkers.reduce((a, m) => a + m.intensity, 0) / upperMarkers.length
      : 0;
    const lowerAvg = lowerMarkers.length > 0
      ? lowerMarkers.reduce((a, m) => a + m.intensity, 0) / lowerMarkers.length
      : 0;

    return {
      avg: Math.round(avg * 10) / 10,
      max,
      highestMarker,
      topSensation,
      topCount,
      regionCount: regionSet.size,
      breathReachCount,
      breathTotal: breathMarkers.length,
      upperAvg: Math.round(upperAvg * 10) / 10,
      lowerAvg: Math.round(lowerAvg * 10) / 10,
    };
  }, [markers]);

  if (!stats) return null;

  const topColor = getSensationColor(stats.topSensation);
  const highestRegionLabel = stats.highestMarker
    ? BODY_REGIONS.find((r) => r.id === stats.highestMarker!.bodyRegion)?.label ?? ""
    : "";

  return (
    <div className="space-y-2.5">
      {/* Dominant sensation */}
      <div className="flex items-center gap-2 text-xs text-white/60">
        <div
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: topColor, boxShadow: `0 0 6px ${topColor}50` }}
        />
        <span>
          Most felt: <span className="font-medium text-white/80">{stats.topSensation}</span>
          <span className="text-white/30 ml-1">({stats.topCount}x)</span>
        </span>
      </div>

      {/* Highest intensity */}
      <div className="text-xs text-white/50">
        Highest intensity:{" "}
        <span className="font-semibold text-white/70">{stats.max}/10</span>
        {highestRegionLabel && (
          <span className="text-white/30"> in {highestRegionLabel}</span>
        )}
      </div>

      {/* Average intensity bar */}
      <div className="flex items-center gap-3 text-xs">
        <span className="text-white/40 shrink-0">Avg:</span>
        <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(stats.avg / 10) * 100}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{
              backgroundColor: topColor,
              opacity: 0.6,
            }}
          />
        </div>
        <span className="font-medium text-white/60">{stats.avg}</span>
      </div>

      {/* Upper vs lower body */}
      {stats.upperAvg > 0 && stats.lowerAvg > 0 && (
        <div className="flex items-center gap-2 text-[11px] text-white/40">
          <span>Upper body: <span className="text-white/60">{stats.upperAvg}</span></span>
          <span className="text-white/15">|</span>
          <span>Lower body: <span className="text-white/60">{stats.lowerAvg}</span></span>
        </div>
      )}

      {/* Breath reach */}
      {stats.breathTotal > 0 && (
        <div className="flex items-center gap-1.5 text-[11px] text-white/40">
          <Wind className="w-3 h-3" />
          <span>
            Breath reaches {stats.breathReachCount} of {stats.breathTotal} areas
          </span>
        </div>
      )}

      {/* Region coverage */}
      <div className="text-[11px] text-white/30">
        {stats.regionCount} body region{stats.regionCount !== 1 ? "s" : ""} scanned
      </div>
    </div>
  );
}
