import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { playClickSound } from "@/lib/audio-feedback";
import { RotateCcw, Plus, X, Check, ChevronRight, TreePine, Leaf, Clock, Sparkles, HelpCircle } from "lucide-react";

// ─── Data Interfaces ──────────────────────────────────────────────────────────

export interface WorryTreeEntryData {
  id: string;
  worryText: string;
  category: string | null;
  isReal: boolean | null;
  isActionable: boolean | null;
  resolution: string | null;
  actionSteps: any | null;
  scheduledTime: string | null;
  lettingGoMethod: string | null;
  createdBy: string | null;
  createdAt: string;
}

export interface WorryTreeProps {
  entries: WorryTreeEntryData[];
  onCreateEntry: (worryText: string, category: string | null) => void;
  onUpdateEntry: (entryId: string, fields: Partial<WorryTreeEntryData>) => void;
  onRemoveEntry: (entryId: string) => void;
  onClear: () => void;
  isClinician: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const WORRY_CATEGORIES = [
  { label: "Health", color: "#EF4444", icon: "+" },
  { label: "Relationships", color: "#EC4899", icon: "♥" },
  { label: "Work/School", color: "#3B82F6", icon: "◆" },
  { label: "Money", color: "#F59E0B", icon: "$" },
  { label: "Future", color: "#8B5CF6", icon: "★" },
  { label: "Safety", color: "#F97316", icon: "!" },
  { label: "Other", color: "#6B7280", icon: "?" },
];

const LETTING_GO_METHODS = [
  { label: "Deep Breathing", description: "Slow, rhythmic breaths to calm the nervous system", icon: "🌬" },
  { label: "Grounding Exercise", description: "5-4-3-2-1 senses technique to anchor to the present", icon: "🌍" },
  { label: "Mindful Moment", description: "Observe the worry without judgment, then release it", icon: "🧘" },
  { label: "Write & Release", description: "Write the worry down, then symbolically let it go", icon: "📝" },
  { label: "Body Scan", description: "Progressive relaxation from head to toe", icon: "🫀" },
  { label: "Distraction Activity", description: "Engage in a pleasant activity to shift focus", icon: "🎨" },
];

type FlowStep = "input" | "category" | "real-check" | "actionable-check" | "action-steps" | "letting-go" | "resolved";

function getEntryStatus(entry: WorryTreeEntryData): "unprocessed" | "in-progress" | "resolved" {
  if (entry.resolution !== null) return "resolved";
  if (entry.isReal !== null || entry.isActionable !== null || entry.lettingGoMethod !== null) return "in-progress";
  return "unprocessed";
}

function getStatusColor(status: "unprocessed" | "in-progress" | "resolved"): string {
  switch (status) {
    case "resolved": return "#22C55E";
    case "in-progress": return "#F59E0B";
    case "unprocessed": return "#EF4444";
  }
}

function getCategoryInfo(cat: string | null) {
  return WORRY_CATEGORIES.find((c) => c.label === cat) || WORRY_CATEGORIES[6];
}

// ─── Deterministic pseudo-random from seed ──────────────────────────────────

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

// ─── Falling Leaf Particle ──────────────────────────────────────────────────

function FallingLeaf({ index, onComplete }: { index: number; onComplete?: () => void }) {
  const startX = 30 + seededRandom(index * 7) * 40;
  const drift = (seededRandom(index * 13) - 0.5) * 60;
  const duration = 2.5 + seededRandom(index * 19) * 2;
  const delay = seededRandom(index * 31) * 0.8;
  const rotation = seededRandom(index * 41) * 360;

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: `${startX}%`, top: "20%" }}
      initial={{ opacity: 1, y: 0, x: 0, rotate: 0 }}
      animate={{
        opacity: [1, 1, 0.6, 0],
        y: [0, 80, 200, 350],
        x: [0, drift * 0.3, drift * 0.7, drift],
        rotate: [0, rotation * 0.3, rotation * 0.7, rotation],
      }}
      transition={{ duration, delay, ease: "easeIn" }}
      onAnimationComplete={onComplete}
    >
      <Leaf className="w-4 h-4 text-emerald-400/70" />
    </motion.div>
  );
}

// ─── SVG Tree Illustration ──────────────────────────────────────────────────

