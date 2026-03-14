import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { AgeMode, DARNCategory, Seed } from "./garden-data";
import { DARN_CATEGORIES, SEED_OPTIONS } from "./garden-data";

interface SeedPlantingProps {
  changeTopic: string;
  seeds: Seed[];
  onAddSeed: (category: DARNCategory, text: string) => void;
  onRemoveSeed: (seedId: string) => void;
  ageMode: AgeMode;
}

export function SeedPlanting({
  changeTopic,
  seeds,
  onAddSeed,
  onRemoveSeed,
  ageMode,
}: SeedPlantingProps) {
  const [expandedCategory, setExpandedCategory] = useState<DARNCategory | null>("desire");
  const topicSeeds = SEED_OPTIONS[changeTopic] || {};

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: "6px 0",
        }}
      >
        <div style={{ display: "flex", gap: 3 }}>
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: i < seeds.length ? 1 : 0.7,
                opacity: i < seeds.length ? 1 : 0.3,
              }}
              style={{
                fontSize: i < seeds.length ? 16 : 12,
                transition: "all 0.3s",
              }}
            >
              {i < seeds.length ? "🌱" : "·"}
            </motion.div>
          ))}
        </div>
        <span
          style={{
            fontSize: 12,
            color: seeds.length >= 2 ? "rgba(90, 184, 143, 0.8)" : "rgba(232, 220, 200, 0.4)",
            fontWeight: 500,
          }}
        >
          {seeds.length} planted{seeds.length < 2 ? " · need 2+" : ""}
        </span>
      </div>

      {DARN_CATEGORIES.map((darnCat) => {
        const options = topicSeeds[darnCat.category] || [];
        const isExpanded = expandedCategory === darnCat.category;
        const categorySeeds = seeds.filter((s) => s.category === darnCat.category);

        return (
          <div
            key={darnCat.category}
            style={{
              borderRadius: 12,
              overflow: "hidden",
              background: isExpanded ? "rgba(232, 220, 200, 0.03)" : "transparent",
              border: isExpanded ? `1px solid ${darnCat.color}20` : "1px solid transparent",
              transition: "all 0.25s",
            }}
          >
            <button
              type="button"
              onClick={() => setExpandedCategory(isExpanded ? null : darnCat.category)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                textAlign: "left",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: `${darnCat.color}12`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                  }}
                >
                  {darnCat.icon}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: darnCat.color }}>
                    {darnCat.label}
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(232, 220, 200, 0.4)", marginTop: 1 }}>
                    {darnCat.prompt[ageMode]}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {categorySeeds.length > 0 && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: darnCat.color,
                      background: `${darnCat.color}18`,
                      padding: "2px 8px",
                      borderRadius: 10,
                    }}
                  >
                    {categorySeeds.length}
                  </span>
                )}
                <motion.span
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    fontSize: 11,
                    color: "rgba(232, 220, 200, 0.3)",
                    display: "inline-block",
                  }}
                >
                  ▼
                </motion.span>
              </div>
            </button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ overflow: "hidden" }}
                >
                  <div
                    style={{
                      padding: "2px 14px 12px",
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 6,
                    }}
                  >
                    {options.map((option) => {
                      const isSelected = seeds.some(
                        (s) => s.category === darnCat.category && s.text === option,
                      );

                      return (
                        <motion.button
                          key={option}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              const seed = seeds.find(
                                (s) => s.category === darnCat.category && s.text === option,
                              );
                              if (seed) onRemoveSeed(seed.id);
                            } else {
                              onAddSeed(darnCat.category, option);
                            }
                          }}
                          whileTap={{ scale: 0.95 }}
                          style={{
                            minHeight: 36,
                            padding: "6px 14px",
                            borderRadius: 20,
                            border: isSelected
                              ? `1.5px solid ${darnCat.color}`
                              : "1px solid rgba(232, 220, 200, 0.1)",
                            background: isSelected
                              ? `${darnCat.color}20`
                              : "rgba(232, 220, 200, 0.04)",
                            color: isSelected ? darnCat.color : "rgba(232, 220, 200, 0.65)",
                            fontSize: 12,
                            fontFamily: "inherit",
                            fontWeight: isSelected ? 600 : 400,
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            outline: "none",
                            WebkitTapHighlightColor: "transparent",
                            userSelect: "none",
                          }}
                        >
                          {isSelected && "🌱 "}{option}
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
