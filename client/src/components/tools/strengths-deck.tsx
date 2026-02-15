import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { CHARACTER_STRENGTHS, VIRTUES } from "@/lib/strengths-data";
import { playClickSound } from "@/lib/audio-feedback";
import { Plus, X, Check, ChevronDown, Star, Eye, Sparkles, Filter, FileText, BookOpen, BarChart3, GitCompareArrows, Trophy } from "lucide-react";
import { ClinicianToolbar, type ToolbarControl } from "./clinician-toolbar";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface StrengthsPlacementData {
  id: string;
  strengthId: string;
  tier: string; // "signature" | "middle" | "lesser"
  orderIndex: number;
  scenarioResponse: string | null;
  createdBy: string | null;
  createdAt: string;
}

export interface StrengthsSpottingData {
  id: string;
  strengthId: string;
  note: string;
  createdBy: string | null;
  createdAt: string;
}

export interface StrengthsDeckProps {
  placements: StrengthsPlacementData[];
  spottings: StrengthsSpottingData[];
  onPlace: (strengthId: string, tier: string, orderIndex: number, scenarioResponse: string | null) => void;
  onMove: (placementId: string, tier: string, orderIndex: number) => void;
  onRemove: (placementId: string) => void;
  onSpot: (strengthId: string, note: string) => void;
  onClear: () => void;
  isClinician: boolean;
  toolSettings?: Record<string, any>;
  onSettingsUpdate?: (updates: Record<string, any>) => void;
}

// ─── Clinician Toolbar Settings ─────────────────────────────────────────────

interface StrengthsDeckSettings {
  showDescriptions: boolean;
  showSpottingMode: boolean;
}

const DEFAULT_STRENGTHS_DECK_SETTINGS: StrengthsDeckSettings = {
  showDescriptions: true,
  showSpottingMode: true,
};

const STRENGTHS_DECK_TOOLBAR_CONTROLS: ToolbarControl[] = [
  {
    type: "toggle",
    key: "showDescriptions",
    icon: FileText,
    label: "Descriptions",
    activeColor: "sky",
  },
  {
    type: "toggle",
    key: "showSpottingMode",
    icon: Eye,
    label: "Spotting",
    activeColor: "purple",
  },
];

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TIERS = [
  {
    id: "signature",
    label: "Signature Strengths",
    sublabel: "Strengths that feel most like the real you",
    color: "#D4A017",
    gradient: "linear-gradient(135deg, rgba(212,160,23,0.15), rgba(212,160,23,0.05))",
    borderColor: "rgba(212,160,23,0.35)",
    badgeClass: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  },
  {
    id: "middle",
    label: "Middle Strengths",
    sublabel: "Strengths you use situationally",
    color: "#A0AEC0",
    gradient: "linear-gradient(135deg, rgba(160,174,192,0.12), rgba(160,174,192,0.04))",
    borderColor: "rgba(160,174,192,0.3)",
    badgeClass: "bg-slate-400/20 text-slate-300 border-slate-400/30",
  },
  {
    id: "lesser",
    label: "Lesser Strengths",
    sublabel: "Strengths you use less often",
    color: "#B87333",
    gradient: "linear-gradient(135deg, rgba(184,115,51,0.12), rgba(184,115,51,0.04))",
    borderColor: "rgba(184,115,51,0.3)",
    badgeClass: "bg-orange-700/20 text-orange-300 border-orange-700/30",
  },
] as const;

function getVirtueColor(virtueId: string): string {
  return VIRTUES.find((v) => v.id === virtueId)?.color ?? "#9CA3AF";
}

