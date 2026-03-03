import { useMemo } from "react";
import type { HouseLayer } from "./DBTHouseBuilder";

interface HouseCanvasProps {
  layers: HouseLayer[];
  onItemClick: (layerId: string, itemId: string) => void;
  allCompleted: boolean;
}

const LAYER_HEIGHT = 80;
const HOUSE_WIDTH = 240;
const DEPTH_OFFSET = 20;
const BASE_X = 130;
const GROUND_Y = 400;

export function HouseCanvas({
  layers,
  onItemClick,
  allCompleted,
}: HouseCanvasProps) {
  const placedLayers = layers.filter((l) => l.placed);

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
          filter: "drop-shadow(0 4px 20px rgba(0,0,0,0.08))",
        }}
        preserveAspectRatio="xMidYMax meet"
      >
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c4dde8" />
            <stop offset="60%" stopColor="#d8e8d8" />
            <stop offset="100%" stopColor="#c8d8c0" />
          </linearGradient>
          <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8baa78" />
            <stop offset="100%" stopColor="#6d8f5a" />
          </linearGradient>
          <linearGradient id="groundShadow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(0,0,0,0.08)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </linearGradient>
          <filter id="softShadow">
            <feDropShadow
              dx="3"
              dy="5"
              stdDeviation="4"
              floodOpacity="0.12"
            />
          </filter>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect x="0" y="0" width="520" height="500" fill="url(#sky)" rx="16" />

        {allCompleted && (
          <g>
            <circle cx="440" cy="55" r="35" fill="#fff8dd" opacity="0.7" />
            <circle cx="440" cy="55" r="25" fill="#ffee88" opacity="0.9" />
            <circle cx="440" cy="55" r="16" fill="#fff5aa" />
          </g>
        )}

        <g opacity="0.5">
          <ellipse cx="70" cy="60" rx="40" ry="20" fill="#e8f0e8" />
          <ellipse cx="160" cy="45" rx="55" ry="22" fill="#e0eae0" />
          <ellipse cx="120" cy="50" rx="35" ry="16" fill="#dde8dd" />
        </g>
        <g opacity="0.4">
          <ellipse cx="380" cy="70" rx="45" ry="18" fill="#e4ece4" />
          <ellipse cx="440" cy="60" rx="30" ry="14" fill="#dde8dd" />
        </g>

        <ellipse cx="75" cy={GROUND_Y - 5} rx="22" ry="50" fill="#6aaa55" opacity="0.7" />
        <ellipse cx="75" cy={GROUND_Y - 15} rx="18" ry="38" fill="#5a9948" opacity="0.8" />
        <ellipse cx="75" cy={GROUND_Y - 25} rx="14" ry="28" fill="#4a8838" opacity="0.6" />
        <rect x="73" y={GROUND_Y - 5} width="4" height="28" fill="#8b7a5a" rx="2" />

        <ellipse cx="455" cy={GROUND_Y} rx="18" ry="42" fill="#6aaa55" opacity="0.7" />
        <ellipse cx="455" cy={GROUND_Y - 10} rx="15" ry="32" fill="#5a9948" opacity="0.8" />
        <rect x="453" y={GROUND_Y} width="4" height="22" fill="#8b7a5a" rx="2" />

        <ellipse cx="480" cy={GROUND_Y + 5} rx="10" ry="22" fill="#7aaa68" opacity="0.5" />
        <rect x="479" y={GROUND_Y + 5} width="3" height="14" fill="#8b7a5a" rx="1" />

        <ellipse
          cx="260"
          cy={GROUND_Y + 18}
          rx="230"
          ry="45"
          fill="url(#ground)"
        />
        <ellipse
          cx="260"
          cy={GROUND_Y + 14}
          rx="220"
          ry="10"
          fill="url(#groundShadow)"
        />

        {placedLayers.length === 0 && (
          <g>
            <rect
              x="160"
              y={GROUND_Y - 55}
              width="200"
              height="40"
              rx="10"
              fill="rgba(45, 40, 35, 0.6)"
            />
            <text
              x="260"
              y={GROUND_Y - 30}
              textAnchor="middle"
              fill="rgba(240, 232, 216, 0.7)"
              fontSize="12"
              fontFamily="Inter, sans-serif"
              fontWeight="500"
            >
              Place your first layer to begin
            </text>
          </g>
        )}

        {placedLayers.length > 0 && (
          <ellipse
            cx={BASE_X + HOUSE_WIDTH / 2 + DEPTH_OFFSET / 2}
            cy={GROUND_Y + 5}
            rx={HOUSE_WIDTH / 2 + 20}
            ry="8"
            fill="rgba(0,0,0,0.08)"
          />
        )}

        {placedLayers.map((layer) => {
          const yBase = GROUND_Y - (layer.floor + 1) * LAYER_HEIGHT;
          return (
            <g key={layer.id}>
              <IsometricLayer
                layer={layer}
                x={BASE_X}
                y={yBase}
                width={HOUSE_WIDTH}
                height={LAYER_HEIGHT}
                depth={DEPTH_OFFSET}
                onItemClick={onItemClick}
              />
            </g>
          );
        })}

        {placedLayers.length > 0 && (
          <RoofGraphic
            x={BASE_X}
            y={GROUND_Y - placedLayers.length * LAYER_HEIGHT}
            width={HOUSE_WIDTH}
            depth={DEPTH_OFFSET}
            complete={placedLayers.length === 4}
            allDone={allCompleted}
          />
        )}
      </svg>
    </div>
  );
}

