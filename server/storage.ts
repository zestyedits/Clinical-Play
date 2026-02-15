import { eq, desc, or, isNull } from "drizzle-orm";
import { db } from "./db";
import {
  therapySessions, participants, sandtrayItems, toolSuggestions,
  feelingWheelSelections, timelineEvents, valuesCardPlacements,
  theaterParts, theaterConnections,
  supportTickets, waitlistEntries, messages,
  thermometerReadings, containmentContainers, containmentItems,
  bodyScanMarkers, gratitudeStones, fidgetSessions,
  safetyPlanItems, worryTreeEntries,
  thoughtBridgeRecords, thoughtBridgeEvidence,
  copingStrategies, dbtHouseSkills,
  strengthsPlacements, strengthsSpottings,
  socialAtomPeople, socialAtomConnections, socialAtomGroups,
  gardenPlants, gardenJournalEntries, gardenWeeds,
  type TherapySession, type InsertTherapySession,
  type Participant, type InsertParticipant,
  type SandtrayItem, type InsertSandtrayItem,
  type ToolSuggestion, type InsertToolSuggestion,
  type FeelingWheelSelection, type InsertFeelingWheelSelection,
  type TimelineEvent, type InsertTimelineEvent,
  type ValuesCardPlacement, type InsertValuesCardPlacement,
  type TheaterPart, type InsertTheaterPart,
  type TheaterConnection, type InsertTheaterConnection,
  type SupportTicket, type InsertSupportTicket,
  type WaitlistEntry, type InsertWaitlistEntry,
  type Message, type InsertMessage,
  type ThermometerReading, type InsertThermometerReading,
  type ContainmentContainer, type InsertContainmentContainer,
  type ContainmentItem, type InsertContainmentItem,
  type BodyScanMarker, type InsertBodyScanMarker,
  type GratitudeStone, type InsertGratitudeStone,
  type FidgetSession, type InsertFidgetSession,
  type SafetyPlanItem, type InsertSafetyPlanItem,
  type WorryTreeEntry, type InsertWorryTreeEntry,
  type ThoughtBridgeRecord, type InsertThoughtBridgeRecord,
  type ThoughtBridgeEvidence as ThoughtBridgeEvidenceType, type InsertThoughtBridgeEvidence,
  type CopingStrategy, type InsertCopingStrategy,
  type DbtHouseSkill, type InsertDbtHouseSkill,
  type StrengthsPlacement, type InsertStrengthsPlacement,
  type StrengthsSpotting, type InsertStrengthsSpotting,
  type SocialAtomPerson, type InsertSocialAtomPerson,
  type SocialAtomConnection, type InsertSocialAtomConnection,
  type SocialAtomGroup, type InsertSocialAtomGroup,
  type GardenPlant, type InsertGardenPlant,
  type GardenJournalEntry, type InsertGardenJournalEntry,
  type GardenWeed, type InsertGardenWeed,
} from "@shared/schema";
import { users } from "@shared/models/auth";

function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

const MAX_INVITE_CODE_RETRIES = 5;

export interface IStorage {
  createSession(data: InsertTherapySession): Promise<TherapySession>;
  getSession(id: string): Promise<TherapySession | undefined>;
  getAllSessions(): Promise<TherapySession[]>;
  getSessionByInviteCode(code: string): Promise<TherapySession | undefined>;
  getSessionsByClinician(clinicianId: string): Promise<TherapySession[]>;
  updateSession(id: string, data: Partial<TherapySession>): Promise<TherapySession | undefined>;
  endSession(id: string): Promise<TherapySession | undefined>;

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

  addTheaterPart(data: InsertTheaterPart): Promise<TheaterPart>;
  getTheaterParts(sessionId: string): Promise<TheaterPart[]>;
  updateTheaterPart(id: string, data: Partial<TheaterPart>): Promise<TheaterPart | undefined>;
  removeTheaterPart(id: string): Promise<void>;
  clearTheaterParts(sessionId: string): Promise<void>;

  addTheaterConnection(data: InsertTheaterConnection): Promise<TheaterConnection>;
  getTheaterConnections(sessionId: string): Promise<TheaterConnection[]>;
  removeTheaterConnection(id: string): Promise<void>;
  clearTheaterConnections(sessionId: string): Promise<void>;

