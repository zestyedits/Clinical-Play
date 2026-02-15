import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { playClickSound } from "@/lib/audio-feedback";
import { RotateCcw, Plus, Lock, Unlock, X, Sparkles, Trash2, Hash, ChevronDown, ChevronUp, Eye, BarChart3 } from "lucide-react";
import { ClinicianToolbar, type ToolbarControl } from "./clinician-toolbar";

// ─── Data Interfaces ──────────────────────────────────────────────────────────

export interface ContainmentContainerData {
  id: string;
  containerType: string;
  isLocked: boolean;
  lockMethod: string | null;
  containmentStrength: number | null;
  createdBy: string | null;
  createdAt: string;
}

export interface ContainmentItemData {
  id: string;
  containerId: string;
  label: string;
  emoji: string | null;
  color: string | null;
  status: string; // "contained" | "dissolved"
  createdBy: string | null;
  createdAt: string;
}

export interface ContainmentBoxProps {
  containers: ContainmentContainerData[];
  items: ContainmentItemData[];
  onCreateContainer: (containerType: string) => void;
  onAddItem: (containerId: string, label: string, emoji: string | null, color: string | null) => void;
  onContainItem: (itemId: string) => void;
  onDissolveItem: (itemId: string) => void;
  onLock: (containerId: string, lockMethod: string, containmentStrength: number) => void;
  onUnlock: (containerId: string) => void;
  onClear: () => void;
  isClinician: boolean;
  toolSettings?: Record<string, any>;
  onSettingsUpdate?: (updates: Record<string, any>) => void;
}

// ─── Clinician Settings ────────────────────────────────────────────────────────

interface ContainmentBoxSettings {
  showDissolution: boolean;
  maxItemsPerContainer: number;
}

const DEFAULT_CONTAINMENT_BOX_SETTINGS: ContainmentBoxSettings = {
  showDissolution: true,
  maxItemsPerContainer: 0,
};

const CONTAINMENT_BOX_TOOLBAR_CONTROLS: ToolbarControl[] = [
  {
    type: "toggle",
    key: "showDissolution",
    icon: Sparkles,
    label: "Dissolution",
    activeColor: "amber",
  },
  {
    type: "number",
    key: "maxItemsPerContainer",
    icon: Hash,
    label: "Max Items",
    steps: [0, 3, 5, 8, 12],
    activeColor: "purple",
  },
];

// ─── Constants ────────────────────────────────────────────────────────────────

const CONTAINER_TYPES = [
  { id: "chest", label: "Chest", description: "A sturdy wooden treasure chest" },
  { id: "safe", label: "Safe", description: "A heavy metal safe" },
  { id: "jar", label: "Jar", description: "A glass jar with a sealed lid" },
  { id: "box", label: "Box", description: "A simple cardboard box" },
  { id: "vault", label: "Vault", description: "An impenetrable bank vault" },
] as const;

const LOCK_METHODS = [
  { id: "key", label: "Key", icon: "🔑" },
  { id: "combination", label: "Combination", icon: "🔢" },
  { id: "seal", label: "Seal", icon: "🔏" },
  { id: "chain", label: "Chain", icon: "⛓️" },
  { id: "magic", label: "Magic", icon: "✨" },
] as const;

const EMOTION_EMOJIS = [
  "😰", "😢", "😠", "😨", "😔", "😤",
  "💔", "😖", "🥺", "😣", "😩", "🤯",
  "😶", "😞", "🫠", "😮‍💨",
];

const ITEM_COLORS = [
  { id: "red", hex: "#EF4444", label: "Red" },
  { id: "blue", hex: "#3B82F6", label: "Blue" },
  { id: "purple", hex: "#8B5CF6", label: "Purple" },
  { id: "amber", hex: "#F59E0B", label: "Amber" },
  { id: "slate", hex: "#64748B", label: "Slate" },
  { id: "rose", hex: "#F43F5E", label: "Rose" },
];

const DISSOLUTION_MILESTONES = [5, 10, 25];

// ─── Deterministic pseudo-random ──────────────────────────────────────────────

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

// ─── Breathing Lock Ritual ────────────────────────────────────────────────────

function BreathingRitual({
  onComplete,
  onSkip,
}: {
  onComplete: () => void;
  onSkip: () => void;
}) {
  const [breathIndex, setBreathIndex] = useState(0);
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [finished, setFinished] = useState(false);
  const totalBreaths = 3;

  useEffect(() => {
    if (finished) return;
    const timings: Record<string, number> = { inhale: 3000, hold: 1500, exhale: 3000 };
    const timer = setTimeout(() => {
      if (phase === "inhale") {
        setPhase("hold");
      } else if (phase === "hold") {
        setPhase("exhale");
      } else {
        // exhale done
        const next = breathIndex + 1;
        if (next >= totalBreaths) {
          setFinished(true);
          setTimeout(onComplete, 600);
        } else {
          setBreathIndex(next);
          setPhase("inhale");
        }
      }
    }, timings[phase]);
    return () => clearTimeout(timer);
  }, [phase, breathIndex, finished, onComplete]);

  const circleScale = phase === "inhale" ? 1.6 : phase === "hold" ? 1.6 : 0.8;
  const promptText =
    phase === "inhale"
      ? "Breathe in..."
      : phase === "hold"
        ? "Hold..."
        : "Breathe out...";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center gap-4 py-6"
    >
      <p className="text-[10px] uppercase tracking-wider text-white/40 font-medium">
        Breath {breathIndex + 1} of {totalBreaths}
      </p>

      <div className="relative w-24 h-24 flex items-center justify-center">
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 60,
            height: 60,
            background: "radial-gradient(circle, rgba(245,158,11,0.35), rgba(139,92,246,0.15))",
          }}
          animate={{
            scale: circleScale,
            opacity: phase === "hold" ? 0.9 : 0.6,
          }}
          transition={{ duration: phase === "hold" ? 0.3 : 2.5, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute rounded-full border-2 border-amber-400/40"
          style={{ width: 72, height: 72 }}
          animate={{
            scale: circleScale * 0.95,
            borderColor:
              phase === "inhale"
                ? "rgba(245,158,11,0.5)"
                : phase === "hold"
                  ? "rgba(139,92,246,0.5)"
                  : "rgba(245,158,11,0.25)",
          }}
          transition={{ duration: phase === "hold" ? 0.3 : 2.5, ease: "easeInOut" }}
        />
      </div>

      <motion.p
        key={phase + breathIndex}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-sm text-white/70 font-medium"
      >
        {finished ? "Sealing..." : promptText}
      </motion.p>

      {!finished && (
        <button
          onClick={onSkip}
          className="text-[10px] text-white/30 hover:text-white/50 transition-colors underline underline-offset-2"
        >
          Skip
        </button>
      )}
    </motion.div>
  );
}

// ─── Container Strength Meter Ring ────────────────────────────────────────────

function StrengthMeterRing({
  strength,
  isLocked,
}: {
  strength: number;
  isLocked: boolean;
}) {
  const radius = 70;
  const strokeWidth = 5;
  const circumference = 2 * Math.PI * radius;
  const fillPct = (strength / 10);
  const dashOffset = circumference * (1 - fillPct);

  // Color based on strength: low=amber, mid=blue, high=purple
  const strokeColor =
    strength <= 3
      ? "rgba(245,158,11,0.7)"
      : strength <= 6
        ? "rgba(59,130,246,0.7)"
        : "rgba(139,92,246,0.8)";

  const glowColor =
    strength <= 3
      ? "rgba(245,158,11,0.3)"
      : strength <= 6
        ? "rgba(59,130,246,0.3)"
        : "rgba(139,92,246,0.4)";

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 160 160"
      style={{ transform: "rotate(-90deg)" }}
    >
      <defs>
        <filter id="strength-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feFlood floodColor={glowColor} floodOpacity="1" />
          <feComposite in2="blur" operator="in" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Track */}
      <circle
        cx="80"
        cy="80"
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.04)"
        strokeWidth={strokeWidth}
      />
      {/* Filled arc */}
      <motion.circle
        cx="80"
        cy="80"
        r={radius}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{
          strokeDashoffset: dashOffset,
          opacity: isLocked && strength === 10 ? [1, 0.6, 1] : 1,
        }}
        transition={
          isLocked && strength === 10
            ? { strokeDashoffset: { duration: 0.8, ease: "easeOut" }, opacity: { duration: 2, repeat: Infinity } }
            : { duration: 0.8, ease: "easeOut" }
        }
        filter="url(#strength-glow)"
      />
    </svg>
  );
}

