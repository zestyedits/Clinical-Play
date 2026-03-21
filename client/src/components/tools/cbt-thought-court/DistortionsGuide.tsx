import { AnimatePresence, motion } from "framer-motion";
import { COGNITIVE_DISTORTIONS } from "./distortions-data";
import type { AgeMode } from "./CBTThoughtCourt";

interface DistortionsGuideProps {
  isOpen: boolean;
  onClose: () => void;
  ageMode: AgeMode;
}

export function DistortionsGuide({
  isOpen,
  onClose,
  ageMode,
}: DistortionsGuideProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="distortions-guide-overlay"
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
            zIndex: 50,
            padding: 20,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            key="distortions-guide-modal"
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            style={{
              background: "linear-gradient(180deg, #faf8fc 0%, #f0e8f4 100%)",
              borderRadius: 18,
              maxWidth: 640,
              width: "100%",
              maxHeight: "90vh",
              border: "1px solid rgba(139, 92, 246, 0.2)",
              boxShadow:
                "0 24px 80px rgba(58, 48, 38, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.6) inset, 0 0 40px rgba(139, 92, 246, 0.08)",
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
                borderBottom: "1px solid rgba(139, 92, 246, 0.15)",
                flexShrink: 0,
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#3a3228",
                  letterSpacing: "-0.01em",
                }}
              >
                {"\u2696\uFE0F"} Cognitive Distortions Guide
              </h2>
              <button
                onClick={onClose}
                aria-label="Close guide"
                style={{
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(58, 48, 38, 0.06)",
                  border: "1px solid rgba(139, 92, 246, 0.2)",
                  borderRadius: 8,
                  color: "rgba(58, 48, 38, 0.55)",
                  fontSize: 16,
                  cursor: "pointer",
                  transition: "background 0.15s, color 0.15s",
                  fontFamily: "Inter, sans-serif",
                  lineHeight: 1,
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "rgba(139, 92, 246, 0.1)";
                  e.currentTarget.style.color = "rgba(58, 48, 38, 0.9)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "rgba(58, 48, 38, 0.06)";
                  e.currentTarget.style.color = "rgba(58, 48, 38, 0.55)";
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
              {COGNITIVE_DISTORTIONS.map((distortion) => (
                <div
                  key={distortion.id}
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(250, 248, 255, 0.98) 0%, rgba(244, 238, 252, 0.99) 100%)",
                    borderRadius: 14,
                    padding: "16px 18px",
                    border: "1px solid rgba(139, 92, 246, 0.12)",
                    boxShadow: "0 2px 8px rgba(58, 48, 38, 0.06)",
                  }}
                >
                  {/* Distortion header */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 10,
                    }}
                  >
                    <span style={{ fontSize: 22 }}>{distortion.icon}</span>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: 15,
                        fontWeight: 650,
                        color: "#6d28d9",
                      }}
                    >
                      {distortion.name}
                    </h3>
                  </div>

                  {/* Description */}
                  <p
                    style={{
                      margin: "0 0 10px",
                      fontSize: 13,
                      lineHeight: 1.7,
                      color: "rgba(58, 48, 38, 0.85)",
                    }}
                  >
                    {distortion.description[ageMode]}
                  </p>

                  {/* Example */}
                  <div
                    style={{
                      background: "rgba(139, 92, 246, 0.08)",
                      borderRadius: 10,
                      padding: "10px 14px",
                      marginBottom: 8,
                      border: "1px solid rgba(139, 92, 246, 0.1)",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: 12,
                        color: "rgba(91, 33, 182, 0.65)",
                        fontWeight: 600,
                        textTransform: "uppercase" as const,
                        letterSpacing: "0.05em",
                        marginBottom: 4,
                      }}
                    >
                      Example
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 13,
                        lineHeight: 1.6,
                        color: "rgba(58, 48, 38, 0.78)",
                        fontStyle: "italic",
                      }}
                    >
                      {distortion.example[ageMode]}
                    </p>
                  </div>

                  {/* Humor quip */}
                  <div
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(234, 179, 8, 0.08) 0%, rgba(234, 179, 8, 0.04) 100%)",
                      borderRadius: 10,
                      padding: "10px 14px",
                      border: "1px solid rgba(234, 179, 8, 0.12)",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: 13,
                        lineHeight: 1.6,
                        color: "rgba(58, 48, 38, 0.88)",
                      }}
                    >
                      {"\uD83D\uDE02"} {distortion.humor[ageMode]}
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
