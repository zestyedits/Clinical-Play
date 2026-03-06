import type { AgeMode, ValueConnection } from "./garden-data";
import { VALUE_OPTIONS, VALUE_CONNECTION_OPTIONS } from "./garden-data";

interface SoilTendingProps {
  changeTopic: string;
  values: string[];
  valueConnections: ValueConnection[];
  onAddValue: (value: string) => void;
  onRemoveValue: (value: string) => void;
  onAddValueConnection: (value: string, connection: string) => void;
  onRemoveValueConnection: (value: string) => void;
  ageMode: AgeMode;
}

export function SoilTending({
  changeTopic,
  values,
  valueConnections,
  onAddValue,
  onRemoveValue,
  onAddValueConnection,
  onRemoveValueConnection,
  ageMode,
}: SoilTendingProps) {
  const topicConnections = VALUE_CONNECTION_OPTIONS[changeTopic] || {};

  const valuesPrompt: Record<AgeMode, string> = {
    child: "Pick the things that matter most to you:",
    teen: "Select the values that feel most important to you right now:",
    adult: "Select 1\u20133 core values that this change connects to:",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Prompt */}
      <div
        style={{
          fontSize: 14,
          color: "rgba(232, 220, 200, 0.7)",
          fontWeight: 500,
          textAlign: "center",
        }}
      >
        {valuesPrompt[ageMode]}
      </div>

      {/* Value chips */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          justifyContent: "center",
        }}
      >
        {VALUE_OPTIONS.map((value) => {
          const isSelected = values.includes(value);
          const isMaxed = values.length >= 3 && !isSelected;

          return (
            <button
              key={value}
              type="button"
              onClick={() => {
                if (isSelected) {
                  onRemoveValue(value);
                  onRemoveValueConnection(value);
                } else if (!isMaxed) {
                  onAddValue(value);
                }
              }}
              disabled={isMaxed}
              style={{
                minHeight: 44,
                padding: "8px 18px",
                borderRadius: 22,
                border: isSelected
                  ? "2px solid #d4a24c"
                  : "1px solid rgba(232, 220, 200, 0.2)",
                background: isSelected
                  ? "rgba(212, 162, 76, 0.25)"
                  : "rgba(12, 24, 18, 0.5)",
                color: isSelected ? "#d4a24c" : isMaxed ? "rgba(232, 220, 200, 0.3)" : "#e8dcc8",
                fontSize: 14,
                fontFamily: "inherit",
                fontWeight: isSelected ? 600 : 400,
                cursor: isMaxed ? "not-allowed" : "pointer",
                opacity: isMaxed ? 0.5 : 1,
                transition: "all 0.15s ease",
                outline: "none",
                WebkitTapHighlightColor: "transparent",
                userSelect: "none",
              }}
            >
              {value}
            </button>
          );
        })}
      </div>

      {/* Connection cards for selected values */}
      {values.map((value) => {
        const connections = topicConnections[value] || [];
        const currentConnection = valueConnections.find((vc) => vc.value === value);

        if (connections.length === 0) return null;

        return (
          <div
            key={value}
            style={{
              background: "rgba(12, 24, 18, 0.6)",
              borderRadius: 14,
              padding: "16px 18px",
              border: "1px solid rgba(212, 162, 76, 0.15)",
              borderLeft: "3px solid #d4a24c",
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#d4a24c",
                marginBottom: 10,
              }}
            >
              How does your change connect to {value}?
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {connections.map((connection) => {
                const isSelected = currentConnection?.connection === connection;
                return (
                  <button
                    key={connection}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        onRemoveValueConnection(value);
                      } else {
                        onAddValueConnection(value, connection);
                      }
                    }}
                    style={{
                      padding: "10px 14px",
                      borderRadius: 10,
                      border: isSelected
                        ? "2px solid #d4a24c"
                        : "1px solid rgba(232, 220, 200, 0.15)",
                      background: isSelected ? "rgba(212, 162, 76, 0.15)" : "rgba(12, 24, 18, 0.4)",
                      color: isSelected ? "#d4a24c" : "rgba(232, 220, 200, 0.75)",
                      fontSize: 13,
                      fontFamily: "inherit",
                      fontWeight: isSelected ? 600 : 400,
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.15s ease",
                      outline: "none",
                    }}
                  >
                    {connection}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
