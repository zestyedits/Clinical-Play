import { useMemo } from "react";
import type { HouseLayer } from "./DBTHouseBuilder";

interface HouseCanvasProps {
  layers: HouseLayer[];
  onItemClick: (layerId: string, itemId: string) => void;
  allCompleted: boolean;
}

const LAYER_HEIGHT = 88;
const HOUSE_WIDTH = 220;
const WALL_X = 150;
const GROUND_Y = 440;

export function HouseCanvas({
  layers,
  onItemClick,
  allCompleted,
}: HouseCanvasProps) {
  const placedLayers = layers.filter((l) => l.placed);
  const placedCount = placedLayers.length;
  const totalHeight = placedCount * LAYER_HEIGHT;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: 540,
        height: "100%",
        maxHeight: 620,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        alignItems: "center",
      }}
    >
      <svg
        viewBox="0 0 540 540"
        style={{ width: "100%", height: "100%", overflow: "visible" }}
        preserveAspectRatio="xMidYMax meet"
      >
        <defs>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a8c8e0" />
            <stop offset="50%" stopColor="#c0d8e8" />
            <stop offset="100%" stopColor="#d8e8d8" />
          </linearGradient>
          <linearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6da05a" />
            <stop offset="50%" stopColor="#5a8848" />
            <stop offset="100%" stopColor="#4a7838" />
          </linearGradient>
          <linearGradient id="roofGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#b08058" />
            <stop offset="40%" stopColor="#956848" />
            <stop offset="100%" stopColor="#7a5535" />
          </linearGradient>
          <linearGradient id="roofDoneGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6aaa55" />
            <stop offset="50%" stopColor="#559844" />
            <stop offset="100%" stopColor="#488838" />
          </linearGradient>
          <linearGradient id="chimneyGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#9a7a60" />
            <stop offset="50%" stopColor="#8a6a50" />
            <stop offset="100%" stopColor="#7a5a40" />
          </linearGradient>
          <linearGradient id="doorGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7a6050" />
            <stop offset="100%" stopColor="#5a4030" />
          </linearGradient>
          <linearGradient id="windowGlowGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f0eade" />
            <stop offset="100%" stopColor="#ddd0c0" />
          </linearGradient>
          <linearGradient id="pathGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c8bca4" />
            <stop offset="100%" stopColor="#b0a488" />
          </linearGradient>
          <linearGradient id="trunkGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6a5a3a" />
            <stop offset="50%" stopColor="#7a6a4a" />
            <stop offset="100%" stopColor="#6a5838" />
          </linearGradient>
          <filter id="houseShadow">
            <feDropShadow dx="3" dy="5" stdDeviation="5" floodColor="#2a3a20" floodOpacity="0.18" />
          </filter>
        </defs>

        <rect x="0" y="0" width="540" height="540" fill="url(#skyGrad)" rx="14" />

        {allCompleted && <Sun cx={460} cy={55} />}

        <Clouds />

        <path
          d={`M 0 ${GROUND_Y - 8} Q 135 ${GROUND_Y - 28} 270 ${GROUND_Y - 10} Q 405 ${GROUND_Y + 6} 540 ${GROUND_Y - 4} L 540 540 L 0 540 Z`}
          fill="url(#groundGrad)"
        />
        <path
          d={`M 0 ${GROUND_Y + 12} Q 180 ${GROUND_Y - 2} 360 ${GROUND_Y + 8} Q 450 ${GROUND_Y + 18} 540 ${GROUND_Y + 14} L 540 540 L 0 540 Z`}
          fill="#4a7838"
          opacity="0.35"
        />

        {[40, 90, 130, 400, 450, 490].map((gx) => (
          <line
            key={gx}
            x1={gx}
            y1={GROUND_Y + 5 + Math.sin(gx * 0.1) * 8}
            x2={gx + 4}
            y2={GROUND_Y - 6 + Math.sin(gx * 0.1) * 8}
            stroke="#5a9a48"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.4"
          />
        ))}

        <TreeShape x={60} groundY={GROUND_Y - 16} scale={1.0} />
        <TreeShape x={480} groundY={GROUND_Y - 8} scale={0.75} />
        <BushShape x={112} y={GROUND_Y - 10} scale={0.7} />
        <BushShape x={430} y={GROUND_Y - 4} scale={0.55} />

        {placedCount === 0 && (
          <g>
            <rect x="175" y={GROUND_Y - 65} width="190" height="38" rx="10" fill="rgba(40, 35, 30, 0.5)" />
            <text x="270" y={GROUND_Y - 41} textAnchor="middle" fill="rgba(240, 232, 216, 0.7)" fontSize="11" fontFamily="Inter, sans-serif" fontWeight="500">
              Place your first layer to begin
            </text>
          </g>
        )}

        {placedCount > 0 && (
          <g filter="url(#houseShadow)">
            <ellipse
              cx={WALL_X + HOUSE_WIDTH / 2}
              cy={GROUND_Y + 2}
              rx={HOUSE_WIDTH / 2 + 20}
              ry="7"
              fill="rgba(30,50,20,0.12)"
            />

            {placedLayers.map((layer) => (
              <WallLayer
                key={layer.id}
                layer={layer}
                x={WALL_X}
                groundY={GROUND_Y}
                width={HOUSE_WIDTH}
                height={LAYER_HEIGHT}
              />
            ))}

            <RoofGraphic
              x={WALL_X}
              y={GROUND_Y - totalHeight}
              width={HOUSE_WIDTH}
              allDone={allCompleted}
            />

            {placedLayers.some((l) => l.floor === 0) && (
              <>
                <FrontDoor
                  x={WALL_X + HOUSE_WIDTH / 2 - 16}
                  y={GROUND_Y - 50}
                />
                <SteppingPath
                  doorX={WALL_X + HOUSE_WIDTH / 2}
                  doorY={GROUND_Y}
                />
              </>
            )}
          </g>
        )}

        {placedLayers.map((layer) => (
          <ItemButtons
            key={`items-${layer.id}`}
            layer={layer}
            x={WALL_X}
            groundY={GROUND_Y}
            width={HOUSE_WIDTH}
            height={LAYER_HEIGHT}
            onItemClick={onItemClick}
          />
        ))}
      </svg>
    </div>
  );
}

