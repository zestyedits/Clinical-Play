import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { AgeMode, BodyRegion } from "./meadow-data";
import { TENSION_COLORS, TENSION_LABELS } from "./meadow-data";

interface BodyScanProps {
  bodyRegions: BodyRegion[];
  onUpdateRegion: (id: string, tension: 0 | 1 | 2 | 3 | 4, note?: string) => void;
  ageMode: AgeMode;
}

const TENSION_DOTS = [0, 1, 2, 3, 4] as const;

export function BodyScan({ bodyRegions, onUpdateRegion, ageMode }: BodyScanProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [noteValue, setNoteValue] = useState("");

  const ratedCount = bodyRegions.filter((r) => r.rated).length;
  const selectedRegion = bodyRegions.find((r) => r.id === selectedId) ?? null;

  const handleSelectRegion = (id: string) => {
    const region = bodyRegions.find((r) => r.id === id);
    setSelectedId(id);
    setNoteValue(region?.note ?? "");
  };

  const handleSetTension = (tension: 0 | 1 | 2 | 3 | 4) => {
    if (!selectedId) return;
    onUpdateRegion(selectedId, tension, noteValue);
  };

  const handleNoteBlur = () => {
    if (!selectedId || !selectedRegion) return;
    onUpdateRegion(selectedId, selectedRegion.tension, noteValue);
  };

  const tensionLabels = TENSION_LABELS[ageMode];

  const regionPrompt: Record<AgeMode, string> = {
    child: "Tap a body part to check in with it",
    teen: "Select a body area and rate your tension level",
    adult: "Select each region and rate somatic tension",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(255,255,255,0.55)",
          borderRadius: 12,
          padding: "8px 14px",
          border: "1px solid rgba(76,175,138,0.18)",
        }}
      >
        <span style={{ fontSize: 12, color: "rgba(26,58,46,0.65)", fontWeight: 500 }}>
          {regionPrompt[ageMode]}
        </span>
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: ratedCount >= 3 ? "#4caf8a" : "rgba(26,58,46,0.5)",
          }}
        >
          {ratedCount}/6 checked{ratedCount < 3 ? " \u2014 need 3+" : " \u2713"}
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 8,
        }}
      >
        {bodyRegions.map((region) => {
          const isSelected = selectedId === region.id;
          const tColor = TENSION_COLORS[region.tension];
          return (
            <motion.button
              key={region.id}
              onClick={() => handleSelectRegion(region.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                background: isSelected
                  ? "rgba(255,255,255,0.85)"
                  : region.rated
                  ? "rgba(255,255,255,0.65)"
                  : "rgba(255,255,255,0.4)",
                border: isSelected
                  ? `2px solid ${tColor}`
                  : region.rated
                  ? `1px solid ${tColor}60`
                  : "1px solid rgba(76,175,138,0.2)",
                borderRadius: 12,
                padding: "12px 14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontFamily: "Inter, sans-serif",
                textAlign: "left",
                boxShadow: isSelected ? `0 4px 16px ${tColor}25` : "none",
                transition: "box-shadow 0.2s, border 0.2s",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: region.rated ? `${tColor}20` : "rgba(76,175,138,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  flexShrink: 0,
                  border: region.rated ? `2px solid ${tColor}40` : "2px solid transparent",
                }}
              >
                {region.emoji}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#1a3a2e", marginBottom: 2 }}>
                  {region.label}
                </div>
                {region.rated ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: tColor,
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: 10, color: tColor, fontWeight: 600 }}>
                      {tensionLabels[region.tension]}
                    </span>
                  </div>
                ) : (
                  <span style={{ fontSize: 10, color: "rgba(26,58,46,0.45)" }}>
                    {ageMode === "child" ? "tap to check in" : "not yet rated"}
                  </span>
                )}
              </div>
              {region.rated && (
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: tColor,
                    flexShrink: 0,
                  }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedRegion && (
          <motion.div
            key={selectedRegion.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.25 }}
            style={{
              background: "rgba(255,255,255,0.8)",
              borderRadius: 14,
              padding: "16px",
              border: `1px solid ${TENSION_COLORS[selectedRegion.tension]}40`,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 20 }}>{selectedRegion.emoji}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#1a3a2e" }}>
                {selectedRegion.label}
              </span>
            </div>

            <div>
              <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 600, color: "rgba(26,58,46,0.7)" }}>
                {ageMode === "child" ? "How does it feel?" : ageMode === "teen" ? "Tension level:" : "Somatic tension rating:"}
              </p>
              <div style={{ display: "flex", gap: 6 }}>
                {TENSION_DOTS.map((level) => {
                  const color = TENSION_COLORS[level];
                  const isActive = selectedRegion.tension === level && selectedRegion.rated;
                  return (
                    <motion.button
                      key={level}
                      onClick={() => handleSetTension(level)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title={tensionLabels[level]}
                      style={{
                        flex: 1,
                        padding: "8px 4px",
                        background: isActive ? color : `${color}20`,
                        border: isActive ? `2px solid ${color}` : `1px solid ${color}40`,
                        borderRadius: 8,
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 3,
                        transition: "all 0.15s",
                      }}
                    >
                      <div
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: "50%",
                          background: color,
                          opacity: isActive ? 1 : 0.5,
                        }}
                      />
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: isActive ? 700 : 500,
                          color: isActive ? color : "rgba(26,58,46,0.5)",
                          textAlign: "center",
                          lineHeight: 1.2,
                        }}
                      >
                        {level}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
              {selectedRegion.rated && (
                <p style={{ margin: "6px 0 0", fontSize: 11, color: TENSION_COLORS[selectedRegion.tension], fontWeight: 600 }}>
                  {tensionLabels[selectedRegion.tension]}
                </p>
              )}
            </div>

            <div>
              <p style={{ margin: "0 0 5px", fontSize: 12, fontWeight: 500, color: "rgba(26,58,46,0.6)" }}>
                {ageMode === "child" ? "Anything you want to say about it? (optional)" : "Optional note:"}
              </p>
              <textarea
                value={noteValue}
                onChange={(e) => setNoteValue(e.target.value)}
                onBlur={handleNoteBlur}
                rows={2}
                placeholder={
                  ageMode === "child"
                    ? "e.g. my shoulders feel tight..."
                    : ageMode === "teen"
                    ? "e.g. tight from sitting at a desk..."
                    : "e.g. chronic upper trapezius tension..."
                }
                style={{
                  width: "100%",
                  borderRadius: 8,
                  border: "1px solid rgba(76,175,138,0.25)",
                  background: "rgba(255,255,255,0.7)",
                  padding: "8px 10px",
                  fontSize: 12,
                  color: "#1a3a2e",
                  fontFamily: "Inter, sans-serif",
                  resize: "none",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {!selectedRegion.rated && (
              <p style={{ margin: 0, fontSize: 11, color: "rgba(26,58,46,0.5)", textAlign: "center" }}>
                Tap a tension level above to rate this region
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {ratedCount >= 3 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            background: "rgba(76,175,138,0.1)",
            border: "1px solid rgba(76,175,138,0.3)",
            borderRadius: 12,
            padding: "10px 16px",
            textAlign: "center",
            fontSize: 12,
            fontWeight: 600,
            color: "#2e7d52",
          }}
        >
          {"\u2728"} {ageMode === "child"
            ? "Great job checking in with your body!"
            : ageMode === "teen"
            ? "Body scan complete \u2014 great awareness!"
            : "Somatic inventory recorded. You may proceed."}
        </motion.div>
      )}
    </div>
  );
}
