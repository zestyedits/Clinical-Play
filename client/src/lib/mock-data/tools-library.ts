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
  {
    id: "cbt-thought-court",
    name: "The Thought Court",
    shortDescription: "Put negative thoughts on trial using CBT cognitive restructuring",
    longDescription: "An interactive courtroom-themed CBT tool where clients put automatic negative thoughts on trial. Features age-adaptive language (Child/Teen/Adult), a 12-distortion reference guide with humor, and a 9-step guided flow: enter the thought, identify distortions, rate belief, examine evidence for and against, receive a verdict, reframe the thought, and re-rate belief. Produces a visual 'Case File' summary.",
    icon: "\u2696\uFE0F",
    category: "game",
    modalities: ["CBT", "Psychoeducation", "Play Therapy"],
    ageRanges: ["Children (5-11)", "Tweens (11-14)", "Teens (14-18)", "Young Adults (18-25)", "Adults (25-64)", "Older Adults (65+)"],
    intensity: "moderate",
    duration: "15-30",
    interactionType: "cognitive",
    status: "active",
    tier: "free",
    bestUsedFor: [
      "Teaching clients to identify and challenge cognitive distortions",
      "Structured cognitive restructuring for automatic negative thoughts",
      "Psychoeducation about the 12 common thinking errors",
      "Building evidence-based thinking skills across age groups",
      "Engaging reluctant clients through gamified CBT techniques",
    ],
    adaptations: "Child mode uses playful language, bright visuals, and simple prompts. Teen mode adds subtle humor and modern aesthetics. Adult mode provides clinical language and professional framing. The Distortions Guide popup is always accessible for reference.",
    pitfalls: "Don't rush through the evidence phases \u2014 these are where the therapeutic work happens. Some clients may struggle to generate counter-evidence; use the helper prompts. The verdict is not prescriptive \u2014 it reflects what the client entered, so validate their experience regardless of outcome.",
    safetyNotes: "Thoughts about self-harm or suicidal ideation may surface during the thought entry step. Be prepared to pivot to safety planning. The tool is for guided clinical use, not self-administered therapy. The reframe step should not invalidate the client's emotional experience.",
    producesArtifact: true,
    lastUsed: null,
    timesUsed: 0,
  },
  {
    id: "act-values-compass",
    name: "The Values Compass",
    shortDescription: "Map your values, spot barriers, and chart a course toward what matters",
    longDescription: "An interactive expedition-themed ACT (Acceptance and Commitment Therapy) tool where clients map personal values across six life domains (Relationships, Work/School, Health, Personal Growth, Fun/Recreation, Community), rate how aligned their current life is with each value, identify internal barriers (thoughts, feelings, urges) blocking their path, practice cognitive defusion techniques to unhook from those barriers, engage in a brief mindfulness exercise, and commit to specific values-aligned actions. Produces a visual 'Expedition Map' summary with a radar chart showing value alignment, barriers with defusion reframes, and committed actions as waypoints.",
    icon: "\uD83E\uDDED",
    category: "game",
    modalities: ["ACT", "Mindfulness", "Psychoeducation", "Play Therapy"],
    ageRanges: ["Children (5-11)", "Tweens (11-14)", "Teens (14-18)", "Young Adults (18-25)", "Adults (25-64)", "Older Adults (65+)"],
    intensity: "gentle",
    duration: "25-45",
    interactionType: "reflective",
    status: "active",
    tier: "free",
    bestUsedFor: [
      "Clarifying personal values across multiple life domains",
      "Identifying internal barriers to values-aligned living",
      "Teaching cognitive defusion techniques in an experiential way",
      "Building present-moment awareness through guided mindfulness",
      "Translating values into concrete, committed action steps",
    ],
    adaptations: "Child mode ('Explorer') uses playful language, simple prompts, and fun metaphors. Teen mode ('Navigator') uses direct, relatable language. Adult mode ('Cartographer') uses clinical ACT terminology. The expedition/compass metaphor makes abstract ACT concepts tangible for all ages.",
    pitfalls: "Don't rush the values clarification step \u2014 clients need time to articulate what genuinely matters to them, not what they think should matter. The defusion exercises may feel awkward at first; normalize this. The mindfulness step is intentionally brief but should not be skipped \u2014 it provides the self-as-context experience that ties the hexaflex together.",
    safetyNotes: "Values exploration can surface grief about unlived values or existential distress. Barrier identification may reveal avoidance patterns related to trauma. Be prepared to hold space for strong emotions during the alignment rating step, especially when clients recognize large gaps between their values and current behavior. The tool is designed for guided clinical use.",
    producesArtifact: true,
    lastUsed: null,
    timesUsed: 0,
  },
  {
    id: "ifs-inner-council",
    name: "The Inner Council",
    shortDescription: "Discover your inner parts, seat them at a council table, and respond from Self",
    longDescription: "An interactive medieval council-themed IFS (Internal Family Systems) tool where clients identify their inner parts across three categories (Protectors, Firefighters, Exiles), seat them at a round table visualization, facilitate a dialogue where each part expresses its concern, and practice responding from Self-energy with curiosity and compassion. Features age-adaptive language (Child/Teen/Adult), an 8-concept IFS reference guide, and a visual Council Record summary.",
    icon: "\u2694\uFE0F",
    category: "game",
    modalities: ["IFS", "Play Therapy", "Psychoeducation", "Mindfulness"],
    ageRanges: ["Children (5-11)", "Tweens (11-14)", "Teens (14-18)", "Young Adults (18-25)", "Adults (25-64)", "Older Adults (65+)"],
    intensity: "moderate",
    duration: "20-40",
    interactionType: "reflective",
    status: "active",
    tier: "free",
    bestUsedFor: [
      "Introducing Internal Family Systems concepts in an engaging, non-threatening way",
      "Helping clients identify and name their inner parts across protector, firefighter, and exile categories",
      "Practicing Self-leadership by responding to parts with curiosity and compassion",
      "Building awareness of internal dynamics and protector-exile relationships",
      "Engaging clients who respond well to metaphor and visualization in therapy",
    ],
    adaptations: "Child mode uses simple helper/protector language and playful council metaphor. Teen mode uses direct, relatable language about inner voices. Adult mode provides clinical IFS terminology including Self-energy, blending, and unburdening concepts.",
    pitfalls: "Don't rush the council meeting step \u2014 each part deserves genuine acknowledgment. Some clients may resist engaging with exile parts; respect their pace and don't force contact with vulnerable parts before the system is ready. The pre-written Self responses are starting points, not prescriptions.",
    safetyNotes: "Exile parts may surface intense emotions related to trauma, abandonment, or shame. Be prepared to slow down or pause if a client becomes overwhelmed. The tool is designed for guided clinical use, not self-administered therapy. Monitor for signs of blending (losing perspective) during the meeting step.",
    producesArtifact: true,
    lastUsed: null,
    timesUsed: 0,
  },
  {
    id: "somatic-grounding-grove",
    name: "The Grounding Grove",
    shortDescription: "Explore your body, rate tension, and practice somatic grounding techniques",
    longDescription: "An interactive body-based grounding tool where clients tap body regions on a visual body map to identify where they hold tension, rate intensity on a 1-10 scale, and practice targeted grounding techniques including 5-4-3-2-1 senses, box breathing, finger breathing, root down visualization, and progressive muscle release. Each technique includes guided instructions and clinician discussion prompts. Tracks completion across 8 body regions with 2-3 techniques per region.",
    icon: "\u{1F333}",
    category: "game",
    modalities: ["Somatic", "Mindfulness", "Psychoeducation", "Grounding"],
    ageRanges: ["Tweens (11-14)", "Teens (14-18)", "Young Adults (18-25)", "Adults (25-64)", "Older Adults (65+)"],
    intensity: "gentle",
    duration: "15-30",
    interactionType: "somatic",
    status: "active",
    tier: "free",
    bestUsedFor: [
      "Clients experiencing anxiety, panic, or dissociative symptoms who need immediate grounding",
      "Building interoceptive awareness — the ability to notice and name body sensations",
      "Teaching portable somatic regulation skills clients can use outside of sessions",
      "Opening sessions with a body check-in to establish a somatic baseline",
      "Clients who struggle with purely cognitive approaches and respond better to body-based work",
    ],
    adaptations: "Focus on hands and feet for clients who are uncomfortable with body awareness. Skip head/throat regions for clients with trauma histories involving those areas. Use the tension rating as a pre/post measure to demonstrate progress within a single session.",
    pitfalls: "Don't push clients to scan body regions they're avoiding — avoidance itself is meaningful data. Some clients may dissociate during body scans; watch for glazed eyes, flat affect, or sudden disconnection. The tool is a starting point for somatic awareness, not a substitute for trauma processing.",
    safetyNotes: "Body scanning can trigger trauma responses, especially in clients with histories of physical or sexual abuse. Always offer the option to skip regions. Monitor for signs of overwhelm (rapid breathing, flushing, freezing) and be prepared to redirect to external grounding (5-4-3-2-1 senses) if internal focus becomes too activating.",
    producesArtifact: false,
    lastUsed: null,
    timesUsed: 0,
  },
  {
    id: "sfbt-miracle-bridge",
    name: "The Miracle Bridge",
    shortDescription: "Walk toward your preferred future using solution-focused questions",
    longDescription: "An interactive Solution-Focused Brief Therapy (SFBT) tool where clients walk across a visual bridge from their current situation toward their preferred future. Through 7 stepping stones, clients answer the Miracle Question, identify exceptions (times the problem was smaller), rate their current position on a scaling question, define one small step forward, and envision their complete miracle day. Includes 3 additional scaling questions (confidence, motivation, hope) and a comprehensive journey summary at completion.",
    icon: "\u{1F309}",
    category: "game",
    modalities: ["SFBT", "Narrative", "Psychoeducation", "Motivational Interviewing"],
    ageRanges: ["Teens (14-18)", "Young Adults (18-25)", "Adults (25-64)", "Older Adults (65+)"],
    intensity: "moderate",
    duration: "20-35",
    interactionType: "reflective",
    status: "active",
    tier: "free",
    bestUsedFor: [
      "Clients feeling stuck or hopeless who need to reconnect with their vision of change",
      "First or second sessions to establish goals and identify existing strengths",
      "Clients who respond better to future-focused questions than problem-focused analysis",
      "Building motivation by highlighting exceptions and existing coping skills",
      "Creating a concrete, client-generated vision of their preferred future for reference in ongoing therapy",
    ],
    adaptations: "For teens, simplify the miracle question to 'If you woke up tomorrow and things were better, what's the first thing you'd notice?' For concrete thinkers, focus heavily on the 'what would others notice' step. For clients in crisis, skip to exception-finding and scaling to build immediate hope.",
    pitfalls: "Don't rush the miracle question — give clients time to build a vivid picture. If a client's miracle is entirely about others changing ('my mom would stop yelling'), gently redirect toward what they themselves would be doing differently. Scaling questions should prompt exploration, not judgment.",
    safetyNotes: "Some clients may become emotional when imagining a life without their current struggles — this is normal and therapeutically valuable. If a client cannot imagine any exceptions, this may indicate severity requiring additional assessment. The tool assumes a baseline level of safety; it is not appropriate for active crisis situations.",
    producesArtifact: true,
    lastUsed: null,
    timesUsed: 0,
  },
  {
    id: "narrative-quest",
    name: "The Narrative Quest",
    shortDescription: "Externalize problems, find exceptions, and rewrite your story",
    longDescription: "A guided Narrative Therapy tool that walks clients through the core practices of externalization and re-authoring. Clients name the problem as a character separate from themselves, explore its dominant narrative through speech bubbles, identify unique outcomes (exceptions) when the problem had less power, discover personal strengths and resources, and author a preferred narrative for the next chapter of their story. The 6-step storybook structure makes narrative practices accessible and engaging across all ages.",
    icon: "📖",
    category: "game",
    modalities: ["Narrative Therapy", "Play Therapy", "Attachment", "Mindfulness"],
    ageRanges: ["Children (5-11)", "Tweens (11-14)", "Teens (14-18)", "Young Adults (18-25)", "Adults (25-64)", "Older Adults (65+)"],
    intensity: "moderate",
    duration: "20-35",
    interactionType: "reflective",
    status: "active",
    tier: "free",
    bestUsedFor: [
      "Clients who over-identify with their problems and need help separating person from problem",
      "Building agency and self-efficacy by highlighting unique outcomes and personal strengths",
      "Clients who respond well to metaphor, story, and creative expression",
      "Shifting dominant problem-saturated narratives toward preferred stories",
      "Working with children and teens who benefit from externalizing conversations",
    ],
    adaptations: "For children, use playful language like 'troublemaker' and 'superpowers' to make externalization concrete and fun. For teens, emphasize the narrative they want to own vs. the one being imposed on them. For adults, lean into the therapeutic framework — unique outcomes, dominant narratives, re-authoring.",
    pitfalls: "Don't rush externalization — if the name feels forced, the rest of the process loses power. Watch for clients who externalize responsibility rather than the problem itself. If a client cannot identify any exceptions, this may indicate the need for more foundational safety work before narrative practices.",
    safetyNotes: "Externalization can surface strong emotions, especially when clients realize how long a problem has dominated their story. Normalize emotional responses. If a client's dominant narrative includes trauma content, ensure appropriate containment strategies are in place. The tool is not a substitute for trauma processing.",
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

/**
 * Helper: get items by category
 */
export function getToolsByCategory(category: "tool" | "game"): ToolDefinition[] {
  return TOOLS_LIBRARY.filter(t => t.category === category);
}
