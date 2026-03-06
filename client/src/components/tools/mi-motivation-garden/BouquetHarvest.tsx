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
          background: "linear-gradient(170deg, #0a1f14 0%, #152520 50%, #0d1814 100%)",
          borderRadius: 16,
          padding: "24px 20px",
          border: "1px solid rgba(45, 122, 58, 0.2)",
          maxWidth: 520,
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>{"\uD83D\uDC90"}</div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#d4a24c" }}>
            Your Motivation Bouquet
          </h2>
          <div style={{ fontSize: 12, color: "rgba(232, 220, 200, 0.4)", marginTop: 4 }}>
            {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </div>
        </div>

        {/* Topic */}
        {topic && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "12px 16px",
              background: `${topic.color}12`,
              borderRadius: 12,
              border: `1px solid ${topic.color}25`,
              marginBottom: 16,
            }}
          >
            <span style={{ fontSize: 22 }}>{topic.icon}</span>
            <div>
              <div style={{ fontSize: 12, color: "rgba(232, 220, 200, 0.5)", fontWeight: 600 }}>
                Garden Plot
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#e8dcc8" }}>
                {topic.name}
              </div>
            </div>
          </div>
        )}

        {/* Seeds */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#5ab88f", marginBottom: 8 }}>
            {"\uD83C\uDF31"} Seeds Planted (Change Talk)
          </div>
          {DARN_CATEGORIES.map((cat) => {
            const catSeeds = seeds.filter((s) => s.category === cat.category);
            if (catSeeds.length === 0) return null;
            return (
              <div key={cat.category} style={{ marginBottom: 6 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: cat.color, marginBottom: 3 }}>
                  {cat.label}
                </div>
                {catSeeds.map((seed) => (
                  <div
                    key={seed.id}
                    style={{
                      fontSize: 13,
                      color: "rgba(232, 220, 200, 0.7)",
                      paddingLeft: 12,
                      borderLeft: `2px solid ${cat.color}40`,
                      marginBottom: 3,
                      lineHeight: 1.4,
                    }}
                  >
                    {seed.text}
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {/* Weeds */}
        {weeds.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#9b8ec4", marginBottom: 8 }}>
              {"\uD83C\uDF3F"} Weeds Noticed (Sustain Talk)
            </div>
            {WEED_CATEGORIES.map((cat) => {
              const catWeeds = weeds.filter((w) => w.category === cat.category);
              if (catWeeds.length === 0) return null;
              return (
                <div key={cat.category} style={{ marginBottom: 6 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: cat.color, marginBottom: 3 }}>
                    {cat.label}
                  </div>
                  {catWeeds.map((weed) => (
                    <div
                      key={weed.id}
                      style={{
                        fontSize: 13,
                        color: "rgba(232, 220, 200, 0.6)",
                        paddingLeft: 12,
                        borderLeft: `2px solid ${cat.color}40`,
                        marginBottom: 3,
                        lineHeight: 1.4,
                      }}
                    >
                      {weed.text}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}

        {/* Importance & Confidence */}
        <div
          style={{
            display: "flex",
            gap: 16,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              flex: 1,
              textAlign: "center",
              background: "rgba(212, 162, 76, 0.08)",
              borderRadius: 10,
              padding: "12px 8px",
              border: "1px solid rgba(212, 162, 76, 0.15)",
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 700, color: "#d4a24c" }}>{importance}</div>
            <div style={{ fontSize: 11, color: "rgba(232, 220, 200, 0.5)", fontWeight: 600 }}>
              Importance
            </div>
          </div>
          <div
            style={{
              flex: 1,
              textAlign: "center",
              background: "rgba(90, 184, 143, 0.08)",
              borderRadius: 10,
              padding: "12px 8px",
              border: "1px solid rgba(90, 184, 143, 0.15)",
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 700, color: "#5ab88f" }}>{confidence}</div>
            <div style={{ fontSize: 11, color: "rgba(232, 220, 200, 0.5)", fontWeight: 600 }}>
              Confidence
            </div>
          </div>
        </div>

        {/* Values */}
        {values.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#d4a24c", marginBottom: 8 }}>
              {"\uD83E\uDEB4"} Rooted in Values
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {values.map((v) => (
                <span
                  key={v}
                  style={{
                    padding: "4px 12px",
                    borderRadius: 16,
                    background: "rgba(212, 162, 76, 0.15)",
                    border: "1px solid rgba(212, 162, 76, 0.25)",
                    color: "#d4a24c",
                    fontSize: 13,
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
                      fontSize: 12,
                      color: "rgba(232, 220, 200, 0.6)",
                      fontStyle: "italic",
                      marginBottom: 3,
                    }}
                  >
                    {vc.value}: &ldquo;{vc.connection}&rdquo;
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Commitments */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#2d7a3a", marginBottom: 8 }}>
            {"\uD83D\uDC90"} Harvested Commitments
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
              }}
            >
              <span style={{ color: "#2d7a3a", fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
              {c.text}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button
            onClick={onReset}
            style={{
              padding: "10px 24px",
              borderRadius: 10,
              background: "rgba(232, 220, 200, 0.08)",
              border: "1px solid rgba(232, 220, 200, 0.15)",
              color: "rgba(232, 220, 200, 0.7)",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
            }}
          >
            Plant a New Garden
          </button>
        </div>
      </div>
    );
  }

  // Commitment selection view
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Count */}
      <div
        style={{
          textAlign: "center",
          fontSize: 13,
          color: commitments.length >= 1 ? "rgba(90, 184, 143, 0.8)" : "rgba(232, 220, 200, 0.5)",
          fontWeight: 600,
        }}
      >
        {commitments.length} commitment{commitments.length !== 1 ? "s" : ""} harvested
        {commitments.length < 1 && " \u2014 harvest at least 1"}
      </div>

      {/* Options */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {options.map((option) => {
          const isSelected = commitments.some((c) => c.text === option);

          return (
            <button
              key={option}
              type="button"
              onClick={() => {
                if (isSelected) {
                  const commitment = commitments.find((c) => c.text === option);
                  if (commitment) onRemoveCommitment(commitment.id);
                } else if (commitments.length < 3) {
                  onAddCommitment(option);
                }
              }}
              disabled={!isSelected && commitments.length >= 3}
              style={{
                padding: "12px 16px",
                borderRadius: 12,
                border: isSelected
                  ? "2px solid #2d7a3a"
                  : "1px solid rgba(232, 220, 200, 0.15)",
                background: isSelected ? "rgba(45, 122, 58, 0.2)" : "rgba(12, 24, 18, 0.5)",
                color: isSelected ? "#5ab88f" : "rgba(232, 220, 200, 0.75)",
                fontSize: 14,
                fontFamily: "inherit",
                fontWeight: isSelected ? 600 : 400,
                cursor: !isSelected && commitments.length >= 3 ? "not-allowed" : "pointer",
                opacity: !isSelected && commitments.length >= 3 ? 0.5 : 1,
                textAlign: "left",
                transition: "all 0.15s ease",
                outline: "none",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  border: isSelected ? "2px solid #2d7a3a" : "2px solid rgba(232, 220, 200, 0.2)",
                  background: isSelected ? "#2d7a3a" : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  fontSize: 12,
                  color: "#e8dcc8",
                }}
              >
                {isSelected && "\u2713"}
              </span>
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
