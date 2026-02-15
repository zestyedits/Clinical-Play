import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { playClickSound } from "@/lib/audio-feedback";
import {
  Plus,
  X,
  Droplets,
  Leaf,
  Bug,
  Sparkles,
  BookOpen,
  Flower2,
  TreePine,
} from "lucide-react";
import { ClinicianToolbar, type ToolbarControl } from "./clinician-toolbar";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GardenPlantData {
  id: string;
  seedType: string;
  customName: string;
  category: string;
  growthStage: number; // 1-5
  gridX: number;
  gridY: number;
  isHarvested: boolean;
  isDormant: boolean;
  createdBy: string | null;
  createdAt: string;
}

export interface GardenJournalEntryData {
  id: string;
  plantId: string;
  content: string;
  progressRating: string | null;
  createdBy: string | null;
  createdAt: string;
}

export interface GardenWeedData {
  id: string;
  label: string;
  linkedPlantId: string | null;
  isPulled: boolean;
  createdBy: string | null;
  createdAt: string;
}

export interface GrowthGardenProps {
  plants: GardenPlantData[];
  journalEntries: GardenJournalEntryData[];
  weeds: GardenWeedData[];
  onAddPlant: (
    seedType: string,
    customName: string,
    category: string,
    gridX: number,
    gridY: number,
  ) => void;
  onUpdatePlant: (plantId: string, fields: Partial<GardenPlantData>) => void;
  onRemovePlant: (plantId: string) => void;
  onAddJournalEntry: (
    plantId: string,
    content: string,
    progressRating: string | null,
  ) => void;
  onAddWeed: (label: string, linkedPlantId: string | null) => void;
  onPullWeed: (weedId: string) => void;
  onClear: () => void;
  isClinician: boolean;
  toolSettings?: Record<string, any>;
  onSettingsUpdate?: (updates: Record<string, any>) => void;
}

// ─── Clinician Toolbar Settings ─────────────────────────────────────────────

interface GrowthGardenSettings {
  showJournal: boolean;
  showWeeds: boolean;
}

const DEFAULT_GROWTH_GARDEN_SETTINGS: GrowthGardenSettings = {
  showJournal: true,
  showWeeds: true,
};

const GROWTH_GARDEN_TOOLBAR_CONTROLS: ToolbarControl[] = [
  {
    type: "toggle",
    key: "showJournal",
    icon: BookOpen,
    label: "Journal",
    activeColor: "sky",
  },
  {
    type: "toggle",
    key: "showWeeds",
    icon: Leaf,
    label: "Weeds",
    activeColor: "emerald",
  },
];

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const GRID_COLS = 4;
const GRID_ROWS = 3;

const SEED_TYPES = [
  { id: "sunflower", label: "Sunflower", meaning: "Goals & Ambitions", color: "#FBBF24", accent: "#F59E0B" },
  { id: "rose", label: "Rose", meaning: "Relationships", color: "#F472B6", accent: "#EC4899" },
  { id: "oak", label: "Oak Tree", meaning: "Resilience", color: "#65A30D", accent: "#854D0E" },
  { id: "lavender", label: "Lavender", meaning: "Self-Care", color: "#A78BFA", accent: "#7C3AED" },
  { id: "cactus", label: "Cactus", meaning: "Boundaries", color: "#34D399", accent: "#059669" },
  { id: "vine", label: "Vine", meaning: "Connections", color: "#2DD4BF", accent: "#0D9488" },
] as const;

const CATEGORIES = [
  "Personal Growth",
  "Relationships",
  "Health",
  "Career",
  "Creativity",
  "Mindfulness",
] as const;

const GROWTH_STAGE_LABELS = ["", "Seed", "Sprout", "Growing", "Blooming", "Flourishing"];

const PROGRESS_RATINGS = ["Struggling", "Steady", "Good Progress", "Thriving"];

function getSeedMeta(seedType: string) {
  return SEED_TYPES.find((s) => s.id === seedType) ?? SEED_TYPES[0];
}

