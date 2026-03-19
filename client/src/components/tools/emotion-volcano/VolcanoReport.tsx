import { motion } from "framer-motion";
import { VolcanoCanvas } from "./VolcanoCanvas";
import { TRIGGER_CATEGORIES, BODY_REGIONS, COOLING_TECHNIQUES, PLAN_TIERS } from "./volcano-data";
import type { VolcanoState } from "./EmotionVolcano";

interface VolcanoReportProps {
  state: VolcanoState;
  onReset: () => void;
  inline?: boolean;
}

export function VolcanoReport({ state, onReset, inline }: VolcanoReportProps) {
  const { ageMode, baselineTemp, currentTemp, triggers, warningSigns, selectedTechniques, plan } = state;
  const totalSigns = warningSigns.reduce((sum, w) => sum + w.sensations.length, 0);
  const tempDrop = baselineTemp + triggers.reduce((sum, t) => sum + t.intensity * 0.4, 0) - currentTemp;

  const wrapperStyle: React.CSSProperties = inline
    ? {}
    : {
        width: "100%",
        height: "100%",
        overflow: "auto",
        background: "linear-gradient(170deg, #101518 0%, #182028 40%, #141a22 70%, #0e1218 100%)",
        fontFamily: "Inter, sans-serif",
      };

  return (
    <div style={wrapperStyle}>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: inline ? "8px 0" : "24px 20px" }}>
        {/* Header */}
        {!inline && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: "center", marginBottom: 24 }}
          >
            <div style={{ fontSize: 48, marginBottom: 8 }}>🏆</div>
            <h1 style={{
              margin: 0, fontSize: 24, fontWeight: 800,
              color: "#f0e8d8",
              fontFamily: "'Lora', Georgia, serif",
            }}>
              {ageMode === "child" ? "My Volcano Report!" : "Volcano Report"}
            </h1>
            <p style={{ margin: "6px 0 0", fontSize: 12, color: "rgba(240,232,216,0.4)" }}>
              {ageMode === "child"
                ? "Look at everything you learned about your volcano!"
                : "Your personalized anger profile and regulation toolkit"}
            </p>
          </motion.div>
        )}

        {/* Volcano before/after */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-end",
            gap: 24,
            marginBottom: 20,
            padding: "16px 0",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 10, color: "rgba(240,232,216,0.35)", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>
              Before
            </div>
            <VolcanoCanvas
              temperature={baselineTemp + triggers.reduce((sum, t) => sum + t.intensity * 0.4, 0)}
              width={110}
              height={90}
              compact
            />
          </div>
          <div style={{ fontSize: 24, color: "rgba(240,232,216,0.2)", paddingBottom: 30 }}>→</div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 10, color: "rgba(240,232,216,0.35)", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>
              After
            </div>
            <VolcanoCanvas temperature={currentTemp} width={110} height={90} compact />
          </div>
        </motion.div>

        {/* Temperature drop badge */}
        {tempDrop > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            style={{
              textAlign: "center",
              marginBottom: 20,
            }}
          >
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 20px",
              borderRadius: 20,
              background: "rgba(85,160,216,0.12)",
              border: "1px solid rgba(85,160,216,0.2)",
              color: "#55a0d8",
              fontSize: 14,
              fontWeight: 700,
            }}>
              ❄️ Temperature reduced by {tempDrop.toFixed(1)} points
            </span>
          </motion.div>
        )}

        {/* Stats grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 8,
            marginBottom: 20,
          }}
        >
          {[
            { label: "Triggers", value: triggers.length, emoji: "🫧", color: "#d48a40" },
            { label: "Warning Signs", value: totalSigns, emoji: "🚨", color: "#d45580" },
            { label: "Techniques", value: selectedTechniques.length, emoji: "❄️", color: "#55a0d8" },
            { label: "Plan Items", value: plan.length, emoji: "📋", color: "#7cb87c" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              style={{
                background: `${stat.color}08`,
                border: `1px solid ${stat.color}15`,
                borderRadius: 12,
                padding: "12px 14px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 20, marginBottom: 4 }}>{stat.emoji}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: 10, color: "rgba(240,232,216,0.4)", marginTop: 2 }}>{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Trigger breakdown */}
        <ReportSection
          title={ageMode === "child" ? "What Makes My Volcano Bubble" : "Trigger Profile"}
          emoji="🫧"
          delay={0.4}
        >
          {TRIGGER_CATEGORIES.map((cat) => {
            const catTriggers = triggers.filter((t) => t.category === cat.id);
            if (catTriggers.length === 0) return null;
            return (
              <div key={cat.id} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: 14 }}>{cat.emoji}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: cat.color }}>{cat.label}</span>
                  <span style={{ fontSize: 10, color: "rgba(240,232,216,0.3)" }}>({catTriggers.length})</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, paddingLeft: 22 }}>
                  {catTriggers.map((t) => (
                    <span
                      key={t.id}
                      style={{
                        padding: "3px 10px",
                        borderRadius: 8,
                        background: `${cat.color}10`,
                        border: `1px solid ${cat.color}20`,
                        fontSize: 11,
                        color: "rgba(240,232,216,0.6)",
                      }}
                    >
                      {t.name}
                      <span style={{ marginLeft: 4, fontWeight: 700, color: cat.color, fontSize: 10 }}>
                        ×{t.intensity}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </ReportSection>

        {/* Warning signs map */}
        <ReportSection
          title={ageMode === "child" ? "My Body's Alarm Bells" : "Warning Sign Map"}
          emoji="🚨"
          delay={0.5}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {warningSigns.map((w) => {
              const region = BODY_REGIONS.find((r) => r.id === w.regionId)!;
              return (
                <div
                  key={w.regionId}
                  style={{
                    background: "rgba(212,85,128,0.06)",
                    border: "1px solid rgba(212,85,128,0.15)",
                    borderRadius: 10,
                    padding: "8px 12px",
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#d45580", marginBottom: 4 }}>
                    {region.emoji} {region.label}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                    {w.sensations.map((s) => (
                      <span
                        key={s}
                        style={{
                          padding: "2px 8px",
                          borderRadius: 6,
                          background: "rgba(212,85,128,0.1)",
                          fontSize: 10,
                          color: "rgba(240,232,216,0.5)",
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </ReportSection>

        {/* Cooling toolkit */}
        <ReportSection
          title={ageMode === "child" ? "My Cooling Superpowers" : "Regulation Toolkit"}
          emoji="❄️"
          delay={0.6}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {selectedTechniques.map((id) => {
              const tech = COOLING_TECHNIQUES.find((t) => t.id === id)!;
              return (
                <div
                  key={id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 12px",
                    background: "rgba(85,160,216,0.05)",
                    border: "1px solid rgba(85,160,216,0.12)",
                    borderRadius: 10,
                  }}
                >
                  <span style={{ fontSize: 18 }}>{tech.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(240,232,216,0.7)" }}>{tech.name}</div>
                    <div style={{ fontSize: 10, color: "rgba(240,232,216,0.35)" }}>
                      {tech.speed} · {tech.duration} · power {tech.power}/5
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ReportSection>

        {/* Prevention plan */}
        <ReportSection
          title={ageMode === "child" ? "My Cool-Down Plan" : "Eruption Prevention Plan"}
          emoji="📋"
          delay={0.7}
        >
          {PLAN_TIERS.map((tier) => {
            const tierItems = plan.filter((p) => p.tier === tier.id);
            if (tierItems.length === 0) return null;
            return (
              <div key={tier.id} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <span>{tier.emoji}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: tier.color }}>{tier.label}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 3, paddingLeft: 6 }}>
                  {tierItems.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "6px 10px",
                        background: `${tier.color}08`,
                        borderRadius: 8,
                        borderLeft: `3px solid ${tier.color}40`,
                      }}
                    >
                      <div style={{ width: 5, height: 5, borderRadius: "50%", background: tier.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 11, color: "rgba(240,232,216,0.6)" }}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </ReportSection>

        {/* Calm volcano with flowers */}
        {!inline && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            style={{ textAlign: "center", margin: "24px 0" }}
          >
            <div style={{ position: "relative", display: "inline-block" }}>
              <VolcanoCanvas temperature={Math.min(currentTemp, 2)} width={160} height={130} compact />
              {/* Flowers growing at base */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.5, type: "spring", stiffness: 100 }}
                style={{
                  position: "absolute",
                  bottom: 10,
                  left: "50%",
                  transform: "translateX(-50%)",
                  fontSize: 20,
                  letterSpacing: 4,
                }}
              >
                🌸🌿🌻🌿🌸
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Reset button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          style={{ textAlign: "center", paddingBottom: inline ? 0 : 24 }}
        >
          <motion.button
            onClick={onReset}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{
              background: "rgba(240,232,216,0.06)",
              border: "1px solid rgba(240,232,216,0.12)",
              borderRadius: 12,
              padding: "12px 28px",
              color: "rgba(240,232,216,0.5)",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            {ageMode === "child" ? "Start a New Volcano! 🌋" : "New Volcano Session"}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}

// ── Report Section ─────────────────────────────────────────────────────────

function ReportSection({
  title,
  emoji,
  delay,
  children,
}: {
  title: string;
  emoji: string;
  delay: number;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      style={{
        marginBottom: 16,
        background: "rgba(240,232,216,0.02)",
        border: "1px solid rgba(240,232,216,0.06)",
        borderRadius: 14,
        padding: 14,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
        <span style={{ fontSize: 16 }}>{emoji}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#f0e8d8" }}>{title}</span>
      </div>
      {children}
    </motion.div>
  );
}
