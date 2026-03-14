import { motion } from "framer-motion";
import type { AgeMode } from "./quest-data";
import { AGE_LABELS } from "./quest-data";

interface ExternalizeStepProps {
  problemDescription: string;
  problemName: string;
  onDescriptionChange: (v: string) => void;
  onNameChange: (v: string) => void;
  ageMode: AgeMode;
}

export function ExternalizeStep({
  problemDescription,
  problemName,
  onDescriptionChange,
  onNameChange,
  ageMode,
}: ExternalizeStepProps) {
  const labels = AGE_LABELS[ageMode];

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

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <textarea
          value={problemDescription}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder={labels.problemPlaceholder}
          data-testid="input-problem-description"
          style={{
            width: "100%",
            minHeight: 80,
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

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          background: "rgba(244, 232, 208, 0.04)",
          borderRadius: 14,
          padding: "14px 16px",
          borderLeft: "3px solid rgba(196, 144, 64, 0.3)",
        }}
      >
        <p style={{ fontSize: 13, lineHeight: 1.7, margin: 0, color: "rgba(244, 232, 208, 0.75)" }}>
          {labels.namePrompt}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
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

      {problemName.trim() && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            textAlign: "center",
            padding: 16,
            background: "rgba(196, 144, 64, 0.08)",
            borderRadius: 16,
            border: "1px solid rgba(196, 144, 64, 0.15)",
          }}
        >
          <div style={{ fontSize: 36, marginBottom: 6 }}>👹</div>
          <p style={{ fontSize: 15, fontFamily: "'Lora', Georgia, serif", fontWeight: 700, color: "#c49040", margin: 0 }}>
            "{problemName}"
          </p>
          <p style={{ fontSize: 11, color: "rgba(244, 232, 208, 0.4)", margin: "4px 0 0" }}>
            The problem now has a name — it's separate from you
          </p>
        </motion.div>
      )}
    </div>
  );
}
