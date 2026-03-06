// ── IFS Inner Council Data ───────────────────────────────────────────────────
// Data layer for the IFS (Internal Family Systems) Inner Council therapeutic
// tool. All content is age-adaptive across child, teen, and adult modes with
// clinically grounded IFS language.

// ── Types ───────────────────────────────────────────────────────────────────

export type AgeMode = "child" | "teen" | "adult";

export type PartCategory = "protector" | "firefighter" | "exile";

export interface PartArchetype {
  id: string;
  name: string;
  category: PartCategory;
  description: Record<AgeMode, string>;
  defaultConcern: Record<AgeMode, string>;
  color: string;
  iconPath: string;
  seatOrder: number;
}

export interface CategoryInfo {
  category: PartCategory;
  label: string;
  color: string;
  description: Record<AgeMode, string>;
}

export interface IFSConcept {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  inSession: string;
}

export interface StepConfig {
  label: string;
  title: string;
  subtitle: string;
  icon: string;
}

export interface SelfResponse {
  text: string;
}

export interface WelcomeContent {
  subtitle: Record<AgeMode, string>;
  instruction: Record<AgeMode, string>;
  howItWorks: Record<AgeMode, string>;
}

// ── Categories ──────────────────────────────────────────────────────────────

export const CATEGORIES: CategoryInfo[] = [
  {
    category: "protector",
    label: "Protectors & Managers",
    color: "#b8860b",
    description: {
      child: "Parts that try to keep you safe",
      teen: "Parts that manage and protect you",
      adult: "Manager parts that proactively protect the system",
    },
  },
  {
    category: "firefighter",
    label: "Firefighters",
    color: "#c0392b",
    description: {
      child: "Parts that jump in when feelings get too big",
      teen: "Parts that react quickly when pain surfaces",
      adult: "Reactive parts that extinguish emotional pain through distraction or numbing",
    },
  },
  {
    category: "exile",
    label: "Exiles",
    color: "#5f9ea0",
    description: {
      child: "Parts that carry big feelings from the past",
      teen: "Parts that hold old pain and vulnerability",
      adult: "Vulnerable parts carrying burdens of pain, shame, or fear from past experiences",
    },
  },
];

// ── Part Archetypes (18) ────────────────────────────────────────────────────