  addSupportTicket(data: InsertSupportTicket): Promise<SupportTicket>;

  addWaitlistEntry(data: InsertWaitlistEntry): Promise<WaitlistEntry>;
  getWaitlistEntries(): Promise<WaitlistEntry[]>;
  removeWaitlistEntry(id: string): Promise<void>;

  getAllUsers(): Promise<any[]>;
  updateUser(id: string, data: Record<string, any>): Promise<any>;
  deleteUser(id: string): Promise<void>;

  createMessage(data: InsertMessage): Promise<Message>;
  getMessagesForUser(userId: string): Promise<Message[]>;
  markMessageRead(id: string, userId: string): Promise<void>;
  getUnreadCount(userId: string): Promise<number>;

  // Emotion Thermometer
  addThermometerReading(data: InsertThermometerReading): Promise<ThermometerReading>;
  getThermometerReadings(sessionId: string): Promise<ThermometerReading[]>;
  removeThermometerReading(id: string): Promise<void>;
  clearThermometerReadings(sessionId: string): Promise<void>;

  // Containment Box
  addContainmentContainer(data: InsertContainmentContainer): Promise<ContainmentContainer>;
  getContainmentContainers(sessionId: string): Promise<ContainmentContainer[]>;
  updateContainmentContainer(id: string, data: Partial<ContainmentContainer>): Promise<ContainmentContainer | undefined>;
  clearContainmentContainers(sessionId: string): Promise<void>;
  addContainmentItem(data: InsertContainmentItem): Promise<ContainmentItem>;
  getContainmentItems(sessionId: string): Promise<ContainmentItem[]>;
  updateContainmentItem(id: string, data: Partial<ContainmentItem>): Promise<ContainmentItem | undefined>;
  removeContainmentItem(id: string): Promise<void>;
  clearContainmentItems(sessionId: string): Promise<void>;

  // Body Scan Map
  addBodyScanMarker(data: InsertBodyScanMarker): Promise<BodyScanMarker>;
  getBodyScanMarkers(sessionId: string): Promise<BodyScanMarker[]>;
  updateBodyScanMarker(id: string, data: Partial<BodyScanMarker>): Promise<BodyScanMarker | undefined>;
  removeBodyScanMarker(id: string): Promise<void>;
  clearBodyScanMarkers(sessionId: string): Promise<void>;

  // Gratitude Jar
  addGratitudeStone(data: InsertGratitudeStone): Promise<GratitudeStone>;
  getGratitudeStones(sessionId: string): Promise<GratitudeStone[]>;
  updateGratitudeStone(id: string, data: Partial<GratitudeStone>): Promise<GratitudeStone | undefined>;
  removeGratitudeStone(id: string): Promise<void>;
  clearGratitudeStones(sessionId: string): Promise<void>;

  // Safety Map
  addSafetyPlanItem(data: InsertSafetyPlanItem): Promise<SafetyPlanItem>;
  getSafetyPlanItems(sessionId: string): Promise<SafetyPlanItem[]>;
  updateSafetyPlanItem(id: string, data: Partial<SafetyPlanItem>): Promise<SafetyPlanItem | undefined>;
  removeSafetyPlanItem(id: string): Promise<void>;
  clearSafetyPlanItems(sessionId: string): Promise<void>;

  // Worry Tree
  addWorryTreeEntry(data: InsertWorryTreeEntry): Promise<WorryTreeEntry>;
  getWorryTreeEntries(sessionId: string): Promise<WorryTreeEntry[]>;
  updateWorryTreeEntry(id: string, data: Partial<WorryTreeEntry>): Promise<WorryTreeEntry | undefined>;
  removeWorryTreeEntry(id: string): Promise<void>;
  clearWorryTreeEntries(sessionId: string): Promise<void>;

  // Thought Bridge
  addThoughtBridgeRecord(data: InsertThoughtBridgeRecord): Promise<ThoughtBridgeRecord>;
  getThoughtBridgeRecords(sessionId: string): Promise<ThoughtBridgeRecord[]>;
  updateThoughtBridgeRecord(id: string, data: Partial<ThoughtBridgeRecord>): Promise<ThoughtBridgeRecord | undefined>;
  removeThoughtBridgeRecord(id: string): Promise<void>;
  clearThoughtBridgeRecords(sessionId: string): Promise<void>;
  addThoughtBridgeEvidence(data: InsertThoughtBridgeEvidence): Promise<ThoughtBridgeEvidenceType>;
  getThoughtBridgeEvidence(sessionId: string): Promise<ThoughtBridgeEvidenceType[]>;
  removeThoughtBridgeEvidence(id: string): Promise<void>;

