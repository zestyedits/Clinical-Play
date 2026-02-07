export interface LightSource {
  x: number;   // 0-1 range
  y: number;   // 0-1 range
  temperature: number; // 0 = cool/indigo, 1 = warm/amber
}

export interface RakePath {
  id: string;
  points: { x: number; y: number }[];
  width: number;
  createdBy: string;
  timestamp: number;
}

export interface AmbientState {
  lightSource: LightSource;
  rakePaths: RakePath[];
  zenMode: boolean;
}

export const DEFAULT_LIGHT_SOURCE: LightSource = {
  x: 0.3,
  y: 0.2,
  temperature: 0.5,
};

// Mass lookup: maps asset IDs/categories to mass values (0.1 leaf → 4.0 mountain)
const ASSET_MASS_MAP: Record<string, number> = {
  // Nature
  "🌲": 3.0,
  "🌳": 3.5,
  "🌸": 0.2,
  "⛰️": 4.0,
  "🌊": 2.0,
  "☀️": 1.0,
  "🌙": 0.8,
  "☁️": 0.3,
  "🌈": 0.4,
  "🍃": 0.1,
  "🍄": 0.5,
  "🦋": 0.1,

  // People / Figures
  "🧍": 2.0,
  "🧒": 1.5,
  "👨‍👩‍👧": 3.0,
  "❤️": 0.3,
  "🤚": 0.5,
  "🤗": 1.0,
  "🤔": 1.0,
  "✌️": 0.4,
  "🙏": 0.6,
  "👶": 1.0,

  // Abstract
  "⭐": 0.3,
  "⚡": 0.2,
  "🔥": 0.4,
  "💎": 1.5,
  "🔵": 0.5,
  "🔺": 0.5,
  "🔑": 0.8,
  "🔒": 1.2,
  "🛡️": 2.0,
  "♾️": 0.3,
  "🌀": 0.3,
  "✨": 0.1,
};

const CATEGORY_DEFAULT_MASS: Record<string, number> = {
  nature: 1.5,
  people: 1.5,
  abstract: 0.5,
};

export function getAssetMass(icon: string, category?: string): number {
  if (ASSET_MASS_MAP[icon] !== undefined) return ASSET_MASS_MAP[icon];
  if (category && CATEGORY_DEFAULT_MASS[category] !== undefined) return CATEGORY_DEFAULT_MASS[category];
  return 1.0;
}
