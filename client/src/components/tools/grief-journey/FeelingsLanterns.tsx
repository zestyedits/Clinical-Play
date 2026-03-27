import { useState } from "react";
import { motion } from "framer-motion";
import type { AgeMode, GriefEmotion } from "./grief-data";
import { GRIEF_EMOTIONS } from "./grief-data";

interface FeelingsLanternsProps {
  selectedEmotions: GriefEmotion[];
  customEmotion: string;
  onToggleEmotion: (e: GriefEmotion) => void;
  onSetCustomEmotion: (t: string) => void;
  ageMode: AgeMode;
}

const PROMPTS: Record<AgeMode, string> = {
  child: "Pick the feelings that are inside you right now. You can pick more than one!",
  teen: "Select the emotions that resonate with what you are carrying. More than one can be true.",
  adult:
    "Identify the emotions present in your grief. Worden's second task involves processing these feelings.",
};

export function FeelingsLanterns({
  selectedEmotions,
  customEmotion,
  onToggleEmotion,
  onSetCustomEmotion,
  ageMode,
}: FeelingsLanternsProps) {
  const [customFocused, setCustomFocused] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: "rgba(212,120,144,0.05)",
          borderRadius: 12,
          padding: "12px 14px",
          borderLeft: "3px solid rgba(212,120,144,0.25)",
        }}
      >
        <p style={{ margin: 0, fontSize: 13, color: "rgba(232,220,200,0.65)", lineHeight: 1.65 }}>
          {PROMPTS[ageMode]}
        </p>
      </motion.div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 8,
        }}
      >
        {GRIEF_EMOTIONS.map((emotion, i) => {
          const isSelected = selectedEmotions.includes(emotion.id);
          return (
            <motion.button
              key={emotion.id}
              type="button"
              onClick={() => onToggleEmotion(emotion.id)}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04, duration: 0.25 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: "10px 8px",
                borderRadius: 12,
                border: isSelected
                  ? "1px solid rgba(196,154,108,0.5)"
                  : "1px solid rgba(232,220,200,0.08)",
                background: isSelected
                  ? "rgba(196,154,108,0.2)"
                  : "rgba(232,220,200,0.04)",
                color: isSelected ? emotion.color : "rgba(232,220,200,0.55)",
                fontSize: 12,
                fontWeight: isSelected ? 600 : 400,
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
                textAlign: "center",
                outline: "none",
                transition: "all 0.2s",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {isSelected && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: `radial-gradient(circle at 50% 50%, ${emotion.color}18, transparent 70%)`,
                    pointerEvents: "none",
                  }}
                />
              )}
              <div style={{ position: "relative" }}>{emotion.label}</div>
            </motion.button>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        style={{ display: "flex", flexDirection: "column", gap: 6 }}
      >
        <label style={{ fontSize: 12, color: "rgba(232,220,200,0.45)", fontWeight: 500 }}>
          Another feeling not listed:
        </label>
        <input
          type="text"
          value={customEmotion}
          onChange={(e) => onSetCustomEmotion(e.target.value)}
          placeholder="e.g. devastated, hollow, peaceful..."
          onFocus={() => setCustomFocused(true)}
          onBlur={() => setCustomFocused(false)}
          style={{
            width: "100%",
            padding: "10px 12px",
            fontSize: 13,
            fontFamily: "Inter, sans-serif",
            background: "rgba(232,220,200,0.04)",
            border: customFocused
              ? "1px solid rgba(196,154,108,0.4)"
              : "1px solid rgba(232,220,200,0.08)",
            borderRadius: 10,
            color: "#e8dcc8",
            outline: "none",
            transition: "border-color 0.2s",
            boxSizing: "border-box",
          }}
        />
      </motion.div>

      <div
        style={{
          textAlign: "center",
          fontSize: 12,
          color:
            selectedEmotions.length >= 2 || customEmotion.trim().length > 0
              ? "rgba(196,154,108,0.7)"
              : "rgba(232,220,200,0.3)",
          fontWeight: 500,
        }}
      >
        {selectedEmotions.length} feeling{selectedEmotions.length !== 1 ? "s" : ""} selected
        {selectedEmotions.length < 2 && customEmotion.trim().length === 0
          ? " \u00B7 select at least 2 or add a custom feeling"
          : ""}
      </div>
    </div>
  );
}
