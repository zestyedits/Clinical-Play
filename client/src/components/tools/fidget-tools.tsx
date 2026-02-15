import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { cn } from "@/lib/utils";
import { playClickSound } from "@/lib/audio-feedback";
import { Infinity, Circle, Palette, Wind, Loader, Waves } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FidgetToolsProps {
  onInteraction: (widgetType: string, data: any) => void;
  isClinician: boolean;
}

type WidgetId =
  | "infinity-spinner"
  | "bubble-pop"
  | "color-mixer"
  | "breathing-circle"
  | "fidget-spinner"
  | "zen-ripples";

interface WidgetTab {
  id: WidgetId;
  label: string;
  icon: React.ElementType;
  color: string;
}

interface Bubble {
  id: string;
  x: number;
  y: number;
  size: number;
  hue: number;
  popped: boolean;
  delay: number;
}

interface Ripple {
  id: string;
  x: number;
  y: number;
  createdAt: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const WIDGET_TABS: WidgetTab[] = [
  { id: "infinity-spinner", label: "Infinity", icon: Infinity, color: "#8B5CF6" },
  { id: "bubble-pop", label: "Bubbles", icon: Circle, color: "#06B6D4" },
  { id: "color-mixer", label: "Colors", icon: Palette, color: "#F59E0B" },
  { id: "breathing-circle", label: "Breathe", icon: Wind, color: "#10B981" },
  { id: "fidget-spinner", label: "Spinner", icon: Loader, color: "#EF4444" },
  { id: "zen-ripples", label: "Ripples", icon: Waves, color: "#6366F1" },
];

const INFINITY_COLORS = [
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#10B981",
  "#F59E0B",
  "#EF4444",
];

const INFINITY_SPEEDS = [4, 2.5, 1.5, 0.8];

const GLASS_STYLE =
  "backdrop-blur-xl bg-white/10 border border-white/20 shadow-xl";

// ─── Utility ──────────────────────────────────────────────────────────────────

let bubbleIdCounter = 0;
function nextBubbleId(): string {
  return `bubble-${++bubbleIdCounter}`;
}

let rippleIdCounter = 0;
function nextRippleId(): string {
  return `ripple-${++rippleIdCounter}`;
}

function generateBubbles(count: number): Bubble[] {
  const bubbles: Bubble[] = [];
  for (let i = 0; i < count; i++) {
    bubbles.push({
      id: nextBubbleId(),
      x: Math.random() * 90 + 5,
      y: Math.random() * 85 + 5,
      size: Math.random() * 30 + 20,
      hue: 180 + Math.random() * 60,
      popped: false,
      delay: Math.random() * 0.5,
    });
  }
  return bubbles;
}

function blendColors(
  r: number,
  g: number,
  b: number,
): string {
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

// ─── Sub-Component: Infinity Spinner ──────────────────────────────────────────

interface InfinitySpinnerProps {
  onInteraction: (data: any) => void;
}

function InfinitySpinner({ onInteraction }: InfinitySpinnerProps) {
  const [colorIndex, setColorIndex] = useState(0);
  const [speedIndex, setSpeedIndex] = useState(1);
  const [clickCount, setClickCount] = useState(0);

  const currentColor = INFINITY_COLORS[colorIndex];
  const currentSpeed = INFINITY_SPEEDS[speedIndex];

  const handleClick = useCallback(() => {
    playClickSound();
    const newColorIndex = (colorIndex + 1) % INFINITY_COLORS.length;
    const newSpeedIndex = (speedIndex + 1) % INFINITY_SPEEDS.length;
    setColorIndex(newColorIndex);
    setSpeedIndex(newSpeedIndex);
    setClickCount((c) => c + 1);
    onInteraction({
      action: "change",
      color: INFINITY_COLORS[newColorIndex],
      speed: INFINITY_SPEEDS[newSpeedIndex],
      clicks: clickCount + 1,
    });
  }, [colorIndex, speedIndex, clickCount, onInteraction]);

  // The infinity/figure-8 SVG path
  const infinityPath =
    "M 150,200 C 150,140 50,140 50,200 C 50,260 150,260 150,200 C 150,140 250,140 250,200 C 250,260 150,260 150,200 Z";

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Background ambient glow */}
      <motion.div
        className="absolute rounded-full blur-3xl opacity-20"
        style={{
          width: 280,
          height: 280,
          background: `radial-gradient(circle, ${currentColor}, transparent)`,
        }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: currentSpeed * 1.5, repeat: window.Infinity, ease: "easeInOut" }}
      />

