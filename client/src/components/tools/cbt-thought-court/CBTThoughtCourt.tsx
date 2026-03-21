import { useReducer } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAudio } from "../../../lib/stores/useAudio";
import { WelcomeScreen } from "./WelcomeScreen";
import { DistortionsGuide } from "./DistortionsGuide";
import { StepWrapper } from "./StepWrapper";
import { ThoughtEntry } from "./ThoughtEntry";
import { DistortionPicker } from "./DistortionPicker";
import { BeliefSlider } from "./BeliefSlider";
import { EvidenceBoard } from "./EvidenceBoard";
import { VerdictReveal } from "./VerdictReveal";
import { ReframeStation } from "./ReframeStation";
import { CaseFileSummary } from "./CaseFileSummary";
import { FurtherReading } from "../shared/FurtherReading";
import { CBT_REFERENCES } from "../shared/references-data";

// ── Types ──────────────────────────────────────────────────────────────────

export type AgeMode = "child" | "teen" | "adult";

export interface TrialState {
  ageMode: AgeMode;
  currentStep: number; // -1 = welcome, 0-8 = trial steps
  originalThought: string;
  situation: string;
  selectedDistortions: string[];
  initialBelief: number;
  finalBelief: number;
  evidenceFor: string[];
  evidenceAgainst: string[];
  reframedThought: string;
  isDistortionsGuideOpen: boolean;
}

export type TrialAction =
  | { type: "SET_AGE_MODE"; payload: AgeMode }
  | { type: "START_TRIAL" }
  | { type: "SET_THOUGHT"; payload: string }
  | { type: "SET_SITUATION"; payload: string }
  | { type: "TOGGLE_DISTORTION"; payload: string }
  | { type: "SET_INITIAL_BELIEF"; payload: number }
  | { type: "ADD_EVIDENCE_FOR"; payload: string }
  | { type: "REMOVE_EVIDENCE_FOR"; payload: number }
  | { type: "ADD_EVIDENCE_AGAINST"; payload: string }
  | { type: "REMOVE_EVIDENCE_AGAINST"; payload: number }
  | { type: "SET_REFRAMED_THOUGHT"; payload: string }
  | { type: "SET_FINAL_BELIEF"; payload: number }
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "TOGGLE_GUIDE" }
  | { type: "RESET_TRIAL" };

// ── Reducer ────────────────────────────────────────────────────────────────

const initialState: TrialState = {
  ageMode: "adult",
  currentStep: -1,
  originalThought: "",
  situation: "",
  selectedDistortions: [],
  initialBelief: 50,
  finalBelief: 50,
  evidenceFor: [],
  evidenceAgainst: [],
  reframedThought: "",
  isDistortionsGuideOpen: false,
};

export function trialReducer(state: TrialState, action: TrialAction): TrialState {
  switch (action.type) {
    case "SET_AGE_MODE":
      return { ...state, ageMode: action.payload };

    case "START_TRIAL":
      return { ...state, currentStep: 0 };

    case "SET_THOUGHT":
      return { ...state, originalThought: action.payload };

    case "SET_SITUATION":
      return { ...state, situation: action.payload };

    case "TOGGLE_DISTORTION": {
      const distortion = action.payload;
      const exists = state.selectedDistortions.includes(distortion);
      return {
        ...state,
        selectedDistortions: exists
          ? state.selectedDistortions.filter((d) => d !== distortion)
          : [...state.selectedDistortions, distortion],
      };
    }

    case "SET_INITIAL_BELIEF":
      return { ...state, initialBelief: action.payload };

    case "ADD_EVIDENCE_FOR":
      return { ...state, evidenceFor: [...state.evidenceFor, action.payload] };

    case "REMOVE_EVIDENCE_FOR":
      return {
        ...state,
        evidenceFor: state.evidenceFor.filter((_, i) => i !== action.payload),
      };

    case "ADD_EVIDENCE_AGAINST":
      return {
        ...state,
        evidenceAgainst: [...state.evidenceAgainst, action.payload],
      };

    case "REMOVE_EVIDENCE_AGAINST":
      return {
        ...state,
        evidenceAgainst: state.evidenceAgainst.filter((_, i) => i !== action.payload),
      };

    case "SET_REFRAMED_THOUGHT":
      return { ...state, reframedThought: action.payload };

    case "SET_FINAL_BELIEF":
      return { ...state, finalBelief: action.payload };

    case "NEXT_STEP":
      return { ...state, currentStep: Math.min(state.currentStep + 1, 8) };

    case "PREV_STEP":
      return { ...state, currentStep: Math.max(state.currentStep - 1, 0) };

    case "TOGGLE_GUIDE":
      return { ...state, isDistortionsGuideOpen: !state.isDistortionsGuideOpen };

    case "RESET_TRIAL":
      return { ...initialState, ageMode: state.ageMode };

    default:
      return state;
  }
}

