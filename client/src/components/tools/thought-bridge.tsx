import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Brain,
  Lightbulb,
  Sparkles,
  Plus,
  X,
  Check,
  AlertTriangle,
  HelpCircle,
  Scale,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui/glass-card";

const STEPS = [
  { id: "situation", label: "Situation", icon: "📍" },
  { id: "thought", label: "Hot Thought", icon: "💭" },
  { id: "emotions", label: "Emotions", icon: "🎭" },
  { id: "distortions", label: "Thinking Traps", icon: "🪤" },
  { id: "evidence", label: "Evidence", icon: "⚖️" },
  { id: "reframe", label: "Bridge", icon: "🌉" },
] as const;


const EMOTIONS_LIST = [
  { id: "anxious", label: "Anxious", color: "#f59e0b", emoji: "😰" },
  { id: "sad", label: "Sad", color: "#3b82f6", emoji: "😢" },
  { id: "angry", label: "Angry", color: "#ef4444", emoji: "😠" },
  { id: "guilty", label: "Guilty", color: "#8b5cf6", emoji: "😔" },
  { id: "ashamed", label: "Ashamed", color: "#ec4899", emoji: "🫣" },
  { id: "frustrated", label: "Frustrated", color: "#f97316", emoji: "😤" },
  { id: "hopeless", label: "Hopeless", color: "#6b7280", emoji: "😞" },
  { id: "overwhelmed", label: "Overwhelmed", color: "#14b8a6", emoji: "🤯" },
  { id: "scared", label: "Scared", color: "#a855f7", emoji: "😨" },
  { id: "jealous", label: "Jealous", color: "#22c55e", emoji: "😒" },
  { id: "lonely", label: "Lonely", color: "#64748b", emoji: "🥺" },
  { id: "embarrassed", label: "Embarrassed", color: "#e11d48", emoji: "😳" },
];

interface Distortion {
  id: string;
  label: string;
  aka: string;
  description: string;
  example: string;
  color: string;
}

const DISTORTIONS: Distortion[] = [
  { id: "all-or-nothing", label: "All-or-Nothing", aka: "Black & White", description: "Seeing things in only two categories", example: '"If I\'m not perfect, I\'m a total failure."', color: "#1e293b" },
  { id: "catastrophizing", label: "Catastrophizing", aka: "Worst-Case Scenario", description: "Expecting the absolute worst outcome", example: '"I made one mistake — I\'m definitely getting fired."', color: "#dc2626" },
  { id: "mind-reading", label: "Mind Reading", aka: "Assumption Station", description: "Assuming you know what others think", example: '"They think I\'m stupid."', color: "#7c3aed" },
  { id: "personalization", label: "Personalization", aka: "It\'s All About Me", description: "Blaming yourself for things outside your control", example: '"My friend cancelled — it must be because of me."', color: "#2563eb" },
  { id: "overgeneralization", label: "Overgeneralization", aka: "Always & Never", description: "Drawing sweeping conclusions from one event", example: '"This always happens to me. Nothing ever works."', color: "#059669" },
  { id: "mental-filter", label: "Mental Filter", aka: "Negativity Magnet", description: "Focusing only on the negative details", example: '"I got 9 compliments and 1 critique — clearly I\'m bad at this."', color: "#0891b2" },
  { id: "emotional-reasoning", label: "Emotional Reasoning", aka: "Feelings = Facts", description: "Treating feelings as evidence of truth", example: '"I feel like a burden, so I must be one."', color: "#d97706" },
  { id: "should-statements", label: "Should Statements", aka: "The Rules", description: "Rigid rules about how things must be", example: '"I should be over this by now."', color: "#be185d" },
  { id: "labeling", label: "Labeling", aka: "Name-Calling", description: "Attaching a fixed label instead of describing behavior", example: '"I\'m such an idiot" instead of "I made a mistake."', color: "#4f46e5" },
  { id: "fortune-telling", label: "Fortune Telling", aka: "Crystal Ball", description: "Predicting a negative outcome without evidence", example: '"The interview will go terribly. I just know it."', color: "#9333ea" },
  { id: "discounting-positives", label: "Discounting Positives", aka: "Yeah But...", description: "Dismissing good things as flukes or irrelevant", example: '"They only said that to be nice."', color: "#16a34a" },
  { id: "magnification", label: "Magnification", aka: "The Telescope", description: "Blowing negatives up and shrinking positives down", example: '"That tiny mistake ruined everything."', color: "#ea580c" },
];

