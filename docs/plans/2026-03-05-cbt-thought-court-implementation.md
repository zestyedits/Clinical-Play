# CBT Thought Court - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an interactive courtroom-themed CBT cognitive restructuring tool with age-adaptive language, 12 cognitive distortions reference, and 9-step trial flow.

**Architecture:** React component suite under `client/src/components/tools/cbt-thought-court/`, using `useReducer` for state management, Framer Motion for animations, inline styles matching DBT House patterns. Integrates into existing playroom/dashboard/tool-selector/library systems.

**Tech Stack:** React 19, TypeScript, Framer Motion, html2canvas (for export), Zustand (audio store)

---

### Task 1: Scaffold main component + state reducer + index barrel

**Files:**
- Create: `client/src/components/tools/cbt-thought-court/index.ts`
- Create: `client/src/components/tools/cbt-thought-court/CBTThoughtCourt.tsx`

**Step 1: Create the index barrel**

```typescript
// client/src/components/tools/cbt-thought-court/index.ts
export { CBTThoughtCourt } from "./CBTThoughtCourt";
```

**Step 2: Create the main orchestrator with state reducer**

Create `client/src/components/tools/cbt-thought-court/CBTThoughtCourt.tsx` with:

- `AgeMode` type: `"child" | "teen" | "adult"`
- `TrialState` interface with all fields from the design doc
- `TrialAction` union type for reducer actions: `SET_AGE_MODE`, `START_TRIAL`, `SET_THOUGHT`, `SET_SITUATION`, `TOGGLE_DISTORTION`, `SET_INITIAL_BELIEF`, `ADD_EVIDENCE_FOR`, `REMOVE_EVIDENCE_FOR`, `ADD_EVIDENCE_AGAINST`, `REMOVE_EVIDENCE_AGAINST`, `SET_REFRAMED_THOUGHT`, `SET_FINAL_BELIEF`, `NEXT_STEP`, `PREV_STEP`, `TOGGLE_GUIDE`, `RESET_TRIAL`
- `trialReducer` function
- `CBTThoughtCourt` component that:
  - Uses `useReducer(trialReducer, initialState)`
  - Renders `WelcomeScreen` when `currentStep === -1` (not started)
  - Renders step components based on `currentStep` (0-8)
  - Includes a top header bar (dark background, title "The Thought Court", progress indicator, mute button) matching DBT House header pattern
  - Includes floating "Distortions Guide" button that dispatches `TOGGLE_GUIDE`
  - Wraps step content in `AnimatePresence` for transitions
  - Uses `useAudio` from `../../../lib/stores/useAudio` for sound effects

The overall container should use inline styles matching the DBT House pattern:
```typescript
style={{
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  background: "linear-gradient(170deg, #1a1520 0%, #2a2035 30%, #1e1a2e 60%, #15112a 100%)",
  fontFamily: "Inter, sans-serif",
  overflow: "hidden",
  position: "relative",
  borderRadius: 12,
}}
```

Use a deep purple/indigo courtroom palette instead of DBT House green.

**Step 3: Commit**

```bash
git add client/src/components/tools/cbt-thought-court/
git commit -m "feat: scaffold CBT Thought Court main component with state reducer"
```

---

### Task 2: Cognitive distortions data + DistortionsGuide popup

**Files:**
- Create: `client/src/components/tools/cbt-thought-court/distortions-data.ts`
- Create: `client/src/components/tools/cbt-thought-court/DistortionsGuide.tsx`

**Step 1: Create the distortions data file**

Create `distortions-data.ts` exporting a `COGNITIVE_DISTORTIONS` array of objects, each with:

```typescript
export interface CognitiveDistortion {
  id: string;
  name: string;
  icon: string;
  description: {
    child: string;
    teen: string;
    adult: string;
  };
  example: {
    child: string;
    teen: string;
    adult: string;
  };
  humor: {
    child: string;
    teen: string;
    adult: string;
  };
}
```

All 12 distortions with full content:

1. **all-or-nothing** - "All-or-Nothing Thinking"
   - Icon: "B&W" or target emoji
   - Child humor: "It's like saying if you can't eat the WHOLE pizza, you won't eat ANY pizza!"
   - Teen humor: "You got a 92 on the test? Might as well have failed, right? Your brain is literally in black-and-white mode"
   - Adult humor: "The world's most extreme binary thinker: 'If I'm not employee of the year, I must be getting fired'"

