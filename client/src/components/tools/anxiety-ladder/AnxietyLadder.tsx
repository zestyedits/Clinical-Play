import { useReducer } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAudio } from "../../../lib/stores/useAudio";
import type {
  AgeMode,
  AnxietyCategory,
  ConfidenceLevel,
  LadderRung,
} from "./ladder-data";
import { STEP_CONFIGS } from "./ladder-data";
import { WelcomeScreen } from "./WelcomeScreen";
import { StepWrapper } from "./StepWrapper";
import { ExposureGuide } from "./ExposureGuide";
import { FearStep } from "./FearStep";
import { SUDSStep } from "./SUDSStep";
import { LadderBuilder } from "./LadderBuilder";
import { CopingKitStep } from "./CopingKitStep";
import { PracticePlanStep } from "./PracticePlanStep";
import { BraveCommitment } from "./BraveCommitment";
import { LadderSummary } from "./LadderSummary";
import { FurtherReading } from "../shared/FurtherReading";
import { EXPOSURE_REFERENCES } from "../shared/references-data";

// ── Types ──────────────────────────────────────────────────────────────────

export interface LadderState {
  ageMode: AgeMode;
  currentStep: number;
  isGuideOpen: boolean;
  fearTopic: string;
  anxietyCategory: AnxietyCategory | null;
  currentSUDS: number;
  bodyDescription: string;
  rungs: LadderRung[];
  selectedTools: string[];
  customTool: string;
  whenWhere: string;
  support: string;
  selfTalk: string;
  sudsGoal: number;
  commitmentText: string;
  selfCompassion: string;
  confidenceLevel: ConfidenceLevel | null;
}

export type LadderAction =
  | { type: "SET_AGE_MODE"; payload: AgeMode }
  | { type: "START" }
  | { type: "SET_FEAR_TOPIC"; payload: string }
  | { type: "SET_ANXIETY_CATEGORY"; payload: AnxietyCategory }
  | { type: "SET_CURRENT_SUDS"; payload: number }
  | { type: "SET_BODY_DESCRIPTION"; payload: string }
  | { type: "ADD_RUNG"; desc: string; suds: number }
  | { type: "REMOVE_RUNG"; id: string }
  | { type: "MOVE_RUNG"; id: string; dir: "up" | "down" }
  | { type: "TOGGLE_TOOL"; id: string }
  | { type: "SET_CUSTOM_TOOL"; payload: string }
  | { type: "SET_WHEN_WHERE"; payload: string }
  | { type: "SET_SUPPORT"; payload: string }
  | { type: "SET_SELF_TALK"; payload: string }
  | { type: "SET_SUDS_GOAL"; payload: number }
  | { type: "SET_COMMITMENT_TEXT"; payload: string }
  | { type: "SET_SELF_COMPASSION"; payload: string }
  | { type: "SET_CONFIDENCE_LEVEL"; payload: ConfidenceLevel }
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "TOGGLE_GUIDE" }
  | { type: "RESET" };

// ── Initial State ──────────────────────────────────────────────────────────

const DEFAULT_SELF_COMPASSION =
  "It takes courage to face what scares me. I am capable of more than I think.";

const createInitialState = (): LadderState => ({
  ageMode: "adult",
  currentStep: -1,
  isGuideOpen: false,
  fearTopic: "",
  anxietyCategory: null,
  currentSUDS: 50,
  bodyDescription: "",
  rungs: [],
  selectedTools: [],
  customTool: "",
  whenWhere: "",
  support: "",
  selfTalk: "",
  sudsGoal: 30,
  commitmentText: "",
  selfCompassion: DEFAULT_SELF_COMPASSION,
  confidenceLevel: null,
});

// ── Reducer ────────────────────────────────────────────────────────────────

