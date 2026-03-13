import { BRIDGE_STEPS } from "./bridge-data";

interface BridgeVisualProps {
  currentStep: number;
  completedSteps: Set<string>;
  onStepClick: (index: number) => void;
}

export function BridgeVisual({ currentStep, completedSteps, onStepClick }: BridgeVisualProps) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px 16px", overflow: "hidden" }}>
      <div style={{ position: "relative", width: "100%", maxWidth: 700, height: "100%", maxHeight: 400 }}>
        <svg viewBox="0 0 800 300" style={{ width: "100%", height: "100%", overflow: "visible" }} preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="bridgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(122, 107, 93, 0.6)" />
              <stop offset="50%" stopColor="rgba(140, 120, 100, 0.5)" />
              <stop offset="100%" stopColor="rgba(212, 168, 83, 0.6)" />
            </linearGradient>
            <linearGradient id="waterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(74, 127, 181, 0.15)" />
              <stop offset="100%" stopColor="rgba(74, 127, 181, 0.05)" />
            </linearGradient>
          </defs>

          <rect x="0" y="220" width="800" height="80" fill="url(#waterGrad)" rx="8" />

          <path d="M 30 200 Q 400 120 770 200" stroke="url(#bridgeGrad)" strokeWidth="8" fill="none" strokeLinecap="round" />

          <path d="M 30 200 Q 400 130 770 200" stroke="rgba(212, 208, 232, 0.08)" strokeWidth="24" fill="none" strokeLinecap="round" />

          {BRIDGE_STEPS.map((step, i) => {
            const t = i / (BRIDGE_STEPS.length - 1);
            const x = 30 + t * 740;
            const y = 200 - Math.sin(t * Math.PI) * 72 - (t * 8);
            const isCompleted = completedSteps.has(step.id);
            const isCurrent = currentStep === i;
            const isAccessible = i <= currentStep;

            return (
              <g key={step.id}>
                {isCurrent && (
                  <circle cx={x} cy={y} r="24" fill="none" stroke="rgba(212, 208, 232, 0.2)" strokeWidth="1.5">
                    <animate attributeName="r" values="20;28;20" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}
                <circle
                  cx={x}
                  cy={y}
                  r="16"
                  fill={isCompleted ? step.color : isCurrent ? `${step.color}cc` : "rgba(212, 208, 232, 0.08)"}
                  stroke={isAccessible ? step.color : "rgba(212, 208, 232, 0.12)"}
                  strokeWidth={isCurrent ? "3" : "1.5"}
                  style={{ cursor: isAccessible ? "pointer" : "default", transition: "all 0.3s ease" }}
                  onClick={() => isAccessible && onStepClick(i)}
                  data-testid={`button-bridge-step-${step.id}`}
                />
                <text
                  x={x}
                  y={y + 1}
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={{ fontSize: 14, cursor: isAccessible ? "pointer" : "default", pointerEvents: "none" }}
                >
                  {isCompleted ? "\u2713" : step.emoji}
                </text>
                <text
                  x={x}
                  y={y + 32}
                  textAnchor="middle"
                  fill={isAccessible ? "rgba(212, 208, 232, 0.7)" : "rgba(212, 208, 232, 0.25)"}
                  style={{ fontSize: 9, fontWeight: 600, fontFamily: "Inter, sans-serif" }}
                >
                  {step.name.length > 16 ? step.name.slice(0, 14) + "..." : step.name}
                </text>
              </g>
            );
          })}

          <text x="30" y="260" fill="rgba(212, 208, 232, 0.3)" style={{ fontSize: 10, fontFamily: "Inter, sans-serif" }}>Today</text>
          <text x="730" y="260" fill="rgba(212, 168, 83, 0.5)" style={{ fontSize: 10, fontFamily: "Inter, sans-serif" }}>Your Miracle</text>
        </svg>
      </div>
    </div>
  );
}
