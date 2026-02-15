import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, MessageCircle, BookOpen, Sparkles, AlertTriangle, X } from "lucide-react";
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
};

const EMOTION_PROMPTS: Record<string, { text: string; modality: string }[]> = {
  sadness: [
    { text: "Grief is a heavy stone; ask where they feel that weight in their body.", modality: "Somatic" },
    { text: "What would you say to the grief if it could hear you?", modality: "Gestalt" },
    { text: "When does the grief feel most present?", modality: "Mindfulness" },
    { text: "If your sadness could write a letter, who would it be addressed to?", modality: "Narrative" },
  ],
  grief: [
    { text: "Grief is a heavy stone; ask where they feel that weight in their body.", modality: "Somatic" },
    { text: "What would you say to the grief if it could hear you?", modality: "Gestalt" },
    { text: "When does the grief feel most present?", modality: "Mindfulness" },
    { text: "What does this grief tell you about what you loved?", modality: "Attachment" },
  ],
  anger: [
    { text: "What is the anger protecting?", modality: "Psychodynamic" },
    { text: "If you could direct that anger somewhere safe, where would it go?", modality: "DBT" },
    { text: "Rate the intensity of the anger from 1-10.", modality: "Solution-Focused" },
    { text: "What would the anger say if it had a voice?", modality: "Gestalt" },
  ],
  fear: [
    { text: "What's the worst that could happen? And then what?", modality: "CBT" },
    { text: "Where in your body do you notice the fear?", modality: "Somatic" },
    { text: "What would safety look like right now?", modality: "Solution-Focused" },
    { text: "If you could shrink this fear to fit in your hand, what would it look like?", modality: "Play Therapy" },
  ],
  anxiety: [
    { text: "What's the worst that could happen? And then what?", modality: "CBT" },
    { text: "Where in your body do you notice the anxiety?", modality: "Somatic" },
    { text: "What would safety look like right now?", modality: "Solution-Focused" },
    { text: "Name three things you can see, hear, and feel right now.", modality: "DBT" },
  ],
  joy: [
    { text: "What contributed to this feeling? Can you name three things?", modality: "CBT" },
    { text: "How can you hold onto this feeling longer?", modality: "Mindfulness" },
    { text: "Who would you want to share this joy with?", modality: "Attachment" },
    { text: "What does this joy tell you about what matters most to you?", modality: "ACT" },
  ],
  happiness: [
    { text: "What contributed to this feeling? Can you name three things?", modality: "CBT" },
    { text: "How can you hold onto this feeling longer?", modality: "Mindfulness" },
    { text: "Who would you want to share this joy with?", modality: "Attachment" },
    { text: "How can you create more moments like this?", modality: "Solution-Focused" },
  ],
  shame: [
    { text: "What would you say to a friend feeling this way?", modality: "CBT" },
    { text: "Where did you first learn this shame?", modality: "Psychodynamic" },
    { text: "What would self-compassion look like right now?", modality: "Mindfulness" },
    { text: "Is this shame yours, or did someone give it to you?", modality: "Narrative" },
  ],
  disgust: [
    { text: "What boundary is being crossed?", modality: "DBT" },
    { text: "What value is this feeling protecting?", modality: "ACT" },
    { text: "How would you like to respond differently?", modality: "Solution-Focused" },
    { text: "What does this reaction tell you about your needs?", modality: "Psychodynamic" },
  ],
  surprise: [
    { text: "Was this a welcome or unwelcome surprise?", modality: "Mindfulness" },
    { text: "What expectation was disrupted?", modality: "CBT" },
    { text: "How did your body respond in that moment?", modality: "Somatic" },
  ],
  love: [
    { text: "What does this love feel like in your body?", modality: "Somatic" },
    { text: "How do you express this feeling to others?", modality: "Attachment" },
    { text: "What does this love teach you about yourself?", modality: "Narrative" },
  ],
};

