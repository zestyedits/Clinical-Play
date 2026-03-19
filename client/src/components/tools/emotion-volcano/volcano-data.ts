// ── Emotion Volcano — Clinical Data ─────────────────────────────────────────
// Evidence-based anger management & emotional regulation tool
// Grounded in DBT + CBT approaches to emotion regulation

export type AgeMode = "child" | "teen" | "adult";

// ── Trigger Categories ──────────────────────────────────────────────────────

export interface TriggerCategory {
  id: string;
  label: string;
  emoji: string;
  color: string;
  examples: Record<AgeMode, string[]>;
}

export const TRIGGER_CATEGORIES: TriggerCategory[] = [
  {
    id: "people",
    label: "People",
    emoji: "👥",
    color: "#e06060",
    examples: {
      child: ["Someone took my toy", "A friend was mean to me", "My sibling got more attention", "Someone didn't keep their promise"],
      teen: ["A friend talked behind my back", "My parents don't understand me", "Someone embarrassed me in front of others", "Being compared to siblings"],
      adult: ["A colleague took credit for my work", "Someone broke my trust", "Feeling dismissed in a conversation", "Unreasonable demands from others"],
    },
  },
  {
    id: "situations",
    label: "Situations",
    emoji: "🌍",
    color: "#d48a40",
    examples: {
      child: ["Being told 'no'", "Having to wait my turn", "Things not going my way", "Being late for something fun"],
      teen: ["Unfair rules at school", "Losing a game or competition", "Plans getting cancelled", "Traffic or running late"],
      adult: ["Being stuck in traffic", "Technology failing at a bad time", "Bureaucratic runaround", "Unexpected expenses or bills"],
    },
  },
  {
    id: "thoughts",
    label: "Thoughts",
    emoji: "💭",
    color: "#7c5cbf",
    examples: {
      child: ["Nobody likes me", "It's not fair!", "I can't do anything right", "Everyone is against me"],
      teen: ["I'm not good enough", "Nobody cares about how I feel", "I'll never fit in", "Things will never change"],
      adult: ["I should have handled that differently", "People are taking advantage of me", "Nothing ever works out", "I don't deserve to be treated this way"],
    },
  },
  {
    id: "physical",
    label: "Physical",
    emoji: "🫀",
    color: "#55a0b8",
    examples: {
      child: ["Being really tired", "Feeling hungry", "Being too hot or cold", "Having a headache"],
      teen: ["Not sleeping well", "Feeling exhausted after school", "Being hungry or dehydrated", "Physical pain or discomfort"],
      adult: ["Sleep deprivation", "Chronic pain flare-ups", "Caffeine or substance effects", "Hunger or blood sugar drops"],
    },
  },
];

// ── Body Warning Signs ──────────────────────────────────────────────────────

export interface BodyRegion {
  id: string;
  label: string;
  emoji: string;
  description: Record<AgeMode, string>;
  sensations: string[];
  // SVG path coordinates for the body silhouette
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}

