import { useMemo } from "react";
import { motion } from "framer-motion";
import type { BreathingThemeProps } from "./types";

export function CampfireGlow({ technique, isActive, phaseIndex, phaseProgress }: BreathingThemeProps) {
  const phase = technique.phases[phaseIndex];
  const isInhale = phase?.type === "inhale";
  const isExhale = phase?.type === "exhale";

  const embers = useMemo(() =>
    Array.from({ length: 14 }, (_, i) => ({
      x: 40 + Math.random() * 20,
      size: 2 + Math.random() * 4,
      delay: Math.random() * 6,
      duration: 4 + Math.random() * 5,
      drift: -15 + Math.random() * 30,
      opacity: 0.4 + Math.random() * 0.5,
    })),
  []);

  // Flame height based on phase
  const flameScale = isActive
    ? isInhale ? 0.7 + 0.5 * phaseProgress : isExhale ? 1.2 - 0.5 * phaseProgress : phase?.type === "hold" ? (phaseIndex === 1 ? 1.2 : 0.7) : 0.7
    : 0.6;

  const glowIntensity = isActive
    ? isInhale ? 0.3 + 0.4 * phaseProgress : isExhale ? 0.7 - 0.4 * phaseProgress : phase?.type === "hold" ? (phaseIndex === 1 ? 0.7 : 0.3) : 0.3
    : 0.2;

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 85%, rgba(201,118,10,${glowIntensity * 0.3}) 0%, ${technique.colors.primary} 60%)`,
        }}
      />

      {/* Ground */}
      <div className="absolute bottom-0 left-0 right-0 h-[15%]">
        <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 20">
          <ellipse cx="50" cy="18" rx="45" ry="6" fill="rgba(60,30,5,0.8)" />
          <ellipse cx="50" cy="16" rx="30" ry="3" fill={`rgba(201,118,10,${glowIntensity * 0.4})`} filter="url(#groundGlow)" />
          <defs>
            <filter id="groundGlow">
              <feGaussianBlur stdDeviation="3" />
            </filter>
          </defs>
        </svg>
      </div>

      {/* Flames */}
      <div className="absolute bottom-[12%] left-1/2 -translate-x-1/2" style={{ transformOrigin: "center bottom" }}>
        <motion.div
          animate={{ scaleY: flameScale }}
          transition={{ duration: 0.15, ease: "linear" }}
          style={{ transformOrigin: "center bottom" }}
        >
          <svg width="160" height="200" viewBox="0 0 160 200">
            {/* Outer red flame */}
            <motion.path
              d="M80,10 C60,50 30,90 40,140 C45,165 60,185 80,190 C100,185 115,165 120,140 C130,90 100,50 80,10Z"
              fill="rgba(220,60,30,0.7)"
              animate={{
                d: [
                  "M80,10 C60,50 30,90 40,140 C45,165 60,185 80,190 C100,185 115,165 120,140 C130,90 100,50 80,10Z",
                  "M80,15 C55,55 35,85 42,140 C48,168 62,183 80,188 C98,183 112,168 118,140 C125,85 105,55 80,15Z",
                  "M80,10 C60,50 30,90 40,140 C45,165 60,185 80,190 C100,185 115,165 120,140 C130,90 100,50 80,10Z",
                ],
              }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* Middle orange flame */}
            <motion.path
              d="M80,35 C65,65 45,100 52,145 C56,162 66,175 80,178 C94,175 104,162 108,145 C115,100 95,65 80,35Z"
              fill="rgba(255,150,30,0.8)"
              animate={{
                d: [
                  "M80,35 C65,65 45,100 52,145 C56,162 66,175 80,178 C94,175 104,162 108,145 C115,100 95,65 80,35Z",
                  "M80,40 C68,68 48,95 54,143 C58,160 68,173 80,176 C92,173 102,160 106,143 C112,95 92,68 80,40Z",
                  "M80,35 C65,65 45,100 52,145 C56,162 66,175 80,178 C94,175 104,162 108,145 C115,100 95,65 80,35Z",
                ],
              }}
              transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
            />
            {/* Inner yellow flame */}
            <motion.path
              d="M80,60 C72,80 58,110 64,148 C67,158 72,166 80,168 C88,166 93,158 96,148 C102,110 88,80 80,60Z"
              fill="rgba(255,220,80,0.85)"
              animate={{
                d: [
                  "M80,60 C72,80 58,110 64,148 C67,158 72,166 80,168 C88,166 93,158 96,148 C102,110 88,80 80,60Z",
                  "M80,65 C74,82 60,108 65,146 C68,157 73,164 80,166 C87,164 92,157 95,146 C100,108 86,82 80,65Z",
                  "M80,60 C72,80 58,110 64,148 C67,158 72,166 80,168 C88,166 93,158 96,148 C102,110 88,80 80,60Z",
                ],
              }}
              transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
            />
          </svg>
        </motion.div>
      </div>

      {/* Warm glow around fire */}
      <div
        className="absolute bottom-[10%] left-1/2 -translate-x-1/2 w-[300px] h-[300px] rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, rgba(255,150,30,${glowIntensity * 0.25}) 0%, rgba(201,118,10,${glowIntensity * 0.1}) 40%, transparent 70%)`,
          filter: "blur(20px)",
        }}
      />

      {/* Embers */}
      {embers.map((ember, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${ember.x}%`,
            width: ember.size,
            height: ember.size,
            background: `rgba(255, ${140 + Math.random() * 60}, 30, ${ember.opacity})`,
            boxShadow: `0 0 ${ember.size * 2}px rgba(255,150,30,0.4)`,
          }}
          animate={{
            bottom: ["18%", "85%"],
            x: [0, ember.drift],
            opacity: [ember.opacity, ember.opacity * 0.5, 0],
          }}
          transition={{
            duration: ember.duration,
            repeat: Infinity,
            delay: ember.delay,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}
