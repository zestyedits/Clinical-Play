import { motion } from "framer-motion";
import type { AgeMode, GriefEmotion, LossType, LetterRecipient, Memory } from "./grief-data";
import { LOSS_TYPES, GRIEF_EMOTIONS, LETTER_RECIPIENTS } from "./grief-data";

interface JourneySummaryProps {
  lossTopic: string;
  lossType: LossType | null;
  selectedEmotions: GriefEmotion[];
  customEmotion: string;
  memories: Memory[];
  recipient: LetterRecipient | null;
  letterBody: string;
  whatTaught: string;
  howChanged: string;
  whatTheyWant: string;
  bondStatement: string;
  honorCards: string[];
  ageMode: AgeMode;
  onReset: () => void;
}

const CLOSING: Record<AgeMode, string> = {
  child:
    "You have done something very brave today. Talking about our feelings helps us carry them better. They are always in your heart.",
  teen: "You showed up for yourself today. Grief is not linear, and there is no right way to do it. Come back to this journey whenever you need.",
  adult:
    "You have moved through all four of Worden's Tasks of Mourning in this session. Remember: grief does not end, it transforms. The continuing bond you described is a healthy and enduring part of who you are.",
};

export function JourneySummary({
  lossTopic,
  lossType,
  selectedEmotions,
  customEmotion,
  memories,
  recipient,
  letterBody,
  whatTaught,
  howChanged,
  whatTheyWant,
  bondStatement,
  honorCards,
  ageMode,
  onReset,
}: JourneySummaryProps) {
  const lossTypeData = LOSS_TYPES.find((l) => l.id === lossType);
  const recipientData = LETTER_RECIPIENTS.find((r) => r.id === recipient);
  const filledHonorCards = honorCards.filter((c) => c.trim().length > 0);

  return (
    <div style={{ position: "relative" }}>
      <style>{`
        @keyframes gj-float-up {
          0% { transform: translateY(0) rotate(-5deg); opacity: 0.8; }
          100% { transform: translateY(-60px) rotate(5deg); opacity: 0; }
        }
        @keyframes gj-float-up-2 {
          0% { transform: translateY(0) rotate(3deg); opacity: 0.7; }
          100% { transform: translateY(-70px) rotate(-8deg); opacity: 0; }
        }
        @keyframes gj-float-up-3 {
          0% { transform: translateY(0) rotate(0deg); opacity: 0.6; }
          100% { transform: translateY(-55px) rotate(10deg); opacity: 0; }
        }
      `}</style>

      <div
        style={{
          position: "relative",
          height: 70,
          marginBottom: 4,
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        <span
          style={{
            position: "absolute",
            left: "35%",
            bottom: 0,
            fontSize: 28,
            animation: "gj-float-up 2.8s ease-out infinite",
          }}
        >
          {"\uD83C\uDFEE"}
        </span>
        <span
          style={{
            position: "absolute",
            left: "50%",
            bottom: 0,
            fontSize: 22,
            animation: "gj-float-up-2 3.2s ease-out 0.6s infinite",
          }}
        >
          {"\uD83C\uDFEE"}
        </span>
        <span
          style={{
            position: "absolute",
            left: "62%",
            bottom: 0,
            fontSize: 18,
            animation: "gj-float-up-3 2.5s ease-out 1.2s infinite",
          }}
        >
          {"\uD83C\uDFEE"}
        </span>
      </div>

      <div
        style={{
          borderRadius: 16,
          padding: "0 0 24px",
          maxWidth: 520,
          margin: "0 auto",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 120,
            background: "radial-gradient(ellipse at 50% 0%, rgba(196,154,108,0.12), transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 12 }}
          style={{ textAlign: "center", marginBottom: 20, position: "relative" }}
        >
          <div
            style={{
              fontSize: 48,
              marginBottom: 6,
              filter: "drop-shadow(0 4px 16px rgba(196,154,108,0.4))",
            }}
          >
            {"\uD83C\uDFEE"}
          </div>
          <h2
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 700,
              fontFamily: "'Lora', Georgia, serif",
              background: "linear-gradient(135deg, #d4a24c, #e8c06a)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Your Grief Journey
          </h2>
          <div style={{ fontSize: 11, color: "rgba(232, 220, 200, 0.35)", marginTop: 4 }}>
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          style={{
            padding: "12px 14px",
            borderLeft: "3px solid rgba(196,154,108,0.4)",
            borderRadius: 8,
            marginBottom: 14,
            background: "rgba(196,154,108,0.07)",
          }}
        >
          <div
            style={{
              fontSize: 10,
              color: "rgba(232,220,200,0.4)",
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: 0.5,
              marginBottom: 4,
            }}
          >
            {"\uD83D\uDD6F\uFE0F"} The Loss
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#e8dcc8" }}>{lossTopic}</div>
          {lossTypeData && (
            <div style={{ fontSize: 12, color: "rgba(196,154,108,0.65)", marginTop: 3 }}>
              {lossTypeData.emoji} {lossTypeData.label}
            </div>
          )}
        </motion.div>

        {(selectedEmotions.length > 0 || customEmotion.trim()) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            style={{ marginBottom: 14 }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#d47890",
                marginBottom: 8,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span>{"\uD83C\uDFEE"}</span> Feelings Named
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {selectedEmotions.map((eid) => {
                const em = GRIEF_EMOTIONS.find((e) => e.id === eid);
                return (
                  <span
                    key={eid}
                    style={{
                      padding: "3px 10px",
                      borderRadius: 14,
                      background: `${em?.color ?? "#d47890"}15`,
                      border: `1px solid ${em?.color ?? "#d47890"}25`,
                      color: em?.color ?? "#d47890",
                      fontSize: 11,
                      fontWeight: 500,
                    }}
                  >
                    {em?.label ?? eid}
                  </span>
                );
              })}
              {customEmotion.trim() && (
                <span
                  style={{
                    padding: "3px 10px",
                    borderRadius: 14,
                    background: "rgba(232,220,200,0.08)",
                    border: "1px solid rgba(232,220,200,0.15)",
                    color: "rgba(232,220,200,0.7)",
                    fontSize: 11,
                    fontWeight: 500,
                  }}
                >
                  {customEmotion}
                </span>
              )}
            </div>
          </motion.div>
        )}

        {memories.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            style={{ marginBottom: 14 }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#80c49a",
                marginBottom: 8,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span>{"\uD83C\uDF39"}</span> Memories Honoured
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {memories.map((m) => (
                <div
                  key={m.id}
                  style={{
                    fontSize: 12,
                    color: "rgba(232,220,200,0.65)",
                    paddingLeft: 10,
                    borderLeft: "2px solid rgba(128,196,154,0.2)",
                    lineHeight: 1.5,
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      color: "rgba(128,196,154,0.5)",
                      fontWeight: 500,
                      marginRight: 4,
                    }}
                  >
                    I remember when...
                  </span>
                  {m.text}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {recipientData && letterBody.trim() && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            style={{ marginBottom: 14 }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#d4b44c",
                marginBottom: 8,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span>{"\u270D\uFE0F"}</span> A Letter {recipientData.label}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "rgba(232,220,200,0.6)",
                fontFamily: "'Lora', Georgia, serif",
                lineHeight: 1.7,
                padding: "10px 12px",
                background: "rgba(30,25,15,0.4)",
                borderRadius: 8,
                border: "1px solid rgba(196,154,108,0.12)",
                maxHeight: 120,
                overflow: "hidden",
                position: "relative",
              }}
            >
              {letterBody.length > 300 ? letterBody.slice(0, 300) + "..." : letterBody}
            </div>
          </motion.div>
        )}

        {(whatTaught.trim() || howChanged.trim() || whatTheyWant.trim()) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            style={{ marginBottom: 14 }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#a090d4",
                marginBottom: 8,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span>{"\uD83D\uDCAB"}</span> Meaning Found
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {whatTaught.trim() && (
                <div
                  style={{
                    fontSize: 12,
                    color: "rgba(232,220,200,0.65)",
                    paddingLeft: 10,
                    borderLeft: "2px solid rgba(160,144,212,0.2)",
                    lineHeight: 1.5,
                  }}
                >
                  <span
                    style={{
                      display: "block",
                      fontSize: 10,
                      color: "rgba(160,144,212,0.5)",
                      marginBottom: 2,
                    }}
                  >
                    What it taught me:
                  </span>
                  {whatTaught}
                </div>
              )}
              {howChanged.trim() && (
                <div
                  style={{
                    fontSize: 12,
                    color: "rgba(232,220,200,0.65)",
                    paddingLeft: 10,
                    borderLeft: "2px solid rgba(160,144,212,0.2)",
                    lineHeight: 1.5,
                  }}
                >
                  <span
                    style={{
                      display: "block",
                      fontSize: 10,
                      color: "rgba(160,144,212,0.5)",
                      marginBottom: 2,
                    }}
                  >
                    How I have changed:
                  </span>
                  {howChanged}
                </div>
              )}
              {whatTheyWant.trim() && (
                <div
                  style={{
                    fontSize: 12,
                    color: "rgba(232,220,200,0.65)",
                    paddingLeft: 10,
                    borderLeft: "2px solid rgba(160,144,212,0.2)",
                    lineHeight: 1.5,
                  }}
                >
                  <span
                    style={{
                      display: "block",
                      fontSize: 10,
                      color: "rgba(160,144,212,0.5)",
                      marginBottom: 2,
                    }}
                  >
                    What they would want for me:
                  </span>
                  {whatTheyWant}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {(bondStatement.trim() || filledHonorCards.length > 0) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65 }}
            style={{ marginBottom: 20 }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#c49a6c",
                marginBottom: 8,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span>{"\uD83C\uDF1F"}</span> Continuing Bonds
            </div>
            {bondStatement.trim() && (
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(232,220,200,0.7)",
                  lineHeight: 1.6,
                  padding: "8px 12px",
                  borderRadius: 8,
                  background: "rgba(196,154,108,0.07)",
                  border: "1px solid rgba(196,154,108,0.15)",
                  marginBottom: 8,
                }}
              >
                {bondStatement}
              </div>
            )}
            {filledHonorCards.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {filledHonorCards.map((card, i) => (
                  <span
                    key={i}
                    style={{
                      padding: "4px 12px",
                      borderRadius: 14,
                      background: "rgba(196,154,108,0.1)",
                      border: "1px solid rgba(196,154,108,0.2)",
                      color: "#c49a6c",
                      fontSize: 11,
                      fontWeight: 500,
                    }}
                  >
                    {card}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75 }}
          style={{
            padding: "14px 16px",
            borderRadius: 12,
            background: "rgba(196,154,108,0.05)",
            border: "1px solid rgba(196,154,108,0.12)",
            marginBottom: 20,
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 13,
              color: "rgba(232,220,200,0.65)",
              lineHeight: 1.7,
              fontStyle: "italic",
              fontFamily: "'Lora', Georgia, serif",
            }}
          >
            {CLOSING[ageMode]}
          </p>
        </motion.div>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <motion.button
            onClick={onReset}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{
              padding: "12px 28px",
              borderRadius: 12,
              background: "rgba(196,154,108,0.1)",
              border: "1px solid rgba(196,154,108,0.25)",
              color: "#c49a6c",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {"\uD83C\uDFEE"} Begin a New Journey
          </motion.button>
        </div>
      </div>
    </div>
  );
}
