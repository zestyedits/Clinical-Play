import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { AgeMode, LadderRung } from "./ladder-data";
import { getSudsColor } from "./ladder-data";

interface LadderBuilderProps {
  rungs: LadderRung[];
  onAddRung: (desc: string, suds: number) => void;
  onRemoveRung: (id: string) => void;
  onMoveRung: (id: string, dir: "up" | "down") => void;
  fearTopic: string;
  ageMode: AgeMode;
}

export function LadderBuilder({ rungs, onAddRung, onRemoveRung, onMoveRung, fearTopic, ageMode }: LadderBuilderProps) {
  const [newDesc, setNewDesc] = useState("");
  const [newSuds, setNewSuds] = useState(50);

  const sortedRungs = [...rungs].sort((a, b) => a.suds - b.suds);

  const handleAdd = () => {
    if (newDesc.trim().length === 0) return;
    onAddRung(newDesc.trim(), newSuds);
    setNewDesc("");
    setNewSuds(50);
  };

  const sudsColor = getSudsColor(newSuds);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div
        style={{
          background: "rgba(100, 168, 212, 0.06)",
          borderRadius: 12,
          padding: "11px 14px",
          borderLeft: "3px solid rgba(100, 168, 212, 0.3)",
        }}
      >
        <p style={{ margin: 0, fontSize: 12, lineHeight: 1.7, color: "rgba(232, 220, 200, 0.72)" }}>
          {ageMode === "child"
            ? `Add situations about "${fearTopic}" from a little scary (bottom) to very scary (top). Start with easy ones!`
            : ageMode === "teen"
            ? `Add situations related to "${fearTopic}". Rate each one 0\u2013100. The ladder goes from easiest at the bottom to hardest at the top.`
            : `Build your fear hierarchy for "${fearTopic}". Add at least 3 situations rated by SUDS (0\u2013100). The ladder is sorted easiest to hardest automatically.`}
        </p>
      </div>

      <div
        style={{
          background: "rgba(232, 220, 200, 0.04)",
          borderRadius: 14,
          padding: "14px",
          border: "1px solid rgba(232, 220, 200, 0.08)",
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(232, 220, 200, 0.5)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          Add a Rung
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input
            type="text"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
            placeholder={
              ageMode === "child"
                ? "What is a situation that makes you a little scared?"
                : "Describe the situation..."
            }
            style={{
              width: "100%",
              padding: "10px 12px",
              background: "rgba(232, 220, 200, 0.05)",
              border: "1px solid rgba(232, 220, 200, 0.12)",
              borderRadius: 10,
              color: "#e8dcc8",
              fontSize: 13,
              fontFamily: "Inter, sans-serif",
              outline: "none",
              boxSizing: "border-box",
            }}
          />

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "rgba(232, 220, 200, 0.55)" }}>
                {ageMode === "child" ? "How scary is this?" : "SUDS rating:"}
              </span>
              <span style={{ fontSize: 15, fontWeight: 700, color: sudsColor, fontFamily: "'Lora', Georgia, serif" }}>
                {newSuds}
              </span>
            </div>
            <div style={{ position: "relative" }}>
              <div
                style={{
                  height: 6,
                  borderRadius: 3,
                  background: "linear-gradient(to right, #60c480 0%, #d4b44c 40%, #d47060 70%, #c03030 100%)",
                  marginBottom: 4,
                }}
              />
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={newSuds}
                onChange={(e) => setNewSuds(parseInt(e.target.value))}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  opacity: 0,
                  height: 20,
                  cursor: "pointer",
                  margin: 0,
                }}
              />
            </div>
          </div>

          <motion.button
            type="button"
            onClick={handleAdd}
            disabled={newDesc.trim().length === 0}
            whileHover={newDesc.trim().length > 0 ? { scale: 1.02 } : {}}
            whileTap={newDesc.trim().length > 0 ? { scale: 0.97 } : {}}
            style={{
              padding: "10px",
              borderRadius: 10,
              border: "none",
              background: newDesc.trim().length > 0
                ? "linear-gradient(135deg, #2a5a7c, #3a7a9c)"
                : "rgba(232, 220, 200, 0.06)",
              color: newDesc.trim().length > 0 ? "#e8dcc8" : "rgba(232, 220, 200, 0.3)",
              fontSize: 13,
              fontWeight: 600,
              cursor: newDesc.trim().length > 0 ? "pointer" : "not-allowed",
              fontFamily: "Inter, sans-serif",
              transition: "all 0.2s",
            }}
          >
            + Add Rung
          </motion.button>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, color: "rgba(232, 220, 200, 0.4)" }}>
          {ageMode === "child" ? "Hardest at the top, easiest at the bottom" : "Sorted by SUDS — lowest at bottom, highest at top"}
        </span>
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: rungs.length >= 3 ? "#60c480" : "rgba(232, 220, 200, 0.4)",
            padding: "3px 10px",
            borderRadius: 20,
            background: rungs.length >= 3 ? "rgba(96, 196, 128, 0.1)" : "rgba(232, 220, 200, 0.05)",
            border: `1px solid ${rungs.length >= 3 ? "rgba(96, 196, 128, 0.25)" : "rgba(232, 220, 200, 0.08)"}`,
          }}
        >
          {rungs.length} / 3+ rungs
        </span>
      </div>

      {sortedRungs.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "28px 16px",
            borderRadius: 14,
            border: "1px dashed rgba(232, 220, 200, 0.1)",
            color: "rgba(232, 220, 200, 0.3)",
            fontSize: 13,
          }}
        >
          <div style={{ fontSize: 28, marginBottom: 8 }}>{"\uD83E\uDE9C"}</div>
          Add at least 3 rungs to build your ladder
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {[...sortedRungs].reverse().map((rung, reversedIdx) => {
            const rungNumber = sortedRungs.length - reversedIdx;
            const rungColor = getSudsColor(rung.suds);
            const originalIdx = sortedRungs.findIndex((r) => r.id === rung.id);

            return (
              <AnimatePresence key={rung.id}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.25 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0,
                    marginBottom: 4,
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      textAlign: "center",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "rgba(232, 220, 200, 0.35)",
                      flexShrink: 0,
                    }}
                  >
                    {rungNumber}
                  </div>
                  <div
                    style={{
                      flex: 1,
                      padding: "10px 12px",
                      borderRadius: 10,
                      borderLeft: `4px solid ${rungColor}`,
                      background: `${rungColor}08`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 8,
                    }}
                  >
                    <span style={{ fontSize: 13, color: "#e8dcc8", flex: 1, lineHeight: 1.4 }}>
                      {rung.description}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: 10,
                          background: `${rungColor}20`,
                          color: rungColor,
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        {rung.suds}
                      </span>
                      <button
                        type="button"
                        onClick={() => onMoveRung(rung.id, "up")}
                        disabled={originalIdx === sortedRungs.length - 1}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "rgba(232, 220, 200, 0.4)",
                          fontSize: 12,
                          cursor: "pointer",
                          padding: "2px 4px",
                          opacity: originalIdx === sortedRungs.length - 1 ? 0.2 : 1,
                        }}
                      >
                        {"\u2191"}
                      </button>
                      <button
                        type="button"
                        onClick={() => onMoveRung(rung.id, "down")}
                        disabled={originalIdx === 0}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "rgba(232, 220, 200, 0.4)",
                          fontSize: 12,
                          cursor: "pointer",
                          padding: "2px 4px",
                          opacity: originalIdx === 0 ? 0.2 : 1,
                        }}
                      >
                        {"\u2193"}
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoveRung(rung.id)}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "rgba(212, 112, 96, 0.5)",
                          fontSize: 14,
                          cursor: "pointer",
                          padding: "2px 4px",
                          lineHeight: 1,
                        }}
                      >
                        {"\u00D7"}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            );
          })}
        </div>
      )}
    </div>
  );
}
