import { motion } from "framer-motion";
import type { AgeMode } from "./quest-data";
import { AGE_LABELS, CHARACTER_EMOJIS, CHARACTER_COLORS, CHARACTER_TRAITS } from "./quest-data";

interface ExternalizeStepProps {
  problemDescription: string;
  problemName: string;
  characterEmoji: string;
  characterColor: string;
  characterTraits: string[];
  onDescriptionChange: (v: string) => void;
  onNameChange: (v: string) => void;
  onEmojiChange: (v: string) => void;
  onColorChange: (v: string) => void;
  onToggleTrait: (id: string) => void;
  ageMode: AgeMode;
}

export function ExternalizeStep({
  problemDescription,
  problemName,
  characterEmoji,
  characterColor,
  characterTraits,
  onDescriptionChange,
  onNameChange,
  onEmojiChange,
  onColorChange,
  onToggleTrait,
  ageMode,
}: ExternalizeStepProps) {
  const labels = AGE_LABELS[ageMode];
  const activeColor = CHARACTER_COLORS.find((c) => c.id === characterColor)?.hex || "#6b6b7b";

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
          borderLeft: "3px solid rgba(196, 144, 64, 0.3)",
        }}
      >
        <p style={{ fontSize: 13, lineHeight: 1.7, margin: 0, color: "rgba(244, 232, 208, 0.75)" }}>
          {labels.problemPrompt}
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <textarea
          value={problemDescription}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder={labels.problemPlaceholder}
          data-testid="input-problem-description"
          style={{
            width: "100%",
            minHeight: 70,
            padding: "12px 14px",
            background: "rgba(244, 232, 208, 0.06)",
            border: "1px solid rgba(196, 144, 64, 0.2)",
            borderRadius: 12,
            color: "#f4e8d0",
            fontSize: 14,
            fontFamily: "'Lora', Georgia, serif",
            lineHeight: 1.6,
            resize: "vertical",
            outline: "none",
          }}
        />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        style={{ background: "rgba(244, 232, 208, 0.04)", borderRadius: 14, padding: "14px 16px", borderLeft: "3px solid rgba(196, 144, 64, 0.3)" }}>
        <p style={{ fontSize: 13, lineHeight: 1.7, margin: 0, color: "rgba(244, 232, 208, 0.75)" }}>
          {labels.namePrompt}
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <input
          value={problemName}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder={labels.namePlaceholder}
          data-testid="input-problem-name"
          style={{
            width: "100%",
            padding: "12px 14px",
            background: "rgba(244, 232, 208, 0.06)",
            border: "1px solid rgba(196, 144, 64, 0.2)",
            borderRadius: 12,
            color: "#f4e8d0",
            fontSize: 16,
            fontFamily: "'Lora', Georgia, serif",
            fontWeight: 600,
            outline: "none",
          }}
        />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <p style={{ fontSize: 11, color: "rgba(244, 232, 208, 0.4)", margin: "0 0 6px" }}>
          Choose an icon for the troublemaker:
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {CHARACTER_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => onEmojiChange(emoji)}
              data-testid={`emoji-${emoji}`}
              style={{
                width: 38, height: 38, borderRadius: 8, fontSize: 20,
                border: characterEmoji === emoji ? `2px solid ${activeColor}` : "1px solid rgba(244, 232, 208, 0.1)",
                background: characterEmoji === emoji ? `${activeColor}20` : "rgba(244, 232, 208, 0.04)",
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.15s",
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <p style={{ fontSize: 11, color: "rgba(244, 232, 208, 0.4)", margin: "0 0 6px" }}>
          Pick a color that represents it:
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {CHARACTER_COLORS.map((c) => (
            <button
              key={c.id}
              onClick={() => onColorChange(c.id)}
              data-testid={`color-${c.id}`}
              style={{
                width: 32, height: 32, borderRadius: "50%",
                background: c.hex,
                border: characterColor === c.id ? "3px solid #f4e8d0" : "2px solid rgba(244, 232, 208, 0.15)",
                cursor: "pointer",
                transition: "all 0.15s",
                boxShadow: characterColor === c.id ? `0 0 12px ${c.hex}60` : "none",
              }}
              title={c.label}
            />
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
        <p style={{ fontSize: 11, color: "rgba(244, 232, 208, 0.4)", margin: "0 0 6px" }}>
          What is this troublemaker like? (pick all that apply)
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {CHARACTER_TRAITS.map((trait) => {
            const selected = characterTraits.includes(trait.id);
            return (
              <button
                key={trait.id}
                onClick={() => onToggleTrait(trait.id)}
                data-testid={`trait-${trait.id}`}
                style={{
                  padding: "6px 12px", borderRadius: 20, fontSize: 12, fontWeight: 500,
                  border: selected ? `1px solid ${activeColor}80` : "1px solid rgba(244, 232, 208, 0.12)",
                  background: selected ? `${activeColor}20` : "rgba(244, 232, 208, 0.04)",
                  color: selected ? "#f4e8d0" : "rgba(244, 232, 208, 0.5)",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  display: "flex", alignItems: "center", gap: 4,
                }}
              >
                <span>{trait.emoji}</span> {trait.label}
              </button>
            );
          })}
        </div>
      </motion.div>

      {problemName.trim() && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            textAlign: "center",
            padding: 16,
            background: `${activeColor}10`,
            borderRadius: 16,
            border: `1px solid ${activeColor}25`,
          }}
        >
          <div style={{ fontSize: 44, marginBottom: 6, filter: `drop-shadow(0 2px 8px ${activeColor}40)` }}>{characterEmoji}</div>
          <p style={{ fontSize: 16, fontFamily: "'Lora', Georgia, serif", fontWeight: 700, color: activeColor, margin: 0 }}>
            "{problemName}"
          </p>
          {characterTraits.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 4, marginTop: 8 }}>
              {characterTraits.map((tid) => {
                const trait = CHARACTER_TRAITS.find((t) => t.id === tid);
                return trait ? (
                  <span key={tid} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, background: `${activeColor}15`, color: "rgba(244, 232, 208, 0.6)" }}>
                    {trait.emoji} {trait.label}
                  </span>
                ) : null;
              })}
            </div>
          )}
          <p style={{ fontSize: 11, color: "rgba(244, 232, 208, 0.4)", margin: "8px 0 0" }}>
            The problem now has a name — it's separate from you
          </p>
        </motion.div>
      )}
    </div>
  );
}
