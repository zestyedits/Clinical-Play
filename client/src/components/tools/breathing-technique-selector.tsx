import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { BREATHING_TECHNIQUES, type BreathingTechnique } from "@/lib/breathing-techniques";

interface BreathingTechniqueSelectorProps {
  selectedId: string;
  onSelect: (id: string) => void;
  isClinician: boolean;
}

export function BreathingTechniqueSelector({ selectedId, onSelect, isClinician }: BreathingTechniqueSelectorProps) {
  if (!isClinician) {
    const technique = BREATHING_TECHNIQUES.find((t) => t.id === selectedId) || BREATHING_TECHNIQUES[0];
    return (
      <div className="text-center space-y-2">
        <span className="text-4xl">{technique.emoji}</span>
        <h3 className="font-serif text-xl text-white/90">{technique.name}</h3>
        <p className="text-sm text-white/50">{technique.subtitle}</p>
        <p className="text-xs text-white/40 italic mt-2">Waiting for clinician to start...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide justify-center flex-wrap">
        {BREATHING_TECHNIQUES.map((technique, i) => (
          <TechniqueCard
            key={technique.id}
            technique={technique}
            isSelected={selectedId === technique.id}
            onSelect={() => onSelect(technique.id)}
            index={i}
          />
        ))}
      </div>
    </div>
  );
}

function TechniqueCard({
  technique,
  isSelected,
  onSelect,
  index,
}: {
  technique: BreathingTechnique;
  isSelected: boolean;
  onSelect: () => void;
  index: number;
}) {
  return (
    <motion.button
      onClick={onSelect}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "relative flex flex-col items-center gap-1.5 p-4 rounded-2xl min-w-[110px] transition-all cursor-pointer border",
        isSelected
          ? "bg-white/15 border-white/30 shadow-lg"
          : "bg-white/5 border-white/10 hover:bg-white/10"
      )}
      style={isSelected ? { boxShadow: `0 0 24px ${technique.colors.tertiary}40` } : undefined}
    >
      <span className="text-2xl">{technique.emoji}</span>
      <span className="font-serif text-sm text-white/90 leading-tight text-center">{technique.name}</span>
      <span className="text-[10px] text-white/50 tracking-wide">{technique.subtitle}</span>
      {technique.kidFriendly && (
        <span className="text-[9px] bg-white/10 text-white/60 px-1.5 py-0.5 rounded-full mt-0.5">
          Kid-friendly
        </span>
      )}
      {isSelected && (
        <motion.div
          layoutId="technique-indicator"
          className="absolute -bottom-1 w-8 h-1 rounded-full"
          style={{ backgroundColor: technique.colors.tertiary }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
    </motion.button>
  );
}
