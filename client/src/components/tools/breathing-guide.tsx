import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Wind } from "lucide-react";
import { cn } from "@/lib/utils";
import { playBreathSound } from "@/lib/audio-feedback";

interface BreathingGuideProps {
  isActive: boolean;
  isClinician: boolean;
  onToggle: () => void;
  startTime?: number | null;
}

const PHASES = [
  { label: "Breathe In", duration: 4000, scale: 1.6, color: "hsl(200, 60%, 65%)", glow: "rgba(100,180,255,0.3)", icon: "↑" },
  { label: "Hold", duration: 4000, scale: 1.6, color: "hsl(45, 70%, 65%)", glow: "rgba(220,190,80,0.3)", icon: "●" },
  { label: "Breathe Out", duration: 6000, scale: 1, color: "hsl(160, 45%, 55%)", glow: "rgba(80,190,140,0.3)", icon: "↓" },
  { label: "Rest", duration: 2000, scale: 1, color: "hsl(270, 30%, 70%)", glow: "rgba(160,140,200,0.25)", icon: "~" },
];

const TOTAL_CYCLE = PHASES.reduce((sum, p) => sum + p.duration, 0);
const PARTICLE_COUNT = 12;

export function BreathingGuide({ isActive, isClinician, onToggle, startTime }: BreathingGuideProps) {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setPhaseIndex(0);
      setElapsed(0);
      setCycleCount(0);
      return;
    }

    const initialElapsed = startTime ? Date.now() - startTime : 0;
    setElapsed(initialElapsed);
    setCycleCount(Math.floor(initialElapsed / TOTAL_CYCLE));

    const interval = setInterval(() => {
      setElapsed(prev => {
        const next = prev + 50;
        const cyclePos = next % TOTAL_CYCLE;
        const newCycle = Math.floor(next / TOTAL_CYCLE);
        if (newCycle > Math.floor(prev / TOTAL_CYCLE)) {
          setCycleCount(newCycle);
        }
        let acc = 0;
        for (let i = 0; i < PHASES.length; i++) {
          acc += PHASES[i].duration;
          if (cyclePos < acc) {
            setPhaseIndex(i);
            break;
          }
        }
        return next;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isActive, startTime]);

  // Play soft whoosh on inhale/exhale transitions
  useEffect(() => {
    if (isActive && (phaseIndex === 0 || phaseIndex === 2)) {
      playBreathSound();
    }
  }, [isActive, phaseIndex]);

  const currentPhase = PHASES[phaseIndex];

  const phaseProgress = useMemo(() => {
    let acc = 0;
    for (let i = 0; i < phaseIndex; i++) acc += PHASES[i].duration;
    const inPhase = (elapsed % TOTAL_CYCLE) - acc;
    return Math.max(0, Math.min(1, inPhase / currentPhase.duration));
  }, [elapsed, phaseIndex, currentPhase.duration]);

  // Generate stable particle positions
  const particles = useMemo(() => {
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      angle: (i / PARTICLE_COUNT) * Math.PI * 2,
      size: 2 + Math.random() * 3,
      speed: 0.8 + Math.random() * 0.4,
      offset: Math.random() * Math.PI * 2,
    }));
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden select-none">
      {/* Deep atmospheric background with phase-responsive gradient */}
      <div className="absolute inset-0 transition-all duration-[2000ms] ease-in-out" style={{
        background: isActive
          ? `radial-gradient(ellipse 90% 70% at 50% 45%, ${currentPhase.glow} 0%, hsl(220 20% 12% / 0.06) 50%, hsl(220 25% 10% / 0.15) 100%)`
          : `radial-gradient(ellipse 80% 60% at 50% 50%, hsl(200 15% 95%) 0%, hsl(220 20% 92%) 100%)`,
      }} />

      {/* Floating ambient orbs - respond to phase color */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute w-[45%] h-[45%] left-[5%] top-[10%] rounded-full"
          animate={{
            background: isActive
              ? `radial-gradient(circle, ${currentPhase.glow.replace("0.3", "0.12")} 0%, transparent 70%)`
              : "radial-gradient(circle, rgba(127,185,155,0.08) 0%, transparent 70%)",
            x: [0, 30, -10, 0],
            y: [0, -20, 15, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          style={{ filter: "blur(80px)" }}
        />
        <motion.div
          className="absolute w-[40%] h-[40%] right-[0%] bottom-[15%] rounded-full"
          animate={{
            background: isActive
              ? `radial-gradient(circle, ${currentPhase.glow.replace("0.3", "0.08")} 0%, transparent 70%)`
              : "radial-gradient(circle, rgba(27,42,74,0.05) 0%, transparent 70%)",
            x: [0, -25, 15, 0],
            y: [0, 20, -10, 0],
          }}
          transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
          style={{ filter: "blur(80px)" }}
        />
        <motion.div
          className="absolute w-[35%] h-[35%] left-[30%] bottom-[0%] rounded-full"
          animate={{
            x: [0, 20, -15, 0],
            y: [0, -15, 10, 0],
          }}
          transition={{ duration: 35, repeat: Infinity, ease: "easeInOut" }}
          style={{
            background: "radial-gradient(circle, rgba(212,175,55,0.04) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6 md:gap-8">
        {/* Cycle counter */}
        <AnimatePresence>
          {isActive && cycleCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2"
            >
              <Wind size={12} className="text-muted-foreground/50" />
              <span className="text-xs font-medium text-muted-foreground/60 tracking-widest uppercase">
                Breath {cycleCount + 1}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main breathing orb */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: 1,
            scale: isActive ? currentPhase.scale : 1,
          }}
          transition={{
            opacity: { duration: 0.6, delay: 0.1 },
            scale: {
              duration: currentPhase.duration / 1000,
              ease: "easeInOut",
            },
          }}
        >
          {/* Orbiting particle ring */}
          {isActive && (
            <div className="absolute inset-0 flex items-center justify-center">
              {particles.map((p, i) => {
                const baseRadius = 110;
                const expandedRadius = isActive && currentPhase.scale > 1 ? 140 : 110;
                return (
                  <motion.div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                      width: p.size,
                      height: p.size,
                    }}
                    animate={{
                      x: [
                        Math.cos(p.angle) * baseRadius,
                        Math.cos(p.angle + 0.5) * expandedRadius,
                        Math.cos(p.angle + 1) * baseRadius,
                        Math.cos(p.angle + 1.5) * expandedRadius,
                        Math.cos(p.angle + 2) * baseRadius,
                      ],
                      y: [
                        Math.sin(p.angle) * baseRadius,
                        Math.sin(p.angle + 0.5) * expandedRadius,
                        Math.sin(p.angle + 1) * baseRadius,
                        Math.sin(p.angle + 1.5) * expandedRadius,
                        Math.sin(p.angle + 2) * baseRadius,
                      ],
                      opacity: [0.15, 0.5, 0.15, 0.5, 0.15],
                      scale: [0.6, 1.2, 0.6, 1.2, 0.6],
                      backgroundColor: currentPhase.color,
                    }}
                    transition={{
                      duration: TOTAL_CYCLE / 1000 * p.speed,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.3,
                    }}
                  />
                );
              })}
            </div>
          )}

          <svg width="200" height="200" viewBox="0 0 200 200" className="drop-shadow-2xl">
            <defs>
              {/* Phase-responsive gradient */}
              <radialGradient id="breathGradient" cx="40%" cy="40%" r="55%">
                <stop offset="0%" stopColor="hsl(180, 20%, 90%)" stopOpacity="0.95">
                  <animate
                    attributeName="stop-color"
                    values={isActive
                      ? `${currentPhase.color.replace("65%)", "85%)")};${currentPhase.color.replace("65%)", "85%)")}`
                      : "hsl(180, 20%, 90%);hsl(180, 20%, 90%)"}
                    dur="2s"
                  />
                </stop>
                <stop offset="50%" stopColor="hsl(200, 25%, 72%)" stopOpacity="0.8">
                  <animate
                    attributeName="stop-color"
                    values={isActive
                      ? `${currentPhase.color};${currentPhase.color}`
                      : "hsl(200, 25%, 72%);hsl(200, 25%, 72%)"}
                    dur="2s"
                  />
                </stop>
                <stop offset="100%" stopColor="hsl(220, 35%, 35%)" stopOpacity="0.5" />
              </radialGradient>

              <filter id="glow">
                <feGaussianBlur stdDeviation="10" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>

              {/* Organic wobble for breathing circle */}
              <filter id="organic">
                <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="3" result="noise" seed="2" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale={isActive ? "3" : "1"} />
              </filter>
            </defs>

            {/* Outer glow ring that pulses with phase */}
            <motion.circle
              cx="100" cy="100" r="95"
              fill="none"
              strokeWidth="1"
              animate={isActive ? {
                stroke: currentPhase.glow,
                opacity: [0.1, 0.35, 0.1],
                r: [93, 96, 93],
              } : { opacity: 0.05, stroke: "rgba(200,200,200,0.2)" }}
              transition={{ duration: TOTAL_CYCLE / 1000, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Secondary ring with dashes */}
            <motion.circle
              cx="100" cy="100" r="90"
              fill="none"
              strokeWidth="0.5"
              strokeDasharray="3 7"
              animate={isActive ? {
                stroke: currentPhase.color,
                opacity: [0.1, 0.25, 0.1],
                strokeDashoffset: [0, -20],
              } : { opacity: 0.08 }}
              transition={{ duration: TOTAL_CYCLE / 1000, repeat: Infinity, ease: "linear" }}
            />

            {/* Main breathing orb */}
            <motion.circle
              cx="100"
              cy="100"
              r="78"
              fill="url(#breathGradient)"
              filter="url(#glow)"
              animate={{
                opacity: isActive ? [0.85, 0.95, 0.85] : 0.45,
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Inner concentric rings for depth */}
            <circle cx="100" cy="100" r="58" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
            <circle cx="100" cy="100" r="38" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.3" />

            {/* Highlight spot for 3D glass effect */}
            <ellipse cx="82" cy="78" rx="22" ry="16" fill="rgba(255,255,255,0.12)" />
            <ellipse cx="85" cy="75" rx="12" ry="8" fill="rgba(255,255,255,0.08)" />
          </svg>

          {/* Outer aura glow */}
          {isActive && (
            <motion.div
              className="absolute inset-[-20px] rounded-full pointer-events-none"
              animate={{
                boxShadow: [
                  `0 0 40px 15px ${currentPhase.glow}`,
                  `0 0 70px 25px ${currentPhase.glow.replace("0.3", "0.15")}`,
                  `0 0 40px 15px ${currentPhase.glow}`,
                ],
              }}
              transition={{ duration: currentPhase.duration / 1000, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
        </motion.div>

        {/* Phase indicator dots */}
        {isActive && (
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {PHASES.map((phase, i) => (
              <motion.div
                key={phase.label}
                className="flex items-center gap-1.5"
                animate={{ opacity: i === phaseIndex ? 1 : 0.3 }}
                transition={{ duration: 0.4 }}
              >
                <motion.div
                  className="rounded-full"
                  style={{ backgroundColor: phase.color }}
                  animate={{
                    width: i === phaseIndex ? 24 : 6,
                    height: 6,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Phase label */}
        <AnimatePresence mode="wait">
          <motion.div
            key={isActive ? `${currentPhase.label}-${phaseIndex}` : "idle"}
            initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="text-center"
          >
            <motion.h2
              className="font-display text-4xl md:text-5xl tracking-tight mb-2"
              animate={{ color: isActive ? currentPhase.color : "hsl(220, 35%, 25%)" }}
              transition={{ duration: 1 }}
            >
              {isActive ? currentPhase.label : "Calm Breathing"}
            </motion.h2>
            <p className="text-muted-foreground text-sm">
              {isActive
                ? "Follow the rhythm of the orb"
                : "A synchronized breathing exercise for the group"
              }
            </p>

            {/* Phase progress bar */}
            {isActive && (
              <motion.div
                className="w-32 h-1 mx-auto mt-4 rounded-full overflow-hidden"
                style={{ backgroundColor: `${currentPhase.color}20` }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    width: `${phaseProgress * 100}%`,
                    backgroundColor: currentPhase.color,
                    boxShadow: `0 0 8px ${currentPhase.glow}`,
                  }}
                />
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Controls */}
        {isClinician && (
          <motion.button
            onClick={onToggle}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "btn-luxury px-8 py-4 rounded-2xl font-medium text-sm flex items-center gap-3 transition-all cursor-pointer",
              isActive
                ? "bg-destructive/90 text-white hover:bg-destructive shadow-[0_4px_24px_rgba(220,38,38,0.25)]"
                : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_4px_24px_rgba(27,42,74,0.2)] ring-1 ring-accent/20"
            )}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            data-testid="button-toggle-breathing"
          >
            {isActive ? <Pause size={18} /> : <Play size={18} />}
            {isActive ? "Stop Breathing Exercise" : "Start Breathing Exercise"}
          </motion.button>
        )}

        {!isClinician && !isActive && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-sm text-muted-foreground/70 italic"
          >
            Waiting for your clinician to start the exercise...
          </motion.p>
        )}
      </div>
    </div>
  );
}
