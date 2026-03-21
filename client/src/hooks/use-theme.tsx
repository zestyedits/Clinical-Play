import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from "react";

export interface AccentPreset {
  id: string;
  name: string;
  primary: string;
  accent: string;
  swatch: string;
  swatchSecondary: string;
}

export const accentPresets: AccentPreset[] = [
  {
    id: "sage",
    name: "Sage & Gold",
    primary: "141 15% 55%",
    accent: "27 47% 60%",
    swatch: "#7B9E87",
    swatchSecondary: "#C9956B",
  },
  {
    id: "ocean",
    name: "Teal & Sand",
    primary: "175 30% 42%",
    accent: "35 35% 60%",
    swatch: "#3E8C8C",
    swatchSecondary: "#C4A46A",
  },
  {
    id: "lavender",
    name: "Lavender & Sage",
    primary: "260 20% 55%",
    accent: "145 20% 50%",
    swatch: "#8B7BB5",
    swatchSecondary: "#6B9F75",
  },
  {
    id: "clay",
    name: "Warm Clay",
    primary: "20 35% 50%",
    accent: "150 20% 50%",
    swatch: "#A87050",
    swatchSecondary: "#5C8C6B",
  },
  {
    id: "dusty-rose",
    name: "Dusty Rose & Olive",
    primary: "345 25% 55%",
    accent: "85 20% 50%",
    swatch: "#A86A7E",
    swatchSecondary: "#6A7D4F",
  },
  {
    id: "forest",
    name: "Forest & Cream",
    primary: "150 30% 38%",
    accent: "30 30% 55%",
    swatch: "#3F7350",
    swatchSecondary: "#B5956B",
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
    "--primary-foreground": "0 0% 99%",
    "--accent-foreground": "28 28% 16%",
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