      <svg
        viewBox="0 0 300 400"
        className="w-full max-w-sm h-auto cursor-pointer select-none"
        onClick={handleClick}
        role="button"
        aria-label="Infinity spinner - tap to change speed and color"
      >
        {/* Glow filter */}
        <defs>
          <filter id="infinity-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="infinity-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={currentColor} stopOpacity="0.3" />
            <stop offset="50%" stopColor={currentColor} stopOpacity="0.8" />
            <stop offset="100%" stopColor={currentColor} stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* The track */}
        <motion.path
          d={infinityPath}
          fill="none"
          stroke={currentColor}
          strokeWidth={3}
          strokeOpacity={0.25}
          animate={{ strokeOpacity: [0.15, 0.35, 0.15] }}
          transition={{ duration: currentSpeed, repeat: window.Infinity, ease: "easeInOut" }}
        />

        {/* Animated tracing path */}
        <motion.path
          d={infinityPath}
          fill="none"
          stroke="url(#infinity-grad)"
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray="60 500"
          filter="url(#infinity-glow)"
          animate={{
            strokeDashoffset: [0, -560],
          }}
          transition={{
            duration: currentSpeed,
            repeat: window.Infinity,
            ease: "linear",
          }}
        />

        {/* Tracing dot */}
        <motion.circle
          r={8}
          fill={currentColor}
          filter="url(#infinity-glow)"
          animate={{
            offsetDistance: ["0%", "100%"],
          }}
          transition={{
            duration: currentSpeed,
            repeat: window.Infinity,
            ease: "linear",
          }}
          style={{
            offsetPath: `path('${infinityPath}')`,
          }}
        />

        {/* Center label */}
        <text
          x="150"
          y="330"
          textAnchor="middle"
          fill="white"
          fillOpacity={0.5}
          fontSize="14"
          fontFamily="sans-serif"
        >
          Tap to change
        </text>
      </svg>

      {/* Speed indicator */}
      <div className="absolute bottom-4 right-4 text-xs text-white/40 font-mono">
        {currentSpeed < 1.5 ? "Fast" : currentSpeed < 2.5 ? "Medium" : currentSpeed < 4 ? "Steady" : "Slow"}
      </div>
    </div>
  );
}

// ─── Sub-Component: Bubble Pop ────────────────────────────────────────────────

interface BubblePopProps {
  onInteraction: (data: any) => void;
}

