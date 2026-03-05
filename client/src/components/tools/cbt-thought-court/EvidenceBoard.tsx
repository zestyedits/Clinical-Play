import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { AgeMode } from "./CBTThoughtCourt";

// ── Types ──────────────────────────────────────────────────────────────────

export interface EvidenceBoardProps {
  side: "prosecution" | "defense";
  evidence: string[];
  onAdd: (text: string) => void;
  onRemove: (index: number) => void;
  ageMode: AgeMode;
  originalThought: string;
}

// ── Colors ─────────────────────────────────────────────────────────────────

const GOLD = "#d4a853";
const PARCHMENT = "#f0e8d8";
const INPUT_BG = "rgba(15, 10, 25, 0.7)";
const INPUT_BORDER = "rgba(120, 100, 180, 0.3)";

const PROSECUTION_ACCENT = "#c0392b";
const DEFENSE_ACCENT = "#27ae60";

const PROSECUTION_CARD_BG = "rgba(192, 57, 43, 0.12)";
const PROSECUTION_CARD_BORDER = "rgba(192, 57, 43, 0.35)";
const DEFENSE_CARD_BG = "rgba(39, 174, 96, 0.12)";
const DEFENSE_CARD_BORDER = "rgba(39, 174, 96, 0.35)";

// ── Placeholder text by side + age ─────────────────────────────────────────

const PLACEHOLDERS: Record<"prosecution" | "defense", Record<AgeMode, string>> = {
  prosecution: {
    child: "What makes you think this thought might be true?",
    teen: "What evidence supports this thought?",
    adult: "What facts support this automatic thought?",
  },
  defense: {
    child: "What makes you think this thought might NOT be true?",
    teen: "What evidence goes against it? What would you tell a friend?",
    adult: "What contradicts this thought? Consider alternative explanations.",
  },
};

// ── Helper prompts ─────────────────────────────────────────────────────────

const HELPER_PROMPTS: Record<"prosecution" | "defense", Record<AgeMode, string[]>> = {
  prosecution: {
    child: [
      "Did something happen that made you feel this way?",
      "Has this happened before?",
      "What did someone say or do?",
    ],
    teen: [
      "What specific events support this thought?",
      "Are there facts (not feelings) that back it up?",
      "What happened that triggered this belief?",
    ],
    adult: [
      "What observable facts support this thought?",
      "What specific evidence do you have?",
      "Are there measurable outcomes that confirm it?",
    ],
  },
  defense: {
    child: [
      "What would you tell a friend who thought this?",
      "Has there been a time this thought wasn't true?",
      "What are you leaving out?",
    ],
    teen: [
      "What would you tell a friend who had this thought?",
      "Has there been a time this thought wasn't true?",
      "What are you leaving out or ignoring?",
      "Is there another way to look at this?",
    ],
    adult: [
      "What would you tell a friend in this situation?",
      "Has there been a time this thought wasn't true?",
      "What are you leaving out?",
      "What alternative explanations exist?",
      "Will this matter in 5 years?",
    ],
  },
};

// ── Component ──────────────────────────────────────────────────────────────

