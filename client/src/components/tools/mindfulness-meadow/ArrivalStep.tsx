import type { AgeMode } from "./meadow-data";

interface ArrivalStepProps {
  arrivalNote: string;
  onSetNote: (t: string) => void;
  ageMode: AgeMode;
}

const PROMPTS: Record<AgeMode, string> = {
  child: "What are you bringing with you today? How are you feeling right now?",
  teen: "What's on your mind as you arrive? Any emotions, worries, or thoughts?",
  adult:
    "Take a moment to notice what you're carrying into this space. What thoughts, feelings, or sensations are present?",
};

const BREATHE_LABELS = ["Breathe In", "Hold", "Breathe Out", "Rest"];

export function ArrivalStep({ arrivalNote, onSetNote, ageMode }: ArrivalStepProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <style>{`
        @keyframes mm-breathe {
          0%, 100% { transform: scale(0.85); opacity: 0.3; }
          50% { transform: scale(1.15); opacity: 0.9; }
        }
      `}</style>

      <div>
        <p
          style={{
            fontSize: 13,
            color: "rgba(232, 220, 200, 0.65)",
            margin: "0 0 10px",
            lineHeight: 1.6,
          }}
        >
          {PROMPTS[ageMode]}
        </p>
        <textarea
          value={arrivalNote}
          onChange={(e) => onSetNote(e.target.value)}
          placeholder="Write freely here... there's no right or wrong answer."
          rows={5}
          style={{
            width: "100%",
            background: "rgba(232, 220, 200, 0.05)",
            border: "1px solid rgba(91, 168, 196, 0.2)",
            borderRadius: 12,
            padding: "12px 14px",
            fontSize: 14,
            color: "#e8dcc8",
            fontFamily: "Inter, sans-serif",
            resize: "vertical",
            outline: "none",
            lineHeight: 1.6,
            boxSizing: "border-box",
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(91, 168, 196, 0.5)"; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(91, 168, 196, 0.2)"; }}
        />
        {arrivalNote.trim().length === 0 && (
          <p style={{ fontSize: 11, color: "rgba(91, 168, 196, 0.6)", margin: "6px 0 0" }}>
            Write at least one word to continue.
          </p>
        )}
      </div>

      <div
        style={{
          background: "rgba(232, 220, 200, 0.03)",
          borderRadius: 14,
          padding: "18px 16px",
          border: "1px solid rgba(91, 168, 196, 0.1)",
        }}
      >
        <p
          style={{
            fontSize: 12,
            color: "rgba(232, 220, 200, 0.45)",
            margin: "0 0 14px",
            textAlign: "center",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontWeight: 600,
          }}
        >
          While you write, breathe gently
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 16,
          }}
        >
          {BREATHE_LABELS.map((label, i) => (
            <div
              key={label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "rgba(91, 168, 196, 0.25)",
                  border: "1px solid rgba(91, 168, 196, 0.4)",
                  animation: `mm-breathe 4s ease-in-out infinite`,
                  animationDelay: `${i * 1}s`,
                }}
              />
              <span
                style={{
                  fontSize: 10,
                  color: "rgba(232, 220, 200, 0.4)",
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
