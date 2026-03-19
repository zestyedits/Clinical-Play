import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { VolcanoCanvas } from "./VolcanoCanvas";
import { COOLING_TECHNIQUES, type CoolingSpeed } from "./volcano-data";
import type { AgeMode } from "./volcano-data";

interface CoolingStationProps {
  selectedTechniques: string[];
  appliedCooling: string[];
  currentTemp: number;
  ageMode: AgeMode;
  onSelect: (id: string) => void;
  onDeselect: (id: string) => void;
  onApply: (id: string) => void;
}

const SPEED_TABS: { id: CoolingSpeed; label: string; emoji: string; desc: Record<string, string> }[] = [
  {
    id: "instant",
    label: "Instant",
    emoji: "⚡",
    desc: {
      child: "Quick powers you can use right now!",
      teen: "5-30 second techniques for immediate relief",
      adult: "Rapid interventions (5-30 seconds) for acute escalation",
    },
  },
  {
    id: "short",
    label: "Short",
    emoji: "🕐",
    desc: {
      child: "A few minutes to really cool down",
      teen: "1-5 minute strategies for deeper regulation",
      adult: "Mid-range techniques (1-5 minutes) for sustained regulation",
    },
  },
  {
    id: "extended",
    label: "Extended",
    emoji: "🕰️",
    desc: {
      child: "Bigger activities for full volcano cool-down",
      teen: "5+ minute full reset activities",
      adult: "Extended regulation (5+ minutes) for complete nervous system reset",
    },
  },
];

const CATEGORY_EMOJIS: Record<string, string> = {
  breathing: "🌬️",
  grounding: "🌿",
  movement: "🏃",
  cognitive: "🧠",
  sensory: "🎧",
  social: "👥",
};

