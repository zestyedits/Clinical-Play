import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Star,
  Trash2,
  Plus,
  Sparkles,
  RefreshCw,
  X,
  MessageSquare,
  Hash,
} from "lucide-react";
import { ClinicianToolbar, type ToolbarControl } from "./clinician-toolbar";

// ─── Data Interfaces ──────────────────────────────────────────────────────────

export interface GratitudeStoneData {
  id: string;
  content: string;
  category: string;
  color: string;
  shape: string;
  isStarred: boolean;
  createdBy: string;
  createdAt: string;
}

export interface GratitudeJarProps {
  stones: GratitudeStoneData[];
  onAddStone: (content: string, category: string, color: string, shape: string) => void;
  onStarStone: (stoneId: string, isStarred: boolean) => void;
  onRemoveStone: (stoneId: string) => void;
  onClear: () => void;
  isClinician: boolean;
  toolSettings?: Record<string, any>;
  onSettingsUpdate?: (updates: Record<string, any>) => void;
}

// ─── Clinician Toolbar Settings ─────────────────────────────────────────────

interface GratitudeJarSettings {
  showPrompts: boolean;
  maxStones: number;
}

const DEFAULT_GRATITUDE_JAR_SETTINGS: GratitudeJarSettings = {
  showPrompts: true,
  maxStones: 0,
};

const GRATITUDE_JAR_TOOLBAR_CONTROLS: ToolbarControl[] = [
  {
    type: "toggle",
    key: "showPrompts",
    icon: MessageSquare,
    label: "Prompts",
    activeColor: "sky",
  },
  {
    type: "number",
    key: "maxStones",
    icon: Hash,
    label: "Max Stones",
    steps: [0, 5, 10, 20, 50],
    activeColor: "amber",
  },
];

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES: { label: string; color: string }[] = [
  { label: "People", color: "#EC4899" },
  { label: "Experiences", color: "#3B82F6" },
  { label: "Nature", color: "#22C55E" },
  { label: "Achievements", color: "#F59E0B" },
  { label: "Simple Pleasures", color: "#A855F7" },
  { label: "Humor", color: "#F97316" },
];

const SHAPES = ["round", "gem", "star", "heart", "pebble"] as const;
type StoneShape = (typeof SHAPES)[number];

const GRATITUDE_PROMPTS = [
  "I'm grateful for a person who...",
  "Something beautiful I noticed today...",
  "A small win today was...",
  "I felt loved when...",
  "Something that made me laugh...",
  "I appreciate my ability to...",
  "A kind thing someone did for me...",
  "A place that brings me peace...",
  "Something I'm looking forward to...",
  "I'm thankful for my body because...",
  "A lesson I learned recently...",
  "A favorite memory that makes me smile...",
  "Something simple that brought me joy...",
  "I'm grateful for this challenge because...",
  "A sound that comforts me...",
];

const MILESTONES = [10, 25, 50, 100];

// ─── Utility: deterministic pseudo-random from seed ───────────────────────────

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

// ─── Star polygon point generator ─────────────────────────────────────────────

function starPoints(
  cx: number,
  cy: number,
  numPoints: number,
  outerR: number,
  innerR: number,
): string {
  const result: string[] = [];
  for (let i = 0; i < numPoints * 2; i++) {
    const angle = (Math.PI / numPoints) * i - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    result.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
  }
  return result.join(" ");
}

// ─── Stone SVG shapes ─────────────────────────────────────────────────────────

