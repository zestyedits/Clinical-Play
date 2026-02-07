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
    id: "classic",
    name: "Classic Navy & Gold",
    primary: "220 35% 18%",
    accent: "40 40% 60%",
    swatch: "#1B2A4A",
    swatchSecondary: "#D4AF37",
  },
  {
    id: "emerald",
    name: "Emerald & Gold",
    primary: "152 50% 36%",
    accent: "40 40% 60%",
    swatch: "#2E8B57",
    swatchSecondary: "#D4AF37",
  },
  {
    id: "sapphire",
    name: "Sapphire & Silver",
    primary: "220 85% 40%",
    accent: "220 15% 75%",
    swatch: "#0F52BA",
    swatchSecondary: "#B0B8C8",
  },
  {
    id: "rose",
    name: "Rose & Champagne",
    primary: "340 55% 45%",
    accent: "30 40% 65%",
    swatch: "#B24570",
    swatchSecondary: "#D4AF37",
  },
  {
    id: "amethyst",
    name: "Amethyst & Copper",
    primary: "270 40% 40%",
    accent: "25 60% 55%",
    swatch: "#7B52AB",
    swatchSecondary: "#C77840",
  },
  {
    id: "ocean",
    name: "Ocean Teal & Sand",
    primary: "185 60% 30%",
    accent: "35 35% 65%",
    swatch: "#1F7A7A",
    swatchSecondary: "#C4A96A",
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
    return localStorage.getItem("cp_theme_accent") || "classic";
  } catch {}
  return "classic";
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
