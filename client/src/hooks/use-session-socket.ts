import { useEffect, useRef, useCallback, useState } from "react";

export interface OnlineUser {
  participantId: string;
  displayName: string;
}

export interface CursorPosition {
  participantId: string;
  displayName: string;
  x: number;
  y: number;
}

type MessageHandler = (msg: any) => void;

export function useSessionSocket(
  sessionId: string | null,
  participantId: string | null,
  displayName: string,
  onMessage: MessageHandler
) {
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    if (!sessionId || !participantId) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      ws.send(JSON.stringify({
        type: "join",
        sessionId,
        participantId,
        displayName,
      }));
    };

    ws.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data);
        if (msg.type === "ping") {
          ws.send(JSON.stringify({ type: "pong" }));
          return;
        }
        onMessageRef.current(msg);
      } catch {}
    };

    ws.onclose = () => {
      setConnected(false);
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [sessionId, participantId, displayName]);

  const send = useCallback((msg: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  return { connected, send };
}