  // Coping Toolbox
  addCopingStrategy(data: InsertCopingStrategy): Promise<CopingStrategy>;
  getCopingStrategies(sessionId: string): Promise<CopingStrategy[]>;
  updateCopingStrategy(id: string, data: Partial<CopingStrategy>): Promise<CopingStrategy | undefined>;
  removeCopingStrategy(id: string): Promise<void>;
  clearCopingStrategies(sessionId: string): Promise<void>;

  // DBT House
  addDbtHouseSkill(data: InsertDbtHouseSkill): Promise<DbtHouseSkill>;
  getDbtHouseSkills(sessionId: string): Promise<DbtHouseSkill[]>;
  updateDbtHouseSkill(id: string, data: Partial<DbtHouseSkill>): Promise<DbtHouseSkill | undefined>;
  removeDbtHouseSkill(id: string): Promise<void>;
  clearDbtHouseSkills(sessionId: string): Promise<void>;

  // Strengths Deck
  addStrengthsPlacement(data: InsertStrengthsPlacement): Promise<StrengthsPlacement>;
  getStrengthsPlacements(sessionId: string): Promise<StrengthsPlacement[]>;
  updateStrengthsPlacement(id: string, data: Partial<StrengthsPlacement>): Promise<StrengthsPlacement | undefined>;
  removeStrengthsPlacement(id: string): Promise<void>;
  clearStrengthsPlacements(sessionId: string): Promise<void>;
  addStrengthsSpotting(data: InsertStrengthsSpotting): Promise<StrengthsSpotting>;
  getStrengthsSpottings(sessionId: string): Promise<StrengthsSpotting[]>;

  // Social Atom
  addSocialAtomPerson(data: InsertSocialAtomPerson): Promise<SocialAtomPerson>;
  getSocialAtomPeople(sessionId: string): Promise<SocialAtomPerson[]>;
  updateSocialAtomPerson(id: string, data: Partial<SocialAtomPerson>): Promise<SocialAtomPerson | undefined>;
  removeSocialAtomPerson(id: string): Promise<void>;
  clearSocialAtomPeople(sessionId: string): Promise<void>;
  addSocialAtomConnection(data: InsertSocialAtomConnection): Promise<SocialAtomConnection>;
  getSocialAtomConnections(sessionId: string): Promise<SocialAtomConnection[]>;
  removeSocialAtomConnection(id: string): Promise<void>;
  addSocialAtomGroup(data: InsertSocialAtomGroup): Promise<SocialAtomGroup>;
  getSocialAtomGroups(sessionId: string): Promise<SocialAtomGroup[]>;

