import { useReducer } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAudio } from "../../../lib/stores/useAudio";
import type { AgeMode, DARNCategory, WeedCategory, Seed, Weed, ValueConnection, Commitment } from "./garden-data";
import { STEP_CONFIGS } from "./garden-data";
import { WelcomeScreen } from "./WelcomeScreen";
import { StepWrapper } from "./StepWrapper";
import { MIGuide } from "./MIGuide";
import { GardenPlot } from "./GardenPlot";
import { SeedPlanting } from "./SeedPlanting";
import { WeedNoticing } from "./WeedNoticing";
import { GardenWatering } from "./GardenWatering";
import { SoilTending } from "./SoilTending";
import { GardenGrowing } from "./GardenGrowing";
import { BouquetHarvest } from "./BouquetHarvest";
import { FurtherReading } from "../shared/FurtherReading";
import { MI_REFERENCES } from "../shared/references-data";

// ── Types ──────────────────────────────────────────────────────────────────

export interface GardenState {
  ageMode: AgeMode;
  currentStep: number; // -1 = welcome, 0-6 = steps
  changeTopic: string;
  seeds: Seed[];
  weeds: Weed[];
  importance: number;
  confidence: number;
  importanceReflection: string;
  confidenceReflection: string;
  values: string[];
  valueConnections: ValueConnection[];
  commitments: Commitment[];
  isGuideOpen: boolean;
}

export type GardenAction =
  | { type: "SET_AGE_MODE"; payload: AgeMode }
  | { type: "START_GARDEN" }
  | { type: "SET_TOPIC"; payload: string }
  | { type: "ADD_SEED"; category: DARNCategory; text: string }
  | { type: "REMOVE_SEED"; seedId: string }
  | { type: "ADD_WEED"; category: WeedCategory; text: string }
  | { type: "REMOVE_WEED"; weedId: string }
  | { type: "SET_IMPORTANCE"; payload: number }
  | { type: "SET_CONFIDENCE"; payload: number }
  | { type: "SET_IMPORTANCE_REFLECTION"; payload: string }
  | { type: "SET_CONFIDENCE_REFLECTION"; payload: string }
  | { type: "ADD_VALUE"; payload: string }
  | { type: "REMOVE_VALUE"; payload: string }
  | { type: "ADD_VALUE_CONNECTION"; value: string; connection: string }
  | { type: "REMOVE_VALUE_CONNECTION"; value: string }
  | { type: "ADD_COMMITMENT"; text: string }
  | { type: "REMOVE_COMMITMENT"; commitmentId: string }
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "TOGGLE_GUIDE" }
  | { type: "RESET" };

// ── Reducer ────────────────────────────────────────────────────────────────

const createInitialState = (): GardenState => ({
  ageMode: "adult",
  currentStep: -1,
  changeTopic: "",
  seeds: [],
  weeds: [],
  importance: 5,
  confidence: 5,
  importanceReflection: "",
  confidenceReflection: "",
  values: [],
  valueConnections: [],
  commitments: [],
  isGuideOpen: false,
});