function TreeSVG({ entries, activeEntryId }: { entries: WorryTreeEntryData[]; activeEntryId: string | null }) {
  const resolvedCount = entries.filter((e) => getEntryStatus(e) === "resolved").length;
  const inProgressCount = entries.filter((e) => getEntryStatus(e) === "in-progress").length;
  const totalProcessed = resolvedCount + inProgressCount;

  const leafOpacity = Math.min(1, 0.3 + totalProcessed * 0.07);
  const trunkWidth = Math.min(14, 8 + entries.length * 0.3);

  const fruitPositions = useMemo(() => {
    return entries.slice(0, 12).map((entry, i) => {
      const angle = (i / Math.max(entries.length, 6)) * Math.PI * 1.4 - Math.PI * 0.2;
      const radius = 55 + seededRandom(i * 17) * 35;
      const cx = 150 + Math.cos(angle) * radius;
      const cy = 90 + Math.sin(angle) * radius * 0.5 - 20;
      return { entry, cx, cy };
    });
  }, [entries]);

  return (
    <svg viewBox="0 0 300 260" className="w-full max-w-[400px] mx-auto" style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.15))" }}>
      <defs>
        <linearGradient id="trunk-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8B6914" />
          <stop offset="100%" stopColor="#5C4310" />
        </linearGradient>
        <linearGradient id="canopy-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22C55E" stopOpacity={leafOpacity} />
          <stop offset="60%" stopColor="#16A34A" stopOpacity={leafOpacity * 0.9} />
          <stop offset="100%" stopColor="#15803D" stopOpacity={leafOpacity * 0.8} />
        </linearGradient>
        <filter id="tree-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
          <feFlood floodColor="#22C55E" floodOpacity="0.15" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id="fruit-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ground */}
      <ellipse cx="150" cy="245" rx="130" ry="15" fill="#15803D" opacity="0.2" />
      <ellipse cx="150" cy="245" rx="90" ry="8" fill="#166534" opacity="0.15" />

      {/* Roots */}
      <path d={`M${150 - trunkWidth * 0.5} 235 Q${150 - trunkWidth * 1.5} 248 ${150 - trunkWidth * 3} 250`} fill="none" stroke="#5C4310" strokeWidth="3" opacity="0.5" />
      <path d={`M${150 + trunkWidth * 0.5} 235 Q${150 + trunkWidth * 1.5} 250 ${150 + trunkWidth * 3} 248`} fill="none" stroke="#5C4310" strokeWidth="3" opacity="0.5" />
      <path d={`M150 238 Q150 252 ${150 - trunkWidth * 0.5} 255`} fill="none" stroke="#5C4310" strokeWidth="2" opacity="0.3" />

      {/* Trunk */}
      <path
        d={`M${150 - trunkWidth / 2} 235 L${150 - trunkWidth / 2 + 2} 140 Q150 125 ${150 + trunkWidth / 2 - 2} 140 L${150 + trunkWidth / 2} 235 Z`}
        fill="url(#trunk-grad)"
        stroke="#4A3508"
        strokeWidth="0.5"
      />

      {/* Bark texture */}
      <line x1={150 - trunkWidth * 0.2} y1="160" x2={150 - trunkWidth * 0.15} y2="210" stroke="#4A3508" strokeWidth="0.5" opacity="0.3" />
      <line x1={150 + trunkWidth * 0.1} y1="170" x2={150 + trunkWidth * 0.15} y2="220" stroke="#4A3508" strokeWidth="0.5" opacity="0.3" />

      {/* Main branches */}
      <path d="M145 155 Q110 130 70 110" fill="none" stroke="#6B4F1D" strokeWidth="4" strokeLinecap="round" />
      <path d="M155 155 Q190 130 230 110" fill="none" stroke="#6B4F1D" strokeWidth="4" strokeLinecap="round" />
      <path d="M148 145 Q120 100 90 70" fill="none" stroke="#6B4F1D" strokeWidth="3" strokeLinecap="round" />
      <path d="M152 145 Q180 100 210 70" fill="none" stroke="#6B4F1D" strokeWidth="3" strokeLinecap="round" />
      <path d="M150 138 Q150 90 150 55" fill="none" stroke="#6B4F1D" strokeWidth="3" strokeLinecap="round" />

      {/* Sub-branches */}
      <path d="M90 70 Q75 55 60 50" fill="none" stroke="#6B4F1D" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M90 70 Q95 50 100 40" fill="none" stroke="#6B4F1D" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M210 70 Q225 55 240 50" fill="none" stroke="#6B4F1D" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M210 70 Q205 50 200 40" fill="none" stroke="#6B4F1D" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M70 110 Q50 105 40 95" fill="none" stroke="#6B4F1D" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M230 110 Q250 105 260 95" fill="none" stroke="#6B4F1D" strokeWidth="1.5" strokeLinecap="round" />

      {/* Canopy layers */}
      <ellipse cx="150" cy="75" rx="110" ry="60" fill="url(#canopy-grad)" filter="url(#tree-glow)" />
      <ellipse cx="120" cy="65" rx="65" ry="45" fill="#22C55E" opacity={leafOpacity * 0.25} />
      <ellipse cx="180" cy="65" rx="65" ry="45" fill="#16A34A" opacity={leafOpacity * 0.2} />
      <ellipse cx="150" cy="50" rx="50" ry="35" fill="#4ADE80" opacity={leafOpacity * 0.15} />

      {/* Fruit / worry entries on tree */}
      {fruitPositions.map(({ entry, cx, cy }) => {
        const status = getEntryStatus(entry);
        const color = getStatusColor(status);
        const isActive = entry.id === activeEntryId;
        const catInfo = getCategoryInfo(entry.category);
        return (
          <g key={entry.id}>
            {isActive && (
              <circle cx={cx} cy={cy} r="10" fill="none" stroke={color} strokeWidth="1" opacity="0.5">
                <animate attributeName="r" values="10;14;10" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.5;0.2;0.5" dur="2s" repeatCount="indefinite" />
              </circle>
            )}
            <circle cx={cx} cy={cy} r="7" fill={catInfo.color} opacity="0.9" stroke={color} strokeWidth={isActive ? 2 : 1} />
            <circle cx={cx - 2} cy={cy - 2} r="2" fill="white" opacity="0.3" />
          </g>
        );
      })}

      {/* Label for empty state */}
      {entries.length === 0 && (
        <text x="150" y="130" textAnchor="middle" fill="#9CA3AF" fontSize="10" fontStyle="italic">
          Plant your first worry seed...
        </text>
      )}
    </svg>
  );
}

