import type { AgeMode, AnchorItem } from "./constellation-data";

interface ConstellationMapStepProps {
  anchors: AnchorItem[];
  constellationReflection: string;
  onSetReflection: (t: string) => void;
  ageMode: AgeMode;
}

const CATEGORY_COLORS: Record<string, string> = {
  people: "#80a8d4",
  places: "#80c480",
  practices: "#c4a84c",
};

const CATEGORY_EMOJIS: Record<string, string> = {
  people: "👤",
  places: "📍",
  practices: "🧘",
};

export function ConstellationMapStep({ anchors, constellationReflection, onSetReflection, ageMode }: ConstellationMapStepProps) {
  const displayAnchors = anchors.slice(0, 12);
  const total = displayAnchors.length;
  const radius = 105;
  const centerX = 160;
  const centerY = 160;
  const containerSize = 320;

  const intro = ageMode === "child"
    ? "Look at all the special things and people around you! You are in the middle, and they are like stars around you."
    : "Here is your constellation — you at the center, surrounded by the anchors that help you feel safe.";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <p style={{ margin: 0, fontSize: 13, color: "rgba(232, 220, 200, 0.65)", lineHeight: 1.6, textAlign: "center" }}>
        {intro}
      </p>

      <div
        style={{
          background: "radial-gradient(ellipse at 50% 50%, #0d1530 0%, #06080f 100%)",
          borderRadius: 16,
          border: "1px solid rgba(196, 168, 76, 0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          minHeight: 280,
          position: "relative",
          overflow: "visible",
        }}
      >
        <style>{`
          @keyframes ac-star-pulse { 0%,100% { opacity: 0.6; transform: scale(1); } 50% { opacity: 1; transform: scale(1.08); } }
        `}</style>

        <div
          style={{
            position: "relative",
            width: containerSize,
            height: containerSize,
            flexShrink: 0,
          }}
        >
          {total > 0 && (
            <svg
              style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
              width={containerSize}
              height={containerSize}
            >
              {displayAnchors.map((anchor, i) => {
                const angle = (i / total) * 2 * Math.PI - Math.PI / 2;
                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius;
                return (
                  <line
                    key={anchor.id}
                    x1={centerX}
                    y1={centerY}
                    x2={x}
                    y2={y}
                    stroke="rgba(196, 168, 76, 0.2)"
                    strokeWidth={1}
                    strokeDasharray="3 4"
                  />
                );
              })}
            </svg>
          )}

          <div
            style={{
              position: "absolute",
              left: centerX - 30,
              top: centerY - 30,
              width: 60,
              height: 60,
              borderRadius: "50%",
              background: "rgba(196, 168, 76, 0.2)",
              border: "2px solid rgba(196, 168, 76, 0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 700,
              color: "#c4a84c",
              fontFamily: "Inter, sans-serif",
              zIndex: 2,
              boxShadow: "0 0 20px rgba(196, 168, 76, 0.3)",
            }}
          >
            ✨ Me
          </div>

          {displayAnchors.map((anchor, i) => {
            const angle = (i / total) * 2 * Math.PI - Math.PI / 2;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            const color = CATEGORY_COLORS[anchor.category] || "#c4a84c";
            const emoji = CATEGORY_EMOJIS[anchor.category] || "✨";
            const shortText = anchor.text.length > 8 ? anchor.text.slice(0, 8) + "…" : anchor.text;

            return (
              <div
                key={anchor.id}
                style={{
                  position: "absolute",
                  left: x - 20,
                  top: y - 20,
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "rgba(6, 8, 15, 0.8)",
                  border: `2px solid ${color}`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 2,
                  animation: `ac-star-pulse ${3 + (i % 3)}s ease-in-out infinite ${i * 0.4}s`,
                  boxShadow: `0 0 12px rgba(${color.replace('#','').match(/.{2}/g)?.map(x=>parseInt(x,16)).join(',') || '196,168,76'}, 0.3)`,
                  cursor: "default",
                }}
                title={anchor.text}
              >
                <span style={{ fontSize: 10, lineHeight: 1 }}>{emoji}</span>
              </div>
            );
          })}

          {displayAnchors.map((anchor, i) => {
            const angle = (i / total) * 2 * Math.PI - Math.PI / 2;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            const shortText = anchor.text.length > 8 ? anchor.text.slice(0, 8) + "…" : anchor.text;
            const labelOffset = angle > -Math.PI / 2 && angle < Math.PI / 2 ? 28 : -28;
            const isRight = Math.cos(angle) > 0;

            return (
              <div
                key={`label-${anchor.id}`}
                style={{
                  position: "absolute",
                  left: x + (isRight ? 22 : -22 - 60),
                  top: y - 8,
                  fontSize: 9,
                  color: "rgba(232, 220, 200, 0.55)",
                  whiteSpace: "nowrap",
                  width: 60,
                  textAlign: isRight ? "left" : "right",
                  pointerEvents: "none",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {shortText}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(232, 220, 200, 0.85)" }}>
          🌌 What do you notice when you look at your constellation?
        </label>
        <textarea
          value={constellationReflection}
          onChange={(e) => onSetReflection(e.target.value)}
          placeholder="What stands out to you? What feelings come up?"
          style={{
            width: "100%",
            minHeight: 80,
            background: "rgba(232, 220, 200, 0.04)",
            border: "1px solid rgba(196, 168, 76, 0.18)",
            borderRadius: 10,
            padding: "10px 14px",
            color: "#e8dcc8",
            fontSize: 13,
            fontFamily: "Inter, sans-serif",
            lineHeight: 1.6,
            resize: "vertical",
            outline: "none",
            boxSizing: "border-box",
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(196, 168, 76, 0.45)"; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(196, 168, 76, 0.18)"; }}
        />
        <p style={{ margin: 0, fontSize: 11, color: constellationReflection.length >= 20 ? "rgba(196,168,76,0.6)" : "rgba(232,220,200,0.3)", textAlign: "right" }}>
          {constellationReflection.length}/20 min
        </p>
      </div>
    </div>
  );
}