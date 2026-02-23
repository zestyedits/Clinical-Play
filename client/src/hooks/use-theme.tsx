import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";

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
    name: "Sage & Terracotta",
    primary: "145 22% 38%",
    accent: "15 45% 62%",
    swatch: "#4A7A56",
    swatchSecondary: "#C8836A",
  },
  {
    id: "ocean",
    name: "Soft Teal & Sand",
    primary: "175 30% 35%",
    accent: "35 35% 60%",
    swatch: "#3E8C8C",
    swatchSecondary: "#C4A46A",
  },
  {
    id: "lavender",
    name: "Lavender & Sage",
    primary: "260 20% 45%",
    accent: "145 20% 50%",
    swatch: "#7B6BA0",
    swatchSecondary: "#6B9F75",
  },
  {
    id: "clay",
    name: "Warm Clay",
    primary: "20 35% 40%",
    accent: "150 20% 45%",
    swatch: "#8B6347",
    swatchSecondary: "#5C8C6B",
  },
  {
    id: "dusty-rose",
    name: "Dusty Rose & Olive",
    primary: "345 25% 45%",
    accent: "85 20% 45%",
    swatch: "#8F5A6E",
    swatchSecondary: "#6A7D4F",
  },
  {
    id: "forest",
    name: "Forest & Cream",
    primary: "150 30% 30%",
    accent: "30 30% 55%",
    swatch: "#365C42",
    swatchSecondary: "#B5956B",
  },
];

interface ThemeContextType {
  accentId: string;
  setAccentId: (id: string) => void;
  currentAccent: AccentPreset;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

function getStoredAccent(): string {
  try {
    return localStorage.getItem("cp_theme_accent") || "sage";
  } catch {}
  return "sage";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [accentId, setAccentIdState] = useState<string>(getStoredAccent);

  const currentAccent = accentPresets.find((p) => p.id === accentId) || accentPresets[0];

  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--primary", currentAccent.primary);
    root.style.setProperty("--ring", currentAccent.primary);
    root.style.setProperty("--accent", currentAccent.accent);
  }, [currentAccent]);

  const setAccentId = useCallback((id: string) => {
    setAccentIdState(id);
    try { localStorage.setItem("cp_theme_accent", id); } catch {}
  }, []);

  return (
    <ThemeContext.Provider value={{ accentId, setAccentId, currentAccent }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
