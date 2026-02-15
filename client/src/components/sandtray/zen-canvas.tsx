import { useRef, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";
import type { LightSource, RakePath } from "@/lib/ambient-types";
import { getAssetMass, DEFAULT_LIGHT_SOURCE } from "@/lib/ambient-types";
import { AmbientFloor } from "./ambient-floor";
import { SandCanvas } from "./sand-canvas";
import { TransformRing } from "./transform-ring";
import { playPlaceSound, playSelectSound, playLiftSound } from "@/lib/audio-feedback";

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
  onCursorMove: (x: number, y: number) => void;
  lightSource?: LightSource;
  rakePaths?: RakePath[];
  zenMode?: boolean;
  onLightSourceUpdate?: (ls: LightSource) => void;
  onRakePathAdd?: (path: RakePath) => void;
  onRakePathClear?: () => void;
}

const COLLISION_RADIUS = 0.06;
const NUDGE_STRENGTH = 0.04;
const MIN_SCALE = 0.4;
const MAX_SCALE = 3.0;

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


function triggerHaptic(style: "light" | "medium" | "heavy" = "light") {
  try {
    if (navigator.vibrate) {
      navigator.vibrate(style === "light" ? 10 : style === "medium" ? 20 : 40);
    }
  } catch {}
}

function DraggableItem({
  item,
  isLocked,
  isDragging,
  isSelected,
  canvasRef,
  lightSource,
  rakeMode,
  onDragStart,
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
  onDragStart: () => void;
  onDragEnd: (x: number, y: number) => void;
  onCursorMove: (x: number, y: number) => void;
  onSelect: () => void;
}) {
  const mass = getAssetMass(item.icon, item.category);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [longPressActive, setLongPressActive] = useState(false);
  const didDragRef = useRef(false);
  const dragDistRef = useRef(0);
  const dragStartPosRef = useRef({ x: 0, y: 0 });

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

  const dragPower = Math.max(0.08, 0.25 / mass);
  const dragTimeConstant = mass < 0.3 ? 350 : 80 * mass;

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

  const handleDragStart = useCallback((_: any, info: any) => {
    shadowBlur.set(28);
    shadowOpacity.set(0.4);
    didDragRef.current = false;
    dragDistRef.current = 0;
    dragStartPosRef.current = { x: info.point.x, y: info.point.y };
    clearLongPress();
    playLiftSound();
    triggerHaptic("light");
    onDragStart();
  }, [shadowBlur, shadowOpacity, onDragStart, clearLongPress]);

  const handleDragEnd = useCallback((_: any, info: any) => {
    shadowBlur.set(5);
    shadowOpacity.set(0.18);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const newX = Math.max(0.03, Math.min(0.97, (info.point.x - rect.left) / rect.width));
    const newY = Math.max(0.03, Math.min(0.97, (info.point.y - rect.top) / rect.height));

    if (dragDistRef.current > 5) {
      didDragRef.current = true;
      onDragEnd(newX, newY);
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
    }
  }, [canvasRef, onDragEnd, shadowBlur, shadowOpacity, mass]);

  const handleDrag = useCallback((_: any, info: any) => {
    const dx = info.point.x - dragStartPosRef.current.x;
    const dy = info.point.y - dragStartPosRef.current.y;
    dragDistRef.current = Math.sqrt(dx * dx + dy * dy);
    if (dragDistRef.current > 3) didDragRef.current = true;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const newX = (info.point.x - rect.left) / rect.width;
    const newY = (info.point.y - rect.top) / rect.height;
    onCursorMove(newX, newY);
  }, [canvasRef, onCursorMove]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (isLocked || rakeMode) return;
    const isTouchDevice = e.pointerType === "touch";
    if (isTouchDevice && !isSelected) {
      longPressTimer.current = setTimeout(() => {
        setLongPressActive(false);
        playSelectSound();
        triggerHaptic("medium");
        onSelect();
      }, 400);
      setLongPressActive(true);
    }
  }, [isLocked, rakeMode, isSelected, onSelect]);

  const handlePointerUp = useCallback(() => {
    clearLongPress();
  }, [clearLongPress]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (didDragRef.current) {
      didDragRef.current = false;
      return;
    }
    e.stopPropagation();
    playSelectSound();
    triggerHaptic("light");
    onSelect();
  }, [onSelect]);

  const itemScale = isDragging ? item.scale * 1.12 : item.scale;
  const liftY = isDragging ? -8 : 0;

  return (
    <motion.div
      className={cn(
        "absolute flex items-center justify-center touch-none",
        !isLocked && !rakeMode && "cursor-grab active:cursor-grabbing",
        isDragging ? "z-30" : isSelected ? "z-25" : "z-10"
      )}
      style={{
        left: `${item.x * 100}%`,
        top: `${item.y * 100}%`,
        transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`,
        willChange: "transform, filter",
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: itemScale,
        y: liftY,
        opacity: 1,
      }}
      exit={{ scale: 0, opacity: 0, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 350, damping: 22 }}
      drag={!isLocked && !rakeMode}
      dragMomentum={true}
      dragElastic={0.08}
      dragTransition={{
        power: dragPower,
        timeConstant: dragTimeConstant,
        modifyTarget: (v) => v,
      }}
      dragConstraints={canvasRef}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClick={handleClick}
      whileHover={!isSelected && !isDragging ? { scale: item.scale * 1.08 } : undefined}
      whileTap={!isDragging ? { scale: item.scale * 0.95 } : undefined}
    >
      {/* Grounding shadow — fades when lifted */}
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
      {/* Contrast plate */}
      <div
        className="absolute pointer-events-none"
        style={{
          inset: -4,
          background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
        }}
      />
      {/* Selection ring glow */}
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
      {/* Long-press progress indicator */}
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
  onCursorMove,
  lightSource: lightSourceProp,
  rakePaths: rakePathsProp,
  zenMode,
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

  const lightSource = lightSourceProp || DEFAULT_LIGHT_SOURCE;
  const rakePaths = rakePathsProp || [];

  // Track canvas size for sand canvas
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

  const getRelativePosition = useCallback((clientX: number, clientY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0.5, y: 0.5 };
    return {
      x: Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (clientY - rect.top) / rect.height)),
    };
  }, []);

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

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (isLocked) return;
    const pos = getRelativePosition(e.clientX, e.clientY);
    onCursorMove(pos.x, pos.y);
  }, [isLocked, getRelativePosition, onCursorMove]);

  const handleItemDragEnd = useCallback((itemId: string, x: number, y: number) => {
    setDraggingId(null);
    onItemMove(itemId, x, y);
    emitDust(x, y);
    resolveCollisions(itemId, x, y, items, onItemMove);
  }, [onItemMove, items, emitDust]);

  const handleCanvasClick = useCallback(() => {
    setSelectedId(null);
  }, []);

  const selectedItem = selectedId ? items.find(i => i.id === selectedId) : null;

  const canvasPinchRef = useRef({
    active: false,
    initialDist: 0,
    initialScale: 1,
    initialAngle: 0,
    initialRotation: 0,
  });

  const handleCanvasTouchMove = useCallback((e: React.TouchEvent) => {
    if (!selectedItem || e.touches.length !== 2) return;
    e.preventDefault();
    const t1 = e.touches[0];
    const t2 = e.touches[1];
    const dist = Math.sqrt((t1.clientX - t2.clientX) ** 2 + (t1.clientY - t2.clientY) ** 2);
    const angle = Math.atan2(t1.clientY - t2.clientY, t1.clientX - t2.clientX) * (180 / Math.PI);

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
  }, [selectedItem, onItemTransform]);

  const handleCanvasTouchEnd = useCallback(() => {
    canvasPinchRef.current.active = false;
  }, []);

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
            isLocked && "pointer-events-none opacity-80"
          )}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onPointerMove={handlePointerMove}
          onClick={handleCanvasClick}
          onTouchMove={handleCanvasTouchMove}
          onTouchEnd={handleCanvasTouchEnd}
          style={{
            background: "linear-gradient(145deg, rgba(232,220,200,0.85) 0%, rgba(212,196,168,0.85) 30%, rgba(201,184,150,0.85) 60%, rgba(214,200,170,0.85) 100%)",
            boxShadow: "inset 0 2px 12px rgba(0,0,0,0.15), inset 0 0 40px rgba(139,119,80,0.1)",
            borderRadius: '4px',
          }}
        >
      {/* Ambient Floor — behind everything */}
      <AmbientFloor lightSource={lightSource} />

      {/* Sand deformation canvas */}
      <SandCanvas
        width={canvasSize.width}
        height={canvasSize.height}
        rakePaths={rakePaths}
        isRakeMode={rakeMode}
        onRakePathAdd={onRakePathAdd}
        lightSource={lightSource}
      />

      {/* Sand texture overlay */}
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

      {/* Sand grain noise */}
      <div className="absolute inset-0 opacity-[0.18] pointer-events-none mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.6'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />

      {/* Raked sand lines */}
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

      {/* Wooden tray edge */}
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

      {/* Placed Items */}
      <AnimatePresence>
        {items.map((item) => (
          <DraggableItem
            key={item.id}
            item={item}
            isLocked={isLocked}
            isDragging={draggingId === item.id}
            isSelected={selectedId === item.id}
            canvasRef={canvasRef}
            lightSource={lightSource}
            rakeMode={rakeMode}
            onDragStart={() => { setDraggingId(item.id); setSelectedId(item.id); }}
            onDragEnd={(x, y) => handleItemDragEnd(item.id, x, y)}
            onCursorMove={onCursorMove}
            onSelect={() => setSelectedId(selectedId === item.id ? null : item.id)}
          />
        ))}
      </AnimatePresence>

      {/* Empty state */}
      {items.length === 0 && (
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

      {/* Transform Ring */}
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
        />
      )}

      {/* Dust Particles */}
      <AnimatePresence>
        {dustParticles.length > 0 && <DustEffect particles={dustParticles} />}
      </AnimatePresence>

      {/* Remote Cursors */}
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

      {/* Lock Overlay */}
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
      </div>
    </div>
  );
}
