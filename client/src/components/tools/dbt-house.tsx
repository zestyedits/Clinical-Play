import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { DBT_SKILLS, DBT_MODULES } from "@/lib/dbt-skills-data";
import { X, ChevronRight, Trash2, Sparkles, Star, Pencil, Home, BookOpen } from "lucide-react";
import { playClickSound } from "@/lib/audio-feedback";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DbtHouseSkillData {
  id: string;
  skillId: string;
  module: string;
  houseSection: string;
  personalExample?: string | null;
  practiceCount: number;
  lastPracticedAt?: string | null;
  effectivenessAvg?: number | null;
  createdBy: string;
  createdAt: string;
}

export interface DbtHouseProps {
  skills: DbtHouseSkillData[];
  onPlaceSkill: (
    skillId: string,
    module: string,
    houseSection: string,
    personalExample?: string,
  ) => void;
  onUpdateSkill: (skillPlacementId: string, updates: any) => void;
  onRemoveSkill: (skillPlacementId: string) => void;
  onClear: () => void;
  isClinician: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MODULE_COLOR_MAP: Record<string, string> = {
  mindfulness: "#3B82F6",
  "distress-tolerance": "#22C55E",
  "emotion-regulation": "#F97316",
  "interpersonal-effectiveness": "#8B5CF6",
};

const SECTION_MODULE_MAP: Record<string, string> = {
  foundation: "mindfulness",
  "left-wall": "distress-tolerance",
  "right-wall": "emotion-regulation",
  roof: "interpersonal-effectiveness",
};

const SECTION_LABELS: Record<string, string> = {
  foundation: "Mindfulness",
  "left-wall": "Distress Tolerance",
  "right-wall": "Emotion Regulation",
  roof: "Interpersonal Effectiveness",
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Wise Mind compass rendered in the foundation section */
function WiseMindCompass({ fillRatio }: { fillRatio: number }) {
  const wobble = (1 - fillRatio) * 25;
  return (
    <motion.g>
      <circle cx="300" cy="440" r="22" fill="none" stroke="rgba(59,130,246,0.5)" strokeWidth="1.5" />
      <text x="270" y="444" fontSize="7" fill="rgba(59,130,246,0.7)" fontWeight="600" textAnchor="middle">
        Emotion
      </text>
      <text x="330" y="444" fontSize="7" fill="rgba(59,130,246,0.7)" fontWeight="600" textAnchor="middle">
        Reason
      </text>
      <motion.line
        x1="300"
        y1="440"
        x2="300"
        y2="422"
        stroke="#3B82F6"
        strokeWidth="2"
        strokeLinecap="round"
        animate={{ rotate: [wobble, -wobble, wobble * 0.5, -wobble * 0.3, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{ originX: "300px", originY: "440px", transformBox: "fill-box" }}
      />
      <circle cx="300" cy="440" r="3" fill="#3B82F6" />
      <text x="300" y="464" fontSize="6" fill="rgba(59,130,246,0.6)" textAnchor="middle">
        Wise Mind
      </text>
    </motion.g>
  );
}

/** Small glassmorphic tile for a placed skill */
function PlacedSkillTile({
  placement,
  onClick,
}: {
  placement: DbtHouseSkillData;
  onClick: () => void;
}) {
  const skill = DBT_SKILLS.find((s) => s.id === placement.skillId);
  if (!skill) return null;
  return (
    <motion.div
      layout
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      whileHover={{ scale: 1.08, y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg cursor-pointer select-none"
      style={{
        background: "rgba(255,255,255,0.25)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.35)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        fontSize: "11px",
        lineHeight: 1.2,
      }}
    >
      <span>{skill.emoji}</span>
      <span className="font-medium text-gray-700 truncate max-w-[60px]">{skill.shortName}</span>
      {placement.practiceCount > 0 && (
        <span className="text-[9px] text-gray-400 ml-0.5">{placement.practiceCount}x</span>
      )}
    </motion.div>
  );
}

/** Skill detail expansion panel */
function SkillDetailPanel({
  placement,
  onUpdate,
  onRemove,
  onClose,
}: {
  placement: DbtHouseSkillData;
  onUpdate: (id: string, updates: any) => void;
  onRemove: (id: string) => void;
  onClose: () => void;
}) {
  const skill = DBT_SKILLS.find((s) => s.id === placement.skillId);
  const [example, setExample] = useState(placement.personalExample || "");
  const [editing, setEditing] = useState(false);
  const color = MODULE_COLOR_MAP[placement.module] || "#888";

  if (!skill) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="absolute inset-0 z-30 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm rounded-2xl p-5"
        style={{
          background: "rgba(255,255,255,0.75)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.5)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">{skill.emoji}</span>
          <div>
            <h3 className="font-bold text-gray-800 text-base">{skill.name}</h3>
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ background: color + "20", color }}
            >
              {SECTION_LABELS[placement.houseSection]}
            </span>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4 leading-relaxed">{skill.description}</p>

        {/* Personal example */}
        <div className="mb-4">
          <label className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
            <Pencil size={12} /> My Personal Example
          </label>
          {editing ? (
            <div className="flex flex-col gap-2">
              <textarea
                value={example}
                onChange={(e) => setExample(e.target.value)}
                placeholder="How I use this skill in my life..."
                className="w-full rounded-lg border border-gray-200 p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-200"
                rows={3}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onUpdate(placement.id, { personalExample: example });
                    setEditing(false);
                  }}
                  className="px-3 py-1 text-xs font-medium rounded-lg text-white"
                  style={{ background: color }}
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setExample(placement.personalExample || "");
                    setEditing(false);
                  }}
                  className="px-3 py-1 text-xs font-medium rounded-lg text-gray-500 bg-gray-100"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => setEditing(true)}
              className="w-full rounded-lg border border-dashed border-gray-300 p-2 text-sm text-gray-500 cursor-pointer hover:border-gray-400 transition-colors min-h-[40px]"
            >
              {placement.personalExample || "Tap to add your personal example..."}
            </div>
          )}
        </div>

        {/* Practice count */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Star size={14} className="text-amber-500" />
            <span className="text-sm text-gray-600">
              Practiced <strong>{placement.practiceCount}</strong> time{placement.practiceCount !== 1 ? "s" : ""}
            </span>
          </div>
          <button
            onClick={() =>
              onUpdate(placement.id, { practiceCount: placement.practiceCount + 1 })
            }
            className="px-3 py-1 text-xs font-medium rounded-lg text-white"
            style={{ background: color }}
          >
            +1 Practice
          </button>
        </div>

        {placement.lastPracticedAt && (
          <p className="text-xs text-gray-400 mb-3">
            Last practiced: {new Date(placement.lastPracticedAt).toLocaleDateString()}
          </p>
        )}

        {placement.effectivenessAvg != null && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Effectiveness</span>
              <span>{Math.round(placement.effectivenessAvg * 100)}%</span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: color }}
                initial={{ width: 0 }}
                animate={{ width: (placement.effectivenessAvg * 100) + "%" }}
                transition={{ duration: 0.6 }}
              />
            </div>
          </div>
        )}

        <button
          onClick={() => {
            onRemove(placement.id);
            onClose();
          }}
          className="flex items-center gap-1 text-xs text-red-400 hover:text-red-500 transition-colors mt-2"
        >
          <Trash2 size={12} /> Remove from house
        </button>
      </motion.div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// House Section Geometry Helpers
