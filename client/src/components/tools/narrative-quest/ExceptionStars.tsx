import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { AgeMode, ExceptionStar } from "./quest-data";
import { AGE_LABELS } from "./quest-data";

interface ExceptionStarsProps {
  problemName: string;
  stars: ExceptionStar[];
  onAdd: (text: string) => void;
  onRemove: (id: string) => void;
  ageMode: AgeMode;
}

export function ExceptionStars({ problemName, stars, onAdd, onRemove, ageMode }: ExceptionStarsProps) {
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
          borderLeft: "3px solid rgba(196, 164, 58, 0.3)",
        }}
      >
        <p style={{ fontSize: 13, lineHeight: 1.7, margin: 0, color: "rgba(244, 232, 208, 0.75)" }}>
          {labels.exceptionPrompt}
        </p>
      </motion.div>

      <div style={{ textAlign: "center", marginBottom: 4 }}>
        <p style={{ fontSize: 12, color: "rgba(244, 232, 208, 0.5)", margin: "0 0 8px" }}>
          Times "{problemName}" didn't win:
        </p>
      </div>

      <AnimatePresence>
        {stars.map((star, i) => (
          <motion.div
            key={star.id}
            initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            style={{
              position: "relative",
              background: "rgba(196, 164, 58, 0.08)",
              border: "1px solid rgba(196, 164, 58, 0.2)",
              borderRadius: 14,
              padding: "12px 40px 12px 16px",
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
            }}
          >
            <motion.span
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
              style={{ fontSize: 18, flexShrink: 0 }}
            >
              ⭐
            </motion.span>
            <p style={{ fontSize: 13, fontFamily: "'Lora', Georgia, serif", color: "rgba(244, 232, 208, 0.8)", margin: 0, lineHeight: 1.5 }}>
              {star.text}
            </p>
            <button
              onClick={() => onRemove(star.id)}
              data-testid={`button-remove-star-${star.id}`}
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
          placeholder={labels.exceptionPlaceholder}
          data-testid="input-exception"
          style={{
            flex: 1,
            padding: "10px 14px",
            background: "rgba(244, 232, 208, 0.06)",
            border: "1px solid rgba(196, 164, 58, 0.2)",
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
          data-testid="button-add-exception"
          style={{
            padding: "10px 16px",
            background: input.trim() ? "linear-gradient(135deg, #c4a43a, #8a7828)" : "rgba(244, 232, 208, 0.06)",
            border: "none",
            borderRadius: 10,
            color: input.trim() ? "#f4e8d0" : "rgba(244, 232, 208, 0.3)",
            fontSize: 13,
            fontWeight: 600,
            cursor: input.trim() ? "pointer" : "not-allowed",
          }}
        >
          + Add ⭐
        </motion.button>
      </div>
    </div>
  );
}