function StoneSVG({
  shape,
  color,
  size,
  isStarred,
}: {
  shape: string;
  color: string;
  size: number;
  isStarred: boolean;
}) {
  const uid = `${shape}-${color.replace("#", "")}-${Math.round(size)}`;
  const glowId = `glow-${uid}`;
  const starGlowId = `sglow-${uid}`;

  const renderShape = () => {
    switch (shape as StoneShape) {
      case "gem":
        return (
          <polygon
            points={`${size / 2},${size * 0.1} ${size * 0.85},${size * 0.4} ${size * 0.7},${size * 0.9} ${size * 0.3},${size * 0.9} ${size * 0.15},${size * 0.4}`}
            fill={color}
            filter={`url(#${glowId})`}
            stroke={`${color}88`}
            strokeWidth={0.5}
          />
        );
      case "star":
        return (
          <polygon
            points={starPoints(size / 2, size / 2, 5, size * 0.4, size * 0.2)}
            fill={color}
            filter={`url(#${glowId})`}
            stroke={`${color}88`}
            strokeWidth={0.5}
          />
        );
      case "heart":
        return (
          <path
            d={`M ${size / 2} ${size * 0.85} C ${size * 0.15} ${size * 0.55}, ${size * 0.05} ${size * 0.25}, ${size * 0.3} ${size * 0.15} C ${size * 0.42} ${size * 0.1}, ${size / 2} ${size * 0.2}, ${size / 2} ${size * 0.3} C ${size / 2} ${size * 0.2}, ${size * 0.58} ${size * 0.1}, ${size * 0.7} ${size * 0.15} C ${size * 0.95} ${size * 0.25}, ${size * 0.85} ${size * 0.55}, ${size / 2} ${size * 0.85} Z`}
            fill={color}
            filter={`url(#${glowId})`}
            stroke={`${color}88`}
            strokeWidth={0.5}
          />
        );
      case "pebble":
        return (
          <ellipse
            cx={size / 2}
            cy={size * 0.55}
            rx={size * 0.42}
            ry={size * 0.32}
            fill={color}
            filter={`url(#${glowId})`}
            stroke={`${color}88`}
            strokeWidth={0.5}
          />
        );
      default: // round
        return (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size * 0.38}
            fill={color}
            filter={`url(#${glowId})`}
            stroke={`${color}88`}
            strokeWidth={0.5}
          />
        );
    }
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="pointer-events-auto"
    >
      <defs>
        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        {isStarred && (
          <filter id={starGlowId} x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feFlood floodColor="#FBBF24" floodOpacity="0.6" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
      </defs>
      {isStarred && (
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size * 0.45}
          fill="none"
          stroke="#FBBF24"
          strokeWidth={1.5}
          opacity={0.5}
          filter={`url(#${starGlowId})`}
        />
      )}
      {renderShape()}
      {/* Inner highlight for glassy look */}
      <ellipse
        cx={size * 0.42}
        cy={size * 0.38}
        rx={size * 0.12}
        ry={size * 0.08}
        fill="white"
        opacity={0.35}
      />
    </svg>
  );
}

// ─── Confetti Burst ───────────────────────────────────────────────────────────

function ConfettiBurst({ onComplete }: { onComplete: () => void }) {
  const particles = useMemo(() => {
    return Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: (seededRandom(i * 7 + 1) - 0.5) * 300,
      y: -(seededRandom(i * 13 + 3) * 250 + 80),
      rotation: seededRandom(i * 17 + 5) * 720 - 360,
      color: CATEGORIES[i % CATEGORIES.length].color,
      size: seededRandom(i * 23 + 7) * 6 + 4,
      delay: seededRandom(i * 29 + 11) * 0.3,
    }));
  }, []);

  useEffect(() => {
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            width: p.size,
            height: p.size * 0.6,
            backgroundColor: p.color,
          }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
          animate={{
            x: p.x,
            y: p.y,
            opacity: 0,
            rotate: p.rotation,
            scale: 0.3,
          }}
          transition={{
            duration: 2,
            delay: p.delay,
            ease: [0.2, 0.8, 0.4, 1],
          }}
        />
      ))}
    </div>
  );
}

// ─── Milestone Toast ──────────────────────────────────────────────────────────

function MilestoneToast({ count }: { count: number }) {
  const messages: Record<number, string> = {
    10: "10 gratitudes! You're building a wonderful habit.",
    25: "25 stones of gratitude! Your jar is glowing.",
    50: "50! Half a hundred reasons to smile.",
    100: "100 gratitudes! What an incredible collection.",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="absolute top-4 left-1/2 -translate-x-1/2 z-40 px-6 py-3 rounded-2xl
        bg-white/20 backdrop-blur-xl border border-white/30 shadow-lg text-center"
    >
      <div className="flex items-center gap-2 text-amber-200">
        <Sparkles className="w-5 h-5" />
        <span className="font-semibold text-sm">
          {messages[count] ?? `${count} gratitudes collected!`}
        </span>
        <Sparkles className="w-5 h-5" />
      </div>
    </motion.div>
  );
}

// ─── Shape Picker ─────────────────────────────────────────────────────────────