// ---------------------------------------------------------------------------

interface SectionGeometry {
  x: number;
  y: number;
  width: number;
  height: number;
}

const HOUSE_SECTIONS: Record<string, SectionGeometry> = {
  roof: { x: 100, y: 40, width: 400, height: 120 },
  "left-wall": { x: 100, y: 165, width: 185, height: 220 },
  "right-wall": { x: 315, y: 165, width: 185, height: 220 },
  foundation: { x: 80, y: 390, width: 440, height: 100 },
};

/** Shimmer animation overlay for SVG paths */
function SvgShimmer({ id, color }: { id: string; color: string }) {
  return (
    <motion.rect
      x="0"
      y="0"
      width="600"
      height="500"
      fill={`url(#shimmer-${id})`}
      opacity="0.15"
      animate={{ x: [-600, 600] }}
      transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
    >
      <defs>
        <linearGradient id={`shimmer-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="40%" stopColor={color} stopOpacity="0" />
          <stop offset="50%" stopColor={color} stopOpacity="0.5" />
          <stop offset="60%" stopColor={color} stopOpacity="0" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
    </motion.rect>
  );
}

// ---------------------------------------------------------------------------
// Skill Library Item
// ---------------------------------------------------------------------------

function SkillLibraryItem({
  skill,
  isPlaced,
  onSelect,
}: {
  skill: (typeof DBT_SKILLS)[number];
  isPlaced: boolean;
  onSelect: () => void;
}) {
  const moduleColor = MODULE_COLOR_MAP[skill.module] || "#888";
  return (
    <motion.button
      whileHover={{ scale: 1.03, x: 4 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => {
        if (!isPlaced) {
          playClickSound();
          onSelect();
        }
      }}
      disabled={isPlaced}
      className={cn(
        "w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all duration-200",
        isPlaced
          ? "opacity-40 cursor-not-allowed"
          : "cursor-pointer hover:bg-white/[0.08]"
      )}
      style={{
        background: isPlaced ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.04)",
        border: `1px solid ${isPlaced ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.08)"}`,
      }}
    >
      <span className="text-lg flex-shrink-0">{skill.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white/90 truncate">{skill.shortName}</p>
        <p className="text-[10px] text-white/40 truncate">{skill.description}</p>
      </div>
      {isPlaced ? (
        <span className="text-[10px] text-emerald-400/80 font-medium flex-shrink-0">Placed</span>
      ) : (
        <ChevronRight size={14} className="text-white/30 flex-shrink-0" />
      )}
    </motion.button>
  );
}