interface EmotionEntry {
  id: string;
  intensity: number;
}

interface EvidenceEntry {
  id: string;
  content: string;
  type: "for" | "against";
}

interface ThoughtRecord {
  situation: string;
  automaticThought: string;
  emotionsBefore: EmotionEntry[];
  beliefRatingBefore: number;
  distortions: string[];
  evidenceFor: EvidenceEntry[];
  evidenceAgainst: EvidenceEntry[];
  balancedThought: string;
  emotionsAfter: EmotionEntry[];
  beliefRatingAfter: number;
}

const EMPTY_RECORD: ThoughtRecord = {
  situation: "",
  automaticThought: "",
  emotionsBefore: [],
  beliefRatingBefore: 80,
  distortions: [],
  evidenceFor: [],
  evidenceAgainst: [],
  balancedThought: "",
  emotionsAfter: [],
  beliefRatingAfter: 80,
};

const EXAMPLE_RECORD: ThoughtRecord = {
  situation: "My boss walked past me in the hallway without saying hello.",
  automaticThought: "She's mad at me. I probably did something wrong in that report. I'm going to get fired.",
  emotionsBefore: [
    { id: "anxious", intensity: 85 },
    { id: "scared", intensity: 70 },
  ],
  beliefRatingBefore: 90,
  distortions: ["mind-reading", "catastrophizing", "fortune-telling"],
  evidenceFor: [
    { id: "e1", content: "She didn't say hello", type: "for" },
    { id: "e2", content: "She seemed rushed", type: "for" },
  ],
  evidenceAgainst: [
    { id: "e3", content: "She was on her phone — probably in the middle of something", type: "against" },
    { id: "e4", content: "She complimented my work last week", type: "against" },
    { id: "e5", content: "She doesn't always say hi to everyone — I've seen her do this with others", type: "against" },
    { id: "e6", content: "I have no actual evidence she's upset with me", type: "against" },
  ],
  balancedThought: "My boss was probably distracted or busy. One missed hello doesn't mean she's angry. My work has been solid and she said so recently.",
  emotionsAfter: [
    { id: "anxious", intensity: 30 },
  ],
  beliefRatingAfter: 20,
};

let nextId = 1;
function uid() {
  return `tb-${Date.now()}-${nextId++}`;
}

function StepIndicator({ currentStep, onStepClick }: { currentStep: number; onStepClick: (i: number) => void }) {
  return (
    <div className="flex items-center gap-1 sm:gap-1.5 py-3 overflow-x-auto scrollbar-hide" data-testid="step-indicator">
      {STEPS.map((step, i) => (
        <button
          key={step.id}
          onClick={() => i <= currentStep && onStepClick(i)}
          className={cn(
            "flex items-center gap-1.5 px-2 sm:px-2.5 py-2 sm:py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer shrink-0 min-w-[40px] min-h-[40px] justify-center",
            i === currentStep
              ? "bg-accent/15 text-accent border border-accent/20 shadow-sm"
              : i < currentStep
                ? "bg-primary/5 text-primary/70 hover:bg-primary/10"
                : "text-muted-foreground/40 cursor-default"
          )}
          disabled={i > currentStep}
          data-testid={`button-step-${step.id}`}
        >
          <span className="text-sm">{step.icon}</span>
          <span className="hidden md:inline">{step.label}</span>
        </button>
      ))}
    </div>
  );
}

