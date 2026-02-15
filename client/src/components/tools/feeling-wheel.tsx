import { useState, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { FEELING_WHEEL_DATA, type EmotionNode } from "@/lib/feeling-wheel-data";
import { playClickSound } from "@/lib/audio-feedback";
import { ClinicianToolbar, type ToolbarControl } from "./clinician-toolbar";
import {
  RotateCcw,
  Trash2,
  X,
  MessageSquare,
  Smile,
  BarChart3,
  StickyNote,
  Layout,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FeelingSelection {
  id: string;
  primaryEmotion: string;
  secondaryEmotion: string | null;
  tertiaryEmotion: string | null;
  selectedBy: string | null;
  createdAt?: string | null;
}

interface FeelingWheelProps {
  selections: FeelingSelection[];
  onSelect: (primary: string, secondary: string | null, tertiary: string | null) => void;
  onClear: () => void;
  isClinician: boolean;
  toolSettings?: Record<string, any>;
  onSettingsUpdate?: (updates: Record<string, any>) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffSec = Math.floor((now - then) / 1000);
  if (diffSec < 10) return "just now";
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${Math.floor(diffHr / 24)}d ago`;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(
  cx: number,
  cy: number,
  innerR: number,
  outerR: number,
  startAngle: number,
  endAngle: number
): string {
  const s1 = polarToCartesian(cx, cy, outerR, startAngle);
  const e1 = polarToCartesian(cx, cy, outerR, endAngle);
  const s2 = polarToCartesian(cx, cy, innerR, endAngle);
  const e2 = polarToCartesian(cx, cy, innerR, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return [
    `M ${s1.x} ${s1.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${e1.x} ${e1.y}`,
    `L ${s2.x} ${s2.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${e2.x} ${e2.y}`,
    "Z",
  ].join(" ");
}

function textOnArc(cx: number, cy: number, r: number, midAngle: number) {
  return polarToCartesian(cx, cy, r, midAngle);
}

// Pre-compute segment layout
interface SegmentInfo {
  primary: EmotionNode;
  secondary?: EmotionNode;
  tertiary?: EmotionNode;
  startAngle: number;
  endAngle: number;
  midAngle: number;
  ring: "primary" | "secondary" | "tertiary";
}

function buildSegments(): SegmentInfo[] {
  const segments: SegmentInfo[] = [];
  // Count total tertiary leaves to get proportional sizing
  let totalTertiary = 0;
  for (const p of FEELING_WHEEL_DATA) {
    for (const s of p.children || []) {
      totalTertiary += (s.children || []).length || 1;
    }
  }

  let currentAngle = 0;
  for (const primary of FEELING_WHEEL_DATA) {
    const primaryStart = currentAngle;
    let primaryTertiaryCount = 0;
    for (const sec of primary.children || []) {
      primaryTertiaryCount += (sec.children || []).length || 1;
    }
    const primarySpan = (primaryTertiaryCount / totalTertiary) * 360;

    // secondaries
    let secStart = primaryStart;
    for (const secondary of primary.children || []) {
      const secTertiaryCount = (secondary.children || []).length || 1;
      const secSpan = (secTertiaryCount / totalTertiary) * 360;

      // tertiaries
      let terStart = secStart;
      for (const tertiary of secondary.children || []) {
        const terSpan = secSpan / ((secondary.children || []).length || 1);
        segments.push({
          primary,
          secondary,
          tertiary,
          startAngle: terStart,
          endAngle: terStart + terSpan,
          midAngle: terStart + terSpan / 2,
          ring: "tertiary",
        });
        terStart += terSpan;
      }

      segments.push({
        primary,
        secondary,
        startAngle: secStart,
        endAngle: secStart + secSpan,
        midAngle: secStart + secSpan / 2,
        ring: "secondary",
      });
      secStart += secSpan;
    }

    segments.push({
      primary,
      startAngle: primaryStart,
      endAngle: primaryStart + primarySpan,
      midAngle: primaryStart + primarySpan / 2,
      ring: "primary",
    });

    currentAngle += primarySpan;
  }

  return segments;
}

const ALL_SEGMENTS = buildSegments();

// ─── SVG Wheel Component ──────────────────────────────────────────────────────

function SVGWheel({
  onSelect,
  showEmoji,
  selectedId,
  onHover,
  hoveredId,
}: {
  onSelect: (primary: string, secondary: string | null, tertiary: string | null) => void;
  showEmoji: boolean;
  selectedId: string | null;
  onHover: (id: string | null) => void;
  hoveredId: string | null;
}) {
  const size = 380;
  const cx = size / 2;
  const cy = size / 2;
  const innerR1 = 45;
  const outerR1 = 95;
  const innerR2 = 98;
  const outerR2 = 145;
  const innerR3 = 148;
  const outerR3 = 185;

  const primarySegments = ALL_SEGMENTS.filter((s) => s.ring === "primary");
  const secondarySegments = ALL_SEGMENTS.filter((s) => s.ring === "secondary");
  const tertiarySegments = ALL_SEGMENTS.filter((s) => s.ring === "tertiary");

  const segId = (s: SegmentInfo) => {
    if (s.ring === "tertiary") return `${s.primary.label}-${s.secondary?.label}-${s.tertiary?.label}`;
    if (s.ring === "secondary") return `${s.primary.label}-${s.secondary?.label}`;
    return s.primary.label;
  };

  const handleClick = (s: SegmentInfo) => {
    playClickSound();
    if (s.ring === "tertiary") {
      onSelect(s.primary.label, s.secondary!.label, s.tertiary!.label);
    } else if (s.ring === "secondary") {
      onSelect(s.primary.label, s.secondary!.label, null);
    } else {
      onSelect(s.primary.label, null, null);
    }
  };

  const renderSegment = (
    s: SegmentInfo,
    innerR: number,
    outerR: number,
    color: string,
    label: string,
    emoji: string | undefined
  ) => {
    const id = segId(s);
    const isSelected = selectedId === id;
    const isHovered = hoveredId === id;
    const d = arcPath(cx, cy, innerR, outerR, s.startAngle, s.endAngle);
    const midR = (innerR + outerR) / 2;
    const tp = textOnArc(cx, cy, midR, s.midAngle);
    const spanAngle = s.endAngle - s.startAngle;
    const fontSize = s.ring === "tertiary" ? 7 : s.ring === "secondary" ? 8 : 11;
    const showText = spanAngle > 8;

    // Rotate text so it's readable
    let textRotation = s.midAngle;
    if (textRotation > 90 && textRotation < 270) {
      textRotation += 180;
    }

    return (
      <g key={id} className="cursor-pointer" onClick={() => handleClick(s)}>
        <path
          d={d}
          fill={color}
          stroke="white"
          strokeWidth={1.5}
          opacity={isSelected ? 1 : isHovered ? 0.9 : 0.8}
          onMouseEnter={() => onHover(id)}
          onMouseLeave={() => onHover(null)}
          style={{
            filter: isSelected
              ? `drop-shadow(0 0 8px ${color})`
              : isHovered
              ? `drop-shadow(0 0 4px ${color})`
              : "none",
            transition: "opacity 0.2s, filter 0.2s",
          }}
        />
        {showText && (
          <text
            x={tp.x}
            y={tp.y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={fontSize}
            fontWeight={s.ring === "primary" ? 700 : 500}
            fill={s.ring === "primary" ? "#333" : "#444"}
            transform={`rotate(${textRotation}, ${tp.x}, ${tp.y})`}
            pointerEvents="none"
            className="select-none"
          >
            {showEmoji && emoji ? `${emoji} ` : ""}
            {label}
          </text>
        )}
      </g>
    );
  };

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="w-full max-w-[380px] aspect-square"
      role="img"
      aria-label="Feeling Wheel"
    >
      {/* Primary ring */}
      {primarySegments.map((s) =>
        renderSegment(s, innerR1, outerR1, s.primary.color, s.primary.label, s.primary.emoji)
      )}
      {/* Secondary ring */}
      {secondarySegments.map((s) =>
        renderSegment(
          s,
          innerR2,
          outerR2,
          s.secondary!.color,
          s.secondary!.label,
          s.secondary!.emoji
        )
      )}
      {/* Tertiary ring */}
      {tertiarySegments.map((s) =>
        renderSegment(
          s,
          innerR3,
          outerR3,
          s.tertiary!.color || s.secondary!.color,
          s.tertiary!.label,
          s.tertiary!.emoji
        )
      )}
      {/* Center circle */}
      <circle cx={cx} cy={cy} r={innerR1 - 2} fill="white" fillOpacity={0.7} />
      <text
        x={cx}
        y={cy - 6}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
        fontWeight={600}
        fill="#5a5a5a"
        className="select-none"
      >
        How do
      </text>
      <text
        x={cx}
        y={cy + 8}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
        fontWeight={600}
        fill="#5a5a5a"
        className="select-none"
      >
        you feel?
      </text>
    </svg>
  );
}

// ─── Card View ────────────────────────────────────────────────────────────────

function CardView({
  onSelect,
  showEmoji,
}: {
  onSelect: (primary: string, secondary: string | null, tertiary: string | null) => void;
  showEmoji: boolean;
}) {
  const [flippedCard, setFlippedCard] = useState<string | null>(null);
  const [drillSecondary, setDrillSecondary] = useState<{
    primary: EmotionNode;
    secondary: EmotionNode;
  } | null>(null);

  const handleCardClick = useCallback(
    (emotion: EmotionNode) => {
      playClickSound();
      setFlippedCard((prev) => (prev === emotion.label ? null : emotion.label));
      setDrillSecondary(null);
    },
    []
  );

  const handleSecondaryClick = useCallback(
    (primary: EmotionNode, secondary: EmotionNode) => {
      playClickSound();
      if (secondary.children && secondary.children.length > 0) {
        setDrillSecondary({ primary, secondary });
      } else {
        onSelect(primary.label, secondary.label, null);
      }
    },
    [onSelect]
  );

  const handleTertiaryClick = useCallback(
    (primary: string, secondary: string, tertiary: string) => {
      playClickSound();
      onSelect(primary, secondary, tertiary);
      setFlippedCard(null);
      setDrillSecondary(null);
    },
    [onSelect]
  );

  return (
    <div className="w-full max-w-md px-2">
      <AnimatePresence mode="wait">
        {drillSecondary ? (
          <motion.div
            key="tertiary-drill"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-3"
          >
            <button
              onClick={() => {
                playClickSound();
                setDrillSecondary(null);
              }}
              className="min-h-[44px] flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
            >
              <X size={14} />
              Back to {drillSecondary.primary.label}
            </button>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground text-center">
              Within{" "}
              <span style={{ color: drillSecondary.secondary.color }}>
                {drillSecondary.secondary.label}
              </span>
              ...
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {drillSecondary.secondary.children?.map((ter, i) => (
                <motion.button
                  key={ter.label}
                  onClick={() =>
                    handleTertiaryClick(
                      drillSecondary.primary.label,
                      drillSecondary.secondary.label,
                      ter.label
                    )
                  }
                  className="min-w-[44px] min-h-[44px] px-5 py-3 rounded-xl text-sm font-medium cursor-pointer bg-white/70 text-primary border border-white/30 hover:bg-white hover:shadow-md transition-all"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {showEmoji && ter.emoji ? `${ter.emoji} ` : ""}
                  {ter.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="card-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-3 gap-3"
          >
            {FEELING_WHEEL_DATA.map((emotion, i) => {
              const isFlipped = flippedCard === emotion.label;
              return (
                <div key={emotion.label} className="perspective-[800px]">
                  <motion.div
                    className="relative w-full min-h-[120px] cursor-pointer"
                    style={{ transformStyle: "preserve-3d" }}
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.5, type: "spring", stiffness: 200, damping: 20 }}
                    onClick={() => !isFlipped && handleCardClick(emotion)}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                  >
                    {/* Front */}
                    <div
                      className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center gap-2 border border-white/30 shadow-md"
                      style={{
                        backfaceVisibility: "hidden",
                        backgroundColor: `${emotion.color}33`,
                      }}
                    >
                      {showEmoji && (
                        <span className="text-3xl">{emotion.emoji}</span>
                      )}
                      <span
                        className="text-sm font-semibold"
                        style={{ color: emotion.color }}
                      >
                        {emotion.label}
                      </span>
                    </div>
                    {/* Back */}
                    <div
                      className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center gap-1.5 p-2 border border-white/30 shadow-md overflow-hidden"
                      style={{
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                        backgroundColor: `${emotion.color}22`,
                      }}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCardClick(emotion);
                        }}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-white/50 flex items-center justify-center text-muted-foreground hover:bg-white/80 cursor-pointer"
                      >
                        <X size={12} />
                      </button>
                      {emotion.children?.map((sec) => (
                        <button
                          key={sec.label}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSecondaryClick(emotion, sec);
                          }}
                          className="min-h-[28px] w-full text-xs font-medium px-2 py-1 rounded-lg hover:bg-white/50 transition-colors cursor-pointer truncate"
                          style={{ color: sec.color }}
                        >
                          {showEmoji && sec.emoji ? `${sec.emoji} ` : ""}
                          {sec.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Button View (original) ──────────────────────────────────────────────────

function ButtonView({
  onSelect,
  showEmoji,
}: {
  onSelect: (primary: string, secondary: string | null, tertiary: string | null) => void;
  showEmoji: boolean;
}) {
  const [expandedPrimary, setExpandedPrimary] = useState<string | null>(null);
  const [expandedSecondary, setExpandedSecondary] = useState<string | null>(null);

  const selectedPrimary = useMemo(
    () => FEELING_WHEEL_DATA.find((e) => e.label === expandedPrimary),
    [expandedPrimary]
  );
  const selectedSecondary = useMemo(
    () => selectedPrimary?.children?.find((e) => e.label === expandedSecondary),
    [selectedPrimary, expandedSecondary]
  );

  const handlePrimaryClick = useCallback(
    (emotion: EmotionNode) => {
      playClickSound();
      if (expandedPrimary === emotion.label) {
        setExpandedPrimary(null);
        setExpandedSecondary(null);
      } else {
        setExpandedPrimary(emotion.label);
        setExpandedSecondary(null);
      }
    },
    [expandedPrimary]
  );

  const handleSecondaryClick = useCallback(
    (emotion: EmotionNode) => {
      playClickSound();
      if (expandedSecondary === emotion.label) {
        setExpandedSecondary(null);
      } else {
        setExpandedSecondary(emotion.label);
      }
    },
    [expandedSecondary]
  );

  const handleTertiaryClick = useCallback(
    (primary: string, secondary: string, tertiary: string) => {
      playClickSound();
      onSelect(primary, secondary, tertiary);
    },
    [onSelect]
  );

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md">
      {/* Primary */}
      <div className="flex flex-wrap justify-center gap-2 md:gap-3">
        {FEELING_WHEEL_DATA.map((emotion, i) => (
          <motion.button
            key={emotion.label}
            onClick={() => handlePrimaryClick(emotion)}
            className={cn(
              "min-w-[44px] min-h-[44px] px-4 py-3 rounded-2xl font-medium text-sm transition-all cursor-pointer border-2",
              expandedPrimary === emotion.label
                ? "text-white shadow-lg scale-105 border-white/30"
                : "bg-white/60 backdrop-blur-sm text-primary border-white/30 hover:bg-white/80 hover:shadow-md"
            )}
            style={
              expandedPrimary === emotion.label
                ? { backgroundColor: emotion.color, borderColor: emotion.color }
                : {}
            }
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: expandedPrimary === emotion.label ? 1.05 : 1 }}
            transition={{ delay: i * 0.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {showEmoji && emotion.emoji ? `${emotion.emoji} ` : ""}
            {emotion.label}
          </motion.button>
        ))}
      </div>

      {/* Secondary */}
      <AnimatePresence mode="wait">
        {selectedPrimary && (
          <motion.div
            key={`secondary-${expandedPrimary}`}
            initial={{ opacity: 0, y: 20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="w-full"
          >
            <div className="p-4 rounded-2xl bg-white/50 backdrop-blur-md border border-white/30">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 text-center">
                Within <span style={{ color: selectedPrimary.color }}>{selectedPrimary.label}</span>
                , I feel...
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {selectedPrimary.children?.map((sec, i) => (
                  <motion.button
                    key={sec.label}
                    onClick={() => handleSecondaryClick(sec)}
                    className={cn(
                      "min-w-[44px] min-h-[44px] px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all border",
                      expandedSecondary === sec.label
                        ? "text-white shadow-md border-white/30"
                        : "bg-white/60 text-primary border-white/20 hover:bg-white/80"
                    )}
                    style={
                      expandedSecondary === sec.label
                        ? { backgroundColor: sec.color, borderColor: sec.color }
                        : {}
                    }
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {showEmoji && sec.emoji ? `${sec.emoji} ` : ""}
                    {sec.label}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tertiary */}
      <AnimatePresence mode="wait">
        {selectedSecondary && expandedPrimary && (
          <motion.div
            key={`tertiary-${expandedSecondary}`}
            initial={{ opacity: 0, y: 20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="w-full"
          >
            <div className="p-4 rounded-2xl bg-white/40 backdrop-blur-md border border-white/20">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 text-center">
                More specifically...
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {selectedSecondary.children?.map((ter, i) => (
                  <motion.button
                    key={ter.label}
                    onClick={() =>
                      handleTertiaryClick(expandedPrimary, expandedSecondary!, ter.label)
                    }
                    className="min-w-[44px] min-h-[44px] px-5 py-3 rounded-xl text-sm font-medium cursor-pointer bg-white/70 text-primary border border-white/30 hover:bg-white hover:shadow-md transition-all"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.08 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {showEmoji && ter.emoji ? `${ter.emoji} ` : ""}
                    {ter.label}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Insights Panel ───────────────────────────────────────────────────────────

function InsightsPanel({ selections }: { selections: FeelingSelection[] }) {
  const distribution = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of selections) {
      counts[s.primaryEmotion] = (counts[s.primaryEmotion] || 0) + 1;
    }
    return FEELING_WHEEL_DATA.map((e) => ({
      label: e.label,
      color: e.color,
      emoji: e.emoji || "",
      count: counts[e.label] || 0,
    })).filter((d) => d.count > 0);
  }, [selections]);

  const dominant = useMemo(() => {
    if (distribution.length === 0) return null;
    return distribution.reduce((a, b) => (b.count > a.count ? b : a));
  }, [distribution]);

  const uniquePrimaries = useMemo(() => {
    const set = new Set(selections.map((s) => s.primaryEmotion));
    return set.size;
  }, [selections]);

  const maxCount = useMemo(() => Math.max(...distribution.map((d) => d.count), 1), [distribution]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <div className="p-4 rounded-2xl bg-white/50 backdrop-blur-md border border-white/30 space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 size={14} className="text-muted-foreground" />
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Emotion Insights
          </p>
        </div>

        {/* Dominant emotion callout */}
        {dominant && (
          <div
            className="flex items-center gap-3 p-3 rounded-xl border"
            style={{
              backgroundColor: `${dominant.color}15`,
              borderColor: `${dominant.color}40`,
            }}
          >
            <span className="text-2xl">{dominant.emoji}</span>
            <div>
              <p className="text-xs text-muted-foreground">Dominant emotion</p>
              <p className="font-serif text-lg font-semibold" style={{ color: dominant.color }}>
                {dominant.label}
              </p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xs text-muted-foreground">Range</p>
              <p className="font-semibold text-primary">
                {uniquePrimaries}/6
              </p>
            </div>
          </div>
        )}

        {/* Bar chart */}
        <div className="space-y-2">
          {distribution
            .sort((a, b) => b.count - a.count)
            .map((d) => (
              <div key={d.label} className="flex items-center gap-2">
                <span className="text-xs w-20 text-right text-muted-foreground truncate">
                  {d.emoji} {d.label}
                </span>
                <div className="flex-1 h-5 bg-white/30 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: d.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(d.count / maxCount) * 100}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                </div>
                <span className="text-xs font-medium text-muted-foreground w-6 text-right">
                  {d.count}
                </span>
              </div>
            ))}
        </div>

        {/* Session timeline */}
        {selections.length > 1 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">Session Timeline</p>
            <div className="relative h-6 flex items-center">
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-muted-foreground/20" />
              {selections.map((s, i) => {
                const emotionData = FEELING_WHEEL_DATA.find((e) => e.label === s.primaryEmotion);
                const left = selections.length === 1 ? 50 : (i / (selections.length - 1)) * 100;
                return (
                  <div
                    key={s.id}
                    className="absolute w-3 h-3 rounded-full border-2 border-white -translate-x-1/2"
                    style={{
                      left: `${left}%`,
                      backgroundColor: emotionData?.color || "#ccc",
                    }}
                    title={`${s.primaryEmotion}${s.secondaryEmotion ? ` → ${s.secondaryEmotion}` : ""}${s.tertiaryEmotion ? ` → ${s.tertiaryEmotion}` : ""}`}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Selection History ────────────────────────────────────────────────────────

function SelectionHistory({
  selections,
  isClinician,
  onClear,
  allowNotes,
}: {
  selections: FeelingSelection[];
  isClinician: boolean;
  onClear: () => void;
  allowNotes: boolean;
}) {
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [expandedNote, setExpandedNote] = useState<string | null>(null);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  const visibleSelections = useMemo(
    () => selections.filter((s) => !deletedIds.has(s.id)).reverse(),
    [selections, deletedIds]
  );

  const handleDelete = useCallback((id: string) => {
    playClickSound();
    setDeletedIds((prev) => new Set(prev).add(id));
  }, []);

  if (visibleSelections.length === 0) return null;

  return (
    <motion.div className="w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="p-4 rounded-2xl bg-white/30 backdrop-blur-sm border border-white/20">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Identified Feelings
          </p>
          {isClinician && (
            <button
              onClick={onClear}
              className="min-w-[44px] min-h-[44px] p-2 rounded-lg hover:bg-white/50 transition-colors cursor-pointer text-muted-foreground hover:text-destructive"
              title="Clear all selections"
            >
              <RotateCcw size={14} />
            </button>
          )}
        </div>
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {visibleSelections.map((sel, i) => {
            const primaryData = FEELING_WHEEL_DATA.find((e) => e.label === sel.primaryEmotion);
            const isNoteExpanded = expandedNote === sel.id;
            return (
              <motion.div
                key={sel.id}
                className="group"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <div className="flex items-center gap-2 text-sm">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: primaryData?.color || "#ccc" }}
                  />
                  {primaryData?.emoji && (
                    <span className="text-sm">{primaryData.emoji}</span>
                  )}
                  <span className="text-primary font-medium">{sel.primaryEmotion}</span>
                  {sel.secondaryEmotion && (
                    <>
                      <span className="text-muted-foreground/50">&rarr;</span>
                      <span className="text-muted-foreground">{sel.secondaryEmotion}</span>
                    </>
                  )}
                  {sel.tertiaryEmotion && (
                    <>
                      <span className="text-muted-foreground/50">&rarr;</span>
                      <span className="text-muted-foreground italic">{sel.tertiaryEmotion}</span>
                    </>
                  )}
                  <span className="ml-auto text-[10px] text-muted-foreground/50 shrink-0">
                    {relativeTime(sel.createdAt)}
                  </span>
                  {allowNotes && (
                    <button
                      onClick={() => {
                        playClickSound();
                        setExpandedNote(isNoteExpanded ? null : sel.id);
                      }}
                      className="min-w-[28px] min-h-[28px] p-1 rounded-md hover:bg-white/50 transition-colors cursor-pointer text-muted-foreground/40 hover:text-muted-foreground"
                      title="Add reflection"
                    >
                      <MessageSquare size={12} />
                    </button>
                  )}
                  {isClinician && (
                    <button
                      onClick={() => handleDelete(sel.id)}
                      className="min-w-[28px] min-h-[28px] p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-white/50 transition-all cursor-pointer text-muted-foreground/40 hover:text-destructive"
                      title="Remove"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
                <AnimatePresence>
                  {isNoteExpanded && allowNotes && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <textarea
                        value={notes[sel.id] || ""}
                        onChange={(e) =>
                          setNotes((prev) => ({ ...prev, [sel.id]: e.target.value }))
                        }
                        placeholder="Write a reflection..."
                        className="mt-2 w-full min-h-[44px] text-xs p-2 rounded-lg bg-white/50 border border-white/30 resize-none focus:outline-none focus:ring-1 focus:ring-primary/30 text-primary placeholder:text-muted-foreground/40"
                        rows={2}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
                {notes[sel.id] && !isNoteExpanded && (
                  <p className="text-[10px] text-muted-foreground/60 mt-0.5 ml-5 italic truncate">
                    {notes[sel.id]}
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function FeelingWheel({
  selections,
  onSelect,
  onClear,
  isClinician,
  toolSettings,
  onSettingsUpdate,
}: FeelingWheelProps) {
  const settings = toolSettings || {};
  const wheelStyle: "wheel" | "buttons" | "cards" = settings.wheelStyle || "wheel";
  const showEmoji: boolean = settings.showEmoji !== undefined ? settings.showEmoji : true;
  const showInsights: boolean = settings.showInsights !== undefined ? settings.showInsights : true;
  const allowNotes: boolean = settings.allowNotes !== undefined ? settings.allowNotes : true;

  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null);
  const [hoveredSegmentId, setHoveredSegmentId] = useState<string | null>(null);

  const handleWheelSelect = useCallback(
    (primary: string, secondary: string | null, tertiary: string | null) => {
      const id = [primary, secondary, tertiary].filter(Boolean).join("-");
      setSelectedSegmentId(id);
      onSelect(primary, secondary, tertiary);
    },
    [onSelect]
  );

  const handleSettingsUpdate = useCallback(
    (updates: Record<string, any>) => {
      onSettingsUpdate?.(updates);
    },
    [onSettingsUpdate]
  );

  // Clinician toolbar controls
  const toolbarControls: ToolbarControl[] = useMemo(
    () => [
      {
        type: "cycle" as const,
        key: "wheelStyle",
        icon: Layout,
        label: "View Style",
        options: [
          { value: "wheel", label: "Wheel" },
          { value: "buttons", label: "Buttons" },
          { value: "cards", label: "Cards" },
        ],
        activeColor: "purple",
      },
      {
        type: "toggle" as const,
        key: "showEmoji",
        icon: Smile,
        label: "Show Emoji",
        activeLabel: "Emoji On",
        activeColor: "amber",
      },
      {
        type: "toggle" as const,
        key: "showInsights",
        icon: BarChart3,
        label: "Show Insights",
        activeLabel: "Insights On",
        activeColor: "sky",
      },
      {
        type: "toggle" as const,
        key: "allowNotes",
        icon: StickyNote,
        label: "Allow Notes",
        activeLabel: "Notes On",
        activeColor: "emerald",
      },
    ],
    []
  );

  return (
    <div
      className="w-full h-full flex flex-col items-center relative overflow-y-auto overflow-x-hidden"
      data-testid="feeling-wheel-container"
      style={{
        background: "linear-gradient(145deg, #f8f6f3 0%, #f0ede8 50%, #e8e4dd 100%)",
      }}
    >
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 30%, rgba(201,169,110,0.3) 0%, transparent 50%)",
        }}
      />

      {/* Clinician toolbar */}
      {isClinician && onSettingsUpdate && (
        <ClinicianToolbar
          controls={toolbarControls}
          settings={settings}
          onUpdate={handleSettingsUpdate}
          onClear={onClear}
        />
      )}

      <div className="flex flex-col items-center gap-6 w-full max-w-lg px-4 py-6 relative z-10">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="font-serif text-2xl md:text-3xl text-primary mb-1">Feeling Wheel</h2>
          <p className="text-sm text-muted-foreground">Explore and name what you&apos;re feeling</p>
        </motion.div>

        {/* View switcher */}
        <AnimatePresence mode="wait">
          {wheelStyle === "wheel" && (
            <motion.div
              key="wheel-view"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="w-full flex justify-center"
            >
              <SVGWheel
                onSelect={handleWheelSelect}
                showEmoji={showEmoji}
                selectedId={selectedSegmentId}
                onHover={setHoveredSegmentId}
                hoveredId={hoveredSegmentId}
              />
            </motion.div>
          )}

          {wheelStyle === "buttons" && (
            <motion.div
              key="button-view"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="w-full flex justify-center"
            >
              <ButtonView onSelect={onSelect} showEmoji={showEmoji} />
            </motion.div>
          )}

          {wheelStyle === "cards" && (
            <motion.div
              key="card-view"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="w-full flex justify-center"
            >
              <CardView onSelect={onSelect} showEmoji={showEmoji} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Insights Panel (clinician only, 3+ selections) */}
        {isClinician && showInsights && selections.length >= 3 && (
          <InsightsPanel selections={selections} />
        )}

        {/* Selection History */}
        <SelectionHistory
          selections={selections}
          isClinician={isClinician}
          onClear={onClear}
          allowNotes={allowNotes}
        />
      </div>
    </div>
  );
}
