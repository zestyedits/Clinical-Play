import { useMemo } from "react";
import { motion } from "framer-motion";
import { getVolcanoStage } from "./volcano-data";

interface VolcanoCanvasProps {
  temperature: number;
  width?: number;
  height?: number;
  showLabel?: boolean;
  compact?: boolean;
}

export function VolcanoCanvas({ temperature, width = 280, height = 220, showLabel = true, compact = false }: VolcanoCanvasProps) {
  const stage = useMemo(() => getVolcanoStage(temperature), [temperature]);
  const lavaFill = stage.lavaLevel;
  const t = Math.max(0, Math.min(10, temperature)) / 10;

  // Volcano shape points (triangular mountain with crater)
  const vx = width / 2;
  const baseY = height - 10;
  const peakY = compact ? 30 : 20;
  const baseWidth = compact ? width * 0.8 : width * 0.85;
  const craterWidth = compact ? 36 : 48;
  const craterDepth = compact ? 10 : 14;

  const leftBase = vx - baseWidth / 2;
  const rightBase = vx + baseWidth / 2;
  const leftCrater = vx - craterWidth / 2;
  const rightCrater = vx + craterWidth / 2;

  // Volcano outline path
  const volcanoPath = `
    M ${leftBase} ${baseY}
    L ${leftCrater} ${peakY}
    L ${leftCrater + 4} ${peakY + craterDepth}
    L ${rightCrater - 4} ${peakY + craterDepth}
    L ${rightCrater} ${peakY}
    L ${rightBase} ${baseY}
    Z
  `;

  // Lava fill (rises from bottom)
  const lavaTop = baseY - (baseY - peakY - craterDepth) * lavaFill;
  const lavaLeftX = leftBase + (leftCrater - leftBase) * (1 - (baseY - lavaTop) / (baseY - peakY));
  const lavaRightX = rightBase - (rightBase - rightCrater) * (1 - (baseY - lavaTop) / (baseY - peakY));

  const lavaPath = `
    M ${leftBase} ${baseY}
    L ${lavaLeftX} ${lavaTop}
    Q ${vx} ${lavaTop - 4} ${lavaRightX} ${lavaTop}
    L ${rightBase} ${baseY}
    Z
  `;

  // Smoke particles
  const smokeParticles = useMemo(() => {
    return Array.from({ length: stage.particleCount }).map((_, i) => ({
      id: i,
      cx: vx + (Math.random() - 0.5) * craterWidth * 0.8,
      delay: Math.random() * 3,
      duration: 2.5 + Math.random() * 2.5,
      size: 3 + Math.random() * (compact ? 6 : 10),
      drift: (Math.random() - 0.5) * 30,
      isLava: i < stage.particleCount * 0.3 && lavaFill > 0.3,
    }));
  }, [stage.particleCount, vx, craterWidth, lavaFill, compact]);

  // Lava bubbles inside the volcano
  const lavaBubbles = useMemo(() => {
    if (lavaFill < 0.15) return [];
    const count = Math.floor(lavaFill * 6);
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      cx: vx + (Math.random() - 0.5) * baseWidth * 0.4,
      cy: baseY - (baseY - lavaTop) * (0.2 + Math.random() * 0.6),
      size: 2 + Math.random() * 4,
      delay: Math.random() * 2,
      duration: 1 + Math.random() * 1.5,
    }));
  }, [lavaFill, lavaTop, vx, baseY, baseWidth]);

  return (
    <div style={{ position: "relative", display: "inline-flex", flexDirection: "column", alignItems: "center" }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: "visible" }}>
        <defs>
          {/* Volcano gradient */}
          <linearGradient id="volcano-rock" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5a4535" />
            <stop offset="40%" stopColor="#3d2e22" />
            <stop offset="100%" stopColor="#2a1e15" />
          </linearGradient>
          {/* Lava gradient */}
          <linearGradient id="volcano-lava" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={t > 0.7 ? "#ff4422" : "#ff6633"} />
            <stop offset="50%" stopColor={t > 0.7 ? "#ff2200" : "#ee4411"} />
            <stop offset="100%" stopColor="#cc3300" />
          </linearGradient>
          {/* Inner glow */}
          <radialGradient id="volcano-inner-glow" cx="50%" cy="30%">
            <stop offset="0%" stopColor={stage.glowColor} stopOpacity="0.4" />
            <stop offset="100%" stopColor={stage.glowColor} stopOpacity="0" />
          </radialGradient>
          {/* Smoke filter */}
          <filter id="volcano-blur">
            <feGaussianBlur stdDeviation="2" />
          </filter>
          {/* Lava glow filter */}
          <filter id="lava-glow">
            <feGaussianBlur stdDeviation="4" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Ground */}
        <ellipse
          cx={vx}
          cy={baseY + 2}
          rx={baseWidth / 2 + 15}
          ry={8}
          fill="rgba(30,20,15,0.6)"
        />

        {/* Volcano body */}
        <path d={volcanoPath} fill="url(#volcano-rock)" stroke="rgba(90,70,50,0.3)" strokeWidth={1} />

        {/* Rock texture lines */}
        {Array.from({ length: 5 }).map((_, i) => {
          const yPos = baseY - (baseY - peakY) * (0.15 + i * 0.15);
          const leftX = leftBase + (leftCrater - leftBase) * (1 - (baseY - yPos) / (baseY - peakY));
          const rightX = rightBase - (rightBase - rightCrater) * (1 - (baseY - yPos) / (baseY - peakY));
          return (
            <line
              key={i}
              x1={leftX + 8}
              y1={yPos}
              x2={rightX - 8}
              y2={yPos + 2}
              stroke="rgba(80,60,40,0.15)"
              strokeWidth={0.5}
            />
          );
        })}

        {/* Lava fill */}
        {lavaFill > 0 && (
          <motion.path
            d={lavaPath}
            fill="url(#volcano-lava)"
            filter="url(#lava-glow)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
        )}

        {/* Inner crater glow */}
        <ellipse
          cx={vx}
          cy={peakY + craterDepth / 2}
          rx={craterWidth / 2 - 2}
          ry={craterDepth / 2}
          fill={`url(#volcano-inner-glow)`}
          style={{ opacity: 0.3 + t * 0.7 }}
        />

        {/* Crater rim highlight */}
        <ellipse
          cx={vx}
          cy={peakY + craterDepth / 2}
          rx={craterWidth / 2 - 3}
          ry={craterDepth / 2 - 1}
          fill="none"
          stroke={stage.glowColor}
          strokeWidth={1}
          opacity={0.3 + t * 0.4}
        />

        {/* Lava bubbles */}
        {lavaBubbles.map((b) => (
          <motion.circle
            key={`bubble-${b.id}`}
            cx={b.cx}
            cy={b.cy}
            r={b.size}
            fill="#ff8844"
            opacity={0.6}
            animate={{
              cy: [b.cy, b.cy - b.size * 3, b.cy],
              opacity: [0.4, 0.8, 0.4],
              r: [b.size, b.size * 1.3, b.size],
            }}
            transition={{
              duration: b.duration,
              delay: b.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Smoke & lava particles */}
        {smokeParticles.map((p) => (
          <motion.circle
            key={`smoke-${p.id}`}
            cx={p.cx}
            r={p.size}
            fill={p.isLava ? "#ff5522" : "rgba(160,140,120,0.25)"}
            filter={p.isLava ? undefined : "url(#volcano-blur)"}
            initial={{ cy: peakY, opacity: 0 }}
            animate={{
              cy: [peakY, peakY - 40 - Math.random() * 40],
              cx: [p.cx, p.cx + p.drift],
              opacity: [0, stage.smokeIntensity * (p.isLava ? 0.8 : 0.5), 0],
              r: [p.size, p.size * (p.isLava ? 0.5 : 2.5)],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
        ))}
      </svg>

      {showLabel && (
        <motion.div
          key={stage.label}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginTop: compact ? 4 : 8,
            fontSize: compact ? 11 : 13,
            fontWeight: 700,
            color: stage.glowColor,
            letterSpacing: 1,
            textTransform: "uppercase",
            textShadow: `0 0 10px ${stage.glowColor}40`,
          }}
        >
          {stage.label}
        </motion.div>
      )}
    </div>
  );
}
