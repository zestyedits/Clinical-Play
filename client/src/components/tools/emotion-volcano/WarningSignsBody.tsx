import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BODY_REGIONS } from "./volcano-data";
import type { AgeMode } from "./volcano-data";
import type { WarningSigns } from "./EmotionVolcano";

interface WarningSignsBodyProps {
  warningSigns: WarningSigns[];
  ageMode: AgeMode;
  onToggle: (regionId: string, sensation: string) => void;
}

export function WarningSignsBody({ warningSigns, ageMode, onToggle }: WarningSignsBodyProps) {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const activeRegion = BODY_REGIONS.find((r) => r.id === selectedRegion);
  const selectedSigns = warningSigns.find((w) => w.regionId === selectedRegion)?.sensations ?? [];
  const totalSigns = warningSigns.reduce((sum, w) => sum + w.sensations.length, 0);

  return (
    <div style={{ display: "flex", gap: 16, minHeight: 0 }}>
      {/* Body silhouette */}
      <div style={{ flex: "0 0 auto", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <svg width={160} height={280} viewBox="0 0 100 100" style={{ overflow: "visible" }}>
          <defs>
            <radialGradient id="body-glow">
              <stop offset="0%" stopColor="rgba(212,85,128,0.3)" />
              <stop offset="100%" stopColor="rgba(212,85,128,0)" />
            </radialGradient>
            <filter id="region-glow">
              <feGaussianBlur stdDeviation="2" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Body outline — simplified humanoid silhouette */}
          <g opacity={0.2} stroke="rgba(240,232,216,0.3)" strokeWidth={0.5} fill="none">
            {/* Head */}
            <circle cx={50} cy={8} r={7} />
            {/* Neck */}
            <line x1={50} y1={15} x2={50} y2={20} />
            {/* Torso */}
            <path d="M 35 22 Q 35 20 38 20 L 62 20 Q 65 20 65 22 L 65 52 Q 65 55 62 55 L 38 55 Q 35 55 35 52 Z" />
            {/* Left arm */}
            <path d="M 35 22 L 22 40 L 18 55" />
            {/* Right arm */}
            <path d="M 65 22 L 78 40 L 82 55" />
            {/* Left leg */}
            <path d="M 42 55 L 38 75 L 36 92" />
            {/* Right leg */}
            <path d="M 58 55 L 62 75 L 64 92" />
          </g>

          {/* Clickable regions */}
          {BODY_REGIONS.map((region) => {
            const isActive = warningSigns.some((w) => w.regionId === region.id && w.sensations.length > 0);
            const isSelected = selectedRegion === region.id;
            const signCount = warningSigns.find((w) => w.regionId === region.id)?.sensations.length ?? 0;

            return (
              <g key={region.id}>
                {/* Glow when active */}
                {isActive && (
                  <motion.ellipse
                    cx={region.cx}
                    cy={region.cy}
                    rx={region.rx + 3}
                    ry={region.ry + 3}
                    fill="url(#body-glow)"
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}

                {/* Clickable area */}
                <motion.ellipse
                  cx={region.cx}
                  cy={region.cy}
                  rx={region.rx}
                  ry={region.ry}
                  fill={isActive ? "rgba(212,85,128,0.2)" : "rgba(240,232,216,0.05)"}
                  stroke={isSelected ? "#d45580" : isActive ? "rgba(212,85,128,0.4)" : "rgba(240,232,216,0.1)"}
                  strokeWidth={isSelected ? 1.5 : 0.8}
                  style={{ cursor: "pointer" }}
                  whileHover={{ fill: "rgba(212,85,128,0.15)", stroke: "rgba(212,85,128,0.5)" }}
                  onClick={() => setSelectedRegion(region.id === selectedRegion ? null : region.id)}
                  filter={isActive ? "url(#region-glow)" : undefined}
                />

                {/* Sign count badge */}
                {signCount > 0 && (
                  <g>
                    <circle
                      cx={region.cx + region.rx - 1}
                      cy={region.cy - region.ry + 1}
                      r={4}
                      fill="#d45580"
                    />
                    <text
                      x={region.cx + region.rx - 1}
                      y={region.cy - region.ry + 2.5}
                      textAnchor="middle"
                      fontSize={4.5}
                      fontWeight={700}
                      fill="#fff"
                    >
                      {signCount}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        <div style={{ fontSize: 10, color: "rgba(240,232,216,0.3)", textAlign: "center", marginTop: 4 }}>
          {ageMode === "child" ? "Tap where you feel it!" : "Tap a body area"}
        </div>
        <div style={{ fontSize: 11, color: "#d45580", fontWeight: 600, marginTop: 4 }}>
          {totalSigns} sign{totalSigns !== 1 ? "s" : ""} mapped
        </div>
      </div>

      {/* Region detail panel */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <AnimatePresence mode="wait">
          {activeRegion ? (
            <motion.div
              key={activeRegion.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Region header */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 24 }}>{activeRegion.emoji}</span>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#f0e8d8" }}>{activeRegion.label}</div>
                  <div style={{ fontSize: 11, color: "rgba(240,232,216,0.45)", lineHeight: 1.3 }}>
                    {activeRegion.description[ageMode]}
                  </div>
                </div>
              </div>

              {/* Sensation toggles */}
              <div style={{ fontSize: 11, color: "rgba(240,232,216,0.4)", marginBottom: 8, fontWeight: 500 }}>
                {ageMode === "child" ? "What does it feel like?" : "Select sensations you experience:"}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {activeRegion.sensations.map((sensation) => {
                  const isSelected = selectedSigns.includes(sensation);
                  return (
                    <motion.button
                      key={sensation}
                      onClick={() => onToggle(activeRegion.id, sensation)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "10px 14px",
                        borderRadius: 10,
                        border: isSelected ? "1.5px solid rgba(212,85,128,0.5)" : "1px solid rgba(240,232,216,0.08)",
                        background: isSelected ? "rgba(212,85,128,0.1)" : "rgba(240,232,216,0.03)",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        textAlign: "left",
                        width: "100%",
                      }}
                    >
                      <motion.div
                        animate={{
                          background: isSelected ? "#d45580" : "rgba(240,232,216,0.1)",
                          borderColor: isSelected ? "#d45580" : "rgba(240,232,216,0.2)",
                        }}
                        style={{
                          width: 18, height: 18,
                          borderRadius: 5,
                          border: "1.5px solid",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 11,
                          color: "#fff",
                          flexShrink: 0,
                        }}
                      >
                        {isSelected ? "✓" : ""}
                      </motion.div>
                      <span style={{
                        fontSize: 13,
                        fontWeight: isSelected ? 600 : 400,
                        color: isSelected ? "#d45580" : "rgba(240,232,216,0.55)",
                      }}>
                        {sensation}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                textAlign: "center",
                padding: 20,
              }}
            >
              <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.5 }}>🫀</div>
              <p style={{ fontSize: 13, color: "rgba(240,232,216,0.4)", lineHeight: 1.5, maxWidth: 200 }}>
                {ageMode === "child"
                  ? "Tap on your body picture to show where you feel the angry feelings!"
                  : "Tap a body region on the left to identify your physical warning signs."}
              </p>

              {/* Quick summary of already mapped signs */}
              {warningSigns.length > 0 && (
                <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 4, justifyContent: "center" }}>
                  {warningSigns.map((w) => {
                    const region = BODY_REGIONS.find((r) => r.id === w.regionId)!;
                    return (
                      <motion.button
                        key={w.regionId}
                        onClick={() => setSelectedRegion(w.regionId)}
                        whileHover={{ scale: 1.05 }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          padding: "4px 10px",
                          borderRadius: 8,
                          background: "rgba(212,85,128,0.1)",
                          border: "1px solid rgba(212,85,128,0.2)",
                          cursor: "pointer",
                          fontSize: 11,
                          color: "#d45580",
                        }}
                      >
                        <span>{region.emoji}</span>
                        <span>{region.label}</span>
                        <span style={{ fontWeight: 700 }}>({w.sensations.length})</span>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
