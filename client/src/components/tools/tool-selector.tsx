import { motion, AnimatePresence } from "framer-motion";
import { X, Palette, Wind, Brain, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface Tool {
  id: string;
  label: string;
  desc: string;
  icon: React.ElementType;
  available: boolean;
}

const TOOLS: Tool[] = [
  { id: "sandtray", label: "Zen Sandtray", desc: "Expressive world-building with drag-and-drop assets", icon: Palette, available: true },
  { id: "breathing", label: "Calm Breathing", desc: "Synchronized breathing exercise for the group", icon: Wind, available: true },
  { id: "cbt", label: "Thought Bridge (CBT)", desc: "Cognitive restructuring visualization", icon: Brain, available: false },
  { id: "feelings", label: "Feeling Wheel", desc: "Interactive emotional identification tool", icon: Target, available: false },
];

interface ToolSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  activeTool: string;
  onSelectTool: (toolId: string) => void;
}

export function ToolSelector({ isOpen, onClose, activeTool, onSelectTool }: ToolSelectorProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed inset-x-4 top-[15%] md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[480px] z-50 bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 pb-2">
              <div>
                <h2 className="font-serif text-2xl text-primary">Clinical Tools</h2>
                <p className="text-sm text-muted-foreground mt-1">Select a therapeutic tool for this session</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-secondary/50 rounded-xl transition-colors cursor-pointer"
                data-testid="button-close-tool-selector"
              >
                <X size={20} className="text-muted-foreground" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              {TOOLS.map((tool, i) => (
                <motion.button
                  key={tool.id}
                  onClick={() => {
                    if (tool.available) {
                      onSelectTool(tool.id);
                      onClose();
                    }
                  }}
                  className={cn(
                    "w-full p-4 rounded-2xl text-left transition-all flex items-start gap-4 cursor-pointer",
                    activeTool === tool.id
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : tool.available
                        ? "bg-white/50 hover:bg-white/80 hover:shadow-md border border-white/30"
                        : "bg-white/20 border border-dashed border-border/40 opacity-60 cursor-not-allowed"
                  )}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={tool.available ? { scale: 1.01 } : {}}
                  whileTap={tool.available ? { scale: 0.99 } : {}}
                  disabled={!tool.available}
                  data-testid={`button-select-tool-${tool.id}`}
                >
                  <div className={cn(
                    "p-3 rounded-xl shrink-0",
                    activeTool === tool.id ? "bg-white/15" : "bg-secondary/50"
                  )}>
                    <tool.icon size={22} />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium flex items-center gap-2">
                      {tool.label}
                      {!tool.available && (
                        <span className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full font-semibold">
                          Coming Soon
                        </span>
                      )}
                      {activeTool === tool.id && (
                        <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                    <p className={cn(
                      "text-sm mt-1",
                      activeTool === tool.id ? "text-primary-foreground/70" : "text-muted-foreground"
                    )}>
                      {tool.desc}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>

            <div className="px-6 pb-6 pt-2">
              <p className="text-xs text-muted-foreground/60 text-center">
                More tools are being developed for your clinical toolkit
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
