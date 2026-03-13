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
        background: "#1c1e2a",
        fontFamily: "'Lora', 'Georgia', serif",
        color: "#e0ddd5",
        overflow: "auto",
        borderRadius: 12,
        position: "relative",
      }}
    >
      <div style={{
        position: "absolute", inset: 0, opacity: 0.06,
        background: "radial-gradient(ellipse 80% 50% at 50% 80%, rgba(212, 168, 83, 0.4), transparent)",
      }} />

      <div style={{ maxWidth: 460, width: "90%", padding: "36px 24px", textAlign: "center", position: "relative", zIndex: 1 }}>
        <svg width="80" height="48" viewBox="0 0 80 48" style={{ marginBottom: 16, opacity: 0.85 }}>
          <path d="M 5 38 Q 40 8 75 38" stroke="#c4a25a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M 5 38 Q 40 12 75 38" stroke="rgba(196, 162, 90, 0.15)" strokeWidth="10" fill="none" strokeLinecap="round" />
          {[0, 0.2, 0.4, 0.6, 0.8, 1].map((t, i) => {
            const x = 5 + t * 70;
            const y = 38 - Math.sin(t * Math.PI) * 26 - t * 4;
            return <circle key={i} cx={x} cy={y} r="3" fill={i === 5 ? "#d4a853" : "rgba(196, 162, 90, 0.5)"} />;
          })}
        </svg>

        <h1 style={{ fontSize: "clamp(24px, 5vw, 32px)", fontWeight: 600, margin: "0 0 6px", letterSpacing: "-0.3px", color: "#e0ddd5", lineHeight: 1.2 }}>
          The Miracle Bridge
        </h1>

        <p style={{ fontSize: "clamp(13px, 2.4vw, 15px)", color: "rgba(224, 221, 213, 0.5)", margin: "0 0 28px", fontFamily: "Inter, sans-serif", fontWeight: 400, fontStyle: "italic" }}>
          A journey from where you are to where you want to be
        </p>

        <div style={{ background: "rgba(224, 221, 213, 0.04)", borderRadius: 14, padding: "20px 18px", marginBottom: 28, border: "1px solid rgba(196, 162, 90, 0.12)", textAlign: "left" }}>
          <p style={{ fontSize: "clamp(13px, 2.3vw, 15px)", lineHeight: 1.8, margin: 0, color: "rgba(224, 221, 213, 0.8)", fontFamily: "Inter, sans-serif" }}>
            You'll cross seven stepping stones, each one asking a question rooted in Solution-Focused therapy. By the end, you'll have a clear picture of the future you're building — and evidence that it's already started.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "center", marginBottom: 28, flexWrap: "wrap" }}>
          {[
            { label: "Name your starting point", color: "#8a7768" },
            { label: "Envision the miracle", color: "#9b87c4" },
            { label: "Find what's working", color: "#c4943a" },
            { label: "See the full picture", color: "#d4a853" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: item.color, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: "rgba(224, 221, 213, 0.55)", fontFamily: "Inter, sans-serif" }}>{item.label}</span>
              {i < 3 && <span style={{ color: "rgba(224, 221, 213, 0.15)", marginLeft: 4, fontFamily: "Inter, sans-serif" }}>/</span>}
            </div>
          ))}
        </div>

        <button
          onClick={onStart}
          data-testid="button-start-miracle-bridge"
          style={{
            background: "#c4a25a",
            color: "#1c1e2a",
            border: "none",
            borderRadius: 10,
            padding: "14px 40px",
            fontSize: "clamp(14px, 2.8vw, 16px)",
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "Inter, sans-serif",
            boxShadow: "0 2px 12px rgba(196, 162, 90, 0.25)",
            width: "100%",
            maxWidth: 240,
            transition: "transform 0.15s, box-shadow 0.15s",
            letterSpacing: "0.3px",
          }}
          onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(196, 162, 90, 0.35)"; }}
          onMouseOut={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(196, 162, 90, 0.25)"; }}
        >
          Begin the Journey
        </button>
      </div>
    </div>
  );
}
