import { useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AgeMode, LIFE_DOMAINS } from "./compass-data";

// ── Types ───────────────────────────────────────────────────────────────────

interface DomainState {
  domainId: string;
  values: string[];
  alignment: number; // 0-10
}

interface AlignmentDialProps {
  domains: DomainState[];
  onUpdateAlignment: (domainId: string, alignment: number) => void;
  ageMode: AgeMode;
}

// ── Slider Thumb CSS (injected via <style>) ─────────────────────────────────

const RANGE_THUMB_CSS = (id: string, color: string) => `
  .alignment-range-${id}::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: ${color};
    border: 3px solid #e8dcc8;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0,0,0,0.35);
    margin-top: -8px;
    position: relative;
    z-index: 2;
  }
  .alignment-range-${id}::-moz-range-thumb {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: ${color};
    border: 3px solid #e8dcc8;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0,0,0,0.35);
  }
  .alignment-range-${id}::-webkit-slider-runnable-track {
    height: 6px;
    border-radius: 3px;
    background: rgba(232,220,200,0.15);
  }
  .alignment-range-${id}::-moz-range-track {
    height: 6px;
    border-radius: 3px;
    background: rgba(232,220,200,0.15);
  }
  .alignment-range-${id}:focus {
    outline: none;
  }
  .alignment-range-${id}:focus::-webkit-slider-thumb {
    box-shadow: 0 0 0 4px ${color}44, 0 2px 8px rgba(0,0,0,0.35);
  }
`;

// ── Arc Gauge SVG ───────────────────────────────────────────────────────────

function ArcGauge({ value, color }: { value: number; color: string }) {
  const cx = 100;
  const cy = 100;
  const r = 80;
  const fraction = value / 10;

  // Arc from 180 deg (left) to 0 deg (right) — a top-facing semicircle
  const startAngle = Math.PI; // 180 deg
  const endAngle = 0; // 0 deg
  const totalSweep = startAngle - endAngle; // pi radians

  // Full arc path (background)
  const fullArc = describeArc(cx, cy, r, startAngle, endAngle);
  // Filled arc path
  const filledEndAngle = startAngle - totalSweep * fraction;
  const filledArc =
    fraction > 0 ? describeArc(cx, cy, r, startAngle, filledEndAngle) : "";

  // Needle position
  const needleAngle = startAngle - totalSweep * fraction;
  const needleX = cx + r * Math.cos(needleAngle);
  const needleY = cy - r * Math.sin(needleAngle);

  return (
    <svg
      viewBox="0 0 200 120"
      style={{ width: "100%", maxWidth: 200, display: "block", margin: "0 auto" }}
    >
      {/* Background arc (dim) */}
      <path
        d={fullArc}
        fill="none"
        stroke="rgba(232,220,200,0.15)"
        strokeWidth={10}
        strokeLinecap="round"
      />
      {/* Filled arc */}
      {fraction > 0 && (
        <path
          d={filledArc}
          fill="none"
          stroke={color}
          strokeWidth={10}
          strokeLinecap="round"
          style={{
            filter: `drop-shadow(0 0 6px ${color}66)`,
          }}
        />
      )}
      {/* Needle dot */}
      <circle
        cx={needleX}
        cy={needleY}
        r={7}
        fill={color}
        stroke="#e8dcc8"
        strokeWidth={2.5}
        style={{ filter: `drop-shadow(0 2px 4px rgba(0,0,0,0.4))` }}
      />
      {/* Center value — rendered outside SVG via AnimatePresence, but we add
          tick marks for context */}
      {/* Min / Max labels */}
      <text x={cx - r - 4} y={cy + 16} fill="rgba(232,220,200,0.5)" fontSize="10" textAnchor="middle">
        0
      </text>
      <text x={cx + r + 4} y={cy + 16} fill="rgba(232,220,200,0.5)" fontSize="10" textAnchor="middle">
        10
      </text>
    </svg>
  );
}

