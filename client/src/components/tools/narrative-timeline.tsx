import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { playPlaceSound } from "@/lib/audio-feedback";
import { Plus, X, Trash2, RotateCcw } from "lucide-react";

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
}

const STONE_COLORS = ["#1B2A4A", "#A8C5A0", "#C9A96E", "#7B8FA1", "#E8B4BC", "#9DB5B2"];

export function NarrativeTimeline({ events, onAddEvent, onRemoveEvent, onUpdateEvent, onClear, isClinician }: NarrativeTimelineProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newColor, setNewColor] = useState(STONE_COLORS[0]);
  const [clickPosition, setClickPosition] = useState<number>(0.5);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const handleTimelineClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
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
  }, []);

  const handleSubmitEvent = useCallback(() => {
    if (!newLabel.trim()) return;
    playPlaceSound();
    onAddEvent(newLabel.trim(), newDesc.trim() || null, clickPosition, newColor);
    setShowAddForm(false);
    setNewLabel("");
    setNewDesc("");
  }, [newLabel, newDesc, clickPosition, newColor, onAddEvent]);

  const sortedEvents = [...events].sort((a, b) => a.position - b.position);

  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden" data-testid="narrative-timeline-container"
      style={{ background: "linear-gradient(180deg, #f0f4f0 0%, #e8ede8 40%, #dde5dd 100%)" }}
    >
      {/* Organic noise texture */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.04 }}>
        <filter id="timeline-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#timeline-noise)" />
      </svg>

      {/* Ambient color blobs */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(168,197,160,0.15) 0%, transparent 70%)",
          top: "-10%",
          left: "10%",
          animation: "ambient-drift 20s ease-in-out infinite",
        }}
      />
      <div
        className="absolute w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(27,42,74,0.08) 0%, transparent 70%)",
          bottom: "-5%",
          right: "15%",
          animation: "ambient-drift 25s ease-in-out infinite reverse",
        }}
      />

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
        {isClinician && events.length > 0 && (
          <button
            onClick={onClear}
            className="min-w-[44px] min-h-[44px] p-2 rounded-xl hover:bg-white/50 transition-colors cursor-pointer text-muted-foreground hover:text-destructive"
            data-testid="button-clear-timeline"
            title="Clear timeline"
          >
            <RotateCcw size={18} />
          </button>
        )}
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
          <div className="relative min-w-[600px] md:min-w-[1200px] h-48">
            {/* River Path */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1200 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="riverGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#A8C5A0" stopOpacity="0.3" />
                  <stop offset="50%" stopColor="#1B2A4A" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#A8C5A0" stopOpacity="0.3" />
                </linearGradient>
                <style>{`
                  @keyframes river-flow {
                    from { stroke-dashoffset: 0; }
                    to { stroke-dashoffset: -36; }
                  }
                `}</style>
              </defs>
              {/* Ambient glow path */}
              <path
                d="M 0 100 Q 150 60, 300 100 Q 450 140, 600 100 Q 750 60, 900 100 Q 1050 140, 1200 100"
                fill="none"
                stroke="url(#riverGrad)"
                strokeWidth="60"
                strokeLinecap="round"
                opacity="0.15"
                style={{ filter: "blur(8px)" }}
              />
              <path
                d="M 0 100 Q 150 60, 300 100 Q 450 140, 600 100 Q 750 60, 900 100 Q 1050 140, 1200 100"
                fill="none"
                stroke="url(#riverGrad)"
                strokeWidth="40"
                strokeLinecap="round"
              />
              <path
                d="M 0 100 Q 150 60, 300 100 Q 450 140, 600 100 Q 750 60, 900 100 Q 1050 140, 1200 100"
                fill="none"
                stroke="#1B2A4A"
                strokeWidth="3"
                strokeDasharray="8 8"
                opacity="0.2"
              />
              {/* Animated shimmer path */}
              <path
                d="M 0 100 Q 150 60, 300 100 Q 450 140, 600 100 Q 750 60, 900 100 Q 1050 140, 1200 100"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeDasharray="12 24"
                opacity="0.3"
                strokeLinecap="round"
                style={{ animation: "river-flow 4s linear infinite" }}
              />
            </svg>

            {/* Start/End Markers */}
            <div className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium uppercase tracking-wider opacity-50">
              Past
            </div>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium uppercase tracking-wider opacity-50">
              Now
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
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedEvent(selectedEvent === evt.id ? null : evt.id);
                  }}
                  data-testid={`timeline-event-${evt.id}`}
                >
                  {/* Connector line to river */}
                  <div
                    className="absolute left-1/2 -translate-x-1/2 w-px bg-primary/15"
                    style={{
                      top: isAbove ? "100%" : "auto",
                      bottom: isAbove ? "auto" : "100%",
                      height: isAbove ? "30px" : "30px",
                    }}
                  />

                  {/* Stone */}
                  <motion.div
                    className="relative"
                    whileHover={{ scale: 1.12, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div
                      className="w-10 h-10 md:w-12 md:h-12 rounded-full shadow-lg flex items-center justify-center border-2 border-white/50 relative overflow-hidden"
                      style={{
                        background: `radial-gradient(circle at 35% 30%, ${lightenColor(evt.color, 30)} 0%, ${evt.color} 60%, ${darkenColor(evt.color, 20)} 100%)`,
                        boxShadow: `0 4px 12px ${evt.color}40, inset 0 1px 3px rgba(255,255,255,0.3)`,
                      }}
                    >
                      <div className="absolute top-1 left-1.5 w-3 h-2 rounded-full bg-white/25 blur-[1px]" />
                      <div className="w-3 h-3 rounded-full bg-white/30" />
                    </div>

                    {/* Label */}
                    <div className={cn(
                      "absolute left-1/2 -translate-x-1/2 whitespace-nowrap",
                      isAbove ? "-top-8" : "-bottom-8"
                    )}>
                      <span className="text-xs font-medium text-primary glass px-3 py-1.5 rounded-xl shadow-sm">
                        {evt.label}
                      </span>
                    </div>
                  </motion.div>

                  {/* Expanded detail */}
                  <AnimatePresence>
                    {selectedEvent === evt.id && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className={cn(
                          "absolute left-1/2 -translate-x-1/2 w-48 z-50",
                          isAbove ? "top-16" : "bottom-16"
                        )}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-4 shadow-xl border border-white/30">
                          <p className="font-serif text-primary font-medium text-sm mb-1">{evt.label}</p>
                          {evt.description && (
                            <p className="text-xs text-muted-foreground leading-relaxed mb-2">{evt.description}</p>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveEvent(evt.id);
                              setSelectedEvent(null);
                            }}
                            className="flex items-center gap-1 text-xs text-destructive hover:text-destructive/80 cursor-pointer min-h-[44px] min-w-[44px] justify-center w-full"
                            data-testid={`button-remove-event-${evt.id}`}
                          >
                            <Trash2 size={12} />
                            Remove
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
      {events.length === 0 && !showAddForm && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <motion.p
            className="text-muted-foreground/50 text-lg font-serif"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Click anywhere on the river to begin...
          </motion.p>
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
                  <h3 className="font-serif text-lg text-primary">Drop a Stone</h3>
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
                    <span className="text-xs text-muted-foreground mr-1">Color:</span>
                    {STONE_COLORS.map(c => (
                      <button
                        key={c}
                        onClick={() => setNewColor(c)}
                        className={cn(
                          "w-7 h-7 rounded-full cursor-pointer transition-all border-2",
                          newColor === c ? "border-primary" : "border-transparent hover:scale-105"
                        )}
                        style={{
                          backgroundColor: c,
                          boxShadow: newColor === c
                            ? `0 0 0 3px rgba(255,255,255,0.8), 0 0 0 5px ${c}, 0 0 15px ${c}40`
                            : `0 2px 6px rgba(0,0,0,0.15)`,
                          transform: newColor === c ? "scale(1.1)" : "scale(1)",
                        }}
                        data-testid={`button-color-${c}`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={handleSubmitEvent}
                    disabled={!newLabel.trim()}
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
    </div>
  );
}