// ---------------------------------------------------------------------------
// Module Tab Button
// ---------------------------------------------------------------------------

function ModuleTab({
  module,
  isActive,
  count,
  total,
  onClick,
}: {
  module: (typeof DBT_MODULES)[number];
  isActive: boolean;
  count: number;
  total: number;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      onClick={() => {
        playClickSound();
        onClick();
      }}
      className={cn(
        "relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
        isActive ? "text-white" : "text-white/50 hover:text-white/70"
      )}
      style={{
        background: isActive ? module.color + "30" : "transparent",
        border: isActive ? `1px solid ${module.color}50` : "1px solid transparent",
      }}
    >
      <span
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ background: module.color }}
      />
      <span className="truncate">{module.label}</span>
      <span className="text-[10px] opacity-60">
        {count}/{total}
      </span>
    </motion.button>
  );
}

// ---------------------------------------------------------------------------
// House Section SVG Shapes
// ---------------------------------------------------------------------------

function HouseRoofPath({ glowIntensity }: { glowIntensity: number }) {
  const color = MODULE_COLOR_MAP["interpersonal-effectiveness"];
  return (
    <g>
      {/* Roof triangle */}
      <defs>
        <linearGradient id="roof-grad" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0.05" />
        </linearGradient>
        <filter id="roof-glow">
          <feGaussianBlur stdDeviation={2 + glowIntensity * 6} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <motion.polygon
        points="300,20 520,155 80,155"
        fill="url(#roof-grad)"
        stroke={color}
        strokeWidth="1.5"
        strokeOpacity={0.3 + glowIntensity * 0.5}
        filter={glowIntensity > 0.3 ? "url(#roof-glow)" : undefined}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
      {/* Roof label */}
      <text
        x="300"
        y="85"
        textAnchor="middle"
        fontSize="10"
        fill={color}
        opacity="0.7"
        fontWeight="600"
      >
        Interpersonal Effectiveness
      </text>
      <text
        x="300"
        y="98"
        textAnchor="middle"
        fontSize="8"
        fill={color}
        opacity="0.4"
      >
        ROOF
      </text>
    </g>
  );
}

function HouseLeftWallPath({ glowIntensity }: { glowIntensity: number }) {
  const color = MODULE_COLOR_MAP["distress-tolerance"];
  return (
    <g>
      <defs>
        <linearGradient id="lwall-grad" x1="100%" y1="0%" x2="0%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity="0.12" />
          <stop offset="100%" stopColor={color} stopOpacity="0.04" />
        </linearGradient>
        <filter id="lwall-glow">
          <feGaussianBlur stdDeviation={2 + glowIntensity * 6} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <motion.rect
        x="80"
        y="155"
        width="210"
        height="235"
        rx="4"
        fill="url(#lwall-grad)"
        stroke={color}
        strokeWidth="1.5"
        strokeOpacity={0.25 + glowIntensity * 0.5}
        filter={glowIntensity > 0.3 ? "url(#lwall-glow)" : undefined}
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
      />
      {/* Window decoration */}
      <rect x="140" y="210" width="45" height="55" rx="3" fill="none" stroke={color} strokeWidth="0.8" strokeOpacity="0.2" />
      <line x1="162.5" y1="210" x2="162.5" y2="265" stroke={color} strokeWidth="0.5" strokeOpacity="0.15" />
      <line x1="140" y1="237.5" x2="185" y2="237.5" stroke={color} strokeWidth="0.5" strokeOpacity="0.15" />
      <text x="185" y="180" textAnchor="middle" fontSize="10" fill={color} opacity="0.7" fontWeight="600">
        Distress Tolerance
      </text>
      <text x="185" y="193" textAnchor="middle" fontSize="8" fill={color} opacity="0.4">
        LEFT WALL
      </text>
    </g>
  );
}

