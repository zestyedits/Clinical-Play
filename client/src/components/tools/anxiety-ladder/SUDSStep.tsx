import { motion } from "framer-motion";
import type { AgeMode } from "./ladder-data";
import { getSudsColor, SUDS_LABELS } from "./ladder-data";

interface SUDSStepProps {
  currentSUDS: number;
  bodyDescription: string;
  onSetSUDS: (n: number) => void;
  onSetBodyDesc: (t: string) => void;
  ageMode: AgeMode;
}

export function SUDSStep({ currentSUDS, bodyDescription, onSetSUDS, onSetBodyDesc, ageMode }: SUDSStepProps) {
  const sudsColor = getSudsColor(currentSUDS);
  const sudsLabel = SUDS_LABELS.find((l) => currentSUDS >= l.min && currentSUDS <= l.max);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        style={{
          background: "rgba(96, 196, 128, 0.06)",
          borderRadius: 12,
          padding: "12px 14px",
          borderLeft: "3px solid rgba(96, 196, 128, 0.3)",
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 700, color: "#60c480", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          What is the SUDS Scale?
        </div>
        <p style={{ margin: 0, fontSize: 12, lineHeight: 1.7, color: "rgba(232, 220, 200, 0.72)" }}>
          {ageMode === "child"
            ? "SUDS is a \"worry-meter\" from 0 to 100. 0 means totally calm, 100 means the most scared ever."
            : ageMode === "teen"
            ? "SUDS (Subjective Units of Distress) measures anxiety from 0 (fully relaxed) to 100 (extreme panic). It helps track your exposure progress."
            : "The SUDS scale (0\u2013100) quantifies subjective distress. 0 = completely relaxed, 25 = slight anxiety, 50 = moderate anxiety, 75 = severe anxiety, 100 = extreme panic."}
        </p>
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          {[
            { val: 0, label: "0\nCalm" },
            { val: 25, label: "25\nMild" },
            { val: 50, label: "50\nModerate" },
            { val: 75, label: "75\nSevere" },
            { val: 100, label: "100\nExtreme" },
          ].map((marker) => (
            <div
              key={marker.val}
              style={{
                flex: 1,
                textAlign: "center",
                padding: "6px 4px",
                borderRadius: 8,
                background: `${getSudsColor(marker.val)}12`,
                border: `1px solid ${getSudsColor(marker.val)}25`,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: getSudsColor(marker.val) }}>{marker.val}</div>
              <div style={{ fontSize: 9, color: "rgba(232, 220, 200, 0.45)", lineHeight: 1.3 }}>
                {marker.label.split("\n")[1]}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(232, 220, 200, 0.75)" }}>
            {ageMode === "child" ? "How scared does it make you feel right now?" : "Current anxiety level (right now thinking about it):"}
          </label>
          <motion.div
            key={currentSUDS}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: sudsColor,
              fontFamily: "'Lora', Georgia, serif",
              minWidth: 48,
              textAlign: "right",
            }}
          >
            {currentSUDS}
          </motion.div>
        </div>

        <div style={{ position: "relative" }}>
          <div
            style={{
              height: 8,
              borderRadius: 4,
              background: "linear-gradient(to right, #60c480 0%, #d4b44c 40%, #d47060 70%, #c03030 100%)",
              marginBottom: 8,
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: `${currentSUDS}%`,
                transform: "translate(-50%, -50%)",
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: sudsColor,
                border: "3px solid #0a1218",
                boxShadow: `0 0 10px ${sudsColor}60`,
                pointerEvents: "none",
                transition: "left 0.1s",
              }}
            />
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={currentSUDS}
            onChange={(e) => onSetSUDS(parseInt(e.target.value))}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              opacity: 0,
              height: 24,
              cursor: "pointer",
              margin: 0,
            }}
          />
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 10, color: "rgba(232, 220, 200, 0.3)" }}>0 — Relaxed</span>
            <span style={{ fontSize: 10, color: "rgba(232, 220, 200, 0.3)" }}>100 — Extreme</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 12px",
            borderRadius: 10,
            background: `${sudsColor}12`,
            border: `1px solid ${sudsColor}25`,
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: sudsColor,
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: 13, fontWeight: 600, color: sudsColor }}>
            {sudsLabel?.label ?? "High"} anxiety
          </span>
          <span style={{ fontSize: 12, color: "rgba(232, 220, 200, 0.4)" }}>
            ({currentSUDS}/100)
          </span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(232, 220, 200, 0.75)" }}>
          {ageMode === "child"
            ? "What does your body feel like when you think about it?"
            : "What happens in your body when you feel this anxiety?"}
        </label>
        <textarea
          value={bodyDescription}
          onChange={(e) => onSetBodyDesc(e.target.value)}
          placeholder={
            ageMode === "child"
              ? "e.g. My heart beats fast, my tummy hurts, I want to run away..."
              : "e.g. Racing heart, tight chest, sweaty palms, difficulty breathing..."
          }
          rows={3}
          style={{
            width: "100%",
            padding: "12px 14px",
            background: "rgba(232, 220, 200, 0.05)",
            border: bodyDescription.trim().length >= 20
              ? "1.5px solid rgba(96, 196, 128, 0.4)"
              : "1px solid rgba(232, 220, 200, 0.12)",
            borderRadius: 12,
            color: "#e8dcc8",
            fontSize: 14,
            fontFamily: "Inter, sans-serif",
            lineHeight: 1.6,
            resize: "vertical",
            outline: "none",
            boxSizing: "border-box",
            transition: "border-color 0.2s",
          }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ margin: 0, fontSize: 11, color: "rgba(232, 220, 200, 0.35)" }}>
            {bodyDescription.trim().length < 20
              ? `${20 - bodyDescription.trim().length} more characters needed`
              : "\u2713 Good description"}
          </p>
          <span style={{ fontSize: 11, color: "rgba(232, 220, 200, 0.25)" }}>
            {bodyDescription.trim().length}/20 min
          </span>
        </div>
      </div>
    </div>
  );
}
