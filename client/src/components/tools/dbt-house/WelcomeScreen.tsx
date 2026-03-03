interface WelcomeScreenProps {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div
      data-testid="dbt-house-welcome"
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #2d2820 0%, #3d352a 30%, #2a3a2a 70%, #1e2a1e 100%)",
        fontFamily: "Inter, sans-serif",
        color: "#f0e8d8",
        overflow: "auto",
        borderRadius: 12,
      }}
    >
      <div
        style={{
          maxWidth: 480,
          width: "90%",
          padding: "36px 24px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 8, lineHeight: 1 }}>{"\u{1F3E1}"}</div>

        <h1
          style={{
            fontSize: "clamp(22px, 4.5vw, 30px)",
            fontWeight: 700,
            margin: "0 0 6px",
            letterSpacing: "-0.5px",
            color: "#f0e8d8",
          }}
        >
          The DBT House
        </h1>

        <p
          style={{
            fontSize: "clamp(12px, 2.2vw, 14px)",
            color: "rgba(240, 232, 216, 0.6)",
            margin: "0 0 24px",
            fontWeight: 400,
          }}
        >
          Build Your Skills, Layer by Layer
        </p>

        <div
          style={{
            background: "rgba(240, 232, 216, 0.06)",
            borderRadius: 12,
            padding: "18px 16px",
            marginBottom: 24,
            border: "1px solid rgba(160, 146, 107, 0.2)",
            textAlign: "left",
          }}
        >
          <p
            style={{
              fontSize: "clamp(12px, 2.2vw, 14px)",
              lineHeight: 1.75,
              margin: 0,
              color: "rgba(240, 232, 216, 0.85)",
            }}
          >
            In this activity, you'll build a house from the ground up. Each
            layer represents a core DBT skill area. Place a layer, then tap on
            the items inside to explore discussion prompts and therapeutic
            activities.
          </p>

          <p
            style={{
              fontSize: "clamp(11px, 2vw, 13px)",
              lineHeight: 1.75,
              margin: "12px 0 0",
              color: "rgba(240, 232, 216, 0.6)",
            }}
          >
            <strong style={{ color: "rgba(240, 232, 216, 0.85)" }}>
              How it works:
            </strong>{" "}
            Place the Foundation first, then unlock each floor above it. Complete
            all the activities on a floor to master that skill set.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 6,
            marginBottom: 24,
          }}
        >
          {[
            { icon: "\u{1F3E0}", label: "Foundation", sub: "Crisis Survival" },
            { icon: "\u{1FAB4}", label: "Living Room", sub: "Mindfulness" },
            { icon: "\u{1F4D6}", label: "Study", sub: "Interpersonal Skills" },
            { icon: "\u{1F33F}", label: "Zen Space", sub: "Wise Mind" },
          ].map((floor, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(240, 232, 216, 0.04)",
                borderRadius: 8,
                padding: "8px 10px",
                border: "1px solid rgba(160, 146, 107, 0.1)",
              }}
            >
              <span style={{ fontSize: 16 }}>{floor.icon}</span>
              <div style={{ textAlign: "left" }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "rgba(240, 232, 216, 0.85)",
                  }}
                >
                  {floor.label}
                </div>
                <div
                  style={{
                    fontSize: 9,
                    color: "rgba(240, 232, 216, 0.45)",
                    marginTop: 1,
                  }}
                >
                  {floor.sub}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onStart}
          data-testid="button-start-dbt-house"
          style={{
            background: "linear-gradient(135deg, #6b8b6b, #5a7a5a)",
            color: "#f0e8d8",
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
          onMouseOver={(e) =>
            (e.currentTarget.style.transform = "translateY(-2px)")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.transform = "translateY(0)")
          }
        >
          Start Building
        </button>
      </div>
    </div>
  );
}
