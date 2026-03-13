interface WelcomeScreenProps {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div
      data-testid="miracle-bridge-welcome"
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #1a1a2e 0%, #2a2040 30%, #1e2848 70%, #141428 100%)",
        fontFamily: "Inter, sans-serif",
        color: "#d4d0e8",
        overflow: "auto",
        borderRadius: 12,
      }}
    >
      <div style={{ maxWidth: 480, width: "90%", padding: "36px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 8, lineHeight: 1 }}>{"\u{1F309}"}</div>

        <h1 style={{ fontSize: "clamp(22px, 4.5vw, 30px)", fontWeight: 700, margin: "0 0 6px", letterSpacing: "-0.5px", color: "#d4d0e8" }}>
          The Miracle Bridge
        </h1>

        <p style={{ fontSize: "clamp(12px, 2.2vw, 14px)", color: "rgba(212, 208, 232, 0.6)", margin: "0 0 24px", fontWeight: 400 }}>
          Walk Toward Your Preferred Future
        </p>

        <div style={{ background: "rgba(212, 208, 232, 0.06)", borderRadius: 12, padding: "18px 16px", marginBottom: 24, border: "1px solid rgba(120, 100, 180, 0.2)", textAlign: "left" }}>
          <p style={{ fontSize: "clamp(12px, 2.2vw, 14px)", lineHeight: 1.75, margin: 0, color: "rgba(212, 208, 232, 0.85)" }}>
            In this activity, you'll walk across a bridge from where you are today toward your ideal future. Along the way, you'll answer powerful questions that help you discover what you truly want and what's already working.
          </p>
          <p style={{ fontSize: "clamp(11px, 2vw, 13px)", lineHeight: 1.75, margin: "12px 0 0", color: "rgba(212, 208, 232, 0.6)" }}>
            <strong style={{ color: "rgba(212, 208, 232, 0.85)" }}>How it works:</strong>{" "}
            Step by step, move across the bridge. Each stepping stone asks a question rooted in Solution-Focused Brief Therapy. Your answers build a vision of change that's already beginning.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 24 }}>
          {[
            { icon: "\u{1F4CD}", label: "Where You Are", sub: "Name your starting point" },
            { icon: "\u{2728}", label: "The Miracle", sub: "Envision the change" },
            { icon: "\u{1F50D}", label: "Exceptions", sub: "Find what's working" },
            { icon: "\u{1F305}", label: "Miracle Day", sub: "See the full picture" },
          ].map((step, i) => (
            <div
              key={i}
              style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(212, 208, 232, 0.04)", borderRadius: 8, padding: "8px 10px", border: "1px solid rgba(120, 100, 180, 0.1)" }}
            >
              <span style={{ fontSize: 16 }}>{step.icon}</span>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(212, 208, 232, 0.85)" }}>{step.label}</div>
                <div style={{ fontSize: 9, color: "rgba(212, 208, 232, 0.45)", marginTop: 1 }}>{step.sub}</div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onStart}
          data-testid="button-start-miracle-bridge"
          style={{
            background: "linear-gradient(135deg, #5b4a8a, #4a3a7a)",
            color: "#d4d0e8",
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
          Begin the Journey
        </button>
      </div>
    </div>
  );
}