export const BODY_REGIONS: BodyRegion[] = [
  {
    id: "head",
    label: "Head",
    emoji: "🧠",
    description: {
      child: "My head feels hot or poundy",
      teen: "Tension headache, racing thoughts",
      adult: "Tension headache, mental fog, racing thoughts",
    },
    sensations: ["Pressure", "Throbbing", "Racing thoughts", "Foggy thinking"],
    cx: 50, cy: 8, rx: 8, ry: 8,
  },
  {
    id: "face",
    label: "Face",
    emoji: "😤",
    description: {
      child: "My face gets all hot and red",
      teen: "Face flushes, jaw clenches, nostrils flare",
      adult: "Facial flushing, jaw clenching, teeth grinding",
    },
    sensations: ["Flushing", "Jaw clenching", "Teeth grinding", "Nostrils flaring"],
    cx: 50, cy: 15, rx: 6, ry: 4,
  },
  {
    id: "throat",
    label: "Throat",
    emoji: "😶",
    description: {
      child: "I get a lump in my throat",
      teen: "Throat tightens, voice gets louder or shaky",
      adult: "Throat constriction, voice changes, difficulty swallowing",
    },
    sensations: ["Tightness", "Lump feeling", "Voice rising", "Difficulty swallowing"],
    cx: 50, cy: 22, rx: 4, ry: 3,
  },
  {
    id: "shoulders",
    label: "Shoulders",
    emoji: "💪",
    description: {
      child: "My shoulders go up to my ears",
      teen: "Shoulders tense up, feel rigid",
      adult: "Shoulder tension, hunching, muscle rigidity",
    },
    sensations: ["Tension", "Rising up", "Hunching", "Rigidity"],
    cx: 50, cy: 28, rx: 18, ry: 4,
  },
  {
    id: "chest",
    label: "Chest",
    emoji: "💓",
    description: {
      child: "My heart goes really fast",
      teen: "Heart pounds, chest feels tight, breathing speeds up",
      adult: "Rapid heartbeat, chest tightness, hyperventilation",
    },
    sensations: ["Pounding heart", "Tightness", "Rapid breathing", "Pressure"],
    cx: 50, cy: 35, rx: 12, ry: 6,
  },
  {
    id: "stomach",
    label: "Stomach",
    emoji: "🤢",
    description: {
      child: "My tummy feels all knotted up",
      teen: "Stomach churns, feel nauseous, butterflies but bad",
      adult: "Stomach churning, nausea, digestive distress, knots",
    },
    sensations: ["Churning", "Nausea", "Knots", "Butterflies"],
    cx: 50, cy: 46, rx: 10, ry: 6,
  },
  {
    id: "hands",
    label: "Hands & Fists",
    emoji: "✊",
    description: {
      child: "I squeeze my hands into fists",
      teen: "Hands clench, fingers grip, palms sweat",
      adult: "Fist clenching, trembling, sweaty palms, gripping",
    },
    sensations: ["Clenching", "Trembling", "Sweating", "Tingling"],
    cx: 22, cy: 55, rx: 5, ry: 5,
  },
  {
    id: "arms",
    label: "Arms",
    emoji: "🦾",
    description: {
      child: "My arms feel like they want to push or hit",
      teen: "Arms tense, urge to throw or punch something",
      adult: "Arm tension, restless energy, urge to strike",
    },
    sensations: ["Tension", "Restlessness", "Urge to push", "Heaviness"],
    cx: 28, cy: 42, rx: 5, ry: 10,
  },
  {
    id: "legs",
    label: "Legs",
    emoji: "🦵",
    description: {
      child: "I want to stomp my feet or run away",
      teen: "Legs feel restless, want to pace or storm off",
      adult: "Restless legs, pacing urge, tension in thighs",
    },
    sensations: ["Restlessness", "Pacing urge", "Trembling", "Weakness"],
    cx: 43, cy: 72, rx: 6, ry: 16,
  },
  {
    id: "whole-body",
    label: "Whole Body",
    emoji: "🔥",
    description: {
      child: "My whole body feels hot and shaky",
      teen: "Full-body heat, trembling, surge of energy",
      adult: "Adrenaline surge, full-body tension, heat wave, trembling",
    },
    sensations: ["Heat wave", "Trembling", "Energy surge", "Sweating"],
    cx: 50, cy: 50, rx: 18, ry: 28,
  },
];

// ── Cooling Techniques ──────────────────────────────────────────────────────

export type CoolingSpeed = "instant" | "short" | "extended";

export interface CoolingTechnique {
  id: string;
  name: string;
  emoji: string;
  speed: CoolingSpeed;
  duration: string;
  power: number; // 1-5, how much it cools the volcano
  description: Record<AgeMode, string>;
  instructions: Record<AgeMode, string[]>;
  category: "breathing" | "grounding" | "movement" | "cognitive" | "sensory" | "social";
}

