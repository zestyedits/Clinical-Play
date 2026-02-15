export interface CognitiveDistortion {
  id: string;
  label: string;
  description: string;
  example: string;
}

export const COGNITIVE_DISTORTIONS: CognitiveDistortion[] = [
  {
    id: "all-or-nothing",
    label: "All-or-Nothing Thinking",
    description: "Seeing things in black-and-white categories with no middle ground.",
    example: "If I'm not perfect, I'm a total failure.",
  },
  {
    id: "overgeneralization",
    label: "Overgeneralization",
    description: "Seeing a single negative event as a never-ending pattern of defeat.",
    example: "I failed this test, so I'll never pass anything.",
  },
  {
    id: "mental-filter",
    label: "Mental Filter",
    description: "Dwelling on a single negative detail so that it darkens all of reality.",
    example: "One person criticized my work, so the whole project is ruined.",
  },
  {
    id: "disqualifying-positive",
    label: "Disqualifying the Positive",
    description: "Rejecting positive experiences by insisting they don't count.",
    example: "They only said that to be nice -- it doesn't mean anything.",
  },
  {
    id: "jumping-to-conclusions",
    label: "Jumping to Conclusions",
    description: "Making negative interpretations without definite facts.",
    example: "They didn't text back -- they must be upset with me.",
  },
  {
    id: "magnification",
    label: "Magnification / Minimization",
    description: "Exaggerating the importance of negatives or shrinking the importance of positives.",
    example: "My mistake was catastrophic, but my achievements don't matter.",
  },
  {
    id: "emotional-reasoning",
    label: "Emotional Reasoning",
    description: "Assuming that negative feelings reflect the way things really are.",
    example: "I feel hopeless, so my situation must really be hopeless.",
  },
  {
    id: "should-statements",
    label: "Should Statements",
    description: "Using 'should', 'must', or 'ought to' statements that create unrealistic expectations.",
    example: "I should always be strong and never show weakness.",
  },
  {
    id: "labeling",
    label: "Labeling",
    description: "Attaching a fixed, global label to yourself or others instead of describing the behavior.",
    example: "I'm a loser. He's a jerk.",
  },
  {
    id: "personalization",
    label: "Personalization",
    description: "Seeing yourself as the cause of a negative event you weren't primarily responsible for.",
    example: "My child got a bad grade -- I must be a terrible parent.",
  },
  {
    id: "catastrophizing",
    label: "Catastrophizing",
    description: "Expecting the worst possible outcome in every situation.",
    example: "If I make a mistake at work, I'll definitely get fired.",
  },
  {
    id: "mind-reading",
    label: "Mind Reading",
    description: "Believing you know what others are thinking without evidence.",
    example: "Everyone at the party thought I was boring.",
  },
  {
    id: "fortune-telling",
    label: "Fortune Telling",
    description: "Predicting things will turn out badly before they happen.",
    example: "There's no point in applying -- I won't get the job.",
  },
  {
    id: "blame",
    label: "Blame",
    description: "Holding other people entirely responsible for your pain, or blaming yourself for everything.",
    example: "It's all their fault I feel this way.",
  },
];
