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
          borderRadius: 12,
          padding: "20px 16px",
          maxWidth: 520,
          margin: "0 auto",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 36, marginBottom: 6 }}>💐</div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#d4a24c" }}>
            Your Motivation Bouquet
          </h2>
          <div style={{ fontSize: 11, color: "rgba(232, 220, 200, 0.35)", marginTop: 3 }}>
            {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </div>
        </div>

        {topic && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 12px",
              borderLeft: `3px solid ${topic.color}`,
              borderRadius: 6,
              marginBottom: 14,
            }}
          >
            <span style={{ fontSize: 18 }}>{topic.icon}</span>
            <div>
              <div style={{ fontSize: 11, color: "rgba(232, 220, 200, 0.4)", fontWeight: 500 }}>
                Garden Plot
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#e8dcc8" }}>
                {topic.name}
              </div>
            </div>
          </div>
        )}

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#5ab88f", marginBottom: 6 }}>
            🌱 Seeds Planted
          </div>
          {DARN_CATEGORIES.map((cat) => {
            const catSeeds = seeds.filter((s) => s.category === cat.category);
            if (catSeeds.length === 0) return null;
            return (
              <div key={cat.category} style={{ marginBottom: 4 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: cat.color, marginBottom: 2, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  {cat.label}
                </div>
                {catSeeds.map((seed) => (
                  <div
                    key={seed.id}
                    style={{
                      fontSize: 12,
                      color: "rgba(232, 220, 200, 0.65)",
                      paddingLeft: 10,
                      borderLeft: `2px solid ${cat.color}30`,
                      marginBottom: 2,
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

        {weeds.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#9b8ec4", marginBottom: 6 }}>
              🌿 Weeds Noticed
            </div>
            {WEED_CATEGORIES.map((cat) => {
              const catWeeds = weeds.filter((w) => w.category === cat.category);
              if (catWeeds.length === 0) return null;
              return (
                <div key={cat.category} style={{ marginBottom: 4 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: cat.color, marginBottom: 2, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    {cat.label}
                  </div>
                  {catWeeds.map((weed) => (
                    <div
                      key={weed.id}
                      style={{
                        fontSize: 12,
                        color: "rgba(232, 220, 200, 0.55)",
                        paddingLeft: 10,
                        borderLeft: `2px solid ${cat.color}30`,
                        marginBottom: 2,
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

        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 14,
          }}
        >
          <div
            style={{
              flex: 1,
              textAlign: "center",
              borderLeft: "3px solid rgba(212, 162, 76, 0.4)",
              borderRadius: 6,
              padding: "8px 6px",
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 700, color: "#d4a24c" }}>{importance}</div>
            <div style={{ fontSize: 10, color: "rgba(232, 220, 200, 0.4)", fontWeight: 500 }}>
              Importance
            </div>
          </div>
          <div
            style={{
              flex: 1,
              textAlign: "center",
              borderLeft: "3px solid rgba(90, 184, 143, 0.4)",
              borderRadius: 6,
              padding: "8px 6px",
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 700, color: "#5ab88f" }}>{confidence}</div>
            <div style={{ fontSize: 10, color: "rgba(232, 220, 200, 0.4)", fontWeight: 500 }}>
              Confidence
            </div>
          </div>
        </div>

        {values.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#d4a24c", marginBottom: 6 }}>
              🪴 Rooted in Values
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {values.map((v) => (
                <span
                  key={v}
                  style={{
                    padding: "3px 10px",
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
              <div style={{ marginTop: 6 }}>
                {valueConnections.map((vc) => (
                  <div
                    key={vc.value}
                    style={{
                      fontSize: 11,
                      color: "rgba(232, 220, 200, 0.5)",
                      fontStyle: "italic",
                      marginBottom: 2,
                    }}
                  >
                    {vc.value}: &ldquo;{vc.connection}&rdquo;
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#2d7a3a", marginBottom: 6 }}>
            💐 Harvested Commitments
          </div>
          {commitments.map((c, i) => (
            <div
              key={c.id}
              style={{
                display: "flex",
                gap: 6,
                fontSize: 12,
                color: "rgba(232, 220, 200, 0.75)",
                marginBottom: 4,
                lineHeight: 1.45,
              }}
            >
              <span style={{ color: "#2d7a3a", fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
              {c.text}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <button
            onClick={onReset}
            style={{
              padding: "8px 20px",
              borderRadius: 8,
              background: "transparent",
              border: "1px solid rgba(232, 220, 200, 0.12)",
              color: "rgba(232, 220, 200, 0.6)",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
              transition: "all 0.15s",
            }}
          >
            Plant a New Garden
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div
        style={{
          textAlign: "center",
          fontSize: 12,
          color: commitments.length >= 1 ? "rgba(90, 184, 143, 0.8)" : "rgba(232, 220, 200, 0.4)",
          fontWeight: 500,
        }}
      >
        {commitments.length} commitment{commitments.length !== 1 ? "s" : ""} harvested
        {commitments.length < 1 && " — harvest at least 1"}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
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
                padding: "10px 12px",
                borderRadius: 8,
                border: isSelected
                  ? "1.5px solid #2d7a3a"
                  : "1px solid rgba(232, 220, 200, 0.1)",
                background: isSelected ? "rgba(45, 122, 58, 0.15)" : "transparent",
                color: isSelected ? "#5ab88f" : "rgba(232, 220, 200, 0.65)",
                fontSize: 13,
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
                lineHeight: 1.4,
              }}
            >
              <span
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  border: isSelected ? "2px solid #2d7a3a" : "1.5px solid rgba(232, 220, 200, 0.15)",
                  background: isSelected ? "#2d7a3a" : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  fontSize: 11,
                  color: "#e8dcc8",
                }}
              >
                {isSelected && "✓"}
              </span>
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
