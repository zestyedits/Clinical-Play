import { useReducer } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAudio } from "../../../lib/stores/useAudio";
import type { AgeMode, BarrierType } from "./compass-data";
import { LIFE_DOMAINS, STEP_CONFIGS } from "./compass-data";
import { WelcomeScreen } from "./WelcomeScreen";
import { StepWrapper } from "./StepWrapper";
import { ValuesMapping } from "./ValuesMapping";
import { AlignmentDial } from "./AlignmentDial";
import { BarrierIdentification } from "./BarrierIdentification";
import { DefusionExercise } from "./DefusionExercise";
import { LookoutPoint } from "./LookoutPoint";
import { CommittedAction } from "./CommittedAction";
import { ExpeditionMap } from "./ExpeditionMap";
import { ACTGuide } from "./ACTGuide";
import { FurtherReading } from "../shared/FurtherReading";
import { ACT_REFERENCES } from "../shared/references-data";

// ── Types ──────────────────────────────────────────────────────────────────

export interface DomainState {
  domainId: string;
  values: string[];
  alignment: number;
}

export interface Barrier {
  id: string;
  domainId: string;
  text: string;
  type: BarrierType;
  defusionTechnique: string;
  defusedText: string;
}

export interface CommittedActionItem {
  domainId: string;
  action: string;
}

export interface ExpeditionState {
  ageMode: AgeMode;
  currentStep: number; // -1 = welcome, 0-6 = steps
  domains: DomainState[];
  barriers: Barrier[];
  committedActions: CommittedActionItem[];
  isACTGuideOpen: boolean;
}

export type ExpeditionAction =
  | { type: "SET_AGE_MODE"; payload: AgeMode }
  | { type: "START_EXPEDITION" }
  | { type: "UPDATE_VALUE"; domainId: string; values: string[] }
  | { type: "UPDATE_ALIGNMENT"; domainId: string; alignment: number }
  | { type: "ADD_BARRIER"; domainId: string; text: string; barrierType: BarrierType }
  | { type: "REMOVE_BARRIER"; barrierId: string }
  | { type: "UPDATE_BARRIER_DEFUSION"; barrierId: string; technique: string; defusedText: string }
  | { type: "UPDATE_ACTION"; domainId: string; action: string }
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "TOGGLE_GUIDE" }
  | { type: "RESET" };

// ── Reducer ────────────────────────────────────────────────────────────────

const createInitialState = (): ExpeditionState => ({
  ageMode: "adult",
  currentStep: -1,
  domains: LIFE_DOMAINS.map((d) => ({
    domainId: d.id,
    values: [],
    alignment: 5,
  })),
  barriers: [],
  committedActions: [],
  isACTGuideOpen: false,
});

