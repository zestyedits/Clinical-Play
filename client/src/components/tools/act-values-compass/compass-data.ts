// ── ACT Values Compass Data ─────────────────────────────────────────────────
// Data layer for the ACT (Acceptance and Commitment Therapy) Values Compass
// therapeutic tool. All content is age-adaptive across child, teen, and adult
// modes with clinically grounded language.

// ── Types ───────────────────────────────────────────────────────────────────

export type AgeMode = "child" | "teen" | "adult";

export type BarrierType = "thought" | "feeling" | "urge";

export interface LifeDomain {
  id: string;
  name: string;
  color: string;
  iconPath: string;
  description: Record<AgeMode, string>;
}

export interface DefusionTechnique {
  id: string;
  name: string;
  instruction: Record<AgeMode, string>;
  template: string;
}

export interface BarrierTypeInfo {
  type: BarrierType;
  label: string;
  color: string;
  icon: string;
}

export interface StepConfig {
  label: string;
  title: string;
  subtitle: string;
  icon: string;
}

export interface WelcomeContent {
  subtitle: Record<AgeMode, string>;
  instruction: Record<AgeMode, string>;
  howItWorks: Record<AgeMode, string>;
}

// ── Life Domains ────────────────────────────────────────────────────────────

export const LIFE_DOMAINS: LifeDomain[] = [
  {
    id: "relationships",
    name: "Relationships",
    color: "#e88a7a",
    // Two overlapping hearts with a connecting bridge between them
    iconPath:
      "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35zM7.5 5C5.53 5 4 6.53 4 8.5c0 2.9 3.06 5.65 7.15 9.18l.85.77.85-.77C16.94 14.15 20 11.4 20 8.5 20 6.53 18.47 5 16.5 5c-1.17 0-2.34.59-3.08 1.5h-.02L12.6 7.57h-1.2l-.82-1.07C9.84 5.59 8.67 5 7.5 5zM10.5 11.5h3v1h-3v-1z",
    description: {
      child:
        "The people you care about — your family, friends, pets, and anyone who makes you feel loved and safe.",
      teen:
        "Your connections with others — friendships, family, romantic relationships, and the people you choose to keep close.",
      adult:
        "The quality and depth of your interpersonal connections — intimate partnerships, family bonds, friendships, and the relational patterns you cultivate.",
    },
  },
  {
    id: "work-school",
    name: "Work/School",
    color: "#d4a24c",
    // Rising flame shape suggesting ambition and craft
    iconPath:
      "M12 2c0 0-4.5 6.5-4.5 10.5C7.5 15.81 9.19 18 12 18s4.5-2.19 4.5-5.5C16.5 8.5 12 2 12 2zm0 14c-1.66 0-2.75-1.27-2.75-3.5 0-2.17 1.78-5.52 2.75-7.3.97 1.78 2.75 5.13 2.75 7.3C14.75 14.73 13.66 16 12 16zm-1 3.5c0 0-.75.5-.75 1.5s.75 1.5.75 1.5h2c0 0 .75-.5.75-1.5S13 19.5 13 19.5h-2z",
    description: {
      child:
        "How you learn, create, and build things — at school, in hobbies, or any project that makes you feel proud.",
      teen:
        "What drives you in school, work, or creative pursuits — the effort you put into building skills and doing meaningful work.",
      adult:
        "Your vocational engagement, career aspirations, and the meaning you derive from professional or educational endeavors.",
    },
  },
  {
    id: "health",
    name: "Health",
    color: "#5ab88f",
    // Tree with visible roots below and spreading branches above
    iconPath:
      "M12 2C9.79 2 8 3.79 8 6c0 1.1.45 2.1 1.17 2.83C7.87 9.53 7 10.87 7 12.5c0 2.21 1.79 4 4 4h.5v2.5h-1l-1.5 1.5v1h1.5L12 20l1.5 1.5H15v-1L13.5 19h-1v-2.5h.5c2.21 0 4-1.79 4-4 0-1.63-.87-2.97-2.17-3.67C15.55 8.1 16 7.1 16 6c0-2.21-1.79-4-4-4zm0 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 6c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z",
    description: {
      child:
        "Taking care of your body and mind — eating food that helps you grow, moving around, sleeping well, and being kind to yourself.",
      teen:
        "How you look after your physical and mental well-being — exercise, nutrition, sleep, and the habits that keep you feeling your best.",
      adult:
        "Your relationship with physical and psychological well-being — fitness, nutrition, sleep hygiene, stress management, and preventive self-care practices.",
    },
  },
  {
    id: "personal-growth",
    name: "Personal Growth",
    color: "#7c8ee0",
    // Mountain peak with a small triangular flag at the top
    iconPath:
      "M12 2l-1 2.5L5 17h14L13 4.5 12 2zm0 4.5L16.5 16h-9L12 6.5zM12.5 2v3l2 .5-1-1.5L12.5 2zM14.5 5l.5-.5-.5-.5v1z",
    description: {
      child:
        "Becoming more of who you want to be — learning new things, being brave, and growing a little every day.",
      teen:
        "Working on yourself — developing new skills, understanding who you are, and pushing past your comfort zone.",
      adult:
        "Your commitment to self-development, self-knowledge, and the ongoing process of becoming who you aspire to be through intentional learning and reflection.",
    },
  },
  {
    id: "fun-recreation",
    name: "Fun/Recreation",
    color: "#e0a84c",
    // Starburst / firework with radiating points
    iconPath:
      "M12 2l1.09 3.41L16 3l-1.41 2.91L18 7l-3.41 1.09L16 12l-2.91-1.41L12 14l-1.09-3.41L8 12l1.41-2.91L6 7l3.41-1.09L8 3l2.91 1.41L12 2zm0 16c-1.1 0-2 .45-2 1s.9 1 2 1 2-.45 2-1-.9-1-2-1zm-5-3c-.83 0-1.5.45-1.5 1s.67 1 1.5 1 1.5-.45 1.5-1-.67-1-1.5-1zm10 0c-.83 0-1.5.45-1.5 1s.67 1 1.5 1 1.5-.45 1.5-1-.67-1-1.5-1z",
    description: {
      child:
        "The things that make you laugh and smile — playing, imagining, exploring, and doing stuff just because it's fun!",
      teen:
        "What you do for enjoyment and recharging — hobbies, sports, gaming, creative outlets, or just hanging out.",
      adult:
        "Leisure, play, and recreational engagement — the activities you pursue for intrinsic enjoyment, restoration, and the experience of flow.",
    },
  },
  {
    id: "community",
    name: "Community",
    color: "#6bc5c5",
    // Three overlapping people silhouettes in a group
    iconPath:
      "M12 12c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm0-4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm6 5.2c0-1.2-.8-2.2-2-2.2-.55 0-1.07.22-1.46.58.98.84 1.63 1.98 1.84 3.22H19c.55 0 1-.45 1-1v-.38c0-.12-.02-.22-.04-.22zM18 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-12 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm1.46 5.58C7.07 13.22 6.55 13 6 13c-1.2 0-2 1-2 2.2 0 0-.02.1-.04.22v.38c0 .55.45 1 1 1h2.62c.21-1.24.86-2.38 1.84-3.22zM12 14c-2 0-6 1-6 3v1c0 .55.45 1 1 1h10c.55 0 1-.45 1-1v-1c0-2-4-3-6-3z",
    description: {
      child:
        "Being part of something bigger — your neighborhood, your school, your team, or helping people around you.",
      teen:
        "How you show up in the world beyond yourself — volunteering, activism, your role in groups, and making a difference where you live.",
      adult:
        "Your civic and social engagement — contributions to community, organizational involvement, social responsibility, and the legacy you wish to leave.",
    },
  },
] as const;