2. **overgeneralization** - "Overgeneralization"
   - Child humor: "One rainy day = 'It ALWAYS rains! It'll NEVER be sunny again!' Spoiler: the sun comes back"
   - Teen humor: "Got left on read once? 'Nobody EVER texts me back. I'm literally invisible.' Sample size: 1"
   - Adult humor: "Ah yes, the classic 'I burned dinner once, therefore I am a hazard to all kitchens worldwide'"

3. **mental-filter** - "Mental Filter"
   - Child humor: "It's like getting 10 gold stars and one sad face, and only seeing the sad face!"
   - Teen humor: "50 likes and one weird comment? Time to screenshot and obsess over just that one"
   - Adult humor: "Performance review: 12 positive points, 1 suggestion for improvement. Guess which one you'll think about at 3am?"

4. **disqualifying-positive** - "Disqualifying the Positive"
   - Child humor: "Someone says 'great job!' and your brain says 'they're just being nice.' Your brain is being a party pooper!"
   - Teen humor: "Got a compliment? Must be a prank. Good grade? The test was easy. Your brain is basically a compliment bouncer"
   - Adult humor: "Promotion? 'They just couldn't find anyone else.' Your brain runs a full-time operation discounting every good thing"

5. **jumping-to-conclusions** - "Jumping to Conclusions"
   - Child humor: "Your friend didn't wave at you, so obviously they hate you now and are best friends with someone else... or maybe they just didn't see you!"
   - Teen humor: "They left you on read for 10 minutes. They definitely hate you. OR... hear me out... they're in the shower"
   - Adult humor: "Boss says 'Can we talk tomorrow?' Your brain: 'I'm fired, I should start packing.' Actual topic: office birthday cake preferences"

6. **magnification-minimization** - "Magnification / Minimization"
   - Child humor: "Making your mistakes look HUGE like through a magnifying glass, but your wins look teeny-tiny!"
   - Teen humor: "Your mistake is on a billboard. Your accomplishment is in size 2 font at the bottom of page 47"
   - Adult humor: "One typo in a 50-page report = career-ending catastrophe. Completing the 50-page report = 'just doing my job'"

7. **emotional-reasoning** - "Emotional Reasoning"
   - Child humor: "Feeling scared doesn't mean the monster is real! Your feelings are real, but they're not always telling the truth"
   - Teen humor: "I FEEL stupid, therefore I AM stupid. That's like saying 'I feel like a potato, therefore I am a potato.' Feelings aren't facts!"
   - Adult humor: "I feel like a failure, ergo I have failed at everything. By that logic, I also feel like ordering pizza, so I must be a pizza"

8. **should-statements** - "Should Statements"
   - Child humor: "Should-ing all over yourself! 'I SHOULD be better, I SHOULD know this' -- says who??"
   - Teen humor: "'I should be studying' 'I should have more friends' 'I should be over this' -- congratulations, you just should'd yourself into feeling terrible"
   - Adult humor: "'I should be further along by now.' Ah yes, the life timeline that apparently everyone else got and you missed"

9. **labeling** - "Labeling"
   - Child humor: "Making one mistake and calling yourself 'a loser' is like dropping one cookie and calling yourself 'a cookie destroyer!'"
   - Teen humor: "Failed one test? Not 'I failed a test.' Nope, straight to 'I'm an idiot.' Your brain skipped a few steps there"
   - Adult humor: "Forgot an appointment? You're not 'someone who forgot an appointment.' You're now officially 'an unreliable person.' Thanks, brain"

10. **personalization** - "Personalization"
    - Child humor: "Your team lost the game and you think it's ALL your fault? Were you all 11 players?"
    - Teen humor: "Group chat went quiet after you texted? Must be YOUR fault specifically. Not that everyone went to dinner or anything"
    - Adult humor: "Your department had a bad quarter. You: 'This is clearly because of that one email I sent in March.' Main character syndrome, but make it anxious"

