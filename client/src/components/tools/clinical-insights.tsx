import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, MessageCircle, BookOpen, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";

const MODALITY_COLORS: Record<string, string> = {
  "CBT": "bg-blue-100/80 text-blue-700 border-blue-200/50",
  "DBT": "bg-purple-100/80 text-purple-700 border-purple-200/50",
  "Narrative": "bg-emerald-100/80 text-emerald-700 border-emerald-200/50",
  "Solution-Focused": "bg-amber-100/80 text-amber-700 border-amber-200/50",
  "Somatic": "bg-rose-100/80 text-rose-700 border-rose-200/50",
  "Gestalt": "bg-orange-100/80 text-orange-700 border-orange-200/50",
  "Play Therapy": "bg-pink-100/80 text-pink-700 border-pink-200/50",
  "Attachment": "bg-sky-100/80 text-sky-700 border-sky-200/50",
  "Psychodynamic": "bg-indigo-100/80 text-indigo-700 border-indigo-200/50",
  "Mindfulness": "bg-teal-100/80 text-teal-700 border-teal-200/50",
  "ACT": "bg-cyan-100/80 text-cyan-700 border-cyan-200/50",
  "IFS": "bg-violet-100/80 text-violet-700 border-violet-200/50",
};

const TOOL_PROMPTS: Record<string, { title: string; prompts: { text: string; modality: string }[] }> = {
  "volume-mixer": {
    title: "Volume Mixer Prompts",
    prompts: [
      { text: "Which part is the loudest right now? What is it trying to protect?", modality: "IFS" },
      { text: "If you could turn one fader all the way down, which would it be?", modality: "IFS" },
      { text: "What happens in your body when that part gets louder?", modality: "Somatic" },
      { text: "Is there a part that's been muted for a long time? What would it say if it could speak?", modality: "IFS" },
      { text: "Notice the mix as a whole — does it feel balanced, chaotic, or numb?", modality: "Mindfulness" },
      { text: "What would this mix sound like on your best day vs. your hardest day?", modality: "Solution-Focused" },
      { text: "Which part do you wish had more volume? What stops it?", modality: "ACT" },
      { text: "If these parts could talk to each other, what would the loudest one say to the quietest?", modality: "Gestalt" },
    ],
  },
  feelings: {
    title: "Feeling Wheel Prompts",
    prompts: [
      { text: "What surprised you about the emotion you landed on?", modality: "Mindfulness" },
      { text: "When did you first start noticing this feeling today?", modality: "CBT" },
      { text: "Where in your body do you experience this emotion?", modality: "Somatic" },
      { text: "On a scale of 1-10, how intense is this feeling right now?", modality: "Solution-Focused" },
      { text: "Is this a familiar feeling, or is it new?", modality: "Psychodynamic" },
      { text: "What would you need in order to feel 1 point better?", modality: "Solution-Focused" },
      { text: "If this emotion had a shape, what would it look like?", modality: "Play Therapy" },
      { text: "What triggered this emotion? Can you trace it back?", modality: "CBT" },
    ],
  },
};

interface ClinicalInsightsProps {
  isOpen: boolean;
  onToggle: () => void;
  activeTool: string;
  sessionContext?: Record<string, any>;
}

export function ClinicalInsights({ isOpen, onToggle, activeTool }: ClinicalInsightsProps) {
  const toolData = TOOL_PROMPTS[activeTool] || TOOL_PROMPTS["volume-mixer"];

  return (
    <>
      {/* Toggle button */}
      <motion.button
        onClick={onToggle}
        className={cn(
          "absolute top-20 md:top-4 right-4 z-30 min-h-[44px] px-4 py-2.5 rounded-2xl shadow-lg transition-all cursor-pointer flex items-center gap-2.5",
          isOpen
            ? "bg-primary text-primary-foreground"
            : "bg-white/80 backdrop-blur-xl text-primary hover:bg-white/95 border border-accent/30"
        )}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        data-testid="button-toggle-insights"
        title="Therapy Prompts — Private clinical prompts to guide your session"
      >
        <Lightbulb size={18} className={cn(isOpen ? "text-primary-foreground" : "text-accent")} />
        <span className="text-xs font-semibold tracking-wide whitespace-nowrap">
          {isOpen ? "Close Prompts" : "Therapy Prompts"}
        </span>
        {!isOpen && (
          <motion.div
            className="absolute inset-0 rounded-2xl border-2 border-accent/25 pointer-events-none"
            animate={{ opacity: [0, 0.6, 0], scale: [1, 1.08, 1] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </motion.button>

      {/* Panel + backdrop */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/20"
              onClick={onToggle}
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-80 flex flex-col overflow-hidden"
              style={{
                backdropFilter: "blur(25px)",
                background: "rgba(255, 255, 255, 0.88)",
                borderLeft: "1px solid rgba(212, 175, 55, 0.3)",
                boxShadow: "-8px 0 40px rgba(0,0,0,0.12)",
              }}
            >
              <div className="p-5 pb-4 relative">
                <div className="absolute top-0 left-5 right-5 h-[2px] bg-gradient-to-r from-transparent via-accent/40 to-transparent rounded-full" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
                      <Lightbulb size={18} className="text-accent" />
                    </div>
                    <div>
                      <h3 className="font-serif text-base text-primary font-medium">Therapy Prompts</h3>
                      <p className="text-[10px] text-muted-foreground/70">Private — only you can see these</p>
                    </div>
                  </div>
                  <button
                    onClick={onToggle}
                    className="min-w-[44px] min-h-[44px] p-2.5 hover:bg-black/5 rounded-xl transition-colors cursor-pointer flex items-center justify-center"
                    data-testid="button-close-insights"
                  >
                    <X size={20} className="text-muted-foreground" />
                  </button>
                </div>

                <div className="h-[0.5px] mt-3 bg-gradient-to-r from-accent/20 via-accent/10 to-transparent" />
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <div className="px-2 py-1">
                  <p className="text-xs font-bold text-accent uppercase tracking-widest flex items-center gap-1.5">
                    <BookOpen size={11} />
                    {toolData.title}
                  </p>
                </div>

                {toolData.prompts.map((prompt, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10, filter: "blur(2px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ delay: 0.15 + i * 0.06 }}
                    className="p-3 rounded-2xl bg-white/60 hover:bg-white/80 border border-black/5 border-l-2 border-l-accent/25 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-start gap-2.5">
                      <MessageCircle size={14} className="text-accent mt-0.5 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
                      <div>
                        <p className="text-sm font-serif text-primary/80 leading-relaxed">{prompt.text}</p>
                        <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold border mt-1.5", MODALITY_COLORS[prompt.modality] || "bg-gray-100 text-gray-600")}>
                          {prompt.modality}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}

                <div className="h-4" />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
