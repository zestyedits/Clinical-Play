import { useRef, useCallback, useState } from "react";
import { motion } from "framer-motion";
import { PART_SIZES } from "@/lib/parts-theater-data";

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function getBlobRadius(id: string): string {
  const h = hashCode(id);
  const a = 40 + (h % 20);
  const b = 40 + ((h >> 4) % 20);
  const c = 40 + ((h >> 8) % 20);
  const d = 40 + ((h >> 12) % 20);
  return `${a}% ${100 - a}% ${100 - b}% ${b}% / ${c}% ${d}% ${100 - d}% ${100 - c}%`;
}

function lightenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, ((num >> 16) & 0xff) + Math.round(255 * percent / 100));
  const g = Math.min(255, ((num >> 8) & 0xff) + Math.round(255 * percent / 100));
  const b = Math.min(255, (num & 0xff) + Math.round(255 * percent / 100));
  return `rgb(${r},${g},${b})`;
}

function darkenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, ((num >> 16) & 0xff) - Math.round(255 * percent / 100));
  const g = Math.max(0, ((num >> 8) & 0xff) - Math.round(255 * percent / 100));
  const b = Math.max(0, (num & 0xff) - Math.round(255 * percent / 100));
  return `rgb(${r},${g},${b})`;
}

interface PartShapeProps {
  id: string;
  name: string | null;
  x: number;
  y: number;
  size: string;
  color: string;
  isContained: boolean;
  isSelected: boolean;
  dimInactive: boolean;
  frozen: boolean;
  isClinician: boolean;
  containerWidth: number;
  containerHeight: number;
  circleRadius: number;
  circleCx: number;
  circleCy: number;
  onSelect: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
}

