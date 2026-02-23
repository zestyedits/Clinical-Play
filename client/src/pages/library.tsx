import { useState, useMemo, useCallback } from "react";
import { Link } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search, Grid3X3, List, Star, Filter, X, ChevronDown, ChevronRight,
  Clock, Zap, Play, Eye, Heart, BookOpen, AlertTriangle, Shield, FolderPlus,
  Plus, Trash2, SlidersHorizontal, Sparkles, ArrowLeft, LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui/glass-card";
import { useAuth } from "@/hooks/use-auth";
import {
  TOOLS_LIBRARY, MODALITY_OPTIONS, AGE_RANGE_OPTIONS, INTENSITY_OPTIONS,
  INTERACTION_TYPE_OPTIONS, SORT_OPTIONS,
  type ToolDefinition,
} from "@/lib/mock-data/tools-library";

// ── Local state helpers ──
function loadFavorites(): Set<string> {
  try {
    const raw = localStorage.getItem("cp-tool-favorites");
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch { return new Set(); }
}
function saveFavorites(favs: Set<string>) {
  localStorage.setItem("cp-tool-favorites", JSON.stringify(Array.from(favs)));
}

interface Collection {
  id: string;
  name: string;
  toolIds: string[];
}
function loadCollections(): Collection[] {
  try {
    const raw = localStorage.getItem("cp-collections");
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
function saveCollections(cols: Collection[]) {
  localStorage.setItem("cp-collections", JSON.stringify(cols));
}

// ── Intensity badge ──
function IntensityBadge({ level }: { level: string }) {
  const config = {
    gentle: { label: "Gentle", cls: "bg-green-100 text-green-700 border-green-200" },
    moderate: { label: "Moderate", cls: "bg-amber-100 text-amber-700 border-amber-200" },
    deep: { label: "Deep", cls: "bg-rose-100 text-rose-700 border-rose-200" },
  }[level] || { label: level, cls: "bg-gray-100 text-gray-600 border-gray-200" };
  return <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-semibold border", config.cls)}>{config.label}</span>;
}

// ── Status badge ──
function StatusBadge({ status }: { status: string }) {
  if (status === "active") return null;
  const cls = status === "development"
    ? "bg-primary/10 text-primary border-primary/20"
    : "bg-primary/10 text-primary border-primary/20";
  const label = status === "development" ? "In Development" : "Coming Soon";
  return <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-semibold border", cls)}>{label}</span>;
}

// ── Tool Detail Drawer ──
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

  const toggle = (key: string) => setExpandedSection(prev => prev === key ? null : key);

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 z-50"
        onClick={onClose}
      />
      <div
        className="fixed right-0 top-0 bottom-0 w-full max-w-lg z-50 bg-card border-l border-border shadow-2xl overflow-y-auto"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="text-4xl">{tool.icon}</div>
              <div>
                <h2 className="font-serif text-2xl text-foreground">{tool.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <IntensityBadge level={tool.intensity} />
                  <StatusBadge status={tool.status} />
                  <span className="text-xs text-muted-foreground">{tool.tier === "pro" ? "Pro" : "Free"}</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-secondary rounded-xl transition-colors cursor-pointer">
              <X size={20} className="text-muted-foreground" />
            </button>
          </div>

          {/* Quick stats */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-6">
            <span className="flex items-center gap-1"><Clock size={12} /> {tool.duration} min</span>
            <span className="flex items-center gap-1"><Zap size={12} /> {tool.interactionType}</span>
            {tool.timesUsed > 0 && <span>Used {tool.timesUsed} times</span>}
          </div>

          {/* Actions */}
          <div className="flex gap-2 mb-6">
            {tool.status === "active" && (
              <Link href={`/playroom/demo?tool=${tool.id}`}>
                <button className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground font-medium text-sm flex items-center justify-center gap-2 shadow-lg cursor-pointer hover:opacity-90 transition-opacity">
                  <Play size={15} /> Launch in Demo
                </button>
              </Link>
            )}
            <button
              onClick={onToggleFavorite}
              className={cn(
                "h-11 px-4 rounded-xl border text-sm font-medium flex items-center gap-2 cursor-pointer transition-colors",
                isFavorite ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-card border-border text-muted-foreground hover:bg-secondary"
              )}
            >
              <Star size={15} className={isFavorite ? "fill-amber-400" : ""} />
              {isFavorite ? "Favorited" : "Favorite"}
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
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mb-4"
              >
                <div className="bg-secondary/30 rounded-xl p-3 space-y-1">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Add to collection:</p>
                  {collections.length === 0 && <p className="text-xs text-muted-foreground/60 italic">No collections yet</p>}
                  {collections.map(c => (
                    <button
                      key={c.id}
                      onClick={() => { onAddToCollection(c.id); setShowCollectionPicker(false); }}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-secondary transition-colors cursor-pointer text-foreground"
                    >
                      {c.name} ({c.toolIds.length})
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2"><BookOpen size={14} /> What it does</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{tool.longDescription}</p>
          </div>

          {/* Modalities */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-foreground mb-2">Modalities</h3>
            <div className="flex flex-wrap gap-1.5">
              {tool.modalities.map(m => (
                <span key={m} className="text-xs px-2.5 py-1 rounded-full bg-primary/5 text-primary border border-primary/10 font-medium">{m}</span>
              ))}
            </div>
          </div>

          {/* Age ranges */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-foreground mb-2">Age Ranges</h3>
            <div className="flex flex-wrap gap-1.5">
              {tool.ageRanges.map(a => (
                <span key={a} className="text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground font-medium">{a}</span>
              ))}
            </div>
          </div>

          {/* Best used for */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2"><Heart size={14} /> Best used for</h3>
            <ul className="space-y-1.5">
              {tool.bestUsedFor.map((item, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Expandable sections */}
          {[
            { key: "adaptations", label: "Adaptations", icon: <Sparkles size={14} />, content: tool.adaptations },
            { key: "pitfalls", label: "Watch for", icon: <AlertTriangle size={14} />, content: tool.pitfalls },
            { key: "safety", label: "Safety & containment", icon: <Shield size={14} />, content: tool.safetyNotes },
          ].map(section => (
            <div key={section.key} className="border-t border-border/20 py-3">
              <button
                onClick={() => toggle(section.key)}
                className="w-full flex items-center justify-between text-sm font-medium text-foreground cursor-pointer"
              >
                <span className="flex items-center gap-2">{section.icon} {section.label}</span>
                <ChevronDown size={16} className={cn("transition-transform text-muted-foreground", expandedSection === section.key && "rotate-180")} />
              </button>
              <AnimatePresence>
                {expandedSection === section.key && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="text-sm text-muted-foreground leading-relaxed pt-2">{section.content}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}

          {/* Artifact note */}
          {tool.producesArtifact && (
            <div className="mt-4 p-3 rounded-xl bg-accent/5 border border-accent/20">
              <p className="text-xs text-accent font-medium">This tool produces exportable session artifacts.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── Main Library Page ──
export default function Library() {
  const { isAuthenticated } = useAuth();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recommended");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedModalities, setSelectedModalities] = useState<string[]>([]);
  const [selectedAgeRanges, setSelectedAgeRanges] = useState<string[]>([]);
  const [selectedIntensity, setSelectedIntensity] = useState<string[]>([]);
  const [selectedInteraction, setSelectedInteraction] = useState<string[]>([]);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [activeOnly, setActiveOnly] = useState(false);
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
    const col: Collection = { id: `col-${Date.now()}`, name: newCollectionName.trim(), toolIds: [] };
    setCollections(prev => { const next = [...prev, col]; saveCollections(next); return next; });
    setNewCollectionName("");
  }, [newCollectionName]);

  const deleteCollection = useCallback((colId: string) => {
    setCollections(prev => { const next = prev.filter(c => c.id !== colId); saveCollections(next); return next; });
    if (activeCollection === colId) setActiveCollection(null);
  }, [activeCollection]);

  const addToCollection = useCallback((colId: string, toolId: string) => {
    setCollections(prev => {
      const next = prev.map(c => c.id === colId && !c.toolIds.includes(toolId)
        ? { ...c, toolIds: [...c.toolIds, toolId] }
        : c
      );
      saveCollections(next);
      return next;
    });
  }, []);

  const toggleFilter = (arr: string[], val: string, setter: (v: string[]) => void) => {
    setter(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]);
  };

  const hasActiveFilters = selectedModalities.length > 0 || selectedAgeRanges.length > 0 || selectedIntensity.length > 0 || selectedInteraction.length > 0 || favoritesOnly || activeOnly;

  const clearFilters = () => {
    setSelectedModalities([]); setSelectedAgeRanges([]); setSelectedIntensity([]);
    setSelectedInteraction([]); setFavoritesOnly(false); setActiveOnly(false);
  };

  const filteredTools = useMemo(() => {
    let tools = [...TOOLS_LIBRARY];

    // Collection filter
    if (activeCollection) {
      const col = collections.find(c => c.id === activeCollection);
      if (col) tools = tools.filter(t => col.toolIds.includes(t.id));
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      tools = tools.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.shortDescription.toLowerCase().includes(q) ||
        t.modalities.some(m => m.toLowerCase().includes(q))
      );
    }

    // Filters
    if (selectedModalities.length > 0) tools = tools.filter(t => t.modalities.some(m => selectedModalities.includes(m)));
    if (selectedAgeRanges.length > 0) tools = tools.filter(t => t.ageRanges.some(a => selectedAgeRanges.includes(a)));
    if (selectedIntensity.length > 0) tools = tools.filter(t => selectedIntensity.includes(t.intensity));
    if (selectedInteraction.length > 0) tools = tools.filter(t => selectedInteraction.includes(t.interactionType));
    if (favoritesOnly) tools = tools.filter(t => favorites.has(t.id));
    if (activeOnly) tools = tools.filter(t => t.status === "active");

    // Sort
    switch (sortBy) {
      case "newest": tools.sort((a, b) => (b.status === "active" ? 1 : 0) - (a.status === "active" ? 1 : 0)); break;
      case "most-used": tools.sort((a, b) => b.timesUsed - a.timesUsed); break;
      case "alphabetical": tools.sort((a, b) => a.name.localeCompare(b.name)); break;
      default: {
        // Recommended: favorites first, then active, then by usage
        tools.sort((a, b) => {
          const aFav = favorites.has(a.id) ? 1 : 0;
          const bFav = favorites.has(b.id) ? 1 : 0;
          if (aFav !== bFav) return bFav - aFav;
          const aActive = a.status === "active" ? 1 : 0;
          const bActive = b.status === "active" ? 1 : 0;
          if (aActive !== bActive) return bActive - aActive;
          return b.timesUsed - a.timesUsed;
        });
      }
    }

    return tools;
  }, [searchQuery, sortBy, selectedModalities, selectedAgeRanges, selectedIntensity, selectedInteraction, favoritesOnly, activeOnly, favorites, activeCollection, collections]);

  return (
    <div className="min-h-screen bg-background pt-20 md:pt-24 pb-24 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
          <Link href="/dashboard" className="hover:text-primary transition-colors cursor-pointer">Dashboard</Link>
          <ChevronRight size={12} />
          <span className="text-primary font-medium">Library</span>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-1">Tool Library</h1>
            <p className="text-muted-foreground text-sm">
              {TOOLS_LIBRARY.length} therapeutic tools — {TOOLS_LIBRARY.filter(t => t.status === "active").length} active, more in development
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCollections(!showCollections)}
              className={cn(
                "h-9 px-3 rounded-xl text-sm font-medium flex items-center gap-2 cursor-pointer transition-colors border",
                showCollections ? "bg-primary/10 text-primary border-primary/20" : "bg-card border-border text-muted-foreground hover:bg-secondary"
              )}
            >
              <LayoutGrid size={14} /> Collections
            </button>
          </div>
        </div>

        {/* Collections panel */}
        <AnimatePresence>
          {showCollections && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-6"
            >
              <GlassCard hoverEffect={false} className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-foreground">Your Collections</h3>
                  {activeCollection && (
                    <button onClick={() => setActiveCollection(null)} className="text-xs text-accent cursor-pointer hover:underline">Show all tools</button>
                  )}
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
                  {collections.length === 0 && <p className="text-xs text-muted-foreground/50 italic">No collections yet. Create one below.</p>}
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
                  <button onClick={addCollection} disabled={!newCollectionName.trim()} className="h-9 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-medium cursor-pointer disabled:opacity-40 hover:bg-primary/90 transition-colors">
                    <Plus size={14} />
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search & Controls Bar */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search tools, modalities, techniques..."
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-card transition-colors"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer">
                <X size={14} className="text-muted-foreground/50" />
              </button>
            )}
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="h-11 px-3 rounded-xl bg-card border border-border text-sm text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          {/* View toggle */}
          <div className="flex h-11 rounded-xl border border-border overflow-hidden bg-card">
            <button
              onClick={() => setViewMode("grid")}
              className={cn("px-3 flex items-center cursor-pointer transition-colors", viewMode === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary")}
            >
              <Grid3X3 size={16} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn("px-3 flex items-center cursor-pointer transition-colors", viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary")}
            >
              <List size={16} />
            </button>
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "h-11 px-4 rounded-xl text-sm font-medium flex items-center gap-2 cursor-pointer transition-colors border",
              showFilters || hasActiveFilters ? "bg-primary/10 text-primary border-primary/20" : "bg-card border-border text-muted-foreground hover:bg-secondary"
            )}
          >
            <SlidersHorizontal size={15} />
            Filters
            {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-primary" />}
          </button>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-6"
            >
              <GlassCard hoverEffect={false} className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-foreground">Filter Tools</h3>
                  {hasActiveFilters && (
                    <button onClick={clearFilters} className="text-xs text-accent cursor-pointer hover:underline">Clear all</button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {/* Modality */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Modality</p>
                    <div className="flex flex-wrap gap-1.5">
                      {MODALITY_OPTIONS.map(m => (
                        <button
                          key={m}
                          onClick={() => toggleFilter(selectedModalities, m, setSelectedModalities)}
                          className={cn(
                            "text-xs px-2.5 py-1 rounded-full border cursor-pointer transition-colors",
                            selectedModalities.includes(m) ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:bg-secondary"
                          )}
                        >{m}</button>
                      ))}
                    </div>
                  </div>

                  {/* Age Range */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Age Range</p>
                    <div className="flex flex-wrap gap-1.5">
                      {AGE_RANGE_OPTIONS.map(a => (
                        <button
                          key={a}
                          onClick={() => toggleFilter(selectedAgeRanges, a, setSelectedAgeRanges)}
                          className={cn(
                            "text-xs px-2.5 py-1 rounded-full border cursor-pointer transition-colors",
                            selectedAgeRanges.includes(a) ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:bg-secondary"
                          )}
                        >{a}</button>
                      ))}
                    </div>
                  </div>

                  {/* Intensity & Interaction */}
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Intensity</p>
                      <div className="flex gap-1.5">
                        {INTENSITY_OPTIONS.map(i => (
                          <button
                            key={i}
                            onClick={() => toggleFilter(selectedIntensity, i, setSelectedIntensity)}
                            className={cn(
                              "text-xs px-2.5 py-1 rounded-full border cursor-pointer transition-colors capitalize",
                              selectedIntensity.includes(i) ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:bg-secondary"
                            )}
                          >{i}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Interaction Type</p>
                      <div className="flex flex-wrap gap-1.5">
                        {INTERACTION_TYPE_OPTIONS.map(i => (
                          <button
                            key={i}
                            onClick={() => toggleFilter(selectedInteraction, i, setSelectedInteraction)}
                            className={cn(
                              "text-xs px-2.5 py-1 rounded-full border cursor-pointer transition-colors capitalize",
                              selectedInteraction.includes(i) ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:bg-secondary"
                            )}
                          >{i}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick toggles */}
                <div className="flex gap-4 mt-4 pt-4 border-t border-border/20">
                  <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                    <input type="checkbox" checked={favoritesOnly} onChange={e => setFavoritesOnly(e.target.checked)} className="rounded accent-primary" />
                    Favorites only
                  </label>
                  <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                    <input type="checkbox" checked={activeOnly} onChange={e => setActiveOnly(e.target.checked)} className="rounded accent-primary" />
                    Active tools only
                  </label>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results count */}
        <p className="text-xs text-muted-foreground mb-4">
          Showing {filteredTools.length} of {TOOLS_LIBRARY.length} tools
          {activeCollection && <span className="text-accent"> in collection</span>}
        </p>

        {/* Tool Grid/List */}
        {filteredTools.length === 0 ? (
          <div className="text-center py-20">
            <Search size={40} className="mx-auto mb-4 text-muted-foreground/20" />
            <h3 className="font-serif text-lg text-foreground mb-1">No tools match your filters</h3>
            <p className="text-sm text-muted-foreground">Try adjusting your search or clearing some filters.</p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="mt-3 text-sm text-accent cursor-pointer hover:underline">Clear all filters</button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTools.map((tool) => (
              <div key={tool.id}>
                <GlassCard className="p-5 h-full flex flex-col">
                  {/* Top row */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-3xl">{tool.icon}</div>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(tool.id); }}
                      className="p-1.5 rounded-lg hover:bg-secondary transition-colors cursor-pointer"
                    >
                      <Star size={16} className={favorites.has(tool.id) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"} />
                    </button>
                  </div>

                  {/* Name & desc */}
                  <h3 className="font-serif text-base text-foreground mb-1">{tool.name}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3 flex-1">{tool.shortDescription}</p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {tool.modalities.slice(0, 2).map(m => (
                      <span key={m} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/5 text-primary/70 font-medium">{m}</span>
                    ))}
                    {tool.modalities.length > 2 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/5 text-primary/50">+{tool.modalities.length - 2}</span>
                    )}
                  </div>

                  {/* Meta row */}
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground mb-3">
                    <span className="flex items-center gap-1"><Clock size={11} />{tool.duration}m</span>
                    <IntensityBadge level={tool.intensity} />
                    <StatusBadge status={tool.status} />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t border-border/20">
                    <button
                      onClick={() => setDetailTool(tool)}
                      className="flex-1 h-9 rounded-xl bg-secondary/50 text-foreground text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer hover:bg-secondary transition-colors"
                    >
                      <Eye size={13} /> Details
                    </button>
                    {tool.status === "active" ? (
                      <Link href="/playroom/demo" className="flex-1">
                        <button className="w-full h-9 rounded-xl bg-primary text-primary-foreground text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer shadow-sm hover:opacity-90 transition-opacity">
                          <Play size={13} /> Launch
                        </button>
                      </Link>
                    ) : (
                      <button disabled className="flex-1 h-9 rounded-xl bg-secondary/30 text-muted-foreground/40 text-xs font-medium flex items-center justify-center gap-1.5 cursor-default">
                        {tool.status === "development" ? "In Dev" : "Soon"}
                      </button>
                    )}
                  </div>
                </GlassCard>
              </div>
            ))}
          </div>
        ) : (
          /* List view */
          <div className="space-y-2">
            {filteredTools.map((tool) => (
              <div key={tool.id}>
                <GlassCard className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl shrink-0">{tool.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-serif text-sm text-foreground">{tool.name}</h3>
                        <IntensityBadge level={tool.intensity} />
                        <StatusBadge status={tool.status} />
                        {tool.tier === "pro" && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold">PRO</span>}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{tool.shortDescription}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] text-muted-foreground hidden sm:block">{tool.duration}m</span>
                      <button onClick={() => toggleFavorite(tool.id)} className="p-1.5 cursor-pointer">
                        <Star size={14} className={favorites.has(tool.id) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"} />
                      </button>
                      <button onClick={() => setDetailTool(tool)} className="h-8 px-3 rounded-lg bg-secondary/50 text-xs font-medium text-foreground cursor-pointer hover:bg-secondary transition-colors">
                        Details
                      </button>
                      {tool.status === "active" && (
                        <Link href={`/playroom/demo?tool=${tool.id}`}>
                          <button className="h-8 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-medium cursor-pointer shadow-sm hover:opacity-90">
                            Launch
                          </button>
                        </Link>
                      )}
                    </div>
                  </div>
                </GlassCard>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tool Detail Drawer */}
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