export const PART_ARCHETYPES: PartArchetype[] = [
  // ── Protectors (8) ──────────────────────────────────────────────────────
  {
    id: "inner-critic",
    name: "Inner Critic",
    category: "protector",
    color: "#c0392b",
    seatOrder: 1,
    // Pointing finger / exclamation mark shape
    iconPath: "M12 2L13 16H11L12 2ZM12 18C11.17 18 10.5 18.67 10.5 19.5S11.17 21 12 21S13.5 20.33 13.5 19.5S12.83 18 12 18Z",
    description: {
      child: "A loud voice inside that says you're not doing things right, like a grumpy teacher who's never happy with your work",
      teen: "That harsh inner voice constantly pointing out your flaws and mistakes, making you feel like you're never measuring up",
      adult: "The critical inner voice that evaluates your performance and worth, often using harsh standards as a protective strategy to prevent perceived failure or rejection",
    },
    defaultConcern: {
      child: "You made a mistake again! You have to try harder or everyone will laugh at you!",
      teen: "You're not good enough. Look at everyone else — they have it together and you don't.",
      adult: "If I don't push you to be better, you'll become complacent and people will see how inadequate you really are.",
    },
  },
  {
    id: "perfectionist",
    name: "Perfectionist",
    category: "protector",
    color: "#8e44ad",
    seatOrder: 2,
    // Diamond / gem shape (precision)
    iconPath: "M12 2L17 8L12 22L7 8L12 2ZM12 5.5L9 9L12 18L15 9L12 5.5Z",
    description: {
      child: "A part that wants everything to be just right, like arranging your toys in a perfect line and getting upset if one is crooked",
      teen: "The part that obsesses over every detail and won't let you finish anything because it's never perfect enough",
      adult: "A manager part that sets impossibly high standards to prevent criticism, using perfectionism as armor against vulnerability and shame",
    },
    defaultConcern: {
      child: "It's not right yet! We can't show anyone until it's perfect — do it over!",
      teen: "If you hand this in with mistakes, people will think you don't care. Start over.",
      adult: "If we lower our standards even slightly, everything will fall apart. Excellence is the only acceptable outcome.",
    },
  },
  {
    id: "people-pleaser",
    name: "People-Pleaser",
    category: "protector",
    color: "#e67e22",
    seatOrder: 3,
    // Open hands / offering gesture
    iconPath: "M7 11C7 11 5 9 5 7C5 5.34 6.34 4 8 4C9.3 4 10 5 10 5L12 7L14 5C14 5 14.7 4 16 4C17.66 4 19 5.34 19 7C19 9 17 11 17 11L12 16L7 11ZM12 18V22M8 20H16",
    description: {
      child: "A part that always says yes to others, like giving away your snack even when you're hungry because you want everyone to like you",
      teen: "The part that bends over backward for others, always saying what they want to hear even when it's not how you really feel",
      adult: "A protective part that prioritizes others' needs and approval over authentic self-expression, fearing that setting boundaries will lead to abandonment or conflict",
    },
    defaultConcern: {
      child: "Quick, say yes! If you say no, they won't want to be your friend anymore!",
      teen: "Just go along with it. If you push back, they'll think you're difficult and stop including you.",
      adult: "We need to keep everyone happy. If people see our real needs, they'll find us too demanding and leave.",
    },
  },
  {
    id: "controller",
    name: "Controller",
    category: "protector",
    color: "#2c3e50",
    seatOrder: 4,
    // Crown / authority symbol
    iconPath: "M3 18H21V20H3V18ZM5 16L3 8L7.5 11L12 4L16.5 11L21 8L19 16H5Z",
    description: {
      child: "A part that wants to be the boss of everything, like always choosing the game and telling everyone the rules",
      teen: "The part that needs to manage every situation, struggling to let go or trust others to handle things",
      adult: "A manager part that seeks to control outcomes, environments, and people as a strategy to prevent chaos and the vulnerability of unpredictability",
    },
    defaultConcern: {
      child: "I need to be in charge! If I'm not watching everything, something bad will happen!",
      teen: "I can't rely on anyone else to do this right. I have to manage everything myself or it'll go wrong.",
      adult: "If I relax my grip for even a moment, the system becomes vulnerable. Control is the only way to ensure safety.",
    },
  },
  {
    id: "worrier",
    name: "Worrier",
    category: "protector",
    color: "#7f8c8d",
    seatOrder: 5,
    // Spiral / whirlpool (anxious thoughts)
    iconPath: "M12 2C12 2 18 5 18 10C18 13 16 15 14 15.5C14 15.5 17 13 15 10C13 7 12 8 12 8C12 8 15 10 13 13C11 16 8 14 8 14C8 14 11 16 10 18C9 20 6 19 6 19C6 19 9 20 8 22",
    description: {
      child: "A part that imagines scary things that might happen, like a little alarm that keeps going off even when things are okay",
      teen: "The part that constantly runs worst-case scenarios, making you anxious about things that haven't even happened yet",
      adult: "An anxious manager part that anticipates threats and catastrophizes to keep the system hyper-vigilant, believing that worry itself prevents bad outcomes",
    },
    defaultConcern: {
      child: "But what if something bad happens?! We need to think about every scary thing so we're ready!",
      teen: "Have you thought about what could go wrong? Because I have. I've thought about all of it. We're not safe.",
      adult: "I must keep scanning for threats. If I stop worrying, we'll be caught off guard and something terrible will happen.",
    },
  },
  {
    id: "caretaker",
    name: "Caretaker",
    category: "protector",
    color: "#27ae60",
    seatOrder: 6,
    // Bandage / cross (healing, caring)
    iconPath: "M10 3H14V10H21V14H14V21H10V14H3V10H10V3ZM11 4V11H4V13H11V20H13V13H20V11H13V4H11Z",
    description: {
      child: "A part that's always taking care of others, like a little nurse who forgets to eat because they're too busy helping everyone else",
      teen: "The part that focuses all its energy on other people's problems so you don't have to deal with your own feelings",
      adult: "A protective part that channels emotional energy into caring for others, using altruism as a way to avoid confronting one's own pain and needs",
    },
    defaultConcern: {
      child: "Don't worry about yourself — your friend is sad! Go help them first, you'll be fine!",
      teen: "Your stuff can wait. Other people need you more. Besides, focusing on their problems is easier than facing yours.",
      adult: "Our own pain is too much to bear. It's safer and more meaningful to pour ourselves into helping others.",
    },
  },
  {
    id: "planner",
    name: "Planner",
    category: "protector",
    color: "#2980b9",
    seatOrder: 7,
    // Clipboard / list
    iconPath: "M9 2H15V4H19V22H5V4H9V2ZM10 3V5H14V3H10ZM7 6V20H17V6H7ZM9 9H15V10H9V9ZM9 12H15V13H9V12ZM9 15H13V16H9V15Z",
    description: {
      child: "A part that makes lists and plans for everything, like packing your bag three times before a trip because you might forget something",
      teen: "The part that over-prepares for every scenario, needing a plan B, C, and D before you can even start on plan A",
      adult: "A manager part that over-prepares and over-plans as a strategy to reduce uncertainty, equating thorough preparation with emotional safety",
    },
    defaultConcern: {
      child: "Wait, we need a plan first! We can't just do things — what if we forget something important?!",
      teen: "We need to map out every possibility before we act. Winging it is how people get hurt.",
      adult: "Without a detailed plan for every contingency, we're dangerously exposed. Spontaneity is just another word for recklessness.",
    },
  },
  {
    id: "judge",
    name: "Judge",
    category: "protector",
    color: "#d35400",
    seatOrder: 8,
    // Scales of justice
    iconPath: "M12 2V4M12 4L6 10L8 12L12 8L16 12L18 10L12 4ZM12 8V22M8 22H16M4 10L2 14H6L4 10ZM20 10L18 14H22L20 10Z",
    description: {
      child: "A part that's always comparing you to others, like a scorekeeper who says other kids are better at everything",
      teen: "The part that ranks you against everyone else and always finds you coming up short — or judges others harshly too",
      adult: "An evaluative manager part that constantly compares and judges self and others, using a hierarchical lens to determine safety and worth in social contexts",
    },
    defaultConcern: {
      child: "Look at them — they're way better at this than you. You'll never be as good.",
      teen: "Everyone else seems to have figured this out already. What's wrong with you? Or maybe what's wrong with them.",
      adult: "We must constantly evaluate where we stand relative to others. Without ranking, we lose our sense of position and safety.",
    },
  },

  // ── Firefighters (5) ────────────────────────────────────────────────────
  {
    id: "rebel",
    name: "Rebel",
    category: "firefighter",
    color: "#e74c3c",
    seatOrder: 9,
    // Lightning bolt
    iconPath: "M13 2L4 14H11L10 22L20 10H13L13 2ZM12.5 5L12.5 12H7L11.5 19L11.5 12H17L12.5 5Z",
    description: {
      child: "A part that yells 'You can't tell me what to do!' and wants to break all the rules, even helpful ones",
      teen: "The part that pushes back against any authority — parents, teachers, society — sometimes just to prove you can",
      adult: "A reactive firefighter part that resists authority and structure as a way to reclaim autonomy, often activated when the system feels controlled or powerless",
    },
    defaultConcern: {
      child: "Nobody gets to boss us around! Rules are stupid! Let's do the opposite of what they say!",
      teen: "Why should I listen to anyone? They don't understand me. I'll do what I want, even if it backfires.",
      adult: "I refuse to let anyone control us again. Compliance feels like surrender, and we've been powerless before.",
    },
  },
  {
    id: "escapist",
    name: "Escapist",
    category: "firefighter",
    color: "#9b59b6",
    seatOrder: 10,
    // Door / portal (escape)
    iconPath: "M6 2H18V22H6V2ZM8 4V20H16V4H8ZM13 11C13 11.55 12.55 12 12 12C11.45 12 11 11.55 11 11C11 10.45 11.45 10 12 10C12.55 10 13 10.45 13 11ZM10 4L10 8L14 6L10 4Z",
    description: {
      child: "A part that wants to hide in stories, games, or daydreams when the real world feels too hard, like building a blanket fort and never coming out",
      teen: "The part that checks out through screens, fantasy, or anything that takes you away from dealing with reality",
      adult: "A firefighter part that uses avoidance, fantasy, or compulsive distraction to escape overwhelming emotional pain before it reaches conscious awareness",
    },
    defaultConcern: {
      child: "Quick, let's go somewhere else in our mind! This is too much — let's pretend we're somewhere fun instead!",
      teen: "I don't want to deal with this. Let me scroll, binge, game, zone out — anything but feel this.",
      adult: "The pain is approaching. I need to divert us now. Reality is too threatening; dissociation is our safest refuge.",
    },
  },
  {
    id: "thrill-seeker",
    name: "Thrill-Seeker",
    category: "firefighter",
    color: "#f39c12",
    seatOrder: 11,
    // Flame / fire
    iconPath: "M12 2C12 2 7 8 7 13C7 16.87 9.24 20 12 20C14.76 20 17 16.87 17 13C17 8 12 2 12 2ZM12 18C10.35 18 9 15.76 9 13C9 9.5 12 5 12 5C12 5 15 9.5 15 13C15 15.76 13.65 18 12 18ZM11 13C11 13 10 15 12 16C14 15 13 13 13 13L12 11L11 13Z",
    description: {
      child: "A part that wants to do wild and crazy things to feel excited, like jumping off the highest thing at the playground",
      teen: "The part that chases adrenaline, intensity, and risk — anything to feel alive and drown out the emptiness or pain underneath",
      adult: "A firefighter part that pursues intensity, risk, and stimulation to override emotional numbness or pain, creating a sense of aliveness through heightened arousal",
    },
    defaultConcern: {
      child: "Boring is the worst! Let's do something exciting RIGHT NOW — I don't care if it's dangerous!",
      teen: "I need to feel something. Anything. The bigger and more intense, the better. Being careful is for people who aren't already in pain.",
      adult: "Without intensity, we're forced to sit with the emptiness. I need to flood the system with sensation before the pain catches up.",
    },
  },
  {
    id: "numbing-one",
    name: "Numbing One",
    category: "firefighter",
    color: "#95a5a6",
    seatOrder: 12,
    // Fog / clouds (numbness, shutdown)
    iconPath: "M4 14C4 14 5 12 8 12C9.5 12 10 13 12 13C14 13 14.5 12 16 12C19 12 20 14 20 14M3 18C3 18 4.5 16 7 16C9 16 10 17 12 17C14 17 15 16 17 16C19.5 16 21 18 21 18M6 10C6 10 7 9 9 9C10.5 9 11 10 12 10C13 10 13.5 9 15 9C17 9 18 10 18 10",
    description: {
      child: "A part that makes everything feel far away and quiet, like putting cotton in your ears so you can't hear the loud noises anymore",
      teen: "The part that shuts everything down — feelings, motivation, connection — just to stop the pain. You go numb and nothing matters",
      adult: "A firefighter part that dampens emotional experience through dissociation, withdrawal, or substance use, creating a protective numbness when pain threatens to overwhelm",
    },
    defaultConcern: {
      child: "Too loud. Too much. I'm turning everything off now. We don't need to feel anything.",
      teen: "I'm shutting it all down. I'd rather feel nothing than feel this. Just let me make it all go quiet.",
      adult: "The emotional load is unsustainable. I'm dampening the entire system. Feeling nothing is safer than feeling everything.",
    },
  },
  {
    id: "angry-one",
    name: "Angry One",
    category: "firefighter",
    color: "#c0392b",
    seatOrder: 13,
    // Explosion / starburst
    iconPath: "M12 2L14 8L20 6L16 11L22 12L16 13L20 18L14 16L12 22L10 16L4 18L8 13L2 12L8 11L4 6L10 8L12 2Z",
    description: {
      child: "A part that gets really, really mad and wants to yell or stomp, like a volcano that erupts when feelings build up too much",
      teen: "The part that explodes with anger — snapping at people, breaking things, or saying hurtful things you don't mean",
      adult: "A firefighter part that erupts with rage to protect vulnerable exiles from being accessed, using anger as a shield against deeper pain like sadness, fear, or shame",
    },
    defaultConcern: {
      child: "I'M SO MAD! Everyone is being unfair and I want to SCREAM! Nobody listens unless I get really loud!",
      teen: "Back off! I'm angry and I don't care who knows it. If I let the anger go, something worse is underneath.",
      adult: "Anger is my armor. If I stop being furious, the grief and vulnerability underneath will destroy us. Rage keeps us defended.",
    },
  },

  // ── Exiles (5) ──────────────────────────────────────────────────────────
  {
    id: "wounded-child",
    name: "Wounded Child",
    category: "exile",
    color: "#3498db",
    seatOrder: 14,
    // Teardrop
    iconPath: "M12 2C12 2 6 10 6 15C6 18.31 8.69 21 12 21C15.31 21 18 18.31 18 15C18 10 12 2 12 2ZM12 19C9.79 19 8 17.21 8 15C8 11.5 12 5.5 12 5.5C12 5.5 16 11.5 16 15C16 17.21 14.21 19 12 19Z",
    description: {
      child: "A little part deep inside that still hurts from something that happened before, like a teddy bear with a torn heart that nobody fixed",
      teen: "The young, vulnerable part that carries old pain — the one that got hurt and never fully healed",
      adult: "An exile carrying burdens of pain from formative experiences, holding the original wounds that the protective system organized around",
    },
    defaultConcern: {
      child: "It still hurts from that time... nobody helped me and I didn't know what to do. I feel so small.",
      teen: "I've been carrying this pain for so long. I don't think anyone sees how much I'm still hurting inside.",
      adult: "I hold the original wound. The protectors built walls around me, but the pain hasn't gone anywhere. I need someone to finally witness it.",
    },
  },
  {
    id: "lonely-one",
    name: "Lonely One",
    category: "exile",
    color: "#1abc9c",
    seatOrder: 15,
    // Single figure / isolated circle
    iconPath: "M12 4C13.1 4 14 4.9 14 6C14 7.1 13.1 8 12 8C10.9 8 10 7.1 10 6C10 4.9 10.9 4 12 4ZM12 10C12 10 16 12 16 15V17H8V15C8 12 12 10 12 10ZM4 11H7V13H4V11ZM17 11H20V13H17V11ZM4 15H6V17H4V15ZM18 15H20V17H18V15Z",
    description: {
      child: "A part that feels all alone, like being the only one at recess with nobody to play with",
      teen: "The part that feels fundamentally disconnected from others, even in a crowd — like you're behind glass that nobody can reach through",
      adult: "An exile carrying a deep sense of isolation and disconnection, often burdened with the belief that meaningful belonging is unattainable",
    },
    defaultConcern: {
      child: "Nobody wants to play with me. I'm all by myself and it feels really sad and empty in here.",
      teen: "I feel like I'm on the outside of everything. Even when people are around, there's this gap nobody can cross.",
      adult: "I carry a fundamental aloneness. Connection feels like something that exists for others but was never truly available to me.",
    },
  },
  {
    id: "ashamed-one",
    name: "Ashamed One",
    category: "exile",
    color: "#e91e63",
    seatOrder: 16,
    // Mask / hidden face
    iconPath: "M12 2C7.58 2 4 5.58 4 10C4 14.42 7.58 18 12 18C16.42 18 20 14.42 20 10C20 5.58 16.42 2 12 2ZM12 16C8.69 16 6 13.31 6 10C6 6.69 8.69 4 12 4C15.31 4 18 6.69 18 10C18 13.31 15.31 16 12 16ZM9 8.5C9 7.67 9.67 7 10.5 7C11.33 7 12 7.67 12 8.5V9.5C12 9.5 10.5 11 9 9.5V8.5ZM15 8.5C15 7.67 14.33 7 13.5 7C12.67 7 12 7.67 12 8.5V9.5C12 9.5 13.5 11 15 9.5V8.5ZM9 13C9 13 10 15 12 15C14 15 15 13 15 13",
    description: {
      child: "A part that believes something is really wrong with you, like wanting to hide under the bed because you think you're bad",
      teen: "The part that carries deep shame — not just about things you did, but about who you fundamentally are",
      adult: "An exile burdened with toxic shame, carrying the belief that the self is inherently flawed, defective, or unworthy of love and belonging",
    },
    defaultConcern: {
      child: "There's something wrong with me. I'm not like the other kids. I need to hide so nobody sees the bad part.",
      teen: "I'm broken in a way that can't be fixed. If people really knew me — the real me — they'd be disgusted.",
      adult: "I carry the core belief that I am fundamentally defective. The protectors hide me because if others saw this truth, the rejection would be absolute.",
    },
  },
  {
    id: "fearful-one",
    name: "Fearful One",
    category: "exile",
    color: "#ff9800",
    seatOrder: 17,
    // Wide eye / startled
    iconPath: "M12 4C7 4 3 8 2 12C3 16 7 20 12 20C17 20 21 16 22 12C21 8 17 4 12 4ZM12 18C8.13 18 5 14.87 5 12C5 9.13 8.13 6 12 6C15.87 6 19 9.13 19 12C19 14.87 15.87 18 12 18ZM12 8C9.79 8 8 9.79 8 12C8 14.21 9.79 16 12 16C14.21 16 16 14.21 16 12C16 9.79 14.21 8 12 8ZM12 14C10.9 14 10 13.1 10 12C10 10.9 10.9 10 12 10C13.1 10 14 10.9 14 12C14 13.1 13.1 14 12 14Z",
    description: {
      child: "A part that's really scared and frozen, like a bunny that sees a hawk and can't move",
      teen: "The part frozen by fear — not everyday nervousness, but a deep terror that something terrible will happen or has happened",
      adult: "An exile frozen in fear, carrying unprocessed traumatic activation from past experiences where safety was genuinely threatened",
    },
    defaultConcern: {
      child: "I'm so scared I can't move. Something bad happened and I think it's going to happen again. Please don't let it.",
      teen: "I'm terrified. Not regular scared — deep-down frozen. The danger might be over but my body doesn't believe it.",
      adult: "I hold the terror from when we weren't safe. My nervous system is frozen in that moment. The threat may be past, but I haven't been released from it.",
    },
  },
  {
    id: "abandoned-one",
    name: "Abandoned One",
    category: "exile",
    color: "#00bcd4",
    seatOrder: 18,
    // Broken chain / disconnected links
    iconPath: "M7 7C5.34 7 4 8.34 4 10C4 11.66 5.34 13 7 13H9V11H7C6.45 11 6 10.55 6 10C6 9.45 6.45 9 7 9H9V7H7ZM15 7H17C18.66 7 20 8.34 20 10C20 11.66 18.66 13 17 13H15V11H17C17.55 11 18 10.55 18 10C18 9.45 17.55 9 17 9H15V7ZM10 9H11V11H10V9ZM13 9H14V11H13V9ZM8 15L6 17M16 15L18 17M10 16L9 19M14 16L15 19",
    description: {
      child: "A part that's terrified of being left behind, like waking up and thinking everyone went away without you",
      teen: "The part that panics at any sign of rejection or abandonment, convinced that everyone will eventually leave",
      adult: "An exile burdened with abandonment terror, carrying the belief that attachment is inherently unstable and that being left is inevitable and unsurvivable",
    },
    defaultConcern: {
      child: "Don't leave me! Please don't go away! I'll be good, I'll be anything — just don't leave me all alone!",
      teen: "Everyone leaves eventually. I can already feel you pulling away. I'd rather push you away first than wait for you to go.",
      adult: "I carry the unbearable wound of abandonment. Every connection is shadowed by the certainty that it will end, and when it does, I won't survive it.",
    },
  },
];

