import { useState } from "react";
import type { AgeMode, WeedCategory, Weed } from "./garden-data";
import { WEED_CATEGORIES, WEED_OPTIONS } from "./garden-data";

interface WeedNoticingProps {
  changeTopic: string;
  weeds: Weed[];
  onAddWeed: (category: WeedCategory, text: string) => void;
  onRemoveWeed: (weedId: string) => void;
  ageMode: AgeMode;
}

export function WeedNoticing({
  changeTopic,
  weeds,
  onAddWeed,
  onRemoveWeed,
  ageMode,
}: WeedNoticingProps) {
  const [expandedCategory, setExpandedCategory] = useState<WeedCategory | null>("comfort");
  const topicWeeds = WEED_OPTIONS[changeTopic] || {};

  const validatingMessage: Record<AgeMode, string> = {
    child: "Weeds are normal in every garden. Noticing them is brave!",
    teen: "Weeds are natural — everyone has reasons it's hard to change. Acknowledging them is the first step.",
    adult: "Sustain talk is a natural part of ambivalence. Acknowledging these barriers without judgment is core to the MI process.",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <p
        style={{
          margin: "0 0 4px",
          fontSize: 12,
          lineHeight: 1.5,
          color: "rgba(232, 220, 200, 0.55)",
          fontStyle: "italic",
          textAlign: "center",
          padding: "0 8px",
        }}
      >
        {validatingMessage[ageMode]}
      </p>

      <div
        style={{
          textAlign: "center",
          fontSize: 12,
          color: weeds.length >= 1 ? "rgba(90, 184, 143, 0.8)" : "rgba(232, 220, 200, 0.4)",
          fontWeight: 500,
          marginBottom: 2,
        }}
      >
        {weeds.length} weed{weeds.length !== 1 ? "s" : ""} noticed
        {weeds.length < 1 && " — notice at least 1"}
      </div>

      {WEED_CATEGORIES.map((weedCat) => {
        const options = topicWeeds[weedCat.category] || [];
        const isExpanded = expandedCategory === weedCat.category;
        const categoryWeeds = weeds.filter((w) => w.category === weedCat.category);

        return (
          <div
            key={weedCat.category}
            style={{
              borderRadius: 8,
              borderLeft: `3px solid ${weedCat.color}`,
              overflow: "hidden",
              background: isExpanded ? "rgba(232, 220, 200, 0.03)" : "transparent",
              transition: "background 0.2s",
            }}
          >
            <button
              type="button"
              onClick={() => setExpandedCategory(isExpanded ? null : weedCat.category)}
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
                <span style={{ fontSize: 16 }}>{weedCat.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: weedCat.color }}>
                    {weedCat.label} Weeds
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(232, 220, 200, 0.4)", marginTop: 1 }}>
                    {weedCat.prompt[ageMode]}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {categoryWeeds.length > 0 && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: weedCat.color,
                      background: `${weedCat.color}18`,
                      padding: "1px 7px",
                      borderRadius: 8,
                    }}
                  >
                    {categoryWeeds.length}
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
                  const isSelected = weeds.some(
                    (w) => w.category === weedCat.category && w.text === option,
                  );

                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          const weed = weeds.find(
                            (w) => w.category === weedCat.category && w.text === option,
                          );
                          if (weed) onRemoveWeed(weed.id);
                        } else {
                          onAddWeed(weedCat.category, option);
                        }
                      }}
                      style={{
                        minHeight: 36,
                        padding: "6px 14px",
                        borderRadius: 18,
                        border: isSelected
                          ? `1.5px solid ${weedCat.color}`
                          : "1px solid rgba(232, 220, 200, 0.12)",
                        background: isSelected
                          ? `${weedCat.color}20`
                          : "rgba(232, 220, 200, 0.04)",
                        color: isSelected ? weedCat.color : "rgba(232, 220, 200, 0.7)",
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
