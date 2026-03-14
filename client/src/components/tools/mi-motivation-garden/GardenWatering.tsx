import { useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { AgeMode } from "./garden-data";
import { IMPORTANCE_REFLECTIONS, CONFIDENCE_REFLECTIONS } from "./garden-data";

interface GardenWateringProps {
  importance: number;
  confidence: number;
  importanceReflection: string;
  confidenceReflection: string;
  onSetImportance: (value: number) => void;
  onSetConfidence: (value: number) => void;
  onSetImportanceReflection: (text: string) => void;
  onSetConfidenceReflection: (text: string) => void;
  ageMode: AgeMode;
}

function ArcGauge({ value, color }: { value: number; color: string }) {
  const cx = 100;
  const cy = 100;
  const r = 80;
  const fraction = value / 10;

  const startAngle = Math.PI;
  const endAngle = 0;
  const totalSweep = startAngle - endAngle;

  const fullArc = describeArc(cx, cy, r, startAngle, endAngle);
  const filledEndAngle = startAngle - totalSweep * fraction;
  const filledArc =
    fraction > 0 ? describeArc(cx, cy, r, startAngle, filledEndAngle) : "";

  const needleAngle = startAngle - totalSweep * fraction;
  const needleX = cx + r * Math.cos(needleAngle);
  const needleY = cy - r * Math.sin(needleAngle);

  return (
    <svg
      viewBox="0 0 200 115"
      style={{ width: "100%", maxWidth: 160, display: "block", margin: "0 auto" }}
    >
      <path
        d={fullArc}
        fill="none"
        stroke="rgba(232,220,200,0.1)"
        strokeWidth={8}
        strokeLinecap="round"
      />
      {fraction > 0 && (
        <path
          d={filledArc}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 4px ${color}55)` }}
        />
      )}
      <circle
        cx={needleX}
        cy={needleY}
        r={6}
        fill={color}
        stroke="#e8dcc8"
        strokeWidth={2}
        style={{ filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.3))" }}
      />
      <text x={cx - r - 4} y={cy + 14} fill="rgba(232,220,200,0.4)" fontSize="9" textAnchor="middle">
        0
      </text>
      <text x={cx + r + 4} y={cy + 14} fill="rgba(232,220,200,0.4)" fontSize="9" textAnchor="middle">
        10
      </text>
    </svg>
  );
}

function describeArc(cx: number, cy: number, r: number, a1: number, a2: number): string {
  const x1 = cx + r * Math.cos(a1);
  const y1 = cy - r * Math.sin(a1);
  const x2 = cx + r * Math.cos(a2);
  const y2 = cy - r * Math.sin(a2);
  const sweep = a1 - a2;
  const largeArc = sweep > Math.PI ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 0 ${x2} ${y2}`;
}

function getBucket(value: number): string {
  if (value <= 3) return "low";
  if (value <= 7) return "mid";
  return "high";
}

const RANGE_THUMB_CSS = (id: string, color: string) => `
  .watering-range-${id}::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: ${color};
    border: 2.5px solid #e8dcc8;
    cursor: pointer;
    box-shadow: 0 1px 6px rgba(0,0,0,0.3);
    margin-top: -7px;
    position: relative;
    z-index: 2;
  }
  .watering-range-${id}::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: ${color};
    border: 2.5px solid #e8dcc8;
    cursor: pointer;
    box-shadow: 0 1px 6px rgba(0,0,0,0.3);
  }
  .watering-range-${id}::-webkit-slider-runnable-track {
    height: 5px;
    border-radius: 3px;
    background: rgba(232,220,200,0.1);
  }
  .watering-range-${id}::-moz-range-track {
    height: 5px;
    border-radius: 3px;
    background: rgba(232,220,200,0.1);
  }
  .watering-range-${id}:focus {
    outline: none;
  }
`;

export function GardenWatering({
  importance,
  confidence,
  importanceReflection,
  confidenceReflection,
  onSetImportance,
  onSetConfidence,
  onSetImportanceReflection,
  onSetConfidenceReflection,
  ageMode,
}: GardenWateringProps) {
  const reactId = useId().replace(/:/g, "");
  const importanceBucket = getBucket(importance);
  const confidenceBucket = getBucket(confidence);
  const importanceReflections = IMPORTANCE_REFLECTIONS[importanceBucket]?.[ageMode] || [];
  const confidenceReflections = CONFIDENCE_REFLECTIONS[confidenceBucket]?.[ageMode] || [];

  const renderRuler = (
    label: string,
    icon: string,
    value: number,
    color: string,
    onChange: (v: number) => void,
    reflections: string[],
    selectedReflection: string,
    onSelectReflection: (text: string) => void,
    cssId: string,
  ) => (
    <div
      style={{
        borderLeft: `3px solid ${color}`,
        borderRadius: 8,
        padding: "12px 14px",
        background: "rgba(232, 220, 200, 0.03)",
      }}
    >
      <style>{RANGE_THUMB_CSS(cssId, color)}</style>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#e8dcc8" }}>
          {label}
        </span>
      </div>

      <div style={{ position: "relative", marginBottom: 2 }}>
        <ArcGauge value={value} color={color} />
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: 2,
            transform: "translateX(-50%)",
            textAlign: "center",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={value}
              initial={{ opacity: 0, y: 6, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "1.6rem",
                fontWeight: 700,
                color,
                lineHeight: 1,
              }}
            >
              {value}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      <input
        type="range"
        min={0}
        max={10}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`watering-range-${cssId}`}
        aria-label={label}
        style={{
          width: "100%",
          height: 20,
          background: "transparent",
          appearance: "none",
          WebkitAppearance: "none",
          cursor: "pointer",
          margin: "2px 0 8px",
        }}
      />

      {reflections.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ fontSize: 11, color: "rgba(232, 220, 200, 0.4)", fontWeight: 500 }}>
            This resonates with me:
          </div>
          {reflections.map((text) => {
            const isSelected = selectedReflection === text;
            return (
              <button
                key={text}
                type="button"
                onClick={() => onSelectReflection(isSelected ? "" : text)}
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: isSelected
                    ? `1.5px solid ${color}`
                    : "1px solid rgba(232, 220, 200, 0.08)",
                  background: isSelected ? `${color}15` : "transparent",
                  color: isSelected ? color : "rgba(232, 220, 200, 0.65)",
                  fontSize: 12,
                  fontFamily: "inherit",
                  fontWeight: isSelected ? 600 : 400,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.15s ease",
                  outline: "none",
                  lineHeight: 1.4,
                }}
              >
                {text}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {renderRuler(
        "How Important Is This Change?",
        "⭐",
        importance,
        "#d4a24c",
        onSetImportance,
        importanceReflections,
        importanceReflection,
        onSetImportanceReflection,
        `${reactId}-importance`,
      )}
      {renderRuler(
        "How Confident Are You?",
        "💪",
        confidence,
        "#5ab88f",
        onSetConfidence,
        confidenceReflections,
        confidenceReflection,
        onSetConfidenceReflection,
        `${reactId}-confidence`,
      )}

      {Math.abs(importance - confidence) >= 3 && (
        <p
          style={{
            margin: 0,
            fontSize: 12,
            lineHeight: 1.5,
            color: "rgba(232, 220, 200, 0.55)",
            fontStyle: "italic",
            textAlign: "center",
            padding: "4px 12px",
          }}
        >
          {importance > confidence
            ? ageMode === "child"
              ? "You really care about this but aren't sure you can do it yet — that's okay! Let's find what can help."
              : ageMode === "teen"
                ? "You see the importance but your confidence hasn't caught up yet. That gap is where growth happens."
                : "There's a notable gap between importance and confidence — this is a prime area for MI work. Building self-efficacy may be the key leverage point."
            : ageMode === "child"
              ? "You feel like you could do it, but you're not sure it matters enough yet. Let's explore why it might."
              : ageMode === "teen"
                ? "You've got the confidence, but the motivation isn't quite there. Connecting this to what you value could help."
                : "Confidence exceeds importance — exploring deeper values connections may strengthen the motivational foundation."}
        </p>
      )}
    </div>
  );
}
