import { useRef, useEffect, useCallback, useState } from "react";
import type { LightSource, RakePath } from "@/lib/ambient-types";

interface SandCanvasProps {
  width: number;
  height: number;
  rakePaths: RakePath[];
  isRakeMode: boolean;
  onRakePathAdd?: (path: RakePath) => void;
  lightSource: LightSource;
}

const HEIGHTMAP_W = 200;
const HEIGHTMAP_H = 150;
const MOBILE_HEIGHTMAP_W = 100;
const MOBILE_HEIGHTMAP_H = 75;

export function SandCanvas({ width, height, rakePaths, isRakeMode, onRakePathAdd, lightSource }: SandCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heightmapRef = useRef<Float32Array | null>(null);
  const dirtyRef = useRef(true);
  const rafRef = useRef<number>(0);
  const drawingRef = useRef(false);
  const currentPathRef = useRef<{ x: number; y: number }[]>([]);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const hmW = isMobile ? MOBILE_HEIGHTMAP_W : HEIGHTMAP_W;
  const hmH = isMobile ? MOBILE_HEIGHTMAP_H : HEIGHTMAP_H;

  // Initialize heightmap
  useEffect(() => {
    heightmapRef.current = new Float32Array(hmW * hmH);
    dirtyRef.current = true;
  }, [hmW, hmH]);

  // Apply existing rake paths to heightmap
  useEffect(() => {
    if (!heightmapRef.current) return;
    heightmapRef.current.fill(0);
    for (const path of rakePaths) {
      applyPathToHeightmap(heightmapRef.current, path.points, path.width, hmW, hmH);
    }
    dirtyRef.current = true;
  }, [rakePaths, hmW, hmH]);

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      if (dirtyRef.current && heightmapRef.current) {
        dirtyRef.current = false;
        renderHeightmap(ctx, heightmapRef.current, hmW, hmH, canvas.width, canvas.height, lightSource);
      }
      rafRef.current = requestAnimationFrame(render);
    };
    rafRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
  }, [hmW, hmH, lightSource]);

  const getCanvasPos = useCallback((e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    };
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!isRakeMode) return;
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    drawingRef.current = true;
    const pos = getCanvasPos(e);
    currentPathRef.current = [pos];
    lastPointRef.current = pos;
  }, [isRakeMode, getCanvasPos]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!drawingRef.current || !heightmapRef.current) return;
    const pos = getCanvasPos(e);
    const last = lastPointRef.current;

    // Throttle point sampling to ~60fps distance
    if (last) {
      const dist = Math.sqrt((pos.x - last.x) ** 2 + (pos.y - last.y) ** 2);
      if (dist < 0.005) return;
    }

    currentPathRef.current.push(pos);
    lastPointRef.current = pos;

    // Apply incrementally
    if (currentPathRef.current.length >= 2) {
      const pts = currentPathRef.current.slice(-2);
      applyPathToHeightmap(heightmapRef.current, pts, 12, hmW, hmH);
      dirtyRef.current = true;
    }
  }, [getCanvasPos, hmW, hmH]);

  const handlePointerUp = useCallback(() => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    if (currentPathRef.current.length >= 2 && onRakePathAdd) {
      onRakePathAdd({
        id: `rake-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        points: [...currentPathRef.current],
        width: 12,
        createdBy: "",
        timestamp: Date.now(),
      });
    }
    currentPathRef.current = [];
    lastPointRef.current = null;
  }, [onRakePathAdd]);

  return (
    <canvas
      ref={canvasRef}
      width={width || 800}
      height={height || 600}
      className="absolute inset-0 w-full h-full"
      style={{
        zIndex: 1,
        pointerEvents: isRakeMode ? "auto" : "none",
        cursor: isRakeMode ? "crosshair" : "default",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    />
  );
}

function applyPathToHeightmap(
  hm: Float32Array,
  points: { x: number; y: number }[],
  width: number,
  hmW: number,
  hmH: number
) {
  const radius = Math.max(1, (width / 200) * hmW * 0.5);
  for (let i = 1; i < points.length; i++) {
    const p0 = points[i - 1];
    const p1 = points[i];
    const steps = Math.max(1, Math.ceil(Math.sqrt(
      ((p1.x - p0.x) * hmW) ** 2 + ((p1.y - p0.y) * hmH) ** 2
    )));
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const cx = (p0.x + (p1.x - p0.x) * t) * hmW;
      const cy = (p0.y + (p1.y - p0.y) * t) * hmH;

      const minX = Math.max(0, Math.floor(cx - radius));
      const maxX = Math.min(hmW - 1, Math.ceil(cx + radius));
      const minY = Math.max(0, Math.floor(cy - radius));
      const maxY = Math.min(hmH - 1, Math.ceil(cy + radius));

      for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
          const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
          if (dist < radius) {
            const falloff = 1 - dist / radius;
            const idx = y * hmW + x;
            hm[idx] = Math.min(1, hm[idx] + falloff * 0.4);
          }
        }
      }
    }
  }
}

function renderHeightmap(
  ctx: CanvasRenderingContext2D,
  hm: Float32Array,
  hmW: number,
  hmH: number,
  canvasW: number,
  canvasH: number,
  lightSource: LightSource
) {
  ctx.clearRect(0, 0, canvasW, canvasH);

  const scaleX = canvasW / hmW;
  const scaleY = canvasH / hmH;
  const lightX = lightSource.x;
  const lightY = lightSource.y;

  for (let y = 0; y < hmH; y++) {
    for (let x = 0; x < hmW; x++) {
      const idx = y * hmW + x;
      const h = hm[idx];
      if (h < 0.01) continue;

      // Compute gradient for shading direction
      const hLeft = x > 0 ? hm[idx - 1] : h;
      const hRight = x < hmW - 1 ? hm[idx + 1] : h;
      const hUp = y > 0 ? hm[idx - hmW] : h;
      const hDown = y < hmH - 1 ? hm[idx + hmW] : h;

      const dx = hRight - hLeft;
      const dy = hDown - hUp;

      // Light direction
      const lx = (x / hmW) - lightX;
      const ly = (y / hmH) - lightY;
      const dot = -(dx * lx + dy * ly);

      // Depression = darker, ridge = lighter
      const shade = dot * 0.5;
      if (shade > 0) {
        ctx.fillStyle = `rgba(255, 255, 240, ${Math.min(0.3, shade * h)})`;
      } else {
        ctx.fillStyle = `rgba(80, 60, 30, ${Math.min(0.35, Math.abs(shade) * h + h * 0.1)})`;
      }

      ctx.fillRect(x * scaleX, y * scaleY, Math.ceil(scaleX), Math.ceil(scaleY));
    }
  }
}
