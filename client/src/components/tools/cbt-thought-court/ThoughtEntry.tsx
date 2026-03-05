import type { AgeMode } from "./CBTThoughtCourt";

// ── Types ──────────────────────────────────────────────────────────────────

export interface ThoughtEntryProps {
  thought: string;
  situation: string;
  onThoughtChange: (value: string) => void;
  onSituationChange: (value: string) => void;
  ageMode: AgeMode;
}

// ── Colors ─────────────────────────────────────────────────────────────────

const GOLD = "#d4a853";
const PARCHMENT = "#f0e8d8";
const INPUT_BG = "rgba(15, 10, 25, 0.7)";
const INPUT_BORDER = "rgba(120, 100, 180, 0.3)";
const INPUT_BORDER_FOCUS = GOLD;

// ── Placeholder text by age ────────────────────────────────────────────────

const THOUGHT_PLACEHOLDERS: Record<AgeMode, string> = {
  child: "What is the tricky thought? (e.g., 'Nobody likes me')",
  teen: "What's the negative thought? (e.g., 'I always mess everything up')",
  adult:
    "What is the automatic thought? (e.g., 'I'm not competent enough for this role')",
};

const SITUATION_PLACEHOLDERS: Record<AgeMode, string> = {
  child: "What happened that made you think this?",
  teen: "What was going on when this thought popped up?",
  adult: "Describe the situation that triggered this thought",
};

// ── Shared textarea style ──────────────────────────────────────────────────

const textareaBase: React.CSSProperties = {
  width: "100%",
  minHeight: 100,
  padding: "12px 14px",
  background: INPUT_BG,
  border: `1.5px solid ${INPUT_BORDER}`,
  borderRadius: 10,
  color: PARCHMENT,
  fontSize: 14,
  fontFamily: "Inter, sans-serif",
  lineHeight: 1.5,
  resize: "vertical",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.2s",
};

// ── Component ──────────────────────────────────────────────────────────────

export function ThoughtEntry({
  thought,
  situation,
  onThoughtChange,
  onSituationChange,
  ageMode,
}: ThoughtEntryProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* ── Filing a Case header ──────────────────────────── */}
      <div
        style={{
          textAlign: "center",
          padding: "10px 0 4px",
        }}
      >
        <span style={{ fontSize: 26 }}>{"\uD83D\uDCDC"}</span>
        <h3
          style={{
            margin: "6px 0 0",
            fontSize: 16,
            fontWeight: 700,
            color: PARCHMENT,
            letterSpacing: 0.5,
          }}
        >
          Filing a Case
        </h3>
      </div>

      {/* ── Thought textarea ─────────────────────────────── */}
      <div>
        <label
          style={{
            display: "block",
            marginBottom: 8,
            fontSize: 13,
            fontWeight: 600,
            color: GOLD,
            letterSpacing: 0.3,
          }}
        >
          The Thought on Trial
        </label>
        <textarea
          value={thought}
          onChange={(e) => onThoughtChange(e.target.value)}
          placeholder={THOUGHT_PLACEHOLDERS[ageMode]}
          style={textareaBase}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = INPUT_BORDER_FOCUS;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = INPUT_BORDER;
          }}
        />
      </div>

      {/* ── Situation textarea ───────────────────────────── */}
      <div>
        <label
          style={{
            display: "block",
            marginBottom: 8,
            fontSize: 13,
            fontWeight: 600,
            color: GOLD,
            letterSpacing: 0.3,
          }}
        >
          The Scene of the Crime
        </label>
        <textarea
          value={situation}
          onChange={(e) => onSituationChange(e.target.value)}
          placeholder={SITUATION_PLACEHOLDERS[ageMode]}
          style={textareaBase}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = INPUT_BORDER_FOCUS;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = INPUT_BORDER;
          }}
        />
      </div>
    </div>
  );
}
