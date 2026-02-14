import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Lightbulb, MessageCircle, BookOpen, Sparkles, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const EMOTION_PROMPTS: Record<string, string[]> = {
  sadness: [
    "Grief is a heavy stone; ask where they feel that weight in their body.",
    "What would you say to the grief if it could hear you?",
    "When does the grief feel most present?",
    "If your sadness could write a letter, who would it be addressed to?",
  ],
  grief: [
    "Grief is a heavy stone; ask where they feel that weight in their body.",
    "What would you say to the grief if it could hear you?",
    "When does the grief feel most present?",
    "What does this grief tell you about what you loved?",
  ],
  anger: [
    "What is the anger protecting?",
    "If you could direct that anger somewhere safe, where would it go?",
    "Rate the intensity of the anger from 1-10.",
    "What would the anger say if it had a voice?",
  ],
  fear: [
    "What's the worst that could happen? And then what?",
    "Where in your body do you notice the fear?",
    "What would safety look like right now?",
    "If you could shrink this fear to fit in your hand, what would it look like?",
  ],
  anxiety: [
    "What's the worst that could happen? And then what?",
    "Where in your body do you notice the anxiety?",
    "What would safety look like right now?",
    "Name three things you can see, hear, and feel right now.",
  ],
  joy: [
    "What contributed to this feeling? Can you name three things?",
    "How can you hold onto this feeling longer?",
    "Who would you want to share this joy with?",
    "What does this joy tell you about what matters most to you?",
  ],
  happiness: [
    "What contributed to this feeling? Can you name three things?",
    "How can you hold onto this feeling longer?",
    "Who would you want to share this joy with?",
    "How can you create more moments like this?",
  ],
  shame: [
    "What would you say to a friend feeling this way?",
    "Where did you first learn this shame?",
    "What would self-compassion look like right now?",
    "Is this shame yours, or did someone give it to you?",
  ],
  disgust: [
    "What boundary is being crossed?",
    "What value is this feeling protecting?",
    "How would you like to respond differently?",
    "What does this reaction tell you about your needs?",
  ],
  surprise: [
    "Was this a welcome or unwelcome surprise?",
    "What expectation was disrupted?",
    "How did your body respond in that moment?",
  ],
  love: [
    "What does this love feel like in your body?",
    "How do you express this feeling to others?",
    "What does this love teach you about yourself?",
  ],
};

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

function getEmotionPrompts(emotion: string): string[] | null {
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
      <motion.button
        onClick={onToggle}
        className={cn(
          "absolute top-20 md:top-4 right-4 z-30 min-w-[44px] min-h-[44px] p-3 rounded-2xl shadow-lg transition-all cursor-pointer flex items-center justify-center relative",
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
        {!isOpen && (
          <motion.div
            className="absolute inset-0 rounded-2xl border-2 border-accent/20 pointer-events-none"
            animate={{ opacity: [0, 0.5, 0], scale: [1, 1.15, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-80 flex flex-col overflow-hidden"
            style={{
              backdropFilter: "blur(25px)",
              background: "rgba(255, 255, 255, 0.15)",
              borderLeft: "0.5px solid rgba(212, 175, 55, 0.5)",
            }}
          >
            <div className="p-5 pb-4 relative">
              {/* Gold accent line */}
              <div className="absolute top-0 left-5 right-5 h-[2px] bg-gradient-to-r from-transparent via-accent/40 to-transparent rounded-full" />

              <div className="flex items-center gap-3 mb-1.5">
                <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Lightbulb size={18} className="text-accent" />
                </div>
                <div>
                  <h3 className="font-serif text-base text-primary font-medium">Clinical Insights</h3>
                  <p className="text-[10px] text-muted-foreground/70">Private to you</p>
                </div>
              </div>

              <div className="h-[0.5px] mt-3 bg-gradient-to-r from-accent/20 via-accent/10 to-transparent" />
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {emotionPrompts && sessionContext?.latestEmotion && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-2xl bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 border border-primary/20 p-3 space-y-2 overflow-hidden relative"
                  data-testid="context-aware-insight"
                >
                  <div className="absolute inset-0 shimmer-border opacity-20 pointer-events-none" />
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
                      className="p-2.5 rounded-xl bg-white/50 hover:bg-white/70 transition-colors group cursor-pointer"
                    >
                      <div className="flex items-start gap-2">
                        <Sparkles size={12} className="text-primary mt-0.5 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
                        <p className="text-sm font-serif text-primary/90 leading-relaxed">{prompt}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {contextNote && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/40"
                  data-testid="context-note"
                >
                  <div className="flex items-start gap-2">
                    <AlertTriangle size={13} className="text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-800 leading-relaxed">{contextNote}</p>
                  </div>
                </motion.div>
              )}

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
                  className="p-3 rounded-2xl glass-tool-card border-l-2 border-l-accent/20 transition-colors group cursor-pointer"
                >
                  <div className="flex items-start gap-2.5">
                    <MessageCircle size={14} className="text-accent mt-0.5 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
                    <p className="text-sm font-serif text-primary/80 leading-relaxed">{prompt}</p>
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
