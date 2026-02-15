import { useState, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { playRippleSound } from "@/lib/audio-feedback";
import { Plus, X, Trash2, RotateCcw, Hash, MessageSquare, Check, Pencil, Star } from "lucide-react";
import { ClinicianToolbar, type ToolbarControl } from "./clinician-toolbar";

function lightenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, ((num >> 16) & 0xff) + Math.round(255 * percent / 100));
  const g = Math.min(255, ((num >> 8) & 0xff) + Math.round(255 * percent / 100));
  const b = Math.min(255, (num & 0xff) + Math.round(255 * percent / 100));
  return `rgb(${r},${g},${b})`;
}

function darkenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, ((num >> 16) & 0xff) - Math.round(255 * percent / 100));
  const g = Math.max(0, ((num >> 8) & 0xff) - Math.round(255 * percent / 100));
  const b = Math.max(0, (num & 0xff) - Math.round(255 * percent / 100));
  return `rgb(${r},${g},${b})`;
}

// ─── Emotion Tags ──────────────────────────────────────────────────────────────

interface EmotionTag {
  emoji: string;
  label: string;
  color: string;
  value: number; // 0-1 scale for arc visualization
}

const EMOTION_TAGS: EmotionTag[] = [
  { emoji: "\u{1F60A}", label: "Happy", color: "#4CAF50", value: 0.85 },
  { emoji: "\u{1F622}", label: "Sad", color: "#5C6BC0", value: 0.25 },
  { emoji: "\u{1F621}", label: "Angry", color: "#E53935", value: 0.3 },
  { emoji: "\u{1F628}", label: "Scared", color: "#7E57C2", value: 0.2 },
  { emoji: "\u{1F4AA}", label: "Strong", color: "#FF9800", value: 0.9 },
  { emoji: "\u{1F31F}", label: "Proud", color: "#FFC107", value: 0.95 },
];

function getEmotionByEmoji(emoji: string): EmotionTag | undefined {
  return EMOTION_TAGS.find(e => e.emoji === emoji);
}

function emotionColorForSegment(fromEmotion: string | null, toEmotion: string | null): string {
  const from = fromEmotion ? getEmotionByEmoji(fromEmotion) : null;
  const to = toEmotion ? getEmotionByEmoji(toEmotion) : null;
  if (from && to) {
    // Blend colors
    const avg = (from.value + to.value) / 2;
    if (avg > 0.7) return "rgba(76,175,80,0.5)";
    if (avg > 0.4) return "rgba(255,152,0,0.4)";
    return "rgba(229,57,53,0.35)";
  }
  if (from) return from.color + "50";
  if (to) return to.color + "50";
  return "rgba(91,143,161,0.3)";
}

// ─── Chapter System ────────────────────────────────────────────────────────────

interface Chapter {
  id: string;
  name: string;
  startPosition: number;
  endPosition: number;
  color: string;
}

const CHAPTER_COLORS = [
  "rgba(168,197,160,0.25)",
  "rgba(201,169,110,0.25)",
  "rgba(123,143,161,0.25)",
  "rgba(232,180,188,0.25)",
  "rgba(157,181,178,0.25)",
  "rgba(27,42,74,0.15)",
];

function autoSuggestChapters(events: TimelineEventData[]): Chapter[] {
  if (events.length < 2) return [];
  const sorted = [...events].sort((a, b) => a.position - b.position);
  const chapters: Chapter[] = [];

  // Cluster events by proximity gaps
  let currentCluster: TimelineEventData[] = [sorted[0]];
  const clusters: TimelineEventData[][] = [];

  for (let i = 1; i < sorted.length; i++) {
    const gap = sorted[i].position - sorted[i - 1].position;
    if (gap > 0.2 && currentCluster.length >= 1) {
      clusters.push([...currentCluster]);
      currentCluster = [sorted[i]];
    } else {
      currentCluster.push(sorted[i]);
    }
  }
  clusters.push(currentCluster);

  // Generate chapter names based on position
  const chapterNames = ["Early Beginnings", "Rising Action", "Middle Chapter", "Turning Point", "Recent Times", "Current Chapter"];

  clusters.forEach((cluster, i) => {
    const start = Math.max(0, cluster[0].position - 0.02);
    const end = Math.min(1, cluster[cluster.length - 1].position + 0.02);
    const positionFraction = (start + end) / 2;

    let name: string;
    if (positionFraction < 0.2) name = "Early Childhood";
    else if (positionFraction < 0.35) name = "Growing Up";
    else if (positionFraction < 0.5) name = "High School";
    else if (positionFraction < 0.65) name = "Young Adult";
    else if (positionFraction < 0.8) name = "Finding My Way";
    else name = "Recent Times";

    // If there are more clusters than position-based names cover well, use index fallback
    if (clusters.length > 3) {
      name = chapterNames[Math.min(i, chapterNames.length - 1)];
    }

    chapters.push({
      id: `chapter-${i}`,
      name,
      startPosition: start,
      endPosition: end,
      color: CHAPTER_COLORS[i % CHAPTER_COLORS.length],
    });
  });

  return chapters;
}

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface TimelineEventData {
  id: string;
  label: string;
  description: string | null;
  position: number;
  color: string;
  placedBy: string | null;
  emotion?: string | null;
  reflection?: string | null;
}

