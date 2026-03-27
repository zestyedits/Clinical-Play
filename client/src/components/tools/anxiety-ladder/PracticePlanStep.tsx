import { motion } from "framer-motion";
import type { AgeMode, LadderRung } from "./ladder-data";
import { getSudsColor } from "./ladder-data";

interface PracticePlanStepProps {
  startingRung: LadderRung | null;
  whenWhere: string;
  support: string;
  selfTalk: string;
  sudsGoal: number;
  onSetWhenWhere: (t: string) => void;
  onSetSupport: (t: string) => void;
  onSetSelfTalk: (t: string) => void;
  onSetSudsGoal: (n: number) => void;
  ageMode: AgeMode;
}

export function PracticePlanStep({
  startingRung,
  whenWhere,
  support,
  selfTalk,
  sudsGoal,
  onSetWhenWhere,
  onSetSupport,
  onSetSelfTalk,
  onSetSudsGoal,
  ageMode,
}: PracticePlanStepProps) {
  const rungColor = startingRung ? getSudsColor(startingRung.suds) : "#64a8d4";
  const maxGoal = startingRung ? startingRung.suds : 100;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {startingRung ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: "12px 14px",
            borderRadius: 12,
            borderLeft: `4px solid ${rungColor}`,
            background: `${rungColor}10`,
            border: `1px solid ${rungColor}25`,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 600, color: rungColor, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>
            {"\uD83E\uDE9C"} Your Starting Rung
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#e8dcc8", marginBottom: 4 }}>
            {startingRung.description}
          </div>
          <div style={{ fontSize: 12, color: "rgba(232, 220, 200, 0.5)" }}>
            Current SUDS: <span style={{ color: rungColor, fontWeight: 700 }}>{startingRung.suds}</span>
          </div>
        </motion.div>
      ) : (
        <div
          style={{
            padding: "12px 14px",
            borderRadius: 12,
            background: "rgba(232, 220, 200, 0.04)",
            border: "1px dashed rgba(232, 220, 200, 0.1)",
            color: "rgba(232, 220, 200, 0.35)",
            fontSize: 12,
          }}
        >
          Complete the ladder step first to see your starting rung here.
        </div>
      )}

      <div
        style={{
          background: "rgba(128, 144, 212, 0.06)",
          borderRadius: 10,
          padding: "10px 12px",
          borderLeft: "3px solid rgba(128, 144, 212, 0.3)",
        }}
      >
        <p style={{ margin: 0, fontSize: 12, color: "rgba(232, 220, 200, 0.65)", lineHeight: 1.6 }}>
          {ageMode === "child"
            ? "Let's plan when you'll practice your first brave step!"
            : ageMode === "teen"
            ? "Planning when and where you'll do your first exposure makes it much more likely to happen."
            : "Specify the time, place, and conditions for your first exposure practice. Concrete plans dramatically increase follow-through."}
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: "#8090d4" }}>
          {ageMode === "child" ? "When and where will you practice?" : "When and where will you practice? *"}
        </label>
        <textarea
          value={whenWhere}
          onChange={(e) => onSetWhenWhere(e.target.value)}
          placeholder={
            ageMode === "child"
              ? "e.g. Saturday afternoon at home with Mum..."
              : "e.g. Tuesday after school, at the local park for 15 minutes..."
          }
          rows={2}
          style={{
            width: "100%",
            padding: "10px 12px",
            background: "rgba(232, 220, 200, 0.05)",
            border: whenWhere.trim().length >= 20
              ? "1.5px solid rgba(128, 144, 212, 0.4)"
              : "1px solid rgba(232, 220, 200, 0.12)",
            borderRadius: 10,
            color: "#e8dcc8",
            fontSize: 13,
            fontFamily: "Inter, sans-serif",
            lineHeight: 1.6,
            resize: "vertical",
            outline: "none",
            boxSizing: "border-box",
            transition: "border-color 0.2s",
          }}
        />
        <span style={{ fontSize: 11, color: "rgba(232, 220, 200, 0.3)" }}>
          {whenWhere.trim().length < 20
            ? `${20 - whenWhere.trim().length} more characters needed`
            : "\u2713 Got it"}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(232, 220, 200, 0.65)" }}>
          {ageMode === "child" ? "Who will be with you? (optional)" : "Support person (optional)"}
        </label>
        <textarea
          value={support}
          onChange={(e) => onSetSupport(e.target.value)}
          placeholder={
            ageMode === "child"
              ? "e.g. Mum will be nearby..."
              : ageMode === "teen"
              ? "e.g. A friend, parent, or therapist who knows about this..."
              : "e.g. My partner will be available by phone, or I will go alone..."
          }
          rows={2}
          style={{
            width: "100%",
            padding: "10px 12px",
            background: "rgba(232, 220, 200, 0.05)",
            border: "1px solid rgba(232, 220, 200, 0.1)",
            borderRadius: 10,
            color: "#e8dcc8",
            fontSize: 13,
            fontFamily: "Inter, sans-serif",
            lineHeight: 1.6,
            resize: "vertical",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: "#8090d4" }}>
          {ageMode === "child" ? "What will you tell yourself before you start? *" : "What will you say to yourself before starting? *"}
        </label>
        <textarea
          value={selfTalk}
          onChange={(e) => onSetSelfTalk(e.target.value)}
          placeholder={
            ageMode === "child"
              ? "e.g. I am brave and I can do this!"
              : ageMode === "teen"
              ? "e.g. This will be uncomfortable but not dangerous. I can handle it."
              : "e.g. Anxiety is temporary and manageable. I am safe and capable."
          }
          rows={2}
          style={{
            width: "100%",
            padding: "10px 12px",
            background: "rgba(232, 220, 200, 0.05)",
            border: selfTalk.trim().length >= 10
              ? "1.5px solid rgba(128, 144, 212, 0.4)"
              : "1px solid rgba(232, 220, 200, 0.12)",
            borderRadius: 10,
            color: "#e8dcc8",
            fontSize: 13,
            fontFamily: "Inter, sans-serif",
            lineHeight: 1.6,
            resize: "vertical",
            outline: "none",
            boxSizing: "border-box",
            transition: "border-color 0.2s",
          }}
        />
        <span style={{ fontSize: 11, color: "rgba(232, 220, 200, 0.3)" }}>
          {selfTalk.trim().length < 10
            ? `${10 - selfTalk.trim().length} more characters needed`
            : "\u2713 Ready"}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(232, 220, 200, 0.65)" }}>
            {ageMode === "child" ? "SUDS I hope to reach after practice:" : "Target SUDS goal after exposure:"}
          </label>
          <span style={{ fontSize: 15, fontWeight: 700, color: getSudsColor(sudsGoal), fontFamily: "'Lora', Georgia, serif" }}>
            {sudsGoal}
          </span>
        </div>
        <div style={{ position: "relative" }}>
          <div
            style={{
              height: 6,
              borderRadius: 3,
              background: "linear-gradient(to right, #60c480 0%, #d4b44c 40%, #d47060 70%, #c03030 100%)",
              marginBottom: 4,
            }}
          />
          <input
            type="range"
            min={0}
            max={maxGoal}
            step={1}
            value={sudsGoal}
            onChange={(e) => onSetSudsGoal(parseInt(e.target.value))}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              opacity: 0,
              height: 20,
              cursor: "pointer",
              margin: 0,
            }}
          />
        </div>
        <div
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            background: "rgba(128, 144, 212, 0.06)",
            border: "1px solid rgba(128, 144, 212, 0.1)",
            fontSize: 11,
            color: "rgba(232, 220, 200, 0.5)",
            fontStyle: "italic",
            lineHeight: 1.5,
          }}
        >
          {ageMode === "child"
            ? "\uD83D\uDCAA The goal isn't to feel zero worry \u2014 it's to show yourself you can handle it!"
            : "The goal isn't zero anxiety \u2014 it's proving you can tolerate and function through it."}
        </div>
      </div>
    </div>
  );
}
