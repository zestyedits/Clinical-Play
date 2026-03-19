interface ConnectionStatusProps {
  connected: boolean;
  reconnecting?: boolean;
  sessionEnded?: boolean;
}

export function ConnectionStatus({ connected, reconnecting, sessionEnded }: ConnectionStatusProps) {
  if (sessionEnded) return null;

  if (reconnecting) {
    return (
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
        <div
          className="w-3 h-3 rounded-full animate-pulse"
          style={{
            backgroundColor: "#f59e0b",
            boxShadow: "0 0 8px rgba(245, 158, 11, 0.6)",
          }}
        />
        <span style={{ fontSize: 11, color: "rgba(245,158,11,0.8)", fontWeight: 500 }}>
          Reconnecting...
        </span>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div
          className="w-3 h-3 rounded-full"
          style={{
            backgroundColor: "#ef4444",
            boxShadow: "0 0 8px rgba(239, 68, 68, 0.6)",
          }}
        />
      </div>
    );
  }

  return null;
}