function BeliefThermometer({ value, onChange, label, disabled }: { value: number; onChange: (v: number) => void; label: string; disabled?: boolean }) {
  const color = value > 70 ? "#ef4444" : value > 40 ? "#f59e0b" : "#22c55e";
  return (
    <div className="space-y-2" data-testid={`belief-thermometer-${label.toLowerCase().replace(/\s/g, "-")}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
        <span className="text-lg font-serif font-bold" style={{ color }}>{value}%</span>
      </div>
      <div className="relative h-3 bg-secondary/50 rounded-full overflow-hidden border border-border/30">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ backgroundColor: color }}
          animate={{ width: `${value}%` }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
        />
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-accent cursor-pointer"
        disabled={disabled}
        data-testid={`slider-belief-${label.toLowerCase().replace(/\s/g, "-")}`}
      />
    </div>
  );
}

function SituationStep({ record, onChange }: { record: ThoughtRecord; onChange: (r: ThoughtRecord) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-serif text-primary" data-testid="text-step-title">
          What happened?
        </h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
          Describe the situation briefly — just the facts, like a news reporter. Where were you? What triggered this thought?
        </p>
      </div>
      <GlassCard className="p-5 md:p-8" hoverEffect={false}>
        <textarea
          value={record.situation}
          onChange={(e) => onChange({ ...record, situation: e.target.value })}
          placeholder="e.g., My boss walked past me in the hallway without saying hello..."
          className="w-full min-h-[140px] bg-transparent border-none outline-none resize-none text-primary placeholder:text-muted-foreground/40 text-base leading-relaxed font-serif"
          data-testid="input-situation"
        />
      </GlassCard>
    </motion.div>
  );
}

function ThoughtStep({ record, onChange }: { record: ThoughtRecord; onChange: (r: ThoughtRecord) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-serif text-primary" data-testid="text-step-title">
          The Hot Thought
        </h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
          What was the first thought that popped into your head? The one that stung. Don't filter it — we're going to work with it, not judge it.
        </p>
      </div>
      <GlassCard className="p-5 md:p-8 relative" hoverEffect={false}>
        <div className="absolute -top-3 left-6 bg-card px-3 py-0.5 rounded-full border border-border/50">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Automatic Thought</span>
        </div>
        <textarea
          value={record.automaticThought}
          onChange={(e) => onChange({ ...record, automaticThought: e.target.value })}
          placeholder={`e.g., "She's mad at me. I probably did something wrong. I'm going to get fired."`}
          className="w-full min-h-[120px] bg-transparent border-none outline-none resize-none text-primary placeholder:text-muted-foreground/40 text-base leading-relaxed font-serif mt-2"
          data-testid="input-automatic-thought"
        />
      </GlassCard>
    </motion.div>
  );
}

function EmotionsStep({ record, onChange }: { record: ThoughtRecord; onChange: (r: ThoughtRecord) => void }) {
  const toggleEmotion = (emotionId: string) => {
    const exists = record.emotionsBefore.find((e) => e.id === emotionId);
    if (exists) {
      onChange({ ...record, emotionsBefore: record.emotionsBefore.filter((e) => e.id !== emotionId) });
    } else {
      onChange({ ...record, emotionsBefore: [...record.emotionsBefore, { id: emotionId, intensity: 50 }] });
    }
  };

  const setIntensity = (emotionId: string, intensity: number) => {
    onChange({
      ...record,
      emotionsBefore: record.emotionsBefore.map((e) => (e.id === emotionId ? { ...e, intensity } : e)),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-serif text-primary" data-testid="text-step-title">
          How does it feel?
        </h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
          Tap the emotions you're experiencing, then rate how intense each one feels. Also rate how much you believe the hot thought right now.
        </p>
      </div>

      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-2">
        {EMOTIONS_LIST.map((em) => {
          const selected = record.emotionsBefore.some((e) => e.id === em.id);
          return (
            <motion.button
              key={em.id}
              onClick={() => toggleEmotion(em.id)}
              className={cn(
                "p-3 rounded-xl border text-center transition-all cursor-pointer",
                selected
                  ? "border-accent/40 bg-accent/10 shadow-sm"
                  : "border-border/30 bg-card hover:border-accent/20 hover:bg-accent/5"
              )}
              whileTap={{ scale: 0.95 }}
              data-testid={`button-emotion-${em.id}`}
            >
              <span className="text-lg">{em.emoji}</span>
              <p className="text-xs font-medium mt-1 text-primary">{em.label}</p>
            </motion.button>
          );
        })}
      </div>

      {record.emotionsBefore.length > 0 && (
        <GlassCard className="p-5 space-y-4" hoverEffect={false}>
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Intensity</p>
          {record.emotionsBefore.map((entry) => {
            const em = EMOTIONS_LIST.find((e) => e.id === entry.id)!;
            return (
              <div key={entry.id} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-primary">{em.emoji} {em.label}</span>
                  <span className="text-sm font-serif font-bold" style={{ color: em.color }}>{entry.intensity}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={entry.intensity}
                  onChange={(e) => setIntensity(entry.id, Number(e.target.value))}
                  className="w-full accent-accent cursor-pointer"
                  data-testid={`slider-emotion-${entry.id}`}
                />
              </div>
            );
          })}
        </GlassCard>
      )}

      <GlassCard className="p-5" hoverEffect={false}>
        <BeliefThermometer
          value={record.beliefRatingBefore}
          onChange={(v) => onChange({ ...record, beliefRatingBefore: v })}
          label="How much do you believe the hot thought?"
        />
      </GlassCard>
    </motion.div>
  );
}

function DistortionsStep({ record, onChange }: { record: ThoughtRecord; onChange: (r: ThoughtRecord) => void }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleDistortion = (id: string) => {
    const has = record.distortions.includes(id);
    onChange({
      ...record,
      distortions: has ? record.distortions.filter((d) => d !== id) : [...record.distortions, id],
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-serif text-primary" data-testid="text-step-title">
          Thinking Traps
        </h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
          Our brains are pattern-matching machines — sometimes they match patterns that aren't there. Tap any traps your hot thought might have fallen into.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {DISTORTIONS.map((d) => {
          const selected = record.distortions.includes(d.id);
          const expanded = expandedId === d.id;
          return (
            <motion.div
              key={d.id}
              layout
              className={cn(
                "rounded-xl border overflow-hidden transition-all cursor-pointer",
                selected
                  ? "border-accent/40 bg-accent/8 shadow-sm"
                  : "border-border/30 bg-card hover:border-accent/20"
              )}
            >
              <div
                onClick={() => toggleDistortion(d.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleDistortion(d.id); } }}
                className="w-full p-3.5 flex items-start gap-3 text-left cursor-pointer"
                data-testid={`button-distortion-${d.id}`}
              >
                <div className={cn(
                  "w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                  selected ? "bg-accent border-accent" : "border-border/50"
                )}>
                  {selected && <Check size={12} className="text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-primary">{d.label}</span>
                    <span className="text-[10px] text-muted-foreground italic hidden sm:inline">({d.aka})</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{d.description}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setExpandedId(expanded ? null : d.id); }}
                  className="shrink-0 p-1 rounded-lg hover:bg-secondary/50 text-muted-foreground cursor-pointer"
                  data-testid={`button-distortion-help-${d.id}`}
                >
                  <HelpCircle size={14} />
                </button>
              </div>
              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-3.5 pt-0.5">
                      <div className="bg-secondary/30 rounded-lg p-3 border border-border/20">
                        <p className="text-xs italic text-muted-foreground">{d.example}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {record.distortions.length > 0 && (
        <div className="flex items-center justify-center gap-2 text-sm text-accent font-medium">
          <AlertTriangle size={14} />
          <span>{record.distortions.length} thinking trap{record.distortions.length !== 1 ? "s" : ""} identified</span>
        </div>
      )}
    </motion.div>
  );
}

function EvidenceStep({ record, onChange }: { record: ThoughtRecord; onChange: (r: ThoughtRecord) => void }) {
  const [newFor, setNewFor] = useState("");
  const [newAgainst, setNewAgainst] = useState("");

  const addEvidence = (type: "for" | "against") => {
    const content = type === "for" ? newFor.trim() : newAgainst.trim();
    if (!content) return;
    const entry: EvidenceEntry = { id: uid(), content, type };
    if (type === "for") {
      onChange({ ...record, evidenceFor: [...record.evidenceFor, entry] });
      setNewFor("");
    } else {
      onChange({ ...record, evidenceAgainst: [...record.evidenceAgainst, entry] });
      setNewAgainst("");
    }
  };

  const removeEvidence = (id: string, type: "for" | "against") => {
    if (type === "for") {
      onChange({ ...record, evidenceFor: record.evidenceFor.filter((e) => e.id !== id) });
    } else {
      onChange({ ...record, evidenceAgainst: record.evidenceAgainst.filter((e) => e.id !== id) });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-serif text-primary" data-testid="text-step-title">
          Weigh the Evidence
        </h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
          Time to put on your detective hat. What actual facts support the hot thought — and what facts challenge it?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassCard className="p-4 space-y-3" hoverEffect={false}>
          <div className="flex items-center gap-2 pb-2 border-b border-border/30">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <span className="text-sm font-semibold text-primary">Evidence For</span>
            <span className="text-[10px] text-muted-foreground">(supports the thought)</span>
          </div>
          <div className="space-y-2 min-h-[60px]">
            {record.evidenceFor.map((e) => (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2 bg-red-50/50 rounded-lg p-2.5 border border-red-100/50"
              >
                <p className="text-sm text-primary flex-1">{e.content}</p>
                <button
                  onClick={() => removeEvidence(e.id, "for")}
                  className="shrink-0 p-0.5 text-muted-foreground hover:text-red-500 cursor-pointer"
                  data-testid={`button-remove-evidence-${e.id}`}
                >
                  <X size={14} />
                </button>
              </motion.div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={newFor}
              onChange={(e) => setNewFor(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addEvidence("for")}
              placeholder="Add evidence..."
              className="flex-1 bg-secondary/30 rounded-lg px-3 py-2 text-sm outline-none border border-border/20 placeholder:text-muted-foreground/40"
              data-testid="input-evidence-for"
            />
            <button
              onClick={() => addEvidence("for")}
              className="p-2 rounded-lg bg-red-100/50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
              data-testid="button-add-evidence-for"
            >
              <Plus size={16} />
            </button>
          </div>
        </GlassCard>

        <GlassCard className="p-4 space-y-3" hoverEffect={false}>
          <div className="flex items-center gap-2 pb-2 border-b border-border/30">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-sm font-semibold text-primary">Evidence Against</span>
            <span className="text-[10px] text-muted-foreground">(challenges the thought)</span>
          </div>
          <div className="space-y-2 min-h-[60px]">
            {record.evidenceAgainst.map((e) => (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2 bg-emerald-50/50 rounded-lg p-2.5 border border-emerald-100/50"
              >
                <p className="text-sm text-primary flex-1">{e.content}</p>
                <button
                  onClick={() => removeEvidence(e.id, "against")}
                  className="shrink-0 p-0.5 text-muted-foreground hover:text-red-500 cursor-pointer"
                  data-testid={`button-remove-evidence-${e.id}`}
                >
                  <X size={14} />
                </button>
              </motion.div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={newAgainst}
              onChange={(e) => setNewAgainst(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addEvidence("against")}
              placeholder="Add evidence..."
              className="flex-1 bg-secondary/30 rounded-lg px-3 py-2 text-sm outline-none border border-border/20 placeholder:text-muted-foreground/40"
              data-testid="input-evidence-against"
            />
            <button
              onClick={() => addEvidence("against")}
              className="p-2 rounded-lg bg-emerald-100/50 text-emerald-600 hover:bg-emerald-100 transition-colors cursor-pointer"
              data-testid="button-add-evidence-against"
            >
              <Plus size={16} />
            </button>
          </div>
        </GlassCard>
      </div>

      {(record.evidenceFor.length > 0 || record.evidenceAgainst.length > 0) && (
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-3 bg-secondary/20 rounded-full px-5 py-2 border border-border/20">
            <Scale size={16} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {record.evidenceFor.length} for · {record.evidenceAgainst.length} against
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function ReframeStep({ record, onChange }: { record: ThoughtRecord; onChange: (r: ThoughtRecord) => void }) {
  const toggleEmotionAfter = (emotionId: string) => {
    const exists = record.emotionsAfter.find((e) => e.id === emotionId);
    if (exists) {
      onChange({ ...record, emotionsAfter: record.emotionsAfter.filter((e) => e.id !== emotionId) });
    } else {
      const before = record.emotionsBefore.find((e) => e.id === emotionId);
      onChange({ ...record, emotionsAfter: [...record.emotionsAfter, { id: emotionId, intensity: before ? Math.max(10, before.intensity - 30) : 30 }] });
    }
  };

  const setIntensityAfter = (emotionId: string, intensity: number) => {
    onChange({
      ...record,
      emotionsAfter: record.emotionsAfter.map((e) => (e.id === emotionId ? { ...e, intensity } : e)),
    });
  };

  const beforeEmotions = record.emotionsBefore.map((e) => EMOTIONS_LIST.find((em) => em.id === e.id)!);

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-serif text-primary" data-testid="text-step-title">
          Build the Bridge
        </h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
          Based on the evidence, write a more balanced version of the thought. It doesn't have to be positive — just more accurate.
        </p>
      </div>

      <GlassCard className="p-5 md:p-8 relative" hoverEffect={false}>
        <div className="absolute -top-3 left-6 bg-card px-3 py-0.5 rounded-full border border-accent/30">
          <span className="text-[10px] uppercase tracking-widest text-accent font-semibold flex items-center gap-1">
            <Lightbulb size={10} /> Balanced Thought
          </span>
        </div>
        <textarea
          value={record.balancedThought}
          onChange={(e) => onChange({ ...record, balancedThought: e.target.value })}
          placeholder="Write a more balanced, evidence-based version of the hot thought..."
          className="w-full min-h-[100px] bg-transparent border-none outline-none resize-none text-primary placeholder:text-muted-foreground/40 text-base leading-relaxed font-serif mt-2"
          data-testid="input-balanced-thought"
        />
      </GlassCard>

      <GlassCard className="p-5" hoverEffect={false}>
        <BeliefThermometer
          value={record.beliefRatingAfter}
          onChange={(v) => onChange({ ...record, beliefRatingAfter: v })}
          label="How much do you believe the hot thought NOW?"
        />
      </GlassCard>

      {record.emotionsBefore.length > 0 && (
        <GlassCard className="p-5 space-y-4" hoverEffect={false}>
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Re-rate your emotions</p>
          <p className="text-xs text-muted-foreground -mt-2">Tap the emotions you're still feeling and adjust their intensity.</p>
          <div className="flex flex-wrap gap-2">
            {beforeEmotions.map((em) => {
              if (!em) return null;
              const selected = record.emotionsAfter.some((e) => e.id === em.id);
              return (
                <button
                  key={em.id}
                  onClick={() => toggleEmotionAfter(em.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5",
                    selected ? "border-accent/40 bg-accent/10" : "border-border/30 bg-card"
                  )}
                  data-testid={`button-emotion-after-${em.id}`}
                >
                  <span>{em.emoji}</span> {em.label}
                </button>
              );
            })}
          </div>
          {record.emotionsAfter.length > 0 && (
            <div className="space-y-3 mt-2">
              {record.emotionsAfter.map((entry) => {
                const em = EMOTIONS_LIST.find((e) => e.id === entry.id)!;
                const before = record.emotionsBefore.find((e) => e.id === entry.id);
                return (
                  <div key={entry.id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-primary">{em.emoji} {em.label}</span>
                      <div className="flex items-center gap-2">
                        {before && (
                          <span className="text-xs text-muted-foreground line-through">{before.intensity}%</span>
                        )}
                        <span className="text-sm font-serif font-bold" style={{ color: em.color }}>{entry.intensity}%</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={entry.intensity}
                      onChange={(e) => setIntensityAfter(entry.id, Number(e.target.value))}
                      className="w-full accent-accent cursor-pointer"
                      data-testid={`slider-emotion-after-${entry.id}`}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>
      )}

      {record.balancedThought && record.beliefRatingBefore > 0 && (
        <GlassCard className="p-5 space-y-4" hoverEffect={false}>
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-accent" />
            <span className="text-xs uppercase tracking-widest text-accent font-semibold">The Shift</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center space-y-1">
              <p className="text-xs text-muted-foreground">Before</p>
              <p className="text-2xl font-serif font-bold text-red-400">{record.beliefRatingBefore}%</p>
            </div>
            <div className="text-center space-y-1">
              <p className="text-xs text-muted-foreground">After</p>
              <p className="text-2xl font-serif font-bold text-emerald-500">{record.beliefRatingAfter}%</p>
            </div>
          </div>
          {record.beliefRatingBefore - record.beliefRatingAfter > 0 && (
            <p className="text-center text-sm text-muted-foreground">
              Belief dropped <span className="font-bold text-accent">{record.beliefRatingBefore - record.beliefRatingAfter} points</span>. That's your brain updating its map.
            </p>
          )}
        </GlassCard>
      )}
    </motion.div>
  );
}

const DISTORTION_EMOJIS: Record<string, string> = {
  "all-or-nothing": "⚫",
  "catastrophizing": "🌋",
  "mind-reading": "🔮",
  "personalization": "🎯",
  "overgeneralization": "🔁",
  "mental-filter": "🧲",
  "emotional-reasoning": "💔",
  "should-statements": "📏",
  "labeling": "🏷️",
  "fortune-telling": "🔮",
  "discounting-positives": "🚫",
  "magnification": "🔭",
};

function CbtInfoPage({ onNext }: { onNext: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="text-center space-y-3">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-accent/10 flex items-center justify-center border border-accent/20">
          <Brain size={32} className="text-accent" />
        </div>
        <h2 className="text-2xl md:text-3xl font-serif text-primary" data-testid="text-info-title">
          Understanding CBT
        </h2>
        <p className="text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
          Cognitive Behavioral Therapy (CBT) helps you recognize and reshape unhelpful thought patterns. By examining your thoughts like a scientist, you can build healthier perspectives.
        </p>
      </div>

      <GlassCard className="p-4 sm:p-6 space-y-4 max-w-lg mx-auto" hoverEffect={false}>
        <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
          <Lightbulb size={16} className="text-accent" /> Why It Works
        </h3>
        <div className="space-y-3">
          {[
            { emoji: "💭", text: "Thoughts shape how we feel and behave — change the thought, shift the feeling" },
            { emoji: "⚡", text: "Automatic thoughts can be distorted — our brains take shortcuts that aren't always accurate" },
            { emoji: "⚖️", text: "Examining evidence helps build balanced perspectives — replacing assumptions with facts" },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="text-lg w-7 text-center shrink-0">{item.emoji}</span>
              <span className="text-sm text-muted-foreground leading-relaxed">{item.text}</span>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-4 sm:p-6 space-y-4 max-w-lg mx-auto" hoverEffect={false}>
        <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
          <Sparkles size={16} className="text-accent" /> Common Thinking Traps
        </h3>
        <div className="space-y-2.5">
          {DISTORTIONS.map((d) => (
            <div key={d.id} className="flex items-start gap-3">
              <span className="text-lg w-7 text-center shrink-0">{DISTORTION_EMOJIS[d.id] || "🧠"}</span>
              <div className="min-w-0">
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-sm font-semibold text-primary">{d.label}</span>
                  <span className="text-[10px] text-muted-foreground italic">({d.aka})</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{d.description}</p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      <div className="flex justify-center max-w-lg mx-auto px-4">
        <button
          onClick={onNext}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-accent text-white hover:bg-accent/90 text-sm font-medium shadow-lg shadow-accent/20 transition-all cursor-pointer flex items-center justify-center gap-2 min-h-[48px]"
          data-testid="button-info-next"
        >
          Let's Get Started
          <ChevronRight size={16} />
        </button>
      </div>
    </motion.div>
  );
}

function ExampleWalkthrough({ onDismiss, onLoadExample }: { onDismiss: () => void; onLoadExample: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="text-center space-y-3">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-accent/10 flex items-center justify-center border border-accent/20">
          <Brain size={32} className="text-accent" />
        </div>
        <h2 className="text-2xl md:text-3xl font-serif text-primary" data-testid="text-welcome-title">
          The Thought Bridge
        </h2>
        <p className="text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
          Your brain serves up thoughts like they're facts. This tool helps you slow down, examine the evidence, and build a bridge to a more balanced perspective.
        </p>
      </div>

      <GlassCard className="p-4 sm:p-6 space-y-4 max-w-lg mx-auto" hoverEffect={false}>
        <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
          <span className="text-base">🗺️</span> How it works
        </h3>
        <div className="space-y-3">
          {[
            { icon: "📍", text: "Describe the situation — just the facts" },
            { icon: "💭", text: "Capture the hot thought — the one that stung" },
            { icon: "🎭", text: "Name the emotions and rate their intensity" },
            { icon: "🪤", text: "Spot any thinking traps your brain fell into" },
            { icon: "⚖️", text: "Weigh the evidence — detective mode" },
            { icon: "🌉", text: "Build a balanced thought and see how things shift" },
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-lg w-7 text-center">{step.icon}</span>
              <span className="text-sm text-muted-foreground">{step.text}</span>
            </div>
          ))}
        </div>
      </GlassCard>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-lg mx-auto px-4">
        <button
          onClick={onLoadExample}
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-secondary/50 text-primary hover:bg-secondary/80 border border-border/30 text-sm font-medium transition-all cursor-pointer flex items-center justify-center gap-2 min-h-[48px]"
          data-testid="button-load-example"
        >
          <HelpCircle size={16} />
          See an Example First
        </button>
        <button
          onClick={onDismiss}
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-accent text-white hover:bg-accent/90 text-sm font-medium shadow-lg shadow-accent/20 transition-all cursor-pointer flex items-center justify-center gap-2 min-h-[48px]"
          data-testid="button-start-fresh"
        >
          <Sparkles size={16} />
          Start Fresh
        </button>
      </div>
    </motion.div>
  );
}

export function ThoughtBridge() {
  const [step, setStep] = useState(0);
  const [record, setRecord] = useState<ThoughtRecord>({ ...EMPTY_RECORD });
  const [screen, setScreen] = useState<"info" | "welcome" | "form">("info");
  const [isExample, setIsExample] = useState(false);

  const canAdvance = useMemo(() => {
    switch (STEPS[step]?.id) {
      case "situation": return record.situation.trim().length > 0;
      case "thought": return record.automaticThought.trim().length > 0;
      case "emotions": return record.emotionsBefore.length > 0;
      case "distortions": return true;
      case "evidence": return true;
      case "reframe": return record.balancedThought.trim().length > 0;
      default: return false;
    }
  }, [step, record]);

  const handleNext = useCallback(() => {
    if (step < STEPS.length - 1 && canAdvance) setStep(step + 1);
  }, [step, canAdvance]);

  const handleBack = useCallback(() => {
    if (step > 0) setStep(step - 1);
  }, [step]);

  const handleReset = useCallback(() => {
    setRecord({ ...EMPTY_RECORD });
    setStep(0);
    setScreen("welcome");
    setIsExample(false);
  }, []);

  const handleLoadExample = useCallback(() => {
    setRecord({ ...EXAMPLE_RECORD });
    setIsExample(true);
    setScreen("form");
    setStep(0);
  }, []);

  const handleStartFresh = useCallback(() => {
    setScreen("form");
    setIsExample(false);
  }, []);

  const handleInfoNext = useCallback(() => {
    setScreen("welcome");
  }, []);

  return (
    <div className="w-full h-full overflow-y-auto" data-testid="thought-bridge-tool">
      <div className="max-w-2xl mx-auto px-4 py-6 pb-32 md:pb-12">
        <AnimatePresence mode="wait">
          {screen === "info" ? (
            <CbtInfoPage key="info" onNext={handleInfoNext} />
          ) : screen === "welcome" ? (
            <ExampleWalkthrough
              key="welcome"
              onDismiss={handleStartFresh}
              onLoadExample={handleLoadExample}
            />
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <StepIndicator currentStep={step} onStepClick={setStep} />
                <button
                  onClick={handleReset}
                  className="p-2.5 rounded-xl text-muted-foreground hover:bg-secondary/50 hover:text-primary transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
                  title="Start over"
                  data-testid="button-reset"
                >
                  <RotateCcw size={16} />
                </button>
              </div>

              {isExample && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 bg-amber-50/80 border border-amber-200/50 rounded-xl px-4 py-2.5"
                >
                  <HelpCircle size={14} className="text-amber-600 shrink-0" />
                  <p className="text-xs text-amber-700">
                    This is a pre-filled example to show you how it works. <button onClick={() => { setRecord({ ...EMPTY_RECORD }); setIsExample(false); setStep(0); }} className="underline font-medium cursor-pointer">Start your own</button> when ready.
                  </p>
                </motion.div>
              )}

              <AnimatePresence mode="wait">
                {STEPS[step]?.id === "situation" && <SituationStep key="situation" record={record} onChange={setRecord} />}
                {STEPS[step]?.id === "thought" && <ThoughtStep key="thought" record={record} onChange={setRecord} />}
                {STEPS[step]?.id === "emotions" && <EmotionsStep key="emotions" record={record} onChange={setRecord} />}
                {STEPS[step]?.id === "distortions" && <DistortionsStep key="distortions" record={record} onChange={setRecord} />}
                {STEPS[step]?.id === "evidence" && <EvidenceStep key="evidence" record={record} onChange={setRecord} />}
                {STEPS[step]?.id === "reframe" && <ReframeStep key="reframe" record={record} onChange={setRecord} />}
              </AnimatePresence>

              <div className="flex items-center justify-between pt-4 pb-2">
                <button
                  onClick={handleBack}
                  disabled={step === 0}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer min-h-[44px]",
                    step === 0
                      ? "text-muted-foreground/30 cursor-default"
                      : "text-primary hover:bg-secondary/50"
                  )}
                  data-testid="button-back"
                >
                  <ChevronLeft size={16} />
                  Back
                </button>

                {step < STEPS.length - 1 ? (
                  <button
                    onClick={handleNext}
                    disabled={!canAdvance}
                    className={cn(
                      "flex items-center gap-1.5 px-5 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer min-h-[44px]",
                      canAdvance
                        ? "bg-accent text-white hover:bg-accent/90 shadow-lg shadow-accent/20"
                        : "bg-secondary/30 text-muted-foreground/40 cursor-default"
                    )}
                    data-testid="button-next"
                  >
                    Continue
                    <ChevronRight size={16} />
                  </button>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-accent font-medium min-h-[44px]">
                    <Check size={16} />
                    Complete
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
