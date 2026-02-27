import { useEffect, useRef, useCallback, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Camera, Settings, HelpCircle, Maximize, Minimize,
  Volume2, VolumeX, Activity, Pause, Play, X, Shuffle, Zap,
  Save, FolderOpen, Trash2, RotateCcw, Eye, EyeOff,
  ClipboardCopy, Check, TrendingDown, ChevronDown, FileText,
} from "lucide-react";
import html2canvas from "html2canvas";
import { create } from "zustand";

type PartTexture = "chatter" | "buzz" | "throb" | "shout" | "hum";

const TEXTURE_MIGRATION: Record<string, PartTexture> = { steady: "chatter", jitter: "buzz", pulse: "throb", wind: "shout", tine: "hum" };

const TEXTURE_COLORS: Record<PartTexture, { cap: string; glow: string; track: string; label: string }> = {
  chatter: {
    cap: "linear-gradient(180deg, #94a3b8 0%, #64748b 30%, #475569 70%, #334155 100%)",
    glow: "rgba(148,163,184,0.4)",
    track: "#64748b",
    label: "Chatter",
  },
  buzz: {
    cap: "linear-gradient(180deg, #ff8a65 0%, #e64a19 30%, #bf360c 70%, #8d2a0b 100%)",
    glow: "rgba(255,138,101,0.4)",
    track: "#e64a19",
    label: "Buzz",
  },
  throb: {
    cap: "linear-gradient(180deg, #b39ddb 0%, #7e57c2 30%, #5e35b1 70%, #4527a0 100%)",
    glow: "rgba(179,157,219,0.4)",
    track: "#7e57c2",
    label: "Throb",
  },
  shout: {
    cap: "linear-gradient(180deg, #ff8a80 0%, #e53935 30%, #c62828 70%, #b71c1c 100%)",
    glow: "rgba(255,138,128,0.4)",
    track: "#e53935",
    label: "Shout",
  },
  hum: {
    cap: "linear-gradient(180deg, #fff59d 0%, #fdd835 30%, #f9a825 70%, #f57f17 100%)",
    glow: "rgba(255,245,157,0.4)",
    track: "#fdd835",
    label: "Hum",
  },
};

interface Channel {
  id: string;
  name: string;
  value: number;
  isSoloed: boolean;
  isWiseSelf: boolean;
  magnetBroken: boolean;
  texture: PartTexture;
}

type ColorTheme = "charcoal" | "midnight" | "warm" | "forest" | "slate" | "obsidian";

const COLOR_THEMES: Record<ColorTheme, {
  label: string;
  bg: string;
  surface: string;
  surfaceHover: string;
  accent: string;
  accentGlow: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  grain: number;
  preview: string[];
}> = {
  charcoal: {
    label: "Satin Charcoal",
    bg: "#121212",
    surface: "rgba(22,22,24,0.95)",
    surfaceHover: "rgba(30,30,32,0.6)",
    accent: "rgba(245,158,11,1)",
    accentGlow: "rgba(245,158,11,0.15)",
    border: "rgba(255,255,255,0.06)",
    textPrimary: "rgba(255,255,255,0.8)",
    textSecondary: "rgba(255,255,255,0.4)",
    grain: 0.04,
    preview: ["#121212", "#1c1c1e", "#f59e0b"],
  },
  midnight: {
    label: "Deep Midnight",
    bg: "#0a0e1a",
    surface: "rgba(14,18,30,0.95)",
    surfaceHover: "rgba(20,26,44,0.6)",
    accent: "rgba(99,179,237,1)",
    accentGlow: "rgba(99,179,237,0.15)",
    border: "rgba(99,179,237,0.08)",
    textPrimary: "rgba(220,230,255,0.85)",
    textSecondary: "rgba(150,170,210,0.5)",
    grain: 0.03,
    preview: ["#0a0e1a", "#141c30", "#63b3ed"],
  },
  warm: {
    label: "Warm Studio",
    bg: "#1a1410",
    surface: "rgba(28,22,18,0.95)",
    surfaceHover: "rgba(40,32,24,0.6)",
    accent: "rgba(232,121,73,1)",
    accentGlow: "rgba(232,121,73,0.15)",
    border: "rgba(232,180,140,0.08)",
    textPrimary: "rgba(255,240,220,0.85)",
    textSecondary: "rgba(200,170,140,0.5)",
    grain: 0.05,
    preview: ["#1a1410", "#241c14", "#e87949"],
  },
  forest: {
    label: "Forest Calm",
    bg: "#0c1410",
    surface: "rgba(14,22,18,0.95)",
    surfaceHover: "rgba(22,34,28,0.6)",
    accent: "rgba(104,211,145,1)",
    accentGlow: "rgba(104,211,145,0.15)",
    border: "rgba(104,211,145,0.08)",
    textPrimary: "rgba(220,245,230,0.85)",
    textSecondary: "rgba(140,190,160,0.5)",
    grain: 0.03,
    preview: ["#0c1410", "#162218", "#68d391"],
  },
  slate: {
    label: "Cool Slate",
    bg: "#14161a",
    surface: "rgba(22,24,28,0.95)",
    surfaceHover: "rgba(32,34,40,0.6)",
    accent: "rgba(160,174,192,1)",
    accentGlow: "rgba(160,174,192,0.12)",
    border: "rgba(160,174,192,0.08)",
    textPrimary: "rgba(230,235,245,0.85)",
    textSecondary: "rgba(160,174,192,0.5)",
    grain: 0.03,
    preview: ["#14161a", "#20222a", "#a0aec0"],
  },
  obsidian: {
    label: "Obsidian",
    bg: "#050505",
    surface: "rgba(10,10,10,0.95)",
    surfaceHover: "rgba(18,18,18,0.6)",
    accent: "rgba(236,72,153,1)",
    accentGlow: "rgba(236,72,153,0.15)",
    border: "rgba(236,72,153,0.06)",
    textPrimary: "rgba(255,240,250,0.85)",
    textSecondary: "rgba(200,160,180,0.5)",
    grain: 0.02,
    preview: ["#050505", "#121212", "#ec4899"],
  },
};

interface MixerSettings {
  audioEnabled: boolean;
  hapticEnabled: boolean;
  visualIntensity: number;
  reducedMotion: boolean;
  masterPitch: number;
  textureMix: number;
  soloBackgroundVolume: number;
  faderResistance: number;
  magnetStrength: number;
  snapToGrid: boolean;
  colorTheme: ColorTheme;
}

interface InitialPartSnapshot {
  name: string;
  value: number;
  texture: PartTexture;
}

interface SessionData {
  startTime: number;
  initialParts: InitialPartSnapshot[];
  initialChaos: number;
}

interface MixerPreset {
  name: string;
  channels: Omit<Channel, "id">[];
  masterIntensity: number;
  createdAt: number;
}

interface MixerState {
  channels: Channel[];
  masterIntensity: number;
  showGhostMenu: boolean;
  showSettings: boolean;
  showCommandCenter: boolean;
  showTutorial: boolean;
  tutorialStep: number;
  tutorialCompleted: boolean;
  isResetting: boolean;
  isFullscreen: boolean;
  introComplete: boolean;
  globalMuted: boolean;
  systemPaused: boolean;
  uiGhosted: boolean;
  settings: MixerSettings;
  presets: MixerPreset[];
  session: SessionData | null;
  sessionEnded: boolean;
  calmRestoredVisible: boolean;
  clipboardToast: string | null;
  activeDragPosition: { x: number; y: number } | null;
  isAnyFaderDragging: boolean;

  addChannel: (name: string, isWiseSelf?: boolean, texture?: PartTexture) => void;
  removeChannel: (id: string) => void;
  renameChannel: (id: string, name: string) => void;
  setChannelValue: (id: string, value: number) => void;
  setMasterIntensity: (value: number) => void;
  toggleSolo: (id: string) => void;
  breakMagnet: (id: string) => void;
  reorderChannel: (fromIndex: number, toIndex: number) => void;
  setShowGhostMenu: (show: boolean) => void;
  setShowSettings: (show: boolean) => void;
  setShowCommandCenter: (show: boolean) => void;
  setShowTutorial: (show: boolean) => void;
  advanceTutorial: () => void;
  completeTutorial: () => void;
  updateSettings: (partial: Partial<MixerSettings>) => void;
  globalReset: () => void;
  setIsResetting: (resetting: boolean) => void;
  toggleFullscreen: () => void;
  setIntroComplete: () => void;
  toggleGlobalMute: () => void;
  toggleSystemPause: () => void;
  toggleUiGhosted: () => void;
  savePreset: (name: string) => void;
  loadPreset: (index: number) => void;
  deletePreset: (index: number) => void;
  snapshotInitialState: () => void;
  endSession: () => void;
  showCalmRestored: () => void;
  showClipboardToast: (format: string) => void;
  setActiveDragPosition: (pos: { x: number; y: number } | null) => void;
  setIsAnyFaderDragging: (dragging: boolean) => void;
  getSessionSummary: (format?: "simple" | "dap" | "soap") => string;
}

let channelCounter = 0;

const defaultSettings: MixerSettings = {
  audioEnabled: true,
  hapticEnabled: true,
  visualIntensity: 0.8,
  reducedMotion: false,
  masterPitch: 0.5,
  textureMix: 0.5,
  soloBackgroundVolume: 0.1,
  faderResistance: 0.6,
  magnetStrength: 0.7,
  snapToGrid: false,
  colorTheme: "charcoal",
};

const useMixer = create<MixerState>((set, get) => ({
  channels: [],
  masterIntensity: 80,
  showGhostMenu: false,
  showSettings: false,
  showCommandCenter: false,
  showTutorial: false,
  tutorialStep: 0,
  tutorialCompleted: localStorage.getItem("mixer_tutorial_done") === "true",
  isResetting: false,
  isFullscreen: false,
  introComplete: false,
  globalMuted: false,
  systemPaused: false,
  uiGhosted: false,
  settings: { ...defaultSettings },
  presets: JSON.parse(localStorage.getItem("mixer_presets") || "[]"),
  session: null,
  sessionEnded: false,
  calmRestoredVisible: false,
  clipboardToast: null,
  activeDragPosition: null,
  isAnyFaderDragging: false,

  addChannel: (name, isWiseSelf = false, texture: PartTexture = "hum") => {
    const id = `ch_${++channelCounter}_${Date.now()}`;
    set((state) => ({
      channels: [
        ...state.channels,
        {
          id,
          name,
          value: isWiseSelf ? 80 : 20,
          isSoloed: false,
          isWiseSelf,
          magnetBroken: false,
          texture: isWiseSelf ? "hum" : texture,
        },
      ],
    }));
  },

  removeChannel: (id) => {
    set((state) => ({
      channels: state.channels.filter((ch) => ch.id !== id),
    }));
  },

  renameChannel: (id, name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    set((state) => ({
      channels: state.channels.map((ch) =>
        ch.id === id ? { ...ch, name: trimmed } : ch
      ),
    }));
  },

  setChannelValue: (id, value) => {
    const { settings } = get();
    let v = Math.max(0, Math.min(100, value));
    if (settings.snapToGrid) {
      v = Math.round(v / 10) * 10;
    }
    set((state) => ({
      channels: state.channels.map((ch) =>
        ch.id === id ? { ...ch, value: v } : ch
      ),
    }));
  },

  setMasterIntensity: (value) => {
    const { settings } = get();
    let v = Math.max(0, Math.min(100, value));
    if (settings.snapToGrid) {
      v = Math.round(v / 10) * 10;
    }
    set({ masterIntensity: v });
  },

  toggleSolo: (id) => {
    set((state) => ({
      channels: state.channels.map((ch) =>
        ch.id === id ? { ...ch, isSoloed: !ch.isSoloed } : ch
      ),
    }));
  },

  breakMagnet: (id) => {
    set((state) => ({
      channels: state.channels.map((ch) =>
        ch.id === id ? { ...ch, magnetBroken: true } : ch
      ),
    }));
  },

  reorderChannel: (fromIndex, toIndex) => {
    set((state) => {
      const newChannels = [...state.channels];
      const [moved] = newChannels.splice(fromIndex, 1);
      newChannels.splice(toIndex, 0, moved);
      return { channels: newChannels };
    });
  },

  setShowGhostMenu: (show) => set({ showGhostMenu: show }),
  setShowSettings: (show) => set({ showSettings: show }),
  setShowCommandCenter: (show) => set({ showCommandCenter: show }),
  setShowTutorial: (show) => set({ showTutorial: show }),

  advanceTutorial: () =>
    set((state) => ({ tutorialStep: state.tutorialStep + 1 })),

  completeTutorial: () => {
    localStorage.setItem("mixer_tutorial_done", "true");
    set({ showTutorial: false, tutorialCompleted: true });
  },

  updateSettings: (partial) => {
    set((state) => ({
      settings: { ...state.settings, ...partial },
    }));
  },

  globalReset: () => {
    set((state) => ({
      isResetting: true,
      masterIntensity: 80,
      channels: state.channels.map((ch) => ({
        ...ch,
        value: 20,
        isSoloed: false,
        magnetBroken: false,
        texture: ch.texture,
      })),
    }));
    setTimeout(() => {
      set({ isResetting: false });
    }, 2000);
  },

  setIsResetting: (resetting) => set({ isResetting: resetting }),

  toggleFullscreen: () => {
    const isFs = !!document.fullscreenElement;
    if (isFs) {
      document.exitFullscreen().catch(() => {});
      set({ isFullscreen: false });
    } else {
      document.documentElement.requestFullscreen().catch(() => {});
      set({ isFullscreen: true });
    }
  },

  setIntroComplete: () => set({ introComplete: true }),
  toggleGlobalMute: () => set((state) => ({ globalMuted: !state.globalMuted })),
  toggleSystemPause: () => set((state) => ({ systemPaused: !state.systemPaused, globalMuted: !state.systemPaused ? true : state.globalMuted })),
  toggleUiGhosted: () => set((state) => ({ uiGhosted: !state.uiGhosted })),

  savePreset: (name) => {
    const { channels, masterIntensity, presets } = get();
    const preset: MixerPreset = {
      name,
      channels: channels.map(({ id, ...rest }) => rest),
      masterIntensity,
      createdAt: Date.now(),
    };
    const updated = [...presets, preset];
    localStorage.setItem("mixer_presets", JSON.stringify(updated));
    set({ presets: updated });
  },

  loadPreset: (index) => {
    const { presets } = get();
    const preset = presets[index];
    if (!preset) return;
    const channels = preset.channels.map((ch) => ({
      ...ch,
      id: `ch_${++channelCounter}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      texture: TEXTURE_MIGRATION[ch.texture] || ch.texture,
    }));
    set({ channels, masterIntensity: preset.masterIntensity });
  },

  deletePreset: (index) => {
    const { presets } = get();
    const updated = presets.filter((_, i) => i !== index);
    localStorage.setItem("mixer_presets", JSON.stringify(updated));
    set({ presets: updated });
  },

  snapshotInitialState: () => {
    const { channels, session } = get();
    if (session) return;
    const initialParts = channels.map((ch) => ({
      name: ch.name,
      value: ch.value,
      texture: ch.texture,
    }));
    const initialChaos = channels.length > 0
      ? channels.reduce((sum, ch) => sum + ch.value, 0) / channels.length
      : 0;
    set({
      session: {
        startTime: Date.now(),
        initialParts,
        initialChaos,
      },
    });
  },

  endSession: () => {
    stopAllAudio();
    set({ sessionEnded: true, globalMuted: true, systemPaused: true });
  },

  showCalmRestored: () => {
    set({ calmRestoredVisible: true });
    setTimeout(() => {
      set({ calmRestoredVisible: false });
    }, 3000);
  },

  showClipboardToast: (format: string) => {
    set({ clipboardToast: format });
    setTimeout(() => {
      set({ clipboardToast: null });
    }, 2500);
  },

  setActiveDragPosition: (pos) => set({ activeDragPosition: pos }),
  setIsAnyFaderDragging: (dragging) => set({ isAnyFaderDragging: dragging }),

  getSessionSummary: (format = "simple") => {
    const { channels, masterIntensity, session } = get();
    const now = Date.now();
    const duration = session ? Math.floor((now - session.startTime) / 1000) : 0;
    const mins = Math.floor(duration / 60);
    const secs = duration % 60;
    const durationStr = `${mins}m ${secs}s`;
    const dateStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

    const currentChaos = channels.length > 0
      ? channels.reduce((sum, ch) => sum + ch.value, 0) / channels.length
      : 0;
    const initialChaos = session?.initialChaos ?? 0;
    const chaosChange = initialChaos - currentChaos;

    const partNames = channels.map((ch) => ch.name);
    const loudest = channels.length > 0
      ? channels.reduce((a, b) => a.value > b.value ? a : b)
      : null;
    const quietest = channels.length > 0
      ? channels.reduce((a, b) => a.value < b.value ? a : b)
      : null;
    const wiseSelf = channels.find((ch) => ch.isWiseSelf);
    const soloedParts = channels.filter((ch) => ch.isSoloed);

    if (format === "dap") {
      let note = `DAP NOTE — Volume Mixer\nDate: ${dateStr} | Duration: ${durationStr}\n`;
      note += `──────────────────────────────────\n\n`;

      // Data
      note += `DATA:\n`;
      note += `Client engaged with ${channels.length} internal part${channels.length !== 1 ? "s" : ""} using the Volume Mixer tool.\n`;
      note += `Parts identified: ${partNames.join(", ") || "None"}.\n`;
      if (loudest) note += `Loudest part: "${loudest.name}" at ${Math.round(loudest.value)}%.\n`;
      if (wiseSelf) note += `Wise Self identified as "${wiseSelf.name}" at ${Math.round(wiseSelf.value)}%.\n`;
      if (soloedParts.length > 0) note += `Solo focus on: ${soloedParts.map((p) => `"${p.name}"`).join(", ")}.\n`;
      note += `Master intensity set to ${masterIntensity}%.\n`;
      channels.forEach((ch) => {
        const initial = session?.initialParts.find((p) => p.name === ch.name);
        const shift = initial ? Math.round(ch.value - initial.value) : 0;
        const dir = shift > 0 ? `+${shift}%` : shift < 0 ? `${shift}%` : "no change";
        note += `  • ${ch.name}: ${Math.round(ch.value)}% [${TEXTURE_COLORS[ch.texture].label}]${initial ? ` (${dir} from ${initial.value}%)` : ""}\n`;
      });

      // Assessment
      note += `\nASSESSMENT:\n`;
      note += `System energy moved from ${Math.round(initialChaos)}% to ${Math.round(currentChaos)}%`;
      if (chaosChange > 5) note += ` — a ${Math.round(chaosChange)}% reduction indicating successful regulation.\n`;
      else if (chaosChange < -5) note += ` — a ${Math.abs(Math.round(chaosChange))}% increase, suggesting activation or emerging awareness.\n`;
      else note += ` — relatively stable, suggesting maintenance or early exploration.\n`;
      if (loudest && quietest && loudest.name !== quietest.name) {
        note += `Dominant dynamic: "${loudest.name}" (${Math.round(loudest.value)}%) vs "${quietest.name}" (${Math.round(quietest.value)}%).\n`;
      }

      // Plan
      note += `\nPLAN:\n`;
      if (loudest) note += `Client identified "${loudest.name}" as a key focus for continued exploration.\n`;
      if (wiseSelf && wiseSelf.value < 30) note += `Wise Self presence is low (${Math.round(wiseSelf.value)}%) — consider strengthening access to Self-energy in next session.\n`;
      else if (wiseSelf) note += `Wise Self at ${Math.round(wiseSelf.value)}% — adequate Self-energy for parts work.\n`;
      note += `Continue mapping internal system dynamics. Monitor shifts in part volume between sessions.\n`;

      return note;
    }

    if (format === "soap") {
      let note = `SOAP NOTE — Volume Mixer\nDate: ${dateStr} | Duration: ${durationStr}\n`;
      note += `──────────────────────────────────\n\n`;

      // Subjective
      note += `SUBJECTIVE:\n`;
      note += `Client reported internal noise level of ${Math.round(initialChaos)}% at session start.\n`;
      if (loudest) note += `Client described "${loudest.name}" as the most prominent internal experience (${Math.round(loudest.value)}%).\n`;
      if (channels.length > 0) {
        const textureCounts: Record<string, number> = {};
        channels.forEach((ch) => { textureCounts[TEXTURE_COLORS[ch.texture].label] = (textureCounts[TEXTURE_COLORS[ch.texture].label] || 0) + 1; });
        const dominantTexture = Object.entries(textureCounts).sort((a, b) => b[1] - a[1])[0];
        note += `Predominant quality of internal experience: ${dominantTexture[0]}.\n`;
      }

      // Objective
      note += `\nOBJECTIVE:\n`;
      note += `Visualized parts: ${partNames.join(", ") || "None identified"}.\n`;
      note += `Total parts mapped: ${channels.length}. Master intensity: ${masterIntensity}%.\n`;
      channels.forEach((ch) => {
        const initial = session?.initialParts.find((p) => p.name === ch.name);
        note += `  • ${ch.name}: ${Math.round(ch.value)}% [${TEXTURE_COLORS[ch.texture].label}]`;
        if (ch.isWiseSelf) note += ` [Wise Self]`;
        if (ch.isSoloed) note += ` [Solo]`;
        if (initial) {
          const shift = Math.round(ch.value - initial.value);
          note += ` (started ${initial.value}%, ${shift > 0 ? "+" : ""}${shift}%)`;
        }
        note += `\n`;
      });
      note += `System load: ${Math.round(initialChaos)}% → ${Math.round(currentChaos)}% (net ${chaosChange > 0 ? "−" : "+"}${Math.abs(Math.round(chaosChange))}%).\n`;

      // Assessment
      note += `\nASSESSMENT:\n`;
      if (chaosChange > 10) note += `Significant downregulation observed. Client demonstrated capacity to modulate internal volume.\n`;
      else if (chaosChange > 0) note += `Mild regulation observed. System moved toward lower activation.\n`;
      else if (chaosChange < -5) note += `Increased activation noted — may reflect emerging awareness of previously suppressed parts.\n`;
      else note += `System remained stable throughout session.\n`;
      if (soloedParts.length > 0) note += `Client chose to solo ${soloedParts.map((p) => `"${p.name}"`).join(", ")}, indicating targeted focus.\n`;

      // Plan
      note += `\nPLAN:\n`;
      if (loudest) note += `Follow up on "${loudest.name}" — explore function and needs of this part.\n`;
      if (wiseSelf && wiseSelf.value < 30) note += `Build Wise Self access (currently ${Math.round(wiseSelf.value)}%).\n`;
      note += `Reassess internal volume landscape in next session.\n`;

      return note;
    }

    // Simple format (default)
    let summary = `SESSION NOTES — Volume Mixer\n`;
    summary += `Date: ${dateStr} | Duration: ${durationStr}\n`;
    summary += `Master Level: ${masterIntensity}%\n\n`;

    summary += `PARTS:\n`;
    channels.forEach((ch) => {
      const initial = session?.initialParts.find((p) => p.name === ch.name);
      const arrow = initial ? (ch.value > initial.value ? "↑" : ch.value < initial.value ? "↓" : "→") : "•";
      summary += `  ${arrow} ${ch.name}: ${Math.round(ch.value)}%`;
      if (initial) summary += ` (started at ${initial.value}%)`;
      summary += ` [${TEXTURE_COLORS[ch.texture].label}]`;
      if (ch.isSoloed) summary += ` [SOLO]`;
      if (ch.isWiseSelf) summary += ` [Wise Self]`;
      summary += `\n`;
    });

    if (session) {
      summary += `\nSYSTEM ENERGY:\n`;
      summary += `  Initial: ${Math.round(initialChaos)}%\n`;
      summary += `  Current: ${Math.round(currentChaos)}%\n`;
      summary += `  Net Change: ${chaosChange > 0 ? "−" : "+"}${Math.abs(Math.round(chaosChange))}%\n`;
    }

    return summary;
  },
}));


let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let isAudioInitialized = false;

interface ChannelAudio {
  panner: StereoPannerNode;
  gain: GainNode;
  nodes: AudioNode[];
  texture: PartTexture;
}

const channelAudioMap: Map<string, ChannelAudio> = new Map();
const pendingChannels: Set<string> = new Set();

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

function initAudio() {
  if (isAudioInitialized) return;
  const ctx = getAudioContext();
  if (ctx.state === "suspended") {
    ctx.resume();
  }

  masterGain = ctx.createGain();
  masterGain.gain.value = 0.3;
  masterGain.connect(ctx.destination);

  isAudioInitialized = true;
}

function updateDrone(
  _intensity: number,
  _masterPitch: number,
  masterIntensityVal: number = 80,
  _textureMix: number = 0.5
) {
  if (!isAudioInitialized || !masterGain) return;
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  const mScale = masterIntensityVal / 100;
  masterGain.gain.setTargetAtTime(0.3 * mScale, now, 0.1);
}

let crowdBuffer: AudioBuffer | null = null;
let crowdBufferLoading = false;

async function loadCrowdBuffer(ctx: AudioContext): Promise<AudioBuffer | null> {
  if (crowdBuffer) return crowdBuffer;
  if (crowdBufferLoading) {
    while (crowdBufferLoading) await new Promise((r) => setTimeout(r, 50));
    return crowdBuffer;
  }
  crowdBufferLoading = true;
  try {
    const resp = await fetch("/crowd-ambience.mp3");
    const arrayBuf = await resp.arrayBuffer();
    crowdBuffer = await ctx.decodeAudioData(arrayBuf);
    return crowdBuffer;
  } catch (e) {
    console.error("Failed to load crowd ambience:", e);
    return null;
  } finally {
    crowdBufferLoading = false;
  }
}

function createCrowdLayer(
  ctx: AudioContext,
  buffer: AudioBuffer,
  output: GainNode,
  playbackRate: number,
  layerGain: number,
): AudioNode[] {
  const nodes: AudioNode[] = [];
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  src.loop = true;
  src.playbackRate.value = playbackRate;
  src.loopStart = Math.random() * Math.max(0, buffer.duration - 2);
  src.loopEnd = buffer.duration;

  const g = ctx.createGain();
  g.gain.value = layerGain;
  src.connect(g);
  g.connect(output);
  src.start(0, Math.random() * buffer.duration);
  nodes.push(src, g);
  return nodes;
}

async function createTextureNodes(ctx: AudioContext, texture: PartTexture, gain: GainNode): Promise<AudioNode[]> {
  const buffer = await loadCrowdBuffer(ctx);
  if (!buffer) return [];
  const nodes: AudioNode[] = [];

  switch (texture) {
    case "chatter": {
      nodes.push(...createCrowdLayer(ctx, buffer, gain, 1.0, 1.0));
      nodes.push(...createCrowdLayer(ctx, buffer, gain, 0.95 + Math.random() * 0.1, 0.6));
      break;
    }
    case "buzz": {
      const hp = ctx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = 600;
      hp.Q.value = 0.5;
      hp.connect(gain);
      nodes.push(hp);
      nodes.push(...createCrowdLayer(ctx, buffer, hp, 1.3 + Math.random() * 0.2, 1.0));
      break;
    }
    case "throb": {
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 500;
      lp.Q.value = 0.7;
      lp.connect(gain);
      nodes.push(lp);
      nodes.push(...createCrowdLayer(ctx, buffer, lp, 0.75, 1.0));
      break;
    }
    case "shout": {
      nodes.push(...createCrowdLayer(ctx, buffer, gain, 1.15, 1.0));
      nodes.push(...createCrowdLayer(ctx, buffer, gain, 1.35, 0.4));
      break;
    }
    case "hum": {
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 350;
      lp.Q.value = 0.5;
      lp.connect(gain);
      nodes.push(lp);
      nodes.push(...createCrowdLayer(ctx, buffer, lp, 0.5, 1.0));
      break;
    }
  }

  return nodes;
}

async function updateChannelPan(channelId: string, panValue: number, volume: number, texture: PartTexture = "hum") {
  if (!isAudioInitialized) initAudio();
  if (!masterGain) return;

  const existing = channelAudioMap.get(channelId);

  if (existing && existing.texture === texture) {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    existing.panner.pan.setTargetAtTime(Math.max(-1, Math.min(1, panValue)), now, 0.05);
    existing.gain.gain.setTargetAtTime(volume / 100, now, 0.1);
    return;
  }

  if (pendingChannels.has(channelId)) return;
  pendingChannels.add(channelId);

  try {
    if (existing) {
      existing.nodes.forEach((n) => {
        try { if (n instanceof OscillatorNode) n.stop(); } catch {}
        try { if (n instanceof AudioBufferSourceNode) n.stop(); } catch {}
        try { n.disconnect(); } catch {}
      });
      try { existing.gain.disconnect(); } catch {}
      try { existing.panner.disconnect(); } catch {}
      channelAudioMap.delete(channelId);
    }

    const ctx = getAudioContext();
    const panner = ctx.createStereoPanner();
    const gain = ctx.createGain();
    gain.gain.value = volume / 100;

    const nodes = await createTextureNodes(ctx, texture, gain);

    if (!isAudioInitialized || !masterGain) return;

    panner.pan.value = Math.max(-1, Math.min(1, panValue));
    gain.connect(panner);
    panner.connect(masterGain);

    channelAudioMap.set(channelId, { panner, gain, nodes, texture });
  } finally {
    pendingChannels.delete(channelId);
  }
}

function removeChannelAudio(channelId: string) {
  const ch = channelAudioMap.get(channelId);
  if (!ch) return;
  ch.nodes.forEach((n) => {
    try { if (n instanceof OscillatorNode) n.stop(); } catch {}
    try { if (n instanceof AudioBufferSourceNode) n.stop(); } catch {}
    try { n.disconnect(); } catch {}
  });
  try { ch.gain.disconnect(); } catch {}
  try { ch.panner.disconnect(); } catch {}
  channelAudioMap.delete(channelId);
}

function playSoloPing() {
  if (!isAudioInitialized || !masterGain) return;
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  const fundamental = ctx.createOscillator();
  fundamental.type = "sine";
  fundamental.frequency.value = 528;

  const overtone1 = ctx.createOscillator();
  overtone1.type = "sine";
  overtone1.frequency.value = 528 * 2.756;

  const overtone2 = ctx.createOscillator();
  overtone2.type = "sine";
  overtone2.frequency.value = 528 * 5.404;

  const fundGain = ctx.createGain();
  fundGain.gain.setValueAtTime(0.2, now);
  fundGain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

  const ot1Gain = ctx.createGain();
  ot1Gain.gain.setValueAtTime(0.08, now);
  ot1Gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

  const ot2Gain = ctx.createGain();
  ot2Gain.gain.setValueAtTime(0.04, now);
  ot2Gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

  fundamental.connect(fundGain);
  overtone1.connect(ot1Gain);
  overtone2.connect(ot2Gain);

  fundGain.connect(masterGain);
  ot1Gain.connect(masterGain);
  ot2Gain.connect(masterGain);

  fundamental.start(now);
  overtone1.start(now);
  overtone2.start(now);

  fundamental.stop(now + 2.5);
  overtone1.stop(now + 2.5);
  overtone2.stop(now + 2.5);
}

function playChime() {
  if (!isAudioInitialized || !masterGain) return;
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.value = 880;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

  osc.connect(gain);
  gain.connect(masterGain);
  osc.start(now);
  osc.stop(now + 0.8);
}

function playMagnetBreak() {
  if (!isAudioInitialized || !masterGain) return;
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(200, now);
  osc.frequency.exponentialRampToValueAtTime(60, now + 0.3);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.1, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

  osc.connect(gain);
  gain.connect(masterGain);
  osc.start(now);
  osc.stop(now + 0.4);
}

function playDrawerClick() {
  if (!isAudioInitialized || !masterGain) return;
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  osc.type = "square";
  osc.frequency.value = 3200;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.04, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 4000;
  filter.Q.value = 5;

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(masterGain);
  osc.start(now);
  osc.stop(now + 0.04);
}

function emergencySilence() {
  if (!audioCtx || !masterGain) return;
  const now = audioCtx.currentTime;
  masterGain.gain.setTargetAtTime(0, now, 0.05);
}

function resumeAudio() {
  if (!audioCtx || !masterGain) return;
  const now = audioCtx.currentTime;
  masterGain.gain.setTargetAtTime(0.3, now, 0.05);
}

function stopAllAudio() {
  // Stop all channel audio nodes
  channelAudioMap.forEach((ch, id) => {
    ch.nodes.forEach((n) => {
      try { if (n instanceof OscillatorNode) n.stop(); } catch {}
      try { if (n instanceof AudioBufferSourceNode) n.stop(); } catch {}
      try { n.disconnect(); } catch {}
    });
    try { ch.gain.disconnect(); } catch {}
    try { ch.panner.disconnect(); } catch {}
  });
  channelAudioMap.clear();

  try { masterGain?.disconnect(); } catch {}

  if (audioCtx && audioCtx.state !== "closed") {
    audioCtx.close().catch(() => {});
  }

  masterGain = null;
  audioCtx = null;
  crowdBuffer = null;
  isAudioInitialized = false;
}

function triggerHaptic(pattern: number[] = [10]) {
  if ("vibrate" in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {}
  }
}


interface ParticleFieldProps {
  energy: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
}

function ParticleField({ energy }: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animRef = useRef<number>(0);
  const energyRef = useRef(energy);
  const pausedRef = useRef(false);
  const dragPosRef = useRef<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);

  energyRef.current = energy;

  useEffect(() => {
    const unsub = useMixer.subscribe((state) => {
      pausedRef.current = state.systemPaused;
      dragPosRef.current = state.activeDragPosition;
      isDraggingRef.current = state.isAnyFaderDragging;
    });
    return unsub;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const loop = () => {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const paused = pausedRef.current;
      const e = energyRef.current;
      const dragging = isDraggingRef.current;
      const dragPos = dragPosRef.current;
      const baseCount = Math.floor(5 + e * 0.6);
      const targetCount = dragging ? Math.floor(baseCount * 1.4) : baseCount;
      const speed = paused ? 0 : 0.2 + e * 0.02;

      while (particlesRef.current.length < targetCount) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * speed,
          vy: (Math.random() - 0.5) * speed * 0.6 - 0.1,
          size: 1 + Math.random() * 2,
          opacity: 0,
          life: 0,
          maxLife: 200 + Math.random() * 300,
        });
      }

      while (particlesRef.current.length > targetCount + 10) {
        particlesRef.current.pop();
      }

      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        if (!paused) {
          p.life++;

          // Gravitational pull toward active drag position
          if (dragging && dragPos) {
            const dx = dragPos.x - p.x;
            const dy = dragPos.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 400 && dist > 5) {
              const force = 0.3 * (1 - dist / 400);
              p.vx += (dx / dist) * force;
              p.vy += (dy / dist) * force;
            }
          }

          // Dampen velocity to prevent runaway
          p.vx *= 0.98;
          p.vy *= 0.98;

          p.x += p.vx * (0.5 + e * 0.03);
          p.y += p.vy * (0.5 + e * 0.03);
        }

        const fadeIn = Math.min(p.life / 40, 1);
        const fadeOut = Math.max(0, 1 - (p.life - p.maxLife + 60) / 60);
        p.opacity = fadeIn * fadeOut * (0.03 + e * 0.003);

        if (p.life > p.maxLife || p.x < -10 || p.x > canvas.width + 10 || p.y < -10 || p.y > canvas.height + 10) {
          particlesRef.current[i] = {
            x: Math.random() * canvas.width,
            y: canvas.height + 5,
            vx: (Math.random() - 0.5) * speed,
            vy: -(0.15 + Math.random() * speed * 0.4),
            size: 1 + Math.random() * 2,
            opacity: 0,
            life: 0,
            maxLife: 200 + Math.random() * 300,
          };
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 248, 230, ${Math.min(p.opacity, 0.15)})`;
        ctx.fill();

        if (p.size > 1.5 && e > 30) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 248, 230, ${Math.min(p.opacity * 0.3, 0.04)})`;
          ctx.fill();
        }
      }

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-[2]"
      style={{ opacity: 0.8 }}
    />
  );
}


function WaveformVisualizer({ energy }: { energy: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);
  const { channels, masterIntensity, settings, systemPaused } = useMixer();

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const mScale = masterIntensity / 100;

    ctx.clearRect(0, 0, w, h);

    if (!systemPaused) {
      timeRef.current += 0.02;
    }
    const t = timeRef.current;

    const pauseDampen = systemPaused ? 0.05 : 1;

    channels.forEach((ch, idx) => {
      const tc = TEXTURE_COLORS[ch.texture];
      const amplitude = (ch.value / 100) * mScale * (h * 0.35) * pauseDampen;
      if (amplitude < 0.5) return;

      const freqBase = idx * 0.7 + 1;
      const phaseOffset = idx * 1.2;
      const color = tc.glow.replace("0.4", "0.35");

      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;

      for (let x = 0; x < w; x++) {
        const xNorm = x / w;
        let y = 0;
        y += Math.sin(xNorm * Math.PI * 4 * freqBase + t * 2 + phaseOffset) * 0.5;
        y += Math.sin(xNorm * Math.PI * 8 * freqBase + t * 3.1 + phaseOffset) * 0.25;
        y += Math.sin(xNorm * Math.PI * 2 * freqBase + t * 0.7 + phaseOffset) * 0.25;

        const windowVal = Math.sin(xNorm * Math.PI);
        y *= windowVal * amplitude;

        const py = h / 2 + y;
        if (x === 0) ctx.moveTo(x, py);
        else ctx.lineTo(x, py);
      }
      ctx.stroke();

      ctx.lineTo(w, h / 2);
      ctx.lineTo(0, h / 2);
      ctx.closePath();
      ctx.fillStyle = tc.glow.replace("0.4", "0.04");
      ctx.fill();
    });

    ctx.beginPath();
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 0.5;
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();

    if (energy > 10) {
      const gradient = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.4);
      gradient.addColorStop(0, `rgba(245,158,11,${energy * 0.001})`);
      gradient.addColorStop(1, "transparent");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);
    }

    animRef.current = requestAnimationFrame(draw);
  }, [channels, masterIntensity, energy, settings, systemPaused]);

  useEffect(() => {
    if (settings.reducedMotion) return;
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw, settings.reducedMotion]);

  if (settings.reducedMotion || channels.length === 0) return null;

  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-[5] pointer-events-none"
      style={{
        height: "60px",
        maskImage: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)",
      }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: "block" }}
      />
    </div>
  );
}

function energyToColor(energy: number): string {
  const stops = [
    { e: 0,   r: 56,  g: 189, b: 248 },
    { e: 25,  r: 52,  g: 211, b: 153 },
    { e: 50,  r: 250, g: 204, b: 21  },
    { e: 75,  r: 251, g: 146, b: 60  },
    { e: 100, r: 239, g: 68,  b: 68  },
  ];
  let lower = stops[0], upper = stops[stops.length - 1];
  for (let i = 0; i < stops.length - 1; i++) {
    if (energy >= stops[i].e && energy <= stops[i + 1].e) {
      lower = stops[i];
      upper = stops[i + 1];
      break;
    }
  }
  const t = (energy - lower.e) / (upper.e - lower.e || 1);
  const r = Math.round(lower.r + (upper.r - lower.r) * t);
  const g = Math.round(lower.g + (upper.g - lower.g) * t);
  const b = Math.round(lower.b + (upper.b - lower.b) * t);
  return `rgba(${r},${g},${b},0.5)`;
}

function MoodArc({ energy }: { energy: number }) {
  const [arcHistory, setArcHistory] = useState<number[]>([]);
  const { systemPaused, settings } = useMixer();

  useEffect(() => {
    if (systemPaused) return;
    const interval = setInterval(() => {
      setArcHistory((prev) => {
        const next = [...prev, energy];
        return next.slice(-60);
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [energy, systemPaused]);

  if (arcHistory.length < 2) return null;

  const colorStops = arcHistory
    .map((e, i) => {
      const pct = (i / (arcHistory.length - 1)) * 100;
      return `${energyToColor(e)} ${pct}%`;
    })
    .join(", ");

  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-[4] pointer-events-none"
      style={{
        height: "5px",
        background: `linear-gradient(to right, ${colorStops})`,
        transition: "background 2s ease",
        opacity: settings.visualIntensity * 0.8,
      }}
    />
  );
}

function ChannelHalos({ channels, masterIntensity }: { channels: Channel[]; masterIntensity: number }) {
  if (channels.length === 0) return null;
  const mScale = masterIntensity / 100;

  return (
    <div className="absolute inset-0 pointer-events-none z-[1] overflow-hidden">
      {channels.map((ch, idx) => {
        const tc = TEXTURE_COLORS[ch.texture];
        const opacity = (ch.value / 100) * mScale * 0.35;
        const xPercent = channels.length === 1 ? 50 : (idx / (channels.length - 1)) * 80 + 10;

        return (
          <div
            key={ch.id}
            className="absolute"
            style={{
              left: `${xPercent}%`,
              top: "40%",
              transform: "translate(-50%, -50%)",
              width: "clamp(120px, 18vw, 200px)",
              height: "clamp(200px, 40vh, 400px)",
              borderRadius: "50%",
              background: `radial-gradient(ellipse at center, ${tc.glow.replace("0.4", String(Math.min(opacity, 0.4)))} 0%, ${tc.glow.replace("0.4", String(opacity * 0.3))} 40%, transparent 70%)`,
              filter: "blur(30px)",
              transition: "opacity 0.5s ease, background 0.8s ease",
              willChange: "opacity",
            }}
          />
        );
      })}
    </div>
  );
}

function ChannelArcs({ channels, masterIntensity: mi }: { channels: Channel[]; masterIntensity: number }) {
  const connections = useMemo(() => {
    if (channels.length < 2) return [];
    const conns: { from: number; to: number; strength: number; color: string }[] = [];

    for (let i = 0; i < channels.length; i++) {
      for (let j = i + 1; j < channels.length; j++) {
        const diff = Math.abs(channels[i].value - channels[j].value);
        if (diff < 15 && channels[i].value > 5 && channels[j].value > 5) {
          const strength = 1 - diff / 15;
          const tc = TEXTURE_COLORS[channels[i].texture];
          conns.push({ from: i, to: j, strength, color: tc.glow });
        }
      }
    }
    return conns;
  }, [channels]);

  if (connections.length === 0 || channels.length < 2) return null;

  const totalWidth = channels.length;

  return (
    <div className="absolute bottom-[calc(100%-20px)] left-0 right-0 h-8 pointer-events-none z-[1]">
      <svg width="100%" height="100%" viewBox={`0 0 ${totalWidth * 100} 32`} preserveAspectRatio="none">
        {connections.map(({ from, to, strength, color }, idx) => {
          const x1 = (from + 0.5) * 100;
          const x2 = (to + 0.5) * 100;
          const midX = (x1 + x2) / 2;
          const arcHeight = 8 + (to - from) * 4;
          const opacity = strength * 0.3 * (mi / 100);

          return (
            <motion.path
              key={`${from}-${to}`}
              d={`M ${x1} 30 Q ${midX} ${30 - arcHeight} ${x2} 30`}
              fill="none"
              stroke={color.replace("0.4", String(opacity))}
              strokeWidth="1.5"
              strokeDasharray="4 3"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
            />
          );
        })}
      </svg>
    </div>
  );
}


function PresetMenu() {
  const { presets, savePreset, loadPreset, deletePreset, channels } = useMixer();
  const [showMenu, setShowMenu] = useState(false);
  const [showSave, setShowSave] = useState(false);
  const [presetName, setPresetName] = useState("");

  const handleSave = () => {
    if (!presetName.trim()) return;
    savePreset(presetName.trim());
    setPresetName("");
    setShowSave(false);
  };

  const handleLoad = (index: number) => {
    loadPreset(index);
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <motion.button
        onClick={() => setShowMenu(!showMenu)}
        className="w-9 h-9 rounded-full flex items-center justify-center text-white/35 hover:text-white/60 hover:bg-white/[0.06] transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.93 }}
        title="Presets"
      >
        <FolderOpen size={14} />
      </motion.button>

      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-56 rounded-xl overflow-hidden z-50"
            style={{
              background: "rgba(24,24,26,0.95)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
              backdropFilter: "blur(20px)",
            }}
          >
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-white/40 uppercase tracking-[0.15em] font-semibold">
                  Presets
                </span>
                <button
                  onClick={() => setShowMenu(false)}
                  className="text-white/30 hover:text-white/60 transition-colors"
                >
                  <X size={12} />
                </button>
              </div>

              {channels.length > 0 && (
                <div className="mb-2">
                  {showSave ? (
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={presetName}
                        onChange={(e) => setPresetName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSave()}
                        placeholder="Preset name..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-md px-2 py-1.5 text-[11px] text-white/70 placeholder:text-white/20 focus:outline-none focus:border-white/25"
                        autoFocus
                        maxLength={24}
                      />
                      <button
                        onClick={handleSave}
                        disabled={!presetName.trim()}
                        className="px-2 py-1.5 rounded-md text-[10px] bg-white/10 text-white/60 hover:bg-white/15 disabled:opacity-30 transition-colors"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowSave(true)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[11px] text-white/50 hover:text-white/70 hover:bg-white/[0.06] transition-colors"
                    >
                      <Save size={12} />
                      <span>Save current mix</span>
                    </button>
                  )}
                </div>
              )}

              {presets.length === 0 ? (
                <div className="text-[10px] text-white/20 text-center py-3">
                  No saved presets yet
                </div>
              ) : (
                <div className="flex flex-col gap-0.5 max-h-40 overflow-y-auto">
                  {presets.map((preset, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1 group"
                    >
                      <button
                        onClick={() => handleLoad(i)}
                        className="flex-1 text-left px-2 py-1.5 rounded-md text-[11px] text-white/50 hover:text-white/80 hover:bg-white/[0.06] transition-colors truncate"
                      >
                        <span className="block truncate">{preset.name}</span>
                        <span className="text-[8px] text-white/20">
                          {preset.channels.length} parts
                        </span>
                      </button>
                      <button
                        onClick={() => deletePreset(i)}
                        className="p-1 text-white/15 hover:text-red-400/70 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


function getMoodText(value: number): string {
  if (value === 0) return "ghosting";
  if (value < 10) return "barely awake";
  if (value < 25) return "whispering";
  if (value < 40) return "simmering";
  if (value < 55) return "vibing";
  if (value < 70) return "getting loud";
  if (value < 85) return "TURNED UP";
  if (value < 95) return "unhinged";
  if (value < 100) return "CHAOS MODE";
  return "FULL SEND";
}

interface FaderProps {
  channelId: string;
  name: string;
  value: number;
  isSoloed: boolean;
  isWiseSelf: boolean;
  magnetBroken: boolean;
  channelCount: number;
  isMaster?: boolean;
  texture?: PartTexture;
  index?: number;
  onDragReorder?: (from: number, to: number) => void;
}

function Fader({
  channelId,
  name,
  value,
  isSoloed,
  isWiseSelf,
  magnetBroken,
  channelCount,
  isMaster = false,
  texture = "hum",
  index = 0,
  onDragReorder,
}: FaderProps) {
  const { setChannelValue, setMasterIntensity, toggleSolo, removeChannel, breakMagnet, renameChannel, settings, systemPaused, setActiveDragPosition, setIsAnyFaderDragging } = useMixer();
  const trackRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [longPressActive, setLongPressActive] = useState(false);
  const [showDetach, setShowDetach] = useState(false);
  const [isFizzling, setIsFizzling] = useState(false);
  const [labelJostle, setLabelJostle] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(name);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const magnetHoldTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasInRedZone = useRef(false);
  const smoothedValue = useRef(value);
  const prevValue = useRef(value);
  const jostleTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isRedZone = value > 85;
  const resistance = settings.faderResistance;

  const tc = TEXTURE_COLORS[texture];

  useEffect(() => {
    const delta = Math.abs(value - prevValue.current);
    if (delta > 5 && isDragging) {
      const tilt = Math.min(delta * 0.3, 6) * (value > prevValue.current ? 1 : -1);
      setLabelJostle(tilt);
      if (jostleTimeout.current) clearTimeout(jostleTimeout.current);
      jostleTimeout.current = setTimeout(() => setLabelJostle(0), 150);
    }
    prevValue.current = value;
  }, [value, isDragging]);

  useEffect(() => {
    if (isRedZone && !wasInRedZone.current) {
      if (settings.hapticEnabled) triggerHaptic([20, 50, 20]);
      wasInRedZone.current = true;
    } else if (!isRedZone) {
      wasInRedZone.current = false;
    }
  }, [isRedZone, settings.hapticEnabled]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const applyValue = useCallback(
    (rawPct: number) => {
      if (isMaster) {
        setMasterIntensity(Math.round(rawPct));
      } else {
        setChannelValue(channelId, Math.round(rawPct));
      }
    },
    [channelId, isMaster, setChannelValue, setMasterIntensity]
  );

  const updateValueFromPointer = useCallback(
    (clientY: number) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const relY = clientY - rect.top;
      const rawPct = 100 - (relY / rect.height) * 100;
      const targetPct = Math.max(0, Math.min(100, rawPct));

      if (!isMaster && isWiseSelf && !magnetBroken && targetPct < 80) {
        const magnetStr = settings.magnetStrength;
        if (!magnetHoldTimer.current) {
          const holdTime = 1000 + (1 - magnetStr) * 1000;
          magnetHoldTimer.current = setTimeout(() => {
            breakMagnet(channelId);
            if (settings.audioEnabled) playMagnetBreak();
            if (settings.hapticEnabled) triggerHaptic([50, 30, 50, 30, 100]);
          }, holdTime);
        }
        if (settings.audioEnabled) playChime();
        smoothedValue.current = 80;
        applyValue(80);
        return;
      }

      if (magnetHoldTimer.current) {
        clearTimeout(magnetHoldTimer.current);
        magnetHoldTimer.current = null;
      }

      const lerpFactor = 1 - resistance * 0.85;
      smoothedValue.current += (targetPct - smoothedValue.current) * lerpFactor;
      applyValue(smoothedValue.current);
    },
    [channelId, isMaster, isWiseSelf, magnetBroken, breakMagnet, applyValue, resistance, settings]
  );

  const clearDragState = useCallback(() => {
    setIsDragging(false);
    if (magnetHoldTimer.current) {
      clearTimeout(magnetHoldTimer.current);
      magnetHoldTimer.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isDragging) return;
    setIsAnyFaderDragging(true);
    const onMove = (e: PointerEvent) => {
      updateValueFromPointer(e.clientY);
      setActiveDragPosition({ x: e.clientX, y: e.clientY });
    };
    const onUp = () => {
      clearDragState();
      setIsAnyFaderDragging(false);
      setActiveDragPosition(null);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [isDragging, updateValueFromPointer, clearDragState, setActiveDragPosition, setIsAnyFaderDragging]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
      smoothedValue.current = value;
      updateValueFromPointer(e.clientY);
    },
    [updateValueFromPointer, value]
  );

  const handleSolo = useCallback(() => {
    if (isMaster) return;
    toggleSolo(channelId);
    if (!isSoloed && settings.audioEnabled) {
      playSoloPing();
    }
  }, [channelId, toggleSolo, isSoloed, isMaster, settings.audioEnabled]);

  const startLongPress = useCallback(() => {
    if (isMaster || isEditing) return;
    longPressTimer.current = setTimeout(() => {
      setLongPressActive(true);
      setShowDetach(true);
      if (settings.hapticEnabled) triggerHaptic([30, 50, 30]);
    }, 1500);
  }, [isMaster, isEditing, settings.hapticEnabled]);

  const cancelLongPress = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleDetach = useCallback(() => {
    setIsFizzling(true);
    setTimeout(() => {
      removeChannel(channelId);
    }, 400);
  }, [channelId, removeChannel]);

  const dismissDetach = useCallback(() => {
    setShowDetach(false);
    setLongPressActive(false);
  }, []);

  const lastTapTime = useRef(0);

  const handleLabelDoubleClick = useCallback((e: React.MouseEvent) => {
    if (isMaster) return;
    e.preventDefault();
    e.stopPropagation();
    setEditValue(name);
    setIsEditing(true);
  }, [isMaster, name]);

  const handleLabelTouchEnd = useCallback((e: React.TouchEvent) => {
    if (isMaster) return;
    const now = Date.now();
    if (now - lastTapTime.current < 350) {
      e.preventDefault();
      e.stopPropagation();
      setEditValue(name);
      setIsEditing(true);
      lastTapTime.current = 0;
    } else {
      lastTapTime.current = now;
    }
  }, [isMaster, name]);

  const commitRename = useCallback(() => {
    setIsEditing(false);
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== name) {
      renameChannel(channelId, trimmed);
    }
  }, [channelId, editValue, name, renameChannel]);

  const handleEditKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      commitRename();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditValue(name);
    }
  }, [commitRename, name]);

  const fillPercent = value;
  const glowIntensity = settings.visualIntensity;

  const vuSegments = 12;
  const activeSegments = Math.round((value / 100) * vuSegments);
  const [vuBounce, setVuBounce] = useState(0);

  useEffect(() => {
    if (settings.reducedMotion || systemPaused) return;
    const interval = setInterval(() => {
      const jitter = (Math.random() - 0.5) * 2;
      const bounceTarget = Math.max(0, activeSegments + jitter);
      setVuBounce(Math.round(bounceTarget));
    }, 80);
    return () => clearInterval(interval);
  }, [activeSegments, settings.reducedMotion, systemPaused]);

  const getVuColor = (i2: number, total: number) => {
    const pct = i2 / total;
    if (pct > 0.83) return { bg: "#ef4444", glow: "rgba(239,68,68,0.6)" };
    if (pct > 0.66) return { bg: "#f59e0b", glow: "rgba(245,158,11,0.5)" };
    return { bg: "#22c55e", glow: "rgba(34,197,94,0.4)" };
  };

  const [breathPhase, setBreathPhase] = useState(0);
  useEffect(() => {
    if (isDragging || settings.reducedMotion || value === 0 || systemPaused) return;
    const interval = setInterval(() => {
      setBreathPhase(prev => (prev + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, [isDragging, settings.reducedMotion, value, systemPaused]);

  const breathScale = value > 0 && !isDragging ? 1 + Math.sin(breathPhase * Math.PI / 180) * 0.003 : 1;
  const breathGlow = value > 0 && !isDragging ? Math.sin(breathPhase * Math.PI / 180) * 0.15 + 0.15 : 0;

  const [showReaction, setShowReaction] = useState("");
  const lastReactionValue = useRef(-1);

  useEffect(() => {
    if (isMaster) return;
    const roundedValue = Math.round(value);
    if (roundedValue === lastReactionValue.current) return;

    let reaction = "";
    if (roundedValue === 100) {
      const maxReactions = ["MAXIMUM VIBES", "TO THE MOON", "FULL SEND", "IT'S OVER 9000", "UNLIMITED POWER"];
      reaction = maxReactions[Math.floor(Math.random() * maxReactions.length)];
    } else if (roundedValue === 0) {
      const zeroReactions = ["shhh...", "gone fishing", "taking a nap", "BRB", "*crickets*"];
      reaction = zeroReactions[Math.floor(Math.random() * zeroReactions.length)];
    } else if (roundedValue === 69) {
      reaction = "nice.";
    } else if (roundedValue === 42) {
      reaction = "the answer!";
    } else if (roundedValue > 90) {
      const highReactions = ["whoa there", "spicy!", "feeling bold"];
      reaction = highReactions[Math.floor(Math.random() * highReactions.length)];
    }

    if (reaction) {
      lastReactionValue.current = roundedValue;
      setShowReaction(reaction);
      setTimeout(() => setShowReaction(""), 1500);
    } else {
      lastReactionValue.current = roundedValue;
    }
  }, [value, isMaster]);

  const handleDragStart = useCallback((e: React.DragEvent) => {
    if (isMaster) return;
    e.dataTransfer.setData("text/plain", String(index));
    e.dataTransfer.effectAllowed = "move";
  }, [index, isMaster]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (isMaster) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, [isMaster]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    if (isMaster || !onDragReorder) return;
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
    if (!isNaN(fromIndex) && fromIndex !== index) {
      onDragReorder(fromIndex, index);
    }
  }, [index, isMaster, onDragReorder]);

  const liquidGradient = isMaster
    ? "linear-gradient(to top, #4a4a50, #6b6b72)"
    : isWiseSelf
    ? "linear-gradient(to top, #78550a, #b8860b)"
    : isRedZone
    ? `linear-gradient(to top, ${tc.track}, #e64a19, #ff5722)`
    : `linear-gradient(to top, ${tc.track}66, ${tc.track})`;

  const liquidBoxShadow = !isMaster && !isWiseSelf
    ? isRedZone
      ? `0 0 12px ${tc.glow}, 0 -4px 20px rgba(255,87,34,0.3), inset 0 0 6px rgba(255,87,34,0.2)`
      : `0 0 ${4 + fillPercent * 0.08}px ${tc.glow.replace("0.4", String(0.1 + fillPercent * 0.003))}`
    : isRedZone && !isMaster
    ? `0 0 6px rgba(245,158,11,${0.3 * glowIntensity})`
    : "0 0 0 transparent";

  const capBackground = isMaster
    ? "linear-gradient(180deg, #b8b8c0 0%, #8a8a92 30%, #6e6e76 70%, #58585e 100%)"
    : isWiseSelf
    ? "linear-gradient(180deg, #f0c850 0%, #c49a20 30%, #a07818 70%, #806010 100%)"
    : tc.cap;

  const capBorder = isMaster
    ? "1px solid rgba(255,255,255,0.2)"
    : isWiseSelf
    ? "1px solid rgba(212,170,40,0.4)"
    : `1px solid ${tc.glow.replace("0.4", "0.3")}`;

  return (
    <div
      draggable={!isMaster}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="flex-shrink-0"
    >
    <motion.div
      className="flex flex-col items-center select-none fader-strip"
      animate={
        isFizzling
          ? { opacity: 0, scale: 0.5, filter: "blur(8px)", transition: { duration: 0.4 } }
          : longPressActive
          ? {
              x: [0, -1.5, 1.5, -1.5, 1.5, 0],
              opacity: 0.7,
              transition: { x: { repeat: Infinity, duration: 0.25 } },
            }
          : { x: 0, opacity: 1 }
      }
      data-master={isMaster ? "true" : undefined}
    >
      <AnimatePresence>
        {showReaction && !isMaster && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.6 }}
            transition={{ type: "spring", damping: 15, stiffness: 400 }}
            className="absolute -top-6 left-1/2 -translate-x-1/2 z-30 whitespace-nowrap pointer-events-none"
          >
            <div
              className="px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider"
              style={{
                background: "rgba(0,0,0,0.7)",
                color: value === 100 ? "#f59e0b" : value === 0 ? "#94a3b8" : value === 69 ? "#ec4899" : "#22c55e",
                border: `1px solid ${value === 100 ? "rgba(245,158,11,0.3)" : "rgba(255,255,255,0.1)"}`,
                textShadow: value === 100 ? "0 0 8px rgba(245,158,11,0.5)" : "none",
              }}
            >
              {showReaction}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="relative flex flex-col items-center fader-housing rounded-lg"
        style={{
          background: isMaster
            ? "linear-gradient(180deg, rgba(40,38,42,0.9) 0%, rgba(28,26,30,0.95) 100%)"
            : "linear-gradient(180deg, rgba(32,32,34,0.85) 0%, rgba(22,22,24,0.9) 100%)",
          border: isMaster
            ? "1px solid rgba(255,255,255,0.1)"
            : isDragging
            ? `1px solid ${tc.glow.replace("0.4", "0.25")}`
            : "1px solid rgba(255,255,255,0.05)",
          boxShadow: isDragging && !isMaster
            ? `inset 0 1px 0 rgba(255,255,255,0.04), 0 4px 16px rgba(0,0,0,0.4), 0 0 20px ${tc.glow.replace("0.4", "0.12")}`
            : `inset 0 1px 0 rgba(255,255,255,0.04), 0 4px 16px rgba(0,0,0,0.4)`,
          transform: `scale(${breathScale})`,
          transition: "border 0.3s ease, box-shadow 0.3s ease, transform 0.15s ease",
        }}
      >
        {!isMaster && value > 0 && !isDragging && !settings.reducedMotion && (
          <div
            className="absolute inset-0 rounded-lg pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at 50% ${100 - fillPercent}%, ${tc.glow.replace("0.4", String(breathGlow * 0.08 * glowIntensity))} 0%, transparent 70%)`,
              transition: "background 0.1s ease",
            }}
          />
        )}

        {!isMaster && fillPercent > 10 && (
          <div
            className="absolute inset-0 rounded-lg pointer-events-none transition-all duration-300"
            style={{
              background: `radial-gradient(ellipse at 50% ${100 - fillPercent}%, ${tc.glow.replace("0.4", String(0.08 + fillPercent * 0.002 * glowIntensity))} 0%, transparent 60%)`,
            }}
          />
        )}

        {isRedZone && !isMaster && (
          <div
            className="absolute inset-0 rounded-lg pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at 50% ${100 - fillPercent}%, rgba(255,87,34,${0.12 * glowIntensity}) 0%, transparent 50%)`,
              animation: "redZonePulse 0.6s ease-in-out infinite",
            }}
          />
        )}

        {value >= 100 && !isMaster && !settings.reducedMotion && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: "4px",
                  height: "4px",
                  background: tc.glow.replace("0.4", "0.8"),
                  left: `${20 + Math.random() * 60}%`,
                  top: `${Math.random() * 40}%`,
                  animation: `sparkle-burst ${0.6 + Math.random() * 0.4}s ease-out ${i * 0.1}s infinite`,
                  boxShadow: `0 0 6px ${tc.glow}`,
                }}
              />
            ))}
          </div>
        )}

        {!isMaster && (
          <button
            onClick={handleSolo}
            className={`solo-btn text-[9px] uppercase tracking-[0.15em] font-semibold rounded-sm mb-2 transition-all duration-300 ${
              isSoloed
                ? "bg-amber-500/25 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.3)]"
                : "bg-white/[0.04] text-white/30 hover:bg-white/[0.08] hover:text-white/50"
            }`}
          >
            S
          </button>
        )}

        {isMaster && (
          <div className="text-[8px] uppercase tracking-[0.2em] text-white/25 mb-2 font-medium">
            Master
          </div>
        )}

        {isWiseSelf && (
          <div
            className={`text-[8px] uppercase tracking-[0.15em] px-2 py-0.5 rounded-sm mb-2 transition-all ${
              magnetBroken
                ? "bg-white/[0.04] text-white/20"
                : "bg-amber-900/30 text-amber-400 ring-1 ring-amber-600/30"
            }`}
          >
            Boost
          </div>
        )}

        <div
          ref={trackRef}
          className="relative rounded-sm cursor-pointer touch-none fader-track"
          style={{
            background: "linear-gradient(180deg, #1a1a1c 0%, #0f0f10 100%)",
            boxShadow: "inset 0 2px 8px rgba(0,0,0,0.8), inset 0 -1px 0 rgba(255,255,255,0.03)",
          }}
          onPointerDown={handlePointerDown}
        >
          <motion.div
            className="absolute bottom-0 left-0 right-0 rounded-sm"
            style={{
              height: `${fillPercent}%`,
              background: liquidGradient,
              boxShadow: liquidBoxShadow,
              transition: "box-shadow 0.3s ease",
            }}
          >
            {isRedZone && !isMaster && (
              <div
                className="absolute inset-0 rounded-sm overflow-hidden pointer-events-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='t'%3E%3CfeTurbulence type='turbulence' baseFrequency='0.4' numOctaves='3' seed='${Math.floor(Date.now() / 100)}'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23t)' opacity='0.15'/%3E%3C/svg%3E")`,
                  animation: "turbulence 0.15s steps(3) infinite",
                  mixBlendMode: "overlay",
                }}
              />
            )}
          </motion.div>

          <div className="absolute right-full top-0 bottom-0 flex flex-col-reverse justify-between py-1 mr-1 pointer-events-none gap-[2px]">
            {Array.from({ length: vuSegments }).map((_, i) => {
              const vuColor = getVuColor(i, vuSegments);
              const isLit = i < (isDragging ? activeSegments : vuBounce);
              return (
                <div
                  key={i}
                  className="rounded-[1px] transition-all"
                  style={{
                    width: "4px",
                    height: `${100 / vuSegments - 2}%`,
                    minHeight: "3px",
                    background: isLit ? vuColor.bg : "rgba(255,255,255,0.04)",
                    boxShadow: isLit ? `0 0 4px ${vuColor.glow}` : "none",
                    opacity: isLit ? 1 : 0.3,
                    transition: "all 0.06s ease-out",
                  }}
                />
              );
            })}
          </div>

          <div className="absolute left-full top-0 bottom-0 flex flex-col justify-between py-0.5 ml-1 pointer-events-none">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="w-1.5 h-px bg-white/[0.08]" />
            ))}
          </div>

          <motion.div
            className="absolute left-1/2 z-10 fader-cap-wrap"
            style={{
              bottom: `${fillPercent}%`,
              x: "-50%",
              y: "50%",
            }}
            animate={
              isRedZone && !isMaster && !settings.reducedMotion
                ? {
                    x: ["-50%", "calc(-50% - 1px)", "calc(-50% + 1px)", "calc(-50% - 1px)", "-50%"],
                    transition: { repeat: Infinity, duration: 0.07, ease: "linear" },
                  }
                : { x: "-50%" }
            }
          >
            <div
              className="w-full h-full rounded-sm relative overflow-hidden fader-cap"
              style={{
                background: capBackground,
                boxShadow: isDragging && !isMaster
                  ? `0 2px 6px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15), 0 0 12px ${tc.glow.replace("0.4", "0.5")}, 0 0 24px ${tc.glow.replace("0.4", "0.2")}`
                  : `0 2px 6px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,${isMaster ? 0.3 : 0.15})`,
                border: capBorder,
                transition: "box-shadow 0.15s ease",
                transform: isDragging ? "scaleX(1.08)" : "scaleX(1)",
              }}
            >
              <div
                className="absolute left-[20%] right-[20%] top-1/2 -translate-y-1/2 h-px"
                style={{
                  background: isMaster ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.2)",
                }}
              />
              <div
                className="absolute left-[25%] right-[25%] h-px"
                style={{
                  top: "calc(50% - 2px)",
                  background: isMaster ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.08)",
                }}
              />
              <div
                className="absolute left-[25%] right-[25%] h-px"
                style={{
                  top: "calc(50% + 2px)",
                  background: isMaster ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.08)",
                }}
              />
            </div>
          </motion.div>

          <AnimatePresence>
            {showDetach && !isMaster && (
              <motion.button
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                onClick={handleDetach}
                className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 bg-red-900/80 hover:bg-red-800/90 text-red-200 text-[8px] uppercase tracking-wider px-2 py-1 rounded whitespace-nowrap transition-colors"
                style={{ boxShadow: "0 2px 8px rgba(220,38,38,0.3)" }}
              >
                Detach
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <div className="text-[11px] text-white/35 tabular-nums font-mono mt-2 tracking-wider">
          {Math.round(value)}
        </div>

        <div
          className="relative mt-2 w-full"
          onPointerDown={!isEditing ? startLongPress : undefined}
          onPointerUp={cancelLongPress}
          onPointerLeave={() => { cancelLongPress(); if (!showDetach) { setLongPressActive(false); } }}
          onTouchStart={!isEditing ? startLongPress : undefined}
          onTouchEnd={cancelLongPress}
        >
          <div
            className="w-full py-1.5 px-1.5 rounded-sm text-center transition-transform duration-150"
            style={{
              background: isMaster
                ? "linear-gradient(180deg, rgba(80,80,86,0.5), rgba(60,60,66,0.4))"
                : "linear-gradient(180deg, #e8e4dc, #dbd7cf)",
              boxShadow: isMaster
                ? "none"
                : "0 1px 2px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.6)",
              transform: `rotate(${labelJostle}deg)`,
            }}
            onDoubleClick={handleLabelDoubleClick}
            onTouchEnd={handleLabelTouchEnd}
          >
            {isEditing && !isMaster ? (
              <input
                ref={inputRef}
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={commitRename}
                onKeyDown={handleEditKeyDown}
                maxLength={20}
                className="w-full bg-transparent text-center text-[11px] font-mono leading-tight text-gray-800 outline-none border-b border-amber-500/50"
                style={{ caretColor: "#d97706" }}
              />
            ) : (
              <div
                className={`text-[11px] font-mono truncate leading-tight ${
                  isMaster
                    ? "text-white/40 uppercase tracking-[0.12em]"
                    : isWiseSelf
                    ? "text-amber-900/80 font-semibold"
                    : "text-gray-700/80"
                }`}
                title={!isMaster ? "Double-click to rename" : undefined}
              >
                {name}
              </div>
            )}
          </div>
          {showDetach && !isMaster && (
            <button
              onClick={dismissDetach}
              className="absolute -top-2 -right-1 w-4 h-4 flex items-center justify-center text-white/30 text-[9px] hover:text-white/60 bg-black/40 rounded-full"
            >
              x
            </button>
          )}
        </div>

        {!isMaster && (
          <div
            className="mt-1.5 text-[7px] uppercase tracking-[0.15em] font-medium px-2 py-0.5 rounded-sm"
            style={{
              color: tc.glow.replace("0.4", "0.6"),
              background: tc.glow.replace("0.4", "0.06"),
            }}
            title={getMoodText(value)}
          >
            {tc.label}
          </div>
        )}

        {!isMaster && value > 0 && (
          <div className="mt-1 text-[8px] text-white/15 text-center truncate w-full" style={{ maxWidth: "80px" }} data-snapshot-hide>
            {getMoodText(value)}
          </div>
        )}
      </div>
    </motion.div>
    </div>
  );
}


const GHOST_SUGGESTIONS = [
  "The Protector", "Inner Critic", "The Exile", "Anxious Part",
  "The Manager", "Wise Self", "Gremlin Brain", "Drama Llama",
  "Overthink-o-Matic", "The Snack Goblin",
];

const GHOST_TEXTURES: { key: PartTexture; label: string; desc: string }[] = [
  { key: "chatter", label: "Chatter", desc: "Inner committee meeting" },
  { key: "buzz", label: "Buzz", desc: "Wired anxious static" },
  { key: "throb", label: "Throb", desc: "Heavy pressure / dread" },
  { key: "shout", label: "Shout", desc: "Harsh critical yelling" },
  { key: "hum", label: "Hum", desc: "Calm wise presence" },
];

function GhostMenu() {
  const { showGhostMenu, setShowGhostMenu, addChannel, channels } = useMixer();
  const [customName, setCustomName] = useState("");
  const [selectedTexture, setSelectedTexture] = useState<PartTexture>("hum");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showGhostMenu && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
    if (showGhostMenu) {
      setSelectedTexture("hum");
    }
  }, [showGhostMenu]);

  const handleAdd = (n: string) => {
    initAudio();
    const isWise = n.toLowerCase().includes("wise self");
    addChannel(n, isWise, selectedTexture);
    setShowGhostMenu(false);
    setCustomName("");
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customName.trim()) {
      handleAdd(customName.trim());
    }
  };

  const canAdd = channels.length < 8;
  const colors = TEXTURE_COLORS[selectedTexture];

  return (
    <AnimatePresence>
      {showGhostMenu && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setShowGhostMenu(false)}
        >
          <div
            className="absolute inset-0"
            style={{
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              background: "rgba(18,18,18,0.7)",
            }}
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative z-10 w-[92vw] max-w-md p-5 sm:p-8 rounded-2xl max-h-[85vh] overflow-y-auto"
            style={{
              background: "rgba(30,30,30,0.85)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowGhostMenu(false)}
              className="absolute top-3 right-3 text-white/30 hover:text-white/60 transition-colors p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <X size={18} />
            </button>

            <h2
              className="text-white/80 text-lg mb-1 tracking-wide"
              style={{ fontFamily: "Georgia, serif", fontStyle: "italic" }}
            >
              Who's in there?
            </h2>
            <p className="text-white/30 text-xs mb-1">
              Pick a familiar face or invent your own character.
              {!canAdd && (
                <span className="text-amber-500/70 ml-1">
                  Whoa, full house! Max 8 parts.
                </span>
              )}
            </p>
            <p className="text-white/15 text-[10px] mb-5 italic">
              {channels.length === 0
                ? "Everyone's got an inner cast. Let's meet yours."
                : channels.length < 3
                ? "The party's just getting started..."
                : channels.length < 6
                ? "Getting crowded in here! (In a good way.)"
                : "Standing room only. Your inner world is BUSY."}
            </p>

            <div className="mb-5">
              <div className="text-[9px] text-white/25 uppercase tracking-[0.2em] font-semibold mb-2">
                Part Essence
              </div>
              <div className="flex gap-1.5">
                {GHOST_TEXTURES.map((t) => {
                  const ttc = TEXTURE_COLORS[t.key];
                  const isSelected = selectedTexture === t.key;
                  return (
                    <button
                      key={t.key}
                      onClick={() => setSelectedTexture(t.key)}
                      className="flex-1 flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-lg transition-all duration-200"
                      style={{
                        background: isSelected ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.02)",
                        border: isSelected ? `1px solid ${ttc.glow}` : "1px solid rgba(255,255,255,0.04)",
                        boxShadow: isSelected ? `0 0 12px ${ttc.glow.replace("0.4", "0.15")}` : "none",
                      }}
                    >
                      <div
                        className="w-5 h-5 rounded-full"
                        style={{
                          background: ttc.track,
                          boxShadow: isSelected ? `0 0 8px ${ttc.glow}` : "none",
                        }}
                      />
                      <span className={`text-[9px] font-medium tracking-wider ${isSelected ? "text-white/70" : "text-white/30"}`}>
                        {t.label}
                      </span>
                      <span className="text-[7px] text-white/15 leading-tight text-center">
                        {t.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {GHOST_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  disabled={!canAdd}
                  onClick={() => handleAdd(s)}
                  className={`px-4 py-2 rounded-full text-sm transition-all duration-200 ${
                    canAdd
                      ? "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80 border border-white/8 hover:border-white/15"
                      : "bg-white/3 text-white/20 cursor-not-allowed border border-white/5"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <form onSubmit={handleCustomSubmit} className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Or type a custom name..."
                disabled={!canAdd}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-white/25 transition-colors"
              />
              <button
                type="submit"
                disabled={!canAdd || !customName.trim()}
                className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all bg-white/10 text-white/60 hover:bg-white/15 hover:text-white/80 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


function SettingSlider({
  label, value, onChange, min = 0, max = 1, step = 0.01, leftLabel, rightLabel,
}: {
  label: string; value: number; onChange: (v: number) => void;
  min?: number; max?: number; step?: number; leftLabel?: string; rightLabel?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-[11px] text-white/50 font-medium">{label}</span>
        <span className="text-[10px] text-white/25 font-mono tabular-nums">
          {Math.round(value * 100)}%
        </span>
      </div>
      {(leftLabel || rightLabel) && (
        <div className="flex justify-between text-[9px] text-white/20 italic" style={{ fontFamily: "Georgia, serif" }}>
          <span>{leftLabel}</span>
          <span>{rightLabel}</span>
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="settings-slider w-full"
      />
    </div>
  );
}

function SettingToggle({
  label, description, value, onChange,
}: {
  label: string; description?: string; value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <div>
        <span className="text-[11px] text-white/50 font-medium">{label}</span>
        {description && (
          <p className="text-[9px] text-white/20 mt-0.5">{description}</p>
        )}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`w-8 h-[18px] rounded-full relative transition-colors duration-200 ${
          value ? "bg-amber-600/50" : "bg-white/[0.08]"
        }`}
      >
        <div
          className={`absolute top-[2px] w-[14px] h-[14px] rounded-full transition-all duration-200 ${
            value ? "left-[16px] bg-amber-400" : "left-[2px] bg-white/30"
          }`}
        />
      </button>
    </div>
  );
}

function SettingsPanel() {
  const { showSettings, setShowSettings, settings, updateSettings } = useMixer();

  return (
    <AnimatePresence>
      {showSettings && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex justify-end"
          onClick={() => setShowSettings(false)}
        >
          <div
            className="absolute inset-0"
            style={{
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              background: "rgba(10,10,10,0.5)",
            }}
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="relative z-10 w-[320px] max-w-[85vw] h-full overflow-y-auto"
            style={{
              background: "rgba(22,22,24,0.95)",
              borderLeft: "1px solid rgba(255,255,255,0.06)",
              boxShadow: "-8px 0 30px rgba(0,0,0,0.4)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4" style={{ background: "rgba(22,22,24,0.98)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <h3 className="text-white/60 text-xs font-semibold tracking-[0.2em] uppercase">
                Calibration
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-white/25 hover:text-white/50 transition-colors p-2 -mr-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-5 py-4 space-y-6">
              <div>
                <div className="text-[9px] text-white/20 uppercase tracking-[0.25em] font-semibold mb-3 pb-1" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  Sensory & Accessibility
                </div>
                <div className="space-y-3">
                  <SettingToggle label="Master Audio" description="All synthesized sounds" value={settings.audioEnabled} onChange={(v) => updateSettings({ audioEnabled: v })} />
                  <SettingToggle label="Haptic Feedback" description="Vibrations on supported devices" value={settings.hapticEnabled} onChange={(v) => updateSettings({ hapticEnabled: v })} />
                  <SettingSlider label="Visual Intensity" value={settings.visualIntensity} onChange={(v) => updateSettings({ visualIntensity: v })} leftLabel="Subdued" rightLabel="Vivid" />
                  <SettingToggle label="Reduced Motion" description="Minimize spring animations" value={settings.reducedMotion} onChange={(v) => updateSettings({ reducedMotion: v })} />
                </div>
              </div>

              <div>
                <div className="text-[9px] text-white/20 uppercase tracking-[0.25em] font-semibold mb-3 pb-1" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  Audio Calibration
                </div>
                <div className="space-y-3">
                  <SettingSlider label="Drone Resonance" value={settings.masterPitch} onChange={(v) => updateSettings({ masterPitch: v })} leftLabel="Deep / Grounded" rightLabel="Light / Urgent" />
                  <SettingSlider label="Texture Mix" value={settings.textureMix} onChange={(v) => updateSettings({ textureMix: v })} leftLabel="Pure Tone" rightLabel="Organic Noise" />
                  <SettingSlider label="Solo Background Vol" value={settings.soloBackgroundVolume} onChange={(v) => updateSettings({ soloBackgroundVolume: v })} leftLabel="Silent" rightLabel="Audible" max={0.3} />
                </div>
              </div>

              <div>
                <div className="text-[9px] text-white/20 uppercase tracking-[0.25em] font-semibold mb-3 pb-1" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  Interaction Physics
                </div>
                <div className="space-y-3">
                  <SettingSlider label="Fader Resistance" value={settings.faderResistance} onChange={(v) => updateSettings({ faderResistance: v })} leftLabel="Light / Free" rightLabel="Heavy / Viscous" />
                  <SettingSlider label="Magnetic Strength" value={settings.magnetStrength} onChange={(v) => updateSettings({ magnetStrength: v })} leftLabel="Gentle" rightLabel="Strong" />
                  <SettingToggle label="Snap to Grid" description="Faders move in 10% increments" value={settings.snapToGrid} onChange={(v) => updateSettings({ snapToGrid: v })} />
                </div>
              </div>

              <div>
                <div className="text-[9px] text-white/20 uppercase tracking-[0.25em] font-semibold mb-3 pb-1" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  Color Scheme
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(COLOR_THEMES) as ColorTheme[]).map((key) => {
                    const t = COLOR_THEMES[key];
                    const isActive = settings.colorTheme === key;
                    return (
                      <button
                        key={key}
                        onClick={() => updateSettings({ colorTheme: key })}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all duration-200"
                        style={{
                          background: isActive ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.02)",
                          border: isActive ? `1px solid ${t.preview[2]}44` : "1px solid rgba(255,255,255,0.04)",
                          boxShadow: isActive ? `0 0 12px ${t.preview[2]}15` : "none",
                        }}
                      >
                        <div className="flex gap-0.5 flex-shrink-0">
                          {t.preview.map((color, i) => (
                            <div
                              key={i}
                              className="w-3 h-3 rounded-full"
                              style={{
                                background: color,
                                border: "1px solid rgba(255,255,255,0.1)",
                              }}
                            />
                          ))}
                        </div>
                        <span className={`text-[10px] truncate ${isActive ? "text-white/70 font-medium" : "text-white/35"}`}>
                          {t.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 pb-6">
                <p className="text-white/15 text-[9px] leading-relaxed italic" style={{ fontFamily: "Georgia, serif" }}>
                  These calibrations persist for this session. Adjust to match
                  your client's sensory threshold and comfort level.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


const GUIDE_STEPS = [
  {
    text: "Your Facilitation Center is in the top-left corner. Use the Timer and Whispers to guide the session while keeping the board clean for your client.",
    target: "command-center",
  },
  {
    text: "Drag a fader up or down to adjust its intensity. Feel the resistance. The red zone (above 85%) means something is running hot.",
    target: "fader",
  },
  {
    text: "Tap 'S' to Solo a part and hear its crystal chime. Press 'M' at any time for Emergency Silence.",
    target: "toolbar",
  },
  {
    text: "Now, invite your client to name the first voice that's seeking attention today.",
    target: "add-button",
  },
];

function GhostGuide() {
  const { showTutorial, tutorialStep, advanceTutorial, completeTutorial } = useMixer();

  if (!showTutorial) return null;

  const step = GUIDE_STEPS[tutorialStep];
  if (!step) {
    completeTutorial();
    return null;
  }

  const isLast = tutorialStep === GUIDE_STEPS.length - 1;

  return (
    <AnimatePresence>
      <motion.div
        key={tutorialStep}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="fixed inset-0 z-[60] flex items-end justify-center pb-24 pointer-events-none"
      >
        <div
          className="absolute inset-0 pointer-events-auto"
          onClick={() => (isLast ? completeTutorial() : advanceTutorial())}
          style={{ background: "rgba(0,0,0,0.3)" }}
        />

        <motion.div
          className="relative z-10 max-w-xs mx-4 px-6 py-4 rounded-2xl pointer-events-auto cursor-pointer"
          style={{
            background: "rgba(30,30,30,0.95)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 15px 40px rgba(0,0,0,0.4)",
          }}
          onClick={() => (isLast ? completeTutorial() : advanceTutorial())}
          whileTap={{ scale: 0.98 }}
        >
          <p
            className="text-white/70 text-sm leading-relaxed"
            style={{ fontFamily: "Georgia, serif", fontStyle: "italic" }}
          >
            {step.text}
          </p>
          <div className="flex justify-between items-center mt-3">
            <div className="flex gap-1">
              {GUIDE_STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    i === tutorialStep ? "bg-amber-500" : "bg-white/15"
                  }`}
                />
              ))}
            </div>
            <span className="text-white/30 text-[10px] uppercase tracking-wider">
              {isLast ? "Got it" : "Next"}
            </span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}


type Priority = "high" | "mid" | "low";

interface MappedPart {
  name: string;
  texture: PartTexture;
  priority: Priority;
}

const PRIORITY_CONFIG: Record<Priority, { label: string; value: number; color: string; desc: string }> = {
  high: { label: "Loudest", value: 90, color: "#ef4444", desc: "Red zone — this one's screaming" },
  mid: { label: "Mid", value: 50, color: "#f59e0b", desc: "Noticeable but not overwhelming" },
  low: { label: "Background", value: 20, color: "#22c55e", desc: "Quiet hum in the back" },
};

const INTRO_QUICK_NAMES = [
  "The Protector", "Inner Critic", "Anxious Part", "The Manager",
  "The Exile", "People-Pleaser", "Angry Part", "The Perfectionist",
  "Gremlin Brain", "Drama Llama", "The Overthinker", "Wise Self",
];

const RANDOM_COMBOS: MappedPart[][] = [
  [
    { name: "Inner Critic", texture: "shout", priority: "high" },
    { name: "Anxious Part", texture: "buzz", priority: "high" },
    { name: "The Protector", texture: "chatter", priority: "mid" },
    { name: "Wise Self", texture: "hum", priority: "low" },
  ],
  [
    { name: "People-Pleaser", texture: "chatter", priority: "high" },
    { name: "Angry Part", texture: "shout", priority: "mid" },
    { name: "The Perfectionist", texture: "buzz", priority: "mid" },
    { name: "The Exile", texture: "throb", priority: "low" },
  ],
  [
    { name: "The Manager", texture: "chatter", priority: "high" },
    { name: "Gremlin Brain", texture: "buzz", priority: "high" },
    { name: "Drama Llama", texture: "shout", priority: "mid" },
    { name: "The Overthinker", texture: "chatter", priority: "low" },
    { name: "Wise Self", texture: "hum", priority: "low" },
  ],
];

const INTRO_TEXTURES: PartTexture[] = ["chatter", "buzz", "throb", "shout", "hum"];

function CrtIntro() {
  const { introComplete, setIntroComplete, addChannel, settings, updateSettings, snapshotInitialState } = useMixer();
  const [phase, setPhase] = useState<"briefing" | "mapping" | "expand" | "aha" | "done">("briefing");
  const [mappedParts, setMappedParts] = useState<MappedPart[]>([]);
  const [newPartName, setNewPartName] = useState("");

  const handleProceedToMapping = useCallback(() => {
    setPhase("mapping");
  }, []);

  const handleSkipMapping = useCallback(() => {
    if (settings.audioEnabled) initAudio();
    setPhase("expand");
    setTimeout(() => {
      setPhase("aha");
      setTimeout(() => {
        setPhase("done");
        setTimeout(() => setIntroComplete(), 600);
      }, 4500);
    }, 1200);
  }, [settings.audioEnabled, setIntroComplete]);

  const handleInitializeWithParts = useCallback(() => {
    if (settings.audioEnabled) initAudio();

    mappedParts.forEach((part) => {
      const isWise = part.name.toLowerCase().includes("wise self");
      addChannel(part.name, isWise, part.texture);
    });

    setTimeout(() => {
      const { channels, setChannelValue } = useMixer.getState();
      const addedChannels = channels.slice(-mappedParts.length);
      addedChannels.forEach((ch, i) => {
        const part = mappedParts[i];
        if (part) {
          setChannelValue(ch.id, PRIORITY_CONFIG[part.priority].value);
        }
      });
    }, 50);

    setPhase("expand");
    setTimeout(() => {
      setPhase("aha");
      setTimeout(() => {
        setPhase("done");
        setTimeout(() => {
          setIntroComplete();
          setTimeout(() => snapshotInitialState(), 100);
        }, 600);
      }, 4500);
    }, 1200);
  }, [settings.audioEnabled, setIntroComplete, mappedParts, addChannel, snapshotInitialState]);

  const addMappedPart = useCallback((n: string) => {
    if (mappedParts.length >= 5) return;
    const trimmed = n.trim();
    if (!trimmed) return;
    const tex = INTRO_TEXTURES[mappedParts.length % INTRO_TEXTURES.length];
    setMappedParts((prev) => [...prev, { name: trimmed, texture: tex, priority: "mid" }]);
    setNewPartName("");
  }, [mappedParts.length]);

  const removeMappedPart = useCallback((i2: number) => {
    setMappedParts((prev) => prev.filter((_, i) => i !== i2));
  }, []);

  const updatePartTexture = useCallback((i2: number, tex: PartTexture) => {
    setMappedParts((prev) => prev.map((p, i) => i === i2 ? { ...p, texture: tex } : p));
  }, []);

  const updatePartPriority = useCallback((i2: number, prio: Priority) => {
    setMappedParts((prev) => prev.map((p, i) => i === i2 ? { ...p, priority: prio } : p));
  }, []);

  const handleRandomize = useCallback(() => {
    const combo = RANDOM_COMBOS[Math.floor(Math.random() * RANDOM_COMBOS.length)];
    setMappedParts([...combo]);
  }, []);

  if (introComplete) return null;

  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ background: "#000" }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {phase === "briefing" && (
            <motion.div
              className="flex flex-col items-center max-w-lg mx-4 w-full max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.6 }}
            >
              <h1
                className="text-white/80 text-center select-none mb-2"
                style={{
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontSize: "clamp(20px, 5vw, 44px)",
                  letterSpacing: "0.3em",
                  fontWeight: 400,
                }}
              >
                VOLUME MIXER
              </h1>

              <p
                className="text-white/25 text-center mb-10 select-none"
                style={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: "clamp(10px, 1.3vw, 12px)",
                  letterSpacing: "0.08em",
                }}
              >
                An Interactive Instrument for Internal Parts Work
              </p>

              <div
                className="w-full rounded-xl p-6 sm:p-8 mb-8"
                style={{
                  background: "rgba(22,22,24,0.8)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
                }}
              >
                <h2
                  className="text-white/40 text-[10px] uppercase tracking-[0.25em] font-semibold mb-4 pb-2"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                >
                  Before We Begin
                </h2>

                <p
                  className="text-white/50 text-sm leading-relaxed mb-4"
                  style={{ fontFamily: "Georgia, serif", fontStyle: "italic" }}
                >
                  "Right now, your mind is a room full of voices — some loud, some quiet,
                  some hiding. We're going to give each one its own volume fader, so you
                  can see what's really going on in there. No judgment. Just noticing."
                </p>

                <p className="text-[10px] text-white/25 mb-4">
                  Inspired by{" "}
                  <a
                    href="https://ifs-institute.com/resources/articles/internal-family-systems-model-outline"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-500/50 hover:text-amber-400/70 underline underline-offset-2 transition-colors"
                  >
                    Internal Family Systems (IFS)
                  </a>
                  , this tool helps you explore the different "parts" within — each with its own
                  voice, its own needs.
                </p>

                <p
                  className="text-[10px] text-amber-500/30 mb-6 leading-relaxed"
                  style={{ fontFamily: "Georgia, serif", fontStyle: "italic" }}
                >
                  By the end, you'll have a picture of your internal landscape — something
                  you can carry with you this week.
                </p>

                <div className="space-y-3">
                  <label className="flex items-center justify-between cursor-pointer group">
                    <div>
                      <span className="text-[11px] text-white/50 font-medium">Enable Audio</span>
                      <p className="text-[9px] text-white/20 mt-0.5">Ambient drone synthesis & chimes</p>
                    </div>
                    <button
                      onClick={() => updateSettings({ audioEnabled: !settings.audioEnabled })}
                      className={`w-9 h-5 rounded-full relative transition-colors duration-200 ${
                        settings.audioEnabled ? "bg-amber-600/50" : "bg-white/[0.08]"
                      }`}
                    >
                      <div
                        className={`absolute top-[3px] w-[14px] h-[14px] rounded-full transition-all duration-200 ${
                          settings.audioEnabled ? "left-[18px] bg-amber-400" : "left-[3px] bg-white/30"
                        }`}
                      />
                    </button>
                  </label>

                  <label className="flex items-center justify-between cursor-pointer group">
                    <div>
                      <span className="text-[11px] text-white/50 font-medium">Enable Haptics</span>
                      <p className="text-[9px] text-white/20 mt-0.5">Vibration on supported devices</p>
                    </div>
                    <button
                      onClick={() => updateSettings({ hapticEnabled: !settings.hapticEnabled })}
                      className={`w-9 h-5 rounded-full relative transition-colors duration-200 ${
                        settings.hapticEnabled ? "bg-amber-600/50" : "bg-white/[0.08]"
                      }`}
                    >
                      <div
                        className={`absolute top-[3px] w-[14px] h-[14px] rounded-full transition-all duration-200 ${
                          settings.hapticEnabled ? "left-[18px] bg-amber-400" : "left-[3px] bg-white/30"
                        }`}
                      />
                    </button>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 w-full max-w-xs">
                <motion.button
                  onClick={handleProceedToMapping}
                  className="flex-1 py-3.5 rounded-lg text-[11px] uppercase tracking-[0.25em] font-semibold transition-all"
                  style={{
                    background: "rgba(245,158,11,0.08)",
                    border: "1px solid rgba(245,158,11,0.2)",
                    color: "rgba(245,158,11,0.7)",
                  }}
                  whileHover={{
                    background: "rgba(245,158,11,0.12)",
                    borderColor: "rgba(245,158,11,0.35)",
                    color: "rgba(245,158,11,0.9)",
                    boxShadow: "0 0 30px rgba(245,158,11,0.1)",
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  Map System
                </motion.button>
                <motion.button
                  onClick={handleSkipMapping}
                  className="py-3.5 px-4 rounded-lg text-[10px] uppercase tracking-[0.15em] transition-all"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.3)",
                  }}
                  whileHover={{
                    background: "rgba(255,255,255,0.06)",
                    color: "rgba(255,255,255,0.5)",
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  Skip
                </motion.button>
              </div>
            </motion.div>
          )}

          {phase === "mapping" && (
            <motion.div
              className="flex flex-col items-center max-w-2xl mx-4 w-full max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.4 }}
            >
              <h2
                className="text-white/70 text-center select-none mb-1"
                style={{
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontSize: "clamp(18px, 3vw, 28px)",
                  letterSpacing: "0.2em",
                  fontWeight: 400,
                }}
              >
                MAP THE CURRENT SYSTEM
              </h2>
              <p
                className="text-white/20 text-center mb-6 select-none text-[11px]"
                style={{ fontFamily: "'Courier New', monospace" }}
              >
                Who's in there right now? Let's get them all on the board.
              </p>

              <div
                className="w-full rounded-xl p-5 sm:p-6 mb-4"
                style={{
                  background: "rgba(22,22,24,0.8)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
                }}
              >
                <div className="mb-4">
                  <div className="text-[9px] text-white/20 uppercase tracking-[0.2em] font-semibold mb-2">
                    Quick Add
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {INTRO_QUICK_NAMES.filter((n) => !mappedParts.some((p) => p.name === n)).slice(0, 8).map((n) => (
                      <button
                        key={n}
                        onClick={() => addMappedPart(n)}
                        disabled={mappedParts.length >= 5}
                        className="px-2.5 py-1 rounded-full text-[10px] text-white/40 bg-white/[0.04] hover:bg-white/[0.08] hover:text-white/60 border border-white/[0.06] transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 mb-5">
                  <input
                    type="text"
                    value={newPartName}
                    onChange={(e) => setNewPartName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addMappedPart(newPartName)}
                    placeholder="Or type a custom name..."
                    disabled={mappedParts.length >= 5}
                    maxLength={24}
                    className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-[12px] text-white/70 placeholder:text-white/15 focus:outline-none focus:border-white/20 transition-colors disabled:opacity-30"
                  />
                  <button
                    onClick={() => addMappedPart(newPartName)}
                    disabled={mappedParts.length >= 5 || !newPartName.trim()}
                    className="px-3 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-white/40 hover:text-white/60 transition-colors disabled:opacity-20"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <div className="space-y-2 mb-4">
                  <AnimatePresence>
                    {mappedParts.map((part, i) => {
                      const ptc = TEXTURE_COLORS[part.texture];
                      return (
                        <motion.div
                          key={`${part.name}-${i}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-center gap-3 p-3 rounded-lg"
                          style={{
                            background: "rgba(255,255,255,0.03)",
                            border: `1px solid ${ptc.glow.replace("0.4", "0.15")}`,
                          }}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="text-[12px] text-white/70 font-medium truncate">
                              {part.name}
                            </div>
                          </div>

                          <div className="flex gap-1">
                            {INTRO_TEXTURES.map((t) => {
                              const ttc = TEXTURE_COLORS[t];
                              return (
                                <button
                                  key={t}
                                  onClick={() => updatePartTexture(i, t)}
                                  className="w-5 h-5 rounded-full transition-all"
                                  style={{
                                    background: ttc.track,
                                    opacity: part.texture === t ? 1 : 0.25,
                                    boxShadow: part.texture === t ? `0 0 8px ${ttc.glow}` : "none",
                                    transform: part.texture === t ? "scale(1.15)" : "scale(1)",
                                  }}
                                  title={t}
                                />
                              );
                            })}
                          </div>

                          <div className="flex gap-1">
                            {(Object.keys(PRIORITY_CONFIG) as Priority[]).map((p) => {
                              const cfg = PRIORITY_CONFIG[p];
                              const isActive = part.priority === p;
                              return (
                                <button
                                  key={p}
                                  onClick={() => updatePartPriority(i, p)}
                                  className="px-2 py-1 rounded text-[8px] uppercase tracking-wider font-semibold transition-all"
                                  style={{
                                    background: isActive ? `${cfg.color}22` : "rgba(255,255,255,0.03)",
                                    color: isActive ? cfg.color : "rgba(255,255,255,0.2)",
                                    border: `1px solid ${isActive ? `${cfg.color}44` : "rgba(255,255,255,0.05)"}`,
                                  }}
                                >
                                  {cfg.label}
                                </button>
                              );
                            })}
                          </div>

                          <button
                            onClick={() => removeMappedPart(i)}
                            className="text-white/15 hover:text-red-400/60 transition-colors p-1"
                          >
                            <X size={14} />
                          </button>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  {mappedParts.length === 0 && (
                    <div className="text-center py-6">
                      <p className="text-white/15 text-[11px] italic" style={{ fontFamily: "Georgia, serif" }}>
                        No parts mapped yet. Tap a name above or type your own.
                      </p>
                      <p className="text-white/10 text-[9px] mt-1">
                        (Up to 5 parts for the initial system map)
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-2 h-2 rounded-full transition-all duration-300"
                        style={{
                          background: i < mappedParts.length
                            ? TEXTURE_COLORS[mappedParts[i]?.texture || "hum"].track
                            : "rgba(255,255,255,0.06)",
                          boxShadow: i < mappedParts.length
                            ? `0 0 6px ${TEXTURE_COLORS[mappedParts[i]?.texture || "hum"].glow}`
                            : "none",
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-[9px] text-white/15">
                    {mappedParts.length}/5 slots filled
                  </span>
                </div>
              </div>

              <div className="flex gap-3 w-full max-w-md">
                <motion.button
                  onClick={handleRandomize}
                  className="flex items-center gap-2 py-3 px-4 rounded-lg text-[10px] uppercase tracking-[0.15em] transition-all"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.35)",
                  }}
                  whileHover={{
                    background: "rgba(255,255,255,0.06)",
                    color: "rgba(255,255,255,0.55)",
                  }}
                  whileTap={{ scale: 0.97 }}
                  title="Can't decide? Let fate choose."
                >
                  <Shuffle size={14} />
                  Randomize
                </motion.button>

                <motion.button
                  onClick={handleInitializeWithParts}
                  disabled={mappedParts.length === 0}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-lg text-[11px] uppercase tracking-[0.25em] font-semibold transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                  style={{
                    background: mappedParts.length > 0 ? "rgba(245,158,11,0.1)" : "rgba(245,158,11,0.03)",
                    border: `1px solid rgba(245,158,11,${mappedParts.length > 0 ? 0.25 : 0.08})`,
                    color: `rgba(245,158,11,${mappedParts.length > 0 ? 0.8 : 0.3})`,
                  }}
                  whileHover={mappedParts.length > 0 ? {
                    background: "rgba(245,158,11,0.15)",
                    borderColor: "rgba(245,158,11,0.4)",
                    color: "rgba(245,158,11,1)",
                    boxShadow: "0 0 30px rgba(245,158,11,0.15)",
                  } : {}}
                  whileTap={mappedParts.length > 0 ? { scale: 0.98 } : {}}
                >
                  <Zap size={14} />
                  Power On ({mappedParts.length} {mappedParts.length === 1 ? "part" : "parts"})
                </motion.button>
              </div>

              <button
                onClick={handleSkipMapping}
                className="mt-3 text-[9px] text-white/15 hover:text-white/30 transition-colors"
              >
                Skip — I'll add parts one at a time
              </button>
            </motion.div>
          )}

          {phase === "expand" && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                className="absolute left-0 right-0"
                style={{
                  background: "linear-gradient(180deg, transparent 0%, rgba(245,158,11,0.12) 40%, rgba(245,158,11,0.15) 50%, rgba(245,158,11,0.12) 60%, transparent 100%)",
                }}
                initial={{ height: "2px", top: "50%" }}
                animate={{ height: "100vh", top: "0%" }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              />
            </motion.div>
          )}

          {phase === "aha" && (() => {
            const loudest = mappedParts.length > 0
              ? [...mappedParts].sort((a, b) => {
                  const pv = (p: Priority) => PRIORITY_CONFIG[p].value;
                  return pv(b.priority) - pv(a.priority);
                })[0]
              : null;
            const hasWiseSelf = mappedParts.some((p) => p.name.toLowerCase().includes("wise self"));

            return (
              <motion.div
                className="absolute inset-0 flex flex-col items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
              >
                {loudest && (
                  <motion.div
                    className="aha-fader-pulse mb-6 text-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                  >
                    <div
                      className="inline-block px-6 py-3 rounded-xl"
                      style={{
                        background: hasWiseSelf
                          ? "radial-gradient(ellipse at center, rgba(212,175,55,0.15) 0%, transparent 70%)"
                          : "radial-gradient(ellipse at center, rgba(245,158,11,0.1) 0%, transparent 70%)",
                      }}
                    >
                      <span
                        className="text-white/60 text-lg"
                        style={{ fontFamily: "Georgia, serif" }}
                      >
                        {loudest.name}
                      </span>
                    </div>
                  </motion.div>
                )}

                <motion.p
                  className="text-white/30 text-sm text-center max-w-xs"
                  style={{ fontFamily: "Georgia, serif", fontStyle: "italic" }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 1 }}
                >
                  {loudest
                    ? "Notice which voice is loudest..."
                    : "Listen for which voice speaks first..."}
                </motion.p>

                {hasWiseSelf && (
                  <motion.div
                    className="absolute bottom-[30%] left-1/2 -translate-x-1/2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 1.2 }}
                    style={{
                      width: "200px",
                      height: "80px",
                      borderRadius: "50%",
                      background: "radial-gradient(ellipse at center, rgba(212,175,55,0.12) 0%, transparent 70%)",
                      filter: "blur(20px)",
                    }}
                  />
                )}
              </motion.div>
            );
          })()}
        </motion.div>
      )}
    </AnimatePresence>
  );
}


type WhisperCategory = "Opening" | "Unburdening" | "Somatic" | "Polarization" | "Closing";

interface WhisperCard {
  category: WhisperCategory;
  prompt: string;
  tag?: string;
}

const WHISPERS: WhisperCard[] = [
  { category: "Opening", tag: "Externalizing", prompt: "\"We're not going to talk about anxiety today — we're going to talk to it. Let's put it on the board and give it a fader. What does it want to be called?\"" },
  { category: "Opening", tag: "System Discovery", prompt: "\"Close your eyes for a second. Notice what shows up first when I say 'the thing you've been avoiding.' Whatever that is — it gets a fader. Don't edit it.\"" },
  { category: "Opening", tag: "Humor / Rapport", prompt: "\"Most people's Inner Critic is at like 90% before we even start. If yours had a LinkedIn profile, what would its job title be?\" (This usually gets a laugh and a surprisingly accurate part name.)" },
  { category: "Opening", tag: "Reluctant Client", prompt: "\"I notice a part that doesn't want to be here. That's fine — let's give it a fader too. Resistance is just a Protector doing overtime. What would you name it?\"" },
  { category: "Opening", tag: "Full Entry", prompt: "Power On all parts at mapped levels. Let the cacophony play for 10–15 seconds. Then: \"Hear that? That's the volume your nervous system has been managing 24/7. Your body already knows this sound — let's make it visible.\"" },
  { category: "Opening", tag: "Humor / Lightness", prompt: "\"Okay, before we start — the rule is: no part gets kicked out of the studio. Even the weird ones. Especially the weird ones. They usually have the best intel.\"" },
  { category: "Unburdening", tag: "Direct Access", prompt: "Solo a part (S button), then: \"I'd like to speak directly to this part. [Part name], how long have you been carrying this? What are you afraid would happen if you put it down?\"" },
  { category: "Unburdening", tag: "Exiled Part", prompt: "If a fader is stuck near zero: \"I notice [part name] is very quiet. Sometimes the quietest parts are carrying the most. Can we bring it up just a little — to maybe 15 — and see what it wants us to know?\"" },
  { category: "Unburdening", tag: "Protector Negotiation", prompt: "When a Protector is at 85+: \"This part is working incredibly hard. Before we try to turn it down, I want to ask it: what are you protecting? And what would you need to see before you'd be willing to step back even 10%?\"" },
  { category: "Unburdening", tag: "Humor / Reframe", prompt: "\"Your Inner Critic is at 95. I respect the hustle, honestly. That's a part that has never once called in sick. But I'm curious — has anyone ever asked it if it wants a vacation?\"" },
  { category: "Unburdening", tag: "Trailhead", prompt: "\"Move the fader slowly and notice: at what number does this part start to get nervous? That's the trailhead. That's where the younger part lives underneath. Let's sit right at that edge.\"" },
  { category: "Unburdening", tag: "Witness", prompt: "After a part shares its burden: \"Now slowly bring it down to where it wants to rest — not where you think it should be, where it wants to be. Trust the fader.\"" },
  { category: "Somatic", tag: "Felt Sense", prompt: "\"Listen to the texture of this part — that jittery crackling. Where do you feel that exact texture in your body right now? Put your hand there. That's where this part lives.\"" },
  { category: "Somatic", tag: "Window Check", prompt: "Hit Pause (P). In the silence: \"Notice what happens in your chest when everything stops. Is that relief, or is that scary? Both answers tell us something important about your window of tolerance right now.\"" },
  { category: "Somatic", tag: "Co-Regulation", prompt: "\"I'm going to slowly bring the Master down to 30. As the volume drops, I want you to track what happens to your breathing. Don't change it — just notice.\" (Use this to titrate arousal in real-time.)" },
  { category: "Somatic", tag: "Humor / Grounding", prompt: "\"Your system just hit the red zone on three faders at once. That's basically the neurological equivalent of every app on your phone sending notifications simultaneously. Let's close some tabs — hit Pause.\"" },
  { category: "Somatic", tag: "Pendulation", prompt: "\"Solo the part that feels safest — your Wise Self or whatever's calmest. Sit in that sound for 30 seconds. Now switch the Solo to the activated part. Notice the contrast in your body. We're going to pendulate between these two.\"" },
  { category: "Polarization", tag: "Conflict Mapping", prompt: "\"I notice [Part A] is at 80 and [Part B] is at 80. They're both screaming. In IFS, that usually means they're in a polarization — each one is loud because the other one is loud. What happens if we bring both down to 40 together?\"" },
  { category: "Polarization", tag: "Mediation", prompt: "\"Let's Solo [Part A] first and hear what it's afraid of. Then we'll Solo [Part B] and hear the same. Usually they're both trying to protect the same Exile — they just have opposite strategies.\"" },
  { category: "Polarization", tag: "Humor / Reframe", prompt: "\"These two parts are basically coworkers who've been passive-aggressively CC'ing each other for years. Let's schedule a meeting. Solo one, let it talk, then the other. No interrupting.\"" },
  { category: "Polarization", tag: "Self-Energy", prompt: "\"Where's your Wise Self fader right now? If it's below 30 while two parts are above 70, we've lost the mediator. Before we can do anything with these two, we need Self back in the room. Let's get that fader up first.\"" },
  { category: "Closing", tag: "Integration Check", prompt: "\"Before we stop — look at the board. Without overthinking it, is there a part whose fader position surprises you? That surprise is data. Hold onto it this week.\"" },
  { category: "Closing", tag: "Snapshot Ritual", prompt: "Take a Snapshot. \"This is the mix from today. Not where you started, not where you'll end up — just today. Next session, we'll power on again and see what shifted on its own.\"" },
  { category: "Closing", tag: "Containment", prompt: "\"We stirred up some big parts today. Before you leave, let's bring everything down to 20 or below — a resting state. These parts aren't going away, we're just letting them know the session is over and they can clock out.\"" },
  { category: "Closing", tag: "Pause as Metaphor", prompt: "Hit Pause (P). Let the silence land for 5 full seconds. \"This is what's available to you. Not emptiness — stillness. The parts are still on the board. You're just choosing not to amplify them right now.\"" },
  { category: "Closing", tag: "Humor / Warmth", prompt: "\"Alright, the studio is closing for today. Everyone out. Except Wise Self — Wise Self can have the keys to lock up.\" (Bring all faders to 0 except Wise Self at ~40.)" },
  { category: "Closing", tag: "Homework", prompt: "\"This week, when you notice a part getting loud, I want you to just name it — even silently. 'Oh, that's my Protector at like 80 right now.' You don't have to change it. Naming it is the intervention.\"" },
];

const WHISPER_CATEGORIES: WhisperCategory[] = ["Opening", "Unburdening", "Somatic", "Polarization", "Closing"];

const PRO_TIPS = [
  "If they call the Inner Critic \"Jeff,\" just go with it. Jeff probably needs a fader too.",
  "A part at 0% is not gone — it's hiding. That's clinically different from integrated.",
  "When in doubt, ask: \"What does this part need you to know?\" It works on literally every part.",
  "The Wise Self fader is your co-therapist. If it's below 20%, you're negotiating with Protectors without a mediator.",
  "If a client says \"I don't have parts\" — that's a part talking. Add a fader called \"The One Who Doesn't Have Parts.\"",
  "Red zone doesn't mean bad. Sometimes a Protector needs to be loud until it feels heard. Validate first, negotiate volume second.",
  "The most clinical information is in the gap between where they set the fader and where they think it \"should\" be.",
  "Fader resistance is therapeutic data. If they can't move a part below 60, that part has a reason. Curiosity before force.",
  "Fun fact: clients will rename parts mid-session. \"The Critic\" becomes \"Mom's Voice\" becomes \"Little Me Trying to Stay Safe.\" Each rename is a micro-unburdening.",
  "If the board looks chaotic, you're doing it right. Clean boards are for the end of therapy, not the beginning.",
  "The Randomize button during onboarding isn't lazy — it's projective. Watch which parts they keep vs. swap out.",
  "Sometimes the most therapeutic move is to hand them the mouse and say nothing for 90 seconds.",
];

const TECHNIQUE_NOTES = [
  { label: "Solo = Direct Access", note: "Soloing a part (S) is the board equivalent of \"Can I speak to this part directly?\" in IFS. It lowers all other parts to background volume, creating space for one voice." },
  { label: "Pause = Emergency Containment", note: "Pause (P) is your panic button and your therapeutic tool. Use it to freeze dysregulation, create a mindful pause, or demonstrate the contrast between activation and stillness." },
  { label: "Red Zone = Trailhead", note: "When a fader crosses 85%, the visual turbulence is intentional. Use it: \"See that shaking? That's what this part's energy actually looks like. Let's find out what it's protecting.\"" },
  { label: "Master = Window of Tolerance", note: "The Master fader is your real-time arousal dial. Pulling it to 40% keeps all parts proportional but reduces total system activation. Use it when the client is approaching their edge." },
];

function formatTime(seconds: number): string {
  const m = Math.floor(Math.abs(seconds) / 60);
  const s = Math.abs(seconds) % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function ProTipCard() {
  const [tipIndex, setTipIndex] = useState(() => Math.floor(Math.random() * PRO_TIPS.length));

  const nextTip = useCallback(() => {
    setTipIndex((prev) => (prev + 1) % PRO_TIPS.length);
  }, []);

  return (
    <div
      className="rounded-lg px-3 py-3 cursor-pointer group"
      onClick={nextTip}
      style={{
        background: "rgba(245,158,11,0.03)",
        border: "1px solid rgba(245,158,11,0.06)",
      }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="text-[9px] text-amber-500/40 uppercase tracking-wider font-semibold">
          Pro Tip
        </div>
        <div className="text-[8px] text-white/10 group-hover:text-white/25 transition-colors">
          tap for next
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.p
          key={tipIndex}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className="text-white/30 text-[11px] leading-relaxed"
          style={{ fontFamily: "Georgia, serif", fontStyle: "italic" }}
        >
          {PRO_TIPS[tipIndex]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

type NoteFormat = "simple" | "dap" | "soap";
const NOTE_FORMATS: { id: NoteFormat; label: string; desc: string }[] = [
  { id: "simple", label: "Simple", desc: "Bulleted parts list with volumes" },
  { id: "dap", label: "DAP Note", desc: "Data / Assessment / Plan" },
  { id: "soap", label: "SOAP Note", desc: "Subjective / Objective / Assessment / Plan" },
];

function CommandCenter() {
  const { showCommandCenter, setShowCommandCenter, uiGhosted, toggleUiGhosted, settings, session, channels, getSessionSummary, endSession, showClipboardToast } = useMixer();
  const [copied, setCopied] = useState(false);
  const [clipboardOpen, setClipboardOpen] = useState(false);
  const [previewFormat, setPreviewFormat] = useState<NoteFormat | null>(null);
  const [copiedFormat, setCopiedFormat] = useState<NoteFormat | null>(null);
  const clipboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!clipboardOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (clipboardRef.current && !clipboardRef.current.contains(e.target as Node)) {
        setClipboardOpen(false);
        setPreviewFormat(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [clipboardOpen]);

  const previewText = useMemo(() => {
    if (!previewFormat) return "";
    return getSessionSummary(previewFormat);
  }, [previewFormat, getSessionSummary, channels, session]);

  const handleCopyFormat = useCallback((format: NoteFormat) => {
    const summary = getSessionSummary(format);
    navigator.clipboard.writeText(summary).then(() => {
      setCopiedFormat(format);
      const label = NOTE_FORMATS.find((f) => f.id === format)?.label || format;
      showClipboardToast(label);
      setTimeout(() => { setCopiedFormat(null); }, 1500);
    });
  }, [getSessionSummary, showClipboardToast]);

  const handleClose = useCallback(() => {
    if (settings.audioEnabled) playDrawerClick();
    setShowCommandCenter(false);
  }, [setShowCommandCenter, settings.audioEnabled]);
  const [activeCategory, setActiveCategory] = useState<WhisperCategory>("Opening");
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<"countup" | "countdown">("countup");
  const [countdownStart, setCountdownStart] = useState(15 * 60);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!timerRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setTimerSeconds((prev) => {
        if (timerMode === "countup") return prev + 1;
        if (prev <= 0) {
          setTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerRunning, timerMode]);

  const handleResetTimer = useCallback(() => {
    setTimerRunning(false);
    setTimerSeconds(timerMode === "countdown" ? countdownStart : 0);
  }, [timerMode, countdownStart]);

  const handleModeToggle = useCallback(() => {
    setTimerRunning(false);
    if (timerMode === "countup") {
      setTimerMode("countdown");
      setTimerSeconds(countdownStart);
    } else {
      setTimerMode("countup");
      setTimerSeconds(0);
    }
  }, [timerMode, countdownStart]);

  const handleCountdownPreset = useCallback((minutes: number) => {
    setCountdownStart(minutes * 60);
    setTimerSeconds(minutes * 60);
    setTimerRunning(false);
  }, []);

  const isLowTime = timerMode === "countdown" && timerSeconds <= 120 && timerSeconds > 0;

  const filteredWhispers = WHISPERS.filter((w) => w.category === activeCategory);

  return (
    <AnimatePresence>
      {showCommandCenter && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex justify-start"
          onClick={handleClose}
        >
          <div
            className="absolute inset-0"
            style={{
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              background: "rgba(10,10,10,0.5)",
            }}
          />

          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="relative z-10 w-[320px] max-w-[85vw] h-full overflow-y-auto"
            style={{
              background: "rgba(22,22,24,0.95)",
              borderRight: "1px solid rgba(255,255,255,0.06)",
              boxShadow: "8px 0 30px rgba(0,0,0,0.4)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="sticky top-0 z-10 flex items-center justify-between px-5 py-4"
              style={{
                background: "rgba(22,22,24,0.98)",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <h3 className="text-white/60 text-xs font-semibold tracking-[0.2em] uppercase">
                Command Center
              </h3>
              <button
                onClick={handleClose}
                className="text-white/25 hover:text-white/50 transition-colors p-2 -mr-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-5 py-4 space-y-6" style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom, 16px))" }}>
              <div>
                <div className="text-[9px] text-white/20 uppercase tracking-[0.25em] font-semibold mb-3 pb-1" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  Session Timer
                </div>
                <div className="flex flex-col items-center gap-3">
                  <div className={`text-3xl font-mono tabular-nums tracking-wider transition-colors duration-500 ${isLowTime ? "text-amber-400" : "text-white/60"}`}>
                    {formatTime(timerSeconds)}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setTimerRunning(!timerRunning)} className="w-8 h-8 rounded-full flex items-center justify-center bg-white/[0.06] hover:bg-white/[0.12] text-white/40 hover:text-white/70 transition-colors">
                      {timerRunning ? <Pause size={12} /> : <Play size={12} />}
                    </button>
                    <button onClick={handleResetTimer} className="w-8 h-8 rounded-full flex items-center justify-center bg-white/[0.06] hover:bg-white/[0.12] text-white/40 hover:text-white/70 transition-colors">
                      <RotateCcw size={12} />
                    </button>
                    <button onClick={handleModeToggle} className="px-3 py-1.5 rounded text-[9px] uppercase tracking-wider bg-white/[0.06] hover:bg-white/[0.12] text-white/40 hover:text-white/70 transition-colors">
                      {timerMode === "countup" ? "Count Up" : "Countdown"}
                    </button>
                  </div>
                  {timerMode === "countdown" && (
                    <div className="flex gap-1.5">
                      {[5, 10, 15, 20, 25].map((m) => (
                        <button key={m} onClick={() => handleCountdownPreset(m)} className={`px-2 py-1 rounded text-[9px] transition-colors ${countdownStart === m * 60 ? "bg-amber-600/30 text-amber-300" : "bg-white/[0.04] text-white/25 hover:bg-white/[0.08] hover:text-white/50"}`}>
                          {m}m
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="text-[9px] text-white/20 uppercase tracking-[0.25em] font-semibold mb-3 pb-1" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  Client View
                </div>
                <button onClick={toggleUiGhosted} className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] transition-colors">
                  <div className="flex items-center gap-2">
                    {uiGhosted ? <EyeOff size={14} className="text-amber-400/60" /> : <Eye size={14} className="text-white/30" />}
                    <span className="text-[11px] text-white/50">{uiGhosted ? "UI Hidden (Client Mode)" : "UI Visible (Full Mode)"}</span>
                  </div>
                  <div className={`w-8 h-[18px] rounded-full relative transition-colors duration-200 ${uiGhosted ? "bg-amber-600/50" : "bg-white/[0.08]"}`}>
                    <div className={`absolute top-[2px] w-[14px] h-[14px] rounded-full transition-all duration-200 ${uiGhosted ? "left-[16px] bg-amber-400" : "left-[2px] bg-white/30"}`} />
                  </div>
                </button>
                <p className="text-[9px] text-white/15 mt-1.5 italic px-1" style={{ fontFamily: "Georgia, serif" }}>
                  Hides toolbar, settings, and labels. Only faders remain visible.
                </p>
              </div>

              {session && channels.length > 0 && (
                <div>
                  <div className="text-[9px] text-white/20 uppercase tracking-[0.25em] font-semibold mb-3 pb-1" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    Session Regulation
                  </div>
                  <div className="px-3 py-3 rounded-lg mb-3" style={{ background: "rgba(34,197,94,0.03)", border: "1px solid rgba(34,197,94,0.06)" }}>
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingDown size={12} className="text-green-400/40" />
                      <span className="text-[9px] text-white/25 uppercase tracking-wider font-semibold">System Load</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex justify-between text-[8px] text-white/20 mb-1"><span>Initial</span><span>{Math.round(session.initialChaos)}%</span></div>
                        <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${session.initialChaos}%`, background: "rgba(239,68,68,0.4)" }} />
                        </div>
                      </div>
                      <div className="text-white/15 text-[10px]">→</div>
                      <div className="flex-1">
                        <div className="flex justify-between text-[8px] text-white/20 mb-1"><span>Current</span><span>{Math.round(channels.reduce((s, c) => s + c.value, 0) / channels.length)}%</span></div>
                        <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${channels.reduce((s, c) => s + c.value, 0) / channels.length}%`, background: "rgba(34,197,94,0.4)" }} />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div ref={clipboardRef} className="relative mb-3">
                    <div className="text-[9px] text-white/20 uppercase tracking-[0.25em] font-semibold mb-2 pb-1 flex items-center gap-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <FileText size={10} className="text-white/15" />
                      Clinical Clipboard
                    </div>
                    <button
                      onClick={() => { setClipboardOpen(!clipboardOpen); setPreviewFormat(null); }}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <ClipboardCopy size={12} className="text-white/30" />
                        <span className="text-[10px] text-white/40 font-medium">Copy Notes</span>
                      </div>
                      <ChevronDown size={12} className={`text-white/20 transition-transform duration-200 ${clipboardOpen ? "rotate-180" : ""}`} />
                    </button>
                    <AnimatePresence mode="wait">
                      {clipboardOpen && !previewFormat && (
                        <motion.div
                          key="format-list"
                          initial={{ opacity: 0, height: 0, y: -4 }}
                          animate={{ opacity: 1, height: "auto", y: 0 }}
                          exit={{ opacity: 0, height: 0, y: -4 }}
                          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                          className="overflow-hidden mt-1.5"
                        >
                          <div className="rounded-lg overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
                            {NOTE_FORMATS.map((fmt, i) => (
                              <button
                                key={fmt.id}
                                onClick={() => setPreviewFormat(fmt.id)}
                                className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/[0.04] transition-colors text-left"
                                style={i < NOTE_FORMATS.length - 1 ? { borderBottom: "1px solid rgba(255,255,255,0.03)" } : undefined}
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="text-[10px] text-white/50 font-medium">{fmt.label}</div>
                                  <div className="text-[8px] text-white/20">{fmt.desc}</div>
                                </div>
                                <Eye size={10} className="text-white/15 shrink-0 ml-2" />
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                      {clipboardOpen && previewFormat && (
                        <motion.div
                          key="preview-pane"
                          initial={{ opacity: 0, height: 0, y: -4 }}
                          animate={{ opacity: 1, height: "auto", y: 0 }}
                          exit={{ opacity: 0, height: 0, y: -4 }}
                          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                          className="overflow-hidden mt-1.5"
                        >
                          <div className="rounded-lg overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
                            <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                              <button
                                onClick={() => setPreviewFormat(null)}
                                className="text-[9px] text-white/30 hover:text-white/50 transition-colors"
                              >
                                ← Back
                              </button>
                              <span className="text-[9px] text-white/25 font-semibold uppercase tracking-wider">
                                {NOTE_FORMATS.find((f) => f.id === previewFormat)?.label}
                              </span>
                              <button
                                onClick={() => handleCopyFormat(previewFormat)}
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[9px] font-medium transition-all"
                                style={copiedFormat === previewFormat
                                  ? { background: "rgba(34,197,94,0.15)", color: "rgba(134,239,172,0.8)" }
                                  : { background: "rgba(245,158,11,0.1)", color: "rgba(245,158,11,0.7)" }
                                }
                              >
                                {copiedFormat === previewFormat ? (
                                  <><Check size={10} /> Copied</>
                                ) : (
                                  <><ClipboardCopy size={10} /> Copy</>
                                )}
                              </button>
                            </div>
                            <div className="px-3 py-2.5 max-h-[200px] overflow-y-auto custom-scrollbar">
                              <pre className="text-[8px] text-white/35 leading-relaxed whitespace-pre-wrap break-words" style={{ fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', monospace" }}>
                                {previewText}
                              </pre>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <p className="text-[8px] text-white/10 italic px-1 mt-1.5" style={{ fontFamily: "Georgia, serif" }}>
                      Live preview from current faders. No client names stored — only part names.
                    </p>
                  </div>
                </div>
              )}

              {channels.length > 0 && (
                <div>
                  <button
                    onClick={() => { endSession(); setShowCommandCenter(false); }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg transition-all"
                    style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.12)" }}
                    data-testid="button-end-session"
                  >
                    <span className="text-[10px] text-indigo-300/50 font-medium uppercase tracking-wider">End Session</span>
                  </button>
                  <p className="text-[8px] text-white/10 italic px-1 mt-1" style={{ fontFamily: "Georgia, serif" }}>
                    Triggers the closing ceremony with a gentle sunset fade.
                  </p>
                </div>
              )}

              <div>
                <div className="text-[9px] text-white/20 uppercase tracking-[0.25em] font-semibold mb-3 pb-1" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  Session Whispers
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {WHISPER_CATEGORIES.map((cat) => (
                    <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-2.5 py-1.5 rounded-full text-[8px] tracking-wider transition-all ${activeCategory === cat ? "bg-amber-600/25 text-amber-300 ring-1 ring-amber-600/30" : "bg-white/[0.04] text-white/25 hover:bg-white/[0.08] hover:text-white/50"}`}>
                      {cat}
                    </button>
                  ))}
                </div>
                <div className="space-y-2">
                  {filteredWhispers.map((w, i) => (
                    <div key={i} className="px-3 py-3 rounded-lg" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.03)" }}>
                      {w.tag && (
                        <div className="text-[8px] uppercase tracking-[0.15em] font-semibold mb-1.5" style={{ color: w.tag.includes("Humor") ? "rgba(236,72,153,0.5)" : "rgba(245,158,11,0.35)" }}>
                          {w.tag}
                        </div>
                      )}
                      <p className="text-white/45 text-[11px] leading-relaxed" style={{ fontFamily: "Georgia, serif", fontStyle: "italic" }}>
                        {w.prompt}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[9px] text-white/20 uppercase tracking-[0.25em] font-semibold mb-3 pb-1" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  Board Techniques
                </div>
                <div className="space-y-2">
                  {TECHNIQUE_NOTES.map((t, i) => (
                    <div key={i} className="px-3 py-2.5 rounded-lg" style={{ background: "rgba(99,179,237,0.02)", border: "1px solid rgba(99,179,237,0.05)" }}>
                      <div className="text-[9px] text-blue-300/40 font-semibold tracking-wider uppercase mb-1">{t.label}</div>
                      <p className="text-white/30 text-[10px] leading-relaxed">{t.note}</p>
                    </div>
                  ))}
                </div>
              </div>

              <ProTipCard />

              <div className="pb-6">
                <p className="text-white/10 text-[9px] leading-relaxed italic text-center" style={{ fontFamily: "Georgia, serif" }}>
                  These prompts are visible only to you. Your client cannot see the Command Center.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


function ToolbarButton({
  onClick,
  title,
  children,
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      onClick={onClick}
      className="w-10 h-10 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-white/35 hover:text-white/60 hover:bg-white/[0.06] transition-colors"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.93 }}
      title={title}
    >
      {children}
    </motion.button>
  );
}


const VOLUME_MIXER_CSS = `
[data-volume-mixer-root]{position:fixed;inset:0;width:100vw;height:100vh;overflow:hidden;background:#121212;color:#e5e5e5;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;-webkit-tap-highlight-color:transparent}
[data-volume-mixer-root] *{box-sizing:border-box}
[data-volume-mixer-root] ::selection{background:rgba(245,158,11,0.3);color:white}
[data-volume-mixer-root] ::-webkit-scrollbar{width:4px}
[data-volume-mixer-root] ::-webkit-scrollbar-track{background:transparent}
[data-volume-mixer-root] ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.06);border-radius:2px}
[data-volume-mixer-root] ::-webkit-scrollbar-thumb:hover{background:rgba(255,255,255,0.12)}
.film-grain{position:absolute;inset:0;pointer-events:none;z-index:1;opacity:0.04;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");background-repeat:repeat;background-size:256px 256px}
input[type="range"],.settings-slider{-webkit-appearance:none;appearance:none;outline:none;height:3px;border-radius:2px;background:rgba(255,255,255,0.06);cursor:pointer}
input[type="range"]::-webkit-slider-thumb,.settings-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:12px;height:12px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#6b7280,#3b3b42);border:1px solid rgba(255,255,255,0.12);cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,0.5);transition:transform 0.15s ease}
input[type="range"]::-webkit-slider-thumb:hover,.settings-slider::-webkit-slider-thumb:hover{transform:scale(1.15)}
input[type="range"]::-moz-range-thumb,.settings-slider::-moz-range-thumb{width:12px;height:12px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#6b7280,#3b3b42);border:1px solid rgba(255,255,255,0.12);cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,0.5)}
input[type="range"]::-moz-range-track,.settings-slider::-moz-range-track{height:3px;border-radius:2px;background:rgba(255,255,255,0.06)}
.pull-tab{position:fixed;left:0;top:50%;transform:translateY(-50%);z-index:40;width:28px;height:140px;cursor:pointer;display:flex;align-items:center;justify-content:center;border-radius:0 6px 6px 0;background:linear-gradient(180deg,rgba(60,58,64,0.9) 0%,rgba(40,38,44,0.95) 50%,rgba(30,28,34,0.9) 100%);border:1px solid rgba(255,255,255,0.08);border-left:none;box-shadow:2px 0 12px rgba(0,0,0,0.4),inset 1px 0 0 rgba(255,255,255,0.06);transition:all 0.3s ease}
.pull-tab:hover{width:34px;background:linear-gradient(180deg,rgba(70,68,74,0.95) 0%,rgba(50,48,54,0.98) 50%,rgba(35,33,39,0.95) 100%);box-shadow:2px 0 16px rgba(0,0,0,0.5),inset 1px 0 0 rgba(255,255,255,0.1),0 0 20px rgba(245,158,11,0.08)}
.pull-tab-text{writing-mode:vertical-rl;text-orientation:mixed;font-size:8px;font-weight:600;letter-spacing:0.2em;color:rgba(255,255,255,0.25);text-transform:uppercase;font-family:'Courier New',monospace;transition:color 0.3s ease;user-select:none}
.pull-tab:hover .pull-tab-text{color:rgba(255,255,255,0.5)}
@keyframes turbulence{0%{transform:translate(0,0)}33%{transform:translate(-1px,1px)}66%{transform:translate(1px,-1px)}100%{transform:translate(0,0)}}
@keyframes redZonePulse{0%,100%{opacity:0.6}50%{opacity:1}}
@keyframes sparkle-burst{0%{transform:translate(-50%,-50%) scale(0);opacity:1}50%{opacity:0.8}100%{transform:translate(-50%,-50%) scale(2.5);opacity:0}}
@keyframes wiggle{0%,100%{transform:rotate(0deg)}25%{transform:rotate(-3deg)}75%{transform:rotate(3deg)}}
.wiggle-anim{animation:wiggle 0.3s ease-in-out}
@keyframes vu-glow{0%,100%{filter:brightness(1)}50%{filter:brightness(1.3)}}
@keyframes aha-pulse{0%,100%{transform:scale(1);opacity:0.6}50%{transform:scale(1.04);opacity:1}}
.aha-fader-pulse{animation:aha-pulse 1.5s ease-in-out infinite}
.fader-strip{--strip-w:72px;--track-w:12px;--track-h:200px;--cap-w:32px;--cap-h:18px;--housing-px:8px;--housing-py:12px;width:var(--strip-w)}
.fader-strip[data-master="true"]{--strip-w:80px;--track-w:14px;--track-h:220px;--cap-w:38px;--cap-h:22px}
.fader-housing{padding:var(--housing-py) var(--housing-px)}
.fader-track{width:var(--track-w);height:var(--track-h)}
.fader-cap-wrap{width:var(--cap-w);height:var(--cap-h)}
.solo-btn{padding:4px 12px}
@media(min-width:480px){.fader-strip{--strip-w:84px;--track-w:14px;--track-h:260px;--cap-w:36px;--cap-h:20px;--housing-px:10px;--housing-py:14px}.fader-strip[data-master="true"]{--strip-w:96px;--track-w:16px;--track-h:280px;--cap-w:42px;--cap-h:24px}}
@media(min-width:768px){.fader-strip{--strip-w:100px;--track-w:16px;--track-h:320px;--cap-w:40px;--cap-h:22px;--housing-px:12px;--housing-py:16px}.fader-strip[data-master="true"]{--strip-w:110px;--track-w:18px;--track-h:340px;--cap-w:46px;--cap-h:26px}}
@media(min-width:1024px){.fader-strip{--strip-w:110px;--track-w:16px;--track-h:360px;--cap-w:42px;--cap-h:24px;--housing-px:14px;--housing-py:18px}.fader-strip[data-master="true"]{--strip-w:120px;--track-w:18px;--track-h:380px;--cap-w:48px;--cap-h:28px}}
@media(max-height:600px){.fader-strip{--track-h:160px;--housing-py:8px}.fader-strip[data-master="true"]{--track-h:180px}}
@media(max-height:500px){.fader-strip{--track-h:120px;--housing-py:6px}.fader-strip[data-master="true"]{--track-h:140px}}
.fader-strip[draggable="true"]{cursor:grab}
.fader-strip[draggable="true"]:active{cursor:grabbing}
.fader-strip.drag-over{border-left:2px solid rgba(245,158,11,0.4)}
`;

export function VolumeMixer() {
  useEffect(() => {
    const existing = document.querySelector('style[data-volume-mixer]');
    if (existing) return;
    const style = document.createElement("style");
    style.setAttribute("data-volume-mixer", "");
    style.textContent = VOLUME_MIXER_CSS;
    document.head.appendChild(style);
  }, []);

  const {
    channels,
    masterIntensity,
    isResetting,
    globalReset,
    setShowGhostMenu,
    setShowSettings,
    setShowCommandCenter,
    showCommandCenter,
    showTutorial,
    setShowTutorial,
    tutorialCompleted,
    isFullscreen,
    toggleFullscreen,
    introComplete,
    globalMuted,
    toggleGlobalMute,
    uiGhosted,
    systemPaused,
    toggleSystemPause,
    settings,
    reorderChannel,
    session,
    sessionEnded,
    calmRestoredVisible,
    clipboardToast,
  } = useMixer();

  const theme = COLOR_THEMES[settings.colorTheme];

  const mixerRef = useRef<HTMLDivElement>(null);
  const lastDoubleClick = useRef(0);
  const prevChannelIds = useRef<Set<string>>(new Set());

  const systemEnergy = useMemo(() => {
    if (channels.length === 0) return 0;
    const avg = channels.reduce((sum, ch) => sum + ch.value, 0) / channels.length;
    return avg * (masterIntensity / 100);
  }, [channels, masterIntensity]);

  useEffect(() => {
    if (sessionEnded) return;
    const avgIntensity =
      channels.length > 0
        ? channels.reduce((sum, ch) => sum + ch.value, 0) / channels.length
        : 0;
    if (settings.audioEnabled && !globalMuted) {
      updateDrone(avgIntensity, settings.masterPitch, masterIntensity, settings.textureMix);
    }
  }, [channels, settings.masterPitch, settings.audioEnabled, settings.textureMix, masterIntensity, globalMuted, sessionEnded]);

  useEffect(() => {
    if (sessionEnded) return;
    if (globalMuted || systemPaused) {
      emergencySilence();
    } else if (settings.audioEnabled) {
      resumeAudio();
    }
  }, [globalMuted, systemPaused, settings.audioEnabled, sessionEnded]);

  useEffect(() => {
    if (!settings.audioEnabled || sessionEnded) return;
    const totalChannels = channels.length;
    channels.forEach((ch, index) => {
      const panValue = totalChannels <= 1 ? 0 : (index / (totalChannels - 1)) * 2 - 1;
      updateChannelPan(ch.id, panValue, ch.value * (masterIntensity / 100), ch.texture);
    });

    const currentIds = new Set(channels.map((ch) => ch.id));
    prevChannelIds.current.forEach((id) => {
      if (!currentIds.has(id)) {
        removeChannelAudio(id);
      }
    });
    prevChannelIds.current = currentIds;
  }, [channels, masterIntensity, settings.audioEnabled, sessionEnded]);

  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, []);

  useEffect(() => {
    if (channels.length === 1 && !tutorialCompleted && !showTutorial) {
      setShowTutorial(true);
    }
  }, [channels.length, tutorialCompleted, showTutorial, setShowTutorial]);

  useEffect(() => {
    const handleFsChange = () => {
      const { isFullscreen: storeFs } = useMixer.getState();
      const actualFs = !!document.fullscreenElement;
      if (storeFs !== actualFs) {
        useMixer.setState({ isFullscreen: actualFs });
      }
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        toggleGlobalMute();
      }
      if (e.key === "p" || e.key === "P") {
        e.preventDefault();
        toggleSystemPause();
      }
    };
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [toggleGlobalMute, toggleSystemPause]);

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest("button, [data-no-reset]")) return;
      const now = Date.now();
      if (now - lastDoubleClick.current < 500) return;
      lastDoubleClick.current = now;
      if (channels.length > 0) {
        globalReset();
      }
    },
    [channels.length, globalReset]
  );

  const handleSnapshot = useCallback(async () => {
    if (!mixerRef.current) return;
    const toolbar = document.getElementById("mixer-toolbar");
    const header = document.getElementById("mixer-header");
    const masterDiv = document.getElementById("master-fader-section");
    const snapshotEls = document.querySelectorAll("[data-snapshot-hide]");

    if (toolbar) toolbar.style.display = "none";
    if (header) header.style.display = "none";
    if (masterDiv) masterDiv.style.display = "none";
    snapshotEls.forEach((el) => ((el as HTMLElement).style.display = "none"));

    try {
      const boardCanvas = await html2canvas(mixerRef.current, {
        backgroundColor: theme.bg,
        scale: 2,
      });

      const { session: sess } = useMixer.getState();
      const currentChannels = useMixer.getState().channels;
      const currentChaos = currentChannels.length > 0
        ? currentChannels.reduce((sum, ch) => sum + ch.value, 0) / currentChannels.length
        : 0;

      const panelHeight = 260;
      const finalCanvas = document.createElement("canvas");
      finalCanvas.width = boardCanvas.width;
      finalCanvas.height = boardCanvas.height + panelHeight;
      const ctx = finalCanvas.getContext("2d")!;

      ctx.fillStyle = theme.bg;
      ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

      ctx.drawImage(boardCanvas, 0, 0);

      const panelY = boardCanvas.height;
      const pw = finalCanvas.width;
      const px = 40;

      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px, panelY + 10);
      ctx.lineTo(pw - px, panelY + 10);
      ctx.stroke();

      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.font = "italic 22px Georgia, serif";
      ctx.textAlign = "left";
      ctx.fillText("Session Reflection", px, panelY + 42);

      const dateStr = new Date().toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric",
      });
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      ctx.font = "11px 'Courier New', monospace";
      ctx.textAlign = "right";
      ctx.fillText(dateStr, pw - px, panelY + 42);

      if (sess) {
        const barY = panelY + 65;
        const barW = 200;
        const barH = 12;

        ctx.fillStyle = "rgba(255,255,255,0.2)";
        ctx.font = "9px 'Courier New', monospace";
        ctx.textAlign = "left";
        ctx.fillText("INITIAL SYSTEM LOAD", px, barY - 4);
        ctx.fillStyle = "rgba(255,255,255,0.04)";
        ctx.fillRect(px, barY, barW, barH);
        ctx.fillStyle = "rgba(239,68,68,0.5)";
        ctx.fillRect(px, barY, barW * (sess.initialChaos / 100), barH);
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.font = "bold 10px 'Courier New', monospace";
        ctx.fillText(`${Math.round(sess.initialChaos)}%`, px + barW + 10, barY + 10);

        const bar2Y = barY + 32;
        ctx.fillStyle = "rgba(255,255,255,0.2)";
        ctx.font = "9px 'Courier New', monospace";
        ctx.fillText("CURRENT HARMONY", px, bar2Y - 4);
        ctx.fillStyle = "rgba(255,255,255,0.04)";
        ctx.fillRect(px, bar2Y, barW, barH);
        ctx.fillStyle = "rgba(34,197,94,0.5)";
        ctx.fillRect(px, bar2Y, barW * (currentChaos / 100), barH);
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.font = "bold 10px 'Courier New', monospace";
        ctx.fillText(`${Math.round(currentChaos)}%`, px + barW + 10, bar2Y + 10);

        const shiftY = barY;
        const shiftX = pw / 2 + 20;
        ctx.fillStyle = "rgba(245,158,11,0.25)";
        ctx.font = "9px 'Courier New', monospace";
        ctx.textAlign = "left";
        ctx.fillText("KEY SHIFTS", shiftX, shiftY - 4);

        sess.initialParts.forEach((ip, i) => {
          const current = currentChannels.find((ch) => ch.name === ip.name);
          if (!current) return;
          const y = shiftY + 14 + i * 16;
          const change = current.value - ip.value;
          const arrow = change < -5 ? "↓" : change > 5 ? "↑" : "→";
          const color = change < -5 ? "rgba(34,197,94,0.5)" : change > 5 ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.15)";
          ctx.fillStyle = color;
          ctx.font = "10px 'Courier New', monospace";
          ctx.fillText(`${arrow} ${ip.name}: ${ip.value}% → ${Math.round(current.value)}%`, shiftX, y);
        });
      }

      ctx.fillStyle = "rgba(255,255,255,0.12)";
      ctx.font = "italic 11px Georgia, serif";
      ctx.textAlign = "left";
      ctx.fillText("One thing I learned about my parts today: ___________________________________", px, panelY + 180);

      ctx.fillStyle = "rgba(245,158,11,0.2)";
      ctx.font = "italic 10px Georgia, serif";
      ctx.fillText("This week: when a part gets loud, just name it. \"That's my Protector at 80 right now.\"", px, panelY + 210);
      ctx.fillText("You don't have to change it. Naming it is the intervention.", px, panelY + 226);

      ctx.fillStyle = "rgba(255,255,255,0.08)";
      ctx.font = "9px Georgia, serif";
      ctx.textAlign = "right";
      ctx.fillText("The Volume Mixer — Internal Landscape", pw - px, panelY + panelHeight - 10);

      const url = finalCanvas.toDataURL("image/png");
      const w = window.open();
      if (w) {
        w.document.write(
          `<html><head><title>Volume Mixer — Session Reflection</title><style>body{margin:0;background:#000;display:flex;align-items:center;justify-content:center;min-height:100vh;}img{max-width:100%;max-height:100vh;}</style></head><body><img src="${url}" /></body></html>`
        );
      }
    } finally {
      if (toolbar) toolbar.style.display = "";
      if (header) header.style.display = "";
      if (masterDiv) masterDiv.style.display = "";
      snapshotEls.forEach((el) => ((el as HTMLElement).style.display = ""));
    }
  }, [theme]);

  const handleAddClick = useCallback(() => {
    initAudio();
    setShowGhostMenu(true);
  }, [setShowGhostMenu]);

  const handleOpenCommandCenter = useCallback(() => {
    if (settings.audioEnabled) playDrawerClick();
    setShowCommandCenter(true);
  }, [setShowCommandCenter, settings.audioEnabled]);

  const isEmpty = channels.length === 0;
  const masterScale = masterIntensity / 100;

  const [sunsetPhase, setSunsetPhase] = useState<"idle" | "fading" | "message">("idle");

  useEffect(() => {
    if (!sessionEnded || sunsetPhase !== "idle") return;
    setSunsetPhase("fading");
    const fadeTimer = setTimeout(() => {
      setSunsetPhase("message");
    }, 3000);
    return () => clearTimeout(fadeTimer);
  }, [sessionEnded, sunsetPhase]);

  const prevRedZoneParts = useRef<Set<string>>(new Set());
  const wasPaused = useRef(false);

  useEffect(() => {
    if (systemPaused) {
      wasPaused.current = true;
      channels.forEach((ch) => {
        if (ch.value > 85) prevRedZoneParts.current.add(ch.id);
      });
    } else if (wasPaused.current && prevRedZoneParts.current.size > 0) {
      const restored = channels.some(
        (ch) => prevRedZoneParts.current.has(ch.id) && ch.value < 50
      );
      if (restored) {
        useMixer.getState().showCalmRestored();
      }
      prevRedZoneParts.current.clear();
      wasPaused.current = false;
    }
  }, [systemPaused, channels]);

  const idleQuips = useMemo(() => {
    if (isEmpty) return [];
    const quips = [
      "Your inner committee is in session",
      "Vibes: carefully calibrated",
      "Professional overthinker at work",
      "Herding internal cats since 2024",
      "Emotional DJ booth: ACTIVE",
      "Inner boardroom: heated debate",
      "Feelings: being felt (reluctantly)",
      "Existential mixing in progress...",
      "Your parts called - they want snacks",
      "Therapeutic chaos: organized",
    ];
    if (systemEnergy > 70) {
      quips.push("Things are getting SPICY in here", "Someone turn the volume down on life", "Your inner world chose violence today");
    }
    if (systemEnergy < 20) {
      quips.push("Is anyone even in here?", "Your parts are on coffee break", "Low energy mode: napping permitted");
    }
    if (globalMuted) {
      quips.push("Shhhh... we're hiding", "Silent mode: peak introvert energy");
    }
    return quips;
  }, [isEmpty, systemEnergy, globalMuted]);

  const [currentQuip, setCurrentQuip] = useState(0);
  useEffect(() => {
    if (idleQuips.length === 0) return;
    const interval = setInterval(() => {
      setCurrentQuip(prev => (prev + 1) % idleQuips.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [idleQuips.length]);

  return (
    <div data-volume-mixer-root="" style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", overflow: "hidden", background: "#121212", color: "#e5e5e5" }}>
      <CrtIntro />
      <div
        ref={mixerRef}
        className="relative w-full h-full flex flex-col overflow-hidden"
        style={{ background: theme.bg, transition: "background 0.5s ease" }}
        onDoubleClick={handleDoubleClick}
      >
        <div className="film-grain" style={{ opacity: theme.grain }} />

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 40%, rgba(35,33,38,0.6) 0%, transparent 70%)",
          }}
        />

        {introComplete && !isEmpty && (
          <>
            <ParticleField energy={systemEnergy} />
            <WaveformVisualizer energy={systemEnergy} />
            <MoodArc energy={systemEnergy} />
          </>
        )}

        {globalMuted && (
          <div
            className="absolute inset-0 pointer-events-none z-[3] transition-all duration-500"
            style={{
              background: "radial-gradient(ellipse at 50% 50%, rgba(20,80,80,0.08) 0%, transparent 70%)",
            }}
          />
        )}

        <motion.div
          className="absolute inset-0 pointer-events-none z-[2]"
          animate={
            isResetting
              ? {
                  filter: ["grayscale(0)", "grayscale(1)", "grayscale(0)"],
                  transition: { duration: 2, ease: "easeInOut" },
                }
              : { filter: "grayscale(0)" }
          }
        />

        {introComplete && !showCommandCenter && (
          <div
            className="pull-tab"
            onClick={handleOpenCommandCenter}
            data-snapshot-hide
          >
            <span className="pull-tab-text">CLINICIAN TOOLS</span>
          </div>
        )}

        <AnimatePresence>
          {introComplete && (
            <motion.div
              id="mixer-header"
              className="relative z-20 flex items-center justify-between px-4 py-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-2" data-snapshot-hide>
                {!isEmpty && idleQuips.length > 0 && (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentQuip}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.4 }}
                      className="text-[10px] text-white/15 italic tracking-wide font-mono"
                      style={{ fontFamily: "'Courier New', monospace" }}
                    >
                      {idleQuips[currentQuip % idleQuips.length]}
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>

              <div className="flex items-center gap-1">
                <AnimatePresence>
                  {calmRestoredVisible && (
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="text-[9px] text-green-400/50 tracking-wider uppercase font-medium mr-2"
                    >
                      Calm Restored
                    </motion.div>
                  )}
                </AnimatePresence>

                {!isEmpty && (
                  <motion.button
                    onClick={() => {
                      toggleGlobalMute();
                    }}
                    className={`p-2 transition-colors relative ${
                      globalMuted
                        ? "text-red-400/70 hover:text-red-400"
                        : "text-white/20 hover:text-white/50"
                    }`}
                    title={globalMuted ? "Unmute (M)" : "Mute All (M)"}
                    data-snapshot-hide
                  >
                    {globalMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </motion.button>
                )}
                <button
                  onClick={toggleFullscreen}
                  className="p-2 text-white/20 hover:text-white/50 transition-colors"
                  title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                  data-snapshot-hide
                >
                  {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {introComplete && !isEmpty && (
            <motion.div
              className="relative z-30 flex justify-center py-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              data-snapshot-hide
            >
              <motion.button
                onClick={toggleSystemPause}
                className="flex items-center gap-2.5 px-5 py-2.5 rounded-full transition-all"
                style={{
                  background: systemPaused
                    ? "rgba(245,158,11,0.12)"
                    : `rgba(${systemEnergy > 70 ? "239,68,68" : systemEnergy > 40 ? "245,158,11" : "34,197,94"},0.06)`,
                  border: `1px solid ${systemPaused
                    ? "rgba(245,158,11,0.3)"
                    : `rgba(${systemEnergy > 70 ? "239,68,68" : systemEnergy > 40 ? "245,158,11" : "34,197,94"},0.12)`}`,
                  boxShadow: systemPaused
                    ? "0 0 20px rgba(245,158,11,0.1)"
                    : "none",
                }}
                animate={systemPaused ? {
                  boxShadow: [
                    "0 0 20px rgba(245,158,11,0.08)",
                    "0 0 30px rgba(245,158,11,0.18)",
                    "0 0 20px rgba(245,158,11,0.08)",
                  ],
                } : {}}
                transition={systemPaused ? { repeat: Infinity, duration: 2, ease: "easeInOut" } : {}}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                title={systemPaused ? "Resume (P)" : "Pause System (P)"}
              >
                {systemPaused ? (
                  <Play size={16} className="text-amber-400/80" />
                ) : (
                  <Pause size={16} style={{
                    color: systemEnergy > 70
                      ? "rgba(239,68,68,0.6)"
                      : systemEnergy > 40
                      ? "rgba(245,158,11,0.5)"
                      : "rgba(34,197,94,0.4)",
                  }} />
                )}
                <span className="text-[10px] uppercase tracking-[0.2em] font-semibold" style={{
                  color: systemPaused ? "rgba(245,158,11,0.8)" : "rgba(255,255,255,0.3)",
                }}>
                  {systemPaused ? "Resume" : "Pause"}
                </span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {systemPaused && (
            <motion.div
              className="absolute inset-0 z-[25] pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              style={{
                background: "rgba(10,10,12,0.35)",
                backdropFilter: "blur(2px) saturate(0.4)",
                WebkitBackdropFilter: "blur(2px) saturate(0.4)",
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div
                    className="text-[10px] uppercase tracking-[0.4em] font-semibold mb-1"
                    style={{ color: "rgba(245,158,11,0.4)" }}
                  >
                    System Paused
                  </div>
                  <div
                    className="text-[9px] text-white/15 italic"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    Take a breath. Press P or tap Resume when ready.
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 flex items-center justify-center relative z-10">
          <AnimatePresence mode="wait">
            {!introComplete ? null : isEmpty ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center gap-6"
              >
                <div className="flex items-center gap-4 sm:gap-6 mb-4 opacity-[0.08]">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="flex flex-col items-center gap-2"
                    >
                      <div
                        className="w-[56px] sm:w-[72px] rounded-lg"
                        style={{
                          height: "280px",
                          border: "1.5px dashed rgba(255,255,255,0.25)",
                          background: "transparent",
                        }}
                      />
                      <div
                        className="w-[48px] sm:w-[64px] h-5 rounded-sm"
                        style={{
                          border: "1px dashed rgba(255,255,255,0.2)",
                        }}
                      />
                    </div>
                  ))}
                </div>

                <motion.button
                  onClick={handleAddClick}
                  className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{
                    background: "rgba(245,158,11,0.06)",
                    border: "1px solid rgba(245,158,11,0.12)",
                  }}
                  animate={{
                    boxShadow: [
                      "0 0 20px rgba(245,158,11,0.08)",
                      "0 0 50px rgba(245,158,11,0.2)",
                      "0 0 20px rgba(245,158,11,0.08)",
                    ],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 3,
                    ease: "easeInOut",
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus size={32} className="text-amber-500/60" />
                </motion.button>

                <div
                  className="relative px-4 py-2 rounded-sm max-w-[320px]"
                  style={{
                    background: "linear-gradient(180deg, #e8e4dc, #dbd7cf)",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.5)",
                    transform: "rotate(-0.5deg)",
                  }}
                >
                  <p
                    className="text-gray-700/70 text-[11px] text-center leading-relaxed"
                    style={{ fontFamily: "'Courier New', monospace" }}
                  >
                    Your inner world is suspiciously quiet.
                  </p>
                  <p
                    className="text-gray-500/50 text-[9px] text-center mt-1 leading-relaxed"
                    style={{ fontFamily: "'Courier New', monospace" }}
                  >
                    Tap + to invite someone to the party.
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="mixer"
                initial={{ opacity: 0 }}
                animate={{ opacity: globalMuted ? Math.max(masterScale * 0.5, 0.3) : Math.max(masterScale, 0.3) }}
                exit={{ opacity: 0 }}
                className={`flex items-end justify-center gap-3 sm:gap-4 md:gap-5 px-2 sm:px-4 md:px-6 w-full transition-all duration-500 ${
                  globalMuted ? "muted-board" : ""
                }`}
                data-no-reset
                style={{
                  filter: globalMuted ? "saturate(0.3) hue-rotate(140deg)" : "none",
                  transition: "filter 0.5s ease",
                  maxWidth: "1200px",
                  overflowX: "auto",
                  overflowY: "visible",
                  WebkitOverflowScrolling: "touch",
                }}
              >
                <div className="flex items-end gap-3 sm:gap-4 md:gap-5 justify-center min-w-fit relative">
                  <ChannelHalos channels={channels} masterIntensity={masterIntensity} />
                  <ChannelArcs channels={channels} masterIntensity={masterIntensity} />
                  {channels.map((ch, idx) => (
                    <Fader
                      key={ch.id}
                      channelId={ch.id}
                      name={ch.name}
                      value={ch.value}
                      isSoloed={ch.isSoloed}
                      isWiseSelf={ch.isWiseSelf}
                      magnetBroken={ch.magnetBroken}
                      channelCount={channels.length}
                      texture={ch.texture}
                      index={idx}
                      onDragReorder={reorderChannel}
                    />
                  ))}
                </div>

                <div
                  id="master-fader-section"
                  className="flex-shrink-0 ml-2 sm:ml-4 pl-3 sm:pl-5"
                  style={{
                    borderLeft: "2px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <Fader
                    channelId="__master__"
                    name="Master"
                    value={masterIntensity}
                    isSoloed={false}
                    isWiseSelf={false}
                    magnetBroken={false}
                    channelCount={channels.length}
                    isMaster
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {!isEmpty && !uiGhosted && introComplete && (
            <motion.div
              id="mixer-toolbar"
              className="relative z-30 flex items-center justify-center pt-2"
              style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom, 16px))" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ delay: 0.2 }}
            >
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-full"
                style={{
                  background: theme.surfaceHover,
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  border: `1px solid ${theme.border}`,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                }}
              >
                <div className="flex items-center gap-1.5 px-1" title={`System energy: ${Math.round(systemEnergy)}%`}>
                  <Activity size={12} className="text-white/20" />
                  <div className="flex gap-[2px] items-end h-4">
                    {Array.from({ length: 8 }).map((_, i) => {
                      const threshold = (i + 1) * 12.5;
                      const lit = systemEnergy >= threshold;
                      const color = i >= 6 ? "#ef4444" : i >= 4 ? "#f59e0b" : "#22c55e";
                      return (
                        <motion.div
                          key={i}
                          className="rounded-[1px]"
                          style={{
                            width: "3px",
                            height: `${40 + i * 8}%`,
                            background: lit ? color : "rgba(255,255,255,0.06)",
                            boxShadow: lit ? `0 0 4px ${color}40` : "none",
                          }}
                          animate={lit ? { opacity: [0.8, 1, 0.8] } : { opacity: 0.4 }}
                          transition={lit ? { repeat: Infinity, duration: 1.5, ease: "easeInOut" } : {}}
                        />
                      );
                    })}
                  </div>
                </div>

                <div className="w-px h-4 bg-white/[0.06]" />

                <ToolbarButton onClick={handleAddClick} title="Add part">
                  <Plus size={16} />
                </ToolbarButton>

                <div className="w-px h-4 bg-white/[0.06]" />

                <ToolbarButton onClick={handleSnapshot} title="Snapshot">
                  <Camera size={16} />
                </ToolbarButton>

                <ToolbarButton onClick={() => setShowSettings(true)} title="Calibration">
                  <Settings size={14} />
                </ToolbarButton>

                <PresetMenu />

                {!tutorialCompleted && (
                  <>
                    <div className="w-px h-4 bg-white/[0.06]" />
                    <ToolbarButton onClick={() => setShowTutorial(true)} title="Guide">
                      <HelpCircle size={14} />
                    </ToolbarButton>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <GhostMenu />
        <SettingsPanel />
        <GhostGuide />
        <CommandCenter />

        <AnimatePresence>
          {clipboardToast && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] pointer-events-none"
            >
              <div
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl shadow-2xl"
                style={{
                  background: "rgba(22,22,24,0.95)",
                  border: "1px solid rgba(245,158,11,0.15)",
                  backdropFilter: "blur(20px)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.03)",
                }}
              >
                <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "rgba(34,197,94,0.15)" }}>
                  <Check size={11} className="text-green-400" />
                </div>
                <span className="text-[11px] text-white/60 font-medium">
                  {clipboardToast} copied to clipboard
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {sunsetPhase !== "idle" && (
            <motion.div
              className="absolute inset-0 z-[60] flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: sunsetPhase === "fading" ? 5 : 0.5 }}
              style={{
                background: sunsetPhase === "message"
                  ? "linear-gradient(180deg, #0a0a1a 0%, #0d0825 30%, #120a2e 60%, #0a0a1a 100%)"
                  : "linear-gradient(180deg, rgba(10,10,26,0) 0%, rgba(13,8,37,0.6) 30%, rgba(18,10,46,0.7) 60%, rgba(10,10,26,0) 100%)",
                transition: "background 5s ease",
              }}
            >
              {sunsetPhase === "fading" && (
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.4, 0.6, 0.3] }}
                  transition={{ duration: 5, ease: "easeInOut" }}
                >
                  <div className="text-[10px] text-indigo-300/30 uppercase tracking-[0.4em]">
                    Settling...
                  </div>
                </motion.div>
              )}

              {sunsetPhase === "message" && (
                <motion.div
                  className="text-center max-w-md mx-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.5, delay: 0.3 }}
                >
                  <p
                    className="text-white/40 text-lg leading-relaxed mb-6"
                    style={{ fontFamily: "Georgia, serif", fontStyle: "italic" }}
                  >
                    "You have found clarity in the noise.<br />
                    Take this peace with you."
                  </p>

                  <div className="w-16 h-px bg-white/[0.08] mx-auto mb-6" />

                  <p className="text-white/15 text-[10px] tracking-wider uppercase mb-8">
                    Session Complete
                  </p>

                  <motion.button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2.5 rounded-lg text-[10px] uppercase tracking-[0.2em] transition-all"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "rgba(255,255,255,0.3)",
                    }}
                    whileHover={{
                      background: "rgba(255,255,255,0.08)",
                      color: "rgba(255,255,255,0.5)",
                    }}
                  >
                    New Session
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