// ---------------------------------------------------------------------------
// Deterministic pseudo-random from seed string
// ---------------------------------------------------------------------------

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function seededRand(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

// ---------------------------------------------------------------------------
// SVG Plant Illustrations
// ---------------------------------------------------------------------------

function SunflowerSVG({ stage, size }: { stage: number; size: number }) {
  const s = size;
  if (stage === 1) {
    return (
      <g>
        <ellipse cx={s / 2} cy={s * 0.85} rx={s * 0.12} ry={s * 0.08} fill="#92400E" opacity={0.6} />
        <circle cx={s / 2} cy={s * 0.75} r={s * 0.07} fill="#FBBF24" />
      </g>
    );
  }
  if (stage === 2) {
    return (
      <g>
        <line x1={s / 2} y1={s * 0.85} x2={s / 2} y2={s * 0.55} stroke="#65A30D" strokeWidth={2} />
        <ellipse cx={s / 2 - 4} cy={s * 0.6} rx={4} ry={7} fill="#86EFAC" transform={`rotate(-20 ${s / 2 - 4} ${s * 0.6})`} />
        <ellipse cx={s / 2 + 4} cy={s * 0.6} rx={4} ry={7} fill="#86EFAC" transform={`rotate(20 ${s / 2 + 4} ${s * 0.6})`} />
      </g>
    );
  }
  if (stage === 3) {
    return (
      <g>
        <line x1={s / 2} y1={s * 0.9} x2={s / 2} y2={s * 0.35} stroke="#4D7C0F" strokeWidth={2.5} />
        <ellipse cx={s / 2 - 8} cy={s * 0.6} rx={5} ry={10} fill="#86EFAC" transform={`rotate(-30 ${s / 2 - 8} ${s * 0.6})`} />
        <ellipse cx={s / 2 + 8} cy={s * 0.6} rx={5} ry={10} fill="#86EFAC" transform={`rotate(30 ${s / 2 + 8} ${s * 0.6})`} />
        <circle cx={s / 2} cy={s * 0.3} r={s * 0.1} fill="#FBBF24" />
      </g>
    );
  }
  if (stage === 4) {
    const petals = 8;
    return (
      <g>
        <line x1={s / 2} y1={s * 0.92} x2={s / 2} y2={s * 0.3} stroke="#4D7C0F" strokeWidth={3} />
        <ellipse cx={s / 2 - 10} cy={s * 0.55} rx={6} ry={12} fill="#65A30D" transform={`rotate(-35 ${s / 2 - 10} ${s * 0.55})`} />
        <ellipse cx={s / 2 + 10} cy={s * 0.55} rx={6} ry={12} fill="#65A30D" transform={`rotate(35 ${s / 2 + 10} ${s * 0.55})`} />
        {Array.from({ length: petals }).map((_, i) => {
          const angle = (i / petals) * Math.PI * 2;
          const px = s / 2 + Math.cos(angle) * 12;
          const py = s * 0.25 + Math.sin(angle) * 12;
          return <ellipse key={i} cx={px} cy={py} rx={5} ry={9} fill="#FBBF24" transform={`rotate(${(i / petals) * 360} ${px} ${py})`} />;
        })}
        <circle cx={s / 2} cy={s * 0.25} r={7} fill="#92400E" />
      </g>
    );
  }
  // stage 5
  const petals = 12;
  return (
    <g>
      <line x1={s / 2} y1={s * 0.95} x2={s / 2} y2={s * 0.22} stroke="#4D7C0F" strokeWidth={3.5} />
      <ellipse cx={s / 2 - 12} cy={s * 0.5} rx={7} ry={14} fill="#65A30D" transform={`rotate(-40 ${s / 2 - 12} ${s * 0.5})`} />
      <ellipse cx={s / 2 + 12} cy={s * 0.5} rx={7} ry={14} fill="#65A30D" transform={`rotate(40 ${s / 2 + 12} ${s * 0.5})`} />
      <ellipse cx={s / 2 - 6} cy={s * 0.7} rx={5} ry={10} fill="#86EFAC" transform={`rotate(-20 ${s / 2 - 6} ${s * 0.7})`} />
      {Array.from({ length: petals }).map((_, i) => {
        const angle = (i / petals) * Math.PI * 2;
        const px = s / 2 + Math.cos(angle) * 15;
        const py = s * 0.2 + Math.sin(angle) * 15;
        return <ellipse key={i} cx={px} cy={py} rx={6} ry={11} fill="#FCD34D" transform={`rotate(${(i / petals) * 360} ${px} ${py})`} />;
      })}
      <circle cx={s / 2} cy={s * 0.2} r={9} fill="#92400E" />
      <circle cx={s / 2} cy={s * 0.2} r={5} fill="#78350F" />
    </g>
  );
}

function RoseSVG({ stage, size }: { stage: number; size: number }) {
  const s = size;
  if (stage === 1) {
    return (
      <g>
        <ellipse cx={s / 2} cy={s * 0.85} rx={s * 0.12} ry={s * 0.08} fill="#92400E" opacity={0.6} />
        <circle cx={s / 2} cy={s * 0.75} r={s * 0.06} fill="#F9A8D4" />
      </g>
    );
  }
  if (stage === 2) {
    return (
      <g>
        <line x1={s / 2} y1={s * 0.85} x2={s / 2} y2={s * 0.5} stroke="#166534" strokeWidth={2} />
        <ellipse cx={s / 2} cy={s * 0.48} rx={4} ry={6} fill="#FB7185" />
      </g>
    );
  }
  if (stage === 3) {
    return (
      <g>
        <line x1={s / 2} y1={s * 0.9} x2={s / 2} y2={s * 0.35} stroke="#166534" strokeWidth={2.5} />
        <ellipse cx={s / 2 - 6} cy={s * 0.6} rx={4} ry={8} fill="#22C55E" transform={`rotate(-25 ${s / 2 - 6} ${s * 0.6})`} />
        <circle cx={s / 2} cy={s * 0.32} r={7} fill="#FB7185" />
        <circle cx={s / 2} cy={s * 0.32} r={4} fill="#F43F5E" />
      </g>
    );
  }
  if (stage === 4) {
    return (
      <g>
        <line x1={s / 2} y1={s * 0.92} x2={s / 2} y2={s * 0.28} stroke="#166534" strokeWidth={3} />
        <ellipse cx={s / 2 - 8} cy={s * 0.55} rx={5} ry={10} fill="#22C55E" transform={`rotate(-30 ${s / 2 - 8} ${s * 0.55})`} />
        <ellipse cx={s / 2 + 8} cy={s * 0.6} rx={5} ry={10} fill="#22C55E" transform={`rotate(30 ${s / 2 + 8} ${s * 0.6})`} />
        {[0, 72, 144, 216, 288].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          const px = s / 2 + Math.cos(rad) * 8;
          const py = s * 0.25 + Math.sin(rad) * 8;
          return <ellipse key={i} cx={px} cy={py} rx={5} ry={8} fill="#FB7185" transform={`rotate(${deg} ${px} ${py})`} />;
        })}
        <circle cx={s / 2} cy={s * 0.25} r={5} fill="#F43F5E" />
      </g>
    );
  }
  return (
    <g>
      <line x1={s / 2} y1={s * 0.95} x2={s / 2} y2={s * 0.22} stroke="#166534" strokeWidth={3.5} />
      <ellipse cx={s / 2 - 10} cy={s * 0.5} rx={6} ry={12} fill="#22C55E" transform={`rotate(-35 ${s / 2 - 10} ${s * 0.5})`} />
      <ellipse cx={s / 2 + 10} cy={s * 0.55} rx={6} ry={12} fill="#22C55E" transform={`rotate(35 ${s / 2 + 10} ${s * 0.55})`} />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const px = s / 2 + Math.cos(rad) * 11;
        const py = s * 0.2 + Math.sin(rad) * 11;
        return <ellipse key={i} cx={px} cy={py} rx={6} ry={10} fill={i % 2 === 0 ? "#FB7185" : "#FDA4AF"} transform={`rotate(${deg} ${px} ${py})`} />;
      })}
      <circle cx={s / 2} cy={s * 0.2} r={6} fill="#E11D48" />
    </g>
  );
}

function OakSVG({ stage, size }: { stage: number; size: number }) {
  const s = size;
  if (stage === 1) {
    return (
      <g>
        <ellipse cx={s / 2} cy={s * 0.85} rx={s * 0.13} ry={s * 0.08} fill="#92400E" opacity={0.6} />
        <ellipse cx={s / 2} cy={s * 0.75} rx={s * 0.05} ry={s * 0.07} fill="#854D0E" />
      </g>
    );
  }
  if (stage === 2) {
    return (
      <g>
        <rect x={s / 2 - 2} y={s * 0.6} width={4} height={s * 0.25} fill="#854D0E" rx={1} />
        <ellipse cx={s / 2} cy={s * 0.55} rx={6} ry={8} fill="#86EFAC" />
      </g>
    );
  }
  if (stage === 3) {
    return (
      <g>
        <rect x={s / 2 - 3} y={s * 0.5} width={6} height={s * 0.4} fill="#78350F" rx={2} />
        <ellipse cx={s / 2} cy={s * 0.42} rx={12} ry={14} fill="#4ADE80" />
        <ellipse cx={s / 2} cy={s * 0.38} rx={8} ry={10} fill="#22C55E" />
      </g>
    );
  }
  if (stage === 4) {
    return (
      <g>
        <rect x={s / 2 - 4} y={s * 0.45} width={8} height={s * 0.48} fill="#78350F" rx={2} />
        <line x1={s / 2 - 4} y1={s * 0.55} x2={s / 2 - 12} y2={s * 0.42} stroke="#78350F" strokeWidth={2.5} />
        <line x1={s / 2 + 4} y1={s * 0.55} x2={s / 2 + 12} y2={s * 0.38} stroke="#78350F" strokeWidth={2.5} />
        <ellipse cx={s / 2} cy={s * 0.3} rx={18} ry={16} fill="#4ADE80" />
        <ellipse cx={s / 2 - 8} cy={s * 0.33} rx={10} ry={10} fill="#22C55E" />
        <ellipse cx={s / 2 + 8} cy={s * 0.28} rx={10} ry={10} fill="#16A34A" />
      </g>
    );
  }
  return (
    <g>
      <rect x={s / 2 - 5} y={s * 0.4} width={10} height={s * 0.55} fill="#78350F" rx={3} />
      <line x1={s / 2 - 5} y1={s * 0.5} x2={s / 2 - 16} y2={s * 0.35} stroke="#78350F" strokeWidth={3} />
      <line x1={s / 2 + 5} y1={s * 0.5} x2={s / 2 + 16} y2={s * 0.32} stroke="#78350F" strokeWidth={3} />
      <line x1={s / 2} y1={s * 0.45} x2={s / 2} y2={s * 0.2} stroke="#78350F" strokeWidth={2} />
      <ellipse cx={s / 2} cy={s * 0.22} rx={22} ry={20} fill="#4ADE80" />
      <ellipse cx={s / 2 - 10} cy={s * 0.26} rx={12} ry={12} fill="#22C55E" />
      <ellipse cx={s / 2 + 10} cy={s * 0.2} rx={12} ry={12} fill="#16A34A" />
      <ellipse cx={s / 2} cy={s * 0.15} rx={8} ry={8} fill="#15803D" />
    </g>
  );
}

