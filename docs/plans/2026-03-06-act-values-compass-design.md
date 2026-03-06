# ACT Values Compass — Design Document

## Goal
An interactive expedition-themed ACT (Acceptance and Commitment Therapy) tool where clients map personal values across 6 life domains, identify willingness barriers, apply defusion techniques, and chart committed actions. Produces a visual "Expedition Map" artifact exportable as PNG.

## Architecture
React component suite following the same patterns as DBT House and CBT Thought Court: useReducer state machine, inline styles (not Tailwind), framer-motion animations, html2canvas for export. Child/Teen/Adult age mode selector adapts language throughout.

## Color Theme
- Background: `linear-gradient(170deg, #0f1a1f 0%, #152530 30%, #1a2a35 60%, #0d1820 100%)`
- Primary accent: Compass gold `#c9a84c`
- Secondary accent: Teal `#2d8a8a`
- Text: Parchment `#e8dcc8`

## 6 Life Domains
| Domain | SVG Icon Description | Color |
|--------|---------------------|-------|
| Relationships | Two overlapping hearts with connecting thread | `#e88a7a` coral |
| Work/School | Rising flame (ambition) | `#d4a24c` amber |
| Health | Rooted tree with branches | `#5ab88f` sage |
| Personal Growth | Mountain peak with flag | `#7c8ee0` periwinkle |
| Fun/Recreation | Spark/firework burst | `#e0a84c` golden |
| Community | Hands forming circle | `#6bc5c5` teal |

All domain icons are inline SVG paths — no emoji, no Lucide, no generic AI icons.

## Flow (8 Steps)

### Step -1: Welcome Screen
- Age mode selector (Child/Teen/Adult) with gold highlight toggle
- Expedition metaphor intro, age-adaptive language
- "Begin Expedition" button
- Review ACT overview accessible via popup

### Step 0 — Set Your Compass (Values)
- **ACT Process:** Values
- 6 domain cards in responsive 2x3 grid
- Each card: custom SVG icon, domain name, text input for 1-2 personal values
- Age-adaptive placeholder prompts
- Topographic contour texture on cards
- Small animated compass needle at top pointing to focused card

### Step 1 — Rate Your Course (Alignment)
- **ACT Process:** Values + Present Moment
- Circular arc gauge (0-10) per domain with domain icon at center
- Drag/tap to set alignment rating
- Domains rated ≤4 get amber glow ("needs attention")
- Summary showing well-served vs. underserved values

### Step 2 — Spot the Barriers (Acceptance)
- **ACT Process:** Acceptance
- Shows only domains rated ≤6
- Textarea per domain: describe internal barriers (thoughts/feelings/urges)
- Barrier cards with type tags: Thought (blue), Feeling (coral), Urge (amber)
- Age-adaptive prompts

### Step 3 — Unhook from Barriers (Defusion)
- **ACT Process:** Cognitive Defusion
- Each barrier shown one at a time in focused card
- Choose defusion technique:
  - "I notice I'm having the thought that..."
  - "My mind is telling me..."
  - Name the story ("There's the 'not good enough' story")
  - Child mode: silly voice / cartoon character voice prompt
- Before/after side by side display

### Step 4 — The Lookout Point (Mindfulness)
- **ACT Process:** Self-as-Context + Present Moment
- Visual scene: calm horizon with CSS-animated drifting clouds
- Each cloud carries one barrier text
- Guided prompt: "Watch these thoughts pass like clouds. You are the sky."
- "Continue" button appears after ~8 second pause
- Age-adaptive language

### Step 5 — Chart Your Course (Committed Action)
- **ACT Process:** Committed Action
- For each underserved domain, write 1 concrete action for this week
- Helper prompts for specificity (When? Where? First tiny step?)
- Actions appear as waypoints on mini trail visualization

### Step 6 — Expedition Map (Summary)
- Visual compass rose with 6 spokes (domain + values)
- Radar/spider chart showing alignment ratings
- Barriers with defusion reframes listed
- Committed actions as waypoints
- Case number + date
- Export PNG via html2canvas + "New Expedition" button

## Component Architecture
```
client/src/components/tools/act-values-compass/
  index.ts
  ACTValuesCompass.tsx      — orchestrator + useReducer
  WelcomeScreen.tsx         — intro + age selector
  ValuesMapping.tsx         — Step 0: domain value inputs
  AlignmentDial.tsx         — Step 1: circular gauges
  BarrierIdentification.tsx — Step 2: barrier inputs
  DefusionExercise.tsx      — Step 3: defusion techniques
  LookoutPoint.tsx          — Step 4: mindfulness clouds
  CommittedAction.tsx        — Step 5: action planning
  ExpeditionMap.tsx          — Step 6: summary + export
  StepWrapper.tsx            — shared layout wrapper
  compass-data.ts            — domains, prompts, SVG paths, colors
```

## State Shape
```typescript
type AgeMode = "child" | "teen" | "adult";
type BarrierType = "thought" | "feeling" | "urge";

interface DomainValues {
  domainId: string;
  values: string[];      // 1-2 personal values
  alignment: number;     // 0-10
}

interface Barrier {
  id: string;
  domainId: string;
  text: string;
  type: BarrierType;
  defusionTechnique: string;
  defusedText: string;
}

interface CommittedAction {
  domainId: string;
  action: string;
}

interface ExpeditionState {
  ageMode: AgeMode;
  currentStep: number;
  domains: DomainValues[];
  barriers: Barrier[];
  committedActions: CommittedAction[];
  isACTGuideOpen: boolean;
}
```

## Integration Points
1. `tools-library.ts` — ToolDefinition entry (ACT modality, all age ranges, gentle intensity)
2. `dashboard.tsx` — add to ALL_TOOLS
3. `tool-selector.tsx` — add with Compass icon, accentColor `#2d8a8a`, category "game"
4. `playroom.tsx` — conditional render block
5. `clinical-insights.tsx` — 8 ACT-specific clinical prompts

## Age Mode Language
- **Child ("Explorer"):** Playful, simple. "What matters most to you?" "What gets in the way?"
- **Teen ("Navigator"):** Direct, relatable. "What do you actually care about?" "What's stopping you?"
- **Adult ("Cartographer"):** Clinical ACT terms. "Identify your core values." "Describe your willingness barriers."