interface NarrativeTimelineProps {
  events: TimelineEventData[];
  onAddEvent: (label: string, description: string | null, position: number, color: string) => void;
  onRemoveEvent: (eventId: string) => void;
  onUpdateEvent: (eventId: string, label: string, description: string | null, position: number, color: string) => void;
  onClear: () => void;
  isClinician: boolean;
  toolSettings?: Record<string, any>;
  onSettingsUpdate?: (updates: Record<string, any>) => void;
}

// ─── Clinician Settings ────────────────────────────────────────────────────────

interface NarrativeTimelineSettings {
  maxEvents: number;
  showPrompts: boolean;
}

const DEFAULT_NARRATIVE_TIMELINE_SETTINGS: NarrativeTimelineSettings = {
  maxEvents: 0,
  showPrompts: true,
};

const NARRATIVE_TIMELINE_TOOLBAR_CONTROLS: ToolbarControl[] = [
  {
    type: "number",
    key: "maxEvents",
    icon: Hash,
    label: "Max Events",
    steps: [0, 5, 10, 15, 20],
    activeColor: "amber",
  },
  {
    type: "toggle",
    key: "showPrompts",
    icon: MessageSquare,
    label: "Prompts",
    activeColor: "sky",
  },
];

const STONE_COLORS = ["#1B2A4A", "#A8C5A0", "#C9A96E", "#7B8FA1", "#E8B4BC", "#9DB5B2"];

// Floating leaf/nature elements along the river
function FloatingElements() {
  const elements = useMemo(() =>
    Array.from({ length: 6 }, (_, i) => ({
      id: i,
      startX: -5 + Math.random() * 10,
      y: 80 + (Math.random() - 0.5) * 40,
      duration: 18 + Math.random() * 12,
      delay: i * 3.5,
      size: 8 + Math.random() * 6,
      opacity: 0.15 + Math.random() * 0.15,
      symbol: ['\u{1F343}', '\u{1F342}', '\u{1F33F}', '\u{1FAA8}', '\u{2728}', '\u{1F4A7}'][i],
    })), []);

  return (
    <>
      {elements.map((el) => (
        <motion.div
          key={el.id}
          className="absolute pointer-events-none select-none"
          style={{
            top: `${el.y}%`,
            fontSize: el.size,
            opacity: el.opacity,
          }}
          animate={{
            left: [`${el.startX}%`, '105%'],
            y: [0, -10, 5, -8, 0],
            rotate: [0, 15, -10, 20, 0],
          }}
          transition={{
            left: { duration: el.duration, repeat: Infinity, ease: "linear", delay: el.delay },
            y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 8, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          {el.symbol}
        </motion.div>
      ))}
    </>
  );
}

// Ripple effect component
function RippleEffect({ x, y }: { x: string; y: string }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: x, top: y, transform: "translate(-50%, -50%)" }}
      initial={{ opacity: 0.6 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
    >
      {[0, 1, 2].map((ring) => (
        <motion.div
          key={ring}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-accent/30"
          initial={{ width: 8, height: 8 }}
          animate={{ width: 60 + ring * 30, height: 60 + ring * 30, opacity: 0 }}
          transition={{ duration: 1.2, delay: ring * 0.2, ease: "easeOut" }}
        />
      ))}
    </motion.div>
  );
}

// ─── Narrative Arc SVG ─────────────────────────────────────────────────────────

function NarrativeArcOverlay({ events }: { events: TimelineEventData[] }) {
  const sorted = [...events].sort((a, b) => a.position - b.position);
  if (sorted.length < 4) return null;

  // Calculate emotional values for each event
  const points = sorted.map((evt) => {
    const emotion = evt.emotion ? getEmotionByEmoji(evt.emotion) : null;
    const value = emotion ? emotion.value : 0.5;
    return {
      x: evt.position * 1200,
      y: 180 - value * 160, // Invert so high = top
      value,
      id: evt.id,
    };
  });

  // Find the turning point (largest emotional shift between consecutive events)
  let maxShift = 0;
  let turningPointIndex = 0;
  for (let i = 1; i < points.length; i++) {
    const shift = Math.abs(points[i].value - points[i - 1].value);
    if (shift > maxShift) {
      maxShift = shift;
      turningPointIndex = i;
    }
  }

  // Build smooth curve path using cubic bezier
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpx1 = prev.x + (curr.x - prev.x) * 0.4;
    const cpx2 = prev.x + (curr.x - prev.x) * 0.6;
    pathD += ` C ${cpx1} ${prev.y}, ${cpx2} ${curr.y}, ${curr.x} ${curr.y}`;
  }

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 1200 200"
      preserveAspectRatio="none"
      style={{ zIndex: 1 }}
    >
      <defs>
        <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#A8C5A0" stopOpacity="0.6" />
          <stop offset="50%" stopColor="#C9A96E" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#E8B4BC" stopOpacity="0.6" />
        </linearGradient>
      </defs>

      {/* Main arc curve */}
      <motion.path
        d={pathD}
        fill="none"
        stroke="url(#arcGrad)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="6 4"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.7 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />

      {/* Rising/falling cue arrows */}
      {points.slice(1).map((pt, i) => {
        const prev = points[i];
        const rising = pt.value > prev.value;
        const midX = (prev.x + pt.x) / 2;
        const midY = (prev.y + pt.y) / 2;
        return (
          <g key={`cue-${i}`} opacity="0.4">
            <text
              x={midX}
              y={midY - 8}
              textAnchor="middle"
              fontSize="10"
              fill={rising ? "#4CAF50" : "#E53935"}
            >
              {rising ? "\u25B2" : "\u25BC"}
            </text>
          </g>
        );
      })}

      {/* Turning point star */}
      {maxShift > 0 && (
        <motion.g
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1, type: "spring" }}
        >
          <text
            x={points[turningPointIndex].x}
            y={points[turningPointIndex].y - 14}
            textAnchor="middle"
            fontSize="16"
          >
            {"\u2B50"}
          </text>
        </motion.g>
      )}
    </svg>
  );
}

