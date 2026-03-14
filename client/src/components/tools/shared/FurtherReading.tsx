import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface Reference {
  title: string;
  author: string;
  year: number;
  description: string;
}

interface FurtherReadingProps {
  references: Reference[];
  accentColor?: string;
  textColor?: string;
  bgColor?: string;
}

function withOpacity(color: string, opacity: number): string {
  const rgbaMatch = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)$/);
  if (rgbaMatch) {
    return `rgba(${rgbaMatch[1]}, ${rgbaMatch[2]}, ${rgbaMatch[3]}, ${opacity})`;
  }
  const hexMatch = color.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (hexMatch) {
    const r = parseInt(hexMatch[1], 16);
    const g = parseInt(hexMatch[2], 16);
    const b = parseInt(hexMatch[3], 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return color;
}

export function FurtherReading({
  references,
  accentColor = "rgba(180, 140, 80, 0.6)",
  textColor = "#f0e8d8",
  bgColor = "rgba(0, 0, 0, 0.92)",
}: FurtherReadingProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        data-testid="button-further-reading"
        style={{
          background: "rgba(255, 255, 255, 0.06)",
          border: `1px solid ${withOpacity(accentColor, 0.25)}`,
          borderRadius: 8,
          padding: "5px 10px",
          color: textColor,
          fontSize: 14,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 4,
          opacity: 0.8,
          transition: "opacity 0.2s",
        }}
        title="Further Reading"
      >
        <span style={{ fontSize: 13 }}>📚</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0, 0, 0, 0.5)",
                zIndex: 50,
              }}
            />

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                maxHeight: "75%",
                background: bgColor,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                zIndex: 51,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                boxShadow: "0 -8px 40px rgba(0,0,0,0.4)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 20px 12px",
                  borderBottom: `1px solid ${withOpacity(accentColor, 0.12)}`,
                  flexShrink: 0,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 18 }}>📚</span>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: 16,
                      fontWeight: 700,
                      color: textColor,
                      fontFamily: "'Lora', Georgia, serif",
                    }}
                  >
                    Further Reading
                  </h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  data-testid="button-close-further-reading"
                  style={{
                    background: "rgba(255, 255, 255, 0.08)",
                    border: "none",
                    borderRadius: 8,
                    width: 32,
                    height: 32,
                    color: textColor,
                    fontSize: 16,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  ×
                </button>
              </div>

              <div style={{ flex: 1, overflow: "auto", padding: "12px 20px 24px" }}>
                <p
                  style={{
                    fontSize: 12,
                    color: withOpacity(textColor, 0.5),
                    margin: "0 0 16px",
                    lineHeight: 1.5,
                  }}
                >
                  Recommended resources for clinicians to deepen their understanding of the therapeutic approach used in this tool.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {references.map((ref, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * i }}
                      style={{
                        paddingLeft: 14,
                        borderLeft: `2px solid ${withOpacity(accentColor, 0.2)}`,
                      }}
                    >
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: withOpacity(textColor, 0.8),
                          margin: 0,
                          fontFamily: "'Lora', Georgia, serif",
                        }}
                      >
                        {ref.title}
                      </p>
                      <p
                        style={{
                          fontSize: 11,
                          color: withOpacity(textColor, 0.45),
                          margin: "2px 0 0",
                        }}
                      >
                        {ref.author} ({ref.year})
                      </p>
                      <p
                        style={{
                          fontSize: 11,
                          color: withOpacity(textColor, 0.38),
                          margin: "3px 0 0",
                          lineHeight: 1.45,
                        }}
                      >
                        {ref.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
