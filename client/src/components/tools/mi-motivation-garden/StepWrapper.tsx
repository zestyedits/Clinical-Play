import { motion } from "framer-motion";
import type { AgeMode } from "./garden-data";

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

const GREEN = "#2d7a3a";
const GREEN_MUTED = "rgba(45, 122, 58, 0.35)";
const GREEN_DIM = "rgba(45, 122, 58, 0.12)";
const PARCHMENT = "#e8dcc8";

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
        overflow: "hidden",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div
        style={{
          padding: "10px clamp(14px, 3vw, 24px) 8px",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 6 }}>
          {Array.from({ length: totalSteps }, (_, i) => {
            const isCompleted = i < stepNumber;
            const isCurrent = i === stepNumber;
            return (
              <motion.div
                key={i}
                initial={{ scale: 0.8, opacity: 0.5 }}
                animate={{
                  scale: isCurrent ? 1.1 : 1,
                  opacity: 1,
                  backgroundColor: isCurrent ? GREEN : isCompleted ? GREEN_MUTED : GREEN_DIM,
                }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                style={{ flex: 1, height: 4, borderRadius: 2 }}
              />
            );
          })}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
          <span style={{ fontSize: 20 }}>{icon}</span>
          <div style={{ flex: 1 }}>
            <h2
              style={{
                margin: 0,
                fontSize: 16,
                fontWeight: 700,
                color: PARCHMENT,
                lineHeight: 1.2,
              }}
            >
              {title}
            </h2>
            <p
              style={{
                margin: "2px 0 0",
                fontSize: 12,
                color: "rgba(232, 220, 200, 0.5)",
                lineHeight: 1.3,
              }}
            >
              {subtitle}
            </p>
          </div>
          <span
            style={{
              fontSize: 11,
              color: "rgba(232, 220, 200, 0.35)",
              whiteSpace: "nowrap",
            }}
          >
            {stepNumber + 1}/{totalSteps}
          </span>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: "8px clamp(14px, 3vw, 24px) 12px",
        }}
      >
        {children}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: isFirstStep ? "flex-end" : "space-between",
          padding: "8px clamp(14px, 3vw, 24px) 10px",
          borderTop: "1px solid rgba(45, 122, 58, 0.12)",
          flexShrink: 0,
        }}
      >
        {!isFirstStep && (
          <button
            onClick={onBack}
            style={{
              background: "transparent",
              border: "1px solid rgba(232, 220, 200, 0.12)",
              borderRadius: 8,
              padding: "8px 18px",
              color: "rgba(232, 220, 200, 0.6)",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s",
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
              ? `linear-gradient(135deg, ${GREEN}, #1f5a28)`
              : "rgba(45, 122, 58, 0.15)",
            border: "none",
            borderRadius: 8,
            padding: "8px 24px",
            color: canProceed ? "#e8dcc8" : "rgba(232, 220, 200, 0.3)",
            fontSize: 13,
            fontWeight: 600,
            cursor: canProceed ? "pointer" : "not-allowed",
            opacity: canProceed ? 1 : 0.6,
            boxShadow: canProceed ? "0 2px 10px rgba(45, 122, 58, 0.25)" : "none",
            transition: "all 0.2s",
          }}
        >
          {isLastStep ? "View Your Bouquet" : "Continue"}
        </button>
      </div>
    </div>
  );
}
