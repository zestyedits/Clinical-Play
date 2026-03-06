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
  const cx = 120;
  const cy = 120;
  const radius = 90;
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

  const polygonPoints = LIFE_DOMAINS.map((ld, i) => {
    const domainState = domains.find((d) => d.domainId === ld.id);
    const alignment = domainState ? domainState.alignment : 0;
    const pt = dataPoint(i, alignment);
    return `${pt.x},${pt.y}`;
  }).join(" ");

  // Shared styles
  const SERIF = "'Georgia', 'Times New Roman', serif";
  const MONO = "'Courier New', monospace";
  const GOLD = "#c9a84c";
  const TEAL = "#2d8a8a";
  const PARCHMENT = "#f0e8d8";

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
      {/* Printable Summary */}
      <div
        ref={summaryRef}
        style={{
          background: "#1a2530",
          borderRadius: 10,
          border: `1.5px solid ${GOLD}66`,
          overflow: "hidden",
        }}
      >
        {/* ── Compact Header ───────────────────────────────────────────── */}
        <div
          style={{
            background: "linear-gradient(135deg, #1a2530, #223040)",
            padding: "14px 20px 12px",
            borderBottom: `1.5px solid ${GOLD}66`,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span style={{ fontSize: 28, lineHeight: 1 }}>{"\uD83E\uDDED"}</span>
          <div style={{ flex: 1 }}>
            <h2
              style={{
                fontFamily: SERIF,
                fontSize: 18,
                color: GOLD,
                margin: 0,
                letterSpacing: 2,
                textTransform: "uppercase",
                fontWeight: 700,
              }}
            >
              Values Compass
            </h2>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 10,
                color: `${PARCHMENT}80`,
                marginTop: 2,
              }}
            >
              {caseNumber}
            </div>
          </div>
        </div>

        {/* ── Body ─────────────────────────────────────────────────────── */}
        <div style={{ padding: "14px 16px" }}>
          {/* Radar + Values side by side on wider screens */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 14,
              marginBottom: 14,
              paddingBottom: 14,
              borderBottom: `1px solid ${GOLD}33`,
            }}
          >
            {/* Radar chart — compact */}
            <div style={{ flex: "0 0 auto", display: "flex", justifyContent: "center", alignSelf: "center" }}>
              <svg
                viewBox="0 0 240 240"
                style={{ width: 200, maxWidth: "100%", height: "auto" }}
              >
                {[0.25, 0.5, 0.75, 1].map((scale) => (
                  <polygon
                    key={scale}
                    points={Array.from({ length: spokeCount }, (_, i) => {
                      const x = cx + radius * scale * Math.cos(spokeAngle(i));
                      const y = cy + radius * scale * Math.sin(spokeAngle(i));
                      return `${x},${y}`;
                    }).join(" ")}
                    fill="none"
                    stroke={`${GOLD}25`}
                    strokeWidth={0.75}
                  />
                ))}
                {LIFE_DOMAINS.map((_, i) => {
                  const end = spokeEndpoint(i);
                  return (
                    <line
                      key={`spoke-${i}`}
                      x1={cx} y1={cy} x2={end.x} y2={end.y}
                      stroke={`${GOLD}30`}
                      strokeWidth={0.75}
                    />
                  );
                })}
                <polygon
                  points={polygonPoints}
                  fill={`${TEAL}33`}
                  stroke={TEAL}
                  strokeWidth={1.5}
                />
                {LIFE_DOMAINS.map((ld, i) => {
                  const domainState = domains.find((d) => d.domainId === ld.id);
                  const alignment = domainState ? domainState.alignment : 0;
                  const pt = dataPoint(i, alignment);
                  return (
                    <circle
                      key={`pt-${i}`}
                      cx={pt.x} cy={pt.y} r={3}
                      fill={TEAL} stroke="#e8dcc8" strokeWidth={1}
                    />
                  );
                })}
                {/* Spoke labels */}
                {LIFE_DOMAINS.map((ld, i) => {
                  const domainState = domains.find((d) => d.domainId === ld.id);
                  const alignment = domainState ? domainState.alignment : 0;
                  const angle = spokeAngle(i);
                  const lr = radius + 18;
                  const lx = cx + lr * Math.cos(angle);
                  const ly = cy + lr * Math.sin(angle);
                  const angleDeg = (i * 60 - 90 + 360) % 360;
                  const anchor = angleDeg > 20 && angleDeg < 160 ? "start" as const
                    : angleDeg > 200 && angleDeg < 340 ? "end" as const
                    : "middle" as const;
                  return (
                    <g key={`lbl-${i}`}>
                      <text
                        x={lx} y={ly}
                        textAnchor={anchor}
                        dominantBaseline="central"
                        style={{ fontFamily: SERIF, fontSize: 8, fontWeight: 700, fill: ld.color }}
                      >
                        {ld.name}
                      </text>
                      <text
                        x={lx} y={ly + 10}
                        textAnchor={anchor}
                        dominantBaseline="central"
                        style={{ fontFamily: MONO, fontSize: 7, fill: TEAL, fontWeight: 700 }}
                      >
                        {alignment}/10
                      </text>
                    </g>
                  );
                })}
                <circle cx={cx} cy={cy} r={2} fill={GOLD} opacity={0.5} />
              </svg>
            </div>

            {/* Values list — compact chips per domain */}
            <div style={{ flex: "1 1 200px", display: "flex", flexDirection: "column", gap: 8, justifyContent: "center" }}>
              {LIFE_DOMAINS.map((ld) => {
                const ds = domains.find((d) => d.domainId === ld.id);
                if (!ds || ds.values.length === 0) return null;
                return (
                  <div key={ld.id} style={{ display: "flex", alignItems: "baseline", gap: 6, flexWrap: "wrap" }}>
                    <span style={{ fontFamily: SERIF, fontSize: 11, fontWeight: 700, color: ld.color, whiteSpace: "nowrap" }}>
                      {ld.name}
                    </span>
                    <span style={{ fontFamily: SERIF, fontSize: 11, color: `${PARCHMENT}AA`, lineHeight: 1.5 }}>
                      {ds.values.join(", ")}
                    </span>
                    <span style={{ fontFamily: MONO, fontSize: 9, color: TEAL, fontWeight: 700, marginLeft: "auto" }}>
                      {ds.alignment}/10
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Barriers & Defusion — compact ──────────────────────────── */}
          {barriers.length > 0 && (
            <div
              style={{
                marginBottom: 14,
                paddingBottom: 14,
                borderBottom: `1px solid ${GOLD}33`,
              }}
            >
              <div
                style={{
                  fontFamily: SERIF,
                  fontSize: 11,
                  color: GOLD,
                  textTransform: "uppercase",
                  letterSpacing: 1.5,
                  fontWeight: 600,
                  marginBottom: 8,
                }}
              >
                Barriers & Defusion
              </div>
              {Object.entries(barriersByDomain).map(([domainId, domainBarriers]) => {
                const domain = getDomain(domainId);
                if (!domain) return null;
                return (
                  <div key={domainId} style={{ marginBottom: 6 }}>
                    <span style={{ fontFamily: SERIF, fontSize: 11, fontWeight: 700, color: domain.color }}>
                      {domain.name}:
                    </span>
                    {domainBarriers.map((barrier) => {
                      const typeInfo = getBarrierTypeInfo(barrier.type);
                      return (
                        <div
                          key={barrier.id}
                          style={{
                            fontFamily: SERIF,
                            fontSize: 12,
                            lineHeight: 1.5,
                            paddingLeft: 10,
                            marginTop: 2,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 9,
                              padding: "1px 6px",
                              borderRadius: 8,
                              background: typeInfo ? `${typeInfo.color}22` : `${GOLD}22`,
                              color: typeInfo ? typeInfo.color : GOLD,
                              fontWeight: 600,
                              marginRight: 6,
                            }}
                          >
                            {typeInfo?.label}
                          </span>
                          <span style={{ textDecoration: "line-through", color: `${PARCHMENT}55` }}>
                            {barrier.text}
                          </span>
                          <span style={{ color: `${PARCHMENT}66`, margin: "0 5px" }}>{"\u2192"}</span>
                          <span style={{ color: TEAL, fontStyle: "italic" }}>
                            {barrier.defusedText}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Committed Actions — compact trail ─────────────────────── */}
          {committedActions.length > 0 && (
            <div>
              <div
                style={{
                  fontFamily: SERIF,
                  fontSize: 11,
                  color: GOLD,
                  textTransform: "uppercase",
                  letterSpacing: 1.5,
                  fontWeight: 600,
                  marginBottom: 8,
                }}
              >
                Committed Actions
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
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
                        gap: 10,
                        position: "relative",
                        paddingBottom: isLast ? 0 : 10,
                      }}
                    >
                      {!isLast && (
                        <div
                          style={{
                            position: "absolute",
                            left: 9,
                            top: 22,
                            bottom: 0,
                            width: 1.5,
                            background: `linear-gradient(to bottom, ${GOLD}55, ${GOLD}15)`,
                          }}
                        />
                      )}
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          background: `${TEAL}33`,
                          border: `1.5px solid ${domain.color}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <svg viewBox="0 0 24 24" width={10} height={10}>
                          <path d={domain.iconPath} fill={domain.color} />
                        </svg>
                      </div>
                      <div style={{ flex: 1, paddingTop: 1 }}>
                        <span
                          style={{
                            fontFamily: SERIF,
                            fontSize: 10,
                            color: domain.color,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: 0.5,
                          }}
                        >
                          {domain.name}
                        </span>
                        <div
                          style={{
                            fontFamily: SERIF,
                            fontSize: 12,
                            color: PARCHMENT,
                            lineHeight: 1.4,
                            marginTop: 1,
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

      {/* ── Action Buttons ─────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleExport}
          style={{
            padding: "10px 24px",
            borderRadius: 8,
            border: "none",
            background: `linear-gradient(135deg, ${GOLD}, #a8892e)`,
            color: "#1a2530",
            fontSize: 14,
            fontWeight: 700,
            fontFamily: SERIF,
            cursor: "pointer",
            letterSpacing: 0.5,
          }}
        >
          Save Expedition Map
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onNewExpedition}
          style={{
            padding: "10px 24px",
            borderRadius: 8,
            border: `1.5px solid ${GOLD}66`,
            background: "transparent",
            color: GOLD,
            fontSize: 14,
            fontWeight: 600,
            fontFamily: SERIF,
            cursor: "pointer",
            letterSpacing: 0.5,
          }}
        >
          New Expedition
        </motion.button>
      </div>
    </motion.div>
  );
}
