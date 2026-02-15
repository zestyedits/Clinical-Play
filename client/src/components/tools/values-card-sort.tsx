import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { VALUES_CARDS, VALUE_COLUMNS, type ValueCard } from "@/lib/values-cards-data";
import { playSortSound } from "@/lib/audio-feedback";
import { RotateCcw, ChevronUp, GripVertical, Sparkles, Check, Hash } from "lucide-react";
import { ClinicianToolbar, type ToolbarControl } from "./clinician-toolbar";

export interface CardPlacement {
  id: string;
  cardId: string;
  label: string;
  column: string;
  orderIndex: number;
  placedBy: string | null;
}

interface ValuesCardSortProps {
  placements: CardPlacement[];
  onPlaceCard: (cardId: string, label: string, column: string, orderIndex: number) => void;
  onMoveCard: (placementId: string, column: string, orderIndex: number) => void;
  onRemoveCard: (placementId: string) => void;
  onClear: () => void;
  isClinician: boolean;
  toolSettings?: Record<string, any>;
  onSettingsUpdate?: (updates: Record<string, any>) => void;
}

// ─── Clinician Toolbar Settings ──────────────────────────────────────────────

interface ValuesCardSortSettings {
  maxCards: number;
  reflections?: Record<string, string>;
}

const DEFAULT_VALUES_CARD_SORT_SETTINGS: ValuesCardSortSettings = {
  maxCards: 0,
};

const VALUES_CARD_SORT_TOOLBAR_CONTROLS: ToolbarControl[] = [
  {
    type: "number",
    key: "maxCards",
    icon: Hash,
    label: "Max Cards",
    steps: [0, 5, 10, 15, 24],
    activeColor: "amber",
  },
];

const COLUMN_GRADIENTS: Record<string, string> = {
  "very-important": "linear-gradient(135deg, #C9A96E15, #C9A96E08)",
  "important": "linear-gradient(135deg, #A8C5A015, #A8C5A008)",
  "not-important": "linear-gradient(135deg, #94A3B815, #94A3B808)",
};

const COLUMN_HELP_TEXT: Record<string, string> = {
  "very-important": "Values you can\u2019t live without",
  "important": "Values that matter to you",
  "not-important": "Values you\u2019re willing to let go of",
};

const REFLECTION_PROMPTS = [
  { key: "surprise", prompt: "What surprised you about your top values?" },
  { key: "conflict", prompt: "Do any of your top values feel in conflict with each other?" },
  { key: "alignment", prompt: "How well are you living in alignment with what matters most?" },
];

