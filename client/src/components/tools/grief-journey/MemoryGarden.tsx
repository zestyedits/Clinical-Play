import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { AgeMode, Memory } from "./grief-data";

interface MemoryGardenProps {
  memories: Memory[];
  onAddMemory: (text: string) => void;
  onRemoveMemory: (id: string) => void;
  ageMode: AgeMode;
}

const PROMPTS: Record<AgeMode, { hint: string; label: string; placeholder: string }> = {
  child: {
    hint: "What are some special memories you want to keep? Write them here so we can remember together.",
    label: "Write a memory:",
    placeholder: "Something fun we did, a special moment, a kind thing they did...",
  },
  teen: {
    hint: "Add memories that feel important to hold onto. Each one is a part of your story.",
    label: "Add a memory:",
    placeholder: "A moment, a feeling, something you shared...",
  },
  adult: {
    hint: "Honoring memories is central to Worden's third task: adjusting to a world without the person. Record memories that feel meaningful.",
    label: "Add a memory:",
    placeholder: "A moment, a quality, something shared, something you treasure...",
  },
};

export function MemoryGarden({
  memories,
  onAddMemory,
  onRemoveMemory,
  ageMode,
}: MemoryGardenProps) {
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const prompts = PROMPTS[ageMode];

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (trimmed.length > 0) {
      onAddMemory(trimmed);
      setInputValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: "rgba(128,196,154,0.05)",
          borderRadius: 12,
          padding: "12px 14px",
          borderLeft: "3px solid rgba(128,196,154,0.25)",
        }}
      >
        <p style={{ margin: 0, fontSize: 13, color: "rgba(232,220,200,0.65)", lineHeight: 1.65 }}>
          {prompts.hint}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ display: "flex", flexDirection: "column", gap: 8 }}
      >
        <label style={{ fontSize: 13, fontWeight: 600, color: "#80c49a" }}>{prompts.label}</label>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={prompts.placeholder}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            style={{
              flex: 1,
              padding: "10px 12px",
              fontSize: 13,
              fontFamily: "Inter, sans-serif",
              background: "rgba(232,220,200,0.05)",
              border: isFocused
                ? "1px solid rgba(128,196,154,0.45)"
                : "1px solid rgba(232,220,200,0.1)",
              borderRadius: 10,
              color: "#e8dcc8",
              outline: "none",
              transition: "border-color 0.2s",
              boxSizing: "border-box",
            }}
          />
          <motion.button
            type="button"
            onClick={handleAdd}
            disabled={inputValue.trim().length === 0}
            whileHover={inputValue.trim().length > 0 ? { scale: 1.03 } : {}}
            whileTap={inputValue.trim().length > 0 ? { scale: 0.97 } : {}}
            style={{
              padding: "10px 16px",
              borderRadius: 10,
              border: "none",
              background:
                inputValue.trim().length > 0
                  ? "rgba(128,196,154,0.2)"
                  : "rgba(232,220,200,0.05)",
              color:
                inputValue.trim().length > 0 ? "#80c49a" : "rgba(232,220,200,0.2)",
              fontSize: 13,
              fontWeight: 600,
              cursor: inputValue.trim().length > 0 ? "pointer" : "not-allowed",
              fontFamily: "Inter, sans-serif",
              whiteSpace: "nowrap",
              transition: "all 0.2s",
              flexShrink: 0,
            }}
          >
            + Add
          </motion.button>
        </div>
      </motion.div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <AnimatePresence>
          {memories.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                textAlign: "center",
                padding: "24px 16px",
                color: "rgba(232,220,200,0.3)",
                fontSize: 13,
                fontStyle: "italic",
              }}
            >
              {"\uD83C\uDF39"} Your memory garden is waiting...
            </motion.div>
          )}
          {memories.map((memory) => (
            <motion.div
              key={memory.id}
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                padding: "12px 14px",
                borderRadius: 12,
                background: "rgba(232,220,200,0.04)",
                border: "1px solid rgba(196,154,108,0.2)",
                boxShadow: "0 0 20px rgba(196,154,108,0.04) inset",
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 10,
                    color: "rgba(196,154,108,0.5)",
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    marginBottom: 4,
                  }}
                >
                  I remember when...
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "rgba(232,220,200,0.8)",
                    lineHeight: 1.55,
                    wordBreak: "break-word",
                  }}
                >
                  {memory.text}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onRemoveMemory(memory.id)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "rgba(232,220,200,0.25)",
                  cursor: "pointer",
                  fontSize: 16,
                  padding: "0 2px",
                  lineHeight: 1,
                  flexShrink: 0,
                  marginTop: 2,
                  transition: "color 0.15s",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.color = "rgba(232,220,200,0.6)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.color = "rgba(232,220,200,0.25)";
                }}
              >
                {"\u00D7"}
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {memories.length === 0 && (
        <p
          style={{
            margin: 0,
            fontSize: 11,
            color: "rgba(232,220,200,0.28)",
            textAlign: "center",
          }}
        >
          Add at least one memory to continue
        </p>
      )}
    </div>
  );
}