// ── Value Prompts (per domain) ──────────────────────────────────────────────

export const VALUE_PROMPTS: Record<string, Record<AgeMode, string>> = {
  relationships: {
    child: "What do you love about your friends and family?",
    teen: "What matters to you most in your relationships?",
    adult: "What values guide your relational choices and connections?",
  },
  "work-school": {
    child: "What do you like learning or making?",
    teen: "What kind of work or learning feels meaningful to you?",
    adult:
      "What qualities do you want to bring to your professional or academic life?",
  },
  health: {
    child: "What helps your body and mind feel good?",
    teen: "What does taking care of yourself look like for you?",
    adult:
      "What values guide how you care for your physical and mental well-being?",
  },
  "personal-growth": {
    child: "What new things do you want to learn or try?",
    teen: "What kind of person are you working on becoming?",
    adult:
      "What growth edges are you committed to exploring in your life right now?",
  },
  "fun-recreation": {
    child: "What makes you laugh and feel happy?",
    teen: "What do you do just because you enjoy it?",
    adult:
      "What forms of play and leisure bring you genuine restoration and joy?",
  },
  community: {
    child: "How do you like to help people around you?",
    teen: "What role do you want to play in your community?",
    adult:
      "What contributions to the broader community reflect your deepest values?",
  },
};

