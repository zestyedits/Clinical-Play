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

const STEP_SCENES: Record<number, { bg: string; accent: string; glow: string }> = {
  0: { bg: "linear-gradient(170deg, #0e2218 0%, #183428 40%, #1d3d2e 70%, #132a1e 100%)", accent: "#5ab88f", glow: "rgba(90,184,143,0.08)" },
  1: { bg: "linear-gradient(170deg, #0e2218 0%, #1a3a28 40%, #224530 70%, #152d1f 100%)", accent: "#6bc99a", glow: "rgba(107,201,154,0.1)" },
  2: { bg: "linear-gradient(170deg, #161022 0%, #1e1630 40%, #221a38 70%, #140e20 100%)", accent: "#9b8ec4", glow: "rgba(155,142,196,0.08)" },
  3: { bg: "linear-gradient(170deg, #0e1c28 0%, #152838 40%, #1a3040 70%, #0c1820 100%)", accent: "#64b5d9", glow: "rgba(100,181,217,0.08)" },
  4: { bg: "linear-gradient(170deg, #1a1508 0%, #28200e 40%, #302812 70%, #1a1408 100%)", accent: "#d4a24c", glow: "rgba(212,162,76,0.08)" },
  5: { bg: "linear-gradient(170deg, #0e2218 0%, #1a3a28 40%, #224530 70%, #152d1f 100%)", accent: "#5ab88f", glow: "rgba(90,184,143,0.1)" },
  6: { bg: "linear-gradient(170deg, #0e2218 0%, #1a3022 40%, #20382a 70%, #12281c 100%)", accent: "#2d7a3a", glow: "rgba(45,122,58,0.1)" },
};

const FLOATING_ELEMENTS: Record<number, string[]> = {
  0: ["🌍", "🌱", "✨"],
  1: ["🌱", "🌿", "💚"],
  2: ["🌿", "🍂", "🌙"],
  3: ["💧", "🌊", "✨"],
  4: ["🪴", "🌻", "🌾"],
  5: ["🌸", "🌼", "☀️"],
  6: ["💐", "🌹", "🎉"],
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
        @keyframes mg-float-0 { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-8px) rotate(5deg); } }
        @keyframes mg-float-1 { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-12px) rotate(-4deg); } }
        @keyframes mg-float-2 { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-6px) rotate(8deg); } }
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
            animation: `mg-float-${i} ${4 + i}s ease-in-out infinite`,
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

      <div style={{ position: "relative", zIndex: 1, padding: "12px clamp(16px, 4vw, 28px) 0", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 3, marginBottom: 12 }}>
          {Array.from({ length: totalSteps }, (_, i) => {
            const isCompleted = i < stepNumber;
            const isCurrent = i === stepNumber;
            return (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{
                    scale: isCurrent ? 1 : 1,
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
          overflow: "auto",
          padding: "12px clamp(16px, 4vw, 28px) 12px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {children}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: isFirstStep ? "flex-end" : "space-between",
          padding: "10px clamp(16px, 4vw, 28px) 12px",
          flexShrink: 0,
          position: "relative",
          zIndex: 1,
          background: "linear-gradient(to top, rgba(0,0,0,0.3), transparent)",
        }}
      >
        {!isFirstStep && (
          <button
            onClick={onBack}
            style={{
              background: "rgba(232, 220, 200, 0.06)",
              border: "1px solid rgba(232, 220, 200, 0.12)",
              borderRadius: 10,
              padding: "10px 20px",
              color: "rgba(232, 220, 200, 0.6)",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            ← Back
          </button>
        )}
        <motion.button
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
            color: canProceed ? "#0a1f14" : "rgba(232, 220, 200, 0.25)",
            fontSize: 14,
            fontWeight: 700,
            cursor: canProceed ? "pointer" : "not-allowed",
            opacity: canProceed ? 1 : 0.5,
            boxShadow: canProceed ? `0 4px 20px ${scene.accent}30` : "none",
            transition: "all 0.2s",
          }}
        >
          {isLastStep ? "View Your Bouquet 💐" : "Continue →"}
        </motion.button>
      </div>
    </div>
  );
}
