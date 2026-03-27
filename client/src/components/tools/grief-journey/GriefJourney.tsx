import { useReducer } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAudio } from "../../../lib/stores/useAudio";
import type {
  AgeMode,
  GriefEmotion,
  LossType,
  LetterRecipient,
  Memory,
} from "./grief-data";
import { STEP_CONFIGS, GRIEF_REFERENCES } from "./grief-data";
import { WelcomeScreen } from "./WelcomeScreen";
import { StepWrapper } from "./StepWrapper";
import { GriefGuide } from "./GriefGuide";
import { LossStep } from "./LossStep";
import { FeelingsLanterns } from "./FeelingsLanterns";
import { MemoryGarden } from "./MemoryGarden";
import { LetterStep } from "./LetterStep";
import { MeaningMaking } from "./MeaningMaking";
import { ContinuingBonds } from "./ContinuingBonds";
import { JourneySummary } from "./JourneySummary";
import { FurtherReading } from "../shared/FurtherReading";

// ── State & Actions ────────────────────────────────────────────────────────

interface GriefState {
  ageMode: AgeMode;
  currentStep: number;
  isGuideOpen: boolean;
  lossTopic: string;
  lossType: LossType | null;
  selectedEmotions: GriefEmotion[];
  customEmotion: string;
  memories: Memory[];
  recipient: LetterRecipient | null;
  letterBody: string;
  whatTaught: string;
  howChanged: string;
  whatTheyWant: string;
  bondStatement: string;
  honorCards: [string, string, string];
}

type GriefAction =
  | { type: "SET_AGE_MODE"; payload: AgeMode }
  | { type: "START" }
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "TOGGLE_GUIDE" }
  | { type: "RESET" }
  | { type: "SET_LOSS_TOPIC"; payload: string }
  | { type: "SET_LOSS_TYPE"; payload: LossType }
  | { type: "TOGGLE_EMOTION"; payload: GriefEmotion }
  | { type: "SET_CUSTOM_EMOTION"; payload: string }
  | { type: "ADD_MEMORY"; payload: string }
  | { type: "REMOVE_MEMORY"; payload: string }
  | { type: "SET_RECIPIENT"; payload: LetterRecipient }
  | { type: "SET_LETTER_BODY"; payload: string }
  | { type: "SET_WHAT_TAUGHT"; payload: string }
  | { type: "SET_HOW_CHANGED"; payload: string }
  | { type: "SET_WHAT_THEY_WANT"; payload: string }
  | { type: "SET_BOND_STATEMENT"; payload: string }
  | { type: "SET_HONOR_CARD"; index: number; payload: string };

// ── Reducer ────────────────────────────────────────────────────────────────

const createInitialState = (): GriefState => ({
  ageMode: "adult",
  currentStep: -1,
  isGuideOpen: false,
  lossTopic: "",
  lossType: null,
  selectedEmotions: [],
  customEmotion: "",
  memories: [],
  recipient: null,
  letterBody: "",
  whatTaught: "",
  howChanged: "",
  whatTheyWant: "",
  bondStatement: "",
  honorCards: ["", "", ""],
});

function griefReducer(state: GriefState, action: GriefAction): GriefState {
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

    case "SET_LOSS_TOPIC":
      return { ...state, lossTopic: action.payload };

    case "SET_LOSS_TYPE":
      return { ...state, lossType: action.payload };

    case "TOGGLE_EMOTION": {
      const has = state.selectedEmotions.includes(action.payload);
      return {
        ...state,
        selectedEmotions: has
          ? state.selectedEmotions.filter((e) => e !== action.payload)
          : [...state.selectedEmotions, action.payload],
      };
    }

    case "SET_CUSTOM_EMOTION":
      return { ...state, customEmotion: action.payload };

    case "ADD_MEMORY": {
      const newMemory: Memory = {
        id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        text: action.payload,
      };
      return { ...state, memories: [...state.memories, newMemory] };
    }

    case "REMOVE_MEMORY":
      return { ...state, memories: state.memories.filter((m) => m.id !== action.payload) };

    case "SET_RECIPIENT":
      return { ...state, recipient: action.payload };

    case "SET_LETTER_BODY":
      return { ...state, letterBody: action.payload };

    case "SET_WHAT_TAUGHT":
      return { ...state, whatTaught: action.payload };

    case "SET_HOW_CHANGED":
      return { ...state, howChanged: action.payload };

    case "SET_WHAT_THEY_WANT":
      return { ...state, whatTheyWant: action.payload };

    case "SET_BOND_STATEMENT":
      return { ...state, bondStatement: action.payload };

    case "SET_HONOR_CARD": {
      const updated: [string, string, string] = [...state.honorCards] as [string, string, string];
      updated[action.index] = action.payload;
      return { ...state, honorCards: updated };
    }

    default:
      return state;
  }
}

