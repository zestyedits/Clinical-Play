import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { AgeMode, ExceptionStar } from "./quest-data";
import { SPEECH_CATEGORIES } from "./quest-data";

interface ExceptionStarsProps {
  problemName: string;
  characterEmoji: string;
  stars: ExceptionStar[];
  onAdd: (text: string) => void;
  onRemove: (id: string) => void;
  ageMode: AgeMode;
}

const EXCEPTION_PROMPTS: Record<AgeMode, string> = {
  child: "Can you think of times when the troublemaker was quiet or you didn't listen to it? These are your star moments!",
  teen: "When were the times this problem had less power over you? What was different about those moments?",
  adult: "Identify unique outcomes — moments when you acted outside the problem's influence. What made those moments possible?",
};

const EXCEPTION_PLACEHOLDERS: Record<AgeMode, string> = {
  child: "One time I didn't listen was...",
  teen: "There was a time when...",
  adult: "A unique outcome was...",
};

export function ExceptionStars({ problemName, characterEmoji, stars, onAdd, onRemove, ageMode }: ExceptionStarsProps) {
  const [input, setInput] = useState("");

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
          {EXCEPTION_PROMPTS[ageMode]}
        </p>
      </motion.div>

      <div
        style={{
          position: "relative",
          background: "linear-gradient(180deg, rgba(10,8,20,0.9), rgba(15,12,25,0.95))",
          borderRadius: 16,
          padding: "24px 16px",
          minHeight: stars.length > 0 ? 180 : 100,
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                width: 2, height: 2,
                borderRadius: "50%",
                background: "rgba(244, 232, 208, 0.15)",
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `nq-w-twinkle ${2 + Math.random() * 3}s ease-in-out infinite ${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        <div style={{ position: "relative", zIndex: 1, textAlign: "center", marginBottom: 12 }}>
          <motion.div
            animate={{ scale: stars.length > 0 ? 0.7 : 1, opacity: stars.length > 0 ? 0.4 : 0.7 }}
            transition={{ duration: 0.5 }}
            style={{ fontSize: 28 }}
          >
            {characterEmoji}
          </motion.div>
          <p style={{ fontSize: 11, color: "rgba(244, 232, 208, 0.4)", margin: "4px 0 0" }}>
            {stars.length === 0
              ? `"${problemName}" looms in the dark...`
              : `"${problemName}" shrinks with each star ⭐`}
          </p>
        </div>

        <AnimatePresence>
          {stars.map((star, i) => (
            <motion.div
              key={star.id}
              initial={{ opacity: 0, scale: 0, rotate: -20 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              style={{
                position: "relative",
                background: "rgba(196, 164, 58, 0.1)",
                border: "1px solid rgba(196, 164, 58, 0.2)",
                borderRadius: 14,
                padding: "10px 36px 10px 14px",
                marginBottom: 8,
                display: "flex",
                alignItems: "flex-start",
                gap: 8,
              }}
            >
              <motion.span
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.15, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4 }}
                style={{ fontSize: 16, flexShrink: 0 }}
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
                  position: "absolute", top: 6, right: 6,
                  width: 22, height: 22, borderRadius: "50%",
                  background: "rgba(244, 232, 208, 0.1)",
                  border: "none", color: "rgba(244, 232, 208, 0.4)",
                  fontSize: 13, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                ×
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder={EXCEPTION_PLACEHOLDERS[ageMode]}
          data-testid="input-exception"
          style={{
            flex: 1, padding: "10px 14px",
            background: "rgba(244, 232, 208, 0.06)",
            border: "1px solid rgba(196, 164, 58, 0.2)",
            borderRadius: 10, color: "#f4e8d0", fontSize: 13,
            fontFamily: "Inter, sans-serif", outline: "none",
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
            border: "none", borderRadius: 10,
            color: input.trim() ? "#f4e8d0" : "rgba(244, 232, 208, 0.3)",
            fontSize: 13, fontWeight: 600,
            cursor: input.trim() ? "pointer" : "not-allowed",
          }}
        >
          + Add ⭐
        </motion.button>
      </div>
    </div>
  );
}
