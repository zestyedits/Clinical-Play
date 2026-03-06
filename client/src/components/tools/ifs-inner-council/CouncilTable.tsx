import { motion } from "framer-motion";
import type { AgeMode } from "./council-data";
import { PART_ARCHETYPES } from "./council-data";

interface CouncilTableProps {
  selectedParts: { archetypeId: string }[];
  ageMode: AgeMode;
}

const SELF_ACCENT = "#5f9ea0";
const CANDLELIGHT = "#f4e4bc";
const TABLE_FILL = "#2a1f14";
const STONE = "#8b7355";

const TABLE_PROMPTS: Record<AgeMode, string> = {
  child: "Your helpers have gathered around the table!",
  teen: "Your council is assembled. Everyone has a seat.",
  adult:
    "Your inner council is assembled. Each part has taken their place at the table.",
};

export function CouncilTable({ selectedParts, ageMode }: CouncilTableProps) {
  const cx = 200;
  const cy = 200;
  const tableRadius = 60;
  const seatRingRadius = 130;

  // Self is always at the top (angle = -90deg)
  // Parts are distributed evenly around the remaining arc
  const totalSeats = selectedParts.length + 1; // +1 for Self
  const angleStep = (2 * Math.PI) / totalSeats;

  // Self at index 0, parts follow
  const selfAngle = -Math.PI / 2;

  const seatPositions = selectedParts.map((_, i) => {
    const angle = selfAngle + angleStep * (i + 1);
    return {
      x: cx + seatRingRadius * Math.cos(angle),
      y: cy + seatRingRadius * Math.sin(angle),
    };
  });

  const selfPos = {
    x: cx + seatRingRadius * Math.cos(selfAngle),
    y: cy + seatRingRadius * Math.sin(selfAngle),
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
      }}
    >
      <svg
        viewBox="0 0 400 400"
        style={{ width: "100%", maxWidth: 400, height: "auto" }}
      >
        {/* Decorative concentric rings */}
        {[170, 155, 140].map((r) => (
          <circle
            key={`ring-${r}`}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={`${STONE}15`}
            strokeWidth={0.75}
          />
        ))}

        {/* Seat ring guide (subtle) */}
        <circle
          cx={cx}
          cy={cy}
          r={seatRingRadius}
          fill="none"
          stroke={`${STONE}20`}
          strokeWidth={1}
          strokeDasharray="4 6"
        />

        {/* Stone table */}
        <circle
          cx={cx}
          cy={cy}
          r={tableRadius}
          fill={TABLE_FILL}
          stroke={STONE}
          strokeWidth={2}
        />
        <circle
          cx={cx}
          cy={cy}
          r={tableRadius - 6}
          fill="none"
          stroke={`${STONE}40`}
          strokeWidth={0.75}
        />

        {/* COUNCIL text in center */}
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          style={{
            fontFamily: "'Georgia', 'Times New Roman', serif",
            fontSize: 11,
            fontWeight: 700,
            fill: `${CANDLELIGHT}60`,
            letterSpacing: 3,
            textTransform: "uppercase",
          }}
        >
          COUNCIL
        </text>

        {/* Connection lines from seats to table edge */}
        <line
          x1={selfPos.x}
          y1={selfPos.y}
          x2={cx + tableRadius * Math.cos(selfAngle)}
          y2={cy + tableRadius * Math.sin(selfAngle)}
          stroke={`${SELF_ACCENT}30`}
          strokeWidth={1}
          strokeDasharray="3 4"
        />
        {seatPositions.map((pos, i) => {
          const angle = selfAngle + angleStep * (i + 1);
          return (
            <line
              key={`line-${i}`}
              x1={pos.x}
              y1={pos.y}
              x2={cx + tableRadius * Math.cos(angle)}
              y2={cy + tableRadius * Math.sin(angle)}
              stroke={`${STONE}25`}
              strokeWidth={1}
              strokeDasharray="3 4"
            />
          );
        })}

        {/* Self seat */}
        <motion.g
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <circle
            cx={selfPos.x}
            cy={selfPos.y}
            r={22}
            fill={`${SELF_ACCENT}33`}
            stroke={SELF_ACCENT}
            strokeWidth={2}
          />
          {/* Self symbol — sun-like radiance */}
          <circle cx={selfPos.x} cy={selfPos.y} r={6} fill={SELF_ACCENT} opacity={0.7} />
          <circle
            cx={selfPos.x}
            cy={selfPos.y}
            r={10}
            fill="none"
            stroke={SELF_ACCENT}
            strokeWidth={1}
            opacity={0.4}
          />
          <text
            x={selfPos.x}
            y={selfPos.y + 32}
            textAnchor="middle"
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 11,
              fontWeight: 700,
              fill: SELF_ACCENT,
            }}
          >
            Self
          </text>
        </motion.g>

        {/* Part seats */}
        {seatPositions.map((pos, i) => {
          const partEntry = selectedParts[i];
          const archetype = PART_ARCHETYPES.find(
            (a) => a.id === partEntry.archetypeId
          );
          if (!archetype) return null;

          return (
            <motion.g
              key={archetype.id}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
            >
              <circle
                cx={pos.x}
                cy={pos.y}
                r={22}
                fill={`${archetype.color}33`}
                stroke={archetype.color}
                strokeWidth={1.5}
              />
              {/* Part icon (small, 12x12) */}
              <svg
                x={pos.x - 6}
                y={pos.y - 6}
                width={12}
                height={12}
                viewBox="0 0 24 24"
              >
                <path d={archetype.iconPath} fill={archetype.color} />
              </svg>
              {/* Name label below */}
              <text
                x={pos.x}
                y={pos.y + 32}
                textAnchor="middle"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 9,
                  fontWeight: 600,
                  fill: CANDLELIGHT,
                }}
              >
                {archetype.name}
              </text>
            </motion.g>
          );
        })}
      </svg>

      {/* Age-adaptive prompt */}
      <div
        style={{
          textAlign: "center",
          fontFamily: "Inter, sans-serif",
          fontSize: 14,
          color: `${CANDLELIGHT}AA`,
          fontStyle: "italic",
          maxWidth: 360,
          lineHeight: 1.5,
        }}
      >
        {TABLE_PROMPTS[ageMode]}
      </div>
    </motion.div>
  );
}
