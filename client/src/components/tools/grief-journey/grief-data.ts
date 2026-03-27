import type { Reference } from "../shared/FurtherReading";

export type AgeMode = "child" | "teen" | "adult";
export type LossType =
  | "person"
  | "pet"
  | "relationship"
  | "life-stage"
  | "health"
  | "dream"
  | "other";
export type LetterRecipient = "lost" | "younger-self" | "future-self" | "grief";
export type GriefEmotion =
  | "sadness"
  | "grief"
  | "anger"
  | "guilt"
  | "relief"
  | "numbness"
  | "longing"
  | "confusion"
  | "love"
  | "fear"
  | "gratitude"
  | "loneliness";

export interface Memory {
  id: string;
  text: string;
}

export interface StepConfig {
  title: string;
  subtitle: string;
  icon: string;
}

export const STEP_CONFIGS: StepConfig[] = [
  { title: "The Loss", subtitle: "Acknowledging what has changed", icon: "\uD83D\uDD6F\uFE0F" },
  { title: "Feelings Lanterns", subtitle: "Naming what you carry inside", icon: "\uD83C\uDFEE" },
  { title: "Memory Garden", subtitle: "Honoring what was precious", icon: "\uD83C\uDF39" },
  { title: "A Letter", subtitle: "Words that need to be said", icon: "\u270D\uFE0F" },
  { title: "Finding Meaning", subtitle: "What this journey has shown you", icon: "\uD83D\uDCAB" },
  { title: "Continuing Bonds", subtitle: "Carrying love forward", icon: "\uD83C\uDF1F" },
];

export const LOSS_TYPES: { id: LossType; label: string; emoji: string }[] = [
  { id: "person", label: "A Person", emoji: "\uD83E\uDEC2" },
  { id: "pet", label: "A Pet", emoji: "\uD83D\uDC3E" },
  { id: "relationship", label: "A Relationship", emoji: "\uD83D\uDC94" },
  { id: "life-stage", label: "A Life Stage", emoji: "\u23F3" },
  { id: "health", label: "My Health", emoji: "\uD83D\uDC8A" },
  { id: "dream", label: "A Dream", emoji: "\uD83C\uDF19" },
  { id: "other", label: "Something Else", emoji: "\uD83D\uDCAD" },
];

export const GRIEF_EMOTIONS: { id: GriefEmotion; label: string; color: string }[] = [
  { id: "sadness", label: "Sadness", color: "#6080d4" },
  { id: "grief", label: "Grief", color: "#7060c4" },
  { id: "anger", label: "Anger", color: "#d47060" },
  { id: "guilt", label: "Guilt", color: "#c46080" },
  { id: "relief", label: "Relief", color: "#60c480" },
  { id: "numbness", label: "Numbness", color: "#8090a8" },
  { id: "longing", label: "Longing", color: "#a08060" },
  { id: "confusion", label: "Confusion", color: "#c4a060" },
  { id: "love", label: "Love", color: "#d47890" },
  { id: "fear", label: "Fear", color: "#a06080" },
  { id: "gratitude", label: "Gratitude", color: "#80b060" },
  { id: "loneliness", label: "Loneliness", color: "#6070a8" },
];

export const LETTER_RECIPIENTS: {
  id: LetterRecipient;
  label: string;
  emoji: string;
  prompt: string;
}[] = [
  {
    id: "lost",
    label: "To who I lost",
    emoji: "\uD83D\uDD6F\uFE0F",
    prompt: "Write what you wish you could say...",
  },
  {
    id: "younger-self",
    label: "To my younger self",
    emoji: "\uD83E\uDDD2",
    prompt: "What would you tell yourself before this loss?",
  },
  {
    id: "future-self",
    label: "To my future self",
    emoji: "\uD83C\uDF05",
    prompt: "What do you hope for yourself going forward?",
  },
  {
    id: "grief",
    label: "To grief itself",
    emoji: "\uD83C\uDF0A",
    prompt: "What do you want to say to grief?",
  },
];

export const WELCOME_CONTENT = {
  subtitle: {
    child: "A gentle space to talk about missing someone or something important",
    teen: "A place to explore your feelings about loss, at your own pace",
    adult: "A structured grief-processing journey guided by therapeutic principles",
  },
  instruction: {
    child:
      "Feeling sad when we lose something we love is normal and okay. We'll light some lanterns together to help carry those feelings.",
    teen: "This space is for you to explore what you're carrying. There are no right answers \u2014 just your truth. Take your time.",
    adult:
      "Drawing from Worden's Tasks of Mourning and Continuing Bonds theory, this journey invites you to acknowledge, feel, remember, and carry your grief with compassion.",
  },
};

export const GRIEF_REFERENCES: Reference[] = [
  {
    title: "Grief Counseling and Grief Therapy",
    author: "J. William Worden",
    year: 2018,
    description:
      "The foundational text introducing Worden's Four Tasks of Mourning: accepting the reality of the loss, working through grief pain, adjusting to a changed world, and finding an enduring connection.",
  },
  {
    title: "Continuing Bonds: New Understandings of Grief",
    author: "Dennis Klass, Phyllis R. Silverman & Steven L. Nickman",
    year: 1996,
    description:
      "The landmark collection challenging the letting-go model of grief, proposing that maintaining an inner bond with the deceased supports healthy mourning.",
  },
  {
    title: "The Other Side of Sadness",
    author: "George A. Bonanno",
    year: 2009,
    description:
      "Research-based exploration of grief resilience, showing how people oscillate between grief and positive emotion in ways that support adaptation.",
  },
  {
    title: "On Grief and Grieving",
    author: "Elisabeth Kubler-Ross & David Kessler",
    year: 2005,
    description:
      "A compassionate guide applying the five stages framework to grief, emphasizing the non-linear, personal nature of mourning.",
  },
  {
    title: "The Grief Recovery Handbook",
    author: "John W. James & Russell Friedman",
    year: 2009,
    description:
      "An action program for moving beyond death, divorce, and other losses, offering concrete tools for completing unfinished emotional business.",
  },
  {
    title: "It's OK That You're Not OK",
    author: "Megan Devine",
    year: 2017,
    description:
      "A compassionate reframe of grief as a natural response to loss rather than a problem to be solved, with practical guidance for grievers.",
  },
];
