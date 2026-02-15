import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";
import type { LightSource, RakePath } from "@/lib/ambient-types";
import { getAssetMass, DEFAULT_LIGHT_SOURCE } from "@/lib/ambient-types";
import { AmbientFloor } from "./ambient-floor";
import { SandCanvas } from "./sand-canvas";
import { TransformRing } from "./transform-ring";
import { playPlaceSound, playSelectSound, playLiftSound } from "@/lib/audio-feedback";
import { ZoomIn, ZoomOut, Maximize } from "lucide-react";

export type SandTexture = "fine" | "wet" | "blue";

export interface CanvasItem {
  id: string;
  icon: string;
  category: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  placedBy?: string | null;
  mass?: number;
  zLayer?: number;
}

interface RemoteCursor {
  participantId: string;
  displayName: string;
  x: number;
  y: number;
}

interface DustParticle {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  size: number;
  opacity: number;
}

interface ZenCanvasProps {
  items: CanvasItem[];
  isLocked: boolean;
  isAnonymous: boolean;
  remoteCursors: RemoteCursor[];
  onItemMove: (id: string, x: number, y: number) => void;
  onItemDrop: (icon: string, category: string, x: number, y: number) => void;
  onItemRemove: (id: string) => void;
  onItemTransform: (id: string, scale: number, rotation: number) => void;
  onItemLayerChange?: (id: string, zLayer: number) => void;
  onCursorMove: (x: number, y: number) => void;
  lightSource?: LightSource;
  rakePaths?: RakePath[];
  zenMode?: boolean;
  sandTexture?: SandTexture;
  digMode?: boolean;
  onLightSourceUpdate?: (ls: LightSource) => void;
  onRakePathAdd?: (path: RakePath) => void;
  onRakePathClear?: () => void;
}

const COLLISION_RADIUS = 0.06;
const NUDGE_STRENGTH = 0.04;
const MIN_SCALE = 0.4;
const MAX_SCALE = 3.0;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3.0;

function resolveCollisions(
  movedId: string,
  movedX: number,
  movedY: number,
  allItems: CanvasItem[],
  onItemMove: (id: string, x: number, y: number) => void
) {
  for (const other of allItems) {
    if (other.id === movedId) continue;
    const dx = other.x - movedX;
    const dy = other.y - movedY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < COLLISION_RADIUS && dist > 0.001) {
      const overlap = COLLISION_RADIUS - dist;
      const pushX = (dx / dist) * Math.min(overlap, NUDGE_STRENGTH);
      const pushY = (dy / dist) * Math.min(overlap, NUDGE_STRENGTH);
      const newX = Math.max(0.02, Math.min(0.98, other.x + pushX));
      const newY = Math.max(0.02, Math.min(0.98, other.y + pushY));
      onItemMove(other.id, newX, newY);
    }
  }
}

function spawnDustParticles(x: number, y: number): DustParticle[] {
  const particles: DustParticle[] = [];
  const count = 8 + Math.floor(Math.random() * 5);
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.8;
    const speed = 0.3 + Math.random() * 0.7;
    particles.push({
      id: Date.now() + i,
      x,
      y,
      dx: Math.cos(angle) * speed,
      dy: Math.sin(angle) * speed,
      size: 2 + Math.random() * 4,
      opacity: 0.4 + Math.random() * 0.3,
    });
  }
  return particles;
}

function DustEffect({ particles }: { particles: DustParticle[] }) {
  return (
    <>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full pointer-events-none z-20"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: `rgba(180, 160, 120, ${p.opacity})`,
          }}
          initial={{ opacity: p.opacity, scale: 1 }}
          animate={{
            x: p.dx * 40,
            y: p.dy * 40,
            opacity: 0,
            scale: 0.3,
          }}
          transition={{ duration: 0.6 + Math.random() * 0.4, ease: "easeOut" }}
        />
      ))}
    </>
  );
}


