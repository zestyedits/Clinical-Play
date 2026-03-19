import { motion } from "framer-motion";
import { VolcanoCanvas } from "./VolcanoCanvas";
import type { AgeMode } from "./volcano-data";

interface VolcanoBuilderProps {
  baselineTemp: number;
  currentTemp: number;
  ageMode: AgeMode;
  onSetBaseline: (temp: number) => void;
}

const TEMP_LABELS: Record<AgeMode, Record<number, string>> = {
  child: {
    0: "Cool as a cucumber! 🥒",
    1: "Pretty chill",
    2: "A tiny bit warm",
    3: "Getting warmer...",
    4: "Starting to bubble",
    5: "Medium hot",
    6: "Getting fiery!",
    7: "Really hot!",
    8: "Super hot! 🔥",
    9: "Almost erupting!",
    10: "VOLCANO MODE! 🌋",
  },
  teen: {
    0: "Completely calm",
    1: "Barely anything",
    2: "Slightly annoyed",
    3: "A bit frustrated",
    4: "Noticeably irritated",
    5: "Moderate anger",
    6: "Pretty heated",
    7: "Very angry",
    8: "Intensely angry",
    9: "About to lose it",
    10: "Maximum fury",
  },
  adult: {
    0: "Baseline — regulated",
    1: "Minimal irritation",
    2: "Mild annoyance",
    3: "Noticeable frustration",
    4: "Moderate irritation",
    5: "Significant agitation",
    6: "Elevated anger",
    7: "High anger intensity",
    8: "Very high arousal",
    9: "Near-crisis escalation",
    10: "Peak dysregulation",
  },
};

export function VolcanoBuilder({ baselineTemp, currentTemp, ageMode, onSetBaseline }: VolcanoBuilderProps) {
  const roundedTemp = Math.round(baselineTemp);
  const label = TEMP_LABELS[ageMode][roundedTemp] || "";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "8px 0" }}>
      {/* Volcano visualization */}
      <VolcanoCanvas temperature={currentTemp} />

      {/* Temperature slider */}
      <div style={{ width: "100%", maxWidth: 340 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
          <span style={{ fontSize: 13, color: "rgba(240,232,216,0.6)", fontWeight: 500 }}>
            {ageMode === "child" ? "How hot is your volcano?" : "Current emotional temperature"}
          </span>
          <motion.span
            key={roundedTemp}
            initial={{ scale: 1.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ fontSize: 22, fontWeight: 800, color: getTempColor(roundedTemp) }}
          >
            {roundedTemp}
          </motion.span>
        </div>

        <div style={{ position: "relative", height: 40, display: "flex", alignItems: "center" }}>
          {/* Track background gradient */}
          <div
            style={{
              position: "absolute",
              left: 0, right: 0, top: "50%", transform: "translateY(-50%)",
              height: 8, borderRadius: 4,
              background: "linear-gradient(to right, #334466, #886633, #cc4422, #ff2200)",
              opacity: 0.4,
            }}
          />
          {/* Active track */}
          <div
            style={{
              position: "absolute",
              left: 0, top: "50%", transform: "translateY(-50%)",
              width: `${(baselineTemp / 10) * 100}%`,
              height: 8, borderRadius: 4,
              background: `linear-gradient(to right, #4488aa, ${getTempColor(roundedTemp)})`,
              boxShadow: `0 0 12px ${getTempColor(roundedTemp)}40`,
              transition: "width 0.15s ease, background 0.3s ease",
            }}
          />
          <input
            type="range"
            min={0}
            max={10}
            step={1}
            value={baselineTemp}
            onChange={(e) => onSetBaseline(Number(e.target.value))}
            style={{
              width: "100%",
              position: "relative",
              zIndex: 1,
              WebkitAppearance: "none",
              appearance: "none",
              background: "transparent",
              cursor: "pointer",
              height: 40,
            }}
          />
        </div>

        {/* Temp label */}
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            textAlign: "center",
            fontSize: 14,
            fontWeight: 600,
            color: getTempColor(roundedTemp),
            marginTop: 4,
            minHeight: 20,
          }}
        >
          {label}
        </motion.div>

        {/* Scale markers */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, padding: "0 2px" }}>
          {[0, 2, 4, 6, 8, 10].map((n) => (
            <span
              key={n}
              style={{
                fontSize: 10,
                color: "rgba(240,232,216,0.25)",
                fontWeight: n === roundedTemp ? 700 : 400,
              }}
            >
              {n}
            </span>
          ))}
        </div>
      </div>

      {/* Descriptive text */}
      <div
        style={{
          background: "rgba(240,232,216,0.04)",
          border: "1px solid rgba(240,232,216,0.08)",
          borderRadius: 12,
          padding: "12px 16px",
          maxWidth: 340,
          width: "100%",
        }}
      >
        <p style={{ margin: 0, fontSize: 12, color: "rgba(240,232,216,0.45)", lineHeight: 1.6 }}>
          {ageMode === "child"
            ? "Move the slider to show how your volcano feels right now. Is it calm and quiet, or is it getting hot and bubbly?"
            : ageMode === "teen"
            ? "Rate your current anger or frustration level. Be honest — this is just your starting point, not a judgment."
            : "Assess your current emotional baseline. This calibrates the volcano metaphor to your present state, helping identify triggers relative to your starting point."}
        </p>
      </div>

      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #f0e8d8;
          border: 2px solid ${getTempColor(roundedTemp)};
          box-shadow: 0 0 10px ${getTempColor(roundedTemp)}60, 0 2px 8px rgba(0,0,0,0.3);
          cursor: pointer;
          transition: border-color 0.3s, box-shadow 0.3s;
        }
        input[type="range"]::-moz-range-thumb {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #f0e8d8;
          border: 2px solid ${getTempColor(roundedTemp)};
          box-shadow: 0 0 10px ${getTempColor(roundedTemp)}60, 0 2px 8px rgba(0,0,0,0.3);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

function getTempColor(temp: number): string {
  if (temp <= 2) return "#4488aa";
  if (temp <= 4) return "#88aa44";
  if (temp <= 6) return "#d4a833";
  if (temp <= 8) return "#dd6633";
  return "#ee3322";
}
