import { motion } from "framer-motion";
import type { AgeMode } from "./volcano-data";

interface WelcomeScreenProps {
  ageMode: AgeMode;
  onSetAgeMode: (mode: AgeMode) => void;
  onStart: () => void;
}

const AGE_MODES: { id: AgeMode; label: string; emoji: string; desc: string }[] = [
  { id: "child", label: "Child", emoji: "🧒", desc: "Ages 6-10 — simple language, playful metaphors" },
  { id: "teen", label: "Teen", emoji: "🧑‍🎓", desc: "Ages 11-17 — relatable, validated, real" },
  { id: "adult", label: "Adult", emoji: "🧑", desc: "Ages 18+ — clinical depth, evidence-based" },
];

export function WelcomeScreen({ ageMode, onSetAgeMode, onStart }: WelcomeScreenProps) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(170deg, #1a1210 0%, #251815 30%, #2a1510 60%, #1a0e0a 100%)",
        fontFamily: "Inter, sans-serif",
        padding: "20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes welcome-lava {
          0% { transform: translateY(0) scale(1); opacity: 0.5; }
          50% { transform: translateY(-30px) scale(1.2); opacity: 0.8; }
          100% { transform: translateY(-60px) scale(0.8); opacity: 0; }
        }
        @keyframes welcome-smoke {
          0% { transform: translateY(0) scale(1); opacity: 0.3; }
          100% { transform: translateY(-80px) scale(2); opacity: 0; }
        }
        @keyframes welcome-glow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
      `}</style>

      {/* Background lava particles */}
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            bottom: "10%",
            left: `${20 + Math.random() * 60}%`,
            width: 4 + Math.random() * 6,
            height: 4 + Math.random() * 6,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${
              ["#ff6633", "#ff4422", "#ff8844", "#ffaa33", "#e05533"][i % 5]
            }, transparent)`,
            animation: `welcome-lava ${2 + Math.random() * 3}s ease-out infinite`,
            animationDelay: `${Math.random() * 3}s`,
            pointerEvents: "none",
          }}
        />
      ))}

      {/* Background smoke */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={`smoke-${i}`}
          style={{
            position: "absolute",
            bottom: "30%",
            left: `${35 + Math.random() * 30}%`,
            width: 20 + Math.random() * 30,
            height: 20 + Math.random() * 30,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(180,160,140,0.15), transparent)",
            animation: `welcome-smoke ${4 + Math.random() * 4}s ease-out infinite`,
            animationDelay: `${Math.random() * 4}s`,
            pointerEvents: "none",
          }}
        />
      ))}

      {/* Bottom glow */}
      <div
        style={{
          position: "absolute",
          bottom: 0, left: 0, right: 0, height: 200,
          background: "radial-gradient(ellipse at 50% 100%, rgba(224,96,64,0.15), transparent 70%)",
          animation: "welcome-glow 3s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />

      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 150, damping: 12, delay: 0.1 }}
        style={{ fontSize: 72, marginBottom: 8, filter: "drop-shadow(0 0 20px rgba(224,96,64,0.4))" }}
      >
        🌋
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        style={{
          margin: 0, fontSize: 28, fontWeight: 800,
          color: "#f0e8d8",
          fontFamily: "'Lora', Georgia, serif",
          textAlign: "center",
          lineHeight: 1.2,
        }}
      >
        The Emotion Volcano
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        style={{
          margin: "8px 0 24px", fontSize: 14,
          color: "rgba(240, 232, 216, 0.55)",
          textAlign: "center",
          maxWidth: 380,
          lineHeight: 1.5,
        }}
      >
        Explore what heats your volcano, notice your body's warning signs,
        discover cooling techniques, and build your eruption prevention plan.
      </motion.p>

      {/* Age Mode Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.4 }}
        style={{ display: "flex", gap: 10, marginBottom: 28 }}
      >
        {AGE_MODES.map((mode) => {
          const isSelected = ageMode === mode.id;
          return (
            <motion.button
              key={mode.id}
              onClick={() => onSetAgeMode(mode.id)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                padding: "12px 16px",
                borderRadius: 12,
                border: isSelected ? "1.5px solid rgba(224,96,64,0.6)" : "1px solid rgba(240, 232, 216, 0.1)",
                background: isSelected ? "rgba(224,96,64,0.12)" : "rgba(240, 232, 216, 0.04)",
                cursor: "pointer",
                transition: "all 0.2s",
                minWidth: 85,
              }}
            >
              <span style={{ fontSize: 24 }}>{mode.emoji}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: isSelected ? "#e06040" : "rgba(240,232,216,0.5)" }}>
                {mode.label}
              </span>
            </motion.button>
          );
        })}
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.4 }}
        style={{
          fontSize: 11,
          color: "rgba(240,232,216,0.35)",
          textAlign: "center",
          marginBottom: 20,
          maxWidth: 280,
        }}
      >
        {AGE_MODES.find((m) => m.id === ageMode)?.desc}
      </motion.p>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.4 }}
        onClick={onStart}
        whileHover={{ scale: 1.04, boxShadow: "0 8px 40px rgba(224,96,64,0.3)" }}
        whileTap={{ scale: 0.97 }}
        style={{
          background: "linear-gradient(135deg, #e06040, #d48040)",
          border: "none",
          borderRadius: 14,
          padding: "14px 44px",
          color: "#0a0a0a",
          fontSize: 16,
          fontWeight: 700,
          cursor: "pointer",
          boxShadow: "0 4px 20px rgba(224,96,64,0.25)",
          letterSpacing: 0.3,
        }}
      >
        Begin Exploration 🌋
      </motion.button>
    </div>
  );
}