function ShapePicker({
  selected,
  onSelect,
  color,
}: {
  selected: string;
  onSelect: (s: string) => void;
  color: string;
}) {
  return (
    <div className="flex gap-1.5 items-center">
      {SHAPES.map((s) => (
        <button
          key={s}
          onClick={() => onSelect(s)}
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200",
            selected === s
              ? "bg-white/25 ring-2 ring-white/40 scale-110"
              : "bg-white/8 hover:bg-white/15",
          )}
          title={s}
        >
          <StoneSVG shape={s} color={color} size={20} isStarred={false} />
        </button>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function GratitudeJar({
  stones,
  onAddStone,
  onStarStone,
  onRemoveStone,
  onClear,
  isClinician,
  toolSettings,
  onSettingsUpdate,
}: GratitudeJarProps) {
  const settings = { ...DEFAULT_GRATITUDE_JAR_SETTINGS, ...toolSettings } as GratitudeJarSettings;
  const [inputText, setInputText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0].label);
  const [selectedColor, setSelectedColor] = useState(CATEGORIES[0].color);
  const [selectedShape, setSelectedShape] = useState<string>("round");
  const [activeStoneId, setActiveStoneId] = useState<string | null>(null);
  const [promptIndex, setPromptIndex] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [milestoneCount, setMilestoneCount] = useState<number | null>(null);
  const [newStoneId, setNewStoneId] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const prevStoneCount = useRef(stones.length);

  // Sync color when category changes
  const handleCategorySelect = useCallback((label: string, color: string) => {
    setSelectedCategory(label);
    setSelectedColor(color);
  }, []);

  // Detect milestone celebrations
  useEffect(() => {
    const prev = prevStoneCount.current;
    const curr = stones.length;
    if (curr > prev) {
      for (const m of MILESTONES) {
        if (prev < m && curr >= m) {
          setShowConfetti(true);
          setMilestoneCount(m);
          const timer = setTimeout(() => setMilestoneCount(null), 3500);
          return () => clearTimeout(timer);
        }
      }
    }
    prevStoneCount.current = curr;
  }, [stones.length]);

  // Mark newest stone for drop animation
  useEffect(() => {
    if (stones.length > 0 && stones.length > prevStoneCount.current) {
      const latest = stones[stones.length - 1];
      setNewStoneId(latest.id);
      const timer = setTimeout(() => setNewStoneId(null), 800);
      return () => clearTimeout(timer);
    }
  }, [stones]);

  const handleAddStone = useCallback(() => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    onAddStone(trimmed, selectedCategory, selectedColor, selectedShape);
    setInputText("");
    inputRef.current?.focus();
  }, [inputText, selectedCategory, selectedColor, selectedShape, onAddStone]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleAddStone();
      }
    },
    [handleAddStone],
  );

  const rotatePrompt = useCallback(() => {
    setPromptIndex((i) => (i + 1) % GRATITUDE_PROMPTS.length);
  }, []);

  const activeStone = useMemo(
    () => stones.find((s) => s.id === activeStoneId) ?? null,
    [stones, activeStoneId],
  );

  // Calculate stone positions inside the jar using deterministic layout
  const stonePositions = useMemo(() => {
    const jarInnerLeft = 0.15;
    const jarInnerRight = 0.85;
    const jarInnerBottom = 0.92;
    const jarInnerTop = 0.18;
    const usableWidth = jarInnerRight - jarInnerLeft;

    const stoneSize = 30;
    const stonesPerRow = 7;
    const rowGap = stoneSize * 0.65;

    return stones.map((_stone, i) => {
      const row = Math.floor(i / stonesPerRow);
      const col = i % stonesPerRow;

      const baseX =
        jarInnerLeft +
        usableWidth * 0.08 +
        (col / Math.max(stonesPerRow - 1, 1)) * usableWidth * 0.84;
      const baseY = jarInnerBottom - (row + 1) * (rowGap / 400);

      const jitterX = (seededRandom(i * 37 + 13) - 0.5) * 0.055;
      const jitterY = (seededRandom(i * 53 + 29) - 0.5) * 0.018;
      const rotation = (seededRandom(i * 71 + 41) - 0.5) * 30;

      return {
        x: Math.max(
          jarInnerLeft + 0.02,
          Math.min(jarInnerRight - 0.1, baseX + jitterX),
        ),
        y: Math.max(jarInnerTop, Math.min(jarInnerBottom - 0.04, baseY + jitterY)),
        rotation,
        size: stoneSize + (seededRandom(i * 11 + 7) - 0.5) * 8,
      };
    });
  }, [stones]);

  return (
    <div className="relative w-full max-w-lg mx-auto flex flex-col items-center gap-4 select-none">
      {/* Warm ambient background glow */}
      <div
        className="absolute inset-0 -z-10 rounded-3xl opacity-40 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 80%, #f59e0b22 0%, #ec489915 40%, transparent 70%)",
        }}
      />

      {/* ── Header: stone count + clinician clear ── */}
      <div className="w-full flex items-center justify-between px-2">
        <div className="flex items-center gap-2 text-sm text-white/60">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full
              bg-white/10 backdrop-blur-sm border border-white/10"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span className="font-medium text-white/80">{stones.length}</span>
            <span>stone{stones.length !== 1 ? "s" : ""}</span>
          </span>
        </div>
        {/* Clinician clear moved to toolbar */}
      </div>

      {/* ── Gratitude prompt generator ── */}
      {settings.showPrompts && (
        <div
          className="w-full px-4 py-2.5 rounded-xl bg-white/8 backdrop-blur-sm
            border border-white/10 flex items-center gap-3"
        >
          <motion.p
            key={promptIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 text-sm text-white/50 italic leading-snug"
          >
            {GRATITUDE_PROMPTS[promptIndex]}
          </motion.p>
          <button
            onClick={rotatePrompt}
            className="shrink-0 p-1.5 rounded-lg hover:bg-white/10 text-white/40
              hover:text-white/70 transition-colors"
            title="Next prompt"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Jar visualization ── */}
      <div className="relative w-full" style={{ aspectRatio: "3 / 4" }}>
        {/* Glass jar SVG */}
        <svg
          viewBox="0 0 300 400"
          className="absolute inset-0 w-full h-full"
          style={{ filter: "drop-shadow(0 8px 32px rgba(0,0,0,0.2))" }}
        >
          <defs>
            <linearGradient id="jarGlass" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="white" stopOpacity="0.12" />
              <stop offset="40%" stopColor="white" stopOpacity="0.06" />
              <stop offset="70%" stopColor="white" stopOpacity="0.03" />
              <stop offset="100%" stopColor="white" stopOpacity="0.08" />
            </linearGradient>
            <linearGradient id="jarHighlight" x1="0" y1="0" x2="0.3" y2="1">
              <stop offset="0%" stopColor="white" stopOpacity="0.2" />
              <stop offset="50%" stopColor="white" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="lidGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.15" />
            </linearGradient>
          </defs>

          {/* Jar body */}
          <path
            d={`M 75 60
                C 75 60, 50 80, 45 120
                L 35 340
                C 35 370, 60 385, 150 385
                C 240 385, 265 370, 265 340
                L 255 120
                C 250 80, 225 60, 225 60
                Z`}
            fill="url(#jarGlass)"
            stroke="white"
            strokeOpacity="0.15"
            strokeWidth="1.5"
          />

          {/* Left refraction line */}
          <path
            d="M 85 70 C 80 90, 62 130, 55 200 L 50 320"
            fill="none"
            stroke="url(#jarHighlight)"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Right subtle refraction */}
          <path
            d="M 220 75 C 230 100, 242 160, 248 240"
            fill="none"
            stroke="white"
            strokeOpacity="0.06"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Jar rim */}
          <rect
            x="68"
            y="42"
            width="164"
            height="22"
            rx="8"
            fill="url(#lidGrad)"
            stroke="white"
            strokeOpacity="0.2"
            strokeWidth="1"
          />

          {/* Lid knob */}
          <rect
            x="125"
            y="32"
            width="50"
            height="14"
            rx="6"
            fill="url(#lidGrad)"
            stroke="white"
            strokeOpacity="0.15"
            strokeWidth="1"
          />
        </svg>

        {/* Stones rendered inside the jar */}
        <div className="absolute inset-0">
          <AnimatePresence>
            {stones.map((stone, i) => {
              const pos = stonePositions[i];
              if (!pos) return null;
              const isNew = stone.id === newStoneId;

              return (
                <motion.div
                  key={stone.id}
                  className="absolute cursor-pointer"
                  style={{
                    left: `${pos.x * 100}%`,
                    top: `${pos.y * 100}%`,
                    width: pos.size,
                    height: pos.size,
                    zIndex: i + 1,
                  }}
                  initial={
                    isNew
                      ? { y: -350, opacity: 0, scale: 0.5, rotate: pos.rotation }
                      : { opacity: 1, rotate: pos.rotation }
                  }
                  animate={{
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    rotate: pos.rotation,
                  }}
                  exit={{ opacity: 0, scale: 0, transition: { duration: 0.25 } }}
                  transition={
                    isNew
                      ? {
                          type: "spring",
                          stiffness: 180,
                          damping: 14,
                          mass: 0.8,
                        }
                      : { duration: 0.3 }
                  }
                  onClick={() =>
                    setActiveStoneId(activeStoneId === stone.id ? null : stone.id)
                  }
                  whileHover={{ scale: 1.2, zIndex: 100 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <StoneSVG
                    shape={stone.shape}
                    color={stone.color}
                    size={pos.size}
                    isStarred={stone.isStarred}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Stone detail tooltip / card */}
        <AnimatePresence>
          {activeStone && (
            <motion.div
              key={`tooltip-${activeStone.id}`}
              initial={{ opacity: 0, y: 10, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.92 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="absolute left-1/2 top-[35%] -translate-x-1/2 -translate-y-1/2 z-50
                w-64 p-4 rounded-2xl bg-white/15 backdrop-blur-2xl
                border border-white/25 shadow-2xl"
            >
              <button
                onClick={() => setActiveStoneId(null)}
                className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/15
                  text-white/40 hover:text-white/80 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-start gap-3">
                <div className="shrink-0 mt-0.5">
                  <StoneSVG
                    shape={activeStone.shape}
                    color={activeStone.color}
                    size={32}
                    isStarred={activeStone.isStarred}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/90 leading-relaxed mb-2">
                    {activeStone.content}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <span
                      className="px-2 py-0.5 rounded-full text-white/70"
                      style={{ backgroundColor: `${activeStone.color}30` }}
                    >
                      {activeStone.category}
                    </span>
                    <span>
                      {new Date(activeStone.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-white/10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onStarStone(activeStone.id, !activeStone.isStarred);
                  }}
                  className={cn(
                    "p-1.5 rounded-lg transition-all duration-200",
                    activeStone.isStarred
                      ? "bg-amber-400/20 text-amber-300"
                      : "bg-white/8 text-white/40 hover:text-amber-300 hover:bg-amber-400/10",
                  )}
                  title={activeStone.isStarred ? "Unstar" : "Star"}
                >
                  <Star
                    className="w-4 h-4"
                    fill={activeStone.isStarred ? "currentColor" : "none"}
                  />
                </button>
                {isClinician && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveStone(activeStone.id);
                      setActiveStoneId(null);
                    }}
                    className="p-1.5 rounded-lg bg-white/8 text-white/40
                      hover:text-red-300 hover:bg-red-500/15 transition-all duration-200"
                    title="Remove stone"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Confetti burst on milestones */}
        {showConfetti && (
          <ConfettiBurst onComplete={() => setShowConfetti(false)} />
        )}

        {/* Milestone toast */}
        <AnimatePresence>
          {milestoneCount !== null && <MilestoneToast count={milestoneCount} />}
        </AnimatePresence>
      </div>

      {/* ── Input panel — glassmorphic ── */}
      <div
        className="w-full rounded-2xl p-4 space-y-3
          bg-white/10 backdrop-blur-xl border border-white/15 shadow-lg"
      >
        {/* Category selector chips */}
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.label}
              onClick={() => handleCategorySelect(cat.label, cat.color)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition-all duration-200",
                selectedCategory === cat.label
                  ? "text-white scale-105 shadow-md"
                  : "text-white/60 hover:text-white/80 bg-white/5 hover:bg-white/10",
              )}
              style={
                selectedCategory === cat.label
                  ? {
                      backgroundColor: `${cat.color}40`,
                      boxShadow: `0 0 12px ${cat.color}30`,
                    }
                  : undefined
              }
            >
              <span
                className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle"
                style={{ backgroundColor: cat.color }}
              />
              {cat.label}
            </button>
          ))}
        </div>

        {/* Shape picker */}
        <ShapePicker
          selected={selectedShape}
          onSelect={setSelectedShape}
          color={selectedColor}
        />

        {/* Text input + add button */}
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={GRATITUDE_PROMPTS[promptIndex]}
            className="flex-1 px-4 py-2.5 rounded-xl bg-white/8 border border-white/10
              text-sm text-white/90 placeholder:text-white/30
              focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20
              transition-all duration-200"
          />
          <motion.button
            onClick={handleAddStone}
            disabled={!inputText.trim() || (settings.maxStones > 0 && stones.length >= settings.maxStones)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-1.5 transition-all duration-200",
              inputText.trim() && !(settings.maxStones > 0 && stones.length >= settings.maxStones)
                ? "text-white shadow-lg"
                : "bg-white/8 text-white/30 cursor-not-allowed",
            )}
            style={
              inputText.trim() && !(settings.maxStones > 0 && stones.length >= settings.maxStones)
                ? {
                    backgroundColor: `${selectedColor}60`,
                    boxShadow: `0 4px 20px ${selectedColor}25`,
                  }
                : undefined
            }
          >
            <Plus className="w-4 h-4" />
            {settings.maxStones > 0 && stones.length >= settings.maxStones ? "Full" : "Add"}
          </motion.button>
        </div>
      </div>

      {isClinician && onSettingsUpdate && (
        <ClinicianToolbar
          controls={GRATITUDE_JAR_TOOLBAR_CONTROLS}
          settings={settings}
          onUpdate={onSettingsUpdate}
          onClear={onClear}
        />
      )}
    </div>
  );
}
