import { motion } from "framer-motion";
import type { AgeMode } from "./grief-data";

interface ContinuingBondsProps {
  bondStatement: string;
  honorCards: string[];
  onSetBondStatement: (t: string) => void;
  onSetHonorCard: (i: number, t: string) => void;
  ageMode: AgeMode;
}

const HINTS: Record<AgeMode, string> = {
  child:
    "Even though someone is gone, we can still keep them in our hearts. What are some ways you can remember them?",
  teen: "Continuing bonds theory shows that keeping a connection with who we lost is healthy and healing. How will you carry them with you?",
  adult:
    "Continuing Bonds (Klass et al., 1996) emphasizes that maintaining an ongoing inner relationship with the deceased supports healthy grief, rather than severing ties.",
};

const BOND_LABELS: Record<AgeMode, { prompt: string; placeholder: string }> = {
  child: {
    prompt: "How will you keep them in your heart?",
    placeholder: "I will remember them by...",
  },
  teen: {
    prompt: "How will you carry this love forward?",
    placeholder: "I want to keep their memory alive by...",
  },
  adult: {
    prompt: "How will you carry this love and connection forward?",
    placeholder: "I will maintain this continuing bond by...",
  },
};

const HONOR_CARDS: {
  placeholder: Record<AgeMode, string>;
  label: string;
  emoji: string;
}[] = [
  {
    label: "A way to remember",
    emoji: "\uD83C\uDFEE",
    placeholder: {
      child: "Like looking at photos...",
      teen: "e.g. keeping a photo nearby...",
      adult: "e.g. an anniversary ritual...",
    },
  },
  {
    label: "A ritual or tradition",
    emoji: "\uD83C\uDF1F",
    placeholder: {
      child: "Like celebrating their birthday...",
      teen: "e.g. lighting a candle each year...",
      adult: "e.g. visiting a meaningful place...",
    },
  },
  {
    label: "Something they taught me",
    emoji: "\uD83D\uDD6F\uFE0F",
    placeholder: {
      child: "They taught me...",
      teen: "A lesson I'll carry...",
      adult: "A value or wisdom they embodied...",
    },
  },
];

export function ContinuingBonds({
  bondStatement,
  honorCards,
  onSetBondStatement,
  onSetHonorCard,
  ageMode,
}: ContinuingBondsProps) {
  const bondLabel = BOND_LABELS[ageMode];
  const hasEnough =
    bondStatement.trim().length > 0 ||
    honorCards.some((c) => c.trim().length > 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: "rgba(196,154,108,0.05)",
          borderRadius: 12,
          padding: "12px 14px",
          borderLeft: "3px solid rgba(196,154,108,0.25)",
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
        <label style={{ fontSize: 13, fontWeight: 600, color: "#c49a6c" }}>
          {bondLabel.prompt}
        </label>
        <textarea
          value={bondStatement}
          onChange={(e) => onSetBondStatement(e.target.value)}
          rows={4}
          placeholder={bondLabel.placeholder}
          style={{
            width: "100%",
            padding: "12px 14px",
            fontSize: 13,
            fontFamily: "Inter, sans-serif",
            lineHeight: 1.7,
            background: "rgba(232,220,200,0.04)",
            border: "1px solid rgba(196,154,108,0.18)",
            borderRadius: 10,
            color: "#e8dcc8",
            outline: "none",
            resize: "vertical",
            minHeight: 96,
            boxSizing: "border-box",
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "rgba(196,154,108,0.45)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "rgba(196,154,108,0.18)";
          }}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{ display: "flex", flexDirection: "column", gap: 8 }}
      >
        <label style={{ fontSize: 13, fontWeight: 600, color: "#c49a6c" }}>
          Ways to honor and remember:
        </label>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 8,
          }}
        >
          {HONOR_CARDS.map((card, i) => {
            const isFilled = (honorCards[i] ?? "").trim().length > 0;
            return (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + i * 0.08 }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  padding: "12px 10px",
                  borderRadius: 12,
                  background: isFilled
                    ? "rgba(196,154,108,0.08)"
                    : "rgba(232,220,200,0.03)",
                  border: isFilled
                    ? "1px solid rgba(196,154,108,0.3)"
                    : "1px solid rgba(232,220,200,0.08)",
                  transition: "background 0.3s, border-color 0.3s",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 11,
                    color: isFilled ? "#c49a6c" : "rgba(232,220,200,0.4)",
                    fontWeight: 600,
                    transition: "color 0.3s",
                  }}
                >
                  <span style={{ fontSize: 14 }}>{card.emoji}</span>
                  {card.label}
                </div>
                <textarea
                  value={honorCards[i] ?? ""}
                  onChange={(e) => onSetHonorCard(i, e.target.value)}
                  rows={2}
                  placeholder={card.placeholder[ageMode]}
                  style={{
                    width: "100%",
                    padding: "7px 8px",
                    fontSize: 11,
                    fontFamily: "Inter, sans-serif",
                    lineHeight: 1.55,
                    background: "rgba(232,220,200,0.04)",
                    border: "1px solid rgba(196,154,108,0.12)",
                    borderRadius: 7,
                    color: "#e8dcc8",
                    outline: "none",
                    resize: "none",
                    minHeight: 50,
                    boxSizing: "border-box",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "rgba(196,154,108,0.35)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "rgba(196,154,108,0.12)";
                  }}
                />
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {!hasEnough && (
        <p
          style={{
            margin: 0,
            fontSize: 11,
            color: "rgba(232,220,200,0.28)",
            textAlign: "center",
          }}
        >
          Fill in at least one field above to continue
        </p>
      )}
    </div>
  );
}
