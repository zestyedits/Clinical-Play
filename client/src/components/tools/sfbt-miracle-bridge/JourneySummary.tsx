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
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(8px)",
        zIndex: 40,
        padding: 20,
        animation: "fadeIn 0.3s ease",
      }}
    >
      <div
        style={{
          background: "linear-gradient(180deg, #2a2040 0%, #1a1a2e 100%)",
          borderRadius: 18,
          maxWidth: 520,
          width: "100%",
          maxHeight: "85vh",
          border: "1px solid rgba(120, 100, 180, 0.25)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05) inset",
          fontFamily: "Inter, sans-serif",
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
        }}
        data-testid="miracle-bridge-summary"
      >
        <div style={{ padding: "24px 24px 16px", textAlign: "center", borderBottom: "1px solid rgba(120, 100, 180, 0.12)" }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>{"\u{1F309}"}</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#d4d0e8", margin: "0 0 4px" }}>Your Bridge Journey</h2>
          <p style={{ fontSize: 12, color: "rgba(212, 208, 232, 0.5)", margin: 0 }}>A snapshot of where you've been and where you're heading</p>
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: "16px 24px" }}>
          {BRIDGE_STEPS.filter(s => s.id !== "scaling").map((step) => {
            const response = responses[step.id];
            if (!response) return null;
            return (
              <div key={step.id} style={{ marginBottom: 16, background: "rgba(212, 208, 232, 0.04)", borderRadius: 10, padding: "12px 14px", border: "1px solid rgba(120, 100, 180, 0.1)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <span style={{ fontSize: 14 }}>{step.emoji}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: step.color, textTransform: "uppercase", letterSpacing: 0.5 }}>{step.name}</span>
                </div>
                <p style={{ fontSize: 13, lineHeight: 1.7, color: "rgba(212, 208, 232, 0.8)", margin: 0, fontStyle: "italic" }}>
                  "{response}"
                </p>
              </div>
            );
          })}

          {scalingValues["main"] > 0 && (
            <div style={{ marginBottom: 16, background: "rgba(74, 127, 181, 0.08)", borderRadius: 10, padding: "14px", border: "1px solid rgba(74, 127, 181, 0.15)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(74, 127, 181, 0.8)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>
                {"\u{1F4CA}"} Your Scales
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "rgba(212, 208, 232, 0.6)" }}>Where you are today</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: "#d4d0e8" }}>{scalingValues["main"]}/10</span>
                </div>
                {SCALING_QUESTIONS.map((sq) => {
                  const val = scalingValues[sq.id];
                  if (!val) return null;
                  return (
                    <div key={sq.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 11, color: "rgba(212, 208, 232, 0.5)" }}>{sq.question.replace("How ", "").replace(" do you feel that things can be different?", "").replace("?", "")}</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "rgba(212, 208, 232, 0.8)" }}>{val}/10</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: "16px 24px", borderTop: "1px solid rgba(120, 100, 180, 0.12)", textAlign: "center" }}>
          <p style={{ fontSize: 12, color: "rgba(212, 208, 232, 0.5)", margin: "0 0 12px" }}>
            This journey is yours. Every step you named is evidence that change is possible.
          </p>
          <button
            onClick={onRestart}
            data-testid="button-bridge-restart"
            style={{
              padding: "10px 24px",
              borderRadius: 8,
              border: "1px solid rgba(120, 100, 180, 0.2)",
              background: "rgba(212, 208, 232, 0.06)",
              color: "rgba(212, 208, 232, 0.6)",
              fontSize: 12,
              fontWeight: 600,
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
