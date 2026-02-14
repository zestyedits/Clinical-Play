import { useMemo } from "react";
import { motion } from "framer-motion";
import type { BreathingThemeProps } from "./types";

export function NorthernLights({ technique, isActive, phaseIndex, phaseProgress }: BreathingThemeProps) {
  const phase = technique.phases[phaseIndex];
  const isInhale = phase?.type === "inhale";
  const isExhale = phase?.type === "exhale";

  const bgStars = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 60,
      size: 1 + Math.random() * 1.5,
      twinkleDelay: Math.random() * 4,
    })),
  []);

  // Aurora wave amplitude based on phase
  const auroraAmplitude = isActive
    ? isInhale ? 20 + 30 * phaseProgress : isExhale ? 50 - 30 * phaseProgress : phase?.type === "hold" ? 50 : 20
    : 15;

  const auroraOpacity = isActive
    ? isInhale ? 0.4 + 0.4 * phaseProgress : isExhale ? 0.8 - 0.4 * phaseProgress : phase?.type === "hold" ? 0.8 : 0.4
    : 0.3;

  const auroraY = isActive
    ? isInhale ? 10 * phaseProgress : isExhale ? 10 - 10 * phaseProgress : phase?.type === "hold" ? 10 : 0
    : 0;

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, ${technique.colors.primary} 0%, ${technique.colors.secondary} 60%, #0f0f2a 100%)`,
        }}
      />

      {/* Stars */}
      {bgStars.map((star, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            animation: `aurora-twinkle 3s ease-in-out ${star.twinkleDelay}s infinite`,
          }}
        />
      ))}

      {/* Aurora bands */}
      <motion.div
        className="absolute inset-x-0 top-[10%]"
        style={{ height: "50%" }}
        animate={{ y: -auroraY }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        <svg width="100%" height="100%" viewBox="0 0 1000 400" preserveAspectRatio="none">
          <defs>
            <linearGradient id="aurora1" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#4aff8a" stopOpacity="0.6" />
              <stop offset="30%" stopColor="#00d4aa" stopOpacity="0.5" />
              <stop offset="60%" stopColor="#4488ff" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#8844dd" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="aurora2" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#88ff88" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#44ddaa" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#6666ff" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="aurora3" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6644dd" stopOpacity="0.2" />
              <stop offset="40%" stopColor="#44aaff" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#88ffaa" stopOpacity="0.25" />
            </linearGradient>
            <filter id="auroraBlur">
              <feGaussianBlur stdDeviation="8" />
            </filter>
            <filter id="auroraBlurOuter">
              <feGaussianBlur stdDeviation="16" />
            </filter>
          </defs>

          {/* Band 1 - main green */}
          <motion.path
            fill="url(#aurora1)"
            opacity={auroraOpacity}
            filter="url(#auroraBlur)"
            animate={{
              d: [
                `M0,${200 - auroraAmplitude} C200,${200 + auroraAmplitude} 400,${200 - auroraAmplitude * 0.8} 600,${200 + auroraAmplitude * 0.6} C800,${200 - auroraAmplitude * 0.5} 900,${200 + auroraAmplitude * 0.4} 1000,${200 - auroraAmplitude * 0.3} L1000,${200 + 60} L0,${200 + 60}Z`,
                `M0,${200 + auroraAmplitude * 0.5} C200,${200 - auroraAmplitude * 0.8} 400,${200 + auroraAmplitude} 600,${200 - auroraAmplitude * 0.7} C800,${200 + auroraAmplitude * 0.6} 900,${200 - auroraAmplitude * 0.5} 1000,${200 + auroraAmplitude * 0.4} L1000,${200 + 60} L0,${200 + 60}Z`,
              ],
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", repeatType: "reverse" }}
          />

          {/* Band 2 */}
          <motion.path
            fill="url(#aurora2)"
            opacity={auroraOpacity * 0.7}
            filter="url(#auroraBlur)"
            animate={{
              d: [
                `M0,${160 + auroraAmplitude * 0.3} C250,${160 - auroraAmplitude * 0.6} 500,${160 + auroraAmplitude * 0.8} 750,${160 - auroraAmplitude * 0.4} C900,${160 + auroraAmplitude * 0.3} 1000,${160 - auroraAmplitude * 0.2} 1000,${160} L1000,${160 + 50} L0,${160 + 50}Z`,
                `M0,${160 - auroraAmplitude * 0.4} C250,${160 + auroraAmplitude * 0.7} 500,${160 - auroraAmplitude * 0.5} 750,${160 + auroraAmplitude * 0.6} C900,${160 - auroraAmplitude * 0.3} 1000,${160 + auroraAmplitude * 0.4} 1000,${160} L1000,${160 + 50} L0,${160 + 50}Z`,
              ],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", repeatType: "reverse", delay: 1 }}
          />

          {/* Band 3 - outer diffuse */}
          <motion.path
            fill="url(#aurora3)"
            opacity={auroraOpacity * 0.5}
            filter="url(#auroraBlurOuter)"
            animate={{
              d: [
                `M0,${240 - auroraAmplitude * 0.2} C300,${240 + auroraAmplitude * 0.5} 600,${240 - auroraAmplitude * 0.4} 1000,${240 + auroraAmplitude * 0.3} L1000,${240 + 40} L0,${240 + 40}Z`,
                `M0,${240 + auroraAmplitude * 0.3} C300,${240 - auroraAmplitude * 0.4} 600,${240 + auroraAmplitude * 0.5} 1000,${240 - auroraAmplitude * 0.2} L1000,${240 + 40} L0,${240 + 40}Z`,
              ],
            }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", repeatType: "reverse", delay: 2 }}
          />
        </svg>
      </motion.div>

      {/* Mountain silhouette */}
      <svg
        className="absolute bottom-0 left-0 w-full"
        viewBox="0 0 1000 200"
        preserveAspectRatio="none"
        style={{ height: "20%" }}
      >
        <path
          d="M0,200 L0,140 L80,100 L160,130 L250,60 L340,110 L400,80 L480,120 L560,50 L640,90 L720,70 L800,110 L880,85 L960,120 L1000,100 L1000,200Z"
          fill="#050510"
        />
        <path
          d="M0,200 L0,160 L100,130 L200,150 L320,110 L420,140 L520,120 L620,145 L720,115 L820,140 L920,125 L1000,150 L1000,200Z"
          fill="#080818"
        />
      </svg>

      {/* CSS for star twinkle */}
      <style>{`
        @keyframes aurora-twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.9; }
        }
      `}</style>
    </div>
  );
}
