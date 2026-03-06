// ── MI Motivation Garden Data ────────────────────────────────────────────────
// Data layer for the Motivational Interviewing (MI) Motivation Garden
// therapeutic tool. All content is age-adaptive across child, teen, and adult
// modes with clinically grounded language.

// ── Types ───────────────────────────────────────────────────────────────────

export type AgeMode = "child" | "teen" | "adult";

export type DARNCategory = "desire" | "ability" | "reasons" | "need";

export type WeedCategory = "comfort" | "fear" | "doubt";

export interface ChangeTopic {
  id: string;
  name: string;
  color: string;
  icon: string;
  description: Record<AgeMode, string>;
}

export interface Seed {
  id: string;
  category: DARNCategory;
  text: string;
}

export interface Weed {
  id: string;
  category: WeedCategory;
  text: string;
}

export interface ValueConnection {
  value: string;
  connection: string;
}

export interface Commitment {
  id: string;
  text: string;
}

export interface DARNCategoryInfo {
  category: DARNCategory;
  label: string;
  color: string;
  icon: string;
  prompt: Record<AgeMode, string>;
}

export interface WeedCategoryInfo {
  category: WeedCategory;
  label: string;
  color: string;
  icon: string;
  prompt: Record<AgeMode, string>;
}

export interface StepConfig {
  label: string;
  title: string;
  subtitle: string;
  icon: string;
}

export interface MIConcept {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  inSession: string;
}

export interface WelcomeContent {
  subtitle: Record<AgeMode, string>;
  instruction: Record<AgeMode, string>;
  howItWorks: Record<AgeMode, string>;
}

// ── Change Topics ───────────────────────────────────────────────────────────

export const CHANGE_TOPICS: ChangeTopic[] = [
  {
    id: "healthy-eating",
    name: "Eating Healthier",
    color: "#5ab88f",
    icon: "\uD83E\uDD57",
    description: {
      child: "Eating more foods that help your body grow strong and feel good.",
      teen: "Making better choices about what you eat and how it affects your energy.",
      adult: "Improving your nutritional habits and developing a healthier relationship with food.",
    },
  },
  {
    id: "exercise",
    name: "Moving More",
    color: "#e88a7a",
    icon: "\uD83C\uDFC3",
    description: {
      child: "Running, playing, and moving your body more every day!",
      teen: "Getting more active \u2014 whether it's sports, gym, walking, or just moving more.",
      adult: "Increasing physical activity and building sustainable exercise habits.",
    },
  },
  {
    id: "substance-use",
    name: "Reducing Substance Use",
    color: "#7c8ee0",
    icon: "\uD83D\uDEE1\uFE0F",
    description: {
      child: "Cutting back on things that aren't good for your body.",
      teen: "Reducing or stopping substances that are affecting your life.",
      adult: "Modifying your relationship with substance use and exploring healthier coping strategies.",
    },
  },
  {
    id: "screen-time",
    name: "Managing Screen Time",
    color: "#d4a24c",
    icon: "\uD83D\uDCF1",
    description: {
      child: "Spending less time on screens and more time doing other fun stuff.",
      teen: "Getting a better balance between screens and the rest of your life.",
      adult: "Developing healthier boundaries with technology and digital media consumption.",
    },
  },
  {
    id: "sleep",
    name: "Better Sleep",
    color: "#6bc5c5",
    icon: "\uD83C\uDF19",
    description: {
      child: "Going to bed on time and getting the rest your body needs.",
      teen: "Fixing your sleep schedule so you actually feel rested.",
      adult: "Improving sleep hygiene and establishing consistent, restorative sleep patterns.",
    },
  },
  {
    id: "social-connection",
    name: "Connecting with Others",
    color: "#e0a84c",
    icon: "\uD83E\uDD1D",
    description: {
      child: "Making friends and spending more time with people you like.",
      teen: "Putting yourself out there more and building real connections.",
      adult: "Strengthening social bonds and reducing isolation through intentional connection.",
    },
  },
  {
    id: "stress-management",
    name: "Managing Stress",
    color: "#9b8ec4",
    icon: "\uD83E\uDDD8",
    description: {
      child: "Finding ways to calm down when things feel too much.",
      teen: "Dealing with stress in healthier ways instead of letting it build up.",
      adult: "Developing adaptive stress management strategies and building emotional resilience.",
    },
  },
  {
    id: "self-care",
    name: "Better Self-Care",
    color: "#e88abc",
    icon: "\uD83D\uDC96",
    description: {
      child: "Being kinder to yourself and taking care of your body and feelings.",
      teen: "Actually making time for yourself instead of just pushing through everything.",
      adult: "Prioritizing physical and emotional self-care as a foundation for well-being.",
    },
  },
];

// ── DARN Categories ─────────────────────────────────────────────────────────

