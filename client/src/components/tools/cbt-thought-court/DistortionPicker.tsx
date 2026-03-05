import { motion } from "framer-motion";
import type { AgeMode } from "./CBTThoughtCourt";
import { COGNITIVE_DISTORTIONS } from "./distortions-data";

interface DistortionPickerProps {
  selectedDistortions: string[];
  onToggle: (id: string) => void;
  ageMode: AgeMode;
}

const SUBTITLE: Record<AgeMode, string> = {
  child: "Which thinking tricks is your brain using?",
  teen: "Which cognitive distortions apply to this thought?",
  adult: "Select the cognitive distortion(s) present in this thought",
};

export function DistortionPicker({
  selectedDistortions,
  onToggle,
  ageMode,
}: DistortionPickerProps) {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: 800,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        padding: "8px 0",
        overflowY: "auto",
        maxHeight: "100%",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center" }}>
        <h2
          style={{
            margin: 0,
            fontSize: 22,
            fontWeight: 700,
            color: "#f0e8d8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <span>{"\uD83D\uDD28"}</span> The Charges
        </h2>
        <p
          style={{
            margin: "6px 0 0",
            fontSize: 14,
            color: "rgba(240, 232, 216, 0.7)",
          }}
        >
          {SUBTITLE[ageMode]}
        </p>
      </div>

      {/* Grid of distortion cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(min(140px, 100%), 1fr))",
          gap: 12,
        }}
      >
        {COGNITIVE_DISTORTIONS.map((distortion) => {
          const isSelected = selectedDistortions.includes(distortion.id);

          return (
            <motion.button
              key={distortion.id}
              onClick={() => onToggle(distortion.id)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                padding: "14px 10px",
                borderRadius: 10,
                cursor: "pointer",
                border: isSelected
                  ? "2px solid #d4a853"
                  : "1px solid rgba(160, 130, 220, 0.25)",
                background: isSelected
                  ? "rgba(212, 168, 83, 0.12)"
                  : "rgba(30, 26, 46, 0.6)",
                boxShadow: isSelected
                  ? "0 4px 16px rgba(212, 168, 83, 0.25), 0 0 0 1px rgba(212, 168, 83, 0.15)"
                  : "0 2px 6px rgba(0, 0, 0, 0.2)",
                opacity: isSelected ? 1 : 0.7,
                textAlign: "center",
                fontFamily: "inherit",
                transition: "border 0.2s, background 0.2s, box-shadow 0.2s, opacity 0.2s",
              }}
            >
              {/* Checkmark overlay */}
              {isSelected && (
                <div
                  style={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: "#d4a853",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    color: "#1a1520",
                    fontWeight: 700,
                  }}
                >
                  {"\u2713"}
                </div>
              )}

              {/* Icon */}
              <span style={{ fontSize: 28 }}>{distortion.icon}</span>

              {/* Name */}
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: isSelected ? "#d4a853" : "#f0e8d8",
                  lineHeight: 1.3,
                }}
              >
                {distortion.name}
              </span>

              {/* Short description */}
              <span
                style={{
                  fontSize: 10,
                  color: "rgba(240, 232, 216, 0.55)",
                  lineHeight: 1.4,
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {distortion.description[ageMode]}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Selected count badge */}
      {selectedDistortions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            textAlign: "center",
            padding: "8px 16px",
            borderRadius: 20,
            background: "rgba(212, 168, 83, 0.15)",
            border: "1px solid rgba(212, 168, 83, 0.3)",
            color: "#d4a853",
            fontSize: 13,
            fontWeight: 600,
            alignSelf: "center",
          }}
        >
          {selectedDistortions.length} charge{selectedDistortions.length !== 1 ? "s" : ""} filed
        </motion.div>
      )}
    </div>
  );
}