function BubblePop({ onInteraction }: BubblePopProps) {
  const [bubbles, setBubbles] = useState<Bubble[]>(() => generateBubbles(18));
  const [popCount, setPopCount] = useState(0);
  const regenTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const popBubble = useCallback(
    (id: string) => {
      playClickSound();
      setBubbles((prev) =>
        prev.map((b) => (b.id === id ? { ...b, popped: true } : b)),
      );
      setPopCount((c) => c + 1);
      onInteraction({ action: "pop", bubbleId: id, totalPopped: popCount + 1 });

      // Regenerate after a delay
      if (regenTimerRef.current) clearTimeout(regenTimerRef.current);
      regenTimerRef.current = setTimeout(() => {
        setBubbles((prev) => {
          const remaining = prev.filter((b) => !b.popped);
          if (remaining.length < 6) {
            return [...remaining, ...generateBubbles(12)];
          }
          return prev;
        });
      }, 2500);
    },
    [popCount, onInteraction],
  );

  useEffect(() => {
    return () => {
      if (regenTimerRef.current) clearTimeout(regenTimerRef.current);
    };
  }, []);

  // Auto-regenerate single bubbles periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setBubbles((prev) => {
        const active = prev.filter((b) => !b.popped);
        if (active.length < 18) {
          return [...prev.filter((b) => !b.popped), ...generateBubbles(1)];
        }
        return prev;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      {/* Subtle underwater gradient */}
      <div
        className="absolute inset-0 rounded-2xl"
        style={{
          background:
            "radial-gradient(ellipse at 50% 80%, rgba(6,182,212,0.08), transparent 70%)",
        }}
      />

      <AnimatePresence>
        {bubbles
          .filter((b) => !b.popped)
          .map((bubble) => (
            <motion.div
              key={bubble.id}
              className="absolute cursor-pointer"
              style={{
                left: `${bubble.x}%`,
                top: `${bubble.y}%`,
                width: bubble.size,
                height: bubble.size,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: 1,
                opacity: 1,
                y: [0, -6, 0, 4, 0],
              }}
              exit={{
                scale: [1, 1.4, 0],
                opacity: [1, 0.6, 0],
                transition: { duration: 0.3 },
              }}
              transition={{
                scale: { duration: 0.4, delay: bubble.delay },
                opacity: { duration: 0.3, delay: bubble.delay },
                y: {
                  duration: 3 + Math.random() * 2,
                  repeat: window.Infinity,
                  ease: "easeInOut",
                },
              }}
              onClick={() => popBubble(bubble.id)}
              role="button"
              aria-label="Pop bubble"
            >
              <svg
                viewBox="0 0 50 50"
                width={bubble.size}
                height={bubble.size}
              >
                <defs>
                  <radialGradient
                    id={`bubble-grad-${bubble.id}`}
                    cx="35%"
                    cy="35%"
                    r="65%"
                  >
                    <stop
                      offset="0%"
                      stopColor={`hsl(${bubble.hue}, 70%, 85%)`}
                      stopOpacity="0.8"
                    />
                    <stop
                      offset="50%"
                      stopColor={`hsl(${bubble.hue}, 60%, 70%)`}
                      stopOpacity="0.4"
                    />
                    <stop
                      offset="100%"
                      stopColor={`hsl(${bubble.hue}, 50%, 60%)`}
                      stopOpacity="0.15"
                    />
                  </radialGradient>
                </defs>
                <circle
                  cx="25"
                  cy="25"
                  r="22"
                  fill={`url(#bubble-grad-${bubble.id})`}
                  stroke={`hsl(${bubble.hue}, 60%, 80%)`}
                  strokeWidth="1"
                  strokeOpacity="0.5"
                />
                {/* Specular highlight */}
                <ellipse
                  cx="18"
                  cy="17"
                  rx="6"
                  ry="4"
                  fill="white"
                  fillOpacity="0.5"
                  transform="rotate(-30, 18, 17)"
                />
              </svg>
            </motion.div>
          ))}
      </AnimatePresence>

      {/* Pop counter */}
      <div className="absolute bottom-4 left-4 text-sm text-white/40 font-mono">
        {popCount} popped
      </div>
    </div>
  );
}

// ─── Sub-Component: Color Mixer ───────────────────────────────────────────────

interface ColorMixerProps {
  onInteraction: (data: any) => void;
}

