import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { BreathingThemeProps } from "./types";

export function StarryNight({ technique, isActive, phaseIndex, phaseProgress }: BreathingThemeProps) {
  const phase = technique.phases[phaseIndex];
  const isInhale = phase?.type === "inhale";
  const isExhale = phase?.type === "exhale";

  const stars = useMemo(() =>
    Array.from({ length: 50 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 2.5,
      twinkleDelay: Math.random() * 5,
      twinkleDuration: 2 + Math.random() * 3,
    })),
  []);

  const [shootingStar, setShootingStar] = useState<{ x: number; y: number; angle: number } | null>(null);

  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setShootingStar({
        x: 10 + Math.random() * 60,
        y: 5 + Math.random() * 30,
        angle: 20 + Math.random() * 30,
      });
      setTimeout(() => setShootingStar(null), 1200);
    }, 8000 + Math.random() * 7000);
    return () => clearInterval(interval);
  }, [isActive]);

  // Nebula scale/opacity based on phase
  const nebulaScale = isActive
    ? isInhale ? 1 + 0.3 * phaseProgress : isExhale ? 1.3 - 0.3 * phaseProgress : phase?.type === "hold" ? 1.3 : 1
    : 0.9;
  const nebulaOpacity = isActive
    ? isInhale ? 0.3 + 0.4 * phaseProgress : isExhale ? 0.7 - 0.4 * phaseProgress : phase?.type === "hold" ? 0.7 : 0.3
    : 0.2;

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 80% 70% at 50% 45%, ${technique.colors.secondary} 0%, ${technique.colors.primary} 70%)`,
        }}
      />

      {/* Stars with CSS twinkle */}
      <div className="absolute inset-0">
        {stars.map((star, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
              animation: `twinkle ${star.twinkleDuration}s ease-in-out ${star.twinkleDelay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Nebula */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="rounded-full"
          animate={{
            scale: nebulaScale,
            opacity: nebulaOpacity,
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          style={{
            width: 280,
            height: 280,
            background: `radial-gradient(circle, rgba(120,80,200,0.6) 0%, rgba(60,40,140,0.3) 40%, rgba(30,20,80,0.1) 60%, transparent 70%)`,
            filter: "blur(8px)",
          }}
        />
      </div>

      {/* Brighter inner glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          className="rounded-full"
          animate={{
            scale: nebulaScale * 0.5,
            opacity: nebulaOpacity * 0.8,
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          style={{
            width: 120,
            height: 120,
            background: "radial-gradient(circle, rgba(180,150,255,0.5) 0%, rgba(120,80,200,0.2) 50%, transparent 70%)",
            filter: "blur(4px)",
          }}
        />
      </div>

      {/* Shooting star */}
      <AnimatePresence>
        {shootingStar && (
          <motion.div
            className="absolute"
            style={{
              left: `${shootingStar.x}%`,
              top: `${shootingStar.y}%`,
            }}
            initial={{ opacity: 0, x: 0, y: 0 }}
            animate={{ opacity: [0, 1, 1, 0], x: 200, y: 100 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <div
              className="w-1 h-1 bg-white rounded-full"
              style={{
                boxShadow: "0 0 4px 2px rgba(255,255,255,0.6), -20px 0 20px 1px rgba(200,180,255,0.3)",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Twinkle CSS */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
