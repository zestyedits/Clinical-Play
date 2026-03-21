import { motion } from "framer-motion";
import type { AgeMode } from "./CBTThoughtCourt";

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
  0: { bg: "linear-gradient(170deg, #faf8fc 0%, #f3eff8 45%, #ebe4f2 100%)", accent: "#9b7ad8", glow: "rgba(155,122,216,0.2)" },
  1: { bg: "linear-gradient(170deg, #f8f6fc 0%, #efe8f8 45%, #e8dff5 100%)", accent: "#b88ad8", glow: "rgba(184,138,216,0.2)" },
  2: { bg: "linear-gradient(170deg, #faf9f5 0%, #f5f0e8 45%, #ede6dc 100%)", accent: "#d4a853", glow: "rgba(212,168,83,0.22)" },
  3: { bg: "linear-gradient(170deg, #fcf8f7 0%, #f8ebe9 45%, #f0e0dd 100%)", accent: "#d45555", glow: "rgba(212,85,85,0.16)" },
  4: { bg: "linear-gradient(170deg, #f7faf7 0%, #eaf3ea 45%, #e0ebe0 100%)", accent: "#55b877", glow: "rgba(85,184,119,0.18)" },
  5: { bg: "linear-gradient(170deg, #faf9f5 0%, #f3ede4 45%, #ebe3d8 100%)", accent: "#d4a853", glow: "rgba(212,168,83,0.22)" },
  6: { bg: "linear-gradient(170deg, #f7fafb 0%, #e8f2f6 45%, #ddeaf0 100%)", accent: "#8ab8d8", glow: "rgba(138,184,216,0.2)" },
  7: { bg: "linear-gradient(170deg, #faf9f6 0%, #f2ebe3 45%, #eae2d8 100%)", accent: "#d4a853", glow: "rgba(212,168,83,0.2)" },
  8: { bg: "linear-gradient(170deg, #f9f7fb 0%, #eee8f4 45%, #e6dff0 100%)", accent: "#6b3fa0", glow: "rgba(107,63,160,0.18)" },
};

const FLOATING_ELEMENTS: Record<number, string[]> = {
  0: ["📜", "✍️", "✨"],
  1: ["🔨", "🎭", "💭"],
  2: ["📊", "💯", "✨"],
  3: ["🔴", "📋", "🔍"],
  4: ["🟢", "🛡️", "💪"],
  5: ["⚖️", "⭐", "✨"],
  6: ["✏️", "💡", "🌟"],
  7: ["📊", "🔄", "✨"],
  8: ["📁", "✅", "🏆"],
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
        @keyframes cbt-float-0 { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-8px) rotate(5deg); } }
        @keyframes cbt-float-1 { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-12px) rotate(-4deg); } }
        @keyframes cbt-float-2 { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-6px) rotate(8deg); } }
      `}</style>

      {floats.map((emoji, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: i === 0 ? "12%" : i === 1 ? "25%" : "18%",
            right: i === 0 ? "8%" : i === 1 ? "15%" : "22%",
            fontSize: i === 0 ? 28 : i === 1 ? 20 : 16,
            opacity: 0.1,
            animation: `cbt-float-${i} ${4 + i}s ease-in-out infinite`,
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
          top: 0, left: 0, right: 0, height: 180,
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
                    backgroundColor: isCurrent ? scene.accent : isCompleted ? `${scene.accent}80` : "rgba(58, 48, 38, 0.12)",
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
              width: 52, height: 52,
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
              margin: 0, fontSize: 18, fontWeight: 700,
              color: "#3a3228",
              fontFamily: "'Lora', Georgia, serif",
              lineHeight: 1.2,
            }}
          >
            {title}
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "rgba(58, 48, 38, 0.55)", lineHeight: 1.35 }}>
            {subtitle}
          </p>
        </div>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "12px clamp(16px, 4vw, 28px) 12px", position: "relative", zIndex: 1 }}>
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
          background: "linear-gradient(to top, rgba(255,252,248,0.94), transparent)",
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
              background: "rgba(58, 48, 38, 0.05)",
              border: "1px solid rgba(58, 48, 38, 0.12)",
              borderRadius: 10,
              padding: "10px 20px",
              minHeight: 44,
              minWidth: 44,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(58, 48, 38, 0.65)",
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
              : "rgba(58, 48, 38, 0.08)",
            border: "none",
            borderRadius: 10,
            padding: "10px 28px",
            minHeight: 44,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: canProceed ? "#2a2218" : "rgba(58, 48, 38, 0.35)",
            fontSize: 14,
            fontWeight: 700,
            cursor: canProceed ? "pointer" : "not-allowed",
            opacity: canProceed ? 1 : 0.5,
            boxShadow: canProceed ? `0 4px 20px ${scene.accent}30` : "none",
            transition: "all 0.2s",
            boxSizing: "border-box",
          }}
        >
          {isLastStep ? "View Case File 📁" : "Continue →"}
        </motion.button>
      </div>
    </div>
  );
}
