import { useReducer, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAudio } from "../../../lib/stores/useAudio";
import { StepWrapper } from "./StepWrapper";
import { WelcomeScreen } from "./WelcomeScreen";
import { VolcanoBuilder } from "./VolcanoBuilder";
import { TriggerPanel } from "./TriggerPanel";
import { WarningSignsBody } from "./WarningSignsBody";
import { CoolingStation } from "./CoolingStation";
import { EruptionPlan } from "./EruptionPlan";
import { VolcanoReport } from "./VolcanoReport";
import { FurtherReading } from "../shared/FurtherReading";
import { STEPS, COOLING_TECHNIQUES } from "./volcano-data";
import type { AgeMode } from "./volcano-data";
import type { Reference } from "../shared/FurtherReading";

// ── Types ──────────────────────────────────────────────────────────────────

export interface Trigger {
  id: string;
  name: string;
  intensity: number; // 1-5
  category: string;
}

export interface WarningSigns {
  regionId: string;
  sensations: string[];
}

export interface PlanItem {
  tier: string;
  type: "warning" | "technique";
  id: string;
  label: string;
}

export interface VolcanoState {
  ageMode: AgeMode;
  currentStep: number; // -1 = welcome, 0-5 = steps
  baselineTemp: number;
  currentTemp: number;
  triggers: Trigger[];
  warningSigns: WarningSigns[];
  selectedTechniques: string[];
  appliedCooling: string[]; // techniques applied to volcano animation
  plan: PlanItem[];
  isComplete: boolean;
}

export type VolcanoAction =
  | { type: "SET_AGE_MODE"; payload: AgeMode }
  | { type: "START" }
  | { type: "SET_BASELINE_TEMP"; payload: number }
  | { type: "SET_CURRENT_TEMP"; payload: number }
  | { type: "ADD_TRIGGER"; payload: Trigger }
  | { type: "REMOVE_TRIGGER"; payload: string }
  | { type: "TOGGLE_WARNING_SIGN"; payload: { regionId: string; sensation: string } }
  | { type: "SELECT_TECHNIQUE"; payload: string }
  | { type: "DESELECT_TECHNIQUE"; payload: string }
  | { type: "APPLY_COOLING"; payload: string }
  | { type: "ADD_PLAN_ITEM"; payload: PlanItem }
  | { type: "REMOVE_PLAN_ITEM"; payload: { tier: string; id: string } }
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "RESET" };

// ── Reducer ────────────────────────────────────────────────────────────────

const initialState: VolcanoState = {
  ageMode: "adult",
  currentStep: -1,
  baselineTemp: 5,
  currentTemp: 5,
  triggers: [],
  warningSigns: [],
  selectedTechniques: [],
  appliedCooling: [],
  plan: [],
  isComplete: false,
};

function computeTemp(state: VolcanoState): number {
  const triggerHeat = state.triggers.reduce((sum, t) => sum + t.intensity, 0) * 0.4;
  const coolingPower = state.appliedCooling.reduce((sum, id) => {
    const tech = COOLING_TECHNIQUES.find((t) => t.id === id);
    return sum + (tech?.power ?? 0);
  }, 0) * 0.5;
  return Math.max(0, Math.min(10, state.baselineTemp + triggerHeat - coolingPower));
}

