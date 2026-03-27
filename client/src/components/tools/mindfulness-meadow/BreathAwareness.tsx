import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { AgeMode } from "./meadow-data";

interface BreathAwarenessProps {
  breathCycles: number;
  onCyclesChange: (count: number) => void;
  ageMode: AgeMode;
}

type BreathPhase = "idle" | "inhale" | "hold" | "exhale" | "rest";

const PHASE_DURATIONS: Record<Exclude<BreathPhase, "idle">, number> = {
  inhale: 4000,
  hold: 7000,
  exhale: 8000,
  rest: 1000,
};

const PHASE_LABELS: Record<AgeMode, Record<BreathPhase, string>> = {
  child: {
    idle: "Ready to breathe?",
    inhale: "Breathe in\u2026 fill your belly",
    hold: "Hold it gently\u2026",
    exhale: "Breathe out slowly\u2026",
    rest: "Great! Rest for a moment",
  },
  teen: {
    idle: "Start when ready",
    inhale: "Inhale through your nose\u2026",
    hold: "Hold the breath\u2026",
    exhale: "Exhale fully through your mouth\u2026",
    rest: "Rest\u2026",
  },
  adult: {
    idle: "Begin when you are ready",
    inhale: "Inhale diaphragmatically\u2026",
    hold: "Retain the breath\u2026",
    exhale: "Long, complete exhale\u2026",
    rest: "Brief pause\u2026",
  },
};

const PHASE_COUNTS: Record<Exclude<BreathPhase, "idle">, string> = {
  inhale: "1 \u2013 2 \u2013 3 \u2013 4",
  hold: "1 \u2013 2 \u2013 3 \u2013 4 \u2013 5 \u2013 6 \u2013 7",
  exhale: "1 \u2013 2 \u2013 3 \u2013 4 \u2013 5 \u2013 6 \u2013 7 \u2013 8",
  rest: "",
};

const SCALE_FOR_PHASE: Record<BreathPhase, number> = {
  idle: 1,
  inhale: 1.55,
  hold: 1.55,
  exhale: 1,
  rest: 1,
};

const PHASE_SEQUENCE: Exclude<BreathPhase, "idle">[] = ["inhale", "hold", "exhale", "rest"];