function Sun({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r="28" fill="#fff8dd" opacity="0.4" />
      <circle cx={cx} cy={cy} r="18" fill="#ffee88" opacity="0.6" />
      <circle cx={cx} cy={cy} r="11" fill="#fff5cc" opacity="0.85" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        return (
          <line
            key={angle}
            x1={cx + Math.cos(rad) * 24}
            y1={cy + Math.sin(rad) * 24}
            x2={cx + Math.cos(rad) * 36}
            y2={cy + Math.sin(rad) * 36}
            stroke="#ffe066"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.35"
          />
        );
      })}
    </g>
  );
}

function Clouds() {
  return (
    <>
      <g opacity="0.4">
        <ellipse cx="85" cy="52" rx="32" ry="14" fill="#eaf2ea" />
        <ellipse cx="60" cy="52" rx="22" ry="12" fill="#e4ece4" />
        <ellipse cx="110" cy="55" rx="24" ry="10" fill="#e0eae0" />
      </g>
      <g opacity="0.3">
        <ellipse cx="340" cy="62" rx="28" ry="12" fill="#e8f0e8" />
        <ellipse cx="368" cy="60" rx="20" ry="10" fill="#e4ece4" />
      </g>
    </>
  );
}

function RoofGraphic({
  x, y, width, allDone,
}: {
  x: number; y: number; width: number; allDone: boolean;
}) {
  const cx = x + width / 2;
  const overhang = 22;
  const peakY = y - 60;
  const eaveY = y + 3;
  const gradId = allDone ? "url(#roofDoneGrad)" : "url(#roofGrad)";
  const trimColor = allDone ? "#4a8838" : "#6a4a30";

  return (
    <g>
      <polygon
        points={`${x - overhang},${eaveY} ${cx},${peakY} ${x + width + overhang},${eaveY}`}
        fill={gradId}
        stroke={trimColor}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />

      {Array.from({ length: 5 }, (_, i) => {
        const t = (i + 1) / 6;
        const ly = peakY + t * (eaveY - peakY);
        const lxLeft = cx - (cx - (x - overhang)) * t;
        const lxRight = cx + (x + width + overhang - cx) * t;
        return (
          <line
            key={i}
            x1={lxLeft + 5}
            y1={ly}
            x2={lxRight - 5}
            y2={ly}
            stroke={allDone ? "rgba(80,140,60,0.2)" : "rgba(100,70,40,0.15)"}
            strokeWidth="0.7"
          />
        );
      })}

      <line x1={cx} y1={peakY} x2={cx} y2={peakY + 5} stroke={trimColor} strokeWidth="2.5" strokeLinecap="round" />

      <rect x={x + width - 38} y={peakY - 6} width="16" height="24" rx="2" fill="url(#chimneyGrad)" stroke={trimColor} strokeWidth="0.8" />
      <rect x={x + width - 40} y={peakY - 10} width="20" height="5" rx="2" fill={allDone ? "#559844" : "#9a7a60"} stroke={trimColor} strokeWidth="0.6" />

      {!allDone && (
        <g opacity="0.3">
          <ellipse cx={x + width - 30} cy={peakY - 18} rx="5" ry="4" fill="#ccc" />
          <ellipse cx={x + width - 27} cy={peakY - 26} rx="4" ry="3" fill="#d5d5d5" />
          <ellipse cx={x + width - 29} cy={peakY - 32} rx="3" ry="2.5" fill="#ddd" />
        </g>
      )}

      {allDone && (
        <text x={cx} y={peakY - 14} textAnchor="middle" fontSize="20">
          ✨
        </text>
      )}
    </g>
  );
}

