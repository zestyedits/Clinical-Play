import { useRef, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";
import type { LightSource, RakePath } from "@/lib/ambient-types";
import { getAssetMass, DEFAULT_LIGHT_SOURCE } from "@/lib/ambient-types";
import { AmbientFloor } from "./ambient-floor";
import { SandCanvas } from "./sand-canvas";
import { TransformRing } from "./transform-ring";
import { playPlaceSound } from "@/lib/audio-feedback";

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

  // Dynamic shadow based on light source
  const shadowMultiplier = isDragging ? 30 : 15;
  const shadowOffsetX = (item.x - lightSource.x) * shadowMultiplier;
  const shadowOffsetY = (item.y - lightSource.y) * shadowMultiplier;
  const baseShadowBlur = isDragging ? 30 : 6;
  const baseShadowOpacity = isDragging ? 0.35 : 0.2;

  const shadowBlur = useMotionValue(baseShadowBlur);
  const shadowOpacity = useMotionValue(baseShadowOpacity);
  const springBlur = useSpring(shadowBlur, { stiffness: 300, damping: 20 });
  const springOpacity = useSpring(shadowOpacity, { stiffness: 300, damping: 20 });
  const dropShadowFilter = useMotionTemplate`drop-shadow(${shadowOffsetX}px ${shadowOffsetY}px ${springBlur}px rgba(0,0,0,${springOpacity}))`;
  const didDragRef = useRef(false);

  // Mass-based drag physics
  const dragPower = Math.max(0.1, 0.3 / mass);
  const dragTimeConstant = mass < 0.3 ? 400 : 100 * mass;

  const handleDragStart = useCallback(() => {
    shadowBlur.set(30);
    shadowOpacity.set(0.35);
    didDragRef.current = false;
    onDragStart();
  }, [shadowBlur, shadowOpacity, onDragStart]);

  const handleDragEnd = useCallback((_: any, info: any) => {
    shadowBlur.set(6);
    shadowOpacity.set(0.2);
    didDragRef.current = true;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const newX = Math.max(0.02, Math.min(0.98, (info.point.x - rect.left) / rect.width));
    const newY = Math.max(0.02, Math.min(0.98, (info.point.y - rect.top) / rect.height));
    onDragEnd(newX, newY);

    // Heavy items: screen shake
    if (mass > 3 && canvasRef.current) {
      canvasRef.current.animate(
        [
          { transform: "translate(0, 0)" },
          { transform: "translate(-2px, 1px)" },
          { transform: "translate(2px, -1px)" },
          { transform: "translate(-1px, 2px)" },
          { transform: "translate(0, 0)" },
        ],
        { duration: 150, iterations: 2 }
      );
    }
  }, [canvasRef, onDragEnd, shadowBlur, shadowOpacity, mass]);

  const handleDrag = useCallback((_: any, info: any) => {
    didDragRef.current = true;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const newX = (info.point.x - rect.left) / rect.width;
    const newY = (info.point.y - rect.top) / rect.height;
    onCursorMove(newX, newY);
  }, [canvasRef, onCursorMove]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (didDragRef.current) {
      didDragRef.current = false;
      return;
    }
    e.stopPropagation();
    onSelect();
  }, [onSelect]);

  return (
    <motion.div
      className={cn(
        "absolute flex items-center justify-center cursor-grab active:cursor-grabbing",
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
        scale: isDragging ? item.scale * 1.12 : item.scale,
        opacity: 1,
      }}
      exit={{ scale: 0, opacity: 0, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      drag={!isLocked && !rakeMode}
      dragMomentum={true}
      dragElastic={0.1}
      dragTransition={{
        power: dragPower,
        timeConstant: dragTimeConstant,
        modifyTarget: (v) => v,
      }}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      whileHover={!isSelected ? { scale: item.scale * 1.1 } : undefined}
    >
      <motion.span
        className="text-5xl md:text-5xl select-none"
        style={{
          minWidth: '44px',
          minHeight: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          filter: dropShadowFilter,
          ...(isDragging ? { WebkitFilter: `brightness(1.02)` } : {}),
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

  return (
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
      style={{
        background: "linear-gradient(145deg, rgba(232,220,200,0.85) 0%, rgba(212,196,168,0.85) 30%, rgba(201,184,150,0.85) 60%, rgba(214,200,170,0.85) 100%)",
        boxShadow: "inset 0 2px 12px rgba(0,0,0,0.15), inset 0 0 40px rgba(139,119,80,0.1)",
        borderRadius: "4px",
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
  );
}
