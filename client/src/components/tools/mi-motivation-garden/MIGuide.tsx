import { AnimatePresence, motion } from "framer-motion";
import { MI_CONCEPTS } from "./garden-data";

interface MIGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const PARCHMENT = "#e8dcc8";
const BG = "#0a1f14";

export function MIGuide({ isOpen, onClose }: MIGuideProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="mi-guide-overlay"
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
            key="mi-guide-modal"
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            style={{
              background: `linear-gradient(180deg, ${BG} 0%, #061210 100%)`,
              borderRadius: 18,
              maxWidth: 520,
              width: "100%",
              maxHeight: "90vh",
              border: "1px solid rgba(45, 122, 58, 0.25)",
              boxShadow:
                "0 24px 80px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05) inset, 0 0 40px rgba(45, 122, 58, 0.1)",
              fontFamily: "Inter, sans-serif",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column" as const,
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "18px 22px",
                borderBottom: "1px solid rgba(45, 122, 58, 0.15)",
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
                {"\uD83C\uDF31"} Motivational Interviewing
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
                  border: "1px solid rgba(45, 122, 58, 0.2)",
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
                {"\u2715"}
              </button>
            </div>

            {/* Scrollable content */}
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
                Motivational Interviewing (MI) is a collaborative, person-centered
                approach to strengthening a person's own motivation and commitment
                to change. It works by evoking the client's own reasons for change
                rather than imposing external pressure.
              </p>

              {MI_CONCEPTS.map((concept) => (
                <div
                  key={concept.id}
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(12, 24, 18, 0.9) 0%, rgba(8, 18, 14, 0.95) 100%)",
                    borderRadius: 14,
                    padding: "16px 18px",
                    border: "1px solid rgba(45, 122, 58, 0.12)",
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
                    <span style={{ fontSize: 22 }}>{concept.icon}</span>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: 15,
                        fontWeight: 650,
                        color: concept.color,
                      }}
                    >
                      {concept.name}
                    </h3>
                  </div>

                  <p
                    style={{
                      margin: "0 0 10px",
                      fontSize: 13,
                      lineHeight: 1.7,
                      color: "rgba(232, 220, 200, 0.82)",
                    }}
                  >
                    {concept.description}
                  </p>

                  <div
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(212, 162, 76, 0.08) 0%, rgba(212, 162, 76, 0.04) 100%)",
                      borderRadius: 10,
                      padding: "10px 14px",
                      border: "1px solid rgba(212, 162, 76, 0.12)",
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
                      In Session
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 13,
                        lineHeight: 1.6,
                        color: "rgba(232, 220, 200, 0.75)",
                      }}
                    >
                      {concept.inSession}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
