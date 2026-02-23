import { useState, useEffect, useCallback, useRef, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TourStep {
  target: string;
  title: string;
  content: string;
  position?: "top" | "bottom" | "left" | "right" | "auto";
  emoji?: string;
}

interface GuidedTourProps {
  steps: TourStep[];
  tourKey: string;
  isActive: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

function getTooltipPosition(rect: DOMRect, position: string, tooltipW: number, tooltipH: number) {
  const gap = 16;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let resolved = position;
  if (resolved === "auto") {
    const spaceBelow = vh - rect.bottom;
    const spaceAbove = rect.top;
    const spaceRight = vw - rect.right;
    const spaceLeft = rect.left;
    if (spaceBelow >= tooltipH + gap) resolved = "bottom";
    else if (spaceAbove >= tooltipH + gap) resolved = "top";
    else if (spaceRight >= tooltipW + gap) resolved = "right";
    else if (spaceLeft >= tooltipW + gap) resolved = "left";
    else resolved = "bottom";
  }

  let x = 0, y = 0;
  switch (resolved) {
    case "bottom":
      x = rect.left + rect.width / 2 - tooltipW / 2;
      y = rect.bottom + gap;
      break;
    case "top":
      x = rect.left + rect.width / 2 - tooltipW / 2;
      y = rect.top - tooltipH - gap;
      break;
    case "right":
      x = rect.right + gap;
      y = rect.top + rect.height / 2 - tooltipH / 2;
      break;
    case "left":
      x = rect.left - tooltipW - gap;
      y = rect.top + rect.height / 2 - tooltipH / 2;
      break;
  }

  x = Math.max(12, Math.min(x, vw - tooltipW - 12));
  y = Math.max(12, Math.min(y, vh - tooltipH - 12));

  return { x, y, resolved };
}

function findTarget(target: string): Element | null {
  return document.querySelector(`[data-testid="${target}"]`) ||
         document.querySelector(`[data-tour="${target}"]`);
}

export function GuidedTour({ steps, tourKey, isActive, onComplete, onSkip }: GuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const hasScrolledRef = useRef(false);
  const step = steps[currentStep];

  useEffect(() => {
    if (isActive) {
      setCurrentStep(0);
      setTargetRect(null);
      hasScrolledRef.current = false;
    }
  }, [isActive, tourKey]);

  useEffect(() => {
    hasScrolledRef.current = false;
  }, [currentStep]);

  const updatePosition = useCallback(() => {
    if (!step) return;
    const el = findTarget(step.target);
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);

      if (!hasScrolledRef.current) {
        const isInViewport = rect.top >= 0 && rect.bottom <= window.innerHeight;
        if (!isInViewport) {
          el.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
        hasScrolledRef.current = true;
      }

      const tooltipEl = tooltipRef.current;
      const tooltipW = tooltipEl ? tooltipEl.offsetWidth : 320;
      const tooltipH = tooltipEl ? tooltipEl.offsetHeight : 180;
      const { x, y } = getTooltipPosition(rect, step.position || "auto", tooltipW, tooltipH);
      setTooltipPos({ x, y });
    } else {
      setTargetRect(null);
      setTooltipPos({ x: window.innerWidth / 2 - 160, y: window.innerHeight / 2 - 90 });
    }
  }, [step]);

  useEffect(() => {
    if (!isActive) return;

    const retryUntilFound = () => {
      if (!step) return;
      const el = findTarget(step.target);
      if (el) {
        updatePosition();
      } else {
        retryTimer = setTimeout(retryUntilFound, 200);
      }
    };

    let retryTimer: ReturnType<typeof setTimeout>;
    updatePosition();
    const initialTimer = setTimeout(updatePosition, 300);
    if (!findTarget(step?.target || "")) {
      retryTimer = setTimeout(retryUntilFound, 200);
    }

    const handleResize = () => updatePosition();
    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(initialTimer);
      clearTimeout(retryTimer);
      window.removeEventListener("resize", handleResize);
    };
  }, [isActive, currentStep, updatePosition, step]);

  useLayoutEffect(() => {
    if (!isActive || !tooltipRef.current) return;
    updatePosition();
  }, [isActive, currentStep]);

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      try { localStorage.setItem(`tour_${tourKey}`, "completed"); } catch {}
      onComplete();
    }
  }, [currentStep, steps.length, tourKey, onComplete]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  }, [currentStep]);

  const handleSkip = useCallback(() => {
    try { localStorage.setItem(`tour_${tourKey}`, "completed"); } catch {}
    onSkip();
  }, [tourKey, onSkip]);

  if (!isActive || !step) return null;

  const padding = 8;

  return (
    <div className="fixed inset-0 z-[200]" data-testid="guided-tour-overlay">
      <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none" }}>
        <defs>
          <mask id={`tour-mask-${tourKey}`}>
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {targetRect && (
              <rect
                x={targetRect.left - padding}
                y={targetRect.top - padding}
                width={targetRect.width + padding * 2}
                height={targetRect.height + padding * 2}
                rx="12"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0" y="0" width="100%" height="100%" fill="rgba(0, 0, 0, 0.55)"
          mask={`url(#tour-mask-${tourKey})`}
          style={{ pointerEvents: "all" }}
          onClick={(e) => e.stopPropagation()}
        />
      </svg>

      {targetRect && (
        <div
          className="absolute rounded-xl pointer-events-none"
          style={{
            left: targetRect.left - padding,
            top: targetRect.top - padding,
            width: targetRect.width + padding * 2,
            height: targetRect.height + padding * 2,
            boxShadow: "0 0 0 3px hsl(var(--primary) / 0.5), 0 0 20px hsl(var(--primary) / 0.15)",
            transition: "all 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          ref={tooltipRef}
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.96 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="absolute w-[320px] bg-card rounded-2xl shadow-2xl border border-border overflow-hidden"
          style={{
            left: tooltipPos.x,
            top: tooltipPos.y,
            zIndex: 201,
          }}
          data-testid="guided-tour-tooltip"
        >
          <div className="p-5 pb-3">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2.5">
                {step.emoji && (
                  <span className="text-xl">{step.emoji}</span>
                )}
                <h3 className="font-serif text-base text-primary leading-tight">{step.title}</h3>
              </div>
              <button
                onClick={handleSkip}
                className="p-1 text-muted-foreground hover:text-primary hover:bg-secondary/50 rounded-lg transition-colors cursor-pointer shrink-0"
                data-testid="button-tour-skip"
              >
                <X size={14} />
              </button>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">{step.content}</p>
          </div>

          <div className="px-5 pb-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              {steps.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-all duration-300",
                    i === currentStep ? "bg-accent w-4" : i < currentStep ? "bg-accent/40" : "bg-secondary"
                  )}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <button
                  onClick={handlePrev}
                  className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-primary hover:bg-secondary/50 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                  data-testid="button-tour-prev"
                >
                  <ChevronLeft size={12} /> Back
                </button>
              )}
              <button
                onClick={handleNext}
                className="px-4 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-lg shadow-sm hover:brightness-110 transition-all cursor-pointer flex items-center gap-1"
                data-testid="button-tour-next"
              >
                {currentStep === steps.length - 1 ? "Got it!" : "Next"}
                {currentStep < steps.length - 1 && <ChevronRight size={12} />}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function useTour(tourKey: string) {
  const [isActive, setIsActive] = useState(false);

  const start = useCallback(() => setIsActive(true), []);
  const complete = useCallback(() => setIsActive(false), []);
  const skip = useCallback(() => setIsActive(false), []);

  const hasCompleted = useCallback(() => {
    try {
      return localStorage.getItem(`tour_${tourKey}`) === "completed";
    } catch {
      return false;
    }
  }, [tourKey]);

  const reset = useCallback(() => {
    try { localStorage.removeItem(`tour_${tourKey}`); } catch {}
  }, [tourKey]);

  return { isActive, start, complete, skip, hasCompleted, reset };
}
