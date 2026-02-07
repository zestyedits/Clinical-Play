import { useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import type { CanvasItem } from "./zen-canvas";

interface TransformRingProps {
  item: CanvasItem;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  onTransform: (scale: number, rotation: number) => void;
  onRemove: () => void;
  onDeselect: () => void;
}

const MIN_SCALE = 0.4;
const MAX_SCALE = 3.0;
const RING_RADIUS = 38;
const HANDLE_SIZE = 16;
const TOUCH_HANDLE_SIZE = 22;

export function TransformRing({
  item,
  canvasRef,
  onTransform,
  onRemove,
  onDeselect,
}: TransformRingProps) {
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const startRef = useRef({ scale: item.scale, rotation: item.rotation, startAngle: 0, startDist: 0, centerX: 0, centerY: 0 });

  const getCenter = useCallback(() => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: rect.left + item.x * rect.width,
      y: rect.top + item.y * rect.height,
    };
  }, [canvasRef, item.x, item.y]);

  // Scale handle (3 o'clock)
  const handleScaleStart = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const center = getCenter();
    const startDist = Math.sqrt((e.clientX - center.x) ** 2 + (e.clientY - center.y) ** 2);
    startRef.current = {
      scale: item.scale,
      rotation: item.rotation,
      startAngle: 0,
      startDist,
      centerX: center.x,
      centerY: center.y,
    };
    setIsResizing(true);
  }, [item.scale, item.rotation, getCenter]);

  const handleScaleMove = useCallback((e: React.PointerEvent) => {
    if (!isResizing) return;
    e.stopPropagation();
    const { centerX, centerY, startDist, scale: startScale } = startRef.current;
    const currentDist = Math.sqrt((e.clientX - centerX) ** 2 + (e.clientY - centerY) ** 2);
    if (startDist < 1) return;
    const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, startScale * (currentDist / startDist)));
    onTransform(newScale, item.rotation);
  }, [isResizing, item.rotation, onTransform]);

  const handleScaleEnd = useCallback((e: React.PointerEvent) => {
    if (!isResizing) return;
    e.stopPropagation();
    setIsResizing(false);
  }, [isResizing]);

  // Rotate handle (12 o'clock)
  const handleRotateStart = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const center = getCenter();
    const startAngle = Math.atan2(e.clientY - center.y, e.clientX - center.x) * (180 / Math.PI);
    startRef.current = {
      scale: item.scale,
      rotation: item.rotation,
      startAngle,
      startDist: 0,
      centerX: center.x,
      centerY: center.y,
    };
    setIsRotating(true);
  }, [item.scale, item.rotation, getCenter]);

  const handleRotateMove = useCallback((e: React.PointerEvent) => {
    if (!isRotating) return;
    e.stopPropagation();
    const { centerX, centerY, startAngle, rotation: startRotation } = startRef.current;
    const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
    const delta = currentAngle - startAngle;
    onTransform(item.scale, (startRotation + delta) % 360);
  }, [isRotating, item.scale, onTransform]);

  const handleRotateEnd = useCallback((e: React.PointerEvent) => {
    if (!isRotating) return;
    e.stopPropagation();
    setIsRotating(false);
  }, [isRotating]);

  const ringSize = Math.max(56, 48 * item.scale) + 20;
  const ringRadius = ringSize / 2;
  const svgSize = ringSize + HANDLE_SIZE + 4;
  const center = svgSize / 2;

  return (
    <div
      className="absolute z-40 pointer-events-none"
      style={{
        left: `${item.x * 100}%`,
        top: `${item.y * 100}%`,
        transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`,
      }}
    >
      <motion.div
        className="relative pointer-events-auto"
        style={{ width: svgSize, height: svgSize }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        <svg
          width={svgSize}
          height={svgSize}
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          className="absolute inset-0"
        >
          {/* Ring circle */}
          <circle
            cx={center}
            cy={center}
            r={ringRadius}
            fill="none"
            stroke="#D4AF37"
            strokeWidth={1.5}
            opacity={0.7}
          />
        </svg>

        {/* Rotate handle - 12 o'clock */}
        <div
          className="absolute touch-none"
          style={{
            left: center - HANDLE_SIZE / 2,
            top: center - ringRadius - HANDLE_SIZE / 2,
            width: HANDLE_SIZE,
            height: HANDLE_SIZE,
            cursor: "grab",
          }}
          onPointerDown={handleRotateStart}
          onPointerMove={handleRotateMove}
          onPointerUp={handleRotateEnd}
        >
          <div
            className="w-full h-full rounded-full bg-white border-[1.5px] shadow-md flex items-center justify-center"
            style={{ borderColor: "#D4AF37" }}
          >
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="3">
              <path d="M1 4v6h6" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
          </div>
        </div>

        {/* Scale handle - 3 o'clock */}
        <div
          className="absolute touch-none"
          style={{
            left: center + ringRadius - HANDLE_SIZE / 2,
            top: center - HANDLE_SIZE / 2,
            width: HANDLE_SIZE,
            height: HANDLE_SIZE,
            cursor: "nwse-resize",
          }}
          onPointerDown={handleScaleStart}
          onPointerMove={handleScaleMove}
          onPointerUp={handleScaleEnd}
        >
          <div
            className="w-full h-full rounded-full bg-white border-[1.5px] shadow-md flex items-center justify-center"
            style={{ borderColor: "#D4AF37" }}
          >
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="3">
              <path d="M15 3h6v6" />
              <path d="M9 21H3v-6" />
              <line x1="21" y1="3" x2="14" y2="10" />
              <line x1="3" y1="21" x2="10" y2="14" />
            </svg>
          </div>
        </div>

        {/* Layer controls - 9 o'clock */}
        <div
          className="absolute flex flex-col gap-0.5"
          style={{
            left: center - ringRadius - HANDLE_SIZE / 2,
            top: center - HANDLE_SIZE - 1,
            width: HANDLE_SIZE,
          }}
        >
          <button
            className="w-full rounded-full bg-white border-[1.5px] shadow-sm flex items-center justify-center cursor-pointer"
            style={{ borderColor: "#D4AF37", height: HANDLE_SIZE * 0.75 }}
            onClick={(e) => {
              e.stopPropagation();
              onTransform(item.scale * 1.15, item.rotation);
            }}
          >
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="3">
              <polyline points="18 15 12 9 6 15" />
            </svg>
          </button>
          <button
            className="w-full rounded-full bg-white border-[1.5px] shadow-sm flex items-center justify-center cursor-pointer"
            style={{ borderColor: "#D4AF37", height: HANDLE_SIZE * 0.75 }}
            onClick={(e) => {
              e.stopPropagation();
              onTransform(Math.max(MIN_SCALE, item.scale * 0.85), item.rotation);
            }}
          >
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="3">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>

        {/* Delete handle - 6 o'clock */}
        <button
          className="absolute rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors cursor-pointer"
          style={{
            left: center - HANDLE_SIZE / 2 + 1,
            top: center + ringRadius - HANDLE_SIZE / 2,
            width: HANDLE_SIZE,
            height: HANDLE_SIZE,
            fontSize: "10px",
            fontWeight: "bold",
          }}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          data-testid="button-remove-item"
        >
          ×
        </button>
      </motion.div>

      {/* Touch target enlargement */}
      <style>{`
        @media (pointer: coarse) {
          [data-testid="button-remove-item"] {
            min-width: ${TOUCH_HANDLE_SIZE}px !important;
            min-height: ${TOUCH_HANDLE_SIZE}px !important;
          }
        }
      `}</style>
    </div>
  );
}
