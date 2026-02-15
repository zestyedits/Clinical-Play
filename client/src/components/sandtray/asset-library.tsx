import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SANDTRAY_ASSETS, CATEGORIES, type SandtrayAsset, type AssetCategory } from "@/lib/sandtray-assets";
import { cn } from "@/lib/utils";
import { ChevronUp, X, Search } from "lucide-react";

interface AssetLibraryProps {
  isOpen: boolean;
  onToggle: () => void;
  disabled?: boolean;
  onTapPlace?: (asset: SandtrayAsset) => void;
}

function groupBySubcategory(assets: SandtrayAsset[]): { subcategory: string | null; items: SandtrayAsset[] }[] {
  const groups: Map<string | null, SandtrayAsset[]> = new Map();
  for (const a of assets) {
    const key = a.subcategory || null;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(a);
  }
  return Array.from(groups.entries()).map(([subcategory, items]) => ({ subcategory, items }));
}

function AssetGrid({
  assets,
  disabled,
  onDragStart,
  onTapPlace,
  isMobile,
}: {
  assets: SandtrayAsset[];
  disabled?: boolean;
  onDragStart: (e: React.DragEvent, asset: SandtrayAsset) => void;
  onTapPlace?: (asset: SandtrayAsset) => void;
  isMobile: boolean;
}) {
  const groups = useMemo(() => groupBySubcategory(assets), [assets]);
  const hasSubcategories = groups.some(g => g.subcategory !== null);
  const cols = isMobile ? "grid-cols-5" : "grid-cols-4";

  if (!hasSubcategories) {
    return (
      <div className={`grid ${cols} gap-1.5`}>
        {assets.map((asset) => (
          <AssetItem
            key={asset.id}
            asset={asset}
            disabled={disabled}
            onDragStart={onDragStart}
            onTapPlace={onTapPlace}
            isMobile={isMobile}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {groups.map((group) => (
        <div key={group.subcategory || "default"}>
          {group.subcategory && (
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[#8B7B5E]/60 mb-1.5 px-1">
              {group.subcategory}
            </div>
          )}
          <div className={`grid ${cols} gap-1.5`}>
            {group.items.map((asset) => (
              <AssetItem
                key={asset.id}
                asset={asset}
                disabled={disabled}
                onDragStart={onDragStart}
                onTapPlace={onTapPlace}
                isMobile={isMobile}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function AssetItem({
  asset,
  disabled,
  onDragStart,
  onTapPlace,
  isMobile,
}: {
  asset: SandtrayAsset;
  disabled?: boolean;
  onDragStart: (e: React.DragEvent, asset: SandtrayAsset) => void;
  onTapPlace?: (asset: SandtrayAsset) => void;
  isMobile: boolean;
}) {
  const handleClick = () => {
    if (!disabled && onTapPlace && isMobile) {
      onTapPlace(asset);
    }
  };

  return (
    <motion.div
      draggable={!disabled && !isMobile}
      onDragStart={(e) => onDragStart(e as any, asset)}
      onClick={handleClick}
      className={cn(
        "flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-all",
        disabled
          ? "opacity-50 cursor-not-allowed"
          : isMobile
            ? "cursor-pointer active:bg-white/60 active:scale-95"
            : "cursor-grab active:cursor-grabbing hover:bg-white/50"
      )}
      whileHover={!isMobile ? { scale: 1.05 } : undefined}
      whileTap={{ scale: 0.9 }}
      data-testid={`asset-${asset.id}`}
    >
      <span
        className={isMobile ? "text-[28px]" : "text-2xl"}
        style={{ minWidth: '40px', minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        {asset.icon}
      </span>
      <span className="text-[9px] text-[#6B5A3E]/70 font-medium text-center leading-tight line-clamp-1">
        {asset.label}
      </span>
    </motion.div>
  );
}

export function AssetLibrary({ isOpen, onToggle, disabled, onTapPlace }: AssetLibraryProps) {
  const [activeCategory, setActiveCategory] = useState<AssetCategory>("people");
  const [search, setSearch] = useState("");

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const filtered = useMemo(() => {
    if (search) {
      const q = search.toLowerCase();
      return SANDTRAY_ASSETS.filter(a =>
        a.label.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        (a.subcategory && a.subcategory.toLowerCase().includes(q))
      );
    }
    return SANDTRAY_ASSETS.filter(a => a.category === activeCategory);
  }, [search, activeCategory]);

  const handleDragStart = (e: React.DragEvent, asset: SandtrayAsset) => {
    e.dataTransfer.setData("icon", asset.icon);
    e.dataTransfer.setData("category", asset.category);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <>
      {!isOpen && (
        <motion.button
          onClick={onToggle}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 md:z-30 bg-[#F5EDE0]/90 backdrop-blur-xl px-6 py-3 rounded-2xl shadow-xl border border-[#D4C4A8]/50 flex items-center gap-3 text-[#5A4A32] font-medium text-sm cursor-pointer hover:bg-[#F5EDE0] hover:shadow-2xl transition-all md:bottom-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          data-testid="button-toggle-assets"
          data-tour="playroom-asset-library"
        >
          <ChevronUp size={16} className="text-[#8B6914]" />
          <span>Asset Library</span>
          <span className="text-xs text-[#6B5A3E]/70 bg-white/50 px-2 py-0.5 rounded-full">{SANDTRAY_ASSETS.length}</span>
        </motion.button>
      )}

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile: Bottom dock sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="md:hidden absolute bottom-0 left-0 right-0 z-10 bg-[#F5EDE0]/95 backdrop-blur-2xl rounded-t-[2rem] shadow-2xl border-t border-[#D4C4A8]/50"
              style={{ maxHeight: "55vh" }}
              data-tour="playroom-asset-library"
            >
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-[#D4C4A8]/60" />
              </div>
              <div className="flex items-center justify-between px-5 py-1.5">
                <h3 className="font-serif text-base text-[#5A4A32]">Choose a Figurine</h3>
                <button
                  onClick={onToggle}
                  className="min-w-[44px] min-h-[44px] p-2.5 hover:bg-[#D4C4A8]/30 rounded-full transition-colors cursor-pointer flex items-center justify-center"
                  data-testid="button-close-assets"
                >
                  <X size={20} className="text-[#6B5A3E]" />
                </button>
              </div>

              <div className="px-5 py-1.5">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9B8B6E]/50" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/60 border border-[#D4C4A8]/60 text-[#3A3530] placeholder:text-[#9B8B6E]/50 focus:outline-none focus:ring-2 focus:ring-[#8B6914]/30 text-sm"
                    placeholder="Search figurines..."
                    data-testid="input-search-assets"
                  />
                </div>
              </div>

              {!search && (
                <div className="flex overflow-x-auto flex-nowrap gap-1 px-5 py-1.5 scrollbar-hide">
                  {CATEGORIES.map((cat) => {
                    const count = SANDTRAY_ASSETS.filter(a => a.category === cat.id).length;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={cn(
                          "flex-shrink-0 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap",
                          activeCategory === cat.id
                            ? "bg-[#8B6914] text-white shadow-md"
                            : "bg-white/50 text-[#6B5A3E] hover:bg-white/70"
                        )}
                        data-testid={`button-category-${cat.id}`}
                      >
                        {cat.emoji} {cat.label} <span className="opacity-60">({count})</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {search && filtered.length > 0 && (
                <div className="px-5 py-1">
                  <span className="text-[11px] text-[#8B7B5E]/60">{filtered.length} results</span>
                </div>
              )}

              <div className="px-3 py-2 overflow-y-auto" style={{ maxHeight: "calc(55vh - 150px)" }}>
                <AssetGrid
                  assets={filtered}
                  disabled={disabled}
                  onDragStart={handleDragStart}
                  onTapPlace={onTapPlace}
                  isMobile={true}
                />
                {filtered.length === 0 && (
                  <p className="text-center text-sm text-[#9B8B6E]/60 py-8">No figurines found</p>
                )}
              </div>

              {isMobile && (
                <div className="px-5 py-2 border-t border-[#D4C4A8]/30 text-center">
                  <span className="text-[10px] text-[#8B7B5E]/50">Tap a figurine to place it on the tray</span>
                </div>
              )}
            </motion.div>

            {/* Desktop: Floating translucent panel */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="hidden md:flex absolute left-6 top-6 bottom-6 z-30 w-64 bg-[#F5EDE0]/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-[#D4C4A8]/50 flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-4">
                <h3 className="font-serif text-base text-[#5A4A32]">Choose a Figurine</h3>
                <button
                  onClick={onToggle}
                  className="min-w-[44px] min-h-[44px] p-2 hover:bg-[#D4C4A8]/30 rounded-xl transition-colors cursor-pointer flex items-center justify-center"
                  data-testid="button-close-assets-desktop"
                >
                  <X size={16} className="text-[#6B5A3E]" />
                </button>
              </div>

              <div className="px-4 pb-3">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9B8B6E]/50" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/60 border border-[#D4C4A8]/60 text-[#3A3530] placeholder:text-[#9B8B6E]/50 focus:outline-none focus:ring-2 focus:ring-[#8B6914]/30 text-sm"
                    placeholder="Search figurines..."
                    data-testid="input-search-assets-desktop"
                  />
                </div>
              </div>

              {!search && (
                <div className="flex overflow-x-auto flex-nowrap gap-1 px-4 pb-3 scrollbar-hide">
                  {CATEGORIES.map((cat) => {
                    const count = SANDTRAY_ASSETS.filter(a => a.category === cat.id).length;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={cn(
                          "flex-shrink-0 px-2 py-1.5 rounded-full text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap",
                          activeCategory === cat.id
                            ? "bg-[#8B6914] text-white shadow-md"
                            : "bg-white/50 text-[#6B5A3E] hover:bg-white/70"
                        )}
                        data-testid={`button-category-desktop-${cat.id}`}
                      >
                        {cat.emoji} {cat.label}
                      </button>
                    );
                  })}
                </div>
              )}

              {search && filtered.length > 0 && (
                <div className="px-4 pb-2">
                  <span className="text-[11px] text-[#8B7B5E]/60">{filtered.length} results</span>
                </div>
              )}

              <div className="flex-1 overflow-y-auto px-3 pb-4">
                <AssetGrid
                  assets={filtered}
                  disabled={disabled}
                  onDragStart={handleDragStart}
                  onTapPlace={onTapPlace}
                  isMobile={false}
                />
                {filtered.length === 0 && (
                  <p className="text-center text-sm text-[#9B8B6E]/60 py-8">No figurines found</p>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
