import type { AgeMode, BodyRegion, LKRecipient } from "./meadow-data";
import { BODY_REGIONS, LK_RECIPIENTS, SENSE_PROMPTS } from "./meadow-data";

interface MeadowSummaryProps {
  arrivalNote: string;
  selectedRegions: BodyRegion[];
  thoughts: string[];
  senses: Record<string, string>;
  recipient: LKRecipient | null;
  phrases: string[];
  finalReflection: string;
  onSetReflection: (t: string) => void;
  onReset: () => void;
  ageMode: AgeMode;
}

function SummaryCard({
  emoji,
  title,
  children,
}: {
  emoji: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "rgba(232, 220, 200, 0.04)",
        border: "1px solid rgba(91, 168, 196, 0.12)",
        borderRadius: 14,
        padding: "14px 16px",
        marginBottom: 10,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 10,
        }}
      >
        <span style={{ fontSize: 18 }}>{emoji}</span>
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "#7ec8e3",
            textTransform: "uppercase",
            letterSpacing: "0.07em",
          }}
        >
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

export function MeadowSummary({
  arrivalNote,
  selectedRegions,
  thoughts,
  senses,
  recipient,
  phrases,
  finalReflection,
  onSetReflection,
  onReset,
}: MeadowSummaryProps) {
  const recipientInfo = recipient ? LK_RECIPIENTS.find((r) => r.id === recipient) : null;
  const regionLabels = selectedRegions.map(
    (id) => BODY_REGIONS.find((r) => r.id === id)?.label ?? id,
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <div
        style={{
          textAlign: "center",
          padding: "8px 0 16px",
          borderBottom: "1px solid rgba(91, 168, 196, 0.1)",
          marginBottom: 12,
        }}
      >
        <div style={{ fontSize: 32, marginBottom: 4 }}>🌿</div>
        <p
          style={{
            fontSize: 13,
            color: "rgba(232, 220, 200, 0.55)",
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          You've completed this mindfulness practice. Here's what you noticed.
        </p>
      </div>

      {arrivalNote && (
        <SummaryCard emoji="🍃" title="What You Arrived With">
          <p
            style={{
              fontSize: 13,
              color: "rgba(232, 220, 200, 0.8)",
              margin: 0,
              lineHeight: 1.7,
              fontStyle: "italic",
            }}
          >
            "{arrivalNote}"
          </p>
        </SummaryCard>
      )}

      {regionLabels.length > 0 && (
        <SummaryCard emoji="🫀" title="Body Tension Areas">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {regionLabels.map((label) => (
              <span
                key={label}
                style={{
                  background: "rgba(91, 168, 196, 0.15)",
                  border: "1px solid rgba(91, 168, 196, 0.3)",
                  borderRadius: 20,
                  padding: "3px 10px",
                  fontSize: 12,
                  color: "#7ec8e3",
                }}
              >
                {label}
              </span>
            ))}
          </div>
        </SummaryCard>
      )}

      {thoughts.length > 0 && (
        <SummaryCard emoji="☁️" title="Thought Clouds">
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {thoughts.map((thought) => (
              <p
                key={thought}
                style={{
                  fontSize: 13,
                  color: "rgba(232, 220, 200, 0.75)",
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                <span style={{ color: "rgba(139, 159, 212, 0.6)", fontStyle: "italic" }}>I notice: </span>
                {thought}
              </p>
            ))}
          </div>
        </SummaryCard>
      )}

      {SENSE_PROMPTS.some((p) => (senses[p.sense] || "").trim()) && (
        <SummaryCard emoji="🌸" title="Mindful Senses">
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {SENSE_PROMPTS.filter((p) => (senses[p.sense] || "").trim()).map(
              ({ sense, emoji, label }) => (
                <div key={sense} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 14, flexShrink: 0 }}>{emoji}</span>
                  <div>
                    <span
                      style={{
                        fontSize: 10,
                        color: "rgba(212, 180, 76, 0.6)",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {label}:{" "}
                    </span>
                    <span style={{ fontSize: 12, color: "rgba(232, 220, 200, 0.75)" }}>
                      {senses[sense]}
                    </span>
                  </div>
                </div>
              ),
            )}
          </div>
        </SummaryCard>
      )}

      {recipientInfo && phrases.length > 0 && (
        <SummaryCard emoji="💛" title={`Loving-Kindness — ${recipientInfo.label}`}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {phrases.map((phrase, i) => (
              <p
                key={i}
                style={{
                  fontSize: 13,
                  color: "rgba(232, 220, 200, 0.8)",
                  margin: 0,
                  fontStyle: "italic",
                  lineHeight: 1.6,
                }}
              >
                {phrase}
              </p>
            ))}
          </div>
        </SummaryCard>
      )}

      <div
        style={{
          background: "rgba(91, 168, 196, 0.05)",
          border: "1px solid rgba(91, 168, 196, 0.15)",
          borderRadius: 14,
          padding: "14px 16px",
          marginTop: 4,
        }}
      >
        <p
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "#7ec8e3",
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            margin: "0 0 10px",
          }}
        >
          ✨ Final Reflection
        </p>
        <textarea
          value={finalReflection}
          onChange={(e) => onSetReflection(e.target.value)}
          placeholder="What are you taking away from this practice?"
          rows={3}
          style={{
            width: "100%",
            background: "rgba(232, 220, 200, 0.04)",
            border: "1px solid rgba(91, 168, 196, 0.2)",
            borderRadius: 10,
            padding: "10px 12px",
            fontSize: 13,
            color: "#e8dcc8",
            fontFamily: "Inter, sans-serif",
            resize: "vertical",
            outline: "none",
            lineHeight: 1.6,
            boxSizing: "border-box",
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(91, 168, 196, 0.45)"; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(91, 168, 196, 0.2)"; }}
        />
      </div>

      <button
        type="button"
        onClick={onReset}
        style={{
          background: "rgba(91, 168, 196, 0.1)",
          border: "1px solid rgba(91, 168, 196, 0.25)",
          borderRadius: 12,
          padding: "10px 20px",
          fontSize: 13,
          fontWeight: 600,
          color: "#7ec8e3",
          cursor: "pointer",
          fontFamily: "Inter, sans-serif",
          transition: "all 0.2s",
          marginTop: 4,
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = "rgba(91, 168, 196, 0.2)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = "rgba(91, 168, 196, 0.1)";
        }}
      >
        🌿 Begin Again
      </button>
    </div>
  );
}
