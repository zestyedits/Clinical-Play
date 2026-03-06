import { useRef } from "react";
import { motion } from "framer-motion";
import type { AgeMode } from "./council-data";
import { PART_ARCHETYPES, CATEGORIES } from "./council-data";

interface PartState {
  archetypeId: string;
  concern: string;
  selfResponse: string;
  heard: boolean;
}

interface CouncilSummaryProps {
  selectedParts: PartState[];
  ageMode: AgeMode;
  onNewCouncil: () => void;
}

const AMBER = "#b8860b";
const SELF_ACCENT = "#5f9ea0";
const CANDLELIGHT = "#f4e4bc";
const SHADOW = "#2a1f14";
const STONE = "#8b7355";

const SERIF = "'Georgia', 'Times New Roman', serif";
const MONO = "'Courier New', monospace";

export function CouncilSummary({
  selectedParts,
  ageMode,
  onNewCouncil,
}: CouncilSummaryProps) {
  const summaryRef = useRef<HTMLDivElement>(null);

  const now = new Date();
  const caseNumber = `IC-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(Date.now()).slice(-5)}`;
  const dateStr = now.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleExport = async () => {
    if (!summaryRef.current) return;
    const { default: html2canvas } = await import("html2canvas");
    const canvas = await html2canvas(summaryRef.current, {
      backgroundColor: SHADOW,
    });
    const link = document.createElement("a");
    link.download = `inner-council-record-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  // ── Mini SVG Council Table ────────────────────────────────────────────────
  const miniCx = 100;
  const miniCy = 100;
  const miniTableR = 30;
  const miniSeatR = 65;
  const totalSeats = selectedParts.length + 1;
  const angleStep = (2 * Math.PI) / totalSeats;
  const selfAngle = -Math.PI / 2;

  const selfPos = {
    x: miniCx + miniSeatR * Math.cos(selfAngle),
    y: miniCy + miniSeatR * Math.sin(selfAngle),
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        width: "100%",
        maxWidth: 600,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      {/* Exportable area */}
      <div
        ref={summaryRef}
        style={{
          background: SHADOW,
          borderRadius: 10,
          border: `1.5px solid ${AMBER}66`,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: `linear-gradient(135deg, #1a1208, ${SHADOW})`,
            padding: "14px 20px 12px",
            borderBottom: `1.5px solid ${AMBER}66`,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: `${AMBER}25`,
              border: `1.5px solid ${AMBER}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg viewBox="0 0 24 24" width={16} height={16}>
              <circle cx={12} cy={12} r={8} fill="none" stroke={AMBER} strokeWidth={1.5} />
              <circle cx={12} cy={12} r={3} fill={AMBER} opacity={0.6} />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <h2
              style={{
                fontFamily: SERIF,
                fontSize: 18,
                color: AMBER,
                margin: 0,
                letterSpacing: 2,
                textTransform: "uppercase",
                fontWeight: 700,
              }}
            >
              Inner Council
            </h2>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 10,
                  color: `${CANDLELIGHT}80`,
                  marginTop: 2,
                }}
              >
                {caseNumber}
              </span>
              <span
                style={{
                  fontFamily: SERIF,
                  fontSize: 10,
                  color: `${CANDLELIGHT}55`,
                  marginTop: 2,
                }}
              >
                {dateStr}
              </span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "14px 16px" }}>
          {/* Mini SVG round table */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: 14,
              paddingBottom: 14,
              borderBottom: `1px solid ${AMBER}33`,
            }}
          >
            <svg
              viewBox="0 0 200 200"
              style={{ width: 180, maxWidth: "100%", height: "auto" }}
            >
              {/* Decorative rings */}
              {[85, 78].map((r) => (
                <circle
                  key={`ring-${r}`}
                  cx={miniCx}
                  cy={miniCy}
                  r={r}
                  fill="none"
                  stroke={`${STONE}12`}
                  strokeWidth={0.5}
                />
              ))}

              {/* Seat ring */}
              <circle
                cx={miniCx}
                cy={miniCy}
                r={miniSeatR}
                fill="none"
                stroke={`${STONE}15`}
                strokeWidth={0.75}
                strokeDasharray="3 5"
              />

              {/* Table */}
              <circle
                cx={miniCx}
                cy={miniCy}
                r={miniTableR}
                fill={`#1a1208`}
                stroke={STONE}
                strokeWidth={1.5}
              />
              <text
                x={miniCx}
                y={miniCy}
                textAnchor="middle"
                dominantBaseline="central"
                style={{
                  fontFamily: SERIF,
                  fontSize: 7,
                  fontWeight: 700,
                  fill: `${CANDLELIGHT}50`,
                  letterSpacing: 2,
                }}
              >
                COUNCIL
              </text>

              {/* Self seat */}
              <circle
                cx={selfPos.x}
                cy={selfPos.y}
                r={12}
                fill={`${SELF_ACCENT}33`}
                stroke={SELF_ACCENT}
                strokeWidth={1.5}
              />
              <circle
                cx={selfPos.x}
                cy={selfPos.y}
                r={4}
                fill={SELF_ACCENT}
                opacity={0.6}
              />
              <text
                x={selfPos.x}
                y={selfPos.y + 18}
                textAnchor="middle"
                style={{
                  fontFamily: SERIF,
                  fontSize: 7,
                  fontWeight: 700,
                  fill: SELF_ACCENT,
                }}
              >
                Self
              </text>

              {/* Part seats */}
              {selectedParts.map((part, i) => {
                const angle = selfAngle + angleStep * (i + 1);
                const px = miniCx + miniSeatR * Math.cos(angle);
                const py = miniCy + miniSeatR * Math.sin(angle);
                const archetype = PART_ARCHETYPES.find(
                  (a) => a.id === part.archetypeId
                );
                if (!archetype) return null;
                return (
                  <g key={archetype.id}>
                    <circle
                      cx={px}
                      cy={py}
                      r={12}
                      fill={`${archetype.color}33`}
                      stroke={archetype.color}
                      strokeWidth={1}
                    />
                    <svg
                      x={px - 5}
                      y={py - 5}
                      width={10}
                      height={10}
                      viewBox="0 0 24 24"
                    >
                      <path d={archetype.iconPath} fill={archetype.color} />
                    </svg>
                    <text
                      x={px}
                      y={py + 18}
                      textAnchor="middle"
                      style={{
                        fontFamily: SERIF,
                        fontSize: 6,
                        fontWeight: 600,
                        fill: CANDLELIGHT,
                      }}
                    >
                      {archetype.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Council Dialogue section */}
          <div
            style={{
              fontFamily: SERIF,
              fontSize: 11,
              color: AMBER,
              textTransform: "uppercase",
              letterSpacing: 1.5,
              fontWeight: 600,
              marginBottom: 10,
            }}
          >
            Council Dialogue
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {selectedParts.map((part) => {
              const archetype = PART_ARCHETYPES.find(
                (a) => a.id === part.archetypeId
              );
              if (!archetype) return null;
              const categoryInfo = CATEGORIES.find(
                (c) => c.category === archetype.category
              );

              return (
                <div
                  key={part.archetypeId}
                  style={{
                    borderLeft: `2px solid ${archetype.color}55`,
                    paddingLeft: 12,
                    paddingBottom: 4,
                  }}
                >
                  {/* Part name + category badge */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 4,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: SERIF,
                        fontSize: 13,
                        fontWeight: 700,
                        color: archetype.color,
                      }}
                    >
                      {archetype.name}
                    </span>
                    {categoryInfo && (
                      <span
                        style={{
                          fontSize: 8,
                          fontWeight: 600,
                          padding: "1px 6px",
                          borderRadius: 8,
                          background: `${categoryInfo.color}22`,
                          color: categoryInfo.color,
                          textTransform: "uppercase",
                          letterSpacing: 0.5,
                        }}
                      >
                        {categoryInfo.label}
                      </span>
                    )}
                  </div>

                  {/* What they said */}
                  <div
                    style={{
                      fontFamily: SERIF,
                      fontSize: 12,
                      color: `${CANDLELIGHT}BB`,
                      lineHeight: 1.5,
                      marginBottom: 4,
                    }}
                  >
                    "{part.concern}"
                  </div>

                  {/* Self's response */}
                  {part.selfResponse && (
                    <div
                      style={{
                        fontFamily: SERIF,
                        fontSize: 12,
                        color: SELF_ACCENT,
                        fontStyle: "italic",
                        lineHeight: 1.5,
                        paddingLeft: 8,
                        borderLeft: `1.5px solid ${SELF_ACCENT}40`,
                      }}
                    >
                      Self: "{part.selfResponse}"
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action buttons (outside exportable area) */}
      <div
        style={{
          display: "flex",
          gap: 12,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleExport}
          style={{
            padding: "10px 24px",
            borderRadius: 8,
            border: "none",
            background: `linear-gradient(135deg, ${AMBER}, #8b6914)`,
            color: "#1a1208",
            fontSize: 14,
            fontWeight: 700,
            fontFamily: SERIF,
            cursor: "pointer",
            letterSpacing: 0.5,
          }}
        >
          Save Council Record
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onNewCouncil}
          style={{
            padding: "10px 24px",
            borderRadius: 8,
            border: `1.5px solid ${AMBER}66`,
            background: "transparent",
            color: AMBER,
            fontSize: 14,
            fontWeight: 600,
            fontFamily: SERIF,
            cursor: "pointer",
            letterSpacing: 0.5,
          }}
        >
          New Council
        </motion.button>
      </div>
    </motion.div>
  );
}
