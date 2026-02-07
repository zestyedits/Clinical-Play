import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { insertTherapySessionSchema, insertParticipantSchema, insertSandtrayItemSchema, insertToolSuggestionSchema, insertSupportTicketSchema, insertWaitlistEntrySchema, insertMessageSchema } from "@shared/schema";
import { setupWebSocketServer } from "./websocket";
import { isAuthenticated } from "./auth";
import { registerStripeRoutes } from "./stripe";
import { supabaseAdmin } from "./supabase";
import { db } from "./db";
import { users } from "@shared/models/auth";
import { eq } from "drizzle-orm";
import { notifyAdminWaitlistSignup, notifyAdminSupportMessage, sendAnnouncementEmail } from "./email";

const ADMIN_EMAIL = "clinicalplayapp@gmail.com";

function isAdmin(req: any): boolean {
  return req.authUser?.email?.toLowerCase() === ADMIN_EMAIL;
}

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

  // --- Waitlist Routes (public) ---

  app.post("/api/waitlist", async (req, res) => {
    try {
      const data = insertWaitlistEntrySchema.parse(req.body);
      data.email = data.email.toLowerCase().trim();
      const entry = await storage.addWaitlistEntry(data);
      notifyAdminWaitlistSignup(data.email, data.name);
      res.json(entry);
    } catch (e: any) {
      if (e.code === "23505") {
        return res.status(409).json({ message: "You're already on the waitlist!" });
      }
      res.status(400).json({ message: e.message });
    }
  });

  // --- Messages / Inbox Routes ---

  app.get("/api/messages", isAuthenticated, async (req: any, res) => {
    const userId = req.authUser.id;
    const msgs = await storage.getMessagesForUser(userId);
    res.json(msgs);
  });

  app.get("/api/messages/unread-count", isAuthenticated, async (req: any, res) => {
    const userId = req.authUser.id;
    const count = await storage.getUnreadCount(userId);
    res.json({ count });
  });

  app.patch("/api/messages/:id/read", isAuthenticated, async (req: any, res) => {
    await storage.markMessageRead(req.params.id, req.authUser.id);
    res.json({ ok: true });
  });

  app.post("/api/messages/support", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.authUser.id;
      const { subject, body } = req.body;
      if (!subject || !body) return res.status(400).json({ message: "Subject and message are required" });
      const msg = await storage.createMessage({
        fromUserId: userId,
        toUserId: null,
        subject,
        body,
        isAnnouncement: false,
      });
      notifyAdminSupportMessage(req.authUser.email, subject, body);
      res.json(msg);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  // --- Admin Routes (protected: admin only) ---

  app.get("/api/admin/users", isAuthenticated, async (req: any, res) => {
    if (!isAdmin(req)) return res.status(403).json({ message: "Forbidden" });
    const allUsers = await storage.getAllUsers();
    res.json(allUsers);
  });

  app.patch("/api/admin/users/:id", isAuthenticated, async (req: any, res) => {
    if (!isAdmin(req)) return res.status(403).json({ message: "Forbidden" });
    try {
      const user = await storage.updateUser(req.params.id, req.body);
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(user);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.delete("/api/admin/users/:id", isAuthenticated, async (req: any, res) => {
    if (!isAdmin(req)) return res.status(403).json({ message: "Forbidden" });
    try {
      await storage.deleteUser(req.params.id);
      res.json({ ok: true });
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.get("/api/admin/waitlist", isAuthenticated, async (req: any, res) => {
    if (!isAdmin(req)) return res.status(403).json({ message: "Forbidden" });
    const entries = await storage.getWaitlistEntries();
    res.json(entries);
  });

  app.delete("/api/admin/waitlist/:id", isAuthenticated, async (req: any, res) => {
    if (!isAdmin(req)) return res.status(403).json({ message: "Forbidden" });
    await storage.removeWaitlistEntry(req.params.id);
    res.json({ ok: true });
  });

  app.post("/api/admin/announcements", isAuthenticated, async (req: any, res) => {
    if (!isAdmin(req)) return res.status(403).json({ message: "Forbidden" });
    try {
      const { subject, body, sendEmail } = req.body;
      if (!subject || !body) return res.status(400).json({ message: "Subject and body required" });

      const msg = await storage.createMessage({
        fromUserId: req.authUser.id,
        toUserId: null,
        subject,
        body,
        isAnnouncement: true,
      });

      if (sendEmail) {
        const allUsers = await storage.getAllUsers();
        for (const user of allUsers) {
          if (user.email) {
            await sendAnnouncementEmail(user.email, subject, body);
          }
        }
      }

      res.json(msg);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.get("/api/admin/check", isAuthenticated, async (req: any, res) => {
    res.json({ isAdmin: isAdmin(req) });
  });

  // --- Stripe Billing Routes ---
  registerStripeRoutes(app);

  // --- WebSocket Setup ---
  setupWebSocketServer(httpServer);

  return httpServer;
}