export const COOLING_TECHNIQUES: CoolingTechnique[] = [
  // --- Instant (5-30 seconds) ---
  {
    id: "deep-breath",
    name: "Deep Belly Breath",
    emoji: "🌊",
    speed: "instant",
    duration: "10 sec",
    power: 2,
    category: "breathing",
    description: {
      child: "Breathe in like you're smelling a flower, out like you're blowing a candle",
      teen: "Slow, deep breaths to activate your body's calm-down system",
      adult: "Diaphragmatic breathing to engage the parasympathetic nervous system",
    },
    instructions: {
      child: ["Smell the flower (breathe in through nose for 4)", "Blow out the candle (breathe out through mouth for 6)", "Do this 3 times"],
      teen: ["Breathe in through your nose for 4 counts", "Hold for 2 counts", "Breathe out through your mouth for 6 counts", "Repeat 3 times"],
      adult: ["Inhale through the nose for 4 counts, expanding the belly", "Hold for 4 counts", "Exhale slowly through the mouth for 6-8 counts", "Notice the release of tension with each exhale"],
    },
  },
  {
    id: "grounding-5-4-3-2-1",
    name: "5-4-3-2-1 Grounding",
    emoji: "🌿",
    speed: "instant",
    duration: "30 sec",
    power: 3,
    category: "grounding",
    description: {
      child: "Use your senses to come back to right now",
      teen: "A quick sensory check-in to pull you out of the anger spiral",
      adult: "Sensory-based grounding to interrupt emotional escalation",
    },
    instructions: {
      child: ["Name 5 things you can see", "4 things you can touch", "3 things you can hear", "2 things you can smell", "1 thing you can taste"],
      teen: ["Look around: 5 things you see", "Touch: 4 different textures near you", "Listen: 3 sounds you hear", "Smell: 2 things you notice", "Taste: 1 thing (even just the inside of your mouth)"],
      adult: ["Identify 5 visible objects in detail", "Touch 4 surfaces, noting temperature and texture", "Distinguish 3 ambient sounds", "Notice 2 scents", "Taste 1 thing — even saliva or a sip of water"],
    },
  },
  {
    id: "cold-water",
    name: "Cold Water Reset",
    emoji: "🧊",
    speed: "instant",
    duration: "15 sec",
    power: 3,
    category: "sensory",
    description: {
      child: "Put cold water on your wrists — it's like a reset button!",
      teen: "Cold water on your face or wrists triggers your dive reflex and calms you fast",
      adult: "Cold temperature activates the mammalian dive reflex, rapidly lowering heart rate",
    },
    instructions: {
      child: ["Run cold water over your wrists", "Splash some on your face", "Hold an ice cube in your hand"],
      teen: ["Splash cold water on your face", "Hold ice cubes in your hands", "Press a cold pack to the back of your neck"],
      adult: ["Submerge face in cold water for 15-30 seconds", "Hold ice cubes in both hands", "Apply cold pack to temples or back of neck", "This activates the dive reflex and slows heart rate"],
    },
  },
  {
    id: "counting",
    name: "Countdown",
    emoji: "🔢",
    speed: "instant",
    duration: "10 sec",
    power: 1,
    category: "cognitive",
    description: {
      child: "Count backwards from 10 really slowly",
      teen: "Count backwards from 20 to create space between trigger and reaction",
      adult: "Reverse counting to engage prefrontal cortex and create a response gap",
    },
    instructions: {
      child: ["Count slowly from 10 to 1", "Take a breath between each number", "By 1, check how you feel"],
      teen: ["Count backwards from 20", "Focus only on the numbers", "Breathe between each one", "Notice the anger dial lowering with each number"],
      adult: ["Count backwards from 30 by 3s (30, 27, 24...)", "The cognitive effort interrupts the amygdala hijack", "Pair with slow breathing for maximum effect"],
    },
  },
  {
    id: "muscle-squeeze",
    name: "Squeeze & Release",
    emoji: "💪",
    speed: "instant",
    duration: "15 sec",
    power: 2,
    category: "movement",
    description: {
      child: "Squeeze all your muscles tight like a robot, then go floppy like a rag doll",
      teen: "Tense everything for 5 seconds then release — the release is the calming part",
      adult: "Progressive muscle tension-release to discharge physical arousal",
    },
    instructions: {
      child: ["Squeeze every muscle super tight!", "Hold for 5 seconds like a statue", "Let everything go floppy!", "Feel how different that is"],
      teen: ["Clench your fists, tighten your arms, shoulders, everything", "Hold for 5-7 seconds", "Release all at once", "Notice the wave of relaxation"],
      adult: ["Systematically tense all major muscle groups simultaneously", "Hold maximum tension for 7-10 seconds", "Release completely and notice the contrast", "Repeat if needed — each cycle deepens relaxation"],
    },
  },

  // --- Short (1-5 minutes) ---
  {
    id: "walk-it-off",
    name: "Movement Break",
    emoji: "🚶",
    speed: "short",
    duration: "2-5 min",
    power: 4,
    category: "movement",
    description: {
      child: "Go for a quick walk or do jumping jacks to shake out the anger",
      teen: "Move your body — walk, stretch, or do some exercises to burn off the energy",
      adult: "Physical activity to metabolize stress hormones and discharge anger energy",
    },
    instructions: {
      child: ["Do 10 jumping jacks", "Run in place for 30 seconds", "Stretch up high then touch your toes", "Shake your hands and feet out"],
      teen: ["Take a brisk walk — even just around the room", "Do push-ups or jumping jacks", "Stretch your whole body", "Focus on how your body feels as you move"],
      adult: ["Walk briskly for 2-5 minutes", "Do vigorous exercise (push-ups, squats, stairs)", "Focus on the physical sensations of movement", "This metabolizes cortisol and adrenaline directly"],
    },
  },
  {
    id: "journal-dump",
    name: "Anger Dump Writing",
    emoji: "📝",
    speed: "short",
    duration: "3-5 min",
    power: 3,
    category: "cognitive",
    description: {
      child: "Draw or write about how angry you feel — get it all out on paper",
      teen: "Brain-dump everything you're feeling onto paper — no filter, no judgment",
      adult: "Expressive writing to externalize and process anger without acting on it",
    },
    instructions: {
      child: ["Grab paper and crayons", "Draw your anger — what color is it? What shape?", "Write or scribble how you feel", "You can crumple it up after if you want"],
      teen: ["Grab a notebook or paper", "Write everything you're feeling — ugly, messy, honest", "Don't censor yourself — this is just for you", "After 3-5 minutes, read it back and notice what shifts"],
      adult: ["Set a timer for 5 minutes", "Write continuously about what triggered you and how you feel", "Include body sensations, thoughts, and urges", "Afterward, identify: what's the core need underneath the anger?"],
    },
  },
  {
    id: "progressive-relaxation",
    name: "Body Scan Relaxation",
    emoji: "🧘",
    speed: "short",
    duration: "3-5 min",
    power: 4,
    category: "movement",
    description: {
      child: "Relax every part of your body one piece at a time, like melting ice cream",
      teen: "Scan through your body and relax each part — from toes to head",
      adult: "Progressive muscle relaxation to systematically release stored tension",
    },
    instructions: {
      child: ["Start at your toes — wiggle them, then let them relax", "Move to your legs — tighten, then let them go heavy", "Keep going up through tummy, arms, shoulders, face", "Imagine you're melting into the ground like ice cream"],
      teen: ["Find a comfortable position", "Start at your feet: tense for 5 sec, release", "Work up: calves, thighs, stomach, chest, arms, shoulders, face", "Notice how different relaxed muscles feel from tense ones"],
      adult: ["Sit or lie comfortably with eyes closed", "Tense each muscle group for 5-7 seconds", "Release and notice the sensation for 15-20 seconds", "Progress: feet → calves → thighs → glutes → abs → chest → hands → arms → shoulders → neck → face"],
    },
  },
  {
    id: "opposite-action",
    name: "Opposite Action",
    emoji: "🔄",
    speed: "short",
    duration: "1-3 min",
    power: 3,
    category: "cognitive",
    description: {
      child: "Do the opposite of what anger tells you — be extra gentle and kind",
      teen: "Anger says 'attack' — so do the opposite: speak softly, relax your body, be gentle",
      adult: "DBT opposite action: deliberately act contrary to the action urge of anger",
    },
    instructions: {
      child: ["Anger says shout — so whisper instead", "Anger says push — so give a gentle touch", "Anger says stomp — so tiptoe", "Anger says frown — so find a tiny smile"],
      teen: ["Notice what anger is urging you to do", "Do the exact opposite action", "Speak softly instead of yelling", "Relax your body instead of tensing", "Walk away instead of approaching the trigger"],
      adult: ["Identify the specific action urge (yell, slam, withdraw)", "Choose the opposite: speak gently, open posture, approach calmly", "Commit to the opposite action fully (half-measures don't work)", "Maintain for 2-3 minutes — notice the emotion start to shift"],
    },
  },
  {
    id: "sensory-toolkit",
    name: "Sensory Soothing Kit",
    emoji: "🎧",
    speed: "short",
    duration: "2-5 min",
    power: 3,
    category: "sensory",
    description: {
      child: "Use your favorite cozy things to help calm down — a soft blanket, nice smell, music",
      teen: "Engage your senses with calming things: music, scents, textures",
      adult: "Self-soothing through each sense to shift emotional state",
    },
    instructions: {
      child: ["Wrap up in a soft blanket or hold a stuffed animal", "Smell something nice like lavender or a favorite food", "Listen to a calm song", "Look at something pretty or soothing"],
      teen: ["Put on calming or favorite music with headphones", "Use a scent you like (lotion, candle, essential oil)", "Hold something with an interesting texture", "Drink something warm and focus on the taste"],
      adult: ["Sight: Look at nature photos or a calming scene", "Sound: Play soothing music or nature sounds", "Smell: Essential oils, fresh air, or a favorite scent", "Touch: Soft fabric, warm bath, or textured object", "Taste: Slowly savor a piece of chocolate or warm drink"],
    },
  },

  // --- Extended (5+ minutes) ---
  {
    id: "physical-exercise",
    name: "Full Exercise Session",
    emoji: "🏃",
    speed: "extended",
    duration: "10-30 min",
    power: 5,
    category: "movement",
    description: {
      child: "Go play outside, ride your bike, or do something really active",
      teen: "Full workout, run, swim, or any intense physical activity",
      adult: "Vigorous exercise to fully metabolize stress hormones and reset the nervous system",
    },
    instructions: {
      child: ["Go outside and run around", "Ride your bike or scooter", "Play an active game", "Dance to your favorite songs"],
      teen: ["Go for a run or bike ride", "Do a full workout", "Play a sport or dance", "Aim for at least 15-20 minutes of elevated heart rate"],
      adult: ["Choose vigorous cardio: running, cycling, swimming, HIIT", "Maintain elevated heart rate for 20-30 minutes", "This directly metabolizes cortisol and adrenaline", "Follow with stretching to complete the stress cycle"],
    },
  },
  {
    id: "talk-to-someone",
    name: "Safe Person Check-In",
    emoji: "🗣️",
    speed: "extended",
    duration: "5-15 min",
    power: 4,
    category: "social",
    description: {
      child: "Talk to a grown-up you trust about how you're feeling",
      teen: "Reach out to someone you trust — talking helps process the anger",
      adult: "Connect with a trusted person for co-regulation and perspective",
    },
    instructions: {
      child: ["Think of a grown-up who listens well", "Tell them 'I'm feeling really angry because...'", "Let them help you figure out what to do", "Sometimes just being heard helps the most"],
      teen: ["Text or call a friend, family member, or counselor", "Start with: 'I'm really frustrated right now because...'", "Ask them to just listen first before giving advice", "Co-regulation: being with a calm person helps you calm down"],
      adult: ["Identify your safe person (partner, friend, therapist, mentor)", "Use 'I' statements: 'I'm feeling angry because I need...'", "Request what you need: listening, validation, perspective", "Co-regulation leverages our social nervous system to calm down"],
    },
  },
  {
    id: "creative-expression",
    name: "Creative Channel",
    emoji: "🎨",
    speed: "extended",
    duration: "10-20 min",
    power: 4,
    category: "sensory",
    description: {
      child: "Make art! Draw, paint, mold clay — turn the anger into something cool",
      teen: "Channel the energy into music, art, writing, or any creative outlet",
      adult: "Creative expression to sublimate anger into productive, cathartic output",
    },
    instructions: {
      child: ["Draw a picture of the anger — make it big and colorful!", "Mold clay or playdough (squish it really hard!)", "Make up a song or drum on things", "Build something with blocks and then... maybe knock it down"],
      teen: ["Draw, paint, or sketch — abstract is great for anger", "Play an instrument or make music", "Write poetry, lyrics, or a rant piece", "Photography, digital art, or any medium that speaks to you"],
      adult: ["Engage in any creative medium you connect with", "Let the anger energy inform the intensity of the work", "Don't judge the output — the process IS the point", "This is sublimation: transforming difficult emotions into creation"],
    },
  },
  {
    id: "mindfulness-meditation",
    name: "Mindfulness Practice",
    emoji: "🕯️",
    speed: "extended",
    duration: "5-15 min",
    power: 5,
    category: "breathing",
    description: {
      child: "Sit quietly and notice what's happening inside you, like watching clouds float by",
      teen: "Observe the anger without acting on it — watch it rise and fall like waves",
      adult: "Mindfulness meditation to observe anger non-reactively, allowing it to process naturally",
    },
    instructions: {
      child: ["Sit comfortably and close your eyes", "Imagine your anger is a cloud — just watch it", "Notice where you feel it in your body", "Breathe and watch the cloud slowly float away"],
      teen: ["Find a quiet spot and set a timer", "Close your eyes and notice the anger without trying to change it", "Where is it in your body? What does it feel like?", "Imagine it like a wave — it will rise, peak, and fall on its own"],
      adult: ["Sit in a comfortable, upright position", "Set a timer for 5-15 minutes", "Observe the anger as sensation: location, quality, intensity, movement", "Don't suppress or amplify — witness it with curiosity", "Notice: emotions are temporary states, not permanent conditions", "Each wave of anger has a natural arc if we don't feed it"],
    },
  },
];

