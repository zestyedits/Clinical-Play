interface WelcomeScreenProps {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div
      data-testid="grounding-grove-welcome"
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #1a2a1a 0%, #2a3a2a 30%, #1e3028 70%, #162016 100%)",
        fontFamily: "Inter, sans-serif",
        color: "#d4e8d0",
        overflow: "auto",
        borderRadius: 12,
      }}
    >
      <div style={{ maxWidth: 480, width: "90%", padding: "36px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 8, lineHeight: 1 }}>{"\u{1F333}"}</div>

        <h1 style={{ fontSize: "clamp(22px, 4.5vw, 30px)", fontWeight: 700, margin: "0 0 6px", letterSpacing: "-0.5px", color: "#d4e8d0" }}>
          The Grounding Grove
        </h1>

        <p style={{ fontSize: "clamp(12px, 2.2vw, 14px)", color: "rgba(212, 232, 208, 0.6)", margin: "0 0 24px", fontWeight: 400 }}>
          Return to Your Body, One Region at a Time
        </p>

        <div style={{ background: "rgba(212, 232, 208, 0.06)", borderRadius: 12, padding: "18px 16px", marginBottom: 24, border: "1px solid rgba(100, 160, 100, 0.2)", textAlign: "left" }}>
          <p style={{ fontSize: "clamp(12px, 2.2vw, 14px)", lineHeight: 1.75, margin: 0, color: "rgba(212, 232, 208, 0.85)" }}>
            In this activity, you'll explore different areas of your body to notice where you hold tension, stress, or discomfort. For each region, you'll try grounding techniques designed to help you reconnect and release.
          </p>
          <p style={{ fontSize: "clamp(11px, 2vw, 13px)", lineHeight: 1.75, margin: "12px 0 0", color: "rgba(212, 232, 208, 0.6)" }}>
            <strong style={{ color: "rgba(212, 232, 208, 0.85)" }}>How it works:</strong>{" "}
            Tap on a body region to rate your tension level, then try the grounding exercises. Your clinician will guide you through discussion prompts along the way.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 24 }}>
          {[
            { icon: "\u{1F9E0}", label: "Head & Mind", sub: "Mental grounding" },
            { icon: "\u{1F49A}", label: "Chest & Heart", sub: "Breath & calm" },
            { icon: "\u{270B}", label: "Hands", sub: "Tactile focus" },
            { icon: "\u{1F463}", label: "Feet & Roots", sub: "Earth connection" },
          ].map((area, i) => (
            <div
              key={i}
              style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(212, 232, 208, 0.04)", borderRadius: 8, padding: "8px 10px", border: "1px solid rgba(100, 160, 100, 0.1)" }}
            >
              <span style={{ fontSize: 16 }}>{area.icon}</span>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(212, 232, 208, 0.85)" }}>{area.label}</div>
                <div style={{ fontSize: 9, color: "rgba(212, 232, 208, 0.45)", marginTop: 1 }}>{area.sub}</div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onStart}
          data-testid="button-start-grounding-grove"
          style={{
            background: "linear-gradient(135deg, #3a6b3a, #2d5a2d)",
            color: "#d4e8d0",
            border: "none",
            borderRadius: 10,
            padding: "14px 40px",
            fontSize: "clamp(14px, 2.8vw, 16px)",
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "Inter, sans-serif",
            boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
            width: "100%",
            maxWidth: 260,
            transition: "transform 0.15s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "translateY(0)")}
        >
          Enter the Grove
        </button>
      </div>
    </div>
  );
}