function getVirtueName(virtueId: string): string {
  return VIRTUES.find((v) => v.id === virtueId)?.name ?? virtueId;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Small virtue color dot */
function VirtueDot({ virtueId, size = 8 }: { virtueId: string; size?: number }) {
  return (
    <span
      className="inline-block rounded-full flex-shrink-0"
      style={{
        width: size,
        height: size,
        backgroundColor: getVirtueColor(virtueId),
        boxShadow: `0 0 6px ${getVirtueColor(virtueId)}60`,
      }}
    />
  );
}

/** Compact card shown inside a tier */
function PlacedCard({
  placement,
  spottingCount,
  hasStory,
  onTap,
  isSpottingMode,
}: {
  placement: StrengthsPlacementData;
  spottingCount: number;
  hasStory: boolean;
  onTap: () => void;
  isSpottingMode: boolean;
}) {
  const strength = CHARACTER_STRENGTHS.find((s) => s.id === placement.strengthId);
  if (!strength) return null;
  const virtueColor = getVirtueColor(strength.virtue);

  return (
    <motion.button
      layout
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      onClick={onTap}
      className={cn(
        "relative flex items-center gap-2 px-3 py-2 rounded-xl border",
        "backdrop-blur-md cursor-pointer select-none text-left",
        "transition-colors duration-200",
        isSpottingMode
          ? "ring-2 ring-purple-400/50 hover:ring-purple-400/80"
          : "hover:brightness-110"
      )}
      style={{
        background: `linear-gradient(135deg, ${virtueColor}18, ${virtueColor}08)`,
        borderColor: `${virtueColor}35`,
      }}
    >
      <span className="text-lg leading-none">{strength.emoji}</span>
      <span className="text-xs font-medium text-white/90 truncate">
        {strength.name}
      </span>
      {hasStory && (
        <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[8px] font-bold text-emerald-300 uppercase tracking-wider flex-shrink-0">
          <BookOpen className="w-2.5 h-2.5" />
          Story
        </span>
      )}
      {spottingCount > 0 && (
        <span
          className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold border"
          style={{
            backgroundColor: `${virtueColor}30`,
            borderColor: `${virtueColor}60`,
            color: virtueColor,
          }}
        >
          {spottingCount}
        </span>
      )}
      {isSpottingMode && (
        <Eye className="w-3 h-3 text-purple-400 ml-auto flex-shrink-0" />
      )}
    </motion.button>
  );
}

/** Progress ring SVG */
function ProgressRing({ placed, total }: { placed: number; total: number }) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const progress = total > 0 ? placed / total : 0;
  const offset = circumference * (1 - progress);

  return (
    <div className="relative flex items-center justify-center w-12 h-12">
      <svg viewBox="0 0 44 44" className="w-full h-full -rotate-90">
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="3"
        />
        <motion.circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          stroke="url(#progressGrad)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id="progressGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#D4A017" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>
      </svg>
      <span className="absolute text-[10px] font-bold text-white/80">
        {placed}/{total}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Virtue Wheel Visualization (radar chart)
// ---------------------------------------------------------------------------

function VirtueWheel({
  placements,
}: {
  placements: StrengthsPlacementData[];
}) {
  const signaturePlacements = placements.filter((p) => p.tier === "signature");
  const virtueScores = useMemo(() => {
    const counts: Record<string, number> = {};
    const maxPerVirtue: Record<string, number> = {};
    for (const v of VIRTUES) {
      counts[v.id] = 0;
      maxPerVirtue[v.id] = CHARACTER_STRENGTHS.filter(
        (s) => s.virtue === v.id
      ).length;
    }
    for (const p of signaturePlacements) {
      const strength = CHARACTER_STRENGTHS.find(
        (s) => s.id === p.strengthId
      );
      if (strength) {
        counts[strength.virtue] = (counts[strength.virtue] ?? 0) + 1;
      }
    }
    return VIRTUES.map((v) => ({
      virtue: v,
      count: counts[v.id] ?? 0,
      max: maxPerVirtue[v.id] ?? 1,
      ratio: maxPerVirtue[v.id] > 0 ? (counts[v.id] ?? 0) / maxPerVirtue[v.id] : 0,
    }));
  }, [signaturePlacements]);

  const cx = 100;
  const cy = 100;
  const maxR = 70;
  const minR = 15;
  const numSpokes = VIRTUES.length;

  const getPoint = (index: number, radius: number) => {
    const angle = (Math.PI * 2 * index) / numSpokes - Math.PI / 2;
    return {
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
    };
  };

  // Build the filled polygon path
  const dataPoints = virtueScores.map((vs, i) => {
    const r = minR + vs.ratio * (maxR - minR);
    return getPoint(i, r);
  });
  const dataPath = dataPoints
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ") + " Z";

  // Grid rings
  const rings = [0.25, 0.5, 0.75, 1.0];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 className="w-3.5 h-3.5 text-amber-400/70" />
        <h4 className="text-xs font-semibold text-white/70 tracking-wide">
          Virtue Wheel
        </h4>
        <span className="text-[10px] text-white/30 ml-auto">
          Based on signature strengths
        </span>
      </div>
      <div className="flex justify-center">
        <svg viewBox="0 0 200 200" className="w-48 h-48">
          {/* Grid rings */}
          {rings.map((r) => {
            const ringR = minR + r * (maxR - minR);
            const ringPoints = Array.from({ length: numSpokes }, (_, i) =>
              getPoint(i, ringR)
            );
            const ringPath = ringPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";
            return (
              <path
                key={r}
                d={ringPath}
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="0.5"
              />
            );
          })}

          {/* Spokes */}
          {VIRTUES.map((v, i) => {
            const outer = getPoint(i, maxR + 5);
            return (
              <line
                key={v.id}
                x1={cx}
                y1={cy}
                x2={outer.x}
                y2={outer.y}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="0.5"
              />
            );
          })}

          {/* Data polygon */}
          <motion.path
            d={dataPath}
            fill="rgba(212,160,23,0.12)"
            stroke="rgba(212,160,23,0.5)"
            strokeWidth="1.5"
            strokeLinejoin="round"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />

          {/* Data dots & virtue labels */}
          {virtueScores.map((vs, i) => {
            const r = minR + vs.ratio * (maxR - minR);
            const pt = getPoint(i, r);
            const labelPt = getPoint(i, maxR + 18);
            return (
              <g key={vs.virtue.id}>
                <motion.circle
                  cx={pt.x}
                  cy={pt.y}
                  r="3"
                  fill={vs.virtue.color}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                />
                <text
                  x={labelPt.x}
                  y={labelPt.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={vs.virtue.color}
                  fontSize="7"
                  fontWeight="600"
                >
                  {vs.virtue.name}
                </text>
                {vs.count > 0 && (
                  <text
                    x={labelPt.x}
                    y={labelPt.y + 9}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="rgba(255,255,255,0.35)"
                    fontSize="6"
                  >
                    {vs.count}/{vs.max}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Session Progress Tracker
// ---------------------------------------------------------------------------

function SessionProgressTracker({
  placements,
  totalStrengths,
}: {
  placements: StrengthsPlacementData[];
  totalStrengths: number;
}) {
  const placedCount = placements.length;
  const progress = totalStrengths > 0 ? placedCount / totalStrengths : 0;

  const tierCounts = useMemo(() => {
    const counts: Record<string, number> = { signature: 0, middle: 0, lesser: 0 };
    for (const p of placements) {
      counts[p.tier] = (counts[p.tier] ?? 0) + 1;
    }
    return counts;
  }, [placements]);

  const topVirtue = useMemo(() => {
    const sigPlacements = placements.filter((p) => p.tier === "signature");
    if (sigPlacements.length === 0) return null;
    const virtueCounts: Record<string, number> = {};
    for (const p of sigPlacements) {
      const strength = CHARACTER_STRENGTHS.find((s) => s.id === p.strengthId);
      if (strength) {
        virtueCounts[strength.virtue] = (virtueCounts[strength.virtue] ?? 0) + 1;
      }
    }
    let best = "";
    let bestCount = 0;
    for (const [vid, count] of Object.entries(virtueCounts)) {
      if (count > bestCount) {
        best = vid;
        bestCount = count;
      }
    }
    return best ? VIRTUES.find((v) => v.id === best) ?? null : null;
  }, [placements]);

  if (placedCount === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm p-4 space-y-3"
    >
      <div className="flex items-center gap-2">
        <Trophy className="w-3.5 h-3.5 text-amber-400/70" />
        <h4 className="text-xs font-semibold text-white/70 tracking-wide">
          Session Progress
        </h4>
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-white/50">
            {placedCount} of {totalStrengths} strengths sorted
          </span>
          <span className="text-[11px] font-semibold text-amber-300/70">
            {Math.round(progress * 100)}%
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: "linear-gradient(90deg, #D4A017, #F59E0B)",
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Tier distribution */}
      <div className="flex items-center gap-3">
        {TIERS.map((tier) => (
          <div key={tier.id} className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: tier.color }}
            />
            <span className="text-[10px] text-white/40">
              {tier.label.split(" ")[0]}:
            </span>
            <span
              className="text-[11px] font-semibold"
              style={{ color: tier.color }}
            >
              {tierCounts[tier.id] ?? 0}
            </span>
          </div>
        ))}
      </div>

      {/* Top virtue */}
      {topVirtue && (
        <div className="flex items-center gap-2 pt-1">
          <span className="text-[10px] text-white/35">Your top virtue:</span>
          <span
            className="text-[11px] font-semibold px-2 py-0.5 rounded-full border"
            style={{
              color: topVirtue.color,
              borderColor: `${topVirtue.color}40`,
              backgroundColor: `${topVirtue.color}15`,
            }}
          >
            {topVirtue.name}
          </span>
        </div>
      )}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Strength Comparison View
// ---------------------------------------------------------------------------

function StrengthComparisonView({
  selectedIds,
  placements,
  spottingsByStrength,
  onDeselect,
}: {
  selectedIds: [string, string];
  placements: StrengthsPlacementData[];
  spottingsByStrength: Record<string, number>;
  onDeselect: () => void;
}) {
  const [reflectionText, setReflectionText] = useState("");
  const strengthA = CHARACTER_STRENGTHS.find((s) => s.id === selectedIds[0]);
  const strengthB = CHARACTER_STRENGTHS.find((s) => s.id === selectedIds[1]);
  if (!strengthA || !strengthB) return null;

  const placementA = placements.find((p) => p.strengthId === selectedIds[0]);
  const placementB = placements.find((p) => p.strengthId === selectedIds[1]);

  const getTierLabel = (tier: string | undefined) =>
    tier ? (TIERS.find((t) => t.id === tier)?.label.split(" ")[0] ?? tier) : "Unsorted";
  const getTierColor = (tier: string | undefined) =>
    tier ? (TIERS.find((t) => t.id === tier)?.color ?? "#9CA3AF") : "#9CA3AF";

  const items = [
    { a: strengthA, b: strengthB, placementA, placementB },
  ];

  const rows: { label: string; aVal: string; bVal: string; aColor: string; bColor: string }[] = [
    {
      label: "Tier",
      aVal: getTierLabel(placementA?.tier),
      bVal: getTierLabel(placementB?.tier),
      aColor: getTierColor(placementA?.tier),
      bColor: getTierColor(placementB?.tier),
    },
    {
      label: "Spottings",
      aVal: String(spottingsByStrength[selectedIds[0]] ?? 0),
      bVal: String(spottingsByStrength[selectedIds[1]] ?? 0),
      aColor: "#A78BFA",
      bColor: "#A78BFA",
    },
    {
      label: "Story",
      aVal: placementA?.scenarioResponse ? "Yes" : "No",
      bVal: placementB?.scenarioResponse ? "Yes" : "No",
      aColor: placementA?.scenarioResponse ? "#34D399" : "#6B7280",
      bColor: placementB?.scenarioResponse ? "#34D399" : "#6B7280",
    },
    {
      label: "Virtue",
      aVal: getVirtueName(strengthA.virtue),
      bVal: getVirtueName(strengthB.virtue),
      aColor: getVirtueColor(strengthA.virtue),
      bColor: getVirtueColor(strengthB.virtue),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="rounded-2xl border border-sky-500/20 bg-sky-500/[0.04] backdrop-blur-xl p-4 space-y-3"
    >
      <div className="flex items-center gap-2">
        <GitCompareArrows className="w-4 h-4 text-sky-400" />
        <p className="text-xs font-semibold text-sky-300">
          Strength Comparison
        </p>
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={onDeselect}
          className="ml-auto p-1 rounded-lg hover:bg-white/[0.08] transition-colors"
        >
          <X className="w-3.5 h-3.5 text-white/40" />
        </motion.button>
      </div>

      {/* Headers */}
      <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
        <div className="flex flex-col items-center gap-1 p-2 rounded-xl" style={{ background: `${getVirtueColor(strengthA.virtue)}10` }}>
          <span className="text-2xl">{strengthA.emoji}</span>
          <span className="text-[11px] font-semibold text-white/80 text-center">{strengthA.name}</span>
        </div>

        {/* Connection line */}
        <div className="flex flex-col items-center gap-1">
          <svg width="40" height="4" viewBox="0 0 40 4">
            <motion.line
              x1="0" y1="2" x2="40" y2="2"
              stroke="rgba(56,189,248,0.4)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="4 4"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6 }}
            />
          </svg>
          <span className="text-[9px] text-white/25">vs</span>
        </div>

        <div className="flex flex-col items-center gap-1 p-2 rounded-xl" style={{ background: `${getVirtueColor(strengthB.virtue)}10` }}>
          <span className="text-2xl">{strengthB.emoji}</span>
          <span className="text-[11px] font-semibold text-white/80 text-center">{strengthB.name}</span>
        </div>
      </div>

      {/* Comparison rows */}
      <div className="space-y-1.5">
        {rows.map((row) => (
          <div key={row.label} className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
            <div className="text-right">
              <span className="text-[11px] font-medium" style={{ color: row.aColor }}>{row.aVal}</span>
            </div>
            <span className="text-[9px] text-white/30 w-16 text-center">{row.label}</span>
            <div className="text-left">
              <span className="text-[11px] font-medium" style={{ color: row.bColor }}>{row.bVal}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Reflection prompt */}
      <div className="space-y-2 pt-1">
        <p className="text-[10px] font-semibold text-white/35 uppercase tracking-wider">
          Reflection
        </p>
        <p className="text-[11px] text-sky-300/60 italic">
          How do {strengthA.name} and {strengthB.name} work together in your life?
        </p>
        <textarea
          value={reflectionText}
          onChange={(e) => setReflectionText(e.target.value)}
          placeholder="Think about how these two strengths complement each other..."
          rows={2}
          className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white/80 placeholder:text-white/25 resize-none focus:outline-none focus:ring-1 focus:ring-sky-500/40 transition-all"
        />
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Spotting Feed (enhanced)
// ---------------------------------------------------------------------------

function SpottingFeed({
  spottings,
  isClinician,
  highlightedSpottings,
  onToggleHighlight,
}: {
  spottings: StrengthsSpottingData[];
  isClinician: boolean;
  highlightedSpottings: Set<string>;
  onToggleHighlight: (id: string) => void;
}) {
  const [feedMode, setFeedMode] = useState<"chronological" | "grouped">("chronological");

  const sortedSpottings = useMemo(
    () =>
      [...spottings].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [spottings]
  );

  const groupedSpottings = useMemo(() => {
    const groups: Record<string, StrengthsSpottingData[]> = {};
    for (const s of sortedSpottings) {
      if (!groups[s.strengthId]) groups[s.strengthId] = [];
      groups[s.strengthId].push(s);
    }
    return Object.entries(groups)
      .map(([strengthId, items]) => ({
        strengthId,
        strength: CHARACTER_STRENGTHS.find((s) => s.id === strengthId),
        items,
      }))
      .sort((a, b) => b.items.length - a.items.length);
  }, [sortedSpottings]);

  if (spottings.length === 0) return null;

  return (
    <div className="rounded-2xl border border-purple-500/15 bg-purple-500/[0.04] backdrop-blur-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5">
        <Eye className="w-3.5 h-3.5 text-purple-400/60" />
        <h4 className="text-xs font-semibold text-purple-300/70 tracking-wide">
          Strength Spottings
        </h4>
        <div className="flex items-center gap-1 ml-auto">
          <button
            onClick={() => setFeedMode("chronological")}
            className={cn(
              "text-[9px] px-2 py-0.5 rounded-full border transition-all",
              feedMode === "chronological"
                ? "bg-purple-500/20 border-purple-500/30 text-purple-300"
                : "border-white/[0.08] text-white/30 hover:text-white/50"
            )}
          >
            Timeline
          </button>
          <button
            onClick={() => setFeedMode("grouped")}
            className={cn(
              "text-[9px] px-2 py-0.5 rounded-full border transition-all",
              feedMode === "grouped"
                ? "bg-purple-500/20 border-purple-500/30 text-purple-300"
                : "border-white/[0.08] text-white/30 hover:text-white/50"
            )}
          >
            Grouped
          </button>
          <span className="text-[10px] text-white/30 ml-1">
            {spottings.length} total
          </span>
        </div>
      </div>

      <div className="px-4 pb-3 space-y-2 max-h-64 overflow-y-auto scrollbar-hide">
        {feedMode === "chronological" ? (
          sortedSpottings.map((spotting) => {
            const strength = CHARACTER_STRENGTHS.find(
              (s) => s.id === spotting.strengthId
            );
            const isHighlighted = highlightedSpottings.has(spotting.id);
            return (
              <motion.div
                key={spotting.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={cn(
                  "flex items-start gap-2 text-[11px] p-1.5 rounded-lg transition-colors",
                  isHighlighted && "bg-amber-500/[0.08] border border-amber-500/20"
                )}
              >
                <span className="leading-none mt-0.5">
                  {strength?.emoji ?? "?"}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-white/60">
                    {strength?.name ?? "Unknown"}
                  </span>
                  <p className="text-white/40 leading-relaxed mt-0.5">
                    {spotting.note}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
                  <span className="text-[9px] text-white/20">
                    {new Date(spotting.createdAt).toLocaleDateString(
                      undefined,
                      { month: "short", day: "numeric" }
                    )}
                    {" "}
                    {new Date(spotting.createdAt).toLocaleTimeString(
                      undefined,
                      { hour: "2-digit", minute: "2-digit" }
                    )}
                  </span>
                  {isClinician && (
                    <button
                      onClick={() => onToggleHighlight(spotting.id)}
                      className={cn(
                        "p-0.5 rounded transition-colors",
                        isHighlighted
                          ? "text-amber-400"
                          : "text-white/15 hover:text-white/40"
                      )}
                    >
                      <Star className="w-3 h-3" fill={isHighlighted ? "currentColor" : "none"} />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })
        ) : (
          groupedSpottings.map(({ strengthId, strength, items }) => (
            <div key={strengthId} className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm leading-none">{strength?.emoji ?? "?"}</span>
                <span className="text-[11px] font-medium text-white/60">
                  {strength?.name ?? "Unknown"}
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/25 text-purple-300 font-semibold">
                  {items.length}
                </span>
              </div>
              {items.map((spotting) => {
                const isHighlighted = highlightedSpottings.has(spotting.id);
                return (
                  <div
                    key={spotting.id}
                    className={cn(
                      "ml-6 flex items-start gap-2 text-[10px] p-1 rounded transition-colors",
                      isHighlighted && "bg-amber-500/[0.08]"
                    )}
                  >
                    <span className="text-white/30 flex-shrink-0 mt-0.5">-</span>
                    <p className="text-white/40 leading-relaxed flex-1">{spotting.note}</p>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className="text-[8px] text-white/15">
                        {new Date(spotting.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </span>
                      {isClinician && (
                        <button
                          onClick={() => onToggleHighlight(spotting.id)}
                          className={cn(
                            "p-0.5 rounded transition-colors",
                            isHighlighted ? "text-amber-400" : "text-white/15 hover:text-white/40"
                          )}
                        >
                          <Star className="w-2.5 h-2.5" fill={isHighlighted ? "currentColor" : "none"} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function StrengthsDeck({
  placements,
  spottings,
  onPlace,
  onMove,
  onRemove,
  onSpot,
  onClear,
  isClinician,
  toolSettings,
  onSettingsUpdate,
}: StrengthsDeckProps) {
  const settings = { ...DEFAULT_STRENGTHS_DECK_SETTINGS, ...toolSettings } as StrengthsDeckSettings;
  // ---- local state ----
  const [expandedStrengthId, setExpandedStrengthId] = useState<string | null>(null);
  const [virtueFilter, setVirtueFilter] = useState<string | null>(null);
  const [spottingMode, setSpottingMode] = useState(false);
  const [spottingTarget, setSpottingTarget] = useState<string | null>(null);
  const [spottingNote, setSpottingNote] = useState("");
  const [showCelebration, setShowCelebration] = useState(false);
  const [showFilterBar, setShowFilterBar] = useState(false);

  // Story prompt state
  const [storyTarget, setStoryTarget] = useState<string | null>(null);
  const [storyText, setStoryText] = useState("");
  const [expandedStoryId, setExpandedStoryId] = useState<string | null>(null);

  // Comparison state
  const [compareMode, setCompareMode] = useState(false);
  const [compareSelection, setCompareSelection] = useState<string[]>([]);

  // Spotting highlight state (clinician)
  const [highlightedSpottings, setHighlightedSpottings] = useState<Set<string>>(new Set());

  // ---- derived data ----
  const placedIds = useMemo(
    () => new Set(placements.map((p) => p.strengthId)),
    [placements]
  );

  const spottingsByStrength = useMemo(() => {
    const map: Record<string, number> = {};
    for (const s of spottings) {
      map[s.strengthId] = (map[s.strengthId] ?? 0) + 1;
    }
    return map;
  }, [spottings]);

  const storiesByStrength = useMemo(() => {
    const map: Record<string, string> = {};
    for (const p of placements) {
      if (p.scenarioResponse) {
        map[p.strengthId] = p.scenarioResponse;
      }
    }
    return map;
  }, [placements]);

  const deckCards = useMemo(() => {
    let cards = CHARACTER_STRENGTHS.filter((s) => !placedIds.has(s.id));
    if (virtueFilter) {
      cards = cards.filter((s) => s.virtue === virtueFilter);
    }
    return cards;
  }, [placedIds, virtueFilter]);

  const getTierPlacements = useCallback(
    (tierId: string) =>
      placements
        .filter((p) => p.tier === tierId)
        .sort((a, b) => a.orderIndex - b.orderIndex),
    [placements]
  );

  const totalStrengths = CHARACTER_STRENGTHS.length;
  const placedCount = placements.length;
  const allPlaced = placedCount === totalStrengths && totalStrengths > 0;
  const showVirtueWheel = placements.filter((p) => p.tier === "signature").length >= 5 || placedCount >= 5;

  // ---- handlers ----
  const handleExpandCard = useCallback(
    (strengthId: string) => {
      playClickSound();
      if (compareMode) {
        setCompareSelection((prev) => {
          if (prev.includes(strengthId)) {
            return prev.filter((id) => id !== strengthId);
          }
          if (prev.length < 2) {
            return [...prev, strengthId];
          }
          return [prev[1], strengthId];
        });
        return;
      }
      setExpandedStrengthId((prev) => (prev === strengthId ? null : strengthId));
    },
    [compareMode]
  );

  const handlePlaceInTier = useCallback(
    (strengthId: string, tierId: string) => {
      const tierCards = getTierPlacements(tierId);
      onPlace(strengthId, tierId, tierCards.length, null);
      playClickSound();
      setExpandedStrengthId(null);

      // check completion
      if (placedCount + 1 === totalStrengths) {
        setTimeout(() => setShowCelebration(true), 400);
      }
    },
    [getTierPlacements, onPlace, placedCount, totalStrengths]
  );

  const handleRemovePlacement = useCallback(
    (placementId: string) => {
      onRemove(placementId);
      playClickSound();
    },
    [onRemove]
  );

  const handleMovePlacement = useCallback(
    (placementId: string, newTier: string) => {
      const tierCards = getTierPlacements(newTier);
      onMove(placementId, newTier, tierCards.length);
      playClickSound();
    },
    [getTierPlacements, onMove]
  );

  const handlePlacedCardTap = useCallback(
    (placement: StrengthsPlacementData) => {
      if (compareMode) {
        setCompareSelection((prev) => {
          if (prev.includes(placement.strengthId)) {
            return prev.filter((id) => id !== placement.strengthId);
          }
          if (prev.length < 2) {
            return [...prev, placement.strengthId];
          }
          return [prev[1], placement.strengthId];
        });
        playClickSound();
        return;
      }
      if (spottingMode) {
        setSpottingTarget(placement.strengthId);
        setSpottingNote("");
      } else {
        setExpandedStrengthId((prev) =>
          prev === placement.strengthId ? null : placement.strengthId
        );
      }
      playClickSound();
    },
    [spottingMode, compareMode]
  );

  const handleSubmitSpotting = useCallback(() => {
    if (!spottingTarget || !spottingNote.trim()) return;
    onSpot(spottingTarget, spottingNote.trim());
    playClickSound();
    setSpottingTarget(null);
    setSpottingNote("");
  }, [spottingTarget, spottingNote, onSpot]);

  const handleCancelSpotting = useCallback(() => {
    setSpottingTarget(null);
    setSpottingNote("");
  }, []);

  const handleClear = useCallback(() => {
    onClear();
    setExpandedStrengthId(null);
    setSpottingMode(false);
    setSpottingTarget(null);
    setShowCelebration(false);
    setStoryTarget(null);
    setStoryText("");
    setCompareMode(false);
    setCompareSelection([]);
    setHighlightedSpottings(new Set());
    playClickSound();
  }, [onClear]);

  const handleSaveStory = useCallback(
    (placementId: string, strengthId: string, tier: string, orderIndex: number) => {
      if (!storyText.trim()) return;
      // We re-place the strength with the scenarioResponse to save the story
      onRemove(placementId);
      // Small delay to ensure removal processes
      setTimeout(() => {
        onPlace(strengthId, tier, orderIndex, storyText.trim());
        playClickSound();
        setStoryTarget(null);
        setStoryText("");
      }, 50);
    },
    [storyText, onRemove, onPlace]
  );

  const handleToggleHighlight = useCallback((spottingId: string) => {
    setHighlightedSpottings((prev) => {
      const next = new Set(prev);
      if (next.has(spottingId)) {
        next.delete(spottingId);
      } else {
        next.add(spottingId);
      }
      return next;
    });
    playClickSound();
  }, []);

  // ---- expanded card detail for the currently selected strength ----
  const expandedStrength = useMemo(
    () =>
      expandedStrengthId
        ? CHARACTER_STRENGTHS.find((s) => s.id === expandedStrengthId) ?? null
        : null,
    [expandedStrengthId]
  );

  const expandedPlacement = useMemo(
    () =>
      expandedStrengthId
        ? placements.find((p) => p.strengthId === expandedStrengthId) ?? null
        : null,
    [expandedStrengthId, placements]
  );

  // ---- render ----
  return (
    <div
      className="w-full h-full flex flex-col relative overflow-hidden"
      data-testid="strengths-deck-container"
      style={{ minHeight: 480 }}
    >
      {/* ======== HEADER BAR ======== */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] flex-shrink-0">
        <div className="flex items-center gap-3">
          <ProgressRing placed={placedCount} total={totalStrengths} />
          <div>
            <h3 className="text-sm font-semibold text-white/90 tracking-wide">
              Strengths Deck
            </h3>
            <p className="text-[11px] text-white/45">
              {allPlaced
                ? "All strengths sorted!"
                : `${placedCount} of ${totalStrengths} sorted`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Compare mode toggle */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => {
              setCompareMode((prev) => !prev);
              setCompareSelection([]);
              if (spottingMode) setSpottingMode(false);
              playClickSound();
            }}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-all duration-200",
              compareMode
                ? "bg-sky-500/20 border-sky-500/40 text-sky-300"
                : "bg-white/[0.04] border-white/[0.08] text-white/50 hover:text-white/70"
            )}
          >
            <GitCompareArrows className="w-3.5 h-3.5" />
            Compare
          </motion.button>

          {/* Spotting mode toggle */}
          {settings.showSpottingMode && (
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => {
                setSpottingMode((prev) => !prev);
                setSpottingTarget(null);
                if (compareMode) setCompareMode(false);
                playClickSound();
              }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-all duration-200",
                spottingMode
                  ? "bg-purple-500/20 border-purple-500/40 text-purple-300"
                  : "bg-white/[0.04] border-white/[0.08] text-white/50 hover:text-white/70"
              )}
            >
              <Eye className="w-3.5 h-3.5" />
              Spot
            </motion.button>
          )}

          {/* Filter toggle */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => {
              setShowFilterBar((prev) => !prev);
              playClickSound();
            }}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-all duration-200",
              showFilterBar
                ? "bg-white/10 border-white/20 text-white/80"
                : "bg-white/[0.04] border-white/[0.08] text-white/50 hover:text-white/70"
            )}
          >
            <Filter className="w-3.5 h-3.5" />
            Filter
          </motion.button>

          {/* Clinician clear moved to toolbar */}
        </div>
      </div>

      {/* ======== COMPARE MODE BANNER ======== */}
      <AnimatePresence>
        {compareMode && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-sky-500/15 flex-shrink-0"
          >
            <div className="px-4 py-2 bg-sky-500/[0.04] flex items-center gap-2">
              <GitCompareArrows className="w-3.5 h-3.5 text-sky-400/70" />
              <span className="text-[11px] text-sky-300/70">
                {compareSelection.length === 0
                  ? "Tap two strengths to compare them"
                  : compareSelection.length === 1
                  ? "Tap one more strength to compare"
                  : "Comparing two strengths"}
              </span>
              {compareSelection.length > 0 && (
                <div className="flex items-center gap-1 ml-auto">
                  {compareSelection.map((id) => {
                    const s = CHARACTER_STRENGTHS.find((c) => c.id === id);
                    return s ? (
                      <span key={id} className="text-sm">{s.emoji}</span>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======== VIRTUE FILTER BAR ======== */}
      <AnimatePresence>
        {showFilterBar && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-b border-white/[0.06] flex-shrink-0"
          >
            <div className="flex items-center gap-2 px-4 py-2.5 overflow-x-auto scrollbar-hide">
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => {
                  setVirtueFilter(null);
                  playClickSound();
                }}
                className={cn(
                  "flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-medium border transition-all duration-200",
                  virtueFilter === null
                    ? "bg-white/15 border-white/25 text-white/90"
                    : "bg-white/[0.04] border-white/[0.08] text-white/50 hover:text-white/70"
                )}
              >
                All
              </motion.button>
              {VIRTUES.map((virtue) => {
                const count = CHARACTER_STRENGTHS.filter(
                  (s) => s.virtue === virtue.id && !placedIds.has(s.id)
                ).length;
                return (
                  <motion.button
                    key={virtue.id}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => {
                      setVirtueFilter((prev) =>
                        prev === virtue.id ? null : virtue.id
                      );
                      playClickSound();
                    }}
                    className={cn(
                      "flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium border transition-all duration-200",
                      virtueFilter === virtue.id
                        ? "text-white/90"
                        : "bg-white/[0.04] border-white/[0.08] text-white/50 hover:text-white/70"
                    )}
                    style={
                      virtueFilter === virtue.id
                        ? {
                            backgroundColor: `${virtue.color}25`,
                            borderColor: `${virtue.color}50`,
                          }
                        : undefined
                    }
                  >
                    <VirtueDot virtueId={virtue.id} size={6} />
                    {virtue.name}
                    {count > 0 && (
                      <span className="text-[9px] text-white/35 ml-0.5">
                        {count}
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======== SCROLLABLE BODY ======== */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 scrollbar-hide">
        {/* ---- SESSION PROGRESS TRACKER ---- */}
        <SessionProgressTracker
          placements={placements}
          totalStrengths={totalStrengths}
        />

        {/* ---- UNPLACED DECK ---- */}
        {deckCards.length > 0 && (
          <div>
            <p className="text-[11px] font-medium text-white/40 uppercase tracking-wider mb-2 px-1">
              Unsorted &middot; {deckCards.length} cards
            </p>
            <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide">
              {deckCards.map((strength) => {
                const virtueColor = getVirtueColor(strength.virtue);
                const isExpanded = expandedStrengthId === strength.id;
                const isCompareSelected = compareSelection.includes(strength.id);
                return (
                  <motion.button
                    key={strength.id}
                    layout
                    whileHover={{ y: -4, scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleExpandCard(strength.id)}
                    className={cn(
                      "flex-shrink-0 flex flex-col items-center justify-center gap-1",
                      "w-20 h-24 rounded-2xl border cursor-pointer select-none",
                      "backdrop-blur-md transition-all duration-200",
                      isExpanded
                        ? "ring-2 ring-white/30 shadow-lg"
                        : isCompareSelected
                        ? "ring-2 ring-sky-400/50 shadow-lg"
                        : "hover:shadow-md"
                    )}
                    style={{
                      background: `linear-gradient(160deg, ${virtueColor}22, ${virtueColor}08, rgba(0,0,0,0.15))`,
                      borderColor: isExpanded
                        ? `${virtueColor}60`
                        : isCompareSelected
                        ? "rgba(56,189,248,0.5)"
                        : `${virtueColor}25`,
                    }}
                  >
                    <span className="text-2xl leading-none">{strength.emoji}</span>
                    <span className="text-[10px] font-medium text-white/80 text-center px-1 leading-tight">
                      {strength.name}
                    </span>
                    <VirtueDot virtueId={strength.virtue} size={5} />
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}

        {/* ---- COMPARISON VIEW ---- */}
        <AnimatePresence>
          {compareMode && compareSelection.length === 2 && (
            <StrengthComparisonView
              selectedIds={compareSelection as [string, string]}
              placements={placements}
              spottingsByStrength={spottingsByStrength}
              onDeselect={() => setCompareSelection([])}
            />
          )}
        </AnimatePresence>

        {/* ---- EXPANDED CARD DETAIL ---- */}
        <AnimatePresence mode="wait">
          {expandedStrength && !compareMode && (
            <motion.div
              key={expandedStrength.id}
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className="rounded-2xl border backdrop-blur-xl overflow-hidden"
              style={{
                background: `linear-gradient(160deg, ${getVirtueColor(expandedStrength.virtue)}15, rgba(0,0,0,0.25))`,
                borderColor: `${getVirtueColor(expandedStrength.virtue)}30`,
              }}
            >
              {/* Card header */}
              <div className="flex items-start gap-3 p-4 pb-2">
                <span className="text-3xl leading-none mt-0.5">
                  {expandedStrength.emoji}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white/95">
                      {expandedStrength.name}
                    </h4>
                    <span
                      className="text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border"
                      style={{
                        color: getVirtueColor(expandedStrength.virtue),
                        borderColor: `${getVirtueColor(expandedStrength.virtue)}40`,
                        backgroundColor: `${getVirtueColor(expandedStrength.virtue)}15`,
                      }}
                    >
                      {getVirtueName(expandedStrength.virtue)}
                    </span>
                  </div>
                  {settings.showDescriptions && (
                    <p className="text-[11px] text-white/55 mt-1 leading-relaxed">
                      {expandedStrength.description}
                    </p>
                  )}
                </div>
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => {
                    setExpandedStrengthId(null);
                    playClickSound();
                  }}
                  className="flex-shrink-0 p-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-white/40" />
                </motion.button>
              </div>

              {/* Example */}
              <div className="px-4 pb-2">
                <p className="text-[10px] font-semibold text-white/35 uppercase tracking-wider mb-1">
                  Example
                </p>
                <p className="text-[11px] text-white/60 leading-relaxed italic">
                  &ldquo;{expandedStrength.example}&rdquo;
                </p>
              </div>

              {/* Actions */}
              <div className="px-4 pb-3">
                <p className="text-[10px] font-semibold text-white/35 uppercase tracking-wider mb-1.5">
                  Try This
                </p>
                <div className="space-y-1">
                  {expandedStrength.actions.map((action, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 text-[11px] text-white/55"
                    >
                      <Sparkles
                        className="w-3 h-3 mt-0.5 flex-shrink-0"
                        style={{
                          color: getVirtueColor(expandedStrength.virtue),
                        }}
                      />
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Spotting count */}
              {(spottingsByStrength[expandedStrength.id] ?? 0) > 0 && (
                <div className="px-4 pb-3">
                  <div className="flex items-center gap-1.5 text-[11px] text-purple-300/70">
                    <Eye className="w-3 h-3" />
                    <span>
                      Spotted{" "}
                      {spottingsByStrength[expandedStrength.id]} time
                      {spottingsByStrength[expandedStrength.id] > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              )}

              {/* ---- STRENGTH STORY SECTION ---- */}
              {expandedPlacement && (
                <div className="px-4 pb-3">
                  {/* Show existing story if present */}
                  {expandedPlacement.scenarioResponse && storyTarget !== expandedStrength.id && (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-3 h-3 text-emerald-400/70" />
                        <p className="text-[10px] font-semibold text-emerald-300/70 uppercase tracking-wider">
                          Your Story
                        </p>
                        <button
                          onClick={() => setExpandedStoryId(
                            expandedStoryId === expandedStrength.id ? null : expandedStrength.id
                          )}
                          className="ml-auto text-[9px] text-white/30 hover:text-white/50 transition-colors"
                        >
                          {expandedStoryId === expandedStrength.id ? "Collapse" : "Expand"}
                        </button>
                      </div>
                      <AnimatePresence>
                        {expandedStoryId === expandedStrength.id && (
                          <motion.p
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="text-[11px] text-white/50 leading-relaxed bg-white/[0.03] rounded-lg p-2.5 border border-white/[0.06] overflow-hidden"
                          >
                            {expandedPlacement.scenarioResponse}
                          </motion.p>
                        )}
                      </AnimatePresence>
                      <button
                        onClick={() => {
                          setStoryTarget(expandedStrength.id);
                          setStoryText(expandedPlacement.scenarioResponse ?? "");
                          playClickSound();
                        }}
                        className="text-[10px] text-emerald-400/50 hover:text-emerald-400/80 transition-colors"
                      >
                        Edit story
                      </button>
                    </div>
                  )}

                  {/* Story writing prompt */}
                  {!expandedPlacement.scenarioResponse && storyTarget !== expandedStrength.id && (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setStoryTarget(expandedStrength.id);
                        setStoryText("");
                        playClickSound();
                      }}
                      className="flex items-center gap-1.5 text-[11px] text-emerald-400/60 hover:text-emerald-400/80 transition-colors"
                    >
                      <BookOpen className="w-3 h-3" />
                      Write a story about using {expandedStrength.name}
                    </motion.button>
                  )}

                  {/* Story editor */}
                  <AnimatePresence>
                    {storyTarget === expandedStrength.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2 overflow-hidden"
                      >
                        <p className="text-[11px] text-emerald-300/60 italic">
                          Tell me about a time you used {expandedStrength.name}...
                        </p>
                        <textarea
                          value={storyText}
                          onChange={(e) => setStoryText(e.target.value)}
                          placeholder={`Describe a moment when ${expandedStrength.name} showed up in your life...`}
                          rows={3}
                          className="w-full bg-white/[0.05] border border-emerald-500/20 rounded-xl px-3 py-2.5 text-xs text-white/80 placeholder:text-white/25 resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500/40 transition-all"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setStoryTarget(null);
                              setStoryText("");
                              playClickSound();
                            }}
                            className="px-3 py-1.5 rounded-lg text-[11px] font-medium text-white/50 hover:text-white/70 transition-colors"
                          >
                            Cancel
                          </button>
                          <motion.button
                            whileTap={{ scale: 0.92 }}
                            onClick={() =>
                              handleSaveStory(
                                expandedPlacement.id,
                                expandedStrength.id,
                                expandedPlacement.tier,
                                expandedPlacement.orderIndex
                              )
                            }
                            disabled={!storyText.trim()}
                            className={cn(
                              "flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[11px] font-semibold border transition-all duration-200",
                              storyText.trim()
                                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30"
                                : "bg-white/[0.04] border-white/[0.08] text-white/25 cursor-not-allowed"
                            )}
                          >
                            <Check className="w-3.5 h-3.5" />
                            Save Story
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Tier placement / management buttons */}
              <div className="px-4 pb-4">
                {expandedPlacement ? (
                  /* Already placed -- offer move / remove */
                  <div className="space-y-2">
                    <p className="text-[10px] font-semibold text-white/35 uppercase tracking-wider">
                      Currently in:{" "}
                      <span className="text-white/60 normal-case">
                        {TIERS.find((t) => t.id === expandedPlacement.tier)
                          ?.label ?? expandedPlacement.tier}
                      </span>
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {TIERS.filter(
                        (t) => t.id !== expandedPlacement.tier
                      ).map((tier) => (
                        <motion.button
                          key={tier.id}
                          whileTap={{ scale: 0.92 }}
                          onClick={() =>
                            handleMovePlacement(expandedPlacement.id, tier.id)
                          }
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-all duration-200 hover:brightness-125"
                          style={{
                            backgroundColor: `${tier.color}18`,
                            borderColor: `${tier.color}35`,
                            color: tier.color,
                          }}
                        >
                          <ChevronDown className="w-3 h-3" />
                          Move to {tier.label.split(" ")[0]}
                        </motion.button>
                      ))}
                      <motion.button
                        whileTap={{ scale: 0.92 }}
                        onClick={() =>
                          handleRemovePlacement(expandedPlacement.id)
                        }
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium border bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all duration-200"
                      >
                        <X className="w-3 h-3" />
                        Return to Deck
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  /* Not yet placed -- show tier buttons */
                  <div className="space-y-2">
                    <p className="text-[10px] font-semibold text-white/35 uppercase tracking-wider">
                      Place in Tier
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {TIERS.map((tier) => (
                        <motion.button
                          key={tier.id}
                          whileTap={{ scale: 0.92 }}
                          whileHover={{ scale: 1.03 }}
                          onClick={() =>
                            handlePlaceInTier(expandedStrength.id, tier.id)
                          }
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-semibold border transition-all duration-200 hover:brightness-125"
                          style={{
                            backgroundColor: `${tier.color}18`,
                            borderColor: `${tier.color}40`,
                            color: tier.color,
                          }}
                        >
                          {tier.id === "signature" && (
                            <Star className="w-3.5 h-3.5" />
                          )}
                          {tier.id === "middle" && (
                            <Check className="w-3.5 h-3.5" />
                          )}
                          {tier.id === "lesser" && (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                          {tier.label}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ---- STRENGTH SPOTTING INPUT ---- */}
        <AnimatePresence>
          {spottingTarget && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="rounded-2xl border border-purple-500/25 bg-purple-500/[0.08] backdrop-blur-xl p-4 space-y-3"
            >
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-purple-400" />
                <p className="text-xs font-semibold text-purple-300">
                  Strength Spotting
                </p>
                <span className="text-[11px] text-white/50">
                  &mdash;{" "}
                  {CHARACTER_STRENGTHS.find((s) => s.id === spottingTarget)
                    ?.name ?? ""}
                </span>
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={handleCancelSpotting}
                  className="ml-auto p-1 rounded-lg hover:bg-white/[0.08] transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-white/40" />
                </motion.button>
              </div>
              <p className="text-[11px] text-white/45 leading-relaxed italic">
                I noticed you being{" "}
                <span className="text-purple-300/70 font-medium not-italic">
                  {CHARACTER_STRENGTHS.find((s) => s.id === spottingTarget)?.name ?? ""}
                </span>{" "}
                when...
              </p>
              <textarea
                value={spottingNote}
                onChange={(e) => setSpottingNote(e.target.value)}
                placeholder={`I noticed you being ${CHARACTER_STRENGTHS.find((s) => s.id === spottingTarget)?.name ?? ""} when...`}
                rows={3}
                className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-3 py-2.5 text-xs text-white/80 placeholder:text-white/25 resize-none focus:outline-none focus:ring-1 focus:ring-purple-500/40 transition-all"
              />
              <div className="flex items-center justify-end gap-2">
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={handleCancelSpotting}
                  className="px-3 py-1.5 rounded-lg text-[11px] font-medium text-white/50 hover:text-white/70 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={handleSubmitSpotting}
                  disabled={!spottingNote.trim()}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[11px] font-semibold border transition-all duration-200",
                    spottingNote.trim()
                      ? "bg-purple-500/20 border-purple-500/40 text-purple-300 hover:bg-purple-500/30"
                      : "bg-white/[0.04] border-white/[0.08] text-white/25 cursor-not-allowed"
                  )}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Spotting
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ---- TIER SECTIONS ---- */}
        {TIERS.map((tier) => {
          const tierPlacements = getTierPlacements(tier.id);
          return (
            <motion.div
              key={tier.id}
              layout
              className="rounded-2xl border overflow-hidden"
              style={{
                background: tier.gradient,
                borderColor: tier.borderColor,
              }}
            >
              {/* Tier header */}
              <div className="flex items-center gap-2.5 px-4 py-2.5">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{
                    backgroundColor: tier.color,
                    boxShadow: `0 0 8px ${tier.color}50`,
                  }}
                />
                <div className="flex-1 min-w-0">
                  <h4
                    className="text-xs font-bold tracking-wide"
                    style={{ color: tier.color }}
                  >
                    {tier.label}
                  </h4>
                  <p className="text-[10px] text-white/35">{tier.sublabel}</p>
                </div>
                <span
                  className={cn(
                    "text-[10px] font-semibold px-2 py-0.5 rounded-full border",
                    tier.badgeClass
                  )}
                >
                  {tierPlacements.length}
                </span>
              </div>

              {/* Tier cards */}
              <div className="px-3 pb-3">
                {tierPlacements.length === 0 ? (
                  <div className="flex items-center justify-center py-4 border border-dashed rounded-xl"
                    style={{ borderColor: `${tier.color}20` }}
                  >
                    <p className="text-[11px] text-white/25 italic">
                      Tap a card above and place it here
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    <AnimatePresence>
                      {tierPlacements.map((placement) => (
                        <PlacedCard
                          key={placement.id}
                          placement={placement}
                          spottingCount={
                            spottingsByStrength[placement.strengthId] ?? 0
                          }
                          hasStory={!!storiesByStrength[placement.strengthId]}
                          isSpottingMode={spottingMode || compareMode}
                          onTap={() => handlePlacedCardTap(placement)}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}

        {/* ---- VIRTUE WHEEL ---- */}
        {showVirtueWheel && (
          <VirtueWheel placements={placements} />
        )}

        {/* ---- SPOTTING FEED (enhanced) ---- */}
        {settings.showSpottingMode && spottings.length > 0 && (
          <SpottingFeed
            spottings={spottings}
            isClinician={isClinician}
            highlightedSpottings={highlightedSpottings}
            onToggleHighlight={handleToggleHighlight}
          />
        )}

        {/* Bottom spacer */}
        <div className="h-4" />
      </div>

      {isClinician && onSettingsUpdate && (
        <ClinicianToolbar
          controls={STRENGTHS_DECK_TOOLBAR_CONTROLS}
          settings={settings}
          onUpdate={onSettingsUpdate}
          onClear={onClear}
        />
      )}

      {/* ======== CELEBRATION OVERLAY ======== */}
      <AnimatePresence>
        {showCelebration && allPlaced && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
            style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              className="relative max-w-xs w-full mx-6 rounded-3xl border border-amber-500/30 overflow-hidden"
              style={{
                background:
                  "linear-gradient(160deg, rgba(212,160,23,0.15), rgba(0,0,0,0.7))",
              }}
            >
              {/* Decorative sparkles */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {Array.from({ length: 12 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 rounded-full bg-amber-400/60"
                    style={{
                      left: `${10 + Math.random() * 80}%`,
                      top: `${10 + Math.random() * 80}%`,
                    }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0.5, 1.2, 0.5],
                    }}
                    transition={{
                      duration: 1.5 + Math.random(),
                      repeat: Infinity,
                      delay: Math.random() * 1.5,
                    }}
                  />
                ))}
              </div>

              <div className="relative z-10 flex flex-col items-center text-center p-6 py-8">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="w-10 h-10 text-amber-400 mb-3" />
                </motion.div>
                <h3 className="text-lg font-bold text-white/95 mb-1">
                  All Strengths Sorted!
                </h3>
                <p className="text-xs text-white/50 leading-relaxed mb-5 max-w-[220px]">
                  You have identified your signature, middle, and lesser
                  strengths. This is a powerful map of who you are at your best.
                </p>

                {/* Summary counts */}
                <div className="flex items-center gap-3 mb-5">
                  {TIERS.map((tier) => {
                    const count = getTierPlacements(tier.id).length;
                    return (
                      <div
                        key={tier.id}
                        className="flex flex-col items-center gap-0.5"
                      >
                        <span
                          className="text-lg font-bold"
                          style={{ color: tier.color }}
                        >
                          {count}
                        </span>
                        <span className="text-[9px] text-white/40">
                          {tier.label.split(" ")[0]}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2">
                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    onClick={() => {
                      setShowCelebration(false);
                      setSpottingMode(true);
                      playClickSound();
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-semibold bg-purple-500/20 border border-purple-500/35 text-purple-300 hover:bg-purple-500/30 transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Start Spotting
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    onClick={() => {
                      setShowCelebration(false);
                      playClickSound();
                    }}
                    className="px-4 py-2 rounded-xl text-[11px] font-medium text-white/50 hover:text-white/70 border border-white/[0.08] transition-colors"
                  >
                    Close
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
