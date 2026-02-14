import { useMemo } from "react";
import { motion } from "framer-motion";
import type { BreathingThemeProps } from "./types";

export function BalloonRise({ technique, isActive, phaseIndex, phaseProgress }: BreathingThemeProps) {
  const phase = technique.phases[phaseIndex];
  const isInhale = phase?.type === "inhale";

  const clouds = useMemo(() => [
    { top: "15%", left: "-10%", width: 180, opacity: 0.6, duration: 50 },
    { top: "30%", left: "70%", width: 140, opacity: 0.4, duration: 60 },
    { top: "55%", left: "20%", width: 120, opacity: 0.35, duration: 45 },
    { top: "10%", left: "40%", width: 160, opacity: 0.5, duration: 55 },
  ], []);

  const sparkles = useMemo(() =>
    Array.from({ length: 8 }, (_, i) => ({
      angle: (i / 8) * Math.PI * 2,
      distance: 80 + Math.random() * 40,
      size: 3 + Math.random() * 4,
      delay: Math.random() * 0.5,
    })),
  []);

  // Balloon scale: inflates on inhale, deflates on exhale
  const balloonScale = isActive
    ? isInhale ? 0.7 + 0.5 * phaseProgress : 1.2 - 0.5 * phaseProgress
    : 0.7;

  const balloonY = isActive
    ? isInhale ? 20 - 40 * phaseProgress : -20 + 40 * phaseProgress
    : 20;

  const showSparkles = isActive && isInhale && phaseProgress > 0.85;

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Sky gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, #87CEEB 0%, ${technique.colors.primary} 60%, #f0f8ff 100%)`,
        }}
      />

      {/* Clouds */}
      {clouds.map((cloud, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            top: cloud.top,
            width: cloud.width,
            height: cloud.width * 0.5,
            background: `rgba(255, 255, 255, ${cloud.opacity})`,
            filter: "blur(20px)",
          }}
          animate={{
            left: [cloud.left, `${parseInt(cloud.left) + 120}%`],
          }}
          transition={{
            duration: cloud.duration,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}

      {/* Balloon + String */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="relative flex flex-col items-center"
          animate={{ y: balloonY }}
          transition={{ duration: 0.15, ease: "linear" }}
        >
          {/* Balloon body */}
          <motion.div
            animate={{ scale: balloonScale }}
            transition={{ duration: 0.15, ease: "linear" }}
            style={{ transformOrigin: "center bottom" }}
          >
            <svg width="140" height="180" viewBox="0 0 140 180">
              <defs>
                <radialGradient id="balloonGrad" cx="35%" cy="35%" r="60%">
                  <stop offset="0%" stopColor="#ff6b8a" stopOpacity="0.95" />
                  <stop offset="50%" stopColor="#e84570" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#c0275a" stopOpacity="0.85" />
                </radialGradient>
              </defs>
              {/* Balloon shape */}
              <ellipse cx="70" cy="72" rx="55" ry="68" fill="url(#balloonGrad)" />
              {/* Balloon knot */}
              <polygon points="65,138 70,148 75,138" fill="#c0275a" />
              {/* Highlight */}
              <ellipse cx="50" cy="50" rx="18" ry="24" fill="rgba(255,255,255,0.2)" />
            </svg>
          </motion.div>

          {/* String */}
          <svg width="20" height="80" className="-mt-1">
            <motion.path
              d="M10,0 C8,20 12,40 10,60 C8,70 12,75 10,80"
              stroke="#999"
              strokeWidth="1.5"
              fill="none"
              animate={{
                d: [
                  "M10,0 C8,20 12,40 10,60 C8,70 12,75 10,80",
                  "M10,0 C12,20 8,40 10,60 C12,70 8,75 10,80",
                  "M10,0 C8,20 12,40 10,60 C8,70 12,75 10,80",
                ],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
          </svg>

          {/* Sparkles at peak */}
          {showSparkles && sparkles.map((s, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-yellow-300"
              style={{
                width: s.size,
                height: s.size,
                top: 72 - 68, // near top of balloon
                left: 70,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
                x: Math.cos(s.angle) * s.distance,
                y: Math.sin(s.angle) * s.distance - 40,
              }}
              transition={{ duration: 0.8, delay: s.delay, ease: "easeOut" }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
