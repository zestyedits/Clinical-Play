export interface ValueCard {
  id: string;
  label: string;
  description: string;
  emoji: string;
}

export const VALUES_CARDS: ValueCard[] = [
  { id: "family", label: "Family", description: "Closeness and support from loved ones", emoji: "👨‍👩‍👧‍👦" },
  { id: "freedom", label: "Freedom", description: "Independence and autonomy in life choices", emoji: "🕊️" },
  { id: "health", label: "Health", description: "Physical and mental well-being", emoji: "💪" },
  { id: "creativity", label: "Creativity", description: "Self-expression and imagination", emoji: "🎨" },
  { id: "adventure", label: "Adventure", description: "New experiences and exploration", emoji: "🏔️" },
  { id: "honesty", label: "Honesty", description: "Truthfulness and integrity", emoji: "💎" },
  { id: "compassion", label: "Compassion", description: "Caring for others and empathy", emoji: "💕" },
  { id: "achievement", label: "Achievement", description: "Accomplishment and success", emoji: "🏆" },
  { id: "knowledge", label: "Knowledge", description: "Learning and understanding", emoji: "📚" },
  { id: "security", label: "Security", description: "Safety and stability", emoji: "🛡️" },
  { id: "connection", label: "Connection", description: "Deep relationships and belonging", emoji: "🤝" },
  { id: "spirituality", label: "Spirituality", description: "Inner peace and purpose", emoji: "🕯️" },
  { id: "justice", label: "Justice", description: "Fairness and equality", emoji: "⚖️" },
  { id: "humor", label: "Humor", description: "Laughter and lightness", emoji: "😄" },
  { id: "nature", label: "Nature", description: "Harmony with the natural world", emoji: "🌿" },
  { id: "courage", label: "Courage", description: "Bravery and facing fears", emoji: "🦁" },
  { id: "gratitude", label: "Gratitude", description: "Appreciation for what you have", emoji: "🙏" },
  { id: "loyalty", label: "Loyalty", description: "Faithfulness and commitment", emoji: "🤞" },
  { id: "wealth", label: "Wealth", description: "Financial abundance and comfort", emoji: "💰" },
  { id: "service", label: "Service", description: "Helping others and giving back", emoji: "🌟" },
  { id: "self-care", label: "Self-Care", description: "Nurturing your own needs", emoji: "🧘" },
  { id: "love", label: "Love", description: "Romantic and unconditional love", emoji: "❤️" },
  { id: "respect", label: "Respect", description: "Being valued and valuing others", emoji: "🙌" },
  { id: "community", label: "Community", description: "Belonging to a group or tribe", emoji: "🏘️" },
];

export const VALUE_COLUMNS = [
  { id: "very-important", label: "Very Important", color: "#C9A96E" },
  { id: "important", label: "Important", color: "#A8C5A0" },
  { id: "not-important", label: "Not Important", color: "#94A3B8" },
] as const;
