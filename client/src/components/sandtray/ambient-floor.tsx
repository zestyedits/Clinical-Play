import { useMemo } from "react";
import type { LightSource } from "@/lib/ambient-types";

interface AmbientFloorProps {
  lightSource: LightSource;
}

function lerpColor(cool: string, warm: string, t: number): string {
  // Parse hex
  const c = cool.match(/\w\w/g)!.map(x => parseInt(x, 16));
  const w = warm.match(/\w\w/g)!.map(x => parseInt(x, 16));
  const r = Math.round(c[0] + (w[0] - c[0]) * t);
  const g = Math.round(c[1] + (w[1] - c[1]) * t);
  const b = Math.round(c[2] + (w[2] - c[2]) * t);
  return `rgb(${r}, ${g}, ${b})`;
}

const BLOB_CONFIGS = [
  { coolColor: "#1a1a4e", warmColor: "#c9a04e", size: 45, left: 15, top: 10, animation: "ambient-drift", duration: 60 },
  { coolColor: "#0d2f5e", warmColor: "#d4af37", size: 40, left: 60, top: 20, animation: "ambient-drift-2", duration: 52 },
  { coolColor: "#1a4a5e", warmColor: "#b8860b", size: 50, left: 35, top: 55, animation: "ambient-drift-3", duration: 68 },
  { coolColor: "#2d1b69", warmColor: "#daa520", size: 35, left: 75, top: 65, animation: "ambient-drift", duration: 75 },
  { coolColor: "#0f3460", warmColor: "#cd853f", size: 38, left: 10, top: 70, animation: "ambient-drift-2", duration: 58 },
  { coolColor: "#1b3a4b", warmColor: "#c4956a", size: 42, left: 50, top: 5, animation: "ambient-drift-3", duration: 64 },
];

// On mobile, use fewer blobs
const MOBILE_BLOB_COUNT = 3;

export function AmbientFloor({ lightSource }: AmbientFloorProps) {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const configs = isMobile ? BLOB_CONFIGS.slice(0, MOBILE_BLOB_COUNT) : BLOB_CONFIGS;

  const blobs = useMemo(() => {
    return configs.map((cfg, i) => {
      const color = lerpColor(cfg.coolColor, cfg.warmColor, lightSource.temperature);
      return (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: `${cfg.size}%`,
            height: `${cfg.size}%`,
            left: `${cfg.left}%`,
            top: `${cfg.top}%`,
            background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
            filter: "blur(80px)",
            opacity: 0.6,
            animation: `${cfg.animation} ${cfg.duration}s ease-in-out infinite`,
            willChange: "transform",
          }}
        />
      );
    });
  }, [lightSource.temperature, isMobile]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {blobs}
    </div>
  );
}
