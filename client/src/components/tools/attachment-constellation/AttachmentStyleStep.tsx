import { motion, AnimatePresence } from "framer-motion";
import type { AgeMode, AttachmentStyle } from "./constellation-data";
import { ATTACHMENT_STYLES } from "./constellation-data";

interface AttachmentStyleStepProps {
  selectedStyle: AttachmentStyle | null;
  onSelectStyle: (s: AttachmentStyle) => void;
  ageMode: AgeMode;
}

export function AttachmentStyleStep({ selectedStyle, onSelectStyle, ageMode }: AttachmentStyleStepProps) {
  const selectedData = ATTACHMENT_STYLES.find((s) => s.id === selectedStyle);

  const intro = ageMode === "child"
    ? "Think about how you usually feel with people you care about. Which one sounds most like you?"
    : ageMode === "teen"
    ? "Think about how you tend to act in close relationships. Which pattern feels most familiar?"
    : "Consider your general pattern across close relationships. Which description resonates most?";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <p style={{ margin: "0 0 4px", fontSize: 13, color: "rgba(232, 220, 200, 0.65)", lineHeight: 1.6, textAlign: "center" }}>
        {intro}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {ATTACHMENT_STYLES.map((style) => {
          const isSelected = selectedStyle === style.id;
          return (
            <motion.button
              key={style.id}
              onClick={() => onSelectStyle(style.id)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                padding: "12px 16px",
                background: isSelected ? `rgba(${hexToRgb(style.color)}, 0.08)` : "rgba(6, 8, 15, 0.6)",
                border: isSelected ? `2px solid ${style.color}` : "1px solid rgba(232, 220, 200, 0.08)",
                borderRadius: 12,
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.2s",
                boxShadow: isSelected ? `0 0 20px rgba(${hexToRgb(style.color)}, 0.15)` : "none",
                fontFamily: "Inter, sans-serif",
              }}
            >
              <span style={{ fontSize: 24, flexShrink: 0, marginTop: 2 }}>{style.emoji}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: isSelected ? style.color : "#e8dcc8", marginBottom: 3 }}>
                  {style.label}
                </div>
                <div style={{ fontSize: 12, color: "rgba(232, 220, 200, 0.65)", lineHeight: 1.5 }}>
                  {style.description}
                </div>
              </div>
              {isSelected && (
                <span style={{ marginLeft: "auto", fontSize: 16, flexShrink: 0, color: style.color }}>✓</span>
              )}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedData && (
          <motion.div
            key={selectedData.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            style={{
              background: `rgba(${hexToRgb(selectedData.color)}, 0.07)`,
              border: `1px solid rgba(${hexToRgb(selectedData.color)}, 0.2)`,
              borderRadius: 12,
              padding: "14px 16px",
              marginTop: 4,
            }}
          >
            <p style={{ margin: 0, fontSize: 13, color: "rgba(232, 220, 200, 0.8)", lineHeight: 1.65 }}>
              <span style={{ fontWeight: 600, color: selectedData.color }}>{selectedData.emoji} {selectedData.label}:</span>{" "}
              {selectedData.validation}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "196, 168, 76";
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
}