export function CoolingStation({
  selectedTechniques,
  appliedCooling,
  currentTemp,
  ageMode,
  onSelect,
  onDeselect,
  onApply,
}: CoolingStationProps) {
  const [activeTab, setActiveTab] = useState<CoolingSpeed>("instant");
  const [expandedTechnique, setExpandedTechnique] = useState<string | null>(null);

  const filteredTechniques = COOLING_TECHNIQUES.filter((t) => t.speed === activeTab);
  const selectedCount = selectedTechniques.length;
  const appliedCount = appliedCooling.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Volcano + stats */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <VolcanoCanvas temperature={currentTemp} width={100} height={85} showLabel={false} compact />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: getTempColor(currentTemp), lineHeight: 1 }}>
            {currentTemp.toFixed(1)}
          </div>
          <div style={{ fontSize: 11, color: "rgba(240,232,216,0.4)", marginTop: 4 }}>
            {selectedCount} selected · {appliedCount} applied
          </div>
          {appliedCount > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              style={{ fontSize: 11, color: "#55a0d8", marginTop: 2, fontWeight: 500 }}
            >
              {ageMode === "child" ? "The volcano is cooling! ❄️" : "Temperature dropping..."}
            </motion.div>
          )}
        </div>
      </div>

      {/* Speed tabs */}
      <div style={{ display: "flex", gap: 4, background: "rgba(0,0,0,0.15)", borderRadius: 12, padding: 3 }}>
        {SPEED_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const count = COOLING_TECHNIQUES.filter((t) => t.speed === tab.id && selectedTechniques.includes(t.id)).length;
          return (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileTap={{ scale: 0.97 }}
              style={{
                flex: 1,
                padding: "8px 4px",
                borderRadius: 10,
                border: "none",
                background: isActive ? "rgba(85,160,216,0.15)" : "transparent",
                cursor: "pointer",
                transition: "all 0.2s",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
            >
              <span style={{ fontSize: 14 }}>{tab.emoji}</span>
              <span style={{
                fontSize: 11, fontWeight: isActive ? 600 : 400,
                color: isActive ? "#55a0d8" : "rgba(240,232,216,0.4)",
              }}>
                {tab.label}
                {count > 0 && <span style={{ marginLeft: 3, fontWeight: 700 }}>({count})</span>}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Tab description */}
      <div style={{ fontSize: 11, color: "rgba(240,232,216,0.35)", textAlign: "center" }}>
        {SPEED_TABS.find((t) => t.id === activeTab)?.desc[ageMode]}
      </div>

      {/* Technique cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filteredTechniques.map((tech) => {
          const isSelected = selectedTechniques.includes(tech.id);
          const isApplied = appliedCooling.includes(tech.id);
          const isExpanded = expandedTechnique === tech.id;

          return (
            <motion.div
              key={tech.id}
              layout
              style={{
                borderRadius: 14,
                border: isSelected
                  ? "1.5px solid rgba(85,160,216,0.4)"
                  : "1px solid rgba(240,232,216,0.08)",
                background: isApplied
                  ? "rgba(85,160,216,0.08)"
                  : isSelected
                  ? "rgba(85,160,216,0.04)"
                  : "rgba(240,232,216,0.02)",
                overflow: "hidden",
                transition: "border-color 0.2s, background 0.2s",
              }}
            >
              {/* Main row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 14px",
                  cursor: "pointer",
                }}
                onClick={() => setExpandedTechnique(isExpanded ? null : tech.id)}
              >
                <span style={{ fontSize: 22 }}>{tech.emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#f0e8d8" }}>{tech.name}</span>
                    <span style={{
                      fontSize: 9,
                      color: "rgba(240,232,216,0.35)",
                      background: "rgba(240,232,216,0.06)",
                      padding: "1px 6px",
                      borderRadius: 4,
                    }}>
                      {tech.duration}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(240,232,216,0.4)", marginTop: 2, lineHeight: 1.3 }}>
                    {tech.description[ageMode]}
                  </div>
                </div>

                {/* Power dots */}
                <div style={{ display: "flex", gap: 2, flexShrink: 0, flexDirection: "column", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: 2 }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        style={{
                          width: 5, height: 5, borderRadius: "50%",
                          background: i < tech.power ? "#55a0d8" : "rgba(240,232,216,0.1)",
                        }}
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: 8, color: "rgba(240,232,216,0.25)" }}>power</span>
                </div>

                {/* Category badge */}
                <span style={{ fontSize: 12, opacity: 0.5 }}>{CATEGORY_EMOJIS[tech.category]}</span>
              </div>

              {/* Expanded instructions */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ overflow: "hidden" }}
                  >
                    <div style={{ padding: "0 14px 14px", borderTop: "1px solid rgba(240,232,216,0.06)" }}>
                      <div style={{ fontSize: 11, color: "rgba(240,232,216,0.45)", fontWeight: 500, marginTop: 10, marginBottom: 6 }}>
                        {ageMode === "child" ? "How to do it:" : "Instructions:"}
                      </div>
                      <ol style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 4 }}>
                        {tech.instructions[ageMode].map((step, i) => (
                          <li key={i} style={{ fontSize: 12, color: "rgba(240,232,216,0.5)", lineHeight: 1.4 }}>
                            {step}
                          </li>
                        ))}
                      </ol>

                      {/* Action buttons */}
                      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                        {!isSelected ? (
                          <motion.button
                            onClick={(e) => { e.stopPropagation(); onSelect(tech.id); }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            style={{
                              flex: 1,
                              padding: "8px 14px",
                              borderRadius: 10,
                              border: "none",
                              background: "rgba(85,160,216,0.2)",
                              color: "#55a0d8",
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            Add to Toolkit ✓
                          </motion.button>
                        ) : (
                          <>
                            {!isApplied && (
                              <motion.button
                                onClick={(e) => { e.stopPropagation(); onApply(tech.id); }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                style={{
                                  flex: 1,
                                  padding: "8px 14px",
                                  borderRadius: 10,
                                  border: "none",
                                  background: "linear-gradient(135deg, #55a0d8, #55a0d8cc)",
                                  color: "#0a0a14",
                                  fontSize: 12,
                                  fontWeight: 700,
                                  cursor: "pointer",
                                }}
                              >
                                Apply to Volcano ❄️
                              </motion.button>
                            )}
                            {isApplied && (
                              <div style={{
                                flex: 1,
                                padding: "8px 14px",
                                borderRadius: 10,
                                background: "rgba(85,160,216,0.1)",
                                color: "#55a0d8",
                                fontSize: 12,
                                fontWeight: 600,
                                textAlign: "center",
                              }}>
                                Applied ✓ · Temp -{tech.power * 0.5}
                              </div>
                            )}
                            <motion.button
                              onClick={(e) => { e.stopPropagation(); onDeselect(tech.id); }}
                              whileHover={{ scale: 1.05 }}
                              style={{
                                padding: "8px 12px",
                                borderRadius: 10,
                                border: "1px solid rgba(240,232,216,0.1)",
                                background: "transparent",
                                color: "rgba(240,232,216,0.4)",
                                fontSize: 12,
                                cursor: "pointer",
                              }}
                            >
                              Remove
                            </motion.button>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Quick select when collapsed */}
              {!isExpanded && (
                <div style={{ display: "flex", gap: 4, padding: "0 14px 10px" }}>
                  {!isSelected ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); onSelect(tech.id); }}
                      style={{
                        padding: "4px 10px",
                        borderRadius: 8,
                        border: "1px solid rgba(85,160,216,0.2)",
                        background: "rgba(85,160,216,0.06)",
                        color: "#55a0d8",
                        fontSize: 10,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      + Add
                    </button>
                  ) : (
                    <div style={{ display: "flex", gap: 4 }}>
                      <span style={{
                        padding: "4px 10px",
                        borderRadius: 8,
                        background: isApplied ? "rgba(85,160,216,0.15)" : "rgba(85,160,216,0.08)",
                        color: "#55a0d8",
                        fontSize: 10,
                        fontWeight: 600,
                      }}>
                        {isApplied ? "✓ Applied" : "✓ Selected"}
                      </span>
                      {!isApplied && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onApply(tech.id); }}
                          style={{
                            padding: "4px 10px",
                            borderRadius: 8,
                            border: "none",
                            background: "rgba(85,160,216,0.25)",
                            color: "#55a0d8",
                            fontSize: 10,
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          Apply ❄️
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function getTempColor(temp: number): string {
  if (temp <= 2) return "#4488aa";
  if (temp <= 4) return "#88aa44";
  if (temp <= 6) return "#d4a833";
  if (temp <= 8) return "#dd6633";
  return "#ee3322";
}
