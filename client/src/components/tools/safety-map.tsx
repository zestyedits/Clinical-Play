import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { playClickSound } from "@/lib/audio-feedback";
import {
  RotateCcw,
  Plus,
  X,
  Check,
  AlertTriangle,
  Heart,
  Users,
  Phone,
  Building2,
  Shield,
  Sparkles,
  Edit3,
  Trash2,
} from "lucide-react";

// ─── Data Interfaces ──────────────────────────────────────────────────────────

export interface SafetyPlanItemData {
  id: string;
  step: number; // 1-6
  content: string;
  contactName: string | null;
  contactPhone: string | null;
  contactRelationship: string | null;
  orderIndex: number;
  createdBy: string | null;
  createdAt: string;
}

export interface SafetyMapProps {
  items: SafetyPlanItemData[];
  onAddItem: (
    step: number,
    content: string,
    contactName: string | null,
    contactPhone: string | null,
    contactRelationship: string | null,
    orderIndex: number,
  ) => void;
  onUpdateItem: (itemId: string, fields: Partial<SafetyPlanItemData>) => void;
  onRemoveItem: (itemId: string) => void;
  onClear: () => void;
  isClinician: boolean;
}

// ─── Step Configuration ───────────────────────────────────────────────────────

interface StepConfig {
  number: number;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgGradient: string;
  borderColor: string;
  glowColor: string;
  textColor: string;
  hasContactFields: boolean;
  prompts: string[];
  examples: string[];
}

const STEP_CONFIGS: StepConfig[] = [
  {
    number: 1,
    title: "Warning Signs",
    description: "How do I know I'm starting to feel unsafe?",
    icon: AlertTriangle,
    color: "#EF4444",
    bgGradient: "from-red-500/15 via-red-400/10 to-red-500/5",
    borderColor: "border-red-400/30",
    glowColor: "shadow-red-500/20",
    textColor: "text-red-300",
    hasContactFields: false,
    prompts: [
      "What physical sensations do you notice?",
      "What thoughts start appearing?",
      "What behaviors change?",
    ],
    examples: [
      "Feeling tightness in my chest",
      "Thinking \"nobody cares about me\"",
      "Wanting to isolate from everyone",
      "Not being able to sleep",
      "Feeling a sense of hopelessness",
    ],
  },
  {
    number: 2,
    title: "Internal Coping Strategies",
    description: "Things I can do on my own to feel better",
    icon: Heart,
    color: "#F97316",
    bgGradient: "from-orange-500/15 via-orange-400/10 to-amber-500/5",
    borderColor: "border-orange-400/30",
    glowColor: "shadow-orange-500/20",
    textColor: "text-orange-300",
    hasContactFields: false,
    prompts: [
      "What helps you calm down on your own?",
      "What activities distract your mind?",
      "What grounds you in the present moment?",
    ],
    examples: [
      "Deep breathing exercises",
      "Going for a walk",
      "Listening to music",
      "Writing in my journal",
      "Taking a warm shower",
    ],
  },
  {
    number: 3,
    title: "People & Social Settings for Distraction",
    description: "People and places that help distract me",
    icon: Users,
    color: "#EAB308",
    bgGradient: "from-yellow-500/15 via-amber-400/10 to-yellow-500/5",
    borderColor: "border-yellow-400/30",
    glowColor: "shadow-yellow-500/20",
    textColor: "text-yellow-300",
    hasContactFields: false,
    prompts: [
      "Who can you spend time with to take your mind off things?",
      "What social settings feel safe and distracting?",
      "Where can you go to be around others?",
    ],
    examples: [
      "Visit my friend at the coffee shop",
      "Go to the library",
      "Call a family member to chat about their day",
      "Attend a group fitness class",
      "Walk through the park where people gather",
    ],
  },
  {
    number: 4,
    title: "People I Can Ask for Help",
    description: "People I can reach out to when I need support",
    icon: Phone,
    color: "#22C55E",
    bgGradient: "from-green-500/15 via-emerald-400/10 to-green-500/5",
    borderColor: "border-green-400/30",
    glowColor: "shadow-green-500/20",
    textColor: "text-green-300",
    hasContactFields: true,
    prompts: [
      "Who in your life can you talk to openly?",
      "Who would you feel comfortable calling in a crisis?",
      "Who has been supportive in the past?",
    ],
    examples: [
      "My best friend Sarah",
      "My sibling Alex",
      "My partner",
      "My sponsor from group",
    ],
  },
  {
    number: 5,
    title: "Professionals & Agencies",
    description: "Professional support I can contact",
    icon: Building2,
    color: "#3B82F6",
    bgGradient: "from-blue-500/15 via-blue-400/10 to-indigo-500/5",
    borderColor: "border-blue-400/30",
    glowColor: "shadow-blue-500/20",
    textColor: "text-blue-300",
    hasContactFields: true,
    prompts: [
      "Who is your therapist or counselor?",
      "What crisis lines do you know?",
      "What local resources are available?",
    ],
    examples: [
      "988 Suicide & Crisis Lifeline (call or text 988)",
      "Crisis Text Line (text HOME to 741741)",
      "My therapist Dr. Johnson",
      "Local emergency room",
    ],
  },
  {
    number: 6,
    title: "Making My Environment Safe",
    description: "Steps to make my space safer",
    icon: Shield,
    color: "#06B6D4",
    bgGradient: "from-cyan-500/15 via-teal-400/10 to-cyan-500/5",
    borderColor: "border-cyan-400/30",
    glowColor: "shadow-cyan-500/20",
    textColor: "text-cyan-300",
    hasContactFields: false,
    prompts: [
      "What can you remove from your environment?",
      "How can you limit access to harmful means?",
      "What physical changes would help you feel safer?",
    ],
    examples: [
      "Lock away medications with a trusted person",
      "Remove sharp objects from my room",
      "Ask someone to hold onto items for me",
      "Keep my space well-lit and organized",
      "Set up a calming corner with comforting items",
    ],
  },
];

