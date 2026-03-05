import { useState } from "react";
import { motion } from "framer-motion";
import type { AgeMode } from "./CBTThoughtCourt";
import { COGNITIVE_DISTORTIONS } from "./distortions-data";

// ── Types ──────────────────────────────────────────────────────────────────

export interface ReframeStationProps {
  originalThought: string;
  reframedThought: string;
  onChange: (value: string) => void;
  ageMode: AgeMode;
  selectedDistortions: string[];
}

// ── Colors ─────────────────────────────────────────────────────────────────

const GOLD = "#d4a853";
const PARCHMENT = "#f0e8d8";
const INPUT_BG = "rgba(15, 10, 25, 0.7)";
const INPUT_BORDER = "rgba(120, 100, 180, 0.3)";
const BADGE_BG = "rgba(212, 168, 83, 0.15)";
const BADGE_BORDER = "rgba(212, 168, 83, 0.35)";
const HINT_BG = "rgba(39, 174, 96, 0.1)";
const HINT_BORDER = "rgba(39, 174, 96, 0.25)";
const HINT_ACCENT = "#27ae60";
const ARROW_COLOR = "rgba(212, 168, 83, 0.5)";

// ── Placeholder text by age ────────────────────────────────────────────────

const PLACEHOLDERS: Record<AgeMode, string> = {
  child: "What's a kinder, more true way to think about this?",
  teen: "Rewrite the thought in a way that's more fair and balanced",
  adult: "Formulate a balanced alternative thought that accounts for the evidence",
};

// ── Helper prompts by age ──────────────────────────────────────────────────

const HELPER_PROMPTS: Record<AgeMode, string[]> = {
  child: [
    "What would you tell your best friend if they had this thought?",
    "What do you think will really happen?",
    "Is there something in between the worst thing and the best thing?",
  ],
  teen: [
    "What would you say to a friend who was thinking this?",
    "What's the most realistic outcome here?",
    "Is there a middle ground between your worst fear and best-case scenario?",
  ],
  adult: [
    "What would you tell a friend who had this thought?",
    "What's the most realistic outcome?",
    "Is there a middle ground between your worst fear and best case?",
  ],
};

// ── Component ──────────────────────────────────────────────────────────────

