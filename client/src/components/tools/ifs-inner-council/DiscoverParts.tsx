import { motion } from "framer-motion";
import type { AgeMode } from "./council-data";
import { CATEGORIES, PART_ARCHETYPES } from "./council-data";

interface DiscoverPartsProps {
  selectedPartIds: string[];
  onTogglePart: (archetypeId: string) => void;
  ageMode: AgeMode;
}

export function DiscoverParts({
  selectedPartIds,
  onTogglePart,
  ageMode,
}: DiscoverPartsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ display: "flex", flexDirection: "column", gap: 20 }}
    >
      {CATEGORIES.map((cat) => {
        const parts = PART_ARCHETYPES.filter((p) => p.category === cat.category);
        return (
          <div
            key={cat.category}
            style={{
              background: "rgba(244, 228, 188, 0.04)",
              borderRadius: 12,
              border: "1px solid rgba(139, 115, 85, 0.15)",
              padding: 16,
            }}
          >
            {/* Category header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: `${cat.color}20`,
                  border: `1.5px solid ${cat.color}55`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg viewBox="0 0 24 24" width={18} height={18}>
                  <circle cx={12} cy={12} r={8} fill={cat.color} opacity={0.6} />
                </svg>
              </div>
              <div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 15,
                    color: cat.color,
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  {cat.label}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "rgba(244, 228, 188, 0.55)",
                    lineHeight: 1.4,
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  {cat.description[ageMode]}
                </div>
              </div>
            </div>

            {/* Part chips grid */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              {parts.map((part) => {
                const isSelected = selectedPartIds.includes(part.id);
                return (
                  <motion.button
                    key={part.id}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onTogglePart(part.id)}
                    style={{
                      borderRadius: 10,
                      padding: "8px 14px",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      border: isSelected
                        ? `2px solid ${part.color}`
                        : "1px solid rgba(139, 115, 85, 0.2)",
                      background: isSelected
                        ? `${part.color}22`
                        : "rgba(244, 228, 188, 0.04)",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      textAlign: "left",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    {/* Checkmark indicator for selected */}
                    {isSelected && (
                      <svg
                        viewBox="0 0 20 20"
                        width={14}
                        height={14}
                        style={{ flexShrink: 0 }}
                      >
                        <circle cx={10} cy={10} r={9} fill={part.color} opacity={0.3} />
                        <path
                          d="M6 10L9 13L14 7"
                          stroke={part.color}
                          strokeWidth={2}
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                    <div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: isSelected ? part.color : "#f4e4bc",
                          lineHeight: 1.3,
                        }}
                      >
                        {part.name}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: isSelected
                            ? "rgba(244, 228, 188, 0.65)"
                            : "rgba(244, 228, 188, 0.4)",
                          lineHeight: 1.3,
                          marginTop: 2,
                        }}
                      >
                        {part.description[ageMode]}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        );
      })}
    </motion.div>
  );
}
