export interface EmotionNode {
  label: string;
  color: string;
  children?: EmotionNode[];
}

export const FEELING_WHEEL_DATA: EmotionNode[] = [
  {
    label: "Joy",
    color: "#FFD93D",
    children: [
      { label: "Proud", color: "#FFE066", children: [{ label: "Triumphant", color: "#FFF3B0" }, { label: "Confident", color: "#FFF3B0" }] },
      { label: "Optimistic", color: "#FFE066", children: [{ label: "Hopeful", color: "#FFF3B0" }, { label: "Inspired", color: "#FFF3B0" }] },
      { label: "Content", color: "#FFE066", children: [{ label: "Peaceful", color: "#FFF3B0" }, { label: "Satisfied", color: "#FFF3B0" }] },
      { label: "Playful", color: "#FFE066", children: [{ label: "Silly", color: "#FFF3B0" }, { label: "Amused", color: "#FFF3B0" }] },
    ],
  },
  {
    label: "Sadness",
    color: "#74B9FF",
    children: [
      { label: "Lonely", color: "#A3D2FF", children: [{ label: "Abandoned", color: "#D0E8FF" }, { label: "Isolated", color: "#D0E8FF" }] },
      { label: "Grieving", color: "#A3D2FF", children: [{ label: "Heartbroken", color: "#D0E8FF" }, { label: "Bereaved", color: "#D0E8FF" }] },
      { label: "Disappointed", color: "#A3D2FF", children: [{ label: "Let Down", color: "#D0E8FF" }, { label: "Disillusioned", color: "#D0E8FF" }] },
      { label: "Helpless", color: "#A3D2FF", children: [{ label: "Powerless", color: "#D0E8FF" }, { label: "Vulnerable", color: "#D0E8FF" }] },
    ],
  },
  {
    label: "Anger",
    color: "#FF6B6B",
    children: [
      { label: "Frustrated", color: "#FF9F9F", children: [{ label: "Annoyed", color: "#FFD0D0" }, { label: "Agitated", color: "#FFD0D0" }] },
      { label: "Resentful", color: "#FF9F9F", children: [{ label: "Bitter", color: "#FFD0D0" }, { label: "Jealous", color: "#FFD0D0" }] },
      { label: "Betrayed", color: "#FF9F9F", children: [{ label: "Cheated", color: "#FFD0D0" }, { label: "Deceived", color: "#FFD0D0" }] },
    ],
  },
  {
    label: "Fear",
    color: "#A29BFE",
    children: [
      { label: "Anxious", color: "#C4BFFF", children: [{ label: "Worried", color: "#E0DDFF" }, { label: "Nervous", color: "#E0DDFF" }] },
      { label: "Scared", color: "#C4BFFF", children: [{ label: "Terrified", color: "#E0DDFF" }, { label: "Panicked", color: "#E0DDFF" }] },
      { label: "Insecure", color: "#C4BFFF", children: [{ label: "Inadequate", color: "#E0DDFF" }, { label: "Inferior", color: "#E0DDFF" }] },
    ],
  },
  {
    label: "Surprise",
    color: "#FFA94D",
    children: [
      { label: "Amazed", color: "#FFC078", children: [{ label: "Astonished", color: "#FFE0B0" }, { label: "Awestruck", color: "#FFE0B0" }] },
      { label: "Confused", color: "#FFC078", children: [{ label: "Perplexed", color: "#FFE0B0" }, { label: "Bewildered", color: "#FFE0B0" }] },
    ],
  },
  {
    label: "Disgust",
    color: "#81C995",
    children: [
      { label: "Contempt", color: "#A8D8B5", children: [{ label: "Judgmental", color: "#D0ECD8" }, { label: "Scornful", color: "#D0ECD8" }] },
      { label: "Repulsed", color: "#A8D8B5", children: [{ label: "Revolted", color: "#D0ECD8" }, { label: "Appalled", color: "#D0ECD8" }] },
    ],
  },
];
