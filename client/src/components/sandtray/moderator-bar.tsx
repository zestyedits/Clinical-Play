import { motion } from "framer-motion";
import { Lock, Unlock, RotateCcw, Ghost, Eye, Users, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModeratorBarProps {
  isCanvasLocked: boolean;
  isAnonymous: boolean;
  onToggleLock: () => void;
  onToggleAnonymity: () => void;
  onClearCanvas: () => void;
  participantCount: number;
}

export function ModeratorBar({
  isCanvasLocked,
  isAnonymous,
  onToggleLock,
  onToggleAnonymity,
  onClearCanvas,
  participantCount,
}: ModeratorBarProps) {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-40"
    >
      <div className="bg-primary/90 backdrop-blur-xl text-primary-foreground p-2 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-1 md:gap-2 ring-1 ring-black/5">
        <div className="hidden md:flex flex-col px-3 border-r border-white/10 mr-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-accent flex items-center gap-1">
            <Shield size={10} className="fill-accent/50" /> Moderator
          </span>
          <span className="text-xs opacity-70">{participantCount} online</span>
        </div>

        <button
          onClick={onToggleLock}
          className={cn(
            "flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all active:scale-95 gap-1 cursor-pointer",
            isCanvasLocked ? "bg-destructive text-white shadow-inner shadow-black/20" : "hover:bg-white/10"
          )}
          data-testid="button-toggle-lock"
        >
          {isCanvasLocked ? <Unlock size={20} /> : <Lock size={20} />}
          <span className="text-[9px] font-medium">{isCanvasLocked ? "Unlock" : "Lock"}</span>
        </button>

        <button
          onClick={onClearCanvas}
          className="flex flex-col items-center justify-center w-14 h-14 rounded-xl hover:bg-white/10 transition-all active:scale-95 gap-1 group cursor-pointer"
          data-testid="button-clear-canvas"
        >
          <RotateCcw size={20} className="group-hover:-rotate-90 transition-transform" />
          <span className="text-[9px] font-medium">Clear</span>
        </button>

        <div className="w-px h-8 bg-white/10 mx-1" />

        <button
          onClick={onToggleAnonymity}
          className={cn(
            "flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all active:scale-95 gap-1 cursor-pointer",
            isAnonymous ? "bg-purple-500/80 text-white" : "hover:bg-white/10"
          )}
          data-testid="button-toggle-anonymity"
        >
          {isAnonymous ? <Ghost size={20} /> : <Eye size={20} />}
          <span className="text-[9px] font-medium">{isAnonymous ? "Anon" : "Named"}</span>
        </button>
      </div>
    </motion.div>
  );
}
