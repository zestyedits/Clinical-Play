import type { AgeMode } from "./CBTThoughtCourt";

interface WelcomeScreenProps {
  onStart: () => void;
  ageMode: AgeMode;
  onSetAgeMode: (mode: AgeMode) => void;
  onOpenGuide: () => void;
}

const SUBTITLES: Record<AgeMode, string> = {
  child: "Put your tricky thoughts on trial!",
  teen: "Challenge your negative thoughts in court",
  adult: "A structured approach to cognitive restructuring",
};

const INSTRUCTIONS: Record<AgeMode, string> = {
  child:
    "Sometimes our brains play tricks on us! In this game, you'll be the judge. You'll put a tricky thought on trial, look at the evidence, and decide if it's really true.",
  teen:
    "Ever notice your brain jumping to the worst conclusion? Here you'll put those thoughts on trial -- examine the evidence, find the distortions, and reframe.",
  adult:
    "Cognitive restructuring is a core CBT technique. This tool guides you through identifying automatic thoughts, recognizing cognitive distortions, evaluating evidence, and developing balanced alternatives.",
};

const HOW_IT_WORKS: Record<AgeMode, string> = {
  child:
    "Pick a tricky thought, look for clues, decide what's really true, and come up with a better thought!",
  teen:
    "Enter a negative thought, gather evidence for and against it, spot thinking traps, and rewrite it.",
  adult:
    "Document an automatic thought, systematically evaluate supporting and contradicting evidence, identify cognitive distortions, and formulate a balanced alternative.",
};

const PREVIEW_CARDS = [
  { emoji: "\uD83D\uDCC1", label: "File the Case", sub: "Enter thought" },
  { emoji: "\uD83D\uDD0D", label: "Examine Evidence", sub: "For & against" },
  { emoji: "\u2696\uFE0F", label: "Reach a Verdict", sub: "Weigh evidence" },
  { emoji: "\uD83D\uDCDD", label: "Write the Appeal", sub: "Reframe" },
];

const AGE_MODES: { value: AgeMode; label: string }[] = [
  { value: "child", label: "Child" },
  { value: "teen", label: "Teen" },
  { value: "adult", label: "Adult" },
];

export function WelcomeScreen({
  onStart,
  ageMode,
  onSetAgeMode,
  onOpenGuide,
}: WelcomeScreenProps) {
  return (
    <div
      data-testid="cbt-thought-court-welcome"
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #1a1520 0%, #2a2035 30%, #1e1a2e 70%, #15112a 100%)",
        fontFamily: "Inter, sans-serif",
        color: "#f0e8d8",
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
        {/* Scales of justice emoji */}
        <div style={{ fontSize: 48, marginBottom: 8, lineHeight: 1 }}>{"\u2696\uFE0F"}</div>

        <h1
          style={{
            fontSize: "clamp(22px, 4.5vw, 30px)",
            fontWeight: 700,
            margin: "0 0 6px",
            letterSpacing: "-0.5px",
            color: "#f0e8d8",
          }}
        >
          The Thought Court
        </h1>

        <p
          style={{
            fontSize: "clamp(12px, 2.2vw, 14px)",
            color: "rgba(240, 232, 216, 0.6)",
            margin: "0 0 20px",
            fontWeight: 400,
          }}
        >
          {SUBTITLES[ageMode]}
        </p>

        {/* Age mode selector */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 4,
            marginBottom: 20,
            background: "rgba(240, 232, 216, 0.06)",
            borderRadius: 10,
            padding: 4,
            border: "1px solid rgba(212, 168, 83, 0.15)",
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
                    ? "linear-gradient(135deg, #d4a853, #b8912e)"
                    : "transparent",
                color:
                  ageMode === value
                    ? "#1a1520"
                    : "rgba(240, 232, 216, 0.6)",
                boxShadow:
                  ageMode === value
                    ? "0 2px 8px rgba(212, 168, 83, 0.3)"
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
            background: "rgba(240, 232, 216, 0.06)",
            borderRadius: 12,
            padding: "18px 16px",
            marginBottom: 20,
            border: "1px solid rgba(212, 168, 83, 0.15)",
            textAlign: "left",
          }}
        >
          <p
            style={{
              fontSize: "clamp(12px, 2.2vw, 14px)",
              lineHeight: 1.75,
              margin: 0,
              color: "rgba(240, 232, 216, 0.85)",
            }}
          >
            {INSTRUCTIONS[ageMode]}
          </p>

          <p
            style={{
              fontSize: "clamp(11px, 2vw, 13px)",
              lineHeight: 1.75,
              margin: "12px 0 0",
              color: "rgba(240, 232, 216, 0.6)",
            }}
          >
            <strong style={{ color: "rgba(240, 232, 216, 0.85)" }}>
              How it works:
            </strong>{" "}
            {HOW_IT_WORKS[ageMode]}
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
                background: "rgba(240, 232, 216, 0.04)",
                borderRadius: 8,
                padding: "8px 10px",
                border: "1px solid rgba(212, 168, 83, 0.1)",
              }}
            >
              <span style={{ fontSize: 16 }}>{card.emoji}</span>
              <div style={{ textAlign: "left" }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "rgba(240, 232, 216, 0.85)",
                  }}
                >
                  {card.label}
                </div>
                <div
                  style={{
                    fontSize: 9,
                    color: "rgba(240, 232, 216, 0.45)",
                    marginTop: 1,
                  }}
                >
                  {card.sub}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Review Cognitive Distortions button */}
        <button
          onClick={onOpenGuide}
          data-testid="button-open-distortions-guide"
          style={{
            background: "transparent",
            color: "#d4a853",
            border: "1px solid rgba(212, 168, 83, 0.4)",
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
            e.currentTarget.style.background = "rgba(212, 168, 83, 0.1)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          Review Cognitive Distortions
        </button>

        <br />

        {/* Begin Trial button */}
        <button
          onClick={onStart}
          data-testid="button-begin-trial"
          style={{
            background: "linear-gradient(135deg, #d4a853, #b8912e)",
            color: "#1a1520",
            border: "none",
            borderRadius: 10,
            padding: "14px 40px",
            fontSize: "clamp(14px, 2.8vw, 16px)",
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "Inter, sans-serif",
            boxShadow: "0 4px 16px rgba(212, 168, 83, 0.3)",
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
          Begin Trial
        </button>
      </div>
    </div>
  );
}
