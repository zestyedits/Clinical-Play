interface ConnectionStatusProps {
  connected: boolean;
  sessionEnded?: boolean;
}

export function ConnectionStatus({ connected, sessionEnded }: ConnectionStatusProps) {
  if (sessionEnded) return null;

  // Minimal connection indicator shown at bottom-right
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
