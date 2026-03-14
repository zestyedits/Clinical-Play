import { motion } from "framer-motion";
import type { AgeMode, Commitment, Seed, Weed, ValueConnection } from "./garden-data";
import { COMMITMENT_OPTIONS, CHANGE_TOPICS, DARN_CATEGORIES, WEED_CATEGORIES } from "./garden-data";

interface BouquetHarvestProps {
  changeTopic: string;
  seeds: Seed[];
  weeds: Weed[];
  importance: number;
  confidence: number;
  values: string[];
  valueConnections: ValueConnection[];
  commitments: Commitment[];
  onAddCommitment: (text: string) => void;
  onRemoveCommitment: (commitmentId: string) => void;
  onReset: () => void;
  ageMode: AgeMode;
  showSummary: boolean;
}

export function BouquetHarvest({
  changeTopic,
  seeds,
  weeds,
  importance,
  confidence,
  values,
  valueConnections,
  commitments,
  onAddCommitment,
  onRemoveCommitment,
  onReset,
  ageMode,
  showSummary,
}: BouquetHarvestProps) {
  const options = COMMITMENT_OPTIONS[changeTopic] || [];
  const topic = CHANGE_TOPICS.find((t) => t.id === changeTopic);

  if (showSummary) {
    return (
      <div
        id="bouquet-summary"
        style={{
          borderRadius: 16,
          padding: "24px 20px",
          maxWidth: 520,
          margin: "0 auto",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 120,
            background: "radial-gradient(ellipse at 50% 0%, rgba(45,122,58,0.12), transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 12 }}
          style={{ textAlign: "center", marginBottom: 16, position: "relative" }}
        >
          <div style={{ fontSize: 48, marginBottom: 6, filter: "drop-shadow(0 4px 12px rgba(45,122,58,0.3))" }}>💐</div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, fontFamily: "'Lora', Georgia, serif", background: "linear-gradient(135deg, #d4a24c, #e8c06a)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            Your Motivation Bouquet
          </h2>
          <div style={{ fontSize: 11, color: "rgba(232, 220, 200, 0.35)", marginTop: 4 }}>
            {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </div>
        </motion.div>

        {topic && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 14px",
              borderLeft: `3px solid ${topic.color}`,
              borderRadius: 8,
              marginBottom: 16,
              background: `${topic.color}08`,
            }}
          >
            <span style={{ fontSize: 20 }}>{topic.icon}</span>
            <div>
              <div style={{ fontSize: 10, color: "rgba(232, 220, 200, 0.4)", fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Garden Plot
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#e8dcc8" }}>
                {topic.name}
              </div>
            </div>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#5ab88f", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
            <span>🌱</span> Seeds Planted
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {seeds.map((seed) => {
              const cat = DARN_CATEGORIES.find(c => c.category === seed.category);
              return (
                <span
                  key={seed.id}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 14,
                    background: `${cat?.color || "#5ab88f"}15`,
                    border: `1px solid ${cat?.color || "#5ab88f"}25`,
                    color: cat?.color || "#5ab88f",
                    fontSize: 11,
                    fontWeight: 500,
                  }}
                >
                  {seed.text}
                </span>
              );
            })}
          </div>
        </motion.div>

        {weeds.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#9b8ec4", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
              <span>🍂</span> Weeds Noticed
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {weeds.map((weed) => {
                const cat = WEED_CATEGORIES.find(c => c.category === weed.category);
                return (
                  <span
                    key={weed.id}
                    style={{
                      padding: "4px 10px",
                      borderRadius: 14,
                      background: `${cat?.color || "#9b8ec4"}12`,
                      border: `1px solid ${cat?.color || "#9b8ec4"}20`,
                      color: `${cat?.color || "#9b8ec4"}cc`,
                      fontSize: 11,
                      fontWeight: 500,
                    }}
                  >
                    {weed.text}
                  </span>
                );
              })}
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{
            display: "flex",
            gap: 10,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              flex: 1,
              textAlign: "center",
              borderRadius: 12,
              padding: "12px 8px",
              background: "rgba(212, 162, 76, 0.06)",
              border: "1px solid rgba(212, 162, 76, 0.12)",
            }}
          >
            <div style={{ fontSize: 14, marginBottom: 2 }}>⭐</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#d4a24c", fontFamily: "'Lora', Georgia, serif" }}>{importance}</div>
            <div style={{ fontSize: 10, color: "rgba(232, 220, 200, 0.4)", fontWeight: 500 }}>
              Importance
            </div>
          </div>
          <div
            style={{
              flex: 1,
              textAlign: "center",
              borderRadius: 12,
              padding: "12px 8px",
              background: "rgba(90, 184, 143, 0.06)",
              border: "1px solid rgba(90, 184, 143, 0.12)",
            }}
          >
            <div style={{ fontSize: 14, marginBottom: 2 }}>💪</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#5ab88f", fontFamily: "'Lora', Georgia, serif" }}>{confidence}</div>
            <div style={{ fontSize: 10, color: "rgba(232, 220, 200, 0.4)", fontWeight: 500 }}>
              Confidence
            </div>
          </div>
        </motion.div>

        {values.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#d4a24c", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
              <span>🪴</span> Rooted in Values
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {values.map((v) => (
                <span
                  key={v}
                  style={{
                    padding: "4px 12px",
                    borderRadius: 14,
                    background: "rgba(212, 162, 76, 0.12)",
                    border: "1px solid rgba(212, 162, 76, 0.2)",
                    color: "#d4a24c",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {v}
                </span>
              ))}
            </div>
            {valueConnections.length > 0 && (
              <div style={{ marginTop: 8 }}>
                {valueConnections.map((vc) => (
                  <div
                    key={vc.value}
                    style={{
                      fontSize: 11,
                      color: "rgba(232, 220, 200, 0.5)",
                      fontStyle: "italic",
                      marginBottom: 3,
                      paddingLeft: 8,
                      borderLeft: "2px solid rgba(212, 162, 76, 0.15)",
                    }}
                  >
                    {vc.value}: &ldquo;{vc.connection}&rdquo;
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#2d7a3a", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
            <span>💐</span> Commitments
          </div>
          {commitments.map((c, i) => (
            <div
              key={c.id}
              style={{
                display: "flex",
                gap: 8,
                fontSize: 13,
                color: "rgba(232, 220, 200, 0.8)",
                marginBottom: 6,
                lineHeight: 1.5,
                padding: "6px 10px",
                background: "rgba(45, 122, 58, 0.06)",
                borderRadius: 8,
                borderLeft: "3px solid rgba(45, 122, 58, 0.3)",
              }}
            >
              <span style={{ color: "#2d7a3a", fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
              {c.text}
            </div>
          ))}
        </motion.div>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <motion.button
            onClick={onReset}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{
              padding: "10px 24px",
              borderRadius: 12,
              background: "rgba(45, 122, 58, 0.1)",
              border: "1px solid rgba(45, 122, 58, 0.2)",
              color: "#5ab88f",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
            }}
          >
            🌱 Plant a New Garden
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: "4px 0",
        }}
      >
        <div style={{ display: "flex", gap: 2 }}>
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              animate={{
                scale: i < commitments.length ? 1 : 0.7,
                opacity: i < commitments.length ? 1 : 0.3,
              }}
              style={{ fontSize: i < commitments.length ? 16 : 12 }}
            >
              {i < commitments.length ? "🌹" : "·"}
            </motion.span>
          ))}
        </div>
        <span
          style={{
            fontSize: 12,
            color: commitments.length >= 1 ? "rgba(90, 184, 143, 0.8)" : "rgba(232, 220, 200, 0.4)",
            fontWeight: 500,
          }}
        >
          {commitments.length} harvested{commitments.length < 1 ? " · pick 1+" : ""}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {options.map((option, i) => {
          const isSelected = commitments.some((c) => c.text === option);
          const isDisabled = !isSelected && commitments.length >= 3;

          return (
            <motion.button
              key={option}
              type="button"
              onClick={() => {
                if (isSelected) {
                  const commitment = commitments.find((c) => c.text === option);
                  if (commitment) onRemoveCommitment(commitment.id);
                } else if (!isDisabled) {
                  onAddCommitment(option);
                }
              }}
              disabled={isDisabled}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: isDisabled ? 0.4 : 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileTap={!isDisabled ? { scale: 0.98 } : {}}
              style={{
                padding: "12px 14px",
                borderRadius: 12,
                border: isSelected
                  ? "1.5px solid rgba(45, 122, 58, 0.6)"
                  : "1px solid rgba(232, 220, 200, 0.08)",
                background: isSelected ? "rgba(45, 122, 58, 0.12)" : "rgba(232, 220, 200, 0.03)",
                color: isSelected ? "#5ab88f" : "rgba(232, 220, 200, 0.65)",
                fontSize: 13,
                fontFamily: "inherit",
                fontWeight: isSelected ? 600 : 400,
                cursor: isDisabled ? "not-allowed" : "pointer",
                textAlign: "left",
                transition: "all 0.2s ease",
                outline: "none",
                display: "flex",
                alignItems: "center",
                gap: 10,
                lineHeight: 1.4,
              }}
            >
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  border: isSelected ? "2px solid #2d7a3a" : "1.5px solid rgba(232, 220, 200, 0.12)",
                  background: isSelected ? "#2d7a3a" : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  fontSize: 11,
                  color: "#e8dcc8",
                  transition: "all 0.2s",
                }}
              >
                {isSelected && "✓"}
              </span>
              {option}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
