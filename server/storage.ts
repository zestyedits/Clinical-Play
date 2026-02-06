import { eq } from "drizzle-orm";
import { db } from "./db";
import {
  users, sessions, participants, sandtrayItems,
  type User, type InsertUser,
  type Session, type InsertSession,
  type Participant, type InsertParticipant,
  type SandtrayItem, type InsertSandtrayItem,
} from "@shared/schema";
import { randomUUID } from "crypto";

function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  createSession(data: InsertSession): Promise<Session>;
  getSession(id: string): Promise<Session | undefined>;
  getAllSessions(): Promise<Session[]>;
  getSessionByInviteCode(code: string): Promise<Session | undefined>;
  getSessionsByClinician(clinicianId: string): Promise<Session[]>;
  updateSession(id: string, data: Partial<Session>): Promise<Session | undefined>;

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
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(data: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  }

  async createSession(data: InsertSession): Promise<Session> {
    const inviteCode = generateInviteCode();
    const [session] = await db.insert(sessions).values({
      ...data,
      inviteCode,
    }).returning();
    return session;
  }

  async getSession(id: string): Promise<Session | undefined> {
    const [session] = await db.select().from(sessions).where(eq(sessions.id, id));
    return session;
  }

  async getAllSessions(): Promise<Session[]> {
    return db.select().from(sessions);
  }

  async getSessionByInviteCode(code: string): Promise<Session | undefined> {
    const [session] = await db.select().from(sessions).where(eq(sessions.inviteCode, code));
    return session;
  }

  async getSessionsByClinician(clinicianId: string): Promise<Session[]> {
    return db.select().from(sessions).where(eq(sessions.clinicianId, clinicianId));
  }

  async updateSession(id: string, data: Partial<Session>): Promise<Session | undefined> {
    const [session] = await db.update(sessions).set(data).where(eq(sessions.id, id)).returning();
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