export function PartShape({
  id, name, x, y, size, color, isContained, isSelected,
  dimInactive, frozen, isClinician,
  containerWidth, containerHeight, circleRadius, circleCx, circleCy,
  onSelect, onMove,
}: PartShapeProps) {
  const radius = PART_SIZES[size] || PART_SIZES.medium;
  const displaySize = isContained ? radius * 1.5 : radius * 2;
  const blobRadius = getBlobRadius(id);
  const dragRef = useRef(false);
  const startRef = useRef({ x: 0, y: 0, px: 0, py: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const pixelX = x * containerWidth;
  const pixelY = y * containerHeight;

  const canDrag = !frozen || isClinician;

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (!canDrag) {
      onSelect(id);
      return;
    }
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = false;
    startRef.current = { x: e.clientX, y: e.clientY, px: pixelX, py: pixelY };
  }, [canDrag, id, onSelect, pixelX, pixelY]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;
    if (!dragRef.current && Math.abs(dx) + Math.abs(dy) > 4) {
      dragRef.current = true;
      setIsDragging(true);
    }
    if (!dragRef.current) return;

    let newPx = startRef.current.px + dx;
    let newPy = startRef.current.py + dy;

    // Clamp to circle boundary
    const offX = newPx - circleCx;
    const offY = newPy - circleCy;
    const dist = Math.sqrt(offX * offX + offY * offY);
    const maxDist = circleRadius - radius;
    if (dist > maxDist && maxDist > 0) {
      const scale = maxDist / dist;
      newPx = circleCx + offX * scale;
      newPy = circleCy + offY * scale;
    }

    const normX = containerWidth > 0 ? newPx / containerWidth : 0.5;
    const normY = containerHeight > 0 ? newPy / containerHeight : 0.5;
    onMove(id, normX, normY);
  }, [id, onMove, containerWidth, containerHeight, circleCx, circleCy, circleRadius, radius]);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    setIsDragging(false);
    if (!dragRef.current) {
      onSelect(id);
    }
  }, [id, onSelect]);

  const shouldDim = dimInactive && !isSelected;

  return (
    <motion.div
      className="absolute select-none touch-none"
      style={{
        left: pixelX - displaySize / 2,
        top: pixelY - displaySize / 2,
        width: displaySize,
        height: displaySize,
        zIndex: isDragging ? 50 : isSelected ? 40 : 10,
        cursor: canDrag ? "grab" : "pointer",
      }}
      initial={{ scale: 0, opacity: 0, rotate: -10 }}
      animate={{
        scale: isContained ? 0.75 : 1,
        opacity: shouldDim ? 0.3 : 1,
        rotate: 0,
      }}
      transition={{ type: "spring", stiffness: 350, damping: 22 }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {/* Shadow underneath part */}
      <div
        className="absolute left-1/2 -translate-x-1/2 bottom-[-4px] rounded-[50%] pointer-events-none"
        style={{
          width: displaySize * 0.7,
          height: displaySize * 0.15,
          background: `radial-gradient(ellipse, ${color}25 0%, transparent 70%)`,
          filter: "blur(3px)",
          opacity: isDragging ? 0.8 : 0.4,
          transition: "opacity 0.2s ease",
        }}
      />

      {/* Selection ring with animated glow */}
      {isSelected && (
        <motion.div
          className="absolute inset-[-6px]"
          style={{
            border: "2px solid rgba(212,175,55,0.6)",
            borderRadius: blobRadius,
          }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{
            scale: 1,
            opacity: 1,
            boxShadow: [
              "0 0 12px rgba(212,175,55,0.2)",
              "0 0 20px rgba(212,175,55,0.35)",
              "0 0 12px rgba(212,175,55,0.2)",
            ],
          }}
          transition={{
            scale: { duration: 0.2 },
            opacity: { duration: 0.2 },
            boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" },
          }}
        />
      )}

      {/* Containment box */}
      {isContained && (
        <div
          className="absolute inset-[-4px]"
          style={{
            border: "2px dashed rgba(27,42,74,0.3)",
            borderRadius: "8px",
          }}
        />
      )}

      {/* Blob shape with enhanced 3D */}
      <div
        className="w-full h-full flex items-center justify-center relative"
        style={{
          background: `radial-gradient(circle at 32% 28%, ${lightenColor(color, 28)} 0%, ${color} 45%, ${darkenColor(color, 18)} 100%)`,
          borderRadius: blobRadius,
          boxShadow: isDragging
            ? `0 14px 36px ${color}55, inset 0 2px 5px rgba(255,255,255,0.25), inset 0 -3px 6px rgba(0,0,0,0.08)`
            : isSelected
              ? `0 6px 20px ${color}45, inset 0 2px 4px rgba(255,255,255,0.2), inset 0 -2px 4px rgba(0,0,0,0.06)`
              : `0 3px 12px ${color}30, inset 0 1px 3px rgba(255,255,255,0.15), inset 0 -1px 3px rgba(0,0,0,0.05)`,
          transition: "box-shadow 0.2s ease",
        }}
      >
        {/* Glass highlight */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: displaySize * 0.45,
            height: displaySize * 0.22,
            top: displaySize * 0.08,
            left: displaySize * 0.12,
            background: "rgba(255,255,255,0.18)",
            borderRadius: "50%",
            filter: "blur(2px)",
          }}
        />
        {/* Secondary highlight */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: displaySize * 0.15,
            height: displaySize * 0.1,
            top: displaySize * 0.15,
            left: displaySize * 0.2,
            background: "rgba(255,255,255,0.1)",
            borderRadius: "50%",
          }}
        />
        {name && (
          <span
            className="text-center leading-tight font-medium pointer-events-none px-1"
            style={{
              fontSize: Math.max(9, displaySize * 0.22),
              color: isLightColor(color) ? "#1B2A4A" : "#FFFFFF",
              maxWidth: displaySize - 8,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              display: "block",
              textShadow: isLightColor(color) ? "none" : "0 1px 2px rgba(0,0,0,0.2)",
            }}
          >
            {name}
          </span>
        )}
      </div>

      {/* Gentle idle breathing animation for non-selected parts */}
      {!isSelected && !isDragging && !shouldDim && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ borderRadius: blobRadius }}
          animate={{
            scale: [1, 1.02, 1],
          }}
          transition={{
            duration: 3 + (hashCode(id) % 20) * 0.1,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}
    </motion.div>
  );
}

function isLightColor(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 150;
}
