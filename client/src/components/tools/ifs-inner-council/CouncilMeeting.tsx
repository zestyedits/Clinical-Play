import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { AgeMode } from "./council-data";
import { PART_ARCHETYPES, CATEGORIES, SELF_RESPONSES } from "./council-data";

interface PartState {
  archetypeId: string;
  concern: string;
  selfResponse: string;
  heard: boolean;
}

interface CouncilMeetingProps {
  selectedParts: PartState[];
  onSetSelfResponse: (archetypeId: string, response: string) => void;
  onMarkHeard: (archetypeId: string) => void;
  ageMode: AgeMode;
}

const SELF_ACCENT = "#5f9ea0";
const CANDLELIGHT = "#f4e4bc";
const STONE = "#8b7355";

export function CouncilMeeting({
  selectedParts,
  onSetSelfResponse,
  onMarkHeard,
  ageMode,
}: CouncilMeetingProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const responses = SELF_RESPONSES[ageMode];
  const currentPart = selectedParts[currentIndex];
  if (!currentPart) return null;

  const archetype = PART_ARCHETYPES.find(
    (a) => a.id === currentPart.archetypeId
  );
  if (!archetype) return null;

  const categoryInfo = CATEGORIES.find(
    (c) => c.category === archetype.category
  );

  const handleSelectResponse = (text: string) => {
    onSetSelfResponse(currentPart.archetypeId, text);
    onMarkHeard(currentPart.archetypeId);
  };

  const goNext = () => {
    if (currentIndex < selectedParts.length - 1) {
      setDirection(1);
      setCurrentIndex((i) => i + 1);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((i) => i - 1);
    }
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -80 : 80,
      opacity: 0,
    }),
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Progress dots */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 8,
          marginBottom: 4,
        }}
      >
        {selectedParts.map((part, i) => {
          const pa = PART_ARCHETYPES.find((a) => a.id === part.archetypeId);
          const dotColor = pa?.color ?? STONE;
          return (
            <div
              key={part.archetypeId}
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                border: `2px solid ${dotColor}`,
                background: part.heard ? dotColor : "transparent",
                transition: "all 0.3s",
                opacity: i === currentIndex ? 1 : 0.5,
                transform: i === currentIndex ? "scale(1.3)" : "scale(1)",
              }}
            />
          );
        })}
      </div>

      {/* Animated part card */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentPart.archetypeId}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.3 }}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {/* Part header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: `${archetype.color}25`,
                border: `2px solid ${archetype.color}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: currentPart.heard
                  ? `0 0 12px ${archetype.color}55`
                  : "none",
                transition: "box-shadow 0.4s",
              }}
            >
              <svg viewBox="0 0 24 24" width={20} height={20}>
                <path d={archetype.iconPath} fill={archetype.color} />
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: archetype.color,
                  }}
                >
                  {archetype.name}
                </span>
                {currentPart.heard && (
                  <svg viewBox="0 0 20 20" width={16} height={16}>
                    <circle cx={10} cy={10} r={9} fill={`${SELF_ACCENT}33`} />
                    <path
                      d="M6 10L9 13L14 7"
                      stroke={SELF_ACCENT}
                      strokeWidth={2}
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              {categoryInfo && (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: 8,
                    background: `${categoryInfo.color}22`,
                    color: categoryInfo.color,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  {categoryInfo.label}
                </span>
              )}
            </div>
          </div>

          {/* Speech bubble — part's concern */}
          <div
            style={{
              background: `${archetype.color}15`,
              borderLeft: `3px solid ${archetype.color}`,
              borderRadius: "4px 12px 12px 4px",
              padding: "14px 18px",
              color: CANDLELIGHT,
              fontSize: 14,
              lineHeight: 1.6,
              fontStyle: "italic",
              position: "relative",
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: `${archetype.color}AA`,
                textTransform: "uppercase",
                letterSpacing: 1,
                marginBottom: 6,
                fontStyle: "normal",
              }}
            >
              {archetype.name} speaks:
            </div>
            {currentPart.concern}
          </div>

          {/* Self response area */}
          <div
            style={{
              border: `1px solid ${SELF_ACCENT}40`,
              borderRadius: 12,
              padding: 16,
              background: `${SELF_ACCENT}08`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: `${SELF_ACCENT}33`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: SELF_ACCENT,
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: SELF_ACCENT,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Respond from Self
              </span>
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              {responses.map((resp) => {
                const isSelected = currentPart.selfResponse === resp.text;
                return (
                  <motion.button
                    key={resp.text}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleSelectResponse(resp.text)}
                    style={{
                      borderRadius: 10,
                      padding: "8px 14px",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      border: isSelected
                        ? `2px solid ${SELF_ACCENT}`
                        : "1px solid rgba(139, 115, 85, 0.2)",
                      background: isSelected
                        ? `${SELF_ACCENT}22`
                        : "rgba(244, 228, 188, 0.04)",
                      color: isSelected ? SELF_ACCENT : `${CANDLELIGHT}BB`,
                      fontSize: 13,
                      fontFamily: "Inter, sans-serif",
                      fontWeight: isSelected ? 600 : 400,
                      textAlign: "left",
                      lineHeight: 1.4,
                    }}
                  >
                    {resp.text}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 8,
        }}
      >
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={goPrev}
          disabled={currentIndex === 0}
          style={{
            padding: "8px 20px",
            borderRadius: 8,
            border: `1px solid ${STONE}55`,
            background: "transparent",
            color: currentIndex === 0 ? `${STONE}44` : CANDLELIGHT,
            fontSize: 13,
            fontWeight: 600,
            fontFamily: "Inter, sans-serif",
            cursor: currentIndex === 0 ? "not-allowed" : "pointer",
            opacity: currentIndex === 0 ? 0.4 : 1,
          }}
        >
          Previous Part
        </motion.button>

        <span
          style={{
            fontSize: 12,
            color: `${CANDLELIGHT}66`,
            fontFamily: "Inter, sans-serif",
          }}
        >
          {currentIndex + 1} of {selectedParts.length}
        </span>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={goNext}
          disabled={currentIndex === selectedParts.length - 1}
          style={{
            padding: "8px 20px",
            borderRadius: 8,
            border: `1px solid ${STONE}55`,
            background: "transparent",
            color:
              currentIndex === selectedParts.length - 1
                ? `${STONE}44`
                : CANDLELIGHT,
            fontSize: 13,
            fontWeight: 600,
            fontFamily: "Inter, sans-serif",
            cursor:
              currentIndex === selectedParts.length - 1
                ? "not-allowed"
                : "pointer",
            opacity: currentIndex === selectedParts.length - 1 ? 0.4 : 1,
          }}
        >
          Next Part
        </motion.button>
      </div>
    </div>
  );
}
