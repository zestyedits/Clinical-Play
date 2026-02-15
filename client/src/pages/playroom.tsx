import { Link, useParams, useLocation } from "wouter";
import { ChevronRight, PanelRightClose, LogOut, Users, Ghost, Shield, Wrench, Camera, Crown, Square, Clock, CheckCircle2, Download, Check, Copy } from "lucide-react";
import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ZenCanvas, type CanvasItem } from "@/components/sandtray/zen-canvas";
import { AssetLibrary } from "@/components/sandtray/asset-library";
import type { SandtrayAsset } from "@/lib/sandtray-assets";
import { ModeratorBar } from "@/components/sandtray/moderator-bar";
import { ToolSelector } from "@/components/tools/tool-selector";
import { BreathingGuide } from "@/components/tools/breathing-guide";
import { ClinicalInsights } from "@/components/tools/clinical-insights";
import { FeelingWheelSVG, type FeelingSelection } from "@/components/tools/feeling-wheel-svg";
import { NarrativeTimeline, type TimelineEventData } from "@/components/tools/narrative-timeline";
import { ValuesCardSort, type CardPlacement } from "@/components/tools/values-card-sort";
import { PartsTheater, type TheaterPartData, type TheaterConnectionData, type TheaterSettings } from "@/components/tools/parts-theater";
import { EmotionThermometer, type ThermometerReadingData } from "@/components/tools/emotion-thermometer";
import { ContainmentBox, type ContainmentContainerData, type ContainmentItemData } from "@/components/tools/containment-box";
import { BodyScanMap, type BodyScanMarkerData } from "@/components/tools/body-scan-map";
import { GratitudeJar, type GratitudeStoneData } from "@/components/tools/gratitude-jar";
import { FidgetTools } from "@/components/tools/fidget-tools";
import { SafetyMap, type SafetyPlanItemData } from "@/components/tools/safety-map";
import { WorryTree, type WorryTreeEntryData } from "@/components/tools/worry-tree";
import { ThoughtBridge, type ThoughtBridgeRecordData, type ThoughtBridgeEvidenceData } from "@/components/tools/thought-bridge";
import { CopingToolbox } from "@/components/tools/coping-toolbox";
import { DbtHouse } from "@/components/tools/dbt-house";
import { StrengthsDeck, type StrengthsPlacementData, type StrengthsSpottingData } from "@/components/tools/strengths-deck";
import { SocialAtom, type SocialAtomPersonData, type SocialAtomConnectionData } from "@/components/tools/social-atom";
import { GrowthGarden, type GardenPlantData, type GardenJournalEntryData, type GardenWeedData } from "@/components/tools/growth-garden";
import { ConnectionStatus } from "@/components/ui/connection-status";
import { useSessionSocket } from "@/hooks/use-session-socket";
import { useAuth } from "@/hooks/use-auth";
import { GuidedTour, useTour, type TourStep } from "@/components/guided-tour";
import { GlassCard } from "@/components/ui/glass-card";
import { getSupabase } from "@/lib/supabase";
import type { LightSource, RakePath } from "@/lib/ambient-types";
import { DEFAULT_LIGHT_SOURCE } from "@/lib/ambient-types";
import type { TherapySession, Participant } from "@shared/schema";

interface OnlineUser {
  participantId: string;
  displayName: string;
  lastActive?: number;
  status?: "online" | "disconnected";
}

interface RemoteCursor {
  participantId: string;
  displayName: string;
  x: number;
  y: number;
}

