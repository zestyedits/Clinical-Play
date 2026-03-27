import { motion } from "framer-motion";
import type { AgeMode, CopingCategory } from "./ladder-data";
import { COPING_TOOLS, COPING_CATEGORY_LABELS } from "./ladder-data";

interface CopingKitStepProps {
  selectedTools: string[];
  customTool: string;
  onToggleTool: (id: string) => void;
  onSetCustomTool: (t: string) => void;
  ageMode: AgeMode;
}

const CATEGORIES: CopingCategory[] = ["breathing", "grounding", "cognitive", "physical"];

export function CopingKitStep({ selectedTools, customTool, onToggleTool, onSetCustomTool, ageMode }: CopingKitStepProps) {
  const totalSelected = selectedTools.length + (customTool.trim().length > 0 ? 1 : 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{ margin: 0, fontSize: 13, color: "rgba(232, 220, 200, 0.6)", lineHeight: 1.5 }}>
          {ageMode === "child"
            ? "Pick your favourite helpers when you feel worried:"
            : ageMode === "teen"
            ? "Choose at least 3 coping strategies for your toolkit:"
            : "Select at least 3 evidence-based coping strategies:"}
        </p>
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: totalSelected >= 3 ? "#d4a24c" : "rgba(232, 220, 200, 0.4)",
            padding: "3px 10px",
            borderRadius: 20,
            background: totalSelected >= 3 ? "rgba(212, 162, 76, 0.1)" : "rgba(232, 220, 200, 0.05)",
            border: `1px solid ${totalSelected >= 3 ? "rgba(212, 162, 76, 0.25)" : "rgba(232, 220, 200, 0.08)"}`,
            whiteSpace: "nowrap",
            flexShrink: 0,
            marginLeft: 8,
          }}
        >
          {totalSelected} selected
        </span>
      </div>

      {CATEGORIES.map((cat) => {
        const info = COPING_CATEGORY_LABELS[cat];
        const tools = COPING_TOOLS.filter((t) => t.category === cat);
        return (
          <div key={cat}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 8,
                paddingBottom: 6,
                borderBottom: "1px solid rgba(232, 220, 200, 0.06)",
              }}
            >
              <span style={{ fontSize: 16 }}>{info.emoji}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#d4a24c", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                {info.label}
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {tools.map((tool, i) => {
                const isSelected = selectedTools.includes(tool.id);
                return (
                  <motion.button
                    key={tool.id}
                    type="button"
                    onClick={() => onToggleTool(tool.id)}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "9px 12px",
                      borderRadius: 10,
                      border: isSelected
                        ? "1.5px solid rgba(100, 168, 212, 0.5)"
                        : "1px solid rgba(232, 220, 200, 0.08)",
                      background: isSelected
                        ? "rgba(100, 168, 212, 0.12)"
                        : "rgba(232, 220, 200, 0.03)",
                      cursor: "pointer",
                      fontFamily: "Inter, sans-serif",
                      outline: "none",
                      textAlign: "left",
                      transition: "all 0.2s",
                    }}
                  >
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 6,
                        border: isSelected ? "2px solid #64a8d4" : "1.5px solid rgba(232, 220, 200, 0.2)",
                        background: isSelected ? "#64a8d4" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        fontSize: 11,
                        color: "#080c14",
                        fontWeight: 700,
                        transition: "all 0.2s",
                      }}
                    >
                      {isSelected && "\u2713"}
                    </div>
                    <span
                      style={{
                        fontSize: 13,
                        color: isSelected ? "#a8d8f8" : "rgba(232, 220, 200, 0.65)",
                        fontWeight: isSelected ? 500 : 400,
                        transition: "color 0.2s",
                      }}
                    >
                      {tool.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        );
      })}

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(232, 220, 200, 0.5)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
          {ageMode === "child" ? "Another helper I use:" : "Another tool I use:"}
        </label>
        <input
          type="text"
          value={customTool}
          onChange={(e) => onSetCustomTool(e.target.value)}
          placeholder="Type your own coping strategy..."
          style={{
            width: "100%",
            padding: "10px 12px",
            background: "rgba(232, 220, 200, 0.05)",
            border: customTool.trim().length > 0
              ? "1.5px solid rgba(100, 168, 212, 0.3)"
              : "1px solid rgba(232, 220, 200, 0.1)",
            borderRadius: 10,
            color: "#e8dcc8",
            fontSize: 13,
            fontFamily: "Inter, sans-serif",
            outline: "none",
            boxSizing: "border-box",
            transition: "border-color 0.2s",
          }}
        />
      </div>

      {totalSelected < 3 && (
        <p style={{ margin: 0, fontSize: 11, color: "rgba(232, 220, 200, 0.35)", textAlign: "center" }}>
          Select at least {3 - totalSelected} more {3 - totalSelected === 1 ? "tool" : "tools"} to continue
        </p>
      )}
    </div>
  );
}
