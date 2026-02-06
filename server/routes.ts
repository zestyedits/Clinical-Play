import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { insertTherapySessionSchema, insertParticipantSchema, insertSandtrayItemSchema, insertToolSuggestionSchema, insertSupportTicketSchema } from "@shared/schema";
import { setupWebSocketServer } from "./websocket";
import { isAuthenticated } from "./auth";
import { registerStripeRoutes } from "./stripe";
import { supabaseAdmin } from "./supabase";
import { db } from "./db";
import { users } from "@shared/models/auth";
import { eq } from "drizzle-orm";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get("/api/auth/config", (_req, res) => {
    res.json({
      url: process.env.SUPABASE_URL,
      anonKey: process.env.SUPABASE_ANON_KEY,
    });
  });

  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.authUser.id;
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json({ ...user, emailConfirmed: req.authUser.emailConfirmed });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post("/api/auth/resend-verification", isAuthenticated, async (req: any, res) => {
    try {
      const email = req.authUser.email;
      const { error } = await supabaseAdmin.auth.resend({
        type: "signup",
        email,
      });
      if (error) {
        return res.status(400).json({ message: error.message });
      }
      res.json({ message: "Verification email sent" });
    } catch (error) {
      console.error("Error resending verification:", error);
      res.status(500).json({ message: "Failed to send verification email" });
    }
  });

  // --- Session Routes (protected: clinicians must be logged in) ---

  app.get("/api/therapy-sessions/mine", isAuthenticated, async (req: any, res) => {
    const userId = req.authUser.id;
    const mySessions = await storage.getSessionsByClinician(userId);
    res.json(mySessions);
  });

  app.post("/api/therapy-sessions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.authUser.id;
      const data = insertTherapySessionSchema.parse({
        ...req.body,
        clinicianId: userId,
      });
      const session = await storage.createSession(data);
      res.json(session);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.get("/api/therapy-sessions/:id", async (req, res) => {
    const session = await storage.getSession(req.params.id);
    if (!session) return res.status(404).json({ message: "Session not found" });
    res.json(session);
  });

  app.get("/api/therapy-sessions/invite/:code", async (req, res) => {
    const session = await storage.getSessionByInviteCode(req.params.code);
    if (!session) return res.status(404).json({ message: "Invalid invite code" });
    res.json(session);
  });

  app.patch("/api/therapy-sessions/:id", isAuthenticated, async (req: any, res) => {
    try {
      const session = await storage.updateSession(req.params.id, req.body);
      if (!session) return res.status(404).json({ message: "Session not found" });
      res.json(session);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  // --- Participant Routes ---

  app.post("/api/therapy-sessions/:sessionId/participants", async (req, res) => {
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

  app.get("/api/therapy-sessions/:sessionId/participants", async (req, res) => {
    const list = await storage.getParticipantsBySession(req.params.sessionId);
    res.json(list);
  });

  app.delete("/api/participants/:id", async (req, res) => {
    await storage.removeParticipant(req.params.id);
    res.json({ ok: true });
  });

  // --- Sandtray Item Routes ---

  app.get("/api/therapy-sessions/:sessionId/items", async (req, res) => {
    const items = await storage.getSandtrayItems(req.params.sessionId);
    res.json(items);
  });

  app.post("/api/therapy-sessions/:sessionId/items", async (req, res) => {
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

  app.delete("/api/therapy-sessions/:sessionId/items", async (req, res) => {
    await storage.clearSandtrayItems(req.params.sessionId);
    res.json({ ok: true });
  });

  // --- Tool Suggestion Routes ---

  app.post("/api/tool-suggestions", async (req, res) => {
    try {
      const data = insertToolSuggestionSchema.parse(req.body);
      const suggestion = await storage.addToolSuggestion(data);
      res.json(suggestion);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  // --- Support Ticket Routes ---

  app.post("/api/support-tickets", async (req, res) => {
    try {
      const data = insertSupportTicketSchema.parse(req.body);
      const ticket = await storage.addSupportTicket(data);
      res.json(ticket);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  // --- Stripe Billing Routes ---
  registerStripeRoutes(app);

  // --- WebSocket Setup ---
  setupWebSocketServer(httpServer);

  return httpServer;
}