11. **catastrophizing** - "Catastrophizing"
    - Child humor: "Making a mountain out of a molehill -- like thinking one bad grade means you'll never learn anything ever!"
    - Teen humor: "Your brain's drama queen mode -- one bad text and suddenly nobody likes you and you'll be alone forever"
    - Adult humor: "The mental equivalent of reading WebMD at 2am -- a headache becomes a rare tropical disease, a missed deadline becomes homelessness"

12. **blame** - "Blame"
    - Child humor: "Blaming the dog for eating your homework... when you didn't do your homework! Or blaming yourself for the rain"
    - Teen humor: "Either 'everything is everyone else's fault' or 'everything is MY fault.' There's no in-between with this one"
    - Adult humor: "'My partner MADE me angry' or 'I ruined everyone's evening.' Plot twist: situations are usually more complex than one person's fault"

**Step 2: Create the DistortionsGuide component**

Create `DistortionsGuide.tsx`:
- Props: `isOpen: boolean`, `onClose: () => void`, `ageMode: AgeMode`
- Uses Framer Motion `AnimatePresence` for open/close
- Fixed overlay + centered modal (same pattern as DBT House PromptDialog)
- Header: "Cognitive Distortions Guide" with close button
- Scrollable list of all 12 distortions
- Each distortion card shows: icon, name, description (for selected age), example, humor quip
- Cards styled with subtle borders, hover effects
- Courtroom-themed styling (parchment/wood tones on dark background)
- Search/filter input at top (optional nice-to-have, can filter by name)

**Step 3: Commit**

```bash
git add client/src/components/tools/cbt-thought-court/distortions-data.ts client/src/components/tools/cbt-thought-court/DistortionsGuide.tsx
git commit -m "feat: add cognitive distortions data and guide popup with age-adaptive humor"
```

---

### Task 3: WelcomeScreen component

**Files:**
- Create: `client/src/components/tools/cbt-thought-court/WelcomeScreen.tsx`

**Step 1: Create WelcomeScreen**

Props: `onStart: () => void`, `ageMode: AgeMode`, `onSetAgeMode: (mode: AgeMode) => void`, `onOpenGuide: () => void`

Follow DBT House WelcomeScreen pattern (inline styles, dark gradient background, centered card):

- Large gavel emoji icon at top
- Title: "The Thought Court"
- Subtitle adapts by age:
  - Child: "Put your tricky thoughts on trial!"
  - Teen: "Challenge your negative thoughts in court"
  - Adult: "A structured approach to cognitive restructuring"
- Age mode selector: 3 toggle buttons (Child / Teen / Adult) styled as courtroom-style tabs
- Instruction card explaining the process (adapted by age):
  - Child: "Sometimes our brains play tricks on us! In this game, you'll be the judge. You'll put a tricky thought on trial, look at the evidence, and decide if it's really true."
  - Teen: "Ever notice your brain jumping to the worst conclusion? Here you'll put those thoughts on trial -- examine the evidence, find the distortions, and reframe."
  - Adult: "Cognitive restructuring is a core CBT technique. This tool guides you through identifying automatic thoughts, recognizing cognitive distortions, evaluating evidence, and developing balanced alternatives."
- "How it works" section with 4 key steps shown as mini cards in a 2x2 grid:
  - File the Case (enter thought)
  - Examine Evidence (for & against)
  - Reach a Verdict (weigh evidence)
  - Write the Appeal (reframe)
- "Review Cognitive Distortions" button (opens guide popup)
- "Begin Trial" primary action button

Style: Deep purple/indigo courtroom gradient, gold accent colors, wooden texture accents.

**Step 2: Wire WelcomeScreen into CBTThoughtCourt.tsx**

Update the main component to render WelcomeScreen when `currentStep === -1`, passing all required props.

**Step 3: Commit**

```bash
git add client/src/components/tools/cbt-thought-court/WelcomeScreen.tsx client/src/components/tools/cbt-thought-court/CBTThoughtCourt.tsx
git commit -m "feat: add Thought Court welcome screen with age selector and instructions"
```

---

### Task 4: ThoughtEntry (Step 1) + StepWrapper

**Files:**
- Create: `client/src/components/tools/cbt-thought-court/StepWrapper.tsx`
- Create: `client/src/components/tools/cbt-thought-court/ThoughtEntry.tsx`

**Step 1: Create StepWrapper**

