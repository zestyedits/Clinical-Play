import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { AgeMode, AnchorItem } from "./constellation-data";

interface SecureBaseStepProps {
  anchors: AnchorItem[];
  onAddAnchor: (text: string, cat: "people" | "places" | "practices") => void;
  onRemoveAnchor: (id: string) => void;
  ageMode: AgeMode;
}

const CATEGORIES: {
  key: "people" | "places" | "practices";
  emoji: string;
  label: string;
  placeholder: string;
  color: string;
}[] = [
  { key: "people", emoji: "👤", label: "People", placeholder: "Who makes you feel safe?", color: "#80a8d4" },
  { key: "places", emoji: "📍", label: "Places", placeholder: "Where do you feel at peace?", color: "#80c480" },
  { key: "practices", emoji: "🧘", label: "Practices", placeholder: "What activities help you feel grounded?", color: "#c4a84c" },
];

export function SecureBaseStep({ anchors, onAddAnchor, onRemoveAnchor, ageMode }: SecureBaseStepProps) {
  const [inputs, setInputs] = useState<Record<string, string>>({ people: "", places: "", practices: "" });

  const intro = ageMode === "child"
    ? "Think about the people, places, and things that help you feel calm and safe."
    : "A secure base is anything that helps you feel settled and okay. It could be a person, a place, or something you do.";

  const handleAdd = (cat: "people" | "places" | "practices") => {
    const text = inputs[cat].trim();
    if (!text) return;
    onAddAnchor(text, cat);
    setInputs((prev) => ({ ...prev, [cat]: "" }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <p style={{ margin: 0, fontSize: 13, color: "rgba(232, 220, 200, 0.65)", lineHeight: 1.6, textAlign: "center" }}>
        {intro}
      </p>

      {CATEGORIES.map((cat) => {
        const catAnchors = anchors.filter((a) => a.category === cat.key);
        return (
          <div
            key={cat.key}
            style={{
              background: "rgba(6, 8, 15, 0.5)",
              border: `1px solid rgba(${hexToRgb(cat.color)}, 0.18)`,
              borderRadius: 12,
              padding: "14px 16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
              <span style={{ fontSize: 18 }}>{cat.emoji}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: cat.color }}>{cat.label}</span>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: catAnchors.length > 0 ? 10 : 0 }}>
              <input
                type="text"
                value={inputs[cat.key]}
                onChange={(e) => setInputs((prev) => ({ ...prev, [cat.key]: e.target.value }))}
                onKeyDown={(e) => { if (e.key === "Enter") handleAdd(cat.key); }}
                placeholder={cat.placeholder}
                style={{
                  flex: 1,
                  background: "rgba(232, 220, 200, 0.04)",
                  border: `1px solid rgba(${hexToRgb(cat.color)}, 0.2)`,
                  borderRadius: 8,
                  padding: "8px 12px",
                  color: "#e8dcc8",
                  fontSize: 13,
                  fontFamily: "Inter, sans-serif",
                  outline: "none",
                }}
              />
              <button
                onClick={() => handleAdd(cat.key)}
                style={{
                  background: `rgba(${hexToRgb(cat.color)}, 0.15)`,
                  border: `1px solid rgba(${hexToRgb(cat.color)}, 0.3)`,
                  borderRadius: 8,
                  padding: "8px 14px",
                  color: cat.color,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                  whiteSpace: "nowrap",
                }}
              >
                + Add
              </button>
            </div>

            {catAnchors.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                <AnimatePresence>
                  {catAnchors.map((anchor) => (
                    <motion.div
                      key={anchor.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.7 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "5px 10px",
                        background: `rgba(${hexToRgb(cat.color)}, 0.1)`,
                        border: `1px solid rgba(${hexToRgb(cat.color)}, 0.3)`,
                        borderRadius: 20,
                        fontSize: 12,
                        color: "#e8dcc8",
                      }}
                    >
                      <span>{anchor.text}</span>
                      <button
                        onClick={() => onRemoveAnchor(anchor.id)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "rgba(232, 220, 200, 0.4)",
                          cursor: "pointer",
                          padding: 0,
                          fontSize: 12,
                          lineHeight: 1,
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        ×
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        );
      })}

      {anchors.length === 0 && (
        <p style={{ margin: 0, fontSize: 11, color: "rgba(232, 220, 200, 0.3)", textAlign: "center" }}>
          Add at least one anchor to continue
        </p>
      )}
    </div>
  );
}

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "196, 168, 76";
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
}