export function EvidenceBoard({
  side,
  evidence,
  onAdd,
  onRemove,
  ageMode,
  originalThought,
}: EvidenceBoardProps) {
  const [inputText, setInputText] = useState("");
  const [helpersOpen, setHelpersOpen] = useState(false);

  const accent = side === "prosecution" ? PROSECUTION_ACCENT : DEFENSE_ACCENT;
  const cardBg = side === "prosecution" ? PROSECUTION_CARD_BG : DEFENSE_CARD_BG;
  const cardBorder = side === "prosecution" ? PROSECUTION_CARD_BORDER : DEFENSE_CARD_BORDER;
  const headerText =
    side === "prosecution" ? "The Prosecution Presents" : "The Defense Responds";
  const headerEmoji = side === "prosecution" ? "\u2696\uFE0F" : "\uD83D\uDEE1\uFE0F";

  const handleAdd = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setInputText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* ── Header ──────────────────────────────────────────── */}
      <div style={{ textAlign: "center", padding: "10px 0 4px" }}>
        <span style={{ fontSize: 26 }}>{headerEmoji}</span>
        <h3
          style={{
            margin: "6px 0 0",
            fontSize: 16,
            fontWeight: 700,
            color: accent,
            letterSpacing: 0.5,
          }}
        >
          {headerText}
        </h3>
      </div>

      {/* ── Original thought reference ──────────────────────── */}
      <div
        style={{
          padding: "10px 14px",
          background: "rgba(15, 10, 25, 0.4)",
          border: `1px solid ${INPUT_BORDER}`,
          borderRadius: 8,
          opacity: 0.75,
        }}
      >
        <span
          style={{
            display: "block",
            fontSize: 11,
            fontWeight: 600,
            color: GOLD,
            letterSpacing: 0.4,
            marginBottom: 4,
            textTransform: "uppercase",
          }}
        >
          Thought on Trial
        </span>
        <span
          style={{
            fontSize: 13,
            color: PARCHMENT,
            fontStyle: "italic",
            lineHeight: 1.4,
          }}
        >
          "{originalThought}"
        </span>
      </div>

      {/* ── Input area ──────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <label
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: GOLD,
            letterSpacing: 0.3,
          }}
        >
          Add Evidence
        </label>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={PLACEHOLDERS[side][ageMode]}
          style={{
            width: "100%",
            minHeight: 70,
            padding: "12px 14px",
            background: INPUT_BG,
            border: `1.5px solid ${INPUT_BORDER}`,
            borderRadius: 10,
            color: PARCHMENT,
            fontSize: 14,
            fontFamily: "Inter, sans-serif",
            lineHeight: 1.5,
            resize: "vertical",
            outline: "none",
            boxSizing: "border-box",
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = accent;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = INPUT_BORDER;
          }}
        />
        <button
          onClick={handleAdd}
          disabled={!inputText.trim()}
          style={{
            alignSelf: "flex-end",
            padding: "8px 20px",
            background: inputText.trim() ? accent : "rgba(120, 100, 180, 0.2)",
            color: inputText.trim() ? "#fff" : "rgba(240, 232, 216, 0.4)",
            border: "none",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            cursor: inputText.trim() ? "pointer" : "not-allowed",
            transition: "background 0.2s, color 0.2s",
          }}
        >
          Add Evidence
        </button>
      </div>

      {/* ── Evidence count ──────────────────────────────────── */}
      <div
        style={{
          fontSize: 12,
          color: PARCHMENT,
          opacity: 0.6,
          textAlign: "center",
          fontWeight: 500,
        }}
      >
        {evidence.length} piece{evidence.length !== 1 ? "s" : ""} of evidence presented
      </div>

      {/* ── Evidence cards ──────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <AnimatePresence mode="popLayout">
          {evidence.map((item, index) => (
            <motion.div
              key={`${side}-${index}-${item}`}
              layout
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: side === "prosecution" ? -40 : 40, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              style={{
                padding: "12px 14px",
                background: cardBg,
                border: `1px solid ${cardBorder}`,
                borderRadius: 10,
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: accent,
                  letterSpacing: 0.3,
                  whiteSpace: "nowrap",
                  marginTop: 2,
                }}
              >
                Evidence #{index + 1}
              </span>
              <span
                style={{
                  flex: 1,
                  fontSize: 13,
                  color: PARCHMENT,
                  lineHeight: 1.45,
                }}
              >
                {item}
              </span>
              <button
                onClick={() => onRemove(index)}
                aria-label={`Remove evidence #${index + 1}`}
                style={{
                  background: "rgba(255, 255, 255, 0.06)",
                  border: "none",
                  borderRadius: 6,
                  color: PARCHMENT,
                  opacity: 0.5,
                  fontSize: 14,
                  fontWeight: 600,
                  width: 26,
                  height: 26,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  flexShrink: 0,
                  transition: "opacity 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "1";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "0.5";
                }}
              >
                ✕
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ── Helper prompts (collapsible) ────────────────────── */}
      <div
        style={{
          borderTop: `1px solid ${INPUT_BORDER}`,
          paddingTop: 14,
          marginTop: 4,
        }}
      >
        <button
          onClick={() => setHelpersOpen((prev) => !prev)}
          style={{
            background: "none",
            border: "none",
            color: GOLD,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: 0,
          }}
        >
          <span
            style={{
              display: "inline-block",
              transition: "transform 0.2s",
              transform: helpersOpen ? "rotate(90deg)" : "rotate(0deg)",
              fontSize: 12,
            }}
          >
            ▶
          </span>
          Need help? Try these prompts
        </button>
        <AnimatePresence>
          {helpersOpen && (
            <motion.ul
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              style={{
                margin: "10px 0 0",
                paddingLeft: 18,
                listStyle: "none",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {HELPER_PROMPTS[side][ageMode].map((prompt) => (
                <li
                  key={prompt}
                  style={{
                    fontSize: 12,
                    color: PARCHMENT,
                    opacity: 0.7,
                    lineHeight: 1.4,
                    position: "relative",
                    paddingLeft: 14,
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      left: 0,
                      color: accent,
                      fontWeight: 700,
                    }}
                  >
                    •
                  </span>
                  {prompt}
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
