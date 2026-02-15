import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { COPING_STRATEGY_LIBRARY, COPING_CATEGORIES } from "@/lib/coping-strategies-data";
import { playClickSound } from "@/lib/audio-feedback";
import { RotateCcw, Plus, X, Star, Pin, ChevronUp, ChevronDown, BookOpen, Sparkles } from "lucide-react";

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
}

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
  "💧", "🖐️", "🌸", "🧸", "☕", "🎵",
  "🌬️", "🧘", "🚶", "🦋", "🫨", "🧎",
  "📱", "💌", "🐾", "🛑", "🎲", "🤗",
  "🔍", "⚖️", "✨", "💬", "📝", "✉️",
  "✏️", "📓", "🎧", "🖼️", "💃", "🏺",
  "🌟", "🌈", "🌿", "🕊️", "🧩", "❤️",
];

const MAX_PINS = 3;

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
}: CopingToolboxProps) {
  const [activeCategory, setActiveCategory] = useState<string>("sensory");
  const [showLibrary, setShowLibrary] = useState(false);
  const [showCreator, setShowCreator] = useState(false);
  const [ratingStrategy, setRatingStrategy] = useState<string | null>(null);

  // Custom creator state
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCategory] = useState("sensory");
  const [newEmoji, setNewEmoji] = useState("🌟");
  const [newDifficulty, setNewDifficulty] = useState<string>("Easy");

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
    setNewEmoji("🌟");
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
            : `${catColor}25`,
          boxShadow: isPinnedSection
            ? "0 0 16px rgba(245, 158, 11, 0.12), 0 2px 8px rgba(0,0,0,0.04)"
            : "0 2px 8px rgba(0,0,0,0.04)",
        }}
        onClick={() => {
          if (isRating) return;
          setRatingStrategy(strategy.id);
          handleUse(strategy);
        }}
      >
        {/* Top row: emoji + name + pin + remove */}
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-base leading-none flex-shrink-0">
            {strategy.emoji || "🧩"}
          </span>
          <span className="text-sm font-medium text-gray-800 truncate flex-1">
            {strategy.name}
          </span>

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
        {/* Emergency Top 3 - Pinned strategies */}
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
                <div className="flex items-center gap-1.5 mb-2">
                  <Sparkles size={14} className="text-amber-500" />
                  <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                    Emergency Top 3
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {pinnedStrategies.map((s) => renderStrategyCard(s, true))}
                </div>
              </div>
            </motion.div>
          )}
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

          {/* Custom creator toggle */}
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

          {/* Clinician clear */}
          {isClinician && strategies.length > 0 && (
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                playClickSound();
                onClear();
              }}
              className="flex items-center justify-center gap-1 py-2.5 px-3 rounded-xl border border-gray-200 bg-white/60 text-gray-400 hover:text-red-400 hover:border-red-200 cursor-pointer transition-all text-sm"
              title="Clear all strategies"
            >
              <RotateCcw size={14} />
            </motion.button>
          )}
        </div>

        {/* ============================================================== */}
        {/* Strategy Library Drawer */}
        {/* ============================================================== */}
        <AnimatePresence>
          {showLibrary && (
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
          {showCreator && (
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
      </div>
    </div>
  );
}
