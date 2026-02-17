/**
 * The Volume Mixer — Clinical Luxury IFS/ACT Parts Instrument
 *
 * A tactile audio-mixing-board metaphor where clients externalize internal
 * "parts" or "voices" as mixer channels with vertical faders.
 */

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring, useAnimation, PanInfo } from "framer-motion";
import { Plus, Settings, Camera, HelpCircle, X, Volume2, VolumeX, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  startDrone, updateDrone, stopDrone, stopAllDrones,
  playSoloPing, playMuteThud, playResetSweep, playFizzle, playBoostChime,
  setDroneResonance as setDroneResonance_audio,
} from "@/lib/volume-mixer-audio";

// ─── Types ──────────────────────────────────────────────────────────────────

interface Channel {
  id: string;
  label: string;
  value: number; // 0-100
  isMuted: boolean;
  isSoloed: boolean;
  isBoosted: boolean;
}

interface VolumeMixerProps {
  isClinician: boolean;
  toolSettings?: Record<string, unknown>;
  onSettingsUpdate?: (updates: Record<string, unknown>) => void;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const SUGGESTION_PARTS = [
  "The Protector",
  "The Inner Critic",
  "The Scared One",
  "The Achievement Seeker",
  "The Wise Self",
  "The Pleaser",
];

const WARM_ZONE_THRESHOLD = 85;
const BOOST_SNAP_THRESHOLD = 70;
const BOOST_SNAP_TARGET = 80;
const RESET_NEUTRAL = 20;
const TRACK_HEIGHT = 280; // px for fader track
const MAX_CHANNELS = 8;

// ─── Persistence helpers ────────────────────────────────────────────────────

function loadState(): { channels: Channel[]; audioEnabled: boolean; hapticsEnabled: boolean; droneResonance: number } {
  try {
    const raw = localStorage.getItem("vm-board-state");
    if (raw) {
      const parsed = JSON.parse(raw);
      return { channels: parsed.channels || [], audioEnabled: !!parsed.audioEnabled, hapticsEnabled: !!parsed.hapticsEnabled, droneResonance: parsed.droneResonance ?? 0.5 };
    }
  } catch {}
  return { channels: [], audioEnabled: false, hapticsEnabled: false, droneResonance: 0.5 };
}

function saveState(channels: Channel[], audioEnabled: boolean, hapticsEnabled: boolean, droneResonance: number) {
  try {
    localStorage.setItem("vm-board-state", JSON.stringify({ channels, audioEnabled, hapticsEnabled, droneResonance }));
  } catch {}
}

function loadTutorialSeen(): boolean {
  try {
    return localStorage.getItem("vm-hasSeenTutorial") === "true";
  } catch {}
  return false;
}

function saveTutorialSeen() {
  try {
    localStorage.setItem("vm-hasSeenTutorial", "true");
  } catch {}
}

// ─── ChannelStrip Sub-Component ─────────────────────────────────────────────

interface ChannelStripProps {
  channel: Channel;
  index: number;
  totalChannels: number;
  isAnySoloed: boolean;
  audioEnabled: boolean;
  onValueChange: (id: string, value: number) => void;
  onMuteToggle: (id: string) => void;
  onSoloToggle: (id: string) => void;
  onBoostToggle: (id: string) => void;
  onLabelEdit: (id: string, label: string) => void;
  onDelete: (id: string) => void;
  guideStep: number | null;
  channelRef?: React.RefObject<HTMLDivElement | null>;
}

function ChannelStrip({
  channel, index, totalChannels, isAnySoloed, audioEnabled,
  onValueChange, onMuteToggle, onSoloToggle, onBoostToggle,
  onLabelEdit, onDelete, guideStep, channelRef,
}: ChannelStripProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(channel.label);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // Boost magnetic tension state
  const [boostTension, setBoostTension] = useState(0); // 0-1 how hard they're pulling against magnet
  const [magnetBroken, setMagnetBroken] = useState(false);
  const magnetBreakTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [rawDragValue, setRawDragValue] = useState<number | null>(null);

  // Random tape tilt for this strip (stable per mount)
  const tapeTilt = useMemo(() => (Math.random() - 0.5) * 1.2, []);

  const isWarmZone = channel.value >= WARM_ZONE_THRESHOLD;
  const warmIntensity = isWarmZone ? (channel.value - WARM_ZONE_THRESHOLD) / (100 - WARM_ZONE_THRESHOLD) : 0;
  const isDimmed = isAnySoloed && !channel.isSoloed;
  const fillPercent = channel.isMuted ? 0 : channel.value;

  // Adaptive width
  const stripWidth = totalChannels <= 2 ? "flex-1 max-w-[200px]"
    : totalChannels <= 4 ? "flex-1 max-w-[140px]"
    : "flex-1 max-w-[100px]";

  // Audio drone management
  useEffect(() => {
    if (!audioEnabled) {
      stopDrone(channel.id);
      return;
    }
    if (isWarmZone && !channel.isMuted) {
      const pan = totalChannels > 1 ? (index / (totalChannels - 1)) * 2 - 1 : 0;
      startDrone(channel.id, pan);
      updateDrone(channel.id, warmIntensity);
    } else {
      stopDrone(channel.id);
    }
  }, [channel.value, channel.isMuted, isWarmZone, warmIntensity, audioEnabled, channel.id, index, totalChannels]);

  // Cleanup drone on unmount
  useEffect(() => {
    return () => { stopDrone(channel.id); };
  }, [channel.id]);

  // Reset magnet when boost is toggled
  useEffect(() => {
    if (channel.isBoosted) setMagnetBroken(false);
  }, [channel.isBoosted]);

  // Handle fader drag via pointer events
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (channel.isMuted) return;
    const track = trackRef.current;
    if (!track) return;
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(true);

    const rect = track.getBoundingClientRect();
    const y = Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / rect.height));
    let newVal = Math.round(y * 100);

    // Boost magnetic resistance (unless broken)
    if (channel.isBoosted && !magnetBroken && newVal < BOOST_SNAP_THRESHOLD) {
      setRawDragValue(newVal);
      setBoostTension(1 - newVal / BOOST_SNAP_THRESHOLD);
      // Start break timer
      if (!magnetBreakTimer.current) {
        magnetBreakTimer.current = setTimeout(() => {
          setMagnetBroken(true);
          setBoostTension(0);
          magnetBreakTimer.current = null;
        }, 1500);
      }
      newVal = BOOST_SNAP_TARGET;
    } else {
      setBoostTension(0);
      setRawDragValue(null);
    }

    onValueChange(channel.id, newVal);
  }, [channel.isMuted, channel.isBoosted, magnetBroken, channel.id, onValueChange]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const y = Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / rect.height));
    let newVal = Math.round(y * 100);

    if (channel.isBoosted && !magnetBroken && newVal < BOOST_SNAP_THRESHOLD) {
      setRawDragValue(newVal);
      setBoostTension(Math.min(1, 1 - newVal / BOOST_SNAP_THRESHOLD));
      // Maintain break timer if already started
      if (!magnetBreakTimer.current) {
        magnetBreakTimer.current = setTimeout(() => {
          setMagnetBroken(true);
          setBoostTension(0);
          magnetBreakTimer.current = null;
        }, 1500);
      }
      newVal = BOOST_SNAP_TARGET;
    } else {
      setBoostTension(0);
      setRawDragValue(null);
      // Clear break timer if they moved back up
      if (magnetBreakTimer.current) {
        clearTimeout(magnetBreakTimer.current);
        magnetBreakTimer.current = null;
      }
    }

    onValueChange(channel.id, newVal);
  }, [isDragging, channel.isBoosted, magnetBroken, channel.id, onValueChange]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    setBoostTension(0);
    setRawDragValue(null);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);

    // Clear break timer
    if (magnetBreakTimer.current) {
      clearTimeout(magnetBreakTimer.current);
      magnetBreakTimer.current = null;
    }

    // Boost snap-back: if boosted and magnet intact, spring back with chime
    if (channel.isBoosted && !magnetBroken && channel.value < BOOST_SNAP_TARGET) {
      if (audioEnabled) playBoostChime();
      onValueChange(channel.id, BOOST_SNAP_TARGET);
    }
  }, [isDragging, channel.isBoosted, magnetBroken, channel.value, channel.id, onValueChange, audioEnabled]);

  // Long press to edit label
  const handleLabelPointerDown = useCallback(() => {
    longPressTimer.current = setTimeout(() => {
      setIsEditing(true);
      setEditLabel(channel.label);
    }, 800);
  }, [channel.label]);

  const handleLabelPointerUp = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleLabelSubmit = useCallback(() => {
    setIsEditing(false);
    if (editLabel.trim()) {
      onLabelEdit(channel.id, editLabel.trim());
    }
  }, [editLabel, channel.id, onLabelEdit]);

  // Swipe-to-delete
  const handleStripPan = useCallback((_: unknown, info: PanInfo) => {
    if (info.offset.y < -60) {
      setSwipeOffset(info.offset.y);
    }
  }, []);

  const handleStripPanEnd = useCallback((_: unknown, info: PanInfo) => {
    if (info.offset.y < -120) {
      setIsDeleting(true);
      if (audioEnabled) playFizzle();
      setTimeout(() => onDelete(channel.id), 300);
    } else {
      setSwipeOffset(0);
    }
  }, [audioEnabled, channel.id, onDelete]);

  // Guide highlight for fader cap
  const isGuideHighlighted = guideStep === 2;
  const isControlsHighlighted = guideStep === 3;

  return (
    <motion.div
      ref={channelRef}
      className={cn(
        stripWidth,
        "relative flex flex-col items-center select-none transition-all duration-500",
        isDimmed && "opacity-20 blur-[12px] saturate-[0.2]",
        channel.isMuted && "grayscale",
      )}
      style={{
        y: swipeOffset < -60 ? swipeOffset + 60 : 0,
        opacity: isDeleting ? 0 : 1,
      }}
      initial={{ opacity: 0, scale: 0.8, x: 30 }}
      animate={{ opacity: isDeleting ? 0 : 1, scale: isDeleting ? 0.5 : 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.5, y: -80 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      layout
      onPan={handleStripPan}
      onPanEnd={handleStripPanEnd}
    >
      {/* Glow propagation at 100% */}
      {channel.value >= 98 && !channel.isMuted && (
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none z-0"
          style={{
            boxShadow: `0 0 30px 10px rgba(217, 119, 6, ${0.15 * warmIntensity})`,
          }}
        />
      )}

      {/* Fader Track */}
      <div
        ref={trackRef}
        className={cn(
          "relative w-full rounded-xl touch-none",
          boostTension > 0 ? "cursor-grabbing" : isDragging ? "cursor-grabbing" : "cursor-pointer",
        )}
        style={{
          height: TRACK_HEIGHT,
          boxShadow: "inset 0 2px 8px rgba(0,0,0,0.6), inset 0 0 2px rgba(0,0,0,0.3)",
          background: "#1a1a1a",
          ...(channel.isBoosted ? { width: "110%", marginLeft: "-5%" } : {}),
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Track fill gradient */}
        <div
          className="absolute bottom-0 left-0 right-0 rounded-b-xl transition-all"
          style={{
            height: `${fillPercent}%`,
            background: fillPercent > WARM_ZONE_THRESHOLD
              ? `linear-gradient(to top, #0d9488, #d4a017 60%, #c2410c)`
              : `linear-gradient(to top, #0d9488, #d4a017)`,
            opacity: channel.isMuted ? 0.15 : 0.7,
            transition: isDragging ? "none" : "height 0.15s ease-out",
          }}
        />

        {/* Warm zone pulse overlay */}
        {isWarmZone && !channel.isMuted && (
          <motion.div
            className="absolute bottom-0 left-0 right-0 rounded-b-xl pointer-events-none"
            style={{ height: `${fillPercent}%` }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="w-full h-full rounded-b-xl" style={{
              background: "linear-gradient(to top, transparent, rgba(217, 119, 6, 0.4))",
            }} />
          </motion.div>
        )}

        {/* Boost tension elastic trail */}
        {boostTension > 0 && rawDragValue !== null && (
          <div
            className="absolute left-1/2 -translate-x-1/2 w-[2px] pointer-events-none z-5"
            style={{
              bottom: `${rawDragValue}%`,
              height: `${fillPercent - rawDragValue}%`,
              background: `linear-gradient(to top, rgba(212,175,55,${0.1 + boostTension * 0.4}), rgba(212,175,55,${boostTension * 0.6}))`,
              filter: `blur(${1 + boostTension * 2}px)`,
              transition: isDragging ? "none" : "all 0.15s ease",
            }}
          />
        )}

        {/* Fader Cap */}
        <motion.div
          className={cn(
            "absolute left-1/2 -translate-x-1/2 rounded-lg z-10 pointer-events-none",
            isGuideHighlighted && "ring-2 ring-amber-400/60",
            boostTension > 0 && "cursor-grabbing",
          )}
          style={{
            width: 44,
            height: 24,
            bottom: `calc(${fillPercent}% - 12px)`,
            background: channel.isBoosted
              ? `linear-gradient(180deg, ${boostTension > 0 ? '#f0c040' : '#d4a017'}, #b8860b)`
              : "linear-gradient(180deg, #555, #333)",
            boxShadow: channel.isMuted
              ? "0 1px 2px rgba(0,0,0,0.3)"
              : boostTension > 0
                ? `0 2px 8px rgba(212,175,55,${0.3 + boostTension * 0.3}), 0 1px 2px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)`
                : "0 2px 6px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
            transition: isDragging ? "none" : "bottom 0.15s ease-out",
          }}
          animate={
            boostTension > 0
              ? { x: [0, 1.5 * boostTension, -1.5 * boostTension, 1 * boostTension, -1 * boostTension, 0] }
              : isWarmZone && !channel.isMuted
                ? { x: [0, 1, -1, 0.5, -0.5, 0] }
                : {}
          }
          transition={
            boostTension > 0
              ? { duration: 0.08, repeat: Infinity, ease: "linear" }
              : isWarmZone
                ? { duration: 0.15, repeat: Infinity, ease: "linear" }
                : {}
          }
        >
          {/* Grip lines */}
          <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex flex-col gap-[2px]">
            <div className="h-[1px] bg-white/20 rounded-full" />
            <div className="h-[1px] bg-white/20 rounded-full" />
            <div className="h-[1px] bg-white/20 rounded-full" />
          </div>
        </motion.div>

        {/* Value label */}
        <div
          className="absolute left-1/2 -translate-x-1/2 text-[10px] font-mono text-white/40 pointer-events-none"
          style={{ bottom: `calc(${fillPercent}% + 16px)`, transition: isDragging ? "none" : "bottom 0.15s ease-out" }}
        >
          {channel.value}
        </div>
      </div>

      {/* Controls: Mute / Solo / Boost */}
      <div
        className={cn(
          "flex items-center gap-1 mt-2",
          isControlsHighlighted && "ring-2 ring-amber-400/60 rounded-lg p-0.5",
        )}
      >
        {/* Mute */}
        <button
          onClick={() => {
            if (audioEnabled) playMuteThud();
            onMuteToggle(channel.id);
          }}
          className={cn(
            "w-8 h-8 rounded-md flex items-center justify-center text-[9px] font-bold tracking-wider transition-all",
            channel.isMuted
              ? "bg-white/10 text-white/40 border border-white/10"
              : "bg-white/5 text-white/25 border border-white/5 hover:bg-white/10 hover:text-white/40",
          )}
          title="Mute (Acknowledge)"
        >
          M
        </button>

        {/* Solo */}
        <button
          onClick={() => {
            if (audioEnabled && !channel.isSoloed) playSoloPing();
            onSoloToggle(channel.id);
          }}
          className={cn(
            "w-8 h-8 rounded-md flex items-center justify-center text-[9px] font-bold tracking-wider transition-all",
            channel.isSoloed
              ? "bg-amber-500/30 text-amber-300 border border-amber-500/40"
              : "bg-white/5 text-white/25 border border-white/5 hover:bg-white/10 hover:text-white/40",
          )}
          title="Solo (Presence)"
        >
          S
        </button>

        {/* Boost */}
        <button
          onClick={() => onBoostToggle(channel.id)}
          className={cn(
            "w-8 h-8 rounded-md flex items-center justify-center text-[9px] font-bold tracking-wider transition-all",
            channel.isBoosted
              ? "bg-gradient-to-b from-amber-400/30 to-amber-600/20 text-amber-300 border border-amber-400/40 shadow-[0_0_8px_rgba(212,175,55,0.2)]"
              : "bg-white/5 text-white/25 border border-white/5 hover:bg-white/10 hover:text-white/40",
          )}
          title="Boost (Resource)"
        >
          B
        </button>
      </div>

      {/* Scribble Strip — Console Tape Label */}
      <div
        className="mt-2 w-full px-1"
        onPointerDown={handleLabelPointerDown}
        onPointerUp={handleLabelPointerUp}
        onPointerCancel={handleLabelPointerUp}
      >
        {isEditing ? (
          <input
            type="text"
            value={editLabel}
            onChange={(e) => setEditLabel(e.target.value)}
            onBlur={handleLabelSubmit}
            onKeyDown={(e) => e.key === "Enter" && handleLabelSubmit()}
            autoFocus
            className="w-full bg-[#e0e0e0] text-[#121212] text-[10px] font-mono text-center px-2 py-1.5 border-none outline-none"
            style={{
              transform: `rotate(${tapeTilt}deg)`,
              borderRadius: "1px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.15), inset 0 0 0 0.5px rgba(0,0,0,0.05)",
            }}
          />
        ) : (
          <motion.div
            className="w-full bg-[#e0e0e0]/90 text-[#121212] text-[10px] font-mono text-center px-2 py-1.5 truncate select-none cursor-default"
            animate={channel.isSoloed ? { scale: [1, 1.05, 1] } : { scale: 1 }}
            transition={channel.isSoloed ? { duration: 0.6, ease: "easeOut" } : {}}
            style={{
              transform: `rotate(${tapeTilt}deg)`,
              borderRadius: "1px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.15), inset 0 0 0 0.5px rgba(0,0,0,0.05)",
              // Torn tape edge effect
              clipPath: "polygon(2% 0%, 98% 1%, 100% 3%, 99% 97%, 97% 100%, 3% 99%, 0% 97%, 1% 2%)",
            }}
          >
            {channel.label}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// ─── GhostMenu Sub-Component ────────────────────────────────────────────────

interface GhostMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (label: string) => void;
  existingLabels: string[];
}

function GhostMenu({ isOpen, onClose, onAdd, existingLabels }: GhostMenuProps) {
  const [label, setLabel] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setLabel("");
      setShowSuggestions(true);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const availableSuggestions = SUGGESTION_PARTS.filter(s => !existingLabels.includes(s));

  const handleSubmit = useCallback(() => {
    const trimmed = label.trim();
    if (trimmed) {
      onAdd(trimmed);
      setLabel("");
      onClose();
    }
  }, [label, onAdd, onClose]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    onAdd(suggestion);
    setLabel("");
    onClose();
  }, [onAdd, onClose]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLabel(e.target.value);
    if (e.target.value.length > 0) {
      setShowSuggestions(false);
    } else {
      setShowSuggestions(true);
    }
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className="fixed left-4 right-4 bottom-24 sm:left-auto sm:right-auto sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[380px] z-50 rounded-2xl overflow-hidden"
            style={{
              background: "rgba(30, 30, 30, 0.85)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 16px 48px rgba(0,0,0,0.4)",
            }}
            initial={{ opacity: 0, scale: 0.9, y: 20, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.95, y: 10, filter: "blur(8px)" }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-5">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/10 transition-all"
              >
                <X size={14} />
              </button>

              {/* Input */}
              <div className="mb-4">
                <input
                  ref={inputRef}
                  type="text"
                  value={label}
                  onChange={handleInputChange}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  placeholder="Name this part..."
                  className="w-full bg-transparent text-white text-lg font-serif placeholder:text-white/25 border-b border-white/15 pb-2 outline-none focus:border-white/30 transition-colors"
                  maxLength={30}
                />
              </div>

              {/* Suggestion Cloud */}
              <AnimatePresence>
                {showSuggestions && availableSuggestions.length > 0 && (
                  <motion.div
                    className="flex flex-wrap gap-2"
                    initial={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {availableSuggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => handleSuggestionClick(s)}
                        className="px-3 py-1.5 rounded-full text-xs text-white/40 border border-white/10 hover:text-white/70 hover:border-white/25 hover:bg-white/5 transition-all"
                      >
                        {s}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Add button when typing */}
              {label.trim() && (
                <motion.button
                  onClick={handleSubmit}
                  className="mt-4 w-full py-2.5 rounded-xl bg-white/10 text-white/70 text-sm font-medium hover:bg-white/15 transition-all"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  Add "{label.trim()}"
                </motion.button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Ghost Guide Sub-Component ──────────────────────────────────────────────

interface GhostGuideProps {
  step: number | null;
  onDismiss: () => void;
}

const GUIDE_TEXTS = [
  "", // step 0 unused
  "Begin by identifying an internal part or feeling.",
  "Slide to represent its current volume in this moment.",
  "Acknowledge a part by muting it, or anchor the Wise Self by boosting it.",
  "Snapshot the internal landscape to save for your clinical records.",
];

function GhostGuide({ step, onDismiss }: GhostGuideProps) {
  if (!step) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[60] pointer-events-auto"
      onClick={onDismiss}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Dim overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Guide text */}
      <motion.div
        className="absolute bottom-32 left-0 right-0 flex justify-center pointer-events-none"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <p className="text-white/70 text-base font-serif italic text-center max-w-xs px-6">
          {GUIDE_TEXTS[step] || ""}
        </p>
      </motion.div>
    </motion.div>
  );
}

// ─── Settings Tray Sub-Component ────────────────────────────────────────────

interface SettingsTrayProps {
  isOpen: boolean;
  onClose: () => void;
  audioEnabled: boolean;
  hapticsEnabled: boolean;
  droneResonance: number;
  onToggleAudio: () => void;
  onToggleHaptics: () => void;
  onDroneResonanceChange: (value: number) => void;
}

function SettingsTray({ isOpen, onClose, audioEnabled, hapticsEnabled, droneResonance, onToggleAudio, onToggleHaptics, onDroneResonanceChange }: SettingsTrayProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="absolute top-12 right-2 z-50 rounded-xl overflow-hidden"
            style={{
              background: "rgba(30, 30, 30, 0.9)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            }}
            initial={{ opacity: 0, scale: 0.9, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            <div className="p-3 space-y-2 min-w-[180px]">
              {/* Audio toggle */}
              <button
                onClick={onToggleAudio}
                className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {audioEnabled ? <Volume2 size={14} className="text-amber-400" /> : <VolumeX size={14} className="text-white/30" />}
                  <span className="text-xs text-white/60">Sound</span>
                </div>
                <div className={cn(
                  "w-8 h-[18px] rounded-full transition-colors relative",
                  audioEnabled ? "bg-amber-500/40" : "bg-white/10",
                )}>
                  <div className={cn(
                    "absolute top-[2px] w-[14px] h-[14px] rounded-full transition-all",
                    audioEnabled ? "left-[16px] bg-amber-400" : "left-[2px] bg-white/30",
                  )} />
                </div>
              </button>

              {/* Haptics toggle */}
              <button
                onClick={onToggleHaptics}
                className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Smartphone size={14} className={hapticsEnabled ? "text-amber-400" : "text-white/30"} />
                  <span className="text-xs text-white/60">Haptics</span>
                </div>
                <div className={cn(
                  "w-8 h-[18px] rounded-full transition-colors relative",
                  hapticsEnabled ? "bg-amber-500/40" : "bg-white/10",
                )}>
                  <div className={cn(
                    "absolute top-[2px] w-[14px] h-[14px] rounded-full transition-all",
                    hapticsEnabled ? "left-[16px] bg-amber-400" : "left-[2px] bg-white/30",
                  )} />
                </div>
              </button>

              {/* Drone Resonance slider */}
              {audioEnabled && (
                <div className="px-3 py-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/60">Drone Resonance</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={droneResonance * 100}
                    onChange={(e) => onDroneResonanceChange(Number(e.target.value) / 100)}
                    className="w-full h-1 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #78716c ${droneResonance * 100}%, #333 ${droneResonance * 100}%)`,
                    }}
                  />
                  <div className="flex justify-between text-[9px] text-white/25 font-serif italic">
                    <span>Deep / Grounded</span>
                    <span>Light / Urgent</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Main VolumeMixer Component ─────────────────────────────────────────────

export function VolumeMixer({ isClinician }: VolumeMixerProps) {
  // Load persisted state
  const initial = useMemo(() => loadState(), []);
  const [channels, setChannels] = useState<Channel[]>(initial.channels);
  const [audioEnabled, setAudioEnabled] = useState(initial.audioEnabled);
  const [hapticsEnabled, setHapticsEnabled] = useState(initial.hapticsEnabled);
  const [droneResonance, setDroneResonance] = useState(initial.droneResonance ?? 0.5);

  const [ghostMenuOpen, setGhostMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [snapshotMode, setSnapshotMode] = useState(false);

  // Fade-in initialization
  const [initialized, setInitialized] = useState(false);

  // Ghost Guide
  const [tutorialSeen, setTutorialSeen] = useState(loadTutorialSeen);
  const [guideStep, setGuideStep] = useState<number | null>(null);
  const [showHelpDot, setShowHelpDot] = useState(tutorialSeen);

  // Global reset ripple + desaturation
  const [ripple, setRipple] = useState<{ x: number; y: number } | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const boardRef = useRef<HTMLDivElement>(null);
  const firstChannelRef = useRef<HTMLDivElement>(null);

  const isAnySoloed = channels.some(c => c.isSoloed);
  const totalVolume = channels.reduce((sum, c) => sum + (c.isMuted ? 0 : c.value), 0);
  const maxPossibleVolume = channels.length * 100;
  const volumeRatio = maxPossibleVolume > 0 ? totalVolume / maxPossibleVolume : 0;

  // Fade-in on mount
  useEffect(() => {
    const timer = setTimeout(() => setInitialized(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Sync drone resonance to audio engine
  useEffect(() => {
    setDroneResonance_audio(droneResonance);
  }, [droneResonance]);

  // Persist state on every change
  useEffect(() => {
    saveState(channels, audioEnabled, hapticsEnabled, droneResonance);
  }, [channels, audioEnabled, hapticsEnabled, droneResonance]);

  // Start tutorial on first load
  useEffect(() => {
    if (!tutorialSeen && channels.length === 0) {
      setGuideStep(1);
    }
  }, [tutorialSeen, channels.length]);

  // Advance guide when first channel is added
  useEffect(() => {
    if (guideStep === 1 && channels.length > 0) {
      setGuideStep(2);
    }
  }, [guideStep, channels.length]);

  // ─── Handlers ─────────────────────────────────────────────────────────

  const handleAddChannel = useCallback((label: string) => {
    if (channels.length >= MAX_CHANNELS) return;
    const newChannel: Channel = {
      id: `ch-${Date.now()}`,
      label,
      value: 50,
      isMuted: false,
      isSoloed: false,
      isBoosted: false,
    };
    setChannels(prev => [...prev, newChannel]);
  }, [channels.length]);

  const handleValueChange = useCallback((id: string, value: number) => {
    setChannels(prev => prev.map(c => c.id === id ? { ...c, value } : c));
  }, []);

  const handleMuteToggle = useCallback((id: string) => {
    setChannels(prev => prev.map(c => c.id === id ? { ...c, isMuted: !c.isMuted } : c));
  }, []);

  const handleSoloToggle = useCallback((id: string) => {
    setChannels(prev => prev.map(c =>
      c.id === id ? { ...c, isSoloed: !c.isSoloed } : c
    ));
  }, []);

  const handleBoostToggle = useCallback((id: string) => {
    setChannels(prev => prev.map(c => c.id === id ? { ...c, isBoosted: !c.isBoosted } : c));
  }, []);

  const handleLabelEdit = useCallback((id: string, label: string) => {
    setChannels(prev => prev.map(c => c.id === id ? { ...c, label } : c));
  }, []);

  const handleDeleteChannel = useCallback((id: string) => {
    stopDrone(id);
    setChannels(prev => prev.filter(c => c.id !== id));
  }, []);

  const handleGlobalReset = useCallback((x: number, y: number) => {
    setRipple({ x, y });
    setIsResetting(true);
    if (audioEnabled) playResetSweep();
    stopAllDrones();
    setChannels(prev => prev.map(c => ({
      ...c,
      value: RESET_NEUTRAL,
      isMuted: false,
      isSoloed: false,
      isBoosted: false,
    })));
    setTimeout(() => setRipple(null), 800);
    // Desaturation bloom-back over 2 seconds
    setTimeout(() => setIsResetting(false), 2000);
  }, [audioEnabled]);

  const handleDismissGuide = useCallback(() => {
    setGuideStep(null);
    setTutorialSeen(true);
    setShowHelpDot(true);
    saveTutorialSeen();
  }, []);

  const handleAdvanceGuide = useCallback(() => {
    if (guideStep === 2) setGuideStep(3);
    else if (guideStep === 3) setGuideStep(4);
    else if (guideStep === 4) handleDismissGuide();
  }, [guideStep, handleDismissGuide]);

  const handleSnapshot = useCallback(async () => {
    setSnapshotMode(true);
    // Wait for UI to update (hide chrome)
    await new Promise(r => setTimeout(r, 150));
    try {
      const html2canvas = (await import("html2canvas")).default;
      const board = boardRef.current;
      if (!board) return;
      const canvas = await html2canvas(board, {
        backgroundColor: "#121212",
        scale: 2,
        ignoreElements: (el) => el.classList.contains("ui-chrome"),
      });

      // Add header with timestamp and client identifier placeholder
      const finalCanvas = document.createElement("canvas");
      const headerHeight = 60;
      finalCanvas.width = canvas.width;
      finalCanvas.height = canvas.height + headerHeight;
      const ctx2d = finalCanvas.getContext("2d");
      if (ctx2d) {
        // Header background
        ctx2d.fillStyle = "#121212";
        ctx2d.fillRect(0, 0, finalCanvas.width, headerHeight);
        // Separator line
        ctx2d.strokeStyle = "rgba(255,255,255,0.08)";
        ctx2d.lineWidth = 1;
        ctx2d.beginPath();
        ctx2d.moveTo(0, headerHeight - 1);
        ctx2d.lineTo(finalCanvas.width, headerHeight - 1);
        ctx2d.stroke();
        // Timestamp
        ctx2d.fillStyle = "rgba(255,255,255,0.35)";
        ctx2d.font = "20px monospace";
        const timestamp = new Date().toLocaleString();
        ctx2d.fillText(timestamp, 24, 25);
        // Client identifier placeholder
        ctx2d.fillStyle = "rgba(255,255,255,0.2)";
        ctx2d.font = "italic 18px Georgia, serif";
        ctx2d.fillText("Client: ________________", 24, 48);
        // Draw mixer board below
        ctx2d.drawImage(canvas, 0, headerHeight);
      }

      const dataUrl = finalCanvas.toDataURL("image/png");
      window.open(dataUrl, "_blank");
    } catch (err) {
      console.error("Snapshot failed:", err);
    } finally {
      setSnapshotMode(false);
    }
  }, []);

  // Two-finger long-press for global reset
  const touchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length >= 2) {
      const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      touchTimer.current = setTimeout(() => {
        handleGlobalReset(midX, midY);
      }, 800);
    }
  }, [handleGlobalReset]);

  const handleTouchEnd = useCallback(() => {
    if (touchTimer.current) {
      clearTimeout(touchTimer.current);
      touchTimer.current = null;
    }
  }, []);

  // Background atmosphere color
  const bgStyle = useMemo(() => {
    const hue = 200 - volumeRatio * 60; // 200 (slate) → 140 (shift toward violet)
    const sat = 10 + volumeRatio * 20;
    const light = 7 + volumeRatio * 3;
    return {
      backgroundColor: `hsl(${hue}, ${sat}%, ${light}%)`,
      transition: "background-color 3.5s ease",
    };
  }, [volumeRatio]);

  return (
    <div
      ref={boardRef}
      className="w-full h-full relative overflow-hidden select-none"
      style={{
        ...bgStyle,
        opacity: initialized ? 1 : 0,
        filter: isResetting ? "saturate(0)" : "saturate(1)",
        transition: `${bgStyle.transition}, opacity 1.5s ease, filter ${isResetting ? "0.2s" : "2s"} ease`,
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {/* Noise grain overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: "128px 128px",
        }}
      />

      {/* Ripple effect on global reset */}
      <AnimatePresence>
        {ripple && (
          <motion.div
            className="absolute rounded-full pointer-events-none z-30"
            style={{
              left: ripple.x - 20,
              top: ripple.y - 20,
              width: 40,
              height: 40,
              border: "2px solid rgba(255,255,255,0.3)",
            }}
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: 20, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>

      {/* ── Top Bar (UI Chrome) ── */}
      {!snapshotMode && (
        <div className="ui-chrome absolute top-0 left-0 right-0 z-20 flex items-center justify-end gap-2 p-3">
          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/5 transition-all"
          >
            <Settings size={16} />
          </button>
          <button
            onClick={handleSnapshot}
            className={cn(
              "w-9 h-9 rounded-lg flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/5 transition-all",
              guideStep === 4 && "ring-2 ring-amber-400/60",
            )}
          >
            <Camera size={16} />
          </button>

          <SettingsTray
            isOpen={settingsOpen}
            onClose={() => setSettingsOpen(false)}
            audioEnabled={audioEnabled}
            hapticsEnabled={hapticsEnabled}
            droneResonance={droneResonance}
            onToggleAudio={() => setAudioEnabled(prev => !prev)}
            onToggleHaptics={() => setHapticsEnabled(prev => !prev)}
            onDroneResonanceChange={setDroneResonance}
          />
        </div>
      )}

      {/* ── Empty State ── */}
      <AnimatePresence mode="wait">
        {channels.length === 0 && !ghostMenuOpen && (
          <motion.div
            key="empty"
            className="absolute inset-0 flex flex-col items-center justify-center z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <motion.button
              onClick={() => {
                setGhostMenuOpen(true);
                if (guideStep === 1) {
                  // Guide will advance after channel is added
                }
              }}
              className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center border border-white/10 text-white/30 hover:text-white/60 hover:border-white/20 hover:bg-white/5 transition-all",
                guideStep === 1 && "ring-2 ring-amber-400/60",
              )}
              animate={{
                boxShadow: [
                  "0 0 20px 4px rgba(212,175,55,0.05)",
                  "0 0 30px 8px rgba(212,175,55,0.12)",
                  "0 0 20px 4px rgba(212,175,55,0.05)",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <Plus size={28} />
            </motion.button>
            <p className="mt-4 text-white/20 text-sm font-serif italic text-center max-w-[240px]">
              Identify a part of your experience to begin mixing.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Channel Strips ── */}
      {channels.length > 0 && (
        <div
          className="absolute inset-0 flex items-center justify-center gap-0 px-0 sm:px-4 sm:gap-2 z-10"
          style={{ paddingTop: 48, paddingBottom: 72 }}
        >
          <AnimatePresence>
            {channels.map((channel, i) => (
              <ChannelStrip
                key={channel.id}
                channel={channel}
                index={i}
                totalChannels={channels.length}
                isAnySoloed={isAnySoloed}
                audioEnabled={audioEnabled}
                onValueChange={handleValueChange}
                onMuteToggle={handleMuteToggle}
                onSoloToggle={handleSoloToggle}
                onBoostToggle={handleBoostToggle}
                onLabelEdit={handleLabelEdit}
                onDelete={handleDeleteChannel}
                guideStep={guideStep}
                channelRef={i === 0 ? firstChannelRef : undefined}
              />
            ))}
          </AnimatePresence>

          {/* Groove separators */}
          {channels.length > 1 && channels.slice(0, -1).map((_, i) => (
            <div
              key={`groove-${i}`}
              className="absolute h-full w-[1px] pointer-events-none"
              style={{
                left: `${((i + 1) / channels.length) * 100}%`,
                background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.04) 20%, rgba(255,255,255,0.04) 80%, transparent)",
              }}
            />
          ))}
        </div>
      )}

      {/* ── Bottom Bar (UI Chrome) ── */}
      {!snapshotMode && channels.length > 0 && channels.length < MAX_CHANNELS && (
        <div className="ui-chrome absolute bottom-0 left-0 right-0 z-20 flex items-center justify-center p-4">
          <motion.button
            onClick={() => setGhostMenuOpen(true)}
            className="w-11 h-11 rounded-full flex items-center justify-center border border-white/10 text-white/25 hover:text-white/50 hover:border-white/20 hover:bg-white/5 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus size={20} />
          </motion.button>
        </div>
      )}

      {/* Help dot */}
      {!snapshotMode && showHelpDot && !guideStep && (
        <button
          onClick={() => {
            setGuideStep(channels.length === 0 ? 1 : 2);
          }}
          className="ui-chrome absolute bottom-4 right-4 z-20 w-6 h-6 rounded-full flex items-center justify-center text-white/15 hover:text-white/40 transition-all"
        >
          <HelpCircle size={12} />
        </button>
      )}

      {/* Ghost Menu */}
      <GhostMenu
        isOpen={ghostMenuOpen}
        onClose={() => setGhostMenuOpen(false)}
        onAdd={handleAddChannel}
        existingLabels={channels.map(c => c.label)}
      />

      {/* Ghost Guide */}
      <AnimatePresence>
        {guideStep && (
          <GhostGuide
            step={guideStep}
            onDismiss={guideStep <= 1 ? handleDismissGuide : handleAdvanceGuide}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
