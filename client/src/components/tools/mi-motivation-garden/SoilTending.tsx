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
    adult: "Select 1–3 core values that this change connects to:",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div
        style={{
          fontSize: 13,
          color: "rgba(232, 220, 200, 0.6)",
          fontWeight: 500,
          textAlign: "center",
        }}
      >
        {valuesPrompt[ageMode]}
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
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
                minHeight: 36,
                padding: "6px 14px",
                borderRadius: 18,
                border: isSelected
                  ? "1.5px solid #d4a24c"
                  : "1px solid rgba(232, 220, 200, 0.12)",
                background: isSelected
                  ? "rgba(212, 162, 76, 0.18)"
                  : "rgba(232, 220, 200, 0.04)",
                color: isSelected ? "#d4a24c" : isMaxed ? "rgba(232, 220, 200, 0.25)" : "rgba(232, 220, 200, 0.7)",
                fontSize: 13,
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

      {values.map((value) => {
        const connections = topicConnections[value] || [];
        const currentConnection = valueConnections.find((vc) => vc.value === value);

        if (connections.length === 0) return null;

        return (
          <div
            key={value}
            style={{
              borderLeft: "3px solid #d4a24c",
              borderRadius: 8,
              padding: "10px 14px",
              background: "rgba(232, 220, 200, 0.03)",
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#d4a24c",
                marginBottom: 8,
              }}
            >
              How does your change connect to {value}?
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
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
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: isSelected
                        ? "1.5px solid #d4a24c"
                        : "1px solid rgba(232, 220, 200, 0.08)",
                      background: isSelected ? "rgba(212, 162, 76, 0.12)" : "transparent",
                      color: isSelected ? "#d4a24c" : "rgba(232, 220, 200, 0.65)",
                      fontSize: 12,
                      fontFamily: "inherit",
                      fontWeight: isSelected ? 600 : 400,
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.15s ease",
                      outline: "none",
                      lineHeight: 1.4,
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
