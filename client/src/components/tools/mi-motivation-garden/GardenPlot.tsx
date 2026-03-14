import { motion } from "framer-motion";
import type { AgeMode } from "./garden-data";
import { CHANGE_TOPICS } from "./garden-data";

interface GardenPlotProps {
  changeTopic: string;
  onSelectTopic: (topicId: string) => void;
  ageMode: AgeMode;
}

export function GardenPlot({ changeTopic, onSelectTopic, ageMode }: GardenPlotProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 10,
      }}
    >
      {CHANGE_TOPICS.map((topic, i) => {
        const isSelected = changeTopic === topic.id;

        return (
          <motion.button
            key={topic.id}
            type="button"
            onClick={() => onSelectTopic(topic.id)}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.3 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              padding: "14px 10px 12px",
              background: isSelected
                ? `${topic.color}18`
                : "rgba(232, 220, 200, 0.03)",
              border: isSelected
                ? `2px solid ${topic.color}80`
                : "1px solid rgba(232, 220, 200, 0.06)",
              borderRadius: 14,
              cursor: "pointer",
              textAlign: "center",
              fontFamily: "inherit",
              outline: "none",
              WebkitTapHighlightColor: "transparent",
              position: "relative",
              overflow: "hidden",
              transition: "border-color 0.2s, background 0.2s",
            }}
          >
            {isSelected && (
              <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "100%",
                background: `radial-gradient(circle at 50% 0%, ${topic.color}15, transparent 70%)`,
                pointerEvents: "none",
              }} />
            )}
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: isSelected ? `${topic.color}20` : "rgba(232, 220, 200, 0.05)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                transition: "background 0.2s",
                position: "relative",
              }}
            >
              {topic.icon}
            </div>
            <div
              style={{
                fontWeight: 600,
                color: isSelected ? topic.color : "#e8dcc8",
                fontSize: 13,
                lineHeight: 1.2,
                transition: "color 0.2s",
                position: "relative",
              }}
            >
              {topic.name}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "rgba(232, 220, 200, 0.4)",
                lineHeight: 1.35,
                position: "relative",
              }}
            >
              {topic.description[ageMode]}
            </div>
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: topic.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  color: "#0a1f14",
                  fontWeight: 700,
                }}
              >
                ✓
              </motion.div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
