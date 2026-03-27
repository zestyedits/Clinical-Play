import { useReducer } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAudio } from "../../../lib/stores/useAudio";
import type { AgeMode, AttachmentStyle, AnchorItem, ScenarioAnswer } from "./constellation-data";
import { STEP_CONFIGS } from "./constellation-data";
import { WelcomeScreen } from "./WelcomeScreen";
import { StepWrapper } from "./StepWrapper";
import { AttachmentGuide } from "./AttachmentGuide";
import { EarlyBondsStep } from "./EarlyBondsStep";
import { AttachmentStyleStep } from "./AttachmentStyleStep";
import { RelationshipPatternsStep } from "./RelationshipPatternsStep";
import { SecureBaseStep } from "./SecureBaseStep";
import { ConstellationMapStep } from "./ConstellationMapStep";
import { GrowingSecurityStep } from "./GrowingSecurityStep";
import { ConstellationSummary } from "./ConstellationSummary";
import { FurtherReading } from "../shared/FurtherReading";

// ── References ─────────────────────────────────────────────────────────────

const ATTACHMENT_REFERENCES = [
  {
    title: "Attachment and Loss, Vol. 1: Attachment",
    author: "Bowlby, J.",
    year: 1969,
    description: "The foundational text establishing attachment theory and the biological basis of the attachment behavioral system.",
    url: "https://www.amazon.com/Attachment-Loss-Vol-1/dp/0465005438",
  },
  {
    title: "Patterns of Attachment",
    author: "Ainsworth, M. D. S. et al.",
    year: 1978,
    description: "Classic study introducing the Strange Situation procedure and describing the secure, anxious, and avoidant attachment patterns.",
    url: "https://www.amazon.com/Patterns-Attachment-Psychological-Study-Strange/dp/0898599016",
  },
  {
    title: "Cross-Cultural Studies of Attachment Organization",
    author: "Main, M.",
    year: 1990,
    description: "Introduction of the disorganized attachment classification and the concept of earned secure attachment via the Adult Attachment Interview.",
    url: "https://pubmed.ncbi.nlm.nih.gov/2116125/",
  },
];

// ── Types ──────────────────────────────────────────────────────────────────

export interface ConstellationState {
  ageMode: AgeMode;
  currentStep: number;
  isGuideOpen: boolean;
  caregivers: string;
  upsetResponse: string;
  homeAtmosphere: string;
  selectedStyle: AttachmentStyle | null;
  answers: ScenarioAnswer[];
  anchors: AnchorItem[];
  constellationReflection: string;
  patternToChange: string;
  practiceToTry: string;
}

export type ConstellationAction =
  | { type: "SET_AGE_MODE"; payload: AgeMode }
  | { type: "START" }
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "TOGGLE_GUIDE" }
  | { type: "RESET" }
  | { type: "SET_CAREGIVERS"; payload: string }
  | { type: "SET_UPSET_RESPONSE"; payload: string }
  | { type: "SET_HOME_ATMOSPHERE"; payload: string }
  | { type: "SET_STYLE"; payload: AttachmentStyle }
  | { type: "SET_ANSWER"; scenarioId: string; answerIndex: number }
  | { type: "ADD_ANCHOR"; text: string; category: "people" | "places" | "practices" }
  | { type: "REMOVE_ANCHOR"; id: string }
  | { type: "SET_CONSTELLATION_REFLECTION"; payload: string }
  | { type: "SET_PATTERN_TO_CHANGE"; payload: string }
  | { type: "SET_PRACTICE_TO_TRY"; payload: string };

// ── Reducer ────────────────────────────────────────────────────────────────

const createInitialState = (): ConstellationState => ({
  ageMode: "adult",
  currentStep: -1,
  isGuideOpen: false,
  caregivers: "",
  upsetResponse: "",
  homeAtmosphere: "",
  selectedStyle: null,
  answers: [],
  anchors: [],
  constellationReflection: "",
  patternToChange: "",
  practiceToTry: "",
});

