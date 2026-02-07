import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SANDTRAY_ASSETS, CATEGORIES, type SandtrayAsset } from "@/lib/sandtray-assets";
import { cn } from "@/lib/utils";
import { ChevronUp, X, GripHorizontal } from "lucide-react";

interface AssetLibraryProps {
  isOpen: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function AssetLibrary({ isOpen, onToggle, disabled }: AssetLibraryProps) {
  const [activeCategory, setActiveCategory] = useState<"nature" | "people" | "abstract">("nature");

  const filtered = SANDTRAY_ASSETS.filter(a => a.category === activeCategory);

  const handleDragStart = (e: React.DragEvent, asset: SandtrayAsset) => {
    e.dataTransfer.setData("icon", asset.icon);
    e.dataTransfer.setData("category", asset.category);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <>
      {/* Toggle Handle — Bottom dock tab */}
      {!isOpen && (
        <motion.button
          onClick={onToggle}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 md:z-30 bg-white/70 backdrop-blur-xl px-6 py-3 rounded-2xl shadow-xl border border-white/30 flex items-center gap-3 text-primary font-medium text-sm cursor-pointer hover:bg-white/90 hover:shadow-2xl transition-all md:bottom-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          data-testid="button-toggle-assets"
          data-tour="playroom-asset-library"
        >
          <ChevronUp size={16} className="text-accent" />
          <span>Asset Library</span>
          <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full">{SANDTRAY_ASSETS.length}</span>
        </motion.button>
      )}

      {/* Library Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile: Bottom dock sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="md:hidden absolute bottom-0 left-0 right-0 z-10 bg-white/80 backdrop-blur-2xl rounded-t-[2rem] shadow-2xl border-t border-white/30"
              style={{ maxHeight: "50vh" }}
              data-tour="playroom-asset-library"
            >
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-border/60" />
              </div>
              <div className="flex items-center justify-between px-6 py-2">
                <h3 className="font-serif text-lg text-primary">Choose a Piece</h3>
                <button
                  onClick={onToggle}
                  className="min-w-[44px] min-h-[44px] p-2.5 hover:bg-secondary/50 rounded-full transition-colors cursor-pointer flex items-center justify-center"
                  data-testid="button-close-assets"
                >
                  <X size={20} className="text-muted-foreground" />
                </button>
              </div>

              <div className="flex gap-2 px-6 py-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer",
                      activeCategory === cat.id
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-white/60 text-muted-foreground hover:bg-white/80"
                    )}
                    data-testid={`button-category-${cat.id}`}
                  >
                    {cat.emoji} {cat.label}
                  </button>
                ))}
              </div>

              <div className="px-4 py-3 overflow-y-auto" style={{ maxHeight: "calc(50vh - 140px)" }}>
                <div className="grid grid-cols-4 gap-2">
                  {filtered.map((asset) => (
                    <motion.div
                      key={asset.id}
                      draggable={!disabled}
                      onDragStart={(e) => handleDragStart(e as any, asset)}
                      className={cn(
                        "flex flex-col items-center gap-1 p-3 rounded-2xl cursor-grab active:cursor-grabbing hover:bg-white/60 transition-all",
                        disabled && "opacity-50 cursor-not-allowed"
                      )}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.9 }}
                      data-testid={`asset-${asset.id}`}
                    >
                      <span className="text-4xl" style={{ minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {asset.icon}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-medium text-center leading-tight">{asset.label}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Desktop: Floating translucent panel */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="hidden md:flex absolute left-6 top-6 bottom-6 z-30 w-64 bg-white/30 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-4">
                <h3 className="font-serif text-base text-primary">Asset Library</h3>
                <button
                  onClick={onToggle}
                  className="min-w-[44px] min-h-[44px] p-2 hover:bg-white/50 rounded-xl transition-colors cursor-pointer flex items-center justify-center"
                  data-testid="button-close-assets-desktop"
                >
                  <X size={16} className="text-muted-foreground" />
                </button>
              </div>

              <div className="flex gap-1.5 px-4 pb-3">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer",
                      activeCategory === cat.id
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-white/40 text-muted-foreground hover:bg-white/60"
                    )}
                    data-testid={`button-category-desktop-${cat.id}`}
                  >
                    {cat.emoji} {cat.label}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto px-3 pb-4">
                <div className="grid grid-cols-3 gap-2">
                  {filtered.map((asset) => (
                    <motion.div
                      key={asset.id}
                      draggable={!disabled}
                      onDragStart={(e) => handleDragStart(e as any, asset)}
                      className={cn(
                        "flex flex-col items-center gap-1 p-2.5 rounded-2xl cursor-grab active:cursor-grabbing hover:bg-white/50 transition-all",
                        disabled && "opacity-50 cursor-not-allowed"
                      )}
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.9 }}
                      data-testid={`asset-desktop-${asset.id}`}
                    >
                      <span className="text-3xl" style={{ minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {asset.icon}
                      </span>
                      <span className="text-[9px] text-muted-foreground/80 font-medium text-center leading-tight">{asset.label}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
