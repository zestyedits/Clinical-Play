import { motion } from "framer-motion";

interface WelcomeScreenProps {
  onStart: () => void;
}

const JOURNEY_STEPS = [
  { emoji: "🧠", label: "Head & Mind" },
  { emoji: "💚", label: "Chest & Heart" },
  { emoji: "✋", label: "Hands" },
  { emoji: "👣", label: "Feet & Roots" },
];

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div
      data-testid="grounding-grove-welcome"
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(170deg, #f5faf5 0%, #eaf2ea 30%, #dfeadf 60%, #d4e2d4 100%)",
        fontFamily: "Inter, sans-serif",
        color: "#3a3228",
        overflow: "auto",
        borderRadius: 12,
        position: "relative",
      }}
    >
      <style>{`
        @keyframes gg-w-float1 { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-15px) rotate(8deg); } }
        @keyframes gg-w-float2 { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-10px) rotate(-6deg); } }
        @keyframes gg-w-float3 { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-12px) rotate(4deg); } }
        @keyframes gg-w-twinkle { 0%,100% { opacity: 0.1; } 50% { opacity: 0.3; } }
      `}</style>

      <div style={{ position: "absolute", top: "8%", left: "8%", fontSize: 32, opacity: 0.12, animation: "gg-w-float1 6s ease-in-out infinite", pointerEvents: "none" }}>🌳</div>
      <div style={{ position: "absolute", top: "15%", right: "10%", fontSize: 24, opacity: 0.1, animation: "gg-w-float2 7s ease-in-out infinite 0.5s", pointerEvents: "none" }}>🍃</div>
      <div style={{ position: "absolute", bottom: "20%", left: "12%", fontSize: 20, opacity: 0.1, animation: "gg-w-float3 5s ease-in-out infinite 1s", pointerEvents: "none" }}>🌿</div>
      <div style={{ position: "absolute", bottom: "15%", right: "8%", fontSize: 28, opacity: 0.08, animation: "gg-w-float1 8s ease-in-out infinite 2s", pointerEvents: "none" }}>🪨</div>
      <div style={{ position: "absolute", top: "35%", left: "5%", fontSize: 10, opacity: 0.15, animation: "gg-w-twinkle 3s ease-in-out infinite", pointerEvents: "none" }}>✨</div>
      <div style={{ position: "absolute", top: "20%", right: "20%", fontSize: 10, opacity: 0.12, animation: "gg-w-twinkle 4s ease-in-out infinite 1.5s", pointerEvents: "none" }}>🌟</div>

      <div
        style={{
          position: "absolute",
          top: 0, left: 0, right: 0, height: "50%",
          background: "radial-gradient(ellipse at 50% 0%, rgba(58,107,58,0.12), transparent 70%)",
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
          style={{ fontSize: 56, marginBottom: 4, lineHeight: 1, filter: "drop-shadow(0 4px 12px rgba(58,107,58,0.3))" }}
        >
          🌳
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
            background: "linear-gradient(135deg, #7db87d, #a0d4a0)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          The Grounding Grove
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
          Return to Your Body, One Region at a Time
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          style={{
            background: "rgba(58, 48, 38, 0.04)",
            borderRadius: 14,
            padding: "14px 16px",
            marginBottom: 18,
            borderLeft: "3px solid rgba(58, 107, 58, 0.3)",
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
            Explore different areas of your body to notice where you hold tension, stress, or discomfort. For each region, try grounding techniques designed to help you reconnect and release.
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
            gap: 4,
            marginBottom: 22,
            padding: "0 4px",
          }}
        >
          {JOURNEY_STEPS.map((step, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                <div
                  style={{
                    width: 42, height: 42,
                    borderRadius: "50%",
                    background: "rgba(58, 107, 58, 0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                  }}
                >
                  {step.emoji}
                </div>
                <span style={{ fontSize: 8, color: "rgba(58, 48, 38, 0.35)", whiteSpace: "nowrap" }}>
                  {step.label}
                </span>
              </div>
              {i < JOURNEY_STEPS.length - 1 && (
                <div style={{ width: 16, height: 1, background: "rgba(58, 107, 58, 0.2)", margin: "0 2px", marginBottom: 14 }} />
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
            data-testid="button-start-grounding-grove"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            style={{
              background: "linear-gradient(135deg, #3a6b3a, #2d5a2d)",
              color: "#faf8f5",
              border: "none",
              borderRadius: 14,
              padding: "14px 44px",
              fontSize: "clamp(14px, 3vw, 16px)",
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
              boxShadow: "0 4px 24px rgba(58, 107, 58, 0.35), 0 0 60px rgba(58, 107, 58, 0.1)",
              width: "100%",
              maxWidth: 280,
            }}
          >
            🌳 Enter the Grove
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
