import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ChevronUp } from "lucide-react";
import { PART_COLORS, PART_SIZES, METAPHOR_LABELS } from "@/lib/parts-theater-data";

interface PartPaletteProps {
  onAddPart: (name: string | null, color: string, size: string) => void;
  metaphor: string;
  partCount: number;
  partLimit: number;
  frozen: boolean;
  isClinician: boolean;
}

export function PartPalette({ onAddPart, metaphor, partCount, partLimit, frozen, isClinician }: PartPaletteProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState<string>(PART_COLORS[0].hex);
  const [selectedSize, setSelectedSize] = useState<string>("medium");
  const labels = METAPHOR_LABELS[metaphor] || METAPHOR_LABELS.parts;

  const atLimit = partLimit > 0 && partCount >= partLimit;
  const isDisabled = (frozen && !isClinician) || atLimit;

  const handleSubmit = () => {
    if (isDisabled) return;
    onAddPart(name.trim() || null, selectedColor, selectedSize);
    setName("");
    setIsExpanded(false);
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="bg-white/80 backdrop-blur-2xl border-t border-white/30 shadow-2xl p-4 pb-5"
          >
            <div className="max-w-md mx-auto space-y-3">
              {/* Name input */}
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={`Name this ${labels.noun.toLowerCase()} (optional)`}
                className="w-full px-3 py-2.5 rounded-xl bg-white/60 border border-white/40 text-primary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/30 text-sm"
                autoFocus
              />

              {/* Color swatches */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mr-1">Color</span>
                {PART_COLORS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedColor(c.hex)}
                    className="w-7 h-7 rounded-full transition-all cursor-pointer shrink-0"
                    style={{
                      backgroundColor: c.hex,
                      boxShadow: selectedColor === c.hex
                        ? `0 0 0 2px white, 0 0 0 4px ${c.hex}`
                        : "0 1px 3px rgba(0,0,0,0.1)",
                      transform: selectedColor === c.hex ? "scale(1.15)" : "scale(1)",
                    }}
                    title={c.label}
                  />
                ))}
              </div>

              {/* Size buttons */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mr-1">Size</span>
                {(["small", "medium", "large"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      selectedSize === s
                        ? "bg-primary text-white shadow-md"
                        : "bg-white/60 text-muted-foreground hover:bg-white/80 border border-white/40"
                    }`}
                  >
                    {s.charAt(0).toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={isDisabled}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#2E8B57] to-[#236B43] text-white font-medium text-sm shadow-lg hover:brightness-110 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-[#D4AF37]/30"
              >
                <Plus size={16} />
                Place in Theater
              </button>

              {atLimit && (
                <p className="text-xs text-center text-amber-600">
                  Part limit reached ({partLimit})
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      {!isExpanded && (
        <div className="flex justify-center pb-4 pt-2">
          <motion.button
            onClick={() => setIsExpanded(true)}
            disabled={isDisabled}
            className="px-5 py-2.5 rounded-full bg-white/70 backdrop-blur-xl shadow-lg border border-white/30 text-primary text-sm font-medium flex items-center gap-2 cursor-pointer hover:bg-white/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Plus size={16} className="text-accent" />
            {labels.addVerb}
            <ChevronUp size={14} className="text-muted-foreground" />
          </motion.button>
        </div>
      )}
    </div>
  );
}
