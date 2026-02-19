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

export const ALL_TUTORIALS: Tutorial[] = [];

export function getTutorialForTool(toolId: string): Tutorial | undefined {
  return ALL_TUTORIALS.find(t => t.toolId === toolId);
}
