import { motion } from "framer-motion";
import { Lock, Unlock, RotateCcw, Ghost, Eye, Shield, Sun, Brush, Minimize2, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModeratorBarProps {
  isCanvasLocked: boolean;
  isAnonymous: boolean;
  onToggleLock: () => void;
  onToggleAnonymity: () => void;
  onClearCanvas: () => void;
  participantCount: number;
  lightTemperature?: number;
  onLightTemperatureChange?: (temperature: number) => void;
  rakeMode?: boolean;
  onToggleRakeMode?: () => void;
  zenMode?: boolean;
  onToggleZenMode?: () => void;
}

export function ModeratorBar({
  isCanvasLocked,
  isAnonymous,
  onToggleLock,
  onToggleAnonymity,
  onClearCanvas,
  participantCount,
  lightTemperature,
  onLightTemperatureChange,
  rakeMode,
  onToggleRakeMode,
  zenMode,
  onToggleZenMode,
}: ModeratorBarProps) {
  return (
    <motion.div
      initial={{ x: 60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 60, opacity: 0 }}
      className="absolute top-1/2 -translate-y-1/2 right-3 md:right-5 z-40"
    >
      <div className="bg-primary/90 backdrop-blur-xl text-primary-foreground p-1.5 rounded-2xl shadow-2xl border border-white/10 flex flex-col items-center gap-1 ring-1 ring-black/5">
        <div className="flex flex-col items-center px-1 pb-1 border-b border-white/10 mb-0.5">
          <Shield size={12} className="text-accent fill-accent/30 mb-0.5" />
          <span className="text-[8px] font-bold uppercase tracking-widest text-accent leading-none">Mod</span>
          <span className="text-[9px] opacity-60 leading-none mt-0.5">{participantCount}</span>
        </div>

        <button
          onClick={onToggleLock}
          className={cn(
            "flex flex-col items-center justify-center w-11 h-11 rounded-xl transition-all active:scale-95 gap-0.5 cursor-pointer",
            isCanvasLocked ? "bg-destructive text-white shadow-inner shadow-black/20" : "hover:bg-white/10"
          )}
          data-testid="button-toggle-lock"
        >
          {isCanvasLocked ? <Unlock size={18} /> : <Lock size={18} />}
          <span className="text-[8px] font-medium">{isCanvasLocked ? "Unlock" : "Lock"}</span>
        </button>

        <button
          onClick={onClearCanvas}
          className="flex flex-col items-center justify-center w-11 h-11 rounded-xl hover:bg-white/10 transition-all active:scale-95 gap-0.5 group cursor-pointer"
          data-testid="button-clear-canvas"
        >
          <RotateCcw size={18} className="group-hover:-rotate-90 transition-transform" />
          <span className="text-[8px] font-medium">Clear</span>
        </button>

        {onToggleRakeMode && (
          <button
            onClick={onToggleRakeMode}
            className={cn(
              "flex flex-col items-center justify-center w-11 h-11 rounded-xl transition-all active:scale-95 gap-0.5 cursor-pointer",
              rakeMode ? "bg-accent/80 text-primary shadow-inner shadow-black/20" : "hover:bg-white/10"
            )}
            data-testid="button-toggle-rake"
          >
            <Brush size={18} />
            <span className="text-[8px] font-medium">Rake</span>
          </button>
        )}

        <div className="w-7 h-px bg-white/10 mx-auto" />

        <button
          onClick={onToggleAnonymity}
          className={cn(
            "flex flex-col items-center justify-center w-11 h-11 rounded-xl transition-all active:scale-95 gap-0.5 cursor-pointer",
            isAnonymous ? "bg-purple-500/80 text-white" : "hover:bg-white/10"
          )}
          data-testid="button-toggle-anonymity"
        >
          {isAnonymous ? <Ghost size={18} /> : <Eye size={18} />}
          <span className="text-[8px] font-medium">{isAnonymous ? "Anon" : "Named"}</span>
        </button>

        {onToggleZenMode && (
          <button
            onClick={onToggleZenMode}
            className={cn(
              "flex flex-col items-center justify-center w-11 h-11 rounded-xl transition-all active:scale-95 gap-0.5 cursor-pointer",
              zenMode ? "bg-accent/80 text-primary shadow-inner shadow-black/20" : "hover:bg-white/10"
            )}
            data-testid="button-toggle-zen"
          >
            {zenMode ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
            <span className="text-[8px] font-medium">{zenMode ? "Show" : "Zen"}</span>
          </button>
        )}

        {/* Mood Slider */}
        {onLightTemperatureChange && (
          <div className="flex flex-col items-center gap-1 pt-1 border-t border-white/10 mt-0.5 px-1">
            <Sun size={12} className="text-accent" />
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-[7px] opacity-50">Cool</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={lightTemperature ?? 0.5}
                onChange={(e) => onLightTemperatureChange(parseFloat(e.target.value))}
                className="w-9 h-1 appearance-none rounded-full cursor-pointer"
                style={{
                  writingMode: "vertical-lr",
                  direction: "rtl",
                  height: "48px",
                  width: "6px",
                  background: `linear-gradient(to top, #4a5568, #d4af37)`,
                  WebkitAppearance: "none",
                }}
                data-testid="slider-mood"
              />
              <span className="text-[7px] opacity-50">Warm</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
