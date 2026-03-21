import { motion } from "framer-motion";
import type { AgeMode } from "./CBTThoughtCourt";

interface WelcomeScreenProps {
  onStart: () => void;
  ageMode: AgeMode;
  onSetAgeMode: (mode: AgeMode) => void;
  onOpenGuide: () => void;
}

const SUBTITLES: Record<AgeMode, string> = {
  child: "Put your tricky thoughts on trial!",
  teen: "Challenge your negative thoughts in court",
  adult: "A structured approach to cognitive restructuring",
};

const INSTRUCTIONS: Record<AgeMode, string> = {
  child:
    "Sometimes our brains play tricks on us! In this game, you'll be the judge. You'll put a tricky thought on trial, look at the evidence, and decide if it's really true.",
  teen:
    "Ever notice your brain jumping to the worst conclusion? Here you'll put those thoughts on trial -- examine the evidence, find the distortions, and reframe.",
  adult:
    "Cognitive restructuring is a core CBT technique. This tool guides you through identifying automatic thoughts, recognizing cognitive distortions, evaluating evidence, and developing balanced alternatives.",
};

const AGE_MODES: { value: AgeMode; label: string; emoji: string }[] = [
  { value: "child", label: "Child", emoji: "🧒" },
  { value: "teen", label: "Teen", emoji: "🧑" },
  { value: "adult", label: "Adult", emoji: "🧑‍💼" },
];

const JOURNEY_STEPS = [
  { emoji: "📜", label: "Accusation" },
  { emoji: "🔨", label: "Charges" },
  { emoji: "📊", label: "Belief" },
  { emoji: "🔴", label: "Prosecution" },
  { emoji: "🟢", label: "Defense" },
  { emoji: "⚖️", label: "Verdict" },
  { emoji: "✏️", label: "Appeal" },
  { emoji: "📊", label: "Re-rate" },
  { emoji: "📁", label: "Case File" },
];

