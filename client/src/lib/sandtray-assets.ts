export interface SandtrayAsset {
  id: string;
  icon: string;
  label: string;
  category: "nature" | "people" | "abstract";
}

export const SANDTRAY_ASSETS: SandtrayAsset[] = [
  // Nature
  { id: "tree-pine", icon: "🌲", label: "Pine Tree", category: "nature" },
  { id: "tree-deciduous", icon: "🌳", label: "Oak Tree", category: "nature" },
  { id: "flower", icon: "🌸", label: "Flower", category: "nature" },
  { id: "mountain", icon: "⛰️", label: "Mountain", category: "nature" },
  { id: "water", icon: "🌊", label: "Water", category: "nature" },
  { id: "sun", icon: "☀️", label: "Sun", category: "nature" },
  { id: "moon", icon: "🌙", label: "Moon", category: "nature" },
  { id: "cloud", icon: "☁️", label: "Cloud", category: "nature" },
  { id: "rainbow", icon: "🌈", label: "Rainbow", category: "nature" },
  { id: "leaf", icon: "🍃", label: "Leaf", category: "nature" },
  { id: "mushroom", icon: "🍄", label: "Mushroom", category: "nature" },
  { id: "butterfly", icon: "🦋", label: "Butterfly", category: "nature" },

  // People / Figures
  { id: "person-standing", icon: "🧍", label: "Person", category: "people" },
  { id: "child", icon: "🧒", label: "Child", category: "people" },
  { id: "family", icon: "👨‍👩‍👧", label: "Family", category: "people" },
  { id: "heart", icon: "❤️", label: "Heart", category: "people" },
  { id: "hand-open", icon: "🤚", label: "Open Hand", category: "people" },
  { id: "hug", icon: "🤗", label: "Hug", category: "people" },
  { id: "think", icon: "🤔", label: "Thinking", category: "people" },
  { id: "peace", icon: "✌️", label: "Peace", category: "people" },
  { id: "pray", icon: "🙏", label: "Prayer", category: "people" },
  { id: "baby", icon: "👶", label: "Baby", category: "people" },

  // Abstract
  { id: "star", icon: "⭐", label: "Star", category: "abstract" },
  { id: "lightning", icon: "⚡", label: "Lightning", category: "abstract" },
  { id: "fire", icon: "🔥", label: "Fire", category: "abstract" },
  { id: "gem", icon: "💎", label: "Gem", category: "abstract" },
  { id: "circle", icon: "🔵", label: "Blue Circle", category: "abstract" },
  { id: "triangle", icon: "🔺", label: "Triangle", category: "abstract" },
  { id: "key", icon: "🔑", label: "Key", category: "abstract" },
  { id: "lock", icon: "🔒", label: "Lock", category: "abstract" },
  { id: "shield", icon: "🛡️", label: "Shield", category: "abstract" },
  { id: "infinity", icon: "♾️", label: "Infinity", category: "abstract" },
  { id: "spiral", icon: "🌀", label: "Spiral", category: "abstract" },
  { id: "sparkle", icon: "✨", label: "Sparkle", category: "abstract" },
];

export const CATEGORIES = [
  { id: "nature" as const, label: "Nature", emoji: "🌿" },
  { id: "people" as const, label: "Figures", emoji: "🧍" },
  { id: "abstract" as const, label: "Abstract", emoji: "✨" },
];
