import { AnimatePresence, motion } from "framer-motion";
import type { AgeMode, BarrierType } from "./compass-data";
import { LIFE_DOMAINS, BARRIER_OPTIONS, BARRIER_TYPES } from "./compass-data";

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

const TYPE_COLORS: Record<BarrierType, string> = {
  thought: "#7c8ee0",
  feeling: "#e88a7a",
  urge: "#e0a84c",
};

const TYPE_LABELS: Record<BarrierType, { label: string; icon: string }> = {
  thought: { label: "Thoughts", icon: "\uD83D\uDCAD" },
  feeling: { label: "Feelings", icon: "\uD83D\uDC94" },
  urge: { label: "Urges", icon: "\u26A1" },
};

const BARRIER_TYPE_KEYS: BarrierType[] = ["thought", "feeling", "urge"];

export function BarrierIdentification({
  domains,
  barriers,
  onAddBarrier,
  onRemoveBarrier,
}: BarrierIdentificationProps) {
  const underservedDomains = domains.filter((d) => d.alignment <= 6);

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

  const isBarrierSelected = (
    domainId: string,
    text: string,
    type: BarrierType
  ): Barrier | undefined => {
    return barriers.find(
      (b) => b.domainId === domainId && b.text === text && b.type === type
    );
  };

  const handleChipClick = (
    domainId: string,
    text: string,
    type: BarrierType
  ) => {
    const existing = isBarrierSelected(domainId, text, type);
    if (existing) {
      onRemoveBarrier(existing.id);
    } else {
      onAddBarrier(domainId, text, type);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "32px",
      }}
    >
      {underservedDomains.map((domain, idx) => {
        const domainInfo = LIFE_DOMAINS.find((ld) => ld.id === domain.domainId);
        if (!domainInfo) return null;

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
                  marginBottom: "20px",
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

            {/* Barrier chip sections by type */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "20px",
              }}
            >
              {BARRIER_TYPE_KEYS.map((type) => {
                const color = TYPE_COLORS[type];
                const { label, icon } = TYPE_LABELS[type];
                const options = BARRIER_OPTIONS[type];

                return (
                  <div key={type}>
                    {/* Section header */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "10px",
                      }}
                    >
                      <span style={{ fontSize: "16px" }}>{icon}</span>
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: 600,
                          color: color,
                          letterSpacing: "0.3px",
                        }}
                      >
                        {label}
                      </span>
                    </div>

                    {/* Chips */}
                    <AnimatePresence>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "8px",
                        }}
                      >
                        {options.map((text) => {
                          const selected = !!isBarrierSelected(
                            domain.domainId,
                            text,
                            type
                          );

                          return (
                            <motion.button
                              key={text}
                              initial={{ opacity: 0, scale: 0.92 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.92 }}
                              transition={{ duration: 0.15, ease: "easeOut" }}
                              onClick={() =>
                                handleChipClick(domain.domainId, text, type)
                              }
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                minHeight: "44px",
                                padding: "8px 16px",
                                borderRadius: "22px",
                                fontSize: "14px",
                                fontWeight: selected ? 600 : 400,
                                lineHeight: 1.3,
                                cursor: "pointer",
                                border: selected
                                  ? `2px solid ${color}`
                                  : "2px solid rgba(232, 220, 200, 0.15)",
                                background: selected
                                  ? `${color}25`
                                  : "rgba(15, 22, 28, 0.5)",
                                color: selected ? color : "#e8dcc8",
                                transition: "all 0.15s ease",
                                fontFamily: "inherit",
                                textAlign: "left",
                                boxShadow: selected
                                  ? `0 0 12px ${color}20`
                                  : "none",
                              }}
                              onMouseEnter={(e) => {
                                if (!selected) {
                                  e.currentTarget.style.borderColor = `${color}80`;
                                  e.currentTarget.style.background =
                                    "rgba(15, 22, 28, 0.7)";
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!selected) {
                                  e.currentTarget.style.borderColor =
                                    "rgba(232, 220, 200, 0.15)";
                                  e.currentTarget.style.background =
                                    "rgba(15, 22, 28, 0.5)";
                                }
                              }}
                            >
                              {selected && (
                                <span
                                  style={{
                                    marginRight: "6px",
                                    fontSize: "13px",
                                    lineHeight: 1,
                                  }}
                                >
                                  ✓
                                </span>
                              )}
                              {text}
                            </motion.button>
                          );
                        })}
                      </div>
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