function gardenReducer(state: GardenState, action: GardenAction): GardenState {
  switch (action.type) {
    case "SET_AGE_MODE":
      return { ...state, ageMode: action.payload };

    case "START_GARDEN":
      return { ...state, currentStep: 0 };

    case "SET_TOPIC":
      return { ...state, changeTopic: action.payload };

    case "ADD_SEED": {
      const newSeed: Seed = {
        id: `s-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        category: action.category,
        text: action.text,
      };
      return { ...state, seeds: [...state.seeds, newSeed] };
    }

    case "REMOVE_SEED":
      return { ...state, seeds: state.seeds.filter((s) => s.id !== action.seedId) };

    case "ADD_WEED": {
      const newWeed: Weed = {
        id: `w-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        category: action.category,
        text: action.text,
      };
      return { ...state, weeds: [...state.weeds, newWeed] };
    }

    case "REMOVE_WEED":
      return { ...state, weeds: state.weeds.filter((w) => w.id !== action.weedId) };

    case "SET_IMPORTANCE":
      return { ...state, importance: action.payload, importanceReflection: "" };

    case "SET_CONFIDENCE":
      return { ...state, confidence: action.payload, confidenceReflection: "" };

    case "SET_IMPORTANCE_REFLECTION":
      return { ...state, importanceReflection: action.payload };

    case "SET_CONFIDENCE_REFLECTION":
      return { ...state, confidenceReflection: action.payload };

    case "ADD_VALUE":
      return { ...state, values: [...state.values, action.payload] };

    case "REMOVE_VALUE":
      return {
        ...state,
        values: state.values.filter((v) => v !== action.payload),
        valueConnections: state.valueConnections.filter((vc) => vc.value !== action.payload),
      };

    case "ADD_VALUE_CONNECTION": {
      const existing = state.valueConnections.find((vc) => vc.value === action.value);
      if (existing) {
        return {
          ...state,
          valueConnections: state.valueConnections.map((vc) =>
            vc.value === action.value ? { ...vc, connection: action.connection } : vc,
          ),
        };
      }
      return {
        ...state,
        valueConnections: [...state.valueConnections, { value: action.value, connection: action.connection }],
      };
    }

    case "REMOVE_VALUE_CONNECTION":
      return {
        ...state,
        valueConnections: state.valueConnections.filter((vc) => vc.value !== action.value),
      };

    case "ADD_COMMITMENT": {
      const newCommitment: Commitment = {
        id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        text: action.text,
      };
      return { ...state, commitments: [...state.commitments, newCommitment] };
    }

    case "REMOVE_COMMITMENT":
      return { ...state, commitments: state.commitments.filter((c) => c.id !== action.commitmentId) };

    case "NEXT_STEP":
      return { ...state, currentStep: Math.min(state.currentStep + 1, 7) };

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

export function MIMotivationGarden() {
  const [state, dispatch] = useReducer(gardenReducer, undefined, createInitialState);
  const { isMuted, toggleMute } = useAudio();

  const stepConfig = STEP_CONFIGS[state.currentStep] || STEP_CONFIGS[0];
  const handleNext = () => dispatch({ type: "NEXT_STEP" });
  const handleBack = () => dispatch({ type: "PREV_STEP" });

  const canProceed = (() => {
    switch (state.currentStep) {
      case 0: // Garden Plot — a topic must be selected
        return state.changeTopic !== "";
      case 1: // Seeds — at least 2 seeds planted
        return state.seeds.length >= 2;
      case 2: // Weeds — at least 1 weed acknowledged
        return state.weeds.length >= 1;
      case 3: // Watering — always true (sliders have defaults)
        return true;
      case 4: // Soil — at least 1 value selected
        return state.values.length >= 1;
      case 5: // Growing — always true (mindfulness)
        return true;
      case 6: // Harvest — at least 1 commitment
        return state.commitments.length >= 1;
      default:
        return false;
    }
  })();

  const renderStepContent = () => {
    switch (state.currentStep) {
      case 0:
        return (
          <GardenPlot
            changeTopic={state.changeTopic}
            onSelectTopic={(topicId) => dispatch({ type: "SET_TOPIC", payload: topicId })}
            ageMode={state.ageMode}
          />
        );
      case 1:
        return (
          <SeedPlanting
            changeTopic={state.changeTopic}
            seeds={state.seeds}
            onAddSeed={(category, text) => dispatch({ type: "ADD_SEED", category, text })}
            onRemoveSeed={(seedId) => dispatch({ type: "REMOVE_SEED", seedId })}
            ageMode={state.ageMode}
          />
        );
      case 2:
        return (
          <WeedNoticing
            changeTopic={state.changeTopic}
            weeds={state.weeds}
            onAddWeed={(category, text) => dispatch({ type: "ADD_WEED", category, text })}
            onRemoveWeed={(weedId) => dispatch({ type: "REMOVE_WEED", weedId })}
            ageMode={state.ageMode}
          />
        );
      case 3:
        return (
          <GardenWatering
            importance={state.importance}
            confidence={state.confidence}
            importanceReflection={state.importanceReflection}
            confidenceReflection={state.confidenceReflection}
            onSetImportance={(v) => dispatch({ type: "SET_IMPORTANCE", payload: v })}
            onSetConfidence={(v) => dispatch({ type: "SET_CONFIDENCE", payload: v })}
            onSetImportanceReflection={(t) => dispatch({ type: "SET_IMPORTANCE_REFLECTION", payload: t })}
            onSetConfidenceReflection={(t) => dispatch({ type: "SET_CONFIDENCE_REFLECTION", payload: t })}
            ageMode={state.ageMode}
          />
        );
      case 4:
        return (
          <SoilTending
            changeTopic={state.changeTopic}
            values={state.values}
            valueConnections={state.valueConnections}
            onAddValue={(v) => dispatch({ type: "ADD_VALUE", payload: v })}
            onRemoveValue={(v) => dispatch({ type: "REMOVE_VALUE", payload: v })}
            onAddValueConnection={(value, connection) =>
              dispatch({ type: "ADD_VALUE_CONNECTION", value, connection })
            }
            onRemoveValueConnection={(value) =>
              dispatch({ type: "REMOVE_VALUE_CONNECTION", value })
            }
            ageMode={state.ageMode}
          />
        );
      case 5:
        return <GardenGrowing seeds={state.seeds} ageMode={state.ageMode} />;
      case 6:
        return (
          <BouquetHarvest
            changeTopic={state.changeTopic}
            seeds={state.seeds}
            weeds={state.weeds}
            importance={state.importance}
            confidence={state.confidence}
            values={state.values}
            valueConnections={state.valueConnections}
            commitments={state.commitments}
            onAddCommitment={(text) => dispatch({ type: "ADD_COMMITMENT", text })}
            onRemoveCommitment={(id) => dispatch({ type: "REMOVE_COMMITMENT", commitmentId: id })}
            onReset={() => dispatch({ type: "RESET" })}
            ageMode={state.ageMode}
            showSummary={false}
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
        data-testid="tool-mi-motivation-garden"
        style={{ width: "100%", height: "100%", position: "relative" }}
      >
        <WelcomeScreen
          onStart={() => dispatch({ type: "START_GARDEN" })}
          ageMode={state.ageMode}
          onSetAgeMode={(mode) => dispatch({ type: "SET_AGE_MODE", payload: mode })}
          onOpenGuide={() => dispatch({ type: "TOGGLE_GUIDE" })}
        />
        <MIGuide
          isOpen={state.isGuideOpen}
          onClose={() => dispatch({ type: "TOGGLE_GUIDE" })}
        />
      </div>
    );
  }

  // Bouquet summary (step 7 — after committing)
  if (state.currentStep === 7) {
    return (
      <div
        data-testid="tool-mi-motivation-garden"
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(170deg, #f5faf6 0%, #e6f0ea 30%, #dae8df 60%, #d0dfd6 100%)",
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
            padding: "8px 14px",
            background: "rgba(255, 252, 250, 0.88)",
            borderBottom: "1px solid rgba(45, 122, 58, 0.18)",
            zIndex: 10,
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 16 }}>{"\uD83C\uDF31"}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#3a3228" }}>
              Motivation Garden
            </span>
            <span style={{ fontSize: 10, color: "rgba(58, 48, 38, 0.45)" }}>
              — Complete
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <FurtherReading
              references={MI_REFERENCES}
              accentColor="rgba(45,122,58,0.6)"
              textColor="#3a3228"
              bgColor="rgba(255,252,250,0.98)"
            />
            <button
              type="button"
              onClick={toggleMute}
              data-testid="button-mi-mute"
              style={{
                background: "rgba(58, 48, 38, 0.05)",
                border: "1px solid rgba(45, 122, 58, 0.15)",
                borderRadius: 8,
                padding: "8px 12px",
                minWidth: 44,
                minHeight: 44,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#3a3228",
                fontSize: 14,
                cursor: "pointer",
                boxSizing: "border-box",
              }}
            >
              {isMuted ? "\uD83D\uDD07" : "\uD83D\uDD0A"}
            </button>
          </div>
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: "16px clamp(12px, 3vw, 24px)" }}>
          <BouquetHarvest
            changeTopic={state.changeTopic}
            seeds={state.seeds}
            weeds={state.weeds}
            importance={state.importance}
            confidence={state.confidence}
            values={state.values}
            valueConnections={state.valueConnections}
            commitments={state.commitments}
            onAddCommitment={(text) => dispatch({ type: "ADD_COMMITMENT", text })}
            onRemoveCommitment={(id) => dispatch({ type: "REMOVE_COMMITMENT", commitmentId: id })}
            onReset={() => dispatch({ type: "RESET" })}
            ageMode={state.ageMode}
            showSummary={true}
          />
        </div>
      </div>
    );
  }

  // Steps 0-6
  return (
    <div
      data-testid="tool-mi-motivation-garden"
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(170deg, #f5faf6 0%, #e6f0ea 30%, #dae8df 60%, #d0dfd6 100%)",
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
          padding: "8px 14px",
          background: "rgba(255, 252, 250, 0.88)",
          borderBottom: "1px solid rgba(45, 122, 58, 0.18)",
          zIndex: 10,
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 16 }}>{"\uD83C\uDF31"}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#3a3228" }}>
            Motivation Garden
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <FurtherReading
            references={MI_REFERENCES}
            accentColor="rgba(45,122,58,0.6)"
            textColor="#3a3228"
            bgColor="rgba(255,252,250,0.98)"
          />
          <button
            type="button"
            onClick={toggleMute}
            data-testid="button-mi-mute"
            style={{
              background: "rgba(58, 48, 38, 0.05)",
              border: "1px solid rgba(45, 122, 58, 0.15)",
              borderRadius: 8,
              padding: "8px 12px",
              minWidth: 44,
              minHeight: 44,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#3a3228",
              fontSize: 14,
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