export const DARN_CATEGORIES: DARNCategoryInfo[] = [
  {
    category: "desire",
    label: "Desire",
    color: "#e88a7a",
    icon: "\u2764\uFE0F",
    prompt: {
      child: "What do you wish could be different?",
      teen: "What do you want to change?",
      adult: "What desires for change are you aware of?",
    },
  },
  {
    category: "ability",
    label: "Ability",
    color: "#7c8ee0",
    icon: "\uD83D\uDCAA",
    prompt: {
      child: "What do you think you could do?",
      teen: "What are you capable of changing?",
      adult: "What capacities and resources do you have for this change?",
    },
  },
  {
    category: "reasons",
    label: "Reasons",
    color: "#5ab88f",
    icon: "\uD83C\uDF1F",
    prompt: {
      child: "Why would it be good to change?",
      teen: "What are your reasons for wanting this?",
      adult: "What specific benefits would this change bring to your life?",
    },
  },
  {
    category: "need",
    label: "Need",
    color: "#d4a24c",
    icon: "\u26A1",
    prompt: {
      child: "Why is it important to change now?",
      teen: "Why do you need to make this change?",
      adult: "What urgency or necessity do you feel around making this change?",
    },
  },
];

// ── Seed Options (per topic, per DARN category) ─────────────────────────────

export const SEED_OPTIONS: Record<string, Record<DARNCategory, string[]>> = {
  "healthy-eating": {
    desire: [
      "I want to have more energy",
      "I want to feel better about what I eat",
      "I want to try new healthy foods",
      "I want to stop feeling sluggish after meals",
      "I want to be a good example for others",
    ],
    ability: [
      "I know how to cook some healthy meals",
      "I can start with small changes",
      "I've eaten well before and know how it feels",
      "I can plan my meals ahead of time",
      "I could ask someone to help me",
    ],
    reasons: [
      "I'd feel more energetic and focused",
      "My body would be healthier",
      "I'd sleep better at night",
      "I'd feel more confident about my choices",
      "It would improve my mood",
    ],
    need: [
      "My health depends on making changes",
      "I can't keep going the way things are",
      "My doctor has recommended changes",
      "I owe it to myself to take care of my body",
      "I need to feel better than I do right now",
    ],
  },
  exercise: {
    desire: [
      "I want to feel stronger and more capable",
      "I want more energy throughout the day",
      "I want to feel proud of being active",
      "I want to reduce my stress through movement",
      "I want to enjoy my body more",
    ],
    ability: [
      "I can start with just 10 minutes a day",
      "I've been active before and can do it again",
      "I know activities I enjoy doing",
      "I can find time if I plan ahead",
      "I could join a group or class for support",
    ],
    reasons: [
      "I'd have better mental health",
      "I'd sleep better at night",
      "I'd feel more confident in my body",
      "It would help manage my stress",
      "I'd have more energy for things I care about",
    ],
    need: [
      "My body is telling me it needs movement",
      "Sitting all day is affecting my health",
      "I need an outlet for my emotions",
      "My energy levels are too low to ignore",
      "I need to make a change for my long-term health",
    ],
  },
  "substance-use": {
    desire: [
      "I want to feel more in control",
      "I want to wake up feeling clear-headed",
      "I want better relationships",
      "I want to stop worrying about my use",
      "I want to prove to myself I can do this",
    ],
    ability: [
      "I've cut back before successfully",
      "I know my triggers and can plan for them",
      "I have people who would support me",
      "I can find healthier ways to cope",
      "I'm stronger than I give myself credit for",
    ],
    reasons: [
      "My relationships would improve",
      "I'd have more money for things I care about",
      "I'd be healthier and more clear-headed",
      "I'd feel more like myself again",
      "I'd be more present in my life",
    ],
    need: [
      "It's starting to cause real problems",
      "I can't keep ignoring the consequences",
      "People I care about are being affected",
      "My health is at risk if I don't change",
      "I need to do this before things get worse",
    ],
  },
  "screen-time": {
    desire: [
      "I want more time for things I actually enjoy",
      "I want to be more present with people",
      "I want to feel less distracted all the time",
      "I want to sleep better without screens",
      "I want to use my time more intentionally",
    ],
    ability: [
      "I can set screen time limits on my devices",
      "I can find offline activities I enjoy",
      "I've had screen-free days before and liked them",
      "I can start by reducing one hour a day",
      "I can charge my phone outside the bedroom",
    ],
    reasons: [
      "I'd be more productive and focused",
      "I'd have deeper connections with people",
      "I'd feel less anxious and overwhelmed",
      "I'd have time for hobbies I've been neglecting",
      "I'd sleep better without late-night scrolling",
    ],
    need: [
      "Screens are taking over too much of my life",
      "I'm missing out on real experiences",
      "My eyes and body are suffering",
      "I need to break the constant scrolling habit",
      "It's affecting my relationships and work",
    ],
  },
  sleep: {
    desire: [
      "I want to wake up feeling rested",
      "I want more consistent energy during the day",
      "I want to stop dreading bedtime",
      "I want to feel sharp and focused",
      "I want to stop relying on caffeine",
    ],
    ability: [
      "I can set a consistent bedtime",
      "I can put my phone away before bed",
      "I know relaxation techniques I could use",
      "I can make my bedroom more sleep-friendly",
      "I've slept well before and know what helps",
    ],
    reasons: [
      "I'd be in a better mood every day",
      "I'd think more clearly and make better decisions",
      "My physical health would improve",
      "I'd have more patience with people",
      "I'd enjoy my days more when I'm well-rested",
    ],
    need: [
      "My lack of sleep is affecting everything",
      "I can't keep running on empty",
      "My body needs proper rest to function",
      "Sleep deprivation is hurting my health",
      "I need to break this cycle before it gets worse",
    ],
  },
  "social-connection": {
    desire: [
      "I want to feel less alone",
      "I want deeper, more meaningful friendships",
      "I want to feel like I belong somewhere",
      "I want someone to talk to when things get hard",
      "I want to enjoy social activities again",
    ],
    ability: [
      "I can reach out to one person this week",
      "I can join a group or club that interests me",
      "I can say yes to the next invitation I get",
      "I can be the one to initiate plans",
      "I have skills and interests others would value",
    ],
    reasons: [
      "I'd feel supported and less isolated",
      "Social connection is good for my mental health",
      "I'd have more fun and enjoyment in life",
      "I'd feel more confident in social situations",
      "Life is richer when shared with others",
    ],
    need: [
      "Isolation is affecting my mental health",
      "I can't keep going through everything alone",
      "I need people in my life who care about me",
      "Loneliness is becoming too heavy to carry",
      "I need connection to feel like myself again",
    ],
  },
  "stress-management": {
    desire: [
      "I want to feel calmer and more at ease",
      "I want to stop feeling overwhelmed all the time",
      "I want to handle pressure better",
      "I want to enjoy life without constant worry",
      "I want to feel more in control of my reactions",
    ],
    ability: [
      "I can learn breathing and relaxation techniques",
      "I can start saying no to things that drain me",
      "I can take short breaks throughout the day",
      "I've managed stress well in the past",
      "I can ask for help when things pile up",
    ],
    reasons: [
      "I'd be healthier physically and mentally",
      "My relationships would be less strained",
      "I'd make better decisions under pressure",
      "I'd sleep better and have more energy",
      "I'd actually enjoy the things I do",
    ],
    need: [
      "My stress is starting to affect my health",
      "I'm burning out and can't sustain this pace",
      "People around me are noticing the toll it's taking",
      "I need to find a healthier way to cope",
      "If I don't address this, things will only get worse",
    ],
  },
  "self-care": {
    desire: [
      "I want to treat myself with more kindness",
      "I want to actually make time for myself",
      "I want to stop putting everyone else first",
      "I want to feel like I matter too",
      "I want to enjoy taking care of myself",
    ],
    ability: [
      "I can schedule self-care time in my week",
      "I can start with one small act of self-care daily",
      "I know what makes me feel recharged",
      "I can set boundaries to protect my time",
      "I've taken good care of myself before",
    ],
    reasons: [
      "I'd have more energy for things I care about",
      "I'd be better at helping others when I'm well",
      "I'd feel less resentful and burnt out",
      "My mood and outlook would improve",
      "I deserve the same care I give to others",
    ],
    need: [
      "I'm running on empty and it shows",
      "I can't keep neglecting my own needs",
      "My well-being depends on taking care of myself",
      "Others are noticing I'm not doing well",
      "If I don't start caring for myself, I'll break down",
    ],
  },
};