function ColorMixer({ onInteraction }: ColorMixerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [positions, setPositions] = useState({
    red: { x: 120, y: 140 },
    green: { x: 200, y: 140 },
    blue: { x: 160, y: 220 },
  });
  const [dragging, setDragging] = useState<string | null>(null);
  const [mixCount, setMixCount] = useState(0);

  const circleRadius = 70;

  // Compute blended color at the centroid of the three circles
  const centroidX = (positions.red.x + positions.green.x + positions.blue.x) / 3;
  const centroidY = (positions.red.y + positions.green.y + positions.blue.y) / 3;

  // Calculate how much each channel contributes based on distance from centroid
  function channelValue(
    circlePos: { x: number; y: number },
    cx: number,
    cy: number,
  ): number {
    const dist = Math.sqrt(
      (circlePos.x - cx) ** 2 + (circlePos.y - cy) ** 2,
    );
    const maxDist = circleRadius * 2;
    return Math.max(0, Math.min(255, 255 * (1 - dist / maxDist)));
  }

  const blendedR = channelValue(positions.red, centroidX, centroidY);
  const blendedG = channelValue(positions.green, centroidX, centroidY);
  const blendedB = channelValue(positions.blue, centroidX, centroidY);
  const blendedColor = blendColors(blendedR, blendedG, blendedB);

  const handleDragStart = useCallback(
    (channel: string) => {
      setDragging(channel);
    },
    [],
  );

  const handleDrag = useCallback(
    (channel: string, info: any) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const scaleX = 320 / rect.width;
      const scaleY = 360 / rect.height;
      setPositions((prev) => ({
        ...prev,
        [channel]: {
          x: Math.max(
            circleRadius,
            Math.min(320 - circleRadius, prev[channel as keyof typeof prev].x + info.delta.x * scaleX),
          ),
          y: Math.max(
            circleRadius,
            Math.min(360 - circleRadius, prev[channel as keyof typeof prev].y + info.delta.y * scaleY),
          ),
        },
      }));
    },
    [],
  );

  const handleDragEnd = useCallback(
    (channel: string) => {
      setDragging(null);
      setMixCount((c) => c + 1);
      playClickSound();
      onInteraction({
        action: "mix",
        color: blendedColor,
        positions,
        mixCount: mixCount + 1,
      });
    },
    [blendedColor, positions, mixCount, onInteraction],
  );

  const channels = [
    { key: "red", color: "rgba(239, 68, 68, 0.55)", glow: "#EF4444" },
    { key: "green", color: "rgba(34, 197, 94, 0.55)", glow: "#22C55E" },
    { key: "blue", color: "rgba(59, 130, 246, 0.55)", glow: "#3B82F6" },
  ] as const;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center select-none"
    >
      <svg viewBox="0 0 320 360" className="w-full max-w-sm h-auto">
        <defs>
          <filter id="color-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Blend mode for overlapping circles */}
          <filter id="blend-screen">
            <feBlend mode="screen" />
          </filter>
        </defs>

        {/* Center blend indicator */}
        <motion.circle
          cx={centroidX}
          cy={centroidY}
          r={28}
          fill={blendedColor}
          filter="url(#color-glow)"
          animate={{
            r: [26, 32, 26],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: window.Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Draggable circles */}
        {channels.map((ch) => {
          const pos = positions[ch.key as keyof typeof positions];
          return (
            <motion.circle
              key={ch.key}
              cx={pos.x}
              cy={pos.y}
              r={circleRadius}
              fill={ch.color}
              stroke={ch.glow}
              strokeWidth={dragging === ch.key ? 3 : 1.5}
              strokeOpacity={dragging === ch.key ? 0.8 : 0.4}
              style={{ mixBlendMode: "screen", cursor: "grab" }}
              drag
              dragMomentum={false}
              dragElastic={0}
              onDragStart={() => handleDragStart(ch.key)}
              onDrag={(_: any, info: any) => handleDrag(ch.key, info)}
              onDragEnd={() => handleDragEnd(ch.key)}
              whileDrag={{ scale: 1.05 }}
              animate={{
                opacity: [0.5, 0.65, 0.5],
              }}
              transition={{
                opacity: {
                  duration: 3,
                  repeat: window.Infinity,
                  ease: "easeInOut",
                  delay: channels.indexOf(ch) * 0.4,
                },
              }}
            />
          );
        })}

        {/* Labels */}
        {channels.map((ch) => {
          const pos = positions[ch.key as keyof typeof positions];
          return (
            <text
              key={`label-${ch.key}`}
              x={pos.x}
              y={pos.y + 4}
              textAnchor="middle"
              fill="white"
              fillOpacity={0.7}
              fontSize="12"
              fontFamily="sans-serif"
              pointerEvents="none"
            >
              {ch.key.charAt(0).toUpperCase()}
            </text>
          );
        })}

        {/* Blended color swatch display */}
        <rect
          x="110"
          y="325"
          width="100"
          height="24"
          rx="12"
          fill={blendedColor}
          stroke="white"
          strokeWidth="1"
          strokeOpacity="0.3"
        />
        <text
          x="160"
          y="341"
          textAnchor="middle"
          fill="white"
          fillOpacity={0.6}
          fontSize="10"
          fontFamily="monospace"
          pointerEvents="none"
        >
          {blendedColor}
        </text>
      </svg>
    </div>
  );
}

// ─── Sub-Component: Breathing Circle ──────────────────────────────────────────

interface BreathingCircleProps {
  onInteraction: (data: any) => void;
}

