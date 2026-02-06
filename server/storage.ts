import { eq } from "drizzle-orm";
import { db } from "./db";
import {
  therapySessions, participants, sandtrayItems,
  type TherapySession, type InsertTherapySession,
  type Participant, type InsertParticipant,
  type SandtrayItem, type InsertSandtrayItem,
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
}

export const storage = new DatabaseStorage();
