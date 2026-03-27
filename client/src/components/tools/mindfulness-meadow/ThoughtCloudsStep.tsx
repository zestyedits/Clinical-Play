import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { AgeMode } from "./meadow-data";

interface ThoughtCloudsStepProps {
  thoughts: string[];
  onAddThought: (t: string) => void;
  onRemoveThought: (t: string) => void;
  ageMode: AgeMode;
}

const PROMPTS: Record<AgeMode, string> = {
  child: "What thoughts are floating around in your head right now? Name each one.",
  teen: "What thoughts are passing through your mind? Name each one gently, without judging it.",
  adult:
    "What thoughts are present right now? Name each one gently, without judgment. Simply observe.",
};

export function ThoughtCloudsStep({
  thoughts,
  onAddThought,
  onRemoveThought,
  ageMode,
}: ThoughtCloudsStepProps) {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !thoughts.includes(trimmed)) {
      onAddThought(trimmed);
      setInputValue("");
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <p
        style={{
          fontSize: 13,
          color: "rgba(232, 220, 200, 0.65)",
          margin: 0,
          lineHeight: 1.6,
        }}
      >
        {PROMPTS[ageMode]}
      </p>

      <div style={{ display: "flex", gap: 8 }}>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a thought and press Enter..."
          style={{
            flex: 1,
            background: "rgba(232, 220, 200, 0.05)",
            border: "1px solid rgba(139, 159, 212, 0.25)",
            borderRadius: 10,
            padding: "10px 14px",
            fontSize: 14,
            color: "#e8dcc8",
            fontFamily: "Inter, sans-serif",
            outline: "none",
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(139, 159, 212, 0.55)"; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(139, 159, 212, 0.25)"; }}
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!inputValue.trim()}
          style={{
            background: inputValue.trim()
              ? "linear-gradient(135deg, #4a5a8a, #3a4a7a)"
              : "rgba(232, 220, 200, 0.06)",
            border: "none",
            borderRadius: 10,
            padding: "10px 16px",
            color: inputValue.trim() ? "#e8dcc8" : "rgba(232, 220, 200, 0.25)",
            fontSize: 18,
            cursor: inputValue.trim() ? "pointer" : "not-allowed",
            transition: "all 0.2s",
            fontWeight: 700,
            minWidth: 44,
            minHeight: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          +
        </button>
      </div>

      <div
        style={{
          minHeight: 80,
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          padding: thoughts.length > 0 ? "4px 0" : 0,
        }}
      >
        <AnimatePresence mode="popLayout">
          {thoughts.map((thought) => (
            <motion.div
              key={thought}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(139, 159, 212, 0.15)",
                border: "1px solid rgba(139, 159, 212, 0.3)",
                borderRadius: 24,
                padding: "6px 10px 6px 14px",
                maxWidth: "100%",
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  color: "rgba(232, 220, 200, 0.85)",
                  fontFamily: "Inter, sans-serif",
                  lineHeight: 1.3,
                }}
              >
                <span style={{ color: "rgba(139, 159, 212, 0.7)", fontStyle: "italic" }}>I notice: </span>
                {thought}
              </span>
              <button
                type="button"
                onClick={() => onRemoveThought(thought)}
                style={{
                  background: "rgba(232, 220, 200, 0.08)",
                  border: "none",
                  borderRadius: "50%",
                  width: 20,
                  height: 20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "rgba(232, 220, 200, 0.5)",
                  fontSize: 11,
                  padding: 0,
                  flexShrink: 0,
                  transition: "all 0.15s",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "rgba(212, 120, 120, 0.2)";
                  e.currentTarget.style.color = "rgba(232, 220, 200, 0.9)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "rgba(232, 220, 200, 0.08)";
                  e.currentTarget.style.color = "rgba(232, 220, 200, 0.5)";
                }}
              >
                ×
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {thoughts.length === 0 && (
          <p
            style={{
              fontSize: 13,
              color: "rgba(232, 220, 200, 0.25)",
              margin: 0,
              fontStyle: "italic",
            }}
          >
            Your thought clouds will appear here...
          </p>
        )}
      </div>

      {thoughts.length === 0 && (
        <p style={{ fontSize: 11, color: "rgba(139, 159, 212, 0.6)", margin: 0 }}>
          Add at least 1 thought to continue.
        </p>
      )}
    </div>
  );
}
