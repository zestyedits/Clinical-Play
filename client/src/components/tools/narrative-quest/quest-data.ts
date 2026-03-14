export type AgeMode = "child" | "teen" | "adult";

export interface StepConfig {
  label: string;
  title: string;
  subtitle: string;
  icon: string;
}

export const STEP_CONFIGS: StepConfig[] = [
  { label: "Name the Problem", title: "Meet the Troublemaker", subtitle: "Give the problem a character", icon: "👹" },
  { label: "Hear Its Voice", title: "The Troublemaker Speaks", subtitle: "What does it say to you?", icon: "💬" },
  { label: "Spot the Exceptions", title: "Times You Won", subtitle: "When was the problem smaller?", icon: "⭐" },
  { label: "Find Your Strengths", title: "Your Hidden Powers", subtitle: "What helps you resist?", icon: "💪" },
  { label: "Rewrite the Story", title: "The New Chapter", subtitle: "Who do you want to be?", icon: "✍️" },
  { label: "The Story So Far", title: "Your Narrative", subtitle: "Review your journey", icon: "📖" },
];

export interface SpeechBubble {
  id: string;
  text: string;
  category: "shows-up" | "whispers" | "loudest";
}

export interface ExceptionStar {
  id: string;
  text: string;
}

export interface Strength {
  id: string;
  text: string;
  emoji: string;
}

export const CHARACTER_EMOJIS = [
  "👹", "👻", "🌧️", "🌪️", "🔥", "🧊", "🕸️", "⛓️",
  "🎭", "🐍", "🦇", "🌑", "💀", "🤖", "👁️", "🫥",
];

export const CHARACTER_COLORS = [
  { id: "red", hex: "#c44040", label: "Red" },
  { id: "purple", hex: "#7c4dab", label: "Purple" },
  { id: "gray", hex: "#6b6b7b", label: "Gray" },
  { id: "green", hex: "#4a7a4a", label: "Dark Green" },
  { id: "orange", hex: "#c47a30", label: "Orange" },
  { id: "blue", hex: "#3a5a8a", label: "Dark Blue" },
  { id: "black", hex: "#2a2a3a", label: "Shadow" },
  { id: "brown", hex: "#6b4a30", label: "Brown" },
];

export const CHARACTER_TRAITS = [
  { id: "sneaky", label: "Sneaky", emoji: "🐍" },
  { id: "loud", label: "Loud", emoji: "📢" },
  { id: "persistent", label: "Persistent", emoji: "🔁" },
  { id: "heavy", label: "Heavy", emoji: "🏋️" },
  { id: "isolating", label: "Isolating", emoji: "🏝️" },
  { id: "convincing", label: "Convincing", emoji: "🎭" },
  { id: "freezing", label: "Freezing", emoji: "🧊" },
  { id: "fast", label: "Fast", emoji: "⚡" },
  { id: "confusing", label: "Confusing", emoji: "🌀" },
  { id: "quiet", label: "Quiet", emoji: "🤫" },
  { id: "controlling", label: "Controlling", emoji: "🎮" },
  { id: "exhausting", label: "Exhausting", emoji: "😩" },
];

export const SPEECH_CATEGORIES: { id: SpeechBubble["category"]; label: string; prompt: Record<AgeMode, string> }[] = [
  {
    id: "shows-up",
    label: "When it shows up",
    prompt: {
      child: "When does the troublemaker usually visit you?",
      teen: "When does this problem tend to show up in your life?",
      adult: "In what contexts does the problem exert its strongest influence?",
    },
  },
  {
    id: "whispers",
    label: "What it whispers",
    prompt: {
      child: "What does the troublemaker say to trick you?",
      teen: "What narrative does this problem push? What does it whisper?",
      adult: "What is the dominant story this problem tells about you?",
    },
  },
  {
    id: "loudest",
    label: "When it's loudest",
    prompt: {
      child: "When is the troublemaker the LOUDEST and hardest to ignore?",
      teen: "When does this problem feel most overwhelming or intense?",
      adult: "Under what conditions does the problem's narrative become most dominant?",
    },
  },
];

export interface StrengthCard {
  id: string;
  label: string;
  emoji: string;
  description: Record<AgeMode, string>;
}

