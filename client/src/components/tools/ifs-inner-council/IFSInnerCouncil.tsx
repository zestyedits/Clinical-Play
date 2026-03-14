import { useReducer } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAudio } from "../../../lib/stores/useAudio";
import type { AgeMode } from "./council-data";
import { PART_ARCHETYPES, STEP_CONFIGS } from "./council-data";
import { WelcomeScreen } from "./WelcomeScreen";
import { StepWrapper } from "./StepWrapper";
import { DiscoverParts } from "./DiscoverParts";
import { CouncilTable } from "./CouncilTable";
import { CouncilMeeting } from "./CouncilMeeting";
import { CouncilSummary } from "./CouncilSummary";
import { IFSGuide } from "./IFSGuide";
import { FurtherReading } from "../shared/FurtherReading";
import { IFS_REFERENCES } from "../shared/references-data";

// ── Types ──────────────────────────────────────────────────────────────────

export interface SelectedPart {
  archetypeId: string;
  concern: string;
  selfResponse: string;
  heard: boolean;
}

export interface CouncilState {
  ageMode: AgeMode;
  currentStep: number; // -1=welcome, 0-3=steps
  selectedParts: SelectedPart[];
  isIFSGuideOpen: boolean;
}

export type CouncilAction =
  | { type: "SET_AGE_MODE"; payload: AgeMode }
  | { type: "START_COUNCIL" }
  | { type: "TOGGLE_PART"; archetypeId: string }
  | { type: "SET_SELF_RESPONSE"; archetypeId: string; response: string }
  | { type: "MARK_HEARD"; archetypeId: string }
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "TOGGLE_GUIDE" }
  | { type: "RESET" };

// ── Reducer ────────────────────────────────────────────────────────────────

const createInitialState = (): CouncilState => ({
  ageMode: "adult",
  currentStep: -1,
  selectedParts: [],
  isIFSGuideOpen: false,
});

function councilReducer(state: CouncilState, action: CouncilAction): CouncilState {
  switch (action.type) {
    case "SET_AGE_MODE":
      return {
        ...state,
        ageMode: action.payload,
        selectedParts: state.selectedParts.map((p) => {
          const archetype = PART_ARCHETYPES.find((a) => a.id === p.archetypeId);
          return {
            ...p,
            concern: archetype ? archetype.defaultConcern[action.payload] : p.concern,
          };
        }),
      };

    case "START_COUNCIL":
      return { ...state, currentStep: 0 };

    case "TOGGLE_PART": {
      const exists = state.selectedParts.find((p) => p.archetypeId === action.archetypeId);
      if (exists) {
        return {
          ...state,
          selectedParts: state.selectedParts.filter((p) => p.archetypeId !== action.archetypeId),
        };
      }
      const archetype = PART_ARCHETYPES.find((a) => a.id === action.archetypeId);
      if (!archetype) return state;
      return {
        ...state,
        selectedParts: [
          ...state.selectedParts,
          {
            archetypeId: action.archetypeId,
            concern: archetype.defaultConcern[state.ageMode],
            selfResponse: "",
            heard: false,
          },
        ],
      };
    }

    case "SET_SELF_RESPONSE":
      return {
        ...state,
        selectedParts: state.selectedParts.map((p) =>
          p.archetypeId === action.archetypeId ? { ...p, selfResponse: action.response } : p
        ),
      };

    case "MARK_HEARD":
      return {
        ...state,
        selectedParts: state.selectedParts.map((p) =>
          p.archetypeId === action.archetypeId ? { ...p, heard: true } : p
        ),
      };

    case "NEXT_STEP":
      return { ...state, currentStep: Math.min(state.currentStep + 1, 3) };

    case "PREV_STEP":
      return { ...state, currentStep: Math.max(state.currentStep - 1, 0) };

    case "TOGGLE_GUIDE":
      return { ...state, isIFSGuideOpen: !state.isIFSGuideOpen };

    case "RESET":
      return { ...createInitialState(), ageMode: state.ageMode };

    default:
      return state;
  }
}

// ── Component ──────────────────────────────────────────────────────────────

