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
  "dbt-house": {
    title: "DBT House Prompts",
    prompts: [
      { text: "Which layer felt most familiar? Which felt most challenging to place?", modality: "DBT" },
      { text: "When the client placed the Foundation, what came up about their crisis survival strategies?", modality: "DBT" },
      { text: "Did any item prompt a strong emotional response? Explore what was activated.", modality: "Somatic" },
      { text: "How does the client relate to the idea of building skills 'from the ground up'?", modality: "Narrative" },
      { text: "Which DBT skill area does the client seem most confident in? Which needs the most work?", modality: "DBT" },
      { text: "Did the Wise Mind garden resonate? What does their wise mind sound like?", modality: "Mindfulness" },
      { text: "How did they respond to the DEAR MAN desk? Can they identify a real-life situation to practice?", modality: "DBT" },
      { text: "Notice the order they explored items — what does that sequence tell you about their priorities?", modality: "Psychodynamic" },
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
  const toolData = TOOL_PROMPTS[activeTool] || TOOL_PROMPTS["dbt-house"];

  return (
    <>
      {/* Toggle button */}
      <motion.button
        onClick={onToggle}
        className={cn(
          "absolute top-20 md:top-4 right-4 z-30 min-h-[44px] px-4 py-2.5 rounded-2xl shadow-lg transition-all cursor-pointer flex items-center gap-2.5",
          isOpen
            ? "bg-primary text-primary-foreground"
            : "bg-card text-primary hover:bg-card border border-primary/20"
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
            className="absolute inset-0 rounded-2xl border-2 border-primary/20 pointer-events-none"
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
              className="fixed top-0 right-0 bottom-0 z-50 w-80 flex flex-col overflow-hidden bg-card border-l border-border"
              style={{
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
                      <h3 className="font-serif text-base text-foreground font-medium">Therapy Prompts</h3>
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
                    className="p-3 rounded-2xl bg-card hover:bg-card border border-border border-l-2 border-l-primary/20 transition-colors group cursor-pointer"
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
