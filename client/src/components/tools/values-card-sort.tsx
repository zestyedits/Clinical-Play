import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { VALUES_CARDS, VALUE_COLUMNS, type ValueCard } from "@/lib/values-cards-data";
import { playSortSound } from "@/lib/audio-feedback";
import { RotateCcw, ChevronUp, GripVertical } from "lucide-react";

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

export function ValuesCardSort({ placements, onPlaceCard, onMoveCard, onRemoveCard, onClear, isClinician }: ValuesCardSortProps) {
  const [showDeck, setShowDeck] = useState(true);
  const [dragCard, setDragCard] = useState<string | null>(null);

  const placedCardIds = useMemo(() => new Set(placements.map(p => p.cardId)), [placements]);

  const deckCards = useMemo(
    () => VALUES_CARDS.filter(c => !placedCardIds.has(c.id)),
    [placedCardIds]
  );

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
  }, [placements, getColumnCards, onPlaceCard, onMoveCard]);

  const handleReturnToDeck = useCallback((placementId: string) => {
    onRemoveCard(placementId);
    playSortSound();
  }, [onRemoveCard]);

  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden" data-testid="values-card-sort-container"
      style={{ background: "linear-gradient(145deg, #faf8f5 0%, #f3efe8 50%, #ede8e0 100%)" }}
    >
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: "radial-gradient(circle at 50% 50%, #C9A96E 0%, transparent 70%)" }}
      />

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
        <div className="flex items-center gap-2">
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

      {/* Sorting Columns */}
      <div className="flex-1 flex flex-col md:flex-row gap-3 px-4 md:px-6 pb-2 overflow-hidden relative z-10">
        {VALUE_COLUMNS.map((col, colIdx) => {
          const colCards = getColumnCards(col.id);
          return (
            <motion.div
              key={col.id}
              className="flex-1 flex flex-col min-h-0"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 + colIdx * 0.08, ease: [0.22, 1, 0.36, 1] }}
              onDragOver={(e: React.DragEvent) => e.preventDefault()}
              onDrop={(e: React.DragEvent) => {
                e.preventDefault();
                const cardId = e.dataTransfer.getData("cardId");
                if (cardId) handleDrop(col.id, cardId);
              }}
              data-testid={`column-${col.id}`}
            >
              {/* Column Header */}
              <div className="flex items-center gap-2 px-3 py-2 mb-2 rounded-xl" style={{ backgroundColor: `${col.color}15` }}>
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: col.color }} />
                <h3 className="text-sm font-medium text-primary">{col.label}</h3>
                <span className="text-xs text-muted-foreground ml-auto">{colCards.length}</span>
              </div>

              {/* Column Drop Zone */}
              <div className={cn(
                "flex-1 rounded-2xl border-2 border-dashed p-2 overflow-y-auto space-y-2 transition-colors min-h-[60px] md:min-h-[80px]",
                dragCard ? "border-accent/40 bg-accent/5" : "border-white/30 bg-white/20"
              )}>
                <AnimatePresence>
                  {colCards.map((placement) => {
                    const cardData = VALUES_CARDS.find(c => c.id === placement.cardId);
                    return (
                      <motion.div
                        key={placement.id}
                        layout
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        draggable
                        onDragStart={(e: any) => {
                          const de = e as DragEvent;
                          de.dataTransfer?.setData("cardId", placement.cardId);
                          setDragCard(placement.cardId);
                        }}
                        onDragEnd={() => setDragCard(null)}
                        className="group relative cursor-grab active:cursor-grabbing"
                        data-testid={`placed-card-${placement.cardId}`}
                      >
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 shadow-sm border border-white/40 hover:shadow-md hover:bg-white transition-all flex items-center gap-3">
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
                            <X size={14} />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {colCards.length === 0 && (
                  <p className="text-xs text-muted-foreground/40 text-center py-4">Drop cards here</p>
                )}
              </div>
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
              <div className="bg-white/40 backdrop-blur-md border-t border-white/30 px-4 md:px-6 py-4">
                <div className="flex gap-2 overflow-x-auto pb-2 snap-x">
                  {deckCards.map((card, i) => (
                    <motion.div
                      key={card.id}
                      draggable
                      onDragStart={(e: any) => {
                        const de = e as DragEvent;
                        de.dataTransfer?.setData("cardId", card.id);
                        setDragCard(card.id);
                      }}
                      onDragEnd={() => setDragCard(null)}
                      className="snap-start shrink-0 cursor-grab active:cursor-grabbing"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      whileHover={{ y: -4, scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      data-testid={`deck-card-${card.id}`}
                    >
                      <div className="w-28 md:w-32 bg-white rounded-2xl p-3 md:p-4 shadow-md border border-white/50 hover:shadow-xl transition-shadow">
                        <span className="text-2xl block mb-2">{card.emoji}</span>
                        <p className="text-sm font-serif font-medium text-primary leading-tight">{card.label}</p>
                        <p className="text-[10px] text-muted-foreground mt-1 leading-tight">{card.description}</p>
                      </div>
                    </motion.div>
                  ))}

                  {deckCards.length === 0 && (
                    <p className="text-sm text-muted-foreground/50 py-4 text-center w-full">All cards have been sorted!</p>
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

function X({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