function SandAmbience() {
  const motes = useMemo(() => {
    const count = 6 + Math.floor(Math.random() * 3); // 6-8
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 90 + 5,
      y: Math.random() * 90 + 5,
      size: 2 + Math.random(),
      opacity: 0.15 + Math.random() * 0.1,
      duration: 15 + Math.random() * 10,
      delay: Math.random() * -20,
      driftX: (Math.random() - 0.5) * 60,
      driftY: (Math.random() - 0.5) * 40,
      warm: Math.random() > 0.5,
    }));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none z-[1] overflow-hidden">
      <style>{`
        @keyframes sand-mote-drift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(var(--dx1), var(--dy1)) scale(1.15); }
          50% { transform: translate(var(--dx2), var(--dy2)) scale(0.9); }
          75% { transform: translate(var(--dx3), var(--dy3)) scale(1.1); }
        }
        @keyframes sand-vignette-breathe {
          0%, 100% { opacity: 0.04; }
          50% { opacity: 0.08; }
        }
        @keyframes sand-shimmer-slide {
          0% { transform: translateX(-120%) rotate(-35deg); }
          100% { transform: translateX(120%) rotate(-35deg); }
        }
      `}</style>

      {/* Floating dust motes */}
      {motes.map((m) => (
        <div
          key={m.id}
          className="absolute rounded-full"
          style={{
            left: `${m.x}%`,
            top: `${m.y}%`,
            width: m.size,
            height: m.size,
            backgroundColor: m.warm
              ? `rgba(180, 160, 120, ${m.opacity})`
              : `rgba(160, 140, 100, ${m.opacity})`,
            animation: `sand-mote-drift ${m.duration}s ease-in-out ${m.delay}s infinite`,
            '--dx1': `${m.driftX * 0.4}px`,
            '--dy1': `${m.driftY * 0.6}px`,
            '--dx2': `${m.driftX}px`,
            '--dy2': `${m.driftY * 0.3}px`,
            '--dx3': `${m.driftX * 0.7}px`,
            '--dy3': `${m.driftY}px`,
          } as React.CSSProperties}
        />
      ))}

      {/* Gentle vignette breathing */}
      <div
        className="absolute inset-0"
        style={{
          boxShadow: 'inset 0 0 80px rgba(101, 78, 40, 0.06)',
          animation: 'sand-vignette-breathe 6s ease-in-out infinite',
        }}
      />

      {/* Light shimmer band */}
      <div
        className="absolute inset-0 overflow-hidden"
      >
        <div
          className="absolute"
          style={{
            top: '-20%',
            left: '-20%',
            width: '30%',
            height: '140%',
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 40%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.04) 60%, transparent 100%)',
            animation: 'sand-shimmer-slide 20s linear infinite',
            transformOrigin: 'center center',
          }}
        />
      </div>
    </div>
  );
}

function triggerHaptic(style: "light" | "medium" | "heavy" = "light") {
  try {
    if (navigator.vibrate) {
      navigator.vibrate(style === "light" ? 10 : style === "medium" ? 20 : 40);
    }
  } catch {}
}

const SAND_TEXTURES: Record<SandTexture, { bg: string; shadow: string; grain: number }> = {
  fine: {
    bg: "linear-gradient(145deg, rgba(232,220,200,1) 0%, rgba(218,200,172,1) 25%, rgba(201,184,150,1) 55%, rgba(220,205,178,1) 100%)",
    shadow: "inset 0 2px 12px rgba(0,0,0,0.15), inset 0 0 40px rgba(139,119,80,0.1)",
    grain: 0.18,
  },
  wet: {
    bg: "linear-gradient(145deg, rgba(120,100,70,1) 0%, rgba(95,78,50,1) 25%, rgba(80,65,40,1) 55%, rgba(105,88,60,1) 100%)",
    shadow: "inset 0 3px 20px rgba(0,0,0,0.35), inset 0 0 60px rgba(40,25,10,0.25), inset 0 0 100px rgba(80,60,30,0.1)",
    grain: 0.3,
  },
  blue: {
    bg: "linear-gradient(145deg, rgba(35,100,160,1) 0%, rgba(25,80,140,1) 25%, rgba(20,65,120,1) 55%, rgba(30,90,150,1) 100%)",
    shadow: "inset 0 2px 16px rgba(0,0,0,0.3), inset 0 0 50px rgba(10,30,80,0.2)",
    grain: 0.05,
  },
};

