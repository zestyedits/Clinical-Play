import type { AgeMode, ScenarioAnswer } from "./constellation-data";
import { SCENARIOS } from "./constellation-data";

interface RelationshipPatternsStepProps {
  answers: ScenarioAnswer[];
  onSetAnswer: (scenarioId: string, answerIndex: number) => void;
  ageMode: AgeMode;
}

export function RelationshipPatternsStep({ answers, onSetAnswer, ageMode }: RelationshipPatternsStepProps) {
  const completedCount = answers.length;

  const intro = ageMode === "child"
    ? "For each situation below, pick the answer that sounds most like what you do:"
    : "For each scenario, choose the response that feels most true for you — even if it's not how you'd like to respond:";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <p style={{ margin: 0, fontSize: 13, color: "rgba(232, 220, 200, 0.65)", lineHeight: 1.5 }}>{intro}</p>
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: completedCount === 4 ? "rgba(196, 168, 76, 0.9)" : "rgba(232, 220, 200, 0.4)",
            whiteSpace: "nowrap",
            marginLeft: 12,
            flexShrink: 0,
          }}
        >
          {completedCount} of 4
        </span>
      </div>

      {SCENARIOS.map((scenario) => {
        const answer = answers.find((a) => a.scenarioId === scenario.id);
        const selectedIndex = answer?.answerIndex ?? -1;

        return (
          <div
            key={scenario.id}
            style={{
              background: "rgba(6, 8, 15, 0.5)",
              border: selectedIndex >= 0 ? "1px solid rgba(196, 168, 76, 0.25)" : "1px solid rgba(232, 220, 200, 0.07)",
              borderRadius: 12,
              padding: "14px 16px",
              transition: "border-color 0.2s",
            }}
          >
            <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 600, color: "#e8dcc8", lineHeight: 1.5 }}>
              {scenario.prompt}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {scenario.options.map((option, idx) => {
                const isSelected = selectedIndex === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => onSetAnswer(scenario.id, idx)}
                    style={{
                      padding: "9px 13px",
                      background: isSelected ? "rgba(196, 168, 76, 0.15)" : "rgba(232, 220, 200, 0.03)",
                      border: isSelected ? "1px solid rgba(196, 168, 76, 0.45)" : "1px solid rgba(232, 220, 200, 0.07)",
                      borderRadius: 8,
                      color: isSelected ? "#e8dcc8" : "rgba(232, 220, 200, 0.6)",
                      fontSize: 12,
                      fontWeight: isSelected ? 600 : 400,
                      cursor: "pointer",
                      textAlign: "left",
                      fontFamily: "Inter, sans-serif",
                      transition: "all 0.2s",
                      lineHeight: 1.4,
                    }}
                  >
                    {isSelected ? "✦ " : "○ "}{option}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {completedCount < 4 && (
        <p style={{ margin: 0, fontSize: 11, color: "rgba(232, 220, 200, 0.3)", textAlign: "center" }}>
          Answer all 4 scenarios to continue
        </p>
      )}
    </div>
  );
}