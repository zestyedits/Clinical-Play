import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  Check,
  Smile,
  EyeOff,
  FileText,
  FileX,
  Layers,
  RotateCcw,
  X,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { create } from "zustand";
import { playClickSound } from "@/lib/audio-feedback";
import {
  EMOTIONS,
  findEmotionById,
  type PrimaryEmotion,
  type SecondaryEmotion,
  type TertiaryEmotion,
} from "@/lib/feeling-wheel-data";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface FeelingSelection {
  id: string;
  path: string[];
  note?: string;
  timestamp: number;
  participantId?: string;
}

type TierLevel = "primary" | "secondary" | "tertiary";

interface NavigationState {
  tier: TierLevel;
  primaryId: string | null;
  secondaryId: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Zustand Settings Store
// ─────────────────────────────────────────────────────────────────────────────

interface FeelingWheelSettings {
  showEmoji: boolean;
  allowNotes: boolean;
  tierDepth: 1 | 2 | 3;
  toggleShowEmoji: () => void;
  toggleAllowNotes: () => void;
  cycleTierDepth: () => void;
}

const useFeelingWheelSettings = create<FeelingWheelSettings>((set) => ({
  showEmoji: true,
  allowNotes: true,
  tierDepth: 3,
  toggleShowEmoji: () => set((s) => ({ showEmoji: !s.showEmoji })),
  toggleAllowNotes: () => set((s) => ({ allowNotes: !s.allowNotes })),
  cycleTierDepth: () =>
    set((s) => {
      const next = s.tierDepth === 3 ? 2 : s.tierDepth === 2 ? 1 : 3;
      return { tierDepth: next as 1 | 2 | 3 };
    }),
}));

// ─────────────────────────────────────────────────────────────────────────────
// Audio — Emotion-themed click tones
// ─────────────────────────────────────────────────────────────────────────────

/** Base frequencies per primary emotion for the click tone */
const EMOTION_TONES: Record<string, { freq: number; type: OscillatorType }> = {
  joy: { freq: 880, type: "sine" },
  sadness: { freq: 330, type: "sine" },
  anger: { freq: 220, type: "sawtooth" },
  fear: { freq: 494, type: "triangle" },
  disgust: { freq: 392, type: "triangle" },
  surprise: { freq: 660, type: "sine" },
  love: { freq: 523, type: "sine" },
  shame: { freq: 370, type: "sine" },
};

let sharedAudioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext {
  if (!sharedAudioCtx) {
    sharedAudioCtx = new AudioContext();
  }
  return sharedAudioCtx;
}

function playEmotionTone(primaryId: string | null) {
  try {
    const ctx = getAudioCtx();
    if (ctx.state === "suspended") ctx.resume();

    const tone = primaryId ? EMOTION_TONES[primaryId] : null;
    const freq = tone?.freq ?? 660;
    const type = tone?.type ?? "sine";

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.75, ctx.currentTime + 0.07);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.09);