// ─── Item Dissolution Ceremony ────────────────────────────────────────────────

function DissolutionCeremony({
  item,
  onComplete,
  onCancel,
}: {
  item: ContainmentItemData;
  onComplete: (reflection: string) => void;
  onCancel: () => void;
}) {
  const [stage, setStage] = useState<"reflect" | "shrink" | "glow" | "dissolve">("reflect");
  const [reflection, setReflection] = useState("");
  const chipColor = item.color || "#8B5CF6";

  const handleStartDissolve = useCallback(() => {
    playClickSound();
    setStage("shrink");
    setTimeout(() => setStage("glow"), 700);
    setTimeout(() => setStage("dissolve"), 1400);
    setTimeout(() => onComplete(reflection), 2200);
  }, [reflection, onComplete]);

  const particles = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: (seededRandom(i * 7 + 3) - 0.5) * 120,
        y: (seededRandom(i * 13 + 5) - 0.5) * 120,
        size: seededRandom(i * 11 + 7) * 5 + 2,
        delay: seededRandom(i * 17 + 11) * 0.5,
      })),
    [],
  );

  if (stage === "reflect") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className={cn(
          "rounded-2xl p-4 space-y-3",
          "bg-white/[0.06] backdrop-blur-xl border border-white/[0.12]",
          "shadow-[0_8px_32px_rgba(0,0,0,0.3)]",
        )}
      >
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-white/80 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400/80" />
            Release: {item.emoji || ""} {item.label}
          </h4>
          <button onClick={onCancel} className="text-white/40 hover:text-white/70 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-white/40">
          What did you learn from holding this?
        </p>
        <input
          type="text"
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleStartDissolve()}
          placeholder="A brief reflection (optional)..."
          className={cn(
            "w-full px-3 py-2.5 rounded-xl text-sm",
            "bg-white/[0.06] backdrop-blur-md border border-white/[0.1]",
            "text-white/90 placeholder:text-white/30",
            "focus:outline-none focus:border-white/25 focus:ring-1 focus:ring-white/10",
            "transition-all duration-200",
          )}
          autoFocus
        />
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleStartDissolve}
            className={cn(
              "flex-1 py-2.5 rounded-xl text-sm font-medium",
              "flex items-center justify-center gap-2",
              "bg-gradient-to-r from-amber-500/30 to-orange-500/30 text-white/90 border border-amber-500/30",
              "hover:from-amber-500/40 hover:to-orange-500/40 transition-all duration-200",
            )}
          >
            <Sparkles className="w-4 h-4" />
            Dissolve
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCancel}
            className={cn(
              "px-4 py-2.5 rounded-xl text-sm font-medium",
              "bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1]",
              "text-white/50 hover:text-white/70 transition-all duration-200",
            )}
          >
            Cancel
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="relative flex items-center justify-center py-6"
      initial={{ opacity: 1 }}
      animate={{ opacity: stage === "dissolve" ? 0 : 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Main chip animating */}
      <motion.div
        className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium border"
        style={{
          backgroundColor: `${chipColor}20`,
          borderColor: `${chipColor}40`,
          color: chipColor,
        }}
        animate={{
          scale: stage === "shrink" ? 0.4 : stage === "glow" ? 0.6 : 0,
          opacity: stage === "dissolve" ? 0 : 1,
          boxShadow:
            stage === "glow"
              ? `0 0 30px ${chipColor}80, 0 0 60px ${chipColor}40`
              : "none",
        }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        {item.emoji && <span className="text-sm">{item.emoji}</span>}
        <span>{item.label}</span>
      </motion.div>

      {/* Particles on dissolve */}
      {stage === "dissolve" && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-visible">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full"
              style={{
                width: p.size,
                height: p.size,
                backgroundColor: chipColor,
              }}
              initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              animate={{ opacity: 0, x: p.x, y: p.y, scale: 0 }}
              transition={{ duration: 1, delay: p.delay, ease: "easeOut" }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ─── Dissolution Milestone Toast ──────────────────────────────────────────────

function MilestoneToast({ count }: { count: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        "flex items-center gap-2 px-4 py-2.5 rounded-xl",
        "bg-gradient-to-r from-amber-500/20 to-purple-500/20",
        "border border-amber-400/30 backdrop-blur-xl",
        "shadow-[0_4px_20px_rgba(245,158,11,0.15)]",
      )}
    >
      <Sparkles className="w-4 h-4 text-amber-400" />
      <span className="text-sm font-medium text-white/80">
        You have released {count} items
      </span>
      <span className="text-base">
        {count >= 25 ? "🌟" : count >= 10 ? "✨" : "🎉"}
      </span>
    </motion.div>
  );
}

// ─── Session Summary Panel ────────────────────────────────────────────────────

function SessionSummary({
  containers,
  items,
}: {
  containers: ContainmentContainerData[];
  items: ContainmentItemData[];
}) {
  const [expanded, setExpanded] = useState(false);

  const totalContained = items.filter((it) => it.status === "contained").length;
  const totalDissolved = items.filter((it) => it.status === "dissolved").length;

  const avgStrength = useMemo(() => {
    const locked = containers.filter((c) => c.containmentStrength != null);
    if (locked.length === 0) return 0;
    const sum = locked.reduce((acc, c) => acc + (c.containmentStrength ?? 0), 0);
    return Math.round((sum / locked.length) * 10) / 10;
  }, [containers]);

  const mostUsedType = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of containers) {
      counts[c.containerType] = (counts[c.containerType] || 0) + 1;
    }
    let best = "";
    let bestCount = 0;
    for (const [k, v] of Object.entries(counts)) {
      if (v > bestCount) {
        best = k;
        bestCount = v;
      }
    }
    return CONTAINER_TYPES.find((ct) => ct.id === best)?.label || "None";
  }, [containers]);

  // Color distribution for emotional load bar
  const colorDistribution = useMemo(() => {
    const containedItems = items.filter((it) => it.status === "contained");
    const counts: Record<string, number> = {};
    for (const item of containedItems) {
      const color = item.color || "#8B5CF6";
      counts[color] = (counts[color] || 0) + 1;
    }
    const total = containedItems.length || 1;
    return Object.entries(counts).map(([color, count]) => ({
      color,
      pct: (count / total) * 100,
    }));
  }, [items]);

  if (items.length === 0) return null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-2xl overflow-hidden",
        "bg-white/[0.04] backdrop-blur-xl border border-white/[0.08]",
      )}
    >
      <button
        onClick={() => {
          playClickSound();
          setExpanded(!expanded);
        }}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2">
          <BarChart3 className="w-3.5 h-3.5 text-white/40" />
          <span className="text-xs font-medium text-white/50">Session Insights</span>
        </div>
        {expanded ? (
          <ChevronUp className="w-3.5 h-3.5 text-white/30" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-white/30" />
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-2.5">
                  <p className="text-[9px] uppercase tracking-wider text-white/30">Contained</p>
                  <p className="text-lg font-bold text-white/70">{totalContained}</p>
                </div>
                <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-2.5">
                  <p className="text-[9px] uppercase tracking-wider text-white/30">Dissolved</p>
                  <p className="text-lg font-bold text-amber-400/70">{totalDissolved}</p>
                </div>
                <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-2.5">
                  <p className="text-[9px] uppercase tracking-wider text-white/30">Preferred Type</p>
                  <p className="text-sm font-semibold text-white/60 mt-0.5">{mostUsedType}</p>
                </div>
                <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-2.5">
                  <p className="text-[9px] uppercase tracking-wider text-white/30">Avg. Strength</p>
                  <p className="text-lg font-bold text-white/70">{avgStrength || "---"}</p>
                </div>
              </div>

              {/* Emotional load bar */}
              {colorDistribution.length > 0 && (
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-white/30 mb-1.5">
                    Emotional Load
                  </p>
                  <div className="h-3 rounded-full overflow-hidden flex bg-white/[0.04]">
                    {colorDistribution.map((seg, i) => (
                      <motion.div
                        key={seg.color + i}
                        initial={{ width: 0 }}
                        animate={{ width: `${seg.pct}%` }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                        style={{ backgroundColor: seg.color, opacity: 0.7 }}
                        className="h-full"
                      />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    {colorDistribution.map((seg, i) => {
                      const colorLabel = ITEM_COLORS.find((c) => c.hex === seg.color)?.label || "Other";
                      return (
                        <div key={seg.color + i} className="flex items-center gap-1">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: seg.color }}
                          />
                          <span className="text-[9px] text-white/30">{colorLabel}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── SVG Container Illustrations ──────────────────────────────────────────────

function ChestSVG({ strength, isLocked }: { strength: number; isLocked: boolean }) {
  const wallThickness = 1 + strength * 0.4;
  const glowOpacity = 0.1 + strength * 0.06;
  return (
    <svg viewBox="0 0 200 160" className="w-full h-full">
      <defs>
        <linearGradient id="chest-wood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#A0522D" />
          <stop offset="50%" stopColor="#8B4513" />
          <stop offset="100%" stopColor="#6B3410" />
        </linearGradient>
        <linearGradient id="chest-lid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#B5651D" />
          <stop offset="100%" stopColor="#8B4513" />
        </linearGradient>
        <filter id="chest-glow">
          <feGaussianBlur stdDeviation={strength * 1.5} result="blur" />
          <feFlood floodColor="#D4A574" floodOpacity={glowOpacity} />
          <feComposite in2="blur" operator="in" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Body */}
      <rect x="30" y="70" width="140" height="75" rx="4" fill="url(#chest-wood)"
        stroke="#6B3410" strokeWidth={wallThickness} filter="url(#chest-glow)" />
      {/* Wood plank lines */}
      <line x1="35" y1="90" x2="165" y2="90" stroke="#6B341066" strokeWidth="0.5" />
      <line x1="35" y1="110" x2="165" y2="110" stroke="#6B341066" strokeWidth="0.5" />
      <line x1="35" y1="130" x2="165" y2="130" stroke="#6B341066" strokeWidth="0.5" />
      {/* Metal bands */}
      <rect x="28" y="72" width="144" height="6" rx="1" fill="#C4955A" opacity={0.6} />
      <rect x="28" y="138" width="144" height="6" rx="1" fill="#C4955A" opacity={0.6} />
      {/* Lid (arched) */}
      <path d="M 30 70 Q 100 20 170 70 Z" fill="url(#chest-lid)"
        stroke="#6B3410" strokeWidth={wallThickness} />
      {/* Lid wood lines */}
      <path d="M 50 65 Q 100 30 150 65" fill="none" stroke="#6B341044" strokeWidth="0.5" />
      {/* Clasp / keyhole */}
      <rect x="90" y="62" width="20" height="18" rx="3" fill="#C4955A" />
      <circle cx="100" cy="73" r="3" fill="#4A2810" />
      {isLocked && (
        <g>
          <circle cx="100" cy="73" r="5" fill="none" stroke="#FFD700" strokeWidth="1.5" opacity={0.8} />
          <motion.circle cx="100" cy="73" r="8" fill="none" stroke="#FFD700" strokeWidth="0.5"
            animate={{ r: [8, 12, 8], opacity: [0.6, 0.2, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }} />
        </g>
      )}
    </svg>
  );
}

function SafeSVG({ strength, isLocked }: { strength: number; isLocked: boolean }) {
  const wallThickness = 1.5 + strength * 0.5;
  const glowOpacity = 0.1 + strength * 0.06;
  return (
    <svg viewBox="0 0 200 160" className="w-full h-full">
      <defs>
        <linearGradient id="safe-metal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6B7280" />
          <stop offset="40%" stopColor="#9CA3AF" />
          <stop offset="100%" stopColor="#4B5563" />
        </linearGradient>
        <filter id="safe-glow">
          <feGaussianBlur stdDeviation={strength * 1.2} result="blur" />
          <feFlood floodColor="#9CA3AF" floodOpacity={glowOpacity} />
          <feComposite in2="blur" operator="in" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Body */}
      <rect x="30" y="25" width="140" height="120" rx="6" fill="url(#safe-metal)"
        stroke="#374151" strokeWidth={wallThickness} filter="url(#safe-glow)" />
      {/* Door frame */}
      <rect x="42" y="35" width="116" height="100" rx="3" fill="none"
        stroke="#374151" strokeWidth="1.5" />
      {/* Dial */}
      <circle cx="120" cy="85" r="18" fill="#374151" stroke="#6B7280" strokeWidth="1" />
      <circle cx="120" cy="85" r="14" fill="#4B5563" stroke="#9CA3AF" strokeWidth="0.5" />
      {/* Dial ticks */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30 * Math.PI) / 180;
        return (
          <line key={i}
            x1={120 + Math.cos(angle) * 11} y1={85 + Math.sin(angle) * 11}
            x2={120 + Math.cos(angle) * 13} y2={85 + Math.sin(angle) * 13}
            stroke="#9CA3AF" strokeWidth="0.8" />
        );
      })}
      {/* Handle */}
      <rect x="65" y="75" width="30" height="8" rx="4" fill="#6B7280" stroke="#4B5563" strokeWidth="1" />
      <circle cx="65" cy="79" r="6" fill="#6B7280" stroke="#4B5563" strokeWidth="1" />
      {/* Rivets */}
      <circle cx="40" cy="35" r="3" fill="#9CA3AF" opacity={0.5} />
      <circle cx="160" cy="35" r="3" fill="#9CA3AF" opacity={0.5} />
      <circle cx="40" cy="135" r="3" fill="#9CA3AF" opacity={0.5} />
      <circle cx="160" cy="135" r="3" fill="#9CA3AF" opacity={0.5} />
      {isLocked && (
        <motion.rect x="38" y="33" width="124" height="104" rx="4" fill="none"
          stroke="#FFD700" strokeWidth="1.5" strokeDasharray="6 3"
          animate={{ strokeDashoffset: [0, -18] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }} />
      )}
    </svg>
  );
}

function JarSVG({ strength, isLocked }: { strength: number; isLocked: boolean }) {
  const wallThickness = 0.8 + strength * 0.3;
  const glowOpacity = 0.08 + strength * 0.05;
  return (
    <svg viewBox="0 0 200 160" className="w-full h-full">
      <defs>
        <linearGradient id="jar-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(147,197,253,0.3)" />
          <stop offset="50%" stopColor="rgba(191,219,254,0.15)" />
          <stop offset="100%" stopColor="rgba(147,197,253,0.25)" />
        </linearGradient>
        <filter id="jar-glow">
          <feGaussianBlur stdDeviation={strength * 1.5} result="blur" />
          <feFlood floodColor="#93C5FD" floodOpacity={glowOpacity} />
          <feComposite in2="blur" operator="in" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Jar body */}
      <path d="M 60 45 Q 55 50 50 70 Q 45 100 50 130 Q 55 150 75 152 L 125 152 Q 145 150 150 130 Q 155 100 150 70 Q 145 50 140 45 Z"
        fill="url(#jar-glass)" stroke="rgba(147,197,253,0.5)" strokeWidth={wallThickness}
        filter="url(#jar-glow)" />
      {/* Highlight */}
      <path d="M 65 55 Q 62 70 60 100 Q 58 120 62 140"
        fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" />
      {/* Lid */}
      <rect x="55" y="32" width="90" height="15" rx="4" fill="#A0522D" stroke="#8B4513" strokeWidth="1" />
      <rect x="58" y="35" width="84" height="4" rx="2" fill="#B5651D" opacity={0.5} />
      {/* Lid grip */}
      <rect x="88" y="26" width="24" height="8" rx="4" fill="#8B4513" stroke="#6B3410" strokeWidth="0.5" />
      {isLocked && (
        <motion.ellipse cx="100" cy="90" rx="45" ry="55" fill="none"
          stroke="#FFD700" strokeWidth="1" strokeDasharray="4 4"
          animate={{ strokeDashoffset: [0, -16] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }} />
      )}
    </svg>
  );
}

function BoxSVG({ strength, isLocked }: { strength: number; isLocked: boolean }) {
  const wallThickness = 1 + strength * 0.35;
  const glowOpacity = 0.08 + strength * 0.05;
  return (
    <svg viewBox="0 0 200 160" className="w-full h-full">
      <defs>
        <linearGradient id="box-card" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D2B48C" />
          <stop offset="100%" stopColor="#BC9A6C" />
        </linearGradient>
        <filter id="box-glow">
          <feGaussianBlur stdDeviation={strength * 1.2} result="blur" />
          <feFlood floodColor="#D2B48C" floodOpacity={glowOpacity} />
          <feComposite in2="blur" operator="in" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Box body */}
      <rect x="35" y="55" width="130" height="95" rx="2" fill="url(#box-card)"
        stroke="#A0845C" strokeWidth={wallThickness} filter="url(#box-glow)" />
      {/* Tape */}
      <rect x="85" y="50" width="30" height="100" fill="#D4C5A0" opacity={0.4} />
      {/* Flaps */}
      <path d="M 35 55 L 55 35 L 100 48 L 100 55 Z" fill="#C4A97D" stroke="#A0845C" strokeWidth="0.8" />
      <path d="M 165 55 L 145 35 L 100 48 L 100 55 Z" fill="#C8AD82" stroke="#A0845C" strokeWidth="0.8" />
      {/* Cardboard texture lines */}
      <line x1="40" y1="80" x2="160" y2="80" stroke="#A0845C33" strokeWidth="0.5" />
      <line x1="40" y1="105" x2="160" y2="105" stroke="#A0845C33" strokeWidth="0.5" />
      <line x1="40" y1="130" x2="160" y2="130" stroke="#A0845C33" strokeWidth="0.5" />
      {isLocked && (
        <motion.rect x="80" y="45" width="40" height="15" rx="2" fill="none"
          stroke="#FFD700" strokeWidth="1.5"
          animate={{ opacity: [0.8, 0.4, 0.8] }}
          transition={{ duration: 2, repeat: Infinity }} />
      )}
    </svg>
  );
}

function VaultSVG({ strength, isLocked }: { strength: number; isLocked: boolean }) {
  const wallThickness = 2 + strength * 0.6;
  const glowOpacity = 0.12 + strength * 0.07;
  return (
    <svg viewBox="0 0 200 160" className="w-full h-full">
      <defs>
        <linearGradient id="vault-steel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4B5563" />
          <stop offset="30%" stopColor="#6B7280" />
          <stop offset="70%" stopColor="#4B5563" />
          <stop offset="100%" stopColor="#374151" />
        </linearGradient>
        <filter id="vault-glow">
          <feGaussianBlur stdDeviation={strength * 2} result="blur" />
          <feFlood floodColor="#9CA3AF" floodOpacity={glowOpacity} />
          <feComposite in2="blur" operator="in" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id="vault-door" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#6B7280" />
          <stop offset="100%" stopColor="#374151" />
        </radialGradient>
      </defs>
      {/* Outer frame */}
      <rect x="20" y="15" width="160" height="135" rx="8" fill="url(#vault-steel)"
        stroke="#1F2937" strokeWidth={wallThickness} filter="url(#vault-glow)" />
      {/* Inner door */}
      <rect x="35" y="28" width="130" height="110" rx="5" fill="#4B5563"
        stroke="#374151" strokeWidth="2" />
      {/* Door circle detail */}
      <circle cx="100" cy="83" r="35" fill="none" stroke="#6B7280" strokeWidth="1.5" />
      <circle cx="100" cy="83" r="28" fill="none" stroke="#6B728066" strokeWidth="1" />
      {/* Spoked wheel handle */}
      <circle cx="100" cy="83" r="20" fill="url(#vault-door)" stroke="#9CA3AF" strokeWidth="1" />
      {[0, 60, 120, 180, 240, 300].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        return (
          <line key={angle}
            x1={100 + Math.cos(rad) * 8} y1={83 + Math.sin(rad) * 8}
            x2={100 + Math.cos(rad) * 18} y2={83 + Math.sin(rad) * 18}
            stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" />
        );
      })}
      <circle cx="100" cy="83" r="5" fill="#374151" stroke="#6B7280" strokeWidth="1" />
      {/* Locking bolts */}
      <rect x="165" y="45" width="10" height="8" rx="2" fill="#6B7280" />
      <rect x="165" y="80" width="10" height="8" rx="2" fill="#6B7280" />
      <rect x="165" y="115" width="10" height="8" rx="2" fill="#6B7280" />
      {isLocked && (
        <g>
          <motion.circle cx="100" cy="83" r="38" fill="none" stroke="#FFD700" strokeWidth="1.5"
            animate={{ r: [38, 42, 38], opacity: [0.8, 0.3, 0.8] }}
            transition={{ duration: 3, repeat: Infinity }} />
          {[0, 90, 180, 270].map((angle) => {
            const rad = (angle * Math.PI) / 180;
            return (
              <motion.circle key={angle}
                cx={100 + Math.cos(rad) * 38} cy={83 + Math.sin(rad) * 38}
                r="3" fill="#FFD700"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: angle / 360 }} />
            );
          })}
        </g>
      )}
    </svg>
  );
}

