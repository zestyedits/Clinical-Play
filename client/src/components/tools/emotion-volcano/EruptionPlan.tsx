import { motion, AnimatePresence } from "framer-motion";
import { PLAN_TIERS, BODY_REGIONS, COOLING_TECHNIQUES } from "./volcano-data";
import type { AgeMode } from "./volcano-data";
import type { WarningSigns, PlanItem } from "./EmotionVolcano";

interface EruptionPlanProps {
  plan: PlanItem[];
  warningSigns: WarningSigns[];
  selectedTechniques: string[];
  ageMode: AgeMode;
  onAddItem: (item: PlanItem) => void;
  onRemoveItem: (tier: string, id: string) => void;
}

export function EruptionPlan({ plan, warningSigns, selectedTechniques, ageMode, onAddItem, onRemoveItem }: EruptionPlanProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Intro */}
      <div style={{
        background: "rgba(124,184,124,0.06)",
        border: "1px solid rgba(124,184,124,0.12)",
        borderRadius: 12,
        padding: 14,
      }}>
        <p style={{ margin: 0, fontSize: 12, color: "rgba(240,232,216,0.5)", lineHeight: 1.5 }}>
          {ageMode === "child"
            ? "Build your 3-step plan! Pick warning signs so you know when the volcano is rumbling, then choose your quick and big cooling powers."
            : ageMode === "teen"
            ? "Create your 3-tier prevention plan: pick your early warning signs, choose quick first-response techniques, and select your full cool-down strategies."
            : "Construct a tiered response plan: identify early physiological warning signals, select rapid first-response interventions, and designate extended regulation strategies for complete cool-down."}
        </p>
      </div>

      {/* Plan tiers */}
      {PLAN_TIERS.map((tier) => {
        const tierItems = plan.filter((p) => p.tier === tier.id);
        const isFull = tierItems.length >= tier.maxItems;

        // Available items for this tier
        const availableItems = tier.id === "early-warning"
          ? warningSigns.flatMap((w) => {
              const region = BODY_REGIONS.find((r) => r.id === w.regionId)!;
              return w.sensations.map((s) => ({
                id: `${w.regionId}-${s}`,
                label: `${region.emoji} ${region.label}: ${s}`,
                type: "warning" as const,
              }));
            })
          : COOLING_TECHNIQUES
              .filter((t) => {
                if (tier.id === "first-response") return t.speed === "instant" && selectedTechniques.includes(t.id);
                return (t.speed === "short" || t.speed === "extended") && selectedTechniques.includes(t.id);
              })
              .map((t) => ({
                id: t.id,
                label: `${t.emoji} ${t.name}`,
                type: "technique" as const,
              }));

        const unassignedItems = availableItems.filter(
          (item) => !tierItems.some((p) => p.id === item.id)
        );

        return (
          <div key={tier.id}>
            {/* Tier header */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 18 }}>{tier.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: tier.color }}>{tier.label}</div>
                <div style={{ fontSize: 11, color: "rgba(240,232,216,0.4)" }}>
                  {tier.description[ageMode]}
                </div>
              </div>
              <div style={{
                fontSize: 11, fontWeight: 600,
                color: isFull ? tier.color : "rgba(240,232,216,0.3)",
                background: isFull ? `${tier.color}15` : "transparent",
                padding: "2px 8px",
                borderRadius: 6,
              }}>
                {tierItems.length}/{tier.maxItems}
              </div>
            </div>

            {/* Assigned items */}
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 8 }}>
              <AnimatePresence>
                {tierItems.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 12px",
                      background: `${tier.color}0a`,
                      border: `1px solid ${tier.color}20`,
                      borderRadius: 10,
                    }}
                  >
                    <div style={{
                      width: 6, height: 6, borderRadius: "50%",
                      background: tier.color,
                      flexShrink: 0,
                    }} />
                    <span style={{ flex: 1, fontSize: 12, color: "rgba(240,232,216,0.7)" }}>
                      {item.label}
                    </span>
                    <motion.button
                      onClick={() => onRemoveItem(tier.id, item.id)}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.8 }}
                      style={{
                        background: "none",
                        border: "none",
                        color: "rgba(240,232,216,0.3)",
                        cursor: "pointer",
                        fontSize: 14,
                        padding: 2,
                        lineHeight: 1,
                      }}
                    >
                      ×
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Available items to add */}
            {!isFull && unassignedItems.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {unassignedItems.map((item) => (
                  <motion.button
                    key={item.id}
                    onClick={() => onAddItem({
                      tier: tier.id,
                      type: item.type,
                      id: item.id,
                      label: item.label,
                    })}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "5px 10px",
                      borderRadius: 8,
                      border: "1px dashed rgba(240,232,216,0.12)",
                      background: "rgba(240,232,216,0.02)",
                      cursor: "pointer",
                      fontSize: 11,
                      color: "rgba(240,232,216,0.45)",
                      transition: "all 0.15s",
                    }}
                  >
                    <span style={{ color: tier.color, fontWeight: 600 }}>+</span>
                    {item.label}
                  </motion.button>
                ))}
              </div>
            )}

            {!isFull && unassignedItems.length === 0 && tierItems.length === 0 && (
              <div style={{
                padding: "12px 14px",
                borderRadius: 10,
                border: "1px dashed rgba(240,232,216,0.08)",
                textAlign: "center",
                fontSize: 11,
                color: "rgba(240,232,216,0.25)",
              }}>
                {tier.id === "early-warning"
                  ? ageMode === "child"
                    ? "Go back and tap on your body to find warning signs!"
                    : "Map body warning signs in Step 3 to populate this tier"
                  : ageMode === "child"
                  ? "Go back and pick some cooling powers first!"
                  : "Select techniques in Step 4 to populate this tier"}
              </div>
            )}
          </div>
        );
      })}

      {/* Plan summary */}
      {plan.length >= 3 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: "rgba(124,184,124,0.08)",
            border: "1px solid rgba(124,184,124,0.15)",
            borderRadius: 14,
            padding: 14,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 20, marginBottom: 4 }}>✅</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#7cb87c" }}>
            {ageMode === "child" ? "Your plan is ready!" : "Prevention plan complete"}
          </div>
          <div style={{ fontSize: 11, color: "rgba(240,232,216,0.4)", marginTop: 2 }}>
            {plan.length} items across {PLAN_TIERS.filter((t) => plan.some((p) => p.tier === t.id)).length} tiers
          </div>
        </motion.div>
      )}
    </div>
  );
}
