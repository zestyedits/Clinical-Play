import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { playClickSound } from "@/lib/audio-feedback";

// ─── Control Type Definitions ────────────────────────────────────────────────

export interface ToolbarToggleControl {
  type: "toggle";
  key: string;
  icon: React.ElementType;
  label: string;
  activeLabel?: string;
  activeColor?: string; // tailwind color name: "sky" | "amber" | "purple" | "emerald" | "rose"
}

export interface ToolbarCycleControl {
  type: "cycle";
  key: string;
  icon: React.ElementType;
  options: { value: string | number; label: string }[];
  label: string;
  activeColor?: string;
  showBadge?: boolean;
}

export interface ToolbarNumberControl {
  type: "number";
  key: string;
  icon: React.ElementType;
  label: string;
  steps: number[]; // cycles through these values, 0 = off
  activeColor?: string;
}

export interface ToolbarFilterControl {
  type: "filter";
  key: string;
  icon: React.ElementType;
  label: string;
  allOptions: { value: string; label: string }[];
  activeColor?: string;
}

export type ToolbarControl =
  | ToolbarToggleControl
  | ToolbarCycleControl
  | ToolbarNumberControl
  | ToolbarFilterControl;

export interface ClinicianToolbarProps {
  controls: ToolbarControl[];
  settings: Record<string, any>;
  onUpdate: (updates: Record<string, any>) => void;
  onClear?: () => void;
}

// ─── Color Helpers ───────────────────────────────────────────────────────────

const COLOR_MAP: Record<string, { bg: string; text: string }> = {
  sky: { bg: "bg-sky-500/30", text: "text-sky-300" },
  amber: { bg: "bg-amber-500/30", text: "text-amber-300" },
  purple: { bg: "bg-purple-500/30", text: "text-purple-300" },
  emerald: { bg: "bg-emerald-500/30", text: "text-emerald-300" },
  rose: { bg: "bg-rose-500/30", text: "text-rose-300" },
  indigo: { bg: "bg-indigo-500/30", text: "text-indigo-300" },
  cyan: { bg: "bg-cyan-500/30", text: "text-cyan-300" },
  orange: { bg: "bg-orange-500/30", text: "text-orange-300" },
};

function getColorClasses(color?: string) {
  return COLOR_MAP[color || "sky"] || COLOR_MAP.sky;
}

// ─── Filter Popover ──────────────────────────────────────────────────────────

