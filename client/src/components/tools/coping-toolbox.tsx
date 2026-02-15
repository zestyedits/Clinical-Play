import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { COPING_STRATEGY_LIBRARY, COPING_CATEGORIES } from "@/lib/coping-strategies-data";
import { playClickSound } from "@/lib/audio-feedback";
import {
  Plus, X, Star, Pin, ChevronUp, ChevronDown, BookOpen, Sparkles,
  BarChart3, Shuffle, Play, Timer, Heart, Zap, Moon, Brain,
  AlertTriangle, TrendingUp, Award, CircleDot,
} from "lucide-react";
import { ClinicianToolbar, type ToolbarControl } from "./clinician-toolbar";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CopingStrategyData {
  id: string;
  name: string;
  description?: string;
  category: string;
  emoji?: string;
  isCustom: boolean;
  contextTags?: string[];
  difficulty?: string;
  effectiveness?: number;
  isPinned: boolean;
  usageCount: number;
  createdBy: string | null;
  createdAt: string | null;
}

export interface CopingToolboxProps {
  strategies: CopingStrategyData[];
  onAddStrategy: (
    name: string,
    description: string,
    category: string,
    emoji: string,
    isCustom?: boolean,
    difficulty?: string,
    isPinned?: boolean,
  ) => void;
  onUpdateStrategy: (strategyId: string, updates: any) => void;
  onRemoveStrategy: (strategyId: string) => void;
  onClear: () => void;
  isClinician: boolean;
  toolSettings?: Record<string, any>;
  onSettingsUpdate?: (updates: Record<string, any>) => void;
}

// --- Clinician Toolbar Settings ---

interface CopingToolboxSettings {
  showLibrary: boolean;
  allowCustom: boolean;
}

const DEFAULT_COPING_TOOLBOX_SETTINGS: CopingToolboxSettings = {
  showLibrary: true,
  allowCustom: true,
};

const COPING_TOOLBOX_TOOLBAR_CONTROLS: ToolbarControl[] = [
  {
    type: "toggle",
    key: "showLibrary",
    icon: BookOpen,
    label: "Library",
    activeColor: "sky",
  },
  {
    type: "toggle",
    key: "allowCustom",
    icon: Plus,
    label: "Custom",
    activeColor: "amber",
  },
];

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CATEGORY_COLORS: Record<string, string> = {
  sensory: "#3B82F6",
  physical: "#EF4444",
  social: "#22C55E",
  cognitive: "#F59E0B",
  creative: "#8B5CF6",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: "#22C55E",
  Medium: "#F59E0B",
  Hard: "#EF4444",
};

const EMOJI_OPTIONS = [
  "\u{1F4A7}", "\u{1F590}\uFE0F", "\u{1F338}", "\u{1F9F8}", "\u2615", "\u{1F3B5}",
  "\u{1F32C}\uFE0F", "\u{1F9D8}", "\u{1F6B6}", "\u{1F98B}", "\u{1FAE8}", "\u{1F9CE}",
  "\u{1F4F1}", "\u{1F48C}", "\u{1F43E}", "\u{1F6D1}", "\u{1F3B2}", "\u{1F917}",
  "\u{1F50D}", "\u2696\uFE0F", "\u2728", "\u{1F4AC}", "\u{1F4DD}", "\u2709\uFE0F",
  "\u270F\uFE0F", "\u{1F4D3}", "\u{1F3A7}", "\u{1F5BC}\uFE0F", "\u{1F483}", "\u{1F3FA}",
  "\u{1F31F}", "\u{1F308}", "\u{1F33F}", "\u{1F54A}\uFE0F", "\u{1F9E9}", "\u2764\uFE0F",
];

const MAX_PINS = 3;

// Context-aware quick filter buttons for the recommendation engine
const CONTEXT_FILTERS = [
  { label: "Feeling stressed?", icon: Zap, tags: ["tension", "anxiety", "calm", "regulation"], color: "#EF4444" },
  { label: "Can't sleep?", icon: Moon, tags: ["sleep", "calm", "tension", "mindfulness"], color: "#6366F1" },
  { label: "Feeling anxious?", icon: AlertTriangle, tags: ["anxiety", "panic", "grounding", "calm"], color: "#F59E0B" },
  { label: "Feeling sad?", icon: Heart, tags: ["sadness", "depression", "comfort", "connection"], color: "#3B82F6" },
  { label: "Need energy?", icon: TrendingUp, tags: ["energy", "fun", "expression", "restlessness"], color: "#22C55E" },
] as const;

