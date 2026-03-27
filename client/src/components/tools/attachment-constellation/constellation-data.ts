export type AgeMode = "child" | "teen" | "adult";
export type AttachmentStyle = "secure" | "anxious" | "avoidant" | "disorganized" | "unsure";

export interface AnchorItem {
  id: string;
  text: string;
  category: "people" | "places" | "practices";
}

export interface ScenarioAnswer {
  scenarioId: string;
  answerIndex: number;
}

export interface StepConfig {
  title: string;
  subtitle: string;
  icon: string;
}

export const STEP_CONFIGS: StepConfig[] = [
  { title: "Early Bonds", subtitle: "Reflecting on your early experiences", icon: "🌱" },
  { title: "Your Attachment Pattern", subtitle: "Understanding how you connect", icon: "⭐" },
  { title: "Relationship Patterns", subtitle: "Noticing your responses", icon: "🔗" },
  { title: "Your Secure Base", subtitle: "What and who helps you feel safe", icon: "🏠" },
  { title: "Your Constellation", subtitle: "Mapping your connections", icon: "🌌" },
  { title: "Growing Security", subtitle: "Steps toward earned secure attachment", icon: "🌟" },
];

export const ATTACHMENT_STYLES: {
  id: AttachmentStyle;
  label: string;
  emoji: string;
  color: string;
  description: string;
  validation: string;
}[] = [
  {
    id: "secure",
    label: "Secure",
    emoji: "💚",
    color: "#60c480",
    description: "I'm comfortable with closeness and can depend on others",
    validation:
      "Secure attachment is a wonderful foundation. You likely find it natural to trust others, ask for support, and feel comfortable with both closeness and independence.",
  },
  {
    id: "anxious",
    label: "Anxious",
    emoji: "💛",
    color: "#d4c060",
    description: "I worry about relationships and need lots of reassurance",
    validation:
      "Anxious attachment often develops when early care was unpredictable. Your deep capacity to love and connect is a strength — learning to self-soothe can transform your relationships.",
  },
  {
    id: "avoidant",
    label: "Avoidant",
    emoji: "💙",
    color: "#60a8d4",
    description: "I prefer independence and find closeness uncomfortable",
    validation:
      "Avoidant attachment often develops when closeness wasn't safe or available. Your self-reliance is a strength. Learning to gradually let others in can open new depths of connection.",
  },
  {
    id: "disorganized",
    label: "Disorganized",
    emoji: "💜",
    color: "#a080d4",
    description: "I both want and fear closeness; relationships feel unpredictable",
    validation:
      "Disorganized attachment often comes from early experiences where caregivers were both a source of comfort and fear. Healing is possible, and your insight is a powerful first step.",
  },
  {
    id: "unsure",
    label: "I'm not sure / I have a mix",
    emoji: "✨",
    color: "#c4a84c",
    description: "I see myself in more than one style or I'm still figuring it out",
    validation:
      "Many people have a blend of styles, or different patterns in different relationships. Curiosity about your patterns is itself a sign of growth.",
  },
];

export const SCENARIOS: {
  id: string;
  prompt: string;
  options: string[];
}[] = [
  {
    id: "no-reply",
    prompt: "When someone I care about doesn't text back for hours, I usually...",
    options: [
      "Stay calm — they're probably just busy",
      "Feel worried and send a follow-up",
      "Assume they're annoyed at me",
      "Feel both numb and panicked",
    ],
  },
  {
    id: "need-help",
    prompt: "When I need help or support, I...",
    options: [
      "Ask directly and clearly",
      "Hint but don't ask outright",
      "Handle it alone rather than ask",
      "Don't know how to ask for what I need",
    ],
  },
  {
    id: "too-close",
    prompt: "When a relationship feels very close or intense, I...",
    options: [
      "Feel comfortable and secure",
      "Get a little nervous but stay present",
      "Pull away or create distance",
      "Feel trapped or overwhelmed",
    ],
  },
  {
    id: "conflict",
    prompt: "When conflict happens in a relationship, I...",
    options: [
      "Talk it through calmly",
      "Get anxious and overthink it",
      "Shut down or withdraw",
      "React intensely then feel ashamed",
    ],
  },
];

export const SECURITY_PRACTICES: Record<AttachmentStyle, string[]> = {
  secure: [
    "Continue building on your secure base by modeling security for others",
    "Practice expressing needs directly even when it feels unnecessary",
    "Deepen relationships by being present during others' difficult moments",
  ],
  anxious: [
    "Practice self-soothing before reaching out when anxious",
    "Build a 20-minute 'wait window' before sending worry-driven messages",
    "Identify and challenge the story your mind tells about silence from others",
  ],
  avoidant: [
    "Share one small vulnerability with a safe person this week",
    "Notice when you're pulling away and name it to yourself",
    "Practice staying present during emotional conversations instead of problem-solving",
  ],
  disorganized: [
    "Work with a therapist to process early experiences that created fear",
    "Practice the PACE approach: Playful, Accepting, Curious, Empathic",
    "Build predictable, reliable routines that create internal safety",
  ],
  unsure: [
    "Keep a brief relationship journal to notice your emotional patterns",
    "Explore the attachment styles further with a therapist or trusted book",
    "Practice one small act of trusting another person each week",
  ],
};

export const WELCOME_CONTENT = {
  subtitle: {
    child: "Learning about how we connect with the people who matter to us",
    teen: "Understanding your relationship patterns and building deeper connections",
    adult: "An attachment-theory informed exploration of your relational patterns and pathways to earned security",
  },
  instruction: {
    child:
      "The people who love us help us feel safe, like stars in the sky. Today we'll think about the special people in your life and how they help you feel okay.",
    teen: "How we learned to connect as kids shapes how we connect now. This journey helps you understand your attachment style and build healthier, more secure relationships.",
    adult:
      "Drawing from Bowlby's and Ainsworth's attachment theory, this tool guides you through reflecting on early bonds, identifying your attachment pattern, and building toward earned secure attachment.",
  },
};