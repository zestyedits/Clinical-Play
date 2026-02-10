import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Link2, Trash2, Box } from "lucide-react";
import { PART_COLORS, PART_SIZES, METAPHOR_LABELS } from "@/lib/parts-theater-data";
import type { TheaterPartData } from "./index";

interface PartDetailPanelProps {
  part: TheaterPartData;
  metaphor: string;
  onUpdate: (partId: string, fields: Partial<TheaterPartData>) => void;
  onRemove: (partId: string) => void;
  onStartConnection: (partId: string) => void;
  onClose: () => void;
}

export function PartDetailPanel({ part, metaphor, onUpdate, onRemove, onStartConnection, onClose }: PartDetailPanelProps) {
  const [name, setName] = useState(part.name || "");
  const [note, setNote] = useState(part.note || "");
  const [confirmRemove, setConfirmRemove] = useState(false);
  const labels = METAPHOR_LABELS[metaphor] || METAPHOR_LABELS.parts;

  useEffect(() => {
    setName(part.name || "");
    setNote(part.note || "");
    setConfirmRemove(false);
  }, [part.id]);

  const handleNameBlur = () => {
    const trimmed = name.trim() || null;
    if (trimmed !== part.name) {
      onUpdate(part.id, { name: trimmed } as any);
    }
  };

  const handleNoteBlur = () => {
    const trimmed = note.trim() || null;
    if (trimmed !== part.note) {
      onUpdate(part.id, { note: trimmed } as any);
    }
  };

  return (
    <motion.div
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      className="absolute right-0 top-0 bottom-0 w-72 md:w-80 bg-white/80 backdrop-blur-2xl border-l border-white/30 shadow-2xl z-30 flex flex-col overflow-y-auto"
    >
      {/* Header */}
      <div className="p-4 pb-3 flex items-center justify-between border-b border-white/20">
        <h3 className="font-serif text-base text-primary">{labels.noun} Detail</h3>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-secondary/50 rounded-lg transition-colors cursor-pointer"
        >
          <X size={16} className="text-muted-foreground" />
        </button>
      </div>

      <div className="p-4 space-y-4 flex-1">
        {/* Name */}
        <div>
          <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold block mb-1.5">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleNameBlur}
            placeholder={`Name this ${labels.noun.toLowerCase()}...`}
            className="w-full px-3 py-2 rounded-xl bg-white/60 border border-white/40 text-primary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/30 text-sm"
          />
        </div>

        {/* Color */}
        <div>
          <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold block mb-1.5">Color</label>
          <div className="flex flex-wrap gap-1.5">
            {PART_COLORS.map((c) => (
              <button
                key={c.id}
                onClick={() => onUpdate(part.id, { color: c.hex } as any)}
                className="w-7 h-7 rounded-full transition-all cursor-pointer"
                style={{
                  backgroundColor: c.hex,
                  boxShadow: part.color === c.hex
                    ? `0 0 0 2px white, 0 0 0 4px ${c.hex}`
                    : "0 1px 3px rgba(0,0,0,0.1)",
                  transform: part.color === c.hex ? "scale(1.15)" : "scale(1)",
                }}
                title={c.label}
              />
            ))}
          </div>
        </div>

        {/* Size */}
        <div>
          <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold block mb-1.5">Size</label>
          <div className="flex gap-2">
            {(["small", "medium", "large"] as const).map((s) => (
              <button
                key={s}
                onClick={() => onUpdate(part.id, { size: s } as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex-1 ${
                  part.size === s
                    ? "bg-primary text-white shadow-md"
                    : "bg-white/60 text-muted-foreground hover:bg-white/80 border border-white/40"
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Note */}
        <div>
          <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold block mb-1.5">Note</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onBlur={handleNoteBlur}
            placeholder="Add a note about this part..."
            rows={3}
            className="w-full px-3 py-2 rounded-xl bg-white/60 border border-white/40 text-primary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/30 text-sm resize-none"
          />
          <p className="text-[10px] text-amber-600/80 mt-1">
            Avoid recording PHI in notes.
          </p>
        </div>

        {/* Contain toggle */}
        <button
          onClick={() => onUpdate(part.id, { isContained: !part.isContained } as any)}
          className={`w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 cursor-pointer transition-all ${
            part.isContained
              ? "bg-primary/10 text-primary border border-primary/20"
              : "bg-white/60 text-muted-foreground hover:bg-white/80 border border-white/40"
          }`}
        >
          <Box size={14} />
          {part.isContained ? "Release from Containment" : "Contain this Part"}
        </button>

        {/* Draw connection */}
        <button
          onClick={() => onStartConnection(part.id)}
          className="w-full py-2.5 rounded-xl bg-accent/10 text-accent text-sm font-medium flex items-center justify-center gap-2 cursor-pointer hover:bg-accent/15 transition-colors border border-accent/20"
        >
          <Link2 size={14} />
          Draw Connection
        </button>

        {/* Remove */}
        {!confirmRemove ? (
          <button
            onClick={() => setConfirmRemove(true)}
            className="w-full py-2.5 rounded-xl bg-white/60 text-destructive/70 text-sm font-medium flex items-center justify-center gap-2 cursor-pointer hover:bg-destructive/5 transition-colors border border-white/40"
          >
            <Trash2 size={14} />
            Remove {labels.noun}
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setConfirmRemove(false)}
              className="flex-1 py-2.5 rounded-xl bg-white/60 text-muted-foreground text-xs font-medium cursor-pointer hover:bg-white/80 transition-colors border border-white/40"
            >
              Cancel
            </button>
            <button
              onClick={() => onRemove(part.id)}
              className="flex-1 py-2.5 rounded-xl bg-destructive/10 text-destructive text-xs font-medium cursor-pointer hover:bg-destructive/20 transition-colors border border-destructive/20"
            >
              Confirm Remove
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