/** Describe an SVG arc path from angle a1 to a2 (radians, measured counter-clockwise from 3-o'clock). */
function describeArc(
  cx: number,
  cy: number,
  r: number,
  a1: number,
  a2: number,
): string {
  const x1 = cx + r * Math.cos(a1);
  const y1 = cy - r * Math.sin(a1);
  const x2 = cx + r * Math.cos(a2);
  const y2 = cy - r * Math.sin(a2);
  const sweep = a1 - a2;
  const largeArc = sweep > Math.PI ? 1 : 0;
  // Clockwise in SVG coordinate space (y-down) when going from left to right
  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 0 ${x2} ${y2}`;
}

// ── Status helpers ──────────────────────────────────────────────────────────

function getStatus(alignment: number): {
  label: string;
  color: string;
  borderColor: string;
} {
  if (alignment <= 4) {
    return {
      label: "Needs attention",
      color: "#e0a84c",
      borderColor: "rgba(224,168,76,0.45)",
    };
  }
  if (alignment >= 8) {
    return {
      label: "Well aligned",
      color: "#5ab88f",
      borderColor: "rgba(90,184,143,0.35)",
    };
  }
  return { label: "", color: "transparent", borderColor: "rgba(232,220,200,0.12)" };
}

// ── Summary message ─────────────────────────────────────────────────────────

function getSummaryMessage(
  wellAligned: number,
  needsAttention: number,
  ageMode: AgeMode,
): string {
  if (ageMode === "child") {
    if (needsAttention === 0 && wellAligned > 0)
      return "Wow, you're doing great at living by what matters to you!";
    if (needsAttention > 0)
      return `Some parts of your life could use a little more attention — that's okay! Knowing is the first step.`;
    return "Move the sliders to show how close you are to living by your values.";
  }
  if (ageMode === "teen") {
    if (needsAttention === 0 && wellAligned > 0)
      return "Solid — your actions are lining up with what you care about.";
    if (needsAttention > 0)
      return `${needsAttention} area${needsAttention > 1 ? "s" : ""} could use some work — we'll look at what's getting in the way next.`;
    return "Rate each area to see where you stand.";
  }
  // adult
  if (needsAttention === 0 && wellAligned > 0)
    return "Your behavioral alignment with your stated values is strong across domains.";
  if (needsAttention > 0)
    return `${needsAttention} domain${needsAttention > 1 ? "s" : ""} show${needsAttention === 1 ? "s" : ""} a meaningful gap between values and action — a rich area for exploration.`;
  return "Use the sliders to rate how closely your current actions match each value.";
}

// ── Main Component ──────────────────────────────────────────────────────────

