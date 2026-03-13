import { BRIDGE_STEPS, SCALING_QUESTIONS } from "./bridge-data";

interface JourneySummaryProps {
  responses: Record<string, string>;
  scalingValues: Record<string, number>;
  onRestart: () => void;
}

export function JourneySummary({ responses, scalingValues, onRestart }: JourneySummaryProps) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(10, 10, 18, 0.7)",
        backdropFilter: "blur(8px)",
        zIndex: 40,
        padding: 20,
        animation: "fadeIn 0.3s ease",
      }}
    >
      <div
        style={{
          background: "#1c1e2a",
          borderRadius: 16,
          maxWidth: 520,
          width: "100%",
          maxHeight: "85vh",
          border: "1px solid rgba(224, 221, 213, 0.08)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
          fontFamily: "Inter, sans-serif",
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
        }}
        data-testid="miracle-bridge-summary"
      >
        <div style={{ padding: "24px 24px 16px", textAlign: "center", borderBottom: "1px solid rgba(224, 221, 213, 0.06)" }}>
          <svg width="60" height="36" viewBox="0 0 60 36" style={{ marginBottom: 12, opacity: 0.8 }}>
            <path d="M 3 30 Q 30 4 57 30" stroke="#c4a25a" strokeWidth="2" fill="none" strokeLinecap="round" />
            {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
              const x = 3 + t * 54;
              const y = 30 - Math.sin(t * Math.PI) * 22 - t * 3;
              return <circle key={i} cx={x} cy={y} r="2.5" fill="#c4a25a" opacity={0.6 + i * 0.1} />;
            })}
          </svg>
          <h2 style={{ fontSize: 22, fontWeight: 600, color: "#e0ddd5", margin: "0 0 4px", fontFamily: "'Lora', Georgia, serif" }}>Your Bridge Journey</h2>
          <p style={{ fontSize: 12, color: "rgba(224, 221, 213, 0.4)", margin: 0 }}>A snapshot of where you've been and where you're heading</p>
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: "16px 24px" }}>
          {BRIDGE_STEPS.filter(s => s.id !== "scaling").map((step) => {
            const response = responses[step.id];
            if (!response) return null;
            return (
              <div key={step.id} style={{ marginBottom: 16, borderRadius: 10, padding: "12px 14px", borderLeft: `3px solid ${step.color}50`, background: "rgba(224, 221, 213, 0.03)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <span style={{ fontSize: 13 }}>{step.emoji}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: step.color, letterSpacing: 0.3 }}>{step.name}</span>
                </div>
                <p style={{ fontSize: 13, lineHeight: 1.75, color: "rgba(224, 221, 213, 0.75)", margin: 0, fontStyle: "italic", fontFamily: "'Lora', Georgia, serif" }}>
                  &ldquo;{response}&rdquo;
                </p>
              </div>
            );
          })}

          {scalingValues["main"] > 0 && (
            <div style={{ marginBottom: 16, borderRadius: 10, padding: "14px", background: "rgba(90, 138, 170, 0.06)", borderLeft: "3px solid rgba(90, 138, 170, 0.3)" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(90, 138, 170, 0.7)", letterSpacing: 0.3, marginBottom: 10 }}>
                Your Scales
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "rgba(224, 221, 213, 0.5)" }}>Where you are today</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: "#e0ddd5" }}>{scalingValues["main"]}/10</span>
                </div>
                {SCALING_QUESTIONS.map((sq) => {
                  const val = scalingValues[sq.id];
                  if (!val) return null;
                  return (
                    <div key={sq.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 11, color: "rgba(224, 221, 213, 0.4)" }}>{sq.question.replace("How ", "").replace(" do you feel that things can be different?", "").replace("?", "")}</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "rgba(224, 221, 213, 0.7)" }}>{val}/10</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: "16px 24px", borderTop: "1px solid rgba(224, 221, 213, 0.06)", textAlign: "center" }}>
          <p style={{ fontSize: 12, color: "rgba(224, 221, 213, 0.4)", margin: "0 0 12px", fontStyle: "italic", fontFamily: "'Lora', Georgia, serif" }}>
            Every step you named is evidence that change is possible.
          </p>
          <button
            onClick={onRestart}
            data-testid="button-bridge-restart"
            style={{
              padding: "10px 24px",
              borderRadius: 8,
              border: "1px solid rgba(224, 221, 213, 0.08)",
              background: "transparent",
              color: "rgba(224, 221, 213, 0.5)",
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
            }}
          >
            Start a New Journey
          </button>
        </div>
      </div>
    </div>
  );
}