export function volcanoReducer(state: VolcanoState, action: VolcanoAction): VolcanoState {
  switch (action.type) {
    case "SET_AGE_MODE":
      return { ...state, ageMode: action.payload };

    case "START":
      return { ...state, currentStep: 0 };

    case "SET_BASELINE_TEMP": {
      const next = { ...state, baselineTemp: action.payload };
      next.currentTemp = computeTemp(next);
      return next;
    }

    case "SET_CURRENT_TEMP":
      return { ...state, currentTemp: action.payload };

    case "ADD_TRIGGER": {
      const next = { ...state, triggers: [...state.triggers, action.payload] };
      next.currentTemp = computeTemp(next);
      return next;
    }

    case "REMOVE_TRIGGER": {
      const next = { ...state, triggers: state.triggers.filter((t) => t.id !== action.payload) };
      next.currentTemp = computeTemp(next);
      return next;
    }

    case "TOGGLE_WARNING_SIGN": {
      const { regionId, sensation } = action.payload;
      const existing = state.warningSigns.find((w) => w.regionId === regionId);
      if (existing) {
        const hasSensation = existing.sensations.includes(sensation);
        if (hasSensation) {
          const updated = existing.sensations.filter((s) => s !== sensation);
          if (updated.length === 0) {
            return { ...state, warningSigns: state.warningSigns.filter((w) => w.regionId !== regionId) };
          }
          return {
            ...state,
            warningSigns: state.warningSigns.map((w) =>
              w.regionId === regionId ? { ...w, sensations: updated } : w
            ),
          };
        }
        return {
          ...state,
          warningSigns: state.warningSigns.map((w) =>
            w.regionId === regionId ? { ...w, sensations: [...w.sensations, sensation] } : w
          ),
        };
      }
      return { ...state, warningSigns: [...state.warningSigns, { regionId, sensations: [sensation] }] };
    }

    case "SELECT_TECHNIQUE":
      if (state.selectedTechniques.includes(action.payload)) return state;
      return { ...state, selectedTechniques: [...state.selectedTechniques, action.payload] };

    case "DESELECT_TECHNIQUE":
      return {
        ...state,
        selectedTechniques: state.selectedTechniques.filter((id) => id !== action.payload),
        appliedCooling: state.appliedCooling.filter((id) => id !== action.payload),
      };

    case "APPLY_COOLING": {
      if (state.appliedCooling.includes(action.payload)) return state;
      const next = { ...state, appliedCooling: [...state.appliedCooling, action.payload] };
      next.currentTemp = computeTemp(next);
      return next;
    }

    case "ADD_PLAN_ITEM":
      return { ...state, plan: [...state.plan, action.payload] };

    case "REMOVE_PLAN_ITEM":
      return {
        ...state,
        plan: state.plan.filter(
          (p) => !(p.tier === action.payload.tier && p.id === action.payload.id)
        ),
      };

    case "NEXT_STEP": {
      const nextStep = state.currentStep + 1;
      if (nextStep > 5) return { ...state, isComplete: true };
      return { ...state, currentStep: nextStep };
    }

    case "PREV_STEP":
      return { ...state, currentStep: Math.max(0, state.currentStep - 1) };

    case "RESET":
      return { ...initialState, ageMode: state.ageMode };

    default:
      return state;
  }
}

// ── Step Validation ────────────────────────────────────────────────────────

function canProceed(state: VolcanoState): boolean {
  switch (state.currentStep) {
    case 0: return true; // baseline is always set
    case 1: return state.triggers.length >= 1;
    case 2: return state.warningSigns.length >= 1;
    case 3: return state.selectedTechniques.length >= 2;
    case 4: return state.plan.length >= 3;
    case 5: return true;
    default: return false;
  }
}

// ── Helpful references ─────────────────────────────────────────────────────

const DBT_EMOTION_REFERENCES: Reference[] = [
  { title: "DBT Skills Training Manual", author: "Marsha Linehan", year: 2015, description: "The comprehensive guide to Dialectical Behavior Therapy skills, including emotion regulation and distress tolerance modules." },
  { title: "The Anger Workbook", author: "Les Carter & Frank Minirth", year: 2012, description: "A practical workbook for understanding anger patterns and developing healthy coping strategies." },
  { title: "Anger Management for Substance Use Disorder and Mental Health Clients", author: "SAMHSA", year: 2019, description: "Evidence-based cognitive behavioral anger management treatment protocol." },
  { title: "Cognitive Behavioral Interventions for Anger", author: "Raymond DiGiuseppe & Raymond Tafrate", year: 2006, description: "Research-based CBT approaches to understanding and treating anger disorders." },
];

