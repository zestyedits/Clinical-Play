# CBT Thought Court - Design Document

## Overview

An interactive courtroom-themed CBT tool where clients put negative automatic thoughts "on trial." Features age-adaptive language (Child/Teen/Adult toggle), a 12-distortion reference guide with humor, and a 9-step guided trial flow. Built as a full React component suite within the ClinicalPlay architecture.

## Component Structure

```
/components/tools/cbt-thought-court/
  CBTThoughtCourt.tsx        Main orchestrator, state machine
  WelcomeScreen.tsx          Instructions + age selector
  DistortionsGuide.tsx       Reference popup, all 12 distortions
  ThoughtEntry.tsx           Step 1: enter thought + situation
  DistortionPicker.tsx       Step 2: identify distortion(s)
  BeliefSlider.tsx           Steps 3 & 8: rate/re-rate belief
  EvidenceBoard.tsx          Steps 4 & 5: prosecution/defense
  VerdictReveal.tsx          Step 6: animated verdict + scale
  ReframeStation.tsx         Step 7: write balanced thought
  CaseFileSummary.tsx        Step 9: recap + export
```

## State Design

Local component state via useReducer. Single `trialState` object:

- `ageMode`: "child" | "teen" | "adult"
- `currentStep`: 0-8
- `originalThought`, `situation`: string
- `selectedDistortions`: string[]
- `initialBelief`, `finalBelief`: number (0-100)
- `evidenceFor`: string[]
- `evidenceAgainst`: string[]
- `reframedThought`: string
- `isDistortionsGuideOpen`: boolean

No database tables needed initially (session-local like DBT House).

## Screen Flow

### Welcome Screen
- Courtroom-themed intro with age selector (Child/Teen/Adult toggle)
- Brief explanation of cognitive distortions and how the trial works
- "Review Cognitive Distortions" button opens DistortionsGuide popup
- "Begin Trial" button starts Step 1
- Language adapts per age mode

### Distortions Guide Popup (accessible at any step)
- Modal with all 12 distortions
- Each shows: name, brief description, example, age-appropriate humorous quip
- Floating button always accessible during trial

### 12 Cognitive Distortions

1. All-or-Nothing Thinking
2. Overgeneralization
3. Mental Filter
4. Disqualifying the Positive
5. Jumping to Conclusions (Mind Reading / Fortune Telling)
6. Magnification / Minimization
7. Emotional Reasoning
8. Should Statements
9. Labeling
10. Personalization
11. Catastrophizing
12. Blame

Each distortion has three humor variants (child/teen/adult).

### Step 1 - Enter the Thought (The Accusation)
- Courtroom "filing a case" visual
- Text input for automatic thought
- Text input for triggering situation
- Age-adapted prompt examples

### Step 2 - Identify the Distortion (The Charges)
- Grid/card layout of all 12 distortions
- Multi-select with highlight as "charges filed"

### Step 3 - Rate Belief (Sworn Testimony)
- Animated slider 0-100%
- Visual gauge with labels
- Gavel-themed marker

### Step 4 - Evidence FOR (The Prosecution)
- Add evidence items as cards
- Red/warm tones
- Courtroom table visual

### Step 5 - Evidence AGAINST (The Defense)
- Same mechanic, green/cool tones
- Helper prompts for counter-evidence

### Step 6 - The Verdict
- Animated scale weighing both sides
- Gavel animation + sound effect
- Verdict text based on evidence balance

### Step 7 - Reframe (The Appeal)
- Text area for balanced thought
- Original thought shown for reference
- Helper prompts adapted by age

### Step 8 - Re-rate Belief
- Same slider, shows original rating for comparison
- Visual before/after

### Step 9 - Case File Summary
- Full visual recap styled as court document
- Export via html2canvas
- "New Trial" button

## Visual Design

- Courtroom theme: wooden textures, gavel iconography, scales of justice
- Age-adaptive styling:
  - Child: Bright colors, rounded shapes, cartoon elements, larger text
  - Teen: Modern/sleek, subtle humor, emoji-friendly, muted aesthetic
  - Adult: Professional, clean, traditional courtroom feel
- Framer Motion for step transitions, gavel strike, scale tipping
- Progress indicator for 9-step flow
- Floating "Distortions Guide" button always accessible

## Integration Points

1. tools-library.ts - Add "cbt-thought-court" entry
2. playroom.tsx - Conditional render for activeTool === "cbt-thought-court"
3. tool-selector.tsx - Add to tool list
4. dashboard.tsx - Add to ALL_TOOLS array
5. clinical-insights.tsx - Add CBT-specific therapeutic prompts
