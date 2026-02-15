import { useRef, useEffect, useCallback } from "react";
import type { LightSource, RakePath } from "@/lib/ambient-types";

interface SandCanvasProps {
  width: number;
  height: number;
  rakePaths: RakePath[];
  isRakeMode: boolean;
  onRakePathAdd?: (path: RakePath) => void;
  lightSource: LightSource;
}

const HEIGHTMAP_W = 400;
const HEIGHTMAP_H = 300;
const MOBILE_HEIGHTMAP_W = 200;
const MOBILE_HEIGHTMAP_H = 150;
const RAKE_TINES = 5;
const TINE_SPACING = 0.012;

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

  useEffect(() => {
    heightmapRef.current = new Float32Array(hmW * hmH);
    dirtyRef.current = true;
  }, [hmW, hmH]);

  useEffect(() => {
    if (!heightmapRef.current) return;
    heightmapRef.current.fill(0);
    for (const path of rakePaths) {
      applyRakePathToHeightmap(heightmapRef.current, path.points, path.width, hmW, hmH);
    }
    dirtyRef.current = true;
  }, [rakePaths, hmW, hmH]);

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

    if (last) {
      const dist = Math.sqrt((pos.x - last.x) ** 2 + (pos.y - last.y) ** 2);
      if (dist < 0.003) return;
    }

    currentPathRef.current.push(pos);
    lastPointRef.current = pos;

    if (currentPathRef.current.length >= 2) {
      const pts = currentPathRef.current.slice(-2);
      applyRakePathToHeightmap(heightmapRef.current, pts, 12, hmW, hmH);
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

function applyRakePathToHeightmap(
  hm: Float32Array,
  points: { x: number; y: number }[],
  width: number,
  hmW: number,
  hmH: number
) {
  for (let i = 1; i < points.length; i++) {
    const p0 = points[i - 1];
    const p1 = points[i];

    const dx = p1.x - p0.x;
    const dy = p1.y - p0.y;
    const segLen = Math.sqrt(dx * dx + dy * dy);
    if (segLen < 0.0001) continue;

    const perpX = -dy / segLen;
    const perpY = dx / segLen;

    for (let tine = 0; tine < RAKE_TINES; tine++) {
      const offset = (tine - (RAKE_TINES - 1) / 2) * TINE_SPACING;
      const ox = perpX * offset;
      const oy = perpY * offset;

      const tp0 = { x: p0.x + ox, y: p0.y + oy };
      const tp1 = { x: p1.x + ox, y: p1.y + oy };

      applySingleGroove(hm, tp0, tp1, hmW, hmH);
    }
  }
}

function applySingleGroove(
  hm: Float32Array,
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  hmW: number,
  hmH: number
) {
  const grooveRadius = Math.max(1, hmW * 0.007);
  const ridgeRadius = grooveRadius * 2.2;

  const steps = Math.max(1, Math.ceil(Math.sqrt(
    ((p1.x - p0.x) * hmW) ** 2 + ((p1.y - p0.y) * hmH) ** 2
  )));

  for (let s = 0; s <= steps; s++) {
    const t = s / steps;
    const cx = (p0.x + (p1.x - p0.x) * t) * hmW;
    const cy = (p0.y + (p1.y - p0.y) * t) * hmH;

    const minX = Math.max(0, Math.floor(cx - ridgeRadius));
    const maxX = Math.min(hmW - 1, Math.ceil(cx + ridgeRadius));
    const minY = Math.max(0, Math.floor(cy - ridgeRadius));
    const maxY = Math.min(hmH - 1, Math.ceil(cy + ridgeRadius));

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
        const idx = y * hmW + x;

        if (dist < grooveRadius) {
          const falloff = 1 - dist / grooveRadius;
          hm[idx] = Math.max(-1, hm[idx] - falloff * 0.7);
        } else if (dist < ridgeRadius) {
          const ridgeFalloff = 1 - (dist - grooveRadius) / (ridgeRadius - grooveRadius);
          hm[idx] = Math.min(1, hm[idx] + ridgeFalloff * 0.3);
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

  const imgData = ctx.createImageData(hmW, hmH);
  const data = imgData.data;
  const lightX = lightSource.x;
  const lightY = lightSource.y;

  for (let y = 0; y < hmH; y++) {
    for (let x = 0; x < hmW; x++) {
      const idx = y * hmW + x;
      const h = hm[idx];
      const pi = idx * 4;

      if (Math.abs(h) < 0.005) {
        data[pi] = 0;
        data[pi + 1] = 0;
        data[pi + 2] = 0;
        data[pi + 3] = 0;
        continue;
      }

      const hLeft = x > 0 ? hm[idx - 1] : h;
      const hRight = x < hmW - 1 ? hm[idx + 1] : h;
      const hUp = y > 0 ? hm[idx - hmW] : h;
      const hDown = y < hmH - 1 ? hm[idx + hmW] : h;

      const dx = hRight - hLeft;
      const dy = hDown - hUp;

      const lx = (x / hmW) - lightX;
      const ly = (y / hmH) - lightY;
      const lLen = Math.sqrt(lx * lx + ly * ly) || 1;
      const dot = -(dx * (lx / lLen) + dy * (ly / lLen));

      const absH = Math.abs(h);

      if (h < 0) {
        const depth = Math.min(1, absH);
        const shade = dot * 0.6;
        if (shade > 0) {
          data[pi] = 100;
          data[pi + 1] = 80;
          data[pi + 2] = 50;
          data[pi + 3] = Math.floor(Math.min(200, (shade * depth * 0.6 + depth * 0.25) * 255));
        } else {
          data[pi] = 40;
          data[pi + 1] = 30;
          data[pi + 2] = 15;
          data[pi + 3] = Math.floor(Math.min(220, (Math.abs(shade) * depth * 0.7 + depth * 0.35) * 255));
        }
      } else {
        const ridge = Math.min(1, absH);
        const shade = dot * 0.6;
        if (shade > 0) {
          data[pi] = 255;
          data[pi + 1] = 245;
          data[pi + 2] = 220;
          data[pi + 3] = Math.floor(Math.min(180, (shade * ridge * 0.5 + ridge * 0.2) * 255));
        } else {
          data[pi] = 60;
          data[pi + 1] = 45;
          data[pi + 2] = 20;
          data[pi + 3] = Math.floor(Math.min(160, (Math.abs(shade) * ridge * 0.4 + ridge * 0.15) * 255));
        }
      }
    }
  }

  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = hmW;
  tempCanvas.height = hmH;
  const tempCtx = tempCanvas.getContext("2d")!;
  tempCtx.putImageData(imgData, 0, 0);

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(tempCanvas, 0, 0, canvasW, canvasH);
}
