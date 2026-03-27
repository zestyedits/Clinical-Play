import { useState } from "react";
import { motion } from "framer-motion";
import type { AgeMode, LossType } from "./grief-data";
import { LOSS_TYPES } from "./grief-data";

interface LossStepProps {
  lossTopic: string;
  lossType: LossType | null;
  onSetTopic: (t: string) => void;
  onSetLossType: (t: LossType) => void;
  ageMode: AgeMode;
}

const PROMPTS: Record<AgeMode, { label: string; placeholder: string; hint: string }> = {
  child: {
    label: "Who or what are you missing?",
    placeholder: "You can write a name, or describe what you lost...",
    hint: "There is no wrong answer. Write whatever feels true for you.",
  },
  teen: {
    label: "What or who have you lost?",
    placeholder: "Write their name, or describe what changed...",
    hint: "This is just for you. Take your time.",
  },
  adult: {
    label: "What or who have you lost?",
    placeholder: "Name or describe the person, relationship, or thing you have lost...",
    hint: "Acknowledging the loss is the first task of grieving (Worden, 2018).",
  },
};

export function LossStep({
  lossTopic,
  lossType,
  onSetTopic,
  onSetLossType,
  ageMode,
}: LossStepProps) {
  const [isFocused, setIsFocused] = useState(false);
  const prompts = PROMPTS[ageMode];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{
          background: "rgba(196,154,108,0.05)",
          borderRadius: 12,
          padding: "12px 14px",
          borderLeft: "3px solid rgba(196,154,108,0.25)",
        }}
      >
        <p style={{ margin: 0, fontSize: 13, color: "rgba(232,220,200,0.65)", lineHeight: 1.65 }}>
          {prompts.hint}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.35 }}
        style={{ display: "flex", flexDirection: "column", gap: 8 }}
      >
        <label
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#c49a6c",
            display: "block",
          }}
        >
          {prompts.label}
        </label>
        <input
          type="text"
          value={lossTopic}
          onChange={(e) => onSetTopic(e.target.value)}
          placeholder={prompts.placeholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={{
            width: "100%",
            padding: "12px 14px",
            fontSize: 14,
            fontFamily: "Inter, sans-serif",
            background: "rgba(232,220,200,0.05)",
            border: isFocused
              ? "1px solid rgba(196,154,108,0.5)"
              : "1px solid rgba(232,220,200,0.1)",
            borderRadius: 10,
            color: "#e8dcc8",
            outline: "none",
            transition: "border-color 0.2s",
            boxSizing: "border-box",
          }}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.35 }}
        style={{ display: "flex", flexDirection: "column", gap: 8 }}
      >
        <label style={{ fontSize: 13, fontWeight: 600, color: "#c49a6c" }}>
          {ageMode === "child" ? "What kind of loss is this?" : "What type of loss is this?"}
        </label>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          {LOSS_TYPES.map((lt, i) => {
            const isSelected = lossType === lt.id;
            return (
              <motion.button
                key={lt.id}
                type="button"
                onClick={() => onSetLossType(lt.id)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25 + i * 0.05 }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 14px",
                  borderRadius: 20,
                  border: isSelected
                    ? "1.5px solid rgba(196,154,108,0.55)"
                    : "1px solid rgba(232,220,200,0.1)",
                  background: isSelected
                    ? "rgba(196,154,108,0.18)"
                    : "rgba(232,220,200,0.04)",
                  color: isSelected ? "#c49a6c" : "rgba(232,220,200,0.6)",
                  fontSize: 13,
                  fontWeight: isSelected ? 600 : 400,
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                  transition: "all 0.2s",
                  outline: "none",
                }}
              >
                <span style={{ fontSize: 15 }}>{lt.emoji}</span>
                {lt.label}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {lossTopic.trim().length === 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            margin: 0,
            fontSize: 11,
            color: "rgba(232,220,200,0.3)",
            textAlign: "center",
            paddingTop: 4,
          }}
        >
          {ageMode === "child"
            ? "Write something above to continue"
            : "Describe your loss above to continue"}
        </motion.p>
      )}
    </div>
  );
}
