import { motion } from "framer-motion";
import type { AgeMode, SpeechBubble, ExceptionStar, Strength } from "./quest-data";
import { CHARACTER_COLORS, CHARACTER_TRAITS, SPEECH_CATEGORIES, FURTHER_READING } from "./quest-data";

interface StorySummaryProps {
  ageMode: AgeMode;
  problemDescription: string;
  problemName: string;
  characterEmoji: string;
  characterColor: string;
  characterTraits: string[];
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
  characterEmoji,
  characterColor,
  characterTraits,
  bubbles,
  stars,
  strengths,
  rewrittenStory,
  onNewQuest,
}: StorySummaryProps) {
  const summaryTitle = ageMode === "child" ? "Your Story Book" : ageMode === "teen" ? "Your Narrative" : "Your Narrative Summary";
  const activeHex = CHARACTER_COLORS.find((c) => c.id === characterColor)?.hex || "#6b6b7b";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ textAlign: "center" }}>
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
          background: `${activeHex}0a`,
          borderRadius: 16,
          padding: 16,
          border: `1px solid ${activeHex}20`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <span style={{ fontSize: 28, filter: `drop-shadow(0 2px 6px ${activeHex}40)` }}>{characterEmoji}</span>
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: activeHex, margin: 0, fontFamily: "'Lora', Georgia, serif" }}>
              Chapter 1: "{problemName}"
            </h4>
            {characterTraits.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginTop: 4 }}>
                {characterTraits.map((tid) => {
                  const trait = CHARACTER_TRAITS.find((t) => t.id === tid);
                  return trait ? (
                    <span key={tid} style={{ fontSize: 9, padding: "1px 6px", borderRadius: 8, background: `${activeHex}15`, color: "rgba(244, 232, 208, 0.5)" }}>
                      {trait.emoji} {trait.label}
                    </span>
                  ) : null;
                })}
              </div>
            )}
          </div>
        </div>
        <p style={{ fontSize: 13, color: "rgba(244, 232, 208, 0.7)", margin: 0, lineHeight: 1.6, fontFamily: "'Lora', Georgia, serif", fontStyle: "italic" }}>
          {problemDescription}
        </p>
      </motion.div>

      {bubbles.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          style={{ background: "rgba(184, 120, 72, 0.06)", borderRadius: 16, padding: 16, border: "1px solid rgba(184, 120, 72, 0.15)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 20 }}>💬</span>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: "#b87848", margin: 0, fontFamily: "'Lora', Georgia, serif" }}>
              Chapter 2: Its Voice
            </h4>
          </div>
          {SPEECH_CATEGORIES.map((cat) => {
            const catBubbles = bubbles.filter((b) => b.category === cat.id);
            if (catBubbles.length === 0) return null;
            return (
              <div key={cat.id} style={{ marginBottom: 10 }}>
                <p style={{ fontSize: 10, color: "rgba(244, 232, 208, 0.4)", margin: "0 0 4px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {cat.label}
                </p>
                {catBubbles.map((b) => (
                  <p key={b.id} style={{ fontSize: 13, color: "rgba(244, 232, 208, 0.65)", margin: "0 0 4px", fontFamily: "'Lora', Georgia, serif", fontStyle: "italic", paddingLeft: 12, borderLeft: "2px solid rgba(184, 120, 72, 0.2)" }}>
                    "{b.text}"
                  </p>
                ))}
              </div>
            );
          })}
        </motion.div>
      )}

      {stars.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          style={{ background: "rgba(196, 164, 58, 0.06)", borderRadius: 16, padding: 16, border: "1px solid rgba(196, 164, 58, 0.15)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 20 }}>⭐</span>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: "#c4a43a", margin: 0, fontFamily: "'Lora', Georgia, serif" }}>
              Chapter 3: Times You Won
            </h4>
          </div>
          {stars.map((s) => (
            <div key={s.id} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 14, flexShrink: 0 }}>⭐</span>
              <p style={{ fontSize: 13, color: "rgba(244, 232, 208, 0.7)", margin: 0, lineHeight: 1.5, fontFamily: "'Lora', Georgia, serif" }}>{s.text}</p>
            </div>
          ))}
        </motion.div>
      )}

      {strengths.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          style={{ background: "rgba(212, 133, 58, 0.06)", borderRadius: 16, padding: 16, border: "1px solid rgba(212, 133, 58, 0.15)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 20 }}>💪</span>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: "#d4853a", margin: 0, fontFamily: "'Lora', Georgia, serif" }}>
              Chapter 4: Your Author Profile
            </h4>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {strengths.map((s) => (
              <div key={s.id} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", background: "rgba(212, 133, 58, 0.1)", borderRadius: 10, border: "1px solid rgba(212, 133, 58, 0.15)" }}>
                <span style={{ fontSize: 16 }}>{s.emoji}</span>
                <span style={{ fontSize: 12, color: "rgba(244, 232, 208, 0.8)", fontWeight: 500 }}>{s.text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
        style={{ background: "rgba(107, 160, 196, 0.06)", borderRadius: 16, padding: 16, border: "1px solid rgba(107, 160, 196, 0.15)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 20 }}>✍️</span>
          <h4 style={{ fontSize: 14, fontWeight: 700, color: "#6ba0c4", margin: 0, fontFamily: "'Lora', Georgia, serif" }}>
            Chapter 5: The New Chapter
          </h4>
        </div>
        <p style={{ fontSize: 14, color: "rgba(244, 232, 208, 0.8)", margin: 0, lineHeight: 1.7, fontFamily: "'Lora', Georgia, serif" }}>{rewrittenStory}</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
        style={{ textAlign: "center", padding: 16, background: "rgba(212, 168, 83, 0.06)", borderRadius: 16, border: "1px solid rgba(212, 168, 83, 0.12)" }}>
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
            color: "#f4e8d0", border: "none", borderRadius: 12,
            padding: "12px 32px", fontSize: 14, fontWeight: 700,
            cursor: "pointer", fontFamily: "Inter, sans-serif",
            boxShadow: "0 4px 20px rgba(138, 104, 48, 0.3)",
          }}
        >
          📖 Begin a New Quest
        </motion.button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
        style={{ background: "rgba(244, 232, 208, 0.03)", borderRadius: 16, padding: 16, border: "1px solid rgba(244, 232, 208, 0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
          <span style={{ fontSize: 16 }}>📚</span>
          <h4 style={{ fontSize: 13, fontWeight: 700, color: "rgba(244, 232, 208, 0.6)", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Further Reading
          </h4>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {FURTHER_READING.map((ref, i) => (
            <div key={i} style={{ paddingLeft: 12, borderLeft: "2px solid rgba(212, 168, 83, 0.15)" }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "rgba(244, 232, 208, 0.7)", margin: 0 }}>
                {ref.title}
              </p>
              <p style={{ fontSize: 11, color: "rgba(244, 232, 208, 0.45)", margin: "2px 0 0" }}>
                {ref.author} ({ref.year})
              </p>
              <p style={{ fontSize: 11, color: "rgba(244, 232, 208, 0.4)", margin: "2px 0 0", lineHeight: 1.4 }}>
                {ref.description}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      <div style={{ height: 16 }} />
    </div>
  );
}
