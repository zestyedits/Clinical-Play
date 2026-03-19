import { useState, useMemo, useCallback, useRef } from "react";
import { Link } from "wouter";
import { AnimatePresence, motion, useInView } from "framer-motion";
import {
  Search, Star, X, ChevronDown, ChevronRight,
  Clock, Zap, Play, Eye, Heart, BookOpen, AlertTriangle, Shield, FolderPlus,
  Plus, Trash2, SlidersHorizontal, Wrench, LayoutGrid, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui/glass-card";
import { useAuth } from "@/hooks/use-auth";
import {
  TOOLS_LIBRARY, MODALITY_OPTIONS, AGE_RANGE_OPTIONS, INTENSITY_OPTIONS,
  INTERACTION_TYPE_OPTIONS, SORT_OPTIONS,
  type ToolDefinition,
} from "@/lib/mock-data/tools-library";

// ── Local storage helpers ──
function loadFavorites(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem("cp-tool-favorites") || "[]")); } catch { return new Set(); }
}
function saveFavorites(favs: Set<string>) { localStorage.setItem("cp-tool-favorites", JSON.stringify([...favs])); }

interface Collection { id: string; name: string; toolIds: string[]; }
function loadCollections(): Collection[] {
  try { return JSON.parse(localStorage.getItem("cp-collections") || "[]"); } catch { return []; }
}
function saveCollections(cols: Collection[]) { localStorage.setItem("cp-collections", JSON.stringify(cols)); }

// ── Animated card that fades in as it enters viewport ──
function CatalogCard({
  tool, index, isFavorite, onToggleFavorite, onShowDetail,
}: {
  tool: ToolDefinition;
  index: number;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onShowDetail: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const accent = tool.accentColor || "#888";

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.4, delay: (index % 6) * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <motion.div
        whileHover={{ y: -4, scale: 1.01 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="group relative rounded-2xl overflow-hidden border border-border/60 bg-card cursor-pointer"
        style={{ minHeight: 280 }}
        onClick={onShowDetail}
      >
        {/* Accent gradient header */}
        <div
          className="relative h-28 flex items-center justify-center overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${accent}18, ${accent}08)`,
          }}
        >
          {/* Decorative circles */}
          <div
            className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-[0.07]"
            style={{ background: accent }}
          />
          <div
            className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full opacity-[0.05]"
            style={{ background: accent }}
          />

          {/* Icon */}
          <motion.div
            className="relative z-10 text-5xl"
            whileHover={{ scale: 1.15, rotate: [0, -5, 5, 0] }}
            transition={{ duration: 0.4 }}
            style={{ filter: `drop-shadow(0 4px 12px ${accent}30)` }}
          >
            {tool.icon}
          </motion.div>

          {/* Favorite button */}
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-background/60 backdrop-blur-sm hover:bg-background/80 transition-colors cursor-pointer z-10"
          >
            <Star size={14} className={cn(
              "transition-all duration-200",
              isFavorite ? "fill-amber-400 text-amber-400 scale-110" : "text-muted-foreground/40 group-hover:text-muted-foreground/60"
            )} />
          </button>

          {/* Status / category badges */}
          <div className="absolute top-3 left-3 flex gap-1.5 z-10">
            {tool.status !== "active" && (
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-background/70 backdrop-blur-sm text-muted-foreground font-semibold border border-border/40">
                {tool.status === "development" ? "In Dev" : "Soon"}
              </span>
            )}
            {tool.tier === "pro" && (
              <span className="text-[9px] px-2 py-0.5 rounded-full font-bold border"
                style={{ background: `${accent}15`, color: accent, borderColor: `${accent}30` }}>
                PRO
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 pb-3">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="font-serif text-[15px] font-semibold text-foreground leading-tight">{tool.name}</h3>
          </div>

          <p className="text-[11.5px] text-muted-foreground leading-relaxed mb-3 line-clamp-2">
            {tool.shortDescription}
          </p>

          {/* Modality pills */}
          <div className="flex flex-wrap gap-1 mb-3">
            {tool.modalities.slice(0, 3).map(m => (
              <span
                key={m}
                className="text-[9.5px] px-2 py-[2px] rounded-full font-medium"
                style={{ background: `${accent}10`, color: `${accent}cc`, border: `1px solid ${accent}15` }}
              >
                {m}
              </span>
            ))}
            {tool.modalities.length > 3 && (
              <span className="text-[9.5px] px-1.5 py-[2px] rounded-full text-muted-foreground/50">
                +{tool.modalities.length - 3}
              </span>
            )}
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-2.5 text-[10.5px] text-muted-foreground/60 mb-3">
            <span className="flex items-center gap-1"><Clock size={10} />{tool.duration}m</span>
            <span className="w-px h-3 bg-border/40" />
            <IntensityDot level={tool.intensity} />
            <span className="w-px h-3 bg-border/40" />
            <span className="capitalize">{tool.interactionType}</span>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); onShowDetail(); }}
              className="flex-1 h-8 rounded-xl bg-secondary/40 text-foreground/70 text-[11px] font-medium flex items-center justify-center gap-1.5 cursor-pointer hover:bg-secondary/70 transition-colors"
            >
              <Eye size={12} /> Details
            </button>
            {tool.status === "active" ? (
              <Link href={`/playroom/demo?tool=${tool.id}`} className="flex-1 no-underline" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                <button
                  className="w-full h-8 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all hover:opacity-90 hover:shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${accent}, ${accent}dd)`,
                    color: isLightColor(accent) ? "#1a1a1a" : "#fff",
                    boxShadow: `0 2px 8px ${accent}25`,
                  }}
                >
                  <Play size={12} /> Launch
                </button>
              </Link>
            ) : (
              <button disabled className="flex-1 h-8 rounded-xl bg-secondary/20 text-muted-foreground/30 text-[11px] font-medium cursor-default">
                Coming Soon
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Intensity visual ──
function IntensityDot({ level }: { level: string }) {
  const config: Record<string, { color: string; label: string }> = {
    gentle: { color: "#4ade80", label: "Gentle" },
    moderate: { color: "#fbbf24", label: "Moderate" },
    deep: { color: "#f87171", label: "Deep" },
  };
  const c = config[level] || config.gentle;
  return (
    <span className="flex items-center gap-1">
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.color }} />
      <span>{c.label}</span>
    </span>
  );
}

