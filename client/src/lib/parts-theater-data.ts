export const PART_COLORS = [
  { id: "sage", hex: "#A8C5A0", label: "Sage" },
  { id: "navy", hex: "#1B2A4A", label: "Navy" },
  { id: "gold", hex: "#C9A96E", label: "Gold" },
  { id: "rose", hex: "#E8B4BC", label: "Rose" },
  { id: "sky", hex: "#7B8FA1", label: "Sky" },
  { id: "teal", hex: "#9DB5B2", label: "Teal" },
  { id: "coral", hex: "#E07A5F", label: "Coral" },
  { id: "lavender", hex: "#B4A7D6", label: "Lavender" },
  { id: "amber", hex: "#D4A574", label: "Amber" },
  { id: "slate", hex: "#64748B", label: "Slate" },
] as const;

export const PART_SIZES: Record<string, number> = {
  small: 24,
  medium: 36,
  large: 50,
};

export const METAPHOR_LABELS: Record<string, { noun: string; plural: string; selfLabel: string; addVerb: string }> = {
  parts: { noun: "Part", plural: "Parts", selfLabel: "Self", addVerb: "Add Part" },
  sides: { noun: "Side", plural: "Sides", selfLabel: "Core Self", addVerb: "Add Side" },
  feelings: { noun: "Feeling", plural: "Feelings", selfLabel: "Me", addVerb: "Add Feeling" },
};