function expeditionReducer(state: ExpeditionState, action: ExpeditionAction): ExpeditionState {
  switch (action.type) {
    case "SET_AGE_MODE":
      return { ...state, ageMode: action.payload };

    case "START_EXPEDITION":
      return { ...state, currentStep: 0 };

    case "UPDATE_VALUE":
      return {
        ...state,
        domains: state.domains.map((d) =>
          d.domainId === action.domainId ? { ...d, values: action.values } : d
        ),
      };

    case "UPDATE_ALIGNMENT":
      return {
        ...state,
        domains: state.domains.map((d) =>
          d.domainId === action.domainId ? { ...d, alignment: action.alignment } : d
        ),
      };

    case "ADD_BARRIER": {
      const newBarrier: Barrier = {
        id: `b-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        domainId: action.domainId,
        text: action.text,
        type: action.barrierType,
        defusionTechnique: "",
        defusedText: "",
      };
      return { ...state, barriers: [...state.barriers, newBarrier] };
    }

    case "REMOVE_BARRIER":
      return {
        ...state,
        barriers: state.barriers.filter((b) => b.id !== action.barrierId),
      };

    case "UPDATE_BARRIER_DEFUSION":
      return {
        ...state,
        barriers: state.barriers.map((b) =>
          b.id === action.barrierId
            ? { ...b, defusionTechnique: action.technique, defusedText: action.defusedText }
            : b
        ),
      };

    case "UPDATE_ACTION": {
      const existing = state.committedActions.find((a) => a.domainId === action.domainId);
      if (existing) {
        return {
          ...state,
          committedActions: state.committedActions.map((a) =>
            a.domainId === action.domainId ? { ...a, action: action.action } : a
          ),
        };
      }
      return {
        ...state,
        committedActions: [...state.committedActions, { domainId: action.domainId, action: action.action }],
      };
    }

    case "NEXT_STEP":
      return { ...state, currentStep: Math.min(state.currentStep + 1, 6) };

    case "PREV_STEP":
      return { ...state, currentStep: Math.max(state.currentStep - 1, 0) };

    case "TOGGLE_GUIDE":
      return { ...state, isACTGuideOpen: !state.isACTGuideOpen };

    case "RESET":
      return { ...createInitialState(), ageMode: state.ageMode };

    default:
      return state;
  }
}

// ── Component ──────────────────────────────────────────────────────────────

export function ACTValuesCompass() {
  const [state, dispatch] = useReducer(expeditionReducer, undefined, createInitialState);
  const { isMuted, toggleMute } = useAudio();

  const stepConfig = STEP_CONFIGS[state.currentStep] || STEP_CONFIGS[0];
  const handleNext = () => dispatch({ type: "NEXT_STEP" });
  const handleBack = () => dispatch({ type: "PREV_STEP" });

  const canProceed = (() => {
    switch (state.currentStep) {
      case 0: // Values — at least 1 domain must have a value
        return state.domains.some((d) => d.values.length > 0 && d.values.some((v) => v.trim().length > 0));
      case 1: // Alignment — always true (sliders have defaults)
        return true;
      case 2: // Barriers — at least 1 barrier or all domains > 6
        return state.barriers.length > 0 || state.domains.every((d) => d.alignment > 6);
      case 3: // Defusion — all barriers have a defused text (or no barriers)
        return state.barriers.length === 0 || state.barriers.every((b) => b.defusedText.trim().length > 0);
      case 4: // Lookout point — always true (mindfulness)
        return true;
      case 5: // Committed action — at least 1 action
        return state.committedActions.some((a) => a.action.trim().length > 0);
      case 6: // Summary — always true
        return true;
      default:
        return false;
    }
  })();

  const renderStepContent = () => {
    switch (state.currentStep) {
      case 0:
        return (
          <ValuesMapping
            domains={state.domains}
            onUpdateValue={(domainId, values) =>
              dispatch({ type: "UPDATE_VALUE", domainId, values })
            }
            ageMode={state.ageMode}
          />
        );
      case 1:
        return (
          <AlignmentDial
            domains={state.domains}
            onUpdateAlignment={(domainId, alignment) =>
              dispatch({ type: "UPDATE_ALIGNMENT", domainId, alignment })
            }
            ageMode={state.ageMode}
          />
        );
      case 2:
        return (
          <BarrierIdentification
            domains={state.domains}
            barriers={state.barriers}
            onAddBarrier={(domainId, text, type) =>
              dispatch({ type: "ADD_BARRIER", domainId, text, barrierType: type })
            }
            onRemoveBarrier={(barrierId) =>
              dispatch({ type: "REMOVE_BARRIER", barrierId })
            }
            ageMode={state.ageMode}
          />
        );
      case 3:
        return (
          <DefusionExercise
            barriers={state.barriers}
            onUpdateBarrier={(barrierId, technique, defusedText) =>
              dispatch({ type: "UPDATE_BARRIER_DEFUSION", barrierId, technique, defusedText })
            }
            ageMode={state.ageMode}
          />
        );
      case 4:
        return <LookoutPoint barriers={state.barriers} ageMode={state.ageMode} />;
      case 5:
        return (
          <CommittedAction
            domains={state.domains}
            committedActions={state.committedActions}
            onUpdateAction={(domainId, action) =>
              dispatch({ type: "UPDATE_ACTION", domainId, action })
            }
            ageMode={state.ageMode}
          />
        );
      case 6:
        return (
          <ExpeditionMap
            ageMode={state.ageMode}
            domains={state.domains}
            barriers={state.barriers}
            committedActions={state.committedActions}
            onNewExpedition={() => dispatch({ type: "RESET" })}
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
        data-testid="tool-act-values-compass"
        style={{ width: "100%", height: "100%", position: "relative" }}
      >
        <WelcomeScreen
          onStart={() => dispatch({ type: "START_EXPEDITION" })}
          ageMode={state.ageMode}
          onSetAgeMode={(mode) => dispatch({ type: "SET_AGE_MODE", payload: mode })}
          onOpenGuide={() => dispatch({ type: "TOGGLE_GUIDE" })}
        />
        <ACTGuide
          isOpen={state.isACTGuideOpen}
          onClose={() => dispatch({ type: "TOGGLE_GUIDE" })}
        />
      </div>
    );
  }

  // Expedition Map (step 6) — own layout with header bar but no StepWrapper nav
  if (state.currentStep === 6) {
    return (
      <div
        data-testid="tool-act-values-compass"
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(170deg, #0f1a1f 0%, #152530 30%, #1a2a35 60%, #0d1820 100%)",
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
            background: "rgba(10, 18, 25, 0.92)",
            borderBottom: "1px solid rgba(45, 138, 138, 0.3)",
            zIndex: 10,
            flexShrink: 0,
            backdropFilter: "blur(10px)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>{"\uD83E\uDDED"}</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#e8dcc8", lineHeight: 1.2 }}>
                The Values Compass
              </div>
              <div style={{ fontSize: 10, color: "rgba(232, 220, 200, 0.5)" }}>
                Expedition Complete
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <FurtherReading
              references={ACT_REFERENCES}
              accentColor="rgba(45,138,138,0.6)"
              textColor="#e8dcc8"
              bgColor="rgba(10,18,25,0.97)"
            />
            <button
              onClick={toggleMute}
              data-testid="button-act-mute"
              style={{
                background: "rgba(232, 220, 200, 0.1)",
                border: "1px solid rgba(45, 138, 138, 0.3)",
                borderRadius: 8,
                padding: "5px 10px",
                color: "#e8dcc8",
                fontSize: 16,
                cursor: "pointer",
              }}
            >
              {isMuted ? "\uD83D\uDD07" : "\uD83D\uDD0A"}
            </button>
          </div>
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: "16px clamp(12px, 3vw, 24px)" }}>
          <ExpeditionMap
            ageMode={state.ageMode}
            domains={state.domains}
            barriers={state.barriers}
            committedActions={state.committedActions}
            onNewExpedition={() => dispatch({ type: "RESET" })}
          />
        </div>
      </div>
    );
  }

  // Steps 0-5
  return (
    <div
      data-testid="tool-act-values-compass"
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(170deg, #0f1a1f 0%, #152530 30%, #1a2a35 60%, #0d1820 100%)",
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
          background: "rgba(10, 18, 25, 0.92)",
          borderBottom: "1px solid rgba(45, 138, 138, 0.3)",
          zIndex: 10,
          flexShrink: 0,
          backdropFilter: "blur(10px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>{"\uD83E\uDDED"}</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#e8dcc8", lineHeight: 1.2 }}>
              The Values Compass
            </div>
            <div style={{ fontSize: 10, color: "rgba(232, 220, 200, 0.5)" }}>
              Step {state.currentStep + 1} of {STEP_CONFIGS.length} &mdash; {stepConfig.label}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <FurtherReading
            references={ACT_REFERENCES}
            accentColor="rgba(45,138,138,0.6)"
            textColor="#e8dcc8"
            bgColor="rgba(10,18,25,0.97)"
          />
          <button
            onClick={toggleMute}
            data-testid="button-act-mute"
            style={{
              background: "rgba(232, 220, 200, 0.1)",
              border: "1px solid rgba(45, 138, 138, 0.3)",
              borderRadius: 8,
              padding: "5px 10px",
              color: "#e8dcc8",
              fontSize: 16,
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
    </div>
  );
}
