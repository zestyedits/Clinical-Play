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
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div
        style={{
          textAlign: "center",
          fontSize: 12,
          color: seeds.length >= 2 ? "rgba(90, 184, 143, 0.8)" : "rgba(232, 220, 200, 0.4)",
          fontWeight: 500,
          marginBottom: 2,
        }}
      >
        {seeds.length} seed{seeds.length !== 1 ? "s" : ""} planted
        {seeds.length < 2 && " — plant at least 2"}
      </div>

      {DARN_CATEGORIES.map((darnCat) => {
        const options = topicSeeds[darnCat.category] || [];
        const isExpanded = expandedCategory === darnCat.category;
        const categorySeeds = seeds.filter((s) => s.category === darnCat.category);

        return (
          <div
            key={darnCat.category}
            style={{
              borderRadius: 8,
              borderLeft: `3px solid ${darnCat.color}`,
              overflow: "hidden",
              background: isExpanded ? "rgba(232, 220, 200, 0.03)" : "transparent",
              transition: "background 0.2s",
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
                padding: "10px 12px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                textAlign: "left",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16 }}>{darnCat.icon}</span>
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
                      padding: "1px 7px",
                      borderRadius: 8,
                    }}
                  >
                    {categorySeeds.length}
                  </span>
                )}
                <span
                  style={{
                    fontSize: 12,
                    color: "rgba(232, 220, 200, 0.3)",
                    transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s",
                    display: "inline-block",
                  }}
                >
                  ▼
                </span>
              </div>
            </button>

            {isExpanded && (
              <div
                style={{
                  padding: "2px 12px 10px",
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
                        minHeight: 36,
                        padding: "6px 14px",
                        borderRadius: 18,
                        border: isSelected
                          ? `1.5px solid ${darnCat.color}`
                          : "1px solid rgba(232, 220, 200, 0.12)",
                        background: isSelected
                          ? `${darnCat.color}20`
                          : "rgba(232, 220, 200, 0.04)",
                        color: isSelected ? darnCat.color : "rgba(232, 220, 200, 0.7)",
                        fontSize: 12,
                        fontFamily: "inherit",
                        fontWeight: isSelected ? 600 : 400,
                        cursor: "pointer",
                        transition: "all 0.15s ease",
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
