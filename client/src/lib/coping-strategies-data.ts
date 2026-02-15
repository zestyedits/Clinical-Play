export interface CopingStrategyTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  emoji: string;
  difficulty: "Easy" | "Medium" | "Hard";
  contextTags: string[];
}

export const COPING_CATEGORIES = [
  { id: "sensory", label: "Sensory", emoji: "👁️", color: "#3B82F6" },
  { id: "physical", label: "Physical", emoji: "💪", color: "#EF4444" },
  { id: "social", label: "Social", emoji: "🤝", color: "#22C55E" },
  { id: "cognitive", label: "Cognitive", emoji: "🧠", color: "#F59E0B" },
  { id: "creative", label: "Creative", emoji: "🎨", color: "#8B5CF6" },
] as const;

export const COPING_STRATEGY_LIBRARY: CopingStrategyTemplate[] = [
  { id: "lib-cold-water", name: "Cold Water Splash", description: "Splash cold water on your face or hold ice cubes to activate the dive reflex and reset your nervous system", category: "sensory", emoji: "💧", difficulty: "Easy", contextTags: ["crisis", "anger", "panic"] },
  { id: "lib-5-senses", name: "5-4-3-2-1 Grounding", description: "Name 5 things you see, 4 you hear, 3 you touch, 2 you smell, 1 you taste", category: "sensory", emoji: "🖐️", difficulty: "Easy", contextTags: ["anxiety", "dissociation", "grounding"] },
  { id: "lib-scent-anchor", name: "Scent Anchor", description: "Keep a familiar calming scent nearby and breathe it in slowly", category: "sensory", emoji: "🌸", difficulty: "Easy", contextTags: ["anxiety", "calm", "grounding"] },
  { id: "lib-texture-touch", name: "Texture Touch", description: "Hold a soft blanket, smooth stone, or textured object and focus on how it feels", category: "sensory", emoji: "🧸", difficulty: "Easy", contextTags: ["anxiety", "grounding", "comfort"] },
  { id: "lib-warm-drink", name: "Warm Drink Ritual", description: "Make tea or cocoa slowly, noticing the warmth, steam, and taste mindfully", category: "sensory", emoji: "☕", difficulty: "Easy", contextTags: ["calm", "self-care", "mindfulness"] },
  { id: "lib-music-listening", name: "Calming Music", description: "Listen to a song that makes you feel safe or peaceful, focusing on each instrument", category: "sensory", emoji: "🎵", difficulty: "Easy", contextTags: ["calm", "sadness", "regulation"] },
  { id: "lib-paced-breathing", name: "Paced Breathing", description: "Breathe in for 4 counts, hold 4, out for 6. Repeat 5 times to slow your heart rate", category: "physical", emoji: "🌬️", difficulty: "Easy", contextTags: ["anxiety", "panic", "regulation"] },
  { id: "lib-muscle-relax", name: "Progressive Muscle Relaxation", description: "Tense each muscle group for 5 seconds then release, from toes to head", category: "physical", emoji: "🧘", difficulty: "Medium", contextTags: ["tension", "anxiety", "sleep"] },
  { id: "lib-walk-it-out", name: "Walk It Out", description: "Take a brisk 5-minute walk, noticing your feet touching the ground with each step", category: "physical", emoji: "🚶", difficulty: "Easy", contextTags: ["anger", "restlessness", "energy"] },
  { id: "lib-butterfly-hug", name: "Butterfly Hug", description: "Cross arms over chest and alternately tap shoulders slowly while breathing deeply", category: "physical", emoji: "🦋", difficulty: "Easy", contextTags: ["anxiety", "trauma", "comfort"] },
  { id: "lib-shake-it-off", name: "Shake It Off", description: "Stand and shake your hands, arms, legs, and whole body for 30 seconds to release tension", category: "physical", emoji: "🫨", difficulty: "Easy", contextTags: ["tension", "anxiety", "energy"] },
  { id: "lib-yoga-pose", name: "Grounding Yoga Pose", description: "Try child pose or mountain pose for 1-2 minutes, focusing on your breath", category: "physical", emoji: "🧎", difficulty: "Medium", contextTags: ["calm", "grounding", "mindfulness"] },
  { id: "lib-safe-person-call", name: "Call a Safe Person", description: "Reach out to someone you trust, a friend, family member, or counselor", category: "social", emoji: "📱", difficulty: "Medium", contextTags: ["crisis", "loneliness", "support"] },
  { id: "lib-kind-act", name: "Random Act of Kindness", description: "Do something small for someone else: write a note, give a compliment, share a snack", category: "social", emoji: "💌", difficulty: "Easy", contextTags: ["sadness", "connection", "purpose"] },
  { id: "lib-pet-time", name: "Pet or Animal Time", description: "Spend time with a pet: petting, cuddling, or simply sitting together", category: "social", emoji: "🐾", difficulty: "Easy", contextTags: ["comfort", "loneliness", "calm"] },
  { id: "lib-boundary-script", name: "Boundary Script", description: "Practice saying I need a break or I am not okay with that, rehearse it out loud", category: "social", emoji: "🛑", difficulty: "Hard", contextTags: ["boundaries", "assertiveness", "conflict"] },
  { id: "lib-group-game", name: "Play a Group Game", description: "Join or start a card game, board game, or active game with others", category: "social", emoji: "🎲", difficulty: "Medium", contextTags: ["connection", "fun", "distraction"] },
  { id: "lib-hug-request", name: "Ask for a Hug", description: "If comfortable, ask someone safe for a hug or physical comfort", category: "social", emoji: "🤗", difficulty: "Medium", contextTags: ["comfort", "connection", "sadness"] },
  { id: "lib-thought-challenge", name: "Challenge the Thought", description: "Ask yourself: Is this thought 100% true? What evidence do I have? What would I tell a friend?", category: "cognitive", emoji: "🔍", difficulty: "Hard", contextTags: ["negative-thinking", "anxiety", "depression"] },
  { id: "lib-wise-mind", name: "Wise Mind Check", description: "Pause and ask: What does my emotional mind say? My logical mind? Where do they overlap?", category: "cognitive", emoji: "⚖️", difficulty: "Hard", contextTags: ["decision-making", "impulsivity", "regulation"] },
  { id: "lib-gratitude-three", name: "Three Good Things", description: "Name three things that went well today, no matter how small", category: "cognitive", emoji: "✨", difficulty: "Easy", contextTags: ["depression", "negativity", "perspective"] },
  { id: "lib-self-talk", name: "Compassionate Self-Talk", description: "Replace critical inner voice with kind words: I am doing my best, or This is hard AND I can cope", category: "cognitive", emoji: "💬", difficulty: "Medium", contextTags: ["self-criticism", "shame", "compassion"] },
  { id: "lib-pros-cons", name: "Pros and Cons List", description: "Write out the pros and cons of acting on an urge vs. using a coping skill instead", category: "cognitive", emoji: "📝", difficulty: "Medium", contextTags: ["impulsivity", "decision-making", "urges"] },
  { id: "lib-future-letter", name: "Letter to Future Self", description: "Write a kind letter to your future self about what you are going through and how you are coping", category: "cognitive", emoji: "✉️", difficulty: "Medium", contextTags: ["perspective", "hope", "processing"] },
  { id: "lib-free-draw", name: "Free Drawing", description: "Grab paper and draw whatever comes to mind, no rules, no judgment", category: "creative", emoji: "✏️", difficulty: "Easy", contextTags: ["expression", "calm", "processing"] },
  { id: "lib-journal", name: "Stream of Consciousness Journal", description: "Write without stopping for 5 minutes, whatever comes out, let it flow", category: "creative", emoji: "📓", difficulty: "Easy", contextTags: ["processing", "expression", "anxiety"] },
  { id: "lib-playlist", name: "Make a Mood Playlist", description: "Create a playlist that matches your feelings right now, then one that matches how you want to feel", category: "creative", emoji: "🎧", difficulty: "Easy", contextTags: ["expression", "regulation", "fun"] },
  { id: "lib-collage", name: "Feelings Collage", description: "Cut out images or words from magazines that express how you feel and arrange them", category: "creative", emoji: "🖼️", difficulty: "Medium", contextTags: ["expression", "processing", "art"] },
  { id: "lib-dance", name: "Expressive Dance", description: "Put on music and let your body move however it wants, no choreography needed", category: "creative", emoji: "💃", difficulty: "Easy", contextTags: ["energy", "expression", "fun"] },
  { id: "lib-clay-play", name: "Clay or Playdough", description: "Squeeze, shape, and mold clay or playdough, focus on the sensations in your hands", category: "creative", emoji: "🏺", difficulty: "Easy", contextTags: ["sensory", "calm", "expression"] },
];
