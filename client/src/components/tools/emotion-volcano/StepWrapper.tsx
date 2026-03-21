import { motion } from "framer-motion";
import type { AgeMode, StepDef } from "./volcano-data";

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
  stepDef: StepDef;
  children: React.ReactNode;
}

export function StepWrapper({
  stepNumber,
  totalSteps,
  title,
  subtitle,
  icon,
  canProceed,
  onNext,
  onBack,
  stepDef,
  children,
}: StepWrapperProps) {
  const isFirstStep = stepNumber === 0;
  const isLastStep = stepNumber === totalSteps - 1;
  const { bg, accent, glow, floats } = stepDef;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        fontFamily: "Inter, sans-serif",
        background: bg,
        position: "relative",
      }}
    >
      <style>{`
        @keyframes volcano-float-0 { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-10px) rotate(5deg); } }
        @keyframes volcano-float-1 { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-14px) rotate(-4deg); } }
        @keyframes volcano-float-2 { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-7px) rotate(8deg); } }
        @keyframes volcano-pulse { 0%,100% { opacity: 0.06; } 50% { opacity: 0.12; } }
      `}</style>

      {floats.map((emoji, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: i === 0 ? "10%" : i === 1 ? "22%" : "16%",
            right: i === 0 ? "6%" : i === 1 ? "14%" : "24%",
            fontSize: i === 0 ? 30 : i === 1 ? 22 : 18,
            opacity: 0.12,
            animation: `volcano-float-${i} ${4.5 + i * 0.8}s ease-in-out infinite`,
            pointerEvents: "none",
            zIndex: 0,
          }}
        >
          {emoji}
        </div>
      ))}

      {/* Ambient glow */}
      <div
        style={{
          position: "absolute",
          top: 0, left: 0, right: 0, height: 200,
          background: `radial-gradient(ellipse at 30% 0%, ${glow}, transparent 70%)`,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Bottom glow for volcano feel */}
      <div
        style={{
          position: "absolute",
          bottom: 0, left: 0, right: 0, height: 120,
          background: `radial-gradient(ellipse at 50% 100%, ${glow}, transparent 70%)`,
          pointerEvents: "none",
          zIndex: 0,
          animation: "volcano-pulse 3s ease-in-out infinite",
        }}
      />

      {/* Progress bar */}
      <div style={{ position: "relative", zIndex: 1, padding: "12px clamp(16px, 4vw, 28px) 0", flexShrink: 0, maxWidth: 720, margin: "0 auto", width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 3, marginBottom: 12 }}>
          {Array.from({ length: totalSteps }, (_, i) => {
            const isCompleted = i < stepNumber;
            const isCurrent = i === stepNumber;
            return (
              <div key={i} style={{ flex: 1 }}>
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{
                    scale: 1,
                    backgroundColor: isCurrent ? accent : isCompleted ? `${accent}80` : "rgba(240, 232, 216, 0.1)",
                    boxShadow: isCurrent ? `0 0 10px ${accent}50` : "none",
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
              width: 56, height: 56,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${glow}, transparent)`,
              fontSize: 32,
              marginBottom: 6,
            }}
          >
            {icon}
          </motion.div>
          <h2
            style={{
              margin: 0, fontSize: 18, fontWeight: 700,
              color: "#f0e8d8",
              fontFamily: "'Lora', Georgia, serif",
              lineHeight: 1.2,
            }}
          >
            {title}
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "rgba(240, 232, 216, 0.5)", lineHeight: 1.35 }}>
            {subtitle}
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "auto", padding: "12px clamp(16px, 4vw, 28px) 12px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 660, margin: "0 auto", width: "100%" }}>
          {children}
        </div>
      </div>

      {/* Navigation */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: isFirstStep ? "flex-end" : "space-between",
          gap: 10,
          paddingTop: 10,
          paddingLeft: "clamp(16px, 4vw, 28px)",
          paddingRight: "clamp(16px, 4vw, 28px)",
          paddingBottom: "max(14px, env(safe-area-inset-bottom, 0px))",
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
              background: "rgba(240, 232, 216, 0.06)",
              border: "1px solid rgba(240, 232, 216, 0.12)",
              borderRadius: 10,
              padding: "10px 20px",
              minHeight: 44,
              minWidth: 44,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(240, 232, 216, 0.6)",
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
              ? `linear-gradient(135deg, ${accent}, ${accent}cc)`
              : "rgba(240, 232, 216, 0.08)",
            border: "none",
            borderRadius: 10,
            padding: "10px 28px",
            minHeight: 44,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: canProceed ? "#0a0a14" : "rgba(240, 232, 216, 0.25)",
            fontSize: 14,
            fontWeight: 700,
            cursor: canProceed ? "pointer" : "not-allowed",
            opacity: canProceed ? 1 : 0.5,
            boxShadow: canProceed ? `0 4px 20px ${accent}30` : "none",
            transition: "all 0.2s",
            boxSizing: "border-box",
          }}
        >
          {isLastStep ? "View Report 🏆" : "Continue →"}
        </motion.button>
      </div>
    </div>
  );
}
