import { useState, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { COGNITIVE_DISTORTIONS } from "@/lib/cognitive-distortions-data";
import { playClickSound } from "@/lib/audio-feedback";
import {
  RotateCcw,
  Plus,
  X,
  ChevronDown,
  ChevronRight,
  Check,
  Sparkles,
  History,
  HelpCircle,
} from "lucide-react";

// ─── Data Interfaces ──────────────────────────────────────────────────────────

export interface ThoughtBridgeRecordData {
  id: string;
  situation: string | null;
  automaticThought: string | null;
  beliefRatingBefore: number | null;
  beliefRatingAfter: number | null;
  balancedThought: string | null;
  emotionsBefore: any | null;
  emotionsAfter: any | null;
  distortions: any | null;
  status: string;
  createdBy: string | null;
  createdAt: string;
}

export interface ThoughtBridgeEvidenceData {
  id: string;
  recordId: string;
  type: string;
  content: string;
  createdBy: string | null;
  orderIndex: number;
}

export interface ThoughtBridgeProps {
  records: ThoughtBridgeRecordData[];
  evidence: ThoughtBridgeEvidenceData[];
  onCreateRecord: (situation: string | null) => void;
  onUpdateRecord: (
    recordId: string,
    fields: Partial<ThoughtBridgeRecordData>
  ) => void;
  onRemoveRecord: (recordId: string) => void;
  onAddEvidence: (
    recordId: string,
    evidenceType: string,
    content: string,
    orderIndex: number
  ) => void;
  onRemoveEvidence: (evidenceId: string) => void;
  onClear: () => void;
  isClinician: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS = [
  { key: "situation", label: "Describe the Situation", icon: "1" },
  { key: "thought", label: "Capture Automatic Thought", icon: "2" },
  { key: "beliefBefore", label: "Rate Your Belief", icon: "3" },
  { key: "distortions", label: "Identify Distortions", icon: "4" },
  { key: "evidenceFor", label: "Evidence For", icon: "5" },
  { key: "evidenceAgainst", label: "Evidence Against", icon: "6" },
  { key: "balanced", label: "Create Balanced Thought", icon: "7" },
  { key: "beliefAfter", label: "Re-rate Your Belief", icon: "8" },
] as const;

const COMMON_EMOTIONS = [
  "Anxious",
  "Sad",
  "Angry",
  "Frustrated",
  "Guilty",
  "Ashamed",
  "Hopeless",
  "Fearful",
  "Embarrassed",
  "Jealous",
  "Disappointed",
  "Overwhelmed",
];

const DISTORTION_COLORS: Record<string, string> = {
  "all-or-nothing": "#EF4444",
  overgeneralization: "#F97316",
  "mental-filter": "#EAB308",
  "disqualifying-positive": "#84CC16",
  "jumping-to-conclusions": "#22C55E",
  magnification: "#14B8A6",
  "emotional-reasoning": "#06B6D4",
  "should-statements": "#3B82F6",
  labeling: "#6366F1",
  personalization: "#8B5CF6",
  catastrophizing: "#A855F7",
  "mind-reading": "#D946EF",
  "fortune-telling": "#EC4899",
  blame: "#F43F5E",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseJsonArray(val: any): any[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function computeCompletedSteps(
  record: ThoughtBridgeRecordData,
  evidenceList: ThoughtBridgeEvidenceData[]
): number {
  let count = 0;
  if (record.situation) count++;
  if (record.automaticThought) count++;
  if (record.beliefRatingBefore !== null) count++;
  if (parseJsonArray(record.distortions).length > 0) count++;
  if (evidenceList.filter((e) => e.recordId === record.id && e.type === "for").length > 0)
    count++;
  if (
    evidenceList.filter((e) => e.recordId === record.id && e.type === "against").length >
    0
  )
    count++;
  if (record.balancedThought) count++;
  if (record.beliefRatingAfter !== null) count++;
  return count;
}

// ─── SVG Bridge Illustration ──────────────────────────────────────────────────

function BridgeSVG({ progress }: { progress: number }) {
  const fraction = progress / 8;

  // Arch keystone positions for each step marker along the bridge
  const stepPositions = STEPS.map((_, i) => {
    const t = i / (STEPS.length - 1);
    const cx = 75 + t * 450;
    const cy = 150 - Math.sin(t * Math.PI) * 75;
    return { cx, cy };
  });

  return (
    <svg
      viewBox="0 0 600 220"
      className="w-full h-auto"
      style={{ maxHeight: 200 }}
      aria-label="Bridge visualization showing cognitive restructuring progress"
    >
      <defs>
        <linearGradient id="tb-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.25} />
          <stop offset="100%" stopColor="#0284c7" stopOpacity={0.45} />
        </linearGradient>
        <linearGradient id="tb-stone-dim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#78716c" stopOpacity={0.5} />
          <stop offset="100%" stopColor="#57534e" stopOpacity={0.5} />
        </linearGradient>
        <linearGradient id="tb-stone-lit" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id="tb-bank-left" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#92400e" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>
        <linearGradient id="tb-bank-right" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#065f46" />
          <stop offset="100%" stopColor="#064e3b" />
        </linearGradient>
        <filter id="tb-glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="tb-glow-soft">
          <feGaussianBlur stdDeviation="5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Animated water */}
      <rect x="0" y="175" width="600" height="45" fill="url(#tb-water)" rx="3" />
      <motion.path
        d="M0,182 Q75,174 150,182 T300,182 T450,182 T600,182 L600,220 L0,220 Z"
        fill="url(#tb-water)"
        animate={{
          d: [
            "M0,182 Q75,174 150,182 T300,182 T450,182 T600,182 L600,220 L0,220 Z",
            "M0,185 Q75,179 150,185 T300,179 T450,185 T600,179 L600,220 L0,220 Z",
            "M0,182 Q75,174 150,182 T300,182 T450,182 T600,182 L600,220 L0,220 Z",
          ],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Left river bank */}
      <path d="M0,145 L0,220 L90,220 L90,145 Q85,130 45,130 Q5,130 0,145 Z" fill="url(#tb-bank-left)" />
      <rect x="0" y="140" width="90" height="8" fill="#b45309" rx="2" opacity={0.7} />

      {/* Right river bank */}
      <path
        d="M510,145 L510,220 L600,220 L600,145 Q595,130 555,130 Q515,130 510,145 Z"
        fill="url(#tb-bank-right)"
      />
      <rect x="510" y="140" width="90" height="8" fill="#047857" rx="2" opacity={0.7} />

      {/* Left label */}
      <text x="45" y="122" textAnchor="middle" fill="#fbbf24" fontSize="10" fontWeight="700">
        Automatic
      </text>
      <text x="45" y="134" textAnchor="middle" fill="#fbbf24" fontSize="9" opacity={0.7}>
        Thought
      </text>

      {/* Right label */}
      <text x="555" y="122" textAnchor="middle" fill="#34d399" fontSize="10" fontWeight="700">
        Balanced
      </text>
      <text x="555" y="134" textAnchor="middle" fill="#34d399" fontSize="9" opacity={0.7}>
        Thought
      </text>

      {/* Bridge arch - background (dim) */}
      <path
        d="M75,155 Q150,155 200,130 Q250,100 300,80 Q350,100 400,130 Q450,155 525,155"
        fill="none"
        stroke="#57534e"
        strokeWidth="10"
        strokeLinecap="round"
        opacity={0.25}
      />

      {/* Bridge arch railing lines (dim) */}
      <path
        d="M75,145 Q150,145 200,120 Q250,90 300,70 Q350,90 400,120 Q450,145 525,145"
        fill="none"
        stroke="#57534e"
        strokeWidth="2"
        strokeLinecap="round"
        opacity={0.15}
      />

      {/* Support pillars (vertical lines from arch down to water) */}
      {[150, 225, 300, 375, 450].map((xPos, i) => {
        const t = (xPos - 75) / 450;
        const archY = 155 - Math.sin(t * Math.PI) * 75;
        const pillarLit = fraction > (i + 1) / 6;
        return (
          <motion.rect
            key={`pillar-${xPos}`}
            x={xPos - 3}
            y={archY}
            width={6}
            height={175 - archY}
            rx={2}
            fill={pillarLit ? "#d97706" : "#57534e"}
            initial={{ opacity: 0.2 }}
            animate={{ opacity: pillarLit ? 0.8 : 0.2 }}
            transition={{ duration: 0.6, delay: i * 0.05 }}
          />
        );
      })}

      {/* Bridge arch - filled (animated based on progress) */}
      <motion.path
        d="M75,155 Q150,155 200,130 Q250,100 300,80 Q350,100 400,130 Q450,155 525,155"
        fill="none"
        stroke="url(#tb-stone-lit)"
        strokeWidth="10"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: fraction }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        filter={fraction > 0 ? "url(#tb-glow)" : undefined}
      />

      {/* Bridge railing - filled */}
      <motion.path
        d="M75,145 Q150,145 200,120 Q250,90 300,70 Q350,90 400,120 Q450,145 525,145"
        fill="none"
        stroke="#fbbf24"
        strokeWidth="2"
        strokeLinecap="round"
        opacity={0.4}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: fraction }}
        transition={{ duration: 0.9, ease: "easeOut", delay: 0.1 }}
      />

      {/* Step stone markers along the arch */}
      {stepPositions.map((pos, i) => {
        const completed = i < progress;
        const isCurrent = i === progress;
        return (
          <g key={`step-marker-${i}`}>
            {/* Pulse ring for current step */}
            {isCurrent && (
              <motion.circle
                cx={pos.cx}
                cy={pos.cy}
                r={14}
                fill="none"
                stroke="#fbbf24"
                strokeWidth={1.5}
                initial={{ opacity: 0.6, r: 10 }}
                animate={{ opacity: 0, r: 20 }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
            <motion.circle
              cx={pos.cx}
              cy={pos.cy}
              r={completed ? 10 : isCurrent ? 9 : 7}
              fill={completed ? "#fbbf24" : isCurrent ? "#44403c" : "#2c2926"}
              stroke={completed ? "#f59e0b" : isCurrent ? "#fbbf24" : "#57534e"}
              strokeWidth={completed ? 2.5 : 1.5}
              animate={
                completed
                  ? { scale: [1, 1.2, 1], fill: "#fbbf24" }
                  : {}
              }
              transition={{ duration: 0.35 }}
              filter={completed ? "url(#tb-glow)" : undefined}
            />
            {completed && (
              <motion.text
                x={pos.cx}
                y={pos.cy + 4}
                textAnchor="middle"
                fill="#44403c"
                fontSize="11"
                fontWeight="bold"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                {"\u2713"}
              </motion.text>
            )}
            {!completed && (
              <text
                x={pos.cx}
                y={pos.cy + 3.5}
                textAnchor="middle"
                fill={isCurrent ? "#fbbf24" : "#78716c"}
                fontSize="8"
                fontWeight="600"
              >
                {i + 1}
              </text>
            )}
          </g>
        );
      })}

      {/* Celebration sparkles when bridge is complete */}
      {fraction >= 1 &&
        Array.from({ length: 14 }).map((_, i) => {
          const angle = (i / 14) * Math.PI * 2;
          const colors = ["#fbbf24", "#34d399", "#f472b6", "#60a5fa", "#a78bfa"];
          return (
            <motion.circle
              key={`bridge-spark-${i}`}
              cx={300}
              cy={80}
              r={2.5}
              fill={colors[i % colors.length]}
              initial={{ opacity: 1, cx: 300, cy: 80 }}
              animate={{
                cx: 300 + Math.cos(angle) * 90,
                cy: 80 + Math.sin(angle) * 55 - 15,
                opacity: 0,
                r: 0,
              }}
              transition={{
                duration: 1.8,
                delay: i * 0.1,
                repeat: Infinity,
                repeatDelay: 2.5,
              }}
            />
          );
        })}
    </svg>
  );
}

// ─── Belief Gauge (arc meter) ─────────────────────────────────────────────────

function BeliefGauge({
  value,
  label,
  color,
}: {
  value: number;
  label: string;
  color: string;
}) {
  const radius = 48;
  const circumference = Math.PI * radius; // half-circle
  const strokeVal = (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="120" height="72" viewBox="0 0 120 72">
        <defs>
          <linearGradient id={`tb-gauge-${label.replace(/\s/g, "")}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} />
          </linearGradient>
        </defs>
        {/* Background arc */}
        <path
          d="M12,65 A48,48 0 0,1 108,65"
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="7"
          strokeLinecap="round"
        />
        {/* Filled arc */}
        <motion.path
          d="M12,65 A48,48 0 0,1 108,65"
          fill="none"
          stroke={`url(#tb-gauge-${label.replace(/\s/g, "")})`}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - strokeVal }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
        {/* Value text */}
        <motion.text
          x="60"
          y="54"
          textAnchor="middle"
          fill="white"
          fontSize="20"
          fontWeight="bold"
          key={value}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
        >
          {value}%
        </motion.text>
      </svg>
      <span className="text-[10px] text-white/50 font-medium">{label}</span>
    </div>
  );
}

// ─── Distortion Chip ──────────────────────────────────────────────────────────

function DistortionChip({
  distortion,
  selected,
  onToggle,
}: {
  distortion: (typeof COGNITIVE_DISTORTIONS)[number];
  selected: boolean;
  onToggle: () => void;
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const color = DISTORTION_COLORS[distortion.id] || "#6366F1";

  return (
    <div className="relative">
      <motion.button
        onClick={() => {
          playClickSound();
          onToggle();
        }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={cn(
          "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
          "border backdrop-blur-sm whitespace-nowrap",
          selected
            ? "text-white shadow-lg"
            : "text-white/60 hover:text-white border-white/10 hover:border-white/20"
        )}
        style={{
          backgroundColor: selected ? `${color}30` : "rgba(255,255,255,0.04)",
          borderColor: selected ? color : undefined,
          boxShadow: selected ? `0 0 14px ${color}25` : undefined,
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {selected && <Check className="inline w-3 h-3 mr-1 -mt-0.5" />}
        {distortion.label}
      </motion.button>

      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2.5
              rounded-xl bg-black/90 backdrop-blur-lg border border-white/10 text-xs text-white/90
              max-w-[260px] pointer-events-none shadow-2xl"
          >
            <p className="font-semibold mb-1" style={{ color }}>
              {distortion.label}
            </p>
            <p className="text-white/65 leading-relaxed">{distortion.description}</p>
            <p className="text-white/35 mt-1.5 italic text-[11px]">
              e.g. &quot;{distortion.example}&quot;
            </p>
            <div
              className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-black/90 border-r border-b border-white/10"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Emotion Row ──────────────────────────────────────────────────────────────

function EmotionRow({
  emotions,
  onChange,
  label,
}: {
  emotions: { emotion: string; intensity: number }[];
  onChange: (emotions: { emotion: string; intensity: number }[]) => void;
  label: string;
}) {
  const [customEmotion, setCustomEmotion] = useState("");

  const addEmotion = useCallback(
    (name: string) => {
      if (!name.trim()) return;
      if (emotions.find((e) => e.emotion.toLowerCase() === name.toLowerCase())) return;
      playClickSound();
      onChange([...emotions, { emotion: name.trim(), intensity: 50 }]);
      setCustomEmotion("");
    },
    [emotions, onChange]
  );

  const removeEmotion = useCallback(
    (idx: number) => {
      playClickSound();
      onChange(emotions.filter((_, i) => i !== idx));
    },
    [emotions, onChange]
  );

  const updateIntensity = useCallback(
    (idx: number, intensity: number) => {
      const updated = [...emotions];
      updated[idx] = { ...updated[idx], intensity };
      onChange(updated);
    },
    [emotions, onChange]
  );

  const availableEmotions = useMemo(
    () => COMMON_EMOTIONS.filter((e) => !emotions.find((em) => em.emotion === e)),
    [emotions]
  );

  return (
    <div className="space-y-3">
      <p className="text-xs text-white/45 uppercase tracking-wider font-semibold">
        {label}
      </p>

      {/* Quick-add common emotion chips */}
      <div className="flex flex-wrap gap-1.5">
        {availableEmotions.map((emotion) => (
          <button
            key={emotion}
            onClick={() => addEmotion(emotion)}
            className="px-2.5 py-1 rounded-md text-[10px] bg-white/[0.04] border border-white/[0.08]
              text-white/45 hover:text-white/75 hover:bg-white/[0.08] transition-all"
          >
            + {emotion}
          </button>
        ))}
      </div>

      {/* Custom emotion input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={customEmotion}
          onChange={(e) => setCustomEmotion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") addEmotion(customEmotion);
          }}
          placeholder="Other emotion..."
          className="flex-1 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08]
            text-sm text-white placeholder:text-white/25 focus:outline-none
            focus:border-white/25 transition-colors"
        />
        <button
          onClick={() => addEmotion(customEmotion)}
          disabled={!customEmotion.trim()}
          className="px-3 py-1.5 rounded-lg bg-white/[0.08] text-white/50
            hover:bg-white/[0.12] disabled:opacity-30 transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Active emotions with intensity sliders */}
      <AnimatePresence>
        {emotions.map((em, idx) => (
          <motion.div
            key={em.emotion}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-3 overflow-hidden"
          >
            <button
              onClick={() => removeEmotion(idx)}
              className="text-white/25 hover:text-red-400 transition-colors flex-shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <span className="text-sm text-white/75 w-24 truncate flex-shrink-0">
              {em.emotion}
            </span>
            <input
              type="range"
              min={0}
              max={100}
              value={em.intensity}
              onChange={(e) => updateIntensity(idx, Number(e.target.value))}
              className="flex-1 h-1.5 accent-amber-400 min-w-0"
            />
            <span className="text-[10px] text-white/40 w-8 text-right flex-shrink-0">
              {em.intensity}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ─── Evidence Column ──────────────────────────────────────────────────────────

function EvidenceSection({
  items,
  type,
  onAdd,
  onRemove,
}: {
  items: ThoughtBridgeEvidenceData[];
  type: "for" | "against";
  onAdd: (content: string) => void;
  onRemove: (id: string) => void;
}) {
  const [input, setInput] = useState("");

  const handleAdd = useCallback(() => {
    if (!input.trim()) return;
    playClickSound();
    onAdd(input.trim());
    setInput("");
  }, [input, onAdd]);

  const isFor = type === "for";
  const accent = isFor ? "text-rose-400" : "text-emerald-400";
  const borderAccent = isFor ? "border-rose-500/25" : "border-emerald-500/25";
  const bgAccent = isFor ? "bg-rose-500/[0.08]" : "bg-emerald-500/[0.08]";

  const sorted = useMemo(
    () => [...items].sort((a, b) => a.orderIndex - b.orderIndex),
    [items]
  );

  return (
    <div className="flex-1 min-w-0">
      <p className={cn("text-xs uppercase tracking-wider font-semibold mb-2.5", accent)}>
        {isFor ? "Evidence Supporting the Thought" : "Evidence Against the Thought"}
      </p>

      <div className="space-y-2 mb-3">
        <AnimatePresence>
          {sorted.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: isFor ? -16 : 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={cn(
                "flex items-start gap-2 px-3 py-2.5 rounded-xl border backdrop-blur-sm",
                bgAccent,
                borderAccent
              )}
            >
              <span className="flex-1 text-sm text-white/75 leading-relaxed">
                {item.content}
              </span>
              <button
                onClick={() => {
                  playClickSound();
                  onRemove(item.id);
                }}
                className="text-white/25 hover:text-red-400 transition-colors mt-0.5 flex-shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        {sorted.length === 0 && (
          <p className="text-xs text-white/20 italic py-2">No evidence added yet</p>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
          }}
          placeholder={
            isFor ? "What supports this thought?" : "What contradicts it?"
          }
          className="flex-1 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08]
            text-sm text-white placeholder:text-white/20 focus:outline-none
            focus:border-white/25 transition-colors min-w-0"
        />
        <motion.button
          onClick={handleAdd}
          disabled={!input.trim()}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "px-3 py-2 rounded-lg text-sm font-medium transition-all flex-shrink-0",
            "disabled:opacity-25",
            isFor
              ? "bg-rose-500/15 text-rose-300 hover:bg-rose-500/25"
              : "bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25"
          )}
        >
          <Plus className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
}

// ─── Collapsible Step Card ────────────────────────────────────────────────────

function StepCard({
  step,
  index,
  isActive,
  isCompleted,
  onActivate,
  children,
}: {
  step: (typeof STEPS)[number];
  index: number;
  isActive: boolean;
  isCompleted: boolean;
  onActivate: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      layout
      className={cn(
        "rounded-2xl border backdrop-blur-xl transition-all overflow-hidden",
        isActive
          ? "bg-white/[0.06] border-white/[0.18] shadow-lg shadow-black/20"
          : isCompleted
          ? "bg-white/[0.03] border-white/[0.08]"
          : "bg-white/[0.015] border-white/[0.04]"
      )}
    >
      {/* Header button */}
      <button
        onClick={() => {
          playClickSound();
          onActivate();
        }}
        className="w-full flex items-center gap-3 px-5 py-3.5 text-left group"
      >
        <motion.div
          className={cn(
            "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold",
            "border transition-all flex-shrink-0",
            isCompleted
              ? "bg-amber-500/25 border-amber-400/40 text-amber-300"
              : isActive
              ? "bg-white/[0.08] border-white/25 text-white"
              : "bg-white/[0.03] border-white/[0.08] text-white/35"
          )}
          animate={isCompleted ? { scale: [1, 1.15, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          {isCompleted ? <Check className="w-3.5 h-3.5" /> : step.icon}
        </motion.div>

        <span
          className={cn(
            "flex-1 text-sm font-medium transition-colors",
            isActive ? "text-white" : isCompleted ? "text-white/65" : "text-white/35"
          )}
        >
          {step.label}
        </span>

        <motion.div
          animate={{ rotate: isActive ? 0 : -90 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <ChevronDown
            className={cn(
              "w-4 h-4 transition-colors",
              isActive ? "text-white/40" : "text-white/15"
            )}
          />
        </motion.div>
      </button>

      {/* Expandable content */}
      <AnimatePresence initial={false}>
        {isActive && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Continue Button (reused in each step) ────────────────────────────────────

function ContinueButton({
  onClick,
  disabled,
  variant = "amber",
}: {
  onClick: () => void;
  disabled?: boolean;
  variant?: "amber" | "emerald";
}) {
  const colors =
    variant === "emerald"
      ? "bg-emerald-500/20 border-emerald-400/30 text-emerald-300"
      : "bg-amber-500/20 border-amber-400/30 text-amber-300";

  return (
    <div className="flex justify-end pt-1">
      <motion.button
        onClick={onClick}
        disabled={disabled}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className={cn(
          "px-4 py-1.5 rounded-lg border text-xs font-medium disabled:opacity-25 transition-all",
          colors
        )}
      >
        Continue
      </motion.button>
    </div>
  );
}

// ─── Main ThoughtBridge Component ─────────────────────────────────────────────

export function ThoughtBridge({
  records,
  evidence,
  onCreateRecord,
  onUpdateRecord,
  onRemoveRecord,
  onAddEvidence,
  onRemoveEvidence,
  onClear,
  isClinician,
}: ThoughtBridgeProps) {
  const [activeRecordId, setActiveRecordId] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Local draft state for text fields (committed on blur / Enter / Continue)
  const [draftSituation, setDraftSituation] = useState("");
  const [draftThought, setDraftThought] = useState("");
  const [draftBalanced, setDraftBalanced] = useState("");

  // ── Derived data ──────────────────────────────────────────────────────

  const sortedRecords = useMemo(
    () =>
      [...records].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [records]
  );

  const activeRecord = useMemo(
    () => records.find((r) => r.id === activeRecordId) ?? null,
    [records, activeRecordId]
  );

  const activeEvidence = useMemo(
    () => evidence.filter((e) => e.recordId === activeRecordId),
    [evidence, activeRecordId]
  );

  const completedSteps = useMemo(
    () => (activeRecord ? computeCompletedSteps(activeRecord, activeEvidence) : 0),
    [activeRecord, activeEvidence]
  );

  const activeDistortions = useMemo(
    () => parseJsonArray(activeRecord?.distortions),
    [activeRecord?.distortions]
  );

  const emotionsBefore = useMemo(
    () => parseJsonArray(activeRecord?.emotionsBefore),
    [activeRecord?.emotionsBefore]
  );

  const emotionsAfter = useMemo(
    () => parseJsonArray(activeRecord?.emotionsAfter),
    [activeRecord?.emotionsAfter]
  );

  // ── Sync drafts when active record changes ───────────────────────────

  useEffect(() => {
    if (activeRecord) {
      setDraftSituation(activeRecord.situation || "");
      setDraftThought(activeRecord.automaticThought || "");
      setDraftBalanced(activeRecord.balancedThought || "");
    } else {
      setDraftSituation("");
      setDraftThought("");
      setDraftBalanced("");
    }
  }, [activeRecordId]);

  // ── Auto-select newest record if none selected ────────────────────────

  useEffect(() => {
    if (sortedRecords.length > 0 && !records.find((r) => r.id === activeRecordId)) {
      setActiveRecordId(sortedRecords[0].id);
      setActiveStep(0);
    }
  }, [sortedRecords.length, records, activeRecordId]);

  // ── Detect full completion ────────────────────────────────────────────

  useEffect(() => {
    if (activeRecord && completedSteps === 8 && activeRecord.status !== "complete") {
      onUpdateRecord(activeRecord.id, { status: "complete" });
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [completedSteps, activeRecord?.id, activeRecord?.status]);

  // ── Commit callbacks ──────────────────────────────────────────────────

  const commitSituation = useCallback(() => {
    if (!activeRecord || draftSituation === (activeRecord.situation || "")) return;
    onUpdateRecord(activeRecord.id, { situation: draftSituation.trim() || null });
  }, [activeRecord, draftSituation, onUpdateRecord]);

  const commitThought = useCallback(() => {
    if (!activeRecord || draftThought === (activeRecord.automaticThought || "")) return;
    onUpdateRecord(activeRecord.id, { automaticThought: draftThought.trim() || null });
  }, [activeRecord, draftThought, onUpdateRecord]);

  const commitBalanced = useCallback(() => {
    if (!activeRecord || draftBalanced === (activeRecord.balancedThought || "")) return;
    onUpdateRecord(activeRecord.id, { balancedThought: draftBalanced.trim() || null });
  }, [activeRecord, draftBalanced, onUpdateRecord]);

  // ── Action callbacks ──────────────────────────────────────────────────

  const handleNewRecord = useCallback(() => {
    playClickSound();
    onCreateRecord(null);
  }, [onCreateRecord]);

  const toggleDistortion = useCallback(
    (distortionId: string) => {
      if (!activeRecord) return;
      const current = parseJsonArray(activeRecord.distortions);
      const next = current.includes(distortionId)
        ? current.filter((d: string) => d !== distortionId)
        : [...current, distortionId];
      onUpdateRecord(activeRecord.id, { distortions: next });
    },
    [activeRecord, onUpdateRecord]
  );

  const handleBeliefBefore = useCallback(
    (val: number) => {
      if (!activeRecord) return;
      onUpdateRecord(activeRecord.id, { beliefRatingBefore: val });
    },
    [activeRecord, onUpdateRecord]
  );

  const handleBeliefAfter = useCallback(
    (val: number) => {
      if (!activeRecord) return;
      onUpdateRecord(activeRecord.id, { beliefRatingAfter: val });
    },
    [activeRecord, onUpdateRecord]
  );

  const handleEmotionsBefore = useCallback(
    (ems: { emotion: string; intensity: number }[]) => {
      if (!activeRecord) return;
      onUpdateRecord(activeRecord.id, { emotionsBefore: ems });
    },
    [activeRecord, onUpdateRecord]
  );

  const handleEmotionsAfter = useCallback(
    (ems: { emotion: string; intensity: number }[]) => {
      if (!activeRecord) return;
      onUpdateRecord(activeRecord.id, { emotionsAfter: ems });
    },
    [activeRecord, onUpdateRecord]
  );

  const handleAddEvidence = useCallback(
    (type: "for" | "against", content: string) => {
      if (!activeRecord) return;
      const existing = activeEvidence.filter((e) => e.type === type);
      onAddEvidence(activeRecord.id, type, content, existing.length);
    },
    [activeRecord, activeEvidence, onAddEvidence]
  );

  const handleSelectRecord = useCallback((recordId: string) => {
    playClickSound();
    setActiveRecordId(recordId);
    setActiveStep(0);
    setShowHistory(false);
  }, []);

  const handleDeleteRecord = useCallback(
    (recordId: string) => {
      playClickSound();
      onRemoveRecord(recordId);
      if (activeRecordId === recordId) {
        setActiveRecordId(null);
      }
    },
    [activeRecordId, onRemoveRecord]
  );

  const advanceToNext = useCallback(() => {
    playClickSound();
    setActiveStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  }, []);

  // ── Step completion check ─────────────────────────────────────────────

  const isStepCompleted = useCallback(
    (stepIndex: number): boolean => {
      if (!activeRecord) return false;
      switch (stepIndex) {
        case 0:
          return !!activeRecord.situation;
        case 1:
          return !!activeRecord.automaticThought;
        case 2:
          return activeRecord.beliefRatingBefore !== null;
        case 3:
          return parseJsonArray(activeRecord.distortions).length > 0;
        case 4:
          return activeEvidence.filter((e) => e.type === "for").length > 0;
        case 5:
          return activeEvidence.filter((e) => e.type === "against").length > 0;
        case 6:
          return !!activeRecord.balancedThought;
        case 7:
          return activeRecord.beliefRatingAfter !== null;
        default:
          return false;
      }
    },
    [activeRecord, activeEvidence]
  );

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden select-none">
      {/* Layered background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-stone-900 to-slate-900" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(251,191,36,0.06),_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(52,211,153,0.04),_transparent_50%)]" />

      {/* Content */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 py-5 space-y-5">
        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Thought Bridge
            </h2>
            <p className="text-[11px] text-white/35 mt-0.5">
              Build a bridge from automatic thoughts to balanced perspectives
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {records.length > 1 && (
              <motion.button
                onClick={() => {
                  playClickSound();
                  setShowHistory(!showHistory);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "p-2 rounded-xl border backdrop-blur-md transition-all",
                  showHistory
                    ? "bg-white/[0.1] border-white/20 text-white"
                    : "bg-white/[0.04] border-white/[0.08] text-white/45 hover:text-white/75"
                )}
                title="View history"
              >
                <History className="w-4 h-4" />
              </motion.button>
            )}

            <motion.button
              onClick={handleNewRecord}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl
                bg-amber-500/15 border border-amber-400/25 text-amber-300
                hover:bg-amber-500/25 transition-all text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Record</span>
            </motion.button>

            {isClinician && records.length > 0 && (
              <motion.button
                onClick={() => {
                  playClickSound();
                  onClear();
                  setActiveRecordId(null);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08]
                  text-white/35 hover:text-red-400 hover:border-red-400/25 transition-all"
                title="Clear all records"
              >
                <RotateCcw className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </div>

        {/* ── History Panel ──────────────────────────────────────── */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl p-4 space-y-2">
                <p className="text-[10px] text-white/35 uppercase tracking-wider font-semibold mb-2">
                  Previous Records
                </p>
                {sortedRecords.map((rec) => {
                  const recSteps = computeCompletedSteps(
                    rec,
                    evidence.filter((e) => e.recordId === rec.id)
                  );
                  const isSelected = rec.id === activeRecordId;
                  return (
                    <motion.div
                      key={rec.id}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition-all",
                        isSelected
                          ? "bg-white/[0.06] border-amber-400/25"
                          : "bg-white/[0.015] border-white/[0.04] hover:bg-white/[0.04]"
                      )}
                      onClick={() => handleSelectRecord(rec.id)}
                      whileHover={{ x: 2 }}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white/75 truncate">
                          {rec.situation || rec.automaticThought || "Untitled record"}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-white/25">
                            {new Date(rec.createdAt).toLocaleDateString()}
                          </span>
                          <span className="text-[10px] text-white/25">--</span>
                          <span className="text-[10px] text-white/35">
                            {recSteps}/8 steps
                          </span>
                          {/* Mini progress dots */}
                          <div className="flex gap-0.5 ml-1">
                            {Array.from({ length: 8 }).map((_, i) => (
                              <div
                                key={i}
                                className={cn(
                                  "w-1 h-1 rounded-full",
                                  i < recSteps ? "bg-amber-400" : "bg-white/10"
                                )}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {rec.status === "complete" && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                            Complete
                          </span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRecord(rec.id);
                          }}
                          className="text-white/15 hover:text-red-400 transition-colors p-0.5"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Empty State ────────────────────────────────────────── */}
        {records.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div
              className="w-24 h-24 mb-6 rounded-full bg-amber-500/[0.08] border border-amber-400/15
              flex items-center justify-center"
            >
              <HelpCircle className="w-10 h-10 text-amber-400/40" />
            </div>
            <h3 className="text-lg font-semibold text-white/65 mb-2">
              Begin Your Thought Bridge
            </h3>
            <p className="text-sm text-white/35 max-w-xs leading-relaxed mb-6">
              Cognitive restructuring helps you examine automatic thoughts and build
              more balanced, realistic perspectives. Create a new record to get started.
            </p>
            <motion.button
              onClick={handleNewRecord}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl
                bg-amber-500/15 border border-amber-400/25 text-amber-300
                hover:bg-amber-500/25 transition-all text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Create First Record
            </motion.button>
          </motion.div>
        )}

        {/* ── Active Record ──────────────────────────────────────── */}
        {activeRecord && (
          <>
            {/* Bridge Visualization */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-white/[0.025] border border-white/[0.08] backdrop-blur-xl p-4"
            >
              <BridgeSVG progress={completedSteps} />

              <div className="flex items-center justify-between mt-3 px-2">
                <span className="text-[11px] text-white/35 font-medium">
                  {completedSteps}/8 steps completed
                </span>
                <div className="flex gap-1">
                  {STEPS.map((_, i) => (
                    <motion.div
                      key={i}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all",
                        i < completedSteps ? "bg-amber-400" : "bg-white/[0.08]"
                      )}
                      animate={
                        i < completedSteps ? { scale: [1, 1.3, 1] } : {}
                      }
                      transition={{ delay: i * 0.05, duration: 0.3 }}
                    />
                  ))}
                </div>
              </div>

              {/* Belief comparison gauges (show when at least one rating exists) */}
              {(activeRecord.beliefRatingBefore !== null ||
                activeRecord.beliefRatingAfter !== null) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="flex justify-center gap-8 mt-4 pt-3 border-t border-white/[0.06]"
                >
                  {activeRecord.beliefRatingBefore !== null && (
                    <BeliefGauge
                      value={activeRecord.beliefRatingBefore}
                      label="Initial Belief"
                      color="#f59e0b"
                    />
                  )}
                  {activeRecord.beliefRatingAfter !== null && (
                    <BeliefGauge
                      value={activeRecord.beliefRatingAfter}
                      label="After Restructuring"
                      color="#34d399"
                    />
                  )}
                </motion.div>
              )}
            </motion.div>

            {/* Emotions Before */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl p-4"
            >
              <EmotionRow
                emotions={emotionsBefore}
                onChange={handleEmotionsBefore}
                label="How are you feeling right now?"
              />
            </motion.div>

            {/* ── Step Cards ─────────────────────────────────────── */}
            <div className="space-y-2">
              {STEPS.map((step, index) => (
                <StepCard
                  key={step.key}
                  step={step}
                  index={index}
                  isActive={activeStep === index}
                  isCompleted={isStepCompleted(index)}
                  onActivate={() => setActiveStep(index)}
                >
                  {/* Step 1: Situation */}
                  {step.key === "situation" && (
                    <div className="space-y-3">
                      <p className="text-xs text-white/35 leading-relaxed">
                        Briefly describe the situation that triggered your thought.
                        What happened, where were you, who was involved?
                      </p>
                      <textarea
                        value={draftSituation}
                        onChange={(e) => setDraftSituation(e.target.value)}
                        onBlur={commitSituation}
                        rows={3}
                        placeholder="Describe the situation..."
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08]
                          text-sm text-white placeholder:text-white/20 focus:outline-none
                          focus:border-amber-400/25 transition-colors resize-none leading-relaxed"
                      />
                      <ContinueButton
                        onClick={() => {
                          commitSituation();
                          advanceToNext();
                        }}
                        disabled={!draftSituation.trim()}
                      />
                    </div>
                  )}

                  {/* Step 2: Automatic Thought */}
                  {step.key === "thought" && (
                    <div className="space-y-3">
                      <p className="text-xs text-white/35 leading-relaxed">
                        What thought popped into your mind automatically? Try to
                        capture the exact words, even if they seem irrational.
                      </p>
                      <textarea
                        value={draftThought}
                        onChange={(e) => setDraftThought(e.target.value)}
                        onBlur={commitThought}
                        rows={3}
                        placeholder="What was the automatic thought?"
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08]
                          text-sm text-white placeholder:text-white/20 focus:outline-none
                          focus:border-amber-400/25 transition-colors resize-none leading-relaxed"
                      />
                      <ContinueButton
                        onClick={() => {
                          commitThought();
                          advanceToNext();
                        }}
                        disabled={!draftThought.trim()}
                      />
                    </div>
                  )}

                  {/* Step 3: Belief Rating Before */}
                  {step.key === "beliefBefore" && (
                    <div className="space-y-4">
                      <p className="text-xs text-white/35 leading-relaxed">
                        How strongly do you believe this thought right now?
                        0 means not at all, 100 means completely.
                      </p>
                      <div className="flex flex-col items-center gap-3">
                        <BeliefGauge
                          value={activeRecord.beliefRatingBefore ?? 50}
                          label="Belief Strength"
                          color="#f59e0b"
                        />
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={activeRecord.beliefRatingBefore ?? 50}
                          onChange={(e) => handleBeliefBefore(Number(e.target.value))}
                          className="w-full max-w-xs h-2 accent-amber-400"
                        />
                        <div className="flex justify-between w-full max-w-xs text-[10px] text-white/25">
                          <span>Not at all (0)</span>
                          <span>Completely (100)</span>
                        </div>
                      </div>
                      <ContinueButton onClick={advanceToNext} />
                    </div>
                  )}

                  {/* Step 4: Cognitive Distortions */}
                  {step.key === "distortions" && (
                    <div className="space-y-3">
                      <p className="text-xs text-white/35 leading-relaxed">
                        Which cognitive distortions might apply to this thought?
                        Hover over each one for a description and example.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {COGNITIVE_DISTORTIONS.map((d) => (
                          <DistortionChip
                            key={d.id}
                            distortion={d}
                            selected={activeDistortions.includes(d.id)}
                            onToggle={() => toggleDistortion(d.id)}
                          />
                        ))}
                      </div>
                      {activeDistortions.length > 0 && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-xs text-amber-400/55 font-medium"
                        >
                          {activeDistortions.length} distortion
                          {activeDistortions.length > 1 ? "s" : ""} identified
                        </motion.p>
                      )}
                      <ContinueButton
                        onClick={advanceToNext}
                        disabled={activeDistortions.length === 0}
                      />
                    </div>
                  )}

                  {/* Step 5: Evidence For */}
                  {step.key === "evidenceFor" && (
                    <div className="space-y-3">
                      <p className="text-xs text-white/35 leading-relaxed">
                        What evidence supports this automatic thought? Try to
                        list objective facts rather than feelings.
                      </p>
                      <EvidenceSection
                        items={activeEvidence.filter((e) => e.type === "for")}
                        type="for"
                        onAdd={(content) => handleAddEvidence("for", content)}
                        onRemove={onRemoveEvidence}
                      />
                      <ContinueButton
                        onClick={advanceToNext}
                        disabled={
                          activeEvidence.filter((e) => e.type === "for").length === 0
                        }
                      />
                    </div>
                  )}

                  {/* Step 6: Evidence Against */}
                  {step.key === "evidenceAgainst" && (
                    <div className="space-y-3">
                      <p className="text-xs text-white/35 leading-relaxed">
                        What evidence contradicts this thought? Consider what you
                        would tell a friend in the same situation.
                      </p>
                      <EvidenceSection
                        items={activeEvidence.filter((e) => e.type === "against")}
                        type="against"
                        onAdd={(content) => handleAddEvidence("against", content)}
                        onRemove={onRemoveEvidence}
                      />
                      <ContinueButton
                        onClick={advanceToNext}
                        disabled={
                          activeEvidence.filter((e) => e.type === "against").length === 0
                        }
                      />
                    </div>
                  )}

                  {/* Step 7: Balanced Thought */}
                  {step.key === "balanced" && (
                    <div className="space-y-3">
                      <p className="text-xs text-white/35 leading-relaxed">
                        Considering all the evidence, what is a more balanced or
                        realistic way to think about this situation?
                      </p>

                      {/* Side-by-side evidence summary for reference */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl bg-rose-500/[0.05] border border-rose-500/15 p-3">
                          <p className="text-[10px] text-rose-400/70 uppercase tracking-wider font-semibold mb-1.5">
                            Evidence For
                          </p>
                          {activeEvidence
                            .filter((e) => e.type === "for")
                            .map((e) => (
                              <p key={e.id} className="text-[11px] text-white/45 leading-relaxed mb-0.5">
                                - {e.content}
                              </p>
                            ))}
                          {activeEvidence.filter((e) => e.type === "for").length === 0 && (
                            <p className="text-[11px] text-white/15 italic">None added</p>
                          )}
                        </div>
                        <div className="rounded-xl bg-emerald-500/[0.05] border border-emerald-500/15 p-3">
                          <p className="text-[10px] text-emerald-400/70 uppercase tracking-wider font-semibold mb-1.5">
                            Evidence Against
                          </p>
                          {activeEvidence
                            .filter((e) => e.type === "against")
                            .map((e) => (
                              <p key={e.id} className="text-[11px] text-white/45 leading-relaxed mb-0.5">
                                - {e.content}
                              </p>
                            ))}
                          {activeEvidence.filter((e) => e.type === "against").length ===
                            0 && (
                            <p className="text-[11px] text-white/15 italic">None added</p>
                          )}
                        </div>
                      </div>

                      <textarea
                        value={draftBalanced}
                        onChange={(e) => setDraftBalanced(e.target.value)}
                        onBlur={commitBalanced}
                        rows={3}
                        placeholder="Write a more balanced thought..."
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08]
                          text-sm text-white placeholder:text-white/20 focus:outline-none
                          focus:border-emerald-400/25 transition-colors resize-none leading-relaxed"
                      />
                      <ContinueButton
                        onClick={() => {
                          commitBalanced();
                          advanceToNext();
                        }}
                        disabled={!draftBalanced.trim()}
                        variant="emerald"
                      />
                    </div>
                  )}

                  {/* Step 8: Belief Rating After */}
                  {step.key === "beliefAfter" && (
                    <div className="space-y-4">
                      <p className="text-xs text-white/35 leading-relaxed">
                        Now that you have a balanced thought, how strongly do you
                        believe the original automatic thought?
                      </p>

                      {/* Show original thought for reference */}
                      {activeRecord.automaticThought && (
                        <div className="rounded-xl bg-white/[0.025] border border-white/[0.08] p-3">
                          <p className="text-[10px] text-white/25 uppercase tracking-wider mb-1 font-medium">
                            Original thought
                          </p>
                          <p className="text-sm text-white/55 italic leading-relaxed">
                            &ldquo;{activeRecord.automaticThought}&rdquo;
                          </p>
                        </div>
                      )}

                      {activeRecord.balancedThought && (
                        <div className="rounded-xl bg-emerald-500/[0.05] border border-emerald-500/15 p-3">
                          <p className="text-[10px] text-emerald-400/70 uppercase tracking-wider mb-1 font-medium">
                            Balanced thought
                          </p>
                          <p className="text-sm text-white/65 italic leading-relaxed">
                            &ldquo;{activeRecord.balancedThought}&rdquo;
                          </p>
                        </div>
                      )}

                      <div className="flex flex-col items-center gap-3">
                        <div className="flex gap-6">
                          {activeRecord.beliefRatingBefore !== null && (
                            <BeliefGauge
                              value={activeRecord.beliefRatingBefore}
                              label="Before"
                              color="#f59e0b"
                            />
                          )}
                          <BeliefGauge
                            value={activeRecord.beliefRatingAfter ?? 50}
                            label="After"
                            color="#34d399"
                          />
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={activeRecord.beliefRatingAfter ?? 50}
                          onChange={(e) => handleBeliefAfter(Number(e.target.value))}
                          className="w-full max-w-xs h-2 accent-emerald-400"
                        />
                        <div className="flex justify-between w-full max-w-xs text-[10px] text-white/25">
                          <span>Not at all (0)</span>
                          <span>Completely (100)</span>
                        </div>
                      </div>

                      {/* Belief shift feedback */}
                      {activeRecord.beliefRatingBefore !== null &&
                        activeRecord.beliefRatingAfter !== null && (
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center pt-2"
                          >
                            {activeRecord.beliefRatingAfter <
                            activeRecord.beliefRatingBefore ? (
                              <p className="text-sm text-emerald-400 font-medium">
                                Your belief decreased by{" "}
                                <span className="font-bold">
                                  {activeRecord.beliefRatingBefore -
                                    activeRecord.beliefRatingAfter}
                                  %
                                </span>
                                . Great work restructuring!
                              </p>
                            ) : activeRecord.beliefRatingAfter ===
                              activeRecord.beliefRatingBefore ? (
                              <p className="text-sm text-amber-400/65">
                                Your belief stayed the same. That is okay --
                                restructuring takes practice.
                              </p>
                            ) : (
                              <p className="text-sm text-white/45">
                                Your belief increased. Consider revisiting the
                                evidence or trying a different balanced thought.
                              </p>
                            )}
                          </motion.div>
                        )}
                    </div>
                  )}
                </StepCard>
              ))}
            </div>

            {/* Emotions After (appears once nearing completion) */}
            {completedSteps >= 6 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl p-4"
              >
                <EmotionRow
                  emotions={emotionsAfter}
                  onChange={handleEmotionsAfter}
                  label="How are you feeling after restructuring?"
                />
              </motion.div>
            )}

            {/* Emotional Shift Comparison */}
            {emotionsBefore.length > 0 && emotionsAfter.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl p-4"
              >
                <p className="text-[10px] text-white/35 uppercase tracking-wider font-semibold mb-3">
                  Emotional Shift
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-amber-400/55 font-medium mb-2">
                      Before
                    </p>
                    {emotionsBefore.map(
                      (em: { emotion: string; intensity: number }, i: number) => (
                        <div key={i} className="flex items-center gap-2 mb-1.5">
                          <span className="text-[11px] text-white/55 w-20 truncate">
                            {em.emotion}
                          </span>
                          <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                            <motion.div
                              className="h-full rounded-full bg-amber-400/55"
                              initial={{ width: 0 }}
                              animate={{ width: `${em.intensity}%` }}
                              transition={{ duration: 0.6, delay: i * 0.05 }}
                            />
                          </div>
                          <span className="text-[10px] text-white/25 w-7 text-right">
                            {em.intensity}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] text-emerald-400/55 font-medium mb-2">
                      After
                    </p>
                    {emotionsAfter.map(
                      (em: { emotion: string; intensity: number }, i: number) => (
                        <div key={i} className="flex items-center gap-2 mb-1.5">
                          <span className="text-[11px] text-white/55 w-20 truncate">
                            {em.emotion}
                          </span>
                          <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                            <motion.div
                              className="h-full rounded-full bg-emerald-400/55"
                              initial={{ width: 0 }}
                              animate={{ width: `${em.intensity}%` }}
                              transition={{ duration: 0.6, delay: i * 0.05 }}
                            />
                          </div>
                          <span className="text-[10px] text-white/25 w-7 text-right">
                            {em.intensity}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* ── Celebration Overlay ─────────────────────────────────── */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center
              bg-black/50 backdrop-blur-sm"
            onClick={() => setShowCelebration(false)}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 10 }}
              transition={{ type: "spring", damping: 18, stiffness: 200 }}
              className="relative rounded-3xl bg-gradient-to-br from-amber-500/15 via-emerald-500/10 to-cyan-500/[0.08]
                border border-white/15 backdrop-blur-2xl p-8 text-center max-w-sm mx-4
                shadow-2xl shadow-amber-500/10 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Animated sparkle icon */}
              <motion.div
                animate={{ rotate: [0, 12, -12, 0] }}
                transition={{ duration: 0.7, repeat: 3 }}
                className="mb-4 inline-block"
              >
                <Sparkles className="w-14 h-14 text-amber-400 mx-auto" />
              </motion.div>

              <h3 className="text-xl font-bold text-white mb-2">
                Bridge Complete!
              </h3>
              <p className="text-sm text-white/55 leading-relaxed mb-5">
                You have successfully built a bridge from your automatic thought
                to a more balanced perspective. This is a powerful step in
                cognitive restructuring.
              </p>

              {/* Before/After gauges */}
              {activeRecord &&
                activeRecord.beliefRatingBefore !== null &&
                activeRecord.beliefRatingAfter !== null && (
                  <div className="flex justify-center gap-6 mb-5">
                    <BeliefGauge
                      value={activeRecord.beliefRatingBefore}
                      label="Before"
                      color="#f59e0b"
                    />
                    <BeliefGauge
                      value={activeRecord.beliefRatingAfter}
                      label="After"
                      color="#34d399"
                    />
                  </div>
                )}

              <motion.button
                onClick={() => setShowCelebration(false)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2 rounded-xl bg-white/[0.08] border border-white/15
                  text-white/75 text-sm font-medium hover:bg-white/[0.12] transition-all"
              >
                Continue
              </motion.button>

              {/* Floating celebration particles */}
              {Array.from({ length: 24 }).map((_, i) => {
                const colors = ["#fbbf24", "#34d399", "#60a5fa", "#f472b6", "#a78bfa"];
                return (
                  <motion.div
                    key={`celebration-p-${i}`}
                    className="absolute w-1.5 h-1.5 rounded-full pointer-events-none"
                    style={{
                      backgroundColor: colors[i % colors.length],
                      top: "50%",
                      left: "50%",
                    }}
                    initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                    animate={{
                      x: (Math.random() - 0.5) * 320,
                      y: (Math.random() - 0.5) * 320,
                      opacity: 0,
                      scale: 0,
                    }}
                    transition={{
                      duration: 1.2 + Math.random() * 0.8,
                      delay: i * 0.04,
                      repeat: Infinity,
                      repeatDelay: 2.5,
                    }}
                  />
                );
              })}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