function HouseRightWallPath({ glowIntensity }: { glowIntensity: number }) {
  const color = MODULE_COLOR_MAP["emotion-regulation"];
  return (
    <g>
      <defs>
        <linearGradient id="rwall-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity="0.12" />
          <stop offset="100%" stopColor={color} stopOpacity="0.04" />
        </linearGradient>
        <filter id="rwall-glow">
          <feGaussianBlur stdDeviation={2 + glowIntensity * 6} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <motion.rect
        x="310"
        y="155"
        width="210"
        height="235"
        rx="4"
        fill="url(#rwall-grad)"
        stroke={color}
        strokeWidth="1.5"
        strokeOpacity={0.25 + glowIntensity * 0.5}
        filter={glowIntensity > 0.3 ? "url(#rwall-glow)" : undefined}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
      />
      {/* Window decoration */}
      <rect x="370" y="210" width="45" height="55" rx="3" fill="none" stroke={color} strokeWidth="0.8" strokeOpacity="0.2" />
      <line x1="392.5" y1="210" x2="392.5" y2="265" stroke={color} strokeWidth="0.5" strokeOpacity="0.15" />
      <line x1="370" y1="237.5" x2="415" y2="237.5" stroke={color} strokeWidth="0.5" strokeOpacity="0.15" />
      <text x="415" y="180" textAnchor="middle" fontSize="10" fill={color} opacity="0.7" fontWeight="600">
        Emotion Regulation
      </text>
      <text x="415" y="193" textAnchor="middle" fontSize="8" fill={color} opacity="0.4">
        RIGHT WALL
      </text>
    </g>
  );
}

function HouseFoundationPath({ glowIntensity }: { glowIntensity: number }) {
  const color = MODULE_COLOR_MAP["mindfulness"];
  return (
    <g>
      <defs>
        <linearGradient id="found-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.12" />
          <stop offset="100%" stopColor={color} stopOpacity="0.06" />
        </linearGradient>
        <filter id="found-glow">
          <feGaussianBlur stdDeviation={2 + glowIntensity * 6} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <motion.rect
        x="60"
        y="390"
        width="480"
        height="100"
        rx="6"
        fill="url(#found-grad)"
        stroke={color}
        strokeWidth="1.5"
        strokeOpacity={0.25 + glowIntensity * 0.5}
        filter={glowIntensity > 0.3 ? "url(#found-glow)" : undefined}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
      />
      {/* Foundation brickwork lines */}
      {[410, 430, 450, 470].map((y) => (
        <line key={y} x1="80" y1={y} x2="520" y2={y} stroke={color} strokeWidth="0.4" strokeOpacity="0.1" />
      ))}
      <text x="300" y="408" textAnchor="middle" fontSize="10" fill={color} opacity="0.7" fontWeight="600">
        Mindfulness
      </text>
      <text x="300" y="420" textAnchor="middle" fontSize="8" fill={color} opacity="0.4">
        FOUNDATION
      </text>
    </g>
  );
}

// ---------------------------------------------------------------------------
// Door decoration in the center of the house
// ---------------------------------------------------------------------------

function HouseDoor() {
  return (
    <g>
      <defs>
        <linearGradient id="door-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.08)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
        </linearGradient>
      </defs>
      <rect x="275" y="310" width="50" height="75" rx="25" ry="4" fill="url(#door-grad)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      <circle cx="315" cy="350" r="2.5" fill="rgba(255,255,255,0.25)" />
      <text x="300" y="360" textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.25)">
        ♡
      </text>
    </g>
  );
}

// ---------------------------------------------------------------------------
// Chimney decoration
// ---------------------------------------------------------------------------

function HouseChimney() {
  return (
    <g>
      <rect x="400" y="10" width="30" height="60" rx="2" fill="rgba(139,92,246,0.06)" stroke="rgba(139,92,246,0.15)" strokeWidth="0.8" />
      {/* Smoke particles */}
      {[0, 1, 2].map((i) => (
        <motion.circle
          key={i}
          cx={415}
          cy={10}
          r={3 + i}
          fill="rgba(255,255,255,0.08)"
          animate={{
            y: [-10 - i * 15, -40 - i * 15],
            x: [0, 5 + i * 3, -3],
            opacity: [0.15, 0.05, 0],
            scale: [1, 1.5, 2],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.8,
            ease: "easeOut",
          }}
        />
      ))}
    </g>
  );
}

// ---------------------------------------------------------------------------
// Section click overlay
// ---------------------------------------------------------------------------

function SectionClickOverlay({
  section,
  onClickSection,
}: {
  section: string;
  onClickSection: (section: string) => void;
}) {
  const geo = HOUSE_SECTIONS[section];
  if (!geo) return null;

  if (section === "roof") {
    return (
      <polygon
        points="300,20 520,155 80,155"
        fill="transparent"
        cursor="pointer"
        onClick={() => onClickSection(section)}
      />
    );
  }

  return (
    <rect
      x={section === "foundation" ? 60 : geo.x === 100 ? 80 : 310}
      y={section === "foundation" ? 390 : 155}
      width={section === "foundation" ? 480 : 210}
      height={section === "foundation" ? 100 : 235}
      fill="transparent"
      cursor="pointer"
      onClick={() => onClickSection(section)}
    />
  );
}

