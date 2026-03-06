import { useState } from "react";
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
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Seed count */}
      <div
        style={{
          textAlign: "center",
          fontSize: 13,
          color: seeds.length >= 2 ? "rgba(90, 184, 143, 0.8)" : "rgba(232, 220, 200, 0.5)",
          fontWeight: 600,
        }}
      >
        {seeds.length} seed{seeds.length !== 1 ? "s" : ""} planted
        {seeds.length < 2 && " \u2014 plant at least 2"}
      </div>

      {DARN_CATEGORIES.map((darnCat) => {
        const options = topicSeeds[darnCat.category] || [];
        const isExpanded = expandedCategory === darnCat.category;
        const categorySeeds = seeds.filter((s) => s.category === darnCat.category);

        return (
          <div
            key={darnCat.category}
            style={{
              background: "rgba(12, 24, 18, 0.6)",
              borderRadius: 14,
              border: `1px solid ${darnCat.color}20`,
              borderLeft: `3px solid ${darnCat.color}`,
              overflow: "hidden",
            }}
          >
            {/* Category header */}
            <button
              type="button"
              onClick={() => setExpandedCategory(isExpanded ? null : darnCat.category)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 16px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                textAlign: "left",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 18 }}>{darnCat.icon}</span>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: darnCat.color }}>
                    {darnCat.label}
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(232, 220, 200, 0.5)", marginTop: 2 }}>
                    {darnCat.prompt[ageMode]}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {categorySeeds.length > 0 && (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: darnCat.color,
                      background: `${darnCat.color}20`,
                      padding: "2px 8px",
                      borderRadius: 10,
                    }}
                  >
                    {categorySeeds.length}
                  </span>
                )}
                <span
                  style={{
                    fontSize: 14,
                    color: "rgba(232, 220, 200, 0.4)",
                    transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s",
                    display: "inline-block",
                  }}
                >
                  {"\u25BC"}
                </span>
              </div>
            </button>

            {/* Expandable options */}
            {isExpanded && (
              <div
                style={{
                  padding: "0 16px 14px",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                {options.map((option) => {
                  const isSelected = seeds.some(
                    (s) => s.category === darnCat.category && s.text === option,
                  );

                  return (
                    <button
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
                      style={{
                        minHeight: 44,
                        padding: "8px 16px",
                        borderRadius: 22,
                        border: isSelected
                          ? `2px solid ${darnCat.color}`
                          : "1px solid rgba(232, 220, 200, 0.2)",
                        background: isSelected
                          ? `${darnCat.color}30`
                          : "rgba(12, 24, 18, 0.5)",
                        color: isSelected ? darnCat.color : "#e8dcc8",
                        fontSize: 13,
                        fontFamily: "inherit",
                        fontWeight: isSelected ? 600 : 400,
                        cursor: "pointer",
                        transition:
                          "background 0.15s ease, border-color 0.15s ease, color 0.15s ease",
                        outline: "none",
                        WebkitTapHighlightColor: "transparent",
                        userSelect: "none",
                      }}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