// ── Step labels ────────────────────────────────────────────────────────────

const STEP_CONFIG = [
  { label: "The Accusation", title: "Enter Your Thought", subtitle: "File the case", icon: "\uD83D\uDCDC" },
  { label: "The Charges", title: "Identify Distortions", subtitle: "What charges apply?", icon: "\uD83D\uDD28" },
  { label: "Sworn Testimony", title: "Rate Your Belief", subtitle: "How strongly do you believe it?", icon: "\uD83D\uDCCA" },
  { label: "The Prosecution", title: "Evidence For", subtitle: "The prosecution presents", icon: "\uD83D\uDD34" },
  { label: "The Defense", title: "Evidence Against", subtitle: "The defense responds", icon: "\uD83D\uDFE2" },
  { label: "The Verdict", title: "Weighing the Evidence", subtitle: "The court has reached a verdict", icon: "\u2696\uFE0F" },
  { label: "The Appeal", title: "Reframe the Thought", subtitle: "Write a balanced alternative", icon: "\u270F\uFE0F" },
  { label: "Final Testimony", title: "Re-rate Your Belief", subtitle: "Has anything changed?", icon: "\uD83D\uDCCA" },
  { label: "Case File", title: "Case Summary", subtitle: "Review your case file", icon: "\uD83D\uDCC1" },
];

// ── Component ──────────────────────────────────────────────────────────────

