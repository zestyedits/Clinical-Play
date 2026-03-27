import type { AgeMode } from "./meadow-data";
import { SENSE_PROMPTS } from "./meadow-data";

interface SensesStepProps {
  senses: Record<string, string>;
  onSetSense: (key: string, value: string) => void;
  ageMode: AgeMode;
}

const PROMPTS: Record<AgeMode, string> = {
  child: "Look around you and notice what you can see, hear, touch, smell, and taste right now.",
  teen: "Use your five senses to ground yourself in this moment. What do you notice?",
  adult: "Ground yourself by noticing what each of your senses picks up right now.",
};

export function SensesStep({ senses, onSetSense, ageMode }: SensesStepProps) {
  const filledCount = SENSE_PROMPTS.filter((p) => (senses[p.sense] || "").trim().length > 0).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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

      {SENSE_PROMPTS.map(({ sense, emoji, label }) => {
        const value = senses[sense] || "";
        const hasValue = value.trim().length > 0;
        return (
          <div
            key={sense}
            style={{
              background: hasValue
                ? "rgba(212, 180, 76, 0.07)"
                : "rgba(232, 220, 200, 0.03)",
              borderRadius: 12,
              padding: "12px 14px",
              border: hasValue
                ? "1px solid rgba(212, 180, 76, 0.2)"
                : "1px solid rgba(232, 220, 200, 0.08)",
              borderLeft: hasValue
                ? "3px solid rgba(212, 180, 76, 0.5)"
                : "3px solid rgba(232, 220, 200, 0.12)",
              transition: "all 0.2s",
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
                fontSize: 12,
                color: hasValue ? "rgba(212, 180, 76, 0.85)" : "rgba(232, 220, 200, 0.45)",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                cursor: "default",
              }}
            >
              <span style={{ fontSize: 16 }}>{emoji}</span>
              {label}
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => onSetSense(sense, e.target.value)}
              placeholder={`Notice something you can ${sense}...`}
              style={{
                width: "100%",
                background: "rgba(232, 220, 200, 0.04)",
                border: "1px solid rgba(212, 180, 76, 0.15)",
                borderRadius: 8,
                padding: "8px 12px",
                fontSize: 13,
                color: "#e8dcc8",
                fontFamily: "Inter, sans-serif",
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(212, 180, 76, 0.4)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(212, 180, 76, 0.15)"; }}
            />
          </div>
        );
      })}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          padding: "8px 14px",
          background: "rgba(212, 180, 76, 0.06)",
          borderRadius: 10,
          border: "1px solid rgba(212, 180, 76, 0.1)",
        }}
      >
        <span style={{ fontSize: 14 }}>🌸</span>
        <span
          style={{
            fontSize: 12,
            color: filledCount >= 3 ? "rgba(212, 180, 76, 0.85)" : "rgba(232, 220, 200, 0.35)",
            fontWeight: 500,
          }}
        >
          {filledCount}/5 senses noticed
          {filledCount < 3 ? ` — fill at least 3 to continue` : ""}
        </span>
      </div>
    </div>
  );
}
