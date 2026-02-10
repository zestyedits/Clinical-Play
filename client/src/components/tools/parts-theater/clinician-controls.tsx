import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Snowflake, Eye, RefreshCw, Hash, Trash2 } from "lucide-react";
import { METAPHOR_LABELS } from "@/lib/parts-theater-data";

interface TheaterSettings {
  frozen: boolean;
  dimInactive: boolean;
  metaphor: string;
  partLimit: number;
}

interface ClinicianControlsProps {
  settings: TheaterSettings;
  onUpdateSettings: (updates: Partial<TheaterSettings>) => void;
  onClear: () => void;
}

const METAPHOR_KEYS = Object.keys(METAPHOR_LABELS);

export function ClinicianControls({ settings, onUpdateSettings, onClear }: ClinicianControlsProps) {
  const [confirmClear, setConfirmClear] = useState(false);

  const cycleMetaphor = () => {
    const idx = METAPHOR_KEYS.indexOf(settings.metaphor);
    const next = METAPHOR_KEYS[(idx + 1) % METAPHOR_KEYS.length];
    onUpdateSettings({ metaphor: next });
  };

  const labels = METAPHOR_LABELS[settings.metaphor] || METAPHOR_LABELS.parts;

  return (
    <motion.div
      initial={{ x: 60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 60, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="absolute right-4 top-1/2 -translate-y-1/2 z-20"
    >
      <div className="bg-[#1B2A4A]/90 backdrop-blur-xl rounded-2xl p-2 shadow-2xl border border-white/10 flex flex-col gap-1.5">
        {/* Metaphor toggle */}
        <button
          onClick={cycleMetaphor}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer relative group"
          title={`Metaphor: ${labels.plural}`}
        >
          <span className="text-xs font-bold">{labels.plural.charAt(0)}</span>
          <span className="absolute right-12 bg-[#1B2A4A] text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            {labels.plural}
          </span>
        </button>

        {/* Freeze */}
        <button
          onClick={() => onUpdateSettings({ frozen: !settings.frozen })}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative group ${
            settings.frozen ? "bg-sky-500/30 text-sky-300" : "text-white/70 hover:text-white hover:bg-white/10"
          }`}
          title={settings.frozen ? "Unfreeze Canvas" : "Freeze Canvas"}
        >
          <Snowflake size={16} />
          <span className="absolute right-12 bg-[#1B2A4A] text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            {settings.frozen ? "Unfreeze" : "Freeze"}
          </span>
        </button>

        {/* Dim inactive */}
        <button
          onClick={() => onUpdateSettings({ dimInactive: !settings.dimInactive })}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative group ${
            settings.dimInactive ? "bg-amber-500/30 text-amber-300" : "text-white/70 hover:text-white hover:bg-white/10"
          }`}
          title={settings.dimInactive ? "Show All" : "Dim Inactive"}
        >
          <Eye size={16} />
          <span className="absolute right-12 bg-[#1B2A4A] text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            {settings.dimInactive ? "Show All" : "Dim Inactive"}
          </span>
        </button>

        {/* Part limit */}
        <div className="relative group">
          <button
            onClick={() => {
              const next = settings.partLimit === 0 ? 3 : settings.partLimit >= 12 ? 0 : settings.partLimit + 3;
              onUpdateSettings({ partLimit: next });
            }}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              settings.partLimit > 0 ? "bg-purple-500/30 text-purple-300" : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
            title={settings.partLimit > 0 ? `Limit: ${settings.partLimit}` : "No limit"}
          >
            <Hash size={16} />
          </button>
          <span className="absolute right-12 bg-[#1B2A4A] text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Limit: {settings.partLimit || "Off"}
          </span>
          {settings.partLimit > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {settings.partLimit}
            </span>
          )}
        </div>

        {/* Divider */}
        <div className="w-6 h-px bg-white/20 mx-auto" />

        {/* Clear all */}
        <AnimatePresence>
          {!confirmClear ? (
            <button
              onClick={() => setConfirmClear(true)}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer relative group"
              title="Clear All"
            >
              <Trash2 size={16} />
              <span className="absolute right-12 bg-[#1B2A4A] text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Clear All
              </span>
            </button>
          ) : (
            <motion.button
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              onClick={() => { onClear(); setConfirmClear(false); }}
              onBlur={() => setTimeout(() => setConfirmClear(false), 200)}
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-500/30 text-red-300 cursor-pointer"
              autoFocus
            >
              <Trash2 size={16} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