export default function Playroom() {
  const { id } = useParams();
  const isDemo = id === "demo";
  const sessionId = isDemo ? null : (id || null);
  const { user, isAuthenticated } = useAuth();

  const isClinician = isDemo ? true : !!(isAuthenticated && user);
  const [session, setSession] = useState<TherapySession | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [items, setItems] = useState<CanvasItem[]>([]);
  const [remoteCursors, setRemoteCursors] = useState<RemoteCursor[]>([]);
  const [assetLibraryOpen, setAssetLibraryOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [activeTool, setActiveTool] = useState("breathing");
  const [joinNotification, setJoinNotification] = useState<string | null>(null);
  const [toolSelectorOpen, setToolSelectorOpen] = useState(false);
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingStartTime, setBreathingStartTime] = useState<number | null>(null);
  const [breathingTechnique, setBreathingTechnique] = useState("ocean-waves");
  const [insightsOpen, setInsightsOpen] = useState(false);

  const [feelingSelections, setFeelingSelections] = useState<FeelingSelection[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEventData[]>([]);
  const [valuesCards, setValuesCards] = useState<CardPlacement[]>([]);
  const [theaterParts, setTheaterParts] = useState<TheaterPartData[]>([]);
  const [theaterConnections, setTheaterConnections] = useState<TheaterConnectionData[]>([]);
  const [theaterSettings, setTheaterSettings] = useState<TheaterSettings>({
    frozen: false, dimInactive: false, metaphor: "parts", partLimit: 0,
  });
  // New tool state
  const [thermometerReadings, setThermometerReadings] = useState<ThermometerReadingData[]>([]);
  const [containmentContainers, setContainmentContainers] = useState<ContainmentContainerData[]>([]);
  const [containmentItems, setContainmentItems] = useState<ContainmentItemData[]>([]);
  const [bodyScanMarkers, setBodyScanMarkers] = useState<BodyScanMarkerData[]>([]);
  const [gratitudeStones, setGratitudeStones] = useState<GratitudeStoneData[]>([]);
  const [safetyPlanItems, setSafetyPlanItems] = useState<SafetyPlanItemData[]>([]);
  const [worryTreeEntries, setWorryTreeEntries] = useState<WorryTreeEntryData[]>([]);
  const [thoughtBridgeRecords, setThoughtBridgeRecords] = useState<ThoughtBridgeRecordData[]>([]);
  const [thoughtBridgeEvidence, setThoughtBridgeEvidence] = useState<ThoughtBridgeEvidenceData[]>([]);
  const [copingStrategies, setCopingStrategies] = useState<any[]>([]);
  const [dbtHouseSkills, setDbtHouseSkills] = useState<any[]>([]);
  const [strengthsPlacements, setStrengthsPlacements] = useState<StrengthsPlacementData[]>([]);
  const [strengthsSpottings, setStrengthsSpottings] = useState<StrengthsSpottingData[]>([]);
  const [socialAtomPeople, setSocialAtomPeople] = useState<SocialAtomPersonData[]>([]);
  const [socialAtomConnections, setSocialAtomConnections] = useState<SocialAtomConnectionData[]>([]);
  const [gardenPlants, setGardenPlants] = useState<GardenPlantData[]>([]);
  const [gardenJournalEntries, setGardenJournalEntries] = useState<GardenJournalEntryData[]>([]);
  const [gardenWeeds, setGardenWeeds] = useState<GardenWeedData[]>([]);
  const [toolSettings, setToolSettings] = useState<Record<string, Record<string, any>>>({});

  const [subscriptionType, setSubscriptionType] = useState<string>("free");
  const [sessionEnded, setSessionEnded] = useState(false);
  const [endingSession, setEndingSession] = useState(false);
  const [toolTransitionLabel, setToolTransitionLabel] = useState<string | null>(null);
  const [inviteCopied, setInviteCopied] = useState(false);

  // Ambient / Zen state
  const [lightSource, setLightSource] = useState<LightSource>(DEFAULT_LIGHT_SOURCE);
  const [rakePaths, setRakePaths] = useState<RakePath[]>([]);
  const [zenMode, setZenMode] = useState(false);
  const [rakeMode, setRakeMode] = useState(false);
  const [sandTexture, setSandTexture] = useState<"fine" | "wet" | "blue">("fine");
  const [digMode, setDigMode] = useState(false);
  const lightThrottleRef = useRef(0);
  const [, navigate] = useLocation();
  const playroomTour = useTour("playroom");

  const playroomTourSteps: TourStep[] = isClinician ? [
    {
      target: "playroom-invite-code",
      title: "Share the Invite Code",
      content: "Tap this code to copy the invite link. Send it to your client — they'll join instantly, no account needed.",
      position: "bottom",
      emoji: "🔗",
    },
    {
      target: "button-open-tool-selector",
      title: "Switch Tools",
      content: "Open the tool selector to switch between the Sandtray, Breathing Guide, Feeling Wheel, and more during your session.",
      position: "bottom",
      emoji: "🧰",
    },
    {
      target: "playroom-asset-library",
      title: "Asset Library",
      content: "Tap here to open the drag-and-drop asset library. You and your client can place items onto the shared canvas.",
      position: "top",
      emoji: "🎨",
    },
    {
      target: "button-snapshot",
      title: "Save a Snapshot",
      content: "Export the current canvas as an image. Useful for session notes or sharing progress with your client.",
      position: "bottom",
      emoji: "📸",
    },
    {
      target: "button-end-session",
      title: "End the Session",
      content: "When you're done, end the session here. All participants will be disconnected and the session will be saved.",
      position: "bottom",
      emoji: "🏁",
    },
  ] : [];

  const isCanvasLocked = session?.isCanvasLocked ?? false;
  const isAnonymous = session?.isAnonymous ?? false;

  const myParticipantId = useRef(`local-${Date.now()}`);
  const myDisplayName = isClinician
    ? (user?.firstName ? `Dr. ${user.firstName}` : "Clinician")
    : "Guest";
  const throttleRef = useRef(0);
  const toolAreaRef = useRef<HTMLDivElement>(null);
  const peakParticipants = useRef(0);
  const toolsUsed = useRef<Set<string>>(new Set(["sandtray"]));

  const handleMessage = useCallback((msg: any) => {
    switch (msg.type) {
      case "init":
        setItems(msg.items.map((i: any) => ({
          id: i.id,
          icon: i.icon,
          category: i.category,
          x: i.x,
          y: i.y,
          scale: i.scale,
          rotation: i.rotation,
          placedBy: i.placedBy,
        })));
        setParticipants(msg.participants || []);
        setOnlineUsers(msg.onlineUsers || []);
        if (msg.session) setSession(msg.session);
        if (msg.activeTool) setActiveTool(msg.activeTool);
        if (msg.breathingActive !== undefined) setBreathingActive(msg.breathingActive);
        if (msg.breathingStartTime !== undefined) setBreathingStartTime(msg.breathingStartTime);
        if (msg.breathingTechnique) setBreathingTechnique(msg.breathingTechnique);
        if (msg.lightSource) setLightSource(msg.lightSource);
        if (msg.rakePaths) setRakePaths(msg.rakePaths);
        if (msg.zenMode !== undefined) setZenMode(msg.zenMode);
        if (msg.feelingSelections) setFeelingSelections(msg.feelingSelections);
        if (msg.timelineEvents) setTimelineEvents(msg.timelineEvents.map((e: any) => ({
          id: e.id,
          label: e.label,
          description: e.description,
          position: e.position,
          color: e.color,
          placedBy: e.placedBy,
        })));
        if (msg.valuesCards) setValuesCards(msg.valuesCards.map((c: any) => ({
          id: c.id,
          cardId: c.cardId,
          label: c.label,
          column: c.column,
          orderIndex: c.orderIndex,
          placedBy: c.placedBy,
        })));
        if (msg.theaterParts) setTheaterParts(msg.theaterParts.map((p: any) => ({
          id: p.id, name: p.name, x: p.x, y: p.y, size: p.size,
          color: p.color, note: p.note, isContained: p.isContained, placedBy: p.placedBy,
        })));
        if (msg.theaterConnections) setTheaterConnections(msg.theaterConnections.map((c: any) => ({
          id: c.id, fromPartId: c.fromPartId, toPartId: c.toPartId,
          style: c.style, createdBy: c.createdBy,
        })));
        if (msg.theaterFrozen !== undefined || msg.theaterMetaphor !== undefined) {
          setTheaterSettings({
            frozen: msg.theaterFrozen ?? false,
            dimInactive: msg.theaterDimInactive ?? false,
            metaphor: msg.theaterMetaphor ?? "parts",
            partLimit: msg.theaterPartLimit ?? 0,
          });
        }
        // New tool init data
        if (msg.thermometerReadings) setThermometerReadings(msg.thermometerReadings);
        if (msg.containmentContainers) setContainmentContainers(msg.containmentContainers);
        if (msg.containmentItems) setContainmentItems(msg.containmentItems);
        if (msg.bodyScanMarkers) setBodyScanMarkers(msg.bodyScanMarkers);
        if (msg.gratitudeStones) setGratitudeStones(msg.gratitudeStones.map((s: any) => ({ ...s, createdAt: s.createdAt || new Date().toISOString() })));
        if (msg.safetyPlanItems) setSafetyPlanItems(msg.safetyPlanItems);
        if (msg.worryTreeEntries) setWorryTreeEntries(msg.worryTreeEntries);
        if (msg.thoughtBridgeRecords) setThoughtBridgeRecords(msg.thoughtBridgeRecords);
        if (msg.thoughtBridgeEvidence) setThoughtBridgeEvidence(msg.thoughtBridgeEvidence);
        if (msg.copingStrategies) setCopingStrategies(msg.copingStrategies);
        if (msg.dbtHouseSkills) setDbtHouseSkills(msg.dbtHouseSkills);
        if (msg.strengthsPlacements) setStrengthsPlacements(msg.strengthsPlacements);
        if (msg.strengthsSpottings) setStrengthsSpottings(msg.strengthsSpottings);
        if (msg.socialAtomPeople) setSocialAtomPeople(msg.socialAtomPeople);
        if (msg.socialAtomConnections) setSocialAtomConnections(msg.socialAtomConnections);
        if (msg.gardenPlants) setGardenPlants(msg.gardenPlants);
        if (msg.gardenJournalEntries) setGardenJournalEntries(msg.gardenJournalEntries);
        if (msg.gardenWeeds) setGardenWeeds(msg.gardenWeeds);
        if (msg.toolSettings) setToolSettings(msg.toolSettings);
        break;
      case "item-placed":
        setItems(prev => [...prev, {
          id: msg.item.id,
          icon: msg.item.icon,
          category: msg.item.category,
          x: msg.item.x,
          y: msg.item.y,
          scale: msg.item.scale,
          rotation: msg.item.rotation,
          placedBy: msg.item.placedBy,
        }]);
        break;
      case "item-moved":
        setItems(prev => prev.map(i =>
          i.id === msg.itemId ? { ...i, x: msg.x, y: msg.y } : i
        ));
        break;
      case "item-transformed":
        setItems(prev => prev.map(i =>
          i.id === msg.itemId ? {
            ...i,
            ...(msg.scale !== undefined && { scale: msg.scale }),
            ...(msg.rotation !== undefined && { rotation: msg.rotation }),
            ...(msg.x !== undefined && { x: msg.x }),
            ...(msg.y !== undefined && { y: msg.y }),
          } : i
        ));
        break;
      case "item-removed":
        setItems(prev => prev.filter(i => i.id !== msg.itemId));
        break;
      case "canvas-cleared":
        setItems([]);
        break;
      case "session-updated":
        if (msg.session) setSession(msg.session);
        break;
      case "cursor-move":
        setRemoteCursors(prev => {
          const existing = prev.filter(c => c.participantId !== msg.participantId);
          return [...existing, {
            participantId: msg.participantId,
            displayName: msg.displayName,
            x: msg.x,
            y: msg.y,
          }];
        });
        break;
      case "user-joined":
        setOnlineUsers(prev => [...prev.filter(u => u.participantId !== msg.participantId), {
          participantId: msg.participantId,
          displayName: msg.displayName,
          lastActive: Date.now(),
        }]);
        setJoinNotification(msg.displayName);
        setTimeout(() => setJoinNotification(null), 3000);
        break;
      case "user-left":
        setOnlineUsers(prev => prev.filter(u => u.participantId !== msg.participantId));
        setRemoteCursors(prev => prev.filter(c => c.participantId !== msg.participantId));
        break;
      case "user-disconnected":
        setOnlineUsers(prev => prev.map(u =>
          u.participantId === msg.participantId ? { ...u, status: "disconnected" } : u
        ));
        break;
      case "tool-changed":
        setActiveTool(msg.tool);
        break;
      case "breathing-toggled":
        setBreathingActive(msg.isActive);
        setBreathingStartTime(msg.startTime ?? null);
        break;
      case "breathing-technique-changed":
        setBreathingTechnique(msg.techniqueId);
        break;
      case "activity-pulse":
        setOnlineUsers(prev => prev.map(u =>
          u.participantId === msg.participantId ? { ...u, lastActive: Date.now() } : u
        ));
        break;

      case "session-ended":
        setSessionEnded(true);
        break;

      // Feeling Wheel
      case "feeling-selected":
        setFeelingSelections(prev => [...prev, msg.selection]);
        break;
      case "feelings-cleared":
        setFeelingSelections([]);
        break;

      // Narrative Timeline
      case "timeline-event-added":
        setTimelineEvents(prev => [...prev, {
          id: msg.event.id,
          label: msg.event.label,
          description: msg.event.description,
          position: msg.event.position,
          color: msg.event.color,
          placedBy: msg.event.placedBy,
        }]);
        break;
      case "timeline-event-updated":
        setTimelineEvents(prev => prev.map(e =>
          e.id === msg.event.id ? { ...e, ...msg.event } : e
        ));
        break;
      case "timeline-event-removed":
        setTimelineEvents(prev => prev.filter(e => e.id !== msg.eventId));
        break;
      case "timeline-cleared":
        setTimelineEvents([]);
        break;

      // Ambient / Zen
      case "light-source-updated":
        setLightSource({ x: msg.x, y: msg.y, temperature: msg.temperature });
        break;
      case "rake-path-added":
        setRakePaths(prev => [...prev, msg.path]);
        break;
      case "rake-paths-cleared":
        setRakePaths([]);
        break;
      case "zen-mode-toggled":
        setZenMode(msg.enabled);
        break;

      // Values Card Sort
      case "values-card-placed":
        setValuesCards(prev => [...prev, {
          id: msg.card.id,
          cardId: msg.card.cardId,
          label: msg.card.label,
          column: msg.card.column,
          orderIndex: msg.card.orderIndex,
          placedBy: msg.card.placedBy,
        }]);
        break;
      case "values-card-moved":
        setValuesCards(prev => prev.map(c =>
          c.id === msg.card.id ? { ...c, column: msg.card.column, orderIndex: msg.card.orderIndex } : c
        ));
        break;
      case "values-card-removed":
        setValuesCards(prev => prev.filter(c => c.id !== msg.cardId));
        break;
      case "values-cleared":
        setValuesCards([]);
        break;

      // Parts Theater
      case "theater-part-added":
        setTheaterParts(prev => [...prev, {
          id: msg.part.id, name: msg.part.name, x: msg.part.x, y: msg.part.y,
          size: msg.part.size, color: msg.part.color, note: msg.part.note,
          isContained: msg.part.isContained, placedBy: msg.part.placedBy,
        }]);
        break;
      case "theater-part-moved":
        setTheaterParts(prev => prev.map(p =>
          p.id === msg.partId ? { ...p, x: msg.x, y: msg.y } : p
        ));
        break;
      case "theater-part-updated":
        setTheaterParts(prev => prev.map(p =>
          p.id === msg.part.id ? { ...p, ...msg.part } : p
        ));
        break;
      case "theater-part-removed":
        setTheaterParts(prev => prev.filter(p => p.id !== msg.partId));
        setTheaterConnections(prev => prev.filter(c => c.fromPartId !== msg.partId && c.toPartId !== msg.partId));
        break;
      case "theater-connection-added":
        setTheaterConnections(prev => [...prev, {
          id: msg.connection.id, fromPartId: msg.connection.fromPartId,
          toPartId: msg.connection.toPartId, style: msg.connection.style,
          createdBy: msg.connection.createdBy,
        }]);
        break;
      case "theater-connection-removed":
        setTheaterConnections(prev => prev.filter(c => c.id !== msg.connectionId));
        break;
      case "theater-cleared":
        setTheaterParts([]);
        setTheaterConnections([]);
        break;
      case "theater-settings-updated":
        setTheaterSettings({
          frozen: msg.frozen,
          dimInactive: msg.dimInactive,
          metaphor: msg.metaphor,
          partLimit: msg.partLimit,
        });
        break;

      // Generic Tool Settings
      case "tool-settings-updated":
        setToolSettings(prev => ({ ...prev, [msg.toolId]: msg.settings }));
        break;

      // Emotion Thermometer
      case "thermometer-reading-added":
        setThermometerReadings(prev => [...prev, msg.reading]);
        break;
      case "thermometer-cleared":
        setThermometerReadings([]);
        break;

      // Containment Box
      case "containment-container-created":
        setContainmentContainers(prev => [...prev, msg.container]);
        break;
      case "containment-item-added":
        setContainmentItems(prev => [...prev, msg.item]);
        break;
      case "containment-item-contained":
      case "containment-item-dissolved":
        setContainmentItems(prev => prev.map(i => i.id === msg.item.id ? { ...i, ...msg.item } : i));
        break;
      case "containment-locked":
      case "containment-unlocked":
        setContainmentContainers(prev => prev.map(c => c.id === msg.container.id ? { ...c, ...msg.container } : c));
        break;
      case "containment-cleared":
        setContainmentContainers([]);
        setContainmentItems([]);
        break;

      // Body Scan Map
      case "body-scan-marker-added":
        setBodyScanMarkers(prev => [...prev, msg.marker]);
        break;
      case "body-scan-marker-updated":
        setBodyScanMarkers(prev => prev.map(m => m.id === msg.marker.id ? { ...m, ...msg.marker } : m));
        break;
      case "body-scan-marker-removed":
        setBodyScanMarkers(prev => prev.filter(m => m.id !== msg.markerId));
        break;
      case "body-scan-cleared":
        setBodyScanMarkers([]);
        break;

      // Gratitude Jar
      case "gratitude-stone-added":
        setGratitudeStones(prev => [...prev, { ...msg.stone, createdAt: msg.stone.createdAt || new Date().toISOString() }]);
        break;
      case "gratitude-stone-starred":
        setGratitudeStones(prev => prev.map(s => s.id === msg.stone.id ? { ...s, ...msg.stone } : s));
        break;
      case "gratitude-stone-removed":
        setGratitudeStones(prev => prev.filter(s => s.id !== msg.stoneId));
        break;
      case "gratitude-cleared":
        setGratitudeStones([]);
        break;

      // Safety Map
      case "safety-item-added":
        setSafetyPlanItems(prev => [...prev, msg.item]);
        break;
      case "safety-item-updated":
        setSafetyPlanItems(prev => prev.map(i => i.id === msg.item.id ? { ...i, ...msg.item } : i));
        break;
      case "safety-item-removed":
        setSafetyPlanItems(prev => prev.filter(i => i.id !== msg.itemId));
        break;
      case "safety-plan-cleared":
        setSafetyPlanItems([]);
        break;

      // Worry Tree
      case "worry-entry-created":
        setWorryTreeEntries(prev => [...prev, msg.entry]);
        break;
      case "worry-entry-updated":
        setWorryTreeEntries(prev => prev.map(e => e.id === msg.entry.id ? { ...e, ...msg.entry } : e));
        break;
      case "worry-entry-removed":
        setWorryTreeEntries(prev => prev.filter(e => e.id !== msg.entryId));
        break;
      case "worry-tree-cleared":
        setWorryTreeEntries([]);
        break;

      // Thought Bridge
      case "thought-bridge-created":
        setThoughtBridgeRecords(prev => [...prev, msg.record]);
        break;
      case "thought-bridge-updated":
        setThoughtBridgeRecords(prev => prev.map(r => r.id === msg.record.id ? { ...r, ...msg.record } : r));
        break;
      case "thought-bridge-evidence-added":
        setThoughtBridgeEvidence(prev => [...prev, msg.evidence]);
        break;
      case "thought-bridge-evidence-removed":
        setThoughtBridgeEvidence(prev => prev.filter(e => e.id !== msg.evidenceId));
        break;
      case "thought-bridge-cleared":
        setThoughtBridgeRecords([]);
        setThoughtBridgeEvidence([]);
        break;

      // Coping Toolbox
      case "coping-strategy-added":
        setCopingStrategies(prev => [...prev, msg.strategy]);
        break;
      case "coping-strategy-updated":
        setCopingStrategies(prev => prev.map(s => s.id === msg.strategy.id ? { ...s, ...msg.strategy } : s));
        break;
      case "coping-strategy-removed":
        setCopingStrategies(prev => prev.filter(s => s.id !== msg.strategyId));
        break;
      case "coping-cleared":
        setCopingStrategies([]);
        break;

      // DBT House
      case "dbt-skill-placed":
        setDbtHouseSkills(prev => [...prev, msg.skill]);
        break;
      case "dbt-skill-updated":
        setDbtHouseSkills(prev => prev.map(s => s.id === msg.skill.id ? { ...s, ...msg.skill } : s));
        break;
      case "dbt-skill-removed":
        setDbtHouseSkills(prev => prev.filter(s => s.id !== msg.skillPlacementId));
        break;
      case "dbt-house-cleared":
        setDbtHouseSkills([]);
        break;

      // Strengths Deck
      case "strengths-placed":
        setStrengthsPlacements(prev => [...prev, msg.placement]);
        break;
      case "strengths-moved":
        setStrengthsPlacements(prev => prev.map(p => p.id === msg.placement.id ? { ...p, ...msg.placement } : p));
        break;
      case "strengths-removed":
        setStrengthsPlacements(prev => prev.filter(p => p.id !== msg.placementId));
        break;
      case "strengths-spotted":
        setStrengthsSpottings(prev => [...prev, msg.spotting]);
        break;
      case "strengths-cleared":
        setStrengthsPlacements([]);
        setStrengthsSpottings([]);
        break;

      // Social Atom
      case "social-atom-person-added":
        setSocialAtomPeople(prev => [...prev, msg.person]);
        break;
      case "social-atom-person-moved":
      case "social-atom-person-updated":
        setSocialAtomPeople(prev => prev.map(p => p.id === msg.person.id ? { ...p, ...msg.person } : p));
        break;
      case "social-atom-person-removed":
        setSocialAtomPeople(prev => prev.filter(p => p.id !== msg.personId));
        setSocialAtomConnections(prev => prev.filter(c => c.fromPersonId !== msg.personId && c.toPersonId !== msg.personId));
        break;
      case "social-atom-connection-added":
        setSocialAtomConnections(prev => [...prev, msg.connection]);
        break;
      case "social-atom-connection-removed":
        setSocialAtomConnections(prev => prev.filter(c => c.id !== msg.connectionId));
        break;
      case "social-atom-cleared":
        setSocialAtomPeople([]);
        setSocialAtomConnections([]);
        break;

      // Growth Garden
      case "garden-plant-added":
        setGardenPlants(prev => [...prev, msg.plant]);
        break;
      case "garden-plant-updated":
        setGardenPlants(prev => prev.map(p => p.id === msg.plant.id ? { ...p, ...msg.plant } : p));
        break;
      case "garden-plant-removed":
        setGardenPlants(prev => prev.filter(p => p.id !== msg.plantId));
        break;
      case "garden-journal-added":
        setGardenJournalEntries(prev => [...prev, msg.entry]);
        break;
      case "garden-weed-added":
        setGardenWeeds(prev => [...prev, msg.weed]);
        break;
      case "garden-weed-pulled":
        setGardenWeeds(prev => prev.map(w => w.id === msg.weed.id ? { ...w, ...msg.weed } : w));
        break;
      case "garden-cleared":
        setGardenPlants([]);
        setGardenJournalEntries([]);
        setGardenWeeds([]);
        break;
    }
  }, []);

  const { connected: wsConnected, send: wsSend } = useSessionSocket(
    sessionId,
    myParticipantId.current,
    myDisplayName,
    handleMessage
  );

  const connected = isDemo ? true : wsConnected;
  const send = useCallback((msg: any) => {
    if (isDemo) {
      const pid = myParticipantId.current;
      const dn = myDisplayName;
      switch (msg.type) {
        case "item-placed": {
          const newItem = {
            id: `demo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            icon: msg.icon,
            category: msg.category,
            x: msg.x,
            y: msg.y,
            scale: msg.scale ?? 1,
            rotation: msg.rotation ?? 0,
            placedBy: pid,
          };
          setItems(prev => [...prev, newItem]);
          break;
        }
        case "item-moved":
          setItems(prev => prev.map(i => i.id === msg.itemId ? { ...i, x: msg.x, y: msg.y } : i));
          break;
        case "item-transformed":
          setItems(prev => prev.map(i =>
            i.id === msg.itemId ? {
              ...i,
              ...(msg.scale !== undefined && { scale: msg.scale }),
              ...(msg.rotation !== undefined && { rotation: msg.rotation }),
              ...(msg.x !== undefined && { x: msg.x }),
              ...(msg.y !== undefined && { y: msg.y }),
            } : i
          ));
          break;
        case "item-removed":
          setItems(prev => prev.filter(i => i.id !== msg.itemId));
          break;
        case "clear-canvas":
          setItems([]);
          break;
        case "session-update":
          if (msg.data) setSession(prev => prev ? { ...prev, ...msg.data } : prev);
          break;
        case "tool-change":
          setActiveTool(msg.tool);
          break;
        case "breathing-toggle":
          setBreathingActive(msg.isActive);
          setBreathingStartTime(msg.isActive ? Date.now() : null);
          break;
        case "breathing-technique-change":
          setBreathingTechnique(msg.techniqueId);
          break;
        case "feeling-select":
          setFeelingSelections(prev => [...prev, {
            id: `demo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            selectedBy: pid,
            participantId: pid,
            displayName: dn,
            primaryEmotion: msg.primaryEmotion,
            secondaryEmotion: msg.secondaryEmotion,
            tertiaryEmotion: msg.tertiaryEmotion,
            timestamp: Date.now(),
          } as FeelingSelection]);
          break;
        case "feeling-clear":
          setFeelingSelections([]);
          break;
        case "timeline-event-add":
          setTimelineEvents(prev => [...prev, {
            id: `demo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            label: msg.label,
            description: msg.description,
            position: msg.position,
            color: msg.color,
            placedBy: pid,
          }]);
          break;
        case "timeline-event-update":
          setTimelineEvents(prev => prev.map(e =>
            e.id === msg.eventId ? { ...e, label: msg.label, description: msg.description, position: msg.position, color: msg.color } : e
          ));
          break;
        case "timeline-event-remove":
          setTimelineEvents(prev => prev.filter(e => e.id !== msg.eventId));
          break;
        case "timeline-clear":
          setTimelineEvents([]);
          break;
        case "values-card-place":
          setValuesCards(prev => [...prev, {
            id: `demo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            cardId: msg.cardId,
            label: msg.label,
            column: msg.column,
            orderIndex: msg.orderIndex,
            placedBy: pid,
          }]);
          break;
        case "values-card-move":
          setValuesCards(prev => prev.map(c =>
            c.id === msg.cardId ? { ...c, column: msg.column, orderIndex: msg.orderIndex } : c
          ));
          break;
        case "values-card-remove":
          setValuesCards(prev => prev.filter(c => c.id !== msg.cardId));
          break;
        case "values-clear":
          setValuesCards([]);
          break;
        case "light-source-update":
          setLightSource({ x: msg.x, y: msg.y, temperature: msg.temperature });
          break;
        case "rake-path-add":
          setRakePaths(prev => [...prev, { id: msg.id, points: msg.points, width: msg.width || 12, createdBy: pid, timestamp: Date.now() }]);
          break;
        case "rake-path-clear":
          setRakePaths([]);
          break;
        case "zen-mode-toggle":
          setZenMode(msg.enabled);
          break;
        case "theater-part-add": {
          const newPart: TheaterPartData = {
            id: `demo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            name: msg.name || null, x: msg.x, y: msg.y, size: msg.size || "medium",
            color: msg.color || "#1B2A4A", note: null, isContained: false, placedBy: pid,
          };
          setTheaterParts(prev => [...prev, newPart]);
          break;
        }
        case "theater-part-move":
          setTheaterParts(prev => prev.map(p => p.id === msg.partId ? { ...p, x: msg.x, y: msg.y } : p));
          break;
        case "theater-part-update":
          setTheaterParts(prev => prev.map(p => p.id === msg.partId ? { ...p, ...msg.fields } : p));
          break;
        case "theater-part-remove":
          setTheaterParts(prev => prev.filter(p => p.id !== msg.partId));
          setTheaterConnections(prev => prev.filter(c => c.fromPartId !== msg.partId && c.toPartId !== msg.partId));
          break;
        case "theater-connection-add": {
          const newConn: TheaterConnectionData = {
            id: `demo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            fromPartId: msg.fromPartId, toPartId: msg.toPartId,
            style: msg.style || "solid", createdBy: pid,
          };
          setTheaterConnections(prev => [...prev, newConn]);
          break;
        }
        case "theater-connection-remove":
          setTheaterConnections(prev => prev.filter(c => c.id !== msg.connectionId));
          break;
        case "theater-clear":
          setTheaterParts([]);
          setTheaterConnections([]);
          break;
        case "theater-settings-update":
          setTheaterSettings(prev => ({
            ...prev,
            ...(msg.frozen !== undefined && { frozen: msg.frozen }),
            ...(msg.dimInactive !== undefined && { dimInactive: msg.dimInactive }),
            ...(msg.metaphor !== undefined && { metaphor: msg.metaphor }),
            ...(msg.partLimit !== undefined && { partLimit: msg.partLimit }),
          }));
          break;

        // Demo: Generic tool settings
        case "tool-settings-update":
          setToolSettings(prev => ({ ...prev, [msg.toolId]: { ...(prev[msg.toolId] || {}), ...msg.settings } }));
          break;

        // Demo: Thermometer
        case "thermometer-reading-add":
          setThermometerReadings(prev => [...prev, { id: `demo-${Date.now()}-${Math.random().toString(36).slice(2,7)}`, emotionLabel: msg.emotionLabel, intensity: msg.intensity, bodyLocation: msg.bodyLocation || null, triggerNote: msg.triggerNote || null, createdBy: pid, createdAt: new Date().toISOString() }]);
          break;
        case "thermometer-clear":
          setThermometerReadings([]);
          break;

        // Demo: Containment Box
        case "containment-container-create":
          setContainmentContainers(prev => [...prev, { id: `demo-${Date.now()}-${Math.random().toString(36).slice(2,7)}`, containerType: msg.containerType || "chest", isLocked: false, lockMethod: null, containmentStrength: null, createdBy: pid, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }]);
          break;
        case "containment-item-add":
          setContainmentItems(prev => [...prev, { id: `demo-${Date.now()}-${Math.random().toString(36).slice(2,7)}`, containerId: msg.containerId, label: msg.label, emoji: msg.emoji || null, color: msg.color || null, status: "contained", createdBy: pid, createdAt: new Date().toISOString() }]);
          break;
        case "containment-item-contain":
          setContainmentItems(prev => prev.map(i => i.id === msg.itemId ? { ...i, status: "contained" } : i));
          break;
        case "containment-item-dissolve":
          setContainmentItems(prev => prev.map(i => i.id === msg.itemId ? { ...i, status: "dissolved" } : i));
          break;
        case "containment-lock":
          setContainmentContainers(prev => prev.map(c => c.id === msg.containerId ? { ...c, isLocked: true, lockMethod: msg.lockMethod, containmentStrength: msg.containmentStrength } : c));
          break;
        case "containment-unlock":
          setContainmentContainers(prev => prev.map(c => c.id === msg.containerId ? { ...c, isLocked: false } : c));
          break;
        case "containment-clear":
          setContainmentContainers([]);
          setContainmentItems([]);
          break;

        // Demo: Body Scan
        case "body-scan-marker-add":
          setBodyScanMarkers(prev => [...prev, { id: `demo-${Date.now()}-${Math.random().toString(36).slice(2,7)}`, bodyRegion: msg.bodyRegion, sensationType: msg.sensationType, intensity: msg.intensity || 5, emotionLink: msg.emotionLink || null, notes: msg.notes || null, breathReaches: msg.breathReaches ?? null, movementImpulse: msg.movementImpulse || null, color: msg.color || null, createdBy: pid, createdAt: new Date().toISOString() }]);
          break;
        case "body-scan-marker-update":
          setBodyScanMarkers(prev => prev.map(m => m.id === msg.markerId ? { ...m, ...msg } : m));
          break;
        case "body-scan-marker-remove":
          setBodyScanMarkers(prev => prev.filter(m => m.id !== msg.markerId));
          break;
        case "body-scan-clear":
          setBodyScanMarkers([]);
          break;

        // Demo: Gratitude Jar
        case "gratitude-stone-add":
          setGratitudeStones(prev => [...prev, { id: `demo-${Date.now()}-${Math.random().toString(36).slice(2,7)}`, content: msg.content, category: msg.category || "general", color: msg.color || "#F59E0B", shape: msg.shape || "round", isStarred: false, createdBy: pid, createdAt: new Date().toISOString() }]);
          break;
        case "gratitude-stone-star":
          setGratitudeStones(prev => prev.map(s => s.id === msg.stoneId ? { ...s, isStarred: msg.isStarred } : s));
          break;
        case "gratitude-stone-remove":
          setGratitudeStones(prev => prev.filter(s => s.id !== msg.stoneId));
          break;
        case "gratitude-clear":
          setGratitudeStones([]);
          break;

        // Demo: Fidget
        case "fidget-interaction":
          break;

        // Demo: Safety Map
        case "safety-item-add":
          setSafetyPlanItems(prev => [...prev, { id: `demo-${Date.now()}-${Math.random().toString(36).slice(2,7)}`, step: msg.step, content: msg.content, contactName: msg.contactName || null, contactPhone: msg.contactPhone || null, contactRelationship: msg.contactRelationship || null, orderIndex: msg.orderIndex || 0, createdBy: pid, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }]);
          break;
        case "safety-item-update":
          setSafetyPlanItems(prev => prev.map(i => i.id === msg.itemId ? { ...i, ...msg } : i));
          break;
        case "safety-item-remove":
          setSafetyPlanItems(prev => prev.filter(i => i.id !== msg.itemId));
          break;
        case "safety-plan-clear":
          setSafetyPlanItems([]);
          break;

        // Demo: Worry Tree
        case "worry-entry-create":
          setWorryTreeEntries(prev => [...prev, { id: `demo-${Date.now()}-${Math.random().toString(36).slice(2,7)}`, worryText: msg.worryText, category: msg.category || null, isReal: null, isActionable: null, resolution: null, actionSteps: null, scheduledTime: null, lettingGoMethod: null, createdBy: pid, createdAt: new Date().toISOString() }]);
          break;
        case "worry-entry-update":
          setWorryTreeEntries(prev => prev.map(e => e.id === msg.entryId ? { ...e, ...msg } : e));
          break;
        case "worry-entry-remove":
          setWorryTreeEntries(prev => prev.filter(e => e.id !== msg.entryId));
          break;
        case "worry-tree-clear":
          setWorryTreeEntries([]);
          break;

        // Demo: Thought Bridge
        case "thought-bridge-create":
          setThoughtBridgeRecords(prev => [...prev, { id: `demo-${Date.now()}-${Math.random().toString(36).slice(2,7)}`, situation: msg.situation || null, automaticThought: null, beliefRatingBefore: null, beliefRatingAfter: null, balancedThought: null, emotionsBefore: null, emotionsAfter: null, distortions: null, status: "incomplete", createdBy: pid, createdAt: new Date().toISOString() }]);
          break;
        case "thought-bridge-update":
          setThoughtBridgeRecords(prev => prev.map(r => r.id === msg.recordId ? { ...r, ...msg } : r));
          break;
        case "thought-bridge-evidence-add":
          setThoughtBridgeEvidence(prev => [...prev, { id: `demo-${Date.now()}-${Math.random().toString(36).slice(2,7)}`, recordId: msg.recordId, type: msg.evidenceType, content: msg.content, createdBy: pid, orderIndex: msg.orderIndex || 0 }]);
          break;
        case "thought-bridge-evidence-remove":
          setThoughtBridgeEvidence(prev => prev.filter(e => e.id !== msg.evidenceId));
          break;
        case "thought-bridge-clear":
          setThoughtBridgeRecords([]);
          setThoughtBridgeEvidence([]);
          break;

        // Demo: Coping Toolbox
        case "coping-strategy-add":
          setCopingStrategies(prev => [...prev, { id: `demo-${Date.now()}-${Math.random().toString(36).slice(2,7)}`, name: msg.name, description: msg.description || null, category: msg.category, emoji: msg.emoji || null, isCustom: msg.isCustom ?? true, contextTags: msg.contextTags || null, difficulty: msg.difficulty || null, effectiveness: null, isPinned: msg.isPinned ?? false, usageCount: 0, createdBy: pid, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }]);
          break;
        case "coping-strategy-update":
          setCopingStrategies(prev => prev.map(s => s.id === msg.strategyId ? { ...s, ...msg } : s));
          break;
        case "coping-strategy-remove":
          setCopingStrategies(prev => prev.filter(s => s.id !== msg.strategyId));
          break;
        case "coping-clear":
          setCopingStrategies([]);
          break;

        // Demo: DBT House
        case "dbt-skill-place":
          setDbtHouseSkills(prev => [...prev, { id: `demo-${Date.now()}-${Math.random().toString(36).slice(2,7)}`, skillId: msg.skillId, module: msg.module, houseSection: msg.houseSection, personalExample: msg.personalExample || null, practiceCount: 0, lastPracticedAt: null, effectivenessAvg: null, createdBy: pid, createdAt: new Date().toISOString() }]);
          break;
        case "dbt-skill-update":
          setDbtHouseSkills(prev => prev.map(s => s.id === msg.skillPlacementId ? { ...s, ...msg } : s));
          break;
        case "dbt-skill-remove":
          setDbtHouseSkills(prev => prev.filter(s => s.id !== msg.skillPlacementId));
          break;
        case "dbt-house-clear":
          setDbtHouseSkills([]);
          break;

        // Demo: Strengths Deck
        case "strengths-place":
          setStrengthsPlacements(prev => [...prev, { id: `demo-${Date.now()}-${Math.random().toString(36).slice(2,7)}`, strengthId: msg.strengthId, tier: msg.tier, orderIndex: msg.orderIndex || 0, scenarioResponse: msg.scenarioResponse || null, createdBy: pid, createdAt: new Date().toISOString() }]);
          break;
        case "strengths-move":
          setStrengthsPlacements(prev => prev.map(p => p.id === msg.placementId ? { ...p, tier: msg.tier, orderIndex: msg.orderIndex } : p));
          break;
        case "strengths-remove":
          setStrengthsPlacements(prev => prev.filter(p => p.id !== msg.placementId));
          break;
        case "strengths-spot":
          setStrengthsSpottings(prev => [...prev, { id: `demo-${Date.now()}-${Math.random().toString(36).slice(2,7)}`, strengthId: msg.strengthId, note: msg.note, createdBy: pid, createdAt: new Date().toISOString() }]);
          break;
        case "strengths-clear":
          setStrengthsPlacements([]);
          setStrengthsSpottings([]);
          break;

        // Demo: Social Atom
        case "social-atom-person-add":
          setSocialAtomPeople(prev => [...prev, { id: `demo-${Date.now()}-${Math.random().toString(36).slice(2,7)}`, name: msg.name, role: msg.role, emoji: msg.emoji || null, color: msg.color || "#3B82F6", distanceRing: msg.distanceRing || 2, angle: msg.angle || 0, groupId: null, isDeceased: msg.isDeceased ?? false, emotionalTone: msg.emotionalTone || null, notes: msg.notes || null, createdBy: pid, createdAt: new Date().toISOString() }]);
          break;
        case "social-atom-person-move":
          setSocialAtomPeople(prev => prev.map(p => p.id === msg.personId ? { ...p, distanceRing: msg.distanceRing, angle: msg.angle } : p));
          break;
        case "social-atom-person-update":
          setSocialAtomPeople(prev => prev.map(p => p.id === msg.personId ? { ...p, ...msg } : p));
          break;
        case "social-atom-person-remove":
          setSocialAtomPeople(prev => prev.filter(p => p.id !== msg.personId));
          setSocialAtomConnections(prev => prev.filter(c => c.fromPersonId !== msg.personId && c.toPersonId !== msg.personId));
          break;
        case "social-atom-connection-add":
          setSocialAtomConnections(prev => [...prev, { id: `demo-${Date.now()}-${Math.random().toString(36).slice(2,7)}`, fromPersonId: msg.fromPersonId, toPersonId: msg.toPersonId, style: msg.style || "supportive", label: msg.label || null, directionality: msg.directionality || "bidirectional", createdBy: pid, createdAt: new Date().toISOString() }]);
          break;
        case "social-atom-connection-remove":
          setSocialAtomConnections(prev => prev.filter(c => c.id !== msg.connectionId));
          break;
        case "social-atom-clear":
          setSocialAtomPeople([]);
          setSocialAtomConnections([]);
          break;

        // Demo: Growth Garden
        case "garden-plant-add":
          setGardenPlants(prev => [...prev, { id: `demo-${Date.now()}-${Math.random().toString(36).slice(2,7)}`, seedType: msg.seedType, customName: msg.customName, category: msg.category, growthStage: msg.growthStage || 1, gridX: msg.gridX, gridY: msg.gridY, isHarvested: false, isDormant: false, createdBy: pid, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }]);
          break;
        case "garden-plant-update":
          setGardenPlants(prev => prev.map(p => p.id === msg.plantId ? { ...p, ...msg } : p));
          break;
        case "garden-plant-remove":
          setGardenPlants(prev => prev.filter(p => p.id !== msg.plantId));
          break;
        case "garden-journal-add":
          setGardenJournalEntries(prev => [...prev, { id: `demo-${Date.now()}-${Math.random().toString(36).slice(2,7)}`, plantId: msg.plantId, content: msg.content, progressRating: msg.progressRating || null, createdBy: pid, createdAt: new Date().toISOString() }]);
          break;
        case "garden-weed-add":
          setGardenWeeds(prev => [...prev, { id: `demo-${Date.now()}-${Math.random().toString(36).slice(2,7)}`, label: msg.label, linkedPlantId: msg.linkedPlantId || null, isPulled: false, createdBy: pid, createdAt: new Date().toISOString() }]);
          break;
        case "garden-weed-pull":
          setGardenWeeds(prev => prev.map(w => w.id === msg.weedId ? { ...w, isPulled: true } : w));
          break;
        case "garden-clear":
          setGardenPlants([]);
          setGardenJournalEntries([]);
          setGardenWeeds([]);
          break;
      }
      return;
    }
    wsSend(msg);
  }, [isDemo, wsSend, myDisplayName]);

  useEffect(() => {
    if (isDemo) {
      const params = new URLSearchParams(window.location.search);
      const toolParam = params.get("tool");
      if (toolParam) setActiveTool(toolParam);
      setSession({
        id: "demo",
        name: "Demo Playroom",
        inviteCode: "DEMO",
        isCanvasLocked: false,
        isAnonymous: false,
        status: "active",
        clinicianId: "demo-clinician",
        createdAt: new Date(),
        activeTool: toolParam || "sandtray",
        endedAt: null,
      } as TherapySession);
      setOnlineUsers([{
        participantId: myParticipantId.current,
        displayName: myDisplayName,
        lastActive: Date.now(),
        status: "online" as const,
      }]);
      return;
    }
    if (!sessionId) return;
    fetch(`/api/therapy-sessions/${sessionId}`)
      .then(r => {
        if (r.ok) return r.json();
        return null;
      })
      .then(s => {
        if (s) {
          setSession(s);
          if (s.status === "ended") setSessionEnded(true);
        }
      })
      .catch(() => {});
  }, [sessionId, isDemo]);

  // Read ?tool= param and switch tool on first connect (real sessions)
  const initialToolApplied = useRef(false);
  useEffect(() => {
    if (isDemo || !connected || initialToolApplied.current) return;
    const params = new URLSearchParams(window.location.search);
    const toolParam = params.get("tool");
    if (toolParam && toolParam !== activeTool) {
      initialToolApplied.current = true;
      setActiveTool(toolParam);
      send({ type: "tool-change", tool: toolParam });
    } else {
      initialToolApplied.current = true;
    }
  }, [connected, isDemo]);

  useEffect(() => {
    if (isClinician && session && connected && !playroomTour.hasCompleted() && !sessionEnded) {
      const timer = setTimeout(() => playroomTour.start(), 1200);
      return () => clearTimeout(timer);
    }
  }, [isClinician, session, connected, sessionEnded, playroomTour]);

  useEffect(() => {
    if (!isClinician || isDemo) return;
    fetch("/api/billing/status")
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.subscriptionType) setSubscriptionType(data.subscriptionType); })
      .catch(() => {});
  }, [isClinician, isDemo]);

  useEffect(() => {
    if (onlineUsers.length > peakParticipants.current) {
      peakParticipants.current = onlineUsers.length;
    }
  }, [onlineUsers]);

  useEffect(() => {
    if (activeTool) {
      toolsUsed.current.add(activeTool);
    }
  }, [activeTool]);

  const toolDisplayName = (tool: string) => {
    const names: Record<string, string> = {
      "sandtray": "Zen Sandtray",
      "breathing": "Calm Breathing",
      "feelings": "Feeling Wheel",
      "narrative": "Narrative Timeline",
      "values-sort": "Values Card Sort",
      "parts-theater": "Parts Theater",
      "emotion-thermometer": "Emotion Thermometer",
      "containment-box": "Containment Box",
      "body-scan": "Body Scan Map",
      "gratitude-jar": "Gratitude Jar",
      "fidget-tools": "Fidget Tools",
      "safety-map": "Safety Map",
      "worry-tree": "Worry Tree",
      "thought-bridge": "Thought Bridge",
      "coping-toolbox": "Coping Toolbox",
      "dbt-house": "The DBT House",
      "strengths-deck": "Strengths Deck",
      "social-atom": "Social Atom",
      "growth-garden": "Growth Garden",
    };
    return names[tool] || tool;
  };

  // Sandtray handlers
  const handleItemDrop = useCallback((icon: string, category: string, x: number, y: number) => {
    send({ type: "item-placed", icon, category, x, y, scale: 1, rotation: 0 });
    send({ type: "activity-pulse" });
  }, [send]);

  const handleTapPlace = useCallback((asset: SandtrayAsset) => {
    const x = 0.3 + Math.random() * 0.4;
    const y = 0.3 + Math.random() * 0.4;
    handleItemDrop(asset.icon, asset.category, x, y);
  }, [handleItemDrop]);

  const handleItemMove = useCallback((itemId: string, x: number, y: number) => {
    if (!isDemo) setItems(prev => prev.map(i => i.id === itemId ? { ...i, x, y } : i));
    send({ type: "item-moved", itemId, x, y });
    send({ type: "activity-pulse" });
  }, [send, isDemo]);

  const handleItemRemove = useCallback((itemId: string) => {
    if (!isDemo) setItems(prev => prev.filter(i => i.id !== itemId));
    send({ type: "item-removed", itemId });
  }, [send, isDemo]);

  const handleItemTransform = useCallback((itemId: string, scale: number, rotation: number) => {
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, scale, rotation } : i));
    send({ type: "item-transformed", itemId, scale, rotation });
  }, [send]);

  const handleCursorMove = useCallback((x: number, y: number) => {
    const now = Date.now();
    if (now - throttleRef.current < 50) return;
    throttleRef.current = now;
    send({ type: "cursor-move", x, y });
  }, [send]);

  const handleToggleLock = useCallback(() => {
    send({ type: "session-update", data: { isCanvasLocked: !isCanvasLocked } });
    if (!isDemo) setSession(prev => prev ? { ...prev, isCanvasLocked: !prev.isCanvasLocked } : prev);
  }, [send, isCanvasLocked, isDemo]);

  const handleToggleAnonymity = useCallback(() => {
    send({ type: "session-update", data: { isAnonymous: !isAnonymous } });
    if (!isDemo) setSession(prev => prev ? { ...prev, isAnonymous: !prev.isAnonymous } : prev);
  }, [send, isAnonymous, isDemo]);

  const handleClearCanvas = useCallback(() => {
    send({ type: "clear-canvas" });
    if (!isDemo) setItems([]);
  }, [send, isDemo]);

  const handleSelectTool = useCallback((toolId: string) => {
    if (toolId === activeTool) return;
    const label = toolDisplayName(toolId);
    setToolTransitionLabel(label);
    setTimeout(() => setToolTransitionLabel(null), 900);
    if (!isDemo) setActiveTool(toolId);
    send({ type: "tool-change", tool: toolId });
  }, [send, isDemo, activeTool]);

  const handleToggleBreathing = useCallback(() => {
    const next = !breathingActive;
    if (!isDemo) setBreathingActive(next);
    send({ type: "breathing-toggle", isActive: next });
  }, [send, breathingActive, isDemo]);

  const handleBreathingTechniqueChange = useCallback((techniqueId: string) => {
    if (!isDemo) setBreathingTechnique(techniqueId);
    send({ type: "breathing-technique-change", techniqueId });
  }, [send, isDemo]);

  // Feeling Wheel handlers
  const handleFeelingSelect = useCallback((primary: string, secondary: string | null, tertiary: string | null) => {
    send({ type: "feeling-select", primaryEmotion: primary, secondaryEmotion: secondary, tertiaryEmotion: tertiary });
    send({ type: "activity-pulse" });
  }, [send]);

  const handleFeelingClear = useCallback(() => {
    send({ type: "feeling-clear" });
    if (!isDemo) setFeelingSelections([]);
  }, [send, isDemo]);

  // Timeline handlers
  const handleTimelineAdd = useCallback((label: string, description: string | null, position: number, color: string) => {
    send({ type: "timeline-event-add", label, description, position, color });
    send({ type: "activity-pulse" });
  }, [send]);

  const handleTimelineRemove = useCallback((eventId: string) => {
    send({ type: "timeline-event-remove", eventId });
    if (!isDemo) setTimelineEvents(prev => prev.filter(e => e.id !== eventId));
  }, [send, isDemo]);

  const handleTimelineUpdate = useCallback((eventId: string, label: string, description: string | null, position: number, color: string) => {
    send({ type: "timeline-event-update", eventId, label, description, position, color });
  }, [send]);

  const handleTimelineClear = useCallback(() => {
    send({ type: "timeline-clear" });
    if (!isDemo) setTimelineEvents([]);
  }, [send, isDemo]);

  // Values Card Sort handlers
  const handleValuesPlace = useCallback((cardId: string, label: string, column: string, orderIndex: number) => {
    send({ type: "values-card-place", cardId, label, column, orderIndex });
    send({ type: "activity-pulse" });
  }, [send]);

  const handleValuesMove = useCallback((placementId: string, column: string, orderIndex: number) => {
    send({ type: "values-card-move", cardId: placementId, column, orderIndex });
    send({ type: "activity-pulse" });
  }, [send]);

  const handleValuesRemove = useCallback((placementId: string) => {
    send({ type: "values-card-remove", cardId: placementId });
    if (!isDemo) setValuesCards(prev => prev.filter(c => c.id !== placementId));
  }, [send, isDemo]);

  const handleValuesClear = useCallback(() => {
    send({ type: "values-clear" });
    if (!isDemo) setValuesCards([]);
  }, [send, isDemo]);

  // Parts Theater handlers
  const handleTheaterAddPart = useCallback((name: string | null, color: string, size: string, x: number, y: number) => {
    send({ type: "theater-part-add", name, color, size, x, y });
    send({ type: "activity-pulse" });
  }, [send]);

  const handleTheaterMovePart = useCallback((partId: string, x: number, y: number) => {
    if (!isDemo) setTheaterParts(prev => prev.map(p => p.id === partId ? { ...p, x, y } : p));
    send({ type: "theater-part-move", partId, x, y });
    send({ type: "activity-pulse" });
  }, [send, isDemo]);

  const handleTheaterUpdatePart = useCallback((partId: string, fields: Record<string, any>) => {
    if (!isDemo) setTheaterParts(prev => prev.map(p => p.id === partId ? { ...p, ...fields } : p));
    send({ type: "theater-part-update", partId, ...fields });
  }, [send, isDemo]);

  const handleTheaterRemovePart = useCallback((partId: string) => {
    if (!isDemo) {
      setTheaterParts(prev => prev.filter(p => p.id !== partId));
      setTheaterConnections(prev => prev.filter(c => c.fromPartId !== partId && c.toPartId !== partId));
    }
    send({ type: "theater-part-remove", partId });
  }, [send, isDemo]);

  const handleTheaterAddConnection = useCallback((fromPartId: string, toPartId: string, style: string) => {
    send({ type: "theater-connection-add", fromPartId, toPartId, style });
    send({ type: "activity-pulse" });
  }, [send]);

  const handleTheaterRemoveConnection = useCallback((connectionId: string) => {
    if (!isDemo) setTheaterConnections(prev => prev.filter(c => c.id !== connectionId));
    send({ type: "theater-connection-remove", connectionId });
  }, [send, isDemo]);

  const handleTheaterClear = useCallback(() => {
    send({ type: "theater-clear" });
    if (!isDemo) {
      setTheaterParts([]);
      setTheaterConnections([]);
    }
  }, [send, isDemo]);

  const handleTheaterSettingsUpdate = useCallback((updates: Partial<TheaterSettings>) => {
    send({ type: "theater-settings-update", ...updates });
  }, [send]);

  // Ambient / Zen handlers
  const handleLightSourceUpdate = useCallback((ls: LightSource) => {
    setLightSource(ls);
    const now = Date.now();
    if (now - lightThrottleRef.current < 33) return; // 30fps throttle
    lightThrottleRef.current = now;
    send({ type: "light-source-update", x: ls.x, y: ls.y, temperature: ls.temperature });
  }, [send]);

  const handleLightTemperatureChange = useCallback((temperature: number) => {
    const newLs = { ...lightSource, temperature };
    handleLightSourceUpdate(newLs);
  }, [lightSource, handleLightSourceUpdate]);

  const handleRakePathAdd = useCallback((path: RakePath) => {
    setRakePaths(prev => [...prev, path]);
    send({ type: "rake-path-add", id: path.id, points: path.points, width: path.width });
  }, [send]);

  const handleRakePathClear = useCallback(() => {
    setRakePaths([]);
    send({ type: "rake-path-clear" });
  }, [send]);

  const handleZenModeToggle = useCallback(() => {
    const next = !zenMode;
    setZenMode(next);
    send({ type: "zen-mode-toggle", enabled: next });
  }, [send, zenMode]);

  const handleToggleRakeMode = useCallback(() => {
    setRakeMode(prev => !prev);
    setDigMode(false);
  }, []);

  const handleToggleDigMode = useCallback(() => {
    setDigMode(prev => !prev);
    setRakeMode(false);
  }, []);

  const handleCycleSandTexture = useCallback(() => {
    setSandTexture(prev => prev === "fine" ? "wet" : prev === "wet" ? "blue" : "fine");
  }, []);

  const handleItemLayerChange = useCallback((id: string, zLayer: number) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, zLayer } : item));
    send({ type: "item-layer-change", id, zLayer });
  }, [send]);

  // Emotion Thermometer handlers
  const handleThermometerAdd = useCallback((emotionLabel: string, intensity: number, bodyLocation: string | null, triggerNote: string | null) => {
    send({ type: "thermometer-reading-add", emotionLabel, intensity, bodyLocation, triggerNote });
    send({ type: "activity-pulse" });
  }, [send]);
  const handleThermometerRemove = useCallback((readingId: string) => {
    if (!isDemo) setThermometerReadings(prev => prev.filter(r => r.id !== readingId));
    send({ type: "thermometer-reading-remove", readingId });
  }, [send, isDemo]);
  const handleThermometerClear = useCallback(() => {
    send({ type: "thermometer-clear" });
    if (!isDemo) setThermometerReadings([]);
  }, [send, isDemo]);

  // Containment Box handlers
  const handleContainmentCreateContainer = useCallback((containerType: string) => {
    send({ type: "containment-container-create", containerType });
  }, [send]);
  const handleContainmentAddItem = useCallback((containerId: string, label: string, emoji: string | null, color: string | null) => {
    send({ type: "containment-item-add", containerId, label, emoji, color });
    send({ type: "activity-pulse" });
  }, [send]);
  const handleContainmentContainItem = useCallback((itemId: string) => {
    send({ type: "containment-item-contain", itemId });
  }, [send]);
  const handleContainmentDissolveItem = useCallback((itemId: string) => {
    send({ type: "containment-item-dissolve", itemId });
  }, [send]);
  const handleContainmentLock = useCallback((containerId: string, lockMethod: string, containmentStrength: number) => {
    send({ type: "containment-lock", containerId, lockMethod, containmentStrength });
  }, [send]);
  const handleContainmentUnlock = useCallback((containerId: string) => {
    send({ type: "containment-unlock", containerId });
  }, [send]);
  const handleContainmentClear = useCallback(() => {
    send({ type: "containment-clear" });
    if (!isDemo) { setContainmentContainers([]); setContainmentItems([]); }
  }, [send, isDemo]);

  // Body Scan handlers
  const handleBodyScanAdd = useCallback((bodyRegion: string, sensationType: string, intensity: number, emotionLink: string | null, breathReaches: boolean | null, movementImpulse: string | null, notes: string | null, color: string | null) => {
    send({ type: "body-scan-marker-add", bodyRegion, sensationType, intensity, emotionLink, breathReaches, movementImpulse, notes, color });
    send({ type: "activity-pulse" });
  }, [send]);
  const handleBodyScanUpdate = useCallback((markerId: string, fields: any) => {
    send({ type: "body-scan-marker-update", markerId, ...fields });
  }, [send]);
  const handleBodyScanRemove = useCallback((markerId: string) => {
    if (!isDemo) setBodyScanMarkers(prev => prev.filter(m => m.id !== markerId));
    send({ type: "body-scan-marker-remove", markerId });
  }, [send, isDemo]);
  const handleBodyScanClear = useCallback(() => {
    send({ type: "body-scan-clear" });
    if (!isDemo) setBodyScanMarkers([]);
  }, [send, isDemo]);

  // Gratitude Jar handlers
  const handleGratitudeAdd = useCallback((content: string, category: string, color: string, shape: string) => {
    send({ type: "gratitude-stone-add", content, category, color, shape });
    send({ type: "activity-pulse" });
  }, [send]);
  const handleGratitudeStar = useCallback((stoneId: string, isStarred: boolean) => {
    send({ type: "gratitude-stone-star", stoneId, isStarred });
  }, [send]);
  const handleGratitudeRemove = useCallback((stoneId: string) => {
    if (!isDemo) setGratitudeStones(prev => prev.filter(s => s.id !== stoneId));
    send({ type: "gratitude-stone-remove", stoneId });
  }, [send, isDemo]);
  const handleGratitudeClear = useCallback(() => {
    send({ type: "gratitude-clear" });
    if (!isDemo) setGratitudeStones([]);
  }, [send, isDemo]);

  // Fidget handler
  const handleFidgetInteraction = useCallback((widgetType: string, data: any) => {
    send({ type: "fidget-interaction", widgetType, data });
  }, [send]);

  // Safety Map handlers
  const handleSafetyAdd = useCallback((step: number, content: string, contactName: string | null, contactPhone: string | null, contactRelationship: string | null, orderIndex: number) => {
    send({ type: "safety-item-add", step, content, contactName, contactPhone, contactRelationship, orderIndex });
    send({ type: "activity-pulse" });
  }, [send]);
  const handleSafetyUpdate = useCallback((itemId: string, fields: any) => {
    send({ type: "safety-item-update", itemId, ...fields });
  }, [send]);
  const handleSafetyRemove = useCallback((itemId: string) => {
    if (!isDemo) setSafetyPlanItems(prev => prev.filter(i => i.id !== itemId));
    send({ type: "safety-item-remove", itemId });
  }, [send, isDemo]);
  const handleSafetyClear = useCallback(() => {
    send({ type: "safety-plan-clear" });
    if (!isDemo) setSafetyPlanItems([]);
  }, [send, isDemo]);

  // Worry Tree handlers
  const handleWorryCreate = useCallback((worryText: string, category: string | null) => {
    send({ type: "worry-entry-create", worryText, category });
    send({ type: "activity-pulse" });
  }, [send]);
  const handleWorryUpdate = useCallback((entryId: string, fields: any) => {
    send({ type: "worry-entry-update", entryId, ...fields });
  }, [send]);
  const handleWorryRemove = useCallback((entryId: string) => {
    if (!isDemo) setWorryTreeEntries(prev => prev.filter(e => e.id !== entryId));
    send({ type: "worry-entry-remove", entryId });
  }, [send, isDemo]);
  const handleWorryClear = useCallback(() => {
    send({ type: "worry-tree-clear" });
    if (!isDemo) setWorryTreeEntries([]);
  }, [send, isDemo]);

  // Thought Bridge handlers
  const handleThoughtBridgeCreate = useCallback((situation: string | null) => {
    send({ type: "thought-bridge-create", situation });
    send({ type: "activity-pulse" });
  }, [send]);
  const handleThoughtBridgeUpdate = useCallback((recordId: string, fields: any) => {
    send({ type: "thought-bridge-update", recordId, ...fields });
  }, [send]);
  const handleThoughtBridgeRemove = useCallback((recordId: string) => {
    if (!isDemo) { setThoughtBridgeRecords(prev => prev.filter(r => r.id !== recordId)); setThoughtBridgeEvidence(prev => prev.filter(e => e.recordId !== recordId)); }
    send({ type: "thought-bridge-remove", recordId });
  }, [send, isDemo]);
  const handleThoughtBridgeAddEvidence = useCallback((recordId: string, evidenceType: string, content: string, orderIndex: number) => {
    send({ type: "thought-bridge-evidence-add", recordId, evidenceType, content, orderIndex });
  }, [send]);
  const handleThoughtBridgeRemoveEvidence = useCallback((evidenceId: string) => {
    if (!isDemo) setThoughtBridgeEvidence(prev => prev.filter(e => e.id !== evidenceId));
    send({ type: "thought-bridge-evidence-remove", evidenceId });
  }, [send, isDemo]);
  const handleThoughtBridgeClear = useCallback(() => {
    send({ type: "thought-bridge-clear" });
    if (!isDemo) { setThoughtBridgeRecords([]); setThoughtBridgeEvidence([]); }
  }, [send, isDemo]);

  // Coping Toolbox handlers
  const handleCopingAdd = useCallback((name: string, description: string, category: string, emoji: string, isCustom?: boolean, difficulty?: string, isPinned?: boolean) => {
    send({ type: "coping-strategy-add", name, description, category, emoji, isCustom, difficulty, isPinned });
    send({ type: "activity-pulse" });
  }, [send]);
  const handleCopingUpdate = useCallback((strategyId: string, fields: any) => {
    send({ type: "coping-strategy-update", strategyId, ...fields });
  }, [send]);
  const handleCopingRemove = useCallback((strategyId: string) => {
    if (!isDemo) setCopingStrategies(prev => prev.filter(s => s.id !== strategyId));
    send({ type: "coping-strategy-remove", strategyId });
  }, [send, isDemo]);
  const handleCopingClear = useCallback(() => {
    send({ type: "coping-clear" });
    if (!isDemo) setCopingStrategies([]);
  }, [send, isDemo]);

  // DBT House handlers
  const handleDbtSkillPlace = useCallback((skillId: string, module: string, houseSection: string, personalExample?: string) => {
    send({ type: "dbt-skill-place", skillId, module, houseSection, personalExample });
    send({ type: "activity-pulse" });
  }, [send]);
  const handleDbtSkillUpdate = useCallback((skillPlacementId: string, fields: any) => {
    send({ type: "dbt-skill-update", skillPlacementId, ...fields });
  }, [send]);
  const handleDbtSkillRemove = useCallback((skillPlacementId: string) => {
    if (!isDemo) setDbtHouseSkills(prev => prev.filter(s => s.id !== skillPlacementId));
    send({ type: "dbt-skill-remove", skillPlacementId });
  }, [send, isDemo]);
  const handleDbtHouseClear = useCallback(() => {
    send({ type: "dbt-house-clear" });
    if (!isDemo) setDbtHouseSkills([]);
  }, [send, isDemo]);

  // Strengths Deck handlers
  const handleStrengthsPlace = useCallback((strengthId: string, tier: string, orderIndex: number, scenarioResponse: string | null) => {
    send({ type: "strengths-place", strengthId, tier, orderIndex, scenarioResponse });
    send({ type: "activity-pulse" });
  }, [send]);
  const handleStrengthsMove = useCallback((placementId: string, tier: string, orderIndex: number) => {
    send({ type: "strengths-move", placementId, tier, orderIndex });
  }, [send]);
  const handleStrengthsRemove = useCallback((placementId: string) => {
    if (!isDemo) setStrengthsPlacements(prev => prev.filter(p => p.id !== placementId));
    send({ type: "strengths-remove", placementId });
  }, [send, isDemo]);
  const handleStrengthsSpot = useCallback((strengthId: string, note: string) => {
    send({ type: "strengths-spot", strengthId, note });
  }, [send]);
  const handleStrengthsClear = useCallback(() => {
    send({ type: "strengths-clear" });
    if (!isDemo) { setStrengthsPlacements([]); setStrengthsSpottings([]); }
  }, [send, isDemo]);

  // Social Atom handlers
  const handleSocialAtomAddPerson = useCallback((name: string, role: string, emoji: string | null, color: string, distanceRing: number, angle: number, isDeceased: boolean, emotionalTone: string | null, notes: string | null) => {
    send({ type: "social-atom-person-add", name, role, emoji, color, distanceRing, angle, isDeceased, emotionalTone, notes });
    send({ type: "activity-pulse" });
  }, [send]);
  const handleSocialAtomMovePerson = useCallback((personId: string, distanceRing: number, angle: number) => {
    send({ type: "social-atom-person-move", personId, distanceRing, angle });
  }, [send]);
  const handleSocialAtomUpdatePerson = useCallback((personId: string, fields: any) => {
    send({ type: "social-atom-person-update", personId, ...fields });
  }, [send]);
  const handleSocialAtomRemovePerson = useCallback((personId: string) => {
    if (!isDemo) { setSocialAtomPeople(prev => prev.filter(p => p.id !== personId)); setSocialAtomConnections(prev => prev.filter(c => c.fromPersonId !== personId && c.toPersonId !== personId)); }
    send({ type: "social-atom-person-remove", personId });
  }, [send, isDemo]);
  const handleSocialAtomAddConnection = useCallback((fromPersonId: string, toPersonId: string, style: string, label: string | null, directionality: string) => {
    send({ type: "social-atom-connection-add", fromPersonId, toPersonId, style, label, directionality });
  }, [send]);
  const handleSocialAtomRemoveConnection = useCallback((connectionId: string) => {
    if (!isDemo) setSocialAtomConnections(prev => prev.filter(c => c.id !== connectionId));
    send({ type: "social-atom-connection-remove", connectionId });
  }, [send, isDemo]);
  const handleSocialAtomClear = useCallback(() => {
    send({ type: "social-atom-clear" });
    if (!isDemo) { setSocialAtomPeople([]); setSocialAtomConnections([]); }
  }, [send, isDemo]);

  // Growth Garden handlers
  const handleGardenAddPlant = useCallback((seedType: string, customName: string, category: string, gridX: number, gridY: number) => {
    send({ type: "garden-plant-add", seedType, customName, category, gridX, gridY });
    send({ type: "activity-pulse" });
  }, [send]);
  const handleGardenUpdatePlant = useCallback((plantId: string, fields: any) => {
    send({ type: "garden-plant-update", plantId, ...fields });
  }, [send]);
  const handleGardenRemovePlant = useCallback((plantId: string) => {
    if (!isDemo) setGardenPlants(prev => prev.filter(p => p.id !== plantId));
    send({ type: "garden-plant-remove", plantId });
  }, [send, isDemo]);
  const handleGardenAddJournal = useCallback((plantId: string, content: string, progressRating: string | null) => {
    send({ type: "garden-journal-add", plantId, content, progressRating });
  }, [send]);
  const handleGardenAddWeed = useCallback((label: string, linkedPlantId: string | null) => {
    send({ type: "garden-weed-add", label, linkedPlantId });
  }, [send]);
  const handleGardenPullWeed = useCallback((weedId: string) => {
    send({ type: "garden-weed-pull", weedId });
  }, [send]);
  const handleGardenClear = useCallback(() => {
    send({ type: "garden-clear" });
    if (!isDemo) { setGardenPlants([]); setGardenJournalEntries([]); setGardenWeeds([]); }
  }, [send, isDemo]);

  // Generic tool settings handler
  const handleToolSettingsUpdate = useCallback((toolId: string, updates: Record<string, any>) => {
    setToolSettings(prev => ({ ...prev, [toolId]: { ...(prev[toolId] || {}), ...updates } }));
    send({ type: "tool-settings-update", toolId, settings: updates });
  }, [send]);

  const handleEndSession = useCallback(async () => {
    if (!sessionId) return;
    setEndingSession(true);
    try {
      const supabase = await getSupabase();
      const { data: { session: sbSession } } = await supabase.auth.getSession();
      const token = sbSession?.access_token || "";
      const res = await fetch(`/api/therapy-sessions/${sessionId}/end`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        setSessionEnded(true);
      }
    } catch (err) {
      console.error("Failed to end session:", err);
    } finally {
      setEndingSession(false);
    }
  }, [sessionId]);

  // Snapshot export
  const handleSnapshot = useCallback(async () => {
    const el = toolAreaRef.current;
    if (!el) return;
    try {
      const { default: html2canvas } = await import("html2canvas");
      const captured = await html2canvas(el, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const scale = 2;
      const barHeight = 40 * scale;
      const watermarked = document.createElement("canvas");
      watermarked.width = captured.width;
      watermarked.height = captured.height + barHeight;
      const ctx = watermarked.getContext("2d")!;

      ctx.drawImage(captured, 0, 0);

      ctx.fillStyle = "rgba(27, 42, 74, 0.9)";
      ctx.fillRect(0, captured.height, watermarked.width, barHeight);

      const now = new Date();
      const formattedDate = now.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }) + " at " + now.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      const sessionName = session?.name || "Untitled";
      const toolName = toolDisplayName(activeTool);
      const watermarkText = `ClinicalPlay.app  |  Session: ${sessionName}  |  ${formattedDate}  |  Tool: ${toolName}`;

      ctx.fillStyle = "#FFFFFF";
      ctx.font = `${12 * scale}px sans-serif`;
      ctx.textBaseline = "middle";
      ctx.fillText(watermarkText, 16 * scale, captured.height + barHeight / 2);

      const link = document.createElement("a");
      link.download = `ClinicalPlay_${activeTool}_${now.toISOString().slice(0,10)}.png`;
      link.href = watermarked.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Snapshot failed:", err);
    }
  }, [activeTool, session]);


  return (
    <div className="h-screen w-full bg-background overflow-hidden flex flex-col font-sans">
      {/* Header */}
      <AnimatePresence>
      {!zenMode && (
      <motion.header
        className="h-14 md:h-16 bg-white/60 backdrop-blur-xl border-b border-white/20 flex items-center justify-between px-4 z-20 shrink-0"
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -60, opacity: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <button className="p-2 hover:bg-secondary rounded-full transition-colors cursor-pointer" data-testid="button-back">
              <ChevronRight className="rotate-180 text-muted-foreground" size={20} />
            </button>
          </Link>
          <div>
            <h1 className="font-serif text-base md:text-lg text-primary leading-tight flex items-center gap-2">
              {session?.name || `Session ${id}`}
              {isCanvasLocked && (
                <span className="inline-flex items-center gap-1 text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">
                  Locked
                </span>
              )}
            </h1>
            <div className="flex items-center gap-2">
              <span className={cn("w-2 h-2 rounded-full", connected ? "bg-green-500 animate-pulse" : "bg-red-400")} />
              <span className="text-[11px] text-muted-foreground">
                {connected ? "Synced" : "Connecting..."}
                {onlineUsers.length > 0 && ` · ${onlineUsers.length} online`}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 md:gap-2">
          {session?.inviteCode && (
            <motion.button
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/join/${session.inviteCode}`);
                setInviteCopied(true);
                setTimeout(() => setInviteCopied(false), 2000);
              }}
              className="flex items-center gap-2 bg-accent/10 text-accent px-3 py-1.5 rounded-full text-xs font-mono font-bold border border-accent/20 cursor-pointer hover:bg-accent/15 transition-colors"
              whileTap={{ scale: 0.95 }}
              title="Copy invite link"
              data-tour="playroom-invite-code"
            >
              <AnimatePresence mode="wait">
                {inviteCopied ? (
                  <motion.span
                    key="copied"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-1.5"
                  >
                    <Check size={12} className="text-green-600" />
                    <span className="text-green-600">Copied</span>
                  </motion.span>
                ) : (
                  <motion.span
                    key="code"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-1.5"
                  >
                    <Copy size={11} />
                    {session.inviteCode}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          )}

          {isClinician && (
            <>
              <div className="hidden lg:flex items-center gap-2 bg-accent/5 px-3 py-1.5 rounded-full border border-accent/20">
                <Shield size={12} className="text-accent fill-accent/20" />
                <span className="text-xs font-medium text-accent">Clinician</span>
              </div>
              {subscriptionType === "founding" && (
                <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-100 to-yellow-50 border border-amber-200/60 shadow-sm shadow-amber-100/50" data-testid="badge-playroom-founding">
                  <Crown size={11} className="text-amber-600" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Founder</span>
                </div>
              )}

              <motion.button
                onClick={handleSnapshot}
                className="p-2.5 rounded-xl text-muted-foreground hover:text-primary hover:bg-secondary/50 transition-colors cursor-pointer"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                data-testid="button-snapshot"
                title="Export Session Summary"
              >
                <Camera size={20} />
              </motion.button>

              <motion.button
                onClick={() => setToolSelectorOpen(true)}
                className="p-2.5 rounded-xl text-primary hover:bg-secondary/50 transition-colors cursor-pointer"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                data-testid="button-open-tool-selector"
                title="Clinical Tools"
              >
                <Wrench size={20} />
              </motion.button>
            </>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <button className="md:hidden p-2 text-primary hover:bg-secondary rounded-xl transition-colors relative cursor-pointer" data-testid="button-mobile-participants">
                <Users size={20} />
                <AnimatePresence>
                  {onlineUsers.length > 0 && (
                    <motion.span
                      key={onlineUsers.length}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                      className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-accent text-white text-[9px] font-bold rounded-full flex items-center justify-center"
                    >
                      {onlineUsers.length}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[60vh] rounded-t-3xl">
              <SheetHeader className="mb-6">
                <SheetTitle className="font-serif text-xl text-primary text-left">Participants</SheetTitle>
              </SheetHeader>
              <div className="space-y-3">
                {onlineUsers.map(u => {
                  const isDisconnected = u.status === "disconnected";
                  const isActive = !isDisconnected && u.lastActive && (Date.now() - u.lastActive < 5000);
                  return (
                    <div key={u.participantId} className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/30 transition-colors">
                      <div className="relative">
                        <Avatar className="h-11 w-11 border-2 border-white shadow-sm">
                          <AvatarFallback className={cn("bg-secondary text-primary", isAnonymous && "bg-neutral-200")}>
                            {isAnonymous ? <Ghost size={18} className="text-muted-foreground" /> : u.displayName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className={cn(
                          "absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full",
                          isDisconnected ? "bg-red-500" : isActive ? "bg-accent animate-pulse" : "bg-green-500"
                        )} />
                      </div>
                      <div>
                        <div className="font-medium text-primary text-sm flex items-center gap-2">
                          {isAnonymous ? "Anonymous" : u.displayName}
                          {u.displayName.startsWith("Dr") && <Shield size={12} className="text-accent fill-accent/20" />}
                        </div>
                        <div className={cn("text-xs", isDisconnected ? "text-red-500 font-medium" : isActive ? "text-accent font-medium" : "text-green-600")}>
                          {isDisconnected ? "Disconnected" : isActive ? "Active" : "Online"}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {onlineUsers.length === 0 && (
                  <p className="text-muted-foreground text-sm text-center py-8">No other participants yet</p>
                )}
              </div>
            </SheetContent>
          </Sheet>

          <motion.button
            onClick={() => setToolsOpen(!toolsOpen)}
            className={cn("p-2 rounded-xl transition-colors cursor-pointer hidden md:block", toolsOpen ? "bg-primary text-white" : "text-muted-foreground hover:bg-secondary")}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            data-testid="button-toggle-tools"
          >
            <motion.div
              animate={{ rotate: toolsOpen ? 180 : 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <PanelRightClose size={20} />
            </motion.div>
          </motion.button>
          {isClinician && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  className="p-2 text-destructive hover:bg-destructive/10 rounded-xl transition-colors cursor-pointer"
                  data-testid="button-end-session"
                  title="End Session"
                  disabled={endingSession}
                >
                  <Square size={18} className="fill-destructive/20" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-white/95 backdrop-blur-xl border border-white/30 shadow-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-serif text-primary">End This Session?</AlertDialogTitle>
                  <AlertDialogDescription className="text-muted-foreground leading-relaxed">
                    This will end the session for all participants. Everyone will be disconnected and the session will be marked as complete. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleEndSession}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
                    disabled={endingSession}
                    data-testid="button-confirm-end-session"
                  >
                    {endingSession ? "Ending..." : "End Session"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Link href="/dashboard">
            <motion.button
              className="p-2 text-muted-foreground hover:bg-secondary rounded-xl transition-colors cursor-pointer"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              data-testid="button-leave"
            >
              <LogOut size={18} />
            </motion.button>
          </Link>
        </div>
      </motion.header>
      )}
      </AnimatePresence>

      <AnimatePresence>
      {!zenMode && isDemo && (
        <div className="bg-amber-50 border-b border-amber-200/60 px-4 py-2 flex items-center justify-center gap-3 shrink-0 z-20" data-testid="banner-demo-mode">
          <span className="text-xs text-amber-700 font-medium">Demo Mode — changes won't be saved</span>
          <Link href="/dashboard" className="no-underline">
            <span className="text-xs text-accent font-semibold hover:text-accent/80 transition-colors cursor-pointer underline underline-offset-2" data-testid="link-start-real-session">
              Start a Real Session
            </span>
          </Link>
        </div>
      )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* Tool Area */}
        <div className="flex-1 relative overflow-hidden" ref={toolAreaRef}>
          <AnimatePresence mode="wait">
            {activeTool === "sandtray" && (
              <motion.div
                key="sandtray"
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <ZenCanvas
                  items={items}
                  isLocked={isCanvasLocked && !isClinician}
                  isAnonymous={isAnonymous}
                  remoteCursors={remoteCursors}
                  onItemMove={handleItemMove}
                  onItemDrop={handleItemDrop}
                  onItemRemove={handleItemRemove}
                  onItemTransform={handleItemTransform}
                  onItemLayerChange={handleItemLayerChange}
                  onCursorMove={handleCursorMove}
                  lightSource={lightSource}
                  rakePaths={rakePaths}
                  zenMode={zenMode}
                  sandTexture={sandTexture}
                  digMode={digMode}
                  onLightSourceUpdate={handleLightSourceUpdate}
                  onRakePathAdd={handleRakePathAdd}
                  onRakePathClear={handleRakePathClear}
                />
                {!zenMode && (
                  <AssetLibrary
                    isOpen={assetLibraryOpen}
                    onToggle={() => setAssetLibraryOpen(!assetLibraryOpen)}
                    disabled={isCanvasLocked && !isClinician}
                    onTapPlace={handleTapPlace}
                  />
                )}
              </motion.div>
            )}

            {activeTool === "breathing" && (
              <motion.div
                key="breathing"
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <BreathingGuide
                  isActive={breathingActive}
                  isClinician={isClinician}
                  onToggle={handleToggleBreathing}
                  startTime={breathingStartTime}
                  techniqueId={breathingTechnique}
                  onTechniqueChange={handleBreathingTechniqueChange}
                  toolSettings={toolSettings["breathing"]}
                  onSettingsUpdate={(u) => handleToolSettingsUpdate("breathing", u)}
                />
              </motion.div>
            )}

            {activeTool === "feelings" && (
              <motion.div
                key="feelings"
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <FeelingWheelSVG
                  selections={feelingSelections}
                  onSelect={handleFeelingSelect}
                  onClear={handleFeelingClear}
                  isClinician={isClinician}
                  toolSettings={toolSettings["feelings"]}
                  onSettingsUpdate={(u) => handleToolSettingsUpdate("feelings", u)}
                />
              </motion.div>
            )}

            {activeTool === "narrative" && (
              <motion.div
                key="narrative"
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <NarrativeTimeline
                  events={timelineEvents}
                  onAddEvent={handleTimelineAdd}
                  onRemoveEvent={handleTimelineRemove}
                  onUpdateEvent={handleTimelineUpdate}
                  onClear={handleTimelineClear}
                  isClinician={isClinician}
                  toolSettings={toolSettings["narrative"]}
                  onSettingsUpdate={(u) => handleToolSettingsUpdate("narrative", u)}
                />
              </motion.div>
            )}

            {activeTool === "values-sort" && (
              <motion.div
                key="values-sort"
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <ValuesCardSort
                  placements={valuesCards}
                  onPlaceCard={handleValuesPlace}
                  onMoveCard={handleValuesMove}
                  onRemoveCard={handleValuesRemove}
                  onClear={handleValuesClear}
                  isClinician={isClinician}
                  toolSettings={toolSettings["values-sort"]}
                  onSettingsUpdate={(u) => handleToolSettingsUpdate("values-sort", u)}
                />
              </motion.div>
            )}

            {activeTool === "parts-theater" && (
              <motion.div
                key="parts-theater"
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <PartsTheater
                  parts={theaterParts}
                  connections={theaterConnections}
                  theaterSettings={theaterSettings}
                  isClinician={isClinician}
                  onAddPart={handleTheaterAddPart}
                  onMovePart={handleTheaterMovePart}
                  onUpdatePart={handleTheaterUpdatePart}
                  onRemovePart={handleTheaterRemovePart}
                  onAddConnection={handleTheaterAddConnection}
                  onRemoveConnection={handleTheaterRemoveConnection}
                  onClear={handleTheaterClear}
                  onUpdateSettings={handleTheaterSettingsUpdate}
                />
              </motion.div>
            )}

            {activeTool === "emotion-thermometer" && (
              <motion.div key="emotion-thermometer" className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2, ease: "easeOut" }}>
                <EmotionThermometer readings={thermometerReadings} onAddReading={handleThermometerAdd} onRemoveReading={handleThermometerRemove} onClear={handleThermometerClear} isClinician={isClinician} toolSettings={toolSettings["emotion-thermometer"]} onSettingsUpdate={(u) => handleToolSettingsUpdate("emotion-thermometer", u)} />
              </motion.div>
            )}

            {activeTool === "containment-box" && (
              <motion.div key="containment-box" className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2, ease: "easeOut" }}>
                <ContainmentBox containers={containmentContainers} items={containmentItems} onCreateContainer={handleContainmentCreateContainer} onAddItem={handleContainmentAddItem} onContainItem={handleContainmentContainItem} onDissolveItem={handleContainmentDissolveItem} onLock={handleContainmentLock} onUnlock={handleContainmentUnlock} onClear={handleContainmentClear} isClinician={isClinician} toolSettings={toolSettings["containment-box"]} onSettingsUpdate={(u) => handleToolSettingsUpdate("containment-box", u)} />
              </motion.div>
            )}

            {activeTool === "body-scan" && (
              <motion.div key="body-scan" className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2, ease: "easeOut" }}>
                <BodyScanMap markers={bodyScanMarkers} onAddMarker={handleBodyScanAdd} onUpdateMarker={handleBodyScanUpdate} onRemoveMarker={handleBodyScanRemove} onClear={handleBodyScanClear} isClinician={isClinician} toolSettings={toolSettings["body-scan"]} onSettingsUpdate={(u) => handleToolSettingsUpdate("body-scan", u)} />
              </motion.div>
            )}

            {activeTool === "gratitude-jar" && (
              <motion.div key="gratitude-jar" className="absolute inset-0 overflow-y-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2, ease: "easeOut" }}>
                <div className="p-4 flex items-start justify-center min-h-full">
                  <GratitudeJar stones={gratitudeStones} onAddStone={handleGratitudeAdd} onStarStone={handleGratitudeStar} onRemoveStone={handleGratitudeRemove} onClear={handleGratitudeClear} isClinician={isClinician} toolSettings={toolSettings["gratitude-jar"]} onSettingsUpdate={(u) => handleToolSettingsUpdate("gratitude-jar", u)} />
                </div>
              </motion.div>
            )}

            {activeTool === "fidget-tools" && (
              <motion.div key="fidget-tools" className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2, ease: "easeOut" }}>
                <FidgetTools onInteraction={handleFidgetInteraction} isClinician={isClinician} toolSettings={toolSettings["fidget-tools"]} onSettingsUpdate={(u) => handleToolSettingsUpdate("fidget-tools", u)} />
              </motion.div>
            )}

            {activeTool === "safety-map" && (
              <motion.div key="safety-map" className="absolute inset-0 overflow-y-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2, ease: "easeOut" }}>
                <SafetyMap items={safetyPlanItems} onAddItem={handleSafetyAdd} onUpdateItem={handleSafetyUpdate} onRemoveItem={handleSafetyRemove} onClear={handleSafetyClear} isClinician={isClinician} toolSettings={toolSettings["safety-map"]} onSettingsUpdate={(u) => handleToolSettingsUpdate("safety-map", u)} />
              </motion.div>
            )}

            {activeTool === "worry-tree" && (
              <motion.div key="worry-tree" className="absolute inset-0 overflow-y-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2, ease: "easeOut" }}>
                <WorryTree entries={worryTreeEntries} onCreateEntry={handleWorryCreate} onUpdateEntry={handleWorryUpdate} onRemoveEntry={handleWorryRemove} onClear={handleWorryClear} isClinician={isClinician} toolSettings={toolSettings["worry-tree"]} onSettingsUpdate={(u) => handleToolSettingsUpdate("worry-tree", u)} />
              </motion.div>
            )}

            {activeTool === "thought-bridge" && (
              <motion.div key="thought-bridge" className="absolute inset-0 overflow-y-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2, ease: "easeOut" }}>
                <ThoughtBridge records={thoughtBridgeRecords} evidence={thoughtBridgeEvidence} onCreateRecord={handleThoughtBridgeCreate} onUpdateRecord={handleThoughtBridgeUpdate} onRemoveRecord={handleThoughtBridgeRemove} onAddEvidence={handleThoughtBridgeAddEvidence} onRemoveEvidence={handleThoughtBridgeRemoveEvidence} onClear={handleThoughtBridgeClear} isClinician={isClinician} toolSettings={toolSettings["thought-bridge"]} onSettingsUpdate={(u) => handleToolSettingsUpdate("thought-bridge", u)} />
              </motion.div>
            )}

            {activeTool === "coping-toolbox" && (
              <motion.div key="coping-toolbox" className="absolute inset-0 overflow-y-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2, ease: "easeOut" }}>
                <CopingToolbox strategies={copingStrategies} onAddStrategy={handleCopingAdd} onUpdateStrategy={handleCopingUpdate} onRemoveStrategy={handleCopingRemove} onClear={handleCopingClear} isClinician={isClinician} toolSettings={toolSettings["coping-toolbox"]} onSettingsUpdate={(u) => handleToolSettingsUpdate("coping-toolbox", u)} />
              </motion.div>
            )}

            {activeTool === "dbt-house" && (
              <motion.div key="dbt-house" className="absolute inset-0 overflow-y-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2, ease: "easeOut" }}>
                <DbtHouse skills={dbtHouseSkills} onPlaceSkill={handleDbtSkillPlace} onUpdateSkill={handleDbtSkillUpdate} onRemoveSkill={handleDbtSkillRemove} onClear={handleDbtHouseClear} isClinician={isClinician} toolSettings={toolSettings["dbt-house"]} onSettingsUpdate={(u) => handleToolSettingsUpdate("dbt-house", u)} />
              </motion.div>
            )}

            {activeTool === "strengths-deck" && (
              <motion.div key="strengths-deck" className="absolute inset-0 overflow-y-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2, ease: "easeOut" }}>
                <StrengthsDeck placements={strengthsPlacements} spottings={strengthsSpottings} onPlace={handleStrengthsPlace} onMove={handleStrengthsMove} onRemove={handleStrengthsRemove} onSpot={handleStrengthsSpot} onClear={handleStrengthsClear} isClinician={isClinician} toolSettings={toolSettings["strengths-deck"]} onSettingsUpdate={(u) => handleToolSettingsUpdate("strengths-deck", u)} />
              </motion.div>
            )}

            {activeTool === "social-atom" && (
              <motion.div key="social-atom" className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2, ease: "easeOut" }}>
                <SocialAtom people={socialAtomPeople} connections={socialAtomConnections} onAddPerson={handleSocialAtomAddPerson} onMovePerson={handleSocialAtomMovePerson} onUpdatePerson={handleSocialAtomUpdatePerson} onRemovePerson={handleSocialAtomRemovePerson} onAddConnection={handleSocialAtomAddConnection} onRemoveConnection={handleSocialAtomRemoveConnection} onClear={handleSocialAtomClear} isClinician={isClinician} toolSettings={toolSettings["social-atom"]} onSettingsUpdate={(u) => handleToolSettingsUpdate("social-atom", u)} />
              </motion.div>
            )}

            {activeTool === "growth-garden" && (
              <motion.div key="growth-garden" className="absolute inset-0 overflow-y-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2, ease: "easeOut" }}>
                <GrowthGarden plants={gardenPlants} journalEntries={gardenJournalEntries} weeds={gardenWeeds} onAddPlant={handleGardenAddPlant} onUpdatePlant={handleGardenUpdatePlant} onRemovePlant={handleGardenRemovePlant} onAddJournalEntry={handleGardenAddJournal} onAddWeed={handleGardenAddWeed} onPullWeed={handleGardenPullWeed} onClear={handleGardenClear} isClinician={isClinician} toolSettings={toolSettings["growth-garden"]} onSettingsUpdate={(u) => handleToolSettingsUpdate("growth-garden", u)} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tool Transition Label */}
          <AnimatePresence>
            {toolTransitionLabel && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
              >
                <div className="bg-white/70 backdrop-blur-xl px-8 py-4 rounded-2xl shadow-xl border border-white/30">
                  <p className="font-serif text-lg text-primary tracking-tight">{toolTransitionLabel}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Moderator Bar — only on sandtray, hidden in zen mode */}
          <AnimatePresence>
            {isClinician && activeTool === "sandtray" && !zenMode && (
              <ModeratorBar
                isCanvasLocked={isCanvasLocked}
                isAnonymous={isAnonymous}
                onToggleLock={handleToggleLock}
                onToggleAnonymity={handleToggleAnonymity}
                onClearCanvas={handleClearCanvas}
                participantCount={onlineUsers.length}
                lightTemperature={lightSource.temperature}
                onLightTemperatureChange={handleLightTemperatureChange}
                rakeMode={rakeMode}
                onToggleRakeMode={handleToggleRakeMode}
                zenMode={zenMode}
                onToggleZenMode={handleZenModeToggle}
                sandTexture={sandTexture}
                onCycleSandTexture={handleCycleSandTexture}
                digMode={digMode}
                onToggleDigMode={handleToggleDigMode}
              />
            )}
          </AnimatePresence>

          {/* Clinical Insights — clinician only */}
          {isClinician && (
            <ClinicalInsights
              isOpen={insightsOpen}
              onToggle={() => setInsightsOpen(!insightsOpen)}
              activeTool={activeTool}
              sessionContext={{
                latestEmotion: feelingSelections.length > 0
                  ? feelingSelections[feelingSelections.length - 1].primaryEmotion
                  : undefined,
                itemCount: items.length,
                timelineEventCount: timelineEvents.length,
                valuesCardCount: valuesCards.length,
              }}
            />
          )}
        </div>

        {/* Tools Sidebar (Desktop) — hidden in zen mode */}
        <AnimatePresence>
          {toolsOpen && !zenMode && (
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-72 bg-white/60 backdrop-blur-2xl border-l border-white/20 shadow-2xl z-30 hidden md:flex flex-col"
            >
              <div className="p-5 border-b border-white/20">
                <h2 className="font-serif text-primary text-lg">Session Panel</h2>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 px-1">
                  Online ({onlineUsers.length})
                </h3>
                <div className="space-y-2">
                  {onlineUsers.map(u => {
                    const isDisconnected = u.status === "disconnected";
                    const isActive = !isDisconnected && u.lastActive && (Date.now() - u.lastActive < 5000);
                    return (
                      <div key={u.participantId} className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-white/50 transition-colors">
                        <div className="relative">
                          <Avatar className="h-9 w-9 border border-white shadow-sm">
                            <AvatarFallback className={cn("bg-secondary text-primary text-xs", isAnonymous && "bg-neutral-200")}>
                              {isAnonymous ? <Ghost size={13} className="text-muted-foreground" /> : u.displayName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className={cn(
                            "absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-white rounded-full",
                            isDisconnected ? "bg-red-500" : isActive ? "bg-accent animate-pulse" : "bg-green-500"
                          )} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-primary truncate block">
                            {isAnonymous ? "Anonymous" : u.displayName}
                          </span>
                          <span className={cn("text-[10px]", isDisconnected ? "text-red-500 font-medium" : isActive ? "text-accent" : "text-green-600")}>
                            {isDisconnected ? "Disconnected" : isActive ? "Active" : "Online"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {onlineUsers.length === 0 && (
                    <p className="text-muted-foreground text-xs text-center py-4">Waiting for participants...</p>
                  )}
                </div>

                {session?.inviteCode && (
                  <div className="mt-4 p-4 rounded-2xl bg-accent/5 border border-accent/20">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-accent mb-1">Invite Code</p>
                    <p className="text-lg font-mono font-bold text-primary tracking-widest" data-testid="text-invite-code">{session.inviteCode}</p>
                  </div>
                )}

                <div className="mt-4 p-4 rounded-2xl bg-white/40">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-2">Active Tool</p>
                  <p className="text-sm font-medium text-primary">{toolDisplayName(activeTool)}</p>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* Tool Selector Modal */}
      <ToolSelector
        isOpen={toolSelectorOpen}
        onClose={() => setToolSelectorOpen(false)}
        activeTool={activeTool}
        onSelectTool={handleSelectTool}
      />

      {/* User Joined Notification */}
      <AnimatePresence>
        {joinNotification && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="bg-white/80 backdrop-blur-xl px-5 py-2.5 rounded-full shadow-xl text-primary text-sm font-medium border border-white/30 flex items-center gap-2">
              <motion.span
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ duration: 0.6 }}
                className="w-2 h-2 rounded-full bg-accent inline-block"
              />
              {joinNotification} joined
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isClinician && playroomTourSteps.length > 0 && (
        <GuidedTour
          steps={playroomTourSteps}
          tourKey="playroom"
          isActive={playroomTour.isActive}
          onComplete={playroomTour.complete}
          onSkip={playroomTour.skip}
        />
      )}

      {/* Connection Status — zen mode indicator */}
      <ConnectionStatus connected={connected} zenMode={zenMode} sessionEnded={sessionEnded} />

      {/* Session Ended Overlay */}
      <AnimatePresence>
        {sessionEnded && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(20px)" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[100] bg-background/95 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20, filter: "blur(6px)" }}
              animate={{ scale: 1, opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="text-center max-w-lg mx-auto px-6 w-full"
            >
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 300, damping: 20 }}
                className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[#2E8B57]/5 border border-[#2E8B57]/10 flex items-center justify-center"
              >
                <CheckCircle2 size={32} className="text-[#2E8B57]" />
              </motion.div>
              <h2 className="font-serif text-2xl text-primary mb-2" data-testid="text-session-complete">Session Complete</h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                {isClinician
                  ? "The session has been ended successfully. All participants have been disconnected."
                  : "This session has ended. Thank you for participating."}
              </p>

              <GlassCard hoverEffect={false} className="text-left p-5 mb-6" data-testid="card-session-summary">
                <h3 className="font-serif text-sm font-semibold text-primary mb-3">Session Summary</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Shield size={14} className="text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Session Name</p>
                      <p className="text-sm font-medium text-primary" data-testid="text-session-name">{session?.name || "Untitled Session"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock size={14} className="text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Date & Time</p>
                      <p className="text-sm font-medium text-primary" data-testid="text-session-datetime">
                        {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        {" at "}
                        {new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Wrench size={14} className="text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Tools Used</p>
                      <div className="flex flex-wrap gap-1.5 mt-1" data-testid="text-tools-used">
                        {Array.from(toolsUsed.current).map(tool => (
                          <span key={tool} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-accent/10 text-accent border border-accent/20">
                            {toolDisplayName(tool)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users size={14} className="text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Participants</p>
                      <p className="text-sm font-medium text-primary" data-testid="text-participant-count">
                        {peakParticipants.current > 0 ? `${peakParticipants.current} (peak)` : "No participants joined"}
                      </p>
                    </div>
                  </div>
                </div>
              </GlassCard>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
                {isClinician && (
                  <button
                    onClick={handleSnapshot}
                    className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 text-primary px-6 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer w-full sm:w-auto justify-center"
                    data-testid="button-save-snapshot"
                  >
                    <Download size={16} />
                    Save Snapshot
                  </button>
                )}
                <button
                  onClick={() => navigate(isClinician ? "/dashboard" : "/")}
                  className="btn-luxury bg-gradient-to-r from-[#2E8B57] to-[#236B43] text-white border border-[#D4AF37]/30 px-8 py-3 rounded-xl text-sm font-medium shadow-lg cursor-pointer w-full sm:w-auto"
                  data-testid="button-session-ended-navigate"
                >
                  {isClinician ? "Back to Dashboard" : "Return Home"}
                </button>
              </div>

              {isClinician && (
                <p className="text-xs text-muted-foreground/70 italic" data-testid="text-ehr-reminder">
                  Don't forget to save your session notes to your EHR system.
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
