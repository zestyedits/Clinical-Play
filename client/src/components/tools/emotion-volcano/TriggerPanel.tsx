import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { VolcanoCanvas } from "./VolcanoCanvas";
import { TRIGGER_CATEGORIES } from "./volcano-data";
import type { AgeMode } from "./volcano-data";
import type { Trigger } from "./EmotionVolcano";

interface TriggerPanelProps {
  triggers: Trigger[];
  currentTemp: number;
  ageMode: AgeMode;
  onAddTrigger: (trigger: Trigger) => void;
  onRemoveTrigger: (id: string) => void;
}

export function TriggerPanel({ triggers, currentTemp, ageMode, onAddTrigger, onRemoveTrigger }: TriggerPanelProps) {
  const [inputName, setInputName] = useState("");
  const [inputIntensity, setInputIntensity] = useState(3);
  const [inputCategory, setInputCategory] = useState(TRIGGER_CATEGORIES[0].id);
  const [showExamples, setShowExamples] = useState(false);

  const handleAdd = () => {
    if (!inputName.trim()) return;
    onAddTrigger({
      id: `trigger-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: inputName.trim(),
      intensity: inputIntensity,
      category: inputCategory,
    });
    setInputName("");
    setInputIntensity(3);
  };

  const handleExampleClick = (example: string) => {
    setInputName(example);
    setShowExamples(false);
  };

  const totalIntensity = triggers.reduce((sum, t) => sum + t.intensity, 0);
  const activeCategory = TRIGGER_CATEGORIES.find((c) => c.id === inputCategory)!;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Mini volcano + stats row */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <VolcanoCanvas temperature={currentTemp} width={120} height={100} showLabel={false} compact />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: "rgba(240,232,216,0.4)", marginBottom: 4 }}>
            {ageMode === "child" ? "Lava level" : "Current temperature"}
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: getTempColorForTrigger(currentTemp), lineHeight: 1 }}>
            {currentTemp.toFixed(1)}
          </div>
          <div style={{ fontSize: 11, color: "rgba(240,232,216,0.35)", marginTop: 4 }}>
            {triggers.length} trigger{triggers.length !== 1 ? "s" : ""} · {totalIntensity} total heat
          </div>
        </div>
      </div>

      {/* Category selector */}
      <div>
        <div style={{ fontSize: 12, color: "rgba(240,232,216,0.5)", marginBottom: 8, fontWeight: 500 }}>
          {ageMode === "child" ? "What kind of thing makes you angry?" : "Trigger category"}
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {TRIGGER_CATEGORIES.map((cat) => {
            const isActive = inputCategory === cat.id;
            const count = triggers.filter((t) => t.category === cat.id).length;
            return (
              <motion.button
                key={cat.id}
                onClick={() => setInputCategory(cat.id)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "7px 12px",
                  borderRadius: 10,
                  border: isActive ? `1.5px solid ${cat.color}60` : "1px solid rgba(240,232,216,0.08)",
                  background: isActive ? `${cat.color}15` : "rgba(240,232,216,0.03)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  fontSize: 12,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? cat.color : "rgba(240,232,216,0.5)",
                }}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
                {count > 0 && (
                  <span style={{
                    background: `${cat.color}30`,
                    color: cat.color,
                    borderRadius: 8,
                    padding: "1px 6px",
                    fontSize: 10,
                    fontWeight: 700,
                  }}>
                    {count}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Input area */}
      <div
        style={{
          background: "rgba(240,232,216,0.04)",
          border: "1px solid rgba(240,232,216,0.08)",
          borderRadius: 14,
          padding: 14,
        }}
      >
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <input
            type="text"
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder={ageMode === "child" ? "What made you mad?" : "Describe the trigger..."}
            style={{
              flex: 1,
              background: "rgba(0,0,0,0.2)",
              border: "1px solid rgba(240,232,216,0.1)",
              borderRadius: 10,
              padding: "10px 14px",
              color: "#f0e8d8",
              fontSize: 13,
              outline: "none",
            }}
          />
          <motion.button
            onClick={handleAdd}
            disabled={!inputName.trim()}
            whileHover={inputName.trim() ? { scale: 1.05 } : {}}
            whileTap={inputName.trim() ? { scale: 0.95 } : {}}
            style={{
              background: inputName.trim() ? `${activeCategory.color}` : "rgba(240,232,216,0.08)",
              border: "none",
              borderRadius: 10,
              padding: "10px 16px",
              color: inputName.trim() ? "#0a0a0a" : "rgba(240,232,216,0.2)",
              fontSize: 13,
              fontWeight: 700,
              cursor: inputName.trim() ? "pointer" : "not-allowed",
              whiteSpace: "nowrap",
            }}
          >
            + Add
          </motion.button>
        </div>

        {/* Intensity selector */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 11, color: "rgba(240,232,216,0.4)", minWidth: 55 }}>
            {ageMode === "child" ? "How hot?" : "Intensity"}
          </span>
          <div style={{ display: "flex", gap: 4 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <motion.button
                key={n}
                onClick={() => setInputIntensity(n)}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                style={{
                  width: 28, height: 28,
                  borderRadius: 8,
                  border: n <= inputIntensity
                    ? `1.5px solid ${activeCategory.color}60`
                    : "1px solid rgba(240,232,216,0.08)",
                  background: n <= inputIntensity
                    ? `${activeCategory.color}${Math.round(15 + n * 8).toString(16)}`
                    : "rgba(240,232,216,0.03)",
                  cursor: "pointer",
                  fontSize: 12,
                  color: n <= inputIntensity ? activeCategory.color : "rgba(240,232,216,0.25)",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.15s",
                }}
              >
                {n}
              </motion.button>
            ))}
          </div>
          <span style={{ fontSize: 10, color: "rgba(240,232,216,0.3)" }}>
            {inputIntensity <= 2 ? "Low" : inputIntensity <= 3 ? "Medium" : inputIntensity <= 4 ? "High" : "Extreme"}
          </span>
        </div>

        {/* Examples toggle */}
        <button
          onClick={() => setShowExamples(!showExamples)}
          style={{
            background: "none",
            border: "none",
            color: "rgba(240,232,216,0.35)",
            fontSize: 11,
            cursor: "pointer",
            padding: 0,
          }}
        >
          {showExamples ? "Hide examples ▲" : "Show examples ▼"}
        </button>

        <AnimatePresence>
          {showExamples && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ overflow: "hidden", marginTop: 6 }}
            >
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {activeCategory.examples[ageMode].map((ex) => (
                  <button
                    key={ex}
                    onClick={() => handleExampleClick(ex)}
                    style={{
                      background: "rgba(240,232,216,0.05)",
                      border: "1px solid rgba(240,232,216,0.08)",
                      borderRadius: 8,
                      padding: "5px 10px",
                      fontSize: 11,
                      color: "rgba(240,232,216,0.5)",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Trigger list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <AnimatePresence>
          {triggers.map((trigger) => {
            const cat = TRIGGER_CATEGORIES.find((c) => c.id === trigger.category)!;
            return (
              <motion.div
                key={trigger.id}
                initial={{ opacity: 0, x: -20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: "auto" }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 14px",
                  background: `${cat.color}08`,
                  border: `1px solid ${cat.color}18`,
                  borderRadius: 12,
                }}
              >
                <span style={{ fontSize: 16 }}>{cat.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: "#f0e8d8", fontWeight: 500 }}>{trigger.name}</div>
                  <div style={{ display: "flex", gap: 4, marginTop: 2 }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        style={{
                          width: 12, height: 4, borderRadius: 2,
                          background: i < trigger.intensity ? cat.color : "rgba(240,232,216,0.08)",
                          transition: "background 0.2s",
                        }}
                      />
                    ))}
                  </div>
                </div>
                <motion.button
                  onClick={() => onRemoveTrigger(trigger.id)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.8 }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "rgba(240,232,216,0.3)",
                    cursor: "pointer",
                    fontSize: 16,
                    padding: 4,
                    lineHeight: 1,
                  }}
                >
                  ×
                </motion.button>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {triggers.length === 0 && (
          <div style={{ textAlign: "center", padding: "20px 0", color: "rgba(240,232,216,0.25)", fontSize: 13 }}>
            {ageMode === "child" ? "Add things that make your volcano bubble! ⬆️" : "Add at least one trigger to continue"}
          </div>
        )}
      </div>
    </div>
  );
}

function getTempColorForTrigger(temp: number): string {
  if (temp <= 2) return "#4488aa";
  if (temp <= 4) return "#88aa44";
  if (temp <= 6) return "#d4a833";
  if (temp <= 8) return "#dd6633";
  return "#ee3322";
}