A shared layout wrapper for all trial steps. Props: `stepNumber: number`, `title: string`, `subtitle: string`, `icon: string`, `children: React.ReactNode`, `onNext: () => void`, `onBack: () => void`, `canProceed: boolean`, `ageMode: AgeMode`, `totalSteps: number`

Renders:
- Step progress bar at top (9 dots/segments, current highlighted)
- Step title + icon + subtitle header area
- Scrollable content area (children)
- Bottom nav bar with Back and Next buttons
- Framer Motion entrance animations
- Courtroom-themed styling

**Step 2: Create ThoughtEntry**

Props: `thought: string`, `situation: string`, `onThoughtChange: (v: string) => void`, `onSituationChange: (v: string) => void`, `ageMode: AgeMode`

- "Filing a Case" header with gavel/scroll icon
- Textarea for the automatic thought with placeholder adapted by age:
  - Child: "What is the tricky thought? (e.g., 'Nobody likes me')"
  - Teen: "What's the negative thought? (e.g., 'I always mess everything up')"
  - Adult: "What is the automatic thought? (e.g., 'I'm not competent enough for this role')"
- Textarea for triggering situation with placeholder adapted by age:
  - Child: "What happened that made you think this?"
  - Teen: "What was going on when this thought popped up?"
  - Adult: "Describe the situation that triggered this thought"
- Styled as courtroom document/filing

**Step 3: Wire into main component**

Update `CBTThoughtCourt.tsx` to render ThoughtEntry inside StepWrapper when `currentStep === 0`. `canProceed` is true when both thought and situation are non-empty.

**Step 4: Commit**

```bash
git add client/src/components/tools/cbt-thought-court/StepWrapper.tsx client/src/components/tools/cbt-thought-court/ThoughtEntry.tsx client/src/components/tools/cbt-thought-court/CBTThoughtCourt.tsx
git commit -m "feat: add thought entry step with step wrapper layout"
```

---

### Task 5: DistortionPicker (Step 2)

**Files:**
- Create: `client/src/components/tools/cbt-thought-court/DistortionPicker.tsx`

**Step 1: Create DistortionPicker**

Props: `selectedDistortions: string[]`, `onToggle: (id: string) => void`, `ageMode: AgeMode`

- "The Charges" header
- Import `COGNITIVE_DISTORTIONS` from `distortions-data.ts`
- Render as a responsive grid of cards (2 cols on mobile, 3 on desktop)
- Each card shows: icon, distortion name, short description for age mode
- Cards toggle on click (selected = highlighted with gold border + checkmark)
- Selected cards show a "charged" badge
- Framer Motion scale animation on select
- Must select at least 1 to proceed

**Step 2: Wire into main component**

Render DistortionPicker in StepWrapper when `currentStep === 1`. `canProceed` when `selectedDistortions.length > 0`.

**Step 3: Commit**

```bash
git add client/src/components/tools/cbt-thought-court/DistortionPicker.tsx client/src/components/tools/cbt-thought-court/CBTThoughtCourt.tsx
git commit -m "feat: add distortion picker step for filing charges"
```

---

### Task 6: BeliefSlider (Steps 3 & 8)

**Files:**
- Create: `client/src/components/tools/cbt-thought-court/BeliefSlider.tsx`

**Step 1: Create BeliefSlider**

Props: `value: number`, `onChange: (v: number) => void`, `ageMode: AgeMode`, `isRerate?: boolean`, `originalBelief?: number`

- "Sworn Testimony" header (step 3) or "Final Testimony" (step 8 when `isRerate`)
- Custom styled range slider (0-100%) with courtroom gavel-style thumb
- Labels under slider adapted by age:
  - Child: "Don't believe it at all" ... "Believe it SO much"
  - Teen: "Not at all" ... "100% believe this"
  - Adult: "No belief (0%)" ... "Complete conviction (100%)"
- Large number display showing current value
- Color gradient from green (low belief) to red (high belief)
- When `isRerate`: show original belief as a ghost marker on the slider, with before/after comparison text
- Framer Motion number animation on value change

**Step 2: Wire into main component**

Render BeliefSlider in StepWrapper for `currentStep === 2` (initial belief) and `currentStep === 7` (re-rate). Always `canProceed = true` (slider has a default value).