export function BreathAwareness({ breathCycles, onCyclesChange, ageMode }: BreathAwarenessProps) {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<BreathPhase>("idle");
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cyclesRef = useRef(breathCycles);

  useEffect(() => {
    cyclesRef.current = breathCycles;
  }, [breathCycles]);

  const clearTimers = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    timerRef.current = null;
    countdownRef.current = null;
  }, []);

  const advancePhase = useCallback(
    (currentIndex: number) => {
      const nextIndex = (currentIndex + 1) % PHASE_SEQUENCE.length;
      const nextPhase = PHASE_SEQUENCE[nextIndex];
      const duration = PHASE_DURATIONS[nextPhase];

      if (nextIndex === 0) {
        const newCount = cyclesRef.current + 1;
        cyclesRef.current = newCount;
        onCyclesChange(newCount);
      }

      setPhase(nextPhase);
      setPhaseIndex(nextIndex);
      setSecondsLeft(Math.ceil(duration / 1000));

      countdownRef.current = setInterval(() => {
        setSecondsLeft((s) => Math.max(0, s - 1));
      }, 1000);

      timerRef.current = setTimeout(() => {
        clearInterval(countdownRef.current!);
        advancePhase(nextIndex);
      }, duration);
    },
    [onCyclesChange, clearTimers],
  );

  const startBreathing = useCallback(() => {
    clearTimers();
    setIsActive(true);
    const firstPhase: Exclude<BreathPhase, "idle"> = "inhale";
    const duration = PHASE_DURATIONS[firstPhase];
    setPhase(firstPhase);
    setPhaseIndex(0);
    setSecondsLeft(Math.ceil(duration / 1000));

    countdownRef.current = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);

    timerRef.current = setTimeout(() => {
      clearInterval(countdownRef.current!);
      advancePhase(0);
    }, duration);
  }, [clearTimers, advancePhase]);

  const pauseBreathing = useCallback(() => {
    clearTimers();
    setIsActive(false);
    setPhase("idle");
  }, [clearTimers]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const labels = PHASE_LABELS[ageMode];
  const scale = SCALE_FOR_PHASE[phase];
  const isUnlocked = breathCycles >= 3;

  const circleColor =
    phase === "inhale"
      ? "#66bb6a"
      : phase === "hold"
      ? "#26a69a"
      : phase === "exhale"
      ? "#42a5f5"
      : phase === "rest"
      ? "#ab47bc"
      : "#4caf8a";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, paddingTop: 8 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "rgba(255,255,255,0.6)",
          borderRadius: 12,
          padding: "8px 16px",
          border: "1px solid rgba(76,175,138,0.2)",
        }}
      >
        <span style={{ fontSize: 13, color: "rgba(26,58,46,0.7)", fontWeight: 500 }}>
          {ageMode === "child" ? "Belly breaths:" : "Cycles completed:"}
        </span>
        <div style={{ display: "flex", gap: 4 }}>
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ scale: i < breathCycles ? 1 : 0.6, opacity: i < breathCycles ? 1 : 0.3 }}
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: i < breathCycles ? "#66bb6a" : "rgba(26,58,46,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
              }}
            >
              {i < breathCycles ? "\u{1F33F}" : ""}
            </motion.div>
          ))}
        </div>
        {breathCycles > 3 && (
          <span style={{ fontSize: 12, color: "#66bb6a", fontWeight: 600 }}>+{breathCycles - 3}</span>
        )}
      </div>

      <div style={{ position: "relative", width: 200, height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <motion.div
          animate={{ scale, opacity: isActive ? 1 : 0.7 }}
          transition={{
            scale: {
              duration:
                phase === "inhale"
                  ? PHASE_DURATIONS.inhale / 1000
                  : phase === "exhale"
                  ? PHASE_DURATIONS.exhale / 1000
                  : 0.3,
              ease: phase === "inhale" ? "easeIn" : phase === "exhale" ? "easeOut" : "easeInOut",
            },
          }}
          style={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: `radial-gradient(circle at 40% 35%, ${circleColor}99, ${circleColor}dd)`,
            boxShadow: `0 0 40px ${circleColor}50, 0 0 80px ${circleColor}20`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "default",
          }}
        >
          <span style={{ fontSize: 36 }}>
            {phase === "inhale" || phase === "hold"
              ? "\u{1F32C}\uFE0F"
              : phase === "exhale"
              ? "\u{1F343}"
              : phase === "rest"
              ? "\u2728"
              : "\u{1F33F}"}
          </span>
        </motion.div>

        {isActive && phase !== "idle" && (
          <motion.div
            key={phase}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              position: "absolute",
              bottom: -10,
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(255,255,255,0.85)",
              borderRadius: 8,
              padding: "3px 10px",
              fontSize: 11,
              fontWeight: 600,
              color: circleColor,
              whiteSpace: "nowrap",
              border: `1px solid ${circleColor}30`,
            }}
          >
            {secondsLeft}s
          </motion.div>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={phase}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3 }}
          style={{ textAlign: "center" }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "clamp(14px, 3vw, 16px)",
              fontWeight: 600,
              color: "#1a3a2e",
              fontFamily: "'Lora', Georgia, serif",
            }}
          >
            {labels[phase]}
          </p>
          {phase !== "idle" && phase !== "rest" && PHASE_COUNTS[phase] && (
            <p style={{ margin: "4px 0 0", fontSize: 11, color: "rgba(26,58,46,0.5)", letterSpacing: "0.05em" }}>
              {PHASE_COUNTS[phase]}
            </p>
          )}
        </motion.div>
      </AnimatePresence>

      <div style={{ display: "flex", gap: 10 }}>
        {!isActive ? (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={startBreathing}
            style={{
              background: "linear-gradient(135deg, #66bb6a, #4caf8a)",
              border: "none",
              borderRadius: 12,
              padding: "11px 28px",
              fontSize: 14,
              fontWeight: 700,
              color: "#fff",
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
              boxShadow: "0 4px 18px rgba(102,187,106,0.35)",
            }}
          >
            {breathCycles === 0 ? "\u{1F32C}\uFE0F Start Breathing" : "\u{1F32C}\uFE0F Continue"}
          </motion.button>
        ) : (
          <button
            onClick={pauseBreathing}
            style={{
              background: "rgba(255,255,255,0.7)",
              border: "1px solid rgba(26,58,46,0.15)",
              borderRadius: 12,
              padding: "11px 24px",
              fontSize: 13,
              fontWeight: 600,
              color: "rgba(26,58,46,0.65)",
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
            }}
          >
            Pause
          </button>
        )}
      </div>

      {isUnlocked ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            background: "rgba(102,187,106,0.12)",
            border: "1px solid rgba(102,187,106,0.3)",
            borderRadius: 12,
            padding: "10px 18px",
            fontSize: 13,
            color: "#2e7d32",
            fontWeight: 600,
            textAlign: "center",
          }}
        >
          {"\u2705"} {ageMode === "child" ? "Amazing! You did 3 belly breaths!" : ageMode === "teen" ? "3 cycles done \u2014 you're calm and ready!" : "3 complete cycles \u2014 you may continue."}
        </motion.div>
      ) : (
        <p style={{ margin: 0, fontSize: 12, color: "rgba(26,58,46,0.5)", textAlign: "center" }}>
          {ageMode === "child"
            ? `Complete ${3 - breathCycles} more breath${3 - breathCycles !== 1 ? "s" : ""} to continue`
            : `Complete ${3 - breathCycles} more cycle${3 - breathCycles !== 1 ? "s" : ""} to unlock the next step`}
        </p>
      )}

      <div
        style={{
          background: "rgba(255,255,255,0.5)",
          borderRadius: 12,
          padding: "12px 16px",
          maxWidth: 380,
          width: "100%",
          border: "1px solid rgba(76,175,138,0.2)",
        }}
      >
        <p style={{ margin: 0, fontSize: 12, color: "rgba(26,58,46,0.65)", lineHeight: 1.6, textAlign: "center" }}>
          {ageMode === "child"
            ? "Breathe in through your nose, hold gently, then breathe out slowly through your mouth. Your belly should rise and fall like a sleeping cat."
            : ageMode === "teen"
            ? "4-7-8: inhale 4 counts, hold 7, exhale 8. This activates your body's relaxation response and helps manage stress."
            : "Diaphragmatic 4-7-8 breathing stimulates the vagus nerve, activating the parasympathetic nervous system for measurable anxiety reduction."}
        </p>
      </div>
    </div>
  );
}
