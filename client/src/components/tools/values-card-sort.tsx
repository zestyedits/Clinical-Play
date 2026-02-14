import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { VALUES_CARDS, VALUE_COLUMNS, type ValueCard } from "@/lib/values-cards-data";
import { playSortSound } from "@/lib/audio-feedback";
import { RotateCcw, ChevronUp, GripVertical, Sparkles, Check } from "lucide-react";

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
}

const COLUMN_GRADIENTS: Record<string, string> = {
  "very-important": "linear-gradient(135deg, #C9A96E15, #C9A96E08)",
  "important": "linear-gradient(135deg, #A8C5A015, #A8C5A008)",
  "not-important": "linear-gradient(135deg, #94A3B815, #94A3B808)",
};

export function ValuesCardSort({ placements, onPlaceCard, onMoveCard, onRemoveCard, onClear, isClinician }: ValuesCardSortProps) {
  const [showDeck, setShowDeck] = useState(true);
  const [dragCard, setDragCard] = useState<string | null>(null);
  const [hoveredColumn, setHoveredColumn] = useState<string | null>(null);
  const [justPlaced, setJustPlaced] = useState<string | null>(null);

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
      const card = VALUES_CARDS.find(c => c.id === cardId);
      if (!card) return;
      const colCards = getColumnCards(colId);
      onPlaceCard(cardId, card.label, colId, colCards.length);
    }
    playSortSound();
    setDragCard(null);
    setHoveredColumn(null);
    setJustPlaced(cardId);
    setTimeout(() => setJustPlaced(null), 800);
  }, [placements, getColumnCards, onPlaceCard, onMoveCard]);

  const handleReturnToDeck = useCallback((placementId: string) => {
    onRemoveCard(placementId);
    playSortSound();
  }, [onRemoveCard]);

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

      {/* Header */}
      <motion.div
        className="flex items-center justify-between px-4 md:px-6 pt-4 md:pt-6 pb-2 shrink-0 relative z-10"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div>
          <h2 className="font-serif text-xl md:text-3xl text-primary">Values Card Sort</h2>
          <p className="text-xs md:text-sm text-muted-foreground">Drag cards to sort what matters most</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Progress indicator */}
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
          {isClinician && placements.length > 0 && (
            <button
              onClick={onClear}
              className="min-w-[44px] min-h-[44px] p-2 rounded-xl hover:bg-white/50 transition-colors cursor-pointer text-muted-foreground hover:text-destructive"
              data-testid="button-clear-values"
              title="Reset all cards"
            >
              <RotateCcw size={18} />
            </button>
          )}
        </div>
      </motion.div>

      {/* Completion celebration */}
      <AnimatePresence>
        {allSorted && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-4 md:mx-6 mb-2 relative z-10"
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
      <div className="flex-1 flex flex-col md:flex-row gap-3 px-4 md:px-6 pb-2 overflow-hidden relative z-10">
        {VALUE_COLUMNS.map((col, colIdx) => {
          const colCards = getColumnCards(col.id);
          const isHovered = hoveredColumn === col.id;
          return (
            <motion.div
              key={col.id}
              className="flex-1 flex flex-col min-h-0"
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
                        draggable
                        onDragStart={(e: any) => {
                          const de = e as DragEvent;
                          de.dataTransfer?.setData("cardId", placement.cardId);
                          setDragCard(placement.cardId);
                        }}
                        onDragEnd={() => { setDragCard(null); setHoveredColumn(null); }}
                        className="group relative cursor-grab active:cursor-grabbing"
                        data-testid={`placed-card-${placement.cardId}`}
                      >
                        <motion.div
                          className="rounded-2xl border-l-3 p-3 shadow-sm border border-white/40 hover:shadow-md transition-all flex items-center gap-3"
                          style={{
                            borderLeftColor: col.color,
                            background: wasJustPlaced
                              ? `linear-gradient(135deg, ${col.color}15, white 60%)`
                              : "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(250,248,245,0.9))",
                          }}
                          animate={wasJustPlaced ? {
                            boxShadow: [`0 0 0 0 ${col.color}40`, `0 0 0 6px ${col.color}00`],
                          } : {}}
                          transition={{ duration: 0.6 }}
                        >
                          <GripVertical size={14} className="text-muted-foreground/30 shrink-0" />
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
                    <p className="text-xs text-muted-foreground/30">Drop cards here</p>
                  </div>
                )}
              </motion.div>
            </motion.div>
          );
        })}
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
                      draggable
                      onDragStart={(e: any) => {
                        const de = e as DragEvent;
                        de.dataTransfer?.setData("cardId", card.id);
                        setDragCard(card.id);
                      }}
                      onDragEnd={() => { setDragCard(null); setHoveredColumn(null); }}
                      className="snap-start shrink-0 cursor-grab active:cursor-grabbing"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      whileHover={{ y: -6, scale: 1.04 }}
                      whileTap={{ scale: 0.97 }}
                      data-testid={`deck-card-${card.id}`}
                    >
                      <div className="w-28 md:w-32 rounded-2xl p-3 md:p-4 transition-shadow relative overflow-hidden group"
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
