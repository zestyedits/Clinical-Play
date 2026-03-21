import { useRef } from "react";
import { motion } from "framer-motion";
import html2canvas from "html2canvas";
import type { TrialState } from "./CBTThoughtCourt";
import { COGNITIVE_DISTORTIONS } from "./distortions-data";

interface CaseFileSummaryProps {
  state: TrialState;
  onNewTrial: () => void;
}

export function CaseFileSummary({ state, onNewTrial }: CaseFileSummaryProps) {
  const summaryRef = useRef<HTMLDivElement>(null);

  const caseNumber = `TC-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}${String(new Date().getDate()).padStart(2, "0")}-${String(Date.now()).slice(-5)}`;

  const beliefShift = state.initialBelief - state.finalBelief;
  const significantShift = beliefShift >= 20;

  const handleExport = async () => {
    if (!summaryRef.current) return;
    const canvas = await html2canvas(summaryRef.current, { backgroundColor: "#faf8fc" });
    const link = document.createElement("a");
    link.download = `thought-court-case-file-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const getDistortionName = (id: string): string => {
    const distortion = COGNITIVE_DISTORTIONS.find((d) => d.id === id);
    return distortion ? distortion.name : id;
  };

  const getDistortionIcon = (id: string): string => {
    const distortion = COGNITIVE_DISTORTIONS.find((d) => d.id === id);
    return distortion ? distortion.icon : "";
  };

  const beliefBarStyle = (value: number, color: string): React.CSSProperties => ({
    height: 14,
    borderRadius: 7,
    background: "#ebe4f0",
    width: "100%",
    position: "relative",
    overflow: "hidden",
  });

  const beliefFillStyle = (value: number, color: string): React.CSSProperties => ({
    height: "100%",
    width: `${value}%`,
    borderRadius: 7,
    background: color,
    transition: "width 0.6s ease",
  });

  const sectionStyle: React.CSSProperties = {
    borderBottom: "1px solid rgba(212, 168, 83, 0.2)",
    paddingBottom: 16,
    marginBottom: 16,
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "'Georgia', 'Times New Roman', serif",
    fontSize: 13,
    color: "#d4a853",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 6,
    fontWeight: 600,
  };

  const bodyTextStyle: React.CSSProperties = {
    fontFamily: "'Georgia', 'Times New Roman', serif",
    fontSize: 15,
    color: "#3a3228",
    lineHeight: 1.6,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        width: "100%",
        maxWidth: 720,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      {/* Printable Summary Area */}
      <div
        ref={summaryRef}
        style={{
          background: "#faf8fc",
          borderRadius: 12,
          border: "2px solid rgba(212, 168, 83, 0.4)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #faf8fc, #ebe4f4)",
            padding: "clamp(16px, 3vw, 28px) clamp(16px, 3vw, 28px) 20px",
            borderBottom: "2px solid rgba(212, 168, 83, 0.4)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 36, marginBottom: 8 }}>{"\u2696\uFE0F"}</div>
          <h2
            style={{
              fontFamily: "'Georgia', 'Times New Roman', serif",
              fontSize: 26,
              color: "#d4a853",
              margin: 0,
              letterSpacing: 4,
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            Official Case File
          </h2>
          <div
            style={{
              fontFamily: "'Georgia', 'Times New Roman', serif",
              fontSize: 12,
              color: "rgba(58, 48, 38, 0.5)",
              marginTop: 6,
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            Thought Court Proceedings
          </div>
          <div
            style={{
              fontSize: 40,
              position: "relative",
              marginTop: 4,
              opacity: 0.15,
              lineHeight: 1,
            }}
          >
            {"\uD83D\uDCDC"}
          </div>
        </div>

        {/* Document Body */}
        <div style={{ padding: "clamp(16px, 3vw, 24px) clamp(16px, 3vw, 28px)" }}>
          {/* Case Number */}
          <div style={sectionStyle}>
            <div style={labelStyle}>Case Number</div>
            <div
              style={{
                ...bodyTextStyle,
                fontSize: 17,
                fontWeight: 700,
                color: "#d4a853",
                fontFamily: "'Courier New', monospace",
              }}
            >
              {caseNumber}
            </div>
          </div>

          {/* The Accusation */}
          <div style={sectionStyle}>
            <div style={labelStyle}>The Accusation</div>
            <div
              style={{
                ...bodyTextStyle,
                background: "rgba(139, 92, 246, 0.08)",
                padding: "12px 16px",
                borderRadius: 8,
                borderLeft: "3px solid #d4a853",
              }}
            >
              <div style={{ fontStyle: "italic", marginBottom: state.situation ? 8 : 0 }}>
                "{state.originalThought}"
              </div>
              {state.situation && (
                <div style={{ fontSize: 13, color: "rgba(58, 48, 38, 0.6)" }}>
                  Situation: {state.situation}
                </div>
              )}
            </div>
          </div>

          {/* Charges Filed */}
          <div style={sectionStyle}>
            <div style={labelStyle}>Charges Filed</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {state.selectedDistortions.map((id) => (
                <span
                  key={id}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "4px 12px",
                    borderRadius: 16,
                    background: "rgba(212, 168, 83, 0.15)",
                    border: "1px solid rgba(212, 168, 83, 0.3)",
                    fontSize: 13,
                    color: "#d4a853",
                    fontFamily: "'Georgia', 'Times New Roman', serif",
                  }}
                >
                  {getDistortionIcon(id)} {getDistortionName(id)}
                </span>
              ))}
            </div>
          </div>

          {/* Initial Belief */}
          <div style={sectionStyle}>
            <div style={labelStyle}>Initial Belief Strength</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={beliefBarStyle(state.initialBelief, "#d4a853")}>
                  <div style={beliefFillStyle(state.initialBelief, "#d4a853")} />
                </div>
              </div>
              <span
                style={{
                  ...bodyTextStyle,
                  fontWeight: 700,
                  minWidth: 42,
                  textAlign: "right",
                }}
              >
                {state.initialBelief}%
              </span>
            </div>
          </div>

          {/* Prosecution Evidence */}
          <div style={sectionStyle}>
            <div style={{ ...labelStyle, color: "#e57373" }}>
              Prosecution Evidence (Supporting the Thought)
            </div>
            {state.evidenceFor.length > 0 ? (
              <ol
                style={{
                  ...bodyTextStyle,
                  margin: 0,
                  paddingLeft: 20,
                  listStyleType: "decimal",
                }}
              >
                {state.evidenceFor.map((item, i) => (
                  <li
                    key={i}
                    style={{
                      marginBottom: 6,
                      paddingLeft: 4,
                      color: "#3a3228",
                    }}
                  >
                    <span style={{ borderLeft: "2px solid #e57373", paddingLeft: 8 }}>
                      {item}
                    </span>
                  </li>
                ))}
              </ol>
            ) : (
              <div style={{ ...bodyTextStyle, fontStyle: "italic", opacity: 0.5 }}>
                No prosecution evidence presented
              </div>
            )}
          </div>

          {/* Defense Evidence */}
          <div style={sectionStyle}>
            <div style={{ ...labelStyle, color: "#81c784" }}>
              Defense Evidence (Against the Thought)
            </div>
            {state.evidenceAgainst.length > 0 ? (
              <ol
                style={{
                  ...bodyTextStyle,
                  margin: 0,
                  paddingLeft: 20,
                  listStyleType: "decimal",
                }}
              >
                {state.evidenceAgainst.map((item, i) => (
                  <li
                    key={i}
                    style={{
                      marginBottom: 6,
                      paddingLeft: 4,
                      color: "#3a3228",
                    }}
                  >
                    <span style={{ borderLeft: "2px solid #81c784", paddingLeft: 8 }}>
                      {item}
                    </span>
                  </li>
                ))}
              </ol>
            ) : (
              <div style={{ ...bodyTextStyle, fontStyle: "italic", opacity: 0.5 }}>
                No defense evidence presented
              </div>
            )}
          </div>

          {/* The Verdict */}
          <div style={sectionStyle}>
            <div style={labelStyle}>The Verdict</div>
            <div
              style={{
                ...bodyTextStyle,
                background: "rgba(139, 92, 246, 0.08)",
                padding: "12px 16px",
                borderRadius: 8,
              }}
            >
              {state.evidenceAgainst.length > state.evidenceFor.length
                ? "The defense presented stronger evidence. The original thought was found to contain significant distortions and does not fully reflect reality."
                : state.evidenceAgainst.length === state.evidenceFor.length
                  ? "Both sides presented equal evidence. The thought may contain partial truths but also significant distortions worth examining."
                  : "While the prosecution presented more evidence, the defense raised important counterpoints that challenge the absolute nature of the original thought."}
            </div>
          </div>

          {/* The Appeal (Reframed Thought) */}
          <div style={sectionStyle}>
            <div style={labelStyle}>The Appeal (Reframed Thought)</div>
            <div
              style={{
                ...bodyTextStyle,
                background: "rgba(212, 168, 83, 0.08)",
                padding: "16px 20px",
                borderRadius: 8,
                border: "2px solid rgba(212, 168, 83, 0.5)",
                fontSize: 16,
                fontStyle: "italic",
                textAlign: "center",
                lineHeight: 1.7,
              }}
            >
              "{state.reframedThought}"
            </div>
          </div>

          {/* Final Belief + Before/After Comparison */}
          <div style={{ paddingBottom: 8 }}>
            <div style={labelStyle}>Belief Shift</div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                background: "rgba(139, 92, 246, 0.08)",
                padding: "16px 20px",
                borderRadius: 8,
              }}
            >
              {/* Before */}
              <div>
                <div
                  style={{
                    fontSize: 12,
                    color: "rgba(58, 48, 38, 0.5)",
                    marginBottom: 4,
                    fontFamily: "'Georgia', 'Times New Roman', serif",
                  }}
                >
                  Before
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={beliefBarStyle(state.initialBelief, "#d4a853")}>
                      <div style={beliefFillStyle(state.initialBelief, "#d4a853")} />
                    </div>
                  </div>
                  <span style={{ ...bodyTextStyle, fontWeight: 700, minWidth: 42, textAlign: "right" }}>
                    {state.initialBelief}%
                  </span>
                </div>
              </div>

              {/* Arrow */}
              <div
                style={{
                  textAlign: "center",
                  fontSize: 20,
                  color: beliefShift > 0 ? "#81c784" : beliefShift < 0 ? "#e57373" : "#d4a853",
                }}
              >
                {"\u2193"}
              </div>

              {/* After */}
              <div>
                <div
                  style={{
                    fontSize: 12,
                    color: "rgba(58, 48, 38, 0.5)",
                    marginBottom: 4,
                    fontFamily: "'Georgia', 'Times New Roman', serif",
                  }}
                >
                  After
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={beliefBarStyle(state.finalBelief, beliefShift > 0 ? "#81c784" : beliefShift < 0 ? "#e57373" : "#d4a853")}>
                      <div
                        style={beliefFillStyle(
                          state.finalBelief,
                          beliefShift > 0 ? "#81c784" : beliefShift < 0 ? "#e57373" : "#d4a853",
                        )}
                      />
                    </div>
                  </div>
                  <span style={{ ...bodyTextStyle, fontWeight: 700, minWidth: 42, textAlign: "right" }}>
                    {state.finalBelief}%
                  </span>
                </div>
              </div>

              {/* Shift Summary */}
              <div
                style={{
                  textAlign: "center",
                  fontSize: 14,
                  fontFamily: "'Georgia', 'Times New Roman', serif",
                  color: beliefShift > 0 ? "#81c784" : beliefShift < 0 ? "#e57373" : "rgba(58, 48, 38, 0.6)",
                  fontWeight: 600,
                  marginTop: 4,
                }}
              >
                {beliefShift > 0
                  ? `Belief decreased by ${beliefShift} points`
                  : beliefShift < 0
                    ? `Belief increased by ${Math.abs(beliefShift)} points`
                    : "No change in belief"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Celebration Message */}
      {significantShift && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, type: "spring", stiffness: 120 }}
          style={{
            textAlign: "center",
            padding: "16px 20px",
            background: "linear-gradient(135deg, rgba(129, 199, 132, 0.15), rgba(212, 168, 83, 0.15))",
            borderRadius: 10,
            border: "1px solid rgba(129, 199, 132, 0.3)",
          }}
        >
          <div style={{ fontSize: 24, marginBottom: 6 }}>{"\u2728"}</div>
          <div
            style={{
              fontFamily: "'Georgia', 'Times New Roman', serif",
              fontSize: 16,
              color: "#81c784",
              fontWeight: 600,
              lineHeight: 1.5,
            }}
          >
            Significant shift! Great work challenging this thought.
          </div>
          <div
            style={{
              fontFamily: "'Georgia', 'Times New Roman', serif",
              fontSize: 13,
              color: "rgba(58, 48, 38, 0.6)",
              marginTop: 4,
            }}
          >
            A {beliefShift}-point decrease shows real progress in examining your thinking patterns.
          </div>
        </motion.div>
      )}

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleExport}
          style={{
            padding: "12px 28px",
            borderRadius: 8,
            border: "none",
            background: "linear-gradient(135deg, #d4a853, #b8922e)",
            color: "#1e1a2e",
            fontSize: 15,
            fontWeight: 700,
            fontFamily: "'Georgia', 'Times New Roman', serif",
            cursor: "pointer",
            letterSpacing: 1,
          }}
        >
          Save Case File
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onNewTrial}
          style={{
            padding: "12px 28px",
            borderRadius: 8,
            border: "2px solid rgba(212, 168, 83, 0.4)",
            background: "transparent",
            color: "#d4a853",
            fontSize: 15,
            fontWeight: 600,
            fontFamily: "'Georgia', 'Times New Roman', serif",
            cursor: "pointer",
            letterSpacing: 1,
          }}
        >
          New Trial
        </motion.button>
      </div>
    </motion.div>
  );
}
