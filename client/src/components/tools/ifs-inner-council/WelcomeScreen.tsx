import type { AgeMode } from "./council-data";
import { WELCOME_CONTENT } from "./council-data";

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
  { icon: "\u25C7", label: "Discover Parts", sub: "Identify" },
  { icon: "\u2B21", label: "Seat the Council", sub: "Visualize" },
  { icon: "\u2726", label: "Council Meeting", sub: "Dialogue" },
  { icon: "\u25A3", label: "Council Record", sub: "Summary" },
];

const AMBER = "#b8860b";
const CANDLELIGHT = "#f4e4bc";

export function WelcomeScreen({
  onStart,
  ageMode,
  onSetAgeMode,
  onOpenGuide,
}: WelcomeScreenProps) {
  return (
    <div
      data-testid="ifs-inner-council-welcome"
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #1a1208 0%, #2a1f14 30%, #1f1710 70%, #0d0a06 100%)",
        fontFamily: "Inter, sans-serif",
        color: CANDLELIGHT,
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
        {/* Shield icon */}
        <div style={{ fontSize: 48, marginBottom: 8, lineHeight: 1 }}>
          {"\u2694"}
        </div>

        <h1
          style={{
            fontSize: "clamp(22px, 4.5vw, 30px)",
            fontWeight: 700,
            margin: "0 0 6px",
            letterSpacing: "-0.5px",
            color: AMBER,
          }}
        >
          The Inner Council
        </h1>

        <p
          style={{
            fontSize: "clamp(12px, 2.2vw, 14px)",
            color: "rgba(244, 228, 188, 0.6)",
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
            background: "rgba(244, 228, 188, 0.06)",
            borderRadius: 10,
            padding: 4,
            border: "1px solid rgba(184, 134, 11, 0.15)",
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
                    ? `linear-gradient(135deg, ${AMBER}, #8b6914)`
                    : "transparent",
                color:
                  ageMode === value
                    ? "#1a1208"
                    : "rgba(244, 228, 188, 0.6)",
                boxShadow:
                  ageMode === value
                    ? "0 2px 8px rgba(184, 134, 11, 0.3)"
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
            background: "rgba(244, 228, 188, 0.06)",
            borderRadius: 12,
            padding: "18px 16px",
            marginBottom: 20,
            border: "1px solid rgba(184, 134, 11, 0.15)",
            textAlign: "left",
          }}
        >
          <p
            style={{
              fontSize: "clamp(12px, 2.2vw, 14px)",
              lineHeight: 1.75,
              margin: 0,
              color: "rgba(244, 228, 188, 0.85)",
            }}
          >
            {WELCOME_CONTENT.instruction[ageMode]}
          </p>

          <p
            style={{
              fontSize: "clamp(11px, 2vw, 13px)",
              lineHeight: 1.75,
              margin: "12px 0 0",
              color: "rgba(244, 228, 188, 0.6)",
            }}
          >
            <strong style={{ color: "rgba(244, 228, 188, 0.85)" }}>
              How it works:
            </strong>{" "}
            {WELCOME_CONTENT.howItWorks[ageMode]}
          </p>
        </div>

        {/* 2x2 preview grid */}
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
                background: "rgba(244, 228, 188, 0.04)",
                borderRadius: 8,
                padding: "8px 10px",
                border: "1px solid rgba(184, 134, 11, 0.1)",
              }}
            >
              <span style={{ fontSize: 16 }}>{card.icon}</span>
              <div style={{ textAlign: "left" }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "rgba(244, 228, 188, 0.85)",
                  }}
                >
                  {card.label}
                </div>
                <div
                  style={{
                    fontSize: 9,
                    color: "rgba(244, 228, 188, 0.45)",
                    marginTop: 1,
                  }}
                >
                  {card.sub}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Review IFS Concepts button */}
        <button
          onClick={onOpenGuide}
          data-testid="button-open-ifs-guide"
          style={{
            background: "transparent",
            color: AMBER,
            border: `1px solid rgba(184, 134, 11, 0.4)`,
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
            e.currentTarget.style.background = "rgba(184, 134, 11, 0.1)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          Review IFS Concepts
        </button>

        <br />

        {/* Begin Council button */}
        <button
          onClick={onStart}
          data-testid="button-begin-council"
          style={{
            background: `linear-gradient(135deg, ${AMBER}, #8b6914)`,
            color: CANDLELIGHT,
            border: "none",
            borderRadius: 10,
            padding: "14px 40px",
            fontSize: "clamp(14px, 2.8vw, 16px)",
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "Inter, sans-serif",
            boxShadow: "0 4px 16px rgba(184, 134, 11, 0.3)",
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
          Begin Council
        </button>
      </div>
    </div>
  );
}
