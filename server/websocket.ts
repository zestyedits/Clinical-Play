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

interface LightSource {
  x: number;
  y: number;
  temperature: number;
}

interface RakePath {
  id: string;
  points: { x: number; y: number }[];
  width: number;
  createdBy: string;
  timestamp: number;
}

interface RoomState {
  activeTool: string;
  breathingActive: boolean;
  breathingStartTime: number | null;
  breathingTechnique: string;
  lightSource: LightSource;
  rakePaths: RakePath[];
  zenMode: boolean;
  theaterFrozen: boolean;
  theaterDimInactive: boolean;
  theaterMetaphor: string;
  theaterPartLimit: number;
  toolSettings: Record<string, Record<string, any>>;
}

const roomStates = new Map<string, RoomState>();

function getRoomState(sessionId: string): RoomState {
  if (!roomStates.has(sessionId)) {
    roomStates.set(sessionId, {
      activeTool: "dbt-house",
      breathingActive: false,
      breathingStartTime: null,
      breathingTechnique: "ocean-waves",
      lightSource: { x: 0.3, y: 0.2, temperature: 0.5 },
      rakePaths: [],
      zenMode: false,
      theaterFrozen: false,
      theaterDimInactive: false,
      theaterMetaphor: "parts",
      theaterPartLimit: 0,
      toolSettings: {},
    });
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

            const [items, participants, session, feelingSelections, timelineEvts, valuesCards, theaterPartsData, theaterConnsData,
              thermometerData, containmentContainersData, containmentItemsData,
              bodyScanData, gratitudeData, safetyPlanData,
              worryTreeData, thoughtBridgeData, thoughtBridgeEvidenceData,
              copingData, dbtHouseData,
              strengthsPlacementsData, strengthsSpottingsData,
              socialAtomPeopleData, socialAtomConnectionsData, socialAtomGroupsData,
              gardenPlantsData, gardenJournalData, gardenWeedsData,
            ] = await Promise.all([
              storage.getSandtrayItems(sessionId),
              storage.getParticipantsBySession(sessionId),
              storage.getSession(sessionId),
              storage.getFeelingSelections(sessionId),
              storage.getTimelineEvents(sessionId),
              storage.getValuesCardPlacements(sessionId),
              storage.getTheaterParts(sessionId),
              storage.getTheaterConnections(sessionId),
              storage.getThermometerReadings(sessionId),
              storage.getContainmentContainers(sessionId),
              storage.getContainmentItems(sessionId),
              storage.getBodyScanMarkers(sessionId),
              storage.getGratitudeStones(sessionId),
              storage.getSafetyPlanItems(sessionId),
              storage.getWorryTreeEntries(sessionId),
              storage.getThoughtBridgeRecords(sessionId),
              storage.getThoughtBridgeEvidence(sessionId),
              storage.getCopingStrategies(sessionId),
              storage.getDbtHouseSkills(sessionId),
              storage.getStrengthsPlacements(sessionId),
              storage.getStrengthsSpottings(sessionId),
              storage.getSocialAtomPeople(sessionId),
              storage.getSocialAtomConnections(sessionId),
              storage.getSocialAtomGroups(sessionId),
              storage.getGardenPlants(sessionId),
              storage.getGardenJournalEntries(sessionId),
              storage.getGardenWeeds(sessionId),
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
              breathingTechnique: state.breathingTechnique,
              lightSource: state.lightSource,
              rakePaths: state.rakePaths,
              zenMode: state.zenMode,
              feelingSelections,
              timelineEvents: timelineEvts,
              valuesCards,
              theaterParts: theaterPartsData,
              theaterConnections: theaterConnsData,
              theaterFrozen: state.theaterFrozen,
              theaterDimInactive: state.theaterDimInactive,
              theaterMetaphor: state.theaterMetaphor,
              theaterPartLimit: state.theaterPartLimit,
              thermometerReadings: thermometerData,
              containmentContainers: containmentContainersData,
              containmentItems: containmentItemsData,
              bodyScanMarkers: bodyScanData,
              gratitudeStones: gratitudeData,
              safetyPlanItems: safetyPlanData,
              worryTreeEntries: worryTreeData,
              thoughtBridgeRecords: thoughtBridgeData,
              thoughtBridgeEvidence: thoughtBridgeEvidenceData,
              copingStrategies: copingData,
              dbtHouseSkills: dbtHouseData,
              strengthsPlacements: strengthsPlacementsData,
              strengthsSpottings: strengthsSpottingsData,
              socialAtomPeople: socialAtomPeopleData,
              socialAtomConnections: socialAtomConnectionsData,
              socialAtomGroups: socialAtomGroupsData,
              gardenPlants: gardenPlantsData,
              gardenJournalEntries: gardenJournalData,
              gardenWeeds: gardenWeedsData,
              toolSettings: state.toolSettings,
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

          case "breathing-technique-change": {
            if (!client) return;
            const btState = getRoomState(client.sessionId);
            btState.breathingTechnique = msg.techniqueId;
            broadcast(client.sessionId, {
              type: "breathing-technique-changed",
              techniqueId: msg.techniqueId,
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

          // --- Parts Theater ---
          case "theater-part-add": {
            if (!client) return;
            const part = await storage.addTheaterPart({
              sessionId: client.sessionId,
              placedBy: client.participantId,
              name: msg.name || null,
              x: msg.x,
              y: msg.y,
              size: msg.size || "medium",
              color: msg.color || "#1B2A4A",
              note: null,
              isContained: false,
            });
            broadcast(client.sessionId, {
              type: "theater-part-added",
              part,
              placedBy: client.participantId,
              displayName: client.displayName,
            });
            break;
          }

          case "theater-part-move": {
            if (!client) return;
            await storage.updateTheaterPart(msg.partId, { x: msg.x, y: msg.y });
            broadcast(client.sessionId, {
              type: "theater-part-moved",
              partId: msg.partId,
              x: msg.x,
              y: msg.y,
              movedBy: client.participantId,
            }, ws);
            break;
          }

          case "theater-part-update": {
            if (!client) return;
            const fields: Record<string, any> = {};
            if (msg.name !== undefined) fields.name = msg.name;
            if (msg.color !== undefined) fields.color = msg.color;
            if (msg.size !== undefined) fields.size = msg.size;
            if (msg.note !== undefined) fields.note = msg.note;
            if (msg.isContained !== undefined) fields.isContained = msg.isContained;
            const updatedPart = await storage.updateTheaterPart(msg.partId, fields);
            broadcast(client.sessionId, {
              type: "theater-part-updated",
              part: updatedPart,
            });
            break;
          }

          case "theater-part-remove": {
            if (!client) return;
            await storage.removeTheaterPart(msg.partId);
            broadcast(client.sessionId, {
              type: "theater-part-removed",
              partId: msg.partId,
            });
            break;
          }

          case "theater-connection-add": {
            if (!client) return;
            const conn = await storage.addTheaterConnection({
              sessionId: client.sessionId,
              fromPartId: msg.fromPartId,
              toPartId: msg.toPartId,
              style: msg.style || "solid",
              createdBy: client.participantId,
            });
            broadcast(client.sessionId, {
              type: "theater-connection-added",
              connection: conn,
            });
            break;
          }

          case "theater-connection-remove": {
            if (!client) return;
            await storage.removeTheaterConnection(msg.connectionId);
            broadcast(client.sessionId, {
              type: "theater-connection-removed",
              connectionId: msg.connectionId,
            });
            break;
          }

          case "theater-clear": {
            if (!client) return;
            await storage.clearTheaterParts(client.sessionId);
            broadcast(client.sessionId, { type: "theater-cleared" });
            break;
          }

          case "theater-settings-update": {
            if (!client) return;
            const tState = getRoomState(client.sessionId);
            if (msg.frozen !== undefined) tState.theaterFrozen = msg.frozen;
            if (msg.dimInactive !== undefined) tState.theaterDimInactive = msg.dimInactive;
            if (msg.metaphor !== undefined) tState.theaterMetaphor = msg.metaphor;
            if (msg.partLimit !== undefined) tState.theaterPartLimit = msg.partLimit;
            broadcast(client.sessionId, {
              type: "theater-settings-updated",
              frozen: tState.theaterFrozen,
              dimInactive: tState.theaterDimInactive,
              metaphor: tState.theaterMetaphor,
              partLimit: tState.theaterPartLimit,
            });
            break;
          }

          // --- Generic Tool Settings ---
          case "tool-settings-update": {
            if (!client) return;
            const tsState = getRoomState(client.sessionId);
            const toolId = msg.toolId as string;
            if (!tsState.toolSettings[toolId]) {
              tsState.toolSettings[toolId] = {};
            }
            Object.assign(tsState.toolSettings[toolId], msg.settings);
            broadcast(client.sessionId, {
              type: "tool-settings-updated",
              toolId,
              settings: tsState.toolSettings[toolId],
            });
            break;
          }

          // --- Ambient / Zen ---
          case "light-source-update": {
            if (!client) return;
            const lsState = getRoomState(client.sessionId);
            lsState.lightSource = { x: msg.x, y: msg.y, temperature: msg.temperature };
            broadcast(client.sessionId, {
              type: "light-source-updated",
              x: msg.x,
              y: msg.y,
              temperature: msg.temperature,
              updatedBy: client.participantId,
            }, ws);
            break;
          }

          case "rake-path-add": {
            if (!client) return;
            const rpState = getRoomState(client.sessionId);
            const rakePath = {
              id: msg.id,
              points: msg.points,
              width: msg.width || 12,
              createdBy: client.participantId,
              timestamp: Date.now(),
            };
            rpState.rakePaths.push(rakePath);
            broadcast(client.sessionId, {
              type: "rake-path-added",
              path: rakePath,
            }, ws);
            break;
          }

          case "rake-path-clear": {
            if (!client) return;
            const rcState = getRoomState(client.sessionId);
            rcState.rakePaths = [];
            broadcast(client.sessionId, { type: "rake-paths-cleared" });
            break;
          }

          case "zen-mode-toggle": {
            if (!client) return;
            const zmState = getRoomState(client.sessionId);
            zmState.zenMode = msg.enabled;
            broadcast(client.sessionId, {
              type: "zen-mode-toggled",
              enabled: msg.enabled,
              toggledBy: client.participantId,
            });
            break;
          }

          // --- Emotion Thermometer ---
          case "thermometer-reading-add": {
            if (!client) return;
            const reading = await storage.addThermometerReading({
              sessionId: client.sessionId, createdBy: client.participantId,
              emotionLabel: msg.emotionLabel, intensity: msg.intensity,
              bodyLocation: msg.bodyLocation || null, triggerNote: msg.triggerNote || null,
            });
            broadcast(client.sessionId, { type: "thermometer-reading-added", reading, createdBy: client.participantId, displayName: client.displayName });
            break;
          }
          case "thermometer-clear": {
            if (!client) return;
            await storage.clearThermometerReadings(client.sessionId);
            broadcast(client.sessionId, { type: "thermometer-cleared" });
            break;
          }

          // --- Containment Box ---
          case "containment-container-create": {
            if (!client) return;
            const container = await storage.addContainmentContainer({
              sessionId: client.sessionId, createdBy: client.participantId,
              containerType: msg.containerType || "chest",
            });
            broadcast(client.sessionId, { type: "containment-container-created", container });
            break;
          }
          case "containment-item-add": {
            if (!client) return;
            const cItem = await storage.addContainmentItem({
              containerId: msg.containerId, sessionId: client.sessionId,
              createdBy: client.participantId, label: msg.label,
              emoji: msg.emoji || null, color: msg.color || null,
            });
            broadcast(client.sessionId, { type: "containment-item-added", item: cItem });
            break;
          }
          case "containment-item-contain": {
            if (!client) return;
            const contained = await storage.updateContainmentItem(msg.itemId, { status: "contained" });
            broadcast(client.sessionId, { type: "containment-item-contained", item: contained });
            break;
          }
          case "containment-item-dissolve": {
            if (!client) return;
            const dissolved = await storage.updateContainmentItem(msg.itemId, { status: "dissolved" });
            broadcast(client.sessionId, { type: "containment-item-dissolved", item: dissolved });
            break;
          }
          case "containment-lock": {
            if (!client) return;
            const locked = await storage.updateContainmentContainer(msg.containerId, { isLocked: true, lockMethod: msg.lockMethod || "key", containmentStrength: msg.containmentStrength });
            broadcast(client.sessionId, { type: "containment-locked", container: locked });
            break;
          }
          case "containment-unlock": {
            if (!client) return;
            const unlocked = await storage.updateContainmentContainer(msg.containerId, { isLocked: false });
            broadcast(client.sessionId, { type: "containment-unlocked", container: unlocked });
            break;
          }
          case "containment-clear": {
            if (!client) return;
            await storage.clearContainmentContainers(client.sessionId);
            broadcast(client.sessionId, { type: "containment-cleared" });
            break;
          }

          // --- Body Scan Map ---
          case "body-scan-marker-add": {
            if (!client) return;
            const marker = await storage.addBodyScanMarker({
              sessionId: client.sessionId, createdBy: client.participantId,
              bodyRegion: msg.bodyRegion, sensationType: msg.sensationType,
              intensity: msg.intensity || 5, emotionLink: msg.emotionLink || null,
              notes: msg.notes || null, breathReaches: msg.breathReaches ?? null,
              movementImpulse: msg.movementImpulse || null,
            });
            broadcast(client.sessionId, { type: "body-scan-marker-added", marker, createdBy: client.participantId });
            break;
          }
          case "body-scan-marker-update": {
            if (!client) return;
            const fields: Record<string, any> = {};
            if (msg.sensationType !== undefined) fields.sensationType = msg.sensationType;
            if (msg.intensity !== undefined) fields.intensity = msg.intensity;
            if (msg.emotionLink !== undefined) fields.emotionLink = msg.emotionLink;
            if (msg.notes !== undefined) fields.notes = msg.notes;
            const updMarker = await storage.updateBodyScanMarker(msg.markerId, fields);
            broadcast(client.sessionId, { type: "body-scan-marker-updated", marker: updMarker });
            break;
          }
          case "body-scan-marker-remove": {
            if (!client) return;
            await storage.removeBodyScanMarker(msg.markerId);
            broadcast(client.sessionId, { type: "body-scan-marker-removed", markerId: msg.markerId });
            break;
          }
          case "body-scan-clear": {
            if (!client) return;
            await storage.clearBodyScanMarkers(client.sessionId);
            broadcast(client.sessionId, { type: "body-scan-cleared" });
            break;
          }

          // --- Gratitude Jar ---
          case "gratitude-stone-add": {
            if (!client) return;
            const stone = await storage.addGratitudeStone({
              sessionId: client.sessionId, createdBy: client.participantId,
              content: msg.content, category: msg.category || "general",
              color: msg.color || "#F59E0B", shape: msg.shape || "round",
            });
            broadcast(client.sessionId, { type: "gratitude-stone-added", stone, createdBy: client.participantId, displayName: client.displayName });
            break;
          }
          case "gratitude-stone-star": {
            if (!client) return;
            const starred = await storage.updateGratitudeStone(msg.stoneId, { isStarred: msg.isStarred });
            broadcast(client.sessionId, { type: "gratitude-stone-starred", stone: starred });
            break;
          }
          case "gratitude-stone-remove": {
            if (!client) return;
            await storage.removeGratitudeStone(msg.stoneId);
            broadcast(client.sessionId, { type: "gratitude-stone-removed", stoneId: msg.stoneId });
            break;
          }
          case "gratitude-clear": {
            if (!client) return;
            await storage.clearGratitudeStones(client.sessionId);
            broadcast(client.sessionId, { type: "gratitude-cleared" });
            break;
          }

          // --- Fidget Tools ---
          case "fidget-interaction": {
            if (!client) return;
            broadcast(client.sessionId, { type: "fidget-interaction-sync", widgetType: msg.widgetType, data: msg.data, participantId: client.participantId }, ws);
            break;
          }

          // --- Safety Map ---
          case "safety-item-add": {
            if (!client) return;
            const sItem = await storage.addSafetyPlanItem({
              sessionId: client.sessionId, createdBy: client.participantId,
              step: msg.step, content: msg.content,
              contactName: msg.contactName || null, contactPhone: msg.contactPhone || null,
              contactRelationship: msg.contactRelationship || null, orderIndex: msg.orderIndex || 0,
            });
            broadcast(client.sessionId, { type: "safety-item-added", item: sItem, createdBy: client.participantId });
            break;
          }
          case "safety-item-update": {
            if (!client) return;
            const sFields: Record<string, any> = {};
            if (msg.content !== undefined) sFields.content = msg.content;
            if (msg.contactName !== undefined) sFields.contactName = msg.contactName;
            if (msg.contactPhone !== undefined) sFields.contactPhone = msg.contactPhone;
            if (msg.contactRelationship !== undefined) sFields.contactRelationship = msg.contactRelationship;
            if (msg.orderIndex !== undefined) sFields.orderIndex = msg.orderIndex;
            const sUpd = await storage.updateSafetyPlanItem(msg.itemId, sFields);
            broadcast(client.sessionId, { type: "safety-item-updated", item: sUpd });
            break;
          }
          case "safety-item-remove": {
            if (!client) return;
            await storage.removeSafetyPlanItem(msg.itemId);
            broadcast(client.sessionId, { type: "safety-item-removed", itemId: msg.itemId });
            break;
          }
          case "safety-plan-clear": {
            if (!client) return;
            await storage.clearSafetyPlanItems(client.sessionId);
            broadcast(client.sessionId, { type: "safety-plan-cleared" });
            break;
          }

          // --- Worry Tree ---
          case "worry-entry-create": {
            if (!client) return;
            const wEntry = await storage.addWorryTreeEntry({
              sessionId: client.sessionId, createdBy: client.participantId,
              worryText: msg.worryText, category: msg.category || null,
            });
            broadcast(client.sessionId, { type: "worry-entry-created", entry: wEntry, createdBy: client.participantId });
            break;
          }
          case "worry-entry-update": {
            if (!client) return;
            const wFields: Record<string, any> = {};
            if (msg.isReal !== undefined) wFields.isReal = msg.isReal;
            if (msg.isActionable !== undefined) wFields.isActionable = msg.isActionable;
            if (msg.resolution !== undefined) wFields.resolution = msg.resolution;
            if (msg.actionSteps !== undefined) wFields.actionSteps = msg.actionSteps;
            if (msg.scheduledTime !== undefined) wFields.scheduledTime = msg.scheduledTime;
            if (msg.lettingGoMethod !== undefined) wFields.lettingGoMethod = msg.lettingGoMethod;
            if (msg.category !== undefined) wFields.category = msg.category;
            const wUpd = await storage.updateWorryTreeEntry(msg.entryId, wFields);
            broadcast(client.sessionId, { type: "worry-entry-updated", entry: wUpd });
            break;
          }
          case "worry-entry-remove": {
            if (!client) return;
            await storage.removeWorryTreeEntry(msg.entryId);
            broadcast(client.sessionId, { type: "worry-entry-removed", entryId: msg.entryId });
            break;
          }
          case "worry-tree-clear": {
            if (!client) return;
            await storage.clearWorryTreeEntries(client.sessionId);
            broadcast(client.sessionId, { type: "worry-tree-cleared" });
            break;
          }

          // --- Thought Bridge ---
          case "thought-bridge-create": {
            if (!client) return;
            const tbRecord = await storage.addThoughtBridgeRecord({
              sessionId: client.sessionId, createdBy: client.participantId,
              situation: msg.situation || null, status: "incomplete",
            });
            broadcast(client.sessionId, { type: "thought-bridge-created", record: tbRecord, createdBy: client.participantId });
            break;
          }
          case "thought-bridge-update": {
            if (!client) return;
            const tbFields: Record<string, any> = {};
            if (msg.situation !== undefined) tbFields.situation = msg.situation;
            if (msg.automaticThought !== undefined) tbFields.automaticThought = msg.automaticThought;
            if (msg.beliefRatingBefore !== undefined) tbFields.beliefRatingBefore = msg.beliefRatingBefore;
            if (msg.beliefRatingAfter !== undefined) tbFields.beliefRatingAfter = msg.beliefRatingAfter;
            if (msg.balancedThought !== undefined) tbFields.balancedThought = msg.balancedThought;
            if (msg.emotionsBefore !== undefined) tbFields.emotionsBefore = msg.emotionsBefore;
            if (msg.emotionsAfter !== undefined) tbFields.emotionsAfter = msg.emotionsAfter;
            if (msg.distortions !== undefined) tbFields.distortions = msg.distortions;
            if (msg.status !== undefined) tbFields.status = msg.status;
            const tbUpd = await storage.updateThoughtBridgeRecord(msg.recordId, tbFields);
            broadcast(client.sessionId, { type: "thought-bridge-updated", record: tbUpd });
            break;
          }
          case "thought-bridge-evidence-add": {
            if (!client) return;
            const tbEvidence = await storage.addThoughtBridgeEvidence({
              recordId: msg.recordId, sessionId: client.sessionId,
              type: msg.evidenceType, content: msg.content,
              createdBy: client.participantId, orderIndex: msg.orderIndex || 0,
            });
            broadcast(client.sessionId, { type: "thought-bridge-evidence-added", evidence: tbEvidence });
            break;
          }
          case "thought-bridge-evidence-remove": {
            if (!client) return;
            await storage.removeThoughtBridgeEvidence(msg.evidenceId);
            broadcast(client.sessionId, { type: "thought-bridge-evidence-removed", evidenceId: msg.evidenceId });
            break;
          }
          case "thought-bridge-clear": {
            if (!client) return;
            await storage.clearThoughtBridgeRecords(client.sessionId);
            broadcast(client.sessionId, { type: "thought-bridge-cleared" });
            break;
          }

          // --- Coping Toolbox ---
          case "coping-strategy-add": {
            if (!client) return;
            const cStrat = await storage.addCopingStrategy({
              sessionId: client.sessionId, createdBy: client.participantId,
              name: msg.name, description: msg.description || null,
              category: msg.category, emoji: msg.emoji || null,
              isCustom: msg.isCustom ?? true, contextTags: msg.contextTags || null,
              difficulty: msg.difficulty || null, isPinned: msg.isPinned ?? false,
            });
            broadcast(client.sessionId, { type: "coping-strategy-added", strategy: cStrat, createdBy: client.participantId });
            break;
          }
          case "coping-strategy-update": {
            if (!client) return;
            const csFields: Record<string, any> = {};
            if (msg.name !== undefined) csFields.name = msg.name;
            if (msg.description !== undefined) csFields.description = msg.description;
            if (msg.category !== undefined) csFields.category = msg.category;
            if (msg.effectiveness !== undefined) csFields.effectiveness = msg.effectiveness;
            if (msg.isPinned !== undefined) csFields.isPinned = msg.isPinned;
            if (msg.usageCount !== undefined) csFields.usageCount = msg.usageCount;
            const csUpd = await storage.updateCopingStrategy(msg.strategyId, csFields);
            broadcast(client.sessionId, { type: "coping-strategy-updated", strategy: csUpd });
            break;
          }
          case "coping-strategy-remove": {
            if (!client) return;
            await storage.removeCopingStrategy(msg.strategyId);
            broadcast(client.sessionId, { type: "coping-strategy-removed", strategyId: msg.strategyId });
            break;
          }
          case "coping-clear": {
            if (!client) return;
            await storage.clearCopingStrategies(client.sessionId);
            broadcast(client.sessionId, { type: "coping-cleared" });
            break;
          }

          // --- DBT House ---
          case "dbt-skill-place": {
            if (!client) return;
            const dSkill = await storage.addDbtHouseSkill({
              sessionId: client.sessionId, createdBy: client.participantId,
              skillId: msg.skillId, module: msg.module, houseSection: msg.houseSection,
              personalExample: msg.personalExample || null,
            });
            broadcast(client.sessionId, { type: "dbt-skill-placed", skill: dSkill, createdBy: client.participantId });
            break;
          }
          case "dbt-skill-update": {
            if (!client) return;
            const dFields: Record<string, any> = {};
            if (msg.personalExample !== undefined) dFields.personalExample = msg.personalExample;
            if (msg.practiceCount !== undefined) dFields.practiceCount = msg.practiceCount;
            if (msg.effectivenessAvg !== undefined) dFields.effectivenessAvg = msg.effectivenessAvg;
            if (msg.houseSection !== undefined) dFields.houseSection = msg.houseSection;
            const dUpd = await storage.updateDbtHouseSkill(msg.skillPlacementId, dFields);
            broadcast(client.sessionId, { type: "dbt-skill-updated", skill: dUpd });
            break;
          }
          case "dbt-skill-remove": {
            if (!client) return;
            await storage.removeDbtHouseSkill(msg.skillPlacementId);
            broadcast(client.sessionId, { type: "dbt-skill-removed", skillPlacementId: msg.skillPlacementId });
            break;
          }
          case "dbt-house-clear": {
            if (!client) return;
            await storage.clearDbtHouseSkills(client.sessionId);
            broadcast(client.sessionId, { type: "dbt-house-cleared" });
            break;
          }

          // --- Strengths Deck ---
          case "strengths-place": {
            if (!client) return;
            const sPlace = await storage.addStrengthsPlacement({
              sessionId: client.sessionId, createdBy: client.participantId,
              strengthId: msg.strengthId, tier: msg.tier,
              orderIndex: msg.orderIndex || 0, scenarioResponse: msg.scenarioResponse || null,
            });
            broadcast(client.sessionId, { type: "strengths-placed", placement: sPlace, createdBy: client.participantId });
            break;
          }
          case "strengths-move": {
            if (!client) return;
            const sMoved = await storage.updateStrengthsPlacement(msg.placementId, { tier: msg.tier, orderIndex: msg.orderIndex });
            broadcast(client.sessionId, { type: "strengths-moved", placement: sMoved });
            break;
          }
          case "strengths-remove": {
            if (!client) return;
            await storage.removeStrengthsPlacement(msg.placementId);
            broadcast(client.sessionId, { type: "strengths-removed", placementId: msg.placementId });
            break;
          }
          case "strengths-spot": {
            if (!client) return;
            const spotting = await storage.addStrengthsSpotting({
              sessionId: client.sessionId, createdBy: client.participantId,
              strengthId: msg.strengthId, note: msg.note,
            });
            broadcast(client.sessionId, { type: "strengths-spotted", spotting, createdBy: client.participantId });
            break;
          }
          case "strengths-clear": {
            if (!client) return;
            await storage.clearStrengthsPlacements(client.sessionId);
            broadcast(client.sessionId, { type: "strengths-cleared" });
            break;
          }

          // --- Social Atom ---
          case "social-atom-person-add": {
            if (!client) return;
            const saPerson = await storage.addSocialAtomPerson({
              sessionId: client.sessionId, createdBy: client.participantId,
              name: msg.name, role: msg.role, emoji: msg.emoji || null,
              color: msg.color || "#3B82F6", distanceRing: msg.distanceRing || 2,
              angle: msg.angle || 0, isDeceased: msg.isDeceased ?? false,
              emotionalTone: msg.emotionalTone || null, notes: msg.notes || null,
            });
            broadcast(client.sessionId, { type: "social-atom-person-added", person: saPerson, createdBy: client.participantId });
            break;
          }
          case "social-atom-person-move": {
            if (!client) return;
            const saMovedP = await storage.updateSocialAtomPerson(msg.personId, { distanceRing: msg.distanceRing, angle: msg.angle });
            broadcast(client.sessionId, { type: "social-atom-person-moved", person: saMovedP }, ws);
            break;
          }
          case "social-atom-person-update": {
            if (!client) return;
            const saFields: Record<string, any> = {};
            if (msg.name !== undefined) saFields.name = msg.name;
            if (msg.role !== undefined) saFields.role = msg.role;
            if (msg.color !== undefined) saFields.color = msg.color;
            if (msg.emotionalTone !== undefined) saFields.emotionalTone = msg.emotionalTone;
            if (msg.notes !== undefined) saFields.notes = msg.notes;
            if (msg.isDeceased !== undefined) saFields.isDeceased = msg.isDeceased;
            const saUpdP = await storage.updateSocialAtomPerson(msg.personId, saFields);
            broadcast(client.sessionId, { type: "social-atom-person-updated", person: saUpdP });
            break;
          }
          case "social-atom-person-remove": {
            if (!client) return;
            await storage.removeSocialAtomPerson(msg.personId);
            broadcast(client.sessionId, { type: "social-atom-person-removed", personId: msg.personId });
            break;
          }
          case "social-atom-connection-add": {
            if (!client) return;
            const saConn = await storage.addSocialAtomConnection({
              sessionId: client.sessionId, fromPersonId: msg.fromPersonId,
              toPersonId: msg.toPersonId, style: msg.style || "supportive",
              label: msg.label || null, directionality: msg.directionality || "bidirectional",
              createdBy: client.participantId,
            });
            broadcast(client.sessionId, { type: "social-atom-connection-added", connection: saConn });
            break;
          }
          case "social-atom-connection-remove": {
            if (!client) return;
            await storage.removeSocialAtomConnection(msg.connectionId);
            broadcast(client.sessionId, { type: "social-atom-connection-removed", connectionId: msg.connectionId });
            break;
          }
          case "social-atom-clear": {
            if (!client) return;
            await storage.clearSocialAtomPeople(client.sessionId);
            broadcast(client.sessionId, { type: "social-atom-cleared" });
            break;
          }

          // --- Growth Garden ---
          case "garden-plant-add": {
            if (!client) return;
            const gPlant = await storage.addGardenPlant({
              sessionId: client.sessionId, createdBy: client.participantId,
              seedType: msg.seedType, customName: msg.customName,
              category: msg.category, growthStage: msg.growthStage || 1,
              gridX: msg.gridX, gridY: msg.gridY,
            });
            broadcast(client.sessionId, { type: "garden-plant-added", plant: gPlant, createdBy: client.participantId });
            break;
          }
          case "garden-plant-update": {
            if (!client) return;
            const gFields: Record<string, any> = {};
            if (msg.growthStage !== undefined) gFields.growthStage = msg.growthStage;
            if (msg.gridX !== undefined) gFields.gridX = msg.gridX;
            if (msg.gridY !== undefined) gFields.gridY = msg.gridY;
            if (msg.isHarvested !== undefined) gFields.isHarvested = msg.isHarvested;
            if (msg.isDormant !== undefined) gFields.isDormant = msg.isDormant;
            if (msg.customName !== undefined) gFields.customName = msg.customName;
            const gUpd = await storage.updateGardenPlant(msg.plantId, gFields);
            broadcast(client.sessionId, { type: "garden-plant-updated", plant: gUpd });
            break;
          }
          case "garden-plant-remove": {
            if (!client) return;
            await storage.removeGardenPlant(msg.plantId);
            broadcast(client.sessionId, { type: "garden-plant-removed", plantId: msg.plantId });
            break;
          }
          case "garden-journal-add": {
            if (!client) return;
            const gJournal = await storage.addGardenJournalEntry({
              plantId: msg.plantId, sessionId: client.sessionId,
              content: msg.content, progressRating: msg.progressRating || null,
              createdBy: client.participantId,
            });
            broadcast(client.sessionId, { type: "garden-journal-added", entry: gJournal });
            break;
          }
          case "garden-weed-add": {
            if (!client) return;
            const gWeed = await storage.addGardenWeed({
              sessionId: client.sessionId, createdBy: client.participantId,
              label: msg.label, linkedPlantId: msg.linkedPlantId || null,
            });
            broadcast(client.sessionId, { type: "garden-weed-added", weed: gWeed });
            break;
          }
          case "garden-weed-pull": {
            if (!client) return;
            const gPulled = await storage.updateGardenWeed(msg.weedId, { isPulled: true });
            broadcast(client.sessionId, { type: "garden-weed-pulled", weed: gPulled });
            break;
          }
          case "garden-clear": {
            if (!client) return;
            await storage.clearGardenPlants(client.sessionId);
            broadcast(client.sessionId, { type: "garden-cleared" });
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