function LavenderSVG({ stage, size }: { stage: number; size: number }) {
  const s = size;
  if (stage === 1) {
    return (
      <g>
        <ellipse cx={s / 2} cy={s * 0.85} rx={s * 0.12} ry={s * 0.08} fill="#92400E" opacity={0.6} />
        <circle cx={s / 2} cy={s * 0.75} r={s * 0.06} fill="#C4B5FD" />
      </g>
    );
  }
  if (stage === 2) {
    return (
      <g>
        <line x1={s / 2} y1={s * 0.85} x2={s / 2} y2={s * 0.5} stroke="#65A30D" strokeWidth={1.5} />
        <circle cx={s / 2} cy={s * 0.48} r={3} fill="#A78BFA" />
        <circle cx={s / 2} cy={s * 0.42} r={2.5} fill="#C4B5FD" />
      </g>
    );
  }
  if (stage === 3) {
    return (
      <g>
        {[-4, 0, 4].map((dx, i) => (
          <g key={i}>
            <line x1={s / 2 + dx} y1={s * 0.88} x2={s / 2 + dx} y2={s * 0.35} stroke="#65A30D" strokeWidth={1.5} />
            {[0.35, 0.42, 0.49, 0.56].map((py, j) => (
              <circle key={j} cx={s / 2 + dx} cy={s * py} r={2.5} fill={j % 2 === 0 ? "#A78BFA" : "#C4B5FD"} />
            ))}
          </g>
        ))}
      </g>
    );
  }
  if (stage === 4) {
    return (
      <g>
        {[-7, -3, 1, 5].map((dx, i) => (
          <g key={i}>
            <line x1={s / 2 + dx} y1={s * 0.9} x2={s / 2 + dx} y2={s * 0.25} stroke="#65A30D" strokeWidth={1.5} />
            {[0.25, 0.32, 0.39, 0.46, 0.53].map((py, j) => (
              <circle key={j} cx={s / 2 + dx} cy={s * py} r={3} fill={j % 2 === 0 ? "#8B5CF6" : "#A78BFA"} />
            ))}
          </g>
        ))}
      </g>
    );
  }
  return (
    <g>
      {[-9, -5, -1, 3, 7].map((dx, i) => (
        <g key={i}>
          <line x1={s / 2 + dx} y1={s * 0.92} x2={s / 2 + dx} y2={s * 0.18} stroke="#65A30D" strokeWidth={1.5} />
          {[0.18, 0.24, 0.3, 0.36, 0.42, 0.48, 0.54].map((py, j) => (
            <circle key={j} cx={s / 2 + dx} cy={s * py} r={3} fill={j % 3 === 0 ? "#7C3AED" : j % 3 === 1 ? "#8B5CF6" : "#A78BFA"} />
          ))}
        </g>
      ))}
    </g>
  );
}

function CactusSVG({ stage, size }: { stage: number; size: number }) {
  const s = size;
  if (stage === 1) {
    return (
      <g>
        <ellipse cx={s / 2} cy={s * 0.85} rx={s * 0.12} ry={s * 0.08} fill="#92400E" opacity={0.6} />
        <circle cx={s / 2} cy={s * 0.76} r={s * 0.06} fill="#34D399" />
      </g>
    );
  }
  if (stage === 2) {
    return (
      <g>
        <rect x={s / 2 - 4} y={s * 0.55} width={8} height={s * 0.3} rx={4} fill="#34D399" />
        <line x1={s / 2 - 1} y1={s * 0.58} x2={s / 2 - 5} y2={s * 0.52} stroke="#065F46" strokeWidth={0.8} />
        <line x1={s / 2 + 1} y1={s * 0.62} x2={s / 2 + 5} y2={s * 0.56} stroke="#065F46" strokeWidth={0.8} />
      </g>
    );
  }
  if (stage === 3) {
    return (
      <g>
        <rect x={s / 2 - 5} y={s * 0.38} width={10} height={s * 0.5} rx={5} fill="#34D399" />
        <rect x={s / 2 - 14} y={s * 0.45} width={7} height={s * 0.18} rx={3.5} fill="#4ADE80" />
        <line x1={s / 2 - 14} y1={s * 0.55} x2={s / 2 - 5} y2={s * 0.55} stroke="#34D399" strokeWidth={3} />
        {[0.42, 0.5, 0.58, 0.66].map((py, i) => (
          <line key={i} x1={s / 2 + (i % 2 === 0 ? -2 : 2)} y1={s * py} x2={s / 2 + (i % 2 === 0 ? -8 : 8)} y2={s * (py - 0.03)} stroke="#065F46" strokeWidth={0.8} />
        ))}
      </g>
    );
  }
  if (stage === 4) {
    return (
      <g>
        <rect x={s / 2 - 6} y={s * 0.3} width={12} height={s * 0.6} rx={6} fill="#34D399" />
        <rect x={s / 2 - 17} y={s * 0.38} width={9} height={s * 0.22} rx={4.5} fill="#4ADE80" />
        <line x1={s / 2 - 17} y1={s * 0.48} x2={s / 2 - 6} y2={s * 0.48} stroke="#34D399" strokeWidth={3} />
        <rect x={s / 2 + 8} y={s * 0.42} width={8} height={s * 0.18} rx={4} fill="#4ADE80" />
        <line x1={s / 2 + 8} y1={s * 0.5} x2={s / 2 + 6} y2={s * 0.5} stroke="#34D399" strokeWidth={3} />
        <circle cx={s / 2} cy={s * 0.28} r={3} fill="#FBBF24" />
        {[0.35, 0.45, 0.55, 0.65].map((py, i) => (
          <line key={i} x1={s / 2 + (i % 2 === 0 ? -3 : 3)} y1={s * py} x2={s / 2 + (i % 2 === 0 ? -10 : 10)} y2={s * (py - 0.03)} stroke="#065F46" strokeWidth={0.8} />
        ))}
      </g>
    );
  }
  return (
    <g>
      <rect x={s / 2 - 7} y={s * 0.22} width={14} height={s * 0.7} rx={7} fill="#34D399" />
      <rect x={s / 2 - 20} y={s * 0.32} width={10} height={s * 0.28} rx={5} fill="#4ADE80" />
      <line x1={s / 2 - 20} y1={s * 0.44} x2={s / 2 - 7} y2={s * 0.44} stroke="#34D399" strokeWidth={3.5} />
      <rect x={s / 2 + 10} y={s * 0.36} width={9} height={s * 0.22} rx={4.5} fill="#4ADE80" />
      <line x1={s / 2 + 10} y1={s * 0.46} x2={s / 2 + 7} y2={s * 0.46} stroke="#34D399" strokeWidth={3.5} />
      <circle cx={s / 2 - 1} cy={s * 0.2} r={4} fill="#FBBF24" />
      <circle cx={s / 2 + 3} cy={s * 0.23} r={2.5} fill="#FDE68A" />
      <circle cx={s / 2 - 17} cy={s * 0.3} r={2.5} fill="#FCA5A5" />
    </g>
  );
}