// ── Barrier Prompts (per domain) ────────────────────────────────────────────

export const BARRIER_PROMPTS: Record<string, Record<AgeMode, string>> = {
  relationships: {
    child: "What makes it hard to be close to people sometimes?",
    teen: "What gets in the way of the relationships you want?",
    adult:
      "What internal barriers — thoughts, feelings, or urges — interfere with living out your relational values?",
  },
  "work-school": {
    child: "What makes school or projects feel really hard?",
    teen: "What stops you from doing your best work?",
    adult:
      "What psychological obstacles arise when you try to engage meaningfully with work or study?",
  },
  health: {
    child: "What makes it tricky to take care of yourself?",
    teen: "What gets in the way of looking after your health?",
    adult:
      "What inner experiences act as barriers to your self-care commitments?",
  },
  "personal-growth": {
    child: "What makes it scary to try new things?",
    teen: "What holds you back from growing the way you want?",
    adult:
      "What shows up internally when you approach your growth edges?",
  },
  "fun-recreation": {
    child: "What keeps you from having fun sometimes?",
    teen: "What stops you from doing the things you enjoy?",
    adult:
      "What barriers prevent you from prioritizing play and restoration?",
  },
  community: {
    child: "What makes it hard to help out or join in?",
    teen: "What gets in the way of being involved in your community?",
    adult:
      "What internal obstacles limit your engagement with community and contribution?",
  },
};

// ── Action Prompts (per domain) ─────────────────────────────────────────────

export const ACTION_PROMPTS: Record<string, Record<AgeMode, string>> = {
  relationships: {
    child: "What's one nice thing you could do for someone you care about?",
    teen: "What's one small step you could take toward the relationships you want?",
    adult:
      "What is one concrete, values-aligned action you could take in your relationships this week?",
  },
  "work-school": {
    child: "What's one thing you could try at school or on a project?",
    teen: "What's one thing you could do this week to move forward with your work?",
    adult:
      "What is one committed action you could take toward your vocational values?",
  },
  health: {
    child: "What's one thing you could do to take care of yourself today?",
    teen: "What's one small healthy habit you could start this week?",
    adult:
      "What is one specific self-care action aligned with your health values?",
  },
  "personal-growth": {
    child: "What's one brave thing you could try?",
    teen: "What's one small step outside your comfort zone you could take?",
    adult:
      "What is one growth-oriented action you are willing to commit to?",
  },
  "fun-recreation": {
    child: "What's something fun you'd like to do soon?",
    teen: "What's one fun thing you could make time for this week?",
    adult:
      "What is one restorative or playful activity you could schedule into your week?",
  },
  community: {
    child: "What's one way you could help someone in your neighborhood or school?",
    teen: "What's one thing you could do to make a difference in your community?",
    adult:
      "What is one contribution to your community you could make this week?",
  },
};

// ── Defusion Techniques ─────────────────────────────────────────────────────

