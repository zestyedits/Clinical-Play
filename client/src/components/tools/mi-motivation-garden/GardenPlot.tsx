import type { AgeMode } from "./garden-data";
import { CHANGE_TOPICS } from "./garden-data";

interface GardenPlotProps {
  changeTopic: string;
  onSelectTopic: (topicId: string) => void;
  ageMode: AgeMode;
}

export function GardenPlot({ changeTopic, onSelectTopic, ageMode }: GardenPlotProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {CHANGE_TOPICS.map((topic) => {
        const isSelected = changeTopic === topic.id;

        return (
          <button
            key={topic.id}
            type="button"
            onClick={() => onSelectTopic(topic.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 14px",
              background: isSelected
                ? `${topic.color}15`
                : "transparent",
              border: "none",
              borderLeft: isSelected
                ? `3px solid ${topic.color}`
                : `3px solid transparent`,
              borderRadius: 8,
              cursor: "pointer",
              transition: "all 0.2s ease",
              textAlign: "left",
              fontFamily: "inherit",
              outline: "none",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <span style={{ fontSize: 20, flexShrink: 0 }}>
              {topic.icon}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 600,
                  color: isSelected ? topic.color : "#e8dcc8",
                  fontSize: 14,
                  lineHeight: 1.3,
                }}
              >
                {topic.name}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(232, 220, 200, 0.45)",
                  lineHeight: 1.35,
                  marginTop: 2,
                }}
              >
                {topic.description[ageMode]}
              </div>
            </div>
            {isSelected && (
              <span style={{ color: topic.color, fontSize: 14, flexShrink: 0 }}>✓</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