// ── Prevention Plan Tiers ───────────────────────────────────────────────────

export interface PlanTier {
  id: string;
  label: string;
  emoji: string;
  color: string;
  description: Record<AgeMode, string>;
  maxItems: number;
}

export const PLAN_TIERS: PlanTier[] = [
  {
    id: "early-warning",
    label: "Early Warning",
    emoji: "🟡",
    color: "#d4a853",
    description: {
      child: "The first signs that the volcano is starting to rumble",
      teen: "The early body signals that anger is building",
      adult: "Initial physiological cues indicating emotional escalation",
    },
    maxItems: 4,
  },
  {
    id: "first-response",
    label: "First Response",
    emoji: "🟠",
    color: "#d47a40",
    description: {
      child: "Quick things you can do right away to cool down",
      teen: "Your go-to quick techniques when you first notice the warning signs",
      adult: "Rapid intervention techniques deployed at first sign of escalation",
    },
    maxItems: 3,
  },
  {
    id: "full-cool-down",
    label: "Full Cool-Down",
    emoji: "🔵",
    color: "#5588bb",
    description: {
      child: "Bigger activities for when the volcano is really rumbling",
      teen: "Longer strategies for when anger is high and you need a full reset",
      adult: "Extended regulation strategies for complete nervous system reset",
    },
    maxItems: 2,
  },
];

