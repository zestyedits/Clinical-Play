import { AnimatePresence, motion } from "framer-motion";
import { IFS_CONCEPTS } from "./council-data";

interface IFSGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const CANDLELIGHT = "#3a3228";
const AMBER = "#b8860b";
const BG = "#fdfaf3";

export function IFSGuide({ isOpen, onClose }: IFSGuideProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="ifs-guide-overlay"
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
            key="ifs-guide-modal"
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            style={{
              background: `linear-gradient(180deg, ${BG} 0%, #f0e8dc 100%)`,
              borderRadius: 18,
              maxWidth: 520,
              width: "100%",
              maxHeight: "90vh",
              border: "1px solid rgba(139, 115, 85, 0.25)",
              boxShadow:
                "0 24px 80px rgba(58, 48, 38, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.7) inset, 0 0 40px rgba(139, 115, 85, 0.08)",
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
                borderBottom: "1px solid rgba(139, 115, 85, 0.15)",
                flexShrink: 0,
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: 18,
                  fontWeight: 700,
                  color: CANDLELIGHT,
                  letterSpacing: "-0.01em",
                }}
              >
                {"\u2694"} IFS Framework
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
                  background: "rgba(139, 115, 85, 0.1)",
                  border: "1px solid rgba(139, 115, 85, 0.2)",
                  borderRadius: 8,
                  color: "rgba(58, 48, 38, 0.6)",
                  fontSize: 18,
                  cursor: "pointer",
                  transition: "background 0.15s, color 0.15s",
                  fontFamily: "Inter, sans-serif",
                  lineHeight: 1,
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "rgba(139, 115, 85, 0.16)";
                  e.currentTarget.style.color = "rgba(58, 48, 38, 0.9)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "rgba(139, 115, 85, 0.1)";
                  e.currentTarget.style.color = "rgba(58, 48, 38, 0.6)";
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
              {/* Intro paragraph */}
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  lineHeight: 1.7,
                  color: "rgba(58, 48, 38, 0.75)",
                }}
              >
                Internal Family Systems (IFS) is an evidence-based model that
                views the mind as naturally made up of multiple parts, each with
                its own perspective and role. At the center is the Self — a calm,
                compassionate core capable of healing and leading the internal
                system. IFS helps you build a relationship with your parts so
                they can release their burdens and return to their natural,
                valuable roles.
              </p>

              {/* Concept cards */}
              {IFS_CONCEPTS.map((concept) => (
                <div
                  key={concept.id}
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(253, 250, 243, 0.98) 0%, rgba(245, 238, 228, 0.99) 100%)",
                    borderRadius: 14,
                    padding: "16px 18px",
                    border: "1px solid rgba(139, 115, 85, 0.12)",
                    boxShadow: "0 2px 8px rgba(58, 48, 38, 0.06)",
                  }}
                >
                  {/* Concept header */}
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

                  {/* Description */}
                  <p
                    style={{
                      margin: "0 0 10px",
                      fontSize: 13,
                      lineHeight: 1.7,
                      color: "rgba(58, 48, 38, 0.82)",
                    }}
                  >
                    {concept.description}
                  </p>

                  {/* In Session tip */}
                  <div
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(184, 134, 11, 0.08) 0%, rgba(184, 134, 11, 0.04) 100%)",
                      borderRadius: 10,
                      padding: "10px 14px",
                      border: "1px solid rgba(184, 134, 11, 0.12)",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: 12,
                        color: "rgba(184, 134, 11, 0.55)",
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
                        color: "rgba(58, 48, 38, 0.75)",
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