export function CBTThoughtCourt() {
  const [state, dispatch] = useReducer(trialReducer, initialState);
  const { isMuted, toggleMute } = useAudio();

  const stepConfig = STEP_CONFIG[state.currentStep] || STEP_CONFIG[0];
  const handleNext = () => dispatch({ type: "NEXT_STEP" });
  const handleBack = () => dispatch({ type: "PREV_STEP" });

  const canProceed = (() => {
    switch (state.currentStep) {
      case 0: return state.originalThought.trim().length > 0 && state.situation.trim().length > 0;
      case 1: return state.selectedDistortions.length > 0;
      case 2: return true; // slider always has a value
      case 3: return state.evidenceFor.length > 0;
      case 4: return state.evidenceAgainst.length > 0;
      case 5: return true; // display only
      case 6: return state.reframedThought.trim().length > 0;
      case 7: return true; // slider always has a value
      case 8: return true; // summary
      default: return false;
    }
  })();

  const renderStepContent = () => {
    switch (state.currentStep) {
      case 0:
        return (
          <ThoughtEntry
            thought={state.originalThought}
            situation={state.situation}
            onThoughtChange={(v) => dispatch({ type: "SET_THOUGHT", payload: v })}
            onSituationChange={(v) => dispatch({ type: "SET_SITUATION", payload: v })}
            ageMode={state.ageMode}
          />
        );
      case 1:
        return (
          <DistortionPicker
            selectedDistortions={state.selectedDistortions}
            onToggle={(id) => dispatch({ type: "TOGGLE_DISTORTION", payload: id })}
            ageMode={state.ageMode}
          />
        );
      case 2:
        return (
          <BeliefSlider
            value={state.initialBelief}
            onChange={(v) => dispatch({ type: "SET_INITIAL_BELIEF", payload: v })}
            ageMode={state.ageMode}
          />
        );
      case 3:
        return (
          <EvidenceBoard
            side="prosecution"
            evidence={state.evidenceFor}
            onAdd={(text) => dispatch({ type: "ADD_EVIDENCE_FOR", payload: text })}
            onRemove={(i) => dispatch({ type: "REMOVE_EVIDENCE_FOR", payload: i })}
            ageMode={state.ageMode}
            originalThought={state.originalThought}
          />
        );
      case 4:
        return (
          <EvidenceBoard
            side="defense"
            evidence={state.evidenceAgainst}
            onAdd={(text) => dispatch({ type: "ADD_EVIDENCE_AGAINST", payload: text })}
            onRemove={(i) => dispatch({ type: "REMOVE_EVIDENCE_AGAINST", payload: i })}
            ageMode={state.ageMode}
            originalThought={state.originalThought}
          />
        );
      case 5:
        return (
          <VerdictReveal
            evidenceFor={state.evidenceFor}
            evidenceAgainst={state.evidenceAgainst}
            originalThought={state.originalThought}
            ageMode={state.ageMode}
          />
        );
      case 6:
        return (
          <ReframeStation
            originalThought={state.originalThought}
            reframedThought={state.reframedThought}
            onChange={(v) => dispatch({ type: "SET_REFRAMED_THOUGHT", payload: v })}
            ageMode={state.ageMode}
            selectedDistortions={state.selectedDistortions}
          />
        );
      case 7:
        return (
          <BeliefSlider
            value={state.finalBelief}
            onChange={(v) => dispatch({ type: "SET_FINAL_BELIEF", payload: v })}
            ageMode={state.ageMode}
            isRerate
            originalBelief={state.initialBelief}
          />
        );
      case 8:
        return (
          <CaseFileSummary
            state={state}
            onNewTrial={() => dispatch({ type: "RESET_TRIAL" })}
          />
        );
      default:
        return null;
    }
  };

  // Welcome screen
  if (state.currentStep === -1) {
    return (
      <div
        data-testid="tool-cbt-thought-court"
        style={{ width: "100%", height: "100%", position: "relative" }}
      >
        <WelcomeScreen
          onStart={() => dispatch({ type: "START_TRIAL" })}
          ageMode={state.ageMode}
          onSetAgeMode={(mode) => dispatch({ type: "SET_AGE_MODE", payload: mode })}
          onOpenGuide={() => dispatch({ type: "TOGGLE_GUIDE" })}
        />
        <DistortionsGuide
          isOpen={state.isDistortionsGuideOpen}
          onClose={() => dispatch({ type: "TOGGLE_GUIDE" })}
          ageMode={state.ageMode}
        />
      </div>
    );
  }

  // Case file summary — rendered without StepWrapper (has its own layout + buttons)
  if (state.currentStep === 8) {
    return (
      <div
        data-testid="tool-cbt-thought-court"
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(170deg, #faf8fc 0%, #f0e8f6 30%, #e8e0f0 60%, #e2dae8 100%)",
          fontFamily: "Inter, sans-serif",
          overflow: "hidden",
          position: "relative",
          borderRadius: 12,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 16px",
            background: "rgba(255, 252, 254, 0.92)",
            borderBottom: "1px solid rgba(120, 100, 180, 0.18)",
            zIndex: 10,
            flexShrink: 0,
            backdropFilter: "blur(10px)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>{"\u2696\uFE0F"}</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#3a3228", lineHeight: 1.2 }}>
                The Thought Court
              </div>
              <div style={{ fontSize: 10, color: "rgba(58, 48, 38, 0.55)" }}>
                Case File Complete
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <FurtherReading
              references={CBT_REFERENCES}
              accentColor="rgba(120,100,180,0.6)"
              textColor="#3a3228"
              bgColor="rgba(255,252,254,0.98)"
            />
            <button
              onClick={toggleMute}
              data-testid="button-cbt-mute"
              type="button"
              style={{
                background: "rgba(58, 48, 38, 0.06)",
                border: "1px solid rgba(120, 100, 180, 0.22)",
                borderRadius: 8,
                padding: "8px 12px",
                minWidth: 44,
                minHeight: 44,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#3a3228",
                fontSize: 16,
                cursor: "pointer",
                boxSizing: "border-box",
              }}
            >
              {isMuted ? "\uD83D\uDD07" : "\uD83D\uDD0A"}
            </button>
          </div>
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: "16px clamp(12px, 3vw, 24px)" }}>
          <CaseFileSummary state={state} onNewTrial={() => dispatch({ type: "RESET_TRIAL" })} />
        </div>
      </div>
    );
  }

  // Trial steps 0-7
  return (
    <div
      data-testid="tool-cbt-thought-court"
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(170deg, #faf8fc 0%, #f0e8f6 30%, #e8e0f0 60%, #e2dae8 100%)",
        fontFamily: "Inter, sans-serif",
        overflow: "hidden",
        position: "relative",
        borderRadius: 12,
      }}
    >
      {/* Header bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          background: "rgba(255, 252, 254, 0.92)",
          borderBottom: "1px solid rgba(120, 100, 180, 0.18)",
          zIndex: 10,
          flexShrink: 0,
          backdropFilter: "blur(10px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>{"\u2696\uFE0F"}</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#3a3228", lineHeight: 1.2 }}>
              The Thought Court
            </div>
            <div style={{ fontSize: 10, color: "rgba(58, 48, 38, 0.55)" }}>
              Step {state.currentStep + 1} of {STEP_CONFIG.length} &mdash; {stepConfig.label}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button
            type="button"
            onClick={() => dispatch({ type: "TOGGLE_GUIDE" })}
            data-testid="button-distortions-guide"
            style={{
              background: "linear-gradient(135deg, #6b3fa0, #4a2d7a)",
              color: "#faf8fc",
              border: "1px solid rgba(160, 130, 220, 0.4)",
              borderRadius: 8,
              padding: "5px 10px",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ fontSize: 14 }}>{"\uD83D\uDCD6"}</span>
            <span className="distortions-label" style={{ display: "inline" }}>Guide</span>
          </button>
          <FurtherReading
            references={CBT_REFERENCES}
            accentColor="rgba(120,100,180,0.6)"
            textColor="#3a3228"
            bgColor="rgba(255,252,254,0.98)"
          />
          <button
            type="button"
            onClick={toggleMute}
            data-testid="button-cbt-mute"
            style={{
              background: "rgba(58, 48, 38, 0.06)",
              border: "1px solid rgba(120, 100, 180, 0.22)",
              borderRadius: 8,
              padding: "8px 12px",
              minWidth: 44,
              minHeight: 44,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#3a3228",
              fontSize: 16,
              cursor: "pointer",
              boxSizing: "border-box",
            }}
          >
            {isMuted ? "\uD83D\uDD07" : "\uD83D\uDD0A"}
          </button>
        </div>
      </div>

      {/* Step content area */}
      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={state.currentStep}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            style={{ width: "100%", height: "100%" }}
          >
            <StepWrapper
              stepNumber={state.currentStep}
              totalSteps={STEP_CONFIG.length}
              title={stepConfig.title}
              subtitle={stepConfig.subtitle}
              icon={stepConfig.icon}
              ageMode={state.ageMode}
              canProceed={canProceed}
              onNext={handleNext}
              onBack={handleBack}
            >
              {renderStepContent()}
            </StepWrapper>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Distortions Guide modal */}
      <DistortionsGuide
        isOpen={state.isDistortionsGuideOpen}
        onClose={() => dispatch({ type: "TOGGLE_GUIDE" })}
        ageMode={state.ageMode}
      />
    </div>
  );
}
