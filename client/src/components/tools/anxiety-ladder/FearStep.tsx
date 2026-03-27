import { motion } from "framer-motion";
import type { AgeMode, AnxietyCategory } from "./ladder-data";
import { ANXIETY_CATEGORIES } from "./ladder-data";

interface FearStepProps {
  fearTopic: string;
  anxietyCategory: AnxietyCategory | null;
  onSetTopic: (t: string) => void;
  onSetCategory: (c: AnxietyCategory) => void;
  ageMode: AgeMode;
}

const PROMPTS: Record<AgeMode, string> = {
  child: "What is something that makes you feel really scared or worried?",
  teen: "What situation or thing causes you the most anxiety right now?",
  adult: "Describe the core fear or anxiety you'd like to work on:",
};

export function FearStep({ fearTopic, anxietyCategory, onSetTopic, onSetCategory, ageMode }: FearStepProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        style={{
          background: "rgba(100, 168, 212, 0.06)",
          borderRadius: 12,
          padding: "12px 14px",
          borderLeft: "3px solid rgba(100, 168, 212, 0.3)",
        }}
      >
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7, color: "rgba(232, 220, 200, 0.75)" }}>
          {ageMode === "child"
            ? "Name the thing that worries you most. There are no wrong answers \u2014 every fear is valid."
            : ageMode === "teen"
            ? "The first step is naming what scares you. Being specific helps us build a better ladder."
            : "Clearly naming your fear is the foundation of exposure therapy. The more specific, the better."}
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <label
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#64a8d4",
            letterSpacing: "0.02em",
          }}
        >
          {PROMPTS[ageMode]}
        </label>
        <textarea
          value={fearTopic}
          onChange={(e) => onSetTopic(e.target.value)}
          placeholder={
            ageMode === "child"
              ? "e.g. dogs, being alone, going to school..."
              : ageMode === "teen"
              ? "e.g. speaking in class, being judged, health scares..."
              : "e.g. public speaking, contamination, social rejection..."
          }
          rows={3}
          style={{
            width: "100%",
            padding: "12px 14px",
            background: "rgba(232, 220, 200, 0.05)",
            border: fearTopic.trim().length > 0
              ? "1.5px solid rgba(100, 168, 212, 0.4)"
              : "1px solid rgba(232, 220, 200, 0.12)",
            borderRadius: 12,
            color: "#e8dcc8",
            fontSize: 14,
            fontFamily: "Inter, sans-serif",
            lineHeight: 1.6,
            resize: "vertical",
            outline: "none",
            boxSizing: "border-box",
            transition: "border-color 0.2s",
          }}
        />
        {fearTopic.trim().length === 0 && (
          <p style={{ margin: 0, fontSize: 11, color: "rgba(232, 220, 200, 0.35)" }}>
            Required to continue
          </p>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(232, 220, 200, 0.65)" }}>
          {ageMode === "child" ? "What kind of scary is it? (optional)" : "Anxiety category (optional)"}
        </label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {ANXIETY_CATEGORIES.map((cat, i) => {
            const isSelected = anxietyCategory === cat.id;
            return (
              <motion.button
                key={cat.id}
                type="button"
                onClick={() => onSetCategory(cat.id)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                style={{
                  padding: "7px 12px",
                  borderRadius: 20,
                  border: isSelected
                    ? "1.5px solid rgba(100, 168, 212, 0.6)"
                    : "1px solid rgba(232, 220, 200, 0.1)",
                  background: isSelected
                    ? "rgba(100, 168, 212, 0.2)"
                    : "rgba(232, 220, 200, 0.04)",
                  color: isSelected ? "#a8d8f8" : "rgba(232, 220, 200, 0.6)",
                  fontSize: 12,
                  fontWeight: isSelected ? 600 : 400,
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  transition: "all 0.2s",
                }}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