export const DEFUSION_TECHNIQUES: DefusionTechnique[] = [
  {
    id: "prefacing",
    name: "Prefacing",
    instruction: {
      child:
        "Before you say the scary thought, add these magic words to the front. It helps your brain see that the thought is just words, not the boss of you!",
      teen:
        "Add this phrase before your thought. It creates a little distance — you're observing the thought instead of being trapped inside it.",
      adult:
        "Cognitive defusion through prefacing. By labeling the thought as a thought, you create psychological distance, reducing its literal impact on your behavior.",
    },
    template: "I notice I'm having the thought that {thought}",
  },
  {
    id: "externalization",
    name: "Externalization",
    instruction: {
      child:
        "Pretend your brain is a chatty parrot on your shoulder. The parrot says all kinds of things — some true, some silly. This is what the parrot is saying right now!",
      teen:
        "Imagine your mind is a separate narrator giving you commentary. You don't have to agree with everything it says — you're just noticing what it's up to.",
      adult:
        "Externalize the thought by attributing it to your mind as an entity. This helps you observe mental content without fusing with it, recognizing that you are not your thoughts.",
    },
    template: "My mind is telling me that {thought}",
  },
  {
    id: "name-the-story",
    name: "Name the Story",
    instruction: {
      child:
        "Give this worry a silly name, like it's a book your brain keeps reading to you. When it starts up again, you can say 'Oh, that story again!' and not get pulled in.",
      teen:
        "Give this recurring thought pattern a short name — like a movie title. When it shows up, you can recognize it: 'Oh, there's that story again.' It takes away some of its power.",
      adult:
        "Identify and label the narrative pattern. Naming a recurring cognitive theme allows you to recognize it as a familiar mental event rather than a new crisis requiring response.",
    },
    template: "Ah, there's the '{label}' story again",
  },
  {
    id: "silly-voice",
    name: "Silly Voice",
    instruction: {
      child:
        "Now say that thought again, but sing it in your silliest cartoon voice! Try a squeaky mouse or a slow robot. Does it feel as big and scary now?",
      teen:
        "Repeat that thought out loud in a dramatic movie announcer voice — like a trailer for the world's most over-the-top action film. Notice how it changes the feeling.",
      adult:
        "Repeat the thought very slowly, word by word, with deliberate pauses between each word. Notice how altering the form of the thought changes your relationship to its content.",
    },
    template: "{thought}",
  },
] as const;

// ── Barrier Types ───────────────────────────────────────────────────────────

export const BARRIER_TYPES: BarrierTypeInfo[] = [
  {
    type: "thought",
    label: "Thought",
    color: "#7c8ee0",
    icon: "\uD83D\uDCAD",
  },
  {
    type: "feeling",
    label: "Feeling",
    color: "#e88a7a",
    icon: "\uD83D\uDC94",
  },
  {
    type: "urge",
    label: "Urge",
    color: "#e0a84c",
    icon: "\u26A1",
  },
] as const;

// ── Step Configuration ──────────────────────────────────────────────────────

export const STEP_CONFIGS: StepConfig[] = [
  {
    label: "Values",
    title: "Set Your Compass",
    subtitle: "What matters most to you in each area of life?",
    icon: "\uD83E\uDDED",
  },
  {
    label: "Alignment",
    title: "Rate Your Course",
    subtitle: "How closely are you living in line with your values?",
    icon: "\uD83C\uDFAF",
  },
  {
    label: "Acceptance",
    title: "Spot the Barriers",
    subtitle: "What thoughts, feelings, or urges get in your way?",
    icon: "\uD83E\uDEA8",
  },
  {
    label: "Defusion",
    title: "Unhook from Barriers",
    subtitle: "Practice seeing your thoughts as just thoughts.",
    icon: "\uD83E\uDE9D",
  },
  {
    label: "Mindfulness",
    title: "The Lookout Point",
    subtitle: "Pause, breathe, and notice what's here right now.",
    icon: "\uD83D\uDDFC",
  },
  {
    label: "Committed Action",
    title: "Chart Your Course",
    subtitle: "Choose one small, values-driven step to take.",
    icon: "\uD83D\uDEF6",
  },
  {
    label: "Summary",
    title: "Expedition Map",
    subtitle: "Review your values compass and the path ahead.",
    icon: "\uD83D\uDDFA\uFE0F",
  },
] as const;

// ── Selectable Value Options (per domain) ───────────────────────────────────

