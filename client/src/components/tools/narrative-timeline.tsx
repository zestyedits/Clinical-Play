import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { playPlaceSound } from "@/lib/audio-feedback";
import { Plus, X, Trash2, RotateCcw } from "lucide-react";

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
      <div className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231B2A4A' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
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
              </defs>
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
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div
                      className="w-10 h-10 md:w-12 md:h-12 rounded-full shadow-lg flex items-center justify-center border-2 border-white/50"
                      style={{ backgroundColor: evt.color }}
                    >
                      <div className="w-3 h-3 rounded-full bg-white/30" />
                    </div>

                    {/* Label */}
                    <div className={cn(
                      "absolute left-1/2 -translate-x-1/2 whitespace-nowrap",
                      isAbove ? "-top-8" : "-bottom-8"
                    )}>
                      <span className="text-xs font-medium text-primary bg-white/70 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm border border-white/30">
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
            <div className="bg-white/90 backdrop-blur-2xl border-t border-white/30 p-6 shadow-2xl">
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
                          newColor === c ? "border-primary scale-110 shadow-md" : "border-transparent hover:scale-105"
                        )}
                        style={{ backgroundColor: c }}
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
