/**
 * ClinicalPlay Tools Library — Seed Dataset
 *
 * Each tool has full clinical metadata for the Library page.
 * To add a tool: copy any entry, change the id, and fill in the fields.
 *
 * Fields:
 *  - id: unique slug (used in routes & localStorage keys)
 *  - name: display name
 *  - shortDescription: one-liner for card view
 *  - longDescription: 2-3 sentence explanation for detail drawer
 *  - icon: emoji shown on cards
 *  - modalities: clinical modality tags
 *  - ageRanges: suitable age groups
 *  - intensity: "gentle" | "moderate" | "deep"
 *  - duration: estimated minutes (e.g. "10-20")
 *  - interactionType: "expressive" | "reflective" | "somatic" | "cognitive" | "relational"
 *  - status: "active" | "development" | "planned"
 *  - tier: "free" | "pro"
 *  - bestUsedFor: bullet-point clinical use cases
 *  - adaptations: expandable notes on adapting for populations
 *  - pitfalls: light/honest notes on what to watch for
 *  - safetyNotes: containment and safety guidance
 *  - producesArtifact: whether sessions can be saved/exported
 *  - lastUsed: ISO date string or null (mock)
 *  - timesUsed: number (mock)
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
    icon: "🎚️",
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
    pitfalls: "Resist interpreting the mix for the client. If all faders are at 100%, that's data about overwhelm — don't rush to 'fix' it. The mute button is 'acknowledge,' not 'suppress.'",
    safetyNotes: "The global reset provides immediate de-escalation. If a client becomes flooded, use the reset to return to neutral. Audio can be disabled for sensory-sensitive clients.",
    producesArtifact: true,
    lastUsed: null,
    timesUsed: 0,
  },
];

const _REMOVED_TOOLS: ToolDefinition[] = [
  // ── ARCHIVED — kept for reference ──
  {
    id: "sandtray",
    name: "Zen Sandtray",
    shortDescription: "Expressive world-building with drag-and-drop figures",
    longDescription: "A shared digital sandtray where clients place, move, and arrange symbolic figures to externalize internal experiences. Supports real-time collaboration with ambient lighting and zen modes.",
    icon: "🏖️",
    modalities: ["Play Therapy", "Art Therapy", "IFS", "Attachment"],
    ageRanges: ["Children (5-11)", "Tweens (11-14)", "Teens (14-18)", "Adults (25-64)"],
    intensity: "moderate",
    duration: "15-30",
    interactionType: "expressive",
    status: "development",
    tier: "free",
    bestUsedFor: [
      "Externalizing internal family systems",
      "Exploring relational dynamics",
      "Building therapeutic rapport in early sessions",
      "Non-verbal processing for clients who struggle with talk therapy",
    ],
    adaptations: "For younger children, simplify the asset categories to nature and people only. For adults, frame as 'symbolic mapping' rather than 'play.' Neurodivergent clients may benefit from the zen rake mode as a grounding warm-up.",
    pitfalls: "Resist interpreting the scene for the client — ask what they see. If a client places items and immediately clears them, that's data, not disruption. Don't rush the process; silence while arranging is productive.",
    safetyNotes: "Canvas can be locked by clinician at any time. Anonymous mode hides participant identities. If client places distressing content, use the zen mode to create a visual pause before processing.",
    producesArtifact: true,
    lastUsed: "2026-02-08T14:30:00Z",
    timesUsed: 47,
  },
  {
    id: "breathing",
    name: "Calm Breathing",
    shortDescription: "Synchronized 4-phase breathing exercise for the group",
    longDescription: "A shared breathing guide with visual bubble animation that synchronizes across all session participants. Clinician controls the start/stop. Uses a 4-4-6-2 pattern: inhale, hold, exhale, rest.",
    icon: "🫧",
    modalities: ["Somatic", "DBT", "Mindfulness", "ACT"],
    ageRanges: ["Children (5-11)", "Tweens (11-14)", "Teens (14-18)", "Young Adults (18-25)", "Adults (25-64)", "Older Adults (65+)"],
    intensity: "gentle",
    duration: "5-10",
    interactionType: "somatic",
    status: "active",
    tier: "free",
    bestUsedFor: [
      "Session openers to establish presence",
      "De-escalation during emotionally activated moments",
      "Teaching co-regulation skills",
      "Transitions between therapeutic activities",
    ],
    adaptations: "For children, describe the bubble as 'making it grow and shrink with your breath.' For clients with respiratory conditions, suggest following the visual without forcing deep breaths. For PTSD, offer eyes-open option.",
    pitfalls: "Some clients find synchronized breathing anxiety-provoking if they feel watched. Give permission to just observe. Don't use immediately after a client shares something raw — let the emotion land first.",
    safetyNotes: "Clinician controls timing. If a client becomes dizzy or lightheaded, stop the exercise and return to natural breathing. This is a regulation tool, not a dissociation tool.",
    producesArtifact: false,
    lastUsed: "2026-02-09T10:15:00Z",
    timesUsed: 62,
  },
  {
    id: "feelings",
    name: "Feeling Wheel",
    shortDescription: "Three-tier emotional identification and exploration",
    longDescription: "An interactive SVG wheel that guides clients from broad emotional categories to specific, nuanced feelings. Traces a 'golden thread' from core to surface emotions to build emotional vocabulary.",
    icon: "🎯",
    modalities: ["CBT", "DBT", "Psychoeducation", "Play Therapy"],
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
    pitfalls: "Don't force tertiary specificity — some clients can only identify primary emotions, and that's valid progress. Avoid using this as a quiz. The wheel works best as a conversation starter, not an endpoint.",
    safetyNotes: "Selection history is visible to all participants. Clinician can clear selections at any time. No data is stored beyond the session unless exported.",
    producesArtifact: true,
    lastUsed: "2026-02-07T16:00:00Z",
    timesUsed: 38,
  },
  {
    id: "narrative",
    name: "Narrative Timeline",
    shortDescription: "Visual life story mapping along a river metaphor",
    longDescription: "Clients place symbolic 'stones' along a flowing river to map significant life events. Each stone holds a label, description, and color. Events are positioned chronologically from past to present.",
    icon: "🌊",
    modalities: ["Narrative Therapy", "Attachment", "EMDR", "ACT"],
    ageRanges: ["Teens (14-18)", "Young Adults (18-25)", "Adults (25-64)", "Older Adults (65+)"],
    intensity: "moderate",
    duration: "20-30",
    interactionType: "reflective",
    status: "active",
    tier: "pro",
    bestUsedFor: [
      "Life review and meaning-making",
      "Identifying patterns across the lifespan",
      "EMDR history-taking in a visual format",
      "Externalizing the narrative for re-authoring",
    ],
    adaptations: "For adolescents, focus on recent events (last 1-2 years) rather than full lifespan. For trauma work, give the client control over how much detail to include — a stone labeled 'hard year' is enough. For couples, create parallel timelines.",
    pitfalls: "This tool can open emotional floodgates if used without pacing. Don't try to complete a full life timeline in one session. Watch for dissociation cues when placing traumatic events. The river metaphor works both ways — some clients feel they're 'drowning.'",
    safetyNotes: "Clinician can clear the timeline if needed. Events can be removed by clicking. Consider using Calm Breathing before and after this tool. Frame the exit: 'We can come back to this.'",
    producesArtifact: true,
    lastUsed: "2026-02-05T09:00:00Z",
    timesUsed: 21,
  },
  {
    id: "values-sort",
    name: "Values Card Sort",
    shortDescription: "Interactive values identification and prioritization",
    longDescription: "A drag-and-drop card sorting exercise with 24 value cards. Clients sort values into 'Very Important,' 'Important,' and 'Not Important' columns to clarify what matters most to them.",
    icon: "🃏",
    modalities: ["ACT", "Motivational Interviewing", "Solution-Focused", "CBT"],
    ageRanges: ["Teens (14-18)", "Young Adults (18-25)", "Adults (25-64)", "Older Adults (65+)"],
    intensity: "gentle",
    duration: "10-20",
    interactionType: "cognitive",
    status: "active",
    tier: "pro",
    bestUsedFor: [
      "Clarifying values in ACT-based treatment",
      "Motivational interviewing when clients feel stuck",
      "Career/life transition work",
      "Identifying values-behavior gaps",
    ],
    adaptations: "For teens, reduce the deck to 12-15 cards. For clients in crisis, focus on 'What matters right now?' vs full sort. For couples, sort independently then discuss discrepancies. For group sessions, have each member select their top 3.",
    pitfalls: "Some clients will try to rank all values as 'Very Important' — that's the point of the exercise. Gently reflect: 'If everything matters equally, nothing guides decisions.' Don't editorialize their choices.",
    safetyNotes: "No sensitive data is captured unless the clinician exports. Cards can be cleared and re-sorted. This is a values exploration tool, not an assessment.",
    producesArtifact: true,
    lastUsed: "2026-02-06T11:30:00Z",
    timesUsed: 29,
  },

  // ── IN DEVELOPMENT ──
  {
    id: "dbt-house",
    name: "The DBT House",
    shortDescription: "Room-by-room emotional regulation framework",
    longDescription: "A visual house metaphor where each room represents a DBT skill domain: mindfulness (foundation), distress tolerance (walls), emotion regulation (rooms), and interpersonal effectiveness (roof). Clients furnish each room with their skills.",
    icon: "🏠",
    modalities: ["DBT", "Psychoeducation", "CBT"],
    ageRanges: ["Teens (14-18)", "Young Adults (18-25)", "Adults (25-64)"],
    intensity: "moderate",
    duration: "20-30",
    interactionType: "cognitive",
    status: "active",
    tier: "pro",
    bestUsedFor: [
      "Teaching DBT skills in a spatial, memorable way",
      "Progress tracking across DBT modules",
      "Visual coping skill inventory",
      "Motivating skill practice between sessions",
    ],
    adaptations: "For teens, allow decorating the house exterior to increase buy-in. For adults with architecture interests, lean into the structural metaphor. For group DBT, build one house collaboratively.",
    pitfalls: "Don't let the metaphor become more important than the skills. If a client's 'house' has empty rooms, that's a therapeutic opportunity, not a failure indicator.",
    safetyNotes: "Clinician guides the pace. The distress tolerance 'room' may surface crisis memories. Have a safety plan discussion ready.",
    producesArtifact: true,
    lastUsed: null,
    timesUsed: 0,
  },
  {
    id: "thought-bridge",
    name: "Thought Bridge",
    shortDescription: "Cognitive restructuring visualization",
    longDescription: "A visual bridge-building exercise for cognitive restructuring. Clients identify automatic thoughts on one side, work through evidence and alternatives in the middle, and arrive at balanced thoughts on the other side.",
    icon: "🌉",
    modalities: ["CBT", "ACT", "Psychoeducation"],
    ageRanges: ["Teens (14-18)", "Young Adults (18-25)", "Adults (25-64)"],
    intensity: "moderate",
    duration: "15-25",
    interactionType: "cognitive",
    status: "active",
    tier: "pro",
    bestUsedFor: [
      "Cognitive restructuring for depression and anxiety",
      "Identifying cognitive distortions visually",
      "Externalizing the 'thought journey' for clients who struggle with worksheets",
      "Building evidence-based thinking habits",
    ],
    adaptations: "For teens, use 'thought bubbles' instead of formal CBT language. For perfectionistic clients, emphasize that the bridge doesn't need to be 'correct.' For couples, walk through each partner's thought path on the same situation.",
    pitfalls: "This can feel too structured for clients who resist CBT framing. Don't force it if the client isn't engaging with the bridge metaphor. Also: balanced thoughts ≠ positive thoughts. Make sure 'the other side' isn't toxic positivity.",
    safetyNotes: "If a thought involves self-harm, pause the exercise and assess safety directly. The bridge is not a replacement for crisis intervention.",
    producesArtifact: true,
    lastUsed: null,
    timesUsed: 0,
  },

  // ── PLANNED TOOLS ──
  {
    id: "growth-garden",
    name: "Growth Garden",
    shortDescription: "Collaborative planting for rapport and goal-setting",
    longDescription: "A shared garden space where clinicians and clients plant, water, and tend symbolic seeds that represent therapeutic goals and progress. Plants grow over sessions to visualize long-term change.",
    icon: "🌱",
    modalities: ["Solution-Focused", "Play Therapy", "Attachment", "Motivational Interviewing"],
    ageRanges: ["Children (5-11)", "Tweens (11-14)", "Teens (14-18)", "Adults (25-64)"],
    intensity: "gentle",
    duration: "10-20",
    interactionType: "relational",
    status: "active",
    tier: "pro",
    bestUsedFor: [
      "Collaborative goal-setting in early sessions",
      "Visualizing progress over time",
      "Building therapeutic alliance with children",
      "Motivational interviewing for ambivalent clients",
    ],
    adaptations: "For children, let them name their plants and choose colors. For adults, frame as 'commitment planting.' For group therapy, create a shared garden with each member's plot.",
    pitfalls: "If a plant 'dies' because a goal wasn't met, frame it as seasonal — not failure. Don't overload the garden; 3-5 active goals is plenty.",
    safetyNotes: "This is a positive-focus tool. If a client is in crisis, the garden may feel dismissive. Use judgment about timing.",
    producesArtifact: true,
    lastUsed: null,
    timesUsed: 0,
  },
  {
    id: "fidget-tools",
    name: "Fidget Tools",
    shortDescription: "Calming sensory interactions for regulation",
    longDescription: "A collection of digital fidget interactions — sand drawing, pattern tracing, bubble popping, and ambient textures — designed to occupy the hands while the mind processes. Not therapeutic content; therapeutic context.",
    icon: "🔮",
    modalities: ["Somatic", "Mindfulness", "Play Therapy"],
    ageRanges: ["Children (5-11)", "Tweens (11-14)", "Teens (14-18)", "Young Adults (18-25)", "Adults (25-64)"],
    intensity: "gentle",
    duration: "5-15",
    interactionType: "somatic",
    status: "active",
    tier: "free",
    bestUsedFor: [
      "Reducing session anxiety for new clients",
      "Occupying hands during talk therapy",
      "Sensory grounding for ADHD and autism",
      "Waiting room warm-up before telehealth sessions",
    ],
    adaptations: "For ADHD clients, offer the pattern tracing for focus. For anxious clients, sand drawing is lower stimulation. For children, bubble popping with sound effects. Clinician decides which fidget tools are available.",
    pitfalls: "Fidgets can become avoidance if overused. Set a norm: 'You can fidget while we talk' vs. 'You can fidget instead of talking.' Know the difference.",
    safetyNotes: "No clinical data is captured. These are ambient regulation tools. Sound can be toggled off.",
    producesArtifact: false,
    lastUsed: null,
    timesUsed: 0,
  },
  {
    id: "parts-theater",
    name: "Parts Theater",
    shortDescription: "IFS-inspired internal parts mapping and exploration",
    longDescription: "A circular theater stage where clients create, name, and arrange their internal 'parts' — protectors, exiles, managers, and Self. Parts can be connected with lines and positioned in relation to each other. Supports multiple metaphors: parts, sides, or feelings.",
    icon: "🎭",
    modalities: ["IFS", "Play Therapy", "Art Therapy", "Narrative Therapy"],
    ageRanges: ["Teens (14-18)", "Young Adults (18-25)", "Adults (25-64)"],
    intensity: "deep",
    duration: "20-40",
    interactionType: "expressive",
    status: "active",
    tier: "free",
    bestUsedFor: [
      "IFS parts mapping and dialogue",
      "Externalizing inner conflict",
      "Working with protective parts before trauma processing",
      "Helping clients see their multiplicity as normal",
    ],
    adaptations: "For clients new to IFS, start with 2-3 parts max. For teens, use character archetypes. For adults, emphasize that parts are 'aspects of self,' not 'disorders.' For couples, each partner maps their own parts, then explores how parts interact across systems.",
    pitfalls: "Parts work can surface exiled parts unexpectedly. Don't push for exile access in a telehealth sandtray — this is mapping, not unburdening. If a client names a part after a real person, explore that gently.",
    safetyNotes: "This is deep work. Have a containment plan ready. Clinician should be IFS-trained or IFS-informed. The theater metaphor provides natural containment — parts stay 'on stage.'",
    producesArtifact: true,
    lastUsed: null,
    timesUsed: 0,
  },
  {
    id: "safety-map",
    name: "Safety Map",
    shortDescription: "Visual safety planning with interactive layers",
    longDescription: "A collaborative safety planning tool that maps warning signs, coping strategies, people to call, and safe environments in concentric rings around the client. Based on Stanley-Brown safety planning but in a visual, non-worksheet format.",
    icon: "🛡️",
    modalities: ["CBT", "DBT", "Solution-Focused"],
    ageRanges: ["Teens (14-18)", "Young Adults (18-25)", "Adults (25-64)", "Older Adults (65+)"],
    intensity: "moderate",
    duration: "20-30",
    interactionType: "cognitive",
    status: "active",
    tier: "free",
    bestUsedFor: [
      "Safety planning with suicidal clients",
      "Crisis intervention follow-up",
      "Identifying support networks visually",
      "Discharge planning from higher levels of care",
    ],
    adaptations: "For teens, use concentric circles with their language ('my people,' 'my places'). For adults, map to Stanley-Brown steps explicitly if they've used it before. For couples, build overlapping maps.",
    pitfalls: "A safety plan is only useful if the client believes it will work. Don't fill it in for them. If they can't name a single person to call, sit with that reality before problem-solving.",
    safetyNotes: "This tool should not be used as the sole safety intervention. It supplements clinical safety assessment. Exportable for client to keep on their phone.",
    producesArtifact: true,
    lastUsed: null,
    timesUsed: 0,
  },
  {
    id: "emotion-thermometer",
    name: "Emotion Thermometer",
    shortDescription: "Simple intensity tracking with visual scaling",
    longDescription: "A thermometer visualization where clients rate their emotional intensity from 0-10. Can track multiple emotions simultaneously and compare ratings over time within a session.",
    icon: "🌡️",
    modalities: ["CBT", "DBT", "Psychoeducation", "Somatic"],
    ageRanges: ["Children (5-11)", "Tweens (11-14)", "Teens (14-18)", "Young Adults (18-25)", "Adults (25-64)"],
    intensity: "gentle",
    duration: "3-5",
    interactionType: "reflective",
    status: "active",
    tier: "free",
    bestUsedFor: [
      "Quick check-ins at session start and end",
      "Teaching emotional awareness to children",
      "Tracking distress levels during exposure work",
      "Pre/post intervention measurement within sessions",
    ],
    adaptations: "For children, use colors and faces instead of numbers. For EMDR, use as SUD scale replacement. For teens, allow custom emoji at each level.",
    pitfalls: "Don't over-rely on numbers. A '7' means different things to different people. Use it as a conversation starter, not a data point.",
    safetyNotes: "If a client rates at high intensity, pause to assess. The thermometer can make distress visible that the client was masking.",
    producesArtifact: true,
    lastUsed: null,
    timesUsed: 0,
  },
  {
    id: "containment-box",
    name: "Containment Box",
    shortDescription: "Visual containment for distressing material",
    longDescription: "A symbolic container where clients can place thoughts, memories, or emotions they need to set aside until the next session. Based on EMDR containment protocol but usable across modalities.",
    icon: "📦",
    modalities: ["EMDR", "Somatic", "IFS", "DBT"],
    ageRanges: ["Teens (14-18)", "Young Adults (18-25)", "Adults (25-64)", "Older Adults (65+)"],
    intensity: "gentle",
    duration: "5-10",
    interactionType: "reflective",
    status: "active",
    tier: "free",
    bestUsedFor: [
      "Session closers after heavy emotional work",
      "EMDR container exercise",
      "Teaching self-regulation between sessions",
      "Grounding clients before ending telehealth",
    ],
    adaptations: "Let the client design the container (vault, chest, cloud, jar). For children, make it magical ('only you have the key'). For concrete thinkers, use a literal safe with a dial.",
    pitfalls: "Some clients resist containment because it feels like suppression. Distinguish: 'We're not ignoring this — we're putting it somewhere safe until we're ready.' If a client can't contain, process that.",
    safetyNotes: "This is not a dissociation tool. If a client uses containment to avoid all emotional processing, discuss the pattern clinically.",
    producesArtifact: true,
    lastUsed: null,
    timesUsed: 0,
  },
  {
    id: "body-scan",
    name: "Body Scan Map",
    shortDescription: "Interactive body awareness and sensation tracking",
    longDescription: "A body outline where clients tap or click to identify where they hold emotions, tension, or sensations. Color-coded by intensity. Builds somatic awareness and supports body-based processing.",
    icon: "🧘",
    modalities: ["Somatic", "EMDR", "Mindfulness", "DBT"],
    ageRanges: ["Tweens (11-14)", "Teens (14-18)", "Young Adults (18-25)", "Adults (25-64)", "Older Adults (65+)"],
    intensity: "moderate",
    duration: "10-15",
    interactionType: "somatic",
    status: "active",
    tier: "free",
    bestUsedFor: [
      "Somatic processing and body-based therapy",
      "Identifying where emotions live in the body",
      "EMDR body scan phase",
      "Teaching interoception for alexithymic clients",
    ],
    adaptations: "For clients with body image concerns, use an abstract body outline. For children, use a 'gingerbread person.' For chronic pain clients, distinguish emotional sensations from physical pain using different colors.",
    pitfalls: "Some trauma survivors are disconnected from their bodies. Don't push body awareness before the client has regulation skills. Start with extremities, not core.",
    safetyNotes: "Body scanning can trigger somatic flashbacks. Watch for signs of dissociation. Have grounding exercises ready.",
    producesArtifact: true,
    lastUsed: null,
    timesUsed: 0,
  },
  {
    id: "gratitude-jar",
    name: "Gratitude Jar",
    shortDescription: "Cumulative positive experience collection",
    longDescription: "A visual jar that fills with 'notes' of gratitude, positive moments, and small wins over multiple sessions. Designed for building positive affect tolerance and counteracting negativity bias.",
    icon: "🫙",
    modalities: ["CBT", "Solution-Focused", "Mindfulness", "Psychoeducation"],
    ageRanges: ["Children (5-11)", "Tweens (11-14)", "Teens (14-18)", "Adults (25-64)"],
    intensity: "gentle",
    duration: "5-10",
    interactionType: "reflective",
    status: "active",
    tier: "free",
    bestUsedFor: [
      "Building positive affect tolerance in depressed clients",
      "Homework between sessions (add one note per day)",
      "Counteracting negativity bias in CBT",
      "Session closers to end on a regulated note",
    ],
    adaptations: "For children, make the notes colorful with stickers. For skeptical adults, reframe as 'evidence collection' rather than toxic positivity. For teens, allow memes or images.",
    pitfalls: "Don't force gratitude on clients in acute grief or crisis. 'What are you grateful for?' can feel dismissive if timed poorly. Frame as 'what gave you a moment of peace this week?' instead.",
    safetyNotes: "Light tool with minimal risk. Watch for clients using gratitude to bypass difficult emotions.",
    producesArtifact: true,
    lastUsed: null,
    timesUsed: 0,
  },
  {
    id: "worry-tree",
    name: "Worry Tree",
    shortDescription: "Decision-based anxiety management flowchart",
    longDescription: "A visual decision tree for managing worries. Clients place their worry at the root and follow branches: Is it solvable? Can I act now? What can I do? Teaches the worry tree protocol from CBT in an interactive format.",
    icon: "🌳",
    modalities: ["CBT", "ACT", "Psychoeducation"],
    ageRanges: ["Tweens (11-14)", "Teens (14-18)", "Young Adults (18-25)", "Adults (25-64)"],
    intensity: "gentle",
    duration: "10-15",
    interactionType: "cognitive",
    status: "active",
    tier: "pro",
    bestUsedFor: [
      "Teaching worry management in GAD treatment",
      "Distinguishing productive from unproductive worry",
      "Building decision-making skills for anxious clients",
      "Psychoeducation for worry as a behavior",
    ],
    adaptations: "For children, use animal characters at each decision point. For perfectionists, emphasize 'good enough' action plans. For OCD, distinguish worry from intrusive thoughts before using.",
    pitfalls: "The tree implies worries can be 'solved,' which isn't always true. For existential worries, ACT-based acceptance is a better branch. Don't use this tool for OCD rumination — it can become a compulsion.",
    safetyNotes: "If the worry involves safety concerns (self-harm, abuse), exit the tree and address directly.",
    producesArtifact: true,
    lastUsed: null,
    timesUsed: 0,
  },
  {
    id: "strengths-cards",
    name: "Strengths Deck",
    shortDescription: "Character strengths identification and discussion",
    longDescription: "A card deck of 24 character strengths (based on VIA classification, adapted for clinical use). Clients identify their top strengths and explore how they show up — or don't — in their daily lives.",
    icon: "💪",
    modalities: ["Solution-Focused", "CBT", "ACT", "Psychoeducation"],
    ageRanges: ["Teens (14-18)", "Young Adults (18-25)", "Adults (25-64)", "Older Adults (65+)"],
    intensity: "gentle",
    duration: "10-20",
    interactionType: "reflective",
    status: "active",
    tier: "pro",
    bestUsedFor: [
      "Strengths-based therapy and positive psychology",
      "Building self-efficacy in depressed clients",
      "Career and identity exploration",
      "Relapse prevention: 'What strengths got you through before?'",
    ],
    adaptations: "For teens, ask others to nominate strengths ('What would your best friend say?'). For depressed clients, look for strengths that are 'dormant but not gone.' For couples, have partners identify each other's strengths.",
    pitfalls: "Don't turn this into a self-esteem exercise. Some clients will resist identifying strengths — explore that resistance therapeutically rather than pushing through it.",
    safetyNotes: "Low risk. May surface grief about 'lost' strengths in clients recovering from trauma or illness.",
    producesArtifact: true,
    lastUsed: null,
    timesUsed: 0,
  },
  {
    id: "coping-toolbox",
    name: "Coping Toolbox",
    shortDescription: "Personalized coping strategy organizer",
    longDescription: "A categorized toolbox where clients collect and organize their coping strategies by type: physical, social, mental, emotional, and creative. Strategies can be tagged by situation and rated for effectiveness.",
    icon: "🧰",
    modalities: ["DBT", "CBT", "Solution-Focused", "Psychoeducation"],
    ageRanges: ["Tweens (11-14)", "Teens (14-18)", "Young Adults (18-25)", "Adults (25-64)"],
    intensity: "gentle",
    duration: "15-20",
    interactionType: "cognitive",
    status: "active",
    tier: "pro",
    bestUsedFor: [
      "DBT distress tolerance skill building",
      "Discharge planning from higher levels of care",
      "Relapse prevention and crisis skill organization",
      "Empowering clients to see how many tools they already have",
    ],
    adaptations: "For children, use a 'backpack' metaphor. For teens, allow rating coping strategies with stars. For adults in crisis, focus on 'what works in the first 5 minutes' vs long-term coping.",
    pitfalls: "A full toolbox doesn't mean the client will use it. Practice retrieval in session: 'You're at a 7. Open your toolbox. What do you grab?' Listing strategies is not the same as building skills.",
    safetyNotes: "Ensure the toolbox includes at least one crisis-level strategy and relevant phone numbers. Review periodically.",
    producesArtifact: true,
    lastUsed: null,
    timesUsed: 0,
  },
  {
    id: "social-atom",
    name: "Social Atom",
    shortDescription: "Relational mapping and support network visualization",
    longDescription: "A visual mapping tool where the client places themselves at center and positions people in their life at varying distances based on closeness, influence, or safety. Inspired by Moreno's social atom technique.",
    icon: "🔗",
    modalities: ["Family Systems", "Attachment", "Narrative Therapy", "Solution-Focused"],
    ageRanges: ["Teens (14-18)", "Young Adults (18-25)", "Adults (25-64)", "Older Adults (65+)"],
    intensity: "moderate",
    duration: "15-25",
    interactionType: "relational",
    status: "active",
    tier: "pro",
    bestUsedFor: [
      "Mapping relational systems and attachment patterns",
      "Identifying support networks and isolation patterns",
      "Family therapy intake assessments",
      "Processing relational losses and changes",
    ],
    adaptations: "For children, use 'islands' with bridges between people. For divorce/blended families, use before/after maps. For clients with complex trauma, allow markers for safe vs unsafe relationships using color.",
    pitfalls: "Clients may feel exposed seeing their social world mapped visually. Loneliness can become painfully concrete. Don't rush to fix what you see — witness it first.",
    safetyNotes: "If the map reveals no safe connections, address this clinically and assess isolation risk. This may surface DV dynamics — proceed with safety awareness.",
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
