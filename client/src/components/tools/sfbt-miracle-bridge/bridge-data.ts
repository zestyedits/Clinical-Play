export interface BridgeStep {
  id: string;
  position: number;
  name: string;
  emoji: string;
  color: string;
  question: string;
  helpText: string;
  placeholder: string;
  discussionPrompt: string;
}

export interface ScalingQuestion {
  id: string;
  question: string;
  lowLabel: string;
  highLabel: string;
  followUp: string;
}

export const BRIDGE_STEPS: BridgeStep[] = [
  {
    id: "today",
    position: 0,
    name: "Where You Are Today",
    emoji: "\u{1F4CD}",
    color: "#8a7768",
    question: "In a few words, describe what life looks like right now \u2014 the situation that brought you here.",
    helpText: "There are no wrong answers. Just describe your current experience honestly.",
    placeholder: "Right now, things feel like...",
    discussionPrompt: "Thank you for sharing that. It takes courage to name where you are. What was it like to put that into words?",
  },
  {
    id: "miracle-morning",
    position: 1,
    name: "The Miracle Morning",
    emoji: "\u{1F31F}",
    color: "#9b87c4",
    question: "Imagine tonight while you sleep, a miracle happens and the problem is solved. When you wake up tomorrow, what\u2019s the first thing you notice that tells you something is different?",
    helpText: "Focus on what you\u2019d notice \u2014 not what\u2019s gone, but what\u2019s there instead.",
    placeholder: "The first thing I\u2019d notice is...",
    discussionPrompt: "That first small sign is important \u2014 it tells us what matters most to you. How vivid was that picture in your mind?",
  },
  {
    id: "others-notice",
    position: 2,
    name: "What Others Would See",
    emoji: "\u{1F465}",
    color: "#6b9a82",
    question: "If someone close to you saw you on this miracle morning, what would they notice is different about you? What would they see you doing?",
    helpText: "Think about how the change would show up in your actions, body language, or energy.",
    placeholder: "They would notice that I...",
    discussionPrompt: "When we can see the change through someone else\u2019s eyes, it becomes more concrete. Who was the person you imagined noticing the difference?",
  },
  {
    id: "exception-finding",
    position: 3,
    name: "Times It Already Happened",
    emoji: "\u{1F50D}",
    color: "#c4943a",
    question: "Think back \u2014 has there been a time, even briefly, when a small piece of this miracle was already happening? When the problem was a little less heavy?",
    helpText: "Even tiny moments count. A morning that felt slightly better, a day you coped differently.",
    placeholder: "There was a time when...",
    discussionPrompt: "That exception is powerful evidence that this isn\u2019t impossible \u2014 part of the miracle has already shown up in your life. What made that moment possible?",
  },
  {
    id: "scaling",
    position: 4,
    name: "Where You Stand",
    emoji: "\u{1F4CA}",
    color: "#5a8aaa",
    question: "On a scale of 1 to 10, where 10 is your miracle day and 1 is the hardest it\u2019s ever been \u2014 where are you right now?",
    helpText: "There\u2019s no right answer. This is just a snapshot of today.",
    placeholder: "",
    discussionPrompt: "You\u2019re not at a 1 \u2014 that means you\u2019ve already done things to move yourself forward. What\u2019s keeping you from being one number lower?",
  },
  {
    id: "one-step",
    position: 5,
    name: "One Step Forward",
    emoji: "\u{1F9ED}",
    color: "#7a9a6b",
    question: "What would it take to move just one number higher on that scale? What\u2019s the smallest thing that could shift?",
    helpText: "Think small and specific. Not a life overhaul \u2014 just one tiny step forward.",
    placeholder: "One small thing I could do is...",
    discussionPrompt: "Small steps are how real change happens. This one step isn\u2019t small at all \u2014 it\u2019s the beginning of something. When could you try this?",
  },
  {
    id: "miracle-day",
    position: 6,
    name: "Your Miracle Day",
    emoji: "\u{1F305}",
    color: "#d4a853",
    question: "Walk through your entire miracle day, from morning to night. What does it look like? How do you feel, who are you with, what are you doing?",
    helpText: "Take your time. The more detail, the more real it becomes.",
    placeholder: "My miracle day would look like...",
    discussionPrompt: "You just created a detailed vision of the life you want. This isn\u2019t fantasy \u2014 every detail you described is something we can work toward. Which part felt most meaningful to you?",
  },
];

export const SCALING_QUESTIONS: ScalingQuestion[] = [
  { id: "confidence", question: "How confident are you that you can move one step closer to your miracle?", lowLabel: "Not at all confident", highLabel: "Very confident", followUp: "What would increase your confidence by one point?" },
  { id: "motivation", question: "How motivated are you to make a change right now?", lowLabel: "Not motivated", highLabel: "Very motivated", followUp: "What\u2019s driving that motivation, even at this level?" },
  { id: "hope", question: "How hopeful do you feel that things can be different?", lowLabel: "Not hopeful", highLabel: "Very hopeful", followUp: "What\u2019s kept that hope alive, even through difficult times?" },
];
