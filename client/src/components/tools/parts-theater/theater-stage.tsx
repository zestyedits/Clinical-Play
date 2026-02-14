import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

  // Track selected part position for spotlight
  const selectedPart = parts.find(p => p.id === selectedPartId);
  const spotlightX = selectedPart ? selectedPart.x * dims.width : cx;
  const spotlightY = selectedPart ? selectedPart.y * dims.height : cy;

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
      {/* Stage atmosphere background */}
      <div className="absolute inset-0" style={{
        background: `radial-gradient(ellipse 85% 70% at 50% 45%, rgba(250,248,245,0.6) 0%, rgba(240,235,225,0.4) 40%, rgba(230,225,215,0.6) 100%)`,
      }} />

      {/* Curtain drape hints at top */}
      <div className="absolute top-0 left-0 right-0 h-8 pointer-events-none"
        style={{
          background: "linear-gradient(180deg, rgba(27,42,74,0.08) 0%, transparent 100%)",
        }}
      />
      <svg className="absolute top-0 left-0 right-0 h-6 pointer-events-none opacity-[0.06]" viewBox="0 0 400 24" preserveAspectRatio="none">
        <path d="M0 0 Q50 20 100 8 Q150 20 200 8 Q250 20 300 8 Q350 20 400 0" fill="none" stroke="#1B2A4A" strokeWidth="2" />
      </svg>

      {/* Dynamic spotlight following selected part */}
      <motion.div
        className="absolute pointer-events-none"
        animate={{
          left: spotlightX - 120,
          top: spotlightY - 120,
          opacity: selectedPartId ? 0.25 : 0.08,
        }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        style={{
          width: 240,
          height: 240,
          background: "radial-gradient(circle, rgba(212,175,55,0.15) 0%, rgba(212,175,55,0.05) 40%, transparent 70%)",
          filter: "blur(20px)",
        }}
      />

      {/* SVG background layer */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
        <defs>
          <radialGradient id="theater-gradient" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
            <stop offset="40%" stopColor="rgba(250,248,245,0.2)" />
            <stop offset="70%" stopColor="rgba(245,241,235,0.35)" />
            <stop offset="100%" stopColor="rgba(235,228,218,0.5)" />
          </radialGradient>
          {/* Stage floor gradient */}
          <linearGradient id="stage-floor" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="60%" stopColor="rgba(27,42,74,0.02)" />
            <stop offset="100%" stopColor="rgba(27,42,74,0.06)" />
          </linearGradient>
        </defs>

        {/* Stage floor shadow */}
        <ellipse
          cx={cx}
          cy={cy + radius * 0.15}
          rx={radius * 1.05}
          ry={radius * 0.35}
          fill="url(#stage-floor)"
          opacity="0.5"
        />

        {/* Circle boundary with enhanced styling */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="url(#theater-gradient)"
          stroke="rgba(27,42,74,0.12)"
          strokeWidth={1}
        />

        {/* Concentric decorative rings */}
        {[0.65, 0.8, 1.0].map((factor, i) => (
          <circle
            key={`ring-${i}`}
            cx={cx}
            cy={cy}
            r={radius * factor}
            fill="none"
            stroke="rgba(212,175,55,0.06)"
            strokeWidth={0.5}
            strokeDasharray={i === 1 ? "4 8" : i === 0 ? "2 12" : undefined}
          />
        ))}

        {/* Spotlight cone effect */}
        <defs>
          <radialGradient id="stage-spotlight" cx="50%" cy="35%" r="45%">
            <stop offset="0%" stopColor="rgba(212,175,55,0.06)" />
            <stop offset="60%" stopColor="rgba(212,175,55,0.02)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <circle cx={cx} cy={cy - radius * 0.1} r={radius * 0.65} fill="url(#stage-spotlight)" />

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

      {/* Self marker with glow */}
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
          className="w-12 h-12 rounded-full flex items-center justify-center relative"
          style={{
            background: "radial-gradient(circle, rgba(212,175,55,0.15) 0%, rgba(212,175,55,0.05) 100%)",
            border: "1.5px solid rgba(212,175,55,0.3)",
          }}
          animate={{ opacity: [0.6, 0.85, 0.6] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Subtle pulse ring */}
          <motion.div
            className="absolute inset-[-3px] rounded-full"
            style={{ border: "1px solid rgba(212,175,55,0.15)" }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <span className="text-xs font-serif text-[#C9A96E]">{labels.selfLabel}</span>
        </motion.div>
      </motion.div>

      {/* Empty state */}
      {parts.length === 0 && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ zIndex: 5 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="text-center">
            <motion.div
              className="text-4xl mb-3 select-none"
              animate={{ y: [0, -5, 0], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              🎭
            </motion.div>
            <p className="text-muted-foreground/40 text-sm font-serif">
              Add {labels.plural.toLowerCase()} to begin exploring
            </p>
          </div>
        </motion.div>
      )}

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
          <div className="bg-white/85 backdrop-blur-xl px-5 py-2.5 rounded-full shadow-lg border border-accent/25 text-xs font-medium text-primary flex items-center gap-2">
            <motion.div
              className="w-2 h-2 rounded-full bg-accent"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            Tap another {labels.noun.toLowerCase()} to connect
          </div>
        </motion.div>
      )}
    </div>
  );
}
