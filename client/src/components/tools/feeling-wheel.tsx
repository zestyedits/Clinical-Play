import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { FEELING_WHEEL_DATA, type EmotionNode } from "@/lib/feeling-wheel-data";
import { playClickSound } from "@/lib/audio-feedback";
import { RotateCcw } from "lucide-react";

export interface FeelingSelection {
  id: string;
  primaryEmotion: string;
  secondaryEmotion: string | null;
  tertiaryEmotion: string | null;
  selectedBy: string | null;
  createdAt?: string | null;
}

interface FeelingWheelProps {
  selections: FeelingSelection[];
  onSelect: (primary: string, secondary: string | null, tertiary: string | null) => void;
  onClear: () => void;
  isClinician: boolean;
}

export function FeelingWheel({ selections, onSelect, onClear, isClinician }: FeelingWheelProps) {
  const [expandedPrimary, setExpandedPrimary] = useState<string | null>(null);
  const [expandedSecondary, setExpandedSecondary] = useState<string | null>(null);

  const selectedPrimary = useMemo(() => FEELING_WHEEL_DATA.find(e => e.label === expandedPrimary), [expandedPrimary]);
  const selectedSecondary = useMemo(() => selectedPrimary?.children?.find(e => e.label === expandedSecondary), [selectedPrimary, expandedSecondary]);

  const latestSelections = useMemo(() => {
    return selections.slice(-5).reverse();
  }, [selections]);

  const handlePrimaryClick = useCallback((emotion: EmotionNode) => {
    playClickSound();
    if (expandedPrimary === emotion.label) {
      setExpandedPrimary(null);
      setExpandedSecondary(null);
    } else {
      setExpandedPrimary(emotion.label);
      setExpandedSecondary(null);
    }
  }, [expandedPrimary]);

  const handleSecondaryClick = useCallback((emotion: EmotionNode) => {
    playClickSound();
    if (expandedSecondary === emotion.label) {
      setExpandedSecondary(null);
    } else {
      setExpandedSecondary(emotion.label);
    }
  }, [expandedSecondary]);

  const handleTertiaryClick = useCallback((primary: string, secondary: string, tertiary: string) => {
    playClickSound();
    onSelect(primary, secondary, tertiary);
  }, [onSelect]);

  const handleSelectSecondaryOnly = useCallback((primary: string, secondary: string) => {
    onSelect(primary, secondary, null);
  }, [onSelect]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden" data-testid="feeling-wheel-container"
      style={{ background: "linear-gradient(145deg, #f8f6f3 0%, #f0ede8 50%, #e8e4dd 100%)" }}
    >
      <div className="absolute inset-0 opacity-5 pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle at 30% 30%, rgba(201,169,110,0.3) 0%, transparent 50%)" }}
      />

      <div className="flex flex-col items-center gap-6 w-full max-w-lg px-4 relative z-10">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="font-serif text-2xl md:text-3xl text-primary mb-1">Feeling Wheel</h2>
          <p className="text-sm text-muted-foreground">Explore and name what you're feeling</p>
        </motion.div>

        {/* Primary Emotions Ring */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-3 max-w-md">
          {FEELING_WHEEL_DATA.map((emotion, i) => (
            <motion.button
              key={emotion.label}
              onClick={() => handlePrimaryClick(emotion)}
              className={cn(
                "min-w-[44px] min-h-[44px] px-4 py-3 rounded-2xl font-medium text-sm transition-all cursor-pointer border-2",
                expandedPrimary === emotion.label
                  ? "text-white shadow-lg scale-105 border-white/30"
                  : "bg-white/60 backdrop-blur-sm text-primary border-white/30 hover:bg-white/80 hover:shadow-md"
              )}
              style={expandedPrimary === emotion.label ? { backgroundColor: emotion.color, borderColor: emotion.color } : {}}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: expandedPrimary === emotion.label ? 1.05 : 1 }}
              transition={{ delay: i * 0.05 }}
              whileTap={{ scale: 0.95 }}
              data-testid={`button-primary-emotion-${emotion.label.toLowerCase()}`}
            >
              {emotion.label}
            </motion.button>
          ))}
        </div>

        {/* Secondary Emotions */}
        <AnimatePresence mode="wait">
          {selectedPrimary && (
            <motion.div
              key={`secondary-${expandedPrimary}`}
              initial={{ opacity: 0, y: 20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="w-full"
            >
              <div className="p-4 rounded-2xl bg-white/50 backdrop-blur-md border border-white/30">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 text-center">
                  Within <span style={{ color: selectedPrimary.color }}>{selectedPrimary.label}</span>, I feel...
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {selectedPrimary.children?.map((sec, i) => (
                    <motion.button
                      key={sec.label}
                      onClick={() => handleSecondaryClick(sec)}
                      onDoubleClick={() => handleSelectSecondaryOnly(selectedPrimary.label, sec.label)}
                      className={cn(
                        "min-w-[44px] min-h-[44px] px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all border",
                        expandedSecondary === sec.label
                          ? "text-white shadow-md border-white/30"
                          : "bg-white/60 text-primary border-white/20 hover:bg-white/80"
                      )}
                      style={expandedSecondary === sec.label ? { backgroundColor: sec.color, borderColor: sec.color } : {}}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      whileTap={{ scale: 0.95 }}
                      data-testid={`button-secondary-emotion-${sec.label.toLowerCase().replace(/\s/g, "-")}`}
                    >
                      {sec.label}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tertiary Emotions */}
        <AnimatePresence mode="wait">
          {selectedSecondary && expandedPrimary && (
            <motion.div
              key={`tertiary-${expandedSecondary}`}
              initial={{ opacity: 0, y: 20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="w-full"
            >
              <div className="p-4 rounded-2xl bg-white/40 backdrop-blur-md border border-white/20">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 text-center">
                  More specifically...
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {selectedSecondary.children?.map((ter, i) => (
                    <motion.button
                      key={ter.label}
                      onClick={() => handleTertiaryClick(expandedPrimary, expandedSecondary!, ter.label)}
                      className="min-w-[44px] min-h-[44px] px-5 py-3 rounded-xl text-sm font-medium cursor-pointer bg-white/70 text-primary border border-white/30 hover:bg-white hover:shadow-md transition-all"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.08 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      data-testid={`button-tertiary-emotion-${ter.label.toLowerCase().replace(/\s/g, "-")}`}
                    >
                      {ter.label}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selections History */}
        {latestSelections.length > 0 && (
          <motion.div
            className="w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="p-4 rounded-2xl bg-white/30 backdrop-blur-sm border border-white/20">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Identified Feelings</p>
                {isClinician && (
                  <button
                    onClick={onClear}
                    className="min-w-[44px] min-h-[44px] p-2 rounded-lg hover:bg-white/50 transition-colors cursor-pointer text-muted-foreground hover:text-destructive"
                    data-testid="button-clear-feelings"
                    title="Clear all selections"
                  >
                    <RotateCcw size={14} />
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {latestSelections.map((sel, i) => {
                  const primaryData = FEELING_WHEEL_DATA.find(e => e.label === sel.primaryEmotion);
                  return (
                    <motion.div
                      key={sel.id}
                      className="flex items-center gap-2 text-sm"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: primaryData?.color || "#ccc" }}
                      />
                      <span className="text-primary font-medium">{sel.primaryEmotion}</span>
                      {sel.secondaryEmotion && (
                        <>
                          <span className="text-muted-foreground/50">→</span>
                          <span className="text-muted-foreground">{sel.secondaryEmotion}</span>
                        </>
                      )}
                      {sel.tertiaryEmotion && (
                        <>
                          <span className="text-muted-foreground/50">→</span>
                          <span className="text-muted-foreground italic">{sel.tertiaryEmotion}</span>
                        </>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
