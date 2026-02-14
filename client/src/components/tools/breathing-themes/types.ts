import type { BreathingTechnique } from "@/lib/breathing-techniques";

export interface BreathingThemeProps {
  technique: BreathingTechnique;
  isActive: boolean;
  phaseIndex: number;
  phaseProgress: number; // 0-1
  elapsed: number;
  totalCycle: number;
}