// ─── Path SVG Component ───────────────────────────────────────────────────────

function ConnectingPath({ stepCount }: { stepCount: number }) {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none z-0 hidden md:block"
      viewBox="0 0 800 1800"
      preserveAspectRatio="none"
      fill="none"
    >
      <defs>
        <linearGradient id="pathGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EF4444" stopOpacity="0.4" />
          <stop offset="20%" stopColor="#F97316" stopOpacity="0.4" />
          <stop offset="40%" stopColor="#EAB308" stopOpacity="0.4" />
          <stop offset="60%" stopColor="#22C55E" stopOpacity="0.4" />
          <stop offset="80%" stopColor="#3B82F6" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      <motion.path
        d="M 400 50 C 250 150, 550 250, 400 350 C 250 450, 550 550, 400 650 C 250 750, 550 850, 400 950 C 250 1050, 550 1150, 400 1250 C 250 1350, 550 1450, 400 1550"
        stroke="url(#pathGradient)"
        strokeWidth="3"
        strokeDasharray="12 6"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 2.5, ease: "easeInOut" }}
      />
      {/* Waypoint dots along the path */}
      {[50, 350, 650, 950, 1250, 1550].slice(0, stepCount).map((y, i) => (
        <motion.circle
          key={i}
          cx={400}
          cy={y}
          r="8"
          fill={STEP_CONFIGS[i].color}
          opacity={0.6}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 + i * 0.15, type: "spring" }}
        />
      ))}
    </svg>
  );
}

// ─── Completion Celebration ───────────────────────────────────────────────────