export function WelcomeScreen({
  onStart,
  ageMode,
  onSetAgeMode,
  onOpenGuide,
}: WelcomeScreenProps) {
  return (
    <div
      data-testid="cbt-thought-court-welcome"
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(170deg, #faf8fc 0%, #f0e8f6 30%, #e8e0f0 60%, #e2dae8 100%)",
        fontFamily: "Inter, sans-serif",
        color: "#3a3228",
        overflow: "auto",
        borderRadius: 12,
        position: "relative",
      }}
    >
      <style>{`
        @keyframes cbt-w-float1 { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-15px) rotate(8deg); } }
        @keyframes cbt-w-float2 { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-10px) rotate(-6deg); } }
        @keyframes cbt-w-float3 { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-12px) rotate(4deg); } }
        @keyframes cbt-w-twinkle { 0%,100% { opacity: 0.1; } 50% { opacity: 0.3; } }
      `}</style>

      <div style={{ position: "absolute", top: "8%", left: "8%", fontSize: 32, opacity: 0.12, animation: "cbt-w-float1 6s ease-in-out infinite", pointerEvents: "none" }}>📜</div>
      <div style={{ position: "absolute", top: "15%", right: "10%", fontSize: 24, opacity: 0.1, animation: "cbt-w-float2 7s ease-in-out infinite 0.5s", pointerEvents: "none" }}>🔍</div>
      <div style={{ position: "absolute", bottom: "20%", left: "12%", fontSize: 20, opacity: 0.1, animation: "cbt-w-float3 5s ease-in-out infinite 1s", pointerEvents: "none" }}>🔨</div>
      <div style={{ position: "absolute", bottom: "15%", right: "8%", fontSize: 28, opacity: 0.08, animation: "cbt-w-float1 8s ease-in-out infinite 2s", pointerEvents: "none" }}>📋</div>
      <div style={{ position: "absolute", top: "35%", left: "5%", fontSize: 10, opacity: 0.15, animation: "cbt-w-twinkle 3s ease-in-out infinite", pointerEvents: "none" }}>✨</div>
      <div style={{ position: "absolute", top: "20%", right: "20%", fontSize: 10, opacity: 0.12, animation: "cbt-w-twinkle 4s ease-in-out infinite 1.5s", pointerEvents: "none" }}>✨</div>

      <div
        style={{
          position: "absolute",
          top: 0, left: 0, right: 0, height: "50%",
          background: "radial-gradient(ellipse at 50% 0%, rgba(107,63,160,0.12), transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: 480,
          width: "90%",
          padding: "clamp(20px, 4vw, 32px) clamp(12px, 3vw, 20px)",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.1 }}
          style={{ fontSize: 56, marginBottom: 4, lineHeight: 1, filter: "drop-shadow(0 4px 12px rgba(107,63,160,0.3))" }}
        >
          ⚖️
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          style={{
            fontSize: "clamp(24px, 5vw, 32px)",
            fontWeight: 700,
            margin: "0 0 4px",
            fontFamily: "'Lora', Georgia, serif",
            background: "linear-gradient(135deg, #d4a853, #e8c06a)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          The Thought Court
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{
            fontSize: "clamp(12px, 2.5vw, 14px)",
            color: "rgba(58, 48, 38, 0.55)",
            margin: "0 0 20px",
            fontWeight: 400,
          }}
        >
          {SUBTITLES[ageMode]}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 3,
            marginBottom: 20,
            background: "rgba(58, 48, 38, 0.04)",
            borderRadius: 12,
            padding: 3,
          }}
        >
          {AGE_MODES.map(({ value, label, emoji }) => (
            <button
              key={value}
              onClick={() => onSetAgeMode(value)}
              data-testid={`age-mode-${value}`}
              style={{
                flex: 1,
                padding: "8px 10px",
                fontSize: "clamp(11px, 2vw, 13px)",
                fontWeight: 600,
                fontFamily: "Inter, sans-serif",
                border: "none",
                borderRadius: 10,
                cursor: "pointer",
                transition: "all 0.25s",
                background:
                  ageMode === value
                    ? "linear-gradient(135deg, #6b3fa0, #4a2d7a)"
                    : "transparent",
                color:
                  ageMode === value
                    ? "#f0e8d8"
                    : "rgba(58, 48, 38, 0.5)",
                boxShadow:
                  ageMode === value
                    ? "0 2px 10px rgba(107, 63, 160, 0.3)"
                    : "none",
              }}
            >
              {emoji} {label}
            </button>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          style={{
            background: "rgba(58, 48, 38, 0.04)",
            borderRadius: 14,
            padding: "14px 16px",
            marginBottom: 18,
            borderLeft: "3px solid rgba(107, 63, 160, 0.3)",
            textAlign: "left",
          }}
        >
          <p
            style={{
              fontSize: "clamp(12px, 2.2vw, 13px)",
              lineHeight: 1.7,
              margin: 0,
              color: "rgba(58, 48, 38, 0.75)",
            }}
          >
            {INSTRUCTIONS[ageMode]}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            marginBottom: 22,
            padding: "0 4px",
            flexWrap: "wrap",
          }}
        >
          {JOURNEY_STEPS.map((step, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    background: "rgba(107, 63, 160, 0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                  }}
                >
                  {step.emoji}
                </div>
                <span style={{ fontSize: 7, color: "rgba(58, 48, 38, 0.3)", whiteSpace: "nowrap" }}>
                  {step.label}
                </span>
              </div>
              {i < JOURNEY_STEPS.length - 1 && (
                <div style={{ width: 8, height: 1, background: "rgba(107, 63, 160, 0.2)", margin: "0 1px", marginBottom: 14 }} />
              )}
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}
        >
          <motion.button
            onClick={onStart}
            data-testid="button-begin-trial"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            style={{
              background: "linear-gradient(135deg, #6b3fa0, #4a2d7a)",
              color: "#f0e8d8",
              border: "none",
              borderRadius: 14,
              padding: "14px 44px",
              fontSize: "clamp(14px, 3vw, 16px)",
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
              boxShadow: "0 4px 24px rgba(107, 63, 160, 0.35), 0 0 60px rgba(107, 63, 160, 0.1)",
              width: "100%",
              maxWidth: 280,
            }}
          >
            ⚖️ Begin Trial
          </motion.button>

          <button
            onClick={onOpenGuide}
            data-testid="button-open-distortions-guide"
            style={{
              background: "transparent",
              color: "rgba(58, 48, 38, 0.45)",
              border: "none",
              borderRadius: 8,
              padding: "8px 16px",
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
              transition: "color 0.15s",
            }}
            onMouseOver={(e) => { e.currentTarget.style.color = "rgba(58, 48, 38, 0.7)"; }}
            onMouseOut={(e) => { e.currentTarget.style.color = "rgba(58, 48, 38, 0.45)"; }}
          >
            Review Cognitive Distortions →
          </button>
        </motion.div>
      </div>
    </div>
  );
}
