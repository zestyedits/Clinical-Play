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
        gridTemplateColumns: "repeat(auto-fill, minmax(min(240px, 100%), 1fr))",
        gap: 12,
      }}
    >
      {CHANGE_TOPICS.map((topic) => {
        const isSelected = changeTopic === topic.id;

        return (
          <button
            key={topic.id}
            type="button"
            onClick={() => onSelectTopic(topic.id)}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 14,
              padding: 16,
              background: isSelected
                ? `${topic.color}18`
                : "rgba(12, 24, 18, 0.6)",
              border: isSelected
                ? `2px solid ${topic.color}`
                : "1px solid rgba(232, 220, 200, 0.1)",
              borderLeft: isSelected
                ? `4px solid ${topic.color}`
                : `3px solid ${topic.color}40`,
              borderRadius: 12,
              cursor: "pointer",
              transition: "all 0.2s ease",
              textAlign: "left",
              fontFamily: "inherit",
              outline: "none",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: `${topic.color}15`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                flexShrink: 0,
              }}
            >
              {topic.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontWeight: 700,
                  color: isSelected ? topic.color : "#e8dcc8",
                  fontSize: 15,
                  marginBottom: 4,
                }}
              >
                {topic.name}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "rgba(232, 220, 200, 0.55)",
                  lineHeight: 1.4,
                }}
              >
                {topic.description[ageMode]}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