    // Harmonic overtone
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(freq * 2, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + 0.04);
    gain2.gain.setValueAtTime(0.02, ctx.currentTime);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc2.start(ctx.currentTime);
    osc2.stop(ctx.currentTime + 0.05);
  } catch {
    // Fallback to generic click
    playClickSound();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Color Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Returns a CSS background gradient for the full-screen backdrop */
function getBackgroundGradient(primaryId: string | null): string {
  if (!primaryId) {
    return "radial-gradient(ellipse at 30% 20%, rgba(99,102,241,0.08) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(168,85,247,0.06) 0%, transparent 60%), linear-gradient(135deg, #fafbff 0%, #f0f2f8 50%, #eef0f7 100%)";
  }

  const gradients: Record<string, string> = {
    joy: "radial-gradient(ellipse at 30% 20%, rgba(245,158,11,0.12) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(234,179,8,0.08) 0%, transparent 60%), linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #fde68a33 100%)",
    sadness: "radial-gradient(ellipse at 30% 20%, rgba(59,130,246,0.12) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(96,165,250,0.08) 0%, transparent 60%), linear-gradient(135deg, #eff6ff 0%, #dbeafe 50%, #bfdbfe33 100%)",
    anger: "radial-gradient(ellipse at 30% 20%, rgba(239,68,68,0.10) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(248,113,113,0.06) 0%, transparent 60%), linear-gradient(135deg, #fef2f2 0%, #fee2e2 50%, #fecaca33 100%)",
    fear: "radial-gradient(ellipse at 30% 20%, rgba(139,92,246,0.12) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(167,139,250,0.08) 0%, transparent 60%), linear-gradient(135deg, #f5f3ff 0%, #ede9fe 50%, #ddd6fe33 100%)",
    disgust: "radial-gradient(ellipse at 30% 20%, rgba(34,197,94,0.10) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(74,222,128,0.06) 0%, transparent 60%), linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #bbf7d033 100%)",
    surprise: "radial-gradient(ellipse at 30% 20%, rgba(249,115,22,0.12) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(251,146,60,0.08) 0%, transparent 60%), linear-gradient(135deg, #fff7ed 0%, #ffedd5 50%, #fed7aa33 100%)",
    love: "radial-gradient(ellipse at 30% 20%, rgba(236,72,153,0.12) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(244,114,182,0.08) 0%, transparent 60%), linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #fbcfe833 100%)",
    shame: "radial-gradient(ellipse at 30% 20%, rgba(168,85,247,0.10) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(192,132,252,0.08) 0%, transparent 60%), linear-gradient(135deg, #faf5ff 0%, #f3e8ff 50%, #e9d5ff33 100%)",
  };

  return gradients[primaryId] || gradients.joy;
}

/** Convert hex color to rgba */
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-Components
// ─────────────────────────────────────────────────────────────────────────────

// --- Background Ambient ---

interface FloatingBlob {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
}

function BackgroundAmbient({ primaryId }: { primaryId: string | null }) {
  const blobs = useMemo<FloatingBlob[]>(() => {
    const primary = primaryId
      ? EMOTIONS.find((e) => e.id === primaryId)
      : null;
    const baseColor = primary?.color ?? "#6366f1";

    return Array.from({ length: 6 }, (_, i) => ({
      id: i,
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80,
      size: 200 + Math.random() * 300,
      color: hexToRgba(baseColor, 0.04 + Math.random() * 0.04),
      duration: 18 + Math.random() * 12,
      delay: i * 1.5,
    }));
  }, [primaryId]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {blobs.map((blob) => (
        <motion.div
          key={`${blob.id}-${primaryId}`}
          className="absolute rounded-full"
          style={{
            width: blob.size,
            height: blob.size,
            left: `${blob.x}%`,
            top: `${blob.y}%`,
            background: `radial-gradient(circle, ${blob.color} 0%, transparent 70%)`,
            filter: "blur(60px)",
          }}
          animate={{
            x: [0, 30, -20, 15, 0],
            y: [0, -25, 15, -10, 0],
            scale: [1, 1.1, 0.95, 1.05, 1],
          }}
          transition={{
            duration: blob.duration,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
            delay: blob.delay,
          }}
        />
      ))}
    </div>
  );
}

// --- Breadcrumb Navigation ---

interface BreadcrumbProps {
  nav: NavigationState;
  onBack: () => void;
  activePrimary: PrimaryEmotion | null;
  activeSecondary: SecondaryEmotion | null;
}

function Breadcrumb({ nav, onBack, activePrimary, activeSecondary }: BreadcrumbProps) {
  if (nav.tier === "primary") return null;

  const crumbs: { label: string; emoji: string; color: string }[] = [];

  if (activePrimary) {
    crumbs.push({
      label: activePrimary.label,
      emoji: activePrimary.emoji,
      color: activePrimary.color,
    });
  }

  if (activeSecondary && nav.tier === "tertiary") {
    crumbs.push({
      label: activeSecondary.label,
      emoji: activeSecondary.emoji,
      color: activePrimary?.color ?? "#6366f1",
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-2"
    >
      <motion.button
        onClick={() => {
          playClickSound();
          onBack();
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl
          bg-card border border-border
          shadow-sm hover:shadow-md transition-shadow
          text-slate-600 hover:text-slate-800 cursor-pointer"
      >
        <ChevronLeft size={16} />
        <span className="text-sm font-medium">Back</span>
      </motion.button>

      {/* Golden thread trail */}
      <div className="flex items-center gap-1">
        {crumbs.map((crumb, i) => (
          <div key={i} className="flex items-center gap-1">
            {i > 0 && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 24, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="h-0.5 rounded-full"
                style={{ backgroundColor: hexToRgba(crumb.color, 0.3) }}
              />
            )}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                bg-card border shadow-sm"
              style={{
                borderColor: hexToRgba(crumb.color, 0.25),
              }}
            >
              <span className="text-base">{crumb.emoji}</span>
              <span className="text-sm font-medium text-slate-700">
                {crumb.label}
              </span>
            </motion.div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// --- Clarifying Question ---

interface ClarifyingQuestionProps {
  question: string | null;
  color: string;
}

function ClarifyingQuestion({ question, color }: ClarifyingQuestionProps) {
  if (!question) return null;

  return (
    <motion.div
      key={question}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.4 }}
      className="text-center max-w-xl mx-auto px-4"
    >
      <p
        className="text-base md:text-lg font-serif italic leading-relaxed"
        style={{ color: hexToRgba(color, 0.7) }}
      >
        "{question}"
      </p>
    </motion.div>
  );
}

// --- Emotion Card ---

interface EmotionCardProps {
  id: string;
  label: string;
  emoji: string;
  color: string;
  index: number;
  isSelected: boolean;
  showEmoji: boolean;
  size: "primary" | "secondary" | "tertiary";
  onSelect: () => void;
  onHover?: (hovering: boolean) => void;
  question?: string;
}

function EmotionCard({
  id,
  label,
  emoji,
  color,
  index,
  isSelected,
  showEmoji,
  size,
  onSelect,
  onHover,
  question,
}: EmotionCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const sizeClasses = {
    primary: "min-h-[140px] md:min-h-[160px]",
    secondary: "min-h-[120px] md:min-h-[140px]",
    tertiary: "min-h-[110px] md:min-h-[130px]",
  };

  const emojiSize = {
    primary: "text-4xl md:text-5xl",
    secondary: "text-3xl md:text-4xl",
    tertiary: "text-2xl md:text-3xl",
  };

  const labelSize = {
    primary: "text-base md:text-lg",
    secondary: "text-sm md:text-base",
    tertiary: "text-sm md:text-base",
  };

  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      transition={{
        duration: 0.35,
        delay: index * 0.06,
        type: "spring",
        stiffness: 300,
        damping: 25,
      }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onHoverStart={() => {
        setIsHovered(true);
        onHover?.(true);
      }}
      onHoverEnd={() => {
        setIsHovered(false);
        onHover?.(false);
      }}
      onClick={onSelect}
      className={cn(
        "relative flex flex-col items-center justify-center gap-2 p-4 rounded-2xl",
        "bg-card border shadow-lg",
        "transition-all duration-200 cursor-pointer",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        sizeClasses[size],
        isSelected
          ? "border-2"
          : "border border-border hover:border-border"
      )}
      style={{
        borderColor: isSelected ? color : undefined,
        boxShadow: isHovered || isSelected
          ? `0 8px 32px ${hexToRgba(color, 0.2)}, 0 0 0 1px ${hexToRgba(color, isSelected ? 0.3 : 0.1)}`
          : `0 4px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)`,
        outlineColor: color,
      }}
    >
      {/* Ambient glow behind card */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        animate={{
          opacity: isHovered || isSelected ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
        style={{
          background: `radial-gradient(ellipse at center, ${hexToRgba(color, 0.08)} 0%, transparent 70%)`,
        }}
      />

      {/* Selected checkmark badge */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full flex items-center justify-center shadow-md"
            style={{ backgroundColor: color }}
          >
            <Check size={14} className="text-white" strokeWidth={3} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emoji */}
      {showEmoji && (
        <motion.span
          className={cn("select-none", emojiSize[size])}
          animate={{
            scale: isHovered ? 1.1 : 1,
            rotate: isHovered ? [0, -5, 5, 0] : 0,
          }}
          transition={{ duration: 0.3 }}
        >
          {emoji}
        </motion.span>
      )}

      {/* Label */}
      <span
        className={cn(
          "font-semibold text-slate-700 relative z-10",
          labelSize[size]
        )}
      >
        {label}
      </span>

      {/* Hover tooltip for clarifying question */}
      <AnimatePresence>
        {isHovered && question && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2 }}
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 translate-y-full
              max-w-[220px] px-3 py-2 rounded-xl
              bg-slate-800/90 text-white text-xs
              text-center leading-snug z-50 shadow-xl pointer-events-none"
          >
            <span className="font-serif italic">{question}</span>
            {/* Tooltip arrow */}
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800/90 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Color accent bar at bottom */}
      <div
        className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full opacity-40"
        style={{ backgroundColor: color }}
      />
    </motion.button>
  );
}

// --- Card Grid ---

interface CardGridProps {
  nav: NavigationState;
  selections: FeelingSelection[];
  showEmoji: boolean;
  tierDepth: 1 | 2 | 3;
  onSelectEmotion: (emotionId: string, tier: TierLevel) => void;
}

function CardGrid({
  nav,
  selections,
  showEmoji,
  tierDepth,
  onSelectEmotion,
}: CardGridProps) {
  const selectedIds = useMemo(
    () => new Set(selections.map((s) => s.id)),
    [selections]
  );

  const activePrimary = useMemo(
    () => (nav.primaryId ? EMOTIONS.find((e) => e.id === nav.primaryId) ?? null : null),
    [nav.primaryId]
  );

  const activeSecondary = useMemo(
    () =>
      activePrimary && nav.secondaryId
        ? activePrimary.secondaries.find((s) => s.id === nav.secondaryId) ?? null
        : null,
    [activePrimary, nav.secondaryId]
  );

  // Determine what cards to show based on current tier
  const cards = useMemo(() => {
    switch (nav.tier) {
      case "primary":
        return EMOTIONS.map((e) => ({
          id: e.id,
          label: e.label,
          emoji: e.emoji,
          color: e.color,
          question: e.question,
          tier: "primary" as TierLevel,
        }));

      case "secondary":
        if (!activePrimary) return [];
        return activePrimary.secondaries.map((s) => ({
          id: s.id,
          label: s.label,
          emoji: s.emoji,
          color: activePrimary.color,
          question: s.question,
          tier: "secondary" as TierLevel,
        }));

      case "tertiary":
        if (!activeSecondary || !activePrimary) return [];
        return activeSecondary.tertiaries.map((t) => ({
          id: t.id,
          label: t.label,
          emoji: t.emoji,
          color: activePrimary.color,
          question: undefined,
          tier: "tertiary" as TierLevel,
        }));

      default:
        return [];
    }
  }, [nav.tier, activePrimary, activeSecondary]);

  // Grid columns based on tier and card count
  const gridClass = useMemo(() => {
    const count = cards.length;
    if (nav.tier === "primary") {
      return "grid-cols-2 md:grid-cols-4";
    }
    if (count <= 3) {
      return "grid-cols-1 sm:grid-cols-3";
    }
    if (count <= 4) {
      return "grid-cols-2";
    }
    return "grid-cols-2 md:grid-cols-3";
  }, [nav.tier, cards.length]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${nav.tier}-${nav.primaryId}-${nav.secondaryId}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className={cn(
          "grid gap-3 md:gap-4 w-full max-w-3xl mx-auto px-4",
          gridClass
        )}
      >
        {cards.map((card, i) => (
          <EmotionCard
            key={card.id}
            id={card.id}
            label={card.label}
            emoji={card.emoji}
            color={card.color}
            index={i}
            isSelected={selectedIds.has(card.id)}
            showEmoji={showEmoji}
            size={
              nav.tier === "primary"
                ? "primary"
                : nav.tier === "secondary"
                ? "secondary"
                : "tertiary"
            }
            question={card.question}
            onSelect={() => onSelectEmotion(card.id, card.tier)}
          />
        ))}
      </motion.div>
    </AnimatePresence>
  );
}

// --- Selection Panel ---

interface SelectionPanelProps {
  selections: FeelingSelection[];
  allowNotes: boolean;
  onUpdateNote: (id: string, note: string) => void;
  onRemoveSelection: (id: string) => void;
}

function SelectionPanel({
  selections,
  allowNotes,
  onUpdateNote,
  onRemoveSelection,
}: SelectionPanelProps) {
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const noteInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingNoteId && noteInputRef.current) {
      noteInputRef.current.focus();
    }
  }, [editingNoteId]);

  if (selections.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-3xl mx-auto px-4"
    >
      <div className="bg-card border border-border rounded-2xl shadow-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} className="text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-600 font-serif">
            Your Emotional Map
          </h3>
          <span className="ml-auto text-xs text-slate-400">
            {selections.length} selected
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          <AnimatePresence>
            {selections.map((sel) => {
              const found = findEmotionById(sel.id);
              if (!found) return null;

              const { primary, secondary, tertiary } = found;
              const displayLabel = tertiary?.label ?? secondary?.label ?? primary.label;
              const displayEmoji = tertiary?.emoji ?? secondary?.emoji ?? primary.emoji;

              return (
                <motion.div
                  key={sel.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="group relative flex items-center gap-1.5 px-3 py-2 rounded-xl
                    bg-card border shadow-sm"
                  style={{
                    borderColor: hexToRgba(primary.color, 0.25),
                  }}
                >
                  <span className="text-sm">{displayEmoji}</span>
                  <span className="text-sm font-medium text-slate-700">
                    {displayLabel}
                  </span>

                  {/* Path tooltip */}
                  {sel.path.length > 1 && (
                    <span className="text-xs text-slate-400 hidden sm:inline">
                      ({sel.path.join(" > ")})
                    </span>
                  )}

                  {/* Note indicator / editor */}
                  {allowNotes && (
                    <>
                      {editingNoteId === sel.id ? (
                        <div className="flex items-center gap-1 ml-1">
                          <input
                            ref={noteInputRef}
                            type="text"
                            value={sel.note ?? ""}
                            onChange={(e) => onUpdateNote(sel.id, e.target.value)}
                            onBlur={() => setEditingNoteId(null)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") setEditingNoteId(null);
                              if (e.key === "Escape") setEditingNoteId(null);
                            }}
                            placeholder="Add a note..."
                            className="w-32 sm:w-40 text-xs px-2 py-1 rounded-lg
                              bg-card border border-border
                              text-slate-600 placeholder:text-slate-300
                              focus:outline-none focus:ring-1 focus:ring-slate-300"
                          />
                        </div>
                      ) : (
                        <button
                          onClick={() => setEditingNoteId(sel.id)}
                          className={cn(
                            "ml-1 p-1 rounded-lg transition-colors cursor-pointer",
                            sel.note
                              ? "text-slate-500 hover:text-slate-700"
                              : "text-slate-300 hover:text-slate-500"
                          )}
                          title={sel.note || "Add note"}
                        >
                          <MessageSquare size={12} />
                        </button>
                      )}
                      {sel.note && editingNoteId !== sel.id && (
                        <span className="text-xs text-slate-400 italic max-w-[120px] truncate hidden sm:inline">
                          {sel.note}
                        </span>
                      )}
                    </>
                  )}

                  {/* Remove button */}
                  <button
                    onClick={() => {
                      playClickSound();
                      onRemoveSelection(sel.id);
                    }}
                    className="ml-1 p-0.5 rounded-full
                      text-slate-300 hover:text-red-400
                      opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                    title="Remove"
                  >
                    <X size={12} />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

// --- Clinician Toolbar ---

interface ClinicianToolbarInternalProps {
  settings: FeelingWheelSettings;
  onReset: () => void;
}

function ClinicianToolbarInternal({ settings, onReset }: ClinicianToolbarInternalProps) {
  const [confirmReset, setConfirmReset] = useState(false);
  const confirmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-dismiss confirm after 3 seconds
  useEffect(() => {
    if (confirmReset) {
      confirmTimerRef.current = setTimeout(() => {
        setConfirmReset(false);
      }, 3000);
    }
    return () => {
      if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
    };
  }, [confirmReset]);

  const tierLabel = settings.tierDepth === 3
    ? "3 Tiers"
    : settings.tierDepth === 2
    ? "2 Tiers"
    : "1 Tier";

  return (
    <motion.div
      initial={{ x: -60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.3 }}
      className="absolute left-3 bottom-3 z-30"
    >
      <div className="bg-card rounded-2xl p-2 shadow-lg border border-border flex flex-col gap-1.5">
        {/* Toggle emoji */}
        <ToolbarBtn
          icon={settings.showEmoji ? Smile : EyeOff}
          label={settings.showEmoji ? "Hide Emoji" : "Show Emoji"}
          isActive={settings.showEmoji}
          activeColor="text-amber-500 bg-amber-500/10"
          onClick={() => {
            playClickSound();
            settings.toggleShowEmoji();
          }}
        />

        {/* Toggle notes */}
        <ToolbarBtn
          icon={settings.allowNotes ? FileText : FileX}
          label={settings.allowNotes ? "Disable Notes" : "Enable Notes"}
          isActive={settings.allowNotes}
          activeColor="text-blue-500 bg-blue-500/10"
          onClick={() => {
            playClickSound();
            settings.toggleAllowNotes();
          }}
        />

        {/* Cycle tier depth */}
        <div className="relative group">
          <ToolbarBtn
            icon={Layers}
            label={tierLabel}
            isActive={settings.tierDepth < 3}
            activeColor="text-purple-500 bg-purple-500/10"
            onClick={() => {
              playClickSound();
              settings.cycleTierDepth();
            }}
          />
          {/* Tier depth badge */}
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-slate-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center pointer-events-none">
            {settings.tierDepth}
          </span>
        </div>

        {/* Divider */}
        <div className="w-6 h-px bg-slate-200 mx-auto" />

        {/* Reset */}
        <AnimatePresence mode="wait">
          {!confirmReset ? (
            <motion.div key="reset-idle">
              <ToolbarBtn
                icon={RotateCcw}
                label="Reset All"
                isActive={false}
                activeColor=""
                isDanger
                onClick={() => {
                  playClickSound();
                  setConfirmReset(true);
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="reset-confirm"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex flex-col gap-1"
            >
              <button
                onClick={() => {
                  playClickSound();
                  onReset();
                  setConfirmReset(false);
                }}
                className="w-10 h-10 rounded-xl flex items-center justify-center
                  bg-red-100 text-red-500 cursor-pointer hover:bg-red-200 transition-all"
                title="Confirm Reset"
              >
                <Check size={16} />
              </button>
              <button
                onClick={() => {
                  playClickSound();
                  setConfirmReset(false);
                }}
                className="w-10 h-10 rounded-xl flex items-center justify-center
                  bg-slate-100 text-slate-400 cursor-pointer hover:bg-slate-200 transition-all"
                title="Cancel"
              >
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// --- Toolbar Button Helper ---

interface ToolbarBtnProps {
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  activeColor: string;
  isDanger?: boolean;
  onClick: () => void;
}

function ToolbarBtn({
  icon: Icon,
  label,
  isActive,
  activeColor,
  isDanger,
  onClick,
}: ToolbarBtnProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative group",
        isActive
          ? activeColor
          : isDanger
          ? "text-slate-400 hover:text-red-400 hover:bg-red-50"
          : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
      )}
      title={label}
    >
      <Icon size={16} />
      <span className="absolute left-12 bg-slate-800/90 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg z-50">
        {label}
      </span>
    </button>
  );
}

// --- Welcome Header (shown on primary tier) ---

function WelcomeHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="text-center max-w-lg mx-auto px-4"
    >
      <h2 className="text-2xl md:text-3xl font-serif font-semibold text-slate-700 mb-2">
        How are you feeling?
      </h2>
      <p className="text-sm md:text-base text-slate-400 font-serif italic">
        Choose the emotion that feels closest. You can always come back and pick more.
      </p>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export function FeelingWheel() {
  // ─── Settings (zustand) ─────────────────────────────────────────
  const settings = useFeelingWheelSettings();

  // ─── Navigation State ───────────────────────────────────────────
  const [nav, setNav] = useState<NavigationState>({
    tier: "primary",
    primaryId: null,
    secondaryId: null,
  });

  // ─── Selections ─────────────────────────────────────────────────
  const [selections, setSelections] = useState<FeelingSelection[]>([]);

  // ─── Derived Data ───────────────────────────────────────────────
  const activePrimary = useMemo(
    () => (nav.primaryId ? EMOTIONS.find((e) => e.id === nav.primaryId) ?? null : null),
    [nav.primaryId]
  );

  const activeSecondary = useMemo(
    () =>
      activePrimary && nav.secondaryId
        ? activePrimary.secondaries.find((s) => s.id === nav.secondaryId) ?? null
        : null,
    [activePrimary, nav.secondaryId]
  );

  // Current clarifying question
  const currentQuestion = useMemo(() => {
    if (nav.tier === "secondary" && activePrimary) {
      return activePrimary.question;
    }
    if (nav.tier === "tertiary" && activeSecondary) {
      return activeSecondary.question;
    }
    return null;
  }, [nav.tier, activePrimary, activeSecondary]);

  const currentColor = activePrimary?.color ?? "#6366f1";

  // ─── Handlers ───────────────────────────────────────────────────

  const buildPath = useCallback(
    (emotionId: string, tier: TierLevel): string[] => {
      const path: string[] = [];
      if (tier === "primary") {
        const p = EMOTIONS.find((e) => e.id === emotionId);
        if (p) path.push(p.label);
      } else if (tier === "secondary" && activePrimary) {
        path.push(activePrimary.label);
        const s = activePrimary.secondaries.find((s) => s.id === emotionId);
        if (s) path.push(s.label);
      } else if (tier === "tertiary" && activePrimary && activeSecondary) {
        path.push(activePrimary.label);
        path.push(activeSecondary.label);
        const t = activeSecondary.tertiaries.find((t) => t.id === emotionId);
        if (t) path.push(t.label);
      }
      return path;
    },
    [activePrimary, activeSecondary]
  );

  const toggleSelection = useCallback(
    (emotionId: string, path: string[]) => {
      setSelections((prev) => {
        const exists = prev.find((s) => s.id === emotionId);
        if (exists) {
          return prev.filter((s) => s.id !== emotionId);
        }
        return [
          ...prev,
          {
            id: emotionId,
            path,
            timestamp: Date.now(),
          },
        ];
      });
    },
    []
  );

  const handleSelectEmotion = useCallback(
    (emotionId: string, tier: TierLevel) => {
      playEmotionTone(nav.primaryId ?? emotionId);

      if (tier === "primary") {
        // If tier depth is 1, just select it
        if (settings.tierDepth === 1) {
          const path = buildPath(emotionId, tier);
          toggleSelection(emotionId, path);
          return;
        }
        // Navigate to secondary
        setNav({ tier: "secondary", primaryId: emotionId, secondaryId: null });
        return;
      }

      if (tier === "secondary") {
        // If tier depth is 2, select it
        if (settings.tierDepth <= 2) {
          const path = buildPath(emotionId, tier);
          toggleSelection(emotionId, path);
          return;
        }
        // Navigate to tertiary
        setNav((prev) => ({
          ...prev,
          tier: "tertiary",
          secondaryId: emotionId,
        }));
        return;
      }

      if (tier === "tertiary") {
        // Always select tertiary
        const path = buildPath(emotionId, tier);
        toggleSelection(emotionId, path);
        return;
      }
    },
    [nav.primaryId, settings.tierDepth, buildPath, toggleSelection]
  );

  const handleBack = useCallback(() => {
    if (nav.tier === "tertiary") {
      setNav((prev) => ({ ...prev, tier: "secondary", secondaryId: null }));
    } else if (nav.tier === "secondary") {
      setNav({ tier: "primary", primaryId: null, secondaryId: null });
    }
  }, [nav.tier]);

  const handleUpdateNote = useCallback((id: string, note: string) => {
    setSelections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, note } : s))
    );
  }, []);

  const handleRemoveSelection = useCallback((id: string) => {
    setSelections((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const handleReset = useCallback(() => {
    setSelections([]);
    setNav({ tier: "primary", primaryId: null, secondaryId: null });
  }, []);

  // ─── Keyboard Navigation ───────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (nav.tier !== "primary") {
          handleBack();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nav.tier, handleBack]);

  // ─── Render ─────────────────────────────────────────────────────

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden">
      {/* Background */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: getBackgroundGradient(nav.primaryId),
        }}
        transition={{ duration: 0.8 }}
      />
      <BackgroundAmbient primaryId={nav.primaryId} />

      {/* Content Container */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Top Area: Breadcrumb + Question */}
        <div className="flex-shrink-0 pt-4 pb-2 px-4 space-y-3">
          <AnimatePresence mode="wait">
            {nav.tier === "primary" ? (
              <motion.div key="welcome">
                <WelcomeHeader />
              </motion.div>
            ) : (
              <motion.div
                key="breadcrumb"
                className="space-y-3"
              >
                <Breadcrumb
                  nav={nav}
                  onBack={handleBack}
                  activePrimary={activePrimary}
                  activeSecondary={activeSecondary}
                />
                <AnimatePresence mode="wait">
                  {currentQuestion && (
                    <ClarifyingQuestion
                      key={currentQuestion}
                      question={currentQuestion}
                      color={currentColor}
                    />
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Main Area: Card Grid (centered vertically in remaining space) */}
        <div className="flex-1 flex items-center justify-center min-h-0 py-4">
          <CardGrid
            nav={nav}
            selections={selections}
            showEmoji={settings.showEmoji}
            tierDepth={settings.tierDepth}
            onSelectEmotion={handleSelectEmotion}
          />
        </div>

        {/* Bottom Area: Selection Panel */}
        <div className="flex-shrink-0 pb-4">
          <AnimatePresence>
            {selections.length > 0 && (
              <SelectionPanel
                selections={selections}
                allowNotes={settings.allowNotes}
                onUpdateNote={handleUpdateNote}
                onRemoveSelection={handleRemoveSelection}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Clinician Toolbar (floating, bottom-left) */}
      <ClinicianToolbarInternal settings={settings} onReset={handleReset} />
    </div>
  );
}