// ── IFS Concepts (8) ────────────────────────────────────────────────────────

export const IFS_CONCEPTS: IFSConcept[] = [
  {
    id: "parts",
    name: "Parts",
    icon: "\u25C7",
    color: "#b8860b",
    description:
      "All of us have different parts — they are natural subpersonalities that develop over time. Each part has its own perspective, feelings, memories, and goals. Having parts is not a sign of pathology; it is the normal architecture of the mind.",
    inSession:
      "Help clients understand that parts are normal and universal. Normalize the experience of internal multiplicity by noting that everyone has parts, not just people in distress.",
  },
  {
    id: "self",
    name: "Self",
    icon: "\u2609",
    color: "#f4e4bc",
    description:
      "The core, calm, compassionate center within everyone. Self is not a part — it is the essential nature of a person, characterized by the 8 C's: curiosity, calm, clarity, compassion, confidence, courage, creativity, and connectedness.",
    inSession:
      "Guide clients toward Self-energy by helping them notice when they feel curious rather than reactive toward a part. Even a small amount of Self-energy is enough to begin the healing process.",
  },
  {
    id: "protectors-managers",
    name: "Protectors & Managers",
    icon: "\u2696",
    color: "#b8860b",
    description:
      "Parts that proactively protect the system by controlling, planning, pleasing, critiquing, or worrying. Managers work to prevent exiles from being triggered by maintaining order and predictability in daily life.",
    inSession:
      "Approach protectors with respect and gratitude for their hard work. They took on their roles for good reasons. Ask: 'What are you afraid would happen if you stopped doing this job?'",
  },
  {
    id: "firefighters",
    name: "Firefighters",
    icon: "\u2622",
    color: "#c0392b",
    description:
      "Parts that react in emergencies to douse emotional pain — through numbing, escaping, thrill-seeking, rage, or other extreme behaviors. They activate when exiles have been triggered and protectors have failed to contain the pain.",
    inSession:
      "Firefighter behaviors often look like 'symptoms' (addiction, self-harm, dissociation). Recognize them as desperate protective strategies rather than character flaws. They need appreciation, not criticism.",
  },
  {
    id: "exiles",
    name: "Exiles",
    icon: "\u2661",
    color: "#5f9ea0",
    description:
      "Vulnerable parts carrying burdens of pain, shame, fear, or worthlessness from the past. They are exiled by the protective system because their pain and needs are seen as threatening to the functioning of the whole system.",
    inSession:
      "Exiles need to be approached carefully and only when protectors have given permission. Rushing to exiles without protector buy-in can trigger a protective backlash. Ask protectors: 'Would it be okay if we got to know this part?'",
  },
  {
    id: "self-leadership",
    name: "Self-Leadership",
    icon: "\u2726",
    color: "#daa520",
    description:
      "When Self leads the internal system with curiosity and compassion, parts can relax from their extreme roles. Self-leadership doesn't mean parts disappear — they transform into their naturally valuable states when they trust Self to lead.",
    inSession:
      "Self-leadership develops gradually. Help clients notice moments when they respond from a centered place rather than a reactive part. Even brief moments of Self-leadership build the system's trust.",
  },
  {
    id: "unburdening",
    name: "Unburdening",
    icon: "\u2740",
    color: "#8fbc8f",
    description:
      "The process of releasing the pain, negative beliefs, and extreme emotions that exiles carry. Once an exile feels witnessed and understood by Self, it can let go of burdens it has been holding — often since childhood.",
    inSession:
      "Unburdening is a natural process that happens when exiles feel truly seen and ready. Common methods include releasing burdens to elements (wind, water, fire, earth, light). Never rush this process.",
  },
  {
    id: "blending-unblending",
    name: "Blending & Unblending",
    icon: "\u29BF",
    color: "#9370db",
    description:
      "When a part takes over and you lose perspective, that's blending — you become the part rather than observing it. Unblending is when Self steps back into leadership, creating enough separation to hold the part with compassion.",
    inSession:
      "When a client is blended, gently ask: 'Can you notice the part that's feeling this?' or 'Is there a part of you that's very activated right now?' This simple question can initiate unblending.",
  },
];

