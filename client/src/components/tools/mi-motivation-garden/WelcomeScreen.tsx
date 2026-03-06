import type { AgeMode } from "./garden-data";
import { WELCOME_CONTENT } from "./garden-data";

interface WelcomeScreenProps {
  onStart: () => void;
  ageMode: AgeMode;
  onSetAgeMode: (mode: AgeMode) => void;
  onOpenGuide: () => void;
}

const AGE_MODES: { value: AgeMode; label: string }[] = [
  { value: "child", label: "Child" },
  { value: "teen", label: "Teen" },
  { value: "adult", label: "Adult" },
];

const PREVIEW_CARDS = [
  { emoji: "\uD83C\uDF0D", label: "Garden Plot", sub: "Topic" },
  { emoji: "\uD83C\uDF31", label: "Plant Seeds", sub: "Change Talk" },
  { emoji: "\uD83C\uDF3F", label: "Notice Weeds", sub: "Sustain Talk" },
  { emoji: "\uD83D\uDCA7", label: "Water Garden", sub: "Readiness" },
  { emoji: "\uD83E\uDEB4", label: "Tend the Soil", sub: "Values" },
  { emoji: "\uD83D\uDC90", label: "Harvest", sub: "Commitment" },
];

export function WelcomeScreen({
  onStart,
  ageMode,
  onSetAgeMode,
  onOpenGuide,
}: WelcomeScreenProps) {
  return (
    <div
      data-testid="mi-motivation-garden-welcome"
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #0a1f14 0%, #152520 30%, #1a2a25 70%, #0d1814 100%)",
        fontFamily: "Inter, sans-serif",
        color: "#e8dcc8",
        overflow: "auto",
        borderRadius: 12,
      }}
    >
      <div
        style={{
          maxWidth: 540,
          width: "92%",
          padding: "clamp(20px, 4vw, 36px) clamp(16px, 3vw, 24px)",
          textAlign: "center",
        }}
      >
        {/* Garden emoji */}
        <div style={{ fontSize: 48, marginBottom: 8, lineHeight: 1 }}>
          {"\uD83C\uDF31"}
        </div>

        <h1
          style={{
            fontSize: "clamp(22px, 4.5vw, 30px)",
            fontWeight: 700,
            margin: "0 0 6px",
            letterSpacing: "-0.5px",
            color: "#d4a24c",
          }}
        >
          The Motivation Garden
        </h1>

        <p
          style={{
            fontSize: "clamp(12px, 2.2vw, 14px)",
            color: "rgba(232, 220, 200, 0.6)",
            margin: "0 0 20px",
            fontWeight: 400,
          }}
        >
          {WELCOME_CONTENT.subtitle[ageMode]}
        </p>

        {/* Age mode selector */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 4,
            marginBottom: 20,
            background: "rgba(232, 220, 200, 0.06)",
            borderRadius: 10,
            padding: 4,
            border: "1px solid rgba(212, 162, 76, 0.15)",
          }}
        >
          {AGE_MODES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onSetAgeMode(value)}
              data-testid={`age-mode-${value}`}
              style={{
                flex: 1,
                padding: "8px 12px",
                fontSize: "clamp(11px, 2vw, 13px)",
                fontWeight: 600,
                fontFamily: "Inter, sans-serif",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                transition: "all 0.2s",
                background:
                  ageMode === value
                    ? "linear-gradient(135deg, #d4a24c, #b8892e)"
                    : "transparent",
                color:
                  ageMode === value
                    ? "#0a1f14"
                    : "rgba(232, 220, 200, 0.6)",
                boxShadow:
                  ageMode === value
                    ? "0 2px 8px rgba(212, 162, 76, 0.3)"
                    : "none",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Instruction card */}
        <div
          style={{
            background: "rgba(232, 220, 200, 0.06)",
            borderRadius: 12,
            padding: "18px 16px",
            marginBottom: 20,
            border: "1px solid rgba(212, 162, 76, 0.15)",
            textAlign: "left",
          }}
        >
          <p
            style={{
              fontSize: "clamp(12px, 2.2vw, 14px)",
              lineHeight: 1.75,
              margin: 0,
              color: "rgba(232, 220, 200, 0.85)",
            }}
          >
            {WELCOME_CONTENT.instruction[ageMode]}
          </p>

          <p
            style={{
              fontSize: "clamp(11px, 2vw, 13px)",
              lineHeight: 1.75,
              margin: "12px 0 0",
              color: "rgba(232, 220, 200, 0.6)",
            }}
          >
            <strong style={{ color: "rgba(232, 220, 200, 0.85)" }}>
              How it works:
            </strong>{" "}
            {WELCOME_CONTENT.howItWorks[ageMode]}
          </p>
        </div>

        {/* 2x3 preview grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 6,
            marginBottom: 20,
          }}
        >
          {PREVIEW_CARDS.map((card, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(232, 220, 200, 0.04)",
                borderRadius: 8,
                padding: "8px 10px",
                border: "1px solid rgba(212, 162, 76, 0.1)",
              }}
            >
              <span style={{ fontSize: 16 }}>{card.emoji}</span>
              <div style={{ textAlign: "left" }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "rgba(232, 220, 200, 0.85)",
                  }}
                >
                  {card.label}
                </div>
                <div
                  style={{
                    fontSize: 9,
                    color: "rgba(232, 220, 200, 0.45)",
                    marginTop: 1,
                  }}
                >
                  {card.sub}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Review MI Concepts button */}
        <button
          onClick={onOpenGuide}
          data-testid="button-open-mi-guide"
          style={{
            background: "transparent",
            color: "#2d7a3a",
            border: "1px solid rgba(45, 122, 58, 0.4)",
            borderRadius: 10,
            padding: "10px 24px",
            fontSize: "clamp(12px, 2.4vw, 14px)",
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "Inter, sans-serif",
            width: "100%",
            maxWidth: 260,
            marginBottom: 12,
            transition: "all 0.15s",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "rgba(45, 122, 58, 0.1)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          Review MI Concepts
        </button>

        <br />

        {/* Begin Garden button */}
        <button
          onClick={onStart}
          data-testid="button-begin-garden"
          style={{
            background: "linear-gradient(135deg, #2d7a3a, #1f5a28)",
            color: "#e8dcc8",
            border: "none",
            borderRadius: 10,
            padding: "14px 40px",
            fontSize: "clamp(14px, 2.8vw, 16px)",
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "Inter, sans-serif",
            boxShadow: "0 4px 16px rgba(45, 122, 58, 0.3)",
            width: "100%",
            maxWidth: 260,
            transition: "transform 0.15s",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.transform = "translateY(-2px)")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.transform = "translateY(0)")
          }
        >
          Start Planting
        </button>
      </div>
    </div>
  );
}
