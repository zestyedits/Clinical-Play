import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { CHARACTER_STRENGTHS, VIRTUES } from "@/lib/strengths-data";
import { playClickSound } from "@/lib/audio-feedback";
import { Plus, X, Check, ChevronDown, Star, Eye, Sparkles, Filter, FileText } from "lucide-react";
import { ClinicianToolbar, type ToolbarControl } from "./clinician-toolbar";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface StrengthsPlacementData {
  id: string;
  strengthId: string;
  tier: string; // "signature" | "middle" | "lesser"
  orderIndex: number;
  scenarioResponse: string | null;
  createdBy: string | null;
  createdAt: string;
}

export interface StrengthsSpottingData {
  id: string;
  strengthId: string;
  note: string;
  createdBy: string | null;
  createdAt: string;
}

export interface StrengthsDeckProps {
  placements: StrengthsPlacementData[];
  spottings: StrengthsSpottingData[];
  onPlace: (strengthId: string, tier: string, orderIndex: number, scenarioResponse: string | null) => void;
  onMove: (placementId: string, tier: string, orderIndex: number) => void;
  onRemove: (placementId: string) => void;
  onSpot: (strengthId: string, note: string) => void;
  onClear: () => void;
  isClinician: boolean;
  toolSettings?: Record<string, any>;
  onSettingsUpdate?: (updates: Record<string, any>) => void;
}

// ─── Clinician Toolbar Settings ─────────────────────────────────────────────

interface StrengthsDeckSettings {
  showDescriptions: boolean;
  showSpottingMode: boolean;
}

const DEFAULT_STRENGTHS_DECK_SETTINGS: StrengthsDeckSettings = {
  showDescriptions: true,
  showSpottingMode: true,
};

const STRENGTHS_DECK_TOOLBAR_CONTROLS: ToolbarControl[] = [
  {
    type: "toggle",
    key: "showDescriptions",
    icon: FileText,
    label: "Descriptions",
    activeColor: "sky",
  },
  {
    type: "toggle",
    key: "showSpottingMode",
    icon: Eye,
    label: "Spotting",
    activeColor: "purple",
  },
];

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TIERS = [
  {
    id: "signature",
    label: "Signature Strengths",
    sublabel: "Strengths that feel most like the real you",
    color: "#D4A017",
    gradient: "linear-gradient(135deg, rgba(212,160,23,0.15), rgba(212,160,23,0.05))",
    borderColor: "rgba(212,160,23,0.35)",
    badgeClass: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  },
  {
    id: "middle",
    label: "Middle Strengths",
    sublabel: "Strengths you use situationally",
    color: "#A0AEC0",
    gradient: "linear-gradient(135deg, rgba(160,174,192,0.12), rgba(160,174,192,0.04))",
    borderColor: "rgba(160,174,192,0.3)",
    badgeClass: "bg-slate-400/20 text-slate-300 border-slate-400/30",
  },
  {
    id: "lesser",
    label: "Lesser Strengths",
    sublabel: "Strengths you use less often",
    color: "#B87333",
    gradient: "linear-gradient(135deg, rgba(184,115,51,0.12), rgba(184,115,51,0.04))",
    borderColor: "rgba(184,115,51,0.3)",
    badgeClass: "bg-orange-700/20 text-orange-300 border-orange-700/30",
  },
] as const;

function getVirtueColor(virtueId: string): string {
  return VIRTUES.find((v) => v.id === virtueId)?.color ?? "#9CA3AF";
}

