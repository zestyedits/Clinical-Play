import { useState } from "react";

const EMOTIONS = [
  {
    core: "Happy",
    color: "#f0d060",
    bgColor: "rgba(240, 208, 96, 0.12)",
    related: [
      "Optimistic", "Trusting", "Peaceful", "Powerful", "Accepted", "Proud",
      "Interested", "Content", "Playful", "Joyful", "Inspired", "Amused",
    ],
  },
  {
    core: "Sad",
    color: "#6a9fd8",
    bgColor: "rgba(106, 159, 216, 0.12)",
    related: [
      "Lonely", "Vulnerable", "Despair", "Guilty", "Depressed", "Hurt",
      "Empty", "Abandoned", "Grief", "Helpless", "Disappointed", "Neglected",
    ],
  },
  {
    core: "Angry",
    color: "#d86a6a",
    bgColor: "rgba(216, 106, 106, 0.12)",
    related: [
      "Let Down", "Humiliated", "Bitter", "Frustrated", "Aggressive", "Hostile",
      "Provoked", "Jealous", "Resentful", "Violated", "Irritated", "Infuriated",
    ],
  },
  {
    core: "Fearful",
    color: "#9a7abf",
    bgColor: "rgba(154, 122, 191, 0.12)",
    related: [
      "Scared", "Anxious", "Insecure", "Weak", "Rejected", "Threatened",
      "Nervous", "Worried", "Overwhelmed", "Panicked", "Inadequate", "Inferior",
    ],
  },
  {
    core: "Surprised",
    color: "#e8a050",
    bgColor: "rgba(232, 160, 80, 0.12)",
    related: [
      "Startled", "Confused", "Amazed", "Excited", "Awe", "Dismayed",
      "Shocked", "Moved", "Perplexed", "Astonished", "Speechless", "Stunned",
    ],
  },
  {
    core: "Disgusted",
    color: "#6baa6b",
    bgColor: "rgba(107, 170, 107, 0.12)",
    related: [
      "Disapproving", "Disappointed", "Awful", "Repelled", "Revolted", "Hesitant",
      "Detestable", "Loathing", "Nauseated", "Judgmental", "Contempt", "Aversion",
    ],
  },
];

interface FeelingsWheelProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function FeelingsWheel({ isOpen, onToggle }: FeelingsWheelProps) {
  const [expandedCore, setExpandedCore] = useState<string | null>(null);

  return (
    <>
      <button
        type="button"
        onClick={onToggle}
        data-testid="button-dbt-feelings-wheel"
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close feelings wheel" : "Open feelings wheel"}
        style={{
          position: "absolute",
          left: isOpen ? "min(340px, calc(100vw - 60px))" : 0,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 25,
          background: "rgba(45, 40, 35, 0.92)",
          border: "1px solid rgba(160, 146, 107, 0.3)",
          borderLeft: isOpen ? "none" : "1px solid rgba(160, 146, 107, 0.3)",
          borderRadius: "0 8px 8px 0",
          padding: "10px 8px",
          minWidth: 44,
          minHeight: 44,
          color: "#f0e8d8",
          cursor: "pointer",
          fontFamily: "Inter, sans-serif",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 3,
          backdropFilter: "blur(10px)",
          boxShadow: "2px 0 12px rgba(0,0,0,0.15)",
          transition: "left 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
          writingMode: isOpen ? "horizontal-tb" : "vertical-rl",
          boxSizing: "border-box",
        }}
      >
        <span style={{ fontSize: 14 }}>{"\u{1F3A1}"}</span>
        <span
          style={{
            fontSize: 9,
            fontWeight: 600,
            letterSpacing: isOpen ? 0 : 1,
            whiteSpace: "nowrap",
          }}
        >
          {isOpen ? "\u2190" : "Feelings"}
        </span>
      </button>

      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: "min(340px, calc(100vw - 50px))",
          background: "rgba(45, 40, 35, 0.96)",
          borderRight: "1px solid rgba(160, 146, 107, 0.2)",
          zIndex: 24,
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          backdropFilter: "blur(10px)",
          boxShadow: isOpen ? "4px 0 24px rgba(0,0,0,0.2)" : "none",
        }}
      >
        <div
          style={{
            padding: "14px 16px",
            borderBottom: "1px solid rgba(160, 146, 107, 0.12)",
            flexShrink: 0,
            position: "relative" as const,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 4,
            }}
          >
            <span style={{ fontSize: 18 }}>{"\u{1F3A1}"}</span>
            <h3
              style={{
                margin: 0,
                fontSize: 14,
                fontWeight: 600,
                color: "#f0e8d8",
              }}
            >
              Feelings Wheel
            </h3>
          </div>
          <p
            style={{
              margin: 0,
              fontSize: 10,
              color: "rgba(240, 232, 216, 0.4)",
              lineHeight: 1.5,
            }}
          >
            Tap a core emotion to see related feelings
          </p>
          <button
            onClick={onToggle}
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              background: "rgba(240, 232, 216, 0.1)",
              border: "none",
              borderRadius: 7,
              width: 26,
              height: 26,
              cursor: "pointer",
              color: "rgba(240, 232, 216, 0.5)",
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "Inter, sans-serif",
            }}
          >
            {"\u2715"}
          </button>
        </div>

        <div
          style={{
            padding: "6px 10px",
            borderBottom: "1px solid rgba(160, 146, 107, 0.08)",
            flexShrink: 0,
          }}
        >
          <img
            src="/images/dbt-feelings-wheel-full.png"
            alt="Feelings Wheel"
            style={{
              width: "100%",
              height: 160,
              objectFit: "contain",
              borderRadius: 8,
              background: "rgba(240, 232, 216, 0.04)",
            }}
          />
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "6px 10px 10px",
          }}
        >
          {EMOTIONS.map((emotion) => {
            const isExpanded = expandedCore === emotion.core;
            return (
              <div key={emotion.core} style={{ marginBottom: 3 }}>
                <button
                  onClick={() =>
                    setExpandedCore(isExpanded ? null : emotion.core)
                  }
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 10px",
                    background: isExpanded
                      ? emotion.bgColor
                      : "rgba(240, 232, 216, 0.03)",
                    border: `1px solid ${
                      isExpanded
                        ? `${emotion.color}33`
                        : "rgba(160, 146, 107, 0.08)"
                    }`,
                    borderRadius: isExpanded ? "8px 8px 0 0" : 8,
                    cursor: "pointer",
                    fontFamily: "Inter, sans-serif",
                    transition: "all 0.2s ease",
                    textAlign: "left",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: emotion.color,
                        boxShadow: `0 0 6px ${emotion.color}66`,
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#f0e8d8",
                      }}
                    >
                      {emotion.core}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      color: "rgba(240, 232, 216, 0.35)",
                      transform: isExpanded
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                      transition: "transform 0.2s ease",
                    }}
                  >
                    {"\u25BC"}
                  </span>
                </button>
                {isExpanded && (
                  <div
                    style={{
                      background: emotion.bgColor,
                      borderRadius: "0 0 8px 8px",
                      border: `1px solid ${emotion.color}33`,
                      borderTop: "none",
                      padding: "6px 8px 8px",
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 4,
                      animation: "fadeIn 0.2s ease",
                    }}
                  >
                    {emotion.related.map((r) => (
                      <span
                        key={r}
                        style={{
                          fontSize: 10,
                          padding: "3px 8px",
                          borderRadius: 5,
                          background: `${emotion.color}18`,
                          border: `1px solid ${emotion.color}25`,
                          color: "rgba(240, 232, 216, 0.75)",
                          fontFamily: "Inter, sans-serif",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
