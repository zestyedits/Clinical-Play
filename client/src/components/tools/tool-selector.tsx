import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wind, Target, MessageSquarePlus, Send, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";

interface Tool {
  id: string;
  label: string;
  desc: string;
  icon: React.ElementType;
  status: "active" | "development" | "planned";
  accentColor: string;
  iconClass: string;
}

const TOOLS: Tool[] = [
  { id: "volume-mixer", label: "Volume Mixer", desc: "Externalize internal parts as tactile audio faders", icon: Wind, status: "active", accentColor: "#d4a017", iconClass: "icon-mixer" },
  { id: "feelings", label: "Feeling Wheel", desc: "Three-tier emotional identification through guided card exploration", icon: Target, status: "active", accentColor: "#8b5cf6", iconClass: "icon-feeling" },
];

interface ToolSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  activeTool: string;
  onSelectTool: (toolId: string) => void;
}

export function ToolSelector({ isOpen, onClose, activeTool, onSelectTool }: ToolSelectorProps) {
  const [showSuggest, setShowSuggest] = useState(false);
  const [toolName, setToolName] = useState("");
  const [toolDesc, setToolDesc] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submitSuggestion = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/tool-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolName,
          description: toolDesc || null,
          email: contactEmail || null,
        }),
      });
      if (!res.ok) throw new Error("Failed to submit");
      return res.json();
    },
    onSuccess: () => {
      setSubmitted(true);
      setTimeout(() => {
        setShowSuggest(false);
        setSubmitted(false);
        setToolName("");
        setToolDesc("");
        setContactEmail("");
      }, 2000);
    },
  });

  const statusLabel = (status: Tool["status"]) => {
    switch (status) {
      case "active": return null;
      case "development": return "In Development";
      case "planned": return "Coming Soon";
    }
  };

  const statusBadgeClass = (status: Tool["status"]) => {
    switch (status) {
      case "development": return "bg-primary/10 text-primary border-primary/20";
      case "planned": return "bg-accent/10 text-accent border-accent/20";
      default: return "";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/30 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 24, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.95, y: 20, filter: "blur(4px)" }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed inset-x-4 top-[10%] md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[520px] z-50 bg-card rounded-3xl shadow-xl border border-border overflow-hidden max-h-[80vh] flex flex-col"
          >
            <div className="flex items-center justify-between p-6 pb-2 shrink-0 relative z-10">
              <div>
                <h2 className="font-serif text-2xl text-primary">Clinical Tools</h2>
                <p className="text-sm text-muted-foreground mt-1">Your therapeutic toolkit is growing</p>
              </div>
              <button
                onClick={onClose}
                className="min-w-[44px] min-h-[44px] p-2 hover:bg-secondary/50 rounded-xl transition-colors cursor-pointer flex items-center justify-center"
                data-testid="button-close-tool-selector"
              >
                <X size={20} className="text-muted-foreground" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 relative z-10">
              <AnimatePresence mode="wait">
                {!showSuggest ? (
                  <motion.div
                    key="tools"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-2"
                  >
                    {TOOLS.map((tool, i) => {
                      const isAvailable = tool.status === "active";
                      const badge = statusLabel(tool.status);
                      const isActive = activeTool === tool.id;

                      return (
                        <motion.button
                          key={tool.id}
                          onClick={() => {
                            if (isAvailable) {
                              onSelectTool(tool.id);
                              onClose();
                            }
                          }}
                          className={cn(
                            "w-full p-4 rounded-2xl text-left transition-all flex items-start gap-4 relative overflow-hidden",
                            isActive
                              ? "bg-primary text-primary-foreground shadow-md cursor-pointer"
                              : isAvailable
                                ? "bg-card border border-border border-l-3 cursor-pointer hover:bg-secondary"
                                : "bg-secondary/30 border border-dashed border-muted-foreground/15 opacity-40 cursor-default"
                          )}
                          style={!isActive && isAvailable ? { borderLeftColor: tool.accentColor } : undefined}
                          initial={{ opacity: 0, x: -12, y: 6 }}
                          animate={{ opacity: 1, x: 0, y: 0 }}
                          transition={{ delay: i * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                          whileHover={isAvailable ? { scale: 1.02, x: 4 } : {}}
                          whileTap={isAvailable ? { scale: 0.99 } : {}}
                          disabled={!isAvailable}
                          data-testid={`button-select-tool-${tool.id}`}
                        >
                          <div
                            className={cn(
                              "p-3 rounded-xl shrink-0 flex items-center justify-center",
                              isActive ? "bg-primary-foreground/15" : ""
                            )}
                            style={!isActive ? {
                              background: `linear-gradient(135deg, ${tool.accentColor}20 0%, ${tool.accentColor}08 100%)`,
                            } : undefined}
                          >
                            <tool.icon size={26} className={isActive ? "text-primary-foreground" : ""} style={!isActive ? { color: tool.accentColor } : undefined} />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium flex items-center gap-2 flex-wrap">
                              {tool.label}
                              {badge && (
                                <span className={cn(
                                  "text-[10px] px-2 py-0.5 rounded-full font-semibold border",
                                  statusBadgeClass(tool.status)
                                )}>
                                  {badge}
                                </span>
                              )}
                              {isActive && (
                                <span className="text-[10px] bg-primary-foreground/20 px-2 py-0.5 rounded-full">
                                  Active
                                </span>
                              )}
                            </div>
                            <p className={cn(
                              "text-sm mt-1",
                              isActive ? "text-primary-foreground/70" : "text-muted-foreground"
                            )}>
                              {tool.desc}
                            </p>
                          </div>
                        </motion.button>
                      );
                    })}
                  </motion.div>
                ) : (
                  <motion.div
                    key="suggest"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-4"
                  >
                    {submitted ? (
                      <div className="text-center py-12">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                          <CheckCircle2 size={48} className="text-primary mx-auto mb-4" />
                        </motion.div>
                        <h3 className="font-serif text-xl text-primary mb-2">Thank You!</h3>
                        <p className="text-sm text-muted-foreground">Your suggestion helps us build a better clinical toolkit.</p>
                      </div>
                    ) : (
                      <>
                        <div>
                          <h3 className="font-serif text-lg text-primary mb-1">Suggest a Tool</h3>
                          <p className="text-sm text-muted-foreground">Help shape the future of ClinicalPlay</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-primary block mb-1.5">Tool Name *</label>
                          <input
                            type="text"
                            value={toolName}
                            onChange={(e) => setToolName(e.target.value)}
                            placeholder="e.g., Emotion Thermometer"
                            className="w-full px-4 py-3 rounded-xl bg-card border border-border text-primary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                            data-testid="input-tool-name"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-primary block mb-1.5">How would you use it?</label>
                          <textarea
                            value={toolDesc}
                            onChange={(e) => setToolDesc(e.target.value)}
                            placeholder="Describe the tool and how it would benefit your sessions..."
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl bg-card border border-border text-primary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm resize-none"
                            data-testid="input-tool-description"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-primary block mb-1.5">Your email (optional)</label>
                          <input
                            type="email"
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            placeholder="We'll notify you when it launches"
                            className="w-full px-4 py-3 rounded-xl bg-card border border-border text-primary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                            data-testid="input-tool-email"
                          />
                        </div>
                        <button
                          onClick={() => submitSuggestion.mutate()}
                          disabled={!toolName.trim() || submitSuggestion.isPending}
                          className="btn-warm w-full min-h-[44px] py-3 rounded-xl bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2 shadow-md hover:opacity-90 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          data-testid="button-submit-suggestion"
                        >
                          <Send size={16} />
                          {submitSuggestion.isPending ? "Submitting..." : "Submit Suggestion"}
                        </button>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="px-4 pb-4 pt-2 shrink-0 border-t border-border relative z-10">
              {!showSuggest ? (
                <button
                  onClick={() => setShowSuggest(true)}
                  className="btn-warm w-full min-h-[44px] py-3 rounded-xl bg-accent/10 text-accent font-medium text-sm flex items-center justify-center gap-2 hover:bg-accent/20 transition-colors cursor-pointer border border-accent/20"
                  data-testid="button-suggest-tool"
                >
                  <MessageSquarePlus size={16} />
                  Suggest a Tool
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShowSuggest(false);
                    setSubmitted(false);
                  }}
                  className="w-full min-h-[44px] py-3 rounded-xl bg-secondary/50 text-primary font-medium text-sm flex items-center justify-center gap-2 hover:bg-secondary transition-colors cursor-pointer"
                  data-testid="button-back-to-tools"
                >
                  Back to Tools
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
