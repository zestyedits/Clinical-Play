import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreathingGuideProps {
  isActive: boolean;
  isClinician: boolean;
  onToggle: () => void;
  startTime?: number | null;
}

const PHASES = [
  { label: "Breathe In", duration: 4000, scale: 1.6 },
  { label: "Hold", duration: 4000, scale: 1.6 },
  { label: "Breathe Out", duration: 6000, scale: 1 },
  { label: "Rest", duration: 2000, scale: 1 },
];

const TOTAL_CYCLE = PHASES.reduce((sum, p) => sum + p.duration, 0);

export function BreathingGuide({ isActive, isClinician, onToggle, startTime }: BreathingGuideProps) {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setPhaseIndex(0);
      setElapsed(0);
      return;
    }

    const initialElapsed = startTime ? Date.now() - startTime : 0;
    setElapsed(initialElapsed);

    const interval = setInterval(() => {
      setElapsed(prev => {
        const next = prev + 50;
        let acc = 0;
        for (let i = 0; i < PHASES.length; i++) {
          acc += PHASES[i].duration;
          if (next % TOTAL_CYCLE < acc) {
            setPhaseIndex(i);
            break;
          }
        }
        return next;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isActive, startTime]);

  const currentPhase = PHASES[phaseIndex];
  const phaseProgress = (() => {
    let acc = 0;
    for (let i = 0; i < phaseIndex; i++) acc += PHASES[i].duration;
    const inPhase = (elapsed % TOTAL_CYCLE) - acc;
    return Math.max(0, Math.min(1, inPhase / currentPhase.duration));
  })();

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden">
      {/* Multi-layer atmospheric background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Base gradient */}
        <div className="absolute inset-0" style={{
          background: isActive
            ? `radial-gradient(ellipse 80% 60% at 50% 40%, hsl(150 20% 88% / 0.9) 0%, hsl(220 35% 15% / 0.08) 60%, hsl(220 35% 15% / 0.2) 100%)`
            : `radial-gradient(ellipse 80% 60% at 50% 50%, hsl(150 15% 95%) 0%, hsl(220 25% 92%) 100%)`,
          transition: "all 2s ease",
        }} />

        {/* Floating ambient blobs */}
        <div
          className="absolute w-[40%] h-[40%] left-[10%] top-[15%] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(127,185,155,0.12) 0%, transparent 70%)",
            filter: "blur(80px)",
            animation: "ambient-drift 45s ease-in-out infinite",
            opacity: isActive ? 0.8 : 0.3,
            transition: "opacity 2s ease",
          }}
        />
        <div
          className="absolute w-[35%] h-[35%] right-[5%] bottom-[20%] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(27,42,74,0.08) 0%, transparent 70%)",
            filter: "blur(80px)",
            animation: "ambient-drift-2 38s ease-in-out infinite",
            opacity: isActive ? 0.6 : 0.2,
            transition: "opacity 2s ease",
          }}
        />
        <div
          className="absolute w-[30%] h-[30%] left-[40%] bottom-[5%] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)",
            filter: "blur(60px)",
            animation: "ambient-drift-3 52s ease-in-out infinite",
            opacity: isActive ? 0.5 : 0.15,
            transition: "opacity 2s ease",
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8">
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
          <svg width="200" height="200" viewBox="0 0 200 200" className="drop-shadow-2xl">
            <defs>
              <radialGradient id="breathGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="hsl(150, 15%, 82%)" stopOpacity="0.9" />
                <stop offset="50%" stopColor="hsl(180, 15%, 70%)" stopOpacity="0.7" />
                <stop offset="100%" stopColor="hsl(220, 35%, 30%)" stopOpacity="0.5" />
              </radialGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Decorative outer rings */}
            <motion.circle
              cx="100" cy="100" r="90"
              fill="none"
              stroke="rgba(212,175,55,0.15)"
              strokeWidth="0.5"
              strokeDasharray="4 6"
              animate={isActive ? { opacity: [0.1, 0.3, 0.1] } : { opacity: 0.1 }}
              transition={{ duration: TOTAL_CYCLE / 1000, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.circle
              cx="100" cy="100" r="95"
              fill="none"
              stroke="rgba(212,175,55,0.08)"
              strokeWidth="0.3"
              animate={isActive ? { opacity: [0.05, 0.15, 0.05] } : { opacity: 0.05 }}
              transition={{ duration: TOTAL_CYCLE / 1000, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            />

            {/* Main breathing circle */}
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="url(#breathGradient)"
              filter="url(#glow)"
              opacity={isActive ? 0.9 : 0.5}
            />
            <circle
              cx="100"
              cy="100"
              r="60"
              fill="none"
              stroke="hsl(150, 15%, 85%)"
              strokeWidth="1"
              opacity="0.4"
            />
            <circle
              cx="100"
              cy="100"
              r="40"
              fill="none"
              stroke="hsl(150, 15%, 85%)"
              strokeWidth="0.5"
              opacity="0.3"
            />
          </svg>

          {isActive && (
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{
                boxShadow: [
                  "0 0 30px 10px hsl(150, 15%, 82%, 0.3)",
                  "0 0 60px 20px hsl(220, 35%, 30%, 0.2)",
                  "0 0 30px 10px hsl(150, 15%, 82%, 0.3)",
                ],
              }}
              transition={{ duration: TOTAL_CYCLE / 1000, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
        </motion.div>

        {/* Floating particle dots */}
        {isActive && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full bg-accent/20"
                style={{
                  left: `${50 + Math.cos(i * Math.PI / 3) * 22}%`,
                  top: `${40 + Math.sin(i * Math.PI / 3) * 22}%`,
                }}
                animate={{
                  y: [0, -12, 0],
                  x: [0, Math.cos(i) * 8, 0],
                  opacity: [0.15, 0.4, 0.15],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  duration: 6 + i * 0.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.7,
                }}
              />
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={isActive ? currentPhase.label : "idle"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <h2 className="font-display text-4xl md:text-5xl text-primary mb-2 tracking-tight">
              {isActive ? currentPhase.label : "Calm Breathing"}
            </h2>
            <p className="text-muted-foreground text-sm">
              {isActive
                ? "Follow the rhythm of the bubble"
                : "A synchronized breathing exercise for the group"
              }
            </p>

            {/* Phase progress bar */}
            {isActive && (
              <motion.div
                className="w-24 h-0.5 mx-auto mt-3 rounded-full bg-accent/20 overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <motion.div
                  className="h-full bg-accent/60 rounded-full"
                  style={{ width: `${phaseProgress * 100}%` }}
                />
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

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
