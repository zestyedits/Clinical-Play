import { motion } from "framer-motion";
import type { AgeMode, Strength } from "./quest-data";
import { AGE_LABELS, CHARACTER_COLORS } from "./quest-data";

interface RewriteStepProps {
  problemName: string;
  characterEmoji: string;
  characterColor: string;
  strengths: Strength[];
  rewrittenStory: string;
  onChange: (v: string) => void;
  ageMode: AgeMode;
}

export function RewriteStep({ problemName, characterEmoji, characterColor, strengths, rewrittenStory, onChange, ageMode }: RewriteStepProps) {
  const labels = AGE_LABELS[ageMode];
  const activeHex = CHARACTER_COLORS.find((c) => c.id === characterColor)?.hex || "#6b6b7b";

  const progress = Math.min(rewrittenStory.trim().length / 100, 1);
  const characterScale = 1 - progress * 0.6;
  const characterOpacity = 1 - progress * 0.6;
  const sceneLight = progress;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          background: "rgba(244, 232, 208, 0.04)",
          borderRadius: 14,
          padding: "14px 16px",
          borderLeft: "3px solid rgba(107, 160, 196, 0.3)",
        }}
      >
        <p style={{ fontSize: 13, lineHeight: 1.7, margin: 0, color: "rgba(244, 232, 208, 0.75)" }}>
          {labels.rewritePrompt}
        </p>
      </motion.div>

      <motion.div
        animate={{
          background: `linear-gradient(180deg, rgba(${Math.round(10 + sceneLight * 30)},${Math.round(8 + sceneLight * 25)},${Math.round(20 + sceneLight * 15)},0.9), rgba(${Math.round(15 + sceneLight * 40)},${Math.round(12 + sceneLight * 35)},${Math.round(25 + sceneLight * 20)},0.95))`,
        }}
        style={{
          borderRadius: 16,
          padding: "20px 16px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <motion.div
          animate={{
            opacity: sceneLight * 0.4,
          }}
          style={{
            position: "absolute",
            top: 0, left: 0, right: 0, bottom: 0,
            background: "radial-gradient(ellipse at 50% 30%, rgba(212, 168, 83, 0.3), transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 24 }}>
          <motion.div
            animate={{ scale: characterScale, opacity: characterOpacity }}
            transition={{ duration: 0.5 }}
            style={{ textAlign: "center" }}
          >
            <div style={{ fontSize: 32, filter: `drop-shadow(0 2px 6px ${activeHex}40)` }}>{characterEmoji}</div>
            <p style={{ fontSize: 10, color: `${activeHex}80`, margin: "4px 0 0" }}>{problemName}</p>
          </motion.div>

          <motion.div
            animate={{ opacity: progress > 0 ? 1 : 0.3, scale: progress > 0 ? 1 : 0.8 }}
            style={{ fontSize: 20, color: "rgba(244, 232, 208, 0.4)" }}
          >
            →
          </motion.div>

          <motion.div
            animate={{ scale: 0.7 + progress * 0.3, opacity: 0.3 + progress * 0.7 }}
            transition={{ duration: 0.5 }}
            style={{ textAlign: "center" }}
          >
            <div style={{ fontSize: 32, filter: `drop-shadow(0 2px 8px rgba(212, 168, 83, ${progress * 0.4}))` }}>✍️</div>
            <p style={{ fontSize: 10, color: `rgba(212, 168, 83, ${0.3 + progress * 0.5})`, margin: "4px 0 0" }}>You</p>
          </motion.div>
        </div>

        {strengths.length > 0 && (
          <motion.div
            animate={{ opacity: 0.3 + progress * 0.7 }}
            style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 4, marginTop: 12 }}
          >
            {strengths.slice(0, 6).map((s) => (
              <span key={s.id} style={{ fontSize: 16, filter: `drop-shadow(0 1px 4px rgba(212, 168, 83, ${progress * 0.3}))` }}>
                {s.emoji}
              </span>
            ))}
          </motion.div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <textarea
          value={rewrittenStory}
          onChange={(e) => onChange(e.target.value)}
          placeholder={labels.rewritePlaceholder}
          data-testid="input-rewrite"
          style={{
            width: "100%",
            minHeight: 140,
            padding: "14px 16px",
            background: "rgba(244, 232, 208, 0.06)",
            border: "1px solid rgba(107, 160, 196, 0.2)",
            borderRadius: 14,
            color: "#f4e8d0",
            fontSize: 15,
            fontFamily: "'Lora', Georgia, serif",
            lineHeight: 1.8,
            resize: "vertical",
            outline: "none",
          }}
        />
      </motion.div>

      {rewrittenStory.trim().length > 20 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            textAlign: "center",
            padding: 10,
            background: "rgba(107, 160, 196, 0.06)",
            borderRadius: 12,
          }}
        >
          <p style={{ fontSize: 11, color: "rgba(107, 160, 196, 0.7)", margin: 0 }}>
            📖 Your new chapter is taking shape — the scene brightens as you write...
          </p>
        </motion.div>
      )}
    </div>
  );
}