// Timer durations for practice mode
const TIMER_OPTIONS = [
  { label: "1 min", seconds: 60 },
  { label: "3 min", seconds: 180 },
  { label: "5 min", seconds: 300 },
] as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CopingToolbox({
  strategies,
  onAddStrategy,
  onUpdateStrategy,
  onRemoveStrategy,
  onClear,
  isClinician,
  toolSettings,
  onSettingsUpdate,
}: CopingToolboxProps) {
  const settings = { ...DEFAULT_COPING_TOOLBOX_SETTINGS, ...toolSettings } as CopingToolboxSettings;
  const [activeCategory, setActiveCategory] = useState<string>("sensory");
  const [showLibrary, setShowLibrary] = useState(false);
  const [showCreator, setShowCreator] = useState(false);
  const [ratingStrategy, setRatingStrategy] = useState<string | null>(null);

  // Custom creator state
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCategory] = useState("sensory");
  const [newEmoji, setNewEmoji] = useState("\u{1F31F}");
  const [newDifficulty, setNewDifficulty] = useState<string>("Easy");

  // --- Enhancement state ---
  const [activeContextFilter, setActiveContextFilter] = useState<number | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [practiceStrategy, setPracticeStrategy] = useState<CopingStrategyData | null>(null);
  const [practiceTimerSeconds, setPracticeTimerSeconds] = useState<number | null>(null);
  const [practiceTimeRemaining, setPracticeTimeRemaining] = useState<number>(0);
  const [practiceTimerRunning, setPracticeTimerRunning] = useState(false);
  const [practicePhase, setPracticePhase] = useState<"intro" | "active" | "reflect">("intro");
  const [practiceReflectionRating, setPracticeReflectionRating] = useState<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ---------------------------------------------------------------------------
  // Derived data
  // ---------------------------------------------------------------------------

  const pinnedStrategies = useMemo(
    () => strategies.filter((s) => s.isPinned).slice(0, MAX_PINS),
    [strategies],
  );

  const categoryStrategies = useMemo(
    () => strategies.filter((s) => s.category === activeCategory),
    [strategies, activeCategory],
  );

  const addedIds = useMemo(
    () => new Set(strategies.map((s) => s.name)),
    [strategies],
  );

  const libraryForCategory = useMemo(
    () =>
      COPING_STRATEGY_LIBRARY.filter(
        (lib) => lib.category === activeCategory && !addedIds.has(lib.name),
      ),
    [activeCategory, addedIds],
  );

  const pinCount = pinnedStrategies.length;

  // Context filter: find matching strategy IDs
  const contextMatchIds = useMemo(() => {
    if (activeContextFilter === null) return new Set<string>();
    const filterTags = CONTEXT_FILTERS[activeContextFilter].tags;
    const ids = new Set<string>();
    strategies.forEach((s) => {
      // Also try matching from the library template
      const libMatch = COPING_STRATEGY_LIBRARY.find((lib) => lib.name === s.name);
      const tags = s.contextTags || libMatch?.contextTags || [];
      if (tags.some((t) => (filterTags as readonly string[]).includes(t))) {
        ids.add(s.id);
      }
    });
    return ids;
  }, [activeContextFilter, strategies]);

  // Analytics derived data
  const analytics = useMemo(() => {
    if (strategies.length < 3) return null;

    // Most used
    const mostUsed = [...strategies].sort((a, b) => b.usageCount - a.usageCount)[0];

    // Category distribution
    const catCounts: Record<string, number> = {};
    COPING_CATEGORIES.forEach((c) => { catCounts[c.id] = 0; });
    strategies.forEach((s) => { catCounts[s.category] = (catCounts[s.category] || 0) + 1; });
    const totalStrategies = strategies.length;

    // Coping flexibility score: how many different categories are represented, as percentage of all categories
    const usedCategories = Object.values(catCounts).filter((c) => c > 0).length;
    const flexibilityScore = Math.round((usedCategories / COPING_CATEGORIES.length) * 100);

    // Difficulty distribution
    const diffCounts: Record<string, number> = { Easy: 0, Medium: 0, Hard: 0 };
    strategies.forEach((s) => {
      const d = s.difficulty || "Easy";
      diffCounts[d] = (diffCounts[d] || 0) + 1;
    });

    return { mostUsed, catCounts, totalStrategies, flexibilityScore, diffCounts, usedCategories };
  }, [strategies]);

  // ---------------------------------------------------------------------------
  // Timer effect
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (practiceTimerRunning && practiceTimeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setPracticeTimeRemaining((prev) => {
          if (prev <= 1) {
            setPracticeTimerRunning(false);
            setPracticePhase("reflect");
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [practiceTimerRunning, practiceTimeRemaining]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleTabClick = useCallback((catId: string) => {
    playClickSound();
    setActiveCategory(catId);
  }, []);

  const handleAddFromLibrary = useCallback(
    (lib: typeof COPING_STRATEGY_LIBRARY[number]) => {
      playClickSound();
      onAddStrategy(lib.name, lib.description, lib.category, lib.emoji, false, lib.difficulty, false);
    },
    [onAddStrategy],
  );

  const handleCreateCustom = useCallback(() => {
    if (!newName.trim()) return;
    playClickSound();
    onAddStrategy(newName.trim(), newDescription.trim(), newCategory, newEmoji, true, newDifficulty, false);
    setNewName("");
    setNewDescription("");
    setNewCategory("sensory");
    setNewEmoji("\u{1F31F}");
    setNewDifficulty("Easy");
    setShowCreator(false);
  }, [newName, newDescription, newCategory, newEmoji, newDifficulty, onAddStrategy]);

  const handleTogglePin = useCallback(
    (strategy: CopingStrategyData) => {
      playClickSound();
      if (strategy.isPinned) {
        onUpdateStrategy(strategy.id, { isPinned: false });
      } else if (pinCount < MAX_PINS) {
        onUpdateStrategy(strategy.id, { isPinned: true });
      }
    },
    [onUpdateStrategy, pinCount],
  );

  const handleRate = useCallback(
    (strategyId: string, rating: number) => {
      playClickSound();
      onUpdateStrategy(strategyId, { effectiveness: rating });
      setTimeout(() => setRatingStrategy(null), 600);
    },
    [onUpdateStrategy],
  );

  const handleUse = useCallback(
    (strategy: CopingStrategyData) => {
      playClickSound();
      onUpdateStrategy(strategy.id, { usageCount: (strategy.usageCount || 0) + 1 });
    },
    [onUpdateStrategy],
  );

  const handleContextFilter = useCallback((index: number) => {
    playClickSound();
    setActiveContextFilter((prev) => (prev === index ? null : index));
  }, []);

  const handleTryRandom = useCallback(() => {
    playClickSound();
    if (strategies.length === 0) return;
    const random = strategies[Math.floor(Math.random() * strategies.length)];
    setActiveCategory(random.category);
    setRatingStrategy(random.id);
  }, [strategies]);

  const handleStartPractice = useCallback((strategy: CopingStrategyData) => {
    playClickSound();
    setPracticeStrategy(strategy);
    setPracticePhase("intro");
    setPracticeTimerSeconds(null);
    setPracticeTimeRemaining(0);
    setPracticeTimerRunning(false);
    setPracticeReflectionRating(0);
  }, []);

  const handlePracticeBegin = useCallback((seconds: number) => {
    playClickSound();
    setPracticeTimerSeconds(seconds);
    setPracticeTimeRemaining(seconds);
    setPracticeTimerRunning(true);
    setPracticePhase("active");
  }, []);

  const handlePracticeSkipTimer = useCallback(() => {
    playClickSound();
    setPracticeTimerRunning(false);
    setPracticeTimeRemaining(0);
    setPracticePhase("reflect");
  }, []);

  const handlePracticeFinish = useCallback(() => {
    playClickSound();
    if (practiceStrategy && practiceReflectionRating > 0) {
      onUpdateStrategy(practiceStrategy.id, { effectiveness: practiceReflectionRating });
    }
    if (practiceStrategy) {
      onUpdateStrategy(practiceStrategy.id, { usageCount: (practiceStrategy.usageCount || 0) + 1 });
    }
    setPracticeStrategy(null);
    setPracticePhase("intro");
    setPracticeTimerRunning(false);
  }, [practiceStrategy, practiceReflectionRating, onUpdateStrategy]);

  const handleEmergencyUse = useCallback(
    (strategy: CopingStrategyData) => {
      playClickSound();
      onUpdateStrategy(strategy.id, { usageCount: (strategy.usageCount || 0) + 1 });
    },
    [onUpdateStrategy],
  );

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------

  const renderStarRating = (strategy: CopingStrategyData) => {
    const current = strategy.effectiveness || 0;
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.button
            key={star}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleRate(strategy.id, star);
            }}
            whileTap={{ scale: 1.3 }}
            className="p-0 border-0 bg-transparent cursor-pointer"
          >
            <motion.div
              initial={false}
              animate={{
                scale: star <= current ? [1, 1.3, 1] : 1,
                color: star <= current ? "#F59E0B" : "#D1D5DB",
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <Star
                size={14}
                fill={star <= current ? "#F59E0B" : "none"}
                stroke={star <= current ? "#F59E0B" : "#D1D5DB"}
              />
            </motion.div>
          </motion.button>
        ))}
      </div>
    );
  };

  const renderDifficultyBadge = (difficulty?: string) => {
    if (!difficulty) return null;
    const color = DIFFICULTY_COLORS[difficulty] || "#94A3B8";
    return (
      <span
        className="text-[10px] font-medium px-1.5 py-0.5 rounded-full leading-none"
        style={{
          backgroundColor: `${color}18`,
          color: color,
          border: `1px solid ${color}30`,
        }}
      >
        {difficulty}
      </span>
    );
  };

  const renderStrategyCard = (strategy: CopingStrategyData, isPinnedSection = false) => {
    const catColor = CATEGORY_COLORS[strategy.category] || "#94A3B8";
    const isRating = ratingStrategy === strategy.id;
    const isContextMatch = activeContextFilter !== null && contextMatchIds.has(strategy.id);
    const isTopRated = (strategy.effectiveness || 0) >= 4;

    return (
      <motion.div
        key={strategy.id}
        layout
        initial={{ opacity: 0, scale: 0.9, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -8 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className={cn(
          "relative group rounded-2xl px-3 py-2.5 cursor-pointer select-none",
          "backdrop-blur-md border transition-all duration-200",
          isPinnedSection
            ? "bg-gradient-to-br from-amber-50/80 to-yellow-50/60 shadow-[0_0_12px_rgba(245,158,11,0.15)]"
            : "bg-white/50 hover:bg-white/70",
        )}
        style={{
          borderColor: isPinnedSection
            ? "rgba(245, 158, 11, 0.4)"
            : isContextMatch
            ? `${catColor}80`
            : `${catColor}25`,
          boxShadow: isPinnedSection
            ? "0 0 16px rgba(245, 158, 11, 0.12), 0 2px 8px rgba(0,0,0,0.04)"
            : isContextMatch
            ? `0 0 16px ${catColor}30, 0 2px 8px rgba(0,0,0,0.04)`
            : "0 2px 8px rgba(0,0,0,0.04)",
        }}
        onClick={() => {
          if (isRating) return;
          setRatingStrategy(strategy.id);
          handleUse(strategy);
        }}
      >
        {/* Top row: emoji + name + badges + pin + practice + remove */}
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-base leading-none flex-shrink-0">
            {strategy.emoji || "\u{1F9E9}"}
          </span>
          <span className="text-sm font-medium text-gray-800 truncate flex-1">
            {strategy.name}
          </span>

          {/* Top Rated badge */}
          {isTopRated && (
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none flex-shrink-0 bg-amber-50 text-amber-600 border border-amber-200"
            >
              Top Rated
            </span>
          )}

          {/* Usage badge */}
          {strategy.usageCount > 0 && (
            <span
              className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full leading-none flex-shrink-0"
              style={{
                backgroundColor: `${catColor}15`,
                color: catColor,
              }}
            >
              {strategy.usageCount}x
            </span>
          )}

          {/* Practice button */}
          <motion.button
            type="button"
            whileTap={{ scale: 1.2 }}
            onClick={(e) => {
              e.stopPropagation();
              handleStartPractice(strategy);
            }}
            className="p-0.5 rounded-full border-0 cursor-pointer flex-shrink-0 transition-colors text-gray-300 bg-transparent hover:text-green-500"
            title="Practice this strategy"
          >
            <Play size={13} />
          </motion.button>

          {/* Pin button */}
          <motion.button
            type="button"
            whileTap={{ scale: 1.2 }}
            onClick={(e) => {
              e.stopPropagation();
              handleTogglePin(strategy);
            }}
            className={cn(
              "p-0.5 rounded-full border-0 cursor-pointer flex-shrink-0 transition-colors",
              strategy.isPinned
                ? "text-amber-500 bg-amber-50"
                : "text-gray-300 bg-transparent hover:text-amber-400",
            )}
            title={strategy.isPinned ? "Unpin" : pinCount < MAX_PINS ? "Pin to Emergency Top 3" : "Max 3 pins"}
          >
            <Pin size={13} fill={strategy.isPinned ? "currentColor" : "none"} />
          </motion.button>

          {/* Remove */}
          <motion.button
            type="button"
            whileTap={{ scale: 1.2 }}
            onClick={(e) => {
              e.stopPropagation();
              playClickSound();
              onRemoveStrategy(strategy.id);
            }}
            className="p-0.5 rounded-full border-0 bg-transparent text-gray-300 hover:text-red-400 cursor-pointer flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X size={13} />
          </motion.button>
        </div>

        {/* Description (collapsed unless rating) */}
        <AnimatePresence>
          {strategy.description && isRating && (
            <motion.p
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="text-xs text-gray-500 mb-1.5 overflow-hidden leading-relaxed"
            >
              {strategy.description}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Bottom row: difficulty + rating */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            {renderDifficultyBadge(strategy.difficulty)}
            {strategy.isCustom && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full leading-none bg-purple-50 text-purple-400 border border-purple-100">
                Custom
              </span>
            )}
          </div>
          {renderStarRating(strategy)}
        </div>
      </motion.div>
    );
  };

  // ---------------------------------------------------------------------------
  // Analytics panel renderer
  // ---------------------------------------------------------------------------

  const renderAnalyticsPanel = () => {
    if (!analytics) return null;

    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="px-4 pb-2 flex-shrink-0"
      >
        <div
          className="rounded-xl p-3 border"
          style={{
            background: "linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(139,92,246,0.04) 100%)",
            borderColor: "rgba(99, 102, 241, 0.2)",
          }}
        >
          <div className="flex items-center gap-1.5 mb-2.5">
            <BarChart3 size={14} className="text-indigo-500" />
            <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">
              Usage Insights
            </span>
          </div>

          {/* Most used strategy */}
          {analytics.mostUsed && analytics.mostUsed.usageCount > 0 && (
            <div className="flex items-center gap-2 mb-2 bg-white/60 rounded-lg px-2.5 py-1.5">
              <Award size={13} className="text-amber-500 flex-shrink-0" />
              <span className="text-xs text-gray-600">
                Most used: <span className="font-semibold text-gray-800">{analytics.mostUsed.emoji} {analytics.mostUsed.name}</span>
                <span className="text-gray-400 ml-1">({analytics.mostUsed.usageCount}x)</span>
              </span>
            </div>
          )}

          {/* Category distribution - horizontal stacked bar */}
          <div className="mb-2">
            <span className="text-[10px] font-medium text-gray-500 mb-1 block">Category Distribution</span>
            <div className="flex h-3 rounded-full overflow-hidden bg-gray-100">
              {COPING_CATEGORIES.map((cat) => {
                const count = analytics.catCounts[cat.id] || 0;
                const pct = analytics.totalStrategies > 0 ? (count / analytics.totalStrategies) * 100 : 0;
                if (pct === 0) return null;
                return (
                  <div
                    key={cat.id}
                    title={`${cat.label}: ${count}`}
                    style={{
                      width: `${pct}%`,
                      backgroundColor: cat.color,
                      minWidth: count > 0 ? "4px" : 0,
                    }}
                    className="transition-all duration-300"
                  />
                );
              })}
            </div>
            <div className="flex gap-2 mt-1 flex-wrap">
              {COPING_CATEGORIES.map((cat) => {
                const count = analytics.catCounts[cat.id] || 0;
                if (count === 0) return null;
                return (
                  <span key={cat.id} className="text-[9px] flex items-center gap-0.5 text-gray-500">
                    <CircleDot size={8} style={{ color: cat.color }} />
                    {cat.label} ({count})
                  </span>
                );
              })}
            </div>
          </div>

          {/* Coping flexibility score */}
          <div className="flex items-center gap-2 mb-2 bg-white/60 rounded-lg px-2.5 py-1.5">
            <Brain size={13} className="text-purple-500 flex-shrink-0" />
            <span className="text-xs text-gray-600">
              Coping flexibility:{" "}
              <span className={cn(
                "font-semibold",
                analytics.flexibilityScore >= 80 ? "text-green-600" :
                analytics.flexibilityScore >= 60 ? "text-amber-600" : "text-red-500",
              )}>
                {analytics.flexibilityScore}%
              </span>
              <span className="text-gray-400 ml-1">({analytics.usedCategories}/{COPING_CATEGORIES.length} categories)</span>
            </span>
          </div>

          {/* Difficulty distribution */}
          <div>
            <span className="text-[10px] font-medium text-gray-500 mb-1 block">Difficulty Levels</span>
            <div className="flex gap-2">
              {(["Easy", "Medium", "Hard"] as const).map((diff) => {
                const count = analytics.diffCounts[diff] || 0;
                return (
                  <div
                    key={diff}
                    className="flex-1 text-center rounded-lg py-1 px-1.5"
                    style={{
                      backgroundColor: `${DIFFICULTY_COLORS[diff]}12`,
                      border: `1px solid ${DIFFICULTY_COLORS[diff]}25`,
                    }}
                  >
                    <div className="text-sm font-bold" style={{ color: DIFFICULTY_COLORS[diff] }}>{count}</div>
                    <div className="text-[9px] text-gray-500">{diff}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  // ---------------------------------------------------------------------------
  // Practice mode modal renderer
  // ---------------------------------------------------------------------------

  const renderPracticeModal = () => {
    if (!practiceStrategy) return null;

    const totalSeconds = practiceTimerSeconds || 60;
    const progress = totalSeconds > 0 ? ((totalSeconds - practiceTimeRemaining) / totalSeconds) : 0;
    const circumference = 2 * Math.PI * 45;
    const dashOffset = circumference * (1 - progress);
    const minutes = Math.floor(practiceTimeRemaining / 60);
    const secs = practiceTimeRemaining % 60;

    // Build step-by-step guidance from description
    const steps = practiceStrategy.description
      ? practiceStrategy.description.split(/[,.;]/).filter((s) => s.trim().length > 3).map((s) => s.trim())
      : ["Focus on this strategy", "Take your time", "Breathe and observe"];

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-50 flex items-center justify-center"
        style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
        onClick={() => {
          if (practicePhase === "active") return; // don't close while timer running
          setPracticeStrategy(null);
          setPracticeTimerRunning(false);
        }}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl w-[90%] max-w-sm mx-auto overflow-hidden"
        >
          {/* Header */}
          <div className="px-4 pt-4 pb-2 text-center border-b border-gray-100">
            <span className="text-3xl block mb-1">{practiceStrategy.emoji || "\u{1F9E9}"}</span>
            <h3 className="text-lg font-semibold text-gray-800">{practiceStrategy.name}</h3>
            {practiceStrategy.description && (
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{practiceStrategy.description}</p>
            )}
          </div>

          {/* Intro phase: choose timer */}
          {practicePhase === "intro" && (
            <div className="p-4">
              <p className="text-sm text-gray-600 mb-3 text-center font-medium">Step-by-step guidance:</p>
              <div className="flex flex-col gap-1.5 mb-4">
                {steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-2 bg-gray-50 rounded-lg px-3 py-2">
                    <span className="text-xs font-bold text-gray-400 mt-0.5">{i + 1}.</span>
                    <span className="text-xs text-gray-700 leading-relaxed">{step}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-600 mb-2 text-center font-medium">Choose a timer:</p>
              <div className="flex gap-2">
                {TIMER_OPTIONS.map((opt) => (
                  <motion.button
                    key={opt.seconds}
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePracticeBegin(opt.seconds)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 cursor-pointer transition-all"
                  >
                    <Timer size={14} className="inline mr-1" />
                    {opt.label}
                  </motion.button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  setPracticeStrategy(null);
                }}
                className="w-full mt-2 py-2 text-xs text-gray-400 hover:text-gray-600 bg-transparent border-0 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Active phase: countdown ring */}
          {practicePhase === "active" && (
            <div className="p-4 flex flex-col items-center">
              <div className="relative w-28 h-28 mb-3">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#E5E7EB" strokeWidth="6" />
                  <motion.circle
                    cx="50" cy="50" r="45"
                    fill="none"
                    stroke="#22C55E"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    animate={{ strokeDashoffset: dashOffset }}
                    transition={{ duration: 0.5, ease: "linear" }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-gray-700 tabular-nums">
                    {minutes}:{secs.toString().padStart(2, "0")}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-3">Practicing... breathe and focus</p>
              <button
                type="button"
                onClick={handlePracticeSkipTimer}
                className="text-xs text-gray-400 hover:text-gray-600 bg-transparent border-0 cursor-pointer underline"
              >
                Skip to reflection
              </button>
            </div>
          )}

          {/* Reflect phase */}
          {practicePhase === "reflect" && (
            <div className="p-4 text-center">
              <p className="text-sm font-semibold text-gray-700 mb-1">How did that go?</p>
              <p className="text-xs text-gray-400 mb-3">Rate the effectiveness of this practice</p>
              <div className="flex justify-center gap-1.5 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    type="button"
                    whileTap={{ scale: 1.3 }}
                    onClick={() => {
                      playClickSound();
                      setPracticeReflectionRating(star);
                    }}
                    className="p-1 border-0 bg-transparent cursor-pointer"
                  >
                    <Star
                      size={28}
                      fill={star <= practiceReflectionRating ? "#F59E0B" : "none"}
                      stroke={star <= practiceReflectionRating ? "#F59E0B" : "#D1D5DB"}
                      strokeWidth={1.5}
                    />
                  </motion.button>
                ))}
              </div>
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={handlePracticeFinish}
                className="w-full py-2.5 rounded-xl text-sm font-semibold border-0 cursor-pointer bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md hover:shadow-lg transition-all"
              >
                Done
              </motion.button>
            </div>
          )}
        </motion.div>
      </motion.div>
    );
  };

  // ---------------------------------------------------------------------------
  // Main render
  // ---------------------------------------------------------------------------

  return (
    <div
      className="w-full h-full flex flex-col relative overflow-hidden"
      data-testid="coping-toolbox-container"
      style={{
        background: "linear-gradient(145deg, #f8f6f3 0%, #f0ede8 50%, #e8e4dd 100%)",
      }}
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 25% 25%, rgba(139,92,246,0.3) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(59,130,246,0.2) 0%, transparent 50%)",
        }}
      />

      <div className="flex flex-col h-full relative z-10">
        {/* Header */}
        <motion.div
          className="text-center pt-4 pb-2 px-4 flex-shrink-0"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="font-serif text-2xl md:text-3xl text-gray-800 mb-0.5">
            Coping Toolbox
          </h2>
          <p className="text-sm text-gray-500">
            Your personal collection of coping strategies
          </p>
        </motion.div>

        {/* ============================================================== */}
        {/* Emergency Top 3 - Pinned strategies (My Go-To Strategies) */}
        {/* ============================================================== */}
        <AnimatePresence>
          {pinnedStrategies.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="px-4 pb-2 flex-shrink-0"
            >
              <div
                className="rounded-xl p-3 border"
                style={{
                  background: "linear-gradient(135deg, rgba(245,158,11,0.06) 0%, rgba(251,191,36,0.04) 100%)",
                  borderColor: "rgba(245, 158, 11, 0.25)",
                  boxShadow: "0 0 20px rgba(245, 158, 11, 0.08)",
                }}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Sparkles size={14} className="text-amber-500" />
                  <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                    My Go-To Strategies
                  </span>
                </div>
                <p className="text-[10px] text-amber-600/70 mb-2">In crisis? Try these first:</p>
                <div className="flex flex-col gap-2">
                  {pinnedStrategies.map((s) => (
                    <motion.div
                      key={`emergency-${s.id}`}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleEmergencyUse(s)}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 cursor-pointer border transition-all bg-gradient-to-br from-amber-50/80 to-yellow-50/60 hover:from-amber-50 hover:to-yellow-50"
                      style={{
                        borderColor: "rgba(245, 158, 11, 0.3)",
                        boxShadow: "0 0 12px rgba(245, 158, 11, 0.1), 0 2px 6px rgba(0,0,0,0.03)",
                      }}
                    >
                      <span className="text-2xl leading-none">{s.emoji || "\u{1F9E9}"}</span>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-semibold text-gray-800 block truncate">{s.name}</span>
                        {s.usageCount > 0 && (
                          <span className="text-[10px] text-amber-600">Used {s.usageCount}x</span>
                        )}
                      </div>
                      {(s.effectiveness || 0) >= 4 && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                          Top Rated
                        </span>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ============================================================== */}
        {/* Strategy Recommendation Engine - Context Filters */}
        {/* ============================================================== */}
        <div className="px-4 pb-2 flex-shrink-0">
          <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
            {CONTEXT_FILTERS.map((filter, idx) => {
              const isActive = activeContextFilter === idx;
              const FilterIcon = filter.icon;
              return (
                <motion.button
                  key={filter.label}
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleContextFilter(idx)}
                  className={cn(
                    "flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border cursor-pointer transition-all whitespace-nowrap flex-shrink-0",
                    isActive
                      ? "bg-white shadow-sm"
                      : "bg-white/30 border-transparent hover:bg-white/50",
                  )}
                  style={{
                    borderColor: isActive ? `${filter.color}50` : "transparent",
                    color: isActive ? filter.color : "#9CA3AF",
                  }}
                >
                  <FilterIcon size={12} />
                  {filter.label}
                </motion.button>
              );
            })}
            {/* Try something new button */}
            {strategies.length > 0 && (
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={handleTryRandom}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border border-transparent bg-white/30 hover:bg-white/50 text-gray-400 hover:text-purple-500 cursor-pointer transition-all whitespace-nowrap flex-shrink-0"
              >
                <Shuffle size={12} />
                Try something new
              </motion.button>
            )}
          </div>
        </div>

        {/* ============================================================== */}
        {/* Usage Analytics */}
        {/* ============================================================== */}
        {analytics && (
          <div className="px-4 pb-1 flex-shrink-0">
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                playClickSound();
                setShowAnalytics(!showAnalytics);
              }}
              className={cn(
                "w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-medium border cursor-pointer transition-all",
                showAnalytics
                  ? "bg-indigo-50 border-indigo-200 text-indigo-600"
                  : "bg-white/40 border-transparent text-gray-400 hover:bg-white/60 hover:text-indigo-500",
              )}
            >
              <BarChart3 size={12} />
              {showAnalytics ? "Hide Insights" : "View Insights"}
              <motion.span animate={{ rotate: showAnalytics ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronUp size={12} />
              </motion.span>
            </motion.button>
          </div>
        )}
        <AnimatePresence>
          {showAnalytics && analytics && renderAnalyticsPanel()}
        </AnimatePresence>

        {/* ============================================================== */}
        {/* Category tabs */}
        {/* ============================================================== */}
        <div className="flex gap-1 px-4 pb-2 flex-shrink-0 overflow-x-auto scrollbar-none">
          {COPING_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            const count = strategies.filter((s) => s.category === cat.id).length;
            return (
              <motion.button
                key={cat.id}
                type="button"
                onClick={() => handleTabClick(cat.id)}
                whileTap={{ scale: 0.96 }}
                className={cn(
                  "flex-1 min-w-0 flex flex-col items-center gap-0.5 py-2 px-2 rounded-xl border cursor-pointer transition-all duration-200",
                  "backdrop-blur-sm",
                  isActive
                    ? "bg-white/70 shadow-sm"
                    : "bg-white/30 hover:bg-white/50 border-transparent",
                )}
                style={{
                  borderColor: isActive ? `${cat.color}40` : "transparent",
                  borderTopWidth: "3px",
                  borderTopColor: isActive ? cat.color : `${cat.color}30`,
                }}
              >
                <span className="text-base leading-none">{cat.emoji}</span>
                <span
                  className={cn(
                    "text-[10px] font-semibold leading-none truncate w-full text-center",
                    isActive ? "text-gray-700" : "text-gray-400",
                  )}
                >
                  {cat.label}
                </span>
                {count > 0 && (
                  <span
                    className="text-[9px] font-bold rounded-full px-1.5 py-0 leading-relaxed"
                    style={{
                      backgroundColor: `${cat.color}15`,
                      color: cat.color,
                    }}
                  >
                    {count}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* ============================================================== */}
        {/* Active compartment - strategy cards */}
        {/* ============================================================== */}
        <div className="flex-1 overflow-y-auto px-4 pb-2 scrollbar-none">
          <AnimatePresence mode="popLayout">
            {categoryStrategies.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-10 text-center"
              >
                <span className="text-3xl mb-2 opacity-40">
                  {COPING_CATEGORIES.find((c) => c.id === activeCategory)?.emoji}
                </span>
                <p className="text-sm text-gray-400">
                  No strategies in{" "}
                  {COPING_CATEGORIES.find((c) => c.id === activeCategory)?.label || "this category"}{" "}
                  yet
                </p>
                <p className="text-xs text-gray-300 mt-1">
                  Tap the library below to browse and add
                </p>
              </motion.div>
            ) : (
              <div className="flex flex-col gap-2">
                {categoryStrategies.map((s) => renderStrategyCard(s))}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* ============================================================== */}
        {/* Bottom action bar */}
        {/* ============================================================== */}
        <div className="flex-shrink-0 px-4 pb-3 pt-1 flex gap-2">
          {/* Library toggle */}
          {settings.showLibrary && (
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                playClickSound();
                setShowLibrary(!showLibrary);
                setShowCreator(false);
              }}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border cursor-pointer transition-all text-sm font-medium",
                showLibrary
                  ? "bg-blue-50 border-blue-200 text-blue-600"
                  : "bg-white/60 border-gray-200 text-gray-600 hover:bg-white/80",
              )}
            >
              <BookOpen size={15} />
              Library
              <motion.span
                animate={{ rotate: showLibrary ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronUp size={14} />
              </motion.span>
            </motion.button>
          )}

          {/* Custom creator toggle */}
          {settings.allowCustom && (
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                playClickSound();
                setShowCreator(!showCreator);
                setShowLibrary(false);
              }}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border cursor-pointer transition-all text-sm font-medium",
                showCreator
                  ? "bg-purple-50 border-purple-200 text-purple-600"
                  : "bg-white/60 border-gray-200 text-gray-600 hover:bg-white/80",
              )}
            >
              <Plus size={15} />
              Create
            </motion.button>
          )}

          {/* Clinician clear moved to toolbar */}
        </div>

        {/* ============================================================== */}
        {/* Strategy Library Drawer */}
        {/* ============================================================== */}
        <AnimatePresence>
          {settings.showLibrary && showLibrary && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 z-20 rounded-t-2xl border-t border-gray-200 shadow-lg"
              style={{
                background: "linear-gradient(180deg, #ffffff 0%, #f8f6f3 100%)",
                maxHeight: "55%",
              }}
            >
              <div className="flex flex-col h-full">
                {/* Drawer handle */}
                <div className="flex justify-center pt-2 pb-1 flex-shrink-0">
                  <div className="w-10 h-1 rounded-full bg-gray-300" />
                </div>

                <div className="flex items-center justify-between px-4 pb-2 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <BookOpen size={16} className="text-blue-500" />
                    <span className="text-sm font-semibold text-gray-700">
                      Strategy Library
                    </span>
                    <span className="text-xs text-gray-400">
                      ({COPING_CATEGORIES.find((c) => c.id === activeCategory)?.label})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowLibrary(false)}
                    className="p-1 rounded-full bg-gray-100 text-gray-400 hover:text-gray-600 border-0 cursor-pointer"
                  >
                    <ChevronDown size={16} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-none">
                  {libraryForCategory.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-sm text-gray-400">
                        All strategies from this category have been added!
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {libraryForCategory.map((lib) => {
                        const catColor = CATEGORY_COLORS[lib.category] || "#94A3B8";
                        return (
                          <motion.button
                            key={lib.id}
                            type="button"
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleAddFromLibrary(lib)}
                            className="w-full text-left rounded-xl px-3 py-2.5 border bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all cursor-pointer"
                            style={{ borderColor: `${catColor}20` }}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-base leading-none">{lib.emoji}</span>
                              <span className="text-sm font-medium text-gray-700 flex-1">
                                {lib.name}
                              </span>
                              {renderDifficultyBadge(lib.difficulty)}
                              <Plus size={14} className="text-gray-300 flex-shrink-0" />
                            </div>
                            <p className="text-xs text-gray-400 leading-relaxed pl-7">
                              {lib.description}
                            </p>
                          </motion.button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ============================================================== */}
        {/* Custom Strategy Creator Drawer */}
        {/* ============================================================== */}
        <AnimatePresence>
          {settings.allowCustom && showCreator && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 z-20 rounded-t-2xl border-t border-gray-200 shadow-lg"
              style={{
                background: "linear-gradient(180deg, #ffffff 0%, #f8f6f3 100%)",
                maxHeight: "70%",
              }}
            >
              <div className="flex flex-col h-full">
                {/* Drawer handle */}
                <div className="flex justify-center pt-2 pb-1 flex-shrink-0">
                  <div className="w-10 h-1 rounded-full bg-gray-300" />
                </div>

                <div className="flex items-center justify-between px-4 pb-2 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <Plus size={16} className="text-purple-500" />
                    <span className="text-sm font-semibold text-gray-700">
                      Create Custom Strategy
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCreator(false)}
                    className="p-1 rounded-full bg-gray-100 text-gray-400 hover:text-gray-600 border-0 cursor-pointer"
                  >
                    <ChevronDown size={16} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-none">
                  <div className="flex flex-col gap-3">
                    {/* Name input */}
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">
                        Strategy Name
                      </label>
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="e.g. Deep Belly Breathing"
                        maxLength={50}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white/70 text-gray-700 placeholder:text-gray-300 focus:outline-none focus:border-purple-300 focus:ring-1 focus:ring-purple-200 transition-all"
                      />
                    </div>

                    {/* Description input */}
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">
                        Description
                      </label>
                      <textarea
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        placeholder="How to use this coping strategy..."
                        maxLength={200}
                        rows={2}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white/70 text-gray-700 placeholder:text-gray-300 focus:outline-none focus:border-purple-300 focus:ring-1 focus:ring-purple-200 transition-all resize-none"
                      />
                    </div>

                    {/* Category selector */}
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">
                        Category
                      </label>
                      <div className="flex gap-1.5 flex-wrap">
                        {COPING_CATEGORIES.map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setNewCategory(cat.id)}
                            className={cn(
                              "flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border cursor-pointer transition-all",
                              newCategory === cat.id
                                ? "bg-white shadow-sm"
                                : "bg-white/40 border-transparent hover:bg-white/60",
                            )}
                            style={{
                              borderColor: newCategory === cat.id ? `${cat.color}50` : "transparent",
                              color: newCategory === cat.id ? cat.color : "#9CA3AF",
                            }}
                          >
                            <span className="text-sm">{cat.emoji}</span>
                            {cat.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Emoji picker */}
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">
                        Emoji
                      </label>
                      <div className="flex gap-1 flex-wrap">
                        {EMOJI_OPTIONS.map((em) => (
                          <button
                            key={em}
                            type="button"
                            onClick={() => setNewEmoji(em)}
                            className={cn(
                              "w-8 h-8 flex items-center justify-center rounded-lg text-base border cursor-pointer transition-all",
                              newEmoji === em
                                ? "bg-purple-50 border-purple-200 shadow-sm"
                                : "bg-white/40 border-transparent hover:bg-white/60",
                            )}
                          >
                            {em}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Difficulty selector */}
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">
                        Difficulty
                      </label>
                      <div className="flex gap-2">
                        {(["Easy", "Medium", "Hard"] as const).map((diff) => (
                          <button
                            key={diff}
                            type="button"
                            onClick={() => setNewDifficulty(diff)}
                            className={cn(
                              "flex-1 py-1.5 rounded-lg text-xs font-medium border cursor-pointer transition-all",
                              newDifficulty === diff
                                ? "bg-white shadow-sm"
                                : "bg-white/40 border-transparent hover:bg-white/60",
                            )}
                            style={{
                              borderColor:
                                newDifficulty === diff
                                  ? `${DIFFICULTY_COLORS[diff]}50`
                                  : "transparent",
                              color:
                                newDifficulty === diff
                                  ? DIFFICULTY_COLORS[diff]
                                  : "#9CA3AF",
                            }}
                          >
                            {diff}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Submit button */}
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.97 }}
                      onClick={handleCreateCustom}
                      disabled={!newName.trim()}
                      className={cn(
                        "w-full py-2.5 rounded-xl text-sm font-semibold border-0 cursor-pointer transition-all",
                        newName.trim()
                          ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md hover:shadow-lg"
                          : "bg-gray-100 text-gray-300 cursor-not-allowed",
                      )}
                    >
                      Add to Toolbox
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isClinician && onSettingsUpdate && (
          <ClinicianToolbar
            controls={COPING_TOOLBOX_TOOLBAR_CONTROLS}
            settings={settings}
            onUpdate={onSettingsUpdate}
            onClear={onClear}
          />
        )}
      </div>

      {/* ============================================================== */}
      {/* Practice Mode Modal (overlays everything) */}
      {/* ============================================================== */}
      <AnimatePresence>
        {practiceStrategy && renderPracticeModal()}
      </AnimatePresence>
    </div>
  );
}