function WallLayer({
  layer, x, groundY, width, height,
}: {
  layer: HouseLayer; x: number; groundY: number; width: number; height: number;
}) {
  const yBase = groundY - (layer.floor + 1) * height;

  const lighterColor = useMemo(() => {
    const r = parseInt(layer.color.slice(1, 3), 16);
    const g = parseInt(layer.color.slice(3, 5), 16);
    const b = parseInt(layer.color.slice(5, 7), 16);
    return `rgb(${Math.min(255, r + 25)}, ${Math.min(255, g + 25)}, ${Math.min(255, b + 25)})`;
  }, [layer.color]);

  const darkerColor = useMemo(() => {
    const r = parseInt(layer.color.slice(1, 3), 16);
    const g = parseInt(layer.color.slice(3, 5), 16);
    const b = parseInt(layer.color.slice(5, 7), 16);
    return `rgb(${Math.max(0, r - 20)}, ${Math.max(0, g - 20)}, ${Math.max(0, b - 20)})`;
  }, [layer.color]);

  const trimColor = "rgba(70, 60, 45, 0.3)";
  const sidingLines = 6;

  return (
    <g>
      <rect x={x} y={yBase} width={width} height={height} fill={lighterColor} stroke={trimColor} strokeWidth="0.8" rx="1" />

      {Array.from({ length: sidingLines }, (_, i) => {
        const ly = yBase + ((i + 1) * height) / (sidingLines + 1);
        return (
          <line key={i} x1={x + 2} y1={ly} x2={x + width - 2} y2={ly} stroke={darkerColor} strokeWidth="0.4" opacity="0.2" />
        );
      })}

      <rect x={x} y={yBase} width={width} height={3} fill={trimColor} rx="0.5" opacity="0.6" />
      <rect x={x} y={yBase + height - 2} width={width} height={2} fill={trimColor} rx="0.5" opacity="0.4" />

      {layer.floor > 0 && (
        <>
          <WindowWithShutters x={x + 22} y={yBase + 18} w={26} h={34} shutterColor={darkerColor} />
          <WindowWithShutters x={x + width - 48} y={yBase + 18} w={26} h={34} shutterColor={darkerColor} />

          <FlowerBox x={x + 22} y={yBase + 53} w={26} />
          <FlowerBox x={x + width - 48} y={yBase + 53} w={26} />
        </>
      )}

      <text
        x={x + width / 2}
        y={yBase + height - 8}
        textAnchor="middle"
        fontSize="8"
        fill="rgba(50, 45, 35, 0.35)"
        fontFamily="Inter, sans-serif"
        fontWeight="600"
        letterSpacing="0.5"
        style={{ pointerEvents: "none" }}
      >
        {layer.name}
      </text>
    </g>
  );
}

