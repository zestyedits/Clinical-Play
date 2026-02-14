export type BreathingPhaseType = "inhale" | "hold" | "exhale" | "rest";

export interface BreathingPhase {
  type: BreathingPhaseType;
  label: string;
  duration: number; // ms
  icon: string;
}

export interface BreathingTechnique {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  emoji: string;
  phases: BreathingPhase[];
  colors: {
    primary: string;
    secondary: string;
    tertiary: string;
    inhale: string;
    hold: string;
    exhale: string;
    rest: string;
  };
  audioTheme: string;
  kidFriendly: boolean;
}

export const BREATHING_TECHNIQUES: BreathingTechnique[] = [
  {
    id: "ocean-waves",
    name: "Ocean Waves",
    subtitle: "4-4-6-2 Calm",
    description: "A calming rhythm inspired by ocean waves, ideal for grounding and relaxation.",
    emoji: "\u{1F30A}",
    phases: [
      { type: "inhale", label: "Breathe In", duration: 4000, icon: "\u2191" },
      { type: "hold", label: "Hold", duration: 4000, icon: "\u25CF" },
      { type: "exhale", label: "Breathe Out", duration: 6000, icon: "\u2193" },
      { type: "rest", label: "Rest", duration: 2000, icon: "~" },
    ],
    colors: {
      primary: "#0a1628",
      secondary: "#0d3b5c",
      tertiary: "#1a6a7a",
      inhale: "hsl(195, 70%, 55%)",
      hold: "hsl(45, 70%, 65%)",
      exhale: "hsl(170, 50%, 50%)",
      rest: "hsl(210, 30%, 60%)",
    },
    audioTheme: "ocean",
    kidFriendly: true,
  },
  {
    id: "balloon-rise",
    name: "Balloon Rise",
    subtitle: "4-4 Simple",
    description: "A simple two-phase breathing pattern perfect for children and beginners.",
    emoji: "\u{1F388}",
    phases: [
      { type: "inhale", label: "Inflate", duration: 4000, icon: "\u2191" },
      { type: "exhale", label: "Deflate", duration: 4000, icon: "\u2193" },
    ],
    colors: {
      primary: "#e8f4fd",
      secondary: "#87CEEB",
      tertiary: "#5ba3c9",
      inhale: "hsl(200, 80%, 60%)",
      hold: "hsl(200, 60%, 65%)",
      exhale: "hsl(340, 60%, 65%)",
      rest: "hsl(200, 40%, 70%)",
    },
    audioTheme: "balloon",
    kidFriendly: true,
  },
  {
    id: "starry-night",
    name: "Starry Night",
    subtitle: "4-7-8 Relaxation",
    description: "A deep relaxation technique with extended exhale, ideal for sleep preparation.",
    emoji: "\u2728",
    phases: [
      { type: "inhale", label: "Breathe In", duration: 4000, icon: "\u2191" },
      { type: "hold", label: "Hold", duration: 7000, icon: "\u25CF" },
      { type: "exhale", label: "Breathe Out", duration: 8000, icon: "\u2193" },
    ],
    colors: {
      primary: "#0a0a2e",
      secondary: "#1a1a4e",
      tertiary: "#2d1b69",
      inhale: "hsl(260, 60%, 70%)",
      hold: "hsl(45, 60%, 65%)",
      exhale: "hsl(220, 50%, 60%)",
      rest: "hsl(270, 30%, 60%)",
    },
    audioTheme: "stars",
    kidFriendly: false,
  },
  {
    id: "campfire-glow",
    name: "Campfire Glow",
    subtitle: "4-4-4-4 Box",
    description: "Equal-phase box breathing used by first responders for calm focus.",
    emoji: "\u{1F525}",
    phases: [
      { type: "inhale", label: "Breathe In", duration: 4000, icon: "\u2191" },
      { type: "hold", label: "Hold", duration: 4000, icon: "\u25CF" },
      { type: "exhale", label: "Breathe Out", duration: 4000, icon: "\u2193" },
      { type: "rest", label: "Hold", duration: 4000, icon: "~" },
    ],
    colors: {
      primary: "#1a0a00",
      secondary: "#c9760a",
      tertiary: "#ff9d2e",
      inhale: "hsl(35, 90%, 55%)",
      hold: "hsl(20, 80%, 50%)",
      exhale: "hsl(10, 70%, 45%)",
      rest: "hsl(30, 60%, 40%)",
    },
    audioTheme: "campfire",
    kidFriendly: true,
  },
  {
    id: "northern-lights",
    name: "Northern Lights",
    subtitle: "4-4-4 Triangle",
    description: "A balanced triangle breathing rhythm inspired by the aurora borealis.",
    emoji: "\u{1F30C}",
    phases: [
      { type: "inhale", label: "Breathe In", duration: 4000, icon: "\u2191" },
      { type: "hold", label: "Hold", duration: 4000, icon: "\u25CF" },
      { type: "exhale", label: "Breathe Out", duration: 4000, icon: "\u2193" },
    ],
    colors: {
      primary: "#0a0a1e",
      secondary: "#1a1a3e",
      tertiary: "#4aff8a",
      inhale: "hsl(150, 80%, 60%)",
      hold: "hsl(200, 60%, 60%)",
      exhale: "hsl(270, 50%, 65%)",
      rest: "hsl(180, 40%, 55%)",
    },
    audioTheme: "aurora",
    kidFriendly: false,
  },
];

export function getTechnique(id: string): BreathingTechnique {
  return BREATHING_TECHNIQUES.find((t) => t.id === id) || BREATHING_TECHNIQUES[0];
}

export function getTotalCycle(technique: BreathingTechnique): number {
  return technique.phases.reduce((sum, p) => sum + p.duration, 0);
}
