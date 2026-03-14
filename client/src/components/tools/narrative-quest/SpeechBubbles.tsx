import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { AgeMode, SpeechBubble } from "./quest-data";
import { AGE_LABELS } from "./quest-data";

interface SpeechBubblesProps {
  problemName: string;
  bubbles: SpeechBubble[];
  onAdd: (text: string) => void;
  onRemove: (id: string) => void;
  ageMode: AgeMode;
}

export function SpeechBubbles({ problemName, bubbles, onAdd, onRemove, ageMode }: SpeechBubblesProps) {
  const [input, setInput] = useState("");
  const labels = AGE_LABELS[ageMode];

  const handleAdd = () => {
    const trimmed = input.trim();
    if (trimmed) {
      onAdd(trimmed);
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
          borderLeft: "3px solid rgba(184, 120, 72, 0.3)",
        }}
      >
        <p style={{ fontSize: 13, lineHeight: 1.7, margin: 0, color: "rgba(244, 232, 208, 0.75)" }}>
          {labels.speechPrompt}
        </p>
      </motion.div>

      <div style={{ textAlign: "center", marginBottom: 4 }}>
        <span style={{ fontSize: 28 }}>👹</span>
        <p style={{ fontSize: 14, fontFamily: "'Lora', Georgia, serif", fontWeight: 600, color: "#b87848", margin: "4px 0 0" }}>
          What does "{problemName}" say?
        </p>
      </div>

      <AnimatePresence>
        {bubbles.map((bubble) => (
          <motion.div
            key={bubble.id}
            initial={{ opacity: 0, x: -20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            style={{
              position: "relative",
              background: "rgba(184, 120, 72, 0.1)",
              border: "1px solid rgba(184, 120, 72, 0.2)",
              borderRadius: 16,
              padding: "12px 40px 12px 16px",
            }}
          >
            <p style={{ fontSize: 14, fontFamily: "'Lora', Georgia, serif", fontStyle: "italic", color: "rgba(244, 232, 208, 0.8)", margin: 0, lineHeight: 1.5 }}>
              "{bubble.text}"
            </p>
            <button
              onClick={() => onRemove(bubble.id)}
              data-testid={`button-remove-bubble-${bubble.id}`}
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

      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder={labels.speechPlaceholder}
          data-testid="input-speech-bubble"
          style={{
            flex: 1,
            padding: "10px 14px",
            background: "rgba(244, 232, 208, 0.06)",
            border: "1px solid rgba(184, 120, 72, 0.2)",
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
          data-testid="button-add-bubble"
          style={{
            padding: "10px 16px",
            background: input.trim() ? "linear-gradient(135deg, #b87848, #8a5830)" : "rgba(244, 232, 208, 0.06)",
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
