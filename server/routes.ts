import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { insertSessionSchema, insertParticipantSchema, insertSandtrayItemSchema } from "@shared/schema";
import { setupWebSocketServer } from "./websocket";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // --- Session Routes ---

  app.post("/api/sessions", async (req, res) => {
    try {
      const data = insertSessionSchema.parse(req.body);
      const session = await storage.createSession(data);
      res.json(session);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.get("/api/sessions/:id", async (req, res) => {
    const session = await storage.getSession(req.params.id);
    if (!session) return res.status(404).json({ message: "Session not found" });
    res.json(session);
  });

  app.get("/api/sessions/invite/:code", async (req, res) => {
    const session = await storage.getSessionByInviteCode(req.params.code);
    if (!session) return res.status(404).json({ message: "Invalid invite code" });
    res.json(session);
  });

  app.patch("/api/sessions/:id", async (req, res) => {
    try {
      const session = await storage.updateSession(req.params.id, req.body);
      if (!session) return res.status(404).json({ message: "Session not found" });
      res.json(session);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  // --- Participant Routes ---

  app.post("/api/sessions/:sessionId/participants", async (req, res) => {
    try {
      const data = insertParticipantSchema.parse({
        ...req.body,
        sessionId: req.params.sessionId,
      });
      const participant = await storage.addParticipant(data);
      res.json(participant);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.get("/api/sessions/:sessionId/participants", async (req, res) => {
    const list = await storage.getParticipantsBySession(req.params.sessionId);
    res.json(list);
  });

  app.delete("/api/participants/:id", async (req, res) => {
    await storage.removeParticipant(req.params.id);
    res.json({ ok: true });
  });

  // --- Sandtray Item Routes ---

  app.get("/api/sessions/:sessionId/items", async (req, res) => {
    const items = await storage.getSandtrayItems(req.params.sessionId);
    res.json(items);
  });

  app.post("/api/sessions/:sessionId/items", async (req, res) => {
    try {
      const data = insertSandtrayItemSchema.parse({
        ...req.body,
        sessionId: req.params.sessionId,
      });
      const item = await storage.addSandtrayItem(data);
      res.json(item);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.patch("/api/items/:id", async (req, res) => {
    const item = await storage.updateSandtrayItem(req.params.id, req.body);
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  });

  app.delete("/api/items/:id", async (req, res) => {
    await storage.removeSandtrayItem(req.params.id);
    res.json({ ok: true });
  });

  app.delete("/api/sessions/:sessionId/items", async (req, res) => {
    await storage.clearSandtrayItems(req.params.sessionId);
    res.json({ ok: true });
  });

  // --- WebSocket Setup ---
  setupWebSocketServer(httpServer);

  return httpServer;
}
