export type AgeMode = "child" | "teen" | "adult";
export type BodyRegion = "head" | "chest" | "belly" | "arms" | "legs" | "back";
export type LKRecipient = "self" | "loved" | "neutral" | "all";

export interface StepConfig {
  title: string;
  subtitle: string;
  icon: string;
}

export const STEP_CONFIGS: StepConfig[] = [
  { title: "Arriving Here", subtitle: "Notice what's present as you arrive", icon: "🍃" },
  { title: "Body Scan", subtitle: "Where is your body holding tension right now?", icon: "🫀" },
  { title: "Thought Clouds", subtitle: "Name each thought without judgment", icon: "☁️" },
  { title: "Mindful Observation", subtitle: "Ground yourself through your senses", icon: "🌸" },
  { title: "Loving-Kindness", subtitle: "Offer warmth to yourself and others", icon: "💛" },
  { title: "Your Mindful Moment", subtitle: "Gather what you've noticed today", icon: "🌿" },
];

export const BODY_REGIONS: { id: BodyRegion; label: string; emoji: string }[] = [
  { id: "head", label: "Head / Mind", emoji: "🧠" },
  { id: "chest", label: "Chest / Heart", emoji: "💙" },
  { id: "belly", label: "Belly", emoji: "🌀" },
  { id: "arms", label: "Arms / Hands", emoji: "🤲" },
  { id: "legs", label: "Legs / Feet", emoji: "🦵" },
  { id: "back", label: "Shoulders / Back", emoji: "⬜" },
];

export const LK_RECIPIENTS: { id: LKRecipient; label: string; emoji: string; desc: string }[] = [
  { id: "self", label: "Myself", emoji: "🫀", desc: "Offering kindness inward" },
  { id: "loved", label: "A Loved One", emoji: "💛", desc: "Someone dear to you" },
  { id: "neutral", label: "A Neutral Person", emoji: "🌿", desc: "Someone you barely know" },
  { id: "all", label: "All Beings", emoji: "🌍", desc: "The whole world" },
];

export const LK_PHRASES: Record<LKRecipient, string[]> = {
  self: [
    "May I be safe and protected.",
    "May I be healthy and strong.",
    "May I live with ease and joy.",
  ],
  loved: [
    "May you be safe and protected.",
    "May you be healthy and strong.",
    "May you live with ease and joy.",
  ],
  neutral: [
    "May you be safe and protected.",
    "May you be healthy and strong.",
    "May you live with ease and joy.",
  ],
  all: [
    "May all beings be safe and protected.",
    "May all beings be healthy and strong.",
    "May all beings live with ease and joy.",
  ],
};

export const SENSE_PROMPTS = [
  { count: 5, sense: "see", emoji: "👁️", label: "5 things you can see" },
  { count: 4, sense: "touch", emoji: "🤲", label: "4 things you can touch or feel" },
  { count: 3, sense: "hear", emoji: "👂", label: "3 things you can hear" },
  { count: 2, sense: "smell", emoji: "👃", label: "2 things you can smell" },
  { count: 1, sense: "taste", emoji: "👅", label: "1 thing you can taste" },
];

export const WELCOME_CONTENT = {
  subtitle: {
    child: "A gentle place to notice how you feel inside",
    teen: "A space to slow down and check in with yourself",
    adult: "A structured mindfulness practice for present-moment awareness",
  },
  instruction: {
    child:
      "We're going to take a short journey to notice what's happening inside your body and mind. There's nothing to fix — just to see.",
    teen: "In a few steps, you'll check in with your body, name some thoughts, and practice being kind to yourself. It takes about 5 minutes.",
    adult:
      "This practice guides you through a brief MBSR-informed mindfulness sequence: breath awareness, body scan, thought naming, sensory grounding, and loving-kindness.",
  },
};