export function ReframeStation({
  originalThought,
  reframedThought,
  onChange,
  ageMode,
  selectedDistortions,
}: ReframeStationProps) {
  const [isFocused, setIsFocused] = useState(false);

  // Look up distortion names from ids
  const distortionBadges = selectedDistortions
    .map((id) => {
      const distortion = COGNITIVE_DISTORTIONS.find((d) => d.id === id);
      return distortion ? { id, name: distortion.name, icon: distortion.icon } : null;
    })
    .filter(Boolean) as { id: string; name: string; icon: string }[];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* ── Header ──────────────────────────────────────────── */}
      <div style={{ textAlign: "center", padding: "10px 0 4px" }}>
        <span style={{ fontSize: 28 }}>{"\uD83D\uDCDC\u270F\uFE0F"}</span>
        <h3
          style={{
            margin: "6px 0 0",
            fontSize: 18,
            fontWeight: 700,
            color: GOLD,
            letterSpacing: 0.5,
          }}
        >
          The Appeal
        </h3>
        <p
          style={{
            margin: "6px 0 0",
            fontSize: 13,
            color: PARCHMENT,
            opacity: 0.7,
          }}
        >
          {ageMode === "child"
            ? "Time to rewrite your thought in a kinder way!"
            : ageMode === "teen"
              ? "Craft a more balanced version of your original thought"
              : "Formulate a balanced alternative that integrates the evidence"}
        </p>
      </div>

      {/* ── Original thought (struck-through "Before" card) ─── */}
      <div
        style={{
          padding: "14px 16px",
          background: "rgba(15, 10, 25, 0.45)",
          border: `1px solid ${INPUT_BORDER}`,
          borderRadius: 10,
          opacity: 0.7,
        }}
      >
        <span
          style={{
            display: "block",
            fontSize: 11,
            fontWeight: 700,
            color: "rgba(192, 57, 43, 0.8)",
            letterSpacing: 0.6,
            marginBottom: 6,
            textTransform: "uppercase",
          }}
        >
          Before
        </span>
        <span
          style={{
            fontSize: 14,
            color: PARCHMENT,
            fontStyle: "italic",
            lineHeight: 1.5,
            textDecoration: "line-through",
            textDecorationColor: "rgba(192, 57, 43, 0.5)",
            opacity: 0.65,
          }}
        >
          "{originalThought}"
        </span>
      </div>

      {/* ── Distortion badges ─────────────────────────────────── */}
      {distortionBadges.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            justifyContent: "center",
          }}
        >
          {distortionBadges.map((badge) => (
            <span
              key={badge.id}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "4px 10px",
                background: BADGE_BG,
                border: `1px solid ${BADGE_BORDER}`,
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 600,
                color: GOLD,
                letterSpacing: 0.3,
              }}
            >
              <span style={{ fontSize: 13 }}>{badge.icon}</span>
              {badge.name}
            </span>
          ))}
        </div>
      )}

      {/* ── Arrow visual (transformation indicator) ──────────── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          padding: "4px 0",
        }}
      >
        <motion.div
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            color: ARROW_COLOR,
          }}
        >
          <div
            style={{
              width: 2,
              height: 24,
              background: `linear-gradient(to bottom, transparent, ${ARROW_COLOR})`,
            }}
          />
          <span style={{ fontSize: 18, lineHeight: 1 }}>{"\u25BC"}</span>
        </motion.div>
        <span
          style={{
            fontSize: 11,
            color: GOLD,
            opacity: 0.6,
            fontWeight: 600,
            letterSpacing: 0.5,
            textTransform: "uppercase",
          }}
        >
          Transform
        </span>
      </div>

      {/* ── Reframe textarea ──────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <label
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: GOLD,
            letterSpacing: 0.3,
          }}
        >
          Your Balanced Thought
        </label>
        <textarea
          value={reframedThought}
          onChange={(e) => onChange(e.target.value)}
          placeholder={PLACEHOLDERS[ageMode]}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={{
            width: "100%",
            minHeight: 110,
            padding: "14px 16px",
            background: INPUT_BG,
            border: `2px solid ${isFocused ? GOLD : INPUT_BORDER}`,
            borderRadius: 12,
            color: PARCHMENT,
            fontSize: 15,
            fontFamily: "Inter, sans-serif",
            lineHeight: 1.6,
            resize: "vertical",
            outline: "none",
            boxSizing: "border-box",
            transition: "border-color 0.25s, box-shadow 0.25s",
            boxShadow: isFocused
              ? `0 0 0 3px rgba(212, 168, 83, 0.15), 0 0 20px rgba(212, 168, 83, 0.08)`
              : "none",
          }}
        />
        {reframedThought.trim() && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              fontSize: 12,
              color: HINT_ACCENT,
              fontWeight: 500,
              textAlign: "right",
              opacity: 0.8,
            }}
          >
            {"\u2713"} Balanced thought recorded
          </motion.div>
        )}
      </div>

      {/* ── Helper prompts (always visible hint cards) ─────────── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          borderTop: `1px solid ${INPUT_BORDER}`,
          paddingTop: 16,
          marginTop: 2,
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: GOLD,
            letterSpacing: 0.3,
          }}
        >
          {ageMode === "child"
            ? "Try asking yourself..."
            : ageMode === "teen"
              ? "Questions to guide your reframe"
              : "Guided reflection prompts"}
        </span>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {HELPER_PROMPTS[ageMode].map((prompt) => (
            <motion.div
              key={prompt}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                padding: "10px 14px",
                background: HINT_BG,
                border: `1px solid ${HINT_BORDER}`,
                borderRadius: 8,
                fontSize: 13,
                color: PARCHMENT,
                lineHeight: 1.45,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span
                style={{
                  fontSize: 14,
                  flexShrink: 0,
                  opacity: 0.7,
                }}
              >
                {"\uD83D\uDCA1"}
              </span>
              {prompt}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