**Step 3: Commit**

```bash
git add client/src/components/tools/cbt-thought-court/BeliefSlider.tsx client/src/components/tools/cbt-thought-court/CBTThoughtCourt.tsx
git commit -m "feat: add belief rating slider for testimony steps"
```

---

### Task 7: EvidenceBoard (Steps 4 & 5)

**Files:**
- Create: `client/src/components/tools/cbt-thought-court/EvidenceBoard.tsx`

**Step 1: Create EvidenceBoard**

Props: `side: "prosecution" | "defense"`, `evidence: string[]`, `onAdd: (text: string) => void`, `onRemove: (index: number) => void`, `ageMode: AgeMode`, `originalThought: string`

- "The Prosecution" or "The Defense" header with appropriate icon
- Color theme: warm reds/oranges for prosecution, cool greens/blues for defense
- Shows the original thought at top as reference
- Text input + "Add Evidence" button to add items
- Each evidence item renders as a card/document on a "courtroom table"
- Cards have a remove button (X)
- Framer Motion layout animations when cards are added/removed
- Helper prompt suggestions adapted by age and side:
  - Prosecution (child): "What makes you think this thought might be true?"
  - Defense (child): "What makes you think this thought might NOT be true? What would your best friend say?"
  - Prosecution (teen): "What evidence supports this thought?"
  - Defense (teen): "What evidence goes against it? What would you tell a friend who thought this?"
  - Prosecution (adult): "What facts support this automatic thought?"
  - Defense (adult): "What contradicts this thought? Consider alternative explanations."
- Must add at least 1 evidence item to proceed

**Step 2: Wire into main component**

Render EvidenceBoard for `currentStep === 3` (prosecution, evidenceFor) and `currentStep === 4` (defense, evidenceAgainst). `canProceed` when the respective evidence array has at least 1 item.

**Step 3: Commit**

```bash
git add client/src/components/tools/cbt-thought-court/EvidenceBoard.tsx client/src/components/tools/cbt-thought-court/CBTThoughtCourt.tsx
git commit -m "feat: add evidence board for prosecution and defense phases"
```

---

### Task 8: VerdictReveal (Step 6)

**Files:**
- Create: `client/src/components/tools/cbt-thought-court/VerdictReveal.tsx`

**Step 1: Create VerdictReveal**

Props: `evidenceFor: string[]`, `evidenceAgainst: string[]`, `originalThought: string`, `ageMode: AgeMode`

- "The Verdict" header
- Animated scales of justice visualization:
  - Two sides (prosecution vs defense) with evidence count
  - Scale tips toward the side with more evidence
  - Use CSS/SVG for the balance scale, animated with Framer Motion
- Gavel strike animation on mount (Framer Motion + `useAudio().playSuccess()`)
- Verdict text based on evidence balance:
  - More defense evidence: "The evidence suggests this thought may not be entirely accurate"
  - More prosecution evidence: "The thought has some supporting evidence, but let's see if we can find a more balanced perspective"
  - Equal: "The evidence is mixed -- let's look for a more balanced way to think about this"
  - Adapt language by age mode
- Display both evidence lists side by side for visual comparison
- This is a display-only step, always `canProceed = true`

**Step 2: Wire into main component**

Render VerdictReveal for `currentStep === 5`.

**Step 3: Commit**

```bash
git add client/src/components/tools/cbt-thought-court/VerdictReveal.tsx client/src/components/tools/cbt-thought-court/CBTThoughtCourt.tsx
git commit -m "feat: add animated verdict reveal with scales of justice"
```

---

### Task 9: ReframeStation (Step 7)

**Files:**
- Create: `client/src/components/tools/cbt-thought-court/ReframeStation.tsx`

**Step 1: Create ReframeStation**

Props: `originalThought: string`, `reframedThought: string`, `onChange: (v: string) => void`, `ageMode: AgeMode`, `selectedDistortions: string[]`

- "The Appeal" header with scroll/pen icon
- Shows original thought in a "struck through" or faded card
- Shows which distortions were identified (as small badges)
- Textarea for the reframed/balanced thought
- Placeholder adapted by age:
  - Child: "What's a kinder, more true way to think about this?"
  - Teen: "Rewrite the thought in a way that's more fair and balanced"
  - Adult: "Formulate a balanced alternative thought that accounts for the evidence"
