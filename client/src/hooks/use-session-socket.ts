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

const MAX_RECONNECT_DELAY = 30000;
const INITIAL_RECONNECT_DELAY = 1000;

export function useSessionSocket(
  sessionId: string | null,
  participantId: string | null,
  displayName: string,
  onMessage: MessageHandler
) {
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;
  const intentionalCloseRef = useRef(false);
  const reconnectDelayRef = useRef(INITIAL_RECONNECT_DELAY);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!sessionId || !participantId) return;

    intentionalCloseRef.current = false;
    reconnectDelayRef.current = INITIAL_RECONNECT_DELAY;

    function connect() {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        setReconnecting(false);
        reconnectDelayRef.current = INITIAL_RECONNECT_DELAY;
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
          if (msg.type === "session-ended") {
            intentionalCloseRef.current = true;
          }
          onMessageRef.current(msg);
        } catch {}
      };

      ws.onclose = () => {
        setConnected(false);
        wsRef.current = null;

        if (!intentionalCloseRef.current) {
          setReconnecting(true);
          const delay = reconnectDelayRef.current;
          reconnectDelayRef.current = Math.min(delay * 2, MAX_RECONNECT_DELAY);
          reconnectTimerRef.current = setTimeout(connect, delay);
        }
      };
    }

    connect();

    return () => {
      intentionalCloseRef.current = true;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [sessionId, participantId, displayName]);

  const send = useCallback((msg: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  return { connected, reconnecting, send };
}
