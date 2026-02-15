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
      initial={{ x: 60, opacity: 0, filter: "blur(4px)" }}
      animate={{ x: 0, opacity: 1, filter: "blur(0px)" }}
      exit={{ x: 60, opacity: 0, filter: "blur(4px)" }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="absolute top-1/2 -translate-y-1/2 right-3 md:right-5 z-40"
    >
      <div className="backdrop-blur-xl p-1.5 rounded-2xl shadow-2xl flex flex-col items-center gap-1"
        style={{
          background: `repeating-linear-gradient(92deg, transparent, transparent 5px, rgba(101,67,33,0.05) 5px, rgba(101,67,33,0.05) 6px), linear-gradient(180deg, #A0764A 0%, #8B6914 50%, #7A5C2E 100%)`,
          border: '1px solid rgba(0,0,0,0.1)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.12)',
        }}
      >
        <div className="flex flex-col items-center px-1 pb-1 border-b border-[#F5EDE0]/15 mb-0.5">
          <Shield size={12} className="text-[#F5EDE0] fill-[#F5EDE0]/30 mb-0.5" />
          <span className="text-[8px] font-bold uppercase tracking-widest text-[#F5EDE0] leading-none">Mod</span>
          <span className="text-[9px] text-[#F5EDE0]/60 leading-none mt-0.5">{participantCount}</span>
        </div>

        <button
          onClick={onToggleLock}
          className={cn(
            "flex flex-col items-center justify-center w-11 h-11 rounded-xl transition-all active:scale-95 gap-0.5 cursor-pointer",
            isCanvasLocked ? "bg-red-800/60 text-[#F5EDE0] shadow-inner shadow-black/20" : "text-[#F5EDE0]/80 hover:bg-[#F5EDE0]/10"
          )}
          data-testid="button-toggle-lock"
        >
          {isCanvasLocked ? <Unlock size={18} /> : <Lock size={18} />}
          <span className="text-[8px] font-medium">{isCanvasLocked ? "Unlock" : "Lock"}</span>
        </button>

        <button
          onClick={onClearCanvas}
          className="flex flex-col items-center justify-center w-11 h-11 rounded-xl text-[#F5EDE0]/80 hover:bg-[#F5EDE0]/10 transition-all active:scale-95 gap-0.5 group cursor-pointer"
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
              rakeMode ? "bg-[#C9A96E]/40 text-[#F5EDE0] shadow-inner shadow-black/20" : "text-[#F5EDE0]/80 hover:bg-[#F5EDE0]/10"
            )}
            data-testid="button-toggle-rake"
          >
            <Brush size={18} />
            <span className="text-[8px] font-medium">Rake</span>
          </button>
        )}

        <div className="w-7 h-px bg-[#F5EDE0]/15 mx-auto" />

        <button
          onClick={onToggleAnonymity}
          className={cn(
            "flex flex-col items-center justify-center w-11 h-11 rounded-xl transition-all active:scale-95 gap-0.5 cursor-pointer",
            isAnonymous ? "bg-[#B4A7D6]/40 text-[#F5EDE0]" : "text-[#F5EDE0]/80 hover:bg-[#F5EDE0]/10"
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
              zenMode ? "bg-[#C9A96E]/40 text-[#F5EDE0] shadow-inner shadow-black/20" : "text-[#F5EDE0]/80 hover:bg-[#F5EDE0]/10"
            )}
            data-testid="button-toggle-zen"
          >
            {zenMode ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
            <span className="text-[8px] font-medium">{zenMode ? "Show" : "Zen"}</span>
          </button>
        )}

        {/* Mood Slider */}
        {onLightTemperatureChange && (
          <div className="flex flex-col items-center gap-1 pt-1 border-t border-[#F5EDE0]/15 mt-0.5 px-1">
            <Sun size={12} className="text-[#F5EDE0]" />
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-[7px] text-[#F5EDE0]/50">Cool</span>
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
              <span className="text-[7px] text-[#F5EDE0]/50">Warm</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
