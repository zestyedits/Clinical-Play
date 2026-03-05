import { useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { AgeMode } from "./CBTThoughtCourt";

// ── Props ───────────────────────────────────────────────────────────────────

interface BeliefSliderProps {
  value: number; // 0-100
  onChange: (v: number) => void;
  ageMode: AgeMode;
  isRerate?: boolean;
  originalBelief?: number; // shown as ghost marker when isRerate
}

// ── Age-adaptive labels ─────────────────────────────────────────────────────

const LABELS: Record<AgeMode, { left: string; right: string }> = {
  child: { left: "Don't believe it at all", right: "Believe it SO much" },
  teen: { left: "Not at all", right: "100% believe this" },
  adult: { left: "No belief (0%)", right: "Complete conviction (100%)" },
};

// ── Unique style id helper ──────────────────────────────────────────────────

const SLIDER_THUMB_CSS = (id: string) => `
  .belief-slider-${id}::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #d4a853;
    border: 3px solid #f0e8d8;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0,0,0,0.35);
    margin-top: -10px;
    position: relative;
    z-index: 2;
  }
  .belief-slider-${id}::-moz-range-thumb {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #d4a853;
    border: 3px solid #f0e8d8;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0,0,0,0.35);
  }
  .belief-slider-${id}::-webkit-slider-runnable-track {
    height: 8px;
    border-radius: 4px;
    background: transparent;
  }
  .belief-slider-${id}::-moz-range-track {
    height: 8px;
    border-radius: 4px;
    background: transparent;
  }
  .belief-slider-${id}:focus {
    outline: none;
  }
  .belief-slider-${id}:focus::-webkit-slider-thumb {
    box-shadow: 0 0 0 4px rgba(212,168,83,0.35), 0 2px 8px rgba(0,0,0,0.35);
  }
`;

// ── Component ───────────────────────────────────────────────────────────────

export function BeliefSlider({
  value,
  onChange,
  ageMode,
  isRerate = false,
  originalBelief,
}: BeliefSliderProps) {
  const reactId = useId().replace(/:/g, "");
  const labels = LABELS[ageMode];
  const change = isRerate && originalBelief != null ? value - originalBelief : 0;

  return (
    <div style={{ width: "100%", maxWidth: 520, margin: "0 auto" }}>
      {/* Inject custom thumb CSS */}
      <style>{SLIDER_THUMB_CSS(reactId)}</style>

      {/* ── Header ────────────────────────────────────────────────────── */}
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: "1.5rem",
          color: "#d4a853",
          textAlign: "center",
          marginBottom: 8,
        }}
      >
        {isRerate ? "Final Testimony" : "Sworn Testimony"}
      </motion.h2>

      {/* ── Animated number display ───────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "baseline",
          marginBottom: 20,
        }}
      >
        <motion.span
          key={value}
          initial={{ opacity: 0, y: 12, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "3.2rem",
            fontWeight: 700,
            color: "#f0e8d8",
            lineHeight: 1,
          }}
        >
          {value}
        </motion.span>
        <span
          style={{
            fontSize: "1.6rem",
            fontWeight: 600,
            color: "#d4a853",
            marginLeft: 2,
          }}
        >
          %
        </span>
      </div>

      {/* ── Slider track container ────────────────────────────────────── */}
      <div style={{ position: "relative", width: "100%", padding: "0 2px" }}>
        {/* Background gradient track */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            right: 0,
            height: 8,
            borderRadius: 4,
            transform: "translateY(-50%)",
            background:
              "linear-gradient(to right, #4ade80 0%, #facc15 50%, #ef4444 100%)",
            opacity: 0.35,
          }}
        />

        {/* Filled portion (0 to current value) */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            width: `${value}%`,
            height: 8,
            borderRadius: 4,
            transform: "translateY(-50%)",
            background:
              "linear-gradient(to right, #4ade80 0%, #facc15 50%, #ef4444 100%)",
            backgroundSize: `${(100 / Math.max(value, 1)) * 100}% 100%`,
            transition: "width 0.15s ease",
          }}
        />

        {/* Original belief ghost marker (rerate mode) */}
        {isRerate && originalBelief != null && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: `${originalBelief}%`,
              transform: "translate(-50%, -50%)",
              width: 4,
              height: 22,
              borderRadius: 2,
              background: "rgba(240, 232, 216, 0.55)",
              boxShadow: "0 0 6px rgba(240,232,216,0.3)",
              zIndex: 1,
              pointerEvents: "none",
              transition: "left 0.2s ease",
            }}
          />
        )}

        {/* Range input */}
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={`belief-slider-${reactId}`}
          style={{
            position: "relative",
            width: "100%",
            height: 28,
            background: "transparent",
            appearance: "none",
            WebkitAppearance: "none",
            cursor: "pointer",
            zIndex: 3,
          }}
        />
      </div>

      {/* ── Labels under slider ───────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 6,
        }}
      >
        <span
          style={{
            fontSize: "0.8rem",
            color: "rgba(240,232,216,0.7)",
            maxWidth: "40%",
          }}
        >
          {labels.left}
        </span>
        <span
          style={{
            fontSize: "0.8rem",
            color: "rgba(240,232,216,0.7)",
            maxWidth: "40%",
            textAlign: "right",
          }}
        >
          {labels.right}
        </span>
      </div>

      {/* ── Re-rate comparison info ───────────────────────────────────── */}
      <AnimatePresence>
        {isRerate && originalBelief != null && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35 }}
            style={{
              marginTop: 20,
              padding: "14px 18px",
              background: "rgba(212,168,83,0.1)",
              border: "1px solid rgba(212,168,83,0.25)",
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            {/* Before / After visual comparison */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 24,
                marginBottom: 10,
              }}
            >
              {/* Before */}
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: "rgba(240,232,216,0.6)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: 2,
                  }}
                >
                  Before
                </div>
                <div
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: "1.6rem",
                    fontWeight: 700,
                    color: "rgba(240,232,216,0.5)",
                  }}
                >
                  {originalBelief}%
                </div>
              </div>

              {/* Arrow */}
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                style={{
                  fontSize: "1.3rem",
                  color: "#d4a853",
                }}
              >
                →
              </motion.span>

              {/* After */}
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: "rgba(240,232,216,0.6)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: 2,
                  }}
                >
                  After
                </div>
                <motion.div
                  key={value}
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: "1.6rem",
                    fontWeight: 700,
                    color: "#f0e8d8",
                  }}
                >
                  {value}%
                </motion.div>
              </div>
            </div>

            {/* Text summary */}
            <div
              style={{
                textAlign: "center",
                fontSize: "0.85rem",
                color: "rgba(240,232,216,0.75)",
                lineHeight: 1.5,
              }}
            >
              <div>Your original rating was {originalBelief}%</div>
              <div
                style={{
                  color: change < 0 ? "#4ade80" : change > 0 ? "#ef4444" : "#d4a853",
                  fontWeight: 600,
                  marginTop: 2,
                }}
              >
                Change: {change > 0 ? "+" : ""}
                {change} points
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