function FilterPopover({
  control,
  currentValue,
  onUpdate,
  onClose,
}: {
  control: ToolbarFilterControl;
  currentValue: string[];
  onUpdate: (value: string[]) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const toggleOption = useCallback(
    (val: string) => {
      playClickSound();
      const next = currentValue.includes(val)
        ? currentValue.filter((v) => v !== val)
        : [...currentValue, val];
      onUpdate(next);
    },
    [currentValue, onUpdate]
  );

  const allSelected = currentValue.length === control.allOptions.length;
  const toggleAll = useCallback(() => {
    playClickSound();
    onUpdate(allSelected ? [] : control.allOptions.map((o) => o.value));
  }, [allSelected, control.allOptions, onUpdate]);

  const colors = getColorClasses(control.activeColor);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: 8, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 8, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className="absolute right-12 top-0 z-50 w-48 max-h-64 overflow-y-auto
        bg-[#1B2A4A]/95 backdrop-blur-xl rounded-xl border border-white/10
        shadow-2xl p-2 space-y-0.5"
    >
      <div className="flex items-center justify-between px-2 py-1 mb-1">
        <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">
          {control.label}
        </span>
        <button
          onClick={toggleAll}
          className="text-[10px] text-white/50 hover:text-white/80 transition-colors"
        >
          {allSelected ? "None" : "All"}
        </button>
      </div>
      {control.allOptions.map((opt) => {
        const isSelected = currentValue.includes(opt.value);
        return (
          <button
            key={opt.value}
            onClick={() => toggleOption(opt.value)}
            className={cn(
              "w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-all text-left",
              isSelected
                ? `${colors.bg} ${colors.text}`
                : "text-white/55 hover:bg-white/5 hover:text-white/80"
            )}
          >
            <div
              className={cn(
                "w-3.5 h-3.5 rounded flex-shrink-0 border flex items-center justify-center transition-all",
                isSelected
                  ? "border-white/30 bg-white/15"
                  : "border-white/15 bg-transparent"
              )}
            >
              {isSelected && <Check className="w-2.5 h-2.5" />}
            </div>
            <span className="truncate">{opt.label}</span>
          </button>
        );
      })}
    </motion.div>
  );
}

// ─── Main ClinicianToolbar ───────────────────────────────────────────────────

export function ClinicianToolbar({
  controls,
  settings,
  onUpdate,
  onClear,
}: ClinicianToolbarProps) {
  const [confirmClear, setConfirmClear] = useState(false);
  const [openFilterKey, setOpenFilterKey] = useState<string | null>(null);

  const renderControl = useCallback(
    (control: ToolbarControl) => {
      const Icon = control.icon;
      const colors = getColorClasses(control.activeColor);

      switch (control.type) {
        case "toggle": {
          const isActive = !!settings[control.key];
          return (
            <button
              key={control.key}
              onClick={() => {
                playClickSound();
                onUpdate({ [control.key]: !isActive });
              }}
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative group",
                isActive
                  ? `${colors.bg} ${colors.text}`
                  : "text-white/70 hover:text-white hover:bg-white/10"
              )}
              title={isActive ? (control.activeLabel || control.label) : control.label}
            >
              <Icon size={16} />
              <span className="absolute right-12 bg-[#1B2A4A] text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
                {isActive ? (control.activeLabel || control.label) : control.label}
              </span>
            </button>
          );
        }

        case "cycle": {
          const currentVal = settings[control.key];
          const currentIdx = control.options.findIndex((o) => o.value === currentVal);
          const currentOption = control.options[currentIdx] || control.options[0];
          const isActive = currentIdx > 0;
          return (
            <div key={control.key} className="relative group">
              <button
                onClick={() => {
                  playClickSound();
                  const nextIdx = (currentIdx + 1) % control.options.length;
                  onUpdate({ [control.key]: control.options[nextIdx].value });
                }}
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer",
                  isActive
                    ? `${colors.bg} ${colors.text}`
                    : "text-white/70 hover:text-white hover:bg-white/10"
                )}
                title={`${control.label}: ${currentOption.label}`}
              >
                <Icon size={16} />
              </button>
              <span className="absolute right-12 bg-[#1B2A4A] text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
                {currentOption.label}
              </span>
              {control.showBadge && isActive && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {currentOption.value}
                </span>
              )}
            </div>
          );
        }

        case "number": {
          const currentVal = settings[control.key] ?? control.steps[0];
          const currentIdx = control.steps.indexOf(currentVal);
          const isActive = currentVal > 0;
          return (
            <div key={control.key} className="relative group">
              <button
                onClick={() => {
                  playClickSound();
                  const nextIdx = (currentIdx + 1) % control.steps.length;
                  onUpdate({ [control.key]: control.steps[nextIdx] });
                }}
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer",
                  isActive
                    ? `${colors.bg} ${colors.text}`
                    : "text-white/70 hover:text-white hover:bg-white/10"
                )}
                title={`${control.label}: ${isActive ? currentVal : "Off"}`}
              >
                <Icon size={16} />
              </button>
              <span className="absolute right-12 bg-[#1B2A4A] text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
                {control.label}: {isActive ? currentVal : "Off"}
              </span>
              {isActive && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {currentVal}
                </span>
              )}
            </div>
          );
        }

        case "filter": {
          const currentVal: string[] = settings[control.key] || control.allOptions.map((o) => o.value);
          const allEnabled = currentVal.length === control.allOptions.length;
          const isOpen = openFilterKey === control.key;
          return (
            <div key={control.key} className="relative group">
              <button
                onClick={() => {
                  playClickSound();
                  setOpenFilterKey(isOpen ? null : control.key);
                }}
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer",
                  !allEnabled
                    ? `${colors.bg} ${colors.text}`
                    : "text-white/70 hover:text-white hover:bg-white/10"
                )}
                title={control.label}
              >
                <Icon size={16} />
              </button>
              {!isOpen && (
                <span className="absolute right-12 bg-[#1B2A4A] text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
                  {control.label}{!allEnabled ? ` (${currentVal.length}/${control.allOptions.length})` : ""}
                </span>
              )}
              {!allEnabled && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {currentVal.length}
                </span>
              )}
              <AnimatePresence>
                {isOpen && (
                  <FilterPopover
                    control={control}
                    currentValue={currentVal}
                    onUpdate={(val) => onUpdate({ [control.key]: val })}
                    onClose={() => setOpenFilterKey(null)}
                  />
                )}
              </AnimatePresence>
            </div>
          );
        }
      }
    },
    [settings, onUpdate, openFilterKey]
  );

  return (
    <motion.div
      initial={{ x: 60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 60, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="absolute right-3 top-1/2 -translate-y-1/2 z-30"
    >
      <div className="bg-[#1B2A4A]/90 backdrop-blur-xl rounded-2xl p-2 shadow-2xl border border-white/10 flex flex-col gap-1.5">
        {controls.map((control) => renderControl(control))}

        {onClear && (
          <>
            {/* Divider */}
            <div className="w-6 h-px bg-white/20 mx-auto" />

            {/* Clear all */}
            <AnimatePresence mode="wait">
              {!confirmClear ? (
                <motion.button
                  key="clear-idle"
                  onClick={() => {
                    playClickSound();
                    setConfirmClear(true);
                  }}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer relative group"
                  title="Clear All"
                >
                  <Trash2 size={16} />
                  <span className="absolute right-12 bg-[#1B2A4A] text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
                    Clear All
                  </span>
                </motion.button>
              ) : (
                <motion.div
                  key="clear-confirm"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="flex flex-col gap-1"
                >
                  <button
                    onClick={() => {
                      playClickSound();
                      onClear();
                      setConfirmClear(false);
                    }}
                    className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-500/30 text-red-300 cursor-pointer hover:bg-red-500/50 transition-all"
                    title="Confirm Clear"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={() => {
                      playClickSound();
                      setConfirmClear(false);
                    }}
                    className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 text-white/50 cursor-pointer hover:bg-white/10 transition-all"
                    title="Cancel"
                  >
                    <X size={16} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </motion.div>
  );
}