function ladderReducer(state: LadderState, action: LadderAction): LadderState {
  switch (action.type) {
    case "SET_AGE_MODE":
      return { ...state, ageMode: action.payload };

    case "START":
      return { ...state, currentStep: 0 };

    case "SET_FEAR_TOPIC":
      return { ...state, fearTopic: action.payload };

    case "SET_ANXIETY_CATEGORY":
      return { ...state, anxietyCategory: action.payload };

    case "SET_CURRENT_SUDS":
      return { ...state, currentSUDS: action.payload };

    case "SET_BODY_DESCRIPTION":
      return { ...state, bodyDescription: action.payload };

    case "ADD_RUNG": {
      const newRung: LadderRung = {
        id: `r-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        description: action.desc,
        suds: action.suds,
      };
      const updatedRungs = [...state.rungs, newRung];
      const lowestSuds = Math.min(...updatedRungs.map((r) => r.suds));
      return {
        ...state,
        rungs: updatedRungs,
        sudsGoal: Math.max(0, lowestSuds - 20),
      };
    }

    case "REMOVE_RUNG":
      return { ...state, rungs: state.rungs.filter((r) => r.id !== action.id) };

    case "MOVE_RUNG": {
      const sorted = [...state.rungs].sort((a, b) => a.suds - b.suds);
      const idx = sorted.findIndex((r) => r.id === action.id);
      if (action.dir === "up" && idx < sorted.length - 1) {
        const thisRung = sorted[idx];
        const nextRung = sorted[idx + 1];
        const midSuds = Math.round((thisRung.suds + nextRung.suds) / 2);
        return {
          ...state,
          rungs: state.rungs.map((r) =>
            r.id === action.id ? { ...r, suds: Math.min(midSuds + 1, nextRung.suds - 1 > thisRung.suds ? nextRung.suds - 1 : thisRung.suds + 1) } : r
          ),
        };
      }
      if (action.dir === "down" && idx > 0) {
        const thisRung = sorted[idx];
        const prevRung = sorted[idx - 1];
        return {
          ...state,
          rungs: state.rungs.map((r) =>
            r.id === action.id ? { ...r, suds: Math.max(prevRung.suds + 1, thisRung.suds - 1) } : r
          ),
        };
      }
      return state;
    }

    case "TOGGLE_TOOL": {
      const exists = state.selectedTools.includes(action.id);
      return {
        ...state,
        selectedTools: exists
          ? state.selectedTools.filter((t) => t !== action.id)
          : [...state.selectedTools, action.id],
      };
    }

    case "SET_CUSTOM_TOOL":
      return { ...state, customTool: action.payload };

    case "SET_WHEN_WHERE":
      return { ...state, whenWhere: action.payload };

    case "SET_SUPPORT":
      return { ...state, support: action.payload };

    case "SET_SELF_TALK":
      return { ...state, selfTalk: action.payload };

    case "SET_SUDS_GOAL":
      return { ...state, sudsGoal: action.payload };

    case "SET_COMMITMENT_TEXT":
      return { ...state, commitmentText: action.payload };

    case "SET_SELF_COMPASSION":
      return { ...state, selfCompassion: action.payload };

    case "SET_CONFIDENCE_LEVEL":
      return { ...state, confidenceLevel: action.payload };

    case "NEXT_STEP":
      return { ...state, currentStep: Math.min(state.currentStep + 1, 6) };

    case "PREV_STEP":
      return { ...state, currentStep: Math.max(state.currentStep - 1, 0) };

    case "TOGGLE_GUIDE":
      return { ...state, isGuideOpen: !state.isGuideOpen };

    case "RESET":
      return { ...createInitialState(), ageMode: state.ageMode };

    default:
      return state;
  }
}

// ── Component ──────────────────────────────────────────────────────────────

export function AnxietyLadder() {
  const [state, dispatch] = useReducer(ladderReducer, undefined, createInitialState);
  const { isMuted, toggleMute } = useAudio();

  const stepConfig = STEP_CONFIGS[state.currentStep] || STEP_CONFIGS[0];
  const handleNext = () => dispatch({ type: "NEXT_STEP" });
  const handleBack = () => dispatch({ type: "PREV_STEP" });

  const startingRung =
    state.rungs.length > 0
      ? [...state.rungs].sort((a, b) => a.suds - b.suds)[0]
      : null;

  const canProceed = (() => {
    switch (state.currentStep) {
      case 0:
        return state.fearTopic.trim().length > 0;
      case 1:
        return state.bodyDescription.trim().length >= 20;
      case 2:
        return state.rungs.length >= 3;
      case 3:
        return state.selectedTools.length >= 3 || state.customTool.trim().length > 0;
      case 4:
        return (
          state.whenWhere.trim().length >= 20 && state.selfTalk.trim().length >= 10
        );
      case 5:
        return (
          state.confidenceLevel !== null &&
          state.commitmentText.trim().length >= 20
        );
      default:
        return false;
    }
  })();

  const renderStepContent = () => {
    switch (state.currentStep) {
      case 0:
        return (
          <FearStep
            fearTopic={state.fearTopic}
            anxietyCategory={state.anxietyCategory}
            onSetTopic={(t) => dispatch({ type: "SET_FEAR_TOPIC", payload: t })}
            onSetCategory={(c) => dispatch({ type: "SET_ANXIETY_CATEGORY", payload: c })}
            ageMode={state.ageMode}
          />
        );
      case 1:
        return (
          <SUDSStep
            currentSUDS={state.currentSUDS}
            bodyDescription={state.bodyDescription}
            onSetSUDS={(n) => dispatch({ type: "SET_CURRENT_SUDS", payload: n })}
            onSetBodyDesc={(t) => dispatch({ type: "SET_BODY_DESCRIPTION", payload: t })}
            ageMode={state.ageMode}
          />
        );
      case 2:
        return (
          <LadderBuilder
            rungs={state.rungs}
            onAddRung={(desc, suds) => dispatch({ type: "ADD_RUNG", desc, suds })}
            onRemoveRung={(id) => dispatch({ type: "REMOVE_RUNG", id })}
            onMoveRung={(id, dir) => dispatch({ type: "MOVE_RUNG", id, dir })}
            fearTopic={state.fearTopic}
            ageMode={state.ageMode}
          />
        );
      case 3:
        return (
          <CopingKitStep
            selectedTools={state.selectedTools}
            customTool={state.customTool}
            onToggleTool={(id) => dispatch({ type: "TOGGLE_TOOL", id })}
            onSetCustomTool={(t) => dispatch({ type: "SET_CUSTOM_TOOL", payload: t })}
            ageMode={state.ageMode}
          />
        );
      case 4:
        return (
          <PracticePlanStep
            startingRung={startingRung}
            whenWhere={state.whenWhere}
            support={state.support}
            selfTalk={state.selfTalk}
            sudsGoal={state.sudsGoal}
            onSetWhenWhere={(t) => dispatch({ type: "SET_WHEN_WHERE", payload: t })}
            onSetSupport={(t) => dispatch({ type: "SET_SUPPORT", payload: t })}
            onSetSelfTalk={(t) => dispatch({ type: "SET_SELF_TALK", payload: t })}
            onSetSudsGoal={(n) => dispatch({ type: "SET_SUDS_GOAL", payload: n })}
            ageMode={state.ageMode}
          />
        );
      case 5:
        return (
          <BraveCommitment
            commitmentText={state.commitmentText}
            selfCompassion={state.selfCompassion}
            confidenceLevel={state.confidenceLevel}
            onSetCommitment={(t) => dispatch({ type: "SET_COMMITMENT_TEXT", payload: t })}
            onSetSelfCompassion={(t) => dispatch({ type: "SET_SELF_COMPASSION", payload: t })}
            onSetConfidence={(c) => dispatch({ type: "SET_CONFIDENCE_LEVEL", payload: c })}
            ageMode={state.ageMode}
          />
        );
      default:
        return null;
    }
  };

  const headerBar = (isComplete?: boolean) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 14px",
        borderBottom: "1px solid rgba(100, 168, 212, 0.15)",
        zIndex: 10,
        flexShrink: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 16 }}>{"\uD83E\uDE9C"}</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#e8dcc8" }}>
          The Anxiety Ladder
        </span>
        {isComplete && (
          <span style={{ fontSize: 10, color: "rgba(232, 220, 200, 0.35)" }}>
            {" "}\u2014 Complete
          </span>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <FurtherReading
          references={EXPOSURE_REFERENCES}
          accentColor="rgba(100,168,212,0.6)"
          textColor="#e8dcc8"
          bgColor="rgba(10,14,24,0.97)"
        />
        <button
          onClick={toggleMute}
          data-testid="button-al-mute"
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
        data-testid="tool-anxiety-ladder"
        style={{ width: "100%", height: "100%", minHeight: 0, minWidth: 0, position: "relative" }}
      >
        <WelcomeScreen
          onStart={() => dispatch({ type: "START" })}
          ageMode={state.ageMode}
          onSetAgeMode={(mode) => dispatch({ type: "SET_AGE_MODE", payload: mode })}
          onOpenGuide={() => dispatch({ type: "TOGGLE_GUIDE" })}
        />
        <ExposureGuide
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
        data-testid="tool-anxiety-ladder"
        style={{
          width: "100%",
          height: "100%",
          minHeight: 0,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(170deg, #0a0e18 0%, #101828 30%, #141e2c 60%, #080c14 100%)",
          fontFamily: "Inter, sans-serif",
          overflow: "hidden",
          position: "relative",
          borderRadius: 12,
        }}
      >
        {headerBar(true)}
        <div style={{ flex: 1, minHeight: 0, overflow: "auto", padding: "16px clamp(12px, 3vw, 24px)" }}>
          <LadderSummary
            ageMode={state.ageMode}
            fearTopic={state.fearTopic}
            anxietyCategory={state.anxietyCategory}
            currentSUDS={state.currentSUDS}
            bodyDescription={state.bodyDescription}
            rungs={state.rungs}
            selectedTools={state.selectedTools}
            customTool={state.customTool}
            whenWhere={state.whenWhere}
            support={state.support}
            selfTalk={state.selfTalk}
            sudsGoal={state.sudsGoal}
            commitmentText={state.commitmentText}
            selfCompassion={state.selfCompassion}
            confidenceLevel={state.confidenceLevel}
            onReset={() => dispatch({ type: "RESET" })}
          />
        </div>
      </div>
    );
  }

  // Steps 0-5
  return (
    <div
      data-testid="tool-anxiety-ladder"
      style={{
        width: "100%",
        height: "100%",
        minHeight: 0,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(170deg, #0a0e18 0%, #101828 30%, #141e2c 60%, #080c14 100%)",
        fontFamily: "Inter, sans-serif",
        overflow: "hidden",
        position: "relative",
        borderRadius: 12,
      }}
    >
      {headerBar()}

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
