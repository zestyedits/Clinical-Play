import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { AgeMode, BarrierType } from "./compass-data";
import { LIFE_DOMAINS, BARRIER_PROMPTS, BARRIER_TYPES } from "./compass-data";

interface DomainState {
  domainId: string;
  values: string[];
  alignment: number;
}

interface Barrier {
  id: string;
  domainId: string;
  text: string;
  type: BarrierType;
  defusionTechnique: string;
  defusedText: string;
}

interface BarrierIdentificationProps {
  domains: DomainState[];
  barriers: Barrier[];
  onAddBarrier: (domainId: string, text: string, type: BarrierType) => void;
  onRemoveBarrier: (barrierId: string) => void;
  ageMode: AgeMode;
}

interface LocalInputState {
  text: string;
  type: BarrierType | null;
}

export function BarrierIdentification({
  domains,
  barriers,
  onAddBarrier,
  onRemoveBarrier,
  ageMode,
}: BarrierIdentificationProps) {
  const underservedDomains = domains.filter((d) => d.alignment <= 6);

  const [inputStates, setInputStates] = useState<
    Record<string, LocalInputState>
  >(() => {
    const initial: Record<string, LocalInputState> = {};
    for (const d of underservedDomains) {
      initial[d.domainId] = { text: "", type: null };
    }
    return initial;
  });

  const updateInput = (
    domainId: string,
    update: Partial<LocalInputState>
  ) => {
    setInputStates((prev) => ({
      ...prev,
      [domainId]: { ...prev[domainId], ...update },
    }));
  };

  const handleAdd = (domainId: string) => {
    const state = inputStates[domainId];
    if (!state || !state.text.trim() || !state.type) return;
    onAddBarrier(domainId, state.text.trim(), state.type);
    updateInput(domainId, { text: "", type: null });
  };

  if (underservedDomains.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "48px 24px",
          color: "#c9a84c",
        }}
      >
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>🌟</div>
        <h3
          style={{
            fontSize: "22px",
            fontWeight: 600,
            marginBottom: "8px",
            color: "#c9a84c",
          }}
        >
          Amazing — All Areas Aligned!
        </h3>
        <p
          style={{
            fontSize: "15px",
            color: "#e8dcc8",
            opacity: 0.8,
            maxWidth: "420px",
            margin: "0 auto",
            lineHeight: 1.6,
          }}
        >
          You rated every life domain above 6. That means you feel well-aligned
          with your values across the board. Keep it up!
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {underservedDomains.map((domain, idx) => {
        const domainInfo = LIFE_DOMAINS.find((ld) => ld.id === domain.domainId);
        if (!domainInfo) return null;

        const domainBarriers = barriers.filter(
          (b) => b.domainId === domain.domainId
        );
        const input = inputStates[domain.domainId] ?? {
          text: "",
          type: null,
        };
        const prompt =
          BARRIER_PROMPTS[domain.domainId]?.[ageMode] ??
          "What gets in the way?";

        return (
          <div key={domain.domainId}>
            {idx > 0 && (
              <div
                style={{
                  height: "1px",
                  background:
                    "linear-gradient(to right, transparent, rgba(201,168,76,0.25), transparent)",
                  marginBottom: "32px",
                }}
              />
            )}

            {/* Domain Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "12px",
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill={domainInfo.color}
                style={{ flexShrink: 0 }}
              >
                <path d={domainInfo.iconPath} />
              </svg>
              <span
                style={{
                  fontSize: "18px",
                  fontWeight: 600,
                  color: "#e8dcc8",
                }}
              >
                {domainInfo.name}
              </span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: "28px",
                  height: "28px",
                  padding: "0 8px",
                  borderRadius: "14px",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#0f0a19",
                  background: domainInfo.color,
                }}
              >
                {domain.alignment}/10
              </span>
            </div>

            {/* Values display */}
            {domain.values.length > 0 && (
              <div
                style={{
                  fontSize: "14px",
                  color: "#e8dcc8",
                  opacity: 0.7,
                  marginBottom: "16px",
                  fontStyle: "italic",
                  lineHeight: 1.5,
                }}
              >
                {domain.values.map((v, i) => (
                  <span key={i}>
                    {i > 0 && ", "}
                    &ldquo;{v}&rdquo;
                  </span>
                ))}
              </div>
            )}

            {/* Barrier input area */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                marginBottom: "16px",
              }}
            >
              <textarea
                value={input.text}
                onChange={(e) =>
                  updateInput(domain.domainId, { text: e.target.value })
                }
                placeholder={prompt}
                rows={3}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "rgba(15, 10, 25, 0.7)",
                  border: "1px solid rgba(45, 138, 138, 0.3)",
                  borderRadius: "8px",
                  color: "#e8dcc8",
                  fontSize: "14px",
                  lineHeight: 1.5,
                  resize: "vertical",
                  outline: "none",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "rgba(45, 138, 138, 0.6)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(45, 138, 138, 0.3)";
                }}
              />

              {/* Barrier type selector */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  flexWrap: "wrap",
                }}
              >
                {BARRIER_TYPES.map((bt) => {
                  const isSelected = input.type === bt.type;
                  return (
                    <button
                      key={bt.type}
                      onClick={() =>
                        updateInput(domain.domainId, {
                          type: isSelected ? null : bt.type,
                        })
                      }
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "6px 14px",
                        borderRadius: "20px",
                        fontSize: "13px",
                        fontWeight: isSelected ? 700 : 500,
                        cursor: "pointer",
                        border: `1.5px solid ${
                          isSelected ? bt.color : "rgba(232,220,200,0.2)"
                        }`,
                        background: isSelected
                          ? `${bt.color}22`
                          : "transparent",
                        color: isSelected ? bt.color : "#e8dcc8",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <span style={{ fontSize: "15px" }}>{bt.icon}</span>
                      {bt.label}
                    </button>
                  );
                })}

                {/* Add Barrier button */}
                <button
                  onClick={() => handleAdd(domain.domainId)}
                  disabled={!input.text.trim() || !input.type}
                  style={{
                    marginLeft: "auto",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 18px",
                    borderRadius: "20px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor:
                      !input.text.trim() || !input.type
                        ? "not-allowed"
                        : "pointer",
                    border: "none",
                    background:
                      !input.text.trim() || !input.type
                        ? "rgba(45, 138, 138, 0.15)"
                        : "#2d8a8a",
                    color:
                      !input.text.trim() || !input.type
                        ? "rgba(232,220,200,0.35)"
                        : "#0f0a19",
                    transition: "all 0.15s ease",
                  }}
                >
                  + Add Barrier
                </button>
              </div>
            </div>

            {/* Existing barriers list */}
            <AnimatePresence mode="popLayout">
              {domainBarriers.map((barrier) => {
                const typeInfo = BARRIER_TYPES.find(
                  (bt) => bt.type === barrier.type
                );
                const bColor = typeInfo?.color ?? "#e8dcc8";

                return (
                  <motion.div
                    key={barrier.id}
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "10px",
                      padding: "10px 14px",
                      marginBottom: "8px",
                      borderRadius: "8px",
                      background: `${bColor}1A`,
                      border: `1px solid ${bColor}4D`,
                    }}
                  >
                    {/* Type badge */}
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "2px 10px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: bColor,
                        background: `${bColor}22`,
                        flexShrink: 0,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {typeInfo?.icon} {typeInfo?.label}
                    </span>

                    {/* Barrier text */}
                    <span
                      style={{
                        flex: 1,
                        fontSize: "14px",
                        color: "#e8dcc8",
                        lineHeight: 1.5,
                      }}
                    >
                      {barrier.text}
                    </span>

                    {/* Remove button */}
                    <button
                      onClick={() => onRemoveBarrier(barrier.id)}
                      style={{
                        flexShrink: 0,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "22px",
                        height: "22px",
                        borderRadius: "50%",
                        border: "none",
                        background: "rgba(232,220,200,0.1)",
                        color: "#e8dcc8",
                        fontSize: "13px",
                        cursor: "pointer",
                        lineHeight: 1,
                        padding: 0,
                        transition: "background 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          "rgba(232,220,200,0.25)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          "rgba(232,220,200,0.1)";
                      }}
                    >
                      ✕
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