// ── Step Definitions ────────────────────────────────────────────────────────

export interface StepDef {
  title: Record<AgeMode, string>;
  subtitle: Record<AgeMode, string>;
  icon: string;
  bg: string;
  accent: string;
  glow: string;
  floats: string[];
}

export const STEPS: StepDef[] = [
  {
    title: { child: "Build Your Volcano", teen: "Your Volcano", adult: "Baseline Assessment" },
    subtitle: { child: "How hot is your volcano feeling right now?", teen: "Check your emotional temperature before we start", adult: "Assess your current emotional baseline and set the scene" },
    icon: "🌋",
    bg: "linear-gradient(170deg, #1a1210 0%, #2a1815 40%, #201210 70%, #180e0a 100%)",
    accent: "#e06040",
    glow: "rgba(224,96,64,0.1)",
    floats: ["🌋", "🔥", "💨"],
  },
  {
    title: { child: "Fill the Lava!", teen: "Trigger Lava", adult: "Identify Triggers" },
    subtitle: { child: "What things make your volcano bubble?", teen: "What fills your volcano with anger?", adult: "Map the triggers that escalate your emotional state" },
    icon: "🫧",
    bg: "linear-gradient(170deg, #1a1008 0%, #2a1a10 40%, #201510 70%, #180e08 100%)",
    accent: "#d48a40",
    glow: "rgba(212,138,64,0.1)",
    floats: ["🫧", "🌡️", "⚡"],
  },
  {
    title: { child: "Body Alarm Bells", teen: "Warning Signs", adult: "Physical Warning Signals" },
    subtitle: { child: "Where in your body do you feel the anger?", teen: "Map where anger shows up in your body", adult: "Identify your somatic precursors to anger escalation" },
    icon: "🚨",
    bg: "linear-gradient(170deg, #1a1015 0%, #251520 40%, #201018 70%, #180a15 100%)",
    accent: "#d45580",
    glow: "rgba(212,85,128,0.08)",
    floats: ["🚨", "🫀", "⚠️"],
  },
  {
    title: { child: "Cooling Powers!", teen: "Cooling Station", adult: "Regulation Techniques" },
    subtitle: { child: "Pick your superpowers to cool the volcano down!", teen: "Choose your cooling techniques and watch the lava drop", adult: "Select and practice evidence-based regulation strategies" },
    icon: "❄️",
    bg: "linear-gradient(170deg, #0a1520 0%, #102030 40%, #0e1a2a 70%, #081520 100%)",
    accent: "#55a0d8",
    glow: "rgba(85,160,216,0.1)",
    floats: ["❄️", "🌊", "🧊"],
  },
  {
    title: { child: "My Cool-Down Plan", teen: "Prevention Plan", adult: "Eruption Prevention Plan" },
    subtitle: { child: "Build your plan for when the volcano starts to rumble!", teen: "Create your 3-step plan: spot it, stop it, cool it", adult: "Build a tiered response plan: early warning → first response → full cool-down" },
    icon: "📋",
    bg: "linear-gradient(170deg, #101520 0%, #1a2030 40%, #151a28 70%, #0e1220 100%)",
    accent: "#7cb87c",
    glow: "rgba(124,184,124,0.08)",
    floats: ["📋", "✅", "🛡️"],
  },
  {
    title: { child: "My Volcano Report!", teen: "Volcano Report", adult: "Session Summary" },
    subtitle: { child: "Look at everything you learned about your volcano!", teen: "Your complete volcano profile and cool-down toolkit", adult: "Comprehensive anger profile with personalized regulation strategies" },
    icon: "🏆",
    bg: "linear-gradient(170deg, #101518 0%, #182028 40%, #141a22 70%, #0e1218 100%)",
    accent: "#d4a853",
    glow: "rgba(212,168,83,0.1)",
    floats: ["🏆", "🌸", "✨"],
  },
];

