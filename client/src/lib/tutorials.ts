export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  emoji: string;
  animationType: "drag" | "pinch" | "tap" | "long-press" | "rotate" | "library" | "place" | "delete" | "overview";
  durationMs: number;
  tip?: string;
}

export interface Tutorial {
  id: string;
  toolId: string;
  title: string;
  subtitle: string;
  emoji: string;
  steps: TutorialStep[];
}

const TUTORIAL_COMPLETED_PREFIX = "cp_tutorial_";

export function isTutorialCompleted(tutorialId: string): boolean {
  try {
    return localStorage.getItem(`${TUTORIAL_COMPLETED_PREFIX}${tutorialId}`) === "completed";
  } catch {
    return false;
  }
}

export function markTutorialCompleted(tutorialId: string): void {
  try {
    localStorage.setItem(`${TUTORIAL_COMPLETED_PREFIX}${tutorialId}`, "completed");
  } catch {}
}

export function resetTutorial(tutorialId: string): void {
  try {
    localStorage.removeItem(`${TUTORIAL_COMPLETED_PREFIX}${tutorialId}`);
  } catch {}
}

export const SANDTRAY_TUTORIAL: Tutorial = {
  id: "sandtray",
  toolId: "sandtray",
  title: "Digital Sandtray",
  subtitle: "Learn the essentials in 60 seconds",
  emoji: "🏖️",
  steps: [
    {
      id: "overview",
      title: "Welcome to the Sandtray",
      description: "The Digital Sandtray is a shared canvas where you and your client place symbolic figures to explore feelings and experiences — just like a physical sandtray.",
      emoji: "✨",
      animationType: "overview",
      durationMs: 5000,
    },
    {
      id: "open-library",
      title: "Open the Asset Library",
      description: "Tap the library button at the bottom of the screen to browse 380+ therapeutic miniatures organized into categories like People, Animals, Nature, and Feelings.",
      emoji: "📚",
      animationType: "library",
      durationMs: 5000,
      tip: "Use the search bar to quickly find specific items",
    },
    {
      id: "place-item",
      title: "Place Items on the Canvas",
      description: "On desktop, drag an item from the library onto the sand. On mobile, tap an item to select it, then tap anywhere on the canvas to place it.",
      emoji: "👆",
      animationType: "place",
      durationMs: 5000,
      tip: "Mobile uses tap-to-place for easier one-handed use",
    },
    {
      id: "drag-item",
      title: "Move Items Around",
      description: "Click and drag any placed item to reposition it. Items lift up with a shadow effect as you move them, and settle naturally when released.",
      emoji: "🖐️",
      animationType: "drag",
      durationMs: 5000,
    },
    {
      id: "select-transform",
      title: "Select & Transform",
      description: "Click or tap an item to select it. A gold ring appears with handles to resize (corner handles) and rotate (top handle). On mobile, long-press to select.",
      emoji: "🔄",
      animationType: "rotate",
      durationMs: 5500,
      tip: "Pinch with two fingers on mobile to resize selected items",
    },
    {
      id: "delete-item",
      title: "Remove Items",
      description: "Select an item and tap the red X button on the transform ring to remove it from the canvas. Items disappear with a smooth animation.",
      emoji: "🗑️",
      animationType: "delete",
      durationMs: 4500,
    },
    {
      id: "pinch-zoom",
      title: "Pinch to Resize (Mobile)",
      description: "On touch devices, select an item then use a two-finger pinch gesture anywhere on the canvas to make it bigger or smaller. Great for emphasizing important figures.",
      emoji: "🤏",
      animationType: "pinch",
      durationMs: 5000,
      tip: "Works anywhere on the canvas — no need to pinch on the item itself",
    },
    {
      id: "long-press",
      title: "Long-Press to Select (Mobile)",
      description: "On phones and tablets, press and hold an item for a moment to select it. You'll feel a subtle vibration when it's selected. Then use the transform controls to adjust.",
      emoji: "📱",
      animationType: "long-press",
      durationMs: 5000,
    },
  ],
};

export const ALL_TUTORIALS: Tutorial[] = [SANDTRAY_TUTORIAL];

export function getTutorialForTool(toolId: string): Tutorial | undefined {
  return ALL_TUTORIALS.find(t => t.toolId === toolId);
}
