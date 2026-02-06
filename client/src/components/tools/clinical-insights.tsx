import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Lightbulb, MessageCircle, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const TOOL_PROMPTS: Record<string, { title: string; prompts: string[] }> = {
  sandtray: {
    title: "Sandtray Reflection Prompts",
    prompts: [
      "Which object represents your boundary right now?",
      "If you could add one more item, what would it be and where?",
      "Tell me about the relationship between these two objects.",
      "What would happen if we moved this object closer to that one?",
      "Which object feels the safest to you? Why?",
      "Is there anything missing from your world?",
      "If this scene could speak, what would it say?",
      "Which object would you remove if you had to choose one?",
    ],
  },
  breathing: {
    title: "Breathing Exercise Prompts",
    prompts: [
      "Notice where you feel the breath in your body.",
      "What color would you give your breath right now?",
      "As you exhale, imagine releasing one worry.",
      "How does your body feel different from when we started?",
      "Rate your calm level from 1-10 before and after.",
      "What did you notice during the hold phase?",
    ],
  },
  feelings: {
    title: "Feeling Wheel Prompts",
    prompts: [
      "What surprised you about the emotion you landed on?",
      "When did you first start noticing this feeling today?",
      "Where in your body do you experience this emotion?",
      "On a scale of 1-10, how intense is this feeling right now?",
      "Is this a familiar feeling, or is it new?",
      "What would you need in order to feel 1 point better?",
      "If this emotion had a shape, what would it look like?",
      "What triggered this emotion? Can you trace it back?",
    ],
  },
  narrative: {
    title: "Narrative Timeline Prompts",
    prompts: [
      "Which event on the timeline feels the heaviest?",
      "Are there any gaps in the timeline that feel important?",
      "What would the 'turning point' stone look like for you?",
      "If you could change one event, which would it be?",
      "What theme connects these events together?",
      "Which event are you most proud of surviving?",
      "What stone would you place for today? Where does it go?",
      "If your future had a stone, what color and label would it have?",
    ],
  },
  "values-sort": {
    title: "Values Card Sort Prompts",
    prompts: [
      "Were any of these categories surprising to you?",
      "Which value did you sort the fastest — what does that tell us?",
      "Is there a tension between any of your top values?",
      "How aligned is your daily life with your top values?",
      "Which 'Not Important' value used to be important to you?",
      "If you had to keep only three, which would they be?",
      "How does seeing your values laid out make you feel?",
      "What would change if you lived more by your #1 value?",
    ],
  },
};

interface ClinicalInsightsProps {
  isOpen: boolean;
  onToggle: () => void;
  activeTool: string;
}

export function ClinicalInsights({ isOpen, onToggle, activeTool }: ClinicalInsightsProps) {
  const toolData = TOOL_PROMPTS[activeTool] || TOOL_PROMPTS.sandtray;

  return (
    <>
      <motion.button
        onClick={onToggle}
        className={cn(
          "absolute top-20 md:top-4 right-4 z-30 min-w-[44px] min-h-[44px] p-3 rounded-2xl shadow-lg transition-all cursor-pointer flex items-center justify-center",
          isOpen
            ? "bg-primary text-primary-foreground"
            : "bg-white/70 backdrop-blur-xl text-primary hover:bg-white/90 border border-white/30"
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        data-testid="button-toggle-insights"
        title="Clinical Insights"
      >
        {isOpen ? <EyeOff size={18} /> : <Eye size={18} />}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute top-32 md:top-14 right-4 z-30 w-72 max-h-[60vh] bg-white/30 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 overflow-hidden flex flex-col"
          >
            <div className="p-4 border-b border-white/20">
              <div className="flex items-center gap-2 mb-1">
                <Lightbulb size={16} className="text-accent" />
                <h3 className="font-serif text-sm text-primary font-medium">Clinical Insights</h3>
              </div>
              <p className="text-[11px] text-muted-foreground">Private — only you can see this</p>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              <div className="px-2 py-1">
                <p className="text-xs font-bold text-accent uppercase tracking-widest flex items-center gap-1.5">
                  <BookOpen size={11} />
                  {toolData.title}
                </p>
              </div>
              {toolData.prompts.map((prompt, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-3 rounded-2xl bg-white/40 hover:bg-white/60 transition-colors group cursor-pointer"
                >
                  <div className="flex items-start gap-2.5">
                    <MessageCircle size={14} className="text-accent mt-0.5 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
                    <p className="text-sm text-primary/80 leading-relaxed">{prompt}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
