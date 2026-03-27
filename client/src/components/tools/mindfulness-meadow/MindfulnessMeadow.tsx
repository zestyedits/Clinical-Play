import { useReducer } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAudio } from "../../../lib/stores/useAudio";
import type { AgeMode, BodyRegion, LKRecipient } from "./meadow-data";
import { STEP_CONFIGS, LK_PHRASES } from "./meadow-data";
import { WelcomeScreen } from "./WelcomeScreen";
import { StepWrapper } from "./StepWrapper";
import { MindfulnessGuide } from "./MindfulnessGuide";
import { ArrivalStep } from "./ArrivalStep";
import { BodyScanStep } from "./BodyScanStep";
import { ThoughtCloudsStep } from "./ThoughtCloudsStep";
import { SensesStep } from "./SensesStep";
import { LovingKindnessStep } from "./LovingKindnessStep";
import { MeadowSummary } from "./MeadowSummary";
import { FurtherReading } from "../shared/FurtherReading";
import type { Reference } from "../shared/FurtherReading";

// ── References ──────────────────────────────────────────────────────────────

const MBSR_REFERENCES: Reference[] = [
  {
    title: "Full Catastrophe Living",
    author: "Kabat-Zinn, J.",
    year: 1990,
    description:
      "The foundational text on MBSR — paying attention on purpose, in the present moment, non-judgmentally.",
    url: "",
  },
  {
    title: "Mindfulness-Based Cognitive Therapy for Depression",
    author: "Segal, Z. V., Williams, J. M. G., & Teasdale, J. D.",
    year: 2002,
    description:
      "The definitive guide to MBCT, which combines mindfulness meditation with cognitive therapy to prevent depressive relapse.",
    url: "",
  },
  {
    title: "The Mindful Path Through Anxiety",
    author: "Orsillo, S. M., & Roemer, L.",
    year: 2011,
    description:
      "An acceptance-based behavioral approach integrating mindfulness practices to reduce anxiety and increase quality of life.",
    url: "",
  },
];

// ── State ───────────────────────────────────────────────────────────────────

export interface MeadowState {
  ageMode: AgeMode;
  currentStep: number;
  isGuideOpen: boolean;
  arrivalNote: string;
  selectedRegions: BodyRegion[];
  thoughts: string[];
  senses: Record<string, string>;
  recipient: LKRecipient | null;
  phrases: string[];
  finalReflection: string;
}

export type MeadowAction =
  | { type: "SET_AGE_MODE"; payload: AgeMode }
  | { type: "START" }
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "TOGGLE_GUIDE" }
  | { type: "RESET" }
  | { type: "SET_ARRIVAL_NOTE"; payload: string }
  | { type: "TOGGLE_REGION"; payload: BodyRegion }
  | { type: "ADD_THOUGHT"; payload: string }
  | { type: "REMOVE_THOUGHT"; payload: string }
  | { type: "SET_SENSE"; key: string; value: string }
  | { type: "SET_RECIPIENT"; payload: LKRecipient }
  | { type: "SET_PHRASE"; index: number; text: string }
  | { type: "SET_REFLECTION"; payload: string };

// ── Initial state ────────────────────────────────────────────────────────────

const createInitialState = (): MeadowState => ({
  ageMode: "adult",
  currentStep: -1,
  isGuideOpen: false,
  arrivalNote: "",
  selectedRegions: [],
  thoughts: [],
  senses: { see: "", touch: "", hear: "", smell: "", taste: "" },
  recipient: null,
  phrases: [],
  finalReflection: "",
});

// ── Reducer ──────────────────────────────────────────────────────────────────

function meadowReducer(state: MeadowState, action: MeadowAction): MeadowState {
  switch (action.type) {
    case "SET_AGE_MODE":
      return { ...state, ageMode: action.payload };

    case "START":
      return { ...state, currentStep: 0 };

    case "NEXT_STEP":
      return { ...state, currentStep: Math.min(state.currentStep + 1, STEP_CONFIGS.length - 1) };

    case "PREV_STEP":
      return { ...state, currentStep: Math.max(state.currentStep - 1, 0) };

    case "TOGGLE_GUIDE":
      return { ...state, isGuideOpen: !state.isGuideOpen };

    case "RESET":
      return { ...createInitialState(), ageMode: state.ageMode };

    case "SET_ARRIVAL_NOTE":
      return { ...state, arrivalNote: action.payload };

    case "TOGGLE_REGION": {
      const exists = state.selectedRegions.includes(action.payload);
      return {
        ...state,
        selectedRegions: exists
          ? state.selectedRegions.filter((r) => r !== action.payload)
          : [...state.selectedRegions, action.payload],
      };
    }

    case "ADD_THOUGHT":
      return { ...state, thoughts: [...state.thoughts, action.payload] };

    case "REMOVE_THOUGHT":
      return { ...state, thoughts: state.thoughts.filter((t) => t !== action.payload) };

    case "SET_SENSE":
      return { ...state, senses: { ...state.senses, [action.key]: action.value } };

    case "SET_RECIPIENT":
      return {
        ...state,
        recipient: action.payload,
        phrases: [...LK_PHRASES[action.payload]],
      };

    case "SET_PHRASE": {
      const next = [...state.phrases];
      next[action.index] = action.text;
      return { ...state, phrases: next };
    }

    case "SET_REFLECTION":
      return { ...state, finalReflection: action.payload };

    default:
      return state;
  }
}