export const VALUE_OPTIONS: Record<string, string[]> = {
  relationships: [
    "Loyalty", "Trust", "Honesty", "Compassion", "Connection",
    "Support", "Respect", "Intimacy", "Kindness", "Forgiveness",
  ],
  "work-school": [
    "Excellence", "Creativity", "Dedication", "Learning", "Impact",
    "Teamwork", "Leadership", "Growth", "Purpose", "Integrity",
  ],
  health: [
    "Vitality", "Balance", "Strength", "Self-care", "Mindfulness",
    "Rest", "Nourishment", "Movement", "Resilience", "Wholeness",
  ],
  "personal-growth": [
    "Courage", "Curiosity", "Resilience", "Authenticity", "Self-awareness",
    "Patience", "Openness", "Discipline", "Wisdom", "Vulnerability",
  ],
  "fun-recreation": [
    "Adventure", "Playfulness", "Creativity", "Exploration", "Joy",
    "Spontaneity", "Humor", "Freedom", "Wonder", "Relaxation",
  ],
  community: [
    "Service", "Justice", "Belonging", "Leadership", "Generosity",
    "Inclusion", "Advocacy", "Responsibility", "Tradition", "Solidarity",
  ],
};

// ── Selectable Barrier Options (by type) ────────────────────────────────────

export const BARRIER_OPTIONS: Record<BarrierType, string[]> = {
  thought: [
    "I'm not good enough",
    "I'll fail if I try",
    "People will judge me",
    "It's too late to change",
    "I don't deserve this",
    "Something bad will happen",
    "I can't handle it",
    "Nobody really cares",
    "I should be further along",
    "What's the point?",
  ],
  feeling: [
    "Anxiety", "Fear", "Shame", "Sadness", "Guilt",
    "Anger", "Overwhelm", "Numbness", "Loneliness", "Frustration",
  ],
  urge: [
    "Avoid the situation",
    "Procrastinate",
    "Withdraw from others",
    "Give up entirely",
    "Distract myself",
    "Lash out at someone",
    "Shut down emotionally",
    "Seek constant reassurance",
    "Over-control everything",
    "People-please",
  ],
};

// ── Selectable Action Options (per domain) ──────────────────────────────────

export const ACTION_OPTIONS: Record<string, string[]> = {
  relationships: [
    "Call or text someone I care about",
    "Have an honest conversation I've been avoiding",
    "Plan quality time with a loved one",
    "Express gratitude to someone",
    "Set a healthy boundary",
    "Apologize for something I regret",
    "Ask someone how they're really doing",
    "Join a group or social activity",
  ],
  "work-school": [
    "Start a project I've been putting off",
    "Ask for help or feedback",
    "Set one meaningful goal for this week",
    "Learn something new in my field",
    "Organize my workspace or schedule",
    "Share an idea with a colleague or classmate",
    "Take a break when I need one",
    "Celebrate a small accomplishment",
  ],
  health: [
    "Go for a walk or do 10 minutes of movement",
    "Prepare a nourishing meal",
    "Set a consistent bedtime this week",
    "Schedule a health appointment I've postponed",
    "Practice deep breathing for 5 minutes",
    "Drink more water throughout the day",
    "Limit screen time before bed",
    "Do one kind thing for my body today",
  ],
  "personal-growth": [
    "Try something outside my comfort zone",
    "Journal about my feelings for 10 minutes",
    "Read or listen to something inspiring",
    "Practice a new skill for 15 minutes",
    "Reflect on what I learned this week",
    "Ask for honest feedback from someone I trust",
    "Sit with discomfort instead of avoiding it",
    "Write down three things I'm grateful for",
  ],
  "fun-recreation": [
    "Schedule time for a hobby I enjoy",
    "Say yes to a fun invitation",
    "Try a new activity or experience",
    "Spend time outdoors",
    "Play a game with someone",
    "Create something just for fun",
    "Watch, read, or listen to something I love",
    "Do something spontaneous this week",
  ],
  community: [
    "Volunteer for a cause I care about",
    "Attend a local event or meeting",
    "Help a neighbor with something",
    "Donate to or support an organization",
    "Introduce myself to someone new",
    "Write a letter or email to a representative",
    "Mentor or support someone who needs it",
    "Clean up or beautify a shared space",
  ],
};

// ── ACT Hexaflex Concepts (for guide popup) ─────────────────────────────────

export interface ACTConcept {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  inSession: string;
}