function VineSVG({ stage, size }: { stage: number; size: number }) {
  const s = size;
  if (stage === 1) {
    return (
      <g>
        <ellipse cx={s / 2} cy={s * 0.85} rx={s * 0.12} ry={s * 0.08} fill="#92400E" opacity={0.6} />
        <circle cx={s / 2} cy={s * 0.76} r={s * 0.06} fill="#2DD4BF" />
      </g>
    );
  }
  if (stage === 2) {
    return (
      <g>
        <path d={`M${s / 2},${s * 0.85} Q${s / 2 - 5},${s * 0.7} ${s / 2},${s * 0.55}`} stroke="#0D9488" strokeWidth={2} fill="none" />
        <ellipse cx={s / 2} cy={s * 0.53} rx={4} ry={5} fill="#2DD4BF" />
      </g>
    );
  }
  if (stage === 3) {
    return (
      <g>
        <path d={`M${s / 2},${s * 0.88} Q${s / 2 - 8},${s * 0.65} ${s / 2},${s * 0.42} Q${s / 2 + 8},${s * 0.3} ${s / 2},${s * 0.25}`} stroke="#0D9488" strokeWidth={2} fill="none" />
        {[0.42, 0.55, 0.68].map((py, i) => (
          <ellipse key={i} cx={s / 2 + (i % 2 === 0 ? -6 : 6)} cy={s * py} rx={4} ry={6} fill="#2DD4BF" transform={`rotate(${i % 2 === 0 ? -20 : 20} ${s / 2 + (i % 2 === 0 ? -6 : 6)} ${s * py})`} />
        ))}
      </g>
    );
  }
  if (stage === 4) {
    return (
      <g>
        <path d={`M${s / 2},${s * 0.9} Q${s / 2 - 12},${s * 0.65} ${s / 2},${s * 0.4} Q${s / 2 + 12},${s * 0.22} ${s / 2},${s * 0.15}`} stroke="#0D9488" strokeWidth={2.5} fill="none" />
        <path d={`M${s / 2},${s * 0.55} Q${s / 2 + 15},${s * 0.45} ${s / 2 + 18},${s * 0.4}`} stroke="#14B8A6" strokeWidth={1.5} fill="none" />
        {[0.3, 0.45, 0.6, 0.75].map((py, i) => (
          <ellipse key={i} cx={s / 2 + (i % 2 === 0 ? -7 : 7)} cy={s * py} rx={5} ry={7} fill={i % 2 === 0 ? "#2DD4BF" : "#5EEAD4"} transform={`rotate(${i % 2 === 0 ? -25 : 25} ${s / 2 + (i % 2 === 0 ? -7 : 7)} ${s * py})`} />
        ))}
      </g>
    );
  }
  return (
    <g>
      <path d={`M${s / 2},${s * 0.92} Q${s / 2 - 15},${s * 0.6} ${s / 2},${s * 0.35} Q${s / 2 + 15},${s * 0.15} ${s / 2},${s * 0.08}`} stroke="#0D9488" strokeWidth={3} fill="none" />
      <path d={`M${s / 2},${s * 0.5} Q${s / 2 + 18},${s * 0.38} ${s / 2 + 22},${s * 0.3}`} stroke="#14B8A6" strokeWidth={2} fill="none" />
      <path d={`M${s / 2},${s * 0.65} Q${s / 2 - 16},${s * 0.55} ${s / 2 - 20},${s * 0.48}`} stroke="#14B8A6" strokeWidth={2} fill="none" />
      {[0.2, 0.35, 0.5, 0.65, 0.8].map((py, i) => (
        <ellipse key={i} cx={s / 2 + (i % 2 === 0 ? -8 : 8)} cy={s * py} rx={6} ry={8} fill={i % 3 === 0 ? "#2DD4BF" : i % 3 === 1 ? "#5EEAD4" : "#99F6E4"} transform={`rotate(${i % 2 === 0 ? -30 : 30} ${s / 2 + (i % 2 === 0 ? -8 : 8)} ${s * py})`} />
      ))}
      <circle cx={s / 2 + 22} cy={s * 0.28} r={3} fill="#F0ABFC" />
      <circle cx={s / 2 - 20} cy={s * 0.46} r={2.5} fill="#F0ABFC" />
    </g>
  );
}

function PlantSVG({ seedType, stage, size }: { seedType: string; stage: number; size: number }) {
  const components: Record<string, React.FC<{ stage: number; size: number }>> = {
    sunflower: SunflowerSVG,
    rose: RoseSVG,
    oak: OakSVG,
    lavender: LavenderSVG,
    cactus: CactusSVG,
    vine: VineSVG,
  };
  const Comp = components[seedType] ?? SunflowerSVG;
  return <Comp stage={stage} size={size} />;
}

// ---------------------------------------------------------------------------
// Weed SVG
// ---------------------------------------------------------------------------