export const STRENGTH_CARDS: StrengthCard[] = [
  { id: "courage", label: "Courage", emoji: "🦁", description: { child: "Doing brave things even when scared", teen: "Facing fears instead of running", adult: "Acting with integrity despite uncertainty" } },
  { id: "connection", label: "Connection", emoji: "🤝", description: { child: "Having people who care about you", teen: "The people who have your back", adult: "Meaningful relationships that sustain you" } },
  { id: "creativity", label: "Creativity", emoji: "🎨", description: { child: "Making cool things and having big ideas", teen: "Finding new ways to solve problems", adult: "Approaching challenges with originality" } },
  { id: "humor", label: "Humor", emoji: "😄", description: { child: "Being able to laugh and have fun", teen: "Finding lightness even in hard times", adult: "Using humor as a coping resource" } },
  { id: "persistence", label: "Persistence", emoji: "🏔️", description: { child: "Not giving up when things are hard", teen: "Keeping going even when it's tough", adult: "Sustaining effort despite setbacks" } },
  { id: "kindness", label: "Kindness", emoji: "💛", description: { child: "Being nice to yourself and others", teen: "Caring about people around you", adult: "Extending compassion to self and others" } },
  { id: "wisdom", label: "Wisdom", emoji: "🦉", description: { child: "Knowing smart things about yourself", teen: "Understanding yourself better than you think", adult: "Drawing on lived experience and insight" } },
  { id: "resilience", label: "Resilience", emoji: "🌱", description: { child: "Bouncing back after tough times", teen: "Getting back up after being knocked down", adult: "The capacity to recover and adapt" } },
  { id: "voice", label: "Voice", emoji: "📣", description: { child: "Speaking up for yourself", teen: "Using your voice to say what you need", adult: "Advocating for your own needs and values" } },
  { id: "calm", label: "Inner Calm", emoji: "🧘", description: { child: "Finding your quiet, safe place inside", teen: "Being able to slow down and breathe", adult: "Accessing stillness amid chaos" } },
  { id: "hope", label: "Hope", emoji: "🌅", description: { child: "Believing things can get better", teen: "Knowing this isn't forever", adult: "Maintaining a vision of possibility" } },
  { id: "curiosity", label: "Curiosity", emoji: "🔍", description: { child: "Wanting to know more and learn", teen: "Being open to new perspectives", adult: "Approaching experience with openness" } },
];

export const CUSTOM_STRENGTH_EMOJIS = ["🛡️", "⚔️", "🔥", "🌟", "💎", "🌊", "🔑", "🪄", "🎯", "⭐"];

export const FURTHER_READING = [
  { title: "Maps of Narrative Practice", author: "Michael White", year: 2007, description: "The foundational text on narrative therapy techniques including externalization, re-authoring, and unique outcomes." },
  { title: "Narrative Means to Therapeutic Ends", author: "Michael White & David Epston", year: 1990, description: "The original articulation of narrative therapy, introducing externalization and the use of documents in therapy." },
  { title: "Retelling the Stories of Our Lives", author: "David Denborough", year: 2014, description: "An accessible introduction to narrative therapy for both practitioners and the general public." },
  { title: "Narrative Therapy with Children and Their Families", author: "Michael White & Alice Morgan", year: 2006, description: "Applying narrative practices with young people, including playful externalization techniques." },
  { title: "What Is Narrative Therapy? An Easy-to-Read Introduction", author: "Alice Morgan", year: 2000, description: "A clear, jargon-free guide to narrative therapy principles and practices." },
];

export const AGE_LABELS: Record<AgeMode, { problemPrompt: string; problemPlaceholder: string; namePrompt: string; namePlaceholder: string; rewritePrompt: string; rewritePlaceholder: string }> = {
  child: {
    problemPrompt: "What's the thing that's been bugging you? Let's turn it into a character — like a sneaky monster or a bossy cloud!",
    problemPlaceholder: "The problem is like a...",
    namePrompt: "What should we call this troublemaker?",
    namePlaceholder: "e.g., The Worry Monster, Bossy Brain",
    rewritePrompt: "If you could write the next chapter of your story, what would happen? How would you shrink the troublemaker?",
    rewritePlaceholder: "In my new story, I would...",
  },
  teen: {
    problemPrompt: "Think about the issue that's been weighing on you. If it were a character in your life's story, what would it look like?",
    problemPlaceholder: "The problem shows up as...",
    namePrompt: "Give it a name — something that captures what it does to you.",
    namePlaceholder: "e.g., The Inner Critic, The Fog, The Wall",
    rewritePrompt: "If you were writing the next chapter of your story, what would be different? What role does the problem play now?",
    rewritePlaceholder: "In my new chapter, I would...",
  },
  adult: {
    problemPrompt: "In Narrative Therapy, we separate the person from the problem. Describe the issue you're facing as if it were an external entity — a character in your life story.",
    problemPlaceholder: "The problem manifests as...",
    namePrompt: "Externalize it — give it a name that captures its influence on you.",
    namePlaceholder: "e.g., The Perfectionist, The Shutdown, Imposter",
    rewritePrompt: "Author a preferred narrative. If the problem no longer defined your story, what would the next chapter look like?",
    rewritePlaceholder: "My preferred narrative includes...",
  },
};
