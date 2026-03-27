import type { AgeMode, LKRecipient } from "./meadow-data";
import { LK_RECIPIENTS, LK_PHRASES } from "./meadow-data";

interface LovingKindnessStepProps {
  recipient: LKRecipient | null;
  phrases: string[];
  onSetRecipient: (r: LKRecipient) => void;
  onSetPhrase: (i: number, text: string) => void;
  ageMode: AgeMode;
}

const PROMPTS: Record<AgeMode, string> = {
  child:
    "Pick someone to send kind wishes to. Then read the kind words out loud or in your head.",
  teen:
    "Choose who to offer loving-kindness to today. You can change the phrases to feel more real to you.",
  adult:
    "Choose who to offer loving-kindness to today, then read or personalize the phrases.",
};

export function LovingKindnessStep({
  recipient,
  phrases,
  onSetRecipient,
  onSetPhrase,
  ageMode,
}: LovingKindnessStepProps) {
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

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
        }}
      >
        {LK_RECIPIENTS.map(({ id, label, emoji, desc }) => {
          const isSelected = recipient === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSetRecipient(id)}
              style={{
                background: isSelected
                  ? "rgba(212, 120, 144, 0.2)"
                  : "rgba(232, 220, 200, 0.04)",
                border: isSelected
                  ? "1px solid rgba(212, 120, 144, 0.5)"
                  : "1px solid rgba(232, 220, 200, 0.1)",
                borderRadius: 12,
                padding: "12px 10px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                cursor: "pointer",
                transition: "all 0.2s",
                boxShadow: isSelected ? "0 0 14px rgba(212, 120, 144, 0.15)" : "none",
              }}
            >
              <span style={{ fontSize: 24 }}>{emoji}</span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: isSelected ? "#e8a0b0" : "rgba(232, 220, 200, 0.6)",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {label}
              </span>
              <span
                style={{
                  fontSize: 10,
                  color: isSelected ? "rgba(232, 166, 180, 0.7)" : "rgba(232, 220, 200, 0.3)",
                  textAlign: "center",
                  lineHeight: 1.3,
                }}
              >
                {desc}
              </span>
            </button>
          );
        })}
      </div>

      {recipient && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <p
            style={{
              fontSize: 12,
              color: "rgba(212, 120, 144, 0.7)",
              margin: 0,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            💛 Loving-Kindness Phrases
          </p>
          {(phrases.length > 0 ? phrases : LK_PHRASES[recipient]).map((phrase, i) => (
            <div
              key={i}
              style={{
                background: "rgba(212, 120, 144, 0.06)",
                border: "1px solid rgba(212, 120, 144, 0.15)",
                borderRadius: 12,
                padding: "10px 14px",
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
              }}
            >
              <span style={{ fontSize: 14, marginTop: 2, flexShrink: 0 }}>💛</span>
              <textarea
                value={phrase}
                onChange={(e) => onSetPhrase(i, e.target.value)}
                rows={2}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  fontSize: 13,
                  color: "rgba(232, 220, 200, 0.85)",
                  fontFamily: "'Lora', Georgia, serif",
                  fontStyle: "italic",
                  lineHeight: 1.6,
                  resize: "none",
                  padding: 0,
                }}
              />
            </div>
          ))}
        </div>
      )}

      {!recipient && (
        <p style={{ fontSize: 11, color: "rgba(212, 120, 144, 0.6)", margin: 0 }}>
          Select a recipient to continue.
        </p>
      )}
    </div>
  );
}
