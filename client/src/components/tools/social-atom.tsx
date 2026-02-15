import React, { useState, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { playClickSound } from "@/lib/audio-feedback";
import { RotateCcw, Plus, X, Link2, Users, Edit3, Trash2, Sparkles } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SocialAtomPersonData {
  id: string;
  name: string;
  role: string;
  emoji: string | null;
  color: string;
  distanceRing: number;
  angle: number;
  groupId: string | null;
  isDeceased: boolean;
  emotionalTone: string | null;
  notes: string | null;
  createdBy: string | null;
  createdAt: string;
}

export interface SocialAtomConnectionData {
  id: string;
  fromPersonId: string;
  toPersonId: string;
  style: string;
  label: string | null;
  directionality: string;
  createdBy: string | null;
  createdAt: string;
}

export interface SocialAtomProps {
  people: SocialAtomPersonData[];
  connections: SocialAtomConnectionData[];
  onAddPerson: (
    name: string,
    role: string,
    emoji: string | null,
    color: string,
    distanceRing: number,
    angle: number,
    isDeceased: boolean,
    emotionalTone: string | null,
    notes: string | null,
  ) => void;
  onMovePerson: (personId: string, distanceRing: number, angle: number) => void;
  onUpdatePerson: (personId: string, fields: Partial<SocialAtomPersonData>) => void;
  onRemovePerson: (personId: string) => void;
  onAddConnection: (
    fromPersonId: string,
    toPersonId: string,
    style: string,
    label: string | null,
    directionality: string,
  ) => void;
  onRemoveConnection: (connectionId: string) => void;
  onClear: () => void;
  isClinician: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SVG_SIZE = 600;
const CENTER = SVG_SIZE / 2;
const RING_RADII = [0, 90, 155, 215, 270];
const RING_LABELS = ["", "Inner Circle", "Close", "Acquaintance", "Distant"];
const PERSON_RADIUS = 22;

const ROLE_OPTIONS = ["Family", "Friend", "Partner", "Coworker", "Mentor", "Other"];

const EMOTIONAL_TONES: { value: string; label: string; color: string }[] = [
  { value: "warm", label: "Warm", color: "#22C55E" },
  { value: "tense", label: "Tense", color: "#F59E0B" },
  { value: "distant", label: "Distant", color: "#94A3B8" },
  { value: "conflicted", label: "Conflicted", color: "#EF4444" },
  { value: "neutral", label: "Neutral", color: "#6B7280" },
];

const CONNECTION_STYLES: { value: string; label: string; color: string; desc: string }[] = [
  { value: "supportive", label: "Supportive", color: "#22C55E", desc: "Solid green line" },
  { value: "conflicted", label: "Conflicted", color: "#EF4444", desc: "Dashed red line" },
  { value: "distant", label: "Distant", color: "#94A3B8", desc: "Dotted gray line" },
  { value: "cutoff", label: "Cutoff", color: "#6B7280", desc: "X-marked line" },
];

const DIRECTIONALITY_OPTIONS = [
  { value: "bidirectional", label: "Both ways" },
  { value: "from", label: "From → To" },
  { value: "to", label: "To → From" },
];

const COLOR_OPTIONS = [
  "#3B82F6", "#8B5CF6", "#EC4899", "#EF4444", "#F59E0B",
  "#22C55E", "#06B6D4", "#F97316", "#6366F1", "#14B8A6",
  "#E879F9", "#A78BFA",
];

const EMOJI_OPTIONS = [
  "👤", "👩", "👨", "👧", "👦", "👶",
  "👵", "👴", "🧑", "💑", "👪", "🐶",
  "🐱", "❤️", "⭐", "🌸", "🌿", "🦋",
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function polarToCartesian(ring: number, angle: number): { x: number; y: number } {
  const r = RING_RADII[ring] || 0;
  return {
    x: CENTER + r * Math.cos(angle),
    y: CENTER + r * Math.sin(angle),
  };
}

function cartesianToPolar(x: number, y: number): { ring: number; angle: number } {
  const dx = x - CENTER;
  const dy = y - CENTER;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx);

  let ring = 4;
  const midpoints = [
    0,
    (RING_RADII[1] + RING_RADII[2]) / 2,
    (RING_RADII[2] + RING_RADII[3]) / 2,
    (RING_RADII[3] + RING_RADII[4]) / 2,
    Infinity,
  ];
  for (let i = 1; i <= 4; i++) {
    if (dist < midpoints[i]) {
      ring = i;
      break;
    }
  }
  return { ring: Math.max(1, Math.min(4, ring)), angle };
}

function getConnectionLineProps(style: string) {
  switch (style) {
    case "supportive":
      return { stroke: "#22C55E", strokeDasharray: "none", strokeWidth: 2 };
    case "conflicted":
      return { stroke: "#EF4444", strokeDasharray: "8 4", strokeWidth: 2 };
    case "distant":
      return { stroke: "#94A3B8", strokeDasharray: "3 3", strokeWidth: 1.5 };
    case "cutoff":
      return { stroke: "#6B7280", strokeDasharray: "none", strokeWidth: 1.5 };
    default:
      return { stroke: "#6B7280", strokeDasharray: "none", strokeWidth: 1 };
  }
}

function getPersonInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SocialAtom({
  people,
  connections,
  onAddPerson,
  onMovePerson,
  onUpdatePerson,
  onRemovePerson,
  onAddConnection,
  onRemoveConnection,
  onClear,
  isClinician,
}: SocialAtomProps) {
  // Panel states
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [editingPersonId, setEditingPersonId] = useState<string | null>(null);
  const [connectionMode, setConnectionMode] = useState(false);
  const [connectionFrom, setConnectionFrom] = useState<string | null>(null);
  const [showConnectionForm, setShowConnectionForm] = useState(false);
  const [connectionTo, setConnectionTo] = useState<string | null>(null);
  const [showLegend, setShowLegend] = useState(false);

  // Add form state
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("Family");
  const [newEmoji, setNewEmoji] = useState<string | null>(null);
  const [newColor, setNewColor] = useState(COLOR_OPTIONS[0]);
  const [newRing, setNewRing] = useState(2);
  const [newDeceased, setNewDeceased] = useState(false);
  const [newTone, setNewTone] = useState<string | null>(null);
  const [newNotes, setNewNotes] = useState("");

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editEmoji, setEditEmoji] = useState<string | null>(null);
  const [editColor, setEditColor] = useState("");
  const [editDeceased, setEditDeceased] = useState(false);
  const [editTone, setEditTone] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState("");

  // Connection form state
  const [connStyle, setConnStyle] = useState("supportive");
  const [connLabel, setConnLabel] = useState("");
  const [connDir, setConnDir] = useState("bidirectional");

  // Drag state
  const svgRef = useRef<SVGSVGElement>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);

  // ---------------------------------------------------------------------------
  // Derived data
  // ---------------------------------------------------------------------------

  const selectedPerson = useMemo(
    () => people.find((p) => p.id === selectedPersonId) || null,
    [people, selectedPersonId],
  );

  const editingPerson = useMemo(
    () => people.find((p) => p.id === editingPersonId) || null,
    [people, editingPersonId],
  );

  const ringCounts = useMemo(() => {
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
    for (const p of people) {
      if (counts[p.distanceRing] !== undefined) counts[p.distanceRing]++;
    }
    return counts;
  }, [people]);

  const personMap = useMemo(() => {
    const map = new Map<string, SocialAtomPersonData>();
    for (const p of people) map.set(p.id, p);
    return map;
  }, [people]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const resetAddForm = useCallback(() => {
    setNewName("");
    setNewRole("Family");
    setNewEmoji(null);
    setNewColor(COLOR_OPTIONS[0]);
    setNewRing(2);
    setNewDeceased(false);
    setNewTone(null);
    setNewNotes("");
  }, []);

  const handleAddPerson = useCallback(() => {
    if (!newName.trim()) return;
    const existingOnRing = people.filter((p) => p.distanceRing === newRing);
    const angleStep = (2 * Math.PI) / Math.max(existingOnRing.length + 1, 1);
    const angle = angleStep * existingOnRing.length;
    onAddPerson(
      newName.trim(),
      newRole,
      newEmoji,
      newColor,
      newRing,
      angle,
      newDeceased,
      newTone,
      newNotes.trim() || null,
    );
    playClickSound();
    resetAddForm();
    setShowAddForm(false);
  }, [newName, newRole, newEmoji, newColor, newRing, newDeceased, newTone, newNotes, people, onAddPerson, resetAddForm]);

  const handleStartEdit = useCallback((person: SocialAtomPersonData) => {
    setEditingPersonId(person.id);
    setEditName(person.name);
    setEditRole(person.role);
    setEditEmoji(person.emoji);
    setEditColor(person.color);
    setEditDeceased(person.isDeceased);
    setEditTone(person.emotionalTone);
    setEditNotes(person.notes || "");
    setSelectedPersonId(null);
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (!editingPersonId || !editName.trim()) return;
    onUpdatePerson(editingPersonId, {
      name: editName.trim(),
      role: editRole,
      emoji: editEmoji,
      color: editColor,
      isDeceased: editDeceased,
      emotionalTone: editTone,
      notes: editNotes.trim() || null,
    });
    playClickSound();
    setEditingPersonId(null);
  }, [editingPersonId, editName, editRole, editEmoji, editColor, editDeceased, editTone, editNotes, onUpdatePerson]);

  const handlePersonClick = useCallback(
    (personId: string) => {
      if (draggingId) return;
      if (connectionMode) {
        if (!connectionFrom) {
          setConnectionFrom(personId);
          playClickSound();
        } else if (connectionFrom !== personId) {
          setConnectionTo(personId);
          setShowConnectionForm(true);
          playClickSound();
        }
        return;
      }
      setSelectedPersonId((prev) => (prev === personId ? null : personId));
      playClickSound();
    },
    [connectionMode, connectionFrom, draggingId],
  );

  const handleCreateConnection = useCallback(() => {
    if (!connectionFrom || !connectionTo) return;
    onAddConnection(connectionFrom, connectionTo, connStyle, connLabel.trim() || null, connDir);
    playClickSound();
    setConnectionFrom(null);
    setConnectionTo(null);
    setShowConnectionForm(false);
    setConnStyle("supportive");
    setConnLabel("");
    setConnDir("bidirectional");
    setConnectionMode(false);
  }, [connectionFrom, connectionTo, connStyle, connLabel, connDir, onAddConnection]);

  const handleCancelConnection = useCallback(() => {
    setConnectionFrom(null);
    setConnectionTo(null);
    setShowConnectionForm(false);
    setConnectionMode(false);
  }, []);

  // Drag handlers
  const getSvgPoint = useCallback(
    (clientX: number, clientY: number) => {
      if (!svgRef.current) return { x: CENTER, y: CENTER };
      const rect = svgRef.current.getBoundingClientRect();
      const scaleX = SVG_SIZE / rect.width;
      const scaleY = SVG_SIZE / rect.height;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      };
    },
    [],
  );

  const handleDragStart = useCallback(
    (personId: string, e: React.MouseEvent | React.TouchEvent) => {
      if (connectionMode) return;
      e.preventDefault();
      e.stopPropagation();
      setDraggingId(personId);
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      setDragPos(getSvgPoint(clientX, clientY));
    },
    [connectionMode, getSvgPoint],
  );

  const handleDragMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!draggingId) return;
      e.preventDefault();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      setDragPos(getSvgPoint(clientX, clientY));
    },
    [draggingId, getSvgPoint],
  );

  const handleDragEnd = useCallback(() => {
    if (!draggingId || !dragPos) {
      setDraggingId(null);
      setDragPos(null);
      return;
    }
    const { ring, angle } = cartesianToPolar(dragPos.x, dragPos.y);
    onMovePerson(draggingId, ring, angle);
    playClickSound();
    setDraggingId(null);
    setDragPos(null);
  }, [draggingId, dragPos, onMovePerson]);

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------

  const renderRings = useMemo(() => {
    const rings: React.ReactElement[] = [];
    for (let i = 4; i >= 1; i--) {
      const r = RING_RADII[i];
      rings.push(
        <circle
          key={`ring-${i}`}
          cx={CENTER}
          cy={CENTER}
          r={r}
          fill="none"
          stroke="rgba(148,163,184,0.2)"
          strokeWidth={1}
        />,
      );
      // Ring label
      rings.push(
        <text
          key={`ring-label-${i}`}
          x={CENTER}
          y={CENTER - r + 14}
          textAnchor="middle"
          fontSize={9}
          fill="rgba(148,163,184,0.5)"
          fontWeight={500}
        >
          {RING_LABELS[i]}
        </text>,
      );
    }
    return rings;
  }, []);

  const renderConnections = useMemo(() => {
    return connections.map((conn) => {
      const fromPerson = personMap.get(conn.fromPersonId);
      const toPerson = personMap.get(conn.toPersonId);
      if (!fromPerson || !toPerson) return null;

      const fromDragging = draggingId === fromPerson.id && dragPos;
      const toDragging = draggingId === toPerson.id && dragPos;

      const from = fromDragging
        ? { x: dragPos!.x, y: dragPos!.y }
        : polarToCartesian(fromPerson.distanceRing, fromPerson.angle);
      const to = toDragging
        ? { x: dragPos!.x, y: dragPos!.y }
        : polarToCartesian(toPerson.distanceRing, toPerson.angle);

      const lineProps = getConnectionLineProps(conn.style);
      const markerId =
        conn.directionality !== "bidirectional"
          ? `arrowhead-${conn.style}`
          : undefined;

      const elements: React.ReactElement[] = [];

      // Main line
      elements.push(
        <line
          key={`conn-line-${conn.id}`}
          x1={from.x}
          y1={from.y}
          x2={to.x}
          y2={to.y}
          stroke={lineProps.stroke}
          strokeWidth={lineProps.strokeWidth}
          strokeDasharray={lineProps.strokeDasharray === "none" ? undefined : lineProps.strokeDasharray}
          markerEnd={
            markerId && (conn.directionality === "from" || conn.directionality === "bidirectional")
              ? `url(#${markerId})`
              : undefined
          }
          markerStart={
            markerId && conn.directionality === "to"
              ? `url(#${markerId})`
              : undefined
          }
          opacity={0.7}
          style={{ pointerEvents: "none" }}
        />,
      );

      // Cutoff X marks
      if (conn.style === "cutoff") {
        const mx = (from.x + to.x) / 2;
        const my = (from.y + to.y) / 2;
        const s = 5;
        elements.push(
          <g key={`conn-cutoff-${conn.id}`} opacity={0.8}>
            <line x1={mx - s} y1={my - s} x2={mx + s} y2={my + s} stroke="#6B7280" strokeWidth={2} />
            <line x1={mx + s} y1={my - s} x2={mx - s} y2={my + s} stroke="#6B7280" strokeWidth={2} />
          </g>,
        );
      }

      // Connection label
      if (conn.label) {
        const mx = (from.x + to.x) / 2;
        const my = (from.y + to.y) / 2;
        elements.push(
          <g key={`conn-label-${conn.id}`}>
            <rect
              x={mx - 20}
              y={my - 8}
              width={40}
              height={14}
              rx={4}
              fill="rgba(15,23,42,0.8)"
              stroke="rgba(148,163,184,0.2)"
              strokeWidth={0.5}
            />
            <text
              x={mx}
              y={my + 3}
              textAnchor="middle"
              fontSize={7}
              fill="rgba(226,232,240,0.8)"
            >
              {conn.label.length > 8 ? conn.label.slice(0, 8) + "..." : conn.label}
            </text>
          </g>,
        );
      }

      return <g key={`conn-group-${conn.id}`}>{elements}</g>;
    });
  }, [connections, personMap, draggingId, dragPos]);

  const renderPeople = useMemo(() => {
    return people.map((person) => {
      const isDragging = draggingId === person.id;
      const pos = isDragging && dragPos ? dragPos : polarToCartesian(person.distanceRing, person.angle);
      const isSelected = selectedPersonId === person.id;
      const isConnFrom = connectionFrom === person.id;
      const toneData = EMOTIONAL_TONES.find((t) => t.value === person.emotionalTone);
      const toneRingColor = toneData ? toneData.color : "transparent";

      return (
        <g
          key={person.id}
          style={{ cursor: connectionMode ? "crosshair" : isDragging ? "grabbing" : "grab" }}
          onMouseDown={(e) => handleDragStart(person.id, e)}
          onTouchStart={(e) => handleDragStart(person.id, e)}
          onClick={() => handlePersonClick(person.id)}
        >
          {/* Deceased halo */}
          {person.isDeceased && (
            <circle
              cx={pos.x}
              cy={pos.y}
              r={PERSON_RADIUS + 6}
              fill="none"
              stroke="rgba(226,232,240,0.3)"
              strokeWidth={2}
              strokeDasharray="4 2"
            />
          )}

          {/* Emotional tone ring */}
          {toneRingColor !== "transparent" && (
            <circle
              cx={pos.x}
              cy={pos.y}
              r={PERSON_RADIUS + 3}
              fill="none"
              stroke={toneRingColor}
              strokeWidth={1.5}
              opacity={0.6}
            />
          )}

          {/* Selection / connection highlight ring */}
          {(isSelected || isConnFrom) && (
            <circle
              cx={pos.x}
              cy={pos.y}
              r={PERSON_RADIUS + 5}
              fill="none"
              stroke={isConnFrom ? "#F59E0B" : "#60A5FA"}
              strokeWidth={2}
              opacity={0.8}
            >
              <animate attributeName="r" values={`${PERSON_RADIUS + 4};${PERSON_RADIUS + 8};${PERSON_RADIUS + 4}`} dur="1.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;0.4;0.8" dur="1.5s" repeatCount="indefinite" />
            </circle>
          )}

          {/* Main circle */}
          <circle
            cx={pos.x}
            cy={pos.y}
            r={PERSON_RADIUS}
            fill={person.color}
            opacity={person.isDeceased ? 0.5 : 0.85}
            stroke="rgba(255,255,255,0.2)"
            strokeWidth={1}
          />

          {/* Glassmorphism sheen */}
          <circle
            cx={pos.x}
            cy={pos.y - 4}
            r={PERSON_RADIUS - 6}
            fill="url(#sheen-gradient)"
            opacity={0.3}
          />

          {/* Emoji or initial */}
          <text
            x={pos.x}
            y={pos.y + 1}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={person.emoji ? 16 : 14}
            fill={person.emoji ? undefined : "white"}
            fontWeight={person.emoji ? undefined : 700}
            style={{ pointerEvents: "none", userSelect: "none" }}
          >
            {person.emoji || getPersonInitial(person.name)}
          </text>

          {/* Name label below */}
          <text
            x={pos.x}
            y={pos.y + PERSON_RADIUS + 12}
            textAnchor="middle"
            fontSize={8}
            fill="rgba(226,232,240,0.8)"
            fontWeight={500}
            style={{ pointerEvents: "none", userSelect: "none" }}
          >
            {person.name.length > 10 ? person.name.slice(0, 10) + "..." : person.name}
          </text>

          {/* Deceased cross overlay */}
          {person.isDeceased && (
            <text
              x={pos.x + PERSON_RADIUS - 4}
              y={pos.y - PERSON_RADIUS + 8}
              textAnchor="middle"
              fontSize={10}
              fill="rgba(226,232,240,0.6)"
              style={{ pointerEvents: "none" }}
            >
              ✝
            </text>
          )}
        </g>
      );
    });
  }, [people, draggingId, dragPos, selectedPersonId, connectionMode, connectionFrom, handleDragStart, handlePersonClick]);

  // ---------------------------------------------------------------------------
  // SVG defs (arrowheads, gradients)
  // ---------------------------------------------------------------------------

  const svgDefs = (
    <defs>
      {/* Radial background gradient */}
      <radialGradient id="bg-radial" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="rgba(99,102,241,0.08)" />
        <stop offset="50%" stopColor="rgba(59,130,246,0.04)" />
        <stop offset="100%" stopColor="rgba(15,23,42,0)" />
      </radialGradient>

      {/* Sheen for glassmorphism on person circles */}
      <linearGradient id="sheen-gradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="white" stopOpacity="0.6" />
        <stop offset="100%" stopColor="white" stopOpacity="0" />
      </linearGradient>

      {/* Center glow */}
      <radialGradient id="center-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="rgba(139,92,246,0.3)" />
        <stop offset="100%" stopColor="rgba(139,92,246,0)" />
      </radialGradient>

      {/* Arrowheads for each connection style */}
      {CONNECTION_STYLES.map((cs) => (
        <marker
          key={`marker-${cs.value}`}
          id={`arrowhead-${cs.value}`}
          markerWidth="8"
          markerHeight="6"
          refX="7"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 8 3, 0 6" fill={cs.color} opacity={0.7} />
        </marker>
      ))}
    </defs>
  );

  // ---------------------------------------------------------------------------
  // Form panel renderer
  // ---------------------------------------------------------------------------

  const renderAddForm = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-4 space-y-3"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Add Person
        </h3>
        <button
          onClick={() => { setShowAddForm(false); resetAddForm(); }}
          className="text-slate-400 hover:text-slate-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Name */}
      <input
        type="text"
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
        placeholder="Name..."
        maxLength={30}
        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-indigo-400/50 transition-colors"
      />

      {/* Role */}
      <div>
        <label className="text-xs text-slate-400 mb-1 block">Role</label>
        <div className="flex flex-wrap gap-1.5">
          {ROLE_OPTIONS.map((role) => (
            <button
              key={role}
              onClick={() => setNewRole(role)}
              className={cn(
                "px-2.5 py-1 rounded-full text-xs font-medium transition-all",
                newRole === role
                  ? "bg-indigo-500/30 text-indigo-200 border border-indigo-400/30"
                  : "bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10",
              )}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Ring */}
      <div>
        <label className="text-xs text-slate-400 mb-1 block">Distance Ring</label>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4].map((r) => (
            <button
              key={r}
              onClick={() => setNewRing(r)}
              className={cn(
                "flex-1 py-1.5 rounded-lg text-xs font-medium transition-all",
                newRing === r
                  ? "bg-indigo-500/30 text-indigo-200 border border-indigo-400/30"
                  : "bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10",
              )}
            >
              {RING_LABELS[r]}
            </button>
          ))}
        </div>
      </div>

      {/* Emoji */}
      <div>
        <label className="text-xs text-slate-400 mb-1 block">Emoji (optional)</label>
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setNewEmoji(null)}
            className={cn(
              "w-8 h-8 rounded-lg text-xs flex items-center justify-center transition-all",
              newEmoji === null
                ? "bg-indigo-500/30 border border-indigo-400/30"
                : "bg-white/5 border border-white/5 hover:bg-white/10",
            )}
          >
            <span className="text-slate-400">--</span>
          </button>
          {EMOJI_OPTIONS.map((em) => (
            <button
              key={em}
              onClick={() => setNewEmoji(em)}
              className={cn(
                "w-8 h-8 rounded-lg text-base flex items-center justify-center transition-all",
                newEmoji === em
                  ? "bg-indigo-500/30 border border-indigo-400/30"
                  : "bg-white/5 border border-white/5 hover:bg-white/10",
              )}
            >
              {em}
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
      <div>
        <label className="text-xs text-slate-400 mb-1 block">Color</label>
        <div className="flex flex-wrap gap-1.5">
          {COLOR_OPTIONS.map((c) => (
            <button
              key={c}
              onClick={() => setNewColor(c)}
              className={cn(
                "w-7 h-7 rounded-full border-2 transition-all",
                newColor === c ? "border-white scale-110" : "border-transparent hover:scale-105",
              )}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      {/* Emotional tone */}
      <div>
        <label className="text-xs text-slate-400 mb-1 block">Emotional Tone (optional)</label>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setNewTone(null)}
            className={cn(
              "px-2.5 py-1 rounded-full text-xs font-medium transition-all",
              newTone === null
                ? "bg-indigo-500/30 text-indigo-200 border border-indigo-400/30"
                : "bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10",
            )}
          >
            None
          </button>
          {EMOTIONAL_TONES.map((t) => (
            <button
              key={t.value}
              onClick={() => setNewTone(t.value)}
              className={cn(
                "px-2.5 py-1 rounded-full text-xs font-medium transition-all",
                newTone === t.value
                  ? "border text-slate-200"
                  : "bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10",
              )}
              style={
                newTone === t.value
                  ? { backgroundColor: `${t.color}20`, borderColor: `${t.color}60` }
                  : undefined
              }
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Deceased */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={newDeceased}
          onChange={(e) => setNewDeceased(e.target.checked)}
          className="rounded border-white/20 bg-white/5 text-indigo-400"
        />
        <span className="text-xs text-slate-400">Deceased</span>
      </label>

      {/* Notes */}
      <textarea
        value={newNotes}
        onChange={(e) => setNewNotes(e.target.value)}
        placeholder="Notes (optional)..."
        maxLength={200}
        rows={2}
        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-indigo-400/50 transition-colors resize-none"
      />

      {/* Submit */}
      <button
        onClick={handleAddPerson}
        disabled={!newName.trim()}
        className={cn(
          "w-full py-2 rounded-lg text-sm font-medium transition-all",
          newName.trim()
            ? "bg-indigo-500/30 text-indigo-200 hover:bg-indigo-500/40 border border-indigo-400/30"
            : "bg-white/5 text-slate-600 border border-white/5 cursor-not-allowed",
        )}
      >
        Add to Atom
      </button>
    </motion.div>
  );

  // ---------------------------------------------------------------------------
  // Edit panel
  // ---------------------------------------------------------------------------

  const renderEditPanel = () => {
    if (!editingPerson) return null;
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-4 space-y-3"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
            <Edit3 className="w-4 h-4" /> Edit Person
          </h3>
          <button
            onClick={() => setEditingPersonId(null)}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <input
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          placeholder="Name..."
          maxLength={30}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-indigo-400/50 transition-colors"
        />

        {/* Role */}
        <div className="flex flex-wrap gap-1.5">
          {ROLE_OPTIONS.map((role) => (
            <button
              key={role}
              onClick={() => setEditRole(role)}
              className={cn(
                "px-2.5 py-1 rounded-full text-xs font-medium transition-all",
                editRole === role
                  ? "bg-indigo-500/30 text-indigo-200 border border-indigo-400/30"
                  : "bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10",
              )}
            >
              {role}
            </button>
          ))}
        </div>

        {/* Emoji */}
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setEditEmoji(null)}
            className={cn(
              "w-8 h-8 rounded-lg text-xs flex items-center justify-center transition-all",
              editEmoji === null
                ? "bg-indigo-500/30 border border-indigo-400/30"
                : "bg-white/5 border border-white/5 hover:bg-white/10",
            )}
          >
            <span className="text-slate-400">--</span>
          </button>
          {EMOJI_OPTIONS.map((em) => (
            <button
              key={em}
              onClick={() => setEditEmoji(em)}
              className={cn(
                "w-8 h-8 rounded-lg text-base flex items-center justify-center transition-all",
                editEmoji === em
                  ? "bg-indigo-500/30 border border-indigo-400/30"
                  : "bg-white/5 border border-white/5 hover:bg-white/10",
              )}
            >
              {em}
            </button>
          ))}
        </div>

        {/* Color */}
        <div className="flex flex-wrap gap-1.5">
          {COLOR_OPTIONS.map((c) => (
            <button
              key={c}
              onClick={() => setEditColor(c)}
              className={cn(
                "w-7 h-7 rounded-full border-2 transition-all",
                editColor === c ? "border-white scale-110" : "border-transparent hover:scale-105",
              )}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        {/* Emotional tone */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setEditTone(null)}
            className={cn(
              "px-2.5 py-1 rounded-full text-xs font-medium transition-all",
              editTone === null
                ? "bg-indigo-500/30 text-indigo-200 border border-indigo-400/30"
                : "bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10",
            )}
          >
            None
          </button>
          {EMOTIONAL_TONES.map((t) => (
            <button
              key={t.value}
              onClick={() => setEditTone(t.value)}
              className={cn(
                "px-2.5 py-1 rounded-full text-xs font-medium transition-all",
                editTone === t.value
                  ? "border text-slate-200"
                  : "bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10",
              )}
              style={
                editTone === t.value
                  ? { backgroundColor: `${t.color}20`, borderColor: `${t.color}60` }
                  : undefined
              }
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Deceased */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={editDeceased}
            onChange={(e) => setEditDeceased(e.target.checked)}
            className="rounded border-white/20 bg-white/5 text-indigo-400"
          />
          <span className="text-xs text-slate-400">Deceased</span>
        </label>

        {/* Notes */}
        <textarea
          value={editNotes}
          onChange={(e) => setEditNotes(e.target.value)}
          placeholder="Notes..."
          maxLength={200}
          rows={2}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-indigo-400/50 transition-colors resize-none"
        />

        <button
          onClick={handleSaveEdit}
          disabled={!editName.trim()}
          className="w-full py-2 rounded-lg text-sm font-medium bg-indigo-500/30 text-indigo-200 hover:bg-indigo-500/40 border border-indigo-400/30 transition-all"
        >
          Save Changes
        </button>
      </motion.div>
    );
  };

  // ---------------------------------------------------------------------------
  // Detail popover
  // ---------------------------------------------------------------------------

  const renderDetailPopover = () => {
    if (!selectedPerson) return null;
    const personConns = connections.filter(
      (c) => c.fromPersonId === selectedPerson.id || c.toPersonId === selectedPerson.id,
    );
    const toneData = EMOTIONAL_TONES.find((t) => t.value === selectedPerson.emotionalTone);

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-4 space-y-2"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
              style={{ backgroundColor: selectedPerson.color, opacity: selectedPerson.isDeceased ? 0.5 : 1 }}
            >
              {selectedPerson.emoji || getPersonInitial(selectedPerson.name)}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">{selectedPerson.name}</p>
              <p className="text-xs text-slate-400">{selectedPerson.role}</p>
            </div>
          </div>
          <button
            onClick={() => setSelectedPersonId(null)}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <span className="px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/5">
            Ring: {RING_LABELS[selectedPerson.distanceRing]}
          </span>
          {toneData && (
            <span
              className="px-2 py-0.5 rounded-full border text-slate-300"
              style={{ backgroundColor: `${toneData.color}15`, borderColor: `${toneData.color}40` }}
            >
              {toneData.label}
            </span>
          )}
          {selectedPerson.isDeceased && (
            <span className="px-2 py-0.5 rounded-full bg-white/5 text-slate-500 border border-white/5">
              Deceased ✝
            </span>
          )}
        </div>

        {selectedPerson.notes && (
          <p className="text-xs text-slate-400 italic leading-relaxed">{selectedPerson.notes}</p>
        )}

        {personConns.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs text-slate-500 font-medium">Connections:</p>
            {personConns.map((c) => {
              const otherId = c.fromPersonId === selectedPerson.id ? c.toPersonId : c.fromPersonId;
              const other = personMap.get(otherId);
              const styleData = CONNECTION_STYLES.find((s) => s.value === c.style);
              return (
                <div key={c.id} className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">
                    {other?.name || "Unknown"}{" "}
                    <span className="text-slate-500">({styleData?.label || c.style})</span>
                    {c.label && <span className="text-slate-500 ml-1">- {c.label}</span>}
                  </span>
                  <button
                    onClick={() => {
                      onRemoveConnection(c.id);
                      playClickSound();
                    }}
                    className="text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <button
            onClick={() => handleStartEdit(selectedPerson)}
            className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5 transition-all flex items-center justify-center gap-1"
          >
            <Edit3 className="w-3 h-3" /> Edit
          </button>
          <button
            onClick={() => {
              onRemovePerson(selectedPerson.id);
              setSelectedPersonId(null);
              playClickSound();
            }}
            className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-300 hover:bg-red-500/20 border border-red-400/20 transition-all flex items-center justify-center gap-1"
          >
            <Trash2 className="w-3 h-3" /> Remove
          </button>
        </div>
      </motion.div>
    );
  };

  // ---------------------------------------------------------------------------
  // Connection form
  // ---------------------------------------------------------------------------

  const renderConnectionForm = () => {
    const fromPerson = connectionFrom ? personMap.get(connectionFrom) : null;
    const toPerson = connectionTo ? personMap.get(connectionTo) : null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-4 space-y-3"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
            <Link2 className="w-4 h-4" /> New Connection
          </h3>
          <button onClick={handleCancelConnection} className="text-slate-400 hover:text-slate-200 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-400">
          <span className="text-indigo-300 font-medium">{fromPerson?.name}</span>
          {" → "}
          <span className="text-indigo-300 font-medium">{toPerson?.name}</span>
        </p>

        {/* Style */}
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Style</label>
          <div className="flex flex-wrap gap-1.5">
            {CONNECTION_STYLES.map((s) => (
              <button
                key={s.value}
                onClick={() => setConnStyle(s.value)}
                className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1",
                  connStyle === s.value
                    ? "border text-slate-200"
                    : "bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10",
                )}
                style={
                  connStyle === s.value
                    ? { backgroundColor: `${s.color}20`, borderColor: `${s.color}60` }
                    : undefined
                }
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Directionality */}
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Direction</label>
          <div className="flex gap-1.5">
            {DIRECTIONALITY_OPTIONS.map((d) => (
              <button
                key={d.value}
                onClick={() => setConnDir(d.value)}
                className={cn(
                  "flex-1 py-1.5 rounded-lg text-xs font-medium transition-all",
                  connDir === d.value
                    ? "bg-indigo-500/30 text-indigo-200 border border-indigo-400/30"
                    : "bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10",
                )}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Label */}
        <input
          type="text"
          value={connLabel}
          onChange={(e) => setConnLabel(e.target.value)}
          placeholder="Label (optional)..."
          maxLength={30}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-indigo-400/50 transition-colors"
        />

        <button
          onClick={handleCreateConnection}
          className="w-full py-2 rounded-lg text-sm font-medium bg-indigo-500/30 text-indigo-200 hover:bg-indigo-500/40 border border-indigo-400/30 transition-all"
        >
          Create Connection
        </button>
      </motion.div>
    );
  };

  // ---------------------------------------------------------------------------
  // Legend
  // ---------------------------------------------------------------------------

  const renderLegend = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-4 space-y-2"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4" /> Legend
        </h3>
        <button onClick={() => setShowLegend(false)} className="text-slate-400 hover:text-slate-200 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-1.5">
        <p className="text-xs text-slate-500 font-medium">Connection Types</p>
        {CONNECTION_STYLES.map((cs) => (
          <div key={cs.value} className="flex items-center gap-2 text-xs text-slate-400">
            <div className="w-8 h-0.5 flex-shrink-0" style={{ backgroundColor: cs.color }} />
            <span>{cs.label} — {cs.desc}</span>
          </div>
        ))}
      </div>

      <div className="space-y-1.5 pt-1">
        <p className="text-xs text-slate-500 font-medium">Emotional Tones</p>
        {EMOTIONAL_TONES.map((t) => (
          <div key={t.value} className="flex items-center gap-2 text-xs text-slate-400">
            <div className="w-3 h-3 rounded-full flex-shrink-0 border" style={{ borderColor: t.color }} />
            <span>{t.label}</span>
          </div>
        ))}
      </div>

      <div className="space-y-1.5 pt-1">
        <p className="text-xs text-slate-500 font-medium">Symbols</p>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="text-slate-500">✝</span>
          <span>Deceased (halo + transparency)</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="text-yellow-400">●</span>
          <span>Pulsing ring = selected for connection</span>
        </div>
      </div>
    </motion.div>
  );

  // ---------------------------------------------------------------------------
  // Ring stat badges
  // ---------------------------------------------------------------------------

  const renderRingStats = () => (
    <div className="flex flex-wrap gap-2">
      {[1, 2, 3, 4].map((r) => (
        <div
          key={r}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/5 text-xs"
        >
          <Users className="w-3 h-3 text-slate-500" />
          <span className="text-slate-400">{RING_LABELS[r]}:</span>
          <span className="text-slate-200 font-semibold">{ringCounts[r]}</span>
        </div>
      ))}
    </div>
  );

  // ---------------------------------------------------------------------------
  // Main render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-base font-semibold text-slate-200 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          Social Atom
          <span className="text-xs text-slate-500 font-normal ml-1">
            {people.length} {people.length === 1 ? "person" : "people"} · {connections.length} connections
          </span>
        </h2>

        <div className="flex items-center gap-2">
          {/* Legend toggle */}
          <button
            onClick={() => {
              setShowLegend((v) => !v);
              playClickSound();
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-slate-400 hover:bg-white/10 border border-white/5 transition-all"
          >
            Legend
          </button>

          {/* Connection mode toggle */}
          <button
            onClick={() => {
              setConnectionMode((v) => !v);
              setConnectionFrom(null);
              setConnectionTo(null);
              setShowConnectionForm(false);
              playClickSound();
            }}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1",
              connectionMode
                ? "bg-amber-500/20 text-amber-200 border border-amber-400/30"
                : "bg-white/5 text-slate-400 hover:bg-white/10 border border-white/5",
            )}
          >
            <Link2 className="w-3.5 h-3.5" />
            {connectionMode ? "Cancel Link" : "Link"}
          </button>

          {/* Add person */}
          <button
            onClick={() => {
              setShowAddForm((v) => !v);
              setSelectedPersonId(null);
              setEditingPersonId(null);
              playClickSound();
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-500/20 text-indigo-200 hover:bg-indigo-500/30 border border-indigo-400/20 transition-all flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>

          {/* Clear (clinician only) */}
          {isClinician && people.length > 0 && (
            <button
              onClick={() => {
                onClear();
                playClickSound();
                setSelectedPersonId(null);
                setEditingPersonId(null);
                setConnectionMode(false);
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-300 hover:bg-red-500/20 border border-red-400/20 transition-all flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Ring stats */}
      {people.length > 0 && renderRingStats()}

      {/* Connection mode instruction */}
      <AnimatePresence>
        {connectionMode && !showConnectionForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-lg border border-amber-400/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-200"
          >
            {connectionFrom
              ? `Tap a second person to connect with ${personMap.get(connectionFrom)?.name || "selected"}.`
              : "Tap the first person to start a connection."}
          </motion.div>
        )}
      </AnimatePresence>

      {/* SVG Visualization */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm overflow-hidden"
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
          className="w-full h-auto select-none"
          style={{ touchAction: "none", maxHeight: "65vh" }}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
          onTouchCancel={handleDragEnd}
        >
          {svgDefs}

          {/* Background radial gradient */}
          <rect x="0" y="0" width={SVG_SIZE} height={SVG_SIZE} fill="url(#bg-radial)" />

          {/* Concentric rings */}
          {renderRings}

          {/* Center glow */}
          <circle cx={CENTER} cy={CENTER} r={40} fill="url(#center-glow)" />

          {/* Center "ME" */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r={28}
            fill="rgba(139,92,246,0.2)"
            stroke="rgba(139,92,246,0.4)"
            strokeWidth={1.5}
          />
          <circle
            cx={CENTER}
            cy={CENTER - 5}
            r={16}
            fill="url(#sheen-gradient)"
            opacity={0.15}
          />
          <text
            x={CENTER}
            y={CENTER + 1}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={14}
            fontWeight={700}
            fill="rgba(196,181,253,0.9)"
            style={{ userSelect: "none" }}
          >
            ME
          </text>

          {/* Connections */}
          {renderConnections}

          {/* People */}
          {renderPeople}

          {/* Drag ghost line from connectionFrom to cursor (while in connection mode and picking second) */}
          {connectionMode && connectionFrom && !showConnectionForm && dragPos === null && (
            <>
              {/* We don't draw a live line since we don't track mouse pos outside drag.
                  The pulsing ring on the selected person is the visual cue. */}
            </>
          )}
        </svg>
      </motion.div>

      {/* Panels below the SVG */}
      <AnimatePresence mode="wait">
        {showLegend && <div key="legend">{renderLegend()}</div>}
        {showAddForm && !showConnectionForm && !editingPersonId && (
          <div key="add-form">{renderAddForm()}</div>
        )}
        {showConnectionForm && <div key="conn-form">{renderConnectionForm()}</div>}
        {editingPersonId && <div key="edit-panel">{renderEditPanel()}</div>}
        {selectedPerson && !editingPersonId && !showAddForm && !showConnectionForm && (
          <div key="detail">{renderDetailPopover()}</div>
        )}
      </AnimatePresence>
    </div>
  );
}