function WeedSprite({ x, y, isPulled }: { x: number; y: number; isPulled: boolean }) {
  return (
    <motion.g
      initial={{ scale: 0, opacity: 0 }}
      animate={isPulled ? { scale: 0, opacity: 0, y: -20 } : { scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <g transform={`translate(${x}, ${y})`}>
        <path d="M0,0 Q-3,-8 -6,-5 Q-4,-12 0,-8 Q4,-12 6,-5 Q3,-8 0,0Z" fill={isPulled ? "#9CA3AF" : "#65A30D"} stroke="#4D7C0F" strokeWidth={0.5} />
        <line x1={-2} y1={-4} x2={-4} y2={-8} stroke="#92400E" strokeWidth={0.5} />
        <line x1={2} y1={-4} x2={4} y2={-8} stroke="#92400E" strokeWidth={0.5} />
      </g>
    </motion.g>
  );
}

// ---------------------------------------------------------------------------
// Floating Particle
// ---------------------------------------------------------------------------

function FloatingParticle({ delay, x }: { delay: number; x: number }) {
  return (
    <motion.circle
      cx={x}
      cy={400}
      r={1.5}
      fill="rgba(253, 224, 71, 0.5)"
      initial={{ opacity: 0, cy: 400 }}
      animate={{ opacity: [0, 0.7, 0], cy: [400, 50] }}
      transition={{ duration: 8, delay, repeat: Infinity, ease: "easeOut" }}
    />
  );
}

// ---------------------------------------------------------------------------
// Soil Plot component
// ---------------------------------------------------------------------------

function SoilPlot({
  col,
  row,
  plant,
  weeds,
  onClickEmpty,
  onClickPlant,
  cellW,
  cellH,
}: {
  col: number;
  row: number;
  plant: GardenPlantData | undefined;
  weeds: GardenWeedData[];
  onClickEmpty: () => void;
  onClickPlant: (p: GardenPlantData) => void;
  cellW: number;
  cellH: number;
}) {
  const x = col * cellW;
  const y = row * cellH;
  const isOccupied = !!plant;
  const meta = plant ? getSeedMeta(plant.seedType) : null;

  return (
    <g>
      {/* Soil plot */}
      <motion.rect
        x={x + 4}
        y={y + 4}
        width={cellW - 8}
        height={cellH - 8}
        rx={8}
        fill={isOccupied ? "rgba(120, 53, 15, 0.35)" : "rgba(120, 53, 15, 0.18)"}
        stroke={isOccupied ? "rgba(161, 98, 7, 0.4)" : "rgba(161, 98, 7, 0.2)"}
        strokeWidth={1.5}
        strokeDasharray={isOccupied ? undefined : "4 3"}
        style={{ cursor: "pointer" }}
        whileHover={{ fill: isOccupied ? "rgba(120, 53, 15, 0.45)" : "rgba(120, 53, 15, 0.3)" }}
        onClick={() => {
          playClickSound();
          if (plant) onClickPlant(plant);
          else onClickEmpty();
        }}
      />

      {/* Harvested glow */}
      {plant?.isHarvested && (
        <motion.rect
          x={x + 4}
          y={y + 4}
          width={cellW - 8}
          height={cellH - 8}
          rx={8}
          fill="none"
          stroke="#FBBF24"
          strokeWidth={2}
          animate={{ opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ filter: "drop-shadow(0 0 6px rgba(251,191,36,0.5))", pointerEvents: "none" }}
        />
      )}

      {/* Plant SVG */}
      {plant && (
        <g
          style={{ cursor: "pointer", opacity: plant.isDormant ? 0.4 : 1, filter: plant.isDormant ? "grayscale(1)" : "none" }}
          onClick={() => {
            playClickSound();
            onClickPlant(plant);
          }}
        >
          <motion.g
            animate={{ rotate: [0, 1.5, 0, -1.5, 0] }}
            transition={{ duration: 4 + seededRand(hashStr(plant.id)) * 2, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: `${x + cellW / 2}px ${y + cellH - 10}px` }}
          >
            <svg x={x + (cellW - 60) / 2} y={y + 4} width={60} height={cellH - 12} viewBox={`0 0 60 ${cellH - 12}`}>
              <PlantSVG seedType={plant.seedType} stage={plant.growthStage} size={60} />
            </svg>
          </motion.g>
        </g>
      )}

      {/* Plant label */}
      {plant && (
        <text
          x={x + cellW / 2}
          y={y + cellH - 4}
          textAnchor="middle"
          fontSize={9}
          fill="rgba(255,255,255,0.8)"
          fontWeight={500}
          style={{ pointerEvents: "none" }}
        >
          {plant.customName.length > 12 ? plant.customName.slice(0, 11) + "..." : plant.customName}
        </text>
      )}

      {/* Empty plot indicator */}
      {!plant && (
        <g style={{ pointerEvents: "none" }}>
          <Plus
            size={18}
            style={{
              position: "absolute",
            }}
          />
          <text
            x={x + cellW / 2}
            y={y + cellH / 2 + 4}
            textAnchor="middle"
            fontSize={18}
            fill="rgba(161, 98, 7, 0.4)"
            fontWeight={300}
          >
            +
          </text>
        </g>
      )}

      {/* Weeds near this plant */}
      {weeds.map((w, wi) => {
        const wx = x + 6 + (wi % 3) * 14;
        const wy = y + cellH - 18 - Math.floor(wi / 3) * 10;
        return (
          <WeedSprite key={w.id} x={wx} y={wy} isPulled={w.isPulled} />
        );
      })}
    </g>
  );
}

// ---------------------------------------------------------------------------
// Plant Detail Panel
// ---------------------------------------------------------------------------

function PlantDetailPanel({
  plant,
  journal,
  weeds,
  onClose,
  onWater,
  onAddJournalEntry,
  onToggleDormant,
  onToggleHarvest,
  onRemove,
  onAddWeed,
  onPullWeed,
  gardenSettings,
}: {
  plant: GardenPlantData;
  journal: GardenJournalEntryData[];
  weeds: GardenWeedData[];
  onClose: () => void;
  onWater: () => void;
  onAddJournalEntry: (content: string, rating: string | null) => void;
  onToggleDormant: () => void;
  onToggleHarvest: () => void;
  onRemove: () => void;
  onAddWeed: (label: string) => void;
  onPullWeed: (weedId: string) => void;
  gardenSettings: GrowthGardenSettings;
}) {
  const meta = getSeedMeta(plant.seedType);
  const [journalText, setJournalText] = useState("");
  const [journalRating, setJournalRating] = useState<string | null>(null);
  const [showJournal, setShowJournal] = useState(false);
  const [weedLabel, setWeedLabel] = useState("");
  const [showWeedInput, setShowWeedInput] = useState(false);

  const handleSubmitJournal = useCallback(() => {
    if (!journalText.trim()) return;
    onAddJournalEntry(journalText.trim(), journalRating);
    setJournalText("");
    setJournalRating(null);
    playClickSound();
  }, [journalText, journalRating, onAddJournalEntry]);

  const handleSubmitWeed = useCallback(() => {
    if (!weedLabel.trim()) return;
    onAddWeed(weedLabel.trim());
    setWeedLabel("");
    setShowWeedInput(false);
    playClickSound();
  }, [weedLabel, onAddWeed]);

  const activeWeeds = weeds.filter((w) => !w.isPulled);
  const pulledWeeds = weeds.filter((w) => w.isPulled);

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 30 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="absolute right-0 top-0 bottom-0 w-[340px] z-20 overflow-y-auto"
      style={{
        background: "rgba(30, 25, 20, 0.92)",
        backdropFilter: "blur(20px)",
        borderLeft: "1px solid rgba(161, 98, 7, 0.3)",
        boxShadow: "-8px 0 32px rgba(0,0,0,0.3)",
      }}
    >
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold" style={{ color: meta.color }}>{plant.customName}</h3>
            <p className="text-xs opacity-60 text-white">{meta.label} &middot; {meta.meaning}</p>
            <p className="text-xs opacity-50 text-white mt-0.5">{plant.category}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
          >
            <X size={16} className="text-white/70" />
          </button>
        </div>

        {/* Growth stage */}
        <div
          className="rounded-xl p-3"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-white/70">Growth Stage</span>
            <span className="text-sm font-bold" style={{ color: meta.color }}>
              {GROWTH_STAGE_LABELS[plant.growthStage]} ({plant.growthStage}/5)
            </span>
          </div>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className="flex-1 h-2.5 rounded-full"
                style={{
                  background: s <= plant.growthStage ? meta.color : "rgba(255,255,255,0.1)",
                  boxShadow: s <= plant.growthStage ? `0 0 6px ${meta.color}40` : "none",
                }}
              />
            ))}
          </div>

          {/* Plant preview */}
          <div className="flex justify-center mt-3">
            <svg width={80} height={80} viewBox="0 0 80 80">
              <PlantSVG seedType={plant.seedType} stage={plant.growthStage} size={80} />
            </svg>
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              onWater();
              playClickSound();
            }}
            disabled={plant.growthStage >= 5}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all",
              plant.growthStage >= 5
                ? "opacity-40 cursor-not-allowed bg-white/5 text-white/50"
                : "bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border border-blue-500/20",
            )}
          >
            <Droplets size={14} />
            Water (+1 Stage)
          </button>
          <button
            onClick={() => {
              onToggleDormant();
              playClickSound();
            }}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all",
              plant.isDormant
                ? "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/20"
                : "bg-white/5 text-white/60 hover:bg-white/10 border border-white/10",
            )}
          >
            <Leaf size={14} />
            {plant.isDormant ? "Wake Up" : "Set Dormant"}
          </button>
          <button
            onClick={() => {
              onToggleHarvest();
              playClickSound();
            }}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all",
              plant.isHarvested
                ? "bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 border border-yellow-500/20"
                : "bg-white/5 text-white/60 hover:bg-white/10 border border-white/10",
            )}
          >
            <Sparkles size={14} />
            {plant.isHarvested ? "Un-harvest" : "Harvest"}
          </button>
          <button
            onClick={() => {
              onRemove();
              playClickSound();
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/15"
          >
            <X size={14} />
            Remove
          </button>
        </div>

        {/* Weeds section */}
        {gardenSettings.showWeeds && (
          <div
            className="rounded-xl p-3"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-white/70 flex items-center gap-1">
                <Bug size={12} /> Obstacles (Weeds)
              </span>
              <button
                onClick={() => setShowWeedInput(!showWeedInput)}
                className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                + Add
              </button>
            </div>

            {showWeedInput && (
              <div className="flex gap-2 mb-2">
                <input
                  value={weedLabel}
                  onChange={(e) => setWeedLabel(e.target.value)}
                  placeholder="Name this obstacle..."
                  className="flex-1 px-2 py-1.5 rounded-lg text-xs bg-black/30 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-amber-500/40"
                  onKeyDown={(e) => e.key === "Enter" && handleSubmitWeed()}
                  maxLength={60}
                />
                <button onClick={handleSubmitWeed} className="px-2 py-1.5 bg-amber-600/30 rounded-lg text-xs text-amber-300 hover:bg-amber-600/40 transition-colors">
                  Add
                </button>
              </div>
            )}

            {activeWeeds.length === 0 && pulledWeeds.length === 0 && (
              <p className="text-xs text-white/30 italic">No obstacles added yet</p>
            )}

            <div className="space-y-1">
              {activeWeeds.map((w) => (
                <div key={w.id} className="flex items-center justify-between px-2 py-1 rounded bg-red-900/20 border border-red-500/10">
                  <span className="text-xs text-red-300">{w.label}</span>
                  <button
                    onClick={() => {
                      onPullWeed(w.id);
                      playClickSound();
                    }}
                    className="text-[10px] px-2 py-0.5 rounded bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600/40 transition-colors"
                  >
                    Pull
                  </button>
                </div>
              ))}
              {pulledWeeds.map((w) => (
                <div key={w.id} className="flex items-center justify-between px-2 py-1 rounded bg-white/5 opacity-50">
                  <span className="text-xs text-white/50 line-through">{w.label}</span>
                  <span className="text-[10px] text-emerald-400">Pulled</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Journal section */}
        {gardenSettings.showJournal && <div
          className="rounded-xl p-3"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-white/70 flex items-center gap-1">
              <BookOpen size={12} /> Growth Journal
            </span>
            <button
              onClick={() => setShowJournal(!showJournal)}
              className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              {showJournal ? "Hide" : `View (${journal.length})`}
            </button>
          </div>

          {/* New entry */}
          <div className="space-y-2 mb-2">
            <textarea
              value={journalText}
              onChange={(e) => setJournalText(e.target.value)}
              placeholder="Reflect on your progress..."
              rows={2}
              className="w-full px-2 py-1.5 rounded-lg text-xs bg-black/30 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-emerald-500/40 resize-none"
              maxLength={500}
            />
            <div className="flex items-center gap-1.5 flex-wrap">
              {PROGRESS_RATINGS.map((r) => (
                <button
                  key={r}
                  onClick={() => setJournalRating(journalRating === r ? null : r)}
                  className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] transition-all border",
                    journalRating === r
                      ? "bg-emerald-500/30 border-emerald-500/40 text-emerald-300"
                      : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10",
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
            <button
              onClick={handleSubmitJournal}
              disabled={!journalText.trim()}
              className="w-full py-1.5 rounded-lg text-xs font-medium bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-emerald-500/20"
            >
              Add Entry
            </button>
          </div>

          {/* Journal history */}
          <AnimatePresence>
            {showJournal && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="space-y-2 max-h-[200px] overflow-y-auto mt-2 pr-1">
                  {journal.length === 0 && (
                    <p className="text-xs text-white/30 italic">No journal entries yet</p>
                  )}
                  {journal
                    .slice()
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((entry) => (
                      <div key={entry.id} className="p-2 rounded-lg bg-black/20 border border-white/5">
                        <p className="text-xs text-white/80 leading-relaxed">{entry.content}</p>
                        <div className="flex items-center justify-between mt-1">
                          {entry.progressRating && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                              {entry.progressRating}
                            </span>
                          )}
                          <span className="text-[10px] text-white/30 ml-auto">
                            {new Date(entry.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>}

        {/* Status tags */}
        <div className="flex gap-2 flex-wrap">
          {plant.isHarvested && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/20">
              Harvested
            </span>
          )}
          {plant.isDormant && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-400 border border-gray-500/20">
              Dormant
            </span>
          )}
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/40 border border-white/10">
            Planted {new Date(plant.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Seed Planting Modal
// ---------------------------------------------------------------------------

function PlantingModal({
  gridX,
  gridY,
  onPlant,
  onClose,
}: {
  gridX: number;
  gridY: number;
  onPlant: (seedType: string, name: string, category: string) => void;
  onClose: () => void;
}) {
  const [selectedSeed, setSelectedSeed] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);

  const handlePlant = useCallback(() => {
    if (!selectedSeed || !name.trim()) return;
    onPlant(selectedSeed, name.trim(), category);
    playClickSound();
  }, [selectedSeed, name, category, onPlant]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-30 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="w-[380px] rounded-2xl p-5 space-y-4"
        style={{
          background: "rgba(30, 25, 20, 0.95)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(161, 98, 7, 0.3)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <Flower2 size={18} className="text-emerald-400" />
            Plant a New Seed
          </h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 transition-colors">
            <X size={16} className="text-white/60" />
          </button>
        </div>

        <p className="text-xs text-white/50">
          Choose a seed type to plant at plot ({gridX + 1}, {gridY + 1})
        </p>

        {/* Seed type grid */}
        <div className="grid grid-cols-3 gap-2">
          {SEED_TYPES.map((seed) => (
            <motion.button
              key={seed.id}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                setSelectedSeed(seed.id);
                playClickSound();
              }}
              className={cn(
                "p-2.5 rounded-xl text-center transition-all border",
                selectedSeed === seed.id
                  ? "border-amber-500/50 bg-amber-500/15"
                  : "border-white/10 bg-white/5 hover:bg-white/8",
              )}
            >
              <svg width={36} height={36} viewBox="0 0 60 60" className="mx-auto mb-1">
                <PlantSVG seedType={seed.id} stage={3} size={60} />
              </svg>
              <p className="text-[10px] font-medium" style={{ color: seed.color }}>{seed.label}</p>
              <p className="text-[8px] text-white/40">{seed.meaning}</p>
            </motion.button>
          ))}
        </div>

        {/* Name input */}
        <div>
          <label className="text-xs text-white/60 block mb-1">Name your goal</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Practice daily gratitude..."
            className="w-full px-3 py-2 rounded-lg text-sm bg-black/30 border border-white/10 text-white placeholder:text-white/25 outline-none focus:border-emerald-500/40 transition-colors"
            maxLength={80}
            onKeyDown={(e) => e.key === "Enter" && handlePlant()}
          />
        </div>

        {/* Category */}
        <div>
          <label className="text-xs text-white/60 block mb-1">Category</label>
          <div className="flex gap-1.5 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={cn(
                  "px-2.5 py-1 rounded-full text-[10px] font-medium transition-all border",
                  category === cat
                    ? "bg-emerald-500/25 border-emerald-500/40 text-emerald-300"
                    : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10",
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Plant button */}
        <button
          onClick={handlePlant}
          disabled={!selectedSeed || !name.trim()}
          className="w-full py-2.5 rounded-xl text-sm font-semibold bg-emerald-600/40 text-emerald-200 hover:bg-emerald-600/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-emerald-500/25"
        >
          Plant Seed
        </button>
      </motion.div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Stats Bar
// ---------------------------------------------------------------------------

function GardenStatsBar({
  plants,
  weeds,
}: {
  plants: GardenPlantData[];
  weeds: GardenWeedData[];
}) {
  const totalPlants = plants.length;
  const avgGrowth = totalPlants > 0
    ? (plants.reduce((sum, p) => sum + p.growthStage, 0) / totalPlants).toFixed(1)
    : "0";
  const weedsPulled = weeds.filter((w) => w.isPulled).length;
  const totalWeeds = weeds.length;
  const harvested = plants.filter((p) => p.isHarvested).length;
  const flourishing = plants.filter((p) => p.growthStage === 5).length;

  const stats = [
    { label: "Plants", value: totalPlants, icon: <TreePine size={12} /> },
    { label: "Avg Growth", value: avgGrowth, icon: <Leaf size={12} /> },
    { label: "Flourishing", value: flourishing, icon: <Sparkles size={12} /> },
    { label: "Harvested", value: harvested, icon: <Flower2 size={12} /> },
    { label: "Weeds Pulled", value: `${weedsPulled}/${totalWeeds}`, icon: <Bug size={12} /> },
  ];

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {stats.map((s) => (
        <div
          key={s.label}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px]"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <span className="text-emerald-400">{s.icon}</span>
          <span className="text-white/50">{s.label}:</span>
          <span className="text-white/80 font-semibold">{s.value}</span>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function GrowthGarden({
  plants,
  journalEntries,
  weeds,
  onAddPlant,
  onUpdatePlant,
  onRemovePlant,
  onAddJournalEntry,
  onAddWeed,
  onPullWeed,
  onClear,
  isClinician,
  toolSettings,
  onSettingsUpdate,
}: GrowthGardenProps) {
  const settings = { ...DEFAULT_GROWTH_GARDEN_SETTINGS, ...toolSettings } as GrowthGardenSettings;
  const [selectedPlant, setSelectedPlant] = useState<GardenPlantData | null>(null);
  const [plantingSlot, setPlantingSlot] = useState<{ x: number; y: number } | null>(null);
  // showClearConfirm removed - clear is now handled by ClinicianToolbar

  // Build grid lookup
  const plantGrid = useMemo(() => {
    const map = new Map<string, GardenPlantData>();
    plants.forEach((p) => map.set(`${p.gridX},${p.gridY}`, p));
    return map;
  }, [plants]);

  // Weeds grouped by linked plant
  const weedsByPlant = useMemo(() => {
    const map = new Map<string, GardenWeedData[]>();
    weeds.forEach((w) => {
      if (w.linkedPlantId) {
        const arr = map.get(w.linkedPlantId) ?? [];
        arr.push(w);
        map.set(w.linkedPlantId, arr);
      }
    });
    return map;
  }, [weeds]);

  // Handle planting
  const handlePlant = useCallback(
    (seedType: string, name: string, category: string) => {
      if (!plantingSlot) return;
      onAddPlant(seedType, name, category, plantingSlot.x, plantingSlot.y);
      setPlantingSlot(null);
    },
    [plantingSlot, onAddPlant],
  );

  // Handle watering
  const handleWater = useCallback(() => {
    if (!selectedPlant || selectedPlant.growthStage >= 5) return;
    onUpdatePlant(selectedPlant.id, { growthStage: selectedPlant.growthStage + 1 });
    setSelectedPlant({ ...selectedPlant, growthStage: Math.min(selectedPlant.growthStage + 1, 5) });
  }, [selectedPlant, onUpdatePlant]);

  // Keep selectedPlant in sync with props
  const currentSelectedPlant = useMemo(() => {
    if (!selectedPlant) return null;
    return plants.find((p) => p.id === selectedPlant.id) ?? null;
  }, [selectedPlant, plants]);

  const selectedJournal = useMemo(() => {
    if (!currentSelectedPlant) return [];
    return journalEntries.filter((j) => j.plantId === currentSelectedPlant.id);
  }, [currentSelectedPlant, journalEntries]);

  const selectedWeeds = useMemo(() => {
    if (!currentSelectedPlant) return [];
    return weeds.filter((w) => w.linkedPlantId === currentSelectedPlant.id);
  }, [currentSelectedPlant, weeds]);

  // SVG dimensions
  const svgW = 600;
  const svgH = 420;
  const cellW = svgW / GRID_COLS;
  const cellH = svgH / GRID_ROWS;

  // Ambient particles
  const particles = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      x: 30 + seededRand(i * 17) * (svgW - 60),
      delay: seededRand(i * 31) * 6,
    }));
  }, [svgW]);

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden select-none"
      style={{
        background: "linear-gradient(165deg, rgba(30, 40, 25, 0.95) 0%, rgba(25, 20, 15, 0.97) 50%, rgba(20, 30, 20, 0.95) 100%)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(101, 163, 13, 0.15)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)",
        minHeight: 560,
      }}
    >
      {/* Header */}
      <div className="px-5 pt-4 pb-3 flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <motion.span
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <Flower2 size={20} className="text-emerald-400" />
            </motion.span>
            Growth Garden
          </h2>
          <p className="text-xs text-white/40 mt-0.5">
            Plant goals, nurture growth, and pull the weeds that hold you back
          </p>
        </div>
        {/* Clinician clear moved to toolbar */}
      </div>

      {/* Stats */}
      <div className="px-5 pb-3">
        <GardenStatsBar plants={plants} weeds={weeds} />
      </div>

      {/* Garden SVG */}
      <div className="px-5 pb-3">
        <div
          className="relative rounded-xl overflow-hidden"
          style={{
            background: "rgba(0,0,0,0.15)",
            border: "1px solid rgba(101, 163, 13, 0.12)",
          }}
        >
          <svg
            viewBox={`0 0 ${svgW} ${svgH}`}
            className="w-full"
            style={{ display: "block" }}
          >
            {/* Background gradient */}
            <defs>
              <radialGradient id="gardenGlow" cx="50%" cy="50%" r="60%">
                <stop offset="0%" stopColor="rgba(101, 163, 13, 0.08)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0)" />
              </radialGradient>
              <filter id="harvestGlow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <rect width={svgW} height={svgH} fill="url(#gardenGlow)" />

            {/* Grid border lines (subtle) */}
            {Array.from({ length: GRID_COLS + 1 }).map((_, i) => (
              <line
                key={`v${i}`}
                x1={i * cellW}
                y1={0}
                x2={i * cellW}
                y2={svgH}
                stroke="rgba(101, 163, 13, 0.06)"
                strokeWidth={0.5}
              />
            ))}
            {Array.from({ length: GRID_ROWS + 1 }).map((_, i) => (
              <line
                key={`h${i}`}
                x1={0}
                y1={i * cellH}
                x2={svgW}
                y2={i * cellH}
                stroke="rgba(101, 163, 13, 0.06)"
                strokeWidth={0.5}
              />
            ))}

            {/* Soil plots + plants */}
            {Array.from({ length: GRID_ROWS }).map((_, row) =>
              Array.from({ length: GRID_COLS }).map((_, col) => {
                const plant = plantGrid.get(`${col},${row}`);
                const plantWeeds = plant ? (weedsByPlant.get(plant.id) ?? []) : [];
                return (
                  <SoilPlot
                    key={`${col}-${row}`}
                    col={col}
                    row={row}
                    plant={plant}
                    weeds={plantWeeds}
                    onClickEmpty={() => setPlantingSlot({ x: col, y: row })}
                    onClickPlant={(p) => setSelectedPlant(p)}
                    cellW={cellW}
                    cellH={cellH}
                  />
                );
              }),
            )}

            {/* Ambient particles */}
            {particles.map((p) => (
              <FloatingParticle key={p.id} x={p.x} delay={p.delay} />
            ))}
          </svg>

          {/* Plant detail panel overlay */}
          <AnimatePresence>
            {currentSelectedPlant && (
              <PlantDetailPanel
                plant={currentSelectedPlant}
                journal={selectedJournal}
                weeds={selectedWeeds}
                onClose={() => setSelectedPlant(null)}
                onWater={handleWater}
                onAddJournalEntry={(content, rating) =>
                  onAddJournalEntry(currentSelectedPlant.id, content, rating)
                }
                onToggleDormant={() =>
                  onUpdatePlant(currentSelectedPlant.id, { isDormant: !currentSelectedPlant.isDormant })
                }
                onToggleHarvest={() =>
                  onUpdatePlant(currentSelectedPlant.id, { isHarvested: !currentSelectedPlant.isHarvested })
                }
                onRemove={() => {
                  onRemovePlant(currentSelectedPlant.id);
                  setSelectedPlant(null);
                }}
                onAddWeed={(label) => onAddWeed(label, currentSelectedPlant.id)}
                onPullWeed={onPullWeed}
                gardenSettings={settings}
              />
            )}
          </AnimatePresence>

          {/* Planting modal */}
          <AnimatePresence>
            {plantingSlot && (
              <PlantingModal
                gridX={plantingSlot.x}
                gridY={plantingSlot.y}
                onPlant={handlePlant}
                onClose={() => setPlantingSlot(null)}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Seed legend */}
      <div className="px-5 pb-4">
        <div
          className="rounded-xl p-3"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <p className="text-[10px] text-white/40 font-medium mb-2 uppercase tracking-wider">Seed Types</p>
          <div className="flex items-center gap-3 flex-wrap">
            {SEED_TYPES.map((seed) => (
              <div key={seed.id} className="flex items-center gap-1.5">
                <svg width={16} height={16} viewBox="0 0 60 60">
                  <PlantSVG seedType={seed.id} stage={3} size={60} />
                </svg>
                <span className="text-[10px] font-medium" style={{ color: seed.color }}>{seed.label}</span>
                <span className="text-[9px] text-white/30">{seed.meaning}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-center gap-3 flex-wrap">
            <p className="text-[10px] text-white/40 font-medium uppercase tracking-wider">Stages:</p>
            {GROWTH_STAGE_LABELS.slice(1).map((label, i) => (
              <div key={label} className="flex items-center gap-1">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: `rgba(101, 163, 13, ${0.2 + i * 0.2})`,
                  }}
                />
                <span className="text-[9px] text-white/40">{i + 1}. {label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isClinician && onSettingsUpdate && (
        <ClinicianToolbar
          controls={GROWTH_GARDEN_TOOLBAR_CONTROLS}
          settings={settings}
          onUpdate={onSettingsUpdate}
          onClear={onClear}
        />
      )}
    </div>
  );
}
