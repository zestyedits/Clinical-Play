import { motion } from "framer-motion";
import type { AgeMode } from "./quest-data";
import { AGE_LABELS } from "./quest-data";

interface RewriteStepProps {
  problemName: string;
  rewrittenStory: string;
  onChange: (v: string) => void;
  ageMode: AgeMode;
}

export function RewriteStep({ problemName, rewrittenStory, onChange, ageMode }: RewriteStepProps) {
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
          borderLeft: "3px solid rgba(107, 160, 196, 0.3)",
        }}
      >
        <p style={{ fontSize: 13, lineHeight: 1.7, margin: 0, color: "rgba(244, 232, 208, 0.75)" }}>
          {labels.rewritePrompt}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          textAlign: "center",
          padding: "12px 16px",
          background: "rgba(107, 160, 196, 0.06)",
          borderRadius: 12,
          border: "1px solid rgba(107, 160, 196, 0.12)",
        }}
      >
        <p style={{ fontSize: 12, color: "rgba(244, 232, 208, 0.5)", margin: 0 }}>
          ✍️ You've named "{problemName}", heard its voice, found times you won, and discovered your strengths. Now — write the next chapter.
        </p>
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
            padding: 12,
            background: "rgba(107, 160, 196, 0.06)",
            borderRadius: 12,
          }}
        >
          <p style={{ fontSize: 11, color: "rgba(107, 160, 196, 0.7)", margin: 0 }}>
            📖 Your new chapter is taking shape...
          </p>
        </motion.div>
      )}
    </div>
  );
}
