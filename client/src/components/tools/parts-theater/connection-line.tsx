import { motion } from "framer-motion";

interface ConnectionLineProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  style: "solid" | "dashed";
  isPreview?: boolean;
}

export function ConnectionLine({ x1, y1, x2, y2, style, isPreview }: ConnectionLineProps) {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const offset = Math.sqrt(dx * dx + dy * dy) * 0.15;
  const cx = midX - dy * 0.15;
  const cy = midY + dx * 0.15;
  const d = `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;

  return (
    <motion.path
      d={d}
      fill="none"
      stroke={isPreview ? "rgba(212,175,55,0.5)" : "rgba(27,42,74,0.35)"}
      strokeWidth={isPreview ? 1.5 : 2}
      strokeDasharray={style === "dashed" ? "6 4" : undefined}
      strokeLinecap="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: isPreview ? 0.6 : 0.4 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    />
  );
}
