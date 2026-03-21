import { useReducer } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAudio } from "../../../lib/stores/useAudio";
import type { AgeMode, SpeechBubble, ExceptionStar, Strength } from "./quest-data";
import { STEP_CONFIGS } from "./quest-data";
import { WelcomeScreen } from "./WelcomeScreen";
import { StepWrapper } from "./StepWrapper";
import { ExternalizeStep } from "./ExternalizeStep";
import { SpeechBubbles } from "./SpeechBubbles";
import { ExceptionStars } from "./ExceptionStars";
import { StrengthsFinder } from "./StrengthsFinder";
import { RewriteStep } from "./RewriteStep";
import { StorySummary } from "./StorySummary";
import { FurtherReading } from "../shared/FurtherReading";
import { NARRATIVE_REFERENCES } from "../shared/references-data";

export interface QuestState {
  ageMode: AgeMode;
  currentStep: number;
  problemDescription: string;
  problemName: string;
  characterEmoji: string;
  characterColor: string;
  characterTraits: string[];
  speechBubbles: SpeechBubble[];
  exceptionStars: ExceptionStar[];
  strengths: Strength[];
  rewrittenStory: string;
}

export type QuestAction =
  | { type: "SET_AGE_MODE"; payload: AgeMode }
  | { type: "START_QUEST" }
  | { type: "SET_PROBLEM_DESCRIPTION"; payload: string }
  | { type: "SET_PROBLEM_NAME"; payload: string }
  | { type: "SET_CHARACTER_EMOJI"; payload: string }
  | { type: "SET_CHARACTER_COLOR"; payload: string }
  | { type: "TOGGLE_CHARACTER_TRAIT"; payload: string }
  | { type: "ADD_BUBBLE"; text: string; category: SpeechBubble["category"] }
  | { type: "REMOVE_BUBBLE"; payload: string }
  | { type: "ADD_STAR"; payload: string }
  | { type: "REMOVE_STAR"; payload: string }
  | { type: "ADD_STRENGTH"; text: string; emoji: string }
  | { type: "REMOVE_STRENGTH"; payload: string }
  | { type: "SET_REWRITE"; payload: string }
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "RESET" };

const createInitialState = (): QuestState => ({
  ageMode: "adult",
  currentStep: -1,
  problemDescription: "",
  problemName: "",
  characterEmoji: "👹",
  characterColor: "purple",
  characterTraits: [],
  speechBubbles: [],
  exceptionStars: [],
  strengths: [],
  rewrittenStory: "",
});

