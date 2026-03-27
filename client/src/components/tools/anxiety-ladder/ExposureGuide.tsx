import { AnimatePresence, motion } from "framer-motion";

interface ExposureGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const PARCHMENT = "#e8dcc8";
const BG = "#0a0e18";
const ACCENT = "#64a8d4";

const SECTIONS = [
  {
    id: "what",
    icon: "\uD83E\uDE9C",
    title: "What is Exposure Therapy?",
    color: "#64a8d4",
    body: "Exposure therapy is one of the most effective, evidence-based treatments for anxiety. It works by gradually and safely facing feared situations instead of avoiding them. Avoidance keeps anxiety strong \u2014 each time we avoid, we teach our brain the situation is dangerous. Exposure teaches your brain the truth: anxiety rises, peaks, and falls on its own.",
  },
  {
    id: "suds",
    icon: "\uD83D\uDCCA",
    title: "The SUDS Scale",
    color: "#60c480",
    body: "SUDS stands for Subjective Units of Distress Scale. It measures anxiety from 0 (completely calm) to 100 (extreme panic). Using SUDS helps you track your anxiety during exposures. You'll usually notice it rises at first, then comes down as you stay with the situation. This natural reduction is called habituation.",
  },
  {
    id: "ladder",
    icon: "\uD83D\uDCC8",
    title: "How the Ladder Works",
    color: "#d4a24c",
    body: "The fear hierarchy (or ladder) lists situations from least to most anxiety-provoking. You start at the bottom \u2014 easier situations \u2014 and work your way up as your confidence grows. Each completed rung proves to your brain that you can handle anxiety. Over time, your SUDS ratings for each situation will decrease.",
  },
  {
    id: "tips",
    icon: "\uD83D\uDCAA",
    title: "Tips for Success",
    color: "#c4b04c",
    body: "Stay in the situation until your anxiety drops by at least 50% or to a manageable level. Don't use \"safety behaviours\" (checking phone, sitting near exits) as they reduce the effectiveness. Practice regularly \u2014 even short daily exposures work better than occasional long ones. Be kind to yourself \u2014 setbacks are normal and part of the process.",
  },
];

export function ExposureGuide({ isOpen, onClose }: ExposureGuideProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="exposure-guide-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(6px)",
            zIndex: 60,
            padding: 16,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            key="exposure-guide-modal"
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            style={{
              background: `linear-gradient(180deg, ${BG} 0%, #060810 100%)`,
              borderRadius: 18,
              maxWidth: 520,
              width: "100%",
              maxHeight: "90vh",
              border: "1px solid rgba(100, 168, 212, 0.25)",
              boxShadow:
                "0 24px 80px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05) inset, 0 0 40px rgba(100, 168, 212, 0.1)",
              fontFamily: "Inter, sans-serif",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column" as const,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "18px 22px",
                borderBottom: "1px solid rgba(100, 168, 212, 0.15)",
                flexShrink: 0,
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: 18,
                  fontWeight: 700,
                  color: PARCHMENT,
                  letterSpacing: "-0.01em",
                }}
              >
                {"\uD83E\uDE9C"} Exposure Therapy Guide
              </h2>
              <button
                onClick={onClose}
                aria-label="Close guide"
                style={{
                  minWidth: 44,
                  minHeight: 44,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(255, 255, 255, 0.06)",
                  border: `1px solid rgba(100, 168, 212, 0.2)`,
                  borderRadius: 8,
                  color: "rgba(232, 220, 200, 0.6)",
                  fontSize: 18,
                  cursor: "pointer",
                  transition: "background 0.15s, color 0.15s",
                  fontFamily: "Inter, sans-serif",
                  lineHeight: 1,
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.12)";
                  e.currentTarget.style.color = "rgba(232, 220, 200, 0.9)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)";
                  e.currentTarget.style.color = "rgba(232, 220, 200, 0.6)";
                }}
              >
                {"\u00D7"}
              </button>
            </div>

            <div
              style={{
                overflowY: "auto" as const,
                flex: 1,
                padding: "16px 22px 22px",
                display: "flex",
                flexDirection: "column" as const,
                gap: 14,
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  lineHeight: 1.7,
                  color: "rgba(232, 220, 200, 0.75)",
                }}
              >
                Exposure therapy is backed by decades of research and is the gold-standard
                treatment for anxiety disorders including phobias, social anxiety, OCD, and PTSD.
                This tool helps you apply its core principles in a structured, self-guided way.
              </p>

              {SECTIONS.map((section) => (
                <div
                  key={section.id}
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(10, 14, 24, 0.9) 0%, rgba(8, 12, 20, 0.95) 100%)",
                    borderRadius: 14,
                    padding: "16px 18px",
                    border: `1px solid ${section.color}20`,
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 10,
                    }}
                  >
                    <span style={{ fontSize: 22 }}>{section.icon}</span>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: 15,
                        fontWeight: 650,
                        color: section.color,
                      }}
                    >
                      {section.title}
                    </h3>
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 13,
                      lineHeight: 1.7,
                      color: "rgba(232, 220, 200, 0.82)",
                    }}
                  >
                    {section.body}
                  </p>
                </div>
              ))}

              <div
                style={{
                  background: `linear-gradient(135deg, ${ACCENT}08 0%, ${ACCENT}04 100%)`,
                  borderRadius: 12,
                  padding: "12px 14px",
                  border: `1px solid ${ACCENT}15`,
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: 12,
                    color: "rgba(212, 162, 76, 0.55)",
                    fontWeight: 600,
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.05em",
                    marginBottom: 4,
                  }}
                >
                  Important Note
                </p>
                <p style={{ margin: 0, fontSize: 12, lineHeight: 1.6, color: "rgba(232, 220, 200, 0.65)" }}>
                  This tool is designed to support therapy, not replace it. If your anxiety is severe or
                  significantly impacts daily functioning, working with a trained therapist is strongly recommended.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