// ── Filter chip ──
function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "text-xs px-3 py-1.5 rounded-full border cursor-pointer transition-all duration-200 whitespace-nowrap",
        active
          ? "bg-primary text-primary-foreground border-primary shadow-sm"
          : "bg-card/50 border-border/60 text-muted-foreground hover:bg-secondary/60 hover:border-border"
      )}
    >
      {label}
    </motion.button>
  );
}

// ── Detail Drawer ──
function ToolDetailDrawer({
  tool, onClose, isFavorite, onToggleFavorite, collections, onAddToCollection,
}: {
  tool: ToolDefinition;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  collections: Collection[];
  onAddToCollection: (collectionId: string) => void;
}) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [showCollectionPicker, setShowCollectionPicker] = useState(false);
  const accent = tool.accentColor || "#888";
  const toggle = (key: string) => setExpandedSection(prev => prev === key ? null : key);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50"
        onClick={onClose}
      />
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed right-0 top-0 bottom-0 w-full max-w-lg z-50 bg-card border-l border-border shadow-2xl overflow-y-auto"
      >
        {/* Hero banner */}
        <div
          className="relative h-40 flex items-center justify-center overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${accent}20, ${accent}08)` }}
        >
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-[0.08]" style={{ background: accent }} />
          <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full opacity-[0.06]" style={{ background: accent }} />
          <motion.span
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 12 }}
            className="text-6xl relative z-10"
            style={{ filter: `drop-shadow(0 4px 20px ${accent}40)` }}
          >
            {tool.icon}
          </motion.span>
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-xl bg-background/60 backdrop-blur-sm hover:bg-background/80 transition-colors cursor-pointer z-10">
            <X size={18} className="text-muted-foreground" />
          </button>
        </div>

        <div className="p-6">
          {/* Title */}
          <h2 className="font-serif text-2xl text-foreground mb-1">{tool.name}</h2>
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <IntensityDot level={tool.intensity} />
            <span className="text-xs text-muted-foreground">{tool.tier === "pro" ? "Pro" : "Free"}</span>
            <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock size={11} />{tool.duration} min</span>
            <span className="text-xs text-muted-foreground capitalize flex items-center gap-1"><Zap size={11} />{tool.interactionType}</span>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 mb-6">
            {tool.status === "active" && (
              <Link href={`/playroom/demo?tool=${tool.id}`} className="flex-1 min-w-[140px] no-underline">
                <button
                  className="w-full h-11 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all hover:opacity-90 hover:shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${accent}, ${accent}dd)`,
                    color: isLightColor(accent) ? "#1a1a1a" : "#fff",
                    boxShadow: `0 4px 16px ${accent}30`,
                  }}
                >
                  <Play size={15} /> Launch Demo
                </button>
              </Link>
            )}
            <button
              onClick={onToggleFavorite}
              className={cn(
                "h-11 px-4 rounded-xl border text-sm font-medium flex items-center gap-2 cursor-pointer transition-colors",
                isFavorite ? "bg-amber-500/10 border-amber-500/20 text-amber-400" : "bg-card border-border text-muted-foreground hover:bg-secondary"
              )}
            >
              <Star size={15} className={isFavorite ? "fill-amber-400" : ""} />
              {isFavorite ? "Saved" : "Save"}
            </button>
            <button
              onClick={() => setShowCollectionPicker(!showCollectionPicker)}
              className="h-11 px-4 rounded-xl border border-border text-sm font-medium flex items-center gap-2 cursor-pointer hover:bg-secondary transition-colors text-muted-foreground"
            >
              <FolderPlus size={15} />
            </button>
          </div>

          {/* Collection picker */}
          <AnimatePresence>
            {showCollectionPicker && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-4">
                <div className="bg-secondary/30 rounded-xl p-3 space-y-1">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Add to collection:</p>
                  {collections.length === 0 && <p className="text-xs text-muted-foreground/60 italic">No collections yet</p>}
                  {collections.map(c => (
                    <button key={c.id} onClick={() => { onAddToCollection(c.id); setShowCollectionPicker(false); }}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-secondary transition-colors cursor-pointer text-foreground">
                      {c.name} ({c.toolIds.length})
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2"><BookOpen size={14} /> About this tool</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{tool.longDescription}</p>
          </div>

          {/* Modalities */}
          <div className="mb-5">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Modalities</h3>
            <div className="flex flex-wrap gap-1.5">
              {tool.modalities.map(m => (
                <span key={m} className="text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{ background: `${accent}10`, color: `${accent}cc`, border: `1px solid ${accent}15` }}>{m}</span>
              ))}
            </div>
          </div>

          {/* Age ranges */}
          <div className="mb-5">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Age Ranges</h3>
            <div className="flex flex-wrap gap-1.5">
              {tool.ageRanges.map(a => (
                <span key={a} className="text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground font-medium">{a}</span>
              ))}
            </div>
          </div>

          {/* Best used for */}
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2"><Heart size={14} /> Best used for</h3>
            <ul className="space-y-1.5">
              {tool.bestUsedFor.map((item, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: accent }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Expandable sections */}
          {[
            { key: "adaptations", label: "Adaptations", icon: <Wrench size={14} />, content: tool.adaptations },
            { key: "pitfalls", label: "Watch for", icon: <AlertTriangle size={14} />, content: tool.pitfalls },
            { key: "safety", label: "Safety & containment", icon: <Shield size={14} />, content: tool.safetyNotes },
          ].map(section => (
            <div key={section.key} className="border-t border-border/20 py-3">
              <button onClick={() => toggle(section.key)} className="w-full flex items-center justify-between text-sm font-medium text-foreground cursor-pointer">
                <span className="flex items-center gap-2">{section.icon} {section.label}</span>
                <ChevronDown size={16} className={cn("transition-transform text-muted-foreground", expandedSection === section.key && "rotate-180")} />
              </button>
              <AnimatePresence>
                {expandedSection === section.key && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <p className="text-sm text-muted-foreground leading-relaxed pt-2">{section.content}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}

          {tool.producesArtifact && (
            <div className="mt-4 p-3 rounded-xl border flex items-center gap-2" style={{ background: `${accent}06`, borderColor: `${accent}15` }}>
              <Sparkles size={14} style={{ color: accent }} />
              <p className="text-xs font-medium" style={{ color: `${accent}cc` }}>Produces exportable session artifacts</p>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}

// ── Utility ──
function isLightColor(hex: string): boolean {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 0.299 + g * 0.587 + b * 0.114) > 150;
}

// ── Main Library Page ──
export default function Library() {
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recommended");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedModalities, setSelectedModalities] = useState<string[]>([]);
  const [selectedAgeRanges, setSelectedAgeRanges] = useState<string[]>([]);
  const [selectedIntensity, setSelectedIntensity] = useState<string[]>([]);
  const [selectedInteraction, setSelectedInteraction] = useState<string[]>([]);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [detailTool, setDetailTool] = useState<ToolDefinition | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(loadFavorites);
  const [collections, setCollections] = useState<Collection[]>(loadCollections);
  const [showCollections, setShowCollections] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [activeCollection, setActiveCollection] = useState<string | null>(null);

  const toggleFavorite = useCallback((toolId: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(toolId)) next.delete(toolId); else next.add(toolId);
      saveFavorites(next);
      return next;
    });
  }, []);

  const addCollection = useCallback(() => {
    if (!newCollectionName.trim()) return;
    setCollections(prev => { const next = [...prev, { id: `col-${Date.now()}`, name: newCollectionName.trim(), toolIds: [] }]; saveCollections(next); return next; });
    setNewCollectionName("");
  }, [newCollectionName]);

  const deleteCollection = useCallback((colId: string) => {
    setCollections(prev => { const next = prev.filter(c => c.id !== colId); saveCollections(next); return next; });
    if (activeCollection === colId) setActiveCollection(null);
  }, [activeCollection]);

  const addToCollection = useCallback((colId: string, toolId: string) => {
    setCollections(prev => {
      const next = prev.map(c => c.id === colId && !c.toolIds.includes(toolId) ? { ...c, toolIds: [...c.toolIds, toolId] } : c);
      saveCollections(next);
      return next;
    });
  }, []);

  const toggleFilter = (arr: string[], val: string, setter: (v: string[]) => void) => {
    setter(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]);
  };

  const hasActiveFilters = selectedModalities.length > 0 || selectedAgeRanges.length > 0 || selectedIntensity.length > 0 || selectedInteraction.length > 0 || favoritesOnly;

  const clearFilters = () => {
    setSelectedModalities([]); setSelectedAgeRanges([]); setSelectedIntensity([]);
    setSelectedInteraction([]); setFavoritesOnly(false);
  };

  const filteredTools = useMemo(() => {
    let tools = [...TOOLS_LIBRARY];
    if (activeCollection) {
      const col = collections.find(c => c.id === activeCollection);
      if (col) tools = tools.filter(t => col.toolIds.includes(t.id));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      tools = tools.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.shortDescription.toLowerCase().includes(q) ||
        t.modalities.some(m => m.toLowerCase().includes(q)) ||
        t.bestUsedFor.some(b => b.toLowerCase().includes(q))
      );
    }
    if (selectedModalities.length > 0) tools = tools.filter(t => t.modalities.some(m => selectedModalities.includes(m)));
    if (selectedAgeRanges.length > 0) tools = tools.filter(t => t.ageRanges.some(a => selectedAgeRanges.includes(a)));
    if (selectedIntensity.length > 0) tools = tools.filter(t => selectedIntensity.includes(t.intensity));
    if (selectedInteraction.length > 0) tools = tools.filter(t => selectedInteraction.includes(t.interactionType));
    if (favoritesOnly) tools = tools.filter(t => favorites.has(t.id));

    switch (sortBy) {
      case "newest": tools.sort((a, b) => (b.status === "active" ? 1 : 0) - (a.status === "active" ? 1 : 0)); break;
      case "most-used": tools.sort((a, b) => b.timesUsed - a.timesUsed); break;
      case "alphabetical": tools.sort((a, b) => a.name.localeCompare(b.name)); break;
      default:
        tools.sort((a, b) => {
          const af = favorites.has(a.id) ? 1 : 0, bf = favorites.has(b.id) ? 1 : 0;
          if (af !== bf) return bf - af;
          const aa = a.status === "active" ? 1 : 0, ba = b.status === "active" ? 1 : 0;
          if (aa !== ba) return ba - aa;
          return b.timesUsed - a.timesUsed;
        });
    }
    return tools;
  }, [searchQuery, sortBy, selectedModalities, selectedAgeRanges, selectedIntensity, selectedInteraction, favoritesOnly, favorites, activeCollection, collections]);

  // Quick-filter: popular modalities
  const quickModalities = ["CBT", "DBT", "ACT", "IFS", "Somatic", "Narrative Therapy", "Motivational Interviewing"];

  return (
    <div className="min-h-screen bg-background pt-20 md:pt-24 pb-24 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
          <Link href="/dashboard" className="hover:text-primary transition-colors cursor-pointer">Dashboard</Link>
          <ChevronRight size={12} />
          <span className="text-primary font-medium">Catalog</span>
        </div>

        {/* Hero header */}
        <div className="mb-8">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-serif text-3xl md:text-4xl text-foreground mb-2"
          >
            Therapeutic Catalog
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-muted-foreground text-sm max-w-lg"
          >
            {TOOLS_LIBRARY.length} evidence-based tools and interactive games.
            Each one designed to make clinical work more engaging for you and your clients.
          </motion.p>
        </div>

        {/* Search bar — prominent */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative mb-5"
        >
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by name, modality, technique, or use case..."
            className="w-full h-12 pl-11 pr-4 rounded-2xl bg-card border border-border/60 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer p-1 hover:bg-secondary rounded-full transition-colors">
              <X size={14} className="text-muted-foreground/50" />
            </button>
          )}
        </motion.div>

        {/* Quick modality filter chips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 scrollbar-none"
        >
          <FilterChip
            label={`Saved ${favorites.size > 0 ? `(${favorites.size})` : ""}`}
            active={favoritesOnly}
            onClick={() => setFavoritesOnly(!favoritesOnly)}
          />
          <span className="w-px h-5 bg-border/30 shrink-0" />
          {quickModalities.map(m => (
            <FilterChip
              key={m}
              label={m}
              active={selectedModalities.includes(m)}
              onClick={() => toggleFilter(selectedModalities, m, setSelectedModalities)}
            />
          ))}
        </motion.div>

        {/* Controls row */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground">
              {filteredTools.length} of {TOOLS_LIBRARY.length}
              {activeCollection && <span className="text-primary"> in collection</span>}
              {hasActiveFilters && (
                <button onClick={clearFilters} className="ml-2 text-primary cursor-pointer hover:underline">Clear filters</button>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="h-8 px-2.5 rounded-xl bg-card border border-border/60 text-xs text-foreground cursor-pointer focus:outline-none"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={cn(
                "h-8 px-3 rounded-xl text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors border",
                showAdvancedFilters || hasActiveFilters ? "bg-primary/10 text-primary border-primary/20" : "bg-card border-border/60 text-muted-foreground hover:bg-secondary"
              )}
            >
              <SlidersHorizontal size={13} /> More
              {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
            </button>
            <button
              onClick={() => setShowCollections(!showCollections)}
              className={cn(
                "h-8 px-3 rounded-xl text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors border",
                showCollections ? "bg-primary/10 text-primary border-primary/20" : "bg-card border-border/60 text-muted-foreground hover:bg-secondary"
              )}
            >
              <LayoutGrid size={13} /> Collections
            </button>
          </div>
        </div>

        {/* Advanced filters panel */}
        <AnimatePresence>
          {showAdvancedFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-5"
            >
              <GlassCard hoverEffect={false} className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Age Range</p>
                    <div className="flex flex-wrap gap-1.5">
                      {AGE_RANGE_OPTIONS.map(a => (
                        <FilterChip key={a} label={a} active={selectedAgeRanges.includes(a)}
                          onClick={() => toggleFilter(selectedAgeRanges, a, setSelectedAgeRanges)} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Intensity</p>
                    <div className="flex gap-1.5">
                      {INTENSITY_OPTIONS.map(i => (
                        <FilterChip key={i} label={i.charAt(0).toUpperCase() + i.slice(1)} active={selectedIntensity.includes(i)}
                          onClick={() => toggleFilter(selectedIntensity, i, setSelectedIntensity)} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Interaction</p>
                    <div className="flex flex-wrap gap-1.5">
                      {INTERACTION_TYPE_OPTIONS.map(i => (
                        <FilterChip key={i} label={i.charAt(0).toUpperCase() + i.slice(1)} active={selectedInteraction.includes(i)}
                          onClick={() => toggleFilter(selectedInteraction, i, setSelectedInteraction)} />
                      ))}
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collections panel */}
        <AnimatePresence>
          {showCollections && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-5"
            >
              <GlassCard hoverEffect={false} className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-foreground">Your Collections</h3>
                  {activeCollection && <button onClick={() => setActiveCollection(null)} className="text-xs text-primary cursor-pointer hover:underline">Show all</button>}
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {collections.map(c => (
                    <div key={c.id} className="flex items-center gap-1">
                      <button
                        onClick={() => setActiveCollection(activeCollection === c.id ? null : c.id)}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-colors border",
                          activeCollection === c.id ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-foreground hover:bg-secondary"
                        )}
                      >
                        {c.name} ({c.toolIds.length})
                      </button>
                      <button onClick={() => deleteCollection(c.id)} className="p-1 hover:text-destructive text-muted-foreground/40 cursor-pointer"><Trash2 size={12} /></button>
                    </div>
                  ))}
                  {collections.length === 0 && <p className="text-xs text-muted-foreground/50 italic">No collections yet</p>}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCollectionName}
                    onChange={e => setNewCollectionName(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && addCollection()}
                    placeholder="New collection name..."
                    className="flex-1 h-9 px-3 rounded-xl bg-secondary/30 border border-border text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <button onClick={addCollection} disabled={!newCollectionName.trim()} className="h-9 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-medium cursor-pointer disabled:opacity-40">
                    <Plus size={14} />
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid */}
        {filteredTools.length === 0 ? (
          <div className="text-center py-24">
            <Search size={40} className="mx-auto mb-4 text-muted-foreground/15" />
            <h3 className="font-serif text-lg text-foreground mb-1">No matches found</h3>
            <p className="text-sm text-muted-foreground mb-3">Try a different search or adjust your filters.</p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-sm text-primary cursor-pointer hover:underline">Clear all filters</button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTools.map((tool, i) => (
              <CatalogCard
                key={tool.id}
                tool={tool}
                index={i}
                isFavorite={favorites.has(tool.id)}
                onToggleFavorite={() => toggleFavorite(tool.id)}
                onShowDetail={() => setDetailTool(tool)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail drawer */}
      <AnimatePresence>
        {detailTool && (
          <ToolDetailDrawer
            tool={detailTool}
            onClose={() => setDetailTool(null)}
            isFavorite={favorites.has(detailTool.id)}
            onToggleFavorite={() => toggleFavorite(detailTool.id)}
            collections={collections}
            onAddToCollection={(colId) => addToCollection(colId, detailTool.id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
