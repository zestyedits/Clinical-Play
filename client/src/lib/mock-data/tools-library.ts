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
    id: "volume-mixer",
    name: "Volume Mixer",
    shortDescription: "Externalize internal parts as tactile audio faders",
    longDescription: "A high-end mixing-board metaphor where clients create channels for internal 'parts' or 'voices' and adjust their volume using weighted, physics-based faders. Supports mute, solo, and boost controls with optional organic audio feedback.",
    icon: "\u{1F39A}\uFE0F",
    modalities: ["IFS", "ACT", "Play Therapy", "Somatic"],
    ageRanges: ["Teens (14-18)", "Young Adults (18-25)", "Adults (25-64)"],
    intensity: "moderate",
    duration: "15-30",
    interactionType: "expressive",
    status: "active",
    tier: "free",
    bestUsedFor: [
      "Externalizing internal parts or voices (IFS)",
      "Mapping the relative 'loudness' of competing emotions",
      "Helping clients identify which parts dominate their experience",
      "Exploring the relationship between internal parts through volume dynamics",
    ],
    adaptations: "For teens, use casual language ('What's loud right now?'). For adults, frame as 'internal landscape mapping.' Use the Boost button for grounding resources like the Wise Self.",
    pitfalls: "Resist interpreting the mix for the client. If all faders are at 100%, that's data about overwhelm \u2014 don't rush to 'fix' it. The mute button is 'acknowledge,' not 'suppress.'",
    safetyNotes: "The global reset provides immediate de-escalation. If a client becomes flooded, use the reset to return to neutral. Audio can be disabled for sensory-sensitive clients.",
    producesArtifact: true,
    lastUsed: null,
    timesUsed: 0,
  },
  {
    id: "feelings",
    name: "Feeling Wheel",
    shortDescription: "Three-tier emotional identification through guided card exploration",
    longDescription: "A full-screen card drill-down tool that guides clients from 8 broad emotional categories through secondary and tertiary emotions. Each tier presents clarifying questions to help clients name their experience with precision. Selections sync in real-time and build an emotional map across the session.",
    icon: "\u{1F3AF}",
    modalities: ["CBT", "DBT", "Psychoeducation", "Play Therapy", "Mindfulness"],
    ageRanges: ["Tweens (11-14)", "Teens (14-18)", "Young Adults (18-25)", "Adults (25-64)"],
    intensity: "gentle",
    duration: "5-15",
    interactionType: "reflective",
    status: "active",
    tier: "free",
    bestUsedFor: [
      "Building emotional vocabulary in alexithymic clients",
      "Check-ins at session start",
      "Processing blended or confusing emotional states",
      "Teaching emotional granularity as a DBT skill",
    ],
    adaptations: "For children, pair with body sensations ('Where do you feel that in your body?'). For adults who intellectualize, ask them to choose quickly without overthinking. For couples, have each partner select independently then compare.",
    pitfalls: "Don't force tertiary specificity \u2014 some clients can only identify primary emotions, and that's valid progress. Avoid using this as a quiz. The wheel works best as a conversation starter, not an endpoint.",
    safetyNotes: "Selection history is visible to all participants. Clinician can clear selections at any time. No data is stored beyond the session unless exported.",
    producesArtifact: true,
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
