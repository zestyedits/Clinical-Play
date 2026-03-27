export type AgeMode = "child" | "teen" | "adult";
export type AnxietyCategory =
  | "social"
  | "performance"
  | "health"
  | "phobia"
  | "separation"
  | "animals"
  | "other";
export type CopingCategory = "breathing" | "grounding" | "cognitive" | "physical";
export type ConfidenceLevel = "need-more-time" | "nervous-but-ready" | "ready";

export interface LadderRung {
  id: string;
  description: string;
  suds: number;
}

export interface CopingTool {
  id: string;
  label: string;
  category: CopingCategory;
}

export interface StepConfig {
  title: string;
  subtitle: string;
  icon: string;
}

export const STEP_CONFIGS: StepConfig[] = [
  { title: "Fear Identification", subtitle: "Naming what makes you anxious", icon: "\uD83D\uDE30" },
  { title: "Anxiety Scale", subtitle: "Understanding your distress levels", icon: "\uD83D\uDCCA" },
  { title: "Build Your Ladder", subtitle: "Ranking situations from easier to harder", icon: "\uD83E\uDE9C" },
  { title: "Your Coping Kit", subtitle: "Tools to help you through anxiety", icon: "\uD83E\uDDF0" },
  { title: "Practice Plan", subtitle: "When and how you'll practice", icon: "\uD83D\uDCCB" },
  { title: "Brave Commitment", subtitle: "Making a promise to yourself", icon: "\u2B50" },
];

export const ANXIETY_CATEGORIES: { id: AnxietyCategory; label: string; emoji: string }[] = [
  { id: "social", label: "Social situations", emoji: "\uD83D\uDC65" },
  { id: "performance", label: "Performance", emoji: "\uD83C\uDFAD" },
  { id: "health", label: "Health worries", emoji: "\uD83C\uDFE5" },
  { id: "phobia", label: "Heights / Phobia", emoji: "\uD83D\uDD77\uFE0F" },
  { id: "separation", label: "Separation", emoji: "\uD83D\uDC94" },
  { id: "animals", label: "Animals", emoji: "\uD83D\uDC36" },
  { id: "other", label: "Something else", emoji: "\uD83D\uDCAD" },
];

export const COPING_TOOLS: CopingTool[] = [
  { id: "box-breathing", label: "Box breathing (4-4-4-4)", category: "breathing" },
  { id: "478", label: "4-7-8 breathing", category: "breathing" },
  { id: "belly", label: "Deep belly breathing", category: "breathing" },
  { id: "54321", label: "5-4-3-2-1 grounding", category: "grounding" },
  { id: "cold-water", label: "Cold water on face/wrists", category: "grounding" },
  { id: "name-objects", label: "Name 10 objects nearby", category: "grounding" },
  { id: "fact-check", label: "Fact-check the thought", category: "cognitive" },
  { id: "anxiety-passes", label: "Remind: anxiety always passes", category: "cognitive" },
  { id: "decatastrophize", label: "What's the realistic outcome?", category: "cognitive" },
  { id: "walk", label: "Go for a walk", category: "physical" },
  { id: "pmr", label: "Progressive muscle relaxation", category: "physical" },
  { id: "shake", label: "Shake it out", category: "physical" },
];

export const COPING_CATEGORY_LABELS: Record<CopingCategory, { label: string; emoji: string }> = {
  breathing: { label: "Breathing", emoji: "\uD83D\uDCA8" },
  grounding: { label: "Grounding", emoji: "\uD83C\uDF0D" },
  cognitive: { label: "Cognitive", emoji: "\uD83E\uDDE0" },
  physical: { label: "Physical", emoji: "\uD83C\uDFC3" },
};

export const SUDS_LABELS: { min: number; max: number; label: string; color: string }[] = [
  { min: 0, max: 30, label: "Mild", color: "#60c480" },
  { min: 31, max: 60, label: "Moderate", color: "#d4b44c" },
  { min: 61, max: 100, label: "High", color: "#d47060" },
];

export function getSudsColor(suds: number): string {
  if (suds <= 30) return "#60c480";
  if (suds <= 60) return "#d4b44c";
  return "#d47060";
}

export const WELCOME_CONTENT = {
  subtitle: {
    child: "A gentle way to practice being brave with the things that scare you",
    teen: "Build a ladder to face your fears, one step at a time",
    adult: "A structured CBT exposure therapy tool for graduated anxiety management",
  },
  instruction: {
    child:
      "When something scares us, we can practice it in small steps \u2014 like climbing a ladder. Each step gets a little easier! We'll build your brave ladder together.",
    teen: "Avoiding things that scare you keeps anxiety strong. Exposure therapy works by facing fears gradually, starting with the easiest situations. You'll build your own ladder.",
    adult:
      "This tool guides you through graduated exposure therapy: identifying fears, calibrating distress levels (SUDS), building a fear hierarchy, and creating a structured practice plan.",
  },
};
