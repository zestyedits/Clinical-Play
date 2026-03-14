import { motion } from "framer-motion";
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
    teen: "Select the values that feel most important right now:",
    adult: "Select 1–3 core values this change connects to:",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div
        style={{
          fontSize: 13,
          color: "rgba(232, 220, 200, 0.55)",
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
          gap: 7,
          justifyContent: "center",
        }}
      >
        {VALUE_OPTIONS.map((value, i) => {
          const isSelected = values.includes(value);
          const isMaxed = values.length >= 3 && !isSelected;

          return (
            <motion.button
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
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: isMaxed ? 0.4 : 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              whileTap={!isMaxed ? { scale: 0.95 } : {}}
              style={{
                minHeight: 38,
                padding: "7px 16px",
                borderRadius: 20,
                border: isSelected
                  ? "1.5px solid #d4a24c"
                  : "1px solid rgba(232, 220, 200, 0.1)",
                background: isSelected
                  ? "rgba(212, 162, 76, 0.18)"
                  : "rgba(232, 220, 200, 0.04)",
                color: isSelected ? "#d4a24c" : isMaxed ? "rgba(232, 220, 200, 0.25)" : "rgba(232, 220, 200, 0.65)",
                fontSize: 13,
                fontFamily: "inherit",
                fontWeight: isSelected ? 600 : 400,
                cursor: isMaxed ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
                outline: "none",
                WebkitTapHighlightColor: "transparent",
                userSelect: "none",
              }}
            >
              {isSelected && "🌻 "}{value}
            </motion.button>
          );
        })}
      </div>

      {values.map((value, vi) => {
        const connections = topicConnections[value] || [];
        const currentConnection = valueConnections.find((vc) => vc.value === value);

        if (connections.length === 0) return null;

        return (
          <motion.div
            key={value}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: vi * 0.1 }}
            style={{
              borderRadius: 14,
              padding: "14px 16px",
              background: "rgba(232, 220, 200, 0.03)",
              border: "1px solid rgba(212, 162, 76, 0.12)",
              borderLeft: "3px solid rgba(212, 162, 76, 0.4)",
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#d4a24c",
                marginBottom: 10,
                fontFamily: "'Lora', Georgia, serif",
              }}
            >
              How does your change connect to {value}?
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {connections.map((connection) => {
                const isSelected = currentConnection?.connection === connection;
                return (
                  <motion.button
                    key={connection}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        onRemoveValueConnection(value);
                      } else {
                        onAddValueConnection(value, connection);
                      }
                    }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      padding: "9px 13px",
                      borderRadius: 10,
                      border: isSelected
                        ? "1.5px solid #d4a24c"
                        : "1px solid rgba(232, 220, 200, 0.06)",
                      background: isSelected ? "rgba(212, 162, 76, 0.1)" : "transparent",
                      color: isSelected ? "#d4a24c" : "rgba(232, 220, 200, 0.6)",
                      fontSize: 12,
                      fontFamily: "inherit",
                      fontWeight: isSelected ? 600 : 400,
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.2s ease",
                      outline: "none",
                      lineHeight: 1.4,
                    }}
                  >
                    {isSelected && "✨ "}{connection}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
