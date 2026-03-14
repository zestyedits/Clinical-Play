import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
    teen: "Weeds are natural — everyone has reasons it's hard to change.",
    adult: "Sustain talk is a natural part of ambivalence. Acknowledging barriers is core to MI.",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 14px",
          background: "rgba(155, 142, 196, 0.06)",
          borderRadius: 12,
          borderLeft: "3px solid rgba(155, 142, 196, 0.25)",
        }}
      >
        <span style={{ fontSize: 16 }}>🌙</span>
        <p
          style={{
            margin: 0,
            fontSize: 12,
            lineHeight: 1.5,
            color: "rgba(232, 220, 200, 0.6)",
            fontStyle: "italic",
          }}
        >
          {validatingMessage[ageMode]}
        </p>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: "4px 0",
        }}
      >
        <span
          style={{
            fontSize: 12,
            color: weeds.length >= 1 ? "rgba(155, 142, 196, 0.8)" : "rgba(232, 220, 200, 0.4)",
            fontWeight: 500,
          }}
        >
          {weeds.length} weed{weeds.length !== 1 ? "s" : ""} noticed
          {weeds.length < 1 && " · notice 1+"}
        </span>
      </div>

      {WEED_CATEGORIES.map((weedCat) => {
        const options = topicWeeds[weedCat.category] || [];
        const isExpanded = expandedCategory === weedCat.category;
        const categoryWeeds = weeds.filter((w) => w.category === weedCat.category);

        return (
          <div
            key={weedCat.category}
            style={{
              borderRadius: 12,
              overflow: "hidden",
              background: isExpanded ? "rgba(232, 220, 200, 0.03)" : "transparent",
              border: isExpanded ? `1px solid ${weedCat.color}20` : "1px solid transparent",
              transition: "all 0.25s",
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
                    background: `${weedCat.color}12`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                  }}
                >
                  {weedCat.icon}
                </div>
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
                      padding: "2px 8px",
                      borderRadius: 10,
                    }}
                  >
                    {categoryWeeds.length}
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
                      const isSelected = weeds.some(
                        (w) => w.category === weedCat.category && w.text === option,
                      );

                      return (
                        <motion.button
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
                          whileTap={{ scale: 0.95 }}
                          style={{
                            minHeight: 36,
                            padding: "6px 14px",
                            borderRadius: 20,
                            border: isSelected
                              ? `1.5px solid ${weedCat.color}`
                              : "1px solid rgba(232, 220, 200, 0.1)",
                            background: isSelected
                              ? `${weedCat.color}20`
                              : "rgba(232, 220, 200, 0.04)",
                            color: isSelected ? weedCat.color : "rgba(232, 220, 200, 0.65)",
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
                          {isSelected && "🍂 "}{option}
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
