import type { AgeMode, AttachmentStyle } from "./constellation-data";
import { SECURITY_PRACTICES, ATTACHMENT_STYLES } from "./constellation-data";

interface GrowingSecurityStepProps {
  attachmentStyle: AttachmentStyle | null;
  patternToChange: string;
  practiceToTry: string;
  onSetPatternToChange: (t: string) => void;
  onSetPracticeToTry: (t: string) => void;
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

export function GrowingSecurityStep({
  attachmentStyle,
  patternToChange,
  practiceToTry,
  onSetPatternToChange,
  onSetPracticeToTry,
  ageMode,
}: GrowingSecurityStepProps) {
  const practices = attachmentStyle ? SECURITY_PRACTICES[attachmentStyle] : SECURITY_PRACTICES.unsure;
  const styleData = ATTACHMENT_STYLES.find((s) => s.id === attachmentStyle);

  const header = ageMode === "child"
    ? "Everyone can learn to feel safer in relationships. Here are some ideas for you:"
    : ageMode === "teen"
    ? "Security isn't something you're born with — it's something you can build. Here's where to start:"
    : "Earned secure attachment is possible for everyone, regardless of early experiences.";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        style={{
          background: "rgba(196, 168, 76, 0.07)",
          border: "1px solid rgba(196, 168, 76, 0.2)",
          borderRadius: 12,
          padding: "12px 16px",
          textAlign: "center",
        }}
      >
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#c4a84c", lineHeight: 1.5 }}>
          ✨ {header}
        </p>
      </div>

      {styleData && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "rgba(6,8,15,0.4)", borderRadius: 10 }}>
          <span style={{ fontSize: 20 }}>{styleData.emoji}</span>
          <span style={{ fontSize: 12, color: styleData.color, fontWeight: 600 }}>
            Growth practices for {styleData.label} attachment:
          </span>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {practices.map((practice, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              padding: "12px 16px",
              background: "rgba(6, 8, 15, 0.5)",
              border: "1px solid rgba(196, 168, 76, 0.12)",
              borderRadius: 12,
              boxShadow: "0 0 16px rgba(196, 168, 76, 0.04)",
            }}
          >
            <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>⭐</span>
            <p style={{ margin: 0, fontSize: 13, color: "rgba(232, 220, 200, 0.8)", lineHeight: 1.6 }}>
              {practice}
            </p>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(232, 220, 200, 0.85)", display: "flex", alignItems: "center", gap: 6 }}>
          <span>🔄</span>{" "}
          {ageMode === "child"
            ? "One thing I want to do differently in friendships:"
            : "A relationship pattern I want to change:"}
        </label>
        <textarea
          value={patternToChange}
          onChange={(e) => onSetPatternToChange(e.target.value)}
          placeholder="Be as specific as you can..."
          style={textareaStyle}
          onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(196, 168, 76, 0.45)"; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(196, 168, 76, 0.18)"; }}
        />
        <p style={{ margin: 0, fontSize: 11, color: patternToChange.length >= 20 ? "rgba(196,168,76,0.6)" : "rgba(232,220,200,0.3)", textAlign: "right" }}>
          {patternToChange.length}/20 min
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(232, 220, 200, 0.85)", display: "flex", alignItems: "center", gap: 6 }}>
          <span>🌟</span>{" "}
          {ageMode === "child"
            ? "One kind thing I'll practice with someone I care about this week:"
            : "A secure behavior I'll practice this week:"}
        </label>
        <textarea
          value={practiceToTry}
          onChange={(e) => onSetPracticeToTry(e.target.value)}
          placeholder="Make it small and specific — something you can actually do..."
          style={{ ...textareaStyle, minHeight: 60 }}
          onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(196, 168, 76, 0.45)"; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(196, 168, 76, 0.18)"; }}
        />
        <p style={{ margin: 0, fontSize: 11, color: practiceToTry.length >= 15 ? "rgba(196,168,76,0.6)" : "rgba(232,220,200,0.3)", textAlign: "right" }}>
          {practiceToTry.length}/15 min
        </p>
      </div>
    </div>
  );
}