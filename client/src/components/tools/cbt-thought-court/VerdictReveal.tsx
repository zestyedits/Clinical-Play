import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { AgeMode } from "./CBTThoughtCourt";
import { useAudio } from "../../../lib/stores/useAudio";

interface VerdictRevealProps {
  evidenceFor: string[];
  evidenceAgainst: string[];
  originalThought: string;
  ageMode: AgeMode;
}

const verdictMessages: Record<
  "defense" | "prosecution" | "equal",
  Record<AgeMode, string>
> = {
  defense: {
    child:
      "The evidence shows this thought might not be as true as it feels!",
    teen:
      "Looks like the defense made a stronger case. This thought might not be the full picture.",
    adult:
      "The evidence suggests this automatic thought may not be entirely accurate.",
  },
  prosecution: {
    child:
      "This thought has some truth to it, but let's see if we can find a better way to think about it!",
    teen:
      "The thought has some backing, but that doesn't mean it's the whole story. Let's reframe.",
    adult:
      "While there is supporting evidence, cognitive restructuring can still reveal a more balanced perspective.",
  },
  equal: {
    child:
      "It's a tie! The evidence is mixed, so let's find a fairer way to think about it.",
    teen: "The evidence is split. Time to find a more balanced take.",
    adult:
      "The evidence is equivocal. This presents an opportunity to develop a more nuanced perspective.",
  },
};

export function VerdictReveal({
  evidenceFor,
  evidenceAgainst,
  originalThought,
  ageMode,
}: VerdictRevealProps) {
  const { playSuccess } = useAudio();
  const [showVerdict, setShowVerdict] = useState(false);

  const forCount = evidenceFor.length;
  const againstCount = evidenceAgainst.length;

  const outcome: "defense" | "prosecution" | "equal" =
    againstCount > forCount
      ? "defense"
      : forCount > againstCount
        ? "prosecution"
        : "equal";

  // Tilt angle: positive tilts right (prosecution heavier), negative tilts left (defense heavier)
  const maxTilt = 15;
  const total = forCount + againstCount || 1;
  const tiltAngle = ((forCount - againstCount) / total) * maxTilt;

  useEffect(() => {
    playSuccess();
    const timer = setTimeout(() => setShowVerdict(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "24px",
        padding: "24px",
        width: "100%",
        maxWidth: "640px",
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          fontSize: "28px",
          fontWeight: 700,
          color: "#d4a853",
          textAlign: "center",
          margin: 0,
        }}
      >
        {"\u2696\uFE0F"} The Verdict
      </motion.h2>

      {/* Original thought reminder */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        style={{
          color: "#f0e8d8",
          opacity: 0.7,
          fontStyle: "italic",
          textAlign: "center",
          fontSize: "14px",
          margin: 0,
        }}
      >
        "{originalThought}"
      </motion.p>

      {/* Gavel strike animation */}
      <motion.div
        initial={{ y: -80, scale: 1.5, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 15,
          duration: 0.6,
        }}
        style={{ fontSize: "56px", lineHeight: 1 }}
      >
        {"\uD83D\uDD28"}
      </motion.div>

      {/* Scales of justice visualization */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
        }}
      >
        <svg
          viewBox="0 0 300 200"
          width="300"
          height="200"
          style={{ overflow: "visible" }}
        >
          {/* Center pillar */}
          <rect x="147" y="60" width="6" height="120" fill="#d4a853" rx="3" />
          <circle cx="150" cy="55" r="10" fill="#d4a853" />

          {/* Base */}
          <rect x="110" y="175" width="80" height="8" fill="#d4a853" rx="4" />

          {/* Animated beam */}
          <motion.g
            initial={{ rotate: 0 }}
            animate={{ rotate: tiltAngle }}
            transition={{
              type: "spring",
              stiffness: 80,
              damping: 12,
              delay: 0.8,
            }}
            style={{ originX: "150px", originY: "55px" }}
          >
            {/* Beam */}
            <rect x="20" y="52" width="260" height="6" fill="#d4a853" rx="3" />

            {/* Left pan (prosecution) - chains */}
            <line
              x1="50"
              y1="58"
              x2="30"
              y2="100"
              stroke="#d4a853"
              strokeWidth="2"
            />
            <line
              x1="50"
              y1="58"
              x2="70"
              y2="100"
              stroke="#d4a853"
              strokeWidth="2"
            />

            {/* Left pan */}
            <ellipse cx="50" cy="105" rx="35" ry="8" fill="#c0392b" opacity={0.7} />

            {/* Left count */}
            <text
              x="50"
              y="100"
              textAnchor="middle"
              fill="#fff"
              fontSize="16"
              fontWeight="bold"
            >
              {forCount}
            </text>

            {/* Right pan (defense) - chains */}
            <line
              x1="250"
              y1="58"
              x2="230"
              y2="100"
              stroke="#d4a853"
              strokeWidth="2"
            />
            <line
              x1="250"
              y1="58"
              x2="270"
              y2="100"
              stroke="#d4a853"
              strokeWidth="2"
            />

            {/* Right pan */}
            <ellipse cx="250" cy="105" rx="35" ry="8" fill="#27ae60" opacity={0.7} />

            {/* Right count */}
            <text
              x="250"
              y="100"
              textAnchor="middle"
              fill="#fff"
              fontSize="16"
              fontWeight="bold"
            >
              {againstCount}
            </text>
          </motion.g>
        </svg>

        {/* Labels beneath the scales */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "300px",
            marginTop: "4px",
          }}
        >
          <span
            style={{
              color: "#e74c3c",
              fontSize: "12px",
              fontWeight: 600,
              textAlign: "center",
              width: "100px",
            }}
          >
            Prosecution
          </span>
          <span style={{ flex: 1 }} />
          <span
            style={{
              color: "#2ecc71",
              fontSize: "12px",
              fontWeight: 600,
              textAlign: "center",
              width: "100px",
            }}
          >
            Defense
          </span>
        </div>
      </motion.div>

      {/* Verdict text (appears after gavel) */}
      {showVerdict && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            background: "rgba(212, 168, 83, 0.15)",
            border: "1px solid rgba(212, 168, 83, 0.4)",
            borderRadius: "12px",
            padding: "20px",
            textAlign: "center",
            width: "100%",
          }}
        >
          <p
            style={{
              color: "#f0e8d8",
              fontSize: "16px",
              lineHeight: 1.6,
              margin: 0,
              fontWeight: 500,
            }}
          >
            {verdictMessages[outcome][ageMode]}
          </p>
        </motion.div>
      )}

      {/* Evidence summary columns */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
          width: "100%",
        }}
      >
        {/* Prosecution evidence */}
        <div
          style={{
            background: "rgba(231, 76, 60, 0.1)",
            border: "1px solid rgba(231, 76, 60, 0.3)",
            borderRadius: "10px",
            padding: "14px",
          }}
        >
          <h4
            style={{
              color: "#e74c3c",
              fontSize: "13px",
              fontWeight: 700,
              margin: "0 0 10px 0",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Prosecution ({forCount})
          </h4>
          <ul style={{ margin: 0, paddingLeft: "16px", listStyleType: "disc" }}>
            {evidenceFor.map((item, i) => (
              <li
                key={i}
                style={{
                  color: "#f0e8d8",
                  fontSize: "13px",
                  lineHeight: 1.5,
                  marginBottom: "6px",
                  opacity: 0.85,
                }}
              >
                {item}
              </li>
            ))}
            {evidenceFor.length === 0 && (
              <li
                style={{
                  color: "#f0e8d8",
                  fontSize: "13px",
                  opacity: 0.5,
                  fontStyle: "italic",
                }}
              >
                No evidence presented
              </li>
            )}
          </ul>
        </div>

        {/* Defense evidence */}
        <div
          style={{
            background: "rgba(46, 204, 113, 0.1)",
            border: "1px solid rgba(46, 204, 113, 0.3)",
            borderRadius: "10px",
            padding: "14px",
          }}
        >
          <h4
            style={{
              color: "#2ecc71",
              fontSize: "13px",
              fontWeight: 700,
              margin: "0 0 10px 0",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Defense ({againstCount})
          </h4>
          <ul style={{ margin: 0, paddingLeft: "16px", listStyleType: "disc" }}>
            {evidenceAgainst.map((item, i) => (
              <li
                key={i}
                style={{
                  color: "#f0e8d8",
                  fontSize: "13px",
                  lineHeight: 1.5,
                  marginBottom: "6px",
                  opacity: 0.85,
                }}
              >
                {item}
              </li>
            ))}
            {evidenceAgainst.length === 0 && (
              <li
                style={{
                  color: "#f0e8d8",
                  fontSize: "13px",
                  opacity: 0.5,
                  fontStyle: "italic",
                }}
              >
                No evidence presented
              </li>
            )}
          </ul>
        </div>
      </motion.div>
    </div>
  );
}