- Helper prompts in a collapsible section:
  - "What would you tell a friend who had this thought?"
  - "What's the most realistic outcome?"
  - "Is there a middle ground between your worst fear and best case?"
- `canProceed` when reframedThought is non-empty

**Step 2: Wire into main component**

Render ReframeStation for `currentStep === 6`.

**Step 3: Commit**

```bash
git add client/src/components/tools/cbt-thought-court/ReframeStation.tsx client/src/components/tools/cbt-thought-court/CBTThoughtCourt.tsx
git commit -m "feat: add reframe station for writing balanced alternative thoughts"
```

---

### Task 10: CaseFileSummary (Step 9)

**Files:**
- Create: `client/src/components/tools/cbt-thought-court/CaseFileSummary.tsx`

**Step 1: Create CaseFileSummary**

Props: `state: TrialState`, `onNewTrial: () => void`

- "Case File" header styled as official court document
- Sections:
  1. Original Thought & Situation
  2. Charges (distortions identified) as badges
  3. Initial Belief Rating (with visual bar)
  4. Evidence For (prosecution list)
  5. Evidence Against (defense list)
  6. Verdict summary
  7. Reframed Thought (highlighted, prominent)
  8. Final Belief Rating with before/after comparison (show the shift!)
- Styled as a parchment/document with court stamps
- "Save Case File" button: uses `html2canvas` to capture and download as image (same pattern as DBT House snapshot feature in playroom)
- "New Trial" button: dispatches `RESET_TRIAL` and goes back to welcome
- Celebratory animation if belief decreased significantly (confetti-like)

**Step 2: Wire into main component**

Render CaseFileSummary for `currentStep === 8`. This is the final step, no Next button in StepWrapper (or hide StepWrapper and render CaseFileSummary directly with its own layout).

**Step 3: Commit**

```bash
git add client/src/components/tools/cbt-thought-court/CaseFileSummary.tsx client/src/components/tools/cbt-thought-court/CBTThoughtCourt.tsx
git commit -m "feat: add case file summary with export and belief shift visualization"
```

---

### Task 11: Integration - Register tool in all systems

**Files:**
- Modify: `client/src/lib/mock-data/tools-library.ts`
- Modify: `client/src/pages/dashboard.tsx:25-27` (ALL_TOOLS array)
- Modify: `client/src/components/tools/tool-selector.tsx:18-20` (TOOLS array)
- Modify: `client/src/pages/playroom.tsx:11,604-608` (import + render)
- Modify: `client/src/components/tools/clinical-insights.tsx:20-34` (TOOL_PROMPTS)

**Step 1: Add to tools-library.ts**

Add to `TOOLS_LIBRARY` array:
```typescript
{
  id: "cbt-thought-court",
  name: "The Thought Court",
  shortDescription: "Put negative thoughts on trial using CBT cognitive restructuring",
  longDescription: "An interactive courtroom-themed CBT tool where clients put automatic negative thoughts on trial. Features age-adaptive language (Child/Teen/Adult), a 12-distortion reference guide with humor, and a 9-step guided flow: enter the thought, identify distortions, rate belief, examine evidence for and against, receive a verdict, reframe the thought, and re-rate belief. Produces a visual 'Case File' summary.",
  icon: "\u2696\ufe0f",
  category: "game",
  modalities: ["CBT", "Psychoeducation", "Play Therapy"],
  ageRanges: ["Children (5-11)", "Tweens (11-14)", "Teens (14-18)", "Young Adults (18-25)", "Adults (25-64)", "Older Adults (65+)"],
  intensity: "moderate",
  duration: "15-30",
  interactionType: "cognitive",
  status: "active",
  tier: "free",
  bestUsedFor: [
    "Teaching clients to identify and challenge cognitive distortions",
    "Structured cognitive restructuring for automatic negative thoughts",
    "Psychoeducation about the 12 common thinking errors",
    "Building evidence-based thinking skills across age groups",
    "Engaging reluctant clients through gamified CBT techniques",
  ],
  adaptations: "Child mode uses playful language, bright visuals, and simple prompts. Teen mode adds subtle humor and modern aesthetics. Adult mode provides clinical language and professional framing. The Distortions Guide popup is always accessible for reference.",
  pitfalls: "Don't rush through the evidence phases -- these are where the therapeutic work happens. Some clients may struggle to generate counter-evidence; use the helper prompts. The verdict is not prescriptive -- it reflects what the client entered, so validate their experience regardless of outcome.",
  safetyNotes: "Thoughts about self-harm or suicidal ideation may surface during the thought entry step. Be prepared to pivot to safety planning. The tool is for guided clinical use, not self-administered therapy. The reframe step should not invalidate the client's emotional experience.",
  producesArtifact: true,
  lastUsed: null,
  timesUsed: 0,
},
```