// ── Step Configs ────────────────────────────────────────────────────────────

export const STEP_CONFIGS: StepConfig[] = [
  {
    label: "Discover",
    title: "Discover Your Parts",
    subtitle: "Which inner voices do you recognize?",
    icon: "\u25C7",
  },
  {
    label: "Council",
    title: "Seat the Council",
    subtitle: "Your parts take their place at the table",
    icon: "\u2B21",
  },
  {
    label: "Meeting",
    title: "Council Meeting",
    subtitle: "Each part speaks, and Self responds",
    icon: "\u2726",
  },
  {
    label: "Summary",
    title: "Council Record",
    subtitle: "Review what your council shared today",
    icon: "\u25A3",
  },
];

// ── Self Responses ──────────────────────────────────────────────────────────

export const SELF_RESPONSES: Record<AgeMode, SelfResponse[]> = {
  child: [
    { text: "I hear you, and I care about you" },
    { text: "It makes sense that you feel that way" },
    { text: "Thank you for trying to protect me" },
    { text: "You don't have to work so hard \u2014 I'm here now" },
    { text: "I'm big enough to handle this with you" },
    { text: "You're safe right now" },
  ],
  teen: [
    { text: "I get why you do what you do" },
    { text: "Thanks for looking out for me \u2014 I appreciate it" },
    { text: "You've been carrying this for a long time. I see that" },
    { text: "I can take it from here. You can relax" },
    { text: "What you feel is valid. I'm listening" },
    { text: "I'm not going to push you away" },
    { text: "You don't have to fight so hard anymore" },
  ],
  adult: [
    { text: "I see you, and I understand why you're here" },
    { text: "Thank you for the role you've played in protecting me" },
    { text: "I'm here now, and I can hold this with you" },
    { text: "You've been working hard. You can rest" },
    { text: "I want to understand you better \u2014 I'm listening with compassion" },
    { text: "You don't need to carry this alone anymore" },
    { text: "I welcome you with curiosity, not judgment" },
    { text: "What do you need from me right now?" },
  ],
};