function RoofGraphic({
  x,
  y,
  width,
  depth,
  complete,
  allDone,
}: {
  x: number;
  y: number;
  width: number;
  depth: number;
  complete: boolean;
  allDone: boolean;
}) {
  const peakX = x + width / 2 + depth / 2;
  const peakY = y - 45;
  const roofColor = allDone ? "#7aaa68" : complete ? "#b89a6e" : "#c4a882";
  const roofSideColor = allDone ? "#5a8a48" : complete ? "#9a7e52" : "#a88e6a";

  return (
    <g filter="url(#softShadow)">
      <polygon
        points={`${x - 8},${y} ${peakX},${peakY} ${x + width / 2 + depth / 2},${y}`}
        fill={roofColor}
        stroke="rgba(160, 146, 107, 0.5)"
        strokeWidth="1"
      />
      <polygon
        points={`${x + width / 2 + depth / 2},${y} ${peakX},${peakY} ${x + width + depth + 8},${y}`}
        fill={roofSideColor}
        stroke="rgba(160, 146, 107, 0.5)"
        strokeWidth="1"
      />
      {allDone && (
        <text
          x={peakX}
          y={peakY - 10}
          textAnchor="middle"
          fontSize="20"
        >
          {"\u2728"}
        </text>
      )}
    </g>
  );
}