export function IFSInnerCouncil() {
  const [state, dispatch] = useReducer(councilReducer, undefined, createInitialState);
  const { isMuted, toggleMute } = useAudio();

  const stepConfig = STEP_CONFIGS[state.currentStep] || STEP_CONFIGS[0];
  const handleNext = () => dispatch({ type: "NEXT_STEP" });
  const handleBack = () => dispatch({ type: "PREV_STEP" });

  const canProceed = (() => {
    switch (state.currentStep) {
      case 0:
        return state.selectedParts.length >= 2;
      case 1:
        return true;
      case 2:
        return state.selectedParts.every((p) => p.selfResponse.length > 0);
      case 3:
        return true;
      default:
        return false;
    }
  })();

  const renderStepContent = () => {
    switch (state.currentStep) {
      case 0:
        return (
          <DiscoverParts
            selectedPartIds={state.selectedParts.map((p) => p.archetypeId)}
            onTogglePart={(archetypeId) => dispatch({ type: "TOGGLE_PART", archetypeId })}
            ageMode={state.ageMode}
          />
        );
      case 1:
        return (
          <CouncilTable
            selectedParts={state.selectedParts}
            ageMode={state.ageMode}
          />
        );
      case 2:
        return (
          <CouncilMeeting
            selectedParts={state.selectedParts}
            onSetSelfResponse={(archetypeId, response) =>
              dispatch({ type: "SET_SELF_RESPONSE", archetypeId, response })
            }
            onMarkHeard={(archetypeId) => dispatch({ type: "MARK_HEARD", archetypeId })}
            ageMode={state.ageMode}
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
        data-testid="tool-ifs-inner-council"
        style={{ width: "100%", height: "100%", position: "relative" }}
      >
        <WelcomeScreen
          onStart={() => dispatch({ type: "START_COUNCIL" })}
          ageMode={state.ageMode}
          onSetAgeMode={(mode) => dispatch({ type: "SET_AGE_MODE", payload: mode })}
          onOpenGuide={() => dispatch({ type: "TOGGLE_GUIDE" })}
        />
        <IFSGuide
          isOpen={state.isIFSGuideOpen}
          onClose={() => dispatch({ type: "TOGGLE_GUIDE" })}
        />
      </div>
    );
  }

  // Council Summary (step 3) — own layout with header bar but no StepWrapper nav
  if (state.currentStep === 3) {
    return (
      <div
        data-testid="tool-ifs-inner-council"
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(170deg, #1a1208 0%, #2a1f14 30%, #1f1710 60%, #0d0a06 100%)",
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
            background: "rgba(26, 18, 8, 0.92)",
            borderBottom: "1px solid rgba(139, 115, 85, 0.3)",
            zIndex: 10,
            flexShrink: 0,
            backdropFilter: "blur(10px)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>{"\u2694"}</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#f4e4bc", lineHeight: 1.2 }}>
                The Inner Council
              </div>
              <div style={{ fontSize: 10, color: "rgba(244, 228, 188, 0.5)" }}>
                Council Complete
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <FurtherReading
              references={IFS_REFERENCES}
              accentColor="rgba(139,115,85,0.6)"
              textColor="#f4e4bc"
              bgColor="rgba(26,18,8,0.97)"
            />
            <button
              onClick={toggleMute}
              data-testid="button-ifs-mute"
              style={{
                background: "rgba(244, 228, 188, 0.1)",
                border: "1px solid rgba(139, 115, 85, 0.3)",
                borderRadius: 8,
                padding: "5px 10px",
                color: "#f4e4bc",
                fontSize: 16,
                cursor: "pointer",
              }}
            >
              {isMuted ? "\uD83D\uDD07" : "\uD83D\uDD0A"}
            </button>
          </div>
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: "16px clamp(12px, 3vw, 24px)" }}>
          <CouncilSummary
            selectedParts={state.selectedParts}
            ageMode={state.ageMode}
            onNewCouncil={() => dispatch({ type: "RESET" })}
          />
        </div>
      </div>
    );
  }

  // Steps 0-2
  return (
    <div
      data-testid="tool-ifs-inner-council"
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(170deg, #1a1208 0%, #2a1f14 30%, #1f1710 60%, #0d0a06 100%)",
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
          background: "rgba(26, 18, 8, 0.92)",
          borderBottom: "1px solid rgba(139, 115, 85, 0.3)",
          zIndex: 10,
          flexShrink: 0,
          backdropFilter: "blur(10px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>{"\u2694"}</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#f4e4bc", lineHeight: 1.2 }}>
              The Inner Council
            </div>
            <div style={{ fontSize: 10, color: "rgba(244, 228, 188, 0.5)" }}>
              Step {state.currentStep + 1} of {STEP_CONFIGS.length} &mdash; {stepConfig.label}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <FurtherReading
            references={IFS_REFERENCES}
            accentColor="rgba(139,115,85,0.6)"
            textColor="#f4e4bc"
            bgColor="rgba(26,18,8,0.97)"
          />
          <button
            onClick={toggleMute}
            data-testid="button-ifs-mute"
            style={{
              background: "rgba(244, 228, 188, 0.1)",
              border: "1px solid rgba(139, 115, 85, 0.3)",
              borderRadius: 8,
              padding: "5px 10px",
              color: "#f4e4bc",
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