function ContainerSVG({ type, strength, isLocked }: { type: string; strength: number; isLocked: boolean }) {
  switch (type) {
    case "chest": return <ChestSVG strength={strength} isLocked={isLocked} />;
    case "safe": return <SafeSVG strength={strength} isLocked={isLocked} />;
    case "jar": return <JarSVG strength={strength} isLocked={isLocked} />;
    case "box": return <BoxSVG strength={strength} isLocked={isLocked} />;
    case "vault": return <VaultSVG strength={strength} isLocked={isLocked} />;
    default: return <ChestSVG strength={strength} isLocked={isLocked} />;
  }
}

// ─── Lock Method Visuals ──────────────────────────────────────────────────────

function LockVisual({ method }: { method: string }) {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      exit={{ scale: 0, rotate: 180 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
      className="absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center text-base shadow-lg z-10"
      style={{ backgroundColor: "rgba(255,215,0,0.9)" }}
    >
      {method === "key" && "🔑"}
      {method === "combination" && "🔢"}
      {method === "seal" && "🔏"}
      {method === "chain" && "⛓️"}
      {method === "magic" && "✨"}
    </motion.div>
  );
}

// ─── Sparkle Dissolve Effect ──────────────────────────────────────────────────

function SparkleEffect({ color }: { color: string }) {
  const particles = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: (seededRandom(i * 7 + 3) - 0.5) * 80,
      y: -(seededRandom(i * 13 + 5) * 60 + 20),
      size: seededRandom(i * 11 + 7) * 4 + 2,
      delay: seededRandom(i * 17 + 11) * 0.4,
    })),
  []);

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-visible">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{ width: p.size, height: p.size, backgroundColor: color || "#F59E0B" }}
          initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          animate={{ opacity: 0, x: p.x, y: p.y, scale: 0 }}
          transition={{ duration: 0.8, delay: p.delay, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

// ─── Contained Item Chip ──────────────────────────────────────────────────────

function ContainedItemChip({
  item,
  isLocked,
  onDissolve,
  showDissolution = true,
  useEnhancedDissolution = false,
  onEnhancedDissolve,
}: {
  item: ContainmentItemData;
  isLocked: boolean;
  onDissolve: (id: string) => void;
  showDissolution?: boolean;
  useEnhancedDissolution?: boolean;
  onEnhancedDissolve?: (item: ContainmentItemData) => void;
}) {
  const [dissolving, setDissolving] = useState(false);
  const chipColor = item.color || "#8B5CF6";

  const handleDissolve = useCallback(() => {
    if (useEnhancedDissolution && onEnhancedDissolve) {
      playClickSound();
      onEnhancedDissolve(item);
      return;
    }
    playClickSound();
    setDissolving(true);
    setTimeout(() => onDissolve(item.id), 900);
  }, [item, onDissolve, useEnhancedDissolution, onEnhancedDissolve]);

  if (item.status === "dissolved") {
    return null;
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.5 }}
      animate={{
        opacity: dissolving ? 0 : 1,
        y: 0,
        scale: dissolving ? 0.3 : 1,
      }}
      exit={{ opacity: 0, scale: 0.3, y: -10 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="relative group"
    >
      {dissolving && <SparkleEffect color={chipColor} />}
      <div
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium",
          "backdrop-blur-md border shadow-sm transition-all duration-200",
          isLocked
            ? "opacity-50 blur-[1px]"
            : "hover:shadow-md cursor-default"
        )}
        style={{
          backgroundColor: `${chipColor}20`,
          borderColor: `${chipColor}40`,
          color: chipColor,
        }}
      >
        {item.emoji && <span className="text-sm">{item.emoji}</span>}
        <span className="max-w-[100px] truncate">{item.label}</span>
        {!isLocked && !dissolving && showDissolution && (
          <button
            onClick={handleDissolve}
            className="opacity-0 group-hover:opacity-100 transition-opacity ml-0.5 hover:scale-110"
            title="Dissolve this thought"
          >
            <Sparkles className="w-3 h-3" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ─── Container Type Picker ────────────────────────────────────────────────────

function ContainerTypePicker({ onSelect }: { onSelect: (type: string) => void }) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {CONTAINER_TYPES.map((ct) => (
        <motion.button
          key={ct.id}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            playClickSound();
            onSelect(ct.id);
          }}
          className={cn(
            "flex flex-col items-center gap-1.5 p-3 rounded-xl",
            "bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20",
            "backdrop-blur-sm transition-colors duration-200"
          )}
        >
          <div className="w-12 h-10">
            <ContainerSVG type={ct.id} strength={5} isLocked={false} />
          </div>
          <span className="text-[10px] font-medium text-white/70">{ct.label}</span>
        </motion.button>
      ))}
    </div>
  );
}