function IsometricLayer({
  layer,
  x,
  y,
  width,
  height,
  depth,
  onItemClick,
}: {
  layer: HouseLayer;
  x: number;
  y: number;
  width: number;
  height: number;
  depth: number;
  onItemClick: (layerId: string, itemId: string) => void;
}) {
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

  const topColor = useMemo(() => {
    const r = parseInt(layer.color.slice(1, 3), 16);
    const g = parseInt(layer.color.slice(3, 5), 16);
    const b = parseInt(layer.color.slice(5, 7), 16);
    return `rgb(${Math.min(255, r + 40)}, ${Math.min(255, g + 40)}, ${Math.min(255, b + 40)})`;
  }, [layer.color]);

  const windowColor = layer.floor === 0 ? "none" : "#c8dde8";
  const trimColor = "rgba(160, 146, 107, 0.6)";

  const itemSpacing = width / (layer.items.length + 1);

  return (
    <g
      filter="url(#softShadow)"
      style={{ animation: "fadeSlideUp 0.4s ease" }}
    >
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={lighterColor}
        stroke={trimColor}
        strokeWidth="1.5"
        rx="3"
      />

      <polygon
        points={`${x + width},${y} ${x + width + depth},${y - depth} ${x + width + depth},${y + height - depth} ${x + width},${y + height}`}
        fill={darkerColor}
        stroke={trimColor}
        strokeWidth="1"
      />

      <polygon
        points={`${x},${y} ${x + depth},${y - depth} ${x + width + depth},${y - depth} ${x + width},${y}`}
        fill={topColor}
        stroke={trimColor}
        strokeWidth="1"
      />

      <rect x={x} y={y} width={width} height={3} fill={trimColor} rx="1" />
      <rect
        x={x}
        y={y + height - 3}
        width={width}
        height={3}
        fill={trimColor}
        rx="1"
      />

      {layer.floor > 0 && (
        <>
          <g>
            <rect
              x={x + 22}
              y={y + 16}
              width={24}
              height={34}
              fill={windowColor}
              stroke={trimColor}
              strokeWidth="1.2"
              rx="2"
              opacity="0.75"
            />
            <line
              x1={x + 34}
              y1={y + 16}
              x2={x + 34}
              y2={y + 50}
              stroke={trimColor}
              strokeWidth="0.7"
            />
            <line
              x1={x + 22}
              y1={y + 33}
              x2={x + 46}
              y2={y + 33}
              stroke={trimColor}
              strokeWidth="0.7"
            />
          </g>
          <g>
            <rect
              x={x + width - 46}
              y={y + 16}
              width={24}
              height={34}
              fill={windowColor}
              stroke={trimColor}
              strokeWidth="1.2"
              rx="2"
              opacity="0.75"
            />
            <line
              x1={x + width - 34}
              y1={y + 16}
              x2={x + width - 34}
              y2={y + 50}
              stroke={trimColor}
              strokeWidth="0.7"
            />
            <line
              x1={x + width - 46}
              y1={y + 33}
              x2={x + width - 22}
              y2={y + 33}
              stroke={trimColor}
              strokeWidth="0.7"
            />
          </g>
        </>
      )}

      {layer.floor === 0 && (
        <g>
          <rect
            x={x + width / 2 - 14}
            y={y + height - 44}
            width={28}
            height={41}
            fill="#6b5b4a"
            stroke={trimColor}
            strokeWidth="1.2"
            rx="2"
          />
          <rect
            x={x + width / 2 - 14}
            y={y + height - 44}
            width={28}
            height={3}
            fill="rgba(160, 146, 107, 0.4)"
            rx="1"
          />
          <circle
            cx={x + width / 2 + 8}
            cy={y + height - 24}
            r="2.5"
            fill="#a0926b"
          />
        </g>
      )}

      {layer.items.map((item, i) => {
        const ix = x + itemSpacing * (i + 1);
        const iy = y + height / 2 + 2;

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
                r={22}
                fill="none"
                stroke={layer.accentColor}
                strokeWidth="1.5"
                opacity="0.3"
              >
                <animate
                  attributeName="r"
                  values="22;26;22"
                  dur="2.5s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.3;0.1;0.3"
                  dur="2.5s"
                  repeatCount="indefinite"
                />
              </circle>
            )}
            <circle
              cx={ix}
              cy={iy}
              r={17}
              fill={
                item.completed
                  ? "rgba(107, 139, 107, 0.7)"
                  : "rgba(240, 232, 216, 0.15)"
              }
              stroke={item.completed ? "#6b8b6b" : layer.accentColor}
              strokeWidth={2}
            />
            <text
              x={ix}
              y={iy + 1}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="14"
              style={{ pointerEvents: "none" }}
            >
              {item.completed ? "\u2705" : item.icon}
            </text>
            <text
              x={ix}
              y={iy + 28}
              textAnchor="middle"
              fontSize="7.5"
              fill="rgba(240, 232, 216, 0.75)"
              fontFamily="Inter, sans-serif"
              fontWeight="500"
              style={{ pointerEvents: "none" }}
            >
              {item.name}
            </text>
          </g>
        );
      })}

      <text
        x={x + width / 2}
        y={y - depth - 6}
        textAnchor="middle"
        fontSize="10.5"
        fill="rgba(60, 55, 45, 0.65)"
        fontFamily="Inter, sans-serif"
        fontWeight="600"
      >
        {layer.name}
      </text>
    </g>
  );
}
