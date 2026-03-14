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

export const STRENGTH_EMOJIS = ["🛡️", "⚔️", "🔥", "🌟", "💎", "🦁", "🏔️", "🌊", "🧭", "🔑", "🪄", "🎯"];

export const AGE_LABELS: Record<AgeMode, { problemPrompt: string; problemPlaceholder: string; namePrompt: string; namePlaceholder: string; speechPrompt: string; speechPlaceholder: string; exceptionPrompt: string; exceptionPlaceholder: string; strengthPrompt: string; strengthPlaceholder: string; rewritePrompt: string; rewritePlaceholder: string }> = {
  child: {
    problemPrompt: "What's the thing that's been bugging you? Let's turn it into a character — like a sneaky monster or a bossy cloud!",
    problemPlaceholder: "The problem is like a...",
    namePrompt: "What should we call this troublemaker?",
    namePlaceholder: "e.g., The Worry Monster, Bossy Brain",
    speechPrompt: "What does this troublemaker say to you? What tricks does it use?",
    speechPlaceholder: "It says things like...",
    exceptionPrompt: "Can you think of times when the troublemaker was quiet or you didn't listen to it?",
    exceptionPlaceholder: "One time I didn't listen was...",
    strengthPrompt: "What superpowers do you have that help you fight the troublemaker?",
    strengthPlaceholder: "I'm really good at...",
    rewritePrompt: "If you could write the next chapter of your story, what would happen? How would you shrink the troublemaker?",
    rewritePlaceholder: "In my new story, I would...",
  },
  teen: {
    problemPrompt: "Think about the issue that's been weighing on you. If it were a character in your life's story, what would it look like?",
    problemPlaceholder: "The problem shows up as...",
    namePrompt: "Give it a name — something that captures what it does to you.",
    namePlaceholder: "e.g., The Inner Critic, The Fog, The Wall",
    speechPrompt: "What narrative does this problem push on you? What does it whisper?",
    speechPlaceholder: "It tells me that...",
    exceptionPrompt: "When were the times this problem had less power over you? What was different?",
    exceptionPlaceholder: "There was a time when...",
    strengthPrompt: "What qualities or skills have helped you push back against this?",
    strengthPlaceholder: "Something that helps me is...",
    rewritePrompt: "If you were writing the next chapter of your story, what would be different? What role does the problem play now?",
    rewritePlaceholder: "In my new chapter, I would...",
  },
  adult: {
    problemPrompt: "In Narrative Therapy, we separate the person from the problem. Describe the issue you're facing as if it were an external entity — a character in your life story.",
    problemPlaceholder: "The problem manifests as...",
    namePrompt: "Externalize it — give it a name that captures its influence on you.",
    namePlaceholder: "e.g., The Perfectionist, The Shutdown, Imposter",
    speechPrompt: "What is the dominant story this problem tells about you? What messages does it reinforce?",
    speechPlaceholder: "The dominant narrative is...",
    exceptionPrompt: "Identify unique outcomes — moments when you acted outside the problem's influence. What made those moments possible?",
    exceptionPlaceholder: "A time I resisted was...",
    strengthPrompt: "What personal qualities, values, or resources have helped you resist the problem's influence?",
    strengthPlaceholder: "A strength I draw on is...",
    rewritePrompt: "Author a preferred narrative. If the problem no longer defined your story, what would the next chapter look like?",
    rewritePlaceholder: "My preferred narrative includes...",
  },
};
