interface ConnectionStatusProps {
  connected: boolean;
  zenMode: boolean;
  sessionEnded: boolean;
}

export function ConnectionStatus({ connected, zenMode, sessionEnded }: ConnectionStatusProps) {
  if (!zenMode || sessionEnded) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className="w-3 h-3 rounded-full"
        style={{
          backgroundColor: connected ? "#22c55e" : "#ef4444",
          boxShadow: `0 0 8px ${connected ? "rgba(34, 197, 94, 0.6)" : "rgba(239, 68, 68, 0.6)"}`,
        }}
      />
    </div>
  );
}
