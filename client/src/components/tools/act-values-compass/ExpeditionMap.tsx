import { useRef } from "react";
import { motion } from "framer-motion";
import html2canvas from "html2canvas";
import type { AgeMode, BarrierType } from "./compass-data";
import { LIFE_DOMAINS, BARRIER_TYPES } from "./compass-data";

interface DomainState {
  domainId: string;
  values: string[];
  alignment: number;
}

interface Barrier {
  id: string;
  domainId: string;
  text: string;
  type: BarrierType;
  defusionTechnique: string;
  defusedText: string;
}

interface CommittedActionItem {
  domainId: string;
  action: string;
}

interface ExpeditionMapProps {
  ageMode: AgeMode;
  domains: DomainState[];
  barriers: Barrier[];
  committedActions: CommittedActionItem[];
  onNewExpedition: () => void;
}

export function ExpeditionMap({
  ageMode,
  domains,
  barriers,
  committedActions,
  onNewExpedition,
}: ExpeditionMapProps) {
  const summaryRef = useRef<HTMLDivElement>(null);

  const now = new Date();
  const caseNumber = `VC-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(Date.now()).slice(-5)}`;

  const handleExport = async () => {
    if (!summaryRef.current) return;
    const canvas = await html2canvas(summaryRef.current, {
      backgroundColor: "#1a2530",
    });
    const link = document.createElement("a");
    link.download = `values-compass-expedition-map-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const getDomain = (domainId: string) =>
    LIFE_DOMAINS.find((d) => d.id === domainId);

  const getBarrierTypeInfo = (type: BarrierType) =>
    BARRIER_TYPES.find((b) => b.type === type);

  // Group barriers by domain
  const barriersByDomain: Record<string, Barrier[]> = {};
  for (const barrier of barriers) {
    if (!barriersByDomain[barrier.domainId]) {
      barriersByDomain[barrier.domainId] = [];
    }
    barriersByDomain[barrier.domainId].push(barrier);
  }

  // ── Radar Chart Math ──────────────────────────────────────────────────────
  const cx = 150;
  const cy = 150;
  const radius = 120;
  const spokeCount = 6;

  const spokeAngle = (i: number) => ((i * 60 - 90) * Math.PI) / 180;

  const spokeEndpoint = (i: number) => ({
    x: cx + radius * Math.cos(spokeAngle(i)),
    y: cy + radius * Math.sin(spokeAngle(i)),
  });

  const dataPoint = (i: number, alignment: number) => ({
    x: cx + (alignment / 10) * radius * Math.cos(spokeAngle(i)),
    y: cy + (alignment / 10) * radius * Math.sin(spokeAngle(i)),
  });

  // Build polygon points from domain data (in LIFE_DOMAINS order)
  const polygonPoints = LIFE_DOMAINS.map((ld, i) => {
    const domainState = domains.find((d) => d.domainId === ld.id);
    const alignment = domainState ? domainState.alignment : 0;
    const pt = dataPoint(i, alignment);
    return `${pt.x},${pt.y}`;
  }).join(" ");

  // ── Shared Styles ─────────────────────────────────────────────────────────
  const sectionStyle: React.CSSProperties = {
    borderBottom: "1px solid rgba(201, 168, 76, 0.3)",
    paddingBottom: 16,
    marginBottom: 16,
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "'Georgia', 'Times New Roman', serif",
    fontSize: 13,
    color: "#c9a84c",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 6,
    fontWeight: 600,
  };

  const bodyTextStyle: React.CSSProperties = {
    fontFamily: "'Georgia', 'Times New Roman', serif",
    fontSize: 15,
    color: "#f0e8d8",
    lineHeight: 1.6,
  };

  const alignmentBarBg: React.CSSProperties = {
    height: 10,
    borderRadius: 5,
    background: "rgba(26, 37, 48, 0.8)",
    width: "100%",
    overflow: "hidden",
  };

  const alignmentBarFill = (value: number, color: string): React.CSSProperties => ({
    height: "100%",
    width: `${(value / 10) * 100}%`,
    borderRadius: 5,
    background: color,
    transition: "width 0.6s ease",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        width: "100%",
        maxWidth: 720,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      {/* Printable Summary Area */}
      <div
        ref={summaryRef}
        style={{
          background: "#1a2530",
          borderRadius: 12,
          border: "2px solid rgba(201, 168, 76, 0.4)",
          overflow: "hidden",
        }}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div
          style={{
            background: "linear-gradient(135deg, #1a2530, #223040)",
            padding: "clamp(16px, 3vw, 28px) clamp(16px, 3vw, 28px) 20px",
            borderBottom: "2px solid rgba(201, 168, 76, 0.4)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 8, lineHeight: 1 }}>
            {"\uD83E\uDDED"}
          </div>
          <h2
            style={{
              fontFamily: "'Georgia', 'Times New Roman', serif",
              fontSize: 26,
              color: "#c9a84c",
              margin: 0,
              letterSpacing: 4,
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            The Values Compass
          </h2>
          <div
            style={{
              fontFamily: "'Georgia', 'Times New Roman', serif",
              fontSize: 12,
              color: "rgba(240, 232, 216, 0.5)",
              marginTop: 6,
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            Expedition Map
          </div>
          <div
            style={{
              marginTop: 12,
              height: 2,
              background: "linear-gradient(90deg, transparent, #c9a84c, transparent)",
            }}
          />
        </div>

        {/* ── Document Body ──────────────────────────────────────────────── */}
        <div style={{ padding: "clamp(16px, 3vw, 24px) clamp(16px, 3vw, 28px)" }}>
          {/* Case Number */}
          <div style={sectionStyle}>
            <div style={labelStyle}>Case Number</div>
            <div
              style={{
                ...bodyTextStyle,
                fontSize: 17,
                fontWeight: 700,
                color: "#c9a84c",
                fontFamily: "'Courier New', monospace",
              }}
            >
              {caseNumber}
            </div>
          </div>

          {/* ── Radar / Spider Chart ───────────────────────────────────── */}
          <div style={sectionStyle}>
            <div style={labelStyle}>Values Alignment Compass</div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "12px 0",
              }}
            >
              <svg
                viewBox="0 0 300 300"
                style={{ width: "100%", maxWidth: 300, height: "auto" }}
              >
                {/* Background rings at 25%, 50%, 75%, 100% */}
                {[0.25, 0.5, 0.75, 1].map((scale) => (
                  <polygon
                    key={scale}
                    points={Array.from({ length: spokeCount }, (_, i) => {
                      const x = cx + radius * scale * Math.cos(spokeAngle(i));
                      const y = cy + radius * scale * Math.sin(spokeAngle(i));
                      return `${x},${y}`;
                    }).join(" ")}
                    fill="none"
                    stroke="rgba(201, 168, 76, 0.15)"
                    strokeWidth={1}
                  />
                ))}

                {/* Spokes */}
                {LIFE_DOMAINS.map((_, i) => {
                  const end = spokeEndpoint(i);
                  return (
                    <line
                      key={`spoke-${i}`}
                      x1={cx}
                      y1={cy}
                      x2={end.x}
                      y2={end.y}
                      stroke="rgba(201, 168, 76, 0.2)"
                      strokeWidth={1}
                    />
                  );
                })}

                {/* Data polygon */}
                <polygon
                  points={polygonPoints}
                  fill="rgba(45, 138, 138, 0.2)"
                  stroke="#2d8a8a"
                  strokeWidth={2}
                />

                {/* Data points */}
                {LIFE_DOMAINS.map((ld, i) => {
                  const domainState = domains.find((d) => d.domainId === ld.id);
                  const alignment = domainState ? domainState.alignment : 0;
                  const pt = dataPoint(i, alignment);
                  return (
                    <circle
                      key={`point-${i}`}
                      cx={pt.x}
                      cy={pt.y}
                      r={4}
                      fill="#2d8a8a"
                      stroke="#e8dcc8"
                      strokeWidth={1.5}
                    />
                  );
                })}

                {/* Spoke labels (domain name + values) */}
                {LIFE_DOMAINS.map((ld, i) => {
                  const domainState = domains.find((d) => d.domainId === ld.id);
                  const valuesText =
                    domainState && domainState.values.length > 0
                      ? domainState.values.join(", ")
                      : "";
                  const alignment = domainState ? domainState.alignment : 0;
                  const angle = spokeAngle(i);
                  const labelRadius = radius + 28;
                  const lx = cx + labelRadius * Math.cos(angle);
                  const ly = cy + labelRadius * Math.sin(angle);
                  // Determine text anchor based on position
                  const angleDeg = (i * 60 - 90 + 360) % 360;
                  let anchor: string = "middle";
                  if (angleDeg > 20 && angleDeg < 160) anchor = "start";
                  if (angleDeg > 200 && angleDeg < 340) anchor = "end";

                  return (
                    <g key={`label-${i}`}>
                      <text
                        x={lx}
                        y={ly}
                        textAnchor={anchor}
                        dominantBaseline="central"
                        style={{
                          fontFamily: "'Georgia', 'Times New Roman', serif",
                          fontSize: 10,
                          fontWeight: 700,
                          fill: ld.color,
                        }}
                      >
                        {ld.name}
                      </text>
                      {valuesText && (
                        <text
                          x={lx}
                          y={ly + 12}
                          textAnchor={anchor}
                          dominantBaseline="central"
                          style={{
                            fontFamily: "'Georgia', 'Times New Roman', serif",
                            fontSize: 7,
                            fill: "rgba(240, 232, 216, 0.6)",
                          }}
                        >
                          {valuesText.length > 24
                            ? valuesText.slice(0, 22) + "..."
                            : valuesText}
                        </text>
                      )}
                      <text
                        x={lx}
                        y={ly + (valuesText ? 23 : 12)}
                        textAnchor={anchor}
                        dominantBaseline="central"
                        style={{
                          fontFamily: "'Courier New', monospace",
                          fontSize: 8,
                          fill: "#2d8a8a",
                          fontWeight: 700,
                        }}
                      >
                        {alignment}/10
                      </text>
                    </g>
                  );
                })}

                {/* Center dot */}
                <circle cx={cx} cy={cy} r={3} fill="#c9a84c" opacity={0.5} />
              </svg>
            </div>
          </div>

          {/* ── Values Section ─────────────────────────────────────────── */}
          <div style={sectionStyle}>
            <div style={labelStyle}>Charted Values</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {LIFE_DOMAINS.map((ld) => {
                const domainState = domains.find((d) => d.domainId === ld.id);
                if (!domainState || domainState.values.length === 0) return null;
                return (
                  <div key={ld.id}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 4,
                      }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        width={20}
                        height={20}
                        style={{ flexShrink: 0 }}
                      >
                        <path d={ld.iconPath} fill={ld.color} />
                      </svg>
                      <span
                        style={{
                          ...bodyTextStyle,
                          fontSize: 14,
                          fontWeight: 700,
                          color: ld.color,
                        }}
                      >
                        {ld.name}
                      </span>
                      <span
                        style={{
                          ...bodyTextStyle,
                          fontSize: 14,
                          color: "#f0e8d8",
                          flex: 1,
                        }}
                      >
                        {domainState.values.join(", ")}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        paddingLeft: 28,
                      }}
                    >
                      <div style={{ flex: 1, ...alignmentBarBg }}>
                        <div
                          style={alignmentBarFill(
                            domainState.alignment,
                            ld.color,
                          )}
                        />
                      </div>
                      <span
                        style={{
                          fontFamily: "'Courier New', monospace",
                          fontSize: 12,
                          color: "#2d8a8a",
                          fontWeight: 700,
                          minWidth: 32,
                          textAlign: "right",
                        }}
                      >
                        {domainState.alignment}/10
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Barriers & Defusion Section ─────────────────────────────── */}
          {barriers.length > 0 && (
            <div style={sectionStyle}>
              <div style={labelStyle}>Barriers & Defusion</div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                {Object.entries(barriersByDomain).map(
                  ([domainId, domainBarriers]) => {
                    const domain = getDomain(domainId);
                    if (!domain) return null;
                    return (
                      <div key={domainId}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            marginBottom: 8,
                          }}
                        >
                          <svg viewBox="0 0 24 24" width={16} height={16}>
                            <path d={domain.iconPath} fill={domain.color} />
                          </svg>
                          <span
                            style={{
                              ...bodyTextStyle,
                              fontSize: 13,
                              fontWeight: 700,
                              color: domain.color,
                            }}
                          >
                            {domain.name}
                          </span>
                        </div>
                        {domainBarriers.map((barrier) => {
                          const typeInfo = getBarrierTypeInfo(barrier.type);
                          return (
                            <div
                              key={barrier.id}
                              style={{
                                background: "rgba(26, 37, 48, 0.6)",
                                borderRadius: 8,
                                padding: "10px 14px",
                                marginBottom: 6,
                                marginLeft: 22,
                              }}
                            >
                              <span
                                style={{
                                  display: "inline-block",
                                  padding: "2px 8px",
                                  borderRadius: 10,
                                  background: typeInfo
                                    ? `${typeInfo.color}22`
                                    : "rgba(201, 168, 76, 0.15)",
                                  border: `1px solid ${typeInfo ? typeInfo.color : "#c9a84c"}44`,
                                  fontSize: 11,
                                  color: typeInfo
                                    ? typeInfo.color
                                    : "#c9a84c",
                                  fontFamily:
                                    "'Georgia', 'Times New Roman', serif",
                                  fontWeight: 600,
                                  marginBottom: 6,
                                }}
                              >
                                {typeInfo ? typeInfo.icon : ""}{" "}
                                {typeInfo ? typeInfo.label : barrier.type}
                              </span>
                              <div
                                style={{
                                  ...bodyTextStyle,
                                  fontSize: 13,
                                  marginTop: 4,
                                }}
                              >
                                <span
                                  style={{
                                    textDecoration: "line-through",
                                    color: "rgba(240, 232, 216, 0.4)",
                                  }}
                                >
                                  {barrier.text}
                                </span>
                                <span
                                  style={{
                                    color: "rgba(240, 232, 216, 0.5)",
                                    margin: "0 6px",
                                  }}
                                >
                                  {"\u2192"}
                                </span>
                                <span style={{ color: "#2d8a8a", fontStyle: "italic" }}>
                                  {barrier.defusedText}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  },
                )}
              </div>
            </div>
          )}

          {/* ── Committed Actions Section ───────────────────────────────── */}
          {committedActions.length > 0 && (
            <div style={{ paddingBottom: 8 }}>
              <div style={labelStyle}>Committed Actions</div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 0 }}
              >
                {committedActions.map((ca, i) => {
                  const domain = getDomain(ca.domainId);
                  if (!domain) return null;
                  const isLast = i === committedActions.length - 1;
                  return (
                    <div
                      key={`${ca.domainId}-${i}`}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 12,
                        position: "relative",
                        paddingBottom: isLast ? 0 : 16,
                      }}
                    >
                      {/* Trail line */}
                      {!isLast && (
                        <div
                          style={{
                            position: "absolute",
                            left: 13,
                            top: 28,
                            bottom: 0,
                            width: 2,
                            background:
                              "linear-gradient(to bottom, rgba(201, 168, 76, 0.4), rgba(201, 168, 76, 0.1))",
                          }}
                        />
                      )}
                      {/* Waypoint marker */}
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          background: "rgba(45, 138, 138, 0.2)",
                          border: `2px solid ${domain.color}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <svg viewBox="0 0 24 24" width={14} height={14}>
                          <path d={domain.iconPath} fill={domain.color} />
                        </svg>
                      </div>
                      {/* Action content */}
                      <div style={{ flex: 1, paddingTop: 2 }}>
                        <div
                          style={{
                            ...bodyTextStyle,
                            fontSize: 11,
                            color: domain.color,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: 1,
                            marginBottom: 2,
                          }}
                        >
                          {domain.name}
                        </div>
                        <div
                          style={{
                            ...bodyTextStyle,
                            fontSize: 14,
                          }}
                        >
                          {ca.action}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Action Buttons (outside ref, not captured in screenshot) ───── */}
      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleExport}
          style={{
            padding: "12px 28px",
            borderRadius: 8,
            border: "none",
            background: "linear-gradient(135deg, #c9a84c, #a8892e)",
            color: "#1a2530",
            fontSize: 15,
            fontWeight: 700,
            fontFamily: "'Georgia', 'Times New Roman', serif",
            cursor: "pointer",
            letterSpacing: 1,
          }}
        >
          Save Expedition Map
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onNewExpedition}
          style={{
            padding: "12px 28px",
            borderRadius: 8,
            border: "2px solid rgba(201, 168, 76, 0.4)",
            background: "transparent",
            color: "#c9a84c",
            fontSize: 15,
            fontWeight: 600,
            fontFamily: "'Georgia', 'Times New Roman', serif",
            cursor: "pointer",
            letterSpacing: 1,
          }}
        >
          New Expedition
        </motion.button>
      </div>
    </motion.div>
  );
}
