import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SANDTRAY_ASSETS, CATEGORIES, type SandtrayAsset } from "@/lib/sandtray-assets";
import { cn } from "@/lib/utils";
import { ChevronUp, X } from "lucide-react";

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
      {/* Toggle Handle */}
      <motion.button
        onClick={onToggle}
        className={cn(
          "absolute bottom-0 left-1/2 -translate-x-1/2 z-30 bg-white/90 backdrop-blur-xl px-6 py-2 rounded-t-2xl shadow-lg border border-b-0 border-border/50 flex items-center gap-2 text-primary font-medium text-sm cursor-pointer hover:bg-white transition-colors",
          isOpen && "bottom-auto"
        )}
        style={isOpen ? { display: 'none' } : {}}
        whileTap={{ scale: 0.97 }}
        data-testid="button-toggle-assets"
      >
        <ChevronUp size={16} className="text-accent" />
        Asset Library
      </motion.button>

      {/* Library Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-xl rounded-t-3xl shadow-2xl border-t border-border/50"
            style={{ maxHeight: "45%" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/30">
              <h3 className="font-serif text-lg text-primary">Choose a Piece</h3>
              <button
                onClick={onToggle}
                className="p-2 hover:bg-secondary rounded-full transition-colors cursor-pointer"
                data-testid="button-close-assets"
              >
                <X size={18} className="text-muted-foreground" />
              </button>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2 px-6 py-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer",
                    activeCategory === cat.id
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                  )}
                  data-testid={`button-category-${cat.id}`}
                >
                  {cat.emoji} {cat.label}
                </button>
              ))}
            </div>

            {/* Assets Grid */}
            <div className="px-6 py-4 overflow-y-auto" style={{ maxHeight: "calc(45vh - 140px)" }}>
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {filtered.map((asset) => (
                  <motion.div
                    key={asset.id}
                    draggable={!disabled}
                    onDragStart={(e) => handleDragStart(e as any, asset)}
                    className={cn(
                      "flex flex-col items-center gap-1 p-3 rounded-2xl cursor-grab active:cursor-grabbing hover:bg-secondary/50 transition-all border border-transparent hover:border-accent/20 hover:shadow-sm",
                      disabled && "opacity-50 cursor-not-allowed"
                    )}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
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
        )}
      </AnimatePresence>
    </>
  );
}