// ── Weed Categories ─────────────────────────────────────────────────────────

export const WEED_CATEGORIES: WeedCategoryInfo[] = [
  {
    category: "comfort",
    label: "Comfort",
    color: "#e0a84c",
    icon: "\uD83D\uDECB\uFE0F",
    prompt: {
      child: "What feels nice about the way things are now?",
      teen: "What's comfortable about staying the same?",
      adult: "What aspects of the status quo provide comfort or familiarity?",
    },
  },
  {
    category: "fear",
    label: "Fear",
    color: "#9b8ec4",
    icon: "\uD83D\uDE28",
    prompt: {
      child: "What are you scared might happen if you change?",
      teen: "What worries you about making this change?",
      adult: "What fears arise when you contemplate this change?",
    },
  },
  {
    category: "doubt",
    label: "Doubt",
    color: "#7a8a9a",
    icon: "\uD83E\uDD14",
    prompt: {
      child: "What makes you think it might not work?",
      teen: "What makes you doubt you can do this?",
      adult: "What doubts or reservations do you have about your ability to change?",
    },
  },
];

// ── Weed Options (per topic, per weed category) ─────────────────────────────

export const WEED_OPTIONS: Record<string, Record<WeedCategory, string[]>> = {
  "healthy-eating": {
    comfort: [
      "I like the foods I eat now",
      "Cooking healthy takes too much effort",
      "Unhealthy food is my comfort when I'm stressed",
      "It's easier to eat what's convenient",
    ],
    fear: [
      "I'm afraid I'll fail and feel worse",
      "I worry I'll miss the foods I enjoy",
      "What if I can't stick with it?",
      "I'm scared of feeling deprived",
    ],
    doubt: [
      "I've tried before and it didn't last",
      "I don't have enough willpower",
      "Healthy food is too expensive",
      "I don't know enough about nutrition",
    ],
  },
  exercise: {
    comfort: [
      "I'd rather relax in my free time",
      "My current routine is easy and familiar",
      "I don't have to feel uncomfortable",
      "Not exercising means no risk of injury",
    ],
    fear: [
      "I'm afraid of looking foolish at the gym",
      "What if I hurt myself?",
      "I worry I'll start and then give up again",
      "I'm scared of how hard it will be",
    ],
    doubt: [
      "I don't have time to exercise",
      "I've never been an active person",
      "I'm too out of shape to start",
      "Exercise has never worked for me before",
    ],
  },
  "substance-use": {
    comfort: [
      "It helps me relax and unwind",
      "It's a big part of my social life",
      "I know how to handle things the way they are",
      "It takes the edge off difficult feelings",
    ],
    fear: [
      "I'm afraid of who I'll be without it",
      "What if I lose my friends?",
      "I worry about withdrawal symptoms",
      "I'm scared I can't cope without it",
    ],
    doubt: [
      "I've tried to quit before and failed",
      "Maybe my use isn't really that bad",
      "I don't think I'm strong enough",
      "People like me don't change",
    ],
  },
  "screen-time": {
    comfort: [
      "Screens help me relax and escape",
      "I'd be bored without my phone",
      "It's how I stay connected with people",
      "I enjoy the content I consume",
    ],
    fear: [
      "I'll miss out on what's happening online",
      "I might feel lonely without social media",
      "What if I have nothing to do?",
      "I'm worried about being out of the loop",
    ],
    doubt: [
      "Everyone uses screens this much",
      "I can't help it \u2014 it's addictive by design",
      "I've tried screen limits before and failed",
      "There's nothing better to do anyway",
    ],
  },
  sleep: {
    comfort: [
      "Late nights are my only me-time",
      "I feel more productive at night",
      "My current schedule works with my social life",
      "I don't want to miss out on things",
    ],
    fear: [
      "I'm afraid I'll just lie awake frustrated",
      "What if an early bedtime makes me feel boring?",
      "I worry I won't be able to fall asleep",
      "I'm scared of the thoughts that come in the quiet",
    ],
    doubt: [
      "My body just doesn't do early nights",
      "I've always been a night owl",
      "Sleep schedules never stick for me",
      "One more hour won't make a difference",
    ],
  },
  "social-connection": {
    comfort: [
      "Being alone is easier and less risky",
      "I don't have to deal with drama or rejection",
      "My own company is comfortable",
      "Socializing takes too much energy",
    ],
    fear: [
      "I'm afraid people won't like the real me",
      "What if I get rejected or hurt?",
      "I worry about saying the wrong thing",
      "I'm scared of being vulnerable with others",
    ],
    doubt: [
      "I'm not good at making friends",
      "It's too late to build new connections",
      "Nobody would want to hang out with me",
      "I've been hurt too many times to try again",
    ],
  },
  "stress-management": {
    comfort: [
      "Staying busy keeps me from thinking too much",
      "Stress motivates me to get things done",
      "My coping habits are familiar, even if unhealthy",
      "Slowing down feels uncomfortable",
    ],
    fear: [
      "What if I can't handle my emotions without stress?",
      "I'm afraid of what I'll feel if I slow down",
      "What if people think I'm lazy?",
      "I worry I'll fall behind if I take breaks",
    ],
    doubt: [
      "Stress is just part of life \u2014 it won't change",
      "Relaxation techniques don't work for me",
      "I don't have time for stress management",
      "My stress comes from things I can't control",
    ],
  },
  "self-care": {
    comfort: [
      "Putting others first feels natural and right",
      "Not focusing on myself means fewer expectations",
      "I'm used to running on empty",
      "Self-care feels selfish or indulgent",
    ],
    fear: [
      "I'm afraid people will think I'm selfish",
      "What if I let people down by prioritizing myself?",
      "I worry I don't deserve self-care",
      "I'm scared of what I'll discover if I slow down",
    ],
    doubt: [
      "I don't have time for self-care",
      "It won't make a real difference anyway",
      "I always start and then stop",
      "My needs aren't as important as everyone else's",
    ],
  },
};

