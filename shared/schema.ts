import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  role: text("role").notNull().default("client"),
});

export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  clinicianId: varchar("clinician_id").references(() => users.id),
  inviteCode: text("invite_code").notNull().unique(),
  status: text("status").notNull().default("active"),
  isCanvasLocked: boolean("is_canvas_locked").notNull().default(false),
  isAnonymous: boolean("is_anonymous").notNull().default(false),
  activeTool: text("active_tool").notNull().default("sandtray"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const participants = pgTable("participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => sessions.id),
  userId: varchar("user_id").references(() => users.id),
  displayName: text("display_name").notNull(),
  role: text("role").notNull().default("client"),
  color: text("color").notNull().default("#D4AF37"),
});

export const sandtrayItems = pgTable("sandtray_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => sessions.id),
  placedBy: varchar("placed_by"),
  icon: text("icon").notNull(),
  category: text("category").notNull(),
  x: real("x").notNull(),
  y: real("y").notNull(),
  scale: real("scale").notNull().default(1),
  rotation: real("rotation").notNull().default(0),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
  role: true,
});

export const insertSessionSchema = createInsertSchema(sessions).pick({
  name: true,
  clinicianId: true,
});

export const insertParticipantSchema = createInsertSchema(participants).pick({
  sessionId: true,
  userId: true,
  displayName: true,
  role: true,
  color: true,
});

export const insertSandtrayItemSchema = createInsertSchema(sandtrayItems).pick({
  sessionId: true,
  placedBy: true,
  icon: true,
  category: true,
  x: true,
  y: true,
  scale: true,
  rotation: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;
export type InsertParticipant = z.infer<typeof insertParticipantSchema>;
export type Participant = typeof participants.$inferSelect;
export type InsertSandtrayItem = z.infer<typeof insertSandtrayItemSchema>;
export type SandtrayItem = typeof sandtrayItems.$inferSelect;
