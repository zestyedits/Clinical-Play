import { useRef, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface CanvasItem {
  id: string;
  icon: string;
  category: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  placedBy?: string | null;
}

interface RemoteCursor {
  participantId: string;
  displayName: string;
  x: number;
  y: number;
}

interface ZenCanvasProps {
  items: CanvasItem[];
  isLocked: boolean;
  isAnonymous: boolean;
  remoteCursors: RemoteCursor[];
  onItemMove: (id: string, x: number, y: number) => void;
  onItemDrop: (icon: string, category: string, x: number, y: number) => void;
  onItemRemove: (id: string) => void;
  onCursorMove: (x: number, y: number) => void;
}

export function ZenCanvas({
  items,
  isLocked,
  isAnonymous,
  remoteCursors,
  onItemMove,
  onItemDrop,
  onItemRemove,
  onCursorMove,
}: ZenCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [placePulse, setPlacePulse] = useState<{ x: number; y: number } | null>(null);

  const getRelativePosition = useCallback((clientX: number, clientY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0.5, y: 0.5 };
    return {
      x: Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (clientY - rect.top) / rect.height)),
    };
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

    setPlacePulse({ x: pos.x * 100, y: pos.y * 100 });
    setTimeout(() => setPlacePulse(null), 600);
  }, [isLocked, getRelativePosition, onItemDrop]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (isLocked) return;
    const pos = getRelativePosition(e.clientX, e.clientY);
    onCursorMove(pos.x, pos.y);
  }, [isLocked, getRelativePosition, onCursorMove]);

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
      style={{
        background: "linear-gradient(145deg, #e8dcc8 0%, #d4c4a8 30%, #c9b896 60%, #d6c8aa 100%)",
      }}
    >
      {/* Sand texture overlay */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(0,0,0,0.03) 0%, transparent 50%), 
                            radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%),
                            radial-gradient(circle at 50% 80%, rgba(0,0,0,0.02) 0%, transparent 50%)`,
        }}
      />

      {/* Sand grain noise */}
      <div className="absolute inset-0 opacity-[0.15] pointer-events-none mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />

      {/* Placed Items */}
      <AnimatePresence>
        {items.map((item) => (
          <motion.div
            key={item.id}
            className={cn(
              "absolute flex items-center justify-center cursor-grab active:cursor-grabbing z-10",
              draggingId === item.id && "z-30 scale-110"
            )}
            style={{
              left: `${item.x * 100}%`,
              top: `${item.y * 100}%`,
              transform: `translate(-50%, -50%) scale(${item.scale}) rotate(${item.rotation}deg)`,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: item.scale, opacity: 1 }}
            exit={{ scale: 0, opacity: 0, transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            drag={!isLocked}
            dragMomentum={false}
            onDragStart={() => setDraggingId(item.id)}
            onDrag={(_, info) => {
              const rect = canvasRef.current?.getBoundingClientRect();
              if (!rect) return;
              const newX = (info.point.x - rect.left) / rect.width;
              const newY = (info.point.y - rect.top) / rect.height;
              onCursorMove(newX, newY);
            }}
            onDragEnd={(_, info) => {
              setDraggingId(null);
              const rect = canvasRef.current?.getBoundingClientRect();
              if (!rect) return;
              const newX = Math.max(0.02, Math.min(0.98, (info.point.x - rect.left) / rect.width));
              const newY = Math.max(0.02, Math.min(0.98, (info.point.y - rect.top) / rect.height));
              onItemMove(item.id, newX, newY);
            }}
            onDoubleClick={() => !isLocked && onItemRemove(item.id)}
            whileHover={{ scale: item.scale * 1.15 }}
            whileTap={{ scale: item.scale * 0.95 }}
          >
            <span
              className="text-5xl md:text-5xl drop-shadow-md select-none"
              style={{ minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {item.icon}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Placement Pulse */}
      <AnimatePresence>
        {placePulse && (
          <motion.div
            className="absolute pointer-events-none z-20"
            style={{ left: `${placePulse.x}%`, top: `${placePulse.y}%`, transform: "translate(-50%, -50%)" }}
            initial={{ scale: 0, opacity: 0.6 }}
            animate={{ scale: 3, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="w-8 h-8 rounded-full bg-accent/40" />
          </motion.div>
        )}
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