function BreathingCircle({ onInteraction }: BreathingCircleProps) {
  const [isActive, setIsActive] = useState(true);
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [cycleCount, setCycleCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cycleRef = useRef(0);

  // Breathing cycle: 4s inhale, 2s hold, 6s exhale
  const INHALE_MS = 4000;
  const HOLD_MS = 2000;
  const EXHALE_MS = 6000;

  const runCycle = useCallback(() => {
    setPhase("inhale");
    timerRef.current = setTimeout(() => {
      setPhase("hold");
      timerRef.current = setTimeout(() => {
        setPhase("exhale");
        timerRef.current = setTimeout(() => {
          cycleRef.current += 1;
          setCycleCount(cycleRef.current);
          runCycle();
        }, EXHALE_MS);
      }, HOLD_MS);
    }, INHALE_MS);
  }, []);

  useEffect(() => {
    if (isActive) {
      runCycle();
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isActive, runCycle]);

  const handleTap = useCallback(() => {
    playClickSound();
    // Reset cycle
    if (timerRef.current) clearTimeout(timerRef.current);
    cycleRef.current = 0;
    setCycleCount(0);
    setIsActive(true);
    runCycle();
    onInteraction({ action: "sync", phase, cycleCount });
  }, [phase, cycleCount, onInteraction, runCycle]);

  const circleScale =
    phase === "inhale" ? 1.6 : phase === "hold" ? 1.6 : 1;
  const phaseDuration =
    phase === "inhale"
      ? INHALE_MS / 1000
      : phase === "hold"
        ? HOLD_MS / 1000
        : EXHALE_MS / 1000;

  const phaseLabel =
    phase === "inhale"
      ? "Breathe In"
      : phase === "hold"
        ? "Hold"
        : "Breathe Out";

  const phaseColor =
    phase === "inhale"
      ? "#10B981"
      : phase === "hold"
        ? "#F59E0B"
        : "#6366F1";

  return (
    <div
      className="relative w-full h-full flex flex-col items-center justify-center select-none cursor-pointer"
      onClick={handleTap}
      role="button"
      aria-label="Breathing circle - tap to resync"
    >
      {/* Outer ambient rings */}
      {[1, 2, 3].map((ring) => (
        <motion.div
          key={ring}
          className="absolute rounded-full border"
          style={{
            width: 140 + ring * 40,
            height: 140 + ring * 40,
            borderColor: phaseColor,
          }}
          animate={{
            scale: phase === "inhale" ? [1, 1.15 + ring * 0.05] : phase === "hold" ? 1.15 + ring * 0.05 : [1.15 + ring * 0.05, 1],
            opacity: [0.08, 0.02],
          }}
          transition={{
            duration: phaseDuration,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Main breathing circle */}
      <motion.div
        className="relative rounded-full flex items-center justify-center"
        style={{
          width: 160,
          height: 160,
          background: `radial-gradient(circle, ${phaseColor}33, ${phaseColor}11)`,
          boxShadow: `0 0 60px ${phaseColor}22, 0 0 120px ${phaseColor}11`,
        }}
        animate={{
          scale: circleScale,
        }}
        transition={{
          duration: phaseDuration,
          ease: "easeInOut",
        }}
      >
        {/* Inner glow */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 100,
            height: 100,
            background: `radial-gradient(circle, ${phaseColor}55, transparent)`,
          }}
          animate={{
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{
            duration: phaseDuration,
            ease: "easeInOut",
          }}
        />

        {/* Phase text */}
        <motion.span
          className="relative z-10 text-lg font-light tracking-wide"
          style={{ color: phaseColor }}
          key={phase}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4 }}
        >
          {phaseLabel}
        </motion.span>
      </motion.div>

      {/* Cycle counter */}
      <div className="absolute bottom-6 text-sm text-white/30 font-mono">
        {cycleCount} {cycleCount === 1 ? "cycle" : "cycles"}
      </div>

      {/* Timing guide */}
      <div className="absolute bottom-12 text-xs text-white/20">
        4s in / 2s hold / 6s out
      </div>
    </div>
  );
}

// ─── Sub-Component: Fidget Spinner ────────────────────────────────────────────

interface FidgetSpinnerProps {
  onInteraction: (data: any) => void;
}

function FidgetSpinner({ onInteraction }: FidgetSpinnerProps) {
  const [rotation, setRotation] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [rpm, setRpm] = useState(0);
  const [spinCount, setSpinCount] = useState(0);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const dragStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const rotationRef = useRef(0);
  const velocityRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Physics loop
  useEffect(() => {
    const friction = 0.985;
    const minVelocity = 0.05;

    function step(timestamp: number) {
      if (lastTimeRef.current === 0) lastTimeRef.current = timestamp;
      const dt = Math.min((timestamp - lastTimeRef.current) / 16.67, 3);
      lastTimeRef.current = timestamp;

      let vel = velocityRef.current;
      if (Math.abs(vel) > minVelocity) {
        vel *= Math.pow(friction, dt);
        rotationRef.current += vel * dt;
        velocityRef.current = vel;
        setRotation(rotationRef.current);
        setRpm(Math.round(Math.abs(vel) * 60 / 360));
      } else {
        velocityRef.current = 0;
        setRpm(0);
      }

      animFrameRef.current = requestAnimationFrame(step);
    }

    animFrameRef.current = requestAnimationFrame(step);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    dragStartRef.current = {
      x: e.clientX - rect.left - rect.width / 2,
      y: e.clientY - rect.top - rect.height / 2,
      time: performance.now(),
    };
  }, []);

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!dragStartRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const endX = e.clientX - rect.left - rect.width / 2;
      const endY = e.clientY - rect.top - rect.height / 2;
      const dt = (performance.now() - dragStartRef.current.time) / 1000;

      // Cross product gives tangential direction
      const startAngle = Math.atan2(dragStartRef.current.y, dragStartRef.current.x);
      const endAngle = Math.atan2(endY, endX);
      let angleDiff = ((endAngle - startAngle) * 180) / Math.PI;

      // Normalize
      if (angleDiff > 180) angleDiff -= 360;
      if (angleDiff < -180) angleDiff += 360;

      const flickVelocity = dt > 0 ? angleDiff / dt : 0;
      const clampedVelocity = Math.max(-30, Math.min(30, flickVelocity * 0.4));

      if (Math.abs(clampedVelocity) > 1) {
        velocityRef.current += clampedVelocity;
        playClickSound();
        setSpinCount((c) => c + 1);
        onInteraction({
          action: "flick",
          velocity: clampedVelocity,
          spinCount: spinCount + 1,
        });
      }

      dragStartRef.current = null;
    },
    [spinCount, onInteraction],
  );

  // Three-arm spinner shape
  const armAngles = [0, 120, 240];
  const armLength = 65;
  const centerR = 20;
  const tipR = 18;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex flex-col items-center justify-center select-none touch-none"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      role="button"
      aria-label="Fidget spinner - drag to flick"
    >
      {/* RPM display */}
      <motion.div
        className="absolute top-6 text-center"
        animate={{ opacity: rpm > 0 ? 1 : 0.3 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-3xl font-bold text-white/60 font-mono tabular-nums">
          {rpm}
        </div>
        <div className="text-xs text-white/30 uppercase tracking-widest">
          RPM
        </div>
      </motion.div>

      <svg
        viewBox="0 0 250 250"
        className="w-64 h-64 cursor-grab active:cursor-grabbing"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <defs>
          <filter id="spinner-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#000" floodOpacity="0.3" />
          </filter>
          <radialGradient id="arm-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#4338CA" />
          </radialGradient>
          <radialGradient id="tip-grad" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#818CF8" />
            <stop offset="100%" stopColor="#4F46E5" />
          </radialGradient>
          <radialGradient id="center-grad" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#A5B4FC" />
            <stop offset="100%" stopColor="#6366F1" />
          </radialGradient>
        </defs>

        <g filter="url(#spinner-shadow)">
          {/* Arms */}
          {armAngles.map((angle) => {
            const rad = (angle * Math.PI) / 180;
            const tipX = 125 + Math.cos(rad) * armLength;
            const tipY = 125 + Math.sin(rad) * armLength;
            return (
              <g key={angle}>
                <line
                  x1={125}
                  y1={125}
                  x2={tipX}
                  y2={tipY}
                  stroke="url(#arm-grad)"
                  strokeWidth={22}
                  strokeLinecap="round"
                />
                <circle
                  cx={tipX}
                  cy={tipY}
                  r={tipR}
                  fill="url(#tip-grad)"
                  stroke="#818CF8"
                  strokeWidth="1"
                  strokeOpacity="0.5"
                />
                {/* Tip highlight */}
                <circle
                  cx={tipX - 4}
                  cy={tipY - 4}
                  r={6}
                  fill="white"
                  fillOpacity="0.15"
                />
              </g>
            );
          })}

          {/* Center bearing */}
          <circle
            cx={125}
            cy={125}
            r={centerR}
            fill="url(#center-grad)"
            stroke="#A5B4FC"
            strokeWidth="1.5"
            strokeOpacity="0.6"
          />
          <circle
            cx={125}
            cy={125}
            r={10}
            fill="#4338CA"
            stroke="#6366F1"
            strokeWidth="1"
          />
          {/* Center highlight */}
          <circle
            cx={121}
            cy={121}
            r={5}
            fill="white"
            fillOpacity="0.2"
          />
        </g>
      </svg>

      <div className="absolute bottom-4 text-xs text-white/30">
        Drag across to flick
      </div>
    </div>
  );
}

// ─── Sub-Component: Zen Ripples ───────────────────────────────────────────────

interface ZenRipplesProps {
  onInteraction: (data: any) => void;
}

function ZenRipples({ onInteraction }: ZenRipplesProps) {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [tapCount, setTapCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-cleanup old ripples
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setRipples((prev) => prev.filter((r) => now - r.createdAt < 4000));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const handleTap = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();

      let clientX: number, clientY: number;
      if ("touches" in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const x = ((clientX - rect.left) / rect.width) * 100;
      const y = ((clientY - rect.top) / rect.height) * 100;

      playClickSound();
      const newRipple: Ripple = {
        id: nextRippleId(),
        x,
        y,
        createdAt: Date.now(),
      };
      setRipples((prev) => [...prev, newRipple]);
      setTapCount((c) => c + 1);
      onInteraction({
        action: "ripple",
        x,
        y,
        totalRipples: tapCount + 1,
      });
    },
    [tapCount, onInteraction],
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none cursor-pointer"
      onClick={handleTap}
      role="button"
      aria-label="Zen ripples - tap to create ripples"
    >
      {/* Calm water surface gradient */}
      <div
        className="absolute inset-0 rounded-2xl"
        style={{
          background:
            "radial-gradient(ellipse at 50% 60%, rgba(99,102,241,0.06), transparent 60%), " +
            "linear-gradient(180deg, rgba(30,27,75,0.03) 0%, rgba(99,102,241,0.04) 100%)",
        }}
      />

      {/* Subtle horizontal lines for water surface */}
      {[20, 35, 50, 65, 80].map((y) => (
        <motion.div
          key={y}
          className="absolute left-[10%] right-[10%] h-px"
          style={{
            top: `${y}%`,
            background:
              "linear-gradient(90deg, transparent, rgba(148,163,184,0.08), transparent)",
          }}
          animate={{
            scaleX: [0.95, 1.05, 0.95],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 4 + y * 0.03,
            repeat: window.Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Ripples */}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <div
            key={ripple.id}
            className="absolute pointer-events-none"
            style={{
              left: `${ripple.x}%`,
              top: `${ripple.y}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            {/* Multiple concentric ripple rings */}
            {[0, 1, 2, 3].map((ring) => (
              <motion.div
                key={ring}
                className="absolute rounded-full border"
                style={{
                  borderColor: "rgba(148, 163, 184, 0.4)",
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                }}
                initial={{
                  width: 4,
                  height: 4,
                  opacity: 0.6,
                  borderWidth: 2,
                }}
                animate={{
                  width: [4, 160 + ring * 60],
                  height: [4, 160 + ring * 60],
                  opacity: [0.5, 0],
                  borderWidth: [2, 0.5],
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 3,
                  delay: ring * 0.3,
                  ease: "easeOut",
                }}
              />
            ))}

            {/* Center dot */}
            <motion.div
              className="absolute rounded-full"
              style={{
                width: 6,
                height: 6,
                background: "rgba(148, 163, 184, 0.6)",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
              }}
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{ scale: [1, 0], opacity: [0.8, 0] }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        ))}
      </AnimatePresence>

      {/* Tap prompt */}
      {tapCount === 0 && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: window.Infinity }}
        >
          <span className="text-white/30 text-sm">Tap anywhere</span>
        </motion.div>
      )}

      {/* Tap counter */}
      <div className="absolute bottom-4 right-4 text-xs text-white/30 font-mono">
        {tapCount} {tapCount === 1 ? "ripple" : "ripples"}
      </div>
    </div>
  );
}

// ─── Main Component: FidgetTools ──────────────────────────────────────────────

export function FidgetTools({ onInteraction, isClinician }: FidgetToolsProps) {
  const [activeWidget, setActiveWidget] = useState<WidgetId>("infinity-spinner");
  const [totalInteractions, setTotalInteractions] = useState(0);

  const handleWidgetInteraction = useCallback(
    (widgetType: string) => (data: any) => {
      setTotalInteractions((c) => c + 1);
      onInteraction(widgetType, { ...data, totalInteractions: totalInteractions + 1 });
    },
    [onInteraction, totalInteractions],
  );

  const handleTabClick = useCallback(
    (id: WidgetId) => {
      playClickSound();
      setActiveWidget(id);
      onInteraction("navigation", { action: "switch", widget: id });
    },
    [onInteraction],
  );

  const activeTab = WIDGET_TABS.find((t) => t.id === activeWidget)!;

  return (
    <div className="w-full h-full flex flex-col gap-3 p-2 sm:p-4 select-none">
      {/* ── Widget Selector Bar ──────────────────────────────────────── */}
      <div
        className={cn(
          "flex items-center gap-1 sm:gap-2 p-1.5 rounded-2xl overflow-x-auto",
          GLASS_STYLE,
        )}
      >
        {WIDGET_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeWidget === tab.id;
          return (
            <motion.button
              key={tab.id}
              className={cn(
                "relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl",
                "transition-colors duration-200 min-w-[56px]",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30",
                isActive
                  ? "text-white"
                  : "text-white/40 hover:text-white/60",
              )}
              onClick={() => handleTabClick(tab.id)}
              whileTap={{ scale: 0.93 }}
              aria-label={tab.label}
              aria-pressed={isActive}
            >
              {/* Active background */}
              {isActive && (
                <motion.div
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background: `linear-gradient(135deg, ${tab.color}33, ${tab.color}11)`,
                    border: `1px solid ${tab.color}44`,
                  }}
                  layoutId="active-tab-bg"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                className="relative z-10"
                size={20}
                style={{ color: isActive ? tab.color : undefined }}
              />
              <span
                className="relative z-10 text-[10px] font-medium leading-none hidden sm:block"
                style={{ color: isActive ? tab.color : undefined }}
              >
                {tab.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* ── Active Widget Area ───────────────────────────────────────── */}
      <div
        className={cn(
          "relative flex-1 rounded-2xl overflow-hidden min-h-[320px]",
          GLASS_STYLE,
        )}
      >
        {/* Subtle themed gradient background */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          key={activeWidget}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            background: `radial-gradient(ellipse at 50% 50%, ${activeTab.color}08, transparent 70%)`,
          }}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={activeWidget}
            className="relative w-full h-full"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {activeWidget === "infinity-spinner" && (
              <InfinitySpinner
                onInteraction={handleWidgetInteraction("infinity-spinner")}
              />
            )}
            {activeWidget === "bubble-pop" && (
              <BubblePop
                onInteraction={handleWidgetInteraction("bubble-pop")}
              />
            )}
            {activeWidget === "color-mixer" && (
              <ColorMixer
                onInteraction={handleWidgetInteraction("color-mixer")}
              />
            )}
            {activeWidget === "breathing-circle" && (
              <BreathingCircle
                onInteraction={handleWidgetInteraction("breathing-circle")}
              />
            )}
            {activeWidget === "fidget-spinner" && (
              <FidgetSpinner
                onInteraction={handleWidgetInteraction("fidget-spinner")}
              />
            )}
            {activeWidget === "zen-ripples" && (
              <ZenRipples
                onInteraction={handleWidgetInteraction("zen-ripples")}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* ── Interaction Counter ─────────────────────────────────────── */}
        <motion.div
          className={cn(
            "absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-mono",
            "backdrop-blur-md bg-white/5 border border-white/10 text-white/40",
          )}
          animate={{
            scale: totalInteractions > 0 ? [1, 1.08, 1] : 1,
          }}
          transition={{ duration: 0.25 }}
          key={totalInteractions}
        >
          {totalInteractions} {totalInteractions === 1 ? "interaction" : "interactions"}
        </motion.div>

        {/* ── Clinician badge ─────────────────────────────────────────── */}
        {isClinician && (
          <div
            className={cn(
              "absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider",
              "backdrop-blur-md bg-white/5 border border-white/10 text-white/30",
            )}
          >
            Clinician View
          </div>
        )}
      </div>
    </div>
  );
}