  // Growth Garden
  addGardenPlant(data: InsertGardenPlant): Promise<GardenPlant>;
  getGardenPlants(sessionId: string): Promise<GardenPlant[]>;
  updateGardenPlant(id: string, data: Partial<GardenPlant>): Promise<GardenPlant | undefined>;
  removeGardenPlant(id: string): Promise<void>;
  clearGardenPlants(sessionId: string): Promise<void>;
  addGardenJournalEntry(data: InsertGardenJournalEntry): Promise<GardenJournalEntry>;
  getGardenJournalEntries(sessionId: string): Promise<GardenJournalEntry[]>;
  addGardenWeed(data: InsertGardenWeed): Promise<GardenWeed>;
  getGardenWeeds(sessionId: string): Promise<GardenWeed[]>;
  updateGardenWeed(id: string, data: Partial<GardenWeed>): Promise<GardenWeed | undefined>;
  clearGardenWeeds(sessionId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async createSession(data: InsertTherapySession): Promise<TherapySession> {
    for (let attempt = 0; attempt < MAX_INVITE_CODE_RETRIES; attempt++) {
      const inviteCode = generateInviteCode();
      try {
        const [session] = await db.insert(therapySessions).values({
          ...data,
          inviteCode,
        }).returning();
        return session;
      } catch (e: any) {
        if (e.code === "23505" && e.constraint?.includes("invite_code")) {
          continue;
        }
        throw e;
      }
    }
    throw new Error("Failed to generate a unique invite code after multiple attempts");
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

  async endSession(id: string): Promise<TherapySession | undefined> {
    const [session] = await db.update(therapySessions)
      .set({ status: "ended", endedAt: new Date() })
      .where(eq(therapySessions.id, id))
      .returning();
    return session;
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

  async addTheaterPart(data: InsertTheaterPart): Promise<TheaterPart> {
    const [part] = await db.insert(theaterParts).values(data).returning();
    return part;
  }

  async getTheaterParts(sessionId: string): Promise<TheaterPart[]> {
    return db.select().from(theaterParts).where(eq(theaterParts.sessionId, sessionId));
  }

  async updateTheaterPart(id: string, data: Partial<TheaterPart>): Promise<TheaterPart | undefined> {
    const [part] = await db.update(theaterParts).set(data).where(eq(theaterParts.id, id)).returning();
    return part;
  }

  async removeTheaterPart(id: string): Promise<void> {
    await db.delete(theaterParts).where(eq(theaterParts.id, id));
  }

  async clearTheaterParts(sessionId: string): Promise<void> {
    await db.delete(theaterConnections).where(eq(theaterConnections.sessionId, sessionId));
    await db.delete(theaterParts).where(eq(theaterParts.sessionId, sessionId));
  }

  async addTheaterConnection(data: InsertTheaterConnection): Promise<TheaterConnection> {
    const [conn] = await db.insert(theaterConnections).values(data).returning();
    return conn;
  }

  async getTheaterConnections(sessionId: string): Promise<TheaterConnection[]> {
    return db.select().from(theaterConnections).where(eq(theaterConnections.sessionId, sessionId));
  }

  async removeTheaterConnection(id: string): Promise<void> {
    await db.delete(theaterConnections).where(eq(theaterConnections.id, id));
  }

  async clearTheaterConnections(sessionId: string): Promise<void> {
    await db.delete(theaterConnections).where(eq(theaterConnections.sessionId, sessionId));
  }

  async addSupportTicket(data: InsertSupportTicket): Promise<SupportTicket> {
    const [ticket] = await db.insert(supportTickets).values(data).returning();
    return ticket;
  }

  async addWaitlistEntry(data: InsertWaitlistEntry): Promise<WaitlistEntry> {
    const [entry] = await db.insert(waitlistEntries).values(data).returning();
    return entry;
  }

  async getWaitlistEntries(): Promise<WaitlistEntry[]> {
    return db.select().from(waitlistEntries).orderBy(desc(waitlistEntries.createdAt));
  }

  async removeWaitlistEntry(id: string): Promise<void> {
    await db.delete(waitlistEntries).where(eq(waitlistEntries.id, id));
  }

  async getAllUsers(): Promise<any[]> {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateUser(id: string, data: Record<string, any>): Promise<any> {
    const [user] = await db.update(users).set({ ...data, updatedAt: new Date() }).where(eq(users.id, id)).returning();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async createMessage(data: InsertMessage): Promise<Message> {
    const [msg] = await db.insert(messages).values(data).returning();
    return msg;
  }

  async getMessagesForUser(userId: string): Promise<Message[]> {
    return db.select().from(messages)
      .where(or(eq(messages.toUserId, userId), eq(messages.isAnnouncement, true)))
      .orderBy(desc(messages.createdAt));
  }

  async markMessageRead(id: string, userId: string): Promise<void> {
    await db.update(messages).set({ isRead: true })
      .where(eq(messages.id, id));
  }

  async getUnreadCount(userId: string): Promise<number> {
    const rows = await db.select().from(messages)
      .where(or(eq(messages.toUserId, userId), eq(messages.isAnnouncement, true)));
    return rows.filter(m => !m.isRead).length;
  }

  // --- Emotion Thermometer ---
  async addThermometerReading(data: InsertThermometerReading): Promise<ThermometerReading> {
    const [r] = await db.insert(thermometerReadings).values(data).returning();
    return r;
  }
  async getThermometerReadings(sessionId: string): Promise<ThermometerReading[]> {
    return db.select().from(thermometerReadings).where(eq(thermometerReadings.sessionId, sessionId));
  }
  async removeThermometerReading(id: string): Promise<void> {
    await db.delete(thermometerReadings).where(eq(thermometerReadings.id, id));
  }
  async clearThermometerReadings(sessionId: string): Promise<void> {
    await db.delete(thermometerReadings).where(eq(thermometerReadings.sessionId, sessionId));
  }

  // --- Containment Box ---
  async addContainmentContainer(data: InsertContainmentContainer): Promise<ContainmentContainer> {
    const [r] = await db.insert(containmentContainers).values(data).returning();
    return r;
  }
  async getContainmentContainers(sessionId: string): Promise<ContainmentContainer[]> {
    return db.select().from(containmentContainers).where(eq(containmentContainers.sessionId, sessionId));
  }
  async updateContainmentContainer(id: string, data: Partial<ContainmentContainer>): Promise<ContainmentContainer | undefined> {
    const [r] = await db.update(containmentContainers).set({ ...data, updatedAt: new Date() }).where(eq(containmentContainers.id, id)).returning();
    return r;
  }
  async clearContainmentContainers(sessionId: string): Promise<void> {
    await db.delete(containmentItems).where(eq(containmentItems.sessionId, sessionId));
    await db.delete(containmentContainers).where(eq(containmentContainers.sessionId, sessionId));
  }
  async addContainmentItem(data: InsertContainmentItem): Promise<ContainmentItem> {
    const [r] = await db.insert(containmentItems).values(data).returning();
    return r;
  }
  async getContainmentItems(sessionId: string): Promise<ContainmentItem[]> {
    return db.select().from(containmentItems).where(eq(containmentItems.sessionId, sessionId));
  }
  async updateContainmentItem(id: string, data: Partial<ContainmentItem>): Promise<ContainmentItem | undefined> {
    const [r] = await db.update(containmentItems).set(data).where(eq(containmentItems.id, id)).returning();
    return r;
  }
  async removeContainmentItem(id: string): Promise<void> {
    await db.delete(containmentItems).where(eq(containmentItems.id, id));
  }
  async clearContainmentItems(sessionId: string): Promise<void> {
    await db.delete(containmentItems).where(eq(containmentItems.sessionId, sessionId));
  }

  // --- Body Scan Map ---
  async addBodyScanMarker(data: InsertBodyScanMarker): Promise<BodyScanMarker> {
    const [r] = await db.insert(bodyScanMarkers).values(data).returning();
    return r;
  }
  async getBodyScanMarkers(sessionId: string): Promise<BodyScanMarker[]> {
    return db.select().from(bodyScanMarkers).where(eq(bodyScanMarkers.sessionId, sessionId));
  }
  async updateBodyScanMarker(id: string, data: Partial<BodyScanMarker>): Promise<BodyScanMarker | undefined> {
    const [r] = await db.update(bodyScanMarkers).set(data).where(eq(bodyScanMarkers.id, id)).returning();
    return r;
  }
  async removeBodyScanMarker(id: string): Promise<void> {
    await db.delete(bodyScanMarkers).where(eq(bodyScanMarkers.id, id));
  }
  async clearBodyScanMarkers(sessionId: string): Promise<void> {
    await db.delete(bodyScanMarkers).where(eq(bodyScanMarkers.sessionId, sessionId));
  }

  // --- Gratitude Jar ---
  async addGratitudeStone(data: InsertGratitudeStone): Promise<GratitudeStone> {
    const [r] = await db.insert(gratitudeStones).values(data).returning();
    return r;
  }
  async getGratitudeStones(sessionId: string): Promise<GratitudeStone[]> {
    return db.select().from(gratitudeStones).where(eq(gratitudeStones.sessionId, sessionId));
  }
  async updateGratitudeStone(id: string, data: Partial<GratitudeStone>): Promise<GratitudeStone | undefined> {
    const [r] = await db.update(gratitudeStones).set(data).where(eq(gratitudeStones.id, id)).returning();
    return r;
  }
  async removeGratitudeStone(id: string): Promise<void> {
    await db.delete(gratitudeStones).where(eq(gratitudeStones.id, id));
  }
  async clearGratitudeStones(sessionId: string): Promise<void> {
    await db.delete(gratitudeStones).where(eq(gratitudeStones.sessionId, sessionId));
  }

  // --- Safety Map ---
  async addSafetyPlanItem(data: InsertSafetyPlanItem): Promise<SafetyPlanItem> {
    const [r] = await db.insert(safetyPlanItems).values(data).returning();
    return r;
  }
  async getSafetyPlanItems(sessionId: string): Promise<SafetyPlanItem[]> {
    return db.select().from(safetyPlanItems).where(eq(safetyPlanItems.sessionId, sessionId));
  }
  async updateSafetyPlanItem(id: string, data: Partial<SafetyPlanItem>): Promise<SafetyPlanItem | undefined> {
    const [r] = await db.update(safetyPlanItems).set({ ...data, updatedAt: new Date() }).where(eq(safetyPlanItems.id, id)).returning();
    return r;
  }
  async removeSafetyPlanItem(id: string): Promise<void> {
    await db.delete(safetyPlanItems).where(eq(safetyPlanItems.id, id));
  }
  async clearSafetyPlanItems(sessionId: string): Promise<void> {
    await db.delete(safetyPlanItems).where(eq(safetyPlanItems.sessionId, sessionId));
  }

  // --- Worry Tree ---
  async addWorryTreeEntry(data: InsertWorryTreeEntry): Promise<WorryTreeEntry> {
    const [r] = await db.insert(worryTreeEntries).values(data).returning();
    return r;
  }
  async getWorryTreeEntries(sessionId: string): Promise<WorryTreeEntry[]> {
    return db.select().from(worryTreeEntries).where(eq(worryTreeEntries.sessionId, sessionId));
  }
  async updateWorryTreeEntry(id: string, data: Partial<WorryTreeEntry>): Promise<WorryTreeEntry | undefined> {
    const [r] = await db.update(worryTreeEntries).set(data).where(eq(worryTreeEntries.id, id)).returning();
    return r;
  }
  async removeWorryTreeEntry(id: string): Promise<void> {
    await db.delete(worryTreeEntries).where(eq(worryTreeEntries.id, id));
  }
  async clearWorryTreeEntries(sessionId: string): Promise<void> {
    await db.delete(worryTreeEntries).where(eq(worryTreeEntries.sessionId, sessionId));
  }

  // --- Thought Bridge ---
  async addThoughtBridgeRecord(data: InsertThoughtBridgeRecord): Promise<ThoughtBridgeRecord> {
    const [r] = await db.insert(thoughtBridgeRecords).values(data).returning();
    return r;
  }
  async getThoughtBridgeRecords(sessionId: string): Promise<ThoughtBridgeRecord[]> {
    return db.select().from(thoughtBridgeRecords).where(eq(thoughtBridgeRecords.sessionId, sessionId));
  }
  async updateThoughtBridgeRecord(id: string, data: Partial<ThoughtBridgeRecord>): Promise<ThoughtBridgeRecord | undefined> {
    const [r] = await db.update(thoughtBridgeRecords).set(data).where(eq(thoughtBridgeRecords.id, id)).returning();
    return r;
  }
  async removeThoughtBridgeRecord(id: string): Promise<void> {
    await db.delete(thoughtBridgeEvidence).where(eq(thoughtBridgeEvidence.recordId, id));
    await db.delete(thoughtBridgeRecords).where(eq(thoughtBridgeRecords.id, id));
  }
  async clearThoughtBridgeRecords(sessionId: string): Promise<void> {
    await db.delete(thoughtBridgeEvidence).where(eq(thoughtBridgeEvidence.sessionId, sessionId));
    await db.delete(thoughtBridgeRecords).where(eq(thoughtBridgeRecords.sessionId, sessionId));
  }
  async addThoughtBridgeEvidence(data: InsertThoughtBridgeEvidence): Promise<ThoughtBridgeEvidenceType> {
    const [r] = await db.insert(thoughtBridgeEvidence).values(data).returning();
    return r;
  }
  async getThoughtBridgeEvidence(sessionId: string): Promise<ThoughtBridgeEvidenceType[]> {
    return db.select().from(thoughtBridgeEvidence).where(eq(thoughtBridgeEvidence.sessionId, sessionId));
  }
  async removeThoughtBridgeEvidence(id: string): Promise<void> {
    await db.delete(thoughtBridgeEvidence).where(eq(thoughtBridgeEvidence.id, id));
  }

  // --- Coping Toolbox ---
  async addCopingStrategy(data: InsertCopingStrategy): Promise<CopingStrategy> {
    const [r] = await db.insert(copingStrategies).values(data).returning();
    return r;
  }
  async getCopingStrategies(sessionId: string): Promise<CopingStrategy[]> {
    return db.select().from(copingStrategies).where(eq(copingStrategies.sessionId, sessionId));
  }
  async updateCopingStrategy(id: string, data: Partial<CopingStrategy>): Promise<CopingStrategy | undefined> {
    const [r] = await db.update(copingStrategies).set({ ...data, updatedAt: new Date() }).where(eq(copingStrategies.id, id)).returning();
    return r;
  }
  async removeCopingStrategy(id: string): Promise<void> {
    await db.delete(copingStrategies).where(eq(copingStrategies.id, id));
  }
  async clearCopingStrategies(sessionId: string): Promise<void> {
    await db.delete(copingStrategies).where(eq(copingStrategies.sessionId, sessionId));
  }

  // --- DBT House ---
  async addDbtHouseSkill(data: InsertDbtHouseSkill): Promise<DbtHouseSkill> {
    const [r] = await db.insert(dbtHouseSkills).values(data).returning();
    return r;
  }
  async getDbtHouseSkills(sessionId: string): Promise<DbtHouseSkill[]> {
    return db.select().from(dbtHouseSkills).where(eq(dbtHouseSkills.sessionId, sessionId));
  }
  async updateDbtHouseSkill(id: string, data: Partial<DbtHouseSkill>): Promise<DbtHouseSkill | undefined> {
    const [r] = await db.update(dbtHouseSkills).set(data).where(eq(dbtHouseSkills.id, id)).returning();
    return r;
  }
  async removeDbtHouseSkill(id: string): Promise<void> {
    await db.delete(dbtHouseSkills).where(eq(dbtHouseSkills.id, id));
  }
  async clearDbtHouseSkills(sessionId: string): Promise<void> {
    await db.delete(dbtHouseSkills).where(eq(dbtHouseSkills.sessionId, sessionId));
  }

  // --- Strengths Deck ---
  async addStrengthsPlacement(data: InsertStrengthsPlacement): Promise<StrengthsPlacement> {
    const [r] = await db.insert(strengthsPlacements).values(data).returning();
    return r;
  }
  async getStrengthsPlacements(sessionId: string): Promise<StrengthsPlacement[]> {
    return db.select().from(strengthsPlacements).where(eq(strengthsPlacements.sessionId, sessionId));
  }
  async updateStrengthsPlacement(id: string, data: Partial<StrengthsPlacement>): Promise<StrengthsPlacement | undefined> {
    const [r] = await db.update(strengthsPlacements).set(data).where(eq(strengthsPlacements.id, id)).returning();
    return r;
  }
  async removeStrengthsPlacement(id: string): Promise<void> {
    await db.delete(strengthsPlacements).where(eq(strengthsPlacements.id, id));
  }
  async clearStrengthsPlacements(sessionId: string): Promise<void> {
    await db.delete(strengthsSpottings).where(eq(strengthsSpottings.sessionId, sessionId));
    await db.delete(strengthsPlacements).where(eq(strengthsPlacements.sessionId, sessionId));
  }
  async addStrengthsSpotting(data: InsertStrengthsSpotting): Promise<StrengthsSpotting> {
    const [r] = await db.insert(strengthsSpottings).values(data).returning();
    return r;
  }
  async getStrengthsSpottings(sessionId: string): Promise<StrengthsSpotting[]> {
    return db.select().from(strengthsSpottings).where(eq(strengthsSpottings.sessionId, sessionId));
  }

  // --- Social Atom ---
  async addSocialAtomPerson(data: InsertSocialAtomPerson): Promise<SocialAtomPerson> {
    const [r] = await db.insert(socialAtomPeople).values(data).returning();
    return r;
  }
  async getSocialAtomPeople(sessionId: string): Promise<SocialAtomPerson[]> {
    return db.select().from(socialAtomPeople).where(eq(socialAtomPeople.sessionId, sessionId));
  }
  async updateSocialAtomPerson(id: string, data: Partial<SocialAtomPerson>): Promise<SocialAtomPerson | undefined> {
    const [r] = await db.update(socialAtomPeople).set(data).where(eq(socialAtomPeople.id, id)).returning();
    return r;
  }
  async removeSocialAtomPerson(id: string): Promise<void> {
    await db.delete(socialAtomConnections).where(eq(socialAtomConnections.fromPersonId, id));
    await db.delete(socialAtomConnections).where(eq(socialAtomConnections.toPersonId, id));
    await db.delete(socialAtomPeople).where(eq(socialAtomPeople.id, id));
  }
  async clearSocialAtomPeople(sessionId: string): Promise<void> {
    await db.delete(socialAtomConnections).where(eq(socialAtomConnections.sessionId, sessionId));
    await db.delete(socialAtomGroups).where(eq(socialAtomGroups.sessionId, sessionId));
    await db.delete(socialAtomPeople).where(eq(socialAtomPeople.sessionId, sessionId));
  }
  async addSocialAtomConnection(data: InsertSocialAtomConnection): Promise<SocialAtomConnection> {
    const [r] = await db.insert(socialAtomConnections).values(data).returning();
    return r;
  }
  async getSocialAtomConnections(sessionId: string): Promise<SocialAtomConnection[]> {
    return db.select().from(socialAtomConnections).where(eq(socialAtomConnections.sessionId, sessionId));
  }
  async removeSocialAtomConnection(id: string): Promise<void> {
    await db.delete(socialAtomConnections).where(eq(socialAtomConnections.id, id));
  }
  async addSocialAtomGroup(data: InsertSocialAtomGroup): Promise<SocialAtomGroup> {
    const [r] = await db.insert(socialAtomGroups).values(data).returning();
    return r;
  }
  async getSocialAtomGroups(sessionId: string): Promise<SocialAtomGroup[]> {
    return db.select().from(socialAtomGroups).where(eq(socialAtomGroups.sessionId, sessionId));
  }

  // --- Growth Garden ---
  async addGardenPlant(data: InsertGardenPlant): Promise<GardenPlant> {
    const [r] = await db.insert(gardenPlants).values(data).returning();
    return r;
  }
  async getGardenPlants(sessionId: string): Promise<GardenPlant[]> {
    return db.select().from(gardenPlants).where(eq(gardenPlants.sessionId, sessionId));
  }
  async updateGardenPlant(id: string, data: Partial<GardenPlant>): Promise<GardenPlant | undefined> {
    const [r] = await db.update(gardenPlants).set({ ...data, updatedAt: new Date() }).where(eq(gardenPlants.id, id)).returning();
    return r;
  }
  async removeGardenPlant(id: string): Promise<void> {
    await db.delete(gardenJournalEntries).where(eq(gardenJournalEntries.plantId, id));
    await db.delete(gardenPlants).where(eq(gardenPlants.id, id));
  }
  async clearGardenPlants(sessionId: string): Promise<void> {
    await db.delete(gardenJournalEntries).where(eq(gardenJournalEntries.sessionId, sessionId));
    await db.delete(gardenWeeds).where(eq(gardenWeeds.sessionId, sessionId));
    await db.delete(gardenPlants).where(eq(gardenPlants.sessionId, sessionId));
  }
  async addGardenJournalEntry(data: InsertGardenJournalEntry): Promise<GardenJournalEntry> {
    const [r] = await db.insert(gardenJournalEntries).values(data).returning();
    return r;
  }
  async getGardenJournalEntries(sessionId: string): Promise<GardenJournalEntry[]> {
    return db.select().from(gardenJournalEntries).where(eq(gardenJournalEntries.sessionId, sessionId));
  }
  async addGardenWeed(data: InsertGardenWeed): Promise<GardenWeed> {
    const [r] = await db.insert(gardenWeeds).values(data).returning();
    return r;
  }
  async getGardenWeeds(sessionId: string): Promise<GardenWeed[]> {
    return db.select().from(gardenWeeds).where(eq(gardenWeeds.sessionId, sessionId));
  }
  async updateGardenWeed(id: string, data: Partial<GardenWeed>): Promise<GardenWeed | undefined> {
    const [r] = await db.update(gardenWeeds).set(data).where(eq(gardenWeeds.id, id)).returning();
    return r;
  }
  async clearGardenWeeds(sessionId: string): Promise<void> {
    await db.delete(gardenWeeds).where(eq(gardenWeeds.sessionId, sessionId));
  }
}

export const storage = new DatabaseStorage();
