import { motion } from "framer-motion";
import type { AgeMode, ConfidenceLevel } from "./ladder-data";

interface BraveCommitmentProps {
  commitmentText: string;
  selfCompassion: string;
  confidenceLevel: ConfidenceLevel | null;
  onSetCommitment: (t: string) => void;
  onSetSelfCompassion: (t: string) => void;
  onSetConfidence: (c: ConfidenceLevel) => void;
  ageMode: AgeMode;
}

const CONFIDENCE_OPTIONS: { id: ConfidenceLevel; label: string; emoji: string; desc: string }[] = [
  {
    id: "need-more-time",
    label: "I need more time",
    emoji: "\uD83D\uDD52",
    desc: "I want to keep thinking about it",
  },
  {
    id: "nervous-but-ready",
    label: "Nervous but ready",
    emoji: "\uD83D\uDCAA",
    desc: "I'm scared, but I'll try",
  },
  {
    id: "ready",
    label: "I'm ready to try",
    emoji: "\u2B50",
    desc: "I feel prepared to begin",
  },
];

const DEFAULT_SELF_COMPASSION =
  "It takes courage to face what scares me. I am capable of more than I think.";

export function BraveCommitment({
  commitmentText,
  selfCompassion,
  confidenceLevel,
  onSetCommitment,
  onSetSelfCompassion,
  onSetConfidence,
  ageMode,
}: BraveCommitmentProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        style={{
          background: "rgba(196, 176, 76, 0.06)",
          borderRadius: 12,
          padding: "12px 14px",
          borderLeft: "3px solid rgba(196, 176, 76, 0.3)",
        }}
      >
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7, color: "rgba(232, 220, 200, 0.75)" }}>
          {ageMode === "child"
            ? "Now let's make your brave promise. Writing it down makes it real!"
            : ageMode === "teen"
            ? "A written commitment increases follow-through. Be honest about how you're feeling."
            : "Research shows that written commitment statements significantly improve exposure therapy adherence."}
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: "#c4b04c" }}>
          {ageMode === "child"
            ? "My brave promise: *"
            : "Commitment statement (\"I commit to facing...\") *"}
        </label>
        <textarea
          value={commitmentText}
          onChange={(e) => onSetCommitment(e.target.value)}
          placeholder={
            ageMode === "child"
              ? "I promise to be brave and try..."
              : ageMode === "teen"
              ? "I commit to facing my fear of... by doing..."
              : "I commit to completing my first exposure practice by..."
          }
          rows={3}
          style={{
            width: "100%",
            padding: "12px 14px",
            background: "rgba(232, 220, 200, 0.05)",
            border: commitmentText.trim().length >= 20
              ? "1.5px solid rgba(196, 176, 76, 0.4)"
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
        <span style={{ fontSize: 11, color: "rgba(232, 220, 200, 0.3)" }}>
          {commitmentText.trim().length < 20
            ? `${20 - commitmentText.trim().length} more characters needed`
            : "\u2713 Committed"}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(232, 220, 200, 0.65)" }}>
          {ageMode === "child" ? "A kind thing I'll remember:" : "Self-compassion reminder:"}
        </label>
        <textarea
          value={selfCompassion || DEFAULT_SELF_COMPASSION}
          onChange={(e) => onSetSelfCompassion(e.target.value)}
          rows={2}
          style={{
            width: "100%",
            padding: "10px 12px",
            background: "rgba(232, 220, 200, 0.04)",
            border: "1px solid rgba(232, 220, 200, 0.1)",
            borderRadius: 10,
            color: "rgba(232, 220, 200, 0.75)",
            fontSize: 13,
            fontFamily: "Inter, sans-serif",
            lineHeight: 1.6,
            resize: "vertical",
            outline: "none",
            boxSizing: "border-box",
            fontStyle: "italic",
          }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(232, 220, 200, 0.65)" }}>
          {ageMode === "child" ? "How do I feel about my plan? *" : "How confident are you in your plan? *"}
        </label>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {CONFIDENCE_OPTIONS.map((opt, i) => {
            const isSelected = confidenceLevel === opt.id;
            return (
              <motion.button
                key={opt.id}
                type="button"
                onClick={() => onSetConfidence(opt.id)}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: isSelected
                    ? "1.5px solid rgba(100, 168, 212, 0.5)"
                    : "1px solid rgba(232, 220, 200, 0.08)",
                  background: isSelected
                    ? "rgba(100, 168, 212, 0.12)"
                    : "rgba(232, 220, 200, 0.03)",
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                  outline: "none",
                  textAlign: "left",
                  transition: "all 0.2s",
                }}
              >
                <span style={{ fontSize: 22, flexShrink: 0 }}>{opt.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: isSelected ? 600 : 500,
                      color: isSelected ? "#a8d8f8" : "#e8dcc8",
                      marginBottom: 2,
                    }}
                  >
                    {opt.label}
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(232, 220, 200, 0.4)" }}>
                    {opt.desc}
                  </div>
                </div>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      background: "#64a8d4",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 10,
                      color: "#080c14",
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {"\u2713"}
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
