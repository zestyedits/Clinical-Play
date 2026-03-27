import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { AgeMode, SenseEntry } from "./meadow-data";
import { SENSE_CATEGORIES } from "./meadow-data";

interface SenseObservationProps {
  senseEntries: SenseEntry[];
  onUpdateSense: (senseId: string, items: string[]) => void;
  ageMode: AgeMode;
}

export function SenseObservation({ senseEntries, onUpdateSense, ageMode }: SenseObservationProps) {
  const [expandedId, setExpandedId] = useState<string | null>("see");
  const [draftValues, setDraftValues] = useState<Record<string, string[]>>(() => {
    const init: Record<string, string[]> = {};
    senseEntries.forEach((e) => { init[e.senseId] = [...e.items]; });
    return init;
  });

  const allComplete = SENSE_CATEGORIES.every((c) => {
    const entry = senseEntries.find((e) => e.senseId === c.id);
    return (entry?.items.filter((i) => i.trim() !== "").length ?? 0) >= 1;
  });

  const completedCount = SENSE_CATEGORIES.filter((c) => {
    const entry = senseEntries.find((e) => e.senseId === c.id);
    return (entry?.items.filter((i) => i.trim() !== "").length ?? 0) >= 1;
  }).length;

  const handleItemChange = (senseId: string, index: number, value: string) => {
    const current = draftValues[senseId] ?? [];
    const updated = [...current];
    updated[index] = value;
    setDraftValues((prev) => ({ ...prev, [senseId]: updated }));
    onUpdateSense(senseId, updated);
  };

  const handleAddItem = (senseId: string, maxCount: number) => {
    const current = draftValues[senseId] ?? [];
    if (current.length < maxCount) {
      const updated = [...current, ""];
      setDraftValues((prev) => ({ ...prev, [senseId]: updated }));
      onUpdateSense(senseId, updated);
    }
  };

  const handleRemoveItem = (senseId: string, index: number) => {
    const current = draftValues[senseId] ?? [];
    const updated = current.filter((_, i) => i !== index);
    setDraftValues((prev) => ({ ...prev, [senseId]: updated }));
    onUpdateSense(senseId, updated);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(255,255,255,0.55)",
          borderRadius: 12,
          padding: "8px 14px",
          border: "1px solid rgba(66,165,245,0.2)",
        }}
      >
        <span style={{ fontSize: 12, color: "rgba(26,58,46,0.65)", fontWeight: 500 }}>
          {ageMode === "child"
            ? "Expand each sense and write what you notice"
            : ageMode === "teen"
            ? "Complete all 5 senses to ground yourself"
            : "Enumerate present-moment sensory observations"}
        </span>
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: completedCount >= 5 ? "#42a5f5" : "rgba(26,58,46,0.5)",
          }}
        >
          {completedCount}/5{completedCount >= 5 ? " \u2713" : ""}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {SENSE_CATEGORIES.map((cat, catIdx) => {
          const entry = senseEntries.find((e) => e.senseId === cat.id);
          const items = draftValues[cat.id] ?? [];
          const filledCount = items.filter((i) => i.trim() !== "").length;
          const isCatComplete = filledCount >= 1;
          const isExpanded = expandedId === cat.id;

          return (
            <div
              key={cat.id}
              style={{
                background: "rgba(255,255,255,0.65)",
                borderRadius: 12,
                border: `1px solid ${isCatComplete ? cat.color + "50" : "rgba(76,175,138,0.15)"}`,
                overflow: "hidden",
                transition: "border 0.2s",
              }}
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : cat.id)}
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  padding: "12px 14px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  fontFamily: "Inter, sans-serif",
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: `${cat.color}18`,
                    border: `2px solid ${cat.color}40`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    flexShrink: 0,
                  }}
                >
                  {cat.emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1a3a2e", marginBottom: 1 }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        background: cat.color,
                        color: "#fff",
                        fontSize: 10,
                        fontWeight: 800,
                        marginRight: 6,
                      }}
                    >
                      {cat.count}
                    </span>
                    {cat.label[ageMode]}
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(26,58,46,0.55)" }}>
                    {cat.prompt[ageMode]}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                  {isCatComplete && (
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        background: cat.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 10,
                        color: "#fff",
                      }}
                    >
                      {"\u2713"}
                    </div>
                  )}
                  <span style={{ fontSize: 14, color: "rgba(26,58,46,0.4)", transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform 0.2s", display: "inline-block" }}>
                    {"\u2303"}
                  </span>
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{ overflow: "hidden" }}
                  >
                    <div style={{ padding: "0 14px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
                      {Array.from({ length: Math.max(items.length, 1) }, (_, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div
                            style={{
                              width: 22,
                              height: 22,
                              borderRadius: "50%",
                              background: items[i]?.trim() ? cat.color : "rgba(26,58,46,0.08)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 10,
                              fontWeight: 700,
                              color: items[i]?.trim() ? "#fff" : "rgba(26,58,46,0.3)",
                              flexShrink: 0,
                              transition: "background 0.2s",
                            }}
                          >
                            {i + 1}
                          </div>
                          <input
                            type="text"
                            value={items[i] ?? ""}
                            onChange={(e) => handleItemChange(cat.id, i, e.target.value)}
                            placeholder={`${cat.label[ageMode]} #${i + 1}`}
                            autoFocus={i === items.length - 1 && items.length > 0}
                            style={{
                              flex: 1,
                              border: "1px solid rgba(76,175,138,0.2)",
                              borderRadius: 8,
                              background: "rgba(255,255,255,0.8)",
                              padding: "7px 10px",
                              fontSize: 12,
                              color: "#1a3a2e",
                              fontFamily: "Inter, sans-serif",
                              outline: "none",
                            }}
                          />
                          {items.length > 1 && (
                            <button
                              onClick={() => handleRemoveItem(cat.id, i)}
                              style={{
                                background: "transparent",
                                border: "none",
                                color: "rgba(26,58,46,0.35)",
                                cursor: "pointer",
                                fontSize: 14,
                                padding: "0 4px",
                                lineHeight: 1,
                              }}
                              title="Remove"
                            >
                              {"\u00D7"}
                            </button>
                          )}
                        </div>
                      ))}

                      {items.length < cat.count && (
                        <button
                          onClick={() => handleAddItem(cat.id, cat.count)}
                          style={{
                            background: `${cat.color}10`,
                            border: `1px dashed ${cat.color}50`,
                            borderRadius: 8,
                            padding: "7px 12px",
                            fontSize: 11,
                            color: cat.color,
                            fontWeight: 600,
                            cursor: "pointer",
                            fontFamily: "Inter, sans-serif",
                            textAlign: "center",
                          }}
                        >
                          + Add {cat.label[ageMode]} {items.length + 1}
                        </button>
                      )}

                      {catIdx < SENSE_CATEGORIES.length - 1 && isCatComplete && (
                        <button
                          onClick={() => setExpandedId(SENSE_CATEGORIES[catIdx + 1].id)}
                          style={{
                            background: cat.color,
                            border: "none",
                            borderRadius: 8,
                            padding: "7px 16px",
                            fontSize: 12,
                            color: "#fff",
                            fontWeight: 700,
                            cursor: "pointer",
                            fontFamily: "Inter, sans-serif",
                            alignSelf: "flex-end",
                          }}
                        >
                          Next sense {"\u2192"}
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {allComplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            background: "rgba(66,165,245,0.1)",
            border: "1px solid rgba(66,165,245,0.3)",
            borderRadius: 12,
            padding: "10px 16px",
            textAlign: "center",
            fontSize: 13,
            fontWeight: 600,
            color: "#1565c0",
          }}
        >
          {"\u2728"} {ageMode === "child"
            ? "Amazing! You noticed things with all 5 senses!"
            : ageMode === "teen"
            ? "All 5 senses grounded \u2014 nice work!"
            : "Full sensory anchoring complete. You are present."}
        </motion.div>
      )}
    </div>
  );
}
