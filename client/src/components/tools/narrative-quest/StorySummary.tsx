import { motion } from "framer-motion";
import type { AgeMode, SpeechBubble, ExceptionStar, Strength } from "./quest-data";

interface StorySummaryProps {
  ageMode: AgeMode;
  problemDescription: string;
  problemName: string;
  bubbles: SpeechBubble[];
  stars: ExceptionStar[];
  strengths: Strength[];
  rewrittenStory: string;
  onNewQuest: () => void;
}

export function StorySummary({
  ageMode,
  problemDescription,
  problemName,
  bubbles,
  stars,
  strengths,
  rewrittenStory,
  onNewQuest,
}: StorySummaryProps) {
  const summaryTitle = ageMode === "child" ? "Your Story Book" : ageMode === "teen" ? "Your Narrative" : "Your Narrative Summary";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ textAlign: "center" }}
      >
        <div style={{ fontSize: 40, marginBottom: 8 }}>📖</div>
        <h3 style={{ fontSize: 20, fontFamily: "'Lora', Georgia, serif", fontWeight: 700, color: "#d4a853", margin: 0 }}>
          {summaryTitle}
        </h3>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          background: "rgba(196, 144, 64, 0.06)",
          borderRadius: 16,
          padding: 16,
          border: "1px solid rgba(196, 144, 64, 0.15)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 20 }}>👹</span>
          <h4 style={{ fontSize: 14, fontWeight: 700, color: "#c49040", margin: 0, fontFamily: "'Lora', Georgia, serif" }}>
            Chapter 1: The Troublemaker — "{problemName}"
          </h4>
        </div>
        <p style={{ fontSize: 13, color: "rgba(244, 232, 208, 0.7)", margin: 0, lineHeight: 1.6, fontFamily: "'Lora', Georgia, serif", fontStyle: "italic" }}>
          {problemDescription}
        </p>
      </motion.div>

      {bubbles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            background: "rgba(184, 120, 72, 0.06)",
            borderRadius: 16,
            padding: 16,
            border: "1px solid rgba(184, 120, 72, 0.15)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 20 }}>💬</span>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: "#b87848", margin: 0, fontFamily: "'Lora', Georgia, serif" }}>
              Chapter 2: Its Voice
            </h4>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {bubbles.map((b) => (
              <p key={b.id} style={{ fontSize: 13, color: "rgba(244, 232, 208, 0.65)", margin: 0, fontFamily: "'Lora', Georgia, serif", fontStyle: "italic", paddingLeft: 12, borderLeft: "2px solid rgba(184, 120, 72, 0.2)" }}>
                "{b.text}"
              </p>
            ))}
          </div>
        </motion.div>
      )}

      {stars.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            background: "rgba(196, 164, 58, 0.06)",
            borderRadius: 16,
            padding: 16,
            border: "1px solid rgba(196, 164, 58, 0.15)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 20 }}>⭐</span>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: "#c4a43a", margin: 0, fontFamily: "'Lora', Georgia, serif" }}>
              Chapter 3: Times You Won
            </h4>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {stars.map((s) => (
              <div key={s.id} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>⭐</span>
                <p style={{ fontSize: 13, color: "rgba(244, 232, 208, 0.7)", margin: 0, lineHeight: 1.5, fontFamily: "'Lora', Georgia, serif" }}>
                  {s.text}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {strengths.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{
            background: "rgba(212, 133, 58, 0.06)",
            borderRadius: 16,
            padding: 16,
            border: "1px solid rgba(212, 133, 58, 0.15)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 20 }}>💪</span>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: "#d4853a", margin: 0, fontFamily: "'Lora', Georgia, serif" }}>
              Chapter 4: Your Hidden Powers
            </h4>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {strengths.map((s) => (
              <div
                key={s.id}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  background: "rgba(212, 133, 58, 0.1)",
                  borderRadius: 10,
                  border: "1px solid rgba(212, 133, 58, 0.15)",
                }}
              >
                <span style={{ fontSize: 16 }}>{s.emoji}</span>
                <span style={{ fontSize: 12, color: "rgba(244, 232, 208, 0.8)", fontWeight: 500 }}>{s.text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        style={{
          background: "rgba(107, 160, 196, 0.06)",
          borderRadius: 16,
          padding: 16,
          border: "1px solid rgba(107, 160, 196, 0.15)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 20 }}>✍️</span>
          <h4 style={{ fontSize: 14, fontWeight: 700, color: "#6ba0c4", margin: 0, fontFamily: "'Lora', Georgia, serif" }}>
            Chapter 5: The New Chapter
          </h4>
        </div>
        <p style={{ fontSize: 14, color: "rgba(244, 232, 208, 0.8)", margin: 0, lineHeight: 1.7, fontFamily: "'Lora', Georgia, serif" }}>
          {rewrittenStory}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        style={{
          textAlign: "center",
          padding: "16px",
          background: "rgba(212, 168, 83, 0.06)",
          borderRadius: 16,
          border: "1px solid rgba(212, 168, 83, 0.12)",
        }}
      >
        <p style={{ fontSize: 13, color: "rgba(244, 232, 208, 0.6)", margin: "0 0 12px", fontFamily: "'Lora', Georgia, serif", fontStyle: "italic" }}>
          "You are not the problem. The problem is the problem."
        </p>
        <p style={{ fontSize: 10, color: "rgba(244, 232, 208, 0.35)", margin: "0 0 16px" }}>
          — Michael White, Narrative Therapy
        </p>

        <motion.button
          onClick={onNewQuest}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          data-testid="button-new-quest"
          style={{
            background: "linear-gradient(135deg, #8a6830, #6b5020)",
            color: "#f4e8d0",
            border: "none",
            borderRadius: 12,
            padding: "12px 32px",
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "Inter, sans-serif",
            boxShadow: "0 4px 20px rgba(138, 104, 48, 0.3)",
          }}
        >
          📖 Begin a New Quest
        </motion.button>
      </motion.div>

      <div style={{ height: 16 }} />
    </div>
  );
}