// ── Values ──────────────────────────────────────────────────────────────────

export const VALUE_OPTIONS: string[] = [
  "Health", "Family", "Freedom", "Honesty",
  "Independence", "Happiness", "Security", "Self-respect",
  "Achievement", "Love", "Peace", "Growth",
];

// ── Value Connection Options (per topic) ────────────────────────────────────

export const VALUE_CONNECTION_OPTIONS: Record<string, Record<string, string[]>> = {
  "healthy-eating": {
    Health: ["Eating well is how I honor my body", "Good nutrition is the foundation of my health"],
    Family: ["I want to be healthy for the people who depend on me", "Sharing meals is how my family connects"],
    Freedom: ["Eating well gives me freedom from health worries", "I want to choose food freely, not be controlled by cravings"],
    Honesty: ["I need to be honest about how my eating affects me", "Being truthful with myself about my habits matters"],
    Independence: ["Managing my nutrition helps me feel self-sufficient", "I want to take charge of my own health"],
    Happiness: ["Feeling good in my body makes me happier", "Healthy food actually makes me feel better"],
    Security: ["Good health gives me security for the future", "Taking care of my body protects my well-being"],
    "Self-respect": ["Eating well is an act of self-respect", "I deserve to nourish my body properly"],
    Achievement: ["Making healthy choices is an accomplishment", "I want to achieve better health through discipline"],
    Love: ["Taking care of myself is a form of self-love", "I eat well because I love the people in my life"],
    Peace: ["A balanced diet brings peace to my body and mind", "I want peace with food and eating"],
    Growth: ["Learning to eat well is personal growth", "Better nutrition supports my growth in all areas"],
  },
  exercise: {
    Health: ["Movement is essential for my physical well-being", "Exercise keeps my body and mind healthy"],
    Family: ["Being fit lets me be active with my family", "I want to model healthy habits for my loved ones"],
    Freedom: ["Being strong gives me freedom to do what I want", "Exercise frees me from physical limitations"],
    Honesty: ["I need to be honest that my body needs movement", "Admitting I need exercise is the first step"],
    Independence: ["Physical fitness gives me independence as I age", "Being strong means relying less on others"],
    Happiness: ["Exercise genuinely makes me feel happier", "Moving my body brings me joy"],
    Security: ["Physical health is my security for the future", "Being fit helps me handle whatever life throws at me"],
    "Self-respect": ["Exercise shows I respect my body", "Taking time to move is honoring myself"],
    Achievement: ["Each workout is a small victory", "Getting fitter is a meaningful achievement"],
    Love: ["I move my body because I love life", "Caring for my body is caring for the people who need me"],
    Peace: ["Movement brings me mental peace", "Exercise helps me process stress and find calm"],
    Growth: ["Getting stronger is growth I can feel", "Exercise pushes me to grow beyond my comfort zone"],
  },
  "substance-use": {
    Health: ["Reducing use protects my physical health", "My body deserves to be free from harm"],
    Family: ["My family needs me to be present and clear", "I don't want substance use to define our relationship"],
    Freedom: ["I want to be free from dependence", "True freedom means choosing, not being controlled"],
    Honesty: ["I need to be honest about the impact of my use", "Living honestly means facing this head-on"],
    Independence: ["I want to be independent from substances", "Real independence means not needing a substance to cope"],
    Happiness: ["Substances give temporary relief, not real happiness", "I want authentic happiness, not a chemical shortcut"],
    Security: ["My future security depends on making changes now", "Substance use threatens the stability I've built"],
    "Self-respect": ["I respect myself too much to keep doing this", "Changing shows I believe I'm worth more"],
    Achievement: ["Overcoming this would be my greatest achievement", "Every day without use is a win"],
    Love: ["I want to be fully present for the people I love", "Love means taking care of myself too"],
    Peace: ["I want peace without needing substances to get there", "Real peace comes from within, not from a bottle"],
    Growth: ["Recovery is the ultimate personal growth journey", "Changing this pattern would transform my life"],
  },
  "screen-time": {
    Health: ["Less screen time means better sleep and less eye strain", "My mental health improves when I disconnect"],
    Family: ["I want to be present with my family, not on my phone", "Real connection happens face to face"],
    Freedom: ["I want freedom from constant notifications", "Being free from screen addiction is real freedom"],
    Honesty: ["I need to be honest about how much time I waste", "Admitting I'm dependent on screens is the first step"],
    Independence: ["I want to think independently, not be led by algorithms", "Independence means not needing constant stimulation"],
    Happiness: ["Real experiences make me happier than scrolling", "Less comparison online means more contentment"],
    Security: ["Protecting my attention protects my future", "Less screen time gives me more security in real life"],
    "Self-respect": ["I respect myself enough to put the phone down", "My time and attention are valuable"],
    Achievement: ["Using time wisely leads to real accomplishments", "I could achieve so much with the time I reclaim"],
    Love: ["The people I love deserve my full attention", "Showing love means being present"],
    Peace: ["Disconnecting brings real peace of mind", "Less noise from screens means more inner calm"],
    Growth: ["Growing means choosing depth over distraction", "Less screen time creates space for real growth"],
  },
  sleep: {
    Health: ["Sleep is the foundation of physical health", "My body heals and restores during sleep"],
    Family: ["Being well-rested makes me a better family member", "I'm more patient with loved ones when I sleep well"],
    Freedom: ["Good sleep frees me from daytime fatigue", "I want freedom from the cycle of exhaustion"],
    Honesty: ["I need to be honest that I'm not getting enough rest", "Acknowledging the problem is the first step"],
    Independence: ["Good sleep means not depending on caffeine", "Being well-rested lets me function independently"],
    Happiness: ["I'm genuinely happier when I sleep enough", "Good sleep transforms my daily mood"],
    Security: ["Consistent sleep gives me a stable foundation", "Taking care of my sleep protects my overall well-being"],
    "Self-respect": ["Prioritizing sleep shows I value myself", "I deserve proper rest"],
    Achievement: ["I perform better at everything when rested", "Good sleep enables my best work"],
    Love: ["I'm a more loving person when I'm not exhausted", "Rest lets me show up fully for people I love"],
    Peace: ["A good night's sleep brings peace to my whole day", "Restful sleep calms my mind and body"],
    Growth: ["Sleep is when my brain processes and grows", "Better sleep supports every area of growth"],
  },
  "social-connection": {
    Health: ["Social connection is vital for mental health", "Loneliness is as harmful as smoking \u2014 I need people"],
    Family: ["I want stronger bonds with my family", "Family connection gives me roots and belonging"],
    Freedom: ["Freedom includes the choice to open up to others", "Connection frees me from the prison of isolation"],
    Honesty: ["I need to be honest that I'm lonely", "Real connection requires honesty and vulnerability"],
    Independence: ["Being independent doesn't mean being isolated", "True independence includes choosing to connect"],
    Happiness: ["My happiest moments involve other people", "Connection is one of the deepest sources of happiness"],
    Security: ["A support network gives me emotional security", "Knowing people care about me helps me feel safe"],
    "Self-respect": ["I deserve meaningful relationships", "Reaching out shows strength, not weakness"],
    Achievement: ["Building real friendships is an achievement worth pursuing", "Connection enhances everything else I accomplish"],
    Love: ["I want to give and receive love more freely", "Love grows through connection and presence"],
    Peace: ["Being understood by others brings deep peace", "Connection helps me feel at peace with who I am"],
    Growth: ["Relationships challenge me to grow", "Other people help me see blind spots and grow beyond them"],
  },
  "stress-management": {
    Health: ["Chronic stress is destroying my health", "Managing stress protects my body and mind"],
    Family: ["My stress affects everyone around me", "I want to be calmer for my family"],
    Freedom: ["I want freedom from constant tension", "Managing stress frees me to enjoy life"],
    Honesty: ["I need to be honest about my stress levels", "Admitting I'm overwhelmed is the first step"],
    Independence: ["I want to handle stress on my own terms", "Independence means not being controlled by stress"],
    Happiness: ["Less stress means more room for joy", "I can't be happy while constantly overwhelmed"],
    Security: ["Managing stress protects my long-term stability", "Burnout threatens everything I've built"],
    "Self-respect": ["I respect myself enough to set limits", "Self-respect means not accepting unsustainable stress"],
    Achievement: ["I achieve more when I manage stress well", "Sustainable effort beats burning out"],
    Love: ["I'm more loving when I'm not stressed", "Managing stress lets me show up for the people I love"],
    Peace: ["Peace is what I'm ultimately seeking", "Calm is possible, and I deserve it"],
    Growth: ["Learning to manage stress is lifelong growth", "This challenge is an opportunity to grow"],
  },
  "self-care": {
    Health: ["Self-care is the foundation of my health", "Without self-care, everything else falls apart"],
    Family: ["I can't pour from an empty cup", "Taking care of myself makes me better for my family"],
    Freedom: ["Self-care gives me freedom to show up fully", "I want freedom from guilt about resting"],
    Honesty: ["I need to be honest that I'm neglecting myself", "Being real about my needs matters"],
    Independence: ["Self-care means I can sustain myself", "Taking care of myself is true independence"],
    Happiness: ["I'm happier when I take care of myself", "Self-care isn't selfish \u2014 it's necessary for happiness"],
    Security: ["Investing in myself creates lasting security", "Self-care is an investment in my future"],
    "Self-respect": ["Self-care is the ultimate act of self-respect", "I deserve the care I give to others"],
    Achievement: ["Maintaining myself is an achievement in itself", "Self-care enables all my other achievements"],
    Love: ["Self-care is self-love in action", "I can love others better when I love myself first"],
    Peace: ["Self-care brings me peace and balance", "I find peace when I honor my own needs"],
    Growth: ["Self-care creates the conditions for growth", "Growing means learning to put myself first sometimes"],
  },
};

