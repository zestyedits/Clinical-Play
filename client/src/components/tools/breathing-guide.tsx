import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw } from "lucide-react";
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
      <div className="absolute inset-0" style={{
        background: isActive
          ? `radial-gradient(circle at 50% 50%, hsl(150 15% 92% / 0.8) 0%, hsl(220 35% 18% / 0.15) 70%, hsl(220 35% 18% / 0.3) 100%)`
          : `radial-gradient(circle at 50% 50%, hsl(150 15% 95%) 0%, hsl(220 35% 95%) 100%)`,
        transition: "all 2s ease",
      }} />

      <div className="relative z-10 flex flex-col items-center gap-8">
        <motion.div
          className="relative"
          animate={{
            scale: isActive ? currentPhase.scale : 1,
          }}
          transition={{
            duration: currentPhase.duration / 1000,
            ease: "easeInOut",
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

        <AnimatePresence mode="wait">
          <motion.div
            key={isActive ? currentPhase.label : "idle"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center"
          >
            <h2 className="font-serif text-3xl md:text-4xl text-primary mb-2">
              {isActive ? currentPhase.label : "Calm Breathing"}
            </h2>
            <p className="text-muted-foreground text-sm">
              {isActive
                ? "Follow the rhythm of the bubble"
                : "A synchronized breathing exercise for the group"
              }
            </p>
          </motion.div>
        </AnimatePresence>

        {isClinician && (
          <motion.button
            onClick={onToggle}
            className={cn(
              "px-8 py-4 rounded-2xl font-medium text-sm flex items-center gap-3 shadow-xl transition-all cursor-pointer",
              isActive
                ? "bg-destructive/90 text-white hover:bg-destructive"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
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
          <p className="text-sm text-muted-foreground/70 italic">
            Waiting for your clinician to start the exercise...
          </p>
        )}
      </div>
    </div>
  );
}
