import { useRef, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { PartShape } from "./part-shape";
import { ConnectionLine } from "./connection-line";
import type { TheaterPartData, TheaterConnectionData } from "./index";
import { METAPHOR_LABELS } from "@/lib/parts-theater-data";

interface TheaterStageProps {
  parts: TheaterPartData[];
  connections: TheaterConnectionData[];
  selectedPartId: string | null;
  connectingFromId: string | null;
  frozen: boolean;
  dimInactive: boolean;
  metaphor: string;
  isClinician: boolean;
  onSelectPart: (id: string | null) => void;
  onMovePart: (id: string, x: number, y: number) => void;
  onCompleteConnection: (toPartId: string) => void;
  onCancelConnection: () => void;
}

export function TheaterStage({
  parts, connections, selectedPartId, connectingFromId,
  frozen, dimInactive, metaphor, isClinician,
  onSelectPart, onMovePart, onCompleteConnection, onCancelConnection,
}: TheaterStageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ width: 600, height: 600 });
  const [pointerPos, setPointerPos] = useState({ x: 0, y: 0 });
  const labels = METAPHOR_LABELS[metaphor] || METAPHOR_LABELS.parts;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDims({ width, height });
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const radius = Math.min(dims.width, dims.height) * 0.42;
  const cx = dims.width / 2;
  const cy = dims.height / 2;

  const handleBackgroundClick = useCallback(() => {
    if (connectingFromId) {
      onCancelConnection();
    } else {
      onSelectPart(null);
    }
  }, [connectingFromId, onCancelConnection, onSelectPart]);

  const handlePartSelect = useCallback((id: string) => {
    if (connectingFromId) {
      if (id !== connectingFromId) {
        onCompleteConnection(id);
      }
    } else {
      onSelectPart(id === selectedPartId ? null : id);
    }
  }, [connectingFromId, selectedPartId, onSelectPart, onCompleteConnection]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!connectingFromId || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setPointerPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, [connectingFromId]);

  const getPartCenter = (partId: string) => {
    const p = parts.find(pp => pp.id === partId);
    if (!p) return { x: cx, y: cy };
    return { x: p.x * dims.width, y: p.y * dims.height };
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative overflow-hidden"
      onClick={handleBackgroundClick}
      onPointerMove={handlePointerMove}
    >
      {/* SVG background layer */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
        <defs>
          <radialGradient id="theater-gradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.05)" />
            <stop offset="70%" stopColor="rgba(245,241,235,0.3)" />
            <stop offset="100%" stopColor="rgba(235,228,218,0.5)" />
          </radialGradient>
        </defs>

        {/* Circle boundary */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="url(#theater-gradient)"
          stroke="rgba(27,42,74,0.12)"
          strokeWidth={1.5}
        />

        {/* Connection lines */}
        {connections.map((conn) => {
          const from = getPartCenter(conn.fromPartId);
          const to = getPartCenter(conn.toPartId);
          return (
            <ConnectionLine
              key={conn.id}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              style={conn.style as "solid" | "dashed"}
            />
          );
        })}

        {/* In-progress connection line */}
        {connectingFromId && (
          <ConnectionLine
            x1={getPartCenter(connectingFromId).x}
            y1={getPartCenter(connectingFromId).y}
            x2={pointerPos.x}
            y2={pointerPos.y}
            style="dashed"
            isPreview
          />
        )}
      </svg>

      {/* Self marker */}
      <motion.div
        className="absolute flex flex-col items-center pointer-events-none"
        style={{
          left: cx - 24,
          top: cy + radius - 16,
          zIndex: 5,
        }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <motion.div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{
            background: "radial-gradient(circle, rgba(212,175,55,0.15) 0%, rgba(212,175,55,0.05) 100%)",
            border: "1.5px solid rgba(212,175,55,0.3)",
          }}
          animate={{ opacity: [0.6, 0.8, 0.6] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="text-xs font-serif text-[#C9A96E]">{labels.selfLabel}</span>
        </motion.div>
      </motion.div>

      {/* Parts */}
      <div className="absolute inset-0" style={{ zIndex: 10 }}>
        {parts.map((part) => (
          <PartShape
            key={part.id}
            id={part.id}
            name={part.name}
            x={part.x}
            y={part.y}
            size={part.size}
            color={part.color}
            isContained={part.isContained}
            isSelected={part.id === selectedPartId}
            dimInactive={dimInactive}
            frozen={frozen}
            isClinician={isClinician}
            containerWidth={dims.width}
            containerHeight={dims.height}
            circleRadius={radius}
            circleCx={cx}
            circleCy={cy}
            onSelect={handlePartSelect}
            onMove={onMovePart}
          />
        ))}
      </div>

      {/* Connection mode indicator */}
      {connectingFromId && (
        <motion.div
          className="absolute top-4 left-1/2 -translate-x-1/2 z-30"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-white/80 backdrop-blur-xl px-4 py-2 rounded-full shadow-lg border border-accent/20 text-xs font-medium text-primary">
            Tap another part to connect
          </div>
        </motion.div>
      )}
    </div>
  );
}