// ─── Decision Node Button ────────────────────────────────────────────────────

function DecisionButton({
  label,
  description,
  onClick,
  variant = "default",
  selected = false,
  disabled = false,
}: {
  label: string;
  description?: string;
  onClick: () => void;
  variant?: "default" | "yes" | "no" | "method";
  selected?: boolean;
  disabled?: boolean;
}) {
  const baseClass =
    "relative rounded-xl px-4 py-3 text-left transition-all duration-200 border cursor-pointer w-full";
  const variantClasses: Record<string, string> = {
    default:
      "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white/80",
    yes: "bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20 hover:border-emerald-400/50 text-emerald-300",
    no: "bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-400/50 text-amber-300",
    method:
      "bg-violet-500/10 border-violet-500/30 hover:bg-violet-500/20 hover:border-violet-400/50 text-violet-300",
  };
  const selectedClass = selected
    ? "ring-2 ring-white/30 bg-white/15 border-white/30"
    : "";

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={cn(baseClass, variantClasses[variant], selectedClass, disabled && "opacity-40 cursor-not-allowed")}
      onClick={() => {
        if (!disabled) {
          playClickSound?.();
          onClick();
        }
      }}
      disabled={disabled}
    >
      <span className="font-medium text-sm">{label}</span>
      {description && (
        <span className="block text-xs mt-0.5 opacity-60">{description}</span>
      )}
      {selected && (
        <Check className="absolute top-3 right-3 w-4 h-4 text-emerald-400" />
      )}
    </motion.button>
  );
}

// ─── Worry Input Form ───────────────────────────────────────────────────────

function WorryInputForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (text: string, category: string | null) => void;
  onCancel: () => void;
}) {
  const [text, setText] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [step, setStep] = useState<"text" | "category">("text");

  const handleTextSubmit = useCallback(() => {
    if (text.trim().length === 0) return;
    setStep("category");
  }, [text]);

  const handleCategorySelect = useCallback(
    (cat: string) => {
      playClickSound?.();
      setCategory(cat);
      onSubmit(text.trim(), cat);
    },
    [text, onSubmit]
  );

  const handleSkipCategory = useCallback(() => {
    onSubmit(text.trim(), null);
  }, [text, onSubmit]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      {step === "text" && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-white/70">
            What is worrying you right now?
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Describe your worry in your own words..."
            className="w-full min-h-[100px] rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white/90 placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/30 resize-none backdrop-blur-sm transition-all"
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-lg text-sm text-white/50 hover:text-white/80 hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleTextSubmit}
              disabled={text.trim().length === 0}
              className="px-4 py-2 rounded-lg text-sm bg-emerald-600/80 hover:bg-emerald-500/80 text-white font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {step === "category" && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-white/70">
            What category does this worry fall into?
          </label>
          <div className="grid grid-cols-2 gap-2">
            {WORRY_CATEGORIES.map((cat) => (
              <DecisionButton
                key={cat.label}
                label={`${cat.icon} ${cat.label}`}
                onClick={() => handleCategorySelect(cat.label)}
                selected={category === cat.label}
              />
            ))}
          </div>
          <button
            onClick={handleSkipCategory}
            className="w-full text-center text-xs text-white/40 hover:text-white/60 py-1.5 transition-colors"
          >
            Skip categorization
          </button>
        </div>
      )}
    </motion.div>
  );
}

// ─── Decision Flow Panel ────────────────────────────────────────────────────