function WindowWithShutters({
  x, y, w, h, shutterColor,
}: {
  x: number; y: number; w: number; h: number; shutterColor: string;
}) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  const shutterW = 5;
  const trim = "rgba(70, 60, 45, 0.35)";

  return (
    <g>
      <rect x={x - shutterW - 1} y={y} width={shutterW} height={h} fill={shutterColor} stroke={trim} strokeWidth="0.5" rx="1" opacity="0.7" />
      <rect x={x + w + 1} y={y} width={shutterW} height={h} fill={shutterColor} stroke={trim} strokeWidth="0.5" rx="1" opacity="0.7" />

      <line x1={x - shutterW + 1} y1={y + h * 0.3} x2={x - 2} y2={y + h * 0.3} stroke={trim} strokeWidth="0.3" opacity="0.4" />
      <line x1={x - shutterW + 1} y1={y + h * 0.6} x2={x - 2} y2={y + h * 0.6} stroke={trim} strokeWidth="0.3" opacity="0.4" />
      <line x1={x + w + 2} y1={y + h * 0.3} x2={x + w + shutterW} y2={y + h * 0.3} stroke={trim} strokeWidth="0.3" opacity="0.4" />
      <line x1={x + w + 2} y1={y + h * 0.6} x2={x + w + shutterW} y2={y + h * 0.6} stroke={trim} strokeWidth="0.3" opacity="0.4" />

      <rect x={x} y={y} width={w} height={h} fill="url(#windowGlowGrad)" stroke={trim} strokeWidth="0.8" rx="1.5" />
      <line x1={cx} y1={y + 1} x2={cx} y2={y + h - 1} stroke={trim} strokeWidth="0.5" />
      <line x1={x + 1} y1={cy} x2={x + w - 1} y2={cy} stroke={trim} strokeWidth="0.5" />

      <rect x={x - 2} y={y - 3} width={w + 4} height="4" rx="1.5" fill={trim} opacity="0.4" />
      <rect x={x - 1} y={y + h} width={w + 2} height="3" rx="1" fill={trim} opacity="0.25" />
    </g>
  );
}

function FlowerBox({ x, y, w }: { x: number; y: number; w: number }) {
  const colors = ["#e85555", "#ff8888", "#ffaa55", "#ffdd55", "#ff7777", "#ee6688"];
  return (
    <g>
      <rect x={x - 2} y={y} width={w + 4} height={4} rx="1.5" fill="#7a6a4a" opacity="0.45" />
      <rect x={x - 1} y={y - 2} width={w + 2} height={3} rx="1" fill="#6a9a48" opacity="0.4" />
      {Array.from({ length: 5 }, (_, i) => {
        const fx = x + 2 + (i * (w - 4)) / 4;
        return (
          <circle
            key={i}
            cx={fx}
            cy={y - 4 - Math.sin(i * 1.3) * 1.5}
            r="2"
            fill={colors[i % colors.length]}
            opacity="0.55"
          />
        );
      })}
    </g>
  );
}

