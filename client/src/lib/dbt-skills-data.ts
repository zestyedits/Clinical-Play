export interface DbtSkill {
  id: string;
  name: string;
  shortName: string;
  emoji: string;
  module: string;
  description: string;
}

export const DBT_MODULES = [
  { id: "mindfulness", label: "Mindfulness", color: "#3B82F6", houseSection: "foundation" },
  { id: "distress-tolerance", label: "Distress Tolerance", color: "#22C55E", houseSection: "left-wall" },
  { id: "emotion-regulation", label: "Emotion Regulation", color: "#F97316", houseSection: "right-wall" },
  { id: "interpersonal-effectiveness", label: "Interpersonal Effectiveness", color: "#8B5CF6", houseSection: "roof" },
] as const;

export const DBT_SKILLS: DbtSkill[] = [
  // Mindfulness
  { id: "wise-mind", name: "Wise Mind", shortName: "Wise Mind", emoji: "🧘", module: "mindfulness", description: "Finding the balance between emotion mind and reasonable mind" },
  { id: "observe", name: "Observe", shortName: "Observe", emoji: "👁️", module: "mindfulness", description: "Just notice the experience without getting caught up in it" },
  { id: "describe", name: "Describe", shortName: "Describe", emoji: "📝", module: "mindfulness", description: "Put words on the experience, label feelings and thoughts" },
  { id: "participate", name: "Participate", shortName: "Participate", emoji: "🙌", module: "mindfulness", description: "Throw yourself into the current moment fully" },
  { id: "nonjudgmental", name: "Non-Judgmental Stance", shortName: "Non-Judge", emoji: "⚖️", module: "mindfulness", description: "See but don't evaluate; acknowledge without judging" },
  { id: "one-mindfully", name: "One-Mindfully", shortName: "One-Mind", emoji: "🎯", module: "mindfulness", description: "Do one thing at a time with full attention" },
  { id: "effectively", name: "Effectiveness", shortName: "Effective", emoji: "✅", module: "mindfulness", description: "Focus on what works rather than what is right or fair" },

  // Distress Tolerance
  { id: "tipp", name: "TIPP Skills", shortName: "TIPP", emoji: "🧊", module: "distress-tolerance", description: "Temperature, Intense exercise, Paced breathing, Progressive relaxation" },
  { id: "stop", name: "STOP Skill", shortName: "STOP", emoji: "🛑", module: "distress-tolerance", description: "Stop, Take a step back, Observe, Proceed mindfully" },
  { id: "pros-cons", name: "Pros and Cons", shortName: "Pros/Cons", emoji: "📊", module: "distress-tolerance", description: "Weigh advantages and disadvantages of tolerating vs. not tolerating distress" },
  { id: "wise-mind-accepts", name: "ACCEPTS", shortName: "ACCEPTS", emoji: "🎭", module: "distress-tolerance", description: "Activities, Contributing, Comparisons, Emotions, Pushing away, Thoughts, Sensations" },
  { id: "self-soothe", name: "Self-Soothe (5 Senses)", shortName: "Self-Soothe", emoji: "🌸", module: "distress-tolerance", description: "Comfort yourself using the five senses: sight, sound, smell, taste, touch" },
  { id: "improve", name: "IMPROVE the Moment", shortName: "IMPROVE", emoji: "🌈", module: "distress-tolerance", description: "Imagery, Meaning, Prayer, Relaxation, One thing, Vacation, Encouragement" },
  { id: "radical-acceptance", name: "Radical Acceptance", shortName: "Rad Accept", emoji: "🕊️", module: "distress-tolerance", description: "Completely accepting reality as it is, without fighting it" },
  { id: "turning-mind", name: "Turning the Mind", shortName: "Turn Mind", emoji: "🔄", module: "distress-tolerance", description: "Choosing to accept reality over and over again" },
  { id: "willingness", name: "Willingness", shortName: "Willing", emoji: "🤲", module: "distress-tolerance", description: "Responding to situations as they are, not as you wish they were" },

  // Emotion Regulation
  { id: "check-facts", name: "Check the Facts", shortName: "Check Facts", emoji: "🔍", module: "emotion-regulation", description: "Determine if your emotional response fits the facts of the situation" },
  { id: "opposite-action", name: "Opposite Action", shortName: "Opposite", emoji: "↩️", module: "emotion-regulation", description: "Act opposite to the action urge of the emotion" },
  { id: "problem-solving", name: "Problem Solving", shortName: "Solve", emoji: "🔧", module: "emotion-regulation", description: "Identify the problem and implement a solution step by step" },
  { id: "abc-please", name: "ABC PLEASE", shortName: "ABC", emoji: "💊", module: "emotion-regulation", description: "Accumulate positives, Build mastery, Cope ahead; PhysicaL illness, Eating, Avoid drugs, Sleep, Exercise" },
  { id: "build-mastery", name: "Build Mastery", shortName: "Mastery", emoji: "🏗️", module: "emotion-regulation", description: "Do things that make you feel competent and in control" },
  { id: "cope-ahead", name: "Cope Ahead", shortName: "Cope Ahead", emoji: "🗺️", module: "emotion-regulation", description: "Rehearse a plan for handling difficult situations before they happen" },
  { id: "emotion-wave", name: "Ride the Wave", shortName: "Ride Wave", emoji: "🌊", module: "emotion-regulation", description: "Observe and experience the emotion without acting on it" },
  { id: "accumulate-positive", name: "Accumulate Positives", shortName: "Positives", emoji: "✨", module: "emotion-regulation", description: "Build positive experiences in daily life" },

  // Interpersonal Effectiveness
  { id: "dear-man", name: "DEAR MAN", shortName: "DEAR MAN", emoji: "🗣️", module: "interpersonal-effectiveness", description: "Describe, Express, Assert, Reinforce, Mindful, Appear confident, Negotiate" },
  { id: "give", name: "GIVE Skill", shortName: "GIVE", emoji: "🤝", module: "interpersonal-effectiveness", description: "Gentle, Interested, Validate, Easy manner" },
  { id: "fast", name: "FAST Skill", shortName: "FAST", emoji: "⚡", module: "interpersonal-effectiveness", description: "Fair, Apologies (no excessive), Stick to values, Truthful" },
  { id: "validation", name: "Validation", shortName: "Validate", emoji: "💛", module: "interpersonal-effectiveness", description: "Communicate that another person's feelings, thoughts, and actions are understandable" },
  { id: "dialectics", name: "Dialectics", shortName: "Dialectics", emoji: "☯️", module: "interpersonal-effectiveness", description: "Find the truth in both sides; move from 'either/or' to 'both/and'" },
  { id: "boundaries", name: "Healthy Boundaries", shortName: "Boundaries", emoji: "🚧", module: "interpersonal-effectiveness", description: "Set and maintain clear, healthy limits in relationships" },
  { id: "relationship-repair", name: "Relationship Repair", shortName: "Repair", emoji: "🩹", module: "interpersonal-effectiveness", description: "Skills for repairing and rebuilding damaged relationships" },
];
