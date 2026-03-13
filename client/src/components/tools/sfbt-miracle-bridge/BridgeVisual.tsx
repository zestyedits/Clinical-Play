import { BRIDGE_STEPS } from "./bridge-data";

interface BridgeVisualProps {
  currentStep: number;
  completedSteps: Set<string>;
  onStepClick: (index: number) => void;
}

export function BridgeVisual({ currentStep, completedSteps, onStepClick }: BridgeVisualProps) {
  const getStonePos = (i: number) => {
    const t = i / (BRIDGE_STEPS.length - 1);
    const x = 60 + t * 680;
    const archHeight = 65;
    const y = 190 - Math.sin(t * Math.PI) * archHeight - t * 12;
    return { x, y };
  };

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px 16px", overflow: "hidden" }}>
      <div style={{ position: "relative", width: "100%", maxWidth: 700, height: "100%", maxHeight: 380 }}>
        <svg viewBox="0 0 800 280" style={{ width: "100%", height: "100%", overflow: "visible" }} preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="bridgePath" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(138, 119, 104, 0.5)" />
              <stop offset="100%" stopColor="rgba(196, 162, 90, 0.6)" />
            </linearGradient>
            <linearGradient id="skyGlow" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="rgba(196, 162, 90, 0.03)" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>

          <rect x="0" y="0" width="800" height="280" fill="url(#skyGlow)" />

          <rect x="0" y="218" width="800" height="62" fill="rgba(90, 138, 170, 0.06)" rx="6" />
          <line x1="40" y1="238" x2="760" y2="238" stroke="rgba(90, 138, 170, 0.06)" strokeWidth="0.5" />
          <line x1="60" y1="252" x2="740" y2="252" stroke="rgba(90, 138, 170, 0.04)" strokeWidth="0.5" />

          <path d="M 40 195 Q 400 105 760 195" stroke="url(#bridgePath)" strokeWidth="4" fill="none" strokeLinecap="round" />

          <path d="M 40 195 Q 400 115 760 195" stroke="rgba(196, 162, 90, 0.04)" strokeWidth="28" fill="none" strokeLinecap="round" />

          {BRIDGE_STEPS.map((_, i) => {
            if (i === 0) return null;
            const a = getStonePos(i - 1);
            const b = getStonePos(i);
            const completed = completedSteps.has(BRIDGE_STEPS[i - 1].id);
            return (
              <line
                key={`conn-${i}`}
                x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke={completed ? "rgba(196, 162, 90, 0.2)" : "rgba(224, 221, 213, 0.05)"}
                strokeWidth="1.5"
                strokeDasharray={completed ? "none" : "4 4"}
              />
            );
          })}

          {BRIDGE_STEPS.map((step, i) => {
            const { x, y } = getStonePos(i);
            const isCompleted = completedSteps.has(step.id);
            const isCurrent = currentStep === i;
            const isAccessible = i <= currentStep;
            const isLast = i === BRIDGE_STEPS.length - 1;

            return (
              <g key={step.id} style={{ cursor: isAccessible ? "pointer" : "default" }} onClick={() => isAccessible && onStepClick(i)}>
                {isCurrent && (
                  <circle cx={x} cy={y} r="22" fill="none" stroke={step.color} strokeWidth="1" opacity="0.3">
                    <animate attributeName="r" values="18;24;18" dur="2.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.3;0.08;0.3" dur="2.5s" repeatCount="indefinite" />
                  </circle>
                )}

                {isLast && isAccessible && !isCompleted && (
                  <circle cx={x} cy={y} r="26" fill="none" stroke="rgba(212, 168, 83, 0.1)" strokeWidth="0.8" />
                )}

                <circle
                  cx={x}
                  cy={y}
                  r="15"
                  fill={isCompleted ? step.color : isCurrent ? `${step.color}40` : "rgba(224, 221, 213, 0.04)"}
                  stroke={isAccessible ? step.color : "rgba(224, 221, 213, 0.08)"}
                  strokeWidth={isCurrent ? "2" : "1"}
                  style={{ transition: "all 0.35s ease" }}
                  data-testid={`button-bridge-step-${step.id}`}
                />

                <text
                  x={x}
                  y={y + 1}
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={{ fontSize: 13, pointerEvents: "none" }}
                  fill={isCompleted ? "#1c1e2a" : isAccessible ? "#e0ddd5" : "rgba(224, 221, 213, 0.2)"}
                >
                  {isCompleted ? "\u2713" : step.emoji}
                </text>

                <text
                  x={x}
                  y={y + 30}
                  textAnchor="middle"
                  fill={isAccessible ? "rgba(224, 221, 213, 0.6)" : "rgba(224, 221, 213, 0.15)"}
                  style={{ fontSize: 8.5, fontWeight: 500, fontFamily: "Inter, sans-serif", letterSpacing: "0.2px" }}
                >
                  {step.name.length > 18 ? step.name.slice(0, 16) + "\u2026" : step.name}
                </text>
              </g>
            );
          })}

          <text x="50" y="260" fill="rgba(138, 119, 104, 0.35)" style={{ fontSize: 9, fontFamily: "'Lora', Georgia, serif", fontStyle: "italic" }}>Today</text>
          <text x="700" y="260" fill="rgba(212, 168, 83, 0.45)" style={{ fontSize: 9, fontFamily: "'Lora', Georgia, serif", fontStyle: "italic" }}>Preferred Future</text>
        </svg>
      </div>
    </div>
  );
}
