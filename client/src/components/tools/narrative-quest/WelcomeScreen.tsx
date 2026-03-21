import { motion } from "framer-motion";
import type { AgeMode } from "./quest-data";

interface WelcomeScreenProps {
  onStart: () => void;
  ageMode: AgeMode;
  onSetAgeMode: (mode: AgeMode) => void;
}

const SUBTITLES: Record<AgeMode, string> = {
  child: "Turn your problems into characters in YOUR story!",
  teen: "Rewrite the narrative — separate yourself from the problem",
  adult: "A guided Narrative Therapy exercise in externalization and re-authoring",
};

const INSTRUCTIONS: Record<AgeMode, string> = {
  child:
    "Sometimes problems feel really big — like they're part of who you are. But you're NOT the problem! In this game, you'll turn the problem into a character, learn its tricks, and write a new story where YOU are the hero.",
  teen:
    "The stories we tell about ourselves shape how we see the world. This tool helps you separate yourself from the problem, find the moments you've already beaten it, and rewrite your narrative on your own terms.",
  adult:
    "Narrative Therapy proposes that problems are manufactured in social, cultural, and political contexts. This tool guides you through externalization, unique outcome identification, and re-authoring — core narrative practices that help you reclaim agency over your story.",
};

const AGE_MODES: { value: AgeMode; label: string; emoji: string }[] = [
  { value: "child", label: "Child", emoji: "🧒" },
  { value: "teen", label: "Teen", emoji: "🧑" },
  { value: "adult", label: "Adult", emoji: "🧑‍💼" },
];

const JOURNEY_STEPS = [
  { emoji: "👹", label: "Name It" },
  { emoji: "💬", label: "Hear It" },
  { emoji: "⭐", label: "Exceptions" },
  { emoji: "💪", label: "Strengths" },
  { emoji: "✍️", label: "Rewrite" },
  { emoji: "📖", label: "Summary" },
];

export function WelcomeScreen({ onStart, ageMode, onSetAgeMode }: WelcomeScreenProps) {
  return (
    <div
      data-testid="narrative-quest-welcome"
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(170deg, #fdf9f3 0%, #f5ebe0 30%, #ede2d4 60%, #e5d9c8 100%)",
        fontFamily: "Inter, sans-serif",
        color: "#3a3228",
        overflow: "auto",
        borderRadius: 12,
        position: "relative",
      }}
    >
      <style>{`
        @keyframes nq-w-float1 { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-15px) rotate(8deg); } }
        @keyframes nq-w-float2 { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-10px) rotate(-6deg); } }
        @keyframes nq-w-float3 { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-12px) rotate(4deg); } }
        @keyframes nq-w-twinkle { 0%,100% { opacity: 0.1; } 50% { opacity: 0.3; } }
      `}</style>

      <div style={{ position: "absolute", top: "8%", left: "8%", fontSize: 32, opacity: 0.12, animation: "nq-w-float1 6s ease-in-out infinite", pointerEvents: "none" }}>📜</div>
      <div style={{ position: "absolute", top: "15%", right: "10%", fontSize: 24, opacity: 0.1, animation: "nq-w-float2 7s ease-in-out infinite 0.5s", pointerEvents: "none" }}>🪶</div>
      <div style={{ position: "absolute", bottom: "20%", left: "12%", fontSize: 20, opacity: 0.1, animation: "nq-w-float3 5s ease-in-out infinite 1s", pointerEvents: "none" }}>📖</div>
      <div style={{ position: "absolute", bottom: "15%", right: "8%", fontSize: 28, opacity: 0.08, animation: "nq-w-float1 8s ease-in-out infinite 2s", pointerEvents: "none" }}>✨</div>
      <div style={{ position: "absolute", top: "35%", left: "5%", fontSize: 10, opacity: 0.15, animation: "nq-w-twinkle 3s ease-in-out infinite", pointerEvents: "none" }}>✨</div>
      <div style={{ position: "absolute", top: "20%", right: "20%", fontSize: 10, opacity: 0.12, animation: "nq-w-twinkle 4s ease-in-out infinite 1.5s", pointerEvents: "none" }}>✨</div>

      <div
        style={{
          position: "absolute",
          top: 0, left: 0, right: 0, height: "50%",
          background: "radial-gradient(ellipse at 50% 0%, rgba(180,140,80,0.1), transparent 70%)",
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
          style={{ fontSize: 56, marginBottom: 4, lineHeight: 1, filter: "drop-shadow(0 4px 12px rgba(180,140,80,0.3))" }}
        >
          📖
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
            background: "linear-gradient(135deg, #d4a853, #c49040)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          The Narrative Quest
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
                background: ageMode === value ? "linear-gradient(135deg, #8a6830, #6b5020)" : "transparent",
                color: ageMode === value ? "#faf8f5" : "rgba(58, 48, 38, 0.5)",
                boxShadow: ageMode === value ? "0 2px 10px rgba(138, 104, 48, 0.3)" : "none",
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
            borderLeft: "3px solid rgba(180, 140, 80, 0.3)",
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
                    background: "rgba(180, 140, 80, 0.12)",
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
                <div style={{ width: 8, height: 1, background: "rgba(180, 140, 80, 0.2)", margin: "0 1px", marginBottom: 14 }} />
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
            data-testid="button-begin-quest"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            style={{
              background: "linear-gradient(135deg, #8a6830, #6b5020)",
              color: "#faf8f5",
              border: "none",
              borderRadius: 14,
              padding: "14px 44px",
              fontSize: "clamp(14px, 3vw, 16px)",
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
              boxShadow: "0 4px 24px rgba(138, 104, 48, 0.35), 0 0 60px rgba(138, 104, 48, 0.1)",
              width: "100%",
              maxWidth: 280,
            }}
          >
            📖 Begin Your Story
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