// ── Commitment Options (per topic) ──────────────────────────────────────────

export const COMMITMENT_OPTIONS: Record<string, string[]> = {
  "healthy-eating": [
    "I will eat one healthy meal per day this week",
    "I will drink more water and less sugary drinks",
    "I will plan my meals for three days this week",
    "I will try one new healthy recipe this week",
    "I will eat a fruit or vegetable with every meal",
    "I will keep a food journal for three days",
  ],
  exercise: [
    "I will take a 10-minute walk three times this week",
    "I will do a short workout video at home",
    "I will stretch for 5 minutes every morning",
    "I will find one physical activity I enjoy and do it",
    "I will take the stairs instead of the elevator",
    "I will schedule exercise time in my calendar",
  ],
  "substance-use": [
    "I will have one substance-free day this week",
    "I will track my use in a journal for one week",
    "I will call a friend instead of using when I feel triggered",
    "I will attend one support meeting or group",
    "I will identify my top three triggers and plan alternatives",
    "I will talk to someone I trust about my goals",
  ],
  "screen-time": [
    "I will put my phone down one hour before bed",
    "I will have one screen-free hour each day",
    "I will set app time limits on my most-used apps",
    "I will leave my phone in another room during meals",
    "I will replace 30 minutes of scrolling with a hobby",
    "I will turn off non-essential notifications",
  ],
  sleep: [
    "I will set a consistent bedtime for five nights this week",
    "I will create a 15-minute wind-down routine before bed",
    "I will avoid caffeine after 2 PM",
    "I will keep my bedroom dark, cool, and quiet",
    "I will stop using screens 30 minutes before bed",
    "I will track my sleep for one week to spot patterns",
  ],
  "social-connection": [
    "I will reach out to one person I haven't talked to recently",
    "I will say yes to the next social invitation I receive",
    "I will join one group, club, or class this month",
    "I will have a meaningful conversation with someone this week",
    "I will invite someone to do an activity together",
    "I will practice being open and vulnerable with one person",
  ],
  "stress-management": [
    "I will practice deep breathing for 5 minutes each day",
    "I will identify one stressor I can reduce or eliminate",
    "I will take a 10-minute break when I feel overwhelmed",
    "I will say no to one thing that drains my energy",
    "I will try a new relaxation technique this week",
    "I will talk to someone about what's stressing me",
  ],
  "self-care": [
    "I will schedule 30 minutes of self-care time three times this week",
    "I will do one kind thing for myself every day",
    "I will set one boundary to protect my energy",
    "I will take a break before I feel completely burned out",
    "I will do something I enjoy just for the fun of it",
    "I will write down three things I appreciate about myself",
  ],
};

