import { useMemo } from "react";
import { motion } from "framer-motion";
import type { BreathingThemeProps } from "./types";

export function OceanWaves({ technique, isActive, phaseIndex, phaseProgress }: BreathingThemeProps) {
  const phase = technique.phases[phaseIndex];
  const isInhale = phase?.type === "inhale";
  const isExhale = phase?.type === "exhale";

  const bubbles = useMemo(() =>
    Array.from({ length: 10 }, (_, i) => ({
      x: 10 + Math.random() * 80,
      size: 3 + Math.random() * 6,
      delay: Math.random() * 8,
      duration: 6 + Math.random() * 6,
      opacity: 0.15 + Math.random() * 0.25,
    })),
  []);

  // Wave Y offset based on breathing phase
  const waveOffset = isActive
    ? isInhale ? -20 * phaseProgress : isExhale ? -20 + 20 * phaseProgress : phase?.type === "hold" ? -20 : 0
    : 0;

  const orbBrightness = isActive
    ? isInhale ? 0.5 + 0.5 * phaseProgress : isExhale ? 1 - 0.5 * phaseProgress : phase?.type === "hold" ? 1 : 0.5
    : 0.4;

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Background gradient */}
      <div
        className="absolute inset-0 transition-all duration-[2000ms]"
        style={{
          background: `linear-gradient(180deg, ${technique.colors.primary} 0%, ${technique.colors.secondary} 50%, ${technique.colors.tertiary} 100%)`,
        }}
      />

      {/* Bubbles */}
      {bubbles.map((b, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${b.x}%`,
            width: b.size,
            height: b.size,
            background: `rgba(120, 220, 255, ${b.opacity})`,
          }}
          animate={{
            bottom: ["-5%", "105%"],
            opacity: [0, b.opacity, b.opacity, 0],
          }}
          transition={{
            duration: b.duration,
            repeat: Infinity,
            delay: b.delay,
            ease: "linear",
          }}
        />
      ))}

      {/* Waves */}
      <svg
        className="absolute bottom-0 left-0 w-full"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        style={{ height: "40%", transform: `translateY(${waveOffset}px)`, transition: "transform 1.5s ease-in-out" }}
      >
        <motion.path
          d="M0,192 C180,160 360,240 540,192 C720,144 900,240 1080,192 C1260,144 1350,200 1440,192 L1440,320 L0,320Z"
          fill="rgba(26,106,122,0.3)"
          animate={{ d: [
            "M0,192 C180,160 360,240 540,192 C720,144 900,240 1080,192 C1260,144 1350,200 1440,192 L1440,320 L0,320Z",
            "M0,200 C180,240 360,160 540,200 C720,240 900,160 1080,200 C1260,240 1350,180 1440,200 L1440,320 L0,320Z",
            "M0,192 C180,160 360,240 540,192 C720,144 900,240 1080,192 C1260,144 1350,200 1440,192 L1440,320 L0,320Z",
          ]}}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.path
          d="M0,224 C240,192 480,256 720,224 C960,192 1200,256 1440,224 L1440,320 L0,320Z"
          fill="rgba(26,106,122,0.4)"
          animate={{ d: [
            "M0,224 C240,192 480,256 720,224 C960,192 1200,256 1440,224 L1440,320 L0,320Z",
            "M0,240 C240,260 480,200 720,240 C960,260 1200,200 1440,240 L1440,320 L0,320Z",
            "M0,224 C240,192 480,256 720,224 C960,192 1200,256 1440,224 L1440,320 L0,320Z",
          ]}}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />
        <motion.path
          d="M0,260 C360,240 720,280 1080,260 C1260,250 1350,270 1440,260 L1440,320 L0,320Z"
          fill="rgba(26,106,122,0.5)"
          animate={{ d: [
            "M0,260 C360,240 720,280 1080,260 C1260,250 1350,270 1440,260 L1440,320 L0,320Z",
            "M0,270 C360,285 720,250 1080,270 C1260,280 1350,260 1440,270 L1440,320 L0,320Z",
            "M0,260 C360,240 720,280 1080,260 C1260,250 1350,270 1440,260 L1440,320 L0,320Z",
          ]}}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </svg>

      {/* Central bioluminescent orb */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="rounded-full"
          animate={{
            width: isActive ? (isInhale ? 160 + 60 * phaseProgress : isExhale ? 220 - 60 * phaseProgress : phase?.type === "hold" ? 220 : 160) : 140,
            height: isActive ? (isInhale ? 160 + 60 * phaseProgress : isExhale ? 220 - 60 * phaseProgress : phase?.type === "hold" ? 220 : 160) : 140,
          }}
          transition={{ duration: 0.15, ease: "linear" }}
          style={{
            background: `radial-gradient(circle, rgba(80,220,240,${orbBrightness * 0.6}) 0%, rgba(26,106,122,${orbBrightness * 0.3}) 50%, transparent 70%)`,
            boxShadow: `0 0 ${40 + orbBrightness * 40}px ${10 + orbBrightness * 20}px rgba(80,220,240,${orbBrightness * 0.3})`,
            filter: "blur(1px)",
          }}
        />
      </div>
    </div>
  );
}
