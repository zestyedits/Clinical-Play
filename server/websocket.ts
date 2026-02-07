import { WebSocketServer, WebSocket } from "ws";
import { type Server } from "http";
import { storage } from "./storage";
import { log } from "./index";

interface WSClient {
  ws: WebSocket;
  sessionId: string;
  participantId: string;
  displayName: string;
  lastPong: number;
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

export function broadcastSessionEnded(sessionId: string) {
  const room = rooms.get(sessionId);
  if (!room) return;
  const payload = JSON.stringify({ type: "session-ended" });
  room.forEach((client) => {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(payload);
      client.ws.close(1000, "Session ended");
    }
  });
  rooms.delete(sessionId);
  roomStates.delete(sessionId);
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
            client = { ws, sessionId, participantId, displayName, lastPong: Date.now() };

            if (!rooms.has(sessionId)) {
              rooms.set(sessionId, new Set());
            }
            rooms.get(sessionId)!.add(client);

            const [items, participants, session, feelingSelections, timelineEvts, valuesCards] = await Promise.all([
              storage.getSandtrayItems(sessionId),
              storage.getParticipantsBySession(sessionId),
              storage.getSession(sessionId),
              storage.getFeelingSelections(sessionId),
              storage.getTimelineEvents(sessionId),
              storage.getValuesCardPlacements(sessionId),
            ]);
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
              feelingSelections,
              timelineEvents: timelineEvts,
              valuesCards,
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

          case "item-transformed": {
            if (!client) return;
            const transformData: Record<string, number> = {};
            if (msg.scale !== undefined) transformData.scale = msg.scale;
            if (msg.rotation !== undefined) transformData.rotation = msg.rotation;
            if (msg.x !== undefined) transformData.x = msg.x;
            if (msg.y !== undefined) transformData.y = msg.y;
            await storage.updateSandtrayItem(msg.itemId, transformData);
            broadcast(client.sessionId, {
              type: "item-transformed",
              itemId: msg.itemId,
              ...transformData,
              transformedBy: client.participantId,
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

          // --- Feeling Wheel ---
          case "feeling-select": {
            if (!client) return;
            const sel = await storage.addFeelingSelection({
              sessionId: client.sessionId,
              selectedBy: client.participantId,
              primaryEmotion: msg.primaryEmotion,
              secondaryEmotion: msg.secondaryEmotion || null,
              tertiaryEmotion: msg.tertiaryEmotion || null,
            });
            broadcast(client.sessionId, {
              type: "feeling-selected",
              selection: sel,
              selectedBy: client.participantId,
              displayName: client.displayName,
            });
            break;
          }

          case "feeling-clear": {
            if (!client) return;
            await storage.clearFeelingSelections(client.sessionId);
            broadcast(client.sessionId, { type: "feelings-cleared" });
            break;
          }

          // --- Narrative Timeline ---
          case "timeline-event-add": {
            if (!client) return;
            const evt = await storage.addTimelineEvent({
              sessionId: client.sessionId,
              placedBy: client.participantId,
              label: msg.label,
              description: msg.description || null,
              position: msg.position,
              color: msg.color || "#1B2A4A",
            });
            broadcast(client.sessionId, {
              type: "timeline-event-added",
              event: evt,
              placedBy: client.participantId,
              displayName: client.displayName,
            });
            break;
          }

          case "timeline-event-update": {
            if (!client) return;
            const updatedEvt = await storage.updateTimelineEvent(msg.eventId, {
              label: msg.label,
              description: msg.description,
              position: msg.position,
              color: msg.color,
            });
            broadcast(client.sessionId, {
              type: "timeline-event-updated",
              event: updatedEvt,
            });
            break;
          }

          case "timeline-event-remove": {
            if (!client) return;
            await storage.removeTimelineEvent(msg.eventId);
            broadcast(client.sessionId, {
              type: "timeline-event-removed",
              eventId: msg.eventId,
            });
            break;
          }

          case "timeline-clear": {
            if (!client) return;
            await storage.clearTimelineEvents(client.sessionId);
            broadcast(client.sessionId, { type: "timeline-cleared" });
            break;
          }

          // --- Values Card Sort ---
          case "values-card-place": {
            if (!client) return;
            const card = await storage.addValuesCardPlacement({
              sessionId: client.sessionId,
              placedBy: client.participantId,
              cardId: msg.cardId,
              label: msg.label,
              column: msg.column,
              orderIndex: msg.orderIndex || 0,
            });
            broadcast(client.sessionId, {
              type: "values-card-placed",
              card,
              placedBy: client.participantId,
              displayName: client.displayName,
            });
            break;
          }

          case "values-card-move": {
            if (!client) return;
            const movedCard = await storage.updateValuesCardPlacement(msg.cardId, {
              column: msg.column,
              orderIndex: msg.orderIndex,
            });
            broadcast(client.sessionId, {
              type: "values-card-moved",
              card: movedCard,
              movedBy: client.participantId,
            });
            break;
          }

          case "values-card-remove": {
            if (!client) return;
            await storage.removeValuesCardPlacement(msg.cardId);
            broadcast(client.sessionId, {
              type: "values-card-removed",
              cardId: msg.cardId,
            });
            break;
          }

          case "values-clear": {
            if (!client) return;
            await storage.clearValuesCardPlacements(client.sessionId);
            broadcast(client.sessionId, { type: "values-cleared" });
            break;
          }

          case "pong": {
            if (client) {
              client.lastPong = Date.now();
            }
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
        broadcast(client.sessionId, {
          type: "user-disconnected",
          participantId: client.participantId,
          displayName: client.displayName,
        });
        log(`User ${client.displayName} left session ${client.sessionId}`, "ws");
      }
    });
  });

  const heartbeatInterval = setInterval(() => {
    const now = Date.now();
    const pingPayload = JSON.stringify({ type: "ping" });
    rooms.forEach((room, sessionId) => {
      room.forEach((client) => {
        if (client.ws.readyState === WebSocket.OPEN) {
          if (now - client.lastPong > 15000) {
            broadcast(sessionId, {
              type: "user-disconnected",
              participantId: client.participantId,
              displayName: client.displayName,
            });
            client.ws.close(1000, "Heartbeat timeout");
            room.delete(client);
            if (room.size === 0) {
              rooms.delete(sessionId);
              roomStates.delete(sessionId);
            }
          } else {
            client.ws.send(pingPayload);
          }
        }
      });
    });
  }, 5000);

  wss.on("close", () => {
    clearInterval(heartbeatInterval);
  });

  log("WebSocket server initialized on /ws", "ws");
}