function constellationReducer(state: ConstellationState, action: ConstellationAction): ConstellationState {
  switch (action.type) {
    case "SET_AGE_MODE":
      return { ...state, ageMode: action.payload };

    case "START":
      return { ...state, currentStep: 0 };

    case "NEXT_STEP":
      return { ...state, currentStep: Math.min(state.currentStep + 1, 6) };

    case "PREV_STEP":
      return { ...state, currentStep: Math.max(state.currentStep - 1, 0) };

    case "TOGGLE_GUIDE":
      return { ...state, isGuideOpen: !state.isGuideOpen };

    case "RESET":
      return { ...createInitialState(), ageMode: state.ageMode };

    case "SET_CAREGIVERS":
      return { ...state, caregivers: action.payload };

    case "SET_UPSET_RESPONSE":
      return { ...state, upsetResponse: action.payload };

    case "SET_HOME_ATMOSPHERE":
      return { ...state, homeAtmosphere: action.payload };

    case "SET_STYLE":
      return { ...state, selectedStyle: action.payload };

    case "SET_ANSWER": {
      const existing = state.answers.find((a) => a.scenarioId === action.scenarioId);
      if (existing) {
        return {
          ...state,
          answers: state.answers.map((a) =>
            a.scenarioId === action.scenarioId ? { ...a, answerIndex: action.answerIndex } : a,
          ),
        };
      }
      return {
        ...state,
        answers: [...state.answers, { scenarioId: action.scenarioId, answerIndex: action.answerIndex }],
      };
    }

    case "ADD_ANCHOR": {
      const newAnchor: AnchorItem = {
        id: `a-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        text: action.text,
        category: action.category,
      };
      return { ...state, anchors: [...state.anchors, newAnchor] };
    }

    case "REMOVE_ANCHOR":
      return { ...state, anchors: state.anchors.filter((a) => a.id !== action.id) };

    case "SET_CONSTELLATION_REFLECTION":
      return { ...state, constellationReflection: action.payload };

    case "SET_PATTERN_TO_CHANGE":
      return { ...state, patternToChange: action.payload };

    case "SET_PRACTICE_TO_TRY":
      return { ...state, practiceToTry: action.payload };

    default:
      return state;
  }
}

// ── Component ──────────────────────────────────────────────────────────────

export function AttachmentConstellation() {
  const [state, dispatch] = useReducer(constellationReducer, undefined, createInitialState);
  const { isMuted, toggleMute } = useAudio();

  const stepConfig = STEP_CONFIGS[state.currentStep] || STEP_CONFIGS[0];
  const handleNext = () => dispatch({ type: "NEXT_STEP" });
  const handleBack = () => dispatch({ type: "PREV_STEP" });

  const canProceed = (() => {
    switch (state.currentStep) {
      case 0:
        return state.caregivers.trim().length > 0 && state.homeAtmosphere.trim().length > 0;
      case 1:
        return state.selectedStyle !== null;
      case 2:
        return state.answers.length === 4;
      case 3:
        return state.anchors.length >= 1;
      case 4:
        return state.constellationReflection.trim().length >= 20;
      case 5:
        return state.patternToChange.trim().length >= 20 && state.practiceToTry.trim().length >= 15;
      default:
        return false;
    }
  })();

  const renderStepContent = () => {
    switch (state.currentStep) {
      case 0:
        return (
          <EarlyBondsStep
            caregivers={state.caregivers}
            upsetResponse={state.upsetResponse}
            homeAtmosphere={state.homeAtmosphere}
            onSetCaregivers={(t) => dispatch({ type: "SET_CAREGIVERS", payload: t })}
            onSetUpsetResponse={(t) => dispatch({ type: "SET_UPSET_RESPONSE", payload: t })}
            onSetHomeAtmosphere={(t) => dispatch({ type: "SET_HOME_ATMOSPHERE", payload: t })}
            ageMode={state.ageMode}
          />
        );
      case 1:
        return (
          <AttachmentStyleStep
            selectedStyle={state.selectedStyle}
            onSelectStyle={(s) => dispatch({ type: "SET_STYLE", payload: s })}
            ageMode={state.ageMode}
          />
        );
      case 2:
        return (
          <RelationshipPatternsStep
            answers={state.answers}
            onSetAnswer={(scenarioId, answerIndex) => dispatch({ type: "SET_ANSWER", scenarioId, answerIndex })}
            ageMode={state.ageMode}
          />
        );
      case 3:
        return (
          <SecureBaseStep
            anchors={state.anchors}
            onAddAnchor={(text, category) => dispatch({ type: "ADD_ANCHOR", text, category })}
            onRemoveAnchor={(id) => dispatch({ type: "REMOVE_ANCHOR", id })}
            ageMode={state.ageMode}
          />
        );
      case 4:
        return (
          <ConstellationMapStep
            anchors={state.anchors}
            constellationReflection={state.constellationReflection}
            onSetReflection={(t) => dispatch({ type: "SET_CONSTELLATION_REFLECTION", payload: t })}
            ageMode={state.ageMode}
          />
        );
      case 5:
        return (
          <GrowingSecurityStep
            attachmentStyle={state.selectedStyle}
            patternToChange={state.patternToChange}
            practiceToTry={state.practiceToTry}
            onSetPatternToChange={(t) => dispatch({ type: "SET_PATTERN_TO_CHANGE", payload: t })}
            onSetPracticeToTry={(t) => dispatch({ type: "SET_PRACTICE_TO_TRY", payload: t })}
            ageMode={state.ageMode}
          />
        );
      default:
        return null;
    }
  };

  const headerBar = (label: string, isComplete = false) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 14px",
        borderBottom: "1px solid rgba(196, 168, 76, 0.15)",
        zIndex: 10,
        flexShrink: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 16 }}>✨</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#e8dcc8" }}>Attachment Constellation</span>
        {isComplete && (
          <span style={{ fontSize: 10, color: "rgba(232, 220, 200, 0.35)" }}>— Complete</span>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <FurtherReading
          references={ATTACHMENT_REFERENCES}
          accentColor="rgba(196,168,76,0.6)"
          textColor="#e8dcc8"
          bgColor="rgba(6,8,15,0.97)"
        />
        <button
          onClick={toggleMute}
          data-testid="button-ac-mute"
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
  );

  // Welcome screen
  if (state.currentStep === -1) {
    return (
      <div
        data-testid="tool-attachment-constellation"
        style={{ width: "100%", height: "100%", minHeight: 0, minWidth: 0, position: "relative" }}
      >
        <WelcomeScreen
          onStart={() => dispatch({ type: "START" })}
          ageMode={state.ageMode}
          onSetAgeMode={(mode) => dispatch({ type: "SET_AGE_MODE", payload: mode })}
          onOpenGuide={() => dispatch({ type: "TOGGLE_GUIDE" })}
        />
        <AttachmentGuide
          isOpen={state.isGuideOpen}
          onClose={() => dispatch({ type: "TOGGLE_GUIDE" })}
        />
      </div>
    );
  }

  // Full summary (step 6)
  if (state.currentStep === 6) {
    return (
      <div
        data-testid="tool-attachment-constellation"
        style={{
          width: "100%",
          height: "100%",
          minHeight: 0,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(170deg, #06080f 0%, #0a0d1a 30%, #0c1020 60%, #040610 100%)",
          fontFamily: "Inter, sans-serif",
          overflow: "hidden",
          position: "relative",
          borderRadius: 12,
        }}
      >
        {headerBar("Attachment Constellation", true)}
        <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
          <ConstellationSummary
            ageMode={state.ageMode}
            caregivers={state.caregivers}
            upsetResponse={state.upsetResponse}
            homeAtmosphere={state.homeAtmosphere}
            selectedStyle={state.selectedStyle}
            answers={state.answers}
            anchors={state.anchors}
            constellationReflection={state.constellationReflection}
            patternToChange={state.patternToChange}
            practiceToTry={state.practiceToTry}
            onReset={() => dispatch({ type: "RESET" })}
          />
        </div>
      </div>
    );
  }

  // Steps 0–5
  return (
    <div
      data-testid="tool-attachment-constellation"
      style={{
        width: "100%",
        height: "100%",
        minHeight: 0,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(170deg, #06080f 0%, #0a0d1a 30%, #0c1020 60%, #040610 100%)",
        fontFamily: "Inter, sans-serif",
        overflow: "hidden",
        position: "relative",
        borderRadius: 12,
      }}
    >
      {headerBar("Attachment Constellation")}

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
    </div>
  );
}