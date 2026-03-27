import { motion } from "framer-motion";
import type { AgeMode } from "./ladder-data";

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
  0: { bg: "linear-gradient(170deg, #0a0e18 0%, #101828 40%, #141e2c 70%, #080c14 100%)", accent: "#64a8d4", glow: "rgba(100,168,212,0.08)" },
  1: { bg: "linear-gradient(170deg, #0a1218 0%, #101e28 40%, #141e2a 70%, #080e14 100%)", accent: "#60c480", glow: "rgba(96,196,128,0.08)" },
  2: { bg: "linear-gradient(170deg, #0c1218 0%, #121e28 40%, #161e2c 70%, #0a1018 100%)", accent: "#64a8d4", glow: "rgba(100,168,212,0.1)" },
  3: { bg: "linear-gradient(170deg, #100e08 0%, #1c1810 40%, #201a10 70%, #120e08 100%)", accent: "#d4a24c", glow: "rgba(212,162,76,0.08)" },
  4: { bg: "linear-gradient(170deg, #0e1018 0%, #141828 40%, #181c2e 70%, #0c1018 100%)", accent: "#8090d4", glow: "rgba(128,144,212,0.08)" },
  5: { bg: "linear-gradient(170deg, #0a0c18 0%, #10122c 40%, #14163a 70%, #080c20 100%)", accent: "#c4b04c", glow: "rgba(196,176,76,0.1)" },
};

const FLOATING_ELEMENTS: Record<number, string[]> = {
  0: ["\uD83D\uDE30", "\uD83C\uDF2A\uFE0F", "\uD83D\uDCAD"],
  1: ["\uD83D\uDCCA", "\uD83D\uDCC8", "\u2728"],
  2: ["\uD83E\uDE9C", "\u2B06\uFE0F", "\u2B50"],
  3: ["\uD83E\uDDF0", "\uD83D\uDC8A", "\uD83D\uDCA8"],
  4: ["\uD83D\uDCCB", "\u270D\uFE0F", "\uD83D\uDCC5"],
  5: ["\u2B50", "\uD83D\uDCAA", "\uD83C\uDF89"],
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
        @keyframes al-float-0 { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-8px) rotate(5deg); } }
        @keyframes al-float-1 { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-12px) rotate(-4deg); } }
        @keyframes al-float-2 { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-6px) rotate(8deg); } }
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
            animation: `al-float-${i} ${4 + i}s ease-in-out infinite`,
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
                    backgroundColor: isCurrent
                      ? scene.accent
                      : isCompleted
                      ? `${scene.accent}80`
                      : "rgba(232, 220, 200, 0.1)",
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
            {"\u2190"} Back
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
            color: canProceed ? "#080c14" : "rgba(232, 220, 200, 0.25)",
            fontSize: 14,
            fontWeight: 700,
            cursor: canProceed ? "pointer" : "not-allowed",
            opacity: canProceed ? 1 : 0.5,
            boxShadow: canProceed ? `0 4px 20px ${scene.accent}30` : "none",
            transition: "all 0.2s",
            boxSizing: "border-box",
          }}
        >
          {isLastStep ? "Complete My Plan \u2B50" : "Continue \u2192"}
        </motion.button>
      </div>
    </div>
  );
}
