import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Wind } from "lucide-react";
import { cn } from "@/lib/utils";
import { playThemedBreathSound } from "@/lib/audio-feedback";
import { getTechnique, getTotalCycle, type BreathingTechnique } from "@/lib/breathing-techniques";
import { BreathingTechniqueSelector } from "./breathing-technique-selector";
import { OceanWaves } from "./breathing-themes/ocean-waves";
import { BalloonRise } from "./breathing-themes/balloon-rise";
import { StarryNight } from "./breathing-themes/starry-night";
import { CampfireGlow } from "./breathing-themes/campfire-glow";
import { NorthernLights } from "./breathing-themes/northern-lights";
import type { BreathingThemeProps } from "./breathing-themes/types";

interface BreathingGuideProps {
  isActive: boolean;
  isClinician: boolean;
  onToggle: () => void;
  startTime?: number | null;
  techniqueId: string;
  onTechniqueChange: (id: string) => void;
}

const THEMES: Record<string, React.ComponentType<BreathingThemeProps>> = {
  "ocean-waves": OceanWaves,
  "balloon-rise": BalloonRise,
  "starry-night": StarryNight,
  "campfire-glow": CampfireGlow,
  "northern-lights": NorthernLights,
};

export function BreathingGuide({ isActive, isClinician, onToggle, startTime, techniqueId, onTechniqueChange }: BreathingGuideProps) {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);

  const technique = getTechnique(techniqueId);
  const totalCycle = getTotalCycle(technique);
  const phases = technique.phases;

  useEffect(() => {
    if (!isActive) {
      setPhaseIndex(0);
      setElapsed(0);
      setCycleCount(0);
      return;
    }

    const initialElapsed = startTime ? Date.now() - startTime : 0;
    setElapsed(initialElapsed);
    setCycleCount(Math.floor(initialElapsed / totalCycle));

    const interval = setInterval(() => {
      setElapsed(prev => {
        const next = prev + 50;
        const cyclePos = next % totalCycle;
        const newCycle = Math.floor(next / totalCycle);
        if (newCycle > Math.floor(prev / totalCycle)) {
          setCycleCount(newCycle);
        }
        let acc = 0;
        for (let i = 0; i < phases.length; i++) {
          acc += phases[i].duration;
          if (cyclePos < acc) {
            setPhaseIndex(i);
            break;
          }
        }
        return next;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isActive, startTime, totalCycle, phases]);

  // Play themed sound on inhale/exhale transitions
  useEffect(() => {
    if (isActive) {
      const phase = phases[phaseIndex];
      if (phase && (phase.type === "inhale" || phase.type === "exhale")) {
        playThemedBreathSound(technique.audioTheme, phase.type);
      }
    }
  }, [isActive, phaseIndex, technique.audioTheme, phases]);

  const currentPhase = phases[phaseIndex];

  const phaseProgress = useMemo(() => {
    let acc = 0;
    for (let i = 0; i < phaseIndex; i++) acc += phases[i].duration;
    const inPhase = (elapsed % totalCycle) - acc;
    return Math.max(0, Math.min(1, inPhase / currentPhase.duration));
  }, [elapsed, phaseIndex, currentPhase.duration, totalCycle, phases]);

  const phaseColor = getPhaseColor(technique, currentPhase.type);

  const ThemeComponent = THEMES[technique.id] || OceanWaves;

  return (
    <div className="w-full h-full relative overflow-hidden select-none">
      {/* Layer 1: Full-screen theme background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={technique.id}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          <ThemeComponent
            technique={technique}
            isActive={isActive}
            phaseIndex={phaseIndex}
            phaseProgress={phaseProgress}
            elapsed={elapsed}
            totalCycle={totalCycle}
          />
        </motion.div>
      </AnimatePresence>

      {/* Layer 2: Phase HUD overlay */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
        {/* Cycle counter */}
        <AnimatePresence>
          {isActive && cycleCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 mb-4"
            >
              <Wind size={12} className="text-white/50" />
              <span className="text-xs font-medium text-white/60 tracking-widest uppercase">
                Breath {cycleCount + 1}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Phase indicator dots */}
        {isActive && (
          <motion.div
            className="flex items-center gap-3 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {phases.map((phase, i) => (
              <motion.div
                key={`${phase.label}-${i}`}
                className="flex items-center gap-1.5"
                animate={{ opacity: i === phaseIndex ? 1 : 0.3 }}
                transition={{ duration: 0.4 }}
              >
                <motion.div
                  className="rounded-full"
                  style={{ backgroundColor: getPhaseColor(technique, phase.type) }}
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
            key={isActive ? `${currentPhase.label}-${phaseIndex}` : `idle-${technique.id}`}
            initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="text-center"
          >
            {isActive ? (
              <>
                <motion.h2
                  className="font-display text-4xl md:text-5xl tracking-tight mb-1"
                  animate={{ color: phaseColor }}
                  transition={{ duration: 1 }}
                >
                  {currentPhase.label}
                </motion.h2>
                <p className="text-white/50 text-sm">
                  {technique.name} — {technique.subtitle}
                </p>
              </>
            ) : (
              <div className="space-y-1">
                <h2 className="font-display text-3xl md:text-4xl tracking-tight text-white/90">
                  {technique.emoji} {technique.name}
                </h2>
                <p className="text-white/50 text-sm">{technique.description}</p>
              </div>
            )}

            {/* Phase progress bar */}
            {isActive && (
              <motion.div
                className="w-32 h-1 mx-auto mt-4 rounded-full overflow-hidden"
                style={{ backgroundColor: `${phaseColor}30` }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    width: `${phaseProgress * 100}%`,
                    backgroundColor: phaseColor,
                    boxShadow: `0 0 8px ${phaseColor}60`,
                  }}
                />
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Layer 3: Controls overlay */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-end pb-8 md:pb-12 pointer-events-none">
        {/* Technique selector (idle + clinician) */}
        {!isActive && (
          <div className="pointer-events-auto mb-6 w-full">
            <BreathingTechniqueSelector
              selectedId={technique.id}
              onSelect={onTechniqueChange}
              isClinician={isClinician}
            />
          </div>
        )}

        {/* Start/Stop button */}
        {isClinician && (
          <motion.button
            onClick={onToggle}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "pointer-events-auto btn-luxury px-8 py-4 rounded-2xl font-medium text-sm flex items-center gap-3 transition-all cursor-pointer",
              isActive
                ? "bg-red-600/90 text-white hover:bg-red-600 shadow-[0_4px_24px_rgba(220,38,38,0.3)]"
                : "bg-white/15 backdrop-blur-md text-white hover:bg-white/25 shadow-[0_4px_24px_rgba(0,0,0,0.2)] ring-1 ring-white/20"
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
            className="text-sm text-white/50 italic pointer-events-none"
          >
            Waiting for your clinician to start the exercise...
          </motion.p>
        )}
      </div>
    </div>
  );
}

function getPhaseColor(technique: BreathingTechnique, phaseType: string): string {
  switch (phaseType) {
    case "inhale": return technique.colors.inhale;
    case "hold": return technique.colors.hold;
    case "exhale": return technique.colors.exhale;
    case "rest": return technique.colors.rest;
    default: return technique.colors.inhale;
  }
}
