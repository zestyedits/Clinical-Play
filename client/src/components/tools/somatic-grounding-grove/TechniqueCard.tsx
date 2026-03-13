import { useState } from "react";
import type { GroundingTechnique } from "./grove-data";

interface TechniqueCardProps {
  technique: GroundingTechnique;
  completed: boolean;
  onComplete: () => void;
}

export function TechniqueCard({ technique, completed, onComplete }: TechniqueCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  return (
    <div
      style={{
        background: completed ? "rgba(100, 200, 100, 0.08)" : "rgba(212, 232, 208, 0.04)",
        borderRadius: 12,
        border: completed ? "1px solid rgba(100, 200, 100, 0.25)" : "1px solid rgba(100, 160, 100, 0.12)",
        overflow: "hidden",
        transition: "all 0.25s ease",
      }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        data-testid={`button-technique-${technique.id}`}
        style={{
          width: "100%",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span style={{ fontSize: 18, flexShrink: 0 }}>{completed ? "\u2705" : technique.emoji}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#d4e8d0" }}>{technique.name}</div>
          <div style={{ fontSize: 10, color: "rgba(212, 232, 208, 0.45)" }}>{technique.duration}</div>
        </div>
        <span style={{ fontSize: 14, color: "rgba(212, 232, 208, 0.3)", transform: expanded ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>
          {"\u25BC"}
        </span>
      </button>

      {expanded && (
        <div style={{ padding: "0 16px 14px", animation: "fadeIn 0.2s ease" }}>
          <div style={{
            background: "rgba(212, 232, 208, 0.06)",
            borderRadius: 10,
            padding: "14px 14px",
            marginBottom: 10,
            border: "1px solid rgba(100, 160, 100, 0.1)",
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(100, 180, 100, 0.7)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
              Try This
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.7, color: "rgba(212, 232, 208, 0.85)", margin: 0 }}>
              {technique.instruction}
            </p>
          </div>

          {showPrompt && (
            <div style={{
              background: "rgba(100, 160, 100, 0.08)",
              borderRadius: 10,
              padding: "12px 14px",
              marginBottom: 10,
              border: "1px solid rgba(100, 160, 100, 0.15)",
              animation: "fadeIn 0.2s ease",
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(200, 180, 60, 0.7)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
                Discussion Prompt
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.7, color: "rgba(212, 232, 208, 0.85)", margin: 0, fontStyle: "italic" }}>
                {technique.discussionPrompt}
              </p>
            </div>
          )}

          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setShowPrompt(!showPrompt)}
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid rgba(100, 160, 100, 0.2)",
                background: showPrompt ? "rgba(200, 180, 60, 0.1)" : "rgba(212, 232, 208, 0.04)",
                color: showPrompt ? "rgba(200, 180, 60, 0.9)" : "rgba(212, 232, 208, 0.6)",
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
              }}
            >
              {showPrompt ? "\u{1F4AC} Hide Prompt" : "\u{1F4AC} Discussion"}
            </button>
            {!completed && (
              <button
                onClick={onComplete}
                data-testid={`button-complete-${technique.id}`}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "none",
                  background: "linear-gradient(135deg, #3a6b3a, #2d5a2d)",
                  color: "#d4e8d0",
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {"\u2705"} Mark Practiced
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
