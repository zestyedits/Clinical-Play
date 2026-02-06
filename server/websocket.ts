import { WebSocketServer, WebSocket } from "ws";
import { type Server } from "http";
import { storage } from "./storage";
import { log } from "./index";

interface WSClient {
  ws: WebSocket;
  sessionId: string;
  participantId: string;
  displayName: string;
}

const rooms = new Map<string, Set<WSClient>>();

interface RoomState {
  activeTool: string;
  breathingActive: boolean;
  breathingStartTime: number | null;
}

const roomStates = new Map<string, RoomState>();

function getRoomState(sessionId: string): RoomState {
  if (!roomStates.has(sessionId)) {
    roomStates.set(sessionId, { activeTool: "sandtray", breathingActive: false, breathingStartTime: null });
  }
  return roomStates.get(sessionId)!;
}

function broadcast(sessionId: string, message: any, excludeWs?: WebSocket) {
  const room = rooms.get(sessionId);
  if (!room) return;
  const payload = JSON.stringify(message);
  room.forEach((client) => {
    if (client.ws !== excludeWs && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(payload);
    }
  });
}

export function setupWebSocketServer(server: Server) {
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws) => {
    let client: WSClient | null = null;

    ws.on("message", async (raw) => {
      try {
        const msg = JSON.parse(raw.toString());

        switch (msg.type) {
          case "join": {
            const { sessionId, participantId, displayName } = msg;
            client = { ws, sessionId, participantId, displayName };

            if (!rooms.has(sessionId)) {
              rooms.set(sessionId, new Set());
            }
            rooms.get(sessionId)!.add(client);

            const items = await storage.getSandtrayItems(sessionId);
            const participants = await storage.getParticipantsBySession(sessionId);
            const session = await storage.getSession(sessionId);
            const state = getRoomState(sessionId);

            ws.send(JSON.stringify({
              type: "init",
              items,
              participants,
              session,
              onlineUsers: Array.from(rooms.get(sessionId) ?? []).map((c: WSClient) => ({
                participantId: c.participantId,
                displayName: c.displayName,
              })),
              activeTool: state.activeTool,
              breathingActive: state.breathingActive,
              breathingStartTime: state.breathingStartTime,
            }));

            broadcast(sessionId, {
              type: "user-joined",
              participantId,
              displayName,
            }, ws);

            log(`User ${displayName} joined session ${sessionId}`, "ws");
            break;
          }

          case "item-placed": {
            if (!client) return;
            const item = await storage.addSandtrayItem({
              sessionId: client.sessionId,
              placedBy: client.participantId,
              icon: msg.icon,
              category: msg.category,
              x: msg.x,
              y: msg.y,
              scale: msg.scale || 1,
              rotation: msg.rotation || 0,
            });
            broadcast(client.sessionId, {
              type: "item-placed",
              item,
              placedBy: client.participantId,
              displayName: client.displayName,
            });
            break;
          }

          case "item-moved": {
            if (!client) return;
            await storage.updateSandtrayItem(msg.itemId, {
              x: msg.x,
              y: msg.y,
            });
            broadcast(client.sessionId, {
              type: "item-moved",
              itemId: msg.itemId,
              x: msg.x,
              y: msg.y,
              movedBy: client.participantId,
            }, ws);
            break;
          }

          case "item-removed": {
            if (!client) return;
            await storage.removeSandtrayItem(msg.itemId);
            broadcast(client.sessionId, {
              type: "item-removed",
              itemId: msg.itemId,
            });
            break;
          }

          case "clear-canvas": {
            if (!client) return;
            await storage.clearSandtrayItems(client.sessionId);
            broadcast(client.sessionId, { type: "canvas-cleared" });
            break;
          }

          case "session-update": {
            if (!client) return;
            const updated = await storage.updateSession(client.sessionId, msg.data);
            broadcast(client.sessionId, {
              type: "session-updated",
              session: updated,
            });
            break;
          }

          case "cursor-move": {
            if (!client) return;
            broadcast(client.sessionId, {
              type: "cursor-move",
              participantId: client.participantId,
              displayName: client.displayName,
              x: msg.x,
              y: msg.y,
            }, ws);
            break;
          }

          case "tool-change": {
            if (!client) return;
            const toolState = getRoomState(client.sessionId);
            toolState.activeTool = msg.tool;
            broadcast(client.sessionId, {
              type: "tool-changed",
              tool: msg.tool,
              changedBy: client.participantId,
            });
            break;
          }

          case "breathing-toggle": {
            if (!client) return;
            const breathState = getRoomState(client.sessionId);
            breathState.breathingActive = msg.isActive;
            breathState.breathingStartTime = msg.isActive ? Date.now() : null;
            broadcast(client.sessionId, {
              type: "breathing-toggled",
              isActive: msg.isActive,
              startedBy: client.participantId,
              startTime: breathState.breathingStartTime,
            });
            break;
          }

          case "activity-pulse": {
            if (!client) return;
            broadcast(client.sessionId, {
              type: "activity-pulse",
              participantId: client.participantId,
              displayName: client.displayName,
            }, ws);
            break;
          }
        }
      } catch (err) {
        log(`WebSocket error: ${err}`, "ws");
      }
    });

    ws.on("close", () => {
      if (client) {
        const room = rooms.get(client.sessionId);
        if (room) {
          room.delete(client);
          if (room.size === 0) {
            rooms.delete(client.sessionId);
            roomStates.delete(client.sessionId);
          }
        }
        broadcast(client.sessionId, {
          type: "user-left",
          participantId: client.participantId,
          displayName: client.displayName,
        });
        log(`User ${client.displayName} left session ${client.sessionId}`, "ws");
      }
    });
  });

  log("WebSocket server initialized on /ws", "ws");
}
