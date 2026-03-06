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

// ── Arc Gauge SVG ───────────────────────────────────────────────────────────

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
      viewBox="0 0 200 120"
      style={{ width: "100%", maxWidth: 200, display: "block", margin: "0 auto" }}
    >
      <path
        d={fullArc}
        fill="none"
        stroke="rgba(232,220,200,0.15)"
        strokeWidth={10}
        strokeLinecap="round"
      />
      {fraction > 0 && (
        <path
          d={filledArc}
          fill="none"
          stroke={color}
          strokeWidth={10}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${color}66)` }}
        />
      )}
      <circle
        cx={needleX}
        cy={needleY}
        r={7}
        fill={color}
        stroke="#e8dcc8"
        strokeWidth={2.5}
        style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))" }}
      />
      <text x={cx - r - 4} y={cy + 16} fill="rgba(232,220,200,0.5)" fontSize="10" textAnchor="middle">
        0
      </text>
      <text x={cx + r + 4} y={cy + 16} fill="rgba(232,220,200,0.5)" fontSize="10" textAnchor="middle">
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
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: ${color};
    border: 3px solid #e8dcc8;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0,0,0,0.35);
    margin-top: -8px;
    position: relative;
    z-index: 2;
  }
  .watering-range-${id}::-moz-range-thumb {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: ${color};
    border: 3px solid #e8dcc8;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0,0,0,0.35);
  }
  .watering-range-${id}::-webkit-slider-runnable-track {
    height: 6px;
    border-radius: 3px;
    background: rgba(232,220,200,0.15);
  }
  .watering-range-${id}::-moz-range-track {
    height: 6px;
    border-radius: 3px;
    background: rgba(232,220,200,0.15);
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
        background: "rgba(12, 24, 18, 0.6)",
        borderRadius: 14,
        padding: "20px 18px 18px",
        border: `1px solid ${color}20`,
      }}
    >
      <style>{RANGE_THUMB_CSS(cssId, color)}</style>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
        <span style={{ fontSize: 16, fontWeight: 700, color: "#e8dcc8" }}>
          {label}
        </span>
      </div>

      <div style={{ position: "relative", marginBottom: 4 }}>
        <ArcGauge value={value} color={color} />
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: 4,
            transform: "translateX(-50%)",
            textAlign: "center",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={value}
              initial={{ opacity: 0, y: 8, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "2rem",
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
          height: 22,
          background: "transparent",
          appearance: "none",
          WebkitAppearance: "none",
          cursor: "pointer",
          margin: "4px 0 14px",
        }}
      />

      {/* Reflections */}
      {reflections.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ fontSize: 12, color: "rgba(232, 220, 200, 0.5)", fontWeight: 600 }}>
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
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: isSelected
                    ? `2px solid ${color}`
                    : "1px solid rgba(232, 220, 200, 0.15)",
                  background: isSelected ? `${color}20` : "rgba(12, 24, 18, 0.4)",
                  color: isSelected ? color : "rgba(232, 220, 200, 0.75)",
                  fontSize: 13,
                  fontFamily: "inherit",
                  fontWeight: isSelected ? 600 : 400,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.15s ease",
                  outline: "none",
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
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {renderRuler(
        "How Important Is This Change?",
        "\u2B50",
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
        "\uD83D\uDCAA",
        confidence,
        "#5ab88f",
        onSetConfidence,
        confidenceReflections,
        confidenceReflection,
        onSetConfidenceReflection,
        `${reactId}-confidence`,
      )}

      {/* Gap insight */}
      {Math.abs(importance - confidence) >= 3 && (
        <div
          style={{
            background: "rgba(212, 162, 76, 0.08)",
            borderRadius: 12,
            padding: "14px 16px",
            border: "1px solid rgba(212, 162, 76, 0.15)",
            textAlign: "center",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 13,
              lineHeight: 1.6,
              color: "rgba(232, 220, 200, 0.75)",
              fontStyle: "italic",
            }}
          >
            {importance > confidence
              ? ageMode === "child"
                ? "You really care about this but aren\u2019t sure you can do it yet \u2014 that\u2019s okay! Let\u2019s find what can help."
                : ageMode === "teen"
                  ? "You see the importance but your confidence hasn\u2019t caught up yet. That gap is where growth happens."
                  : "There\u2019s a notable gap between importance and confidence \u2014 this is a prime area for MI work. Building self-efficacy may be the key leverage point."
              : ageMode === "child"
                ? "You feel like you could do it, but you\u2019re not sure it matters enough yet. Let\u2019s explore why it might."
                : ageMode === "teen"
                  ? "You\u2019ve got the confidence, but the motivation isn\u2019t quite there. Connecting this to what you value could help."
                  : "Confidence exceeds importance \u2014 exploring deeper values connections may strengthen the motivational foundation."}
          </p>
        </div>
      )}
    </div>
  );
}
