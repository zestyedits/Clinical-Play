import type { AgeMode } from "./constellation-data";

interface EarlyBondsStepProps {
  caregivers: string;
  upsetResponse: string;
  homeAtmosphere: string;
  onSetCaregivers: (t: string) => void;
  onSetUpsetResponse: (t: string) => void;
  onSetHomeAtmosphere: (t: string) => void;
  ageMode: AgeMode;
}

const textareaStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 72,
  background: "rgba(232, 220, 200, 0.04)",
  border: "1px solid rgba(196, 168, 76, 0.18)",
  borderRadius: 10,
  padding: "10px 14px",
  color: "#e8dcc8",
  fontSize: 13,
  fontFamily: "Inter, sans-serif",
  lineHeight: 1.6,
  resize: "vertical",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.2s",
};

function getPrompts(ageMode: AgeMode) {
  if (ageMode === "child") {
    return {
      caregivers: "Who are the grown-ups who take care of you? (like parents, grandparents, or other special people)",
      upsetResponse: "When you feel sad or scared, what usually happens? Does anyone help you feel better?",
      homeAtmosphere: "One word that describes how your home usually feels:",
    };
  }
  if (ageMode === "teen") {
    return {
      caregivers: "Who were (or are) the main people who cared for you growing up?",
      upsetResponse: "When you were upset or stressed, what usually happened? Did anyone show up for you?",
      homeAtmosphere: "One word that describes the emotional atmosphere of your home growing up:",
    };
  }
  return {
    caregivers: "Who were the main people who cared for you growing up?",
    upsetResponse: "When you were upset as a child, what usually happened?",
    homeAtmosphere: "One word that describes your childhood home's emotional atmosphere:",
  };
}

export function EarlyBondsStep({
  caregivers,
  upsetResponse,
  homeAtmosphere,
  onSetCaregivers,
  onSetUpsetResponse,
  onSetHomeAtmosphere,
  ageMode,
}: EarlyBondsStepProps) {
  const prompts = getPrompts(ageMode);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        style={{
          background: "rgba(196, 168, 76, 0.06)",
          border: "1px solid rgba(196, 168, 76, 0.15)",
          borderRadius: 12,
          padding: "12px 16px",
        }}
      >
        <p style={{ margin: 0, fontSize: 13, color: "rgba(232, 220, 200, 0.7)", lineHeight: 1.6, fontStyle: "italic" }}>
          There are no right answers here — just your experience. Take your time.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(232, 220, 200, 0.85)", display: "flex", alignItems: "center", gap: 6 }}>
          <span>👥</span> {prompts.caregivers}
        </label>
        <textarea
          value={caregivers}
          onChange={(e) => onSetCaregivers(e.target.value)}
          placeholder="Share as much or as little as you like..."
          style={textareaStyle}
          onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(196, 168, 76, 0.45)"; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(196, 168, 76, 0.18)"; }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(232, 220, 200, 0.85)", display: "flex", alignItems: "center", gap: 6 }}>
          <span>💧</span> {prompts.upsetResponse}
        </label>
        <textarea
          value={upsetResponse}
          onChange={(e) => onSetUpsetResponse(e.target.value)}
          placeholder="What did the people around you do? What did you do?"
          style={textareaStyle}
          onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(196, 168, 76, 0.45)"; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(196, 168, 76, 0.18)"; }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(232, 220, 200, 0.85)", display: "flex", alignItems: "center", gap: 6 }}>
          <span>🏠</span> {prompts.homeAtmosphere}
        </label>
        <textarea
          value={homeAtmosphere}
          onChange={(e) => onSetHomeAtmosphere(e.target.value)}
          placeholder="e.g., warm, tense, quiet, unpredictable, loving..."
          style={{ ...textareaStyle, minHeight: 52 }}
          onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(196, 168, 76, 0.45)"; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(196, 168, 76, 0.18)"; }}
        />
      </div>

      <p style={{ margin: 0, fontSize: 11, color: "rgba(232, 220, 200, 0.3)", textAlign: "center" }}>
        Fill in your caregivers and home atmosphere to continue
      </p>
    </div>
  );
}