// ── LookoutPoint.tsx ─────────────────────────────────────────────────────────
// Step 4 of the ACT Values Compass — "The Lookout Point"
// A mindfulness / present-moment exercise where clients watch their barriers
// drift across a sky like clouds.

import { useState, useEffect } from "react";
import type { AgeMode } from "./compass-data";

// ── Types ───────────────────────────────────────────────────────────────────

interface Barrier {
  id: string;
  domainId: string;
  text: string;
  type: "thought" | "feeling" | "urge";
  defusionTechnique: string;
  defusedText: string;
}

interface LookoutPointProps {
  barriers: Barrier[];
  ageMode: AgeMode;
}

// ── Guided prompts ──────────────────────────────────────────────────────────

const GUIDED_PROMPTS: Record<AgeMode, string> = {
  child:
    "Watch your worries float by like clouds. You\u2019re the sky \u2014 big and calm and always there.",
  teen:
    "Notice each thought passing through, like clouds drifting across the sky. You don\u2019t have to chase them or push them away.",
  adult:
    "Observe each mental event as it arises and passes. You are the context in which these experiences occur \u2014 the sky, not the weather.",
};

// ── Helpers ─────────────────────────────────────────────────────────────────

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1) + "\u2026";
}

// Deterministic vertical positions based on index so clouds are spread out
const VERTICAL_OFFSETS = [15, 55, 30, 70, 8, 45, 65, 22, 50, 38];
const DURATIONS = [25, 32, 28, 35, 30, 27, 33, 26, 31, 29];
const DELAYS = [0, 4, 9, 2, 14, 7, 11, 5, 16, 3];

// ── Component ───────────────────────────────────────────────────────────────

export function LookoutPoint({ barriers, ageMode }: LookoutPointProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 6000);
    return () => clearTimeout(timer);
  }, []);

  // Pick up to 5 barriers to display as clouds
  const visibleBarriers = barriers.slice(0, 5);

  return (
    <>
      {/* Keyframe animations — CSS for smooth continuous drift */}
      <style>{`
        @keyframes lp-cloud-drift {
          0% {
            transform: translateX(0);
            opacity: 0;
          }
          5% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateX(calc(-100vw - 200px));
            opacity: 0;
          }
        }

        @keyframes lp-breathe {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        @keyframes lp-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        @keyframes lp-text-swap {
          0%, 90%  { opacity: 1; }
          100%     { opacity: 0; }
        }
      `}</style>

      <div
        style={{
          position: "relative",
          width: "100%",
          minHeight: 300,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(180deg, #0a1525 0%, #1a3545 60%, #2a3540 100%)",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        {/* ── Drifting clouds ──────────────────────────────────────────── */}
        {visibleBarriers.map((barrier, i) => {
          const top = VERTICAL_OFFSETS[i % VERTICAL_OFFSETS.length];
          const duration = DURATIONS[i % DURATIONS.length];
          const delay = DELAYS[i % DELAYS.length];

          return (
            <div
              key={barrier.id}
              style={{
                position: "absolute",
                top: `${top}%`,
                left: "100%",
                padding: "10px 22px",
                borderRadius: 28,
                background: "rgba(200, 210, 225, 0.12)",
                border: "1px solid rgba(200, 210, 225, 0.06)",
                color: "rgba(232, 220, 200, 0.5)",
                fontSize: 13,
                fontStyle: "italic",
                whiteSpace: "nowrap",
                pointerEvents: "none",
                animation: `lp-cloud-drift ${duration}s linear ${delay}s infinite`,
                willChange: "transform, opacity",
              }}
            >
              {truncate(barrier.text, 40)}
            </div>
          );
        })}

        {/* ── Guided prompt ────────────────────────────────────────────── */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: 400,
            padding: "0 24px",
            textAlign: "center",
            animation: "lp-fade-in 2s ease-out both",
          }}
        >
          <p
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontStyle: "italic",
              fontSize: 18,
              lineHeight: 1.65,
              color: "#e8dcc8",
              margin: 0,
            }}
          >
            {GUIDED_PROMPTS[ageMode]}
          </p>
        </div>

        {/* ── Breathing circle ─────────────────────────────────────────── */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: "rgba(45, 138, 138, 0.3)",
            marginTop: 28,
            animation: "lp-breathe 5s ease-in-out infinite",
          }}
        />

        {/* ── Timed message ────────────────────────────────────────────── */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            marginTop: 20,
            fontSize: 13,
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontStyle: "italic",
            color: "rgba(232, 220, 200, 0.55)",
            minHeight: 20,
            animation: "lp-fade-in 1.5s ease-out both",
          }}
        >
          {ready ? "Ready when you are" : "Take a moment\u2026"}
        </div>
      </div>
    </>
  );
}