// ---------------------------------------------------------------------------
// Placed Skills Overlay (HTML positioned over SVG)
// ---------------------------------------------------------------------------

function PlacedSkillsOverlay({
  section,
  placements,
  onSelectPlacement,
}: {
  section: string;
  placements: DbtHouseSkillData[];
  onSelectPlacement: (p: DbtHouseSkillData) => void;
}) {
  // position mapping: percentages relative to the house container
  const positionMap: Record<string, { top: string; left: string; width: string; maxHeight: string }> = {
    roof: { top: "8%", left: "22%", width: "56%", maxHeight: "18%" },
    "left-wall": { top: "32%", left: "10%", width: "30%", maxHeight: "38%" },
    "right-wall": { top: "32%", left: "55%", width: "30%", maxHeight: "38%" },
    foundation: { top: "80%", left: "12%", width: "76%", maxHeight: "15%" },
  };

  const pos = positionMap[section];
  if (!pos || placements.length === 0) return null;

  return (
    <div
      className="absolute flex flex-wrap gap-1 items-start content-start overflow-hidden p-1"
      style={{
        top: pos.top,
        left: pos.left,
        width: pos.width,
        maxHeight: pos.maxHeight,
      }}
    >
      <AnimatePresence mode="popLayout">
        {placements.map((p) => (
          <PlacedSkillTile
            key={p.id}
            placement={p}
            onClick={() => onSelectPlacement(p)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Progress Ring
// ---------------------------------------------------------------------------

function ProgressRing({ ratio, color, size = 32 }: { ratio: number; color: string; size?: number }) {
  const r = (size - 4) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - ratio);
  return (
    <svg width={size} height={size} className="flex-shrink-0">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="2.5"
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Main DbtHouse Component
// ---------------------------------------------------------------------------

export function DbtHouse({
  skills,
  onPlaceSkill,
  onUpdateSkill,
  onRemoveSkill,
  onClear,
  isClinician,
}: DbtHouseProps) {
  const [selectedPlacement, setSelectedPlacement] = useState<DbtHouseSkillData | null>(null);
  const [activeModule, setActiveModule] = useState<string>(DBT_MODULES[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [targetSection, setTargetSection] = useState<string | null>(null);
  const [highlightSection, setHighlightSection] = useState<string | null>(null);

  // Derived data: skills grouped by section
  const skillsBySection = useMemo(() => {
    const map: Record<string, DbtHouseSkillData[]> = {
      roof: [],
      "left-wall": [],
      "right-wall": [],
      foundation: [],
    };
    for (const s of skills) {
      if (map[s.houseSection]) {
        map[s.houseSection].push(s);
      }
    }
    return map;
  }, [skills]);

  // Set of placed skill IDs
  const placedSkillIds = useMemo(() => new Set(skills.map((s) => s.skillId)), [skills]);

  // Skills for the active module tab
  const filteredLibrarySkills = useMemo(
    () => DBT_SKILLS.filter((s) => s.module === activeModule),
    [activeModule]
  );

  // Count of placed skills per module
  const placedCountByModule = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const mod of DBT_MODULES) {
      counts[mod.id] = skills.filter((s) => s.module === mod.id).length;
    }
    return counts;
  }, [skills]);

  // Total skills per module
  const totalCountByModule = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const mod of DBT_MODULES) {
      counts[mod.id] = DBT_SKILLS.filter((s) => s.module === mod.id).length;
    }
    return counts;
  }, []);

  // Glow intensities per section
  const glowIntensities = useMemo(() => {
    const intensities: Record<string, number> = {};
    for (const [section, modId] of Object.entries(SECTION_MODULE_MAP)) {
      const total = DBT_SKILLS.filter((s) => s.module === modId).length;
      const placed = skillsBySection[section]?.length || 0;
      intensities[section] = total > 0 ? placed / total : 0;
    }
    return intensities;
  }, [skillsBySection]);

  // Overall fill ratio for wise mind compass
  const overallFillRatio = useMemo(() => {
    const total = DBT_SKILLS.length;
    return total > 0 ? skills.length / total : 0;
  }, [skills]);

  // Handle placing a skill from the library
  const handlePlaceSkill = useCallback(
    (skill: (typeof DBT_SKILLS)[number]) => {
      // Find which house section this module belongs to
      const mod = DBT_MODULES.find((m) => m.id === skill.module);
      if (!mod) return;

      // If a target section was set by clicking a house section, use it
      // otherwise use the module's default section
      const section = targetSection || mod.houseSection;
      onPlaceSkill(skill.id, skill.module, section);
      setTargetSection(null);
      setHighlightSection(null);
      playClickSound();
    },
    [onPlaceSkill, targetSection]
  );

  // Handle clicking a house section to set the target
  const handleSectionClick = useCallback(
    (section: string) => {
      const modId = SECTION_MODULE_MAP[section];
      if (modId) {
        setActiveModule(modId);
        setTargetSection(section);
        setHighlightSection(section);
        setSidebarOpen(true);
        playClickSound();
      }
    },
    []
  );

  // Handle selecting a placed skill
  const handleSelectPlacement = useCallback((placement: DbtHouseSkillData) => {
    playClickSound();
    setSelectedPlacement(placement);
  }, []);

  return (
    <div className="relative w-full h-full flex overflow-hidden rounded-2xl"
      style={{
        background: "rgba(255,255,255,0.04)",
        backdropFilter: "blur(40px)",
        WebkitBackdropFilter: "blur(40px)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* ------------------------------------------------------------------ */}
      {/* Left: House Visualization */}
      {/* ------------------------------------------------------------------ */}
      <div className="relative flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Home size={18} className="text-white/60" />
            <h2 className="text-sm font-bold text-white/90 tracking-wide">DBT House</h2>
            <span className="text-[10px] text-white/30 bg-white/[0.06] px-2 py-0.5 rounded-full">
              {skills.length}/{DBT_SKILLS.length} skills
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Overall progress ring */}
            <ProgressRing ratio={overallFillRatio} color="#60A5FA" size={28} />
            {isClinician && skills.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  playClickSound();
                  onClear();
                }}
                className="text-[10px] text-red-400/70 hover:text-red-400 px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] transition-colors"
              >
                Clear All
              </motion.button>
            )}
          </div>
        </div>

        {/* SVG House + Placed Skills */}
        <div className="relative flex-1 flex items-center justify-center p-4 overflow-hidden">
          {/* Background glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse 60% 50% at 50% 60%, rgba(59,130,246,${0.03 + overallFillRatio * 0.06}) 0%, transparent 70%)`,
            }}
          />

          {/* SVG House */}
          <div className="relative w-full max-w-[560px] aspect-[600/500]">
            <svg
              viewBox="0 0 600 500"
              className="w-full h-full"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Background grid for visual richness */}
              <defs>
                <pattern id="house-grid" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
                  <line x1="0" y1="0" x2="30" y2="0" stroke="rgba(255,255,255,0.02)" strokeWidth="0.5" />
                  <line x1="0" y1="0" x2="0" y2="30" stroke="rgba(255,255,255,0.02)" strokeWidth="0.5" />
                </pattern>
                {/* Shimmer gradients for each section */}
                <linearGradient id="shimmer-roof" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="transparent" />
                  <stop offset="45%" stopColor={MODULE_COLOR_MAP["interpersonal-effectiveness"]} stopOpacity="0" />
                  <stop offset="50%" stopColor={MODULE_COLOR_MAP["interpersonal-effectiveness"]} stopOpacity="0.4" />
                  <stop offset="55%" stopColor={MODULE_COLOR_MAP["interpersonal-effectiveness"]} stopOpacity="0" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
                <linearGradient id="shimmer-lwall" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="transparent" />
                  <stop offset="45%" stopColor={MODULE_COLOR_MAP["distress-tolerance"]} stopOpacity="0" />
                  <stop offset="50%" stopColor={MODULE_COLOR_MAP["distress-tolerance"]} stopOpacity="0.4" />
                  <stop offset="55%" stopColor={MODULE_COLOR_MAP["distress-tolerance"]} stopOpacity="0" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
                <linearGradient id="shimmer-rwall" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="transparent" />
                  <stop offset="45%" stopColor={MODULE_COLOR_MAP["emotion-regulation"]} stopOpacity="0" />
                  <stop offset="50%" stopColor={MODULE_COLOR_MAP["emotion-regulation"]} stopOpacity="0.4" />
                  <stop offset="55%" stopColor={MODULE_COLOR_MAP["emotion-regulation"]} stopOpacity="0" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
                <linearGradient id="shimmer-found" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="transparent" />
                  <stop offset="45%" stopColor={MODULE_COLOR_MAP["mindfulness"]} stopOpacity="0" />
                  <stop offset="50%" stopColor={MODULE_COLOR_MAP["mindfulness"]} stopOpacity="0.4" />
                  <stop offset="55%" stopColor={MODULE_COLOR_MAP["mindfulness"]} stopOpacity="0" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>

              {/* Grid background */}
              <rect width="600" height="500" fill="url(#house-grid)" />

              {/* Chimney */}
              <HouseChimney />

              {/* House sections */}
              <HouseRoofPath glowIntensity={glowIntensities["roof"] || 0} />
              <HouseLeftWallPath glowIntensity={glowIntensities["left-wall"] || 0} />
              <HouseRightWallPath glowIntensity={glowIntensities["right-wall"] || 0} />
              <HouseFoundationPath glowIntensity={glowIntensities["foundation"] || 0} />

              {/* Door in the center */}
              <HouseDoor />

              {/* Wise Mind compass in the foundation center */}
              <WiseMindCompass fillRatio={overallFillRatio} />

              {/* Shimmer animations per section */}
              <clipPath id="clip-roof">
                <polygon points="300,20 520,155 80,155" />
              </clipPath>
              <clipPath id="clip-lwall">
                <rect x="80" y="155" width="210" height="235" />
              </clipPath>
              <clipPath id="clip-rwall">
                <rect x="310" y="155" width="210" height="235" />
              </clipPath>
              <clipPath id="clip-found">
                <rect x="60" y="390" width="480" height="100" />
              </clipPath>

              {glowIntensities["roof"] > 0 && (
                <g clipPath="url(#clip-roof)">
                  <motion.rect
                    x="-600"
                    y="20"
                    width="600"
                    height="135"
                    fill="url(#shimmer-roof)"
                    opacity="0.3"
                    animate={{ x: [-600, 600] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: "linear", repeatDelay: 4 }}
                  />
                </g>
              )}
              {glowIntensities["left-wall"] > 0 && (
                <g clipPath="url(#clip-lwall)">
                  <motion.rect
                    x="-600"
                    y="155"
                    width="600"
                    height="235"
                    fill="url(#shimmer-lwall)"
                    opacity="0.25"
                    animate={{ x: [-600, 600] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear", repeatDelay: 3 }}
                  />
                </g>
              )}
              {glowIntensities["right-wall"] > 0 && (
                <g clipPath="url(#clip-rwall)">
                  <motion.rect
                    x="-600"
                    y="155"
                    width="600"
                    height="235"
                    fill="url(#shimmer-rwall)"
                    opacity="0.25"
                    animate={{ x: [-600, 600] }}
                    transition={{ duration: 3.8, repeat: Infinity, ease: "linear", repeatDelay: 5 }}
                  />
                </g>
              )}
              {glowIntensities["foundation"] > 0 && (
                <g clipPath="url(#clip-found)">
                  <motion.rect
                    x="-600"
                    y="390"
                    width="600"
                    height="100"
                    fill="url(#shimmer-found)"
                    opacity="0.3"
                    animate={{ x: [-600, 600] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 3.5 }}
                  />
                </g>
              )}

              {/* Highlight overlay when a section is targeted */}
              {highlightSection === "roof" && (
                <motion.polygon
                  points="300,20 520,155 80,155"
                  fill={MODULE_COLOR_MAP["interpersonal-effectiveness"]}
                  fillOpacity="0.12"
                  initial={{ fillOpacity: 0 }}
                  animate={{ fillOpacity: [0.05, 0.15, 0.05] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
              {highlightSection === "left-wall" && (
                <motion.rect
                  x="80" y="155" width="210" height="235" rx="4"
                  fill={MODULE_COLOR_MAP["distress-tolerance"]}
                  fillOpacity="0.12"
                  initial={{ fillOpacity: 0 }}
                  animate={{ fillOpacity: [0.05, 0.15, 0.05] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
              {highlightSection === "right-wall" && (
                <motion.rect
                  x="310" y="155" width="210" height="235" rx="4"
                  fill={MODULE_COLOR_MAP["emotion-regulation"]}
                  fillOpacity="0.12"
                  initial={{ fillOpacity: 0 }}
                  animate={{ fillOpacity: [0.05, 0.15, 0.05] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
              {highlightSection === "foundation" && (
                <motion.rect
                  x="60" y="390" width="480" height="100" rx="6"
                  fill={MODULE_COLOR_MAP["mindfulness"]}
                  fillOpacity="0.12"
                  initial={{ fillOpacity: 0 }}
                  animate={{ fillOpacity: [0.05, 0.15, 0.05] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}

              {/* Clickable section overlays */}
              {Object.keys(SECTION_MODULE_MAP).map((section) => (
                <SectionClickOverlay
                  key={section}
                  section={section}
                  onClickSection={handleSectionClick}
                />
              ))}

              {/* Completion sparkles when house is >75% filled */}
              {overallFillRatio > 0.75 && (
                <g>
                  {[
                    { cx: 150, cy: 80, delay: 0 },
                    { cx: 450, cy: 80, delay: 0.5 },
                    { cx: 100, cy: 300, delay: 1.0 },
                    { cx: 500, cy: 300, delay: 1.5 },
                    { cx: 300, cy: 15, delay: 0.3 },
                    { cx: 200, cy: 450, delay: 0.8 },
                    { cx: 400, cy: 450, delay: 1.2 },
                  ].map((spark, i) => (
                    <motion.circle
                      key={i}
                      cx={spark.cx}
                      cy={spark.cy}
                      r="2"
                      fill="rgba(250,204,21,0.6)"
                      animate={{
                        opacity: [0, 0.8, 0],
                        scale: [0.5, 1.5, 0.5],
                        y: [0, -8, 0],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        delay: spark.delay,
                        ease: "easeInOut",
                      }}
                    />
                  ))}
                </g>
              )}
            </svg>

            {/* Placed skill tiles positioned over the SVG */}
            {Object.keys(SECTION_MODULE_MAP).map((section) => (
              <PlacedSkillsOverlay
                key={section}
                section={section}
                placements={skillsBySection[section] || []}
                onSelectPlacement={handleSelectPlacement}
              />
            ))}
          </div>

          {/* Section legend at the bottom */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-3">
            {DBT_MODULES.map((mod) => (
              <div key={mod.id} className="flex items-center gap-1">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: mod.color }}
                />
                <span className="text-[9px] text-white/40">{mod.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Right: Skill Library Sidebar */}
      {/* ------------------------------------------------------------------ */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="relative flex flex-col border-l border-white/[0.06] overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.02)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
            }}
          >
            {/* Sidebar header */}
            <div className="flex items-center justify-between px-3 py-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-1.5">
                <BookOpen size={14} className="text-white/50" />
                <span className="text-xs font-bold text-white/80">Skill Library</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  playClickSound();
                  setSidebarOpen(false);
                }}
                className="text-white/30 hover:text-white/60 transition-colors"
              >
                <X size={14} />
              </motion.button>
            </div>

            {/* Module tabs */}
            <div className="flex flex-wrap gap-1 p-2 border-b border-white/[0.06]">
              {DBT_MODULES.map((mod) => (
                <ModuleTab
                  key={mod.id}
                  module={mod}
                  isActive={activeModule === mod.id}
                  count={placedCountByModule[mod.id] || 0}
                  total={totalCountByModule[mod.id] || 0}
                  onClick={() => setActiveModule(mod.id)}
                />
              ))}
            </div>

            {/* Target section indicator */}
            <AnimatePresence>
              {targetSection && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center justify-between px-3 py-2 bg-white/[0.04] border-b border-white/[0.06]">
                    <div className="flex items-center gap-1.5">
                      <Sparkles size={12} className="text-amber-400/70" />
                      <span className="text-[10px] text-white/60">
                        Placing in: <strong className="text-white/80">{SECTION_LABELS[targetSection]}</strong>
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setTargetSection(null);
                        setHighlightSection(null);
                      }}
                      className="text-[10px] text-white/30 hover:text-white/50"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Skill list */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-white/10">
              <AnimatePresence mode="popLayout">
                {filteredLibrarySkills.map((skill) => (
                  <motion.div
                    key={skill.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <SkillLibraryItem
                      skill={skill}
                      isPlaced={placedSkillIds.has(skill.id)}
                      onSelect={() => handlePlaceSkill(skill)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>

              {filteredLibrarySkills.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-white/30">
                  <Sparkles size={24} className="mb-2 opacity-50" />
                  <p className="text-xs">No skills in this module</p>
                </div>
              )}
            </div>

            {/* Module progress bar at bottom */}
            <div className="px-3 py-2 border-t border-white/[0.06]">
              {(() => {
                const mod = DBT_MODULES.find((m) => m.id === activeModule);
                const placed = placedCountByModule[activeModule] || 0;
                const total = totalCountByModule[activeModule] || 1;
                const ratio = placed / total;
                return (
                  <div>
                    <div className="flex justify-between text-[10px] text-white/40 mb-1">
                      <span>{mod?.label || ""} Progress</span>
                      <span>{Math.round(ratio * 100)}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: mod?.color || "#888" }}
                        initial={{ width: 0 }}
                        animate={{ width: `${ratio * 100}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                );
              })()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle sidebar button when collapsed */}
      {!sidebarOpen && (
        <motion.button
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            playClickSound();
            setSidebarOpen(true);
          }}
          className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] text-white/60 hover:text-white/80 transition-colors"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          <BookOpen size={12} />
          Skills
        </motion.button>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Skill Detail Panel Overlay */}
      {/* ------------------------------------------------------------------ */}
      <AnimatePresence>
        {selectedPlacement && (
          <SkillDetailPanel
            placement={selectedPlacement}
            onUpdate={onUpdateSkill}
            onRemove={onRemoveSkill}
            onClose={() => setSelectedPlacement(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
