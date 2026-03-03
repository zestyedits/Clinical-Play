/**
 * ClinicalPlay Tools Library
 *
 * Each tool has full clinical metadata for the Library page.
 * To add a tool: copy any entry, change the id, and fill in the fields.
 */

export interface ToolDefinition {
  id: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  icon: string;
  category: "tool" | "game";
  modalities: string[];
  ageRanges: string[];
  intensity: "gentle" | "moderate" | "deep";
  duration: string;
  interactionType: "expressive" | "reflective" | "somatic" | "cognitive" | "relational";
  status: "active" | "development" | "planned";
  tier: "free" | "pro";
  bestUsedFor: string[];
  adaptations: string;
  pitfalls: string;
  safetyNotes: string;
  producesArtifact: boolean;
  lastUsed: string | null;
  timesUsed: number;
}

export const MODALITY_OPTIONS = [
  "CBT", "DBT", "ACT", "EMDR", "IFS", "Play Therapy",
  "Somatic", "Attachment", "Solution-Focused", "Psychoeducation",
  "Art Therapy", "Narrative Therapy", "Motivational Interviewing",
  "Mindfulness", "Family Systems",
] as const;

export const AGE_RANGE_OPTIONS = [
  "Children (5-11)", "Tweens (11-14)", "Teens (14-18)",
  "Young Adults (18-25)", "Adults (25-64)", "Older Adults (65+)",
] as const;

export const INTENSITY_OPTIONS = ["gentle", "moderate", "deep"] as const;

export const INTERACTION_TYPE_OPTIONS = [
  "expressive", "reflective", "somatic", "cognitive", "relational",
] as const;

export const SORT_OPTIONS = [
  { value: "recommended", label: "Recommended" },
  { value: "newest", label: "Newest" },
  { value: "most-used", label: "Most Used" },
  { value: "alphabetical", label: "A-Z" },
] as const;

export const TOOLS_LIBRARY: ToolDefinition[] = [
  {
    id: "dbt-house",
    name: "The DBT House",
    shortDescription: "Build a house layer by layer while exploring core DBT skills",
    longDescription: "An interactive, gamified DBT skill-building activity where clients construct a house from the ground up. Each of the four layers represents a core DBT skill area: Distress Tolerance (Foundation), Mindfulness & Emotion Regulation (Living Room), Interpersonal Effectiveness (Study), and Wise Mind (Zen Space). Clients place layers sequentially, then tap items within each floor to unlock therapeutic discussion prompts. Includes a built-in Feelings Wheel reference and progress tracking.",
    icon: "\u{1F3E1}",
    category: "game",
    modalities: ["DBT", "Play Therapy", "Psychoeducation", "Mindfulness"],
    ageRanges: ["Children (5-11)", "Tweens (11-14)", "Teens (14-18)", "Young Adults (18-25)", "Adults (25-64)"],
    intensity: "gentle",
    duration: "20-40",
    interactionType: "expressive",
    status: "active",
    tier: "free",
    bestUsedFor: [
      "Introducing the four DBT skill areas in an engaging, non-threatening way",
      "Helping clients visualize DBT as a structure they build from the ground up",
      "Exploring crisis survival and distress tolerance strategies",
      "Practicing interpersonal effectiveness scripts like DEAR MAN and FAST",
      "Guiding clients toward Wise Mind through the metaphor of reaching the top floor",
    ],
    adaptations: "For children, focus on the house-building metaphor and use simpler language for prompts. For teens, lean into the game-like progression. For adults, frame as 'mapping your skill foundation.' The Feelings Wheel sidebar provides additional emotional vocabulary support at any point.",
    pitfalls: "Don't rush through layers \u2014 each floor has 3 items designed for deep discussion. Resist the urge to complete the whole house in one session; it's okay to stop at any layer. The game structure can feel prescriptive, so leave room for the client's own associations with each item.",
    safetyNotes: "The Foundation layer deals with crisis survival and distress tolerance. Be prepared for disclosures about self-harm or suicidal ideation when exploring these items. The Safety Box prompt references TIPP skills which involve physical interventions (temperature, exercise) \u2014 assess appropriateness. All progress is session-local and not persisted.",
    producesArtifact: false,
    lastUsed: null,
    timesUsed: 0,
  },
];

/**
 * Helper: get only active tools (for quick-launch menus)
 */
export function getActiveTools(): ToolDefinition[] {
  return TOOLS_LIBRARY.filter(t => t.status === "active");
}

/**
 * Helper: get tools by tier
 */
export function getToolsByTier(tier: "free" | "pro"): ToolDefinition[] {
  return TOOLS_LIBRARY.filter(t => t.tier === tier);
}

/**
 * Helper: get items by category
 */
export function getToolsByCategory(category: "tool" | "game"): ToolDefinition[] {
  return TOOLS_LIBRARY.filter(t => t.category === category);
}
