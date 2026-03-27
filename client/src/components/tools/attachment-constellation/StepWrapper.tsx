import { motion } from "framer-motion";
import type { AgeMode } from "./constellation-data";

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

const STEP_SCENES: Record<number, { bg: string; accent: string; glow: string }> = {
  0: { bg: "linear-gradient(170deg, #060810 0%, #0a0e1c 40%, #0c1220 70%, #040610 100%)", accent: "#80a8d4", glow: "rgba(128,168,212,0.08)" },
  1: { bg: "linear-gradient(170deg, #060a0a 0%, #0c1414 40%, #101a18 70%, #040808 100%)", accent: "#60c490", glow: "rgba(96,196,144,0.08)" },
  2: { bg: "linear-gradient(170deg, #080810 0%, #101020 40%, #141428 70%, #060610 100%)", accent: "#a090d4", glow: "rgba(160,144,212,0.08)" },
  3: { bg: "linear-gradient(170deg, #080c08 0%, #101810 40%, #141e14 70%, #060a06 100%)", accent: "#80c480", glow: "rgba(128,196,128,0.08)" },
  4: { bg: "linear-gradient(170deg, #06080f 0%, #0a0c1a 40%, #0c1020 70%, #04060c 100%)", accent: "#c4a84c", glow: "rgba(196,168,76,0.1)" },
  5: { bg: "linear-gradient(170deg, #080808 0%, #100e10 40%, #181218 70%, #060806 100%)", accent: "#d4a0b0", glow: "rgba(212,160,176,0.08)" },
};

const FLOATING_ELEMENTS: Record<number, string[]> = {
  0: ["🌱", "🌿", "💚"],
  1: ["⭐", "✨", "💫"],
  2: ["🔗", "💞", "🪢"],
  3: ["🏠", "🌳", "🕊️"],
  4: ["🌌", "⭐", "🌟"],
  5: ["🌟", "💛", "🎉"],
};

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
  const scene = STEP_SCENES[stepNumber] || STEP_SCENES[0];
  const floats = FLOATING_ELEMENTS[stepNumber] || [];

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        fontFamily: "Inter, sans-serif",
        background: scene.bg,
        position: "relative",
      }}
    >
      <style>{`
        @keyframes ac-float-0 { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-8px) rotate(5deg); } }
        @keyframes ac-float-1 { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-12px) rotate(-4deg); } }
        @keyframes ac-float-2 { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-6px) rotate(8deg); } }
      `}</style>

      {floats.map((emoji, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: i === 0 ? "12%" : i === 1 ? "25%" : "18%",
            right: i === 0 ? "8%" : i === 1 ? "15%" : "22%",
            fontSize: i === 0 ? 28 : i === 1 ? 20 : 16,
            opacity: 0.15,
            animation: `ac-float-${i} ${4 + i}s ease-in-out infinite`,
            pointerEvents: "none",
            zIndex: 0,
          }}
        >
          {emoji}
        </div>
      ))}

      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 180,
          background: `radial-gradient(ellipse at 30% 0%, ${scene.glow}, transparent 70%)`,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div style={{ position: "relative", zIndex: 1, padding: "12px clamp(16px, 4vw, 28px) 0", flexShrink: 0, maxWidth: 720, margin: "0 auto", width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 3, marginBottom: 12 }}>
          {Array.from({ length: totalSteps }, (_, i) => {
            const isCompleted = i < stepNumber;
            const isCurrent = i === stepNumber;
            return (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{
                    scale: 1,
                    backgroundColor: isCurrent ? scene.accent : isCompleted ? `${scene.accent}80` : "rgba(232, 220, 200, 0.1)",
                    boxShadow: isCurrent ? `0 0 8px ${scene.accent}40` : "none",
                  }}
                  transition={{ duration: 0.35 }}
                  style={{ width: "100%", height: 4, borderRadius: 2 }}
                />
              </div>
            );
          })}
        </div>

        <div style={{ textAlign: "center", padding: "0 8px" }}>
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${scene.glow}, transparent)`,
              fontSize: 30,
              marginBottom: 6,
            }}
          >
            {icon}
          </motion.div>
          <h2
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 700,
              color: "#e8dcc8",
              fontFamily: "'Lora', Georgia, serif",
              lineHeight: 1.2,
            }}
          >
            {title}
          </h2>
          <p
            style={{
              margin: "4px 0 0",
              fontSize: 12,
              color: "rgba(232, 220, 200, 0.5)",
              lineHeight: 1.35,
            }}
          >
            {subtitle}
          </p>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflow: "auto",
          padding: "12px clamp(16px, 4vw, 28px) 12px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ maxWidth: 660, margin: "0 auto", width: "100%" }}>
          {children}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: isFirstStep ? "flex-end" : "space-between",
          gap: 10,
          paddingTop: 10,
          paddingLeft: "clamp(16px, 4vw, 28px)",
          paddingRight: "clamp(16px, 4vw, 28px)",
          paddingBottom: "max(12px, env(safe-area-inset-bottom, 0px))",
          flexShrink: 0,
          position: "relative",
          zIndex: 1,
          background: "linear-gradient(to top, rgba(0,0,0,0.3), transparent)",
          maxWidth: 720,
          margin: "0 auto",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {!isFirstStep && (
          <button
            type="button"
            onClick={onBack}
            style={{
              background: "rgba(232, 220, 200, 0.06)",
              border: "1px solid rgba(232, 220, 200, 0.12)",
              borderRadius: 10,
              padding: "10px 20px",
              minHeight: 44,
              minWidth: 44,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(232, 220, 200, 0.6)",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s",
              boxSizing: "border-box",
            }}
          >
            ← Back
          </button>
        )}
        <motion.button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          whileHover={canProceed ? { scale: 1.02 } : {}}
          whileTap={canProceed ? { scale: 0.98 } : {}}
          style={{
            background: canProceed
              ? `linear-gradient(135deg, ${scene.accent}, ${scene.accent}cc)`
              : "rgba(232, 220, 200, 0.08)",
            border: "none",
            borderRadius: 10,
            padding: "10px 28px",
            minHeight: 44,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: canProceed ? "#060810" : "rgba(232, 220, 200, 0.25)",
            fontSize: 14,
            fontWeight: 700,
            cursor: canProceed ? "pointer" : "not-allowed",
            opacity: canProceed ? 1 : 0.5,
            boxShadow: canProceed ? `0 4px 20px ${scene.accent}30` : "none",
            transition: "all 0.2s",
            boxSizing: "border-box",
          }}
        >
          {isLastStep ? "Complete My Constellation 🌟" : "Continue →"}
        </motion.button>
      </div>
    </div>
  );
}