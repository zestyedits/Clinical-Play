import { useRef, useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import type { CanvasItem } from "./zen-canvas";

interface TransformRingProps {
  item: CanvasItem;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  onTransform: (scale: number, rotation: number) => void;
  onRemove: () => void;
  onDeselect: () => void;
  onBringToFront?: () => void;
  onSendToBack?: () => void;
}

export type { TransformRingProps };

const MIN_SCALE = 0.3;
const MAX_SCALE = 4.0;
const HANDLE_SIZE = 20;
const MOBILE_HANDLE_SIZE = 32;

function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    setIsTouch(window.matchMedia("(pointer: coarse)").matches);
  }, []);
  return isTouch;
}

export function TransformRing({
  item,
  canvasRef,
  onTransform,
  onRemove,
  onDeselect,
  onBringToFront,
  onSendToBack,
}: TransformRingProps) {
  const isTouch = useIsTouchDevice();
  const handleSize = isTouch ? MOBILE_HANDLE_SIZE : HANDLE_SIZE;
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const startRef = useRef({
    scale: item.scale,
    rotation: item.rotation,
    startAngle: 0,
    startDist: 0,
    centerX: 0,
    centerY: 0,
  });

  const pinchRef = useRef({
    active: false,
    initialDist: 0,
    initialScale: item.scale,
    initialAngle: 0,
    initialRotation: item.rotation,
  });

  const getCenter = useCallback(() => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: rect.left + item.x * rect.width,
      y: rect.top + item.y * rect.height,
    };
  }, [canvasRef, item.x, item.y]);

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
    const ratio = currentDist / startDist;
    const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, startScale * ratio));
    onTransform(newScale, item.rotation);
  }, [isResizing, item.rotation, onTransform]);

  const handleScaleEnd = useCallback((e: React.PointerEvent) => {
    if (!isResizing) return;
    e.stopPropagation();
    setIsResizing(false);
  }, [isResizing]);

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

  const handlePinch = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 2) return;
    e.stopPropagation();
    e.preventDefault();

    const t1 = e.touches[0];
    const t2 = e.touches[1];
    const dist = Math.sqrt((t1.clientX - t2.clientX) ** 2 + (t1.clientY - t2.clientY) ** 2);
    const angle = Math.atan2(t1.clientY - t2.clientY, t1.clientX - t2.clientX) * (180 / Math.PI);

    if (!pinchRef.current.active) {
      pinchRef.current = {
        active: true,
        initialDist: dist,
        initialScale: item.scale,
        initialAngle: angle,
        initialRotation: item.rotation,
      };
      return;
    }

    const scaleRatio = dist / pinchRef.current.initialDist;
    const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, pinchRef.current.initialScale * scaleRatio));
    const angleDelta = angle - pinchRef.current.initialAngle;
    const newRotation = (pinchRef.current.initialRotation + angleDelta) % 360;
    onTransform(newScale, newRotation);
  }, [item.scale, item.rotation, onTransform]);

  const handlePinchEnd = useCallback(() => {
    pinchRef.current.active = false;
  }, []);

  const ringSize = Math.max(60, 52 * item.scale) + 24;
  const ringRadius = ringSize / 2;
  const svgSize = ringSize + handleSize + 8;
  const center = svgSize / 2;

  const scalePercent = Math.round((item.scale / 1.0) * 100);
  const rotationDeg = Math.round(item.rotation % 360);

  return (
    <div
      className="absolute z-40 pointer-events-none"
      style={{
        left: `${item.x * 100}%`,
        top: `${item.y * 100}%`,
        transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`,
      }}
      onTouchMove={handlePinch}
      onTouchEnd={handlePinchEnd}
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
          <circle
            cx={center}
            cy={center}
            r={ringRadius}
            fill="none"
            stroke="#D4AF37"
            strokeWidth={1.5}
            strokeDasharray="4 3"
            opacity={0.6}
          />
        </svg>

        {/* Rotate handle - 12 o'clock */}
        <div
          className="absolute touch-none"
          style={{
            left: center - handleSize / 2,
            top: center - ringRadius - handleSize / 2,
            width: handleSize,
            height: handleSize,
            cursor: "grab",
          }}
          onPointerDown={handleRotateStart}
          onPointerMove={handleRotateMove}
          onPointerUp={handleRotateEnd}
        >
          <motion.div
            className="w-full h-full rounded-full bg-white shadow-lg flex items-center justify-center"
            style={{ border: '2px solid #D4AF37' }}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9, backgroundColor: '#FFF8E7' }}
          >
            <svg width={isTouch ? 14 : 10} height={isTouch ? 14 : 10} viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2.5" strokeLinecap="round">
              <path d="M1 4v6h6" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
          </motion.div>
        </div>

        {/* Scale handle - 3 o'clock */}
        <div
          className="absolute touch-none"
          style={{
            left: center + ringRadius - handleSize / 2,
            top: center - handleSize / 2,
            width: handleSize,
            height: handleSize,
            cursor: "nwse-resize",
          }}
          onPointerDown={handleScaleStart}
          onPointerMove={handleScaleMove}
          onPointerUp={handleScaleEnd}
        >
          <motion.div
            className="w-full h-full rounded-full bg-white shadow-lg flex items-center justify-center"
            style={{ border: '2px solid #D4AF37' }}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9, backgroundColor: '#FFF8E7' }}
          >
            <svg width={isTouch ? 14 : 10} height={isTouch ? 14 : 10} viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2.5" strokeLinecap="round">
              <path d="M15 3h6v6" />
              <path d="M9 21H3v-6" />
              <line x1="21" y1="3" x2="14" y2="10" />
              <line x1="3" y1="21" x2="10" y2="14" />
            </svg>
          </motion.div>
        </div>

        {/* Size buttons - 9 o'clock */}
        <div
          className="absolute flex flex-col gap-1"
          style={{
            left: center - ringRadius - handleSize / 2,
            top: center - handleSize - 2,
            width: handleSize,
          }}
        >
          <motion.button
            className="w-full rounded-full bg-white shadow-md flex items-center justify-center cursor-pointer"
            style={{ border: '2px solid #D4AF37', height: handleSize * 0.85 }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9, backgroundColor: '#FFF8E7' }}
            onClick={(e) => {
              e.stopPropagation();
              onTransform(Math.min(MAX_SCALE, item.scale * 1.2), item.rotation);
            }}
          >
            <svg width={isTouch ? 12 : 9} height={isTouch ? 12 : 9} viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="3" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </motion.button>
          <motion.button
            className="w-full rounded-full bg-white shadow-md flex items-center justify-center cursor-pointer"
            style={{ border: '2px solid #D4AF37', height: handleSize * 0.85 }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9, backgroundColor: '#FFF8E7' }}
            onClick={(e) => {
              e.stopPropagation();
              onTransform(Math.max(MIN_SCALE, item.scale * 0.8), item.rotation);
            }}
          >
            <svg width={isTouch ? 12 : 9} height={isTouch ? 12 : 9} viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="3" strokeLinecap="round">
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </motion.button>
        </div>

        {/* Delete handle - 6 o'clock */}
        <motion.button
          className="absolute rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg cursor-pointer"
          style={{
            left: center - handleSize / 2,
            top: center + ringRadius - handleSize / 2,
            width: handleSize,
            height: handleSize,
            fontSize: isTouch ? "16px" : "12px",
            fontWeight: "bold",
            border: '2px solid rgba(255,255,255,0.5)',
          }}
          whileHover={{ scale: 1.2, backgroundColor: '#dc2626' }}
          whileTap={{ scale: 0.85 }}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          data-testid="button-remove-item"
        >
          ×
        </motion.button>

        {/* Layer controls - 5 o'clock position */}
        {(onBringToFront || onSendToBack) && (
          <div
            className="absolute flex gap-0.5"
            style={{
              left: center + ringRadius * 0.5 - handleSize * 0.4,
              top: center + ringRadius * 0.7 - handleSize * 0.2,
            }}
          >
            {onBringToFront && (
              <motion.button
                className="rounded-full bg-white shadow-md flex items-center justify-center cursor-pointer"
                style={{ border: '2px solid #D4AF37', width: handleSize * 0.85, height: handleSize * 0.85 }}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9, backgroundColor: '#FFF8E7' }}
                onClick={(e) => { e.stopPropagation(); onBringToFront(); }}
                data-testid="button-bring-front"
                title="Bring to front"
              >
                <svg width={isTouch ? 12 : 9} height={isTouch ? 12 : 9} viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M12 19V5" /><path d="M5 12l7-7 7 7" />
                </svg>
              </motion.button>
            )}
            {onSendToBack && (
              <motion.button
                className="rounded-full bg-white shadow-md flex items-center justify-center cursor-pointer"
                style={{ border: '2px solid #D4AF37', width: handleSize * 0.85, height: handleSize * 0.85 }}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9, backgroundColor: '#FFF8E7' }}
                onClick={(e) => { e.stopPropagation(); onSendToBack(); }}
                data-testid="button-send-back"
                title="Send to back"
              >
                <svg width={isTouch ? 12 : 9} height={isTouch ? 12 : 9} viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M12 5v14" /><path d="M19 12l-7 7-7-7" />
                </svg>
              </motion.button>
            )}
          </div>
        )}

        {/* Scale/rotation info tooltip */}
        {(isResizing || isRotating) && (
          <motion.div
            className="absolute pointer-events-none"
            style={{
              left: center - 30,
              top: center - ringRadius - handleSize - 24,
              width: 60,
            }}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-black/70 text-white text-[10px] text-center px-2 py-1 rounded-full whitespace-nowrap backdrop-blur-sm">
              {isResizing ? `${scalePercent}%` : `${rotationDeg}°`}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
