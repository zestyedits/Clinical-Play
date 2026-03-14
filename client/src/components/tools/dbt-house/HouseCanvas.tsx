import { useMemo } from "react";
import type { HouseLayer } from "./DBTHouseBuilder";

interface HouseCanvasProps {
  layers: HouseLayer[];
  onItemClick: (layerId: string, itemId: string) => void;
  allCompleted: boolean;
}

const LAYER_HEIGHT = 72;
const HOUSE_WIDTH = 200;
const WALL_X = 160;
const GROUND_Y = 420;

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
        maxWidth: 520,
        height: "100%",
        maxHeight: 580,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        alignItems: "center",
      }}
    >
      <svg
        viewBox="0 0 520 500"
        style={{
          width: "100%",
          height: "100%",
          overflow: "visible",
        }}
        preserveAspectRatio="xMidYMax meet"
      >
        <defs>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#b8d4e8" />
            <stop offset="45%" stopColor="#c8dde8" />
            <stop offset="100%" stopColor="#d0e0d0" />
          </linearGradient>
          <linearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7aaa68" />
            <stop offset="40%" stopColor="#6d9a58" />
            <stop offset="100%" stopColor="#5a8848" />
          </linearGradient>
          <linearGradient id="roofGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a07850" />
            <stop offset="50%" stopColor="#8a6540" />
            <stop offset="100%" stopColor="#7a5535" />
          </linearGradient>
          <linearGradient id="roofDoneGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6aaa55" />
            <stop offset="50%" stopColor="#559844" />
            <stop offset="100%" stopColor="#488838" />
          </linearGradient>
          <linearGradient id="chimneyGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8b6b50" />
            <stop offset="100%" stopColor="#7a5a40" />
          </linearGradient>
          <linearGradient id="doorGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6b5040" />
            <stop offset="100%" stopColor="#5a4030" />
          </linearGradient>
          <linearGradient id="windowGlowGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e8ddd0" />
            <stop offset="100%" stopColor="#d4c8b8" />
          </linearGradient>
          <linearGradient id="pathGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c4b8a0" />
            <stop offset="100%" stopColor="#b0a488" />
          </linearGradient>
          <filter id="houseShadow">
            <feDropShadow dx="4" dy="6" stdDeviation="6" floodColor="#2a3a20" floodOpacity="0.15" />
          </filter>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect x="0" y="0" width="520" height="500" fill="url(#skyGrad)" rx="16" />

        {allCompleted && (
          <g>
            <circle cx="430" cy="50" r="30" fill="#fff8dd" opacity="0.5" />
            <circle cx="430" cy="50" r="20" fill="#ffee88" opacity="0.7" />
            <circle cx="430" cy="50" r="12" fill="#fff5cc" opacity="0.9" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
              const rad = (angle * Math.PI) / 180;
              return (
                <line
                  key={angle}
                  x1={430 + Math.cos(rad) * 26}
                  y1={50 + Math.sin(rad) * 26}
                  x2={430 + Math.cos(rad) * 38}
                  y2={50 + Math.sin(rad) * 38}
                  stroke="#ffe066"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  opacity="0.4"
                />
              );
            })}
          </g>
        )}

        <g opacity="0.45">
          <ellipse cx="80" cy="55" rx="35" ry="16" fill="#eaf2ea" />
          <ellipse cx="55" cy="55" rx="25" ry="14" fill="#e4ece4" />
          <ellipse cx="105" cy="58" rx="28" ry="12" fill="#e0eae0" />
        </g>
        <g opacity="0.35">
          <ellipse cx="350" cy="65" rx="30" ry="14" fill="#e8f0e8" />
          <ellipse cx="380" cy="62" rx="22" ry="11" fill="#e4ece4" />
        </g>

        <path
          d={`M 0 ${GROUND_Y - 5} Q 130 ${GROUND_Y - 25} 260 ${GROUND_Y - 8} Q 390 ${GROUND_Y + 8} 520 ${GROUND_Y - 2} L 520 500 L 0 500 Z`}
          fill="url(#groundGrad)"
        />
        <path
          d={`M 0 ${GROUND_Y + 8} Q 130 ${GROUND_Y - 5} 260 ${GROUND_Y + 5} Q 390 ${GROUND_Y + 18} 520 ${GROUND_Y + 10} L 520 500 L 0 500 Z`}
          fill="#5a8a45"
          opacity="0.3"
        />

        <TreeShape x={68} groundY={GROUND_Y - 18} size={0.9} />
        <TreeShape x={455} groundY={GROUND_Y - 6} size={0.7} />

        <BushShape x={105} y={GROUND_Y - 12} size={0.6} />
        <BushShape x={420} y={GROUND_Y - 2} size={0.5} />

        {placedCount === 0 && (
          <g>
            <rect x="170" y={GROUND_Y - 60} width="180" height="36" rx="10" fill="rgba(45, 40, 35, 0.55)" />
            <text x="260" y={GROUND_Y - 37} textAnchor="middle" fill="rgba(240, 232, 216, 0.75)" fontSize="11.5" fontFamily="Inter, sans-serif" fontWeight="500">
              Place your first layer to begin
            </text>
          </g>
        )}

        {placedCount > 0 && (
          <g filter="url(#houseShadow)">
            <ellipse
              cx={WALL_X + HOUSE_WIDTH / 2}
              cy={GROUND_Y}
              rx={HOUSE_WIDTH / 2 + 16}
              ry="6"
              fill="rgba(30,50,20,0.1)"
            />

            {placedLayers.map((layer) => (
              <WallLayer
                key={layer.id}
                layer={layer}
                x={WALL_X}
                groundY={GROUND_Y}
                width={HOUSE_WIDTH}
                height={LAYER_HEIGHT}
                onItemClick={onItemClick}
              />
            ))}

            {placedCount > 0 && (
              <RoofGraphic
                x={WALL_X}
                y={GROUND_Y - totalHeight}
                width={HOUSE_WIDTH}
                allDone={allCompleted}
              />
            )}

            {placedLayers.some((l) => l.floor === 0) && (
              <FrontDoor
                x={WALL_X + HOUSE_WIDTH / 2 - 14}
                y={GROUND_Y - 44}
              />
            )}

            {placedLayers.some((l) => l.floor === 0) && (
              <SteppingPath
                doorX={WALL_X + HOUSE_WIDTH / 2}
                doorY={GROUND_Y}
              />
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

        {placedLayers.map((layer) => {
          const yBase = GROUND_Y - (layer.floor + 1) * LAYER_HEIGHT;
          return (
            <text
              key={`label-${layer.id}`}
              x={WALL_X + HOUSE_WIDTH / 2}
              y={yBase - 6}
              textAnchor="middle"
              fontSize="10"
              fill="rgba(50, 45, 35, 0.55)"
              fontFamily="Inter, sans-serif"
              fontWeight="600"
            >
              {layer.name}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

function RoofGraphic({
  x,
  y,
  width,
  allDone,
}: {
  x: number;
  y: number;
  width: number;
  allDone: boolean;
}) {
  const cx = x + width / 2;
  const overhang = 18;
  const peakY = y - 55;
  const eaveY = y + 2;
  const gradId = allDone ? "url(#roofDoneGrad)" : "url(#roofGrad)";

  return (
    <g>
      <polygon
        points={`${x - overhang},${eaveY} ${cx},${peakY} ${x + width + overhang},${eaveY}`}
        fill={gradId}
        stroke={allDone ? "#4a8838" : "#6a4a30"}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />

      {Array.from({ length: 4 }, (_, i) => {
        const t = (i + 1) / 5;
        const ly = peakY + t * (eaveY - peakY);
        const lxLeft = cx - (cx - (x - overhang)) * t;
        const lxRight = cx + (x + width + overhang - cx) * t;
        return (
          <line
            key={i}
            x1={lxLeft + 4}
            y1={ly}
            x2={lxRight - 4}
            y2={ly}
            stroke={allDone ? "rgba(80,140,60,0.25)" : "rgba(100,70,40,0.2)"}
            strokeWidth="0.8"
          />
        );
      })}

      <line
        x1={cx}
        y1={peakY}
        x2={cx}
        y2={peakY + 4}
        stroke={allDone ? "#4a8838" : "#6a4a30"}
        strokeWidth="2"
        strokeLinecap="round"
      />

      <g>
        <rect x={x + width - 35} y={peakY - 8} width="14" height="22" rx="2" fill="url(#chimneyGrad)" stroke={allDone ? "#4a8838" : "#6a4a30"} strokeWidth="0.8" />
        <rect x={x + width - 37} y={peakY - 12} width="18" height="5" rx="1.5" fill={allDone ? "#559844" : "#8b6b50"} stroke={allDone ? "#4a8838" : "#6a4a30"} strokeWidth="0.6" />
        {!allDone && (
          <g opacity="0.35">
            <ellipse cx={x + width - 28} cy={peakY - 20} rx="5" ry="4" fill="#d0d0d0" />
            <ellipse cx={x + width - 25} cy={peakY - 28} rx="4" ry="3" fill="#d8d8d8" />
            <ellipse cx={x + width - 27} cy={peakY - 34} rx="3" ry="2.5" fill="#e0e0e0" />
          </g>
        )}
      </g>

      {allDone && (
        <text x={cx} y={peakY - 12} textAnchor="middle" fontSize="18">
          ✨
        </text>
      )}
    </g>
  );
}

function WallLayer({
  layer,
  x,
  groundY,
  width,
  height,
}: {
  layer: HouseLayer;
  x: number;
  groundY: number;
  width: number;
  height: number;
  onItemClick: (layerId: string, itemId: string) => void;
}) {
  const yBase = groundY - (layer.floor + 1) * height;

  const lighterColor = useMemo(() => {
    const r = parseInt(layer.color.slice(1, 3), 16);
    const g = parseInt(layer.color.slice(3, 5), 16);
    const b = parseInt(layer.color.slice(5, 7), 16);
    return `rgb(${Math.min(255, r + 30)}, ${Math.min(255, g + 30)}, ${Math.min(255, b + 30)})`;
  }, [layer.color]);

  const windowColor = "url(#windowGlowGrad)";
  const trimColor = "rgba(80, 70, 55, 0.35)";

  return (
    <g style={{ animation: "fadeSlideUp 0.4s ease" }}>
      <rect
        x={x}
        y={yBase}
        width={width}
        height={height}
        fill={lighterColor}
        stroke={trimColor}
        strokeWidth="1"
        rx="1"
      />

      <rect x={x} y={yBase} width={width} height={2} fill={trimColor} rx="0.5" />
      <rect x={x} y={yBase + height - 2} width={width} height={2} fill={trimColor} rx="0.5" />

      {layer.floor > 0 && (
        <>
          <WindowShape x={x + 20} y={yBase + 14} w={22} h={30} color={windowColor} trim={trimColor} />
          <WindowShape x={x + width - 42} y={yBase + 14} w={22} h={30} color={windowColor} trim={trimColor} />

          <rect x={x + 18} y={yBase + 45} width={26} height="3" rx="1.5" fill="#7aaa68" opacity="0.5" />
          <rect x={x + width - 44} y={yBase + 45} width={26} height="3" rx="1.5" fill="#7aaa68" opacity="0.5" />
          {[0, 5, 10, 15, 20].map((off) => (
            <g key={`fl-${layer.id}-l-${off}`}>
              <circle cx={x + 20 + off} cy={yBase + 44} r="1.5" fill={["#e85555", "#ff8888", "#ffaa55", "#ffdd55", "#ff7777"][off / 5]} opacity="0.6" />
              <circle cx={x + width - 42 + off} cy={yBase + 44} r="1.5" fill={["#ffaa55", "#e85555", "#ff7777", "#ffdd55", "#ff8888"][off / 5]} opacity="0.6" />
            </g>
          ))}
        </>
      )}
    </g>
  );
}

function ItemButtons({
  layer,
  x,
  groundY,
  width,
  height,
  onItemClick,
}: {
  layer: HouseLayer;
  x: number;
  groundY: number;
  width: number;
  height: number;
  onItemClick: (layerId: string, itemId: string) => void;
}) {
  const yBase = groundY - (layer.floor + 1) * height;
  const itemSpacing = width / (layer.items.length + 1);

  return (
    <g>
      {layer.items.map((item, i) => {
        const ix = x + itemSpacing * (i + 1);
        const iy = yBase + height / 2 + 2;

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
                r={20}
                fill="none"
                stroke={layer.accentColor}
                strokeWidth="1.2"
                opacity="0.25"
              >
                <animate attributeName="r" values="20;24;20" dur="2.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.25;0.08;0.25" dur="2.5s" repeatCount="indefinite" />
              </circle>
            )}
            <circle
              cx={ix}
              cy={iy}
              r={16}
              fill={item.completed ? "rgba(107, 160, 90, 0.8)" : "rgba(255, 255, 255, 0.25)"}
              stroke={item.completed ? "#5a9a48" : layer.accentColor}
              strokeWidth={1.5}
            />
            <text
              x={ix}
              y={iy + 1}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="13"
              style={{ pointerEvents: "none" }}
            >
              {item.completed ? "✅" : item.icon}
            </text>
            <text
              x={ix}
              y={iy + 26}
              textAnchor="middle"
              fontSize="7"
              fill="rgba(50, 45, 35, 0.6)"
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

function WindowShape({ x, y, w, h, color, trim }: { x: number; y: number; w: number; h: number; color: string; trim: string }) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={color} stroke={trim} strokeWidth="1" rx="1.5" />
      <line x1={cx} y1={y + 1} x2={cx} y2={y + h - 1} stroke={trim} strokeWidth="0.6" />
      <line x1={x + 1} y1={cy} x2={x + w - 1} y2={cy} stroke={trim} strokeWidth="0.6" />
      <rect x={x - 1} y={y - 2} width={w + 2} height="3" rx="1" fill={trim} opacity="0.5" />
    </g>
  );
}

function FrontDoor({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x} y={y} width={28} height={42} fill="url(#doorGrad)" stroke="rgba(80,60,40,0.5)" strokeWidth="1" rx="1" />
      <rect x={x} y={y} width={28} height={3} rx="1" fill="rgba(80,60,40,0.4)" />
      <path d={`M ${x} ${y} Q ${x + 14} ${y - 8} ${x + 28} ${y}`} fill="rgba(80,60,40,0.2)" stroke="rgba(80,60,40,0.4)" strokeWidth="0.8" />
      <circle cx={x + 20} cy={y + 22} r="2" fill="#c4a870" stroke="#a08850" strokeWidth="0.5" />
      <line x1={x + 14} y1={y + 3} x2={x + 14} y2={y + 42} stroke="rgba(80,60,40,0.15)" strokeWidth="0.5" />
    </g>
  );
}

function SteppingPath({ doorX, doorY }: { doorX: number; doorY: number }) {
  return (
    <g opacity="0.6">
      {[0, 1, 2, 3, 4].map((i) => {
        const t = (i + 1) / 6;
        const px = doorX + t * 40;
        const py = doorY + t * 20 + 2;
        return (
          <ellipse
            key={i}
            cx={px}
            cy={py}
            rx={8 + i * 0.5}
            ry={3.5 + i * 0.3}
            fill="url(#pathGrad)"
            stroke="rgba(140,130,110,0.3)"
            strokeWidth="0.5"
          />
        );
      })}
    </g>
  );
}

function TreeShape({ x, groundY, size }: { x: number; groundY: number; size: number }) {
  const s = size;
  return (
    <g>
      <rect x={x - 3 * s} y={groundY - 5} width={6 * s} height={25 * s} fill="#7a6a4a" rx={2 * s} />
      <ellipse cx={x} cy={groundY - 20 * s} rx={22 * s} ry={30 * s} fill="#5a9a48" opacity="0.8" />
      <ellipse cx={x - 8 * s} cy={groundY - 30 * s} rx={18 * s} ry={24 * s} fill="#6aaa55" opacity="0.7" />
      <ellipse cx={x + 6 * s} cy={groundY - 38 * s} rx={15 * s} ry={20 * s} fill="#7ab868" opacity="0.6" />
    </g>
  );
}

function BushShape({ x, y, size }: { x: number; y: number; size: number }) {
  const s = size;
  return (
    <g>
      <ellipse cx={x} cy={y} rx={14 * s} ry={10 * s} fill="#5a9a48" opacity="0.6" />
      <ellipse cx={x - 6 * s} cy={y - 3 * s} rx={10 * s} ry={8 * s} fill="#6aaa55" opacity="0.5" />
      <ellipse cx={x + 5 * s} cy={y - 2 * s} rx={9 * s} ry={7 * s} fill="#7ab868" opacity="0.4" />
    </g>
  );
}
