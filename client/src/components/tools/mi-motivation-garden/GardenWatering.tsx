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

function WaterDrop({ value, color }: { value: number; color: string }) {
  const fillPercent = (value / 10) * 100;

  return (
    <div style={{ position: "relative", width: 80, height: 100, margin: "0 auto" }}>
      <svg viewBox="0 0 60 80" style={{ width: "100%", height: "100%" }}>
        <defs>
          <clipPath id={`drop-${color}`}>
            <path d="M30 5 Q30 5 10 40 Q-2 58 30 75 Q62 58 50 40 Q30 5 30 5 Z" />
          </clipPath>
        </defs>
        <path
          d="M30 5 Q30 5 10 40 Q-2 58 30 75 Q62 58 50 40 Q30 5 30 5 Z"
          fill="none"
          stroke="rgba(232,220,200,0.12)"
          strokeWidth={1.5}
        />
        <rect
          x={0}
          y={80 - (fillPercent * 0.7)}
          width={60}
          height={80}
          fill={`${color}40`}
          clipPath={`url(#drop-${color})`}
          style={{ transition: "y 0.4s ease" }}
        />
        <path
          d="M30 5 Q30 5 10 40 Q-2 58 30 75 Q62 58 50 40 Q30 5 30 5 Z"
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          opacity={0.5}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          bottom: 18,
          left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={value}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.2 }}
            style={{
              fontFamily: "'Lora', Georgia, serif",
              fontSize: 22,
              fontWeight: 700,
              color,
              textShadow: `0 0 20px ${color}40`,
            }}
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
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
    border: 2.5px solid #e8dcc8;
    cursor: pointer;
    box-shadow: 0 2px 10px ${color}60;
    margin-top: -8px;
    position: relative;
    z-index: 2;
  }
  .watering-range-${id}::-moz-range-thumb {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: ${color};
    border: 2.5px solid #e8dcc8;
    cursor: pointer;
    box-shadow: 0 2px 10px ${color}60;
  }
  .watering-range-${id}::-webkit-slider-runnable-track {
    height: 6px;
    border-radius: 3px;
    background: linear-gradient(to right, rgba(232,220,200,0.08), rgba(232,220,200,0.15));
  }
  .watering-range-${id}::-moz-range-track {
    height: 6px;
    border-radius: 3px;
    background: linear-gradient(to right, rgba(232,220,200,0.08), rgba(232,220,200,0.15));
  }
  .watering-range-${id}:focus { outline: none; }
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
        borderRadius: 14,
        padding: "16px 16px 14px",
        background: "rgba(232, 220, 200, 0.03)",
        border: `1px solid ${color}15`,
      }}
    >
      <style>{RANGE_THUMB_CSS(cssId, color)}</style>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#e8dcc8", fontFamily: "'Lora', Georgia, serif" }}>
          {label}
        </span>
      </div>

      <WaterDrop value={value} color={color} />

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
          margin: "4px 0 8px",
        }}
      />

      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "rgba(232,220,200,0.3)", marginBottom: reflections.length > 0 ? 10 : 0 }}>
        <span>Not at all</span>
        <span>Extremely</span>
      </div>

      {reflections.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ fontSize: 11, color: "rgba(232, 220, 200, 0.4)", fontWeight: 500 }}>
            This resonates:
          </div>
          {reflections.map((text) => {
            const isSelected = selectedReflection === text;
            return (
              <motion.button
                key={text}
                type="button"
                onClick={() => onSelectReflection(isSelected ? "" : text)}
                whileTap={{ scale: 0.98 }}
                style={{
                  padding: "8px 12px",
                  borderRadius: 10,
                  border: isSelected
                    ? `1.5px solid ${color}`
                    : "1px solid rgba(232, 220, 200, 0.06)",
                  background: isSelected ? `${color}12` : "transparent",
                  color: isSelected ? color : "rgba(232, 220, 200, 0.6)",
                  fontSize: 12,
                  fontFamily: "inherit",
                  fontWeight: isSelected ? 600 : 400,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s ease",
                  outline: "none",
                  lineHeight: 1.4,
                }}
              >
                {isSelected && "✨ "}{text}
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {renderRuler(
        "How Important?",
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
        "How Confident?",
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
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 14px",
            background: "rgba(212, 162, 76, 0.05)",
            borderRadius: 12,
            borderLeft: "3px solid rgba(212, 162, 76, 0.25)",
          }}
        >
          <span style={{ fontSize: 16 }}>💡</span>
          <p
            style={{
              margin: 0,
              fontSize: 12,
              lineHeight: 1.45,
              color: "rgba(232, 220, 200, 0.6)",
              fontStyle: "italic",
            }}
          >
            {importance > confidence
              ? ageMode === "child"
                ? "You really care about this but aren't sure you can do it yet — that's okay!"
                : ageMode === "teen"
                  ? "You see the importance but your confidence hasn't caught up yet. That gap is where growth happens."
                  : "There's a gap between importance and confidence — building self-efficacy may be the key leverage point."
              : ageMode === "child"
                ? "You feel like you could do it, but you're not sure it matters enough yet."
                : ageMode === "teen"
                  ? "You've got the confidence, but the motivation isn't quite there."
                  : "Confidence exceeds importance — deeper values connections may strengthen your motivation."}
          </p>
        </motion.div>
      )}
    </div>
  );
}
