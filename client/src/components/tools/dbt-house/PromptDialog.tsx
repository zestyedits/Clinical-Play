interface PromptDialogProps {
  prompt: string;
  itemName: string;
  image: string;
  alreadyDiscussed: boolean;
  onMarkDiscussed: () => void;
  onDismiss: () => void;
}

export function PromptDialog({
  prompt,
  itemName,
  image,
  alreadyDiscussed,
  onMarkDiscussed,
  onDismiss,
}: PromptDialogProps) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(6px)",
        zIndex: 40,
        padding: 20,
        animation: "fadeIn 0.25s ease",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onDismiss();
      }}
    >
      <div
        style={{
          background: "linear-gradient(180deg, #3d352a 0%, #2d2820 100%)",
          borderRadius: 18,
          maxWidth: 500,
          width: "100%",
          maxHeight: "90vh",
          border: "1px solid rgba(160, 146, 107, 0.3)",
          boxShadow:
            "0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05) inset",
          fontFamily: "Inter, sans-serif",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column" as const,
          animation: "slideUp 0.3s ease",
        }}
      >
        <div
          style={{
            width: "100%",
            height: 180,
            background: "rgba(107, 139, 107, 0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            position: "relative",
            flexShrink: 0,
          }}
        >
          <img
            src={image}
            alt={itemName}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.9,
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 60,
              background:
                "linear-gradient(transparent, rgba(45, 40, 35, 0.9))",
            }}
          />
          {alreadyDiscussed && (
            <div
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                background: "rgba(107, 139, 107, 0.85)",
                color: "#f0e8d8",
                fontSize: 11,
                fontWeight: 600,
                padding: "4px 10px",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              {"\u2705"} Discussed
            </div>
          )}
        </div>

        <div
          style={{
            padding: "18px 22px 22px",
            overflowY: "auto" as const,
            flex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: alreadyDiscussed ? "#6b8b6b" : "#88bb88",
                boxShadow: `0 0 8px ${alreadyDiscussed ? "rgba(107, 139, 107, 0.3)" : "rgba(136, 187, 136, 0.5)"}`,
              }}
            />
            <h3
              style={{
                margin: 0,
                fontSize: 16,
                fontWeight: 600,
                color: "#f0e8d8",
              }}
            >
              {itemName}
            </h3>
          </div>

          <div
            style={{
              background: "rgba(107, 139, 107, 0.1)",
              borderRadius: 12,
              padding: "14px 16px",
              marginBottom: 10,
              border: "1px solid rgba(107, 139, 107, 0.15)",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 13,
                lineHeight: 1.75,
                color: "rgba(240, 232, 216, 0.88)",
              }}
            >
              {prompt}
            </p>
          </div>

          <p
            style={{
              margin: "0 0 16px",
              fontSize: 11,
              color: "rgba(240, 232, 216, 0.35)",
              lineHeight: 1.5,
              fontStyle: "italic",
            }}
          >
            {alreadyDiscussed
              ? "You\u2019ve already discussed this one. Feel free to revisit anytime."
              : "Take your time with this one. There\u2019s no rush."}
          </p>

          <div style={{ display: "flex", gap: 8 }}>
            {!alreadyDiscussed && (
              <button
                onClick={onMarkDiscussed}
                data-testid="button-mark-discussed"
                style={{
                  flex: 1,
                  padding: "12px 0",
                  background: "linear-gradient(135deg, #6b8b6b, #5a7a5a)",
                  color: "#f0e8d8",
                  border: "none",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                  boxShadow: "0 4px 12px rgba(90, 122, 90, 0.3)",
                  transition: "transform 0.15s, box-shadow 0.15s",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow =
                    "0 6px 20px rgba(90, 122, 90, 0.4)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(90, 122, 90, 0.3)";
                }}
              >
                Mark as Discussed
              </button>
            )}
            <button
              onClick={onDismiss}
              data-testid="button-dismiss-prompt"
              style={{
                flex: alreadyDiscussed ? 1 : undefined,
                padding: "12px 18px",
                background: "rgba(240, 232, 216, 0.06)",
                color: "rgba(240, 232, 216, 0.55)",
                border: "1px solid rgba(160, 146, 107, 0.2)",
                borderRadius: 10,
                fontSize: 13,
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
                transition: "background 0.15s",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.background =
                  "rgba(240, 232, 216, 0.1)")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.background =
                  "rgba(240, 232, 216, 0.06)")
              }
            >
              {alreadyDiscussed ? "Close" : "Later"}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
