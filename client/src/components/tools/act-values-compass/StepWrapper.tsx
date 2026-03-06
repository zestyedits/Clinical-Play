import { motion } from "framer-motion";
import type { AgeMode } from "./compass-data";

export interface StepWrapperProps {
  stepNumber: number;
  totalSteps: number;
  title: string;
  subtitle: string;
  icon: string;
  ageMode: AgeMode;
  canProceed: boolean;
  onNext: () => void;
  onBack: () => void;
  children: React.ReactNode;
}

const GOLD = "#c9a84c";
const GOLD_MUTED = "rgba(201, 168, 76, 0.35)";
const GOLD_DIM = "rgba(201, 168, 76, 0.12)";
const PARCHMENT = "#e8dcc8";
const PANEL_BG = "rgba(15, 22, 28, 0.95)";
const TEAL = "#2d8a8a";

export function StepWrapper({
  stepNumber,
  totalSteps,
  title,
  subtitle,
  icon,
  canProceed,
  onNext,
  onBack,
  children,
}: StepWrapperProps) {
  const isFirstStep = stepNumber === 0;
  const isLastStep = stepNumber === totalSteps - 1;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: PANEL_BG,
        borderRadius: 14,
        overflow: "hidden",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Progress bar */}
      <div
        style={{
          padding: "14px clamp(12px, 3vw, 24px) 10px",
          borderBottom: "1px solid rgba(45, 138, 138, 0.2)",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
          {Array.from({ length: totalSteps }, (_, i) => {
            const isCompleted = i < stepNumber;
            const isCurrent = i === stepNumber;
            return (
              <motion.div
                key={i}
                initial={{ scale: 0.8, opacity: 0.5 }}
                animate={{
                  scale: isCurrent ? 1.15 : 1,
                  opacity: 1,
                  backgroundColor: isCurrent ? TEAL : isCompleted ? GOLD_MUTED : GOLD_DIM,
                }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                style={{ flex: 1, height: 6, borderRadius: 3 }}
              />
            );
          })}
        </div>
        <div
          style={{
            fontSize: 11,
            color: "rgba(232, 220, 200, 0.5)",
            textAlign: "center",
            letterSpacing: 0.5,
          }}
        >
          Step {stepNumber + 1} of {totalSteps}
        </div>
      </div>

      {/* Step header */}
      <div style={{ padding: "16px clamp(12px, 3vw, 24px) 12px", textAlign: "center", flexShrink: 0 }}>
        <div style={{ fontSize: 28, marginBottom: 6 }}>{icon}</div>
        <h2
          style={{
            margin: 0,
            fontSize: 20,
            fontWeight: 700,
            color: PARCHMENT,
            lineHeight: 1.3,
          }}
        >
          {title}
        </h2>
        <p
          style={{
            margin: "4px 0 0",
            fontSize: 13,
            color: "rgba(232, 220, 200, 0.6)",
            lineHeight: 1.4,
          }}
        >
          {subtitle}
        </p>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflow: "auto", padding: "0 clamp(12px, 3vw, 24px) 16px" }}>
        {children}
      </div>

      {/* Bottom navigation */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: isFirstStep ? "flex-end" : "space-between",
          padding: "12px clamp(12px, 3vw, 24px)",
          borderTop: "1px solid rgba(45, 138, 138, 0.2)",
          flexShrink: 0,
        }}
      >
        {!isFirstStep && (
          <button
            onClick={onBack}
            style={{
              background: "rgba(232, 220, 200, 0.08)",
              border: "1px solid rgba(232, 220, 200, 0.15)",
              borderRadius: 10,
              padding: "10px 22px",
              color: "rgba(232, 220, 200, 0.7)",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              transition: "background 0.2s",
            }}
          >
            Back
          </button>
        )}
        <button
          onClick={onNext}
          disabled={!canProceed}
          style={{
            background: canProceed
              ? `linear-gradient(135deg, ${TEAL}, #237070)`
              : "rgba(45, 138, 138, 0.2)",
            border: "none",
            borderRadius: 10,
            padding: "10px 28px",
            color: canProceed ? "#e8dcc8" : "rgba(232, 220, 200, 0.3)",
            fontSize: 14,
            fontWeight: 700,
            cursor: canProceed ? "pointer" : "not-allowed",
            opacity: canProceed ? 1 : 0.6,
            boxShadow: canProceed ? "0 4px 16px rgba(45, 138, 138, 0.3)" : "none",
            transition: "all 0.2s",
          }}
        >
          {isLastStep ? "View Expedition Map" : "Next"}
        </button>
      </div>
    </div>
  );
}