// ── Welcome Content ─────────────────────────────────────────────────────────

export const WELCOME_CONTENT: WelcomeContent = {
  subtitle: {
    child: "Meet your inner helpers and protectors around a special round table",
    teen: "Discover the different voices inside you and what they need",
    adult: "Explore your internal system with curiosity and compassion",
  },
  instruction: {
    child:
      "Pick your age group and step into the stone hall! You'll meet your inner parts, seat them at a round table, listen to what they have to say, and respond with your wisest, kindest self.",
    teen:
      "Choose your mode below. You'll identify parts of yourself that show up in different situations, bring them together at a council table, hear what each one has to say, and practice responding from your core Self.",
    adult:
      "Select your mode to begin. This tool guides you through an IFS-informed process: identifying your inner parts (protectors, firefighters, and exiles), visualizing them at a round table, facilitating dialogue with each part, and responding from Self with curiosity and compassion.",
  },
  howItWorks: {
    child:
      "First, you'll pick the inner helpers and protectors you recognize. Then they'll sit at a round table. Each one gets to speak, and you'll choose a kind response. At the end, you'll see a record of your whole council meeting!",
    teen:
      "You'll choose parts that resonate with you from three categories, then watch them take seats around a council table. Each part gets a turn to speak their concern, and you'll respond from your Self \u2014 the calm, centered part of you. Finally, you'll get a summary you can save.",
    adult:
      "You'll identify parts across three IFS categories (Protectors, Firefighters, Exiles), seat them at a visualization of a round table, facilitate a dialogue where each part expresses its concern, practice responding from Self-energy, and receive an exportable council record summarizing the session.",
  },
};
