import { create } from "zustand";

interface AudioState {
  isMuted: boolean;
  toggleMute: () => void;
  playSuccess: () => void;
  playHit: () => void;
}

export const useAudio = create<AudioState>((set, get) => ({
  isMuted: true,
  toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),
  playSuccess: () => {
    if (get().isMuted) return;
    try {
      const audio = new Audio("/sounds/dbt-success.mp3");
      audio.volume = 0.3;
      audio.play().catch(() => {});
    } catch {}
  },
  playHit: () => {
    if (get().isMuted) return;
    try {
      const audio = new Audio("/sounds/dbt-hit.mp3");
      audio.volume = 0.2;
      audio.play().catch(() => {});
    } catch {}
  },
}));
