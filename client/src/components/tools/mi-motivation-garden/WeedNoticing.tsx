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
    teen: "Weeds are natural \u2014 everyone has reasons it\u2019s hard to change. Acknowledging them is the first step.",
    adult: "Sustain talk is a natural part of ambivalence. Acknowledging these barriers without judgment is core to the MI process.",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Validating message */}
      <div
        style={{
          background: "rgba(155, 142, 196, 0.08)",
          borderRadius: 12,
          padding: "14px 16px",
          border: "1px solid rgba(155, 142, 196, 0.15)",
          textAlign: "center",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 13,
            lineHeight: 1.6,
            color: "rgba(232, 220, 200, 0.75)",
            fontStyle: "italic",
          }}
        >
          {validatingMessage[ageMode]}
        </p>
      </div>

      {/* Weed count */}
      <div
        style={{
          textAlign: "center",
          fontSize: 13,
          color: weeds.length >= 1 ? "rgba(90, 184, 143, 0.8)" : "rgba(232, 220, 200, 0.5)",
          fontWeight: 600,
        }}
      >
        {weeds.length} weed{weeds.length !== 1 ? "s" : ""} noticed
        {weeds.length < 1 && " \u2014 notice at least 1"}
      </div>

      {WEED_CATEGORIES.map((weedCat) => {
        const options = topicWeeds[weedCat.category] || [];
        const isExpanded = expandedCategory === weedCat.category;
        const categoryWeeds = weeds.filter((w) => w.category === weedCat.category);

        return (
          <div
            key={weedCat.category}
            style={{
              background: "rgba(12, 24, 18, 0.6)",
              borderRadius: 14,
              border: `1px solid ${weedCat.color}20`,
              borderLeft: `3px solid ${weedCat.color}`,
              overflow: "hidden",
            }}
          >
            {/* Category header */}
            <button
              type="button"
              onClick={() => setExpandedCategory(isExpanded ? null : weedCat.category)}
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
                <span style={{ fontSize: 18 }}>{weedCat.icon}</span>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: weedCat.color }}>
                    {weedCat.label} Weeds
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(232, 220, 200, 0.5)", marginTop: 2 }}>
                    {weedCat.prompt[ageMode]}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {categoryWeeds.length > 0 && (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: weedCat.color,
                      background: `${weedCat.color}20`,
                      padding: "2px 8px",
                      borderRadius: 10,
                    }}
                  >
                    {categoryWeeds.length}
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
                        minHeight: 44,
                        padding: "8px 16px",
                        borderRadius: 22,
                        border: isSelected
                          ? `2px solid ${weedCat.color}`
                          : "1px solid rgba(232, 220, 200, 0.2)",
                        background: isSelected
                          ? `${weedCat.color}30`
                          : "rgba(12, 24, 18, 0.5)",
                        color: isSelected ? weedCat.color : "#e8dcc8",
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
