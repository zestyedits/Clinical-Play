import type { HouseLayer } from "./DBTHouseBuilder";

interface LayerPanelProps {
  layers: HouseLayer[];
  nextUnplacedFloor: number;
  onPlaceLayer: (layerId: string) => void;
  onItemClick: (layerId: string, itemId: string) => void;
}

export function LayerPanel({
  layers,
  nextUnplacedFloor,
  onPlaceLayer,
  onItemClick,
}: LayerPanelProps) {
  const completedItems = layers
    .flatMap((l) => l.items)
    .filter((i) => i.completed).length;
  const totalItems = layers.flatMap((l) => l.items).length;
  const progress = totalItems > 0 ? completedItems / totalItems : 0;

  return (
    <div
      style={{
        width: 260,
        background: "rgba(45, 40, 35, 0.94)",
        borderLeft: "1px solid rgba(160, 146, 107, 0.15)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        flexShrink: 0,
        backdropFilter: "blur(10px)",
      }}
    >
      <div
        style={{
          padding: "14px 16px",
          borderBottom: "1px solid rgba(160, 146, 107, 0.12)",
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#f0e8d8",
            marginBottom: 2,
          }}
        >
          Building Layers
        </div>
        <div
          style={{
            fontSize: 10,
            color: "rgba(240, 232, 216, 0.4)",
          }}
        >
          Place each floor, then explore its items
        </div>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "8px 10px",
        }}
      >
        {layers.map((layer, idx) => {
          const canPlace = idx === nextUnplacedFloor;
          const isLocked = !layer.placed && !canPlace;
          const progressCount = layer.items.filter((i) => i.completed).length;

          return (
            <div
              key={layer.id}
              style={{
                marginBottom: 6,
                background: layer.placed
                  ? "rgba(240, 232, 216, 0.05)"
                  : isLocked
                    ? "rgba(240, 232, 216, 0.015)"
                    : "rgba(107, 139, 107, 0.08)",
                borderRadius: 10,
                border: `1px solid ${
                  canPlace
                    ? "rgba(107, 139, 107, 0.35)"
                    : layer.completed
                      ? "rgba(107, 139, 107, 0.25)"
                      : "rgba(160, 146, 107, 0.08)"
                }`,
                overflow: "hidden",
                opacity: isLocked ? 0.35 : 1,
                transition: "all 0.3s ease",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: 8 }}
                >
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 8,
                      background: layer.completed
                        ? "rgba(107, 139, 107, 0.2)"
                        : isLocked
                          ? "rgba(240, 232, 216, 0.04)"
                          : "rgba(240, 232, 216, 0.06)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                      flexShrink: 0,
                    }}
                  >
                    {layer.completed
                      ? "\u2705"
                      : isLocked
                        ? "\u{1F512}"
                        : layer.icon}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#f0e8d8",
                        lineHeight: 1.3,
                      }}
                    >
                      {layer.name}
                    </div>
                    <div
                      style={{
                        fontSize: 9,
                        color: "rgba(240, 232, 216, 0.4)",
                        marginTop: 1,
                      }}
                    >
                      {layer.subtitle}
                    </div>
                  </div>
                </div>

                {canPlace && (
                  <button
                    onClick={() => onPlaceLayer(layer.id)}
                    data-testid={`button-place-${layer.id}`}
                    style={{
                      background:
                        "linear-gradient(135deg, #6b8b6b, #5a7a5a)",
                      color: "#f0e8d8",
                      border: "none",
                      borderRadius: 8,
                      padding: "6px 14px",
                      fontSize: 10,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "Inter, sans-serif",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                      boxShadow: "0 2px 8px rgba(90, 122, 90, 0.3)",
                      transition: "transform 0.15s",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.transform = "translateY(-1px)")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.transform = "translateY(0)")
                    }
                  >
                    Place
                  </button>
                )}

                {layer.placed && !layer.completed && (
                  <div
                    style={{
                      fontSize: 9,
                      color: "rgba(240, 232, 216, 0.45)",
                      whiteSpace: "nowrap",
                      background: "rgba(240, 232, 216, 0.06)",
                      padding: "2px 7px",
                      borderRadius: 5,
                    }}
                  >
                    {progressCount}/{layer.items.length}
                  </div>
                )}
              </div>

              {layer.placed && (
                <div
                  style={{
                    padding: "0 10px 10px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 3,
                  }}
                >
                  {layer.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => onItemClick(layer.id, item.id)}
                      data-testid={`button-item-${item.id}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 7,
                        padding: "7px 9px",
                        background: item.completed
                          ? "rgba(107, 139, 107, 0.12)"
                          : "rgba(240, 232, 216, 0.04)",
                        border: `1px solid ${
                          item.completed
                            ? "rgba(107, 139, 107, 0.18)"
                            : "rgba(160, 146, 107, 0.1)"
                        }`,
                        borderRadius: 7,
                        cursor: "pointer",
                        width: "100%",
                        textAlign: "left",
                        fontFamily: "Inter, sans-serif",
                        transition: "all 0.15s ease",
                      }}
                      onMouseOver={(e) => {
                        if (!item.completed)
                          e.currentTarget.style.background =
                            "rgba(240, 232, 216, 0.08)";
                      }}
                      onMouseOut={(e) => {
                        if (!item.completed)
                          e.currentTarget.style.background =
                            "rgba(240, 232, 216, 0.04)";
                      }}
                    >
                      <div
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 5,
                          background: item.completed
                            ? "rgba(107, 139, 107, 0.2)"
                            : "rgba(240, 232, 216, 0.06)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 11,
                          flexShrink: 0,
                        }}
                      >
                        {item.completed ? "\u2705" : item.icon}
                      </div>
                      <span
                        style={{
                          fontSize: 10,
                          color: item.completed
                            ? "rgba(240, 232, 216, 0.45)"
                            : "rgba(240, 232, 216, 0.85)",
                          textDecoration: item.completed
                            ? "line-through"
                            : "none",
                        }}
                      >
                        {item.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div
        style={{
          padding: "10px 14px",
          borderTop: "1px solid rgba(160, 146, 107, 0.12)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 5,
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 500,
              color: "rgba(240, 232, 216, 0.5)",
            }}
          >
            Session Progress
          </div>
          <div
            style={{
              fontSize: 10,
              color: "rgba(240, 232, 216, 0.35)",
            }}
          >
            {Math.round(progress * 100)}%
          </div>
        </div>
        <div
          style={{
            height: 4,
            background: "rgba(240, 232, 216, 0.08)",
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress * 100}%`,
              background:
                "linear-gradient(90deg, #6b8b6b, #88bb88)",
              borderRadius: 3,
              transition: "width 0.5s ease",
              boxShadow:
                progress > 0
                  ? "0 0 8px rgba(107, 139, 107, 0.4)"
                  : "none",
            }}
          />
        </div>
      </div>
    </div>
  );
}
