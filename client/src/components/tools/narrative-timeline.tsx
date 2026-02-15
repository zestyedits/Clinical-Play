import { useState, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { playRippleSound } from "@/lib/audio-feedback";
import { Plus, X, Trash2, RotateCcw, Hash, MessageSquare } from "lucide-react";
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

export interface TimelineEventData {
  id: string;
  label: string;
  description: string | null;
  position: number;
  color: string;
  placedBy: string | null;
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
      symbol: ['🍃', '🍂', '🌿', '🪨', '✨', '💧'][i],
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

export function NarrativeTimeline({ events, onAddEvent, onRemoveEvent, onUpdateEvent, onClear, isClinician, toolSettings, onSettingsUpdate }: NarrativeTimelineProps) {
  const settings = { ...DEFAULT_NARRATIVE_TIMELINE_SETTINGS, ...toolSettings } as NarrativeTimelineSettings;
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newColor, setNewColor] = useState(STONE_COLORS[0]);
  const [clickPosition, setClickPosition] = useState<number>(0.5);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [ripples, setRipples] = useState<Array<{ id: number; x: string; y: string }>>([]);
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
    setNewColor(STONE_COLORS[Math.floor(Math.random() * STONE_COLORS.length)]);

    // Add ripple at click position
    const rippleX = `${((e.clientX - rect.left) / rect.width) * 100}%`;
    const rippleY = `${((e.clientY - rect.top) / rect.height) * 100}%`;
    const id = rippleId.current++;
    setRipples(prev => [...prev, { id, x: rippleX, y: rippleY }]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 2000);
  }, []);

  const handleSubmitEvent = useCallback(() => {
    if (!newLabel.trim()) return;
    playRippleSound();
    onAddEvent(newLabel.trim(), newDesc.trim() || null, clickPosition, newColor);
    setShowAddForm(false);
    setNewLabel("");
    setNewDesc("");
  }, [newLabel, newDesc, clickPosition, newColor, onAddEvent]);

  const sortedEvents = [...events].sort((a, b) => a.position - b.position);

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
        <div className="absolute left-[3%] bottom-[25%] text-4xl opacity-[0.08] select-none">🌲</div>
        <div className="absolute left-[6%] bottom-[28%] text-3xl opacity-[0.06] select-none">🌳</div>
        <div className="absolute right-[4%] bottom-[27%] text-4xl opacity-[0.07] select-none">🌲</div>
        <div className="absolute right-[8%] bottom-[24%] text-3xl opacity-[0.05] select-none">🌳</div>

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

            {/* Start/End Markers with icons */}
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
              <span className="text-lg opacity-30 select-none">🌅</span>
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider opacity-40">Past</span>
            </div>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
              <span className="text-lg opacity-30 select-none">🌟</span>
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
                      <div className="w-2.5 h-2.5 rounded-full bg-white/25" />
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

                  {/* Expanded detail */}
                  <AnimatePresence>
                    {selectedEvent === evt.id && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className={cn(
                          "absolute left-1/2 -translate-x-1/2 w-52 z-50",
                          isAbove ? "top-16" : "bottom-16"
                        )}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="bg-white/92 backdrop-blur-xl rounded-2xl p-4 shadow-xl border"
                          style={{ borderColor: `${evt.color}25` }}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-4 h-4 rounded-full shrink-0"
                              style={{
                                background: `radial-gradient(circle at 35% 30%, ${lightenColor(evt.color, 30)}, ${evt.color})`,
                              }}
                            />
                            <p className="font-serif text-primary font-medium text-sm">{evt.label}</p>
                          </div>
                          {evt.description && (
                            <p className="text-xs text-muted-foreground leading-relaxed mb-3 pl-6">{evt.description}</p>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveEvent(evt.id);
                              setSelectedEvent(null);
                            }}
                            className="flex items-center gap-1 text-xs text-destructive hover:text-destructive/80 cursor-pointer min-h-[44px] min-w-[44px] justify-center w-full rounded-xl hover:bg-destructive/5 transition-colors"
                            data-testid={`button-remove-event-${evt.id}`}
                          >
                            <Trash2 size={12} />
                            Remove Stone
                          </button>
                        </div>
                      </motion.div>
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
              🪨
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
                    <span className="text-xl select-none">🪨</span>
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