// ── Importance/Confidence Reflections ───────────────────────────────────────

export const IMPORTANCE_REFLECTIONS: Record<string, Record<AgeMode, string[]>> = {
  low: {
    child: [
      "Other things feel more important right now",
      "I'm not sure this is a big deal",
      "Maybe I don't need to change this",
    ],
    teen: [
      "It's not really affecting my life that much",
      "I have bigger things to worry about",
      "I'm not convinced this needs to change",
    ],
    adult: [
      "Other priorities are taking precedence at this time",
      "The consequences aren't severe enough to motivate action yet",
      "I have ambivalence about whether this change is truly necessary",
    ],
  },
  mid: {
    child: [
      "Part of me wants to change and part of me doesn't",
      "I know it would be good for me, but it's hard",
      "I care about this, but not as much as other things",
    ],
    teen: [
      "I know it matters, but it's hard to prioritize",
      "Some days I care a lot, other days not so much",
      "I can see why it's important, but motivation comes and goes",
    ],
    adult: [
      "I recognize the importance intellectually, but emotional motivation fluctuates",
      "This change matters, but competing demands dilute my focus",
      "I see the value but haven't fully committed to prioritizing it",
    ],
  },
  high: {
    child: [
      "This is really important to me!",
      "I really want this to be different",
      "I think about wanting to change a lot",
    ],
    teen: [
      "This matters to me more than a lot of other things",
      "I think about this every day",
      "I'm tired of things being this way",
    ],
    adult: [
      "This change is deeply aligned with my core values",
      "The cost of not changing has become too high to accept",
      "I feel a strong internal pull toward making this change",
    ],
  },
};

