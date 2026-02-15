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
const TINE_SPACING = 0.015;

// Seeded noise for stable grain texture
function hashNoise(x: number, y: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

export function SandCanvas({ width, height, rakePaths, isRakeMode, onRakePathAdd, lightSource }: SandCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heightmapRef = useRef<Float32Array | null>(null);
  const noiseRef = useRef<Float32Array | null>(null);
  const dirtyRef = useRef(true);
  const rafRef = useRef<number>(0);
  const drawingRef = useRef(false);
  const currentPathRef = useRef<{ x: number; y: number }[]>([]);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const hmW = isMobile ? MOBILE_HEIGHTMAP_W : HEIGHTMAP_W;
  const hmH = isMobile ? MOBILE_HEIGHTMAP_H : HEIGHTMAP_H;

  // Generate stable noise texture once per resolution
  useEffect(() => {
    heightmapRef.current = new Float32Array(hmW * hmH);
    const noise = new Float32Array(hmW * hmH);
    for (let y = 0; y < hmH; y++) {
      for (let x = 0; x < hmW; x++) {
        noise[y * hmW + x] = hashNoise(x, y);
      }
    }
    noiseRef.current = noise;
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
      if (dirtyRef.current && heightmapRef.current && noiseRef.current) {
        dirtyRef.current = false;
        renderHeightmap(ctx, heightmapRef.current, noiseRef.current, hmW, hmH, canvas.width, canvas.height, lightSource);
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
  _width: number,
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
  const grooveRadius = Math.max(1.5, hmW * 0.009);
  const ridgeRadius = grooveRadius * 2.5;

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
          // Smooth groove: deeper center, soft falloff
          const falloff = 1 - (dist / grooveRadius) ** 2;
          hm[idx] = Math.max(-1.2, hm[idx] - falloff * 0.8);
        } else if (dist < ridgeRadius) {
          // Ridge: pushed-up sand beside the groove
          const ridgeT = (dist - grooveRadius) / (ridgeRadius - grooveRadius);
          const ridgeProfile = Math.sin(ridgeT * Math.PI) * 0.5;
          hm[idx] = Math.min(1, hm[idx] + ridgeProfile * 0.35);
        }
      }
    }
  }
}

function renderHeightmap(
  ctx: CanvasRenderingContext2D,
  hm: Float32Array,
  noise: Float32Array,
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
  // Light direction vector (normalized)
  const lz = 0.5; // light height above surface

  for (let y = 0; y < hmH; y++) {
    for (let x = 0; x < hmW; x++) {
      const idx = y * hmW + x;
      const h = hm[idx];
      const pi = idx * 4;

      if (Math.abs(h) < 0.003) {
        data[pi + 3] = 0;
        continue;
      }

      // Surface normal from heightmap gradients
      const hLeft = x > 0 ? hm[idx - 1] : h;
      const hRight = x < hmW - 1 ? hm[idx + 1] : h;
      const hUp = y > 0 ? hm[idx - hmW] : h;
      const hDown = y < hmH - 1 ? hm[idx + hmW] : h;

      const nx = (hLeft - hRight) * 2;
      const ny = (hUp - hDown) * 2;
      const nz = 1.0;
      const nLen = Math.sqrt(nx * nx + ny * ny + nz * nz);

      // Light vector
      const lx = (x / hmW) - lightX;
      const ly = (y / hmH) - lightY;
      const lLen = Math.sqrt(lx * lx + ly * ly + lz * lz);

      // Diffuse lighting (dot product of normal and light direction)
      const dot = (nx / nLen) * (lx / lLen) + (ny / nLen) * (ly / lLen) + (nz / nLen) * (lz / lLen);

      const absH = Math.abs(h);
      const depth = Math.min(1, absH);
      const n = noise[idx] * 0.15; // subtle grain variation

      if (h < 0) {
        // Groove (depression in sand)
        if (dot < 0) {
          // Lit side of groove — warm highlight
          const lit = Math.abs(dot) * depth;
          data[pi] = 220;      // warm sand highlight
          data[pi + 1] = 200;
          data[pi + 2] = 160;
          data[pi + 3] = Math.floor(Math.min(160, (lit * 0.5 + depth * 0.15 + n) * 255));
        } else {
          // Shadow side of groove — dark brown
          const shade = dot * depth;
          data[pi] = 50;
          data[pi + 1] = 38;
          data[pi + 2] = 20;
          data[pi + 3] = Math.floor(Math.min(200, (shade * 0.6 + depth * 0.3 + n) * 255));
        }
      } else {
        // Ridge (pushed-up sand)
        if (dot < 0) {
          // Lit side of ridge — bright sand
          const lit = Math.abs(dot) * depth;
          data[pi] = 255;
          data[pi + 1] = 248;
          data[pi + 2] = 225;
          data[pi + 3] = Math.floor(Math.min(150, (lit * 0.4 + depth * 0.12 + n) * 255));
        } else {
          // Shadow side of ridge
          const shade = dot * depth;
          data[pi] = 80;
          data[pi + 1] = 60;
          data[pi + 2] = 30;
          data[pi + 3] = Math.floor(Math.min(140, (shade * 0.4 + depth * 0.1 + n) * 255));
        }
      }
    }
  }

  // Upscale to canvas with bilinear filtering
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = hmW;
  tempCanvas.height = hmH;
  const tempCtx = tempCanvas.getContext("2d")!;
  tempCtx.putImageData(imgData, 0, 0);

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(tempCanvas, 0, 0, canvasW, canvasH);
}