// ── Main Component ─────────────────────────────────────────────────────────

export function EmotionVolcano() {
  const [state, dispatch] = useReducer(volcanoReducer, initialState);
  const { playSuccess } = useAudio();

  const handleNext = useCallback(() => {
    if (canProceed(state)) {
      playSuccess();
      dispatch({ type: "NEXT_STEP" });
    }
  }, [state, playSuccess]);

  const handleBack = useCallback(() => {
    dispatch({ type: "PREV_STEP" });
  }, []);

  const handleReset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  if (state.currentStep === -1) {
    return (
      <WelcomeScreen
        ageMode={state.ageMode}
        onSetAgeMode={(mode) => dispatch({ type: "SET_AGE_MODE", payload: mode })}
        onStart={() => {
          playSuccess();
          dispatch({ type: "START" });
        }}
      />
    );
  }

  if (state.isComplete) {
    return (
      <VolcanoReport
        state={state}
        onReset={handleReset}
      />
    );
  }

  const step = STEPS[state.currentStep];

  const renderStep = () => {
    switch (state.currentStep) {
      case 0:
        return (
          <VolcanoBuilder
            baselineTemp={state.baselineTemp}
            currentTemp={state.currentTemp}
            ageMode={state.ageMode}
            onSetBaseline={(t) => dispatch({ type: "SET_BASELINE_TEMP", payload: t })}
          />
        );
      case 1:
        return (
          <TriggerPanel
            triggers={state.triggers}
            currentTemp={state.currentTemp}
            ageMode={state.ageMode}
            onAddTrigger={(t) => dispatch({ type: "ADD_TRIGGER", payload: t })}
            onRemoveTrigger={(id) => dispatch({ type: "REMOVE_TRIGGER", payload: id })}
          />
        );
      case 2:
        return (
          <WarningSignsBody
            warningSigns={state.warningSigns}
            ageMode={state.ageMode}
            onToggle={(regionId, sensation) =>
              dispatch({ type: "TOGGLE_WARNING_SIGN", payload: { regionId, sensation } })
            }
          />
        );
      case 3:
        return (
          <CoolingStation
            selectedTechniques={state.selectedTechniques}
            appliedCooling={state.appliedCooling}
            currentTemp={state.currentTemp}
            ageMode={state.ageMode}
            onSelect={(id) => dispatch({ type: "SELECT_TECHNIQUE", payload: id })}
            onDeselect={(id) => dispatch({ type: "DESELECT_TECHNIQUE", payload: id })}
            onApply={(id) => dispatch({ type: "APPLY_COOLING", payload: id })}
          />
        );
      case 4:
        return (
          <EruptionPlan
            plan={state.plan}
            warningSigns={state.warningSigns}
            selectedTechniques={state.selectedTechniques}
            ageMode={state.ageMode}
            onAddItem={(item) => dispatch({ type: "ADD_PLAN_ITEM", payload: item })}
            onRemoveItem={(tier, id) => dispatch({ type: "REMOVE_PLAN_ITEM", payload: { tier, id } })}
          />
        );
      case 5:
        return (
          <VolcanoReport
            state={state}
            onReset={handleReset}
            inline
          />
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={state.currentStep}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          style={{ width: "100%", height: "100%" }}
        >
          <StepWrapper
            stepNumber={state.currentStep}
            totalSteps={6}
            title={step.title[state.ageMode]}
            subtitle={step.subtitle[state.ageMode]}
            icon={step.icon}
            ageMode={state.ageMode}
            canProceed={canProceed(state)}
            onNext={handleNext}
            onBack={handleBack}
            stepDef={step}
          >
            {renderStep()}
          </StepWrapper>
        </motion.div>
      </AnimatePresence>

      <FurtherReading
        references={DBT_EMOTION_REFERENCES}
        accentColor="rgba(224,96,64,0.6)"
        textColor="#f0e8d8"
      />
    </div>
  );
}
