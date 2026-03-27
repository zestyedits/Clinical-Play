import type { AgeMode, AttachmentStyle, AnchorItem, ScenarioAnswer } from "./constellation-data";
import { ATTACHMENT_STYLES, SECURITY_PRACTICES, SCENARIOS } from "./constellation-data";

interface ConstellationSummaryProps {
  ageMode: AgeMode;
  caregivers: string;
  upsetResponse: string;
  homeAtmosphere: string;
  selectedStyle: AttachmentStyle | null;
  answers: ScenarioAnswer[];
  anchors: AnchorItem[];
  constellationReflection: string;
  patternToChange: string;
  practiceToTry: string;
  onReset: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  people: "#80a8d4",
  places: "#80c480",
  practices: "#c4a84c",
};

const CATEGORY_LABELS: Record<string, string> = {
  people: "👤 People",
  places: "📍 Places",
  practices: "🧘 Practices",
};

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "rgba(6, 8, 15, 0.6)",
        border: "1px solid rgba(196, 168, 76, 0.12)",
        borderRadius: 14,
        padding: "16px 18px",
        marginBottom: 12,
      }}
    >
      <h3 style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 700, color: "#c4a84c", fontFamily: "'Lora', Georgia, serif" }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

export function ConstellationSummary({
  ageMode,
  caregivers,
  upsetResponse,
  homeAtmosphere,
  selectedStyle,
  answers,
  anchors,
  constellationReflection,
  patternToChange,
  practiceToTry,
  onReset,
}: ConstellationSummaryProps) {
  const styleData = ATTACHMENT_STYLES.find((s) => s.id === selectedStyle);
  const practices = selectedStyle ? SECURITY_PRACTICES[selectedStyle] : [];

  const peopleAnchors = anchors.filter((a) => a.category === "people");
  const placeAnchors = anchors.filter((a) => a.category === "places");
  const practiceAnchors = anchors.filter((a) => a.category === "practices");

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(170deg, #06080f 0%, #0a0d1a 30%, #0c1020 60%, #040610 100%)",
        fontFamily: "Inter, sans-serif",
        color: "#e8dcc8",
        overflow: "hidden",
        borderRadius: 12,
      }}
    >
      <style>{`
        @keyframes ac-twinkle { 0%,100% { opacity: 0.3; } 50% { opacity: 1; } }
      `}</style>

      <div
        style={{
          textAlign: "center",
          padding: "20px clamp(16px,4vw,28px) 16px",
          flexShrink: 0,
          borderBottom: "1px solid rgba(196,168,76,0.12)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 8 }}>
          {["⭐", "✨", "🌟", "✨", "⭐"].map((star, i) => (
            <span
              key={i}
              style={{ fontSize: 18, animation: `ac-twinkle ${2 + i * 0.4}s ease-in-out infinite ${i * 0.3}s` }}
            >
              {star}
            </span>
          ))}
        </div>
        <h1
          style={{
            margin: "0 0 4px",
            fontSize: "clamp(20px,4vw,26px)",
            fontWeight: 700,
            fontFamily: "'Lora', Georgia, serif",
            background: "linear-gradient(135deg, #d4c080, #f0e4a8)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Your Attachment Constellation
        </h1>
        <p style={{ margin: 0, fontSize: 13, color: "rgba(232,220,200,0.5)" }}>
          A reflection of your relational world
        </p>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "16px clamp(16px,4vw,28px)" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>

          <SectionCard title="🌱 Your Early Experiences">
            {caregivers && (
              <div style={{ marginBottom: 8 }}>
                <p style={{ margin: "0 0 2px", fontSize: 11, color: "rgba(232,220,200,0.4)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Main Caregivers</p>
                <p style={{ margin: 0, fontSize: 13, color: "rgba(232,220,200,0.8)", lineHeight: 1.6 }}>{caregivers}</p>
              </div>
            )}
            {upsetResponse && (
              <div style={{ marginBottom: 8 }}>
                <p style={{ margin: "0 0 2px", fontSize: 11, color: "rgba(232,220,200,0.4)", textTransform: "uppercase", letterSpacing: "0.05em" }}>When Upset</p>
                <p style={{ margin: 0, fontSize: 13, color: "rgba(232,220,200,0.8)", lineHeight: 1.6 }}>{upsetResponse}</p>
              </div>
            )}
            {homeAtmosphere && (
              <div>
                <p style={{ margin: "0 0 2px", fontSize: 11, color: "rgba(232,220,200,0.4)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Home Atmosphere</p>
                <p style={{ margin: 0, fontSize: 13, color: "rgba(232,220,200,0.8)", lineHeight: 1.6 }}>{homeAtmosphere}</p>
              </div>
            )}
          </SectionCard>

          {styleData && (
            <SectionCard title="⭐ Your Attachment Pattern">
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <span style={{ fontSize: 28, flexShrink: 0 }}>{styleData.emoji}</span>
                <div>
                  <p style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 700, color: styleData.color }}>{styleData.label}</p>
                  <p style={{ margin: "0 0 8px", fontSize: 13, color: "rgba(232,220,200,0.65)", lineHeight: 1.5, fontStyle: "italic" }}>{styleData.description}</p>
                  <p style={{ margin: 0, fontSize: 13, color: "rgba(232,220,200,0.8)", lineHeight: 1.65 }}>{styleData.validation}</p>
                </div>
              </div>
            </SectionCard>
          )}

          {answers.length > 0 && (
            <SectionCard title="🔗 Patterns Observed">
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {answers.map((answer) => {
                  const scenario = SCENARIOS.find((s) => s.id === answer.scenarioId);
                  if (!scenario) return null;
                  return (
                    <div key={answer.scenarioId} style={{ padding: "8px 0", borderBottom: "1px solid rgba(232,220,200,0.06)" }}>
                      <p style={{ margin: "0 0 3px", fontSize: 11, color: "rgba(232,220,200,0.4)", lineHeight: 1.4 }}>{scenario.prompt}</p>
                      <p style={{ margin: 0, fontSize: 13, color: "rgba(196,168,76,0.85)", fontWeight: 500 }}>
                        {scenario.options[answer.answerIndex]}
                      </p>
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          )}

          {anchors.length > 0 && (
            <SectionCard title="🏠 Your Secure Base Anchors">
              {[
                { anchors: peopleAnchors, key: "people" },
                { anchors: placeAnchors, key: "places" },
                { anchors: practiceAnchors, key: "practices" },
              ]
                .filter((g) => g.anchors.length > 0)
                .map((group) => (
                  <div key={group.key} style={{ marginBottom: 10 }}>
                    <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 600, color: CATEGORY_COLORS[group.key], textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {CATEGORY_LABELS[group.key]}
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {group.anchors.map((anchor) => (
                        <span
                          key={anchor.id}
                          style={{
                            padding: "4px 10px",
                            background: `rgba(${CATEGORY_COLORS[group.key].replace('#','').match(/.{2}/g)?.map(x=>parseInt(x,16)).join(',') || '196,168,76'}, 0.1)`,
                            border: `1px solid rgba(${CATEGORY_COLORS[group.key].replace('#','').match(/.{2}/g)?.map(x=>parseInt(x,16)).join(',') || '196,168,76'}, 0.25)`,
                            borderRadius: 16,
                            fontSize: 12,
                            color: "#e8dcc8",
                          }}
                        >
                          {anchor.text}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              {constellationReflection && (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(232,220,200,0.07)" }}>
                  <p style={{ margin: "0 0 4px", fontSize: 11, color: "rgba(232,220,200,0.4)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Reflection</p>
                  <p style={{ margin: 0, fontSize: 13, color: "rgba(232,220,200,0.8)", lineHeight: 1.6, fontStyle: "italic" }}>{constellationReflection}</p>
                </div>
              )}
            </SectionCard>
          )}

          <SectionCard title="🌟 Growth Intentions">
            {patternToChange && (
              <div style={{ marginBottom: 10 }}>
                <p style={{ margin: "0 0 2px", fontSize: 11, color: "rgba(232,220,200,0.4)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Pattern to Change</p>
                <p style={{ margin: 0, fontSize: 13, color: "rgba(232,220,200,0.8)", lineHeight: 1.6 }}>{patternToChange}</p>
              </div>
            )}
            {practiceToTry && (
              <div style={{ marginBottom: practices.length > 0 ? 12 : 0 }}>
                <p style={{ margin: "0 0 2px", fontSize: 11, color: "rgba(232,220,200,0.4)", textTransform: "uppercase", letterSpacing: "0.05em" }}>This Week's Practice</p>
                <p style={{ margin: 0, fontSize: 13, color: "#c4a84c", lineHeight: 1.6, fontWeight: 600 }}>{practiceToTry}</p>
              </div>
            )}
            {practices.length > 0 && (
              <div>
                <p style={{ margin: "0 0 6px", fontSize: 11, color: "rgba(232,220,200,0.4)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Recommended Practices</p>
                {practices.map((p, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, padding: "6px 0", borderBottom: i < practices.length - 1 ? "1px solid rgba(232,220,200,0.06)" : "none" }}>
                    <span style={{ flexShrink: 0, fontSize: 13 }}>⭐</span>
                    <p style={{ margin: 0, fontSize: 12, color: "rgba(232,220,200,0.7)", lineHeight: 1.5 }}>{p}</p>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <div style={{ textAlign: "center", paddingBottom: 24 }}>
            <button
              onClick={onReset}
              style={{
                background: "linear-gradient(135deg, #3a3210, #5a4c18)",
                color: "#e8dcc8",
                border: "none",
                borderRadius: 12,
                padding: "12px 32px",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
                boxShadow: "0 4px 20px rgba(196,168,76,0.25)",
              }}
            >
              ✨ Begin New Journey
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}