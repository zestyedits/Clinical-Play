import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, real, integer, jsonb } from "drizzle-orm/pg-core";
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
  activeTool: text("active_tool").notNull().default("volume-mixer"),
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

export const theaterParts = pgTable("theater_parts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => therapySessions.id),
  placedBy: varchar("placed_by"),
  name: text("name"),
  x: real("x").notNull(),
  y: real("y").notNull(),
  size: text("size").notNull().default("medium"),
  color: text("color").notNull().default("#1B2A4A"),
  note: text("note"),
  isContained: boolean("is_contained").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const theaterConnections = pgTable("theater_connections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => therapySessions.id),
  fromPartId: varchar("from_part_id").notNull().references(() => theaterParts.id, { onDelete: "cascade" }),
  toPartId: varchar("to_part_id").notNull().references(() => theaterParts.id, { onDelete: "cascade" }),
  style: text("style").notNull().default("solid"),
  createdBy: varchar("created_by"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
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

// --- Tool: Emotion Thermometer ---
export const thermometerReadings = pgTable("thermometer_readings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => therapySessions.id),
  createdBy: varchar("created_by"),
  emotionLabel: text("emotion_label").notNull(),
  intensity: integer("intensity").notNull(),
  bodyLocation: text("body_location"),
  triggerNote: text("trigger_note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// --- Tool: Containment Box ---
export const containmentContainers = pgTable("containment_containers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => therapySessions.id),
  createdBy: varchar("created_by"),
  containerType: text("container_type").notNull().default("chest"),
  isLocked: boolean("is_locked").notNull().default(false),
  lockMethod: text("lock_method"),
  containmentStrength: integer("containment_strength"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const containmentItems = pgTable("containment_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  containerId: varchar("container_id").notNull().references(() => containmentContainers.id, { onDelete: "cascade" }),
  sessionId: varchar("session_id").notNull().references(() => therapySessions.id),
  createdBy: varchar("created_by"),
  label: text("label").notNull(),
  emoji: text("emoji"),
  color: text("color"),
  status: text("status").notNull().default("contained"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// --- Tool: Body Scan Map ---
export const bodyScanMarkers = pgTable("body_scan_markers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => therapySessions.id),
  createdBy: varchar("created_by"),
  bodyRegion: text("body_region").notNull(),
  sensationType: text("sensation_type").notNull(),
  intensity: integer("intensity").notNull().default(5),
  emotionLink: text("emotion_link"),
  notes: text("notes"),
  breathReaches: boolean("breath_reaches"),
  movementImpulse: text("movement_impulse"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// --- Tool: Gratitude Jar ---
export const gratitudeStones = pgTable("gratitude_stones", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => therapySessions.id),
  createdBy: varchar("created_by"),
  content: text("content").notNull(),
  category: text("category").notNull().default("general"),
  color: text("color").notNull().default("#F59E0B"),
  shape: text("shape").notNull().default("round"),
  isStarred: boolean("is_starred").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// --- Tool: Fidget Tools ---
export const fidgetSessions = pgTable("fidget_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => therapySessions.id),
  participantId: varchar("participant_id"),
  widgetType: text("widget_type").notNull(),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  endedAt: timestamp("ended_at"),
  interactionCount: integer("interaction_count").notNull().default(0),
});

// --- Tool: Safety Map ---
export const safetyPlanItems = pgTable("safety_plan_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => therapySessions.id),
  createdBy: varchar("created_by"),
  step: integer("step").notNull(),
  content: text("content").notNull(),
  contactName: text("contact_name"),
  contactPhone: text("contact_phone"),
  contactRelationship: text("contact_relationship"),
  orderIndex: integer("order_index").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// --- Tool: Worry Tree ---
export const worryTreeEntries = pgTable("worry_tree_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => therapySessions.id),
  createdBy: varchar("created_by"),
  worryText: text("worry_text").notNull(),
  category: text("category"),
  isReal: boolean("is_real"),
  isActionable: boolean("is_actionable"),
  resolution: text("resolution"),
  actionSteps: jsonb("action_steps"),
  scheduledTime: text("scheduled_time"),
  lettingGoMethod: text("letting_go_method"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// --- Tool: Thought Bridge ---
export const thoughtBridgeRecords = pgTable("thought_bridge_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => therapySessions.id),
  createdBy: varchar("created_by"),
  situation: text("situation"),
  automaticThought: text("automatic_thought"),
  beliefRatingBefore: integer("belief_rating_before"),
  beliefRatingAfter: integer("belief_rating_after"),
  balancedThought: text("balanced_thought"),
  emotionsBefore: jsonb("emotions_before"),
  emotionsAfter: jsonb("emotions_after"),
  distortions: jsonb("distortions"),
  status: text("status").notNull().default("incomplete"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const thoughtBridgeEvidence = pgTable("thought_bridge_evidence", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  recordId: varchar("record_id").notNull().references(() => thoughtBridgeRecords.id, { onDelete: "cascade" }),
  sessionId: varchar("session_id").notNull().references(() => therapySessions.id),
  type: text("type").notNull(),
  content: text("content").notNull(),
  createdBy: varchar("created_by"),
  orderIndex: integer("order_index").notNull().default(0),
});

// --- Tool: Coping Toolbox ---
export const copingStrategies = pgTable("coping_strategies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => therapySessions.id),
  createdBy: varchar("created_by"),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  emoji: text("emoji"),
  isCustom: boolean("is_custom").notNull().default(false),
  contextTags: jsonb("context_tags"),
  difficulty: text("difficulty"),
  effectiveness: integer("effectiveness"),
  isPinned: boolean("is_pinned").notNull().default(false),
  usageCount: integer("usage_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// --- Tool: DBT House ---
export const dbtHouseSkills = pgTable("dbt_house_skills", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => therapySessions.id),
  createdBy: varchar("created_by"),
  skillId: text("skill_id").notNull(),
  module: text("module").notNull(),
  houseSection: text("house_section").notNull(),
  personalExample: text("personal_example"),
  practiceCount: integer("practice_count").notNull().default(0),
  lastPracticedAt: timestamp("last_practiced_at"),
  effectivenessAvg: real("effectiveness_avg"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// --- Tool: Strengths Deck ---
export const strengthsPlacements = pgTable("strengths_placements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => therapySessions.id),
  createdBy: varchar("created_by"),
  strengthId: text("strength_id").notNull(),
  tier: text("tier").notNull().default("sometimes"),
  orderIndex: integer("order_index").notNull().default(0),
  scenarioResponse: text("scenario_response"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const strengthsSpottings = pgTable("strengths_spottings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => therapySessions.id),
  createdBy: varchar("created_by"),
  strengthId: text("strength_id").notNull(),
  note: text("note").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// --- Tool: Social Atom ---
export const socialAtomPeople = pgTable("social_atom_people", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => therapySessions.id),
  createdBy: varchar("created_by"),
  name: text("name").notNull(),
  role: text("role").notNull(),
  emoji: text("emoji"),
  color: text("color").notNull().default("#3B82F6"),
  distanceRing: integer("distance_ring").notNull().default(2),
  angle: real("angle").notNull().default(0),
  groupId: varchar("group_id"),
  isDeceased: boolean("is_deceased").notNull().default(false),
  emotionalTone: text("emotional_tone"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const socialAtomConnections = pgTable("social_atom_connections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => therapySessions.id),
  fromPersonId: varchar("from_person_id").notNull().references(() => socialAtomPeople.id, { onDelete: "cascade" }),
  toPersonId: varchar("to_person_id").notNull().references(() => socialAtomPeople.id, { onDelete: "cascade" }),
  style: text("style").notNull().default("supportive"),
  label: text("label"),
  directionality: text("directionality").notNull().default("bidirectional"),
  createdBy: varchar("created_by"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const socialAtomGroups = pgTable("social_atom_groups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => therapySessions.id),
  label: text("label").notNull(),
  color: text("color").notNull().default("#8B5CF6"),
  createdBy: varchar("created_by"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// --- Tool: Growth Garden ---
export const gardenPlants = pgTable("garden_plants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => therapySessions.id),
  createdBy: varchar("created_by"),
  seedType: text("seed_type").notNull(),
  customName: text("custom_name").notNull(),
  category: text("category").notNull(),
  growthStage: integer("growth_stage").notNull().default(1),
  gridX: real("grid_x").notNull(),
  gridY: real("grid_y").notNull(),
  isHarvested: boolean("is_harvested").notNull().default(false),
  isDormant: boolean("is_dormant").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const gardenJournalEntries = pgTable("garden_journal_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  plantId: varchar("plant_id").notNull().references(() => gardenPlants.id, { onDelete: "cascade" }),
  sessionId: varchar("session_id").notNull().references(() => therapySessions.id),
  content: text("content").notNull(),
  progressRating: text("progress_rating"),
  createdBy: varchar("created_by"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const gardenWeeds = pgTable("garden_weeds", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => therapySessions.id),
  createdBy: varchar("created_by"),
  label: text("label").notNull(),
  linkedPlantId: varchar("linked_plant_id"),
  isPulled: boolean("is_pulled").notNull().default(false),
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

export const insertTheaterPartSchema = createInsertSchema(theaterParts).pick({
  sessionId: true,
  placedBy: true,
  name: true,
  x: true,
  y: true,
  size: true,
  color: true,
  note: true,
  isContained: true,
});

export const insertTheaterConnectionSchema = createInsertSchema(theaterConnections).pick({
  sessionId: true,
  fromPartId: true,
  toPartId: true,
  style: true,
  createdBy: true,
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

export const insertThermometerReadingSchema = createInsertSchema(thermometerReadings).pick({
  sessionId: true, createdBy: true, emotionLabel: true, intensity: true, bodyLocation: true, triggerNote: true,
});

export const insertContainmentContainerSchema = createInsertSchema(containmentContainers).pick({
  sessionId: true, createdBy: true, containerType: true, isLocked: true, lockMethod: true, containmentStrength: true,
});

export const insertContainmentItemSchema = createInsertSchema(containmentItems).pick({
  containerId: true, sessionId: true, createdBy: true, label: true, emoji: true, color: true, status: true,
});

export const insertBodyScanMarkerSchema = createInsertSchema(bodyScanMarkers).pick({
  sessionId: true, createdBy: true, bodyRegion: true, sensationType: true, intensity: true, emotionLink: true, notes: true, breathReaches: true, movementImpulse: true,
});

export const insertGratitudeStoneSchema = createInsertSchema(gratitudeStones).pick({
  sessionId: true, createdBy: true, content: true, category: true, color: true, shape: true, isStarred: true,
});

export const insertFidgetSessionSchema = createInsertSchema(fidgetSessions).pick({
  sessionId: true, participantId: true, widgetType: true, interactionCount: true,
});

export const insertSafetyPlanItemSchema = createInsertSchema(safetyPlanItems).pick({
  sessionId: true, createdBy: true, step: true, content: true, contactName: true, contactPhone: true, contactRelationship: true, orderIndex: true,
});

export const insertWorryTreeEntrySchema = createInsertSchema(worryTreeEntries).pick({
  sessionId: true, createdBy: true, worryText: true, category: true, isReal: true, isActionable: true, resolution: true, actionSteps: true, scheduledTime: true, lettingGoMethod: true,
});

export const insertThoughtBridgeRecordSchema = createInsertSchema(thoughtBridgeRecords).pick({
  sessionId: true, createdBy: true, situation: true, automaticThought: true, beliefRatingBefore: true, beliefRatingAfter: true, balancedThought: true, emotionsBefore: true, emotionsAfter: true, distortions: true, status: true,
});

export const insertThoughtBridgeEvidenceSchema = createInsertSchema(thoughtBridgeEvidence).pick({
  recordId: true, sessionId: true, type: true, content: true, createdBy: true, orderIndex: true,
});

export const insertCopingStrategySchema = createInsertSchema(copingStrategies).pick({
  sessionId: true, createdBy: true, name: true, description: true, category: true, emoji: true, isCustom: true, contextTags: true, difficulty: true, effectiveness: true, isPinned: true,
});

export const insertDbtHouseSkillSchema = createInsertSchema(dbtHouseSkills).pick({
  sessionId: true, createdBy: true, skillId: true, module: true, houseSection: true, personalExample: true,
});

export const insertStrengthsPlacementSchema = createInsertSchema(strengthsPlacements).pick({
  sessionId: true, createdBy: true, strengthId: true, tier: true, orderIndex: true, scenarioResponse: true,
});

export const insertStrengthsSpottingSchema = createInsertSchema(strengthsSpottings).pick({
  sessionId: true, createdBy: true, strengthId: true, note: true,
});

export const insertSocialAtomPersonSchema = createInsertSchema(socialAtomPeople).pick({
  sessionId: true, createdBy: true, name: true, role: true, emoji: true, color: true, distanceRing: true, angle: true, groupId: true, isDeceased: true, emotionalTone: true, notes: true,
});

export const insertSocialAtomConnectionSchema = createInsertSchema(socialAtomConnections).pick({
  sessionId: true, fromPersonId: true, toPersonId: true, style: true, label: true, directionality: true, createdBy: true,
});

export const insertSocialAtomGroupSchema = createInsertSchema(socialAtomGroups).pick({
  sessionId: true, label: true, color: true, createdBy: true,
});

export const insertGardenPlantSchema = createInsertSchema(gardenPlants).pick({
  sessionId: true, createdBy: true, seedType: true, customName: true, category: true, growthStage: true, gridX: true, gridY: true,
});

export const insertGardenJournalEntrySchema = createInsertSchema(gardenJournalEntries).pick({
  plantId: true, sessionId: true, content: true, progressRating: true, createdBy: true,
});

export const insertGardenWeedSchema = createInsertSchema(gardenWeeds).pick({
  sessionId: true, createdBy: true, label: true, linkedPlantId: true,
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
export type InsertTheaterPart = z.infer<typeof insertTheaterPartSchema>;
export type TheaterPart = typeof theaterParts.$inferSelect;
export type InsertTheaterConnection = z.infer<typeof insertTheaterConnectionSchema>;
export type TheaterConnection = typeof theaterConnections.$inferSelect;
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;
export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertWaitlistEntry = z.infer<typeof insertWaitlistEntrySchema>;
export type WaitlistEntry = typeof waitlistEntries.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export type InsertThermometerReading = z.infer<typeof insertThermometerReadingSchema>;
export type ThermometerReading = typeof thermometerReadings.$inferSelect;
export type InsertContainmentContainer = z.infer<typeof insertContainmentContainerSchema>;
export type ContainmentContainer = typeof containmentContainers.$inferSelect;
export type InsertContainmentItem = z.infer<typeof insertContainmentItemSchema>;
export type ContainmentItem = typeof containmentItems.$inferSelect;
export type InsertBodyScanMarker = z.infer<typeof insertBodyScanMarkerSchema>;
export type BodyScanMarker = typeof bodyScanMarkers.$inferSelect;
export type InsertGratitudeStone = z.infer<typeof insertGratitudeStoneSchema>;
export type GratitudeStone = typeof gratitudeStones.$inferSelect;
export type InsertFidgetSession = z.infer<typeof insertFidgetSessionSchema>;
export type FidgetSession = typeof fidgetSessions.$inferSelect;
export type InsertSafetyPlanItem = z.infer<typeof insertSafetyPlanItemSchema>;
export type SafetyPlanItem = typeof safetyPlanItems.$inferSelect;
export type InsertWorryTreeEntry = z.infer<typeof insertWorryTreeEntrySchema>;
export type WorryTreeEntry = typeof worryTreeEntries.$inferSelect;
export type InsertThoughtBridgeRecord = z.infer<typeof insertThoughtBridgeRecordSchema>;
export type ThoughtBridgeRecord = typeof thoughtBridgeRecords.$inferSelect;
export type InsertThoughtBridgeEvidence = z.infer<typeof insertThoughtBridgeEvidenceSchema>;
export type ThoughtBridgeEvidence = typeof thoughtBridgeEvidence.$inferSelect;
export type InsertCopingStrategy = z.infer<typeof insertCopingStrategySchema>;
export type CopingStrategy = typeof copingStrategies.$inferSelect;
export type InsertDbtHouseSkill = z.infer<typeof insertDbtHouseSkillSchema>;
export type DbtHouseSkill = typeof dbtHouseSkills.$inferSelect;
export type InsertStrengthsPlacement = z.infer<typeof insertStrengthsPlacementSchema>;
export type StrengthsPlacement = typeof strengthsPlacements.$inferSelect;
export type InsertStrengthsSpotting = z.infer<typeof insertStrengthsSpottingSchema>;
export type StrengthsSpotting = typeof strengthsSpottings.$inferSelect;
export type InsertSocialAtomPerson = z.infer<typeof insertSocialAtomPersonSchema>;
export type SocialAtomPerson = typeof socialAtomPeople.$inferSelect;
export type InsertSocialAtomConnection = z.infer<typeof insertSocialAtomConnectionSchema>;
export type SocialAtomConnection = typeof socialAtomConnections.$inferSelect;
export type InsertSocialAtomGroup = z.infer<typeof insertSocialAtomGroupSchema>;
export type SocialAtomGroup = typeof socialAtomGroups.$inferSelect;
export type InsertGardenPlant = z.infer<typeof insertGardenPlantSchema>;
export type GardenPlant = typeof gardenPlants.$inferSelect;
export type InsertGardenJournalEntry = z.infer<typeof insertGardenJournalEntrySchema>;
export type GardenJournalEntry = typeof gardenJournalEntries.$inferSelect;
export type InsertGardenWeed = z.infer<typeof insertGardenWeedSchema>;
export type GardenWeed = typeof gardenWeeds.$inferSelect;
