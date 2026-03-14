import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { AgeMode, SpeechBubble } from "./quest-data";
import { SPEECH_CATEGORIES, CHARACTER_COLORS } from "./quest-data";

interface SpeechBubblesProps {
  problemName: string;
  characterEmoji: string;
  characterColor: string;
  bubbles: SpeechBubble[];
  onAdd: (text: string, category: SpeechBubble["category"]) => void;
  onRemove: (id: string) => void;
  ageMode: AgeMode;
}

export function SpeechBubbles({ problemName, characterEmoji, characterColor, bubbles, onAdd, onRemove, ageMode }: SpeechBubblesProps) {
  const [activeCategory, setActiveCategory] = useState<SpeechBubble["category"]>("shows-up");
  const [input, setInput] = useState("");
  const activeHex = CHARACTER_COLORS.find((c) => c.id === characterColor)?.hex || "#6b6b7b";
  const categoryConfig = SPEECH_CATEGORIES.find((c) => c.id === activeCategory)!;

  const handleAdd = () => {
    const trimmed = input.trim();
    if (trimmed) {
      onAdd(trimmed, activeCategory);
      setInput("");
    }
  };

  const categoryBubbles = bubbles.filter((b) => b.category === activeCategory);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ textAlign: "center", marginBottom: 4 }}>
        <span style={{ fontSize: 32, filter: `drop-shadow(0 2px 8px ${activeHex}40)` }}>{characterEmoji}</span>
        <p style={{ fontSize: 14, fontFamily: "'Lora', Georgia, serif", fontWeight: 600, color: activeHex, margin: "4px 0 0" }}>
          What does "{problemName}" say?
        </p>
      </div>

      <div style={{ display: "flex", gap: 4, background: "rgba(244, 232, 208, 0.04)", borderRadius: 12, padding: 3 }}>
        {SPEECH_CATEGORIES.map((cat) => {
          const count = bubbles.filter((b) => b.category === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              data-testid={`tab-${cat.id}`}
              style={{
                flex: 1,
                padding: "10px 6px",
                fontSize: 12,
                fontWeight: 600,
                border: "none",
                borderRadius: 10,
                cursor: "pointer",
                transition: "all 0.2s",
                background: activeCategory === cat.id ? `${activeHex}30` : "transparent",
                color: activeCategory === cat.id ? "#f4e8d0" : "rgba(244, 232, 208, 0.45)",
              }}
            >
              {cat.label} {count > 0 && <span style={{ opacity: 0.6 }}>({count})</span>}
            </button>
          );
        })}
      </div>

      <motion.div
        key={activeCategory}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: "rgba(244, 232, 208, 0.04)",
          borderRadius: 14,
          padding: "12px 14px",
          borderLeft: `3px solid ${activeHex}40`,
        }}
      >
        <p style={{ fontSize: 13, lineHeight: 1.7, margin: 0, color: "rgba(244, 232, 208, 0.75)" }}>
          {categoryConfig.prompt[ageMode]}
        </p>
      </motion.div>

      <AnimatePresence>
        {categoryBubbles.map((bubble) => (
          <motion.div
            key={bubble.id}
            initial={{ opacity: 0, x: -20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            style={{
              position: "relative",
              background: `${activeHex}12`,
              border: `1px solid ${activeHex}25`,
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
                position: "absolute", top: 8, right: 8,
                width: 24, height: 24, borderRadius: "50%",
                background: "rgba(244, 232, 208, 0.1)",
                border: "none", color: "rgba(244, 232, 208, 0.4)",
                fontSize: 14, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
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
          placeholder={`Add what "${problemName}" says...`}
          data-testid="input-speech-bubble"
          style={{
            flex: 1, padding: "10px 14px",
            background: "rgba(244, 232, 208, 0.06)",
            border: `1px solid ${activeHex}25`,
            borderRadius: 10, color: "#f4e8d0", fontSize: 13,
            fontFamily: "Inter, sans-serif", outline: "none",
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
            background: input.trim() ? `linear-gradient(135deg, ${activeHex}, ${activeHex}cc)` : "rgba(244, 232, 208, 0.06)",
            border: "none", borderRadius: 10,
            color: input.trim() ? "#f4e8d0" : "rgba(244, 232, 208, 0.3)",
            fontSize: 13, fontWeight: 600,
            cursor: input.trim() ? "pointer" : "not-allowed",
          }}
        >
          + Add
        </motion.button>
      </div>

      {bubbles.length > 0 && (
        <div style={{ textAlign: "center", padding: 8 }}>
          <p style={{ fontSize: 10, color: "rgba(244, 232, 208, 0.35)", margin: 0 }}>
            {bubbles.length} message{bubbles.length !== 1 ? "s" : ""} captured across all categories
          </p>
        </div>
      )}
    </div>
  );
}