**Step 2: Add to dashboard.tsx ALL_TOOLS**

Add after the dbt-house entry:
```typescript
{ id: "cbt-thought-court", label: "The Thought Court", desc: "Put negative thoughts on trial using CBT cognitive restructuring", icon: Scale, tier: "free", emoji: "\u2696\ufe0f" },
```

Import `Scale` from `lucide-react` (add to existing import).

**Step 3: Add to tool-selector.tsx TOOLS**

Add after the dbt-house entry:
```typescript
{ id: "cbt-thought-court", label: "The Thought Court", desc: "Put negative thoughts on trial using CBT cognitive restructuring", icon: Scale, status: "active", accentColor: "#7c5cbf", iconClass: "icon-cbt-court", category: "game" },
```

Import `Scale` from `lucide-react`.

**Step 4: Add to playroom.tsx**

Add import at top:
```typescript
import { CBTThoughtCourt } from "@/components/tools/cbt-thought-court";
```

Add conditional render after the dbt-house block (~line 608):
```typescript
{activeTool === "cbt-thought-court" && (
  <motion.div key="cbt-thought-court" className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2, ease: "easeOut" }}>
    <CBTThoughtCourt />
  </motion.div>
)}
```

**Step 5: Add clinical insights prompts**

Add to `TOOL_PROMPTS` in clinical-insights.tsx:
```typescript
"cbt-thought-court": {
  title: "Thought Court Prompts",
  prompts: [
    { text: "Which cognitive distortion did the client identify most quickly? What does that tell you?", modality: "CBT" },
    { text: "Was the client able to generate counter-evidence independently, or did they need support?", modality: "CBT" },
    { text: "How did the belief rating shift from before to after? Explore what drove the change.", modality: "CBT" },
    { text: "Did the client resist any part of the process? That resistance itself is clinically meaningful.", modality: "Psychodynamic" },
    { text: "Notice the language the client used in their reframe -- does it feel genuinely balanced or performatively positive?", modality: "CBT" },
    { text: "Which distortions from the guide resonated most? Consider assigning distortion-tracking homework.", modality: "CBT" },
    { text: "How did the courtroom metaphor land? Did the client engage with the playfulness or find it uncomfortable?", modality: "Play Therapy" },
    { text: "Consider the body language when the verdict was revealed. What somatic responses did you observe?", modality: "Somatic" },
  ],
},
```

**Step 6: Commit**

```bash
git add client/src/lib/mock-data/tools-library.ts client/src/pages/dashboard.tsx client/src/components/tools/tool-selector.tsx client/src/pages/playroom.tsx client/src/components/tools/clinical-insights.tsx
git commit -m "feat: integrate CBT Thought Court into all tool registries and playroom"
```

---

### Task 12: Visual polish and final testing

**Files:**
- Modify: Various files in `client/src/components/tools/cbt-thought-court/`

**Step 1: Test the full flow**

Run the dev server and navigate through all 9 steps manually:
```bash
cd /home/runner/workspace && npm run dev
```

Verify:
- Welcome screen renders with age selector
- Age mode toggle works and changes language
- Distortions Guide opens/closes at every step
- All 9 steps navigate correctly (next/back)
- Progress indicator updates
- Evidence can be added/removed
- Verdict scale animates
- Case File summary shows all data
- Export (screenshot) works
- New Trial resets everything
- Tool appears in dashboard, tool selector, and library

**Step 2: Fix any visual/functional issues found**

**Step 3: Commit final polish**

```bash
git add -A
git commit -m "feat: complete CBT Thought Court with visual polish and full flow testing"
```