function getVirtueName(virtueId: string): string {
  return VIRTUES.find((v) => v.id === virtueId)?.name ?? virtueId;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Small virtue color dot */
function VirtueDot({ virtueId, size = 8 }: { virtueId: string; size?: number }) {
  return (
    <span
      className="inline-block rounded-full flex-shrink-0"
      style={{
        width: size,
        height: size,
        backgroundColor: getVirtueColor(virtueId),
        boxShadow: `0 0 6px ${getVirtueColor(virtueId)}60`,
      }}
    />
  );
}

/** Compact card shown inside a tier */
function PlacedCard({
  placement,
  spottingCount,
  onTap,
  isSpottingMode,
}: {
  placement: StrengthsPlacementData;
  spottingCount: number;
  onTap: () => void;
  isSpottingMode: boolean;
}) {
  const strength = CHARACTER_STRENGTHS.find((s) => s.id === placement.strengthId);
  if (!strength) return null;
  const virtueColor = getVirtueColor(strength.virtue);

  return (
    <motion.button
      layout
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      onClick={onTap}
      className={cn(
        "relative flex items-center gap-2 px-3 py-2 rounded-xl border",
        "backdrop-blur-md cursor-pointer select-none text-left",
        "transition-colors duration-200",
        isSpottingMode
          ? "ring-2 ring-purple-400/50 hover:ring-purple-400/80"
          : "hover:brightness-110"
      )}
      style={{
        background: `linear-gradient(135deg, ${virtueColor}18, ${virtueColor}08)`,
        borderColor: `${virtueColor}35`,
      }}
    >
      <span className="text-lg leading-none">{strength.emoji}</span>
      <span className="text-xs font-medium text-white/90 truncate">
        {strength.name}
      </span>
      {spottingCount > 0 && (
        <span
          className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold border"
          style={{
            backgroundColor: `${virtueColor}30`,
            borderColor: `${virtueColor}60`,
            color: virtueColor,
          }}
        >
          {spottingCount}
        </span>
      )}
      {isSpottingMode && (
        <Eye className="w-3 h-3 text-purple-400 ml-auto flex-shrink-0" />
      )}
    </motion.button>
  );
}

/** Progress ring SVG */
function ProgressRing({ placed, total }: { placed: number; total: number }) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const progress = total > 0 ? placed / total : 0;
  const offset = circumference * (1 - progress);

  return (
    <div className="relative flex items-center justify-center w-12 h-12">
      <svg viewBox="0 0 44 44" className="w-full h-full -rotate-90">
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="3"
        />
        <motion.circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          stroke="url(#progressGrad)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id="progressGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#D4A017" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>
      </svg>
      <span className="absolute text-[10px] font-bold text-white/80">
        {placed}/{total}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function StrengthsDeck({
  placements,
  spottings,
  onPlace,
  onMove,
  onRemove,
  onSpot,
  onClear,
  isClinician,
  toolSettings,
  onSettingsUpdate,
}: StrengthsDeckProps) {
  const settings = { ...DEFAULT_STRENGTHS_DECK_SETTINGS, ...toolSettings } as StrengthsDeckSettings;
  // ---- local state ----
  const [expandedStrengthId, setExpandedStrengthId] = useState<string | null>(null);
  const [virtueFilter, setVirtueFilter] = useState<string | null>(null);
  const [spottingMode, setSpottingMode] = useState(false);
  const [spottingTarget, setSpottingTarget] = useState<string | null>(null);
  const [spottingNote, setSpottingNote] = useState("");
  const [showCelebration, setShowCelebration] = useState(false);
  const [showFilterBar, setShowFilterBar] = useState(false);

  // ---- derived data ----
  const placedIds = useMemo(
    () => new Set(placements.map((p) => p.strengthId)),
    [placements]
  );

  const spottingsByStrength = useMemo(() => {
    const map: Record<string, number> = {};
    for (const s of spottings) {
      map[s.strengthId] = (map[s.strengthId] ?? 0) + 1;
    }
    return map;
  }, [spottings]);

  const deckCards = useMemo(() => {
    let cards = CHARACTER_STRENGTHS.filter((s) => !placedIds.has(s.id));
    if (virtueFilter) {
      cards = cards.filter((s) => s.virtue === virtueFilter);
    }
    return cards;
  }, [placedIds, virtueFilter]);

  const getTierPlacements = useCallback(
    (tierId: string) =>
      placements
        .filter((p) => p.tier === tierId)
        .sort((a, b) => a.orderIndex - b.orderIndex),
    [placements]
  );

  const totalStrengths = CHARACTER_STRENGTHS.length;
  const placedCount = placements.length;
  const allPlaced = placedCount === totalStrengths && totalStrengths > 0;

  // ---- handlers ----
  const handleExpandCard = useCallback(
    (strengthId: string) => {
      playClickSound();
      setExpandedStrengthId((prev) => (prev === strengthId ? null : strengthId));
    },
    []
  );

  const handlePlaceInTier = useCallback(
    (strengthId: string, tierId: string) => {
      const tierCards = getTierPlacements(tierId);
      onPlace(strengthId, tierId, tierCards.length, null);
      playClickSound();
      setExpandedStrengthId(null);

      // check completion
      if (placedCount + 1 === totalStrengths) {
        setTimeout(() => setShowCelebration(true), 400);
      }
    },
    [getTierPlacements, onPlace, placedCount, totalStrengths]
  );

  const handleRemovePlacement = useCallback(
    (placementId: string) => {
      onRemove(placementId);
      playClickSound();
    },
    [onRemove]
  );

  const handleMovePlacement = useCallback(
    (placementId: string, newTier: string) => {
      const tierCards = getTierPlacements(newTier);
      onMove(placementId, newTier, tierCards.length);
      playClickSound();
    },
    [getTierPlacements, onMove]
  );

  const handlePlacedCardTap = useCallback(
    (placement: StrengthsPlacementData) => {
      if (spottingMode) {
        setSpottingTarget(placement.strengthId);
        setSpottingNote("");
      } else {
        setExpandedStrengthId((prev) =>
          prev === placement.strengthId ? null : placement.strengthId
        );
      }
      playClickSound();
    },
    [spottingMode]
  );

  const handleSubmitSpotting = useCallback(() => {
    if (!spottingTarget || !spottingNote.trim()) return;
    onSpot(spottingTarget, spottingNote.trim());
    playClickSound();
    setSpottingTarget(null);
    setSpottingNote("");
  }, [spottingTarget, spottingNote, onSpot]);

  const handleCancelSpotting = useCallback(() => {
    setSpottingTarget(null);
    setSpottingNote("");
  }, []);

  const handleClear = useCallback(() => {
    onClear();
    setExpandedStrengthId(null);
    setSpottingMode(false);
    setSpottingTarget(null);
    setShowCelebration(false);
    playClickSound();
  }, [onClear]);

  // ---- expanded card detail for the currently selected strength ----
  const expandedStrength = useMemo(
    () =>
      expandedStrengthId
        ? CHARACTER_STRENGTHS.find((s) => s.id === expandedStrengthId) ?? null
        : null,
    [expandedStrengthId]
  );

  const expandedPlacement = useMemo(
    () =>
      expandedStrengthId
        ? placements.find((p) => p.strengthId === expandedStrengthId) ?? null
        : null,
    [expandedStrengthId, placements]
  );

  // ---- render ----
  return (
    <div
      className="w-full h-full flex flex-col relative overflow-hidden"
      data-testid="strengths-deck-container"
      style={{ minHeight: 480 }}
    >
      {/* ======== HEADER BAR ======== */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] flex-shrink-0">
        <div className="flex items-center gap-3">
          <ProgressRing placed={placedCount} total={totalStrengths} />
          <div>
            <h3 className="text-sm font-semibold text-white/90 tracking-wide">
              Strengths Deck
            </h3>
            <p className="text-[11px] text-white/45">
              {allPlaced
                ? "All strengths sorted!"
                : `${placedCount} of ${totalStrengths} sorted`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Spotting mode toggle */}
          {settings.showSpottingMode && (
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => {
                setSpottingMode((prev) => !prev);
                setSpottingTarget(null);
                playClickSound();
              }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-all duration-200",
                spottingMode
                  ? "bg-purple-500/20 border-purple-500/40 text-purple-300"
                  : "bg-white/[0.04] border-white/[0.08] text-white/50 hover:text-white/70"
              )}
            >
              <Eye className="w-3.5 h-3.5" />
              Spot
            </motion.button>
          )}

          {/* Filter toggle */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => {
              setShowFilterBar((prev) => !prev);
              playClickSound();
            }}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-all duration-200",
              showFilterBar
                ? "bg-white/10 border-white/20 text-white/80"
                : "bg-white/[0.04] border-white/[0.08] text-white/50 hover:text-white/70"
            )}
          >
            <Filter className="w-3.5 h-3.5" />
            Filter
          </motion.button>

          {/* Clinician clear moved to toolbar */}
        </div>
      </div>

      {/* ======== VIRTUE FILTER BAR ======== */}
      <AnimatePresence>
        {showFilterBar && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-b border-white/[0.06] flex-shrink-0"
          >
            <div className="flex items-center gap-2 px-4 py-2.5 overflow-x-auto scrollbar-hide">
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => {
                  setVirtueFilter(null);
                  playClickSound();
                }}
                className={cn(
                  "flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-medium border transition-all duration-200",
                  virtueFilter === null
                    ? "bg-white/15 border-white/25 text-white/90"
                    : "bg-white/[0.04] border-white/[0.08] text-white/50 hover:text-white/70"
                )}
              >
                All
              </motion.button>
              {VIRTUES.map((virtue) => {
                const count = CHARACTER_STRENGTHS.filter(
                  (s) => s.virtue === virtue.id && !placedIds.has(s.id)
                ).length;
                return (
                  <motion.button
                    key={virtue.id}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => {
                      setVirtueFilter((prev) =>
                        prev === virtue.id ? null : virtue.id
                      );
                      playClickSound();
                    }}
                    className={cn(
                      "flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium border transition-all duration-200",
                      virtueFilter === virtue.id
                        ? "text-white/90"
                        : "bg-white/[0.04] border-white/[0.08] text-white/50 hover:text-white/70"
                    )}
                    style={
                      virtueFilter === virtue.id
                        ? {
                            backgroundColor: `${virtue.color}25`,
                            borderColor: `${virtue.color}50`,
                          }
                        : undefined
                    }
                  >
                    <VirtueDot virtueId={virtue.id} size={6} />
                    {virtue.name}
                    {count > 0 && (
                      <span className="text-[9px] text-white/35 ml-0.5">
                        {count}
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======== SCROLLABLE BODY ======== */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 scrollbar-hide">
        {/* ---- UNPLACED DECK ---- */}
        {deckCards.length > 0 && (
          <div>
            <p className="text-[11px] font-medium text-white/40 uppercase tracking-wider mb-2 px-1">
              Unsorted &middot; {deckCards.length} cards
            </p>
            <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide">
              {deckCards.map((strength) => {
                const virtueColor = getVirtueColor(strength.virtue);
                const isExpanded = expandedStrengthId === strength.id;
                return (
                  <motion.button
                    key={strength.id}
                    layout
                    whileHover={{ y: -4, scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleExpandCard(strength.id)}
                    className={cn(
                      "flex-shrink-0 flex flex-col items-center justify-center gap-1",
                      "w-20 h-24 rounded-2xl border cursor-pointer select-none",
                      "backdrop-blur-md transition-all duration-200",
                      isExpanded
                        ? "ring-2 ring-white/30 shadow-lg"
                        : "hover:shadow-md"
                    )}
                    style={{
                      background: `linear-gradient(160deg, ${virtueColor}22, ${virtueColor}08, rgba(0,0,0,0.15))`,
                      borderColor: isExpanded
                        ? `${virtueColor}60`
                        : `${virtueColor}25`,
                    }}
                  >
                    <span className="text-2xl leading-none">{strength.emoji}</span>
                    <span className="text-[10px] font-medium text-white/80 text-center px-1 leading-tight">
                      {strength.name}
                    </span>
                    <VirtueDot virtueId={strength.virtue} size={5} />
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}

        {/* ---- EXPANDED CARD DETAIL ---- */}
        <AnimatePresence mode="wait">
          {expandedStrength && (
            <motion.div
              key={expandedStrength.id}
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className="rounded-2xl border backdrop-blur-xl overflow-hidden"
              style={{
                background: `linear-gradient(160deg, ${getVirtueColor(expandedStrength.virtue)}15, rgba(0,0,0,0.25))`,
                borderColor: `${getVirtueColor(expandedStrength.virtue)}30`,
              }}
            >
              {/* Card header */}
              <div className="flex items-start gap-3 p-4 pb-2">
                <span className="text-3xl leading-none mt-0.5">
                  {expandedStrength.emoji}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white/95">
                      {expandedStrength.name}
                    </h4>
                    <span
                      className="text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border"
                      style={{
                        color: getVirtueColor(expandedStrength.virtue),
                        borderColor: `${getVirtueColor(expandedStrength.virtue)}40`,
                        backgroundColor: `${getVirtueColor(expandedStrength.virtue)}15`,
                      }}
                    >
                      {getVirtueName(expandedStrength.virtue)}
                    </span>
                  </div>
                  {settings.showDescriptions && (
                    <p className="text-[11px] text-white/55 mt-1 leading-relaxed">
                      {expandedStrength.description}
                    </p>
                  )}
                </div>
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => {
                    setExpandedStrengthId(null);
                    playClickSound();
                  }}
                  className="flex-shrink-0 p-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-white/40" />
                </motion.button>
              </div>

              {/* Example */}
              <div className="px-4 pb-2">
                <p className="text-[10px] font-semibold text-white/35 uppercase tracking-wider mb-1">
                  Example
                </p>
                <p className="text-[11px] text-white/60 leading-relaxed italic">
                  "{expandedStrength.example}"
                </p>
              </div>

              {/* Actions */}
              <div className="px-4 pb-3">
                <p className="text-[10px] font-semibold text-white/35 uppercase tracking-wider mb-1.5">
                  Try This
                </p>
                <div className="space-y-1">
                  {expandedStrength.actions.map((action, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 text-[11px] text-white/55"
                    >
                      <Sparkles
                        className="w-3 h-3 mt-0.5 flex-shrink-0"
                        style={{
                          color: getVirtueColor(expandedStrength.virtue),
                        }}
                      />
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Spotting count */}
              {(spottingsByStrength[expandedStrength.id] ?? 0) > 0 && (
                <div className="px-4 pb-3">
                  <div className="flex items-center gap-1.5 text-[11px] text-purple-300/70">
                    <Eye className="w-3 h-3" />
                    <span>
                      Spotted{" "}
                      {spottingsByStrength[expandedStrength.id]} time
                      {spottingsByStrength[expandedStrength.id] > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              )}

              {/* Tier placement / management buttons */}
              <div className="px-4 pb-4">
                {expandedPlacement ? (
                  /* Already placed -- offer move / remove */
                  <div className="space-y-2">
                    <p className="text-[10px] font-semibold text-white/35 uppercase tracking-wider">
                      Currently in:{" "}
                      <span className="text-white/60 normal-case">
                        {TIERS.find((t) => t.id === expandedPlacement.tier)
                          ?.label ?? expandedPlacement.tier}
                      </span>
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {TIERS.filter(
                        (t) => t.id !== expandedPlacement.tier
                      ).map((tier) => (
                        <motion.button
                          key={tier.id}
                          whileTap={{ scale: 0.92 }}
                          onClick={() =>
                            handleMovePlacement(expandedPlacement.id, tier.id)
                          }
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-all duration-200 hover:brightness-125"
                          style={{
                            backgroundColor: `${tier.color}18`,
                            borderColor: `${tier.color}35`,
                            color: tier.color,
                          }}
                        >
                          <ChevronDown className="w-3 h-3" />
                          Move to {tier.label.split(" ")[0]}
                        </motion.button>
                      ))}
                      <motion.button
                        whileTap={{ scale: 0.92 }}
                        onClick={() =>
                          handleRemovePlacement(expandedPlacement.id)
                        }
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium border bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all duration-200"
                      >
                        <X className="w-3 h-3" />
                        Return to Deck
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  /* Not yet placed -- show tier buttons */
                  <div className="space-y-2">
                    <p className="text-[10px] font-semibold text-white/35 uppercase tracking-wider">
                      Place in Tier
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {TIERS.map((tier) => (
                        <motion.button
                          key={tier.id}
                          whileTap={{ scale: 0.92 }}
                          whileHover={{ scale: 1.03 }}
                          onClick={() =>
                            handlePlaceInTier(expandedStrength.id, tier.id)
                          }
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-semibold border transition-all duration-200 hover:brightness-125"
                          style={{
                            backgroundColor: `${tier.color}18`,
                            borderColor: `${tier.color}40`,
                            color: tier.color,
                          }}
                        >
                          {tier.id === "signature" && (
                            <Star className="w-3.5 h-3.5" />
                          )}
                          {tier.id === "middle" && (
                            <Check className="w-3.5 h-3.5" />
                          )}
                          {tier.id === "lesser" && (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                          {tier.label}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ---- STRENGTH SPOTTING INPUT ---- */}
        <AnimatePresence>
          {spottingTarget && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="rounded-2xl border border-purple-500/25 bg-purple-500/[0.08] backdrop-blur-xl p-4 space-y-3"
            >
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-purple-400" />
                <p className="text-xs font-semibold text-purple-300">
                  Strength Spotting
                </p>
                <span className="text-[11px] text-white/50">
                  &mdash;{" "}
                  {CHARACTER_STRENGTHS.find((s) => s.id === spottingTarget)
                    ?.name ?? ""}
                </span>
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={handleCancelSpotting}
                  className="ml-auto p-1 rounded-lg hover:bg-white/[0.08] transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-white/40" />
                </motion.button>
              </div>
              <p className="text-[11px] text-white/45 leading-relaxed">
                When did you notice this strength in action? Describe a recent
                moment when you or someone else used it.
              </p>
              <textarea
                value={spottingNote}
                onChange={(e) => setSpottingNote(e.target.value)}
                placeholder="I noticed this strength when..."
                rows={3}
                className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-3 py-2.5 text-xs text-white/80 placeholder:text-white/25 resize-none focus:outline-none focus:ring-1 focus:ring-purple-500/40 transition-all"
              />
              <div className="flex items-center justify-end gap-2">
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={handleCancelSpotting}
                  className="px-3 py-1.5 rounded-lg text-[11px] font-medium text-white/50 hover:text-white/70 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={handleSubmitSpotting}
                  disabled={!spottingNote.trim()}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[11px] font-semibold border transition-all duration-200",
                    spottingNote.trim()
                      ? "bg-purple-500/20 border-purple-500/40 text-purple-300 hover:bg-purple-500/30"
                      : "bg-white/[0.04] border-white/[0.08] text-white/25 cursor-not-allowed"
                  )}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Spotting
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ---- TIER SECTIONS ---- */}
        {TIERS.map((tier) => {
          const tierPlacements = getTierPlacements(tier.id);
          return (
            <motion.div
              key={tier.id}
              layout
              className="rounded-2xl border overflow-hidden"
              style={{
                background: tier.gradient,
                borderColor: tier.borderColor,
              }}
            >
              {/* Tier header */}
              <div className="flex items-center gap-2.5 px-4 py-2.5">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{
                    backgroundColor: tier.color,
                    boxShadow: `0 0 8px ${tier.color}50`,
                  }}
                />
                <div className="flex-1 min-w-0">
                  <h4
                    className="text-xs font-bold tracking-wide"
                    style={{ color: tier.color }}
                  >
                    {tier.label}
                  </h4>
                  <p className="text-[10px] text-white/35">{tier.sublabel}</p>
                </div>
                <span
                  className={cn(
                    "text-[10px] font-semibold px-2 py-0.5 rounded-full border",
                    tier.badgeClass
                  )}
                >
                  {tierPlacements.length}
                </span>
              </div>

              {/* Tier cards */}
              <div className="px-3 pb-3">
                {tierPlacements.length === 0 ? (
                  <div className="flex items-center justify-center py-4 border border-dashed rounded-xl"
                    style={{ borderColor: `${tier.color}20` }}
                  >
                    <p className="text-[11px] text-white/25 italic">
                      Tap a card above and place it here
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    <AnimatePresence>
                      {tierPlacements.map((placement) => (
                        <PlacedCard
                          key={placement.id}
                          placement={placement}
                          spottingCount={
                            spottingsByStrength[placement.strengthId] ?? 0
                          }
                          isSpottingMode={spottingMode}
                          onTap={() => handlePlacedCardTap(placement)}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}

        {/* ---- SPOTTING HISTORY (condensed) ---- */}
        {settings.showSpottingMode && spottings.length > 0 && (
          <div className="rounded-2xl border border-purple-500/15 bg-purple-500/[0.04] backdrop-blur-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5">
              <Eye className="w-3.5 h-3.5 text-purple-400/60" />
              <h4 className="text-xs font-semibold text-purple-300/70 tracking-wide">
                Strength Spottings
              </h4>
              <span className="text-[10px] text-white/30 ml-auto">
                {spottings.length} total
              </span>
            </div>
            <div className="px-4 pb-3 space-y-2 max-h-48 overflow-y-auto scrollbar-hide">
              {[...spottings]
                .sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
                )
                .slice(0, 10)
                .map((spotting) => {
                  const strength = CHARACTER_STRENGTHS.find(
                    (s) => s.id === spotting.strengthId
                  );
                  return (
                    <motion.div
                      key={spotting.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-start gap-2 text-[11px]"
                    >
                      <span className="leading-none mt-0.5">
                        {strength?.emoji ?? "?"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-white/60">
                          {strength?.name ?? "Unknown"}
                        </span>
                        <p className="text-white/40 leading-relaxed mt-0.5">
                          {spotting.note}
                        </p>
                      </div>
                      <span className="text-[9px] text-white/20 flex-shrink-0 mt-0.5">
                        {new Date(spotting.createdAt).toLocaleDateString(
                          undefined,
                          {
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </span>
                    </motion.div>
                  );
                })}
              {spottings.length > 10 && (
                <p className="text-[10px] text-white/25 text-center pt-1">
                  + {spottings.length - 10} more spottings
                </p>
              )}
            </div>
          </div>
        )}

        {/* Bottom spacer */}
        <div className="h-4" />
      </div>

      {isClinician && onSettingsUpdate && (
        <ClinicianToolbar
          controls={STRENGTHS_DECK_TOOLBAR_CONTROLS}
          settings={settings}
          onUpdate={onSettingsUpdate}
          onClear={onClear}
        />
      )}

      {/* ======== CELEBRATION OVERLAY ======== */}
      <AnimatePresence>
        {showCelebration && allPlaced && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
            style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              className="relative max-w-xs w-full mx-6 rounded-3xl border border-amber-500/30 overflow-hidden"
              style={{
                background:
                  "linear-gradient(160deg, rgba(212,160,23,0.15), rgba(0,0,0,0.7))",
              }}
            >
              {/* Decorative sparkles */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {Array.from({ length: 12 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 rounded-full bg-amber-400/60"
                    style={{
                      left: `${10 + Math.random() * 80}%`,
                      top: `${10 + Math.random() * 80}%`,
                    }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0.5, 1.2, 0.5],
                    }}
                    transition={{
                      duration: 1.5 + Math.random(),
                      repeat: Infinity,
                      delay: Math.random() * 1.5,
                    }}
                  />
                ))}
              </div>

              <div className="relative z-10 flex flex-col items-center text-center p-6 py-8">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="w-10 h-10 text-amber-400 mb-3" />
                </motion.div>
                <h3 className="text-lg font-bold text-white/95 mb-1">
                  All Strengths Sorted!
                </h3>
                <p className="text-xs text-white/50 leading-relaxed mb-5 max-w-[220px]">
                  You have identified your signature, middle, and lesser
                  strengths. This is a powerful map of who you are at your best.
                </p>

                {/* Summary counts */}
                <div className="flex items-center gap-3 mb-5">
                  {TIERS.map((tier) => {
                    const count = getTierPlacements(tier.id).length;
                    return (
                      <div
                        key={tier.id}
                        className="flex flex-col items-center gap-0.5"
                      >
                        <span
                          className="text-lg font-bold"
                          style={{ color: tier.color }}
                        >
                          {count}
                        </span>
                        <span className="text-[9px] text-white/40">
                          {tier.label.split(" ")[0]}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2">
                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    onClick={() => {
                      setShowCelebration(false);
                      setSpottingMode(true);
                      playClickSound();
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-semibold bg-purple-500/20 border border-purple-500/35 text-purple-300 hover:bg-purple-500/30 transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Start Spotting
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    onClick={() => {
                      setShowCelebration(false);
                      playClickSound();
                    }}
                    className="px-4 py-2 rounded-xl text-[11px] font-medium text-white/50 hover:text-white/70 border border-white/[0.08] transition-colors"
                  >
                    Close
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