export function ValuesCardSort({ placements, onPlaceCard, onMoveCard, onRemoveCard, onClear, isClinician, toolSettings, onSettingsUpdate }: ValuesCardSortProps) {
  const settings = { ...DEFAULT_VALUES_CARD_SORT_SETTINGS, ...toolSettings } as ValuesCardSortSettings;

  const [showDeck, setShowDeck] = useState(true);
  const [dragCard, setDragCard] = useState<string | null>(null);
  const [hoveredColumn, setHoveredColumn] = useState<string | null>(null);
  const [justPlaced, setJustPlaced] = useState<string | null>(null);
  const [mobilePopoverCardId, setMobilePopoverCardId] = useState<string | null>(null);
  const [flippedCardId, setFlippedCardId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close popover on outside tap
  useEffect(() => {
    if (!mobilePopoverCardId) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setMobilePopoverCardId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [mobilePopoverCardId]);

  const placedCardIds = useMemo(() => new Set(placements.map(p => p.cardId)), [placements]);

  const deckCards = useMemo(
    () => VALUES_CARDS.filter(c => !placedCardIds.has(c.id)),
    [placedCardIds]
  );

  const allSorted = deckCards.length === 0 && placements.length > 0;

  const getColumnCards = useCallback((colId: string) => {
    return placements
      .filter(p => p.column === colId)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }, [placements]);

  const handleDrop = useCallback((colId: string, cardId: string) => {
    const existing = placements.find(p => p.cardId === cardId);
    if (existing) {
      const colCards = getColumnCards(colId);
      onMoveCard(existing.id, colId, colCards.length);
    } else {
      if (settings.maxCards > 0 && placements.length >= settings.maxCards) return;
      const card = VALUES_CARDS.find(c => c.id === cardId);
      if (!card) return;
      const colCards = getColumnCards(colId);
      onPlaceCard(cardId, card.label, colId, colCards.length);
    }
    playSortSound();
    setDragCard(null);
    setHoveredColumn(null);
    setMobilePopoverCardId(null);
    setJustPlaced(cardId);
    setTimeout(() => setJustPlaced(null), 800);
  }, [placements, getColumnCards, onPlaceCard, onMoveCard, settings.maxCards]);

  const handleReturnToDeck = useCallback((placementId: string) => {
    onRemoveCard(placementId);
    playSortSound();
  }, [onRemoveCard]);

  const handleMobileTapDeckCard = useCallback((cardId: string) => {
    if (!isMobile) return;
    setMobilePopoverCardId(prev => prev === cardId ? null : cardId);
  }, [isMobile]);

  const handlePlacedCardTap = useCallback((cardId: string) => {
    setFlippedCardId(prev => prev === cardId ? null : cardId);
  }, []);

  const handleReflectionChange = useCallback((key: string, value: string) => {
    if (!onSettingsUpdate) return;
    const current = settings.reflections || {};
    onSettingsUpdate({ reflections: { ...current, [key]: value } });
  }, [onSettingsUpdate, settings.reflections]);

  // Stats counts
  const columnCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const col of VALUE_COLUMNS) {
      counts[col.id] = placements.filter(p => p.column === col.id).length;
    }
    return counts;
  }, [placements]);

  const progress = placements.length;
  const total = VALUES_CARDS.length;

  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden" data-testid="values-card-sort-container"
      style={{ background: "linear-gradient(145deg, #faf8f5 0%, #f3efe8 50%, #ede8e0 100%)" }}
    >
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: "radial-gradient(circle at 50% 50%, #C9A96E 0%, transparent 70%)" }}
        />
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]">
          <filter id="values-noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#values-noise)" />
        </svg>
      </div>

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto relative z-10">

        {/* Header */}
        <motion.div
          className="flex items-center justify-between px-4 md:px-6 pt-4 md:pt-6 pb-2 shrink-0"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div>
            <h2 className="font-serif text-xl md:text-3xl text-primary">Values Card Sort</h2>
            <p className="text-xs md:text-sm text-muted-foreground">
              {isMobile ? "Tap cards to sort what matters most" : "Drag cards to sort what matters most"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {progress > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 rounded-full bg-secondary/50 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-accent"
                    animate={{ width: `${(progress / total) * 100}%` }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                </div>
                <span className="text-xs text-muted-foreground/60 font-mono tabular-nums">
                  {progress}/{total}
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Summary Stats Bar */}
        <AnimatePresence>
          {progress > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="px-4 md:px-6 pb-2"
            >
              <div className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white/50 border border-white/60">
                {VALUE_COLUMNS.map((col, idx) => (
                  <div key={col.id} className="flex items-center gap-1.5">
                    {idx > 0 && <span className="text-muted-foreground/20 mx-1">|</span>}
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
                    <span className="text-xs text-muted-foreground">
                      {col.label}: <span className="font-semibold tabular-nums" style={{ color: col.color }}>{columnCounts[col.id]}</span>
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Completion celebration */}
        <AnimatePresence>
          {allSorted && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mx-4 md:mx-6 mb-2"
            >
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/20">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Sparkles size={16} className="text-accent" />
                </motion.div>
                <span className="text-sm font-medium text-primary">All cards sorted! Take a moment to reflect on your choices.</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sorting Columns */}
        <div className="flex flex-col md:flex-row gap-3 px-4 md:px-6 pb-2">
          {VALUE_COLUMNS.map((col, colIdx) => {
            const colCards = getColumnCards(col.id);
            const isHovered = hoveredColumn === col.id;
            return (
              <motion.div
                key={col.id}
                className="flex-1 flex flex-col"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + colIdx * 0.08, ease: [0.22, 1, 0.36, 1] }}
                onDragOver={(e: React.DragEvent) => {
                  e.preventDefault();
                  setHoveredColumn(col.id);
                }}
                onDragLeave={() => setHoveredColumn(null)}
                onDrop={(e: React.DragEvent) => {
                  e.preventDefault();
                  const cardId = e.dataTransfer.getData("cardId");
                  if (cardId) handleDrop(col.id, cardId);
                }}
                data-testid={`column-${col.id}`}
              >
                {/* Column Header */}
                <div className="flex items-center gap-3 px-4 py-2.5 mb-2 rounded-xl border-l-4 transition-all"
                  style={{
                    borderLeftColor: col.color,
                    background: COLUMN_GRADIENTS[col.id] || "white",
                  }}
                >
                  <div className="w-2.5 h-6 rounded-full" style={{ backgroundColor: col.color, boxShadow: `0 0 8px ${col.color}30` }} />
                  <h3 className="text-sm font-serif font-medium text-primary">{col.label}</h3>
                  <span className="text-xs text-muted-foreground ml-auto font-mono tabular-nums">{colCards.length}</span>
                </div>

                {/* Column Drop Zone */}
                <motion.div
                  className={cn(
                    "flex-1 rounded-2xl border-2 p-2 overflow-y-auto space-y-2 transition-all duration-300 min-h-[60px] md:min-h-[80px]",
                    isHovered && dragCard
                      ? "border-dashed shadow-[inset_0_0_30px_rgba(212,175,55,0.12)]"
                      : dragCard
                        ? "border-dashed border-muted-foreground/15 bg-white/10"
                        : "border-transparent bg-white/15 hover:bg-white/20"
                  )}
                  style={{
                    borderColor: isHovered && dragCard ? col.color + "60" : undefined,
                    background: isHovered && dragCard ? `${col.color}08` : undefined,
                  }}
                  animate={{
                    scale: isHovered && dragCard ? 1.01 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                >
                  <AnimatePresence>
                    {colCards.map((placement) => {
                      const cardData = VALUES_CARDS.find(c => c.id === placement.cardId);
                      const wasJustPlaced = justPlaced === placement.cardId;
                      const isFlipped = flippedCardId === placement.cardId;
                      return (
                        <motion.div
                          key={placement.id}
                          layout
                          initial={{ scale: 0.85, opacity: 0, y: 20, filter: "blur(4px)" }}
                          animate={{
                            scale: 1,
                            opacity: 1,
                            y: 0,
                            filter: "blur(0px)",
                          }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          transition={{ type: "spring", stiffness: 400, damping: 25 }}
                          draggable={!isMobile}
                          onDragStart={(e: any) => {
                            const de = e as DragEvent;
                            de.dataTransfer?.setData("cardId", placement.cardId);
                            setDragCard(placement.cardId);
                          }}
                          onDragEnd={() => { setDragCard(null); setHoveredColumn(null); }}
                          className={cn("group relative", !isMobile && "cursor-grab active:cursor-grabbing")}
                          data-testid={`placed-card-${placement.cardId}`}
                          style={{ perspective: "600px" }}
                        >
                          <motion.div
                            animate={{ rotateY: isFlipped ? 180 : 0 }}
                            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                            style={{ transformStyle: "preserve-3d", position: "relative" }}
                          >
                            {/* Front face */}
                            <motion.div
                              className="rounded-2xl border-l-3 p-3 shadow-sm border border-white/40 hover:shadow-md transition-all flex items-center gap-3 cursor-pointer"
                              style={{
                                borderLeftColor: col.color,
                                background: wasJustPlaced
                                  ? `linear-gradient(135deg, ${col.color}15, white 60%)`
                                  : "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(250,248,245,0.9))",
                                backfaceVisibility: "hidden",
                              }}
                              onClick={() => handlePlacedCardTap(placement.cardId)}
                              animate={wasJustPlaced ? {
                                boxShadow: [`0 0 0 0 ${col.color}40`, `0 0 0 6px ${col.color}00`],
                              } : {}}
                              transition={{ duration: 0.6 }}
                            >
                              {!isMobile && <GripVertical size={14} className="text-muted-foreground/30 shrink-0" />}
                              <span className="text-lg shrink-0">{cardData?.emoji}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-primary truncate">{placement.label}</p>
                              </div>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleReturnToDeck(placement.id); }}
                                className="opacity-100 md:opacity-0 md:group-hover:opacity-100 min-w-[32px] min-h-[32px] p-1 rounded-lg hover:bg-secondary transition-all cursor-pointer text-muted-foreground hover:text-destructive"
                                title="Return to deck"
                              >
                                <XIcon size={14} />
                              </button>
                            </motion.div>

                            {/* Back face (description) */}
                            <div
                              className="absolute inset-0 rounded-2xl border-l-3 p-3 shadow-sm border border-white/40 flex items-center gap-3 cursor-pointer"
                              style={{
                                borderLeftColor: col.color,
                                background: `linear-gradient(135deg, ${col.color}18, ${col.color}08)`,
                                backfaceVisibility: "hidden",
                                transform: "rotateY(180deg)",
                              }}
                              onClick={() => handlePlacedCardTap(placement.cardId)}
                            >
                              <span className="text-lg shrink-0">{cardData?.emoji}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-primary/70 mb-0.5">{placement.label}</p>
                                <p className="text-sm text-primary leading-snug">{cardData?.description}</p>
                              </div>
                            </div>
                          </motion.div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  {colCards.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-6 gap-2">
                      <motion.div
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="w-10 h-10 rounded-xl border-2 border-dashed flex items-center justify-center"
                        style={{ borderColor: `${col.color}25` }}
                      >
                        <span className="text-lg opacity-30">+</span>
                      </motion.div>
                      <p className="text-xs text-muted-foreground/40 text-center px-2">{COLUMN_HELP_TEXT[col.id] || "Drop cards here"}</p>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Reflection Section */}
        <AnimatePresence>
          {allSorted && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="px-4 md:px-6 pb-4 pt-2"
            >
              <div className="rounded-2xl border border-accent/20 bg-gradient-to-br from-white/80 to-accent/5 p-4 md:p-6 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={16} className="text-accent" />
                  <h3 className="font-serif text-lg text-primary">Reflect</h3>
                </div>
                {REFLECTION_PROMPTS.map((item) => (
                  <div key={item.key} className="space-y-1.5">
                    <label className="text-sm font-medium text-primary/80">{item.prompt}</label>
                    <textarea
                      className="w-full rounded-xl border border-accent/15 bg-white/70 px-3 py-2.5 text-sm text-primary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/30 resize-none transition-all"
                      rows={3}
                      placeholder="Take a moment to reflect..."
                      value={(settings.reflections && settings.reflections[item.key]) || ""}
                      onChange={(e) => handleReflectionChange(item.key, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Card Deck */}
      <div className="shrink-0 relative z-10">
        <button
          onClick={() => setShowDeck(!showDeck)}
          className="w-full flex items-center justify-center gap-2 py-2 text-xs font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer"
          data-testid="button-toggle-deck"
        >
          <motion.div animate={{ rotate: showDeck ? 180 : 0 }}>
            <ChevronUp size={16} />
          </motion.div>
          Card Deck ({deckCards.length} remaining)
        </button>

        <AnimatePresence>
          {showDeck && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="overflow-hidden"
            >
              <div className="glass-luxury backdrop-blur-xl px-4 md:px-6 py-4">
                <div className="flex gap-2.5 overflow-x-auto pb-2 snap-x">
                  {deckCards.map((card, i) => (
                    <motion.div
                      key={card.id}
                      draggable={!isMobile}
                      onDragStart={(e: any) => {
                        const de = e as DragEvent;
                        de.dataTransfer?.setData("cardId", card.id);
                        setDragCard(card.id);
                      }}
                      onDragEnd={() => { setDragCard(null); setHoveredColumn(null); }}
                      className={cn("snap-start shrink-0 relative", !isMobile && "cursor-grab active:cursor-grabbing", isMobile && "cursor-pointer")}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      whileHover={!isMobile ? { y: -6, scale: 1.04 } : undefined}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleMobileTapDeckCard(card.id)}
                      data-testid={`deck-card-${card.id}`}
                    >
                      <div className={cn(
                        "w-28 md:w-32 rounded-2xl p-3 md:p-4 transition-shadow relative overflow-hidden group",
                        mobilePopoverCardId === card.id && "ring-2 ring-accent/50"
                      )}
                        style={{
                          background: "linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(250,248,245,0.95) 100%)",
                          border: "1px solid rgba(212,175,55,0.15)",
                          boxShadow: "0 4px 16px rgba(27,42,74,0.08), 0 1px 3px rgba(0,0,0,0.06)",
                        }}
                      >
                        {/* Shine effect on hover */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                          style={{
                            background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.6) 45%, rgba(255,255,255,0.3) 50%, transparent 55%)",
                          }}
                        />
                        {/* Top gold line */}
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent/25 to-transparent" />
                        {/* Bottom subtle border */}
                        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-accent/10 to-transparent" />

                        <span className="text-2xl block mb-2">{card.emoji}</span>
                        <p className="text-sm font-serif font-medium text-primary leading-tight">{card.label}</p>
                        <p className="text-[10px] text-muted-foreground mt-1 leading-tight">{card.description}</p>
                      </div>

                      {/* Mobile quick-action popover */}
                      <AnimatePresence>
                        {isMobile && mobilePopoverCardId === card.id && (
                          <motion.div
                            ref={popoverRef}
                            initial={{ opacity: 0, y: 8, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.9 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50"
                          >
                            <div className="bg-white rounded-xl shadow-lg border border-accent/20 p-1.5 flex flex-col gap-1 min-w-[140px]">
                              {VALUE_COLUMNS.map((col) => (
                                <button
                                  key={col.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDrop(col.id, card.id);
                                  }}
                                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs font-medium transition-colors hover:bg-secondary/50 active:bg-secondary cursor-pointer"
                                  style={{ color: col.color }}
                                >
                                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: col.color }} />
                                  <span className="text-primary">{col.label}</span>
                                </button>
                              ))}
                            </div>
                            {/* Popover arrow */}
                            <div className="w-3 h-3 bg-white border-b border-r border-accent/20 rotate-45 absolute -bottom-1.5 left-1/2 -translate-x-1/2" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}

                  {deckCards.length === 0 && (
                    <div className="flex items-center gap-2 py-4 text-center w-full justify-center">
                      <Check size={14} className="text-accent" />
                      <p className="text-sm text-muted-foreground/50">All cards have been sorted!</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Clinician Toolbar */}
      {isClinician && onSettingsUpdate && (
        <ClinicianToolbar
          controls={VALUES_CARD_SORT_TOOLBAR_CONTROLS}
          settings={settings}
          onUpdate={onSettingsUpdate}
          onClear={onClear}
        />
      )}
    </div>
  );
}

function XIcon({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