const TOOL_PROMPTS: Record<string, { title: string; prompts: { text: string; modality: string }[] }> = {
  sandtray: {
    title: "Sandtray Reflection Prompts",
    prompts: [
      { text: "Which object represents your boundary right now?", modality: "Play Therapy" },
      { text: "If you could add one more item, what would it be and where?", modality: "Play Therapy" },
      { text: "Tell me about the relationship between these two objects.", modality: "Attachment" },
      { text: "What would happen if we moved this object closer to that one?", modality: "Gestalt" },
      { text: "Which object feels the safest to you? Why?", modality: "Attachment" },
      { text: "Is there anything missing from your world?", modality: "Psychodynamic" },
      { text: "If this scene could speak, what would it say?", modality: "Narrative" },
      { text: "Which object would you remove if you had to choose one?", modality: "Play Therapy" },
    ],
  },
  breathing: {
    title: "Breathing Exercise Prompts",
    prompts: [
      { text: "Notice where you feel the breath in your body.", modality: "Somatic" },
      { text: "What color would you give your breath right now?", modality: "Play Therapy" },
      { text: "As you exhale, imagine releasing one worry.", modality: "Mindfulness" },
      { text: "How does your body feel different from when we started?", modality: "Somatic" },
      { text: "Rate your calm level from 1-10 before and after.", modality: "Solution-Focused" },
      { text: "What did you notice during the hold phase?", modality: "Mindfulness" },
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
  narrative: {
    title: "Narrative Timeline Prompts",
    prompts: [
      { text: "Which event on the timeline feels the heaviest?", modality: "Somatic" },
      { text: "Are there any gaps in the timeline that feel important?", modality: "Narrative" },
      { text: "What would the 'turning point' stone look like for you?", modality: "Narrative" },
      { text: "If you could change one event, which would it be?", modality: "Narrative" },
      { text: "What theme connects these events together?", modality: "Narrative" },
      { text: "Which event are you most proud of surviving?", modality: "Narrative" },
      { text: "What stone would you place for today? Where does it go?", modality: "Play Therapy" },
      { text: "If your future had a stone, what color and label would it have?", modality: "Solution-Focused" },
    ],
  },
  "values-sort": {
    title: "Values Card Sort Prompts",
    prompts: [
      { text: "Were any of these categories surprising to you?", modality: "Mindfulness" },
      { text: "Which value did you sort the fastest — what does that tell us?", modality: "CBT" },
      { text: "Is there a tension between any of your top values?", modality: "ACT" },
      { text: "How aligned is your daily life with your top values?", modality: "ACT" },
      { text: "Which 'Not Important' value used to be important to you?", modality: "Narrative" },
      { text: "If you had to keep only three, which would they be?", modality: "ACT" },
      { text: "How does seeing your values laid out make you feel?", modality: "Mindfulness" },
      { text: "What would change if you lived more by your #1 value?", modality: "Solution-Focused" },
    ],
  },
};

function getEmotionPrompts(emotion: string): { text: string; modality: string }[] | null {
  const key = emotion.toLowerCase().trim();
  if (EMOTION_PROMPTS[key]) return EMOTION_PROMPTS[key];
  for (const [emotionKey, prompts] of Object.entries(EMOTION_PROMPTS)) {
    if (key.includes(emotionKey) || emotionKey.includes(key)) return prompts;
  }
  return null;
}

interface ClinicalInsightsProps {
  isOpen: boolean;
  onToggle: () => void;
  activeTool: string;
  sessionContext?: {
    latestEmotion?: string;
    itemCount?: number;
    timelineEventCount?: number;
    valuesCardCount?: number;
  };
}

export function ClinicalInsights({ isOpen, onToggle, activeTool, sessionContext }: ClinicalInsightsProps) {
  const toolData = TOOL_PROMPTS[activeTool] || TOOL_PROMPTS.sandtray;

  const emotionPrompts = activeTool === "feelings" && sessionContext?.latestEmotion
    ? getEmotionPrompts(sessionContext.latestEmotion)
    : null;

  const sandtrayNote = activeTool === "sandtray" && sessionContext?.itemCount && sessionContext.itemCount > 5
    ? `The canvas has ${sessionContext.itemCount} items — consider asking about overwhelm or organization.`
    : null;

  const narrativeNote = activeTool === "narrative" && sessionContext?.timelineEventCount && sessionContext.timelineEventCount > 3
    ? `The timeline has ${sessionContext.timelineEventCount} events — look for patterns or recurring themes.`
    : null;

  const contextNote = sandtrayNote || narrativeNote;

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
            {/* Backdrop overlay — click to dismiss */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/20"
              onClick={onToggle}
            />

            {/* Slide-in panel */}
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
              {/* Header with close button */}
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

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {/* Emotion-aware section */}
                {emotionPrompts && sessionContext?.latestEmotion && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-2xl bg-gradient-to-br from-primary/8 via-accent/8 to-primary/4 border border-primary/15 p-3 space-y-2 overflow-hidden relative"
                    data-testid="context-aware-insight"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles size={14} className="text-primary" />
                      <p className="text-xs font-bold text-primary uppercase tracking-widest">
                        Based on: {sessionContext.latestEmotion}
                      </p>
                    </div>
                    {emotionPrompts.map((prompt, i) => (
                      <motion.div
                        key={`emotion-${i}`}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="p-2.5 rounded-xl bg-white/60 hover:bg-white/80 transition-colors group cursor-pointer"
                      >
                        <div className="flex items-start gap-2">
                          <Sparkles size={12} className="text-primary mt-0.5 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
                          <div>
                            <p className="text-sm font-serif text-primary/90 leading-relaxed">{prompt.text}</p>
                            <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold border mt-1.5", MODALITY_COLORS[prompt.modality] || "bg-gray-100 text-gray-600")}>
                              {prompt.modality}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {/* Context note */}
                {contextNote && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/40"
                    data-testid="context-note"
                  >
                    <div className="flex items-start gap-2">
                      <AlertTriangle size={13} className="text-amber-600 mt-0.5 shrink-0" />
                      <p className="text-xs text-amber-800 leading-relaxed">{contextNote}</p>
                    </div>
                  </motion.div>
                )}

                {/* Tool prompts section header */}
                <div className="px-2 py-1">
                  <p className="text-xs font-bold text-accent uppercase tracking-widest flex items-center gap-1.5">
                    <BookOpen size={11} />
                    {toolData.title}
                  </p>
                </div>

                {/* Prompt cards */}
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

                {/* Bottom padding for scroll */}
                <div className="h-4" />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
