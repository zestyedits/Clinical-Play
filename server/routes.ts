import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { insertTherapySessionSchema, insertParticipantSchema, insertSandtrayItemSchema, insertToolSuggestionSchema, insertSupportTicketSchema, insertWaitlistEntrySchema, insertMessageSchema } from "@shared/schema";
import { setupWebSocketServer, broadcastSessionEnded } from "./websocket";
import { isAuthenticated } from "./auth";
import { registerStripeRoutes } from "./stripe";
import { supabaseAdmin } from "./supabase";
import { db } from "./db";
import { users } from "@shared/models/auth";
import { eq } from "drizzle-orm";
import { notifyAdminWaitlistSignup, notifyAdminSupportMessage, sendAnnouncementEmail, sendWelcomeVerificationEmail } from "./email";

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

  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ message: "All fields are required" });
      }
      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: false,
        user_metadata: { firstName, lastName },
      });

      if (createError) {
        return res.status(400).json({ message: createError.message });
      }

      const redirectTo = `${req.protocol}://${req.get("host")}/email-confirmed`;
      const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
        type: "signup",
        email,
        password,
        options: { redirectTo },
      });

      if (linkError) {
        console.error("Failed to generate verification link:", linkError);
      } else if (linkData?.properties?.action_link) {
        await sendWelcomeVerificationEmail(email, firstName, linkData.properties.action_link);
      }

      res.json({ message: "Account created successfully" });
    } catch (error) {
      console.error("Error during signup:", error);
      res.status(500).json({ message: "Failed to create account" });
    }
  });

  app.get("/api/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.authUser.id;
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        professionalTitle: user.professionalTitle,
        clinicalSpecialty: user.clinicalSpecialty,
        defaultAnonymous: user.defaultAnonymous,
        profileImageUrl: user.profileImageUrl,
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.patch("/api/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.authUser.id;
      const { firstName, lastName, professionalTitle, clinicalSpecialty, defaultAnonymous } = req.body;
      const [updated] = await db
        .update(users)
        .set({
          ...(firstName !== undefined && { firstName }),
          ...(lastName !== undefined && { lastName }),
          ...(professionalTitle !== undefined && { professionalTitle }),
          ...(clinicalSpecialty !== undefined && { clinicalSpecialty }),
          ...(defaultAnonymous !== undefined && { defaultAnonymous }),
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning();
      if (!updated) return res.status(404).json({ message: "User not found" });
      res.json({
        firstName: updated.firstName,
        lastName: updated.lastName,
        professionalTitle: updated.professionalTitle,
        clinicalSpecialty: updated.clinicalSpecialty,
        defaultAnonymous: updated.defaultAnonymous,
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Workspace aliases (same handlers as /api/profile, for privacy-first rename)
  app.get("/api/workspace", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.authUser.id;
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        professionalTitle: user.professionalTitle,
        clinicalSpecialty: user.clinicalSpecialty,
        defaultAnonymous: user.defaultAnonymous,
        profileImageUrl: user.profileImageUrl,
        themePreference: user.themePreference,
      });
    } catch (error) {
      console.error("Error fetching workspace:", error);
      res.status(500).json({ message: "Failed to fetch workspace" });
    }
  });

  app.patch("/api/workspace", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.authUser.id;
      const { firstName, lastName, professionalTitle, clinicalSpecialty, defaultAnonymous, themePreference } = req.body;
      const [updated] = await db
        .update(users)
        .set({
          ...(firstName !== undefined && { firstName }),
          ...(lastName !== undefined && { lastName }),
          ...(professionalTitle !== undefined && { professionalTitle }),
          ...(clinicalSpecialty !== undefined && { clinicalSpecialty }),
          ...(defaultAnonymous !== undefined && { defaultAnonymous }),
          ...(themePreference !== undefined && { themePreference }),
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning();
      if (!updated) return res.status(404).json({ message: "User not found" });
      res.json({
        firstName: updated.firstName,
        lastName: updated.lastName,
        professionalTitle: updated.professionalTitle,
        clinicalSpecialty: updated.clinicalSpecialty,
        defaultAnonymous: updated.defaultAnonymous,
        themePreference: updated.themePreference,
      });
    } catch (error) {
      console.error("Error updating workspace:", error);
      res.status(500).json({ message: "Failed to update workspace" });
    }
  });

  app.post("/api/auth/resend-verification", isAuthenticated, async (req: any, res) => {
    try {
      const email = req.authUser.email;
      const userId = req.authUser.id;

      // Fetch firstName from DB
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      const firstName = user?.firstName || "there";

      const redirectTo = `${req.protocol}://${req.get("host")}/email-confirmed`;
      const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
        type: "magiclink",
        email,
        options: { redirectTo },
      });

      if (linkError) {
        return res.status(400).json({ message: linkError.message });
      }

      if (linkData?.properties?.action_link) {
        await sendWelcomeVerificationEmail(email, firstName, linkData.properties.action_link);
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

  app.post("/api/therapy-sessions/:id/end", isAuthenticated, async (req: any, res) => {
    try {
      const sessionId = req.params.id;
      const existing = await storage.getSession(sessionId);
      if (!existing) return res.status(404).json({ message: "Session not found" });
      if (existing.clinicianId !== req.authUser.id) {
        return res.status(403).json({ message: "Only the session clinician can end a session" });
      }
      if (existing.status === "ended") {
        return res.status(400).json({ message: "Session is already ended" });
      }
      const session = await storage.endSession(sessionId);
      broadcastSessionEnded(sessionId);
      res.json(session);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
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

  app.delete("/api/account", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.authUser.id;
      const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (error) {
        console.error("Supabase delete error:", error);
        return res.status(500).json({ message: "Failed to delete authentication account" });
      }
      await db.delete(users).where(eq(users.id, userId));
      res.json({ message: "Account deleted successfully" });
    } catch (error) {
      console.error("Account deletion error:", error);
      res.status(500).json({ message: "Failed to delete account" });
    }
  });

  // --- Stripe Billing Routes ---
  registerStripeRoutes(app);

  // --- WebSocket Setup ---
  setupWebSocketServer(httpServer);

  return httpServer;
}