export const ACT_CONCEPTS: ACTConcept[] = [
  {
    id: "values",
    name: "Values",
    icon: "\uD83E\uDDED",
    color: "#c9a84c",
    description: "Values are chosen life directions — what matters most to you. They are not goals to be achieved but ongoing qualities you want to embody in how you live.",
    inSession: "Clients identify what truly matters across life domains. Values are freely chosen, not imposed by 'shoulds' or expectations from others.",
  },
  {
    id: "acceptance",
    name: "Acceptance",
    icon: "\uD83E\uDEA8",
    color: "#e88a7a",
    description: "Willingness to experience difficult thoughts and feelings without trying to eliminate or control them. Acceptance is not approval — it's making room for what's already there.",
    inSession: "Help clients recognize internal barriers (thoughts, feelings, urges) that block values-aligned action, and practice making space for them.",
  },
  {
    id: "defusion",
    name: "Cognitive Defusion",
    icon: "\uD83E\uDE9D",
    color: "#7c8ee0",
    description: "Learning to step back from thoughts and see them as mental events rather than literal truths. Defusion doesn't change thought content — it changes your relationship to thoughts.",
    inSession: "Techniques like prefacing ('I notice I'm having the thought that...'), externalization, naming the story, or silly voice help create distance from sticky thoughts.",
  },
  {
    id: "present-moment",
    name: "Present Moment Awareness",
    icon: "\uD83D\uDDFC",
    color: "#2d8a8a",
    description: "Flexible, non-judgmental contact with the here and now. Rather than being lost in the past or future, mindfulness brings attention to what is happening right now.",
    inSession: "The Lookout Point exercise offers a brief experiential mindfulness moment. Observe thoughts like clouds drifting across a sky.",
  },
  {
    id: "self-as-context",
    name: "Self-as-Context",
    icon: "\uD83C\uDF0C",
    color: "#6bc5c5",
    description: "You are the sky, not the weather. The observing self is the stable perspective from which all experiences are noticed — it remains constant even as thoughts and feelings change.",
    inSession: "During mindfulness exercises, help clients notice that they are the one observing their thoughts, not the thoughts themselves.",
  },
  {
    id: "committed-action",
    name: "Committed Action",
    icon: "\uD83D\uDEF6",
    color: "#5ab88f",
    description: "Taking concrete, values-aligned steps even in the presence of difficult internal experiences. It's doing what matters, not waiting until you feel ready.",
    inSession: "Clients choose specific, doable actions tied to their values. Emphasize small steps over grand plans — willingness over perfection.",
  },
];

// ── Welcome Screen Content ──────────────────────────────────────────────────

export const WELCOME_CONTENT: WelcomeContent = {
  subtitle: {
    child:
      "Go on an adventure to find out what matters most to you — and take your first steps toward it!",
    teen:
      "Figure out what you actually care about, spot what gets in the way, and make a plan to move toward what matters.",
    adult:
      "Clarify your core values across life domains, identify psychological barriers, practice defusion, and commit to values-aligned action.",
  },
  instruction: {
    child:
      "Pick your age group below and we'll start your compass adventure! You'll explore six parts of your life, find out what's important, and plan your next brave step.",
    teen:
      "Select your mode below to get started. You'll work through your values in six life areas, rate how aligned you are, and build a plan to close the gaps.",
    adult:
      "Select your mode to begin. This tool guides you through an ACT-informed process: values clarification, alignment assessment, barrier identification, cognitive defusion, present-moment awareness, and committed action planning.",
  },
  howItWorks: {
    child:
      "First, you'll explore six parts of your life and say what matters to you. Then you'll rate how close you are to living that way. Next, we'll find the things that get in your way and practice some cool tricks to unhook from them. Finally, you'll pick a small brave step to take!",
    teen:
      "You'll move through seven steps: define your values across six life domains, rate how aligned your actions are, identify the thoughts and feelings that block you, learn defusion techniques to unhook from barriers, practice a moment of mindfulness, commit to a concrete action, and review your full compass map.",
    adult:
      "This tool walks you through the six core ACT processes applied to values-based living. You will clarify values across six life domains, assess behavioral alignment, identify internal barriers (thoughts, feelings, urges), practice cognitive defusion techniques, engage in a brief mindfulness exercise, commit to specific values-congruent actions, and receive a summary of your compass for ongoing reference.",
  },
};