export function AlignmentDial({
  domains,
  onUpdateAlignment,
  ageMode,
}: AlignmentDialProps) {
  const reactId = useId().replace(/:/g, "");

  // Only show domains that have at least one value entered
  const activeDomains = domains.filter((d) => d.values.length > 0);

  const wellAligned = activeDomains.filter((d) => d.alignment >= 8).length;
  const needsAttention = activeDomains.filter((d) => d.alignment <= 4).length;

  if (activeDomains.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          color: "rgba(232,220,200,0.5)",
          padding: "40px 20px",
          fontSize: "0.95rem",
        }}
      >
        No values entered yet. Go back to the previous step and add values for
        at least one life domain.
      </div>
    );
  }

  return (
    <div>
      {/* ── Card Grid ──────────────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(min(260px, 100%), 1fr))",
          gap: 16,
        }}
      >
        {activeDomains.map((domainState) => {
          const domainDef = LIFE_DOMAINS.find(
            (ld) => ld.id === domainState.domainId,
          );
          if (!domainDef) return null;

          const status = getStatus(domainState.alignment);
          const cardId = `${reactId}-${domainDef.id}`;

          return (
            <motion.div
              key={domainDef.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              style={{
                background: "rgba(15, 22, 28, 0.6)",
                borderRadius: 14,
                padding: "20px 18px 18px",
                border: `1.5px solid ${status.borderColor}`,
                boxShadow:
                  domainState.alignment <= 4
                    ? `0 0 18px rgba(224,168,76,0.18), inset 0 0 12px rgba(224,168,76,0.06)`
                    : "0 2px 12px rgba(0,0,0,0.25)",
                transition: "border-color 0.3s, box-shadow 0.3s",
              }}
            >
              {/* Inject range thumb CSS for this card */}
              <style>{RANGE_THUMB_CSS(cardId, domainDef.color)}</style>

              {/* ── Domain header ──────────────────────────────────────── */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 6,
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  width={24}
                  height={24}
                  fill={domainDef.color}
                  style={{ flexShrink: 0 }}
                >
                  <path d={domainDef.iconPath} />
                </svg>
                <span
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: "1.05rem",
                    fontWeight: 600,
                    color: "#e8dcc8",
                  }}
                >
                  {domainDef.name}
                </span>
              </div>

              {/* Values the client entered */}
              <div
                style={{
                  fontSize: "0.82rem",
                  color: "rgba(232,220,200,0.55)",
                  fontStyle: "italic",
                  marginBottom: 14,
                  lineHeight: 1.45,
                }}
              >
                {domainState.values.map((v, i) => (
                  <span key={i}>
                    {i > 0 && ", "}
                    &ldquo;{v}&rdquo;
                  </span>
                ))}
              </div>

              {/* ── Arc gauge ─────────────────────────────────────────── */}
              <div style={{ position: "relative", marginBottom: 4 }}>
                <ArcGauge value={domainState.alignment} color={domainDef.color} />
                {/* Animated number overlay centered in the arc */}
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    bottom: 4,
                    transform: "translateX(-50%)",
                    textAlign: "center",
                  }}
                >
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={domainState.alignment}
                      initial={{ opacity: 0, y: 8, scale: 0.85 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      style={{
                        fontFamily: "'Playfair Display', Georgia, serif",
                        fontSize: "2rem",
                        fontWeight: 700,
                        color: domainDef.color,
                        lineHeight: 1,
                      }}
                    >
                      {domainState.alignment}
                    </motion.span>
                  </AnimatePresence>
                </div>
              </div>

              {/* ── Range input ───────────────────────────────────────── */}
              <input
                type="range"
                min={0}
                max={10}
                step={1}
                value={domainState.alignment}
                onChange={(e) =>
                  onUpdateAlignment(domainState.domainId, Number(e.target.value))
                }
                className={`alignment-range-${cardId}`}
                aria-label={`Alignment rating for ${domainDef.name}`}
                style={{
                  width: "100%",
                  height: 22,
                  background: "transparent",
                  appearance: "none",
                  WebkitAppearance: "none",
                  cursor: "pointer",
                  margin: "4px 0 8px",
                }}
              />

              {/* ── Status label ──────────────────────────────────────── */}
              {status.label && (
                <div
                  style={{
                    display: "inline-block",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: status.color,
                    background: `${status.color}18`,
                    border: `1px solid ${status.color}33`,
                    borderRadius: 20,
                    padding: "3px 12px",
                    marginTop: 2,
                  }}
                >
                  {status.label}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* ── Summary ────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.4 }}
        style={{
          marginTop: 28,
          padding: "18px 22px",
          background: "rgba(15, 22, 28, 0.6)",
          borderRadius: 12,
          border: "1px solid rgba(232,220,200,0.1)",
        }}
      >
        {/* Counts */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 28,
            marginBottom: 12,
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "1.6rem",
                fontWeight: 700,
                color: "#5ab88f",
              }}
            >
              {wellAligned}
            </div>
            <div
              style={{
                fontSize: "0.75rem",
                color: "rgba(232,220,200,0.55)",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              Well aligned
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "1.6rem",
                fontWeight: 700,
                color: "#e0a84c",
              }}
            >
              {needsAttention}
            </div>
            <div
              style={{
                fontSize: "0.75rem",
                color: "rgba(232,220,200,0.55)",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              Needs attention
            </div>
          </div>
        </div>

        {/* Age-adaptive message */}
        <div
          style={{
            textAlign: "center",
            fontSize: "0.9rem",
            color: "rgba(232,220,200,0.7)",
            lineHeight: 1.55,
          }}
        >
          {getSummaryMessage(wellAligned, needsAttention, ageMode)}
        </div>
      </motion.div>
    </div>
  );
}