function CompletionCelebration() {
  const particles = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.8,
        duration: 1.5 + Math.random() * 1.5,
        size: 4 + Math.random() * 8,
        color: STEP_CONFIGS[i % 6].color,
      })),
    [],
  );

  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl p-6 mb-6 text-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
    >
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-blue-500/15 to-emerald-500/20 rounded-2xl" />
      <div className="absolute inset-0 backdrop-blur-xl rounded-2xl" />
      <div className="absolute inset-[1px] rounded-2xl bg-white/[0.03]" />

      {/* Floating particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            left: `${p.x}%`,
            bottom: "-10px",
          }}
          animate={{
            y: [0, -300 - Math.random() * 200],
            opacity: [0.8, 0],
            scale: [1, 0.3],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            repeatDelay: 1,
          }}
        />
      ))}

      <div className="relative z-10">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Sparkles className="w-10 h-10 text-cyan-400 mx-auto mb-3" />
        </motion.div>
        <h3 className="text-xl font-bold text-white mb-2">
          Safety Plan Complete
        </h3>
        <p className="text-white/70 text-sm max-w-md mx-auto">
          You have filled out all 6 steps of your safety plan. This is a
          powerful tool you can return to anytime. Remember, reaching out for
          help is a sign of strength.
        </p>
      </div>
    </motion.div>
  );
}

// ─── Progress Indicator ───────────────────────────────────────────────────────

function ProgressBar({ completedSteps }: { completedSteps: number }) {
  const percentage = (completedSteps / 6) * 100;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-white/50 uppercase tracking-wider">
          Safety Plan Progress
        </span>
        <span className="text-xs font-semibold text-white/70">
          {completedSteps}/6 steps
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-white/[0.07] overflow-hidden backdrop-blur-sm">
        <motion.div
          className="h-full rounded-full"
          style={{
            background:
              "linear-gradient(90deg, #EF4444, #F97316, #EAB308, #22C55E, #3B82F6, #06B6D4)",
          }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
      <div className="flex justify-between mt-1.5">
        {STEP_CONFIGS.map((step) => {
          const isComplete = completedSteps >= step.number;
          return (
            <motion.div
              key={step.number}
              className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold transition-colors duration-300",
                isComplete
                  ? "text-white"
                  : "bg-white/[0.07] text-white/30",
              )}
              style={isComplete ? { backgroundColor: step.color } : {}}
              animate={isComplete ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              {isComplete ? (
                <Check className="w-3 h-3" />
              ) : (
                step.number
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Item Display / Edit Row ──────────────────────────────────────────────────

interface ItemRowProps {
  item: SafetyPlanItemData;
  stepConfig: StepConfig;
  onUpdate: (itemId: string, fields: Partial<SafetyPlanItemData>) => void;
  onRemove: (itemId: string) => void;
}

function ItemRow({ item, stepConfig, onUpdate, onRemove }: ItemRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(item.content);
  const [editContactName, setEditContactName] = useState(item.contactName ?? "");
  const [editContactPhone, setEditContactPhone] = useState(item.contactPhone ?? "");
  const [editContactRelationship, setEditContactRelationship] = useState(
    item.contactRelationship ?? "",
  );

  const handleSave = useCallback(() => {
    const fields: Partial<SafetyPlanItemData> = { content: editContent };
    if (stepConfig.hasContactFields) {
      fields.contactName = editContactName || null;
      fields.contactPhone = editContactPhone || null;
      fields.contactRelationship = editContactRelationship || null;
    }
    onUpdate(item.id, fields);
    setIsEditing(false);
    playClickSound();
  }, [
    editContent,
    editContactName,
    editContactPhone,
    editContactRelationship,
    stepConfig.hasContactFields,
    onUpdate,
    item.id,
  ]);

  const handleCancel = useCallback(() => {
    setEditContent(item.content);
    setEditContactName(item.contactName ?? "");
    setEditContactPhone(item.contactPhone ?? "");
    setEditContactRelationship(item.contactRelationship ?? "");
    setIsEditing(false);
  }, [item]);

  const handleRemove = useCallback(() => {
    playClickSound();
    onRemove(item.id);
  }, [onRemove, item.id]);

  if (isEditing) {
    return (
      <motion.div
        layout
        className="rounded-xl p-3 bg-white/[0.05] border border-white/[0.08]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <input
          type="text"
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          className="w-full bg-white/[0.07] border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 mb-2"
          placeholder="Description..."
          autoFocus
        />
        {stepConfig.hasContactFields && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
            <input
              type="text"
              value={editContactName}
              onChange={(e) => setEditContactName(e.target.value)}
              className="bg-white/[0.07] border border-white/[0.1] rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-white/20"
              placeholder="Contact name"
            />
            <input
              type="tel"
              value={editContactPhone}
              onChange={(e) => setEditContactPhone(e.target.value)}
              className="bg-white/[0.07] border border-white/[0.1] rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-white/20"
              placeholder="Phone number"
            />
            <input
              type="text"
              value={editContactRelationship}
              onChange={(e) => setEditContactRelationship(e.target.value)}
              className="bg-white/[0.07] border border-white/[0.1] rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-white/20"
              placeholder="Relationship"
            />
          </div>
        )}
        <div className="flex gap-2 justify-end">
          <button
            onClick={handleCancel}
            className="px-3 py-1 rounded-lg text-xs text-white/50 hover:text-white/80 hover:bg-white/[0.05] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!editContent.trim()}
            className="px-3 py-1 rounded-lg text-xs text-white font-medium bg-white/[0.1] hover:bg-white/[0.15] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Save
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      className="group rounded-xl p-3 bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-colors"
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12, height: 0, marginTop: 0, padding: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white/90 leading-relaxed">{item.content}</p>
          {stepConfig.hasContactFields && (item.contactName || item.contactPhone) && (
            <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
              {item.contactName && (
                <span className="text-xs text-white/50">
                  <span className="text-white/30">Name:</span> {item.contactName}
                </span>
              )}
              {item.contactPhone && (
                <span className="text-xs text-white/50">
                  <span className="text-white/30">Phone:</span> {item.contactPhone}
                </span>
              )}
              {item.contactRelationship && (
                <span className="text-xs text-white/50">
                  <span className="text-white/30">Relationship:</span>{" "}
                  {item.contactRelationship}
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={() => {
              setIsEditing(true);
              playClickSound();
            }}
            className="p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/[0.08] transition-colors"
            aria-label="Edit item"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleRemove}
            className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            aria-label="Remove item"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Step Card ────────────────────────────────────────────────────────────────

interface StepCardProps {
  config: StepConfig;
  items: SafetyPlanItemData[];
  onAddItem: SafetyMapProps["onAddItem"];
  onUpdateItem: SafetyMapProps["onUpdateItem"];
  onRemoveItem: SafetyMapProps["onRemoveItem"];
  isExpanded: boolean;
  onToggleExpand: () => void;
  index: number;
}

function StepCard({
  config,
  items,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
  isExpanded,
  onToggleExpand,
  index,
}: StepCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [newContactName, setNewContactName] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");
  const [newContactRelationship, setNewContactRelationship] = useState("");
  const [promptIndex, setPromptIndex] = useState(0);

  const Icon = config.icon;
  const isComplete = items.length > 0;
  const sortedItems = useMemo(
    () => [...items].sort((a, b) => a.orderIndex - b.orderIndex),
    [items],
  );

  const currentPrompt = config.prompts[promptIndex % config.prompts.length];

  const handleAdd = useCallback(() => {
    if (!newContent.trim()) return;
    const nextOrder =
      items.length > 0
        ? Math.max(...items.map((i) => i.orderIndex)) + 1
        : 0;
    onAddItem(
      config.number,
      newContent.trim(),
      config.hasContactFields ? newContactName.trim() || null : null,
      config.hasContactFields ? newContactPhone.trim() || null : null,
      config.hasContactFields ? newContactRelationship.trim() || null : null,
      nextOrder,
    );
    setNewContent("");
    setNewContactName("");
    setNewContactPhone("");
    setNewContactRelationship("");
    setIsAdding(false);
    setPromptIndex((p) => p + 1);
    playClickSound();
  }, [
    newContent,
    newContactName,
    newContactPhone,
    newContactRelationship,
    items,
    onAddItem,
    config,
  ]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleAdd();
      }
      if (e.key === "Escape") {
        setIsAdding(false);
        setNewContent("");
        setNewContactName("");
        setNewContactPhone("");
        setNewContactRelationship("");
      }
    },
    [handleAdd],
  );

  return (
    <motion.div
      layout
      className="relative"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4, ease: "easeOut" }}
    >
      {/* Card */}
      <div
        className={cn(
          "relative rounded-2xl overflow-hidden transition-shadow duration-300",
          isExpanded && `shadow-lg ${config.glowColor}`,
        )}
      >
        {/* Glass background */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br",
            config.bgGradient,
          )}
        />
        <div className="absolute inset-0 backdrop-blur-xl" />
        <div
          className={cn(
            "absolute inset-[1px] rounded-2xl bg-white/[0.02] border",
            config.borderColor,
          )}
        />

        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <button
            onClick={() => {
              onToggleExpand();
              playClickSound();
            }}
            className="w-full flex items-center gap-4 p-4 sm:p-5 text-left group/header"
          >
            {/* Step number badge */}
            <div className="relative shrink-0">
              <motion.div
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${config.color}30, ${config.color}15)`,
                  border: `1px solid ${config.color}40`,
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon
                  className="w-6 h-6 sm:w-7 sm:h-7"
                />
              </motion.div>
              {/* Completion indicator */}
              {isComplete && (
                <motion.div
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: config.color }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500 }}
                >
                  <Check className="w-3 h-3 text-white" />
                </motion.div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span
                  className="text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: config.color }}
                >
                  Step {config.number}
                </span>
                {items.length > 0 && (
                  <span className="text-[10px] text-white/30 bg-white/[0.06] px-1.5 py-0.5 rounded-full">
                    {items.length} {items.length === 1 ? "item" : "items"}
                  </span>
                )}
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-white/90 truncate">
                {config.title}
              </h3>
              <p className="text-xs text-white/40 mt-0.5 truncate">
                {config.description}
              </p>
            </div>

            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="shrink-0"
            >
              <svg
                className="w-5 h-5 text-white/30 group-hover/header:text-white/50 transition-colors"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </motion.div>
          </button>

          {/* Expandable body */}
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="px-4 sm:px-5 pb-4 sm:pb-5 space-y-3">
                  {/* Prompt hint */}
                  <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-3">
                    <p className="text-xs text-white/50 italic">
                      {currentPrompt}
                    </p>
                    {config.examples.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {config.examples.slice(0, 3).map((example, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              setNewContent(example);
                              setIsAdding(true);
                              playClickSound();
                            }}
                            className="text-[10px] px-2 py-1 rounded-full bg-white/[0.06] text-white/40 hover:text-white/70 hover:bg-white/[0.1] transition-colors truncate max-w-[200px]"
                          >
                            {example}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Items list */}
                  <AnimatePresence mode="popLayout">
                    {sortedItems.map((item) => (
                      <ItemRow
                        key={item.id}
                        item={item}
                        stepConfig={config}
                        onUpdate={onUpdateItem}
                        onRemove={onRemoveItem}
                      />
                    ))}
                  </AnimatePresence>

                  {/* Add form */}
                  <AnimatePresence>
                    {isAdding ? (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="rounded-xl p-3 bg-white/[0.05] border border-white/[0.1]"
                      >
                        <input
                          type="text"
                          value={newContent}
                          onChange={(e) => setNewContent(e.target.value)}
                          onKeyDown={handleKeyDown}
                          className="w-full bg-white/[0.07] border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-white/20"
                          placeholder={`Add to "${config.title}"...`}
                          autoFocus
                        />
                        {config.hasContactFields && (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                            <input
                              type="text"
                              value={newContactName}
                              onChange={(e) => setNewContactName(e.target.value)}
                              onKeyDown={handleKeyDown}
                              className="bg-white/[0.07] border border-white/[0.1] rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-white/20"
                              placeholder="Contact name"
                            />
                            <input
                              type="tel"
                              value={newContactPhone}
                              onChange={(e) => setNewContactPhone(e.target.value)}
                              onKeyDown={handleKeyDown}
                              className="bg-white/[0.07] border border-white/[0.1] rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-white/20"
                              placeholder="Phone number"
                            />
                            <input
                              type="text"
                              value={newContactRelationship}
                              onChange={(e) =>
                                setNewContactRelationship(e.target.value)
                              }
                              onKeyDown={handleKeyDown}
                              className="bg-white/[0.07] border border-white/[0.1] rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-white/20"
                              placeholder="Relationship (e.g. friend, sibling)"
                            />
                          </div>
                        )}
                        <div className="flex gap-2 justify-end mt-2">
                          <button
                            onClick={() => {
                              setIsAdding(false);
                              setNewContent("");
                              setNewContactName("");
                              setNewContactPhone("");
                              setNewContactRelationship("");
                            }}
                            className="px-3 py-1.5 rounded-lg text-xs text-white/50 hover:text-white/80 hover:bg-white/[0.05] transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleAdd}
                            disabled={!newContent.trim()}
                            className="px-3 py-1.5 rounded-lg text-xs text-white font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            style={{
                              backgroundColor: `${config.color}25`,
                              borderColor: `${config.color}40`,
                            }}
                          >
                            <span className="flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              Add
                            </span>
                          </button>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={() => {
                          setIsAdding(true);
                          playClickSound();
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-white/[0.1] text-white/40 hover:text-white/60 hover:border-white/[0.2] hover:bg-white/[0.03] transition-colors text-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add item
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function SafetyMap({
  items,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
  onClear,
  isClinician,
}: SafetyMapProps) {
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(
    () => new Set([1]),
  );
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Group items by step
  const itemsByStep = useMemo(() => {
    const grouped: Record<number, SafetyPlanItemData[]> = {
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
    };
    for (const item of items) {
      if (grouped[item.step]) {
        grouped[item.step].push(item);
      }
    }
    return grouped;
  }, [items]);

  // Count completed steps
  const completedSteps = useMemo(() => {
    let count = 0;
    for (let s = 1; s <= 6; s++) {
      if (itemsByStep[s] && itemsByStep[s].length > 0) count++;
    }
    return count;
  }, [itemsByStep]);

  const allComplete = completedSteps === 6;

  const toggleExpand = useCallback((stepNumber: number) => {
    setExpandedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepNumber)) {
        next.delete(stepNumber);
      } else {
        next.add(stepNumber);
      }
      return next;
    });
  }, []);

  const handleClear = useCallback(() => {
    onClear();
    setShowClearConfirm(false);
    setExpandedSteps(new Set([1]));
    playClickSound();
  }, [onClear]);

  return (
    <div className="relative w-full max-w-4xl mx-auto px-2 sm:px-0">
      {/* Header */}
      <motion.div
        className="text-center mb-6"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="inline-flex items-center gap-2 mb-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-cyan-400" />
            </div>
            <motion.div
              className="absolute inset-0 rounded-xl border border-cyan-400/30"
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white/90">
            My Safety Plan
          </h2>
        </div>
        <p className="text-xs text-white/40 max-w-lg mx-auto leading-relaxed">
          Based on the Stanley-Brown Safety Planning framework. Work through each
          step from recognizing warning signs to creating a safe environment.
          This plan is yours to use whenever you need it.
        </p>
      </motion.div>

      {/* Progress bar */}
      <ProgressBar completedSteps={completedSteps} />

      {/* Completion celebration */}
      <AnimatePresence>{allComplete && <CompletionCelebration />}</AnimatePresence>

      {/* Map container */}
      <div className="relative">
        {/* SVG connecting path (visible on md+) */}
        <ConnectingPath stepCount={6} />

        {/* Step cards grid */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4">
          {STEP_CONFIGS.map((config, i) => (
            <StepCard
              key={config.number}
              config={config}
              items={itemsByStep[config.number] || []}
              onAddItem={onAddItem}
              onUpdateItem={onUpdateItem}
              onRemoveItem={onRemoveItem}
              isExpanded={expandedSteps.has(config.number)}
              onToggleExpand={() => toggleExpand(config.number)}
              index={i}
            />
          ))}
        </div>
      </div>

      {/* Emergency reminder */}
      <motion.div
        className="mt-6 rounded-2xl overflow-hidden relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-red-400/5 to-red-500/10" />
        <div className="absolute inset-0 backdrop-blur-xl" />
        <div className="absolute inset-[1px] rounded-2xl bg-white/[0.02] border border-red-400/20" />
        <div className="relative z-10 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-400/30 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-red-300 mb-0.5">
              In Immediate Danger?
            </p>
            <p className="text-[11px] text-white/50 leading-relaxed">
              Call <span className="text-white/80 font-medium">911</span> or go to
              your nearest emergency room. You can also reach the{" "}
              <span className="text-white/80 font-medium">
                988 Suicide & Crisis Lifeline
              </span>{" "}
              by calling or texting <span className="text-white/80 font-medium">988</span>.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Clinician clear button */}
      {isClinician && items.length > 0 && (
        <motion.div
          className="mt-4 flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <AnimatePresence mode="wait">
            {showClearConfirm ? (
              <motion.div
                key="confirm"
                className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-400/20 px-4 py-2.5"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <span className="text-xs text-red-300">
                  Clear entire safety plan?
                </span>
                <button
                  onClick={handleClear}
                  className="px-3 py-1 rounded-lg bg-red-500/20 border border-red-400/30 text-xs text-red-300 hover:bg-red-500/30 transition-colors font-medium"
                >
                  Yes, clear all
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-3 py-1 rounded-lg bg-white/[0.05] text-xs text-white/50 hover:text-white/70 transition-colors"
                >
                  Cancel
                </button>
              </motion.div>
            ) : (
              <motion.button
                key="trigger"
                onClick={() => {
                  setShowClearConfirm(true);
                  playClickSound();
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs text-white/30 hover:text-white/50 hover:bg-white/[0.04] border border-transparent hover:border-white/[0.08] transition-all"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Clear Safety Plan
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Bottom spacing */}
      <div className="h-8" />
    </div>
  );
}