// ── Component ──────────────────────────────────────────────────────────────

export function GriefJourney() {
  const [state, dispatch] = useReducer(griefReducer, undefined, createInitialState);
  const { isMuted, toggleMute } = useAudio();

  const stepConfig = STEP_CONFIGS[state.currentStep] ?? STEP_CONFIGS[0];

  const canProceed = (() => {
    switch (state.currentStep) {
      case 0:
        return state.lossTopic.trim().length > 0;
      case 1:
        return state.selectedEmotions.length >= 2 || state.customEmotion.trim().length > 0;
      case 2:
        return state.memories.length >= 1;
      case 3:
        return state.recipient !== null && state.letterBody.trim().length >= 50;
      case 4:
        return [state.whatTaught, state.howChanged, state.whatTheyWant].some(
          (t) => t.trim().length >= 20,
        );
      case 5:
        return (
          state.bondStatement.trim().length > 0 ||
          state.honorCards.some((c) => c.trim().length > 0)
        );
      default:
        return false;
    }
  })();

  const handleNext = () => dispatch({ type: "NEXT_STEP" });
  const handleBack = () => dispatch({ type: "PREV_STEP" });

  const renderStepContent = () => {
    switch (state.currentStep) {
      case 0:
        return (
          <LossStep
            lossTopic={state.lossTopic}
            lossType={state.lossType}
            onSetTopic={(t) => dispatch({ type: "SET_LOSS_TOPIC", payload: t })}
            onSetLossType={(t) => dispatch({ type: "SET_LOSS_TYPE", payload: t })}
            ageMode={state.ageMode}
          />
        );
      case 1:
        return (
          <FeelingsLanterns
            selectedEmotions={state.selectedEmotions}
            customEmotion={state.customEmotion}
            onToggleEmotion={(e) => dispatch({ type: "TOGGLE_EMOTION", payload: e })}
            onSetCustomEmotion={(t) => dispatch({ type: "SET_CUSTOM_EMOTION", payload: t })}
            ageMode={state.ageMode}
          />
        );
      case 2:
        return (
          <MemoryGarden
            memories={state.memories}
            onAddMemory={(text) => dispatch({ type: "ADD_MEMORY", payload: text })}
            onRemoveMemory={(id) => dispatch({ type: "REMOVE_MEMORY", payload: id })}
            ageMode={state.ageMode}
          />
        );
      case 3:
        return (
          <LetterStep
            recipient={state.recipient}
            letterBody={state.letterBody}
            onSetRecipient={(r) => dispatch({ type: "SET_RECIPIENT", payload: r })}
            onSetLetter={(t) => dispatch({ type: "SET_LETTER_BODY", payload: t })}
            ageMode={state.ageMode}
          />
        );
      case 4:
        return (
          <MeaningMaking
            whatTaught={state.whatTaught}
            howChanged={state.howChanged}
            whatTheyWant={state.whatTheyWant}
            onSetWhatTaught={(t) => dispatch({ type: "SET_WHAT_TAUGHT", payload: t })}
            onSetHowChanged={(t) => dispatch({ type: "SET_HOW_CHANGED", payload: t })}
            onSetWhatTheyWant={(t) => dispatch({ type: "SET_WHAT_THEY_WANT", payload: t })}
            ageMode={state.ageMode}
          />
        );
      case 5:
        return (
          <ContinuingBonds
            bondStatement={state.bondStatement}
            honorCards={state.honorCards}
            onSetBondStatement={(t) => dispatch({ type: "SET_BOND_STATEMENT", payload: t })}
            onSetHonorCard={(i, t) => dispatch({ type: "SET_HONOR_CARD", index: i, payload: t })}
            ageMode={state.ageMode}
          />
        );
      default:
        return null;
    }
  };

  const headerBarStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 14px",
    borderBottom: "1px solid rgba(196,154,108,0.15)",
    zIndex: 10,
    flexShrink: 0,
  };

  const muteButtonStyle: React.CSSProperties = {
    background: "transparent",
    border: "none",
    borderRadius: 6,
    padding: "4px 8px",
    color: "rgba(232, 220, 200, 0.5)",
    fontSize: 14,
    cursor: "pointer",
  };

  // Welcome screen
  if (state.currentStep === -1) {
    return (
      <div
        data-testid="tool-grief-journey"
        style={{ width: "100%", height: "100%", minHeight: 0, minWidth: 0, position: "relative" }}
      >
        <WelcomeScreen
          onStart={() => dispatch({ type: "START" })}
          ageMode={state.ageMode}
          onSetAgeMode={(mode) => dispatch({ type: "SET_AGE_MODE", payload: mode })}
          onOpenGuide={() => dispatch({ type: "TOGGLE_GUIDE" })}
        />
        <GriefGuide
          isOpen={state.isGuideOpen}
          onClose={() => dispatch({ type: "TOGGLE_GUIDE" })}
        />
      </div>
    );
  }

  // Full-page summary (step 6)
  if (state.currentStep === 6) {
    return (
      <div
        data-testid="tool-grief-journey"
        style={{
          width: "100%",
          height: "100%",
          minHeight: 0,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(170deg, #0d0820 0%, #130d2a 30%, #160f2c 60%, #0a0618 100%)",
          fontFamily: "Inter, sans-serif",
          overflow: "hidden",
          position: "relative",
          borderRadius: 12,
        }}
      >
        <div style={headerBarStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 16 }}>{"\uD83C\uDFEE"}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#e8dcc8" }}>
              The Grief Journey
            </span>
            <span style={{ fontSize: 10, color: "rgba(232, 220, 200, 0.35)" }}>
              {"\u2014"} Complete
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <FurtherReading
              references={GRIEF_REFERENCES}
              accentColor="rgba(196,154,108,0.6)"
              textColor="#e8dcc8"
              bgColor="rgba(13,8,32,0.97)"
            />
            <button
              onClick={toggleMute}
              data-testid="button-grief-mute"
              style={muteButtonStyle}
            >
              {isMuted ? "\uD83D\uDD07" : "\uD83D\uDD0A"}
            </button>
          </div>
        </div>
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflow: "auto",
            padding: "16px clamp(12px, 3vw, 24px)",
          }}
        >
          <JourneySummary
            lossTopic={state.lossTopic}
            lossType={state.lossType}
            selectedEmotions={state.selectedEmotions}
            customEmotion={state.customEmotion}
            memories={state.memories}
            recipient={state.recipient}
            letterBody={state.letterBody}
            whatTaught={state.whatTaught}
            howChanged={state.howChanged}
            whatTheyWant={state.whatTheyWant}
            bondStatement={state.bondStatement}
            honorCards={state.honorCards}
            ageMode={state.ageMode}
            onReset={() => dispatch({ type: "RESET" })}
          />
        </div>
      </div>
    );
  }

  // Steps 0-5
  return (
    <div
      data-testid="tool-grief-journey"
      style={{
        width: "100%",
        height: "100%",
        minHeight: 0,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(170deg, #0d0820 0%, #130d2a 30%, #160f2c 60%, #0a0618 100%)",
        fontFamily: "Inter, sans-serif",
        overflow: "hidden",
        position: "relative",
        borderRadius: 12,
      }}
    >
      <div style={headerBarStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 16 }}>{"\uD83C\uDFEE"}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#e8dcc8" }}>
            The Grief Journey
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <FurtherReading
            references={GRIEF_REFERENCES}
            accentColor="rgba(196,154,108,0.6)"
            textColor="#e8dcc8"
            bgColor="rgba(13,8,32,0.97)"
          />
          <button
            onClick={toggleMute}
            data-testid="button-grief-mute"
            style={muteButtonStyle}
          >
            {isMuted ? "\uD83D\uDD07" : "\uD83D\uDD0A"}
          </button>
        </div>
      </div>

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
