import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from "react";

export interface AccentPreset {
  id: string;
  name: string;
  primary: string;
  accent: string;
  swatch: string;
  swatchSecondary: string;
  secondary: string;
  muted: string;
  mutedForeground: string;
  border: string;
  card: string;
}

export const accentPresets: AccentPreset[] = [
  {
    id: "sage",
    name: "Sage & Terracotta",
    primary: "145 22% 38%",
    accent: "15 45% 62%",
    swatch: "#4A7A56",
    swatchSecondary: "#C8836A",
    secondary: "35 25% 93%",
    muted: "35 15% 93%",
    mutedForeground: "160 8% 45%",
    border: "35 15% 88%",
    card: "40 25% 99%",
  },
  {
    id: "ocean",
    name: "Soft Teal & Sand",
    primary: "175 30% 35%",
    accent: "35 35% 60%",
    swatch: "#3E8C8C",
    swatchSecondary: "#C4A46A",
    secondary: "175 12% 93%",
    muted: "175 8% 93%",
    mutedForeground: "175 8% 45%",
    border: "175 8% 88%",
    card: "175 10% 99%",
  },
  {
    id: "lavender",
    name: "Lavender & Sage",
    primary: "260 20% 45%",
    accent: "145 20% 50%",
    swatch: "#7B6BA0",
    swatchSecondary: "#6B9F75",
    secondary: "260 12% 94%",
    muted: "260 8% 93%",
    mutedForeground: "260 8% 45%",
    border: "260 8% 88%",
    card: "260 10% 99%",
  },
  {
    id: "clay",
    name: "Warm Clay",
    primary: "20 35% 40%",
    accent: "150 20% 45%",
    swatch: "#8B6347",
    swatchSecondary: "#5C8C6B",
    secondary: "20 18% 93%",
    muted: "20 12% 93%",
    mutedForeground: "20 10% 45%",
    border: "20 10% 88%",
    card: "25 15% 99%",
  },
  {
    id: "dusty-rose",
    name: "Dusty Rose & Olive",
    primary: "345 25% 45%",
    accent: "85 20% 45%",
    swatch: "#8F5A6E",
    swatchSecondary: "#6A7D4F",
    secondary: "345 12% 94%",
    muted: "345 8% 93%",
    mutedForeground: "345 8% 45%",
    border: "345 8% 88%",
    card: "345 10% 99%",
  },
  {
    id: "forest",
    name: "Forest & Cream",
    primary: "150 30% 30%",
    accent: "30 30% 55%",
    swatch: "#365C42",
    swatchSecondary: "#B5956B",
    secondary: "150 12% 93%",
    muted: "40 10% 93%",
    mutedForeground: "150 10% 45%",
    border: "40 10% 88%",
    card: "40 15% 99%",
  },
];

interface ThemeContextType {
  accentId: string;
  setAccentId: (id: string) => void;
  currentAccent: AccentPreset;
  initFromServer: (id: string) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

function getStoredAccent(): string {
  try {
    return localStorage.getItem("cp_theme_accent") || "sage";
  } catch {}
  return "sage";
}

function applyThemeVars(preset: AccentPreset) {
  const vars: Record<string, string> = {
    "--primary": preset.primary,
    "--ring": preset.primary,
    "--accent": preset.accent,
    "--primary-foreground": "40 30% 97%",
    "--accent-foreground": "40 30% 98%",
    "--secondary": preset.secondary,
    "--secondary-foreground": "160 10% 25%",
    "--muted": preset.muted,
    "--muted-foreground": preset.mutedForeground,
    "--border": preset.border,
    "--input": preset.border,
    "--card": preset.card,
    "--card-foreground": "160 10% 20%",
    "--popover": preset.card,
    "--popover-foreground": "160 10% 20%",
  };

  let css = ":root {\n";
  for (const [prop, val] of Object.entries(vars)) {
    css += `  ${prop}: ${val} !important;\n`;
  }
  css += "}";

  let styleEl = document.getElementById("cp-theme-vars") as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = "cp-theme-vars";
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = css;
}

function injectTransition() {
  const existing = document.getElementById("theme-transition-style");
  if (existing) existing.remove();
  const style = document.createElement("style");
  style.id = "theme-transition-style";
  style.textContent = `*, *::before, *::after { transition: background-color 0.35s ease, border-color 0.35s ease, color 0.25s ease, box-shadow 0.3s ease, fill 0.3s ease !important; }`;
  document.head.appendChild(style);
  setTimeout(() => style.remove(), 500);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [accentId, setAccentIdState] = useState<string>(getStoredAccent);
  const isFirstRender = useRef(true);

  const currentAccent = accentPresets.find((p) => p.id === accentId) || accentPresets[0];

  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      applyThemeVars(currentAccent);
      isFirstRender.current = false;
    } else {
      injectTransition();
      applyThemeVars(currentAccent);
    }
  }, [currentAccent]);

  const setAccentId = useCallback((id: string) => {
    setAccentIdState(id);
    try { localStorage.setItem("cp_theme_accent", id); } catch {}
  }, []);

  const initFromServer = useCallback((id: string) => {
    if (id && accentPresets.some(p => p.id === id)) {
      setAccentIdState(id);
      try { localStorage.setItem("cp_theme_accent", id); } catch {}
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ accentId, setAccentId, currentAccent, initFromServer }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