function DecisionFlowPanel({
  entry,
  onUpdate,
}: {
  entry: WorryTreeEntryData;
  onUpdate: (fields: Partial<WorryTreeEntryData>) => void;
}) {
  const [actionInput, setActionInput] = useState("");
  const [scheduledTime, setScheduledTime] = useState(entry.scheduledTime || "");

  const currentStep = useMemo((): FlowStep => {
    if (entry.resolution !== null) return "resolved";
    if (entry.isReal === null) return "real-check";
    if (entry.isReal === false) return "letting-go";
    if (entry.isActionable === null) return "actionable-check";
    if (entry.isActionable === true) return "action-steps";
    return "letting-go";
  }, [entry]);

  const existingSteps: string[] = useMemo(() => {
    if (!entry.actionSteps) return [];
    try {
      return Array.isArray(entry.actionSteps) ? entry.actionSteps : JSON.parse(entry.actionSteps);
    } catch {
      return [];
    }
  }, [entry.actionSteps]);

  const addActionStep = useCallback(() => {
    if (actionInput.trim().length === 0) return;
    const updated = [...existingSteps, actionInput.trim()];
    onUpdate({ actionSteps: updated });
    setActionInput("");
  }, [actionInput, existingSteps, onUpdate]);

  const removeActionStep = useCallback(
    (idx: number) => {
      const updated = existingSteps.filter((_, i) => i !== idx);
      onUpdate({ actionSteps: updated });
    },
    [existingSteps, onUpdate]
  );

  const handleSchedule = useCallback(() => {
    if (scheduledTime) {
      onUpdate({ scheduledTime, resolution: "Action plan created" });
    }
  }, [scheduledTime, onUpdate]);

  const handleLettingGo = useCallback(
    (method: string) => {
      playClickSound?.();
      onUpdate({ lettingGoMethod: method, resolution: `Let go via: ${method}` });
    },
    [onUpdate]
  );

  const catInfo = getCategoryInfo(entry.category);

  // Progress breadcrumb
  const flowSteps: { key: FlowStep; label: string }[] = [
    { key: "real-check", label: "Real?" },
    { key: "actionable-check", label: "Actionable?" },
    { key: "action-steps", label: "Plan" },
    { key: "resolved", label: "Resolved" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      {/* Worry header */}
      <div className="rounded-xl bg-white/5 border border-white/10 p-4 backdrop-blur-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white/90 leading-relaxed">{entry.worryText}</p>
            {entry.category && (
              <span
                className="inline-flex items-center gap-1 mt-2 text-xs px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${catInfo.color}20`, color: catInfo.color }}
              >
                {catInfo.icon} {entry.category}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Flow progress bar */}
      <div className="flex items-center gap-1 px-1">
        {flowSteps.map((fs, idx) => {
          const isCurrent = fs.key === currentStep;
          const isPast =
            currentStep === "resolved" ||
            flowSteps.findIndex((f) => f.key === currentStep) > idx;
          return (
            <div key={fs.key} className="flex items-center gap-1 flex-1">
              <div
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-all duration-500",
                  isPast ? "bg-emerald-500/60" : isCurrent ? "bg-amber-400/60" : "bg-white/10"
                )}
              />
              <span
                className={cn(
                  "text-[10px] whitespace-nowrap",
                  isPast ? "text-emerald-400/70" : isCurrent ? "text-amber-300/80 font-medium" : "text-white/20"
                )}
              >
                {fs.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Decision nodes */}
      <AnimatePresence mode="wait">
        {currentStep === "real-check" && (
          <motion.div
            key="real-check"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2 text-white/70">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-medium">Is this worry about something real and happening now?</h3>
            </div>
            <p className="text-xs text-white/40 pl-6">
              A "real" worry is about a current, concrete situation -- not a hypothetical or "what if" scenario.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <DecisionButton
                label="Yes, it's real"
                description="This is happening or very likely to happen"
                variant="yes"
                onClick={() => {
                  playClickSound?.();
                  onUpdate({ isReal: true });
                }}
              />
              <DecisionButton
                label="No, it's hypothetical"
                description="This is a 'what if' or unlikely scenario"
                variant="no"
                onClick={() => {
                  playClickSound?.();
                  onUpdate({ isReal: false });
                }}
              />
            </div>
          </motion.div>
        )}

        {currentStep === "actionable-check" && (
          <motion.div
            key="actionable-check"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2 text-white/70">
              <HelpCircle className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-medium">Can you take action to address this worry?</h3>
            </div>
            <p className="text-xs text-white/40 pl-6">
              Is there something concrete you can do about it, even a small step?
            </p>
            <div className="grid grid-cols-2 gap-3">
              <DecisionButton
                label="Yes, I can act"
                description="There are steps I can take"
                variant="yes"
                onClick={() => {
                  playClickSound?.();
                  onUpdate({ isActionable: true });
                }}
              />
              <DecisionButton
                label="No, it's beyond my control"
                description="I can't directly change this situation"
                variant="no"
                onClick={() => {
                  playClickSound?.();
                  onUpdate({ isActionable: false });
                }}
              />
            </div>
          </motion.div>
        )}

        {currentStep === "action-steps" && (
          <motion.div
            key="action-steps"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 text-white/70">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-medium">Create an action plan</h3>
            </div>
            <p className="text-xs text-white/40 pl-6">
              Break your worry down into manageable steps you can take.
            </p>

            {/* Existing steps */}
            {existingSteps.length > 0 && (
              <div className="space-y-1.5">
                {existingSteps.map((step, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-sm text-emerald-200"
                  >
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[10px] flex items-center justify-center font-bold text-emerald-300">
                      {idx + 1}
                    </span>
                    <span className="flex-1 min-w-0 truncate">{step}</span>
                    <button
                      onClick={() => removeActionStep(idx)}
                      className="flex-shrink-0 opacity-40 hover:opacity-80 transition-opacity"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Add step input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={actionInput}
                onChange={(e) => setActionInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addActionStep()}
                placeholder="Add an action step..."
                className="flex-1 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white/90 placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all"
              />
              <button
                onClick={addActionStep}
                disabled={actionInput.trim().length === 0}
                className="px-3 py-2 rounded-lg bg-emerald-600/60 hover:bg-emerald-500/60 text-white text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Schedule time */}
            {existingSteps.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-white/5">
                <div className="flex items-center gap-2 text-white/60">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">When will you start?</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="datetime-local"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="flex-1 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white/90 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all [color-scheme:dark]"
                  />
                  <button
                    onClick={handleSchedule}
                    disabled={!scheduledTime || existingSteps.length === 0}
                    className="px-4 py-2 rounded-lg bg-emerald-600/80 hover:bg-emerald-500/80 text-white text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" /> Resolve
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {currentStep === "letting-go" && (
          <motion.div
            key="letting-go"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2 text-white/70">
              <Leaf className="w-4 h-4 text-violet-400" />
              <h3 className="text-sm font-medium">Choose a letting-go method</h3>
            </div>
            <p className="text-xs text-white/40 pl-6">
              {entry.isReal === false
                ? "This worry is hypothetical. Practice releasing it with one of these techniques."
                : "This is beyond your direct control. Practice accepting and releasing it."}
            </p>
            <div className="grid grid-cols-1 gap-2">
              {LETTING_GO_METHODS.map((method) => (
                <DecisionButton
                  key={method.label}
                  label={`${method.icon}  ${method.label}`}
                  description={method.description}
                  variant="method"
                  onClick={() => handleLettingGo(method.label)}
                />
              ))}
            </div>
          </motion.div>
        )}

        {currentStep === "resolved" && (
          <motion.div
            key="resolved"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-5 text-center space-y-3"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
            >
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                <Check className="w-6 h-6 text-emerald-400" />
              </div>
            </motion.div>
            <h3 className="text-sm font-semibold text-emerald-300">Worry Processed</h3>
            <p className="text-xs text-emerald-200/60">{entry.resolution}</p>
            {entry.lettingGoMethod && (
              <span className="inline-block text-xs px-3 py-1 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/20">
                {entry.lettingGoMethod}
              </span>
            )}
            {existingSteps.length > 0 && (
              <div className="text-left space-y-1 pt-2">
                <span className="text-xs text-emerald-300/60 font-medium">Action steps:</span>
                {existingSteps.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-emerald-200/70">
                    <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            )}
            {entry.scheduledTime && (
              <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-200/50">
                <Clock className="w-3 h-3" />
                <span>Scheduled: {new Date(entry.scheduledTime).toLocaleString()}</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Entry List Sidebar ─────────────────────────────────────────────────────

function EntrySidebar({
  entries,
  activeId,
  onSelect,
  onRemove,
}: {
  entries: WorryTreeEntryData[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  if (entries.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider px-1 flex items-center gap-1.5">
        <TreePine className="w-3 h-3" />
        All Worries ({entries.length})
      </h3>
      <div className="space-y-1 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
        {entries.map((entry) => {
          const status = getEntryStatus(entry);
          const statusColor = getStatusColor(status);
          const isActive = entry.id === activeId;
          const catInfo = getCategoryInfo(entry.category);

          return (
            <motion.button
              key={entry.id}
              layout
              onClick={() => {
                playClickSound?.();
                onSelect(entry.id);
              }}
              className={cn(
                "w-full text-left rounded-lg px-3 py-2.5 transition-all duration-200 group border",
                isActive
                  ? "bg-white/10 border-white/20 shadow-lg"
                  : "bg-white/[0.03] border-transparent hover:bg-white/[0.06] hover:border-white/10"
              )}
            >
              <div className="flex items-start gap-2.5">
                {/* Status dot */}
                <div
                  className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ring-2"
                  style={{
                    backgroundColor: statusColor,
                    boxShadow: `0 0 6px ${statusColor}40`,
                    outline: `2px solid ${statusColor}30`,
                    outlineOffset: "1px",
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white/80 truncate leading-relaxed">
                    {entry.worryText}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {entry.category && (
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: `${catInfo.color}15`, color: `${catInfo.color}CC` }}
                      >
                        {entry.category}
                      </span>
                    )}
                    <span
                      className="text-[10px] capitalize"
                      style={{ color: `${statusColor}AA` }}
                    >
                      {status.replace("-", " ")}
                    </span>
                  </div>
                </div>
                {/* Remove button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playClickSound?.();
                    onRemove(entry.id);
                  }}
                  className="flex-shrink-0 opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity p-0.5"
                >
                  <X className="w-3 h-3 text-white/60" />
                </button>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Statistics Bar ─────────────────────────────────────────────────────────

function StatsBar({ entries }: { entries: WorryTreeEntryData[] }) {
  const stats = useMemo(() => {
    const resolved = entries.filter((e) => getEntryStatus(e) === "resolved").length;
    const inProgress = entries.filter((e) => getEntryStatus(e) === "in-progress").length;
    const unprocessed = entries.filter((e) => getEntryStatus(e) === "unprocessed").length;
    const letGo = entries.filter((e) => e.lettingGoMethod !== null).length;
    const actioned = entries.filter((e) => e.isActionable === true && e.resolution !== null).length;
    return { resolved, inProgress, unprocessed, letGo, actioned, total: entries.length };
  }, [entries]);

  if (stats.total === 0) return null;

  const pctResolved = stats.total > 0 ? (stats.resolved / stats.total) * 100 : 0;

  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 space-y-2.5">
      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-white/40">Processing progress</span>
          <span className="text-emerald-400/70 font-medium">{Math.round(pctResolved)}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500/80 to-emerald-400/80"
            initial={{ width: 0 }}
            animate={{ width: `${pctResolved}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Stat pills */}
      <div className="flex flex-wrap gap-1.5">
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-300/70 border border-red-500/10">
          {stats.unprocessed} unprocessed
        </span>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300/70 border border-amber-500/10">
          {stats.inProgress} in progress
        </span>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300/70 border border-emerald-500/10">
          {stats.resolved} resolved
        </span>
        {stats.letGo > 0 && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300/70 border border-violet-500/10">
            {stats.letGo} let go
          </span>
        )}
        {stats.actioned > 0 && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300/70 border border-blue-500/10">
            {stats.actioned} actioned
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Info Tooltip ───────────────────────────────────────────────────────────

function InfoPanel({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="rounded-xl bg-white/[0.06] border border-white/10 p-4 space-y-3 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white/80 flex items-center gap-2">
          <TreePine className="w-4 h-4 text-emerald-400" />
          How the Worry Tree Works
        </h3>
        <button onClick={onClose} className="text-white/40 hover:text-white/70 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-2 text-xs text-white/50 leading-relaxed">
        <p>
          The Worry Tree is a CBT-based decision tool that helps you process worries systematically:
        </p>
        <ol className="list-decimal list-inside space-y-1.5 pl-1">
          <li>
            <span className="text-white/60 font-medium">Name your worry</span> -- write it down to externalize it
          </li>
          <li>
            <span className="text-white/60 font-medium">Is it real?</span> -- distinguish between real situations and hypothetical "what ifs"
          </li>
          <li>
            <span className="text-white/60 font-medium">Can you act on it?</span> -- determine if you have any control
          </li>
          <li>
            <span className="text-amber-300/70 font-medium">If actionable:</span> create concrete steps and schedule when to start
          </li>
          <li>
            <span className="text-violet-300/70 font-medium">If not actionable:</span> practice a letting-go technique to release the worry
          </li>
        </ol>
        <p className="pt-1 border-t border-white/5 text-white/40 italic">
          Each processed worry becomes a leaf on your tree, showing your growing ability to manage anxiety.
        </p>
      </div>
    </motion.div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function WorryTree({
  entries,
  onCreateEntry,
  onUpdateEntry,
  onRemoveEntry,
  onClear,
  isClinician,
}: WorryTreeProps) {
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);
  const [showInput, setShowInput] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [fallingLeaves, setFallingLeaves] = useState<number[]>([]);
  const [leafCounter, setLeafCounter] = useState(0);

  const activeEntry = useMemo(
    () => entries.find((e) => e.id === activeEntryId) || null,
    [entries, activeEntryId]
  );

  const sortedEntries = useMemo(() => {
    return [...entries].sort((a, b) => {
      const statusOrder = { unprocessed: 0, "in-progress": 1, resolved: 2 };
      const sa = statusOrder[getEntryStatus(a)];
      const sb = statusOrder[getEntryStatus(b)];
      if (sa !== sb) return sa - sb;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [entries]);

  const handleCreate = useCallback(
    (text: string, category: string | null) => {
      onCreateEntry(text, category);
      setShowInput(false);
    },
    [onCreateEntry]
  );

  const handleUpdate = useCallback(
    (fields: Partial<WorryTreeEntryData>) => {
      if (!activeEntryId) return;

      // Trigger falling leaves on resolution
      if (fields.resolution && fields.lettingGoMethod) {
        const newLeaves = Array.from({ length: 8 }, (_, i) => leafCounter + i);
        setFallingLeaves((prev) => [...prev, ...newLeaves]);
        setLeafCounter((prev) => prev + 8);
      }

      onUpdateEntry(activeEntryId, fields);
    },
    [activeEntryId, onUpdateEntry, leafCounter]
  );

  const handleRemoveLeaf = useCallback(
    (idx: number) => {
      setFallingLeaves((prev) => prev.filter((l) => l !== idx));
    },
    []
  );

  const handleSelectEntry = useCallback((id: string) => {
    setActiveEntryId(id);
    setShowInput(false);
  }, []);

  const handleNewWorry = useCallback(() => {
    playClickSound?.();
    setShowInput(true);
    setActiveEntryId(null);
  }, []);

  const handleClear = useCallback(() => {
    playClickSound?.();
    onClear();
    setActiveEntryId(null);
    setShowInput(false);
    setFallingLeaves([]);
  }, [onClear]);

  // Auto-select first unprocessed entry if none selected
  const autoSelected = useMemo(() => {
    if (activeEntryId || showInput) return null;
    const unprocessed = sortedEntries.find((e) => getEntryStatus(e) !== "resolved");
    if (unprocessed) {
      return unprocessed.id;
    }
    return null;
  }, [sortedEntries, activeEntryId, showInput]);

  const effectiveActiveId = activeEntryId ?? autoSelected;
  const effectiveEntry = entries.find((e) => e.id === effectiveActiveId) || null;

  return (
    <div className="relative w-full min-h-[600px] flex flex-col gap-4 p-4 select-none overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/20 via-transparent to-emerald-950/10 pointer-events-none rounded-2xl" />

      {/* Falling leaves overlay */}
      <AnimatePresence>
        {fallingLeaves.map((leafIdx) => (
          <FallingLeaf
            key={leafIdx}
            index={leafIdx}
            onComplete={() => handleRemoveLeaf(leafIdx)}
          />
        ))}
      </AnimatePresence>

      {/* Header */}
      <div className="relative flex items-center justify-between z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
            <TreePine className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white/90">Worry Tree</h2>
            <p className="text-[10px] text-white/40">CBT decision flowchart for managing worries</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              playClickSound?.();
              setShowInfo(!showInfo);
            }}
            className="p-2 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/5 transition-all"
            title="How it works"
          >
            <HelpCircle className="w-4 h-4" />
          </motion.button>
          {isClinician && entries.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClear}
              className="p-2 rounded-lg text-white/40 hover:text-red-300/70 hover:bg-red-500/10 transition-all"
              title="Clear all entries"
            >
              <RotateCcw className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </div>

      {/* Info panel */}
      <AnimatePresence>
        {showInfo && (
          <div className="relative z-10">
            <InfoPanel onClose={() => setShowInfo(false)} />
          </div>
        )}
      </AnimatePresence>

      {/* Tree visualization */}
      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="rounded-2xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/[0.06] p-4 backdrop-blur-sm overflow-hidden"
        >
          <TreeSVG entries={entries} activeEntryId={effectiveActiveId} />
        </motion.div>
      </div>

      {/* Stats bar */}
      <div className="relative z-10">
        <StatsBar entries={entries} />
      </div>

      {/* Main content area: sidebar + flow panel */}
      <div className="relative z-10 flex flex-col md:flex-row gap-4">
        {/* Entry sidebar */}
        <div className="md:w-[240px] flex-shrink-0">
          <EntrySidebar
            entries={sortedEntries}
            activeId={effectiveActiveId}
            onSelect={handleSelectEntry}
            onRemove={onRemoveEntry}
          />

          {/* New worry button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleNewWorry}
            className={cn(
              "w-full mt-3 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border",
              showInput
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                : "bg-white/5 border-white/10 text-white/60 hover:bg-emerald-500/10 hover:border-emerald-500/20 hover:text-emerald-300"
            )}
          >
            <Plus className="w-4 h-4" />
            New Worry
          </motion.button>
        </div>

        {/* Decision flow / input panel */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {showInput && (
              <motion.div
                key="input-form"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <WorryInputForm
                  onSubmit={handleCreate}
                  onCancel={() => setShowInput(false)}
                />
              </motion.div>
            )}

            {!showInput && effectiveEntry && (
              <motion.div
                key={`flow-${effectiveEntry.id}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <DecisionFlowPanel
                  entry={effectiveEntry}
                  onUpdate={handleUpdate}
                />
              </motion.div>
            )}

            {!showInput && !effectiveEntry && entries.length === 0 && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-12 space-y-4"
              >
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center">
                    <Leaf className="w-8 h-8 text-emerald-400/50" />
                  </div>
                </motion.div>
                <div className="text-center space-y-1.5">
                  <p className="text-sm text-white/50 font-medium">Your worry tree is empty</p>
                  <p className="text-xs text-white/30 max-w-[260px]">
                    Plant your first worry to begin processing it through the decision tree.
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNewWorry}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600/70 hover:bg-emerald-500/70 text-white text-sm font-medium transition-all shadow-lg shadow-emerald-900/20"
                >
                  <Plus className="w-4 h-4" />
                  Add Your First Worry
                </motion.button>
              </motion.div>
            )}

            {!showInput && !effectiveEntry && entries.length > 0 && (
              <motion.div
                key="all-done"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center py-12 space-y-4"
              >
                <motion.div
                  initial={{ rotate: -10 }}
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-emerald-400/60" />
                  </div>
                </motion.div>
                <div className="text-center space-y-1.5">
                  <p className="text-sm text-emerald-300/80 font-medium">All worries processed</p>
                  <p className="text-xs text-white/30 max-w-[260px]">
                    Well done! Select an entry to review, or add a new worry.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Glassmorphism corner accents */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}
