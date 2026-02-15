import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FEELING_WHEEL_DATA, type EmotionNode } from "@/lib/feeling-wheel-data";
import { RotateCcw, Sparkles, Type, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { playClickSound } from "@/lib/audio-feedback";
import { ClinicianToolbar, type ToolbarControl } from "./clinician-toolbar";

export interface FeelingSelection {
  id: string;
  primaryEmotion: string;
  secondaryEmotion: string | null;
  tertiaryEmotion: string | null;
  selectedBy: string | null;
  participantId?: string;
  displayName?: string;
  timestamp?: number;
}

interface FeelingWheelSVGProps {
  selections: FeelingSelection[];
  onSelect: (primary: string, secondary: string | null, tertiary: string | null) => void;
  onClear: () => void;
  isClinician: boolean;
  onAuraColor?: (color: string | null) => void;
  toolSettings?: Record<string, any>;
  onSettingsUpdate?: (updates: Record<string, any>) => void;
}

// ─── Clinician Toolbar Settings ──────────────────────────────────────────────

interface FeelingWheelSettings {
  showLabels: boolean;
  wheelDepth: number;
}

const DEFAULT_FEELING_WHEEL_SETTINGS: FeelingWheelSettings = {
  showLabels: true,
  wheelDepth: 3,
};

const FEELING_WHEEL_TOOLBAR_CONTROLS: ToolbarControl[] = [
  { type: "toggle", key: "showLabels", icon: Type, label: "Labels", activeColor: "sky" },
  {
    type: "cycle",
    key: "wheelDepth",
    icon: Circle,
    options: [
      { value: 1, label: "Core Only" },
      { value: 2, label: "2 Rings" },
      { value: 3, label: "All Rings" },
    ],
    label: "Depth",
    activeColor: "purple",
  },
];

const SVG_SIZE = 400;
const CENTER = SVG_SIZE / 2;
const INNER_R1 = 45;
const INNER_R2 = 90;
const MID_R1 = 90;
const MID_R2 = 150;
const OUTER_R1 = 150;
const OUTER_R2 = 195;

function describeArc(cx: number, cy: number, r1: number, r2: number, startAngle: number, endAngle: number): string {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const cos = Math.cos;
  const sin = Math.sin;

  const s1 = toRad(startAngle);
  const e1 = toRad(endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  const x1 = cx + r2 * cos(s1);
  const y1 = cy + r2 * sin(s1);
  const x2 = cx + r2 * cos(e1);
  const y2 = cy + r2 * sin(e1);
  const x3 = cx + r1 * cos(e1);
  const y3 = cy + r1 * sin(e1);
  const x4 = cx + r1 * cos(s1);
  const y4 = cy + r1 * sin(s1);

  return [
    `M ${x1} ${y1}`,
    `A ${r2} ${r2} 0 ${largeArc} 1 ${x2} ${y2}`,
    `L ${x3} ${y3}`,
    `A ${r1} ${r1} 0 ${largeArc} 0 ${x4} ${y4}`,
    "Z",
  ].join(" ");
}

function midAngle(start: number, end: number): number {
  return (start + end) / 2;
}

function polarToCart(cx: number, cy: number, r: number, angleDeg: number): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function WedgeLabel({ cx, cy, r, startAngle, endAngle, label, fontSize = 9 }: {
  cx: number; cy: number; r: number; startAngle: number; endAngle: number; label: string; fontSize?: number;
}) {
  const mid = midAngle(startAngle, endAngle);
  const pos = polarToCart(cx, cy, r, mid);
  const rotation = mid > 90 && mid < 270 ? mid + 180 : mid;

  return (
    <text
      x={pos.x}
      y={pos.y}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={fontSize}
      fontWeight={600}
      fill="rgba(0,0,0,0.75)"
      transform={`rotate(${rotation}, ${pos.x}, ${pos.y})`}
      className="pointer-events-none select-none"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {label}
    </text>
  );
}

function WedgeEmoji({ cx, cy, r, startAngle, endAngle, emoji, size = 16 }: {
  cx: number; cy: number; r: number; startAngle: number; endAngle: number; emoji: string; size?: number;
}) {
  const mid = midAngle(startAngle, endAngle);
  const pos = polarToCart(cx, cy, r, mid);

  return (
    <text
      x={pos.x}
      y={pos.y}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={size}
      className="pointer-events-none select-none"
    >
      {emoji}
    </text>
  );
}

function getEmotionColor(primaryLabel: string): string {
  const emotion = FEELING_WHEEL_DATA.find(e => e.label === primaryLabel);
  return emotion?.color || "#D4AF37";
}

function getEmotionEmoji(primaryLabel: string): string {
  const emotion = FEELING_WHEEL_DATA.find(e => e.label === primaryLabel);
  return emotion?.emoji || "";
}

export function FeelingWheelSVG({ selections, onSelect, onClear, isClinician, onAuraColor, toolSettings, onSettingsUpdate }: FeelingWheelSVGProps) {
  const settings = { ...DEFAULT_FEELING_WHEEL_SETTINGS, ...toolSettings } as FeelingWheelSettings;
  const [expandedPrimary, setExpandedPrimary] = useState<string | null>(null);
  const [expandedSecondary, setExpandedSecondary] = useState<string | null>(null);
  const [hoveredWedge, setHoveredWedge] = useState<string | null>(null);
  const [sparklePos, setSparklePos] = useState<{ x: number; y: number } | null>(null);
  const [completedSelection, setCompletedSelection] = useState<{
    primary: string; secondary: string; tertiary: string;
    primaryAngle: number; secondaryAngle: number; tertiaryAngle: number;
  } | null>(null);

  const selectedPrimary = useMemo(() => FEELING_WHEEL_DATA.find(e => e.label === expandedPrimary), [expandedPrimary]);
  const selectedSecondary = useMemo(
    () => selectedPrimary?.children?.find(e => e.label === expandedSecondary),
    [selectedPrimary, expandedSecondary]
  );

  const primaryCount = FEELING_WHEEL_DATA.length;
  const primaryArcAngle = 360 / primaryCount;

  const handlePrimaryClick = useCallback((label: string) => {
    playClickSound();
    setExpandedPrimary(prev => prev === label ? null : label);
    setExpandedSecondary(null);
    setCompletedSelection(null);
  }, []);

  const handleSecondaryClick = useCallback((label: string) => {
    playClickSound();
    setExpandedSecondary(prev => prev === label ? null : label);
    setCompletedSelection(null);
  }, []);

  const handleTertiaryClick = useCallback((primaryLabel: string, secondaryLabel: string, tertiaryLabel: string, tertiaryAngle: number) => {
    playClickSound();
    onSelect(primaryLabel, secondaryLabel, tertiaryLabel);

    // Sparkle at the selection point
    const pos = polarToCart(CENTER, CENTER, (OUTER_R1 + OUTER_R2) / 2, tertiaryAngle);
    setSparklePos({ x: pos.x, y: pos.y });
    setTimeout(() => setSparklePos(null), 1200);

    // Compute angles for golden thread
    const primaryIdx = FEELING_WHEEL_DATA.findIndex(e => e.label === primaryLabel);
    const primaryMid = primaryIdx * primaryArcAngle + primaryArcAngle / 2 - 90;
    const primary = FEELING_WHEEL_DATA[primaryIdx];
    const secondaryIdx = primary.children?.findIndex(e => e.label === secondaryLabel) ?? 0;
    const secCount = primary.children?.length ?? 1;
    const secArc = primaryArcAngle / secCount;
    const secondaryMid = primaryIdx * primaryArcAngle + secondaryIdx * secArc + secArc / 2 - 90;

    setCompletedSelection({
      primary: primaryLabel,
      secondary: secondaryLabel,
      tertiary: tertiaryLabel,
      primaryAngle: primaryMid,
      secondaryAngle: secondaryMid,
      tertiaryAngle: tertiaryAngle - 90,
    });
  }, [onSelect, primaryArcAngle]);

  const handleWedgeHover = useCallback((color: string | null) => {
    setHoveredWedge(color);
    onAuraColor?.(color);
  }, [onAuraColor]);

  const latestSelection = selections.length > 0 ? selections[selections.length - 1] : null;

  return (
    <div className="h-full flex flex-col items-center justify-center p-4 overflow-auto relative">
      {/* Reactive background aura - shifts with hovered/selected emotion */}
      <div className="absolute inset-0 transition-all duration-700" style={{
        background: expandedPrimary
          ? `radial-gradient(ellipse 80% 70% at 50% 45%, ${getEmotionColor(expandedPrimary)}12 0%, transparent 60%)`
          : "linear-gradient(145deg, #f8f6f3 0%, #f0ede8 50%, #e8e4dd 100%)",
      }} />
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute w-[60%] h-[60%] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          animate={{
            background: hoveredWedge
              ? `radial-gradient(circle, ${hoveredWedge}20 0%, transparent 70%)`
              : expandedPrimary
                ? `radial-gradient(circle, ${getEmotionColor(expandedPrimary)}10 0%, transparent 70%)`
                : "radial-gradient(circle, rgba(167,139,218,0.03) 0%, transparent 70%)",
            scale: hoveredWedge ? 1.1 : 1,
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ filter: "blur(80px)" }}
        />
      </div>

      <div className="w-full max-w-[420px] mx-auto relative z-10">
        <motion.div
          className="text-center mb-3"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="font-serif text-xl text-primary mb-1">How are you feeling?</h2>
          <p className="text-xs text-muted-foreground">Tap to explore your emotions from core to specific</p>
        </motion.div>

        <motion.div
          className="relative mx-auto"
          initial={{ opacity: 0, scale: 0.85, rotate: -15 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          style={{
            maxWidth: 400,
            maxHeight: 400,
            aspectRatio: "1",
            ...(hoveredWedge ? { filter: `drop-shadow(0 0 30px ${hoveredWedge}40)` } : {}),
            transition: "filter 0.3s ease",
          }}
        >
          <svg viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`} className="w-full h-full">
            <defs>
              {/* Wedge gradients for depth */}
              {FEELING_WHEEL_DATA.map((emotion, i) => (
                <radialGradient key={`wedge-grad-${i}`} id={`wedge-grad-${i}`} cx="50%" cy="50%" r="80%">
                  <stop offset="0%" stopColor={emotion.color} stopOpacity="1" />
                  <stop offset="100%" stopColor={emotion.color} stopOpacity="0.7" />
                </radialGradient>
              ))}
              {/* Center glass orb */}
              <radialGradient id="center-orb" cx="40%" cy="35%" r="60%">
                <stop offset="0%" stopColor="rgba(255,255,255,1)" />
                <stop offset="50%" stopColor="rgba(255,255,255,0.95)" />
                <stop offset="100%" stopColor="rgba(240,237,230,0.9)" />
              </radialGradient>
              <filter id="center-shadow">
                <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="rgba(27,42,74,0.15)" />
              </filter>
              {/* Glow filter for active wedges */}
              <filter id="wedge-glow">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              {/* Sparkle burst filter */}
              <filter id="sparkle-glow">
                <feGaussianBlur stdDeviation="2" />
              </filter>
            </defs>

            {/* Subtle ring guides */}
            <circle cx={CENTER} cy={CENTER} r={INNER_R2} fill="none" stroke="rgba(0,0,0,0.03)" strokeWidth="0.5" />
            {settings.wheelDepth >= 2 && <circle cx={CENTER} cy={CENTER} r={MID_R2} fill="none" stroke="rgba(0,0,0,0.03)" strokeWidth="0.5" />}
            {settings.wheelDepth >= 3 && <circle cx={CENTER} cy={CENTER} r={OUTER_R2} fill="none" stroke="rgba(0,0,0,0.03)" strokeWidth="0.5" />}

            {/* Inner ring: Primary emotions */}
            {FEELING_WHEEL_DATA.map((emotion, i) => {
              const startAngle = i * primaryArcAngle - 90;
              const endAngle = startAngle + primaryArcAngle;
              const isExpanded = expandedPrimary === emotion.label;
              const isHovered = hoveredWedge === emotion.color;
              const mid = midAngle(startAngle, endAngle);
              const hoverOffset = isHovered || isExpanded ? 3 : 0;
              const pos = polarToCart(0, 0, hoverOffset, mid);

              return (
                <g key={emotion.label} style={{ transition: "transform 0.3s ease" }}>
                  <path
                    d={describeArc(CENTER + pos.x, CENTER + pos.y, INNER_R1, INNER_R2, startAngle, endAngle)}
                    fill={`url(#wedge-grad-${i})`}
                    stroke="rgba(255,255,255,0.6)"
                    strokeWidth={1}
                    opacity={isExpanded ? 1 : expandedPrimary ? 0.5 : 0.85}
                    className="cursor-pointer"
                    style={{
                      transition: "opacity 0.4s ease, filter 0.3s ease",
                      filter: isExpanded ? `drop-shadow(0 0 12px ${emotion.color}80)` : isHovered ? `drop-shadow(0 0 20px ${emotion.color})` : "none",
                    }}
                    onClick={() => handlePrimaryClick(emotion.label)}
                    onPointerEnter={() => handleWedgeHover(emotion.color)}
                    onPointerLeave={() => handleWedgeHover(null)}
                  />
                  {/* Emoji in wedge */}
                  {settings.showLabels && emotion.emoji && (
                    <WedgeEmoji
                      cx={CENTER + pos.x}
                      cy={CENTER + pos.y}
                      r={(INNER_R1 + INNER_R2) / 2 - 5}
                      startAngle={startAngle}
                      endAngle={endAngle}
                      emoji={emotion.emoji}
                      size={isExpanded ? 18 : 14}
                    />
                  )}
                  {settings.showLabels && (
                    <WedgeLabel
                      cx={CENTER + pos.x}
                      cy={CENTER + pos.y}
                      r={(INNER_R1 + INNER_R2) / 2 + 10}
                      startAngle={startAngle}
                      endAngle={endAngle}
                      label={emotion.label}
                      fontSize={9}
                    />
                  )}
                </g>
              );
            })}

            {/* Middle ring: Secondary emotions */}
            <AnimatePresence>
              {settings.wheelDepth >= 2 && selectedPrimary && selectedPrimary.children && (() => {
                const primaryIdx = FEELING_WHEEL_DATA.findIndex(e => e.label === expandedPrimary);
                const parentStart = primaryIdx * primaryArcAngle - 90;
                const secCount = selectedPrimary.children.length;
                const secArc = primaryArcAngle / secCount;

                return selectedPrimary.children.map((sec, j) => {
                  const startAngle = parentStart + j * secArc;
                  const endAngle = startAngle + secArc;
                  const isExpanded = expandedSecondary === sec.label;
                  const isHovered = hoveredWedge === sec.color + sec.label;
                  const mid = midAngle(startAngle, endAngle);
                  const hoverOffset = isHovered || isExpanded ? 5 : 0;
                  const pos = polarToCart(0, 0, hoverOffset, mid);

                  return (
                    <motion.g
                      key={sec.label}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ delay: j * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <path
                        d={describeArc(CENTER + pos.x, CENTER + pos.y, MID_R1, MID_R2, startAngle, endAngle)}
                        fill={sec.color}
                        stroke="rgba(255,255,255,0.5)"
                        strokeWidth={0.75}
                        opacity={isExpanded ? 1 : expandedSecondary ? 0.55 : 0.85}
                        className="cursor-pointer"
                        style={{
                          transition: "opacity 0.4s ease, filter 0.3s ease",
                          filter: isExpanded ? `drop-shadow(0 0 10px ${sec.color}80)` : isHovered ? `drop-shadow(0 0 20px ${sec.color})` : "none",
                        }}
                        onClick={() => {
                          handleSecondaryClick(sec.label);
                          onSelect(expandedPrimary!, sec.label, null);
                        }}
                        onPointerEnter={() => handleWedgeHover(sec.color + sec.label)}
                        onPointerLeave={() => handleWedgeHover(null)}
                      />
                      {/* Emoji for secondary */}
                      {settings.showLabels && sec.emoji && (
                        <WedgeEmoji
                          cx={CENTER + pos.x}
                          cy={CENTER + pos.y}
                          r={(MID_R1 + MID_R2) / 2 - 5}
                          startAngle={startAngle}
                          endAngle={endAngle}
                          emoji={sec.emoji}
                          size={12}
                        />
                      )}
                      {settings.showLabels && (
                        <WedgeLabel
                          cx={CENTER + pos.x}
                          cy={CENTER + pos.y}
                          r={(MID_R1 + MID_R2) / 2 + 10}
                          startAngle={startAngle}
                          endAngle={endAngle}
                          label={sec.label}
                          fontSize={7.5}
                        />
                      )}
                    </motion.g>
                  );
                });
              })()}
            </AnimatePresence>

            {/* Outer ring: Tertiary emotions */}
            <AnimatePresence>
              {settings.wheelDepth >= 3 && selectedSecondary && selectedSecondary.children && (() => {
                const primaryIdx = FEELING_WHEEL_DATA.findIndex(e => e.label === expandedPrimary);
                const secCount = selectedPrimary!.children!.length;
                const secArc = primaryArcAngle / secCount;
                const secIdx = selectedPrimary!.children!.findIndex(e => e.label === expandedSecondary);
                const parentStart = primaryIdx * primaryArcAngle - 90 + secIdx * secArc;
                const terCount = selectedSecondary.children.length;
                const terArc = secArc / terCount;

                return selectedSecondary.children.map((ter, k) => {
                  const startAngle = parentStart + k * terArc;
                  const endAngle = startAngle + terArc;
                  const isHovered = hoveredWedge === ter.color + ter.label;
                  const mid = midAngle(startAngle, endAngle);
                  const hoverOffset = isHovered ? 5 : 0;
                  const pos = polarToCart(0, 0, hoverOffset, mid);

                  return (
                    <motion.g
                      key={ter.label}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ delay: k * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <path
                        d={describeArc(CENTER + pos.x, CENTER + pos.y, OUTER_R1, OUTER_R2, startAngle, endAngle)}
                        fill={ter.color}
                        stroke="rgba(255,255,255,0.4)"
                        strokeWidth={0.5}
                        opacity={0.9}
                        className="cursor-pointer"
                        style={{
                          transition: "opacity 0.3s ease, filter 0.3s ease",
                          filter: isHovered ? `drop-shadow(0 0 20px ${ter.color})` : "none",
                        }}
                        onClick={() => handleTertiaryClick(expandedPrimary!, expandedSecondary!, ter.label, mid + 90)}
                        onPointerEnter={() => handleWedgeHover(ter.color + ter.label)}
                        onPointerLeave={() => handleWedgeHover(null)}
                      />
                      {settings.showLabels && (
                        <WedgeLabel
                          cx={CENTER + pos.x}
                          cy={CENTER + pos.y}
                          r={(OUTER_R1 + OUTER_R2) / 2}
                          startAngle={startAngle}
                          endAngle={endAngle}
                          label={ter.label}
                          fontSize={7}
                        />
                      )}
                    </motion.g>
                  );
                });
              })()}
            </AnimatePresence>

            {/* Golden Thread with glow */}
            {completedSelection && (() => {
              const p1 = polarToCart(CENTER, CENTER, (INNER_R1 + INNER_R2) / 2, completedSelection.primaryAngle);
              const p2 = polarToCart(CENTER, CENTER, (MID_R1 + MID_R2) / 2, completedSelection.secondaryAngle);
              const p3 = polarToCart(CENTER, CENTER, (OUTER_R1 + OUTER_R2) / 2, completedSelection.tertiaryAngle);
              const pathD = `M ${CENTER} ${CENTER} L ${p1.x} ${p1.y} L ${p2.x} ${p2.y} L ${p3.x} ${p3.y}`;
              const pathLength = 600;

              return (
                <>
                  <motion.path
                    d={pathD}
                    stroke="#D4AF37"
                    strokeWidth={6}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={0.2}
                    initial={{ strokeDasharray: pathLength, strokeDashoffset: pathLength }}
                    animate={{ strokeDashoffset: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    style={{ filter: "blur(4px)" }}
                  />
                  <motion.path
                    d={pathD}
                    stroke="#D4AF37"
                    strokeWidth={2}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ strokeDasharray: pathLength, strokeDashoffset: pathLength }}
                    animate={{ strokeDashoffset: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                  />
                  {[p1, p2, p3].map((pt, idx) => (
                    <motion.circle
                      key={idx}
                      cx={pt.x}
                      cy={pt.y}
                      r={3}
                      fill="#D4AF37"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.4 + idx * 0.2, type: "spring", stiffness: 300 }}
                    />
                  ))}
                </>
              );
            })()}

            {/* Selection sparkle burst */}
            {sparklePos && (
              <>
                {Array.from({ length: 8 }).map((_, i) => {
                  const angle = (i / 8) * Math.PI * 2;
                  return (
                    <motion.circle
                      key={`sparkle-${i}`}
                      cx={sparklePos.x}
                      cy={sparklePos.y}
                      r={2}
                      fill="#D4AF37"
                      filter="url(#sparkle-glow)"
                      initial={{ opacity: 1, cx: sparklePos.x, cy: sparklePos.y }}
                      animate={{
                        cx: sparklePos.x + Math.cos(angle) * 30,
                        cy: sparklePos.y + Math.sin(angle) * 30,
                        opacity: 0,
                        r: 0.5,
                      }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  );
                })}
              </>
            )}

            {/* Center circle - glass orb */}
            <circle
              cx={CENTER}
              cy={CENTER}
              r={INNER_R1 - 2}
              fill="url(#center-orb)"
              filter="url(#center-shadow)"
              stroke={expandedPrimary ? getEmotionColor(expandedPrimary) : "#D4AF37"}
              strokeWidth={1.5}
              style={{ transition: "stroke 0.5s ease" }}
            />
            {/* Highlight arc */}
            <path
              d={`M ${CENTER - 18} ${CENTER - 26} A 22 22 0 0 1 ${CENTER + 18} ${CENTER - 26}`}
              fill="none"
              stroke="rgba(255,255,255,0.5)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />

            {/* Center emoji or text */}
            {expandedPrimary ? (
              <>
                <text
                  x={CENTER}
                  y={CENTER - 2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={20}
                  className="pointer-events-none select-none"
                >
                  {getEmotionEmoji(expandedPrimary)}
                </text>
                <text
                  x={CENTER}
                  y={CENTER + 16}
                  textAnchor="middle"
                  fontSize={6}
                  fontWeight={600}
                  fill="rgba(27, 42, 74, 0.5)"
                  className="pointer-events-none select-none"
                  style={{ fontFamily: "'Inter', sans-serif", textTransform: "uppercase", letterSpacing: "0.1em" }}
                >
                  {expandedPrimary}
                </text>
              </>
            ) : (
              <>
                <text
                  x={CENTER}
                  y={CENTER - 6}
                  textAnchor="middle"
                  fontSize={10}
                  fontWeight={700}
                  fill="rgba(27, 42, 74, 0.9)"
                  style={{ fontFamily: "'Lora', serif" }}
                >
                  How do you
                </text>
                <text
                  x={CENTER}
                  y={CENTER + 8}
                  textAnchor="middle"
                  fontSize={10}
                  fontWeight={700}
                  fill="rgba(27, 42, 74, 0.9)"
                  style={{ fontFamily: "'Lora', serif" }}
                >
                  feel?
                </text>
              </>
            )}
          </svg>
        </motion.div>

        {/* Latest selection display */}
        <AnimatePresence>
          {latestSelection && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-3 text-center"
            >
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full shadow-md border"
                style={{
                  background: `linear-gradient(135deg, ${getEmotionColor(latestSelection.primaryEmotion)}15, white 80%)`,
                  borderColor: `${getEmotionColor(latestSelection.primaryEmotion)}30`,
                }}
              >
                <span className="text-base">{getEmotionEmoji(latestSelection.primaryEmotion)}</span>
                <span className="text-sm font-medium text-primary">
                  {latestSelection.primaryEmotion}
                  {latestSelection.secondaryEmotion && ` \u2192 ${latestSelection.secondaryEmotion}`}
                  {latestSelection.tertiaryEmotion && ` \u2192 ${latestSelection.tertiaryEmotion}`}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selection history */}
        {selections.length > 0 && (
          <motion.div
            className="mt-3 space-y-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Selections</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {selections.slice(-8).map((sel, i) => (
                <motion.div
                  key={sel.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm border"
                  style={{
                    background: `linear-gradient(135deg, ${getEmotionColor(sel.primaryEmotion)}10, white 70%)`,
                    borderColor: `${getEmotionColor(sel.primaryEmotion)}25`,
                  }}
                  initial={{ opacity: 0, scale: 0.8, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.05 * i, type: "spring", stiffness: 300, damping: 25 }}
                >
                  <span className="text-sm">{getEmotionEmoji(sel.primaryEmotion)}</span>
                  <span className="text-primary">
                    {sel.primaryEmotion}
                    {sel.secondaryEmotion && ` \u2192 ${sel.secondaryEmotion}`}
                    {sel.tertiaryEmotion && ` \u2192 ${sel.tertiaryEmotion}`}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Clinician Toolbar ── */}
      {isClinician && onSettingsUpdate && (
        <ClinicianToolbar
          controls={FEELING_WHEEL_TOOLBAR_CONTROLS}
          settings={settings}
          onUpdate={onSettingsUpdate}
          onClear={onClear}
        />
      )}
    </div>
  );
}