// ─── Add Item Panel ───────────────────────────────────────────────────────────

function AddItemPanel({
  containerId,
  onAdd,
  onClose,
}: {
  containerId: string;
  onAdd: (containerId: string, label: string, emoji: string | null, color: string | null) => void;
  onClose: () => void;
}) {
  const [label, setLabel] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(ITEM_COLORS[0].hex);

  const handleSubmit = useCallback(() => {
    if (!label.trim()) return;
    playClickSound();
    onAdd(containerId, label.trim(), selectedEmoji, selectedColor);
    setLabel("");
    setSelectedEmoji(null);
  }, [containerId, label, selectedEmoji, selectedColor, onAdd]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className={cn(
        "rounded-2xl p-4 space-y-3",
        "bg-white/[0.06] backdrop-blur-xl border border-white/[0.12]",
        "shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-white/80">
          Add a thought or feeling to contain
        </h4>
        <button onClick={onClose} className="text-white/40 hover:text-white/70 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Text input */}
      <input
        type="text"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        placeholder="What would you like to contain?"
        className={cn(
          "w-full px-3 py-2.5 rounded-xl text-sm",
          "bg-white/[0.06] backdrop-blur-md border border-white/[0.1]",
          "text-white/90 placeholder:text-white/30",
          "focus:outline-none focus:border-white/25 focus:ring-1 focus:ring-white/10",
          "transition-all duration-200"
        )}
        autoFocus
      />

      {/* Emoji picker */}
      <div>
        <span className="text-[10px] uppercase tracking-wider text-white/40 font-medium">
          Emotion (optional)
        </span>
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {EMOTION_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                playClickSound();
                setSelectedEmoji(selectedEmoji === emoji ? null : emoji);
              }}
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center text-base",
                "transition-all duration-150 hover:scale-110",
                selectedEmoji === emoji
                  ? "bg-white/20 ring-1 ring-white/30 scale-110"
                  : "bg-white/[0.04] hover:bg-white/10"
              )}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Color picker */}
      <div>
        <span className="text-[10px] uppercase tracking-wider text-white/40 font-medium">
          Color
        </span>
        <div className="flex gap-2 mt-1.5">
          {ITEM_COLORS.map((color) => (
            <button
              key={color.id}
              onClick={() => {
                playClickSound();
                setSelectedColor(color.hex);
              }}
              className={cn(
                "w-7 h-7 rounded-full transition-all duration-150 hover:scale-110",
                selectedColor === color.hex
                  ? "ring-2 ring-white/50 ring-offset-2 ring-offset-transparent scale-110"
                  : "hover:ring-1 hover:ring-white/20"
              )}
              style={{ backgroundColor: color.hex }}
              title={color.label}
            />
          ))}
        </div>
      </div>

      {/* Submit button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleSubmit}
        disabled={!label.trim()}
        className={cn(
          "w-full py-2.5 rounded-xl text-sm font-medium",
          "flex items-center justify-center gap-2",
          "transition-all duration-200",
          label.trim()
            ? "bg-gradient-to-r from-amber-500/30 to-orange-500/30 text-white/90 border border-amber-500/30 hover:from-amber-500/40 hover:to-orange-500/40"
            : "bg-white/[0.04] text-white/30 border border-white/[0.06] cursor-not-allowed"
        )}
      >
        <Plus className="w-4 h-4" />
        Contain this thought
      </motion.button>
    </motion.div>
  );
}

// ─── Lock Panel ───────────────────────────────────────────────────────────────

function LockPanel({
  containerId,
  onLock,
  onClose,
}: {
  containerId: string;
  onLock: (containerId: string, lockMethod: string, containmentStrength: number) => void;
  onClose: () => void;
}) {
  const [selectedMethod, setSelectedMethod] = useState<string>("key");
  const [strength, setStrength] = useState<number>(5);
  const [showBreathing, setShowBreathing] = useState(false);

  const handleLock = useCallback(() => {
    playClickSound();
    onLock(containerId, selectedMethod, strength);
    onClose();
  }, [containerId, selectedMethod, strength, onLock, onClose]);

  const handleInitiateLock = useCallback(() => {
    playClickSound();
    setShowBreathing(true);
  }, []);

  if (showBreathing) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        className={cn(
          "rounded-2xl p-4 space-y-2",
          "bg-white/[0.06] backdrop-blur-xl border border-white/[0.12]",
          "shadow-[0_8px_32px_rgba(0,0,0,0.3)]",
        )}
      >
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-white/80 flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-400/80" />
            Breathing seal ritual
          </h4>
          <button onClick={onClose} className="text-white/40 hover:text-white/70 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-white/40 text-center">
          Take three breaths before sealing this container.
        </p>
        <BreathingRitual
          onComplete={handleLock}
          onSkip={handleLock}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className={cn(
        "rounded-2xl p-4 space-y-4",
        "bg-white/[0.06] backdrop-blur-xl border border-white/[0.12]",
        "shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-white/80 flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-400/80" />
          Seal the container
        </h4>
        <button onClick={onClose} className="text-white/40 hover:text-white/70 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Lock method selection */}
      <div>
        <span className="text-[10px] uppercase tracking-wider text-white/40 font-medium">
          Lock method
        </span>
        <div className="grid grid-cols-5 gap-2 mt-2">
          {LOCK_METHODS.map((method) => (
            <motion.button
              key={method.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                playClickSound();
                setSelectedMethod(method.id);
              }}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-xl text-center",
                "transition-all duration-200 border",
                selectedMethod === method.id
                  ? "bg-amber-500/20 border-amber-500/40 text-white/90"
                  : "bg-white/[0.04] border-white/[0.08] text-white/50 hover:bg-white/[0.08]"
              )}
            >
              <span className="text-lg">{method.icon}</span>
              <span className="text-[9px] font-medium">{method.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Containment strength */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase tracking-wider text-white/40 font-medium">
            Containment strength
          </span>
          <span className="text-xs font-bold text-amber-400/80">{strength}/10</span>
        </div>
        <div className="relative">
          <input
            type="range"
            min={1}
            max={10}
            value={strength}
            onChange={(e) => setStrength(parseInt(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, rgba(245,158,11,0.4) 0%, rgba(245,158,11,0.8) ${(strength / 10) * 100}%, rgba(255,255,255,0.08) ${(strength / 10) * 100}%, rgba(255,255,255,0.08) 100%)`,
            }}
          />
          <div className="flex justify-between mt-1">
            <span className="text-[9px] text-white/30">Light</span>
            <span className="text-[9px] text-white/30">Impenetrable</span>
          </div>
        </div>
      </div>

      {/* Strength description */}
      <div className="text-xs text-white/50 italic text-center px-2">
        {strength <= 3 && "A gentle hold -- enough to set aside for now."}
        {strength > 3 && strength <= 6 && "A firm seal -- these thoughts are safely contained."}
        {strength > 6 && strength <= 8 && "A strong barrier -- nothing gets out until you are ready."}
        {strength > 8 && "An absolute vault -- completely sealed and impenetrable."}
      </div>

      {/* Lock buttons */}
      <div className="flex gap-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleInitiateLock}
          className={cn(
            "flex-1 py-2.5 rounded-xl text-sm font-medium",
            "flex items-center justify-center gap-2",
            "bg-gradient-to-r from-purple-500/20 to-amber-500/20",
            "text-white/80 border border-purple-500/20",
            "hover:from-purple-500/30 hover:to-amber-500/30",
            "transition-all duration-200"
          )}
        >
          Seal with Breath
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLock}
          className={cn(
            "flex-1 py-2.5 rounded-xl text-sm font-medium",
            "flex items-center justify-center gap-2",
            "bg-gradient-to-r from-amber-500/30 to-yellow-500/30",
            "text-amber-200/90 border border-amber-500/30",
            "hover:from-amber-500/40 hover:to-yellow-500/40",
            "transition-all duration-200"
          )}
        >
          <Lock className="w-4 h-4" />
          Seal & Lock
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── Gallery Card (compact) ──────────────────────────────────────────────────

function GalleryCard({
  container,
  items,
  isActive,
  onSelect,
  onQuickAdd,
}: {
  container: ContainmentContainerData;
  items: ContainmentItemData[];
  isActive: boolean;
  onSelect: () => void;
  onQuickAdd: () => void;
}) {
  const containedItems = items.filter((it) => it.status === "contained");
  const containerLabel = CONTAINER_TYPES.find((ct) => ct.id === container.containerType)?.label || "Container";

  return (
    <motion.button
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={onSelect}
      className={cn(
        "flex-shrink-0 w-36 rounded-xl p-3 text-left",
        "transition-all duration-200 border relative",
        isActive
          ? "bg-white/[0.08] border-amber-400/40 shadow-[0_0_15px_rgba(245,158,11,0.12)]"
          : "bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06]",
      )}
    >
      <div className="w-full h-14 mb-2">
        <ContainerSVG
          type={container.containerType}
          strength={container.containmentStrength ?? 5}
          isLocked={container.isLocked}
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-white/70 truncate">{containerLabel}</span>
        {container.isLocked && (
          <Lock className="w-3 h-3 text-amber-400/60 flex-shrink-0" />
        )}
      </div>
      <div className="flex items-center justify-between mt-1">
        <span className="text-[9px] text-white/30">
          {containedItems.length} item{containedItems.length !== 1 ? "s" : ""}
        </span>
        <motion.button
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            playClickSound();
            onQuickAdd();
          }}
          className={cn(
            "w-5 h-5 rounded-full flex items-center justify-center",
            "bg-white/[0.08] hover:bg-white/[0.15] text-white/40 hover:text-white/70",
            "transition-all duration-150",
            container.isLocked && "opacity-30 pointer-events-none",
          )}
        >
          <Plus className="w-3 h-3" />
        </motion.button>
      </div>
    </motion.button>
  );
}

// ─── Container Gallery ────────────────────────────────────────────────────────

function ContainerGallery({
  containers,
  itemsByContainer,
  activeContainerId,
  onSelectContainer,
  onQuickAdd,
}: {
  containers: ContainmentContainerData[];
  itemsByContainer: Record<string, ContainmentItemData[]>;
  activeContainerId: string | null;
  onSelectContainer: (id: string) => void;
  onQuickAdd: (containerId: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (containers.length < 2) return null;

  return (
    <div className="relative">
      <p className="text-[10px] uppercase tracking-wider text-white/30 font-medium mb-2">
        Containers
      </p>
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
        style={{ scrollbarWidth: "thin" }}
      >
        {containers.map((container) => (
          <GalleryCard
            key={container.id}
            container={container}
            items={itemsByContainer[container.id] || []}
            isActive={activeContainerId === container.id}
            onSelect={() => onSelectContainer(container.id)}
            onQuickAdd={() => onQuickAdd(container.id)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Single Container Card ────────────────────────────────────────────────────

function ContainerCard({
  container,
  items,
  onAddItem,
  onDissolveItem,
  onLock,
  onUnlock,
  showDissolution = true,
  maxItemsPerContainer = 0,
  dissolutionCount,
}: {
  container: ContainmentContainerData;
  items: ContainmentItemData[];
  onAddItem: (containerId: string, label: string, emoji: string | null, color: string | null) => void;
  onDissolveItem: (itemId: string) => void;
  onLock: (containerId: string, lockMethod: string, containmentStrength: number) => void;
  onUnlock: (containerId: string) => void;
  showDissolution?: boolean;
  maxItemsPerContainer?: number;
  dissolutionCount: number;
}) {
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [showLockPanel, setShowLockPanel] = useState(false);
  const [dissolvingItem, setDissolvingItem] = useState<ContainmentItemData | null>(null);
  const [milestoneToShow, setMilestoneToShow] = useState<number | null>(null);

  const containedItems = useMemo(
    () => items.filter((it) => it.status === "contained"),
    [items],
  );

  const dissolvedCount = useMemo(
    () => items.filter((it) => it.status === "dissolved").length,
    [items],
  );

  const containerLabel = CONTAINER_TYPES.find((ct) => ct.id === container.containerType)?.label || "Container";
  const strengthVal = container.containmentStrength ?? 5;

  const handleAddItem = useCallback(
    (cid: string, label: string, emoji: string | null, color: string | null) => {
      onAddItem(cid, label, emoji, color);
      setShowAddPanel(false);
    },
    [onAddItem],
  );

  const handleEnhancedDissolve = useCallback(
    (item: ContainmentItemData) => {
      setDissolvingItem(item);
    },
    [],
  );

  const handleDissolutionComplete = useCallback(
    (_reflection: string) => {
      if (dissolvingItem) {
        onDissolveItem(dissolvingItem.id);
        const newTotal = dissolutionCount + 1;
        if (DISSOLUTION_MILESTONES.includes(newTotal)) {
          setMilestoneToShow(newTotal);
          setTimeout(() => setMilestoneToShow(null), 3000);
        }
      }
      setDissolvingItem(null);
    },
    [dissolvingItem, onDissolveItem, dissolutionCount],
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className={cn(
        "rounded-2xl p-4 space-y-3 relative overflow-visible",
        "bg-white/[0.04] backdrop-blur-xl border",
        container.isLocked
          ? "border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.08)]"
          : "border-white/[0.1]"
      )}
    >
      {/* Lock icon badge */}
      <AnimatePresence>
        {container.isLocked && container.lockMethod && (
          <LockVisual method={container.lockMethod} />
        )}
      </AnimatePresence>

      {/* Container header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white/80">{containerLabel}</span>
          {container.isLocked && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400/80 font-medium">
              SEALED
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-[10px] text-white/40">
          {containedItems.length > 0 && (
            <span>{containedItems.length} item{containedItems.length !== 1 ? "s" : ""}</span>
          )}
          {dissolvedCount > 0 && (
            <span className="ml-1 text-amber-400/50">{dissolvedCount} dissolved</span>
          )}
        </div>
      </div>

      {/* Container SVG illustration with strength meter ring */}
      <div className="relative w-full h-32 flex items-center justify-center">
        {/* Strength meter ring */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-40 h-32">
            <StrengthMeterRing strength={strengthVal} isLocked={container.isLocked} />
          </div>
        </div>

        <motion.div
          className="w-40 h-32 relative z-[1]"
          animate={container.isLocked ? { scale: [1, 1.01, 1] } : {}}
          transition={container.isLocked ? { duration: 4, repeat: Infinity, ease: "easeInOut" } : {}}
        >
          <ContainerSVG
            type={container.containerType}
            strength={strengthVal}
            isLocked={container.isLocked}
          />
        </motion.div>

        {/* Items peeking out when unlocked */}
        {!container.isLocked && containedItems.length > 0 && (
          <div className="absolute top-1 left-1/2 -translate-x-1/2 flex gap-0.5 max-w-[140px] overflow-hidden z-[2]">
            {containedItems.slice(0, 4).map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 0.7 }}
                transition={{ delay: idx * 0.1 }}
                className="text-[10px] px-1.5 py-0.5 rounded-full truncate max-w-[60px]"
                style={{
                  backgroundColor: `${item.color || "#8B5CF6"}25`,
                  color: item.color || "#8B5CF6",
                }}
              >
                {item.emoji || ""}{item.label.slice(0, 6)}
              </motion.div>
            ))}
            {containedItems.length > 4 && (
              <span className="text-[9px] text-white/30 self-center">+{containedItems.length - 4}</span>
            )}
          </div>
        )}
      </div>

      {/* Strength indicator bar */}
      <div className="flex items-center gap-2">
        <span className="text-[9px] text-white/30 uppercase tracking-wider whitespace-nowrap">
          Strength
        </span>
        <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background:
                strengthVal <= 3
                  ? "linear-gradient(to right, rgba(245,158,11,0.4), rgba(245,158,11,0.8))"
                  : strengthVal <= 6
                    ? "linear-gradient(to right, rgba(59,130,246,0.4), rgba(59,130,246,0.8))"
                    : "linear-gradient(to right, rgba(139,92,246,0.4), rgba(139,92,246,0.8))",
            }}
            initial={{ width: 0 }}
            animate={{ width: `${(strengthVal / 10) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        <span
          className={cn(
            "text-[9px] font-medium",
            strengthVal <= 3
              ? "text-amber-400/60"
              : strengthVal <= 6
                ? "text-blue-400/60"
                : "text-purple-400/60",
          )}
        >
          {strengthVal}
        </span>
      </div>

      {/* Milestone toast */}
      <AnimatePresence>
        {milestoneToShow !== null && (
          <MilestoneToast count={milestoneToShow} />
        )}
      </AnimatePresence>

      {/* Enhanced dissolution ceremony */}
      <AnimatePresence>
        {dissolvingItem && (
          <DissolutionCeremony
            item={dissolvingItem}
            onComplete={handleDissolutionComplete}
            onCancel={() => setDissolvingItem(null)}
          />
        )}
      </AnimatePresence>

      {/* Item list */}
      <AnimatePresence mode="popLayout">
        {containedItems.length > 0 && !dissolvingItem && (
          <motion.div
            layout
            className="flex flex-wrap gap-1.5"
          >
            {containedItems.map((item) => (
              <ContainedItemChip
                key={item.id}
                item={item}
                isLocked={container.isLocked}
                onDissolve={onDissolveItem}
                showDissolution={showDissolution}
                useEnhancedDissolution={true}
                onEnhancedDissolve={handleEnhancedDissolve}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {containedItems.length === 0 && !showAddPanel && (
        <div className="text-center py-2">
          <p className="text-xs text-white/30 italic">
            This container is empty. Add thoughts or feelings to contain.
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        {!container.isLocked && (
          <>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              disabled={maxItemsPerContainer > 0 && containedItems.length >= maxItemsPerContainer}
              onClick={() => {
                playClickSound();
                setShowAddPanel(!showAddPanel);
                setShowLockPanel(false);
              }}
              className={cn(
                "flex-1 py-2 rounded-xl text-xs font-medium",
                "flex items-center justify-center gap-1.5",
                "bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1]",
                "text-white/60 hover:text-white/80 transition-all duration-200",
                "disabled:opacity-30 disabled:cursor-not-allowed"
              )}
            >
              <Plus className="w-3.5 h-3.5" />
              Add Item
            </motion.button>

            {containedItems.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  playClickSound();
                  setShowLockPanel(!showLockPanel);
                  setShowAddPanel(false);
                }}
                className={cn(
                  "flex-1 py-2 rounded-xl text-xs font-medium",
                  "flex items-center justify-center gap-1.5",
                  "bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20",
                  "text-amber-400/80 hover:text-amber-300 transition-all duration-200"
                )}
              >
                <Lock className="w-3.5 h-3.5" />
                Lock
              </motion.button>
            )}
          </>
        )}

        {container.isLocked && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              playClickSound();
              onUnlock(container.id);
            }}
            className={cn(
              "flex-1 py-2 rounded-xl text-xs font-medium",
              "flex items-center justify-center gap-1.5",
              "bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1]",
              "text-white/60 hover:text-white/80 transition-all duration-200"
            )}
          >
            <Unlock className="w-3.5 h-3.5" />
            Unlock
          </motion.button>
        )}
      </div>

      {/* Panels */}
      <AnimatePresence>
        {showAddPanel && !container.isLocked && (
          <AddItemPanel
            containerId={container.id}
            onAdd={handleAddItem}
            onClose={() => setShowAddPanel(false)}
          />
        )}
        {showLockPanel && !container.isLocked && (
          <LockPanel
            containerId={container.id}
            onLock={onLock}
            onClose={() => setShowLockPanel(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ContainmentBox({
  containers,
  items,
  onCreateContainer,
  onAddItem,
  onContainItem,
  onDissolveItem,
  onLock,
  onUnlock,
  onClear,
  isClinician,
  toolSettings,
  onSettingsUpdate,
}: ContainmentBoxProps) {
  const settings = { ...DEFAULT_CONTAINMENT_BOX_SETTINGS, ...toolSettings } as ContainmentBoxSettings;
  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [activeContainerId, setActiveContainerId] = useState<string | null>(null);
  const [galleryQuickAddId, setGalleryQuickAddId] = useState<string | null>(null);

  const itemsByContainer = useMemo(() => {
    const map: Record<string, ContainmentItemData[]> = {};
    for (const container of containers) {
      map[container.id] = [];
    }
    for (const item of items) {
      if (map[item.containerId]) {
        map[item.containerId].push(item);
      }
    }
    return map;
  }, [containers, items]);

  const totalContained = useMemo(
    () => items.filter((it) => it.status === "contained").length,
    [items],
  );

  const totalDissolved = useMemo(
    () => items.filter((it) => it.status === "dissolved").length,
    [items],
  );

  const lockedCount = useMemo(
    () => containers.filter((c) => c.isLocked).length,
    [containers],
  );

  const handleCreateContainer = useCallback(
    (type: string) => {
      onCreateContainer(type);
      setShowCreatePanel(false);
    },
    [onCreateContainer],
  );

  // For gallery: when user selects from gallery, scroll to that container
  const handleGallerySelect = useCallback((containerId: string) => {
    playClickSound();
    setActiveContainerId(containerId);
  }, []);

  const handleGalleryQuickAdd = useCallback((containerId: string) => {
    setActiveContainerId(containerId);
    setGalleryQuickAddId(containerId);
    // The quick-add state will be cleared by the ContainerCard internally
  }, []);

  // Determine which containers to show based on gallery selection
  const displayContainers = useMemo(() => {
    if (containers.length <= 1) return containers;
    if (activeContainerId) {
      const found = containers.find((c) => c.id === activeContainerId);
      if (found) return [found];
    }
    return containers;
  }, [containers, activeContainerId]);

  return (
    <div
      className={cn(
        "relative w-full min-h-[500px] rounded-3xl overflow-hidden",
        "bg-gradient-to-br from-[#1a1625] via-[#1e1a2e] to-[#16132a]",
        "border border-white/[0.06]",
        "shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
      )}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl opacity-[0.04]"
          style={{ background: "radial-gradient(circle, #F59E0B, transparent)" }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl opacity-[0.03]"
          style={{ background: "radial-gradient(circle, #8B5CF6, transparent)" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-[0.02]"
          style={{ background: "radial-gradient(circle, #D4A574, transparent)" }}
        />
      </div>

      {/* Content wrapper */}
      <div className="relative z-10 p-5 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white/90 tracking-tight">
              Containment Box
            </h2>
            <p className="text-xs text-white/40 mt-0.5">
              Place distressing thoughts into a container and seal them away safely
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Stats pills */}
            {(totalContained > 0 || totalDissolved > 0) && (
              <div className="flex gap-1.5 mr-2">
                {totalContained > 0 && (
                  <span className="text-[10px] px-2 py-1 rounded-full bg-white/[0.06] text-white/40 border border-white/[0.08]">
                    {totalContained} contained
                  </span>
                )}
                {totalDissolved > 0 && (
                  <span className="text-[10px] px-2 py-1 rounded-full bg-amber-500/10 text-amber-400/50 border border-amber-500/15">
                    {totalDissolved} dissolved
                  </span>
                )}
                {lockedCount > 0 && (
                  <span className="text-[10px] px-2 py-1 rounded-full bg-amber-500/10 text-amber-400/50 border border-amber-500/15 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    {lockedCount} sealed
                  </span>
                )}
              </div>
            )}

          </div>
        </div>

        {/* Container Gallery (when multiple containers exist) */}
        {containers.length >= 2 && (
          <ContainerGallery
            containers={containers}
            itemsByContainer={itemsByContainer}
            activeContainerId={activeContainerId}
            onSelectContainer={handleGallerySelect}
            onQuickAdd={handleGalleryQuickAdd}
          />
        )}

        {/* Gallery: show all button when filtered */}
        {containers.length >= 2 && activeContainerId && (
          <div className="flex justify-center">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                playClickSound();
                setActiveContainerId(null);
              }}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[10px] font-medium",
                "bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08]",
                "text-white/40 hover:text-white/60 transition-all duration-200",
                "flex items-center gap-1.5",
              )}
            >
              <Eye className="w-3 h-3" />
              Show all containers
            </motion.button>
          </div>
        )}

        {/* Create container button / panel */}
        <div>
          <AnimatePresence mode="wait">
            {showCreatePanel ? (
              <motion.div
                key="create-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className={cn(
                  "rounded-2xl p-4 space-y-3",
                  "bg-white/[0.06] backdrop-blur-xl border border-white/[0.12]",
                  "shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
                )}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-white/80">Choose a container</h4>
                  <button
                    onClick={() => setShowCreatePanel(false)}
                    className="text-white/40 hover:text-white/70 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-white/40">
                  Select the type of container that feels right for holding these thoughts.
                </p>
                <ContainerTypePicker onSelect={handleCreateContainer} />
              </motion.div>
            ) : (
              <motion.button
                key="create-button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => {
                  playClickSound();
                  setShowCreatePanel(true);
                }}
                className={cn(
                  "w-full py-3 rounded-2xl text-sm font-medium",
                  "flex items-center justify-center gap-2",
                  "bg-white/[0.04] hover:bg-white/[0.08] border border-dashed border-white/[0.12] hover:border-white/[0.2]",
                  "text-white/50 hover:text-white/70",
                  "transition-all duration-200"
                )}
              >
                <Plus className="w-4 h-4" />
                Create a new container
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Container grid */}
        {containers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {displayContainers.map((container) => (
                <ContainerCard
                  key={container.id}
                  container={container}
                  items={itemsByContainer[container.id] || []}
                  onAddItem={onAddItem}
                  onDissolveItem={onDissolveItem}
                  onLock={onLock}
                  onUnlock={onUnlock}
                  showDissolution={settings.showDissolution}
                  maxItemsPerContainer={settings.maxItemsPerContainer}
                  dissolutionCount={totalDissolved}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Empty state */}
        {containers.length === 0 && !showCreatePanel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center justify-center py-16 space-y-4"
          >
            <div className="w-24 h-20 opacity-30">
              <ContainerSVG type="chest" strength={5} isLocked={false} />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm text-white/40">No containers yet</p>
              <p className="text-xs text-white/25 max-w-xs">
                Create a container to start placing distressing thoughts and feelings
                inside, then seal them away when you are ready.
              </p>
            </div>
          </motion.div>
        )}

        {/* Session Summary */}
        {items.length > 0 && (
          <SessionSummary containers={containers} items={items} />
        )}

        {/* Therapeutic guidance footer */}
        {containers.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className={cn(
              "rounded-xl p-3",
              "bg-white/[0.02] border border-white/[0.05]"
            )}
          >
            <p className="text-[10px] text-white/25 text-center leading-relaxed">
              These containers are a visualization tool. The thoughts and feelings you place inside
              are acknowledged and safely held. You can return to them when you feel ready, or
              dissolve them when they no longer serve you.
            </p>
          </motion.div>
        )}
      </div>

      {isClinician && onSettingsUpdate && (
        <ClinicianToolbar
          controls={CONTAINMENT_BOX_TOOLBAR_CONTROLS}
          settings={settings}
          onUpdate={onSettingsUpdate}
          onClear={onClear}
        />
      )}
    </div>
  );
}
