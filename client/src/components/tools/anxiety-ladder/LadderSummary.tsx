import { motion } from "framer-motion";
import type { AgeMode, AnxietyCategory, ConfidenceLevel, LadderRung } from "./ladder-data";
import { ANXIETY_CATEGORIES, COPING_TOOLS, getSudsColor } from "./ladder-data";

interface LadderSummaryProps {
  ageMode: AgeMode;
  fearTopic: string;
  anxietyCategory: AnxietyCategory | null;
  currentSUDS: number;
  bodyDescription: string;
  rungs: LadderRung[];
  selectedTools: string[];
  customTool: string;
  whenWhere: string;
  support: string;
  selfTalk: string;
  sudsGoal: number;
  commitmentText: string;
  selfCompassion: string;
  confidenceLevel: ConfidenceLevel | null;
  onReset: () => void;
}

const CONFIDENCE_LABELS: Record<ConfidenceLevel, string> = {
  "need-more-time": "\uD83D\uDD52 Need more time",
  "nervous-but-ready": "\uD83D\uDCAA Nervous but ready",
  ready: "\u2B50 Ready to try",
};

export function LadderSummary({
  ageMode,
  fearTopic,
  anxietyCategory,
  currentSUDS,
  rungs,
  selectedTools,
  customTool,
  whenWhere,
  support,
  selfTalk,
  sudsGoal,
  commitmentText,
  selfCompassion,
  confidenceLevel,
  onReset,
}: LadderSummaryProps) {
  const sortedRungs = [...rungs].sort((a, b) => a.suds - b.suds);
  const categoryInfo = anxietyCategory
    ? ANXIETY_CATEGORIES.find((c) => c.id === anxietyCategory)
    : null;
  const selectedToolLabels = COPING_TOOLS.filter((t) => selectedTools.includes(t.id)).map((t) => t.label);

  return (
    <div
      style={{
        maxWidth: 560,
        margin: "0 auto",
        padding: "20px 16px 32px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div
        style={{
          position: "relative",
          textAlign: "center",
          padding: "20px 16px",
          borderRadius: 16,
          background: "linear-gradient(135deg, rgba(100,168,212,0.08) 0%, rgba(10,14,24,0.95) 100%)",
          border: "1px solid rgba(100, 168, 212, 0.2)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 100,
            background: "radial-gradient(ellipse at 50% 0%, rgba(100,168,212,0.1), transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 12 }}
          style={{ fontSize: 48, marginBottom: 8, filter: "drop-shadow(0 4px 12px rgba(100,168,212,0.3))" }}
        >
          {"\uD83E\uDE9C"}
        </motion.div>
        <h2
          style={{
            margin: "0 0 4px",
            fontSize: 22,
            fontWeight: 700,
            fontFamily: "'Lora', Georgia, serif",
            background: "linear-gradient(135deg, #7ab8e0, #a8d0f0)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Your Anxiety Ladder
        </h2>
        <div style={{ fontSize: 11, color: "rgba(232, 220, 200, 0.35)", marginTop: 2 }}>
          {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.15 }}
        style={{
          padding: "12px 14px",
          borderRadius: 12,
          background: "rgba(100, 168, 212, 0.07)",
          border: "1px solid rgba(100, 168, 212, 0.15)",
        }}
      >
        <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(232, 220, 200, 0.4)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
          Fear Topic
        </div>
        <div style={{ fontSize: 15, fontWeight: 600, color: "#e8dcc8", marginBottom: categoryInfo ? 4 : 0 }}>
          {fearTopic}
        </div>
        {categoryInfo && (
          <div style={{ fontSize: 12, color: "rgba(232, 220, 200, 0.45)" }}>
            {categoryInfo.emoji} {categoryInfo.label}
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
      >
        <div style={{ fontSize: 12, fontWeight: 700, color: "#64a8d4", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
          <span>{"\uD83E\uDE9C"}</span> Exposure Ladder ({sortedRungs.length} rungs)
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {[...sortedRungs].reverse().map((rung, reversedIdx) => {
            const rungNumber = sortedRungs.length - reversedIdx;
            const rungColor = getSudsColor(rung.suds);
            return (
              <div
                key={rung.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0,
                  marginBottom: 4,
                }}
              >
                <div
                  style={{
                    width: 24,
                    textAlign: "center",
                    fontSize: 10,
                    fontWeight: 700,
                    color: "rgba(232, 220, 200, 0.3)",
                    flexShrink: 0,
                  }}
                >
                  {rungNumber}
                </div>
                <div
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    borderRadius: 8,
                    borderLeft: `3px solid ${rungColor}`,
                    background: `${rungColor}08`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                  }}
                >
                  <span style={{ fontSize: 12, color: "rgba(232, 220, 200, 0.8)", flex: 1 }}>
                    {rung.description}
                  </span>
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: 10,
                      background: `${rungColor}20`,
                      color: rungColor,
                      fontSize: 11,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {rung.suds}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
      >
        <div style={{ fontSize: 12, fontWeight: 700, color: "#d4a24c", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
          <span>{"\uD83E\uDDF0"}</span> Coping Toolkit
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {selectedToolLabels.map((label) => (
            <span
              key={label}
              style={{
                padding: "4px 10px",
                borderRadius: 14,
                background: "rgba(212, 162, 76, 0.1)",
                border: "1px solid rgba(212, 162, 76, 0.2)",
                color: "#d4a24c",
                fontSize: 11,
                fontWeight: 500,
              }}
            >
              {label}
            </span>
          ))}
          {customTool.trim().length > 0 && (
            <span
              style={{
                padding: "4px 10px",
                borderRadius: 14,
                background: "rgba(212, 162, 76, 0.07)",
                border: "1px dashed rgba(212, 162, 76, 0.2)",
                color: "rgba(212, 162, 76, 0.7)",
                fontSize: 11,
              }}
            >
              {customTool}
            </span>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45 }}
        style={{
          padding: "12px 14px",
          borderRadius: 12,
          background: "rgba(128, 144, 212, 0.06)",
          border: "1px solid rgba(128, 144, 212, 0.12)",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 700, color: "#8090d4", marginBottom: 2, display: "flex", alignItems: "center", gap: 6 }}>
          <span>{"\uD83D\uDCCB"}</span> Practice Plan
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(232, 220, 200, 0.35)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 2 }}>
            When &amp; Where
          </div>
          <div style={{ fontSize: 13, color: "rgba(232, 220, 200, 0.75)" }}>{whenWhere}</div>
        </div>
        {support.trim().length > 0 && (
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(232, 220, 200, 0.35)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 2 }}>
              Support
            </div>
            <div style={{ fontSize: 13, color: "rgba(232, 220, 200, 0.75)" }}>{support}</div>
          </div>
        )}
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(232, 220, 200, 0.35)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 2 }}>
            Self-talk
          </div>
          <div style={{ fontSize: 13, color: "rgba(232, 220, 200, 0.75)", fontStyle: "italic" }}>&ldquo;{selfTalk}&rdquo;</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(232, 220, 200, 0.35)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            SUDS Goal
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: getSudsColor(sudsGoal) }}>
            {sudsGoal}
          </span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
        style={{
          padding: "12px 14px",
          borderRadius: 12,
          background: "rgba(196, 176, 76, 0.05)",
          border: "1px solid rgba(196, 176, 76, 0.12)",
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 700, color: "#c4b04c", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
          <span>{"\u2B50"}</span> Commitment
        </div>
        <p style={{ margin: "0 0 8px", fontSize: 13, color: "rgba(232, 220, 200, 0.8)", lineHeight: 1.6 }}>
          {commitmentText}
        </p>
        <p style={{ margin: "0 0 8px", fontSize: 12, color: "rgba(232, 220, 200, 0.5)", fontStyle: "italic", lineHeight: 1.6 }}>
          &ldquo;{selfCompassion}&rdquo;
        </p>
        {confidenceLevel && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 10px",
              borderRadius: 20,
              background: "rgba(196, 176, 76, 0.1)",
              fontSize: 12,
              color: "#c4b04c",
              fontWeight: 600,
            }}
          >
            {CONFIDENCE_LABELS[confidenceLevel]}
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
        style={{
          textAlign: "center",
          padding: "12px",
          borderRadius: 12,
          background: "rgba(96, 196, 128, 0.06)",
          border: "1px solid rgba(96, 196, 128, 0.12)",
          marginBottom: 8,
        }}
      >
        <div style={{ fontSize: 20, marginBottom: 4 }}>{"\uD83D\uDCAA"}</div>
        <p style={{ margin: 0, fontSize: 13, color: "#60c480", fontWeight: 600 }}>
          You've got this!
        </p>
        <p style={{ margin: "4px 0 0", fontSize: 11, color: "rgba(232, 220, 200, 0.4)" }}>
          {ageMode === "child"
            ? "Every brave step makes the next one easier."
            : "Every exposure you complete makes your fear a little smaller."}
        </p>
      </motion.div>

      <div style={{ textAlign: "center" }}>
        <motion.button
          onClick={onReset}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          style={{
            padding: "10px 24px",
            borderRadius: 12,
            background: "rgba(100, 168, 212, 0.08)",
            border: "1px solid rgba(100, 168, 212, 0.2)",
            color: "#64a8d4",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "Inter, sans-serif",
          }}
        >
          {"\uD83E\uDE9C"} Start Fresh
        </motion.button>
      </div>
    </div>
  );
}
