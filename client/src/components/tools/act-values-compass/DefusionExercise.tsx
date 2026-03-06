import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { AgeMode, BarrierType } from "./compass-data";
import { DEFUSION_TECHNIQUES, BARRIER_TYPES, LIFE_DOMAINS } from "./compass-data";

// ── Types ───────────────────────────────────────────────────────────────────

interface Barrier {
  id: string;
  domainId: string;
  text: string;
  type: BarrierType;
  defusionTechnique: string;
  defusedText: string;
}

interface DefusionExerciseProps {
  barriers: Barrier[];
  onUpdateBarrier: (barrierId: string, technique: string, defusedText: string) => void;
  ageMode: AgeMode;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function getDomainName(domainId: string): string {
  const domain = LIFE_DOMAINS.find((d) => d.id === domainId);
  return domain ? domain.name : domainId;
}

function getBarrierTypeInfo(type: BarrierType) {
  return BARRIER_TYPES.find((b) => b.type === type) ?? BARRIER_TYPES[0];
}

function applyTemplate(template: string, barrierText: string): string {
  return template
    .replace("{thought}", barrierText)
    .replace("{label}", barrierText);
}

// ── Component ───────────────────────────────────────────────────────────────

export function DefusionExercise({
  barriers,
  onUpdateBarrier,
  ageMode,
}: DefusionExerciseProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // ── Empty state ─────────────────────────────────────────────────────────
  if (barriers.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 24px",
          textAlign: "center",
          gap: 16,
        }}
      >
        <span style={{ fontSize: 48 }}>🪝</span>
        <p
          style={{
            color: "#e8dcc8",
            fontSize: 18,
            lineHeight: 1.5,
            maxWidth: 420,
            margin: 0,
          }}
        >
          No barriers to unhook from yet. You can go back to the previous step to
          add some, or proceed to the next step.
        </p>
      </div>
    );
  }

  const barrier = barriers[currentIndex];
  const typeInfo = getBarrierTypeInfo(barrier.type);
  const domainName = getDomainName(barrier.domainId);

  const selectedTechnique = DEFUSION_TECHNIQUES.find(
    (t) => t.id === barrier.defusionTechnique,
  );

  // When a technique is selected, build the prefilled text
  function handleSelectTechnique(techniqueId: string) {
    const technique = DEFUSION_TECHNIQUES.find((t) => t.id === techniqueId);
    if (!technique) return;
    const prefilled = applyTemplate(technique.template, barrier.text);
    onUpdateBarrier(barrier.id, techniqueId, prefilled);
  }

  // ── Progress dots ───────────────────────────────────────────────────────
  const progressDots = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        marginBottom: 24,
      }}
    >
      <span
        style={{
          color: "#c9a84c",
          fontSize: 14,
          fontWeight: 600,
          letterSpacing: 0.5,
        }}
      >
        Barrier {currentIndex + 1} of {barriers.length}
      </span>
      <div style={{ display: "flex", gap: 6 }}>
        {barriers.map((_, i) => (
          <div
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background:
                i === currentIndex ? "#c9a84c" : "rgba(232, 220, 200, 0.25)",
              transition: "background 0.3s ease",
            }}
          />
        ))}
      </div>
    </div>
  );

  // ── Barrier card (the "before") ─────────────────────────────────────────
  const barrierCard = (
    <div
      style={{
        background: "rgba(15, 22, 28, 0.6)",
        borderRadius: 14,
        padding: "20px 24px",
        border: `1px solid ${typeInfo.color}55`,
        marginBottom: 24,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            background: `${typeInfo.color}22`,
            border: `1px solid ${typeInfo.color}66`,
            borderRadius: 20,
            padding: "3px 12px",
            fontSize: 13,
            fontWeight: 600,
            color: typeInfo.color,
          }}
        >
          {typeInfo.icon} {typeInfo.label}
        </span>
        <span style={{ color: "rgba(232, 220, 200, 0.5)", fontSize: 13 }}>
          {domainName}
        </span>
      </div>
      <p
        style={{
          color: "#e8dcc8",
          fontSize: 18,
          fontStyle: "italic",
          lineHeight: 1.5,
          margin: 0,
        }}
      >
        &ldquo;{barrier.text}&rdquo;
      </p>
    </div>
  );

  // ── Technique selector ──────────────────────────────────────────────────
  const techniqueSelector = (
    <div style={{ marginBottom: 24 }}>
      <p
        style={{
          color: "#c9a84c",
          fontSize: 14,
          fontWeight: 600,
          marginBottom: 12,
          letterSpacing: 0.5,
          textTransform: "uppercase",
        }}
      >
        Choose a defusion technique
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(min(200px, 100%), 1fr))",
          gap: 12,
        }}
      >
        {DEFUSION_TECHNIQUES.map((technique) => {
          const isSelected = barrier.defusionTechnique === technique.id;
          return (
            <button
              key={technique.id}
              onClick={() => handleSelectTechnique(technique.id)}
              style={{
                background: "rgba(15, 22, 28, 0.6)",
                border: isSelected
                  ? "2px solid #2d8a8a"
                  : "1px solid rgba(232, 220, 200, 0.15)",
                borderRadius: 12,
                padding: "14px 16px",
                cursor: "pointer",
                textAlign: "left",
                transition: "border-color 0.25s ease, box-shadow 0.25s ease",
                boxShadow: isSelected
                  ? "0 0 12px rgba(45, 138, 138, 0.25)"
                  : "none",
              }}
            >
              <p
                style={{
                  color: isSelected ? "#2d8a8a" : "#e8dcc8",
                  fontSize: 15,
                  fontWeight: 700,
                  margin: "0 0 6px 0",
                }}
              >
                {technique.name}
              </p>
              <p
                style={{
                  color: "rgba(232, 220, 200, 0.6)",
                  fontSize: 12,
                  lineHeight: 1.45,
                  margin: 0,
                }}
              >
                {technique.instruction[ageMode]}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );

  // ── Template preview ────────────────────────────────────────────────────
  const templatePreview = selectedTechnique ? (
    <div
      style={{
        background: "rgba(45, 138, 138, 0.08)",
        border: "1px solid rgba(45, 138, 138, 0.3)",
        borderRadius: 10,
        padding: "12px 16px",
        marginBottom: 24,
      }}
    >
      <p
        style={{
          color: "rgba(232, 220, 200, 0.5)",
          fontSize: 12,
          fontWeight: 600,
          margin: "0 0 6px 0",
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        Template preview
      </p>
      <p
        style={{
          color: "#2d8a8a",
          fontSize: 15,
          fontStyle: "italic",
          margin: 0,
          lineHeight: 1.5,
        }}
      >
        {applyTemplate(selectedTechnique.template, barrier.text)}
      </p>
    </div>
  ) : null;

  // ── Before / After comparison ───────────────────────────────────────────
  const comparison =
    selectedTechnique && barrier.defusedText.trim() ? (
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 28,
        }}
      >
        {/* Before */}
        <div
          style={{
            flex: "1 1 220px",
            background: "rgba(15, 22, 28, 0.45)",
            borderRadius: 12,
            padding: "16px 18px",
            border: "1px solid rgba(232, 220, 200, 0.1)",
          }}
        >
          <p
            style={{
              color: "rgba(232, 220, 200, 0.4)",
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 1,
              margin: "0 0 8px 0",
            }}
          >
            Before
          </p>
          <p
            style={{
              color: "rgba(232, 220, 200, 0.45)",
              fontSize: 15,
              textDecoration: "line-through",
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            {barrier.text}
          </p>
        </div>

        {/* After */}
        <div
          style={{
            flex: "1 1 220px",
            background: "rgba(45, 138, 138, 0.08)",
            borderRadius: 12,
            padding: "16px 18px",
            border: "1px solid rgba(45, 138, 138, 0.3)",
          }}
        >
          <p
            style={{
              color: "#2d8a8a",
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 1,
              margin: "0 0 8px 0",
            }}
          >
            After
          </p>
          <p
            style={{
              color: "#2d8a8a",
              fontSize: 15,
              lineHeight: 1.5,
              margin: 0,
              fontWeight: 500,
            }}
          >
            {barrier.defusedText}
          </p>
        </div>
      </div>
    ) : null;

  // ── Navigation buttons ──────────────────────────────────────────────────
  const navigation = (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 12,
        marginTop: 8,
      }}
    >
      <button
        disabled={currentIndex === 0}
        onClick={() => setCurrentIndex((i) => i - 1)}
        style={{
          background:
            currentIndex === 0
              ? "rgba(232, 220, 200, 0.05)"
              : "rgba(232, 220, 200, 0.1)",
          border: "1px solid rgba(232, 220, 200, 0.15)",
          borderRadius: 10,
          padding: "10px 22px",
          color:
            currentIndex === 0
              ? "rgba(232, 220, 200, 0.25)"
              : "#e8dcc8",
          fontSize: 14,
          fontWeight: 600,
          cursor: currentIndex === 0 ? "default" : "pointer",
          transition: "background 0.2s ease",
        }}
      >
        Previous Barrier
      </button>
      <button
        disabled={currentIndex === barriers.length - 1}
        onClick={() => setCurrentIndex((i) => i + 1)}
        style={{
          background:
            currentIndex === barriers.length - 1
              ? "rgba(45, 138, 138, 0.1)"
              : "rgba(45, 138, 138, 0.2)",
          border: "1px solid rgba(45, 138, 138, 0.35)",
          borderRadius: 10,
          padding: "10px 22px",
          color:
            currentIndex === barriers.length - 1
              ? "rgba(45, 138, 138, 0.4)"
              : "#2d8a8a",
          fontSize: 14,
          fontWeight: 600,
          cursor: currentIndex === barriers.length - 1 ? "default" : "pointer",
          transition: "background 0.2s ease",
        }}
      >
        Next Barrier
      </button>
    </div>
  );

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: "100%", margin: "0 auto" }}>
      {progressDots}

      <AnimatePresence mode="wait">
        <motion.div
          key={barrier.id}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {barrierCard}
          {techniqueSelector}
          {templatePreview}
          {comparison}
        </motion.div>
      </AnimatePresence>

      {navigation}
    </div>
  );
}
