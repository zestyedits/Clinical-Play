import { useState, useEffect } from "react";
import type { AgeMode, Seed } from "./garden-data";
import { GUIDED_PROMPTS, DARN_CATEGORIES } from "./garden-data";

interface GardenGrowingProps {
  seeds: Seed[];
  ageMode: AgeMode;
}

const VERTICAL_OFFSETS = [20, 50, 35, 65, 12, 42, 58, 28, 48, 38];
const GROW_DELAYS = [0.5, 1.2, 0.8, 1.8, 1.5, 2.0, 0.3, 1.0, 2.2, 1.4];

const FLOWER_EMOJIS = ["\uD83C\uDF3B", "\uD83C\uDF3A", "\uD83C\uDF37", "\uD83C\uDF38", "\uD83C\uDF3C", "\uD83C\uDF39"];

export function GardenGrowing({ seeds, ageMode }: GardenGrowingProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 6000);
    return () => clearTimeout(timer);
  }, []);

  const visibleSeeds = seeds.slice(0, 6);

  return (
    <>
      <style>{`
        @keyframes mg-flower-grow {
          0% {
            transform: scale(0) translateY(20px);
            opacity: 0;
          }
          50% {
            transform: scale(0.7) translateY(5px);
            opacity: 0.8;
          }
          100% {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }

        @keyframes mg-sway {
          0%, 100% {
            transform: rotate(-3deg);
          }
          50% {
            transform: rotate(3deg);
          }
        }

        @keyframes mg-breathe {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.15);
          }
        }

        @keyframes mg-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        @keyframes mg-sun-pulse {
          0%, 100% {
            box-shadow: 0 0 30px rgba(212, 162, 76, 0.3), 0 0 60px rgba(212, 162, 76, 0.1);
          }
          50% {
            box-shadow: 0 0 40px rgba(212, 162, 76, 0.5), 0 0 80px rgba(212, 162, 76, 0.2);
          }
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
            "linear-gradient(180deg, #1a3520 0%, #1e4028 40%, #243d2a 70%, #1a2d1e 100%)",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        {/* Sun */}
        <div
          style={{
            position: "absolute",
            top: 16,
            right: 24,
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "radial-gradient(circle, #d4a24c, #b8892e)",
            animation: "mg-sun-pulse 4s ease-in-out infinite",
          }}
        />

        {/* Ground */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "35%",
            background: "linear-gradient(180deg, #2a3d25 0%, #1e2d1a 100%)",
            borderTop: "2px solid rgba(90, 184, 143, 0.15)",
          }}
        />

        {/* Growing flowers from seeds */}
        {visibleSeeds.map((seed, i) => {
          const left = 12 + ((i * 15) % 76);
          const bottom = 10 + VERTICAL_OFFSETS[i % VERTICAL_OFFSETS.length] * 0.3;
          const delay = GROW_DELAYS[i % GROW_DELAYS.length];
          const color = DARN_CATEGORIES.find((c) => c.category === seed.category)?.color || "#5ab88f";
          const flower = FLOWER_EMOJIS[i % FLOWER_EMOJIS.length];

          return (
            <div
              key={seed.id}
              style={{
                position: "absolute",
                left: `${left}%`,
                bottom: `${bottom}%`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                animation: `mg-flower-grow 1.5s ease-out ${delay}s both`,
              }}
            >
              <div
                style={{
                  fontSize: 28,
                  animation: `mg-sway 3s ease-in-out ${delay + 1.5}s infinite`,
                  transformOrigin: "bottom center",
                }}
              >
                {flower}
              </div>
              <div
                style={{
                  width: 2,
                  height: 24,
                  background: `linear-gradient(to bottom, ${color}, #2d5a30)`,
                  borderRadius: 1,
                }}
              />
            </div>
          );
        })}

        {/* Guided prompt */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: 400,
            padding: "0 24px",
            textAlign: "center",
            animation: "mg-fade-in 2s ease-out both",
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

        {/* Breathing circle */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: "rgba(45, 122, 58, 0.3)",
            marginTop: 28,
            animation: "mg-breathe 5s ease-in-out infinite",
          }}
        />

        {/* Timed message */}
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
            animation: "mg-fade-in 1.5s ease-out both",
          }}
        >
          {ready ? "Ready when you are" : "Take a moment\u2026"}
        </div>
      </div>
    </>
  );
}