function ItemButtons({
  layer, x, groundY, width, height, onItemClick,
}: {
  layer: HouseLayer; x: number; groundY: number; width: number; height: number;
  onItemClick: (layerId: string, itemId: string) => void;
}) {
  const yBase = groundY - (layer.floor + 1) * height;
  const itemSpacing = width / (layer.items.length + 1);

  return (
    <g>
      {layer.items.map((item, i) => {
        const ix = x + itemSpacing * (i + 1);
        const iy = yBase + height / 2 - 2;

        return (
          <g
            key={item.id}
            onClick={() => onItemClick(layer.id, item.id)}
            style={{ cursor: "pointer" }}
          >
            {!item.completed && (
              <circle
                cx={ix}
                cy={iy}
                r={18}
                fill="none"
                stroke={layer.accentColor}
                strokeWidth="1"
                opacity="0.2"
              >
                <animate attributeName="r" values="18;22;18" dur="2.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.2;0.06;0.2" dur="2.5s" repeatCount="indefinite" />
              </circle>
            )}
            <circle
              cx={ix}
              cy={iy}
              r={15}
              fill={item.completed ? "rgba(107, 160, 90, 0.8)" : "rgba(255, 255, 255, 0.3)"}
              stroke={item.completed ? "#5a9a48" : layer.accentColor}
              strokeWidth={1.5}
            />
            <text
              x={ix}
              y={iy + 1}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="12"
              style={{ pointerEvents: "none" }}
            >
              {item.completed ? "✅" : item.icon}
            </text>
            <text
              x={ix}
              y={iy + 24}
              textAnchor="middle"
              fontSize="6.5"
              fill="rgba(50, 45, 35, 0.55)"
              fontFamily="Inter, sans-serif"
              fontWeight="500"
              style={{ pointerEvents: "none" }}
            >
              {item.name}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function FrontDoor({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x - 2} y={y - 2} width={36} height={54} fill="rgba(60,45,30,0.12)" rx="2" />
      <rect x={x} y={y} width={32} height={50} fill="url(#doorGrad)" stroke="rgba(70,50,35,0.5)" strokeWidth="1" rx="1.5" />
      <path d={`M ${x} ${y} Q ${x + 16} ${y - 10} ${x + 32} ${y}`} fill="rgba(70,50,35,0.15)" stroke="rgba(70,50,35,0.35)" strokeWidth="0.8" />
      <rect x={x} y={y} width={32} height={3} rx="1" fill="rgba(70,50,35,0.35)" />
      <circle cx={x + 23} cy={y + 26} r="2.5" fill="#c4a870" stroke="#a08850" strokeWidth="0.6" />
      <line x1={x + 16} y1={y + 3} x2={x + 16} y2={y + 50} stroke="rgba(70,50,35,0.12)" strokeWidth="0.5" />
      <rect x={x - 4} y={y + 48} width={40} height={4} rx="1" fill="rgba(70,50,35,0.2)" />
    </g>
  );
}

function SteppingPath({ doorX, doorY }: { doorX: number; doorY: number }) {
  return (
    <g opacity="0.5">
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const t = (i + 1) / 7;
        const px = doorX + t * 50;
        const py = doorY + t * 22 + 3;
        return (
          <ellipse
            key={i}
            cx={px}
            cy={py}
            rx={7 + i * 0.4}
            ry={3 + i * 0.3}
            fill="url(#pathGrad)"
            stroke="rgba(140,130,110,0.25)"
            strokeWidth="0.4"
          />
        );
      })}
    </g>
  );
}

function TreeShape({ x, groundY, scale }: { x: number; groundY: number; scale: number }) {
  const s = scale;
  return (
    <g>
      <rect x={x - 4 * s} y={groundY - 8} width={8 * s} height={28 * s} rx={3 * s} fill="url(#trunkGrad)" />
      <ellipse cx={x} cy={groundY - 22 * s} rx={24 * s} ry={32 * s} fill="#4a8a3a" opacity="0.75" />
      <ellipse cx={x - 10 * s} cy={groundY - 32 * s} rx={20 * s} ry={26 * s} fill="#5a9a48" opacity="0.65" />
      <ellipse cx={x + 8 * s} cy={groundY - 40 * s} rx={16 * s} ry={22 * s} fill="#6aaa55" opacity="0.55" />
      <ellipse cx={x - 3 * s} cy={groundY - 46 * s} rx={12 * s} ry={16 * s} fill="#7ab868" opacity="0.45" />
    </g>
  );
}

function BushShape({ x, y, scale }: { x: number; y: number; scale: number }) {
  const s = scale;
  return (
    <g>
      <ellipse cx={x} cy={y} rx={16 * s} ry={11 * s} fill="#4a8a3a" opacity="0.55" />
      <ellipse cx={x - 7 * s} cy={y - 4 * s} rx={12 * s} ry={9 * s} fill="#5a9a48" opacity="0.45" />
      <ellipse cx={x + 6 * s} cy={y - 3 * s} rx={10 * s} ry={8 * s} fill="#6aaa55" opacity="0.4" />
    </g>
  );
}
