import { motion } from "framer-motion";
import type { AgeMode, LetterRecipient } from "./grief-data";
import { LETTER_RECIPIENTS } from "./grief-data";

interface LetterStepProps {
  recipient: LetterRecipient | null;
  letterBody: string;
  onSetRecipient: (r: LetterRecipient) => void;
  onSetLetter: (t: string) => void;
  ageMode: AgeMode;
}

const HINTS: Record<AgeMode, string> = {
  child: "Sometimes it helps to write down things we wish we could say. There are no wrong words.",
  teen: "Writing a letter can help release feelings that are hard to say out loud. No one needs to see this unless you want to share.",
  adult:
    "Letter writing is a well-established grief intervention. Choose who this letter is addressed to, then write freely.",
};

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function LetterStep({
  recipient,
  letterBody,
  onSetRecipient,
  onSetLetter,
  ageMode,
}: LetterStepProps) {
  const activeRecipient = LETTER_RECIPIENTS.find((r) => r.id === recipient);
  const charCount = letterBody.trim().length;
  const words = wordCount(letterBody);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: "rgba(212,180,76,0.05)",
          borderRadius: 12,
          padding: "12px 14px",
          borderLeft: "3px solid rgba(212,180,76,0.25)",
        }}
      >
        <p style={{ margin: 0, fontSize: 13, color: "rgba(232,220,200,0.65)", lineHeight: 1.65 }}>
          {HINTS[ageMode]}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ display: "flex", flexDirection: "column", gap: 8 }}
      >
        <label style={{ fontSize: 13, fontWeight: 600, color: "#d4b44c" }}>
          Who is this letter addressed to?
        </label>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 8,
          }}
        >
          {LETTER_RECIPIENTS.map((r, i) => {
            const isSelected = recipient === r.id;
            return (
              <motion.button
                key={r.id}
                type="button"
                onClick={() => onSetRecipient(r.id)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 + i * 0.06 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: isSelected
                    ? "1.5px solid rgba(212,180,76,0.5)"
                    : "1px solid rgba(232,220,200,0.08)",
                  background: isSelected
                    ? "rgba(212,180,76,0.12)"
                    : "rgba(232,220,200,0.03)",
                  color: isSelected ? "#d4b44c" : "rgba(232,220,200,0.55)",
                  fontSize: 12,
                  fontWeight: isSelected ? 600 : 400,
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                  textAlign: "left",
                  outline: "none",
                  transition: "all 0.2s",
                }}
              >
                <span style={{ fontSize: 18, flexShrink: 0 }}>{r.emoji}</span>
                <span style={{ lineHeight: 1.3 }}>{r.label}</span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {recipient && (
        <motion.div
          key={recipient}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{ display: "flex", flexDirection: "column", gap: 6 }}
        >
          <div
            style={{
              fontSize: 12,
              color: "rgba(212,180,76,0.7)",
              fontStyle: "italic",
              paddingLeft: 2,
            }}
          >
            {activeRecipient?.prompt}
          </div>
          <textarea
            value={letterBody}
            onChange={(e) => onSetLetter(e.target.value)}
            rows={8}
            placeholder="Dear..."
            style={{
              width: "100%",
              padding: "14px 16px",
              fontSize: 14,
              fontFamily: "'Lora', Georgia, serif",
              lineHeight: 1.8,
              background: "rgba(30,25,15,0.6)",
              border: "1px solid rgba(196,154,108,0.2)",
              borderRadius: 12,
              color: "#e8dcc8",
              outline: "none",
              resize: "vertical",
              minHeight: 180,
              boxSizing: "border-box",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "rgba(212,180,76,0.4)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "rgba(196,154,108,0.2)";
            }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: 11,
                color:
                  charCount >= 50
                    ? "rgba(212,180,76,0.6)"
                    : "rgba(232,220,200,0.25)",
              }}
            >
              {words} {words === 1 ? "word" : "words"}
            </span>
            {charCount < 50 && (
              <span style={{ fontSize: 11, color: "rgba(232,220,200,0.25)" }}>
                Write at least a short letter to continue
              </span>
            )}
          </div>
        </motion.div>
      )}

      {!recipient && (
        <p
          style={{
            margin: 0,
            fontSize: 11,
            color: "rgba(232,220,200,0.28)",
            textAlign: "center",
          }}
        >
          Choose a recipient above to begin writing
        </p>
      )}
    </div>
  );
}