export const CONFIDENCE_REFLECTIONS: Record<string, Record<AgeMode, string[]>> = {
  low: {
    child: [
      "I'm not sure I can do this",
      "It feels really hard",
      "I've tried before and it didn't work",
    ],
    teen: [
      "I don't think I have what it takes",
      "Past failures make me doubt myself",
      "This feels overwhelming and impossible",
    ],
    adult: [
      "My past attempts haven't been successful, reducing my self-efficacy",
      "I lack confidence in my ability to sustain this change",
      "The gap between where I am and where I want to be feels insurmountable",
    ],
  },
  mid: {
    child: [
      "I think I can do it with some help",
      "Some parts feel doable and some feel really hard",
      "I'm not sure, but I want to try",
    ],
    teen: [
      "I could probably do it if I had support",
      "I'm cautiously optimistic but not fully convinced",
      "I know I have some ability, just not sure it's enough",
    ],
    adult: [
      "I have some relevant skills, but sustaining the change concerns me",
      "With the right support and structure, I believe I could succeed",
      "My confidence grows when I focus on small, manageable steps",
    ],
  },
  high: {
    child: [
      "I know I can do this!",
      "I feel ready and strong",
      "I've done hard things before and I can do this too",
    ],
    teen: [
      "I've got the skills and determination to make this happen",
      "I believe in myself more than I used to",
      "If I commit to this, I know I can follow through",
    ],
    adult: [
      "I have the internal resources and external support needed to succeed",
      "My past experiences have equipped me well for this challenge",
      "I feel a strong sense of self-efficacy about making and maintaining this change",
    ],
  },
};

// ── Step Configuration ──────────────────────────────────────────────────────

export const STEP_CONFIGS: StepConfig[] = [
  {
    label: "Garden Plot",
    title: "Choose Your Garden Plot",
    subtitle: "What area of your life would you like to grow?",
    icon: "\uD83C\uDF0D",
  },
  {
    label: "Seeds",
    title: "Plant Your Seeds",
    subtitle: "What are your reasons for making this change?",
    icon: "\uD83C\uDF31",
  },
  {
    label: "Weeds",
    title: "Notice the Weeds",
    subtitle: "What makes it hard to change? That\u2019s okay \u2014 weeds are natural.",
    icon: "\uD83C\uDF3F",
  },
  {
    label: "Watering",
    title: "Water Your Garden",
    subtitle: "How important and how confident do you feel about this change?",
    icon: "\uD83D\uDCA7",
  },
  {
    label: "Soil",
    title: "Tend the Soil",
    subtitle: "What you value most gives your garden rich soil.",
    icon: "\uD83E\uDEB4",
  },
  {
    label: "Growing",
    title: "Watch Things Grow",
    subtitle: "Pause and notice what you\u2019ve planted.",
    icon: "\uD83C\uDF3B",
  },
  {
    label: "Harvest",
    title: "Harvest Your Bouquet",
    subtitle: "Gather your commitments and take them with you.",
    icon: "\uD83D\uDC90",
  },
];

// ── MI Concepts (for guide popup) ───────────────────────────────────────────