// ── Volcano Visual Stages ───────────────────────────────────────────────────

export interface VolcanoStage {
  minTemp: number;
  label: string;
  smokeIntensity: number;
  lavaLevel: number;
  glowColor: string;
  particleCount: number;
}

export const VOLCANO_STAGES: VolcanoStage[] = [
  { minTemp: 0, label: "Calm", smokeIntensity: 0.1, lavaLevel: 0, glowColor: "#334455", particleCount: 2 },
  { minTemp: 2, label: "Warming", smokeIntensity: 0.25, lavaLevel: 0.15, glowColor: "#664433", particleCount: 4 },
  { minTemp: 4, label: "Simmering", smokeIntensity: 0.4, lavaLevel: 0.3, glowColor: "#885522", particleCount: 7 },
  { minTemp: 6, label: "Bubbling", smokeIntensity: 0.6, lavaLevel: 0.5, glowColor: "#aa4400", particleCount: 12 },
  { minTemp: 8, label: "Rumbling", smokeIntensity: 0.8, lavaLevel: 0.75, glowColor: "#cc3300", particleCount: 18 },
  { minTemp: 10, label: "ERUPTING!", smokeIntensity: 1.0, lavaLevel: 1.0, glowColor: "#ff2200", particleCount: 30 },
];

export function getVolcanoStage(temp: number): VolcanoStage {
  let stage = VOLCANO_STAGES[0];
  for (const s of VOLCANO_STAGES) {
    if (temp >= s.minTemp) stage = s;
  }
  return stage;
}