function DigRevealCanvas({
  width,
  height,
  isDigMode,
  sandTexture,
}: {
  width: number;
  height: number;
  isDigMode: boolean;
  sandTexture: SandTexture;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ridgeCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ridgeCanvas = ridgeCanvasRef.current;
    if (!canvas || !ridgeCanvas) return;
    canvas.width = width;
    canvas.height = height;
    ridgeCanvas.width = width;
    ridgeCanvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    if (sandTexture === "wet") {
      gradient.addColorStop(0, "rgba(160,140,110,0.97)");
      gradient.addColorStop(0.5, "rgba(130,110,80,0.97)");
      gradient.addColorStop(1, "rgba(140,120,90,0.97)");
    } else {
      gradient.addColorStop(0, "rgba(232,220,200,0.97)");
      gradient.addColorStop(0.5, "rgba(212,196,168,0.97)");
      gradient.addColorStop(1, "rgba(214,200,170,0.97)");
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    const ridgeCtx = ridgeCanvas.getContext("2d");
    if (ridgeCtx) ridgeCtx.clearRect(0, 0, width, height);
  }, [width, height, sandTexture]);

  const getScaledPos = useCallback((e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!isDigMode) return;
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    drawingRef.current = true;
    const pos = getScaledPos(e);
    lastPointRef.current = pos;
    digAt(pos.x, pos.y);
  }, [isDigMode, getScaledPos]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!drawingRef.current) return;
    const pos = getScaledPos(e);
    const last = lastPointRef.current;
    if (last) {
      const dist = Math.sqrt((pos.x - last.x) ** 2 + (pos.y - last.y) ** 2);
      const steps = Math.max(1, Math.floor(dist / 6));
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        digAt(last.x + (pos.x - last.x) * t, last.y + (pos.y - last.y) * t);
      }
    }
    lastPointRef.current = pos;
  }, [getScaledPos]);

  const handlePointerUp = useCallback(() => {
    drawingRef.current = false;
    lastPointRef.current = null;
  }, []);

  const digAt = useCallback((x: number, y: number) => {
    const ctx = canvasRef.current?.getContext("2d");
    const ridgeCtx = ridgeCanvasRef.current?.getContext("2d");
    if (!ctx) return;

    const baseRadius = 22 + Math.random() * 10;

    // Erase sand to reveal beneath — irregular edge
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    const eraseGrad = ctx.createRadialGradient(x, y, 0, x, y, baseRadius);
    eraseGrad.addColorStop(0, "rgba(0,0,0,1)");
    eraseGrad.addColorStop(0.4, "rgba(0,0,0,0.95)");
    eraseGrad.addColorStop(0.7, "rgba(0,0,0,0.5)");
    eraseGrad.addColorStop(0.85, "rgba(0,0,0,0.15)");
    eraseGrad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = eraseGrad;
    ctx.beginPath();
    ctx.arc(x, y, baseRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Displaced sand ridge around the dig — warm sand-colored buildup
    if (ridgeCtx) {
      const ridgeInner = baseRadius * 0.75;
      const ridgeOuter = baseRadius * 1.5;
      const ridgeGrad = ridgeCtx.createRadialGradient(x, y, ridgeInner, x, y, ridgeOuter);
      ridgeGrad.addColorStop(0, "rgba(0,0,0,0)");
      ridgeGrad.addColorStop(0.2, "rgba(200,180,140,0.2)");
      ridgeGrad.addColorStop(0.45, "rgba(180,155,110,0.3)");
      ridgeGrad.addColorStop(0.7, "rgba(160,135,90,0.12)");
      ridgeGrad.addColorStop(1, "rgba(0,0,0,0)");
      ridgeCtx.fillStyle = ridgeGrad;
      ridgeCtx.beginPath();
      ridgeCtx.arc(x, y, ridgeOuter, 0, Math.PI * 2);
      ridgeCtx.fill();

      // Inner shadow for depth perception
      const shadowGrad = ridgeCtx.createRadialGradient(x + 2, y + 2, 0, x + 2, y + 2, baseRadius * 0.6);
      shadowGrad.addColorStop(0, "rgba(60,40,20,0.12)");
      shadowGrad.addColorStop(0.5, "rgba(60,40,20,0.06)");
      shadowGrad.addColorStop(1, "rgba(0,0,0,0)");
      ridgeCtx.fillStyle = shadowGrad;
      ridgeCtx.beginPath();
      ridgeCtx.arc(x + 2, y + 2, baseRadius * 0.6, 0, Math.PI * 2);
      ridgeCtx.fill();
    }
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className={cn(
          "absolute inset-0 z-[3]",
          isDigMode ? "cursor-crosshair" : "pointer-events-none"
        )}
        style={{ width: "100%", height: "100%" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      />
      <canvas
        ref={ridgeCanvasRef}
        className="absolute inset-0 z-[4] pointer-events-none"
        style={{ width: "100%", height: "100%" }}
      />
    </>
  );
}

function DraggableItem({
  item,
  isLocked,
  isDragging,
  isSelected,
  canvasRef,
  lightSource,
  rakeMode,
  digMode,
  zoom,
  panOffset,
  onDragStart,
  onDragMove,
  onDragEnd,
  onCursorMove,
  onSelect,
}: {
  item: CanvasItem;
  isLocked: boolean;
  isDragging: boolean;
  isSelected: boolean;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  lightSource: LightSource;
  rakeMode: boolean;
  digMode: boolean;
  zoom: number;
  panOffset: { x: number; y: number };
  onDragStart: () => void;
  onDragMove: (x: number, y: number) => void;
  onDragEnd: (x: number, y: number) => void;
  onCursorMove: (x: number, y: number) => void;
  onSelect: () => void;
}) {
  const mass = getAssetMass(item.icon, item.category);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [longPressActive, setLongPressActive] = useState(false);
  const didDragRef = useRef(false);
  const dragActiveRef = useRef(false);
  const dragStartScreenRef = useRef({ x: 0, y: 0 });
  const pointerIdRef = useRef<number | null>(null);
  const elemRef = useRef<HTMLDivElement>(null);

  const shadowMultiplier = isDragging ? 35 : 12;
  const shadowOffsetX = (item.x - lightSource.x) * shadowMultiplier;
  const shadowOffsetY = (item.y - lightSource.y) * shadowMultiplier;
  const baseShadowBlur = isDragging ? 28 : 5;
  const baseShadowOpacity = isDragging ? 0.4 : 0.18;

  const shadowBlur = useMotionValue(baseShadowBlur);
  const shadowOpacity = useMotionValue(baseShadowOpacity);
  const springBlur = useSpring(shadowBlur, { stiffness: 300, damping: 20 });
  const springOpacity = useSpring(shadowOpacity, { stiffness: 300, damping: 20 });
  const dropShadowFilter = useMotionTemplate`drop-shadow(${shadowOffsetX}px ${shadowOffsetY}px ${springBlur}px rgba(0,0,0,${springOpacity}))`;

  const clearLongPress = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    setLongPressActive(false);
  }, []);

  useEffect(() => {
    return () => { clearLongPress(); };
  }, [clearLongPress]);

  const getRelPos = useCallback((clientX: number, clientY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0.5, y: 0.5 };
    const localX = clientX - rect.left;
    const localY = clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const contentX = (localX - cx - panOffset.x) / zoom + cx;
    const contentY = (localY - cy - panOffset.y) / zoom + cy;
    return {
      x: Math.max(0.03, Math.min(0.97, contentX / rect.width)),
      y: Math.max(0.03, Math.min(0.97, contentY / rect.height)),
    };
  }, [canvasRef, zoom, panOffset]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (isLocked || rakeMode || digMode) return;
    e.stopPropagation();
    e.preventDefault();

    pointerIdRef.current = e.pointerId;
    elemRef.current?.setPointerCapture(e.pointerId);
    dragActiveRef.current = false;
    didDragRef.current = false;
    dragStartScreenRef.current = { x: e.clientX, y: e.clientY };

    const isTouchDevice = e.pointerType === "touch";
    if (isTouchDevice && !isSelected) {
      longPressTimer.current = setTimeout(() => {
        setLongPressActive(false);
        if (!dragActiveRef.current) {
          playSelectSound();
          triggerHaptic("medium");
          onSelect();
        }
      }, 400);
      setLongPressActive(true);
    }
  }, [isLocked, rakeMode, digMode, isSelected, onSelect, clearLongPress]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (isLocked || rakeMode || digMode) return;
    if (pointerIdRef.current !== e.pointerId) return;

    const dx = e.clientX - dragStartScreenRef.current.x;
    const dy = e.clientY - dragStartScreenRef.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (!dragActiveRef.current && dist > 4) {
      dragActiveRef.current = true;
      didDragRef.current = true;
      clearLongPress();
      shadowBlur.set(28);
      shadowOpacity.set(0.4);
      playLiftSound();
      triggerHaptic("light");
      onDragStart();
    }

    if (dragActiveRef.current) {
      const pos = getRelPos(e.clientX, e.clientY);
      onDragMove(pos.x, pos.y);
      onCursorMove(pos.x, pos.y);
    }
  }, [isLocked, rakeMode, digMode, clearLongPress, shadowBlur, shadowOpacity, onDragStart, onDragMove, onCursorMove, getRelPos]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (pointerIdRef.current !== e.pointerId) return;
    clearLongPress();

    if (dragActiveRef.current) {
      shadowBlur.set(5);
      shadowOpacity.set(0.18);
      const pos = getRelPos(e.clientX, e.clientY);
      onDragEnd(pos.x, pos.y);
      playPlaceSound();
      triggerHaptic("medium");

      if (mass > 3 && canvasRef.current) {
        canvasRef.current.animate(
          [
            { transform: "translate(0, 0)" },
            { transform: "translate(-1.5px, 1px)" },
            { transform: "translate(1.5px, -1px)" },
            { transform: "translate(-0.5px, 1px)" },
            { transform: "translate(0, 0)" },
          ],
          { duration: 120, iterations: 2 }
        );
      }
    } else if (!didDragRef.current) {
      playSelectSound();
      triggerHaptic("light");
      onSelect();
    }

    dragActiveRef.current = false;
    pointerIdRef.current = null;
  }, [clearLongPress, shadowBlur, shadowOpacity, getRelPos, onDragEnd, onSelect, mass, canvasRef]);

  const handlePointerCancel = useCallback(() => {
    clearLongPress();
    dragActiveRef.current = false;
    pointerIdRef.current = null;
    shadowBlur.set(5);
    shadowOpacity.set(0.18);
  }, [clearLongPress, shadowBlur, shadowOpacity]);

  const itemScale = isDragging ? item.scale * 1.12 : item.scale;

  return (
    <div
      ref={elemRef}
      className={cn(
        "absolute touch-none",
        !isLocked && !rakeMode && !digMode && "cursor-grab active:cursor-grabbing",
        isDragging ? "z-30" : isSelected ? "z-25" : "z-10"
      )}
      style={{
        left: `${item.x * 100}%`,
        top: `${item.y * 100}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: isDragging ? 1000 : isSelected ? 900 : (item.zLayer ?? 10),
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
    >
      <motion.div
        className="flex items-center justify-center"
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: itemScale,
          y: isDragging ? -8 : 0,
          opacity: 1,
          rotate: item.rotation,
        }}
        exit={{ scale: 0, opacity: 0, transition: { duration: 0.2 } }}
        transition={{ type: "spring", stiffness: 350, damping: 22 }}
      >
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: -3,
            left: '15%',
            width: '70%',
            height: 10,
            background: 'radial-gradient(ellipse, rgba(80,60,30,0.18) 0%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(3px)',
            opacity: isDragging ? 0.3 : 1,
            transform: isDragging ? 'translateY(6px) scale(1.3)' : 'translateY(0) scale(1)',
            transition: 'all 0.2s ease',
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            inset: -4,
            background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
          }}
        />
        {isSelected && !isDragging && (
          <motion.div
            className="absolute pointer-events-none rounded-full"
            style={{
              inset: -6,
              border: '2px solid rgba(212, 175, 55, 0.5)',
              boxShadow: '0 0 12px rgba(212, 175, 55, 0.25)',
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          />
        )}
        {longPressActive && (
          <motion.div
            className="absolute pointer-events-none rounded-full"
            style={{
              inset: -8,
              border: '2px solid rgba(212, 175, 55, 0.6)',
            }}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1.1, opacity: [0, 0.8, 0] }}
            transition={{ duration: 0.4 }}
          />
        )}
        <motion.span
          className="text-5xl select-none"
          style={{
            minWidth: '48px',
            minHeight: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            filter: dropShadowFilter,
            ...(isDragging ? { WebkitFilter: `brightness(1.05)` } : {}),
          }}
        >
          {item.icon}
        </motion.span>
      </motion.div>
    </div>
  );
}

export function ZenCanvas({
  items,
  isLocked,
  isAnonymous,
  remoteCursors,
  onItemMove,
  onItemDrop,
  onItemRemove,
  onItemTransform,
  onItemLayerChange,
  onCursorMove,
  lightSource: lightSourceProp,
  rakePaths: rakePathsProp,
  zenMode,
  sandTexture = "fine",
  digMode = false,
  onLightSourceUpdate,
  onRakePathAdd,
  onRakePathClear,
}: ZenCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dustParticles, setDustParticles] = useState<DustParticle[]>([]);
  const [rakeMode, setRakeMode] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const spaceHeldRef = useRef(false);

  const lightSource = lightSourceProp || DEFAULT_LIGHT_SOURCE;
  const rakePaths = rakePathsProp || [];
  const tex = SAND_TEXTURES[sandTexture];

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => (a.zLayer ?? 10) - (b.zLayer ?? 10));
  }, [items]);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const obs = new ResizeObserver(entries => {
      for (const entry of entries) {
        setCanvasSize({ width: entry.contentRect.width, height: entry.contentRect.height });
      }
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (isLocked) setSelectedId(null);
  }, [isLocked]);

  const handleZoomReset = useCallback(() => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        spaceHeldRef.current = true;
      }
      if (e.code === "Escape") {
        if (zoom !== 1 || panOffset.x !== 0 || panOffset.y !== 0) {
          setZoom(1);
          setPanOffset({ x: 0, y: 0 });
        }
        setSelectedId(null);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        spaceHeldRef.current = false;
        isPanningRef.current = false;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [zoom, panOffset]);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const localX = e.clientX - rect.left;
      const localY = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;

      const delta = -e.deltaY * 0.002;
      const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom + delta * zoom));
      const scale = newZoom / zoom;
      const newPanX = localX - cx - scale * (localX - cx - panOffset.x);
      const newPanY = localY - cy - scale * (localY - cy - panOffset.y);

      setZoom(newZoom);
      setPanOffset({ x: newPanX, y: newPanY });
    };
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [zoom, panOffset]);

  const getRelativePosition = useCallback((clientX: number, clientY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0.5, y: 0.5 };
    const localX = clientX - rect.left;
    const localY = clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const contentX = (localX - cx - panOffset.x) / zoom + cx;
    const contentY = (localY - cy - panOffset.y) / zoom + cy;
    return {
      x: Math.max(0, Math.min(1, contentX / rect.width)),
      y: Math.max(0, Math.min(1, contentY / rect.height)),
    };
  }, [zoom, panOffset]);

  const emitDust = useCallback((x: number, y: number) => {
    const newParticles = spawnDustParticles(x * 100, y * 100);
    setDustParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => {
      setDustParticles(prev => prev.filter(p => !newParticles.includes(p)));
    }, 1200);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (isLocked) return;
    const pos = getRelativePosition(e.clientX, e.clientY);
    onCursorMove(pos.x, pos.y);
  }, [isLocked, getRelativePosition, onCursorMove]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (isLocked) return;
    const icon = e.dataTransfer.getData("icon");
    const category = e.dataTransfer.getData("category");
    if (!icon) return;

    const pos = getRelativePosition(e.clientX, e.clientY);
    onItemDrop(icon, category, pos.x, pos.y);
    emitDust(pos.x, pos.y);
    playPlaceSound();
  }, [isLocked, getRelativePosition, onItemDrop, emitDust]);

  const handleCanvasPointerDown = useCallback((e: React.PointerEvent) => {
    if (spaceHeldRef.current && !isLocked) {
      e.preventDefault();
      isPanningRef.current = true;
      panStartRef.current = { x: e.clientX, y: e.clientY, panX: panOffset.x, panY: panOffset.y };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }
  }, [isLocked, panOffset]);

  const handleCanvasPointerMove = useCallback((e: React.PointerEvent) => {
    if (isPanningRef.current) {
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;
      setPanOffset({ x: panStartRef.current.panX + dx, y: panStartRef.current.panY + dy });
      return;
    }
    if (isLocked) return;
    const pos = getRelativePosition(e.clientX, e.clientY);
    onCursorMove(pos.x, pos.y);
  }, [isLocked, getRelativePosition, onCursorMove]);

  const handleCanvasPointerUp = useCallback(() => {
    isPanningRef.current = false;
  }, []);

  const handleItemDragMove = useCallback((itemId: string, x: number, y: number) => {
    onItemMove(itemId, x, y);
  }, [onItemMove]);

  const handleItemDragEnd = useCallback((itemId: string, x: number, y: number) => {
    setDraggingId(null);
    onItemMove(itemId, x, y);
    emitDust(x, y);
    resolveCollisions(itemId, x, y, items, onItemMove);
  }, [onItemMove, items, emitDust]);

  const handleCanvasClick = useCallback(() => {
    if (!isPanningRef.current) {
      setSelectedId(null);
    }
  }, []);

  const selectedItem = selectedId ? items.find(i => i.id === selectedId) : null;

  const handleBringToFront = useCallback(() => {
    if (!selectedItem || !onItemLayerChange) return;
    const maxZ = Math.max(...items.map(i => i.zLayer ?? 10));
    onItemLayerChange(selectedItem.id, maxZ + 1);
  }, [selectedItem, items, onItemLayerChange]);

  const handleSendToBack = useCallback(() => {
    if (!selectedItem || !onItemLayerChange) return;
    const minZ = Math.min(...items.map(i => i.zLayer ?? 10));
    onItemLayerChange(selectedItem.id, minZ - 1);
  }, [selectedItem, items, onItemLayerChange]);

  const canvasPinchRef = useRef({
    active: false,
    initialDist: 0,
    initialScale: 1,
    initialAngle: 0,
    initialRotation: 0,
  });

  const handleCanvasTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 2) return;
    e.preventDefault();
    const t1 = e.touches[0];
    const t2 = e.touches[1];
    const dist = Math.sqrt((t1.clientX - t2.clientX) ** 2 + (t1.clientY - t2.clientY) ** 2);
    const angle = Math.atan2(t1.clientY - t2.clientY, t1.clientX - t2.clientX) * (180 / Math.PI);

    if (selectedItem) {
      if (!canvasPinchRef.current.active) {
        canvasPinchRef.current = {
          active: true,
          initialDist: dist,
          initialScale: selectedItem.scale,
          initialAngle: angle,
          initialRotation: selectedItem.rotation,
        };
        return;
      }
      const scaleRatio = dist / canvasPinchRef.current.initialDist;
      const newScale = Math.max(0.3, Math.min(4.0, canvasPinchRef.current.initialScale * scaleRatio));
      const angleDelta = angle - canvasPinchRef.current.initialAngle;
      const newRotation = (canvasPinchRef.current.initialRotation + angleDelta) % 360;
      onItemTransform(selectedItem.id, newScale, newRotation);
    } else {
      if (!canvasPinchRef.current.active) {
        canvasPinchRef.current = {
          active: true,
          initialDist: dist,
          initialScale: zoom,
          initialAngle: 0,
          initialRotation: 0,
        };
        return;
      }
      const scaleRatio = dist / canvasPinchRef.current.initialDist;
      const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, canvasPinchRef.current.initialScale * scaleRatio));
      setZoom(newZoom);
    }
  }, [selectedItem, onItemTransform, zoom]);

  const handleCanvasTouchEnd = useCallback(() => {
    canvasPinchRef.current.active = false;
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoom(z => Math.min(MAX_ZOOM, z + 0.25));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(z => Math.max(MIN_ZOOM, z - 0.25));
  }, []);

  const showDigReveal = sandTexture !== "blue" && digMode;

  return (
    <div
      className="w-full h-full flex items-center justify-center p-3 md:p-4"
      style={{ background: 'linear-gradient(145deg, #4A4540 0%, #3A3530 50%, #332F2A 100%)' }}
    >
      <div
        style={{
          background: `repeating-linear-gradient(87deg, transparent, transparent 3px, rgba(101,67,33,0.04) 3px, rgba(101,67,33,0.04) 4px), repeating-linear-gradient(92deg, transparent, transparent 7px, rgba(139,90,43,0.03) 7px, rgba(139,90,43,0.03) 8px), linear-gradient(180deg, #A0764A 0%, #8B6914 15%, #9B7B4A 30%, #7A5C2E 50%, #8B6914 70%, #A0764A 85%, #7A5C2E 100%)`,
          padding: '10px',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.25), 0 1px 3px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -1px 0 rgba(0,0,0,0.1)',
          width: '100%',
          height: '100%',
        }}
      >
        <div
          ref={canvasRef}
          className={cn(
            "relative w-full h-full overflow-hidden select-none touch-none",
            isLocked && "pointer-events-none opacity-80",
            spaceHeldRef.current && "cursor-grab",
            isPanningRef.current && "cursor-grabbing"
          )}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onPointerDown={handleCanvasPointerDown}
          onPointerMove={handleCanvasPointerMove}
          onPointerUp={handleCanvasPointerUp}
          onClick={handleCanvasClick}
          onTouchMove={handleCanvasTouchMove}
          onTouchEnd={handleCanvasTouchEnd}
          style={{
            borderRadius: '4px',
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
              willChange: 'transform',
            }}
          >

      {sandTexture === "blue" ? (
        <div className="absolute inset-0" style={{
          background: "linear-gradient(145deg, rgba(35,100,160,1) 0%, rgba(25,80,140,1) 30%, rgba(20,65,120,1) 60%, rgba(30,90,150,1) 100%)",
          boxShadow: tex.shadow,
        }} />
      ) : (
        <>
          <div className="absolute inset-0" style={{
            background: "linear-gradient(145deg, rgba(30,90,150,1) 0%, rgba(20,75,135,1) 30%, rgba(15,60,115,1) 60%, rgba(25,85,145,1) 100%)",
          }} />
          <div className="absolute inset-0 transition-all duration-700" style={{
            background: tex.bg,
            boxShadow: tex.shadow,
          }} />
        </>
      )}

      <AmbientFloor lightSource={lightSource} />

      <SandCanvas
        width={canvasSize.width}
        height={canvasSize.height}
        rakePaths={rakePaths}
        isRakeMode={rakeMode}
        onRakePathAdd={onRakePathAdd}
        lightSource={lightSource}
      />

      {showDigReveal && (
        <DigRevealCanvas
          width={canvasSize.width}
          height={canvasSize.height}
          isDigMode={digMode}
          sandTexture={sandTexture}
        />
      )}

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 50%, rgba(0,0,0,0.04) 0%, transparent 50%), 
            radial-gradient(circle at 80% 20%, rgba(255,255,255,0.12) 0%, transparent 50%),
            radial-gradient(circle at 50% 80%, rgba(0,0,0,0.03) 0%, transparent 50%),
            radial-gradient(circle at 30% 30%, rgba(255,255,255,0.06) 0%, transparent 40%),
            radial-gradient(circle at 70% 70%, rgba(0,0,0,0.03) 0%, transparent 40%)`,
        }}
      />

      <div className="absolute inset-0 pointer-events-none mix-blend-multiply"
        style={{
          opacity: tex.grain,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.6'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />

      {sandTexture !== "blue" && (
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(
              135deg,
              transparent,
              transparent 8px,
              rgba(139,119,80,0.3) 8px,
              rgba(139,119,80,0.3) 9px,
              transparent 9px,
              transparent 20px
            )`,
          }}
        />
      )}

      <div className="absolute inset-0 pointer-events-none rounded"
        style={{
          boxShadow: `
            inset 0 1px 0 rgba(255,255,255,0.15),
            inset 0 -1px 0 rgba(0,0,0,0.08),
            inset 1px 0 0 rgba(255,255,255,0.08),
            inset -1px 0 0 rgba(0,0,0,0.05),
            inset 0 3px 8px rgba(101,78,40,0.12),
            inset 0 -3px 8px rgba(101,78,40,0.08)`,
        }}
      />

      <SandAmbience />

      <AnimatePresence>
        {sortedItems.map((item) => (
          <DraggableItem
            key={item.id}
            item={item}
            isLocked={isLocked}
            isDragging={draggingId === item.id}
            isSelected={selectedId === item.id}
            canvasRef={canvasRef}
            lightSource={lightSource}
            rakeMode={rakeMode}
            digMode={digMode}
            zoom={zoom}
            panOffset={panOffset}
            onDragStart={() => { setDraggingId(item.id); setSelectedId(item.id); }}
            onDragMove={(x, y) => handleItemDragMove(item.id, x, y)}
            onDragEnd={(x, y) => handleItemDragEnd(item.id, x, y)}
            onCursorMove={onCursorMove}
            onSelect={() => setSelectedId(selectedId === item.id ? null : item.id)}
          />
        ))}
      </AnimatePresence>

      {items.length === 0 && !digMode && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="font-serif text-sm text-[#9B8B6E]/50 select-none">
              <span className="hidden md:inline">Drag figurines from the library to begin</span>
              <span className="md:hidden">Tap figurines in the library to place them</span>
            </p>
            <p className="font-serif text-xs text-[#9B8B6E]/30 select-none mt-1">
              <span className="hidden md:inline">Click items to resize, rotate, or remove</span>
              <span className="md:hidden">Hold items to select · Pinch to resize</span>
            </p>
          </div>
        </div>
      )}

      {selectedItem && !isLocked && (
        <TransformRing
          item={selectedItem}
          canvasRef={canvasRef}
          onTransform={(scale, rotation) => onItemTransform(selectedItem.id, scale, rotation)}
          onRemove={() => {
            onItemRemove(selectedItem.id);
            setSelectedId(null);
          }}
          onDeselect={() => setSelectedId(null)}
          onBringToFront={onItemLayerChange ? handleBringToFront : undefined}
          onSendToBack={onItemLayerChange ? handleSendToBack : undefined}
        />
      )}

      <AnimatePresence>
        {dustParticles.length > 0 && <DustEffect particles={dustParticles} />}
      </AnimatePresence>

      {remoteCursors.map((cursor) => (
        <motion.div
          key={cursor.participantId}
          className="absolute z-40 pointer-events-none"
          animate={{
            left: `${cursor.x * 100}%`,
            top: `${cursor.y * 100}%`,
          }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          style={{ transform: "translate(-50%, -50%)" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="drop-shadow-md">
            <path d="M3 3L10.07 19.97L12.58 12.58L19.97 10.07L3 3Z" fill="#D4AF37" stroke="white" strokeWidth="2"/>
          </svg>
          <span className="bg-primary/80 text-white text-[10px] px-2 py-0.5 rounded-full shadow-sm mt-0.5 block whitespace-nowrap">
            {isAnonymous ? "Anon" : cursor.displayName}
          </span>
        </motion.div>
      ))}

      <AnimatePresence>
        {isLocked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/5 backdrop-blur-[1px] flex items-center justify-center"
          >
            <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-lg flex items-center gap-3 text-primary font-medium border border-primary/20">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              Session Paused
            </div>
          </motion.div>
        )}
      </AnimatePresence>

          </div>

      {(zoom !== 1 || panOffset.x !== 0 || panOffset.y !== 0) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 bg-[#F5EDE0]/95 backdrop-blur-xl rounded-2xl shadow-xl border border-[#D4C4A8]/50 px-2 py-1.5"
        >
          <button
            onClick={handleZoomOut}
            className="p-1.5 rounded-lg hover:bg-[#D4C4A8]/30 transition-colors cursor-pointer"
            data-testid="button-zoom-out"
          >
            <ZoomOut size={16} className="text-[#5A4A32]" />
          </button>
          <span className="text-xs font-semibold text-[#5A4A32] min-w-[40px] text-center tabular-nums">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-1.5 rounded-lg hover:bg-[#D4C4A8]/30 transition-colors cursor-pointer"
            data-testid="button-zoom-in"
          >
            <ZoomIn size={16} className="text-[#5A4A32]" />
          </button>
          <div className="w-px h-5 bg-[#D4C4A8]/40" />
          <button
            onClick={handleZoomReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#8B6914] text-white text-xs font-medium hover:bg-[#7A5C2E] transition-colors cursor-pointer"
            data-testid="button-zoom-reset"
          >
            <Maximize size={14} />
            Reset View
          </button>
        </motion.div>
      )}
    </div>
      </div>
    </div>
  );
}