export const MI_CONCEPTS: MIConcept[] = [
  {
    id: "spirit",
    name: "The Spirit of MI",
    icon: "\uD83C\uDF3F",
    color: "#5ab88f",
    description:
      "MI is grounded in a collaborative, evocative, and autonomy-honoring spirit. The clinician is a partner, not an expert dispensing advice. Change motivation comes from within the client.",
    inSession:
      "Resist the righting reflex. Your role is to evoke the client\u2019s own reasons for change rather than persuading or arguing. Express empathy and support autonomy throughout.",
  },
  {
    id: "ambivalence",
    name: "Ambivalence",
    icon: "\u2696\uFE0F",
    color: "#d4a24c",
    description:
      "Ambivalence is normal and expected. People simultaneously want to change and want to stay the same. MI works with this ambivalence rather than against it.",
    inSession:
      "Normalize ambivalence. The garden metaphor (seeds vs. weeds) helps clients see that both change talk and sustain talk can coexist without one invalidating the other.",
  },
  {
    id: "change-talk",
    name: "Change Talk (DARN-CAT)",
    icon: "\uD83C\uDF31",
    color: "#e88a7a",
    description:
      "Change talk is any client speech that favors change. DARN captures preparatory change talk: Desire, Ability, Reasons, and Need. CAT captures mobilizing change talk: Commitment, Activation, and Taking Steps.",
    inSession:
      "Listen for and reinforce change talk. The Seeds step helps clients articulate their own DARN statements. Reflect back what you hear and explore it further.",
  },
  {
    id: "sustain-talk",
    name: "Sustain Talk",
    icon: "\uD83C\uDF35",
    color: "#7a8a9a",
    description:
      "Sustain talk is client speech that favors the status quo. It\u2019s the counterpart to change talk and is entirely natural. Arguing against sustain talk typically strengthens it.",
    inSession:
      "Roll with sustain talk rather than resisting it. The Weeds step validates sustain talk as natural (\u2018weeds are normal in any garden\u2019) while keeping the focus on the client\u2019s full picture.",
  },
  {
    id: "importance-confidence",
    name: "Importance & Confidence Rulers",
    icon: "\uD83D\uDCA7",
    color: "#6bc5c5",
    description:
      "Two key dimensions of readiness for change. Importance asks \u2018How much does this matter?\u2019 Confidence asks \u2018How sure are you that you can do this?\u2019 A high-importance, low-confidence gap is a prime target for MI work.",
    inSession:
      "Use the gap between importance and confidence to guide your approach. High importance + low confidence? Focus on building self-efficacy. Low importance? Explore values and consequences.",
  },
  {
    id: "values",
    name: "Values & Change",
    icon: "\uD83E\uDEB4",
    color: "#e0a84c",
    description:
      "Connecting desired changes to deeply held personal values strengthens intrinsic motivation. When a person sees how change serves what they care about most, motivation becomes more resilient.",
    inSession:
      "The Soil step helps clients draw explicit lines between their change goal and their core values. When motivation wavers in future sessions, return to these value connections.",
  },
];

// ── Welcome Screen Content ──────────────────────────────────────────────────

export const WELCOME_CONTENT: WelcomeContent = {
  subtitle: {
    child:
      "Grow a garden of reasons to make a change \u2014 and pick a bouquet of promises to take with you!",
    teen:
      "Explore what you want to change, what\u2019s holding you back, and build a plan that actually feels doable.",
    adult:
      "A Motivational Interviewing tool to explore ambivalence, strengthen change talk, and build values-aligned commitment.",
  },
  instruction: {
    child:
      "Pick your age group below and we\u2019ll start growing your garden! You\u2019ll choose something you want to change, plant seeds of hope, notice the weeds, and pick a beautiful bouquet of promises.",
    teen:
      "Select your mode to get started. You\u2019ll explore your reasons for change, acknowledge what makes it hard, rate how ready you feel, connect to what you value, and build a real commitment plan.",
    adult:
      "Select your mode to begin. This tool guides you through a structured MI process: topic selection, change talk exploration (DARN framework), sustain talk acknowledgment, importance and confidence assessment, values integration, mindful reflection, and commitment planning.",
  },
  howItWorks: {
    child:
      "First, you\u2019ll pick a garden plot \u2014 something in your life you want to grow or change. Then you\u2019ll plant seeds (your reasons for changing), notice the weeds (the hard parts), water your garden (how much you care and believe in yourself), dig into the soil (what really matters to you), watch things grow, and pick your bouquet of promises!",
    teen:
      "You\u2019ll move through seven steps: choose a change area, plant your reasons for wanting to change, acknowledge what makes it tough, rate how important and confident you feel, connect the change to your values, take a reflective pause, and build a concrete commitment plan.",
    adult:
      "This tool walks you through core MI processes applied to a specific change goal. You will select a focus area, articulate preparatory change talk using the DARN framework, validate sustain talk, assess importance and confidence using standardized rulers, connect change to personal values, engage in a brief reflective exercise, and formulate specific commitment statements.",
  },
};

// ── Guided Prompts (for mindfulness step) ───────────────────────────────────

export const GUIDED_PROMPTS: Record<AgeMode, string> = {
  child:
    "Look at your garden growing! Every seed you planted is reaching for the sun. You did that.",
  teen:
    "Take a breath. You\u2019ve been honest about what you want and what\u2019s hard. That takes real courage.",
  adult:
    "Observe the garden you\u2019ve cultivated \u2014 the seeds of change talk, the acknowledged weeds, the values in your soil. This is your motivation, made visible.",
};