// ─── Timeline Summary Card ─────────────────────────────────────────────────────

function TimelineSummary({ events }: { events: TimelineEventData[] }) {
  if (events.length < 3) return null;

  const sorted = [...events].sort((a, b) => a.position - b.position);
  const totalEvents = events.length;
  const span = sorted[sorted.length - 1].position - sorted[0].position;
  const spanPercent = Math.round(span * 100);

  // Most common emotional theme
  const emotionCounts: Record<string, number> = {};
  events.forEach(evt => {
    if (evt.emotion) {
      emotionCounts[evt.emotion] = (emotionCounts[evt.emotion] || 0) + 1;
    }
  });
  const topEmotion = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0];
  const topEmotionTag = topEmotion ? getEmotionByEmoji(topEmotion[0]) : null;

  // Key turning point: event with highest shift from predecessor
  let turningPoint: TimelineEventData | null = null;
  let maxShift = 0;
  for (let i = 1; i < sorted.length; i++) {
    const prevEmo = sorted[i - 1].emotion ? getEmotionByEmoji(sorted[i - 1].emotion!) : null;
    const currEmo = sorted[i].emotion ? getEmotionByEmoji(sorted[i].emotion!) : null;
    if (prevEmo && currEmo) {
      const shift = Math.abs(currEmo.value - prevEmo.value);
      if (shift > maxShift) {
        maxShift = shift;
        turningPoint = sorted[i];
      }
    }
  }

  return (
    <motion.div
      className="mx-6 mb-3 relative z-10"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl px-5 py-3 shadow-sm border border-white/50 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground">Events:</span>
          <span className="font-semibold text-primary">{totalEvents}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground">Timeline span:</span>
          <span className="font-semibold text-primary">{spanPercent}%</span>
        </div>
        {topEmotionTag && (
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Dominant emotion:</span>
            <span className="font-semibold">{topEmotionTag.emoji} {topEmotionTag.label}</span>
          </div>
        )}
        {turningPoint && (
          <div className="flex items-center gap-1.5">
            <Star size={12} className="text-amber-500" />
            <span className="text-muted-foreground">Key turning point:</span>
            <span className="font-semibold text-primary">{turningPoint.label}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Expanded Event Card ───────────────────────────────────────────────────────

function ExpandedEventCard({
  evt,
  isAbove,
  onRemove,
  onUpdate,
  onClose,
  localReflections,
  setLocalReflections,
}: {
  evt: TimelineEventData;
  isAbove: boolean;
  onRemove: () => void;
  onUpdate: (label: string, description: string | null, position: number, color: string) => void;
  onClose: () => void;
  localReflections: Record<string, string>;
  setLocalReflections: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}) {
  const [editing, setEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(evt.label);
  const [editDesc, setEditDesc] = useState(evt.description || "");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const reflection = localReflections[evt.id] || evt.reflection || "";

  const handleSave = () => {
    onUpdate(editLabel.trim() || evt.label, editDesc.trim() || null, evt.position, evt.color);
    setEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "absolute left-1/2 -translate-x-1/2 w-64 z-50",
        isAbove ? "top-16" : "bottom-16"
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="bg-white/95 backdrop-blur-xl rounded-2xl p-4 shadow-xl border"
        style={{ borderColor: `${evt.color}25` }}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-4 h-4 rounded-full shrink-0"
            style={{
              background: `radial-gradient(circle at 35% 30%, ${lightenColor(evt.color, 30)}, ${evt.color})`,
            }}
          />
          {editing ? (
            <input
              type="text"
              value={editLabel}
              onChange={(e) => setEditLabel(e.target.value)}
              className="font-serif text-primary font-medium text-sm flex-1 bg-secondary/30 rounded px-2 py-1 border border-white/40 focus:outline-none focus:ring-1 focus:ring-accent/30"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
          ) : (
            <p className="font-serif text-primary font-medium text-sm flex-1">{evt.label}</p>
          )}
          {evt.emotion && (
            <span className="text-sm">{evt.emotion}</span>
          )}
          {!editing && (
            <button
              onClick={() => {
                setEditing(true);
                setEditLabel(evt.label);
                setEditDesc(evt.description || "");
              }}
              className="p-1 rounded hover:bg-secondary/50 text-muted-foreground cursor-pointer"
            >
              <Pencil size={12} />
            </button>
          )}
        </div>

        {/* Description */}
        {editing ? (
          <textarea
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
            placeholder="Description (optional)"
            rows={2}
            className="w-full text-xs bg-secondary/30 rounded px-2 py-1 mb-2 border border-white/40 focus:outline-none focus:ring-1 focus:ring-accent/30 resize-none"
          />
        ) : (
          evt.description && (
            <p className="text-xs text-muted-foreground leading-relaxed mb-2 pl-6">{evt.description}</p>
          )
        )}

        {editing && (
          <div className="flex gap-2 mb-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-1 text-xs text-green-700 hover:bg-green-50 px-2 py-1 rounded cursor-pointer"
            >
              <Check size={12} /> Save
            </button>
            <button
              onClick={() => setEditing(false)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:bg-secondary/50 px-2 py-1 rounded cursor-pointer"
            >
              <X size={12} /> Cancel
            </button>
          </div>
        )}

        {/* Reflection prompt */}
        {!editing && (
          <div className="mb-3 pl-1">
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-medium mb-1 block">
              How did this shape you?
            </label>
            <textarea
              value={reflection}
              onChange={(e) =>
                setLocalReflections((prev) => ({ ...prev, [evt.id]: e.target.value }))
              }
              placeholder="Reflect on this moment..."
              rows={2}
              className="w-full text-xs bg-secondary/20 rounded-lg px-3 py-2 border border-white/40 focus:outline-none focus:ring-1 focus:ring-accent/30 resize-none text-primary placeholder:text-muted-foreground/40"
            />
          </div>
        )}

        {/* Delete with confirmation */}
        {!editing && (
          confirmDelete ? (
            <div className="flex items-center gap-2 justify-center">
              <span className="text-xs text-destructive">Remove this stone?</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                className="text-xs text-white bg-destructive hover:bg-destructive/80 px-3 py-1.5 rounded-lg cursor-pointer"
              >
                Yes
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-xs text-muted-foreground hover:bg-secondary/50 px-3 py-1.5 rounded-lg cursor-pointer"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setConfirmDelete(true);
              }}
              className="flex items-center gap-1 text-xs text-destructive hover:text-destructive/80 cursor-pointer min-h-[44px] min-w-[44px] justify-center w-full rounded-xl hover:bg-destructive/5 transition-colors"
              data-testid={`button-remove-event-${evt.id}`}
            >
              <Trash2 size={12} />
              Remove Stone
            </button>
          )
        )}
      </div>
    </motion.div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function NarrativeTimeline({ events, onAddEvent, onRemoveEvent, onUpdateEvent, onClear, isClinician, toolSettings, onSettingsUpdate }: NarrativeTimelineProps) {
  const settings = { ...DEFAULT_NARRATIVE_TIMELINE_SETTINGS, ...toolSettings } as NarrativeTimelineSettings;
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newColor, setNewColor] = useState(STONE_COLORS[0]);
  const [newEmotion, setNewEmotion] = useState<string | null>(null);
  const [clickPosition, setClickPosition] = useState<number>(0.5);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [ripples, setRipples] = useState<Array<{ id: number; x: string; y: string }>>([]);
  const [localReflections, setLocalReflections] = useState<Record<string, string>>({});
  const timelineRef = useRef<HTMLDivElement>(null);
  const rippleId = useRef(0);

  const handleTimelineClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (settings.maxEvents > 0 && events.length >= settings.maxEvents) return;
    const rect = timelineRef.current?.getBoundingClientRect();
    if (!rect) return;
    const scrollEl = timelineRef.current!;
    const relativeX = (e.clientX - rect.left + scrollEl.scrollLeft) / scrollEl.scrollWidth;
    const pos = Math.max(0.02, Math.min(0.98, relativeX));
    setClickPosition(pos);
    setShowAddForm(true);
    setNewLabel("");
    setNewDesc("");
    setNewEmotion(null);
    setNewColor(STONE_COLORS[Math.floor(Math.random() * STONE_COLORS.length)]);

    // Add ripple at click position
    const rippleX = `${((e.clientX - rect.left) / rect.width) * 100}%`;
    const rippleY = `${((e.clientY - rect.top) / rect.height) * 100}%`;
    const id = rippleId.current++;
    setRipples(prev => [...prev, { id, x: rippleX, y: rippleY }]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 2000);
  }, [settings.maxEvents, events.length]);

  const handleSubmitEvent = useCallback(() => {
    if (!newLabel.trim()) return;
    playRippleSound();
    onAddEvent(newLabel.trim(), newDesc.trim() || null, clickPosition, newColor);
    setShowAddForm(false);
    setNewLabel("");
    setNewDesc("");
    setNewEmotion(null);
  }, [newLabel, newDesc, clickPosition, newColor, onAddEvent]);

  const sortedEvents = [...events].sort((a, b) => a.position - b.position);

  // Compute chapters
  const chapters = useMemo(() => autoSuggestChapters(events), [events]);

  // Compute emotion-colored segments between events for the river
  const emotionSegments = useMemo(() => {
    if (sortedEvents.length < 2) return [];
    return sortedEvents.slice(1).map((evt, i) => ({
      from: sortedEvents[i],
      to: evt,
      color: emotionColorForSegment(sortedEvents[i].emotion || null, evt.emotion || null),
    }));
  }, [sortedEvents]);

  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden" data-testid="narrative-timeline-container"
      style={{ background: "linear-gradient(180deg, #e8f0e8 0%, #d8e8d8 30%, #c8dcc8 60%, #bdd4bd 100%)" }}
    >
      {/* Organic noise texture */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.04 }}>
        <filter id="timeline-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#timeline-noise)" />
      </svg>

      {/* Parallax nature scenery hints */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Distant hills/mountains silhouette */}
        <svg className="absolute bottom-[35%] left-0 right-0 w-full h-40 opacity-[0.06]" viewBox="0 0 1200 160" preserveAspectRatio="none">
          <path d="M0 160 L0 100 Q100 40 200 80 Q350 20 500 70 Q600 30 750 60 Q900 10 1000 50 Q1100 30 1200 70 L1200 160 Z" fill="#1B2A4A" />
        </svg>

        {/* Tree silhouettes on edges */}
        <div className="absolute left-[3%] bottom-[25%] text-4xl opacity-[0.08] select-none">{"\u{1F332}"}</div>
        <div className="absolute left-[6%] bottom-[28%] text-3xl opacity-[0.06] select-none">{"\u{1F333}"}</div>
        <div className="absolute right-[4%] bottom-[27%] text-4xl opacity-[0.07] select-none">{"\u{1F332}"}</div>
        <div className="absolute right-[8%] bottom-[24%] text-3xl opacity-[0.05] select-none">{"\u{1F333}"}</div>

        {/* Ambient color blobs */}
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(168,197,160,0.2) 0%, transparent 70%)",
            top: "-10%",
            left: "10%",
            filter: "blur(80px)",
          }}
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(27,42,74,0.1) 0%, transparent 70%)",
            bottom: "-5%",
            right: "15%",
            filter: "blur(80px)",
          }}
          animate={{ x: [0, -20, 0], y: [0, 15, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Floating nature elements */}
      <FloatingElements />

      {/* Header */}
      <motion.div
        className="flex items-center justify-between px-6 pt-6 pb-2 shrink-0 relative z-10"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div>
          <h2 className="font-serif text-xl md:text-2xl text-primary">Narrative Timeline</h2>
          <p className="text-sm text-muted-foreground">Click the river to drop a stone. Tell your story.</p>
        </div>
        <div className="flex items-center gap-2">
          {events.length > 0 && (
            <span className="text-xs text-muted-foreground/50 font-medium">
              {events.length} stone{events.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </motion.div>

      {/* Timeline Summary */}
      <TimelineSummary events={events} />

      {/* Timeline Area */}
      <motion.div
        className="flex-1 flex items-center px-6 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          ref={timelineRef}
          className="w-full overflow-x-auto cursor-pointer relative py-20"
          onClick={handleTimelineClick}
          data-testid="timeline-track"
        >
          {/* Ripple effects */}
          {ripples.map(r => <RippleEffect key={r.id} x={r.x} y={r.y} />)}

          <div className="relative min-w-[600px] md:min-w-[1200px] h-48">

            {/* Chapter Bands */}
            {chapters.map((chapter) => (
              <div
                key={chapter.id}
                className="absolute top-0 bottom-0 pointer-events-none"
                style={{
                  left: `${chapter.startPosition * 100}%`,
                  width: `${(chapter.endPosition - chapter.startPosition) * 100}%`,
                }}
              >
                {/* Colored band */}
                <div
                  className="absolute inset-0 rounded-lg"
                  style={{ background: chapter.color }}
                />
                {/* Chapter label */}
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span
                    className="text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-full"
                    style={{
                      background: "rgba(255,255,255,0.7)",
                      color: "rgba(27,42,74,0.6)",
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    {chapter.name}
                  </span>
                </div>
              </div>
            ))}

            {/* River Path */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1200 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="riverGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#7BA88E" stopOpacity="0.35" />
                  <stop offset="30%" stopColor="#5B8FA1" stopOpacity="0.3" />
                  <stop offset="50%" stopColor="#4A7A8E" stopOpacity="0.25" />
                  <stop offset="70%" stopColor="#5B8FA1" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#7BA88E" stopOpacity="0.35" />
                </linearGradient>
                <linearGradient id="riverBankGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#8B7355" stopOpacity="0.12" />
                  <stop offset="50%" stopColor="transparent" />
                  <stop offset="100%" stopColor="#8B7355" stopOpacity="0.12" />
                </linearGradient>
                <style>{`
                  @keyframes river-flow {
                    from { stroke-dashoffset: 0; }
                    to { stroke-dashoffset: -36; }
                  }
                  @keyframes river-sparkle {
                    from { stroke-dashoffset: 0; }
                    to { stroke-dashoffset: -80; }
                  }
                `}</style>
              </defs>

              {/* River bank shading */}
              <path
                d="M 0 100 Q 150 55, 300 100 Q 450 145, 600 100 Q 750 55, 900 100 Q 1050 145, 1200 100"
                fill="none"
                stroke="url(#riverBankGrad)"
                strokeWidth="80"
                strokeLinecap="round"
                opacity="0.3"
              />

              {/* Main river body - wide ambient glow */}
              <path
                d="M 0 100 Q 150 55, 300 100 Q 450 145, 600 100 Q 750 55, 900 100 Q 1050 145, 1200 100"
                fill="none"
                stroke="url(#riverGrad)"
                strokeWidth="55"
                strokeLinecap="round"
                opacity="0.4"
                style={{ filter: "blur(6px)" }}
              />

              {/* River core */}
              <path
                d="M 0 100 Q 150 55, 300 100 Q 450 145, 600 100 Q 750 55, 900 100 Q 1050 145, 1200 100"
                fill="none"
                stroke="url(#riverGrad)"
                strokeWidth="40"
                strokeLinecap="round"
              />

              {/* Emotion-colored segments overlay */}
              {emotionSegments.map((seg, i) => {
                const x1 = seg.from.position * 1200;
                const x2 = seg.to.position * 1200;
                const midX = (x1 + x2) / 2;
                // Approximate a small section of the sinusoidal river path
                const getY = (x: number) => {
                  // Match the river path: Q 150 55, 300 100 Q 450 145, 600 100 etc.
                  return 100 + 45 * Math.sin((x / 1200) * Math.PI * 2);
                };
                const y1 = getY(x1);
                const y2 = getY(x2);
                const yMid = getY(midX);
                return (
                  <path
                    key={`eseg-${i}`}
                    d={`M ${x1} ${y1} Q ${midX} ${yMid}, ${x2} ${y2}`}
                    fill="none"
                    stroke={seg.color}
                    strokeWidth="6"
                    strokeLinecap="round"
                    opacity="0.7"
                  />
                );
              })}

              {/* Current flow lines */}
              <path
                d="M 0 100 Q 150 55, 300 100 Q 450 145, 600 100 Q 750 55, 900 100 Q 1050 145, 1200 100"
                fill="none"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="1.5"
                strokeDasharray="6 14"
                strokeLinecap="round"
                style={{ animation: "river-flow 3s linear infinite" }}
              />
              <path
                d="M 0 95 Q 150 50, 300 95 Q 450 140, 600 95 Q 750 50, 900 95 Q 1050 140, 1200 95"
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="1"
                strokeDasharray="4 18"
                strokeLinecap="round"
                style={{ animation: "river-flow 4.5s linear infinite" }}
              />
              <path
                d="M 0 105 Q 150 60, 300 105 Q 450 150, 600 105 Q 750 60, 900 105 Q 1050 150, 1200 105"
                fill="none"
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="1"
                strokeDasharray="3 22"
                strokeLinecap="round"
                style={{ animation: "river-flow 5.5s linear infinite" }}
              />

              {/* Sparkle/shimmer highlights on water */}
              <path
                d="M 0 98 Q 150 53, 300 98 Q 450 143, 600 98 Q 750 53, 900 98 Q 1050 143, 1200 98"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeDasharray="2 40"
                opacity="0.5"
                strokeLinecap="round"
                style={{ animation: "river-sparkle 8s linear infinite" }}
              />

              {/* River edge detail */}
              <path
                d="M 0 100 Q 150 55, 300 100 Q 450 145, 600 100 Q 750 55, 900 100 Q 1050 145, 1200 100"
                fill="none"
                stroke="#1B2A4A"
                strokeWidth="2.5"
                strokeDasharray="6 8"
                opacity="0.12"
              />
            </svg>

            {/* Narrative Arc Overlay */}
            <NarrativeArcOverlay events={events} />

            {/* Start/End Markers with icons */}
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
              <span className="text-lg opacity-30 select-none">{"\u{1F305}"}</span>
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider opacity-40">Past</span>
            </div>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
              <span className="text-lg opacity-30 select-none">{"\u{1F31F}"}</span>
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider opacity-40">Now</span>
            </div>

            {/* Event Stones */}
            {sortedEvents.map((evt, i) => {
              const isAbove = i % 2 === 0;
              return (
                <motion.div
                  key={evt.id}
                  className="absolute cursor-pointer group"
                  style={{
                    left: `${evt.position * 100}%`,
                    top: isAbove ? "10%" : "60%",
                    transform: "translateX(-50%)",
                  }}
                  initial={{ scale: 0, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 350, damping: 22 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedEvent(selectedEvent === evt.id ? null : evt.id);
                  }}
                  data-testid={`timeline-event-${evt.id}`}
                >
                  {/* Connector line to river */}
                  <div
                    className="absolute left-1/2 -translate-x-1/2"
                    style={{
                      top: isAbove ? "100%" : "auto",
                      bottom: isAbove ? "auto" : "100%",
                      height: "30px",
                      width: "1px",
                      background: `linear-gradient(${isAbove ? "to bottom" : "to top"}, ${evt.color}40, transparent)`,
                    }}
                  />

                  {/* Stone with 3D effect */}
                  <motion.div
                    className="relative"
                    whileHover={{ scale: 1.15, y: -4 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div
                      className="w-11 h-11 md:w-13 md:h-13 rounded-full shadow-lg flex items-center justify-center border-2 border-white/50 relative overflow-hidden"
                      style={{
                        background: `radial-gradient(circle at 32% 28%, ${lightenColor(evt.color, 35)} 0%, ${evt.color} 55%, ${darkenColor(evt.color, 25)} 100%)`,
                        boxShadow: `0 4px 16px ${evt.color}50, 0 2px 4px rgba(0,0,0,0.15), inset 0 2px 4px rgba(255,255,255,0.3), inset 0 -2px 4px rgba(0,0,0,0.1)`,
                      }}
                    >
                      {/* Glass highlight */}
                      <div className="absolute top-1 left-1.5 w-4 h-2.5 rounded-full bg-white/30 blur-[1px]" />
                      {/* Show emotion emoji or default dot */}
                      {evt.emotion ? (
                        <span className="text-sm select-none relative z-10">{evt.emotion}</span>
                      ) : (
                        <div className="w-2.5 h-2.5 rounded-full bg-white/25" />
                      )}
                    </div>

                    {/* Subtle pulsing ring for newest stone */}
                    {i === sortedEvents.length - 1 && (
                      <motion.div
                        className="absolute inset-[-4px] rounded-full border border-accent/20"
                        animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                      />
                    )}

                    {/* Label */}
                    <div className={cn(
                      "absolute left-1/2 -translate-x-1/2 whitespace-nowrap",
                      isAbove ? "-top-9" : "-bottom-9"
                    )}>
                      <span className="text-xs font-medium text-primary px-3 py-1.5 rounded-xl shadow-sm"
                        style={{
                          background: "rgba(255,255,255,0.85)",
                          backdropFilter: "blur(8px)",
                          border: `1px solid ${evt.color}20`,
                        }}
                      >
                        {evt.label}
                      </span>
                    </div>
                  </motion.div>

                  {/* Expanded detail card */}
                  <AnimatePresence>
                    {selectedEvent === evt.id && (
                      <ExpandedEventCard
                        evt={evt}
                        isAbove={isAbove}
                        onRemove={() => {
                          onRemoveEvent(evt.id);
                          setSelectedEvent(null);
                        }}
                        onUpdate={(label, desc, pos, color) => {
                          onUpdateEvent(evt.id, label, desc, pos, color);
                        }}
                        onClose={() => setSelectedEvent(null)}
                        localReflections={localReflections}
                        setLocalReflections={setLocalReflections}
                      />
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Empty State */}
      {events.length === 0 && !showAddForm && settings.showPrompts && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <motion.span
              className="text-4xl block mb-3 select-none"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              {"\u{1FAA8}"}
            </motion.span>
            <p className="text-muted-foreground/50 text-lg font-serif">
              Click anywhere on the river to begin...
            </p>
          </motion.div>
        </div>
      )}

      {/* Add Event Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ y: 100, opacity: 0, filter: "blur(4px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            exit={{ y: 100, opacity: 0, filter: "blur(4px)" }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="absolute bottom-0 inset-x-0 z-30"
          >
            <div className="glass-luxury backdrop-blur-2xl shadow-[0_-4px_30px_rgba(27,42,74,0.08)] p-6">
              <div className="max-w-lg mx-auto">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl select-none">{"\u{1FAA8}"}</span>
                    <h3 className="font-serif text-lg text-primary">Drop a Stone</h3>
                  </div>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="min-w-[44px] min-h-[44px] p-2 hover:bg-secondary rounded-xl cursor-pointer"
                    data-testid="button-close-event-form"
                  >
                    <X size={18} className="text-muted-foreground" />
                  </button>
                </div>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={newLabel}
                    onChange={e => setNewLabel(e.target.value)}
                    placeholder="What happened? (e.g., Moved to Nevada)"
                    className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-white/40 text-primary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/30 text-sm min-h-[44px]"
                    autoFocus
                    data-testid="input-event-label"
                    onKeyDown={e => e.key === "Enter" && handleSubmitEvent()}
                  />
                  <textarea
                    value={newDesc}
                    onChange={e => setNewDesc(e.target.value)}
                    placeholder="How did it feel? (optional)"
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-white/40 text-primary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/30 text-sm resize-none min-h-[44px]"
                    data-testid="input-event-description"
                  />

                  {/* Emotion tag selector */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-muted-foreground mr-1">Feeling:</span>
                    {EMOTION_TAGS.map(tag => (
                      <button
                        key={tag.emoji}
                        onClick={() => setNewEmotion(newEmotion === tag.emoji ? null : tag.emoji)}
                        className={cn(
                          "text-lg px-1.5 py-0.5 rounded-lg cursor-pointer transition-all",
                          newEmotion === tag.emoji
                            ? "bg-secondary ring-2 ring-accent/40 scale-110"
                            : "hover:bg-secondary/50 opacity-60 hover:opacity-100"
                        )}
                        title={tag.label}
                        type="button"
                      >
                        {tag.emoji}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground mr-1">Stone:</span>
                    {STONE_COLORS.map(c => (
                      <button
                        key={c}
                        onClick={() => setNewColor(c)}
                        className={cn(
                          "w-8 h-8 rounded-full cursor-pointer transition-all border-2"
                        )}
                        style={{
                          background: `radial-gradient(circle at 35% 30%, ${lightenColor(c, 30)}, ${c})`,
                          borderColor: newColor === c ? "white" : "transparent",
                          boxShadow: newColor === c
                            ? `0 0 0 3px ${c}, 0 0 15px ${c}40`
                            : `0 2px 8px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.3)`,
                          transform: newColor === c ? "scale(1.15)" : "scale(1)",
                        }}
                        data-testid={`button-color-${c}`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={handleSubmitEvent}
                    disabled={!newLabel.trim() || (settings.maxEvents > 0 && events.length >= settings.maxEvents)}
                    className="w-full min-h-[44px] py-3 rounded-xl bg-gradient-to-r from-[#2E8B57] to-[#236B43] text-white border border-[#D4AF37]/30 font-medium flex items-center justify-center gap-2 shadow-lg hover:opacity-90 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    data-testid="button-submit-event"
                  >
                    <Plus size={16} />
                    Place on Timeline
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isClinician && onSettingsUpdate && (
        <ClinicianToolbar
          controls={NARRATIVE_TIMELINE_TOOLBAR_CONTROLS}
          settings={settings}
          onUpdate={onSettingsUpdate}
          onClear={onClear}
        />
      )}
    </div>
  );
}
