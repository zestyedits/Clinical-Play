import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { AgeMode, Strength } from "./quest-data";
import { STRENGTH_CARDS, CUSTOM_STRENGTH_EMOJIS } from "./quest-data";

interface StrengthsFinderProps {
  strengths: Strength[];
  onAdd: (text: string, emoji: string) => void;
  onRemove: (id: string) => void;
  ageMode: AgeMode;
}

const PROMPTS: Record<AgeMode, string> = {
  child: "What superpowers do you have that help you fight the troublemaker? Pick cards that feel like YOU, or add your own!",
  teen: "What qualities or skills have helped you push back? Choose the ones that resonate, or create your own.",
  adult: "What personal qualities, values, or resources have helped you resist the problem's influence? Select from the cards or add your own.",
};

export function StrengthsFinder({ strengths, onAdd, onRemove, ageMode }: StrengthsFinderProps) {
  const [customInput, setCustomInput] = useState("");
  const [customEmoji, setCustomEmoji] = useState("🛡️");
  const [showCustom, setShowCustom] = useState(false);

  const selectedIds = strengths.map((s) => s.text.toLowerCase());

  const handleCardToggle = (card: typeof STRENGTH_CARDS[0]) => {
    const existing = strengths.find((s) => s.text === card.label);
    if (existing) {
      onRemove(existing.id);
    } else {
      onAdd(card.label, card.emoji);
    }
  };

  const handleCustomAdd = () => {
    const trimmed = customInput.trim();
    if (trimmed) {
      onAdd(trimmed, customEmoji);
      setCustomInput("");
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
          {PROMPTS[ageMode]}
        </p>
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8 }}>
        {STRENGTH_CARDS.map((card, i) => {
          const isSelected = selectedIds.includes(card.label.toLowerCase());
          return (
            <motion.button
              key={card.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.03 }}
              onClick={() => handleCardToggle(card)}
              data-testid={`strength-card-${card.id}`}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{
                padding: "12px 10px",
                borderRadius: 12,
                border: isSelected ? "2px solid rgba(212, 133, 58, 0.5)" : "1px solid rgba(244, 232, 208, 0.1)",
                background: isSelected ? "rgba(212, 133, 58, 0.12)" : "rgba(244, 232, 208, 0.04)",
                cursor: "pointer",
                textAlign: "center",
                transition: "all 0.15s",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
              }}
            >
              <span style={{ fontSize: 24 }}>{card.emoji}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: isSelected ? "#d4853a" : "rgba(244, 232, 208, 0.7)" }}>
                {card.label}
              </span>
              <span style={{ fontSize: 10, color: "rgba(244, 232, 208, 0.4)", lineHeight: 1.3 }}>
                {card.description[ageMode]}
              </span>
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{ fontSize: 12, color: "#d4853a" }}
                >
                  ✓
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      <button
        onClick={() => setShowCustom(!showCustom)}
        style={{
          background: "rgba(244, 232, 208, 0.04)",
          border: "1px solid rgba(212, 133, 58, 0.15)",
          borderRadius: 10,
          padding: "10px 14px",
          color: "rgba(244, 232, 208, 0.5)",
          fontSize: 12,
          cursor: "pointer",
          textAlign: "center",
        }}
      >
        {showCustom ? "Hide custom strength" : "+ Add a custom strength"}
      </button>

      <AnimatePresence>
        {showCustom && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
              {CUSTOM_STRENGTH_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setCustomEmoji(emoji)}
                  style={{
                    width: 34, height: 34, borderRadius: 8, fontSize: 16,
                    border: customEmoji === emoji ? "2px solid rgba(212, 133, 58, 0.5)" : "1px solid rgba(244, 232, 208, 0.1)",
                    background: customEmoji === emoji ? "rgba(212, 133, 58, 0.15)" : "rgba(244, 232, 208, 0.04)",
                    cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCustomAdd()}
                placeholder="My own strength..."
                data-testid="input-custom-strength"
                style={{
                  flex: 1, padding: "10px 14px",
                  background: "rgba(244, 232, 208, 0.06)",
                  border: "1px solid rgba(212, 133, 58, 0.2)",
                  borderRadius: 10, color: "#f4e8d0", fontSize: 13, outline: "none",
                }}
              />
              <motion.button
                onClick={handleCustomAdd}
                disabled={!customInput.trim()}
                whileHover={customInput.trim() ? { scale: 1.05 } : {}}
                data-testid="button-add-custom-strength"
                style={{
                  padding: "10px 16px",
                  background: customInput.trim() ? "linear-gradient(135deg, #d4853a, #8a5828)" : "rgba(244, 232, 208, 0.06)",
                  border: "none", borderRadius: 10,
                  color: customInput.trim() ? "#f4e8d0" : "rgba(244, 232, 208, 0.3)",
                  fontSize: 13, fontWeight: 600,
                  cursor: customInput.trim() ? "pointer" : "not-allowed",
                }}
              >
                + Add
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {strengths.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: "rgba(212, 133, 58, 0.06)",
            borderRadius: 16,
            padding: 16,
            border: "1px solid rgba(212, 133, 58, 0.12)",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: 11, color: "rgba(244, 232, 208, 0.5)", margin: "0 0 10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Your Author Profile
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8 }}>
            {strengths.map((s) => (
              <motion.div
                key={s.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  padding: "6px 12px",
                  background: "rgba(212, 133, 58, 0.1)",
                  borderRadius: 10,
                  border: "1px solid rgba(212, 133, 58, 0.15)",
                }}
              >
                <span style={{ fontSize: 16 }}>{s.emoji}</span>
                <span style={{ fontSize: 12, color: "rgba(244, 232, 208, 0.8)", fontWeight: 500 }}>{s.text}</span>
                <button
                  onClick={() => onRemove(s.id)}
                  style={{
                    background: "none", border: "none", color: "rgba(244, 232, 208, 0.3)",
                    fontSize: 12, cursor: "pointer", padding: "0 2px",
                  }}
                >
                  ×
                </button>
              </motion.div>
            ))}
          </div>
          <p style={{ fontSize: 10, color: "rgba(244, 232, 208, 0.35)", margin: "10px 0 0" }}>
            These are the powers you'll bring to your new chapter
          </p>
        </motion.div>
      )}
    </div>
  );
}