// ── Component ────────────────────────────────────────────────────────────────

export function MindfulnessMeadow() {
  const [state, dispatch] = useReducer(meadowReducer, undefined, createInitialState);
  const { isMuted, toggleMute } = useAudio();

  const stepConfig = STEP_CONFIGS[state.currentStep] ?? STEP_CONFIGS[0];

  const handleNext = () => {
    if (state.currentStep === STEP_CONFIGS.length - 1) {
      dispatch({ type: "RESET" });
      return;
    }
    dispatch({ type: "NEXT_STEP" });
  };

  const handleBack = () => dispatch({ type: "PREV_STEP" });

  const canProceed = (() => {
    switch (state.currentStep) {
      case 0:
        return state.arrivalNote.trim().length > 0;
      case 1:
        return state.selectedRegions.length >= 1;
      case 2:
        return state.thoughts.length >= 1;
      case 3:
        return (
          Object.values(state.senses).filter((v) => v.trim().length > 0).length >= 3
        );
      case 4:
        return state.recipient !== null;
      case 5:
        return true;
      default:
        return false;
    }
  })();

  const renderStepContent = () => {
    switch (state.currentStep) {
      case 0:
        return (
          <ArrivalStep
            arrivalNote={state.arrivalNote}
            onSetNote={(t) => dispatch({ type: "SET_ARRIVAL_NOTE", payload: t })}
            ageMode={state.ageMode}
          />
        );
      case 1:
        return (
          <BodyScanStep
            selectedRegions={state.selectedRegions}
            onToggleRegion={(r) => dispatch({ type: "TOGGLE_REGION", payload: r })}
            ageMode={state.ageMode}
          />
        );
      case 2:
        return (
          <ThoughtCloudsStep
            thoughts={state.thoughts}
            onAddThought={(t) => dispatch({ type: "ADD_THOUGHT", payload: t })}
            onRemoveThought={(t) => dispatch({ type: "REMOVE_THOUGHT", payload: t })}
            ageMode={state.ageMode}
          />
        );
      case 3:
        return (
          <SensesStep
            senses={state.senses}
            onSetSense={(key, value) => dispatch({ type: "SET_SENSE", key, value })}
            ageMode={state.ageMode}
          />
        );
      case 4:
        return (
          <LovingKindnessStep
            recipient={state.recipient}
            phrases={state.phrases}
            onSetRecipient={(r) => dispatch({ type: "SET_RECIPIENT", payload: r })}
            onSetPhrase={(i, text) => dispatch({ type: "SET_PHRASE", index: i, text })}
            ageMode={state.ageMode}
          />
        );
      case 5:
        return (
          <MeadowSummary
            arrivalNote={state.arrivalNote}
            selectedRegions={state.selectedRegions}
            thoughts={state.thoughts}
            senses={state.senses}
            recipient={state.recipient}
            phrases={state.phrases}
            finalReflection={state.finalReflection}
            onSetReflection={(t) => dispatch({ type: "SET_REFLECTION", payload: t })}
            onReset={() => dispatch({ type: "RESET" })}
            ageMode={state.ageMode}
          />
        );
      default:
        return null;
    }
  };

  // ── Welcome screen ───────────────────────────────────────────────────────

  if (state.currentStep === -1) {
    return (
      <div
        data-testid="tool-mindfulness-meadow"
        style={{ width: "100%", height: "100%", minHeight: 0, minWidth: 0, position: "relative" }}
      >
        <WelcomeScreen
          onStart={() => dispatch({ type: "START" })}
          ageMode={state.ageMode}
          onSetAgeMode={(mode) => dispatch({ type: "SET_AGE_MODE", payload: mode })}
          onOpenGuide={() => dispatch({ type: "TOGGLE_GUIDE" })}
        />
        <MindfulnessGuide
          isOpen={state.isGuideOpen}
          onClose={() => dispatch({ type: "TOGGLE_GUIDE" })}
        />
      </div>
    );
  }

  // ── Steps 0-5 ────────────────────────────────────────────────────────────

  return (
    <div
      data-testid="tool-mindfulness-meadow"
      style={{
        width: "100%",
        height: "100%",
        minHeight: 0,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        background:
          "linear-gradient(170deg, #070d1a 0%, #0e1a2a 30%, #121e2c 60%, #080d18 100%)",
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
          padding: "8px 14px",
          borderBottom: "1px solid rgba(91, 168, 196, 0.15)",
          zIndex: 10,
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 16 }}>🌿</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#e8dcc8" }}>
            Mindfulness Meadow
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <FurtherReading
            references={MBSR_REFERENCES}
            accentColor="rgba(91,168,196,0.6)"
            textColor="#e8dcc8"
            bgColor="rgba(7,13,26,0.97)"
          />
          <button
            onClick={toggleMute}
            data-testid="button-meadow-mute"
            style={{
              background: "transparent",
              border: "none",
              borderRadius: 6,
              padding: "4px 8px",
              color: "rgba(232, 220, 200, 0.5)",
              fontSize: 14,
              cursor: "pointer",
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
              totalSteps={STEP_CONFIGS.length}
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

      <MindfulnessGuide
        isOpen={state.isGuideOpen}
        onClose={() => dispatch({ type: "TOGGLE_GUIDE" })}
      />
    </div>
  );
}
