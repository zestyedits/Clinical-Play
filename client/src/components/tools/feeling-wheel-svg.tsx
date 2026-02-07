import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FEELING_WHEEL_DATA, type EmotionNode } from "@/lib/feeling-wheel-data";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

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
}

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
  // Rotate text to follow the arc direction
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

export function FeelingWheelSVG({ selections, onSelect, onClear, isClinician, onAuraColor }: FeelingWheelSVGProps) {
  const [expandedPrimary, setExpandedPrimary] = useState<string | null>(null);
  const [expandedSecondary, setExpandedSecondary] = useState<string | null>(null);
  const [hoveredWedge, setHoveredWedge] = useState<string | null>(null);
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
    setExpandedPrimary(prev => prev === label ? null : label);
    setExpandedSecondary(null);
    setCompletedSelection(null);
  }, []);

  const handleSecondaryClick = useCallback((label: string) => {
    setExpandedSecondary(prev => prev === label ? null : label);
    setCompletedSelection(null);
  }, []);

  const handleTertiaryClick = useCallback((primaryLabel: string, secondaryLabel: string, tertiaryLabel: string, tertiaryAngle: number) => {
    onSelect(primaryLabel, secondaryLabel, tertiaryLabel);

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
    <div className="h-full flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background/50 to-background overflow-auto">
      <div className="w-full max-w-[420px] mx-auto">
        <div className="text-center mb-4">
          <h2 className="font-serif text-xl text-primary mb-1">How are you feeling?</h2>
          <p className="text-xs text-muted-foreground">Tap to explore your emotions from core to specific</p>
        </div>

        <div
          className="relative mx-auto"
          style={{
            maxWidth: 400,
            maxHeight: 400,
            aspectRatio: "1",
            ...(hoveredWedge ? { filter: `drop-shadow(0 0 30px ${hoveredWedge}40)` } : {}),
            transition: "filter 0.3s ease",
          }}
        >
          <svg viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`} className="w-full h-full">
            {/* Inner ring: Primary emotions */}
            {FEELING_WHEEL_DATA.map((emotion, i) => {
              const startAngle = i * primaryArcAngle - 90;
              const endAngle = startAngle + primaryArcAngle;
              const isExpanded = expandedPrimary === emotion.label;
              const isHovered = hoveredWedge === emotion.color;
              const mid = midAngle(startAngle, endAngle);
              const hoverOffset = isHovered ? 3 : 0;
              const pos = polarToCart(0, 0, hoverOffset, mid);

              return (
                <g key={emotion.label} style={{ transition: "transform 0.3s ease" }}>
                  <path
                    d={describeArc(CENTER + pos.x, CENTER + pos.y, INNER_R1, INNER_R2, startAngle, endAngle)}
                    fill={emotion.color}
                    stroke="white"
                    strokeWidth={1.5}
                    opacity={isExpanded ? 1 : 0.85}
                    className="cursor-pointer"
                    style={{
                      transition: "opacity 0.3s ease, filter 0.3s ease",
                      filter: isHovered ? `drop-shadow(0 0 20px ${emotion.color})` : "none",
                    }}
                    onClick={() => handlePrimaryClick(emotion.label)}
                    onPointerEnter={() => handleWedgeHover(emotion.color)}
                    onPointerLeave={() => handleWedgeHover(null)}
                  />
                  <WedgeLabel
                    cx={CENTER + pos.x}
                    cy={CENTER + pos.y}
                    r={(INNER_R1 + INNER_R2) / 2}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    label={emotion.label}
                    fontSize={10}
                  />
                </g>
              );
            })}

            {/* Middle ring: Secondary emotions */}
            <AnimatePresence>
              {selectedPrimary && selectedPrimary.children && (() => {
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
                  const hoverOffset = isHovered ? 5 : 0;
                  const pos = polarToCart(0, 0, hoverOffset, mid);

                  return (
                    <motion.g
                      key={sec.label}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ delay: j * 0.05, duration: 0.3 }}
                    >
                      <path
                        d={describeArc(CENTER + pos.x, CENTER + pos.y, MID_R1, MID_R2, startAngle, endAngle)}
                        fill={sec.color}
                        stroke="white"
                        strokeWidth={1}
                        opacity={isExpanded ? 1 : 0.85}
                        className="cursor-pointer"
                        style={{
                          transition: "opacity 0.3s ease, filter 0.3s ease",
                          filter: isHovered ? `drop-shadow(0 0 20px ${sec.color})` : "none",
                        }}
                        onClick={() => {
                          handleSecondaryClick(sec.label);
                          onSelect(expandedPrimary!, sec.label, null);
                        }}
                        onPointerEnter={() => handleWedgeHover(sec.color + sec.label)}
                        onPointerLeave={() => handleWedgeHover(null)}
                      />
                      <WedgeLabel
                        cx={CENTER + pos.x}
                        cy={CENTER + pos.y}
                        r={(MID_R1 + MID_R2) / 2}
                        startAngle={startAngle}
                        endAngle={endAngle}
                        label={sec.label}
                        fontSize={8}
                      />
                    </motion.g>
                  );
                });
              })()}
            </AnimatePresence>

            {/* Outer ring: Tertiary emotions */}
            <AnimatePresence>
              {selectedSecondary && selectedSecondary.children && (() => {
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
                      transition={{ delay: k * 0.05, duration: 0.3 }}
                    >
                      <path
                        d={describeArc(CENTER + pos.x, CENTER + pos.y, OUTER_R1, OUTER_R2, startAngle, endAngle)}
                        fill={ter.color}
                        stroke="white"
                        strokeWidth={0.75}
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
                      <WedgeLabel
                        cx={CENTER + pos.x}
                        cy={CENTER + pos.y}
                        r={(OUTER_R1 + OUTER_R2) / 2}
                        startAngle={startAngle}
                        endAngle={endAngle}
                        label={ter.label}
                        fontSize={7}
                      />
                    </motion.g>
                  );
                });
              })()}
            </AnimatePresence>

            {/* Golden Thread */}
            {completedSelection && (() => {
              const p1 = polarToCart(CENTER, CENTER, (INNER_R1 + INNER_R2) / 2, completedSelection.primaryAngle);
              const p2 = polarToCart(CENTER, CENTER, (MID_R1 + MID_R2) / 2, completedSelection.secondaryAngle);
              const p3 = polarToCart(CENTER, CENTER, (OUTER_R1 + OUTER_R2) / 2, completedSelection.tertiaryAngle);
              const pathD = `M ${CENTER} ${CENTER} L ${p1.x} ${p1.y} L ${p2.x} ${p2.y} L ${p3.x} ${p3.y}`;
              const pathLength = 600; // approximate

              return (
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
              );
            })()}

            {/* Center circle */}
            <circle cx={CENTER} cy={CENTER} r={INNER_R1 - 2} fill="white" fillOpacity={0.9} stroke="#D4AF37" strokeWidth={1} />
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
          </svg>
        </div>

        {/* Selection display */}
        {latestSelection && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-center"
          >
            <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/30 shadow-sm">
              <span className="text-sm font-medium text-primary">
                {latestSelection.primaryEmotion}
                {latestSelection.secondaryEmotion && ` → ${latestSelection.secondaryEmotion}`}
                {latestSelection.tertiaryEmotion && ` → ${latestSelection.tertiaryEmotion}`}
              </span>
            </div>
          </motion.div>
        )}

        {/* Selection history */}
        {selections.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Selections</span>
              {isClinician && (
                <button
                  onClick={onClear}
                  className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 cursor-pointer min-h-[44px] min-w-[44px] p-2 rounded-xl"
                  data-testid="button-clear-feelings"
                >
                  <RotateCcw size={10} />
                  Clear
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {selections.slice(-8).map((sel) => (
                <div
                  key={sel.id}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/50 backdrop-blur-sm border border-white/30 shadow-sm"
                >
                  {sel.primaryEmotion}
                  {sel.secondaryEmotion && ` → ${sel.secondaryEmotion}`}
                  {sel.tertiaryEmotion && ` → ${sel.tertiaryEmotion}`}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
