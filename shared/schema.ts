import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/auth";
import { users } from "./models/auth";

export const therapySessions = pgTable("therapy_sessions", {
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
  sessionId: varchar("session_id").notNull().references(() => therapySessions.id),
  userId: varchar("user_id").references(() => users.id),
  displayName: text("display_name").notNull(),
  role: text("role").notNull().default("client"),
  color: text("color").notNull().default("#D4AF37"),
});

export const sandtrayItems = pgTable("sandtray_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => therapySessions.id),
  placedBy: varchar("placed_by"),
  icon: text("icon").notNull(),
  category: text("category").notNull(),
  x: real("x").notNull(),
  y: real("y").notNull(),
  scale: real("scale").notNull().default(1),
  rotation: real("rotation").notNull().default(0),
});

export const toolSuggestions = pgTable("tool_suggestions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clinicianId: varchar("clinician_id").references(() => users.id),
  toolName: text("tool_name").notNull(),
  description: text("description"),
  email: text("email"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTherapySessionSchema = createInsertSchema(therapySessions).pick({
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

export type InsertTherapySession = z.infer<typeof insertTherapySessionSchema>;
export type TherapySession = typeof therapySessions.$inferSelect;
export type InsertParticipant = z.infer<typeof insertParticipantSchema>;
export type Participant = typeof participants.$inferSelect;
export const insertToolSuggestionSchema = createInsertSchema(toolSuggestions).pick({
  clinicianId: true,
  toolName: true,
  description: true,
  email: true,
});

export type InsertSandtrayItem = z.infer<typeof insertSandtrayItemSchema>;
export type SandtrayItem = typeof sandtrayItems.$inferSelect;
export type InsertToolSuggestion = z.infer<typeof insertToolSuggestionSchema>;
export type ToolSuggestion = typeof toolSuggestions.$inferSelect;
