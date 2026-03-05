import { useReducer } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAudio } from "../../../lib/stores/useAudio";

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

const STEP_LABELS = [
  "Enter Thought",
  "Situation",
  "Identify Distortions",
  "Rate Belief",
  "Evidence For",
  "Evidence Against",
  "Verdict",
  "Reframe",
  "Re-rate Belief",
];

// ── Component ──────────────────────────────────────────────────────────────

export function CBTThoughtCourt() {
  const [state, dispatch] = useReducer(trialReducer, initialState);
  const { isMuted, toggleMute } = useAudio();

  // Welcome screen
  if (state.currentStep === -1) {
    return (
      <div
        data-testid="tool-cbt-thought-court"
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(170deg, #1a1520 0%, #2a2035 30%, #1e1a2e 60%, #15112a 100%)",
          fontFamily: "Inter, sans-serif",
          borderRadius: 12,
          position: "relative",
        }}
      >
        <div>Welcome Screen</div>
      </div>
    );
  }

  // Trial steps
  return (
    <div
      data-testid="tool-cbt-thought-court"
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background:
          "linear-gradient(170deg, #1a1520 0%, #2a2035 30%, #1e1a2e 60%, #15112a 100%)",
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
          background: "rgba(15, 10, 25, 0.92)",
          borderBottom: "1px solid rgba(120, 100, 180, 0.3)",
          zIndex: 10,
          flexShrink: 0,
          backdropFilter: "blur(10px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>{"\u2696\uFE0F"}</span>
          <div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#e8e0f0",
                lineHeight: 1.2,
              }}
            >
              The Thought Court
            </div>
            <div
              style={{
                fontSize: 10,
                color: "rgba(232, 224, 240, 0.5)",
              }}
            >
              Step {state.currentStep + 1} of {STEP_LABELS.length} &mdash;{" "}
              {STEP_LABELS[state.currentStep]}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              fontSize: 11,
              color: "rgba(232, 224, 240, 0.5)",
            }}
          >
            Step {state.currentStep + 1} of {STEP_LABELS.length}
          </div>
          <button
            onClick={toggleMute}
            data-testid="button-cbt-mute"
            style={{
              background: "rgba(232, 224, 240, 0.1)",
              border: "1px solid rgba(120, 100, 180, 0.3)",
              borderRadius: 8,
              padding: "5px 10px",
              color: "#e8e0f0",
              fontSize: 16,
              cursor: "pointer",
            }}
          >
            {isMuted ? "\uD83D\uDD07" : "\uD83D\uDD0A"}
          </button>
        </div>
      </div>

      {/* Step content area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          position: "relative",
          padding: 16,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={state.currentStep}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#e8e0f0",
            }}
          >
            <div>Step {state.currentStep + 1} Placeholder</div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Floating Distortions Guide button */}
      <button
        onClick={() => dispatch({ type: "TOGGLE_GUIDE" })}
        data-testid="button-distortions-guide"
        style={{
          position: "absolute",
          bottom: 20,
          right: 20,
          background: "linear-gradient(135deg, #6b3fa0, #4a2d7a)",
          color: "#e8e0f0",
          border: "1px solid rgba(160, 130, 220, 0.4)",
          borderRadius: 14,
          padding: "10px 16px",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          boxShadow:
            "0 4px 20px rgba(80, 50, 140, 0.4), 0 0 0 1px rgba(255,255,255,0.05) inset",
          zIndex: 20,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <span style={{ fontSize: 15 }}>{"\uD83D\uDCD6"}</span>
        Distortions Guide
      </button>
    </div>
  );
}
