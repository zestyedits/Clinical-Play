import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { AgeMode, Strength } from "./quest-data";
import { AGE_LABELS, STRENGTH_EMOJIS } from "./quest-data";

interface StrengthsFinderProps {
  strengths: Strength[];
  onAdd: (text: string, emoji: string) => void;
  onRemove: (id: string) => void;
  ageMode: AgeMode;
}

export function StrengthsFinder({ strengths, onAdd, onRemove, ageMode }: StrengthsFinderProps) {
  const [input, setInput] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("🛡️");
  const labels = AGE_LABELS[ageMode];

  const handleAdd = () => {
    const trimmed = input.trim();
    if (trimmed) {
      onAdd(trimmed, selectedEmoji);
      setInput("");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          background: "rgba(244, 232, 208, 0.04)",
          borderRadius: 14,
          padding: "14px 16px",
          borderLeft: "3px solid rgba(212, 133, 58, 0.3)",
        }}
      >
        <p style={{ fontSize: 13, lineHeight: 1.7, margin: 0, color: "rgba(244, 232, 208, 0.75)" }}>
          {labels.strengthPrompt}
        </p>
      </motion.div>

      <AnimatePresence>
        {strengths.map((strength, i) => (
          <motion.div
            key={strength.id}
            initial={{ opacity: 0, x: -20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            transition={{ delay: i * 0.05 }}
            style={{
              position: "relative",
              background: "rgba(212, 133, 58, 0.08)",
              border: "1px solid rgba(212, 133, 58, 0.2)",
              borderRadius: 14,
              padding: "12px 40px 12px 16px",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span style={{ fontSize: 22 }}>{strength.emoji}</span>
            <p style={{ fontSize: 14, fontFamily: "'Lora', Georgia, serif", fontWeight: 500, color: "rgba(244, 232, 208, 0.85)", margin: 0 }}>
              {strength.text}
            </p>
            <button
              onClick={() => onRemove(strength.id)}
              data-testid={`button-remove-strength-${strength.id}`}
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: "rgba(244, 232, 208, 0.1)",
                border: "none",
                color: "rgba(244, 232, 208, 0.4)",
                fontSize: 14,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ×
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      <div>
        <p style={{ fontSize: 11, color: "rgba(244, 232, 208, 0.4)", margin: "0 0 6px" }}>
          Choose an icon for your strength:
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
          {STRENGTH_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => setSelectedEmoji(emoji)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                border: selectedEmoji === emoji ? "2px solid rgba(212, 133, 58, 0.6)" : "1px solid rgba(244, 232, 208, 0.1)",
                background: selectedEmoji === emoji ? "rgba(212, 133, 58, 0.15)" : "rgba(244, 232, 208, 0.04)",
                fontSize: 18,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s",
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder={labels.strengthPlaceholder}
          data-testid="input-strength"
          style={{
            flex: 1,
            padding: "10px 14px",
            background: "rgba(244, 232, 208, 0.06)",
            border: "1px solid rgba(212, 133, 58, 0.2)",
            borderRadius: 10,
            color: "#f4e8d0",
            fontSize: 13,
            fontFamily: "Inter, sans-serif",
            outline: "none",
          }}
        />
        <motion.button
          onClick={handleAdd}
          disabled={!input.trim()}
          whileHover={input.trim() ? { scale: 1.05 } : {}}
          whileTap={input.trim() ? { scale: 0.95 } : {}}
          data-testid="button-add-strength"
          style={{
            padding: "10px 16px",
            background: input.trim() ? "linear-gradient(135deg, #d4853a, #8a5828)" : "rgba(244, 232, 208, 0.06)",
            border: "none",
            borderRadius: 10,
            color: input.trim() ? "#f4e8d0" : "rgba(244, 232, 208, 0.3)",
            fontSize: 13,
            fontWeight: 600,
            cursor: input.trim() ? "pointer" : "not-allowed",
          }}
        >
          + Add
        </motion.button>
      </div>
    </div>
  );
}
