import { eq } from "drizzle-orm";
import { db } from "./db";
import {
  therapySessions, participants, sandtrayItems, toolSuggestions,
  feelingWheelSelections, timelineEvents, valuesCardPlacements,
  type TherapySession, type InsertTherapySession,
  type Participant, type InsertParticipant,
  type SandtrayItem, type InsertSandtrayItem,
  type ToolSuggestion, type InsertToolSuggestion,
  type FeelingWheelSelection, type InsertFeelingWheelSelection,
  type TimelineEvent, type InsertTimelineEvent,
  type ValuesCardPlacement, type InsertValuesCardPlacement,
} from "@shared/schema";

function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export interface IStorage {
  createSession(data: InsertTherapySession): Promise<TherapySession>;
  getSession(id: string): Promise<TherapySession | undefined>;
  getAllSessions(): Promise<TherapySession[]>;
  getSessionByInviteCode(code: string): Promise<TherapySession | undefined>;
  getSessionsByClinician(clinicianId: string): Promise<TherapySession[]>;
  updateSession(id: string, data: Partial<TherapySession>): Promise<TherapySession | undefined>;

  addParticipant(data: InsertParticipant): Promise<Participant>;
  getParticipantsBySession(sessionId: string): Promise<Participant[]>;
  removeParticipant(id: string): Promise<void>;

  addSandtrayItem(data: InsertSandtrayItem): Promise<SandtrayItem>;
  getSandtrayItems(sessionId: string): Promise<SandtrayItem[]>;
  updateSandtrayItem(id: string, data: Partial<SandtrayItem>): Promise<SandtrayItem | undefined>;
  removeSandtrayItem(id: string): Promise<void>;
  clearSandtrayItems(sessionId: string): Promise<void>;

  addToolSuggestion(data: InsertToolSuggestion): Promise<ToolSuggestion>;

  addFeelingSelection(data: InsertFeelingWheelSelection): Promise<FeelingWheelSelection>;
  getFeelingSelections(sessionId: string): Promise<FeelingWheelSelection[]>;
  removeFeelingSelection(id: string): Promise<void>;
  clearFeelingSelections(sessionId: string): Promise<void>;

  addTimelineEvent(data: InsertTimelineEvent): Promise<TimelineEvent>;
  getTimelineEvents(sessionId: string): Promise<TimelineEvent[]>;
  updateTimelineEvent(id: string, data: Partial<TimelineEvent>): Promise<TimelineEvent | undefined>;
  removeTimelineEvent(id: string): Promise<void>;
  clearTimelineEvents(sessionId: string): Promise<void>;

  addValuesCardPlacement(data: InsertValuesCardPlacement): Promise<ValuesCardPlacement>;
  getValuesCardPlacements(sessionId: string): Promise<ValuesCardPlacement[]>;
  updateValuesCardPlacement(id: string, data: Partial<ValuesCardPlacement>): Promise<ValuesCardPlacement | undefined>;
  removeValuesCardPlacement(id: string): Promise<void>;
  clearValuesCardPlacements(sessionId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async createSession(data: InsertTherapySession): Promise<TherapySession> {
    const inviteCode = generateInviteCode();
    const [session] = await db.insert(therapySessions).values({
      ...data,
      inviteCode,
    }).returning();
    return session;
  }

  async getSession(id: string): Promise<TherapySession | undefined> {
    const [session] = await db.select().from(therapySessions).where(eq(therapySessions.id, id));
    return session;
  }

  async getAllSessions(): Promise<TherapySession[]> {
    return db.select().from(therapySessions);
  }

  async getSessionByInviteCode(code: string): Promise<TherapySession | undefined> {
    const [session] = await db.select().from(therapySessions).where(eq(therapySessions.inviteCode, code));
    return session;
  }

  async getSessionsByClinician(clinicianId: string): Promise<TherapySession[]> {
    return db.select().from(therapySessions).where(eq(therapySessions.clinicianId, clinicianId));
  }

  async updateSession(id: string, data: Partial<TherapySession>): Promise<TherapySession | undefined> {
    const [session] = await db.update(therapySessions).set(data).where(eq(therapySessions.id, id)).returning();
    return session;
  }

  async addParticipant(data: InsertParticipant): Promise<Participant> {
    const [participant] = await db.insert(participants).values(data).returning();
    return participant;
  }

  async getParticipantsBySession(sessionId: string): Promise<Participant[]> {
    return db.select().from(participants).where(eq(participants.sessionId, sessionId));
  }

  async removeParticipant(id: string): Promise<void> {
    await db.delete(participants).where(eq(participants.id, id));
  }

  async addSandtrayItem(data: InsertSandtrayItem): Promise<SandtrayItem> {
    const [item] = await db.insert(sandtrayItems).values(data).returning();
    return item;
  }

  async getSandtrayItems(sessionId: string): Promise<SandtrayItem[]> {
    return db.select().from(sandtrayItems).where(eq(sandtrayItems.sessionId, sessionId));
  }

  async updateSandtrayItem(id: string, data: Partial<SandtrayItem>): Promise<SandtrayItem | undefined> {
    const [item] = await db.update(sandtrayItems).set(data).where(eq(sandtrayItems.id, id)).returning();
    return item;
  }

  async removeSandtrayItem(id: string): Promise<void> {
    await db.delete(sandtrayItems).where(eq(sandtrayItems.id, id));
  }

  async clearSandtrayItems(sessionId: string): Promise<void> {
    await db.delete(sandtrayItems).where(eq(sandtrayItems.sessionId, sessionId));
  }

  async addToolSuggestion(data: InsertToolSuggestion): Promise<ToolSuggestion> {
    const [suggestion] = await db.insert(toolSuggestions).values(data).returning();
    return suggestion;
  }

  async addFeelingSelection(data: InsertFeelingWheelSelection): Promise<FeelingWheelSelection> {
    const [sel] = await db.insert(feelingWheelSelections).values(data).returning();
    return sel;
  }

  async getFeelingSelections(sessionId: string): Promise<FeelingWheelSelection[]> {
    return db.select().from(feelingWheelSelections).where(eq(feelingWheelSelections.sessionId, sessionId));
  }

  async removeFeelingSelection(id: string): Promise<void> {
    await db.delete(feelingWheelSelections).where(eq(feelingWheelSelections.id, id));
  }

  async clearFeelingSelections(sessionId: string): Promise<void> {
    await db.delete(feelingWheelSelections).where(eq(feelingWheelSelections.sessionId, sessionId));
  }

  async addTimelineEvent(data: InsertTimelineEvent): Promise<TimelineEvent> {
    const [evt] = await db.insert(timelineEvents).values(data).returning();
    return evt;
  }

  async getTimelineEvents(sessionId: string): Promise<TimelineEvent[]> {
    return db.select().from(timelineEvents).where(eq(timelineEvents.sessionId, sessionId));
  }

  async updateTimelineEvent(id: string, data: Partial<TimelineEvent>): Promise<TimelineEvent | undefined> {
    const [evt] = await db.update(timelineEvents).set(data).where(eq(timelineEvents.id, id)).returning();
    return evt;
  }

  async removeTimelineEvent(id: string): Promise<void> {
    await db.delete(timelineEvents).where(eq(timelineEvents.id, id));
  }

  async clearTimelineEvents(sessionId: string): Promise<void> {
    await db.delete(timelineEvents).where(eq(timelineEvents.sessionId, sessionId));
  }

  async addValuesCardPlacement(data: InsertValuesCardPlacement): Promise<ValuesCardPlacement> {
    const [card] = await db.insert(valuesCardPlacements).values(data).returning();
    return card;
  }

  async getValuesCardPlacements(sessionId: string): Promise<ValuesCardPlacement[]> {
    return db.select().from(valuesCardPlacements).where(eq(valuesCardPlacements.sessionId, sessionId));
  }

  async updateValuesCardPlacement(id: string, data: Partial<ValuesCardPlacement>): Promise<ValuesCardPlacement | undefined> {
    const [card] = await db.update(valuesCardPlacements).set(data).where(eq(valuesCardPlacements.id, id)).returning();
    return card;
  }

  async removeValuesCardPlacement(id: string): Promise<void> {
    await db.delete(valuesCardPlacements).where(eq(valuesCardPlacements.id, id));
  }

  async clearValuesCardPlacements(sessionId: string): Promise<void> {
    await db.delete(valuesCardPlacements).where(eq(valuesCardPlacements.sessionId, sessionId));
  }
}

export const storage = new DatabaseStorage();