function questReducer(state: QuestState, action: QuestAction): QuestState {
  switch (action.type) {
    case "SET_AGE_MODE":
      return { ...state, ageMode: action.payload };

    case "START_QUEST":
      return { ...state, currentStep: 0 };

    case "SET_PROBLEM_DESCRIPTION":
      return { ...state, problemDescription: action.payload };

    case "SET_PROBLEM_NAME":
      return { ...state, problemName: action.payload };

    case "SET_CHARACTER_EMOJI":
      return { ...state, characterEmoji: action.payload };

    case "SET_CHARACTER_COLOR":
      return { ...state, characterColor: action.payload };

    case "TOGGLE_CHARACTER_TRAIT": {
      const trait = action.payload;
      const exists = state.characterTraits.includes(trait);
      return {
        ...state,
        characterTraits: exists
          ? state.characterTraits.filter((t) => t !== trait)
          : [...state.characterTraits, trait],
      };
    }

    case "ADD_BUBBLE": {
      const newBubble: SpeechBubble = {
        id: `b-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        text: action.text,
        category: action.category,
      };
      return { ...state, speechBubbles: [...state.speechBubbles, newBubble] };
    }

    case "REMOVE_BUBBLE":
      return { ...state, speechBubbles: state.speechBubbles.filter((b) => b.id !== action.payload) };

    case "ADD_STAR": {
      const newStar: ExceptionStar = {
        id: `s-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        text: action.payload,
      };
      return { ...state, exceptionStars: [...state.exceptionStars, newStar] };
    }

    case "REMOVE_STAR":
      return { ...state, exceptionStars: state.exceptionStars.filter((s) => s.id !== action.payload) };

    case "ADD_STRENGTH": {
      const newStrength: Strength = {
        id: `st-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        text: action.text,
        emoji: action.emoji,
      };
      return { ...state, strengths: [...state.strengths, newStrength] };
    }

    case "REMOVE_STRENGTH":
      return { ...state, strengths: state.strengths.filter((s) => s.id !== action.payload) };

    case "SET_REWRITE":
      return { ...state, rewrittenStory: action.payload };

    case "NEXT_STEP":
      return { ...state, currentStep: Math.min(state.currentStep + 1, 5) };

    case "PREV_STEP":
      return { ...state, currentStep: Math.max(state.currentStep - 1, 0) };

    case "RESET":
      return { ...createInitialState(), ageMode: state.ageMode };

    default:
      return state;
  }
}

export function NarrativeQuest() {
  const [state, dispatch] = useReducer(questReducer, undefined, createInitialState);
  const { isMuted, toggleMute } = useAudio();

  const stepConfig = STEP_CONFIGS[state.currentStep] || STEP_CONFIGS[0];
  const handleNext = () => dispatch({ type: "NEXT_STEP" });
  const handleBack = () => dispatch({ type: "PREV_STEP" });

  const canProceed = (() => {
    switch (state.currentStep) {
      case 0:
        return state.problemDescription.trim().length > 0 && state.problemName.trim().length > 0;
      case 1: {
        const categories = new Set(state.speechBubbles.map((b) => b.category));
        return categories.has("shows-up") && categories.has("whispers") && categories.has("loudest");
      }
      case 2:
        return state.exceptionStars.length > 0;
      case 3:
        return state.strengths.length > 0;
      case 4:
        return state.rewrittenStory.trim().length > 0;
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
          <ExternalizeStep
            problemDescription={state.problemDescription}
            problemName={state.problemName}
            characterEmoji={state.characterEmoji}
            characterColor={state.characterColor}
            characterTraits={state.characterTraits}
            onDescriptionChange={(v) => dispatch({ type: "SET_PROBLEM_DESCRIPTION", payload: v })}
            onNameChange={(v) => dispatch({ type: "SET_PROBLEM_NAME", payload: v })}
            onEmojiChange={(v) => dispatch({ type: "SET_CHARACTER_EMOJI", payload: v })}
            onColorChange={(v) => dispatch({ type: "SET_CHARACTER_COLOR", payload: v })}
            onToggleTrait={(id) => dispatch({ type: "TOGGLE_CHARACTER_TRAIT", payload: id })}
            ageMode={state.ageMode}
          />
        );
      case 1:
        return (
          <SpeechBubbles
            problemName={state.problemName}
            characterEmoji={state.characterEmoji}
            characterColor={state.characterColor}
            bubbles={state.speechBubbles}
            onAdd={(text, category) => dispatch({ type: "ADD_BUBBLE", text, category })}
            onRemove={(id) => dispatch({ type: "REMOVE_BUBBLE", payload: id })}
            ageMode={state.ageMode}
          />
        );
      case 2:
        return (
          <ExceptionStars
            problemName={state.problemName}
            characterEmoji={state.characterEmoji}
            stars={state.exceptionStars}
            onAdd={(text) => dispatch({ type: "ADD_STAR", payload: text })}
            onRemove={(id) => dispatch({ type: "REMOVE_STAR", payload: id })}
            ageMode={state.ageMode}
          />
        );
      case 3:
        return (
          <StrengthsFinder
            strengths={state.strengths}
            onAdd={(text, emoji) => dispatch({ type: "ADD_STRENGTH", text, emoji })}
            onRemove={(id) => dispatch({ type: "REMOVE_STRENGTH", payload: id })}
            ageMode={state.ageMode}
          />
        );
      case 4:
        return (
          <RewriteStep
            problemName={state.problemName}
            characterEmoji={state.characterEmoji}
            characterColor={state.characterColor}
            strengths={state.strengths}
            rewrittenStory={state.rewrittenStory}
            onChange={(v) => dispatch({ type: "SET_REWRITE", payload: v })}
            ageMode={state.ageMode}
          />
        );
      default:
        return null;
    }
  };

  if (state.currentStep === -1) {
    return (
      <div
        data-testid="tool-narrative-quest"
        style={{ width: "100%", height: "100%", position: "relative" }}
      >
        <WelcomeScreen
          onStart={() => dispatch({ type: "START_QUEST" })}
          ageMode={state.ageMode}
          onSetAgeMode={(mode) => dispatch({ type: "SET_AGE_MODE", payload: mode })}
        />
      </div>
    );
  }

  if (state.currentStep === 5) {
    return (
      <div
        data-testid="tool-narrative-quest"
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(170deg, #fdfaf5 0%, #f3ebe0 30%, #eadfd2 60%, #e2d5c8 100%)",
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
            background: "rgba(255, 252, 248, 0.92)",
            borderBottom: "1px solid rgba(180, 140, 80, 0.22)",
            zIndex: 10,
            flexShrink: 0,
            backdropFilter: "blur(10px)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>📖</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#3a3228", lineHeight: 1.2 }}>
                The Narrative Quest
              </div>
              <div style={{ fontSize: 10, color: "rgba(58, 48, 38, 0.55)" }}>
                Story Complete
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <FurtherReading
              references={NARRATIVE_REFERENCES}
              accentColor="rgba(180,140,80,0.6)"
              textColor="#3a3228"
              bgColor="rgba(255,252,248,0.98)"
            />
            <button
              type="button"
              onClick={toggleMute}
              data-testid="button-nq-mute"
              style={{
                background: "rgba(58, 48, 38, 0.06)",
                border: "1px solid rgba(180, 140, 80, 0.22)",
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
              {isMuted ? "🔇" : "🔊"}
            </button>
          </div>
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: "16px clamp(12px, 3vw, 24px)" }}>
          <div style={{ maxWidth: 660, margin: "0 auto", width: "100%" }}>
          <StorySummary
            ageMode={state.ageMode}
            problemDescription={state.problemDescription}
            problemName={state.problemName}
            characterEmoji={state.characterEmoji}
            characterColor={state.characterColor}
            characterTraits={state.characterTraits}
            bubbles={state.speechBubbles}
            stars={state.exceptionStars}
            strengths={state.strengths}
            rewrittenStory={state.rewrittenStory}
            onNewQuest={() => dispatch({ type: "RESET" })}
          />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid="tool-narrative-quest"
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(170deg, #fdfaf5 0%, #f3ebe0 30%, #eadfd2 60%, #e2d5c8 100%)",
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
          background: "rgba(255, 252, 248, 0.92)",
          borderBottom: "1px solid rgba(180, 140, 80, 0.22)",
          zIndex: 10,
          flexShrink: 0,
          backdropFilter: "blur(10px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>📖</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#3a3228", lineHeight: 1.2 }}>
              The Narrative Quest
            </div>
            <div style={{ fontSize: 10, color: "rgba(58, 48, 38, 0.55)" }}>
              Step {state.currentStep + 1} of {STEP_CONFIGS.length} &mdash; {stepConfig.label}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <FurtherReading
            references={NARRATIVE_REFERENCES}
            accentColor="rgba(180,140,80,0.6)"
            textColor="#3a3228"
            bgColor="rgba(255,252,248,0.98)"
          />
          <button
            type="button"
            onClick={toggleMute}
            data-testid="button-nq-mute"
            style={{
              background: "rgba(58, 48, 38, 0.06)",
              border: "1px solid rgba(180, 140, 80, 0.22)",
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
            {isMuted ? "🔇" : "🔊"}
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
