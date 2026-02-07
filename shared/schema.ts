import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, real, integer } from "drizzle-orm/pg-core";
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
  endedAt: timestamp("ended_at"),
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

export const feelingWheelSelections = pgTable("feeling_wheel_selections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => therapySessions.id),
  selectedBy: varchar("selected_by"),
  primaryEmotion: text("primary_emotion").notNull(),
  secondaryEmotion: text("secondary_emotion"),
  tertiaryEmotion: text("tertiary_emotion"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const timelineEvents = pgTable("timeline_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => therapySessions.id),
  placedBy: varchar("placed_by"),
  label: text("label").notNull(),
  description: text("description"),
  position: real("position").notNull(),
  color: text("color").notNull().default("#1B2A4A"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const valuesCardPlacements = pgTable("values_card_placements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => therapySessions.id),
  placedBy: varchar("placed_by"),
  cardId: text("card_id").notNull(),
  label: text("label").notNull(),
  column: text("column").notNull().default("deck"),
  orderIndex: integer("order_index").notNull().default(0),
});

export const supportTickets = pgTable("support_tickets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("open"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const waitlistEntries = pgTable("waitlist_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  name: text("name"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fromUserId: varchar("from_user_id").references(() => users.id),
  toUserId: varchar("to_user_id").references(() => users.id),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  isAnnouncement: boolean("is_announcement").notNull().default(false),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// --- Insert Schemas ---

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

export const insertToolSuggestionSchema = createInsertSchema(toolSuggestions).pick({
  clinicianId: true,
  toolName: true,
  description: true,
  email: true,
});

export const insertFeelingWheelSelectionSchema = createInsertSchema(feelingWheelSelections).pick({
  sessionId: true,
  selectedBy: true,
  primaryEmotion: true,
  secondaryEmotion: true,
  tertiaryEmotion: true,
});

export const insertTimelineEventSchema = createInsertSchema(timelineEvents).pick({
  sessionId: true,
  placedBy: true,
  label: true,
  description: true,
  position: true,
  color: true,
});

export const insertValuesCardPlacementSchema = createInsertSchema(valuesCardPlacements).pick({
  sessionId: true,
  placedBy: true,
  cardId: true,
  label: true,
  column: true,
  orderIndex: true,
});

export const insertSupportTicketSchema = createInsertSchema(supportTickets).pick({
  name: true,
  email: true,
  message: true,
});

export const insertWaitlistEntrySchema = createInsertSchema(waitlistEntries).pick({
  email: true,
  name: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  fromUserId: true,
  toUserId: true,
  subject: true,
  body: true,
  isAnnouncement: true,
});

// --- Types ---

export type InsertTherapySession = z.infer<typeof insertTherapySessionSchema>;
export type TherapySession = typeof therapySessions.$inferSelect;
export type InsertParticipant = z.infer<typeof insertParticipantSchema>;
export type Participant = typeof participants.$inferSelect;
export type InsertSandtrayItem = z.infer<typeof insertSandtrayItemSchema>;
export type SandtrayItem = typeof sandtrayItems.$inferSelect;
export type InsertToolSuggestion = z.infer<typeof insertToolSuggestionSchema>;
export type ToolSuggestion = typeof toolSuggestions.$inferSelect;
export type InsertFeelingWheelSelection = z.infer<typeof insertFeelingWheelSelectionSchema>;
export type FeelingWheelSelection = typeof feelingWheelSelections.$inferSelect;
export type InsertTimelineEvent = z.infer<typeof insertTimelineEventSchema>;
export type TimelineEvent = typeof timelineEvents.$inferSelect;
export type InsertValuesCardPlacement = z.infer<typeof insertValuesCardPlacementSchema>;
export type ValuesCardPlacement = typeof valuesCardPlacements.$inferSelect;
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;
export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertWaitlistEntry = z.infer<typeof insertWaitlistEntrySchema>;
export type WaitlistEntry = typeof waitlistEntries.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
