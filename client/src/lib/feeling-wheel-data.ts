/**
 * Feeling Wheel — 3-Tier Emotion Hierarchy
 *
 * 8 primary emotions → 4-6 secondaries each → 2-4 tertiaries each
 * ~170 total emotions across all tiers.
 *
 * Colors use warm/cool psychology:
 *   Joy = warm gold, Sadness = cool blue, Anger = fiery red,
 *   Fear = deep purple, Disgust = muted green, Surprise = electric amber,
 *   Love = rose pink, Shame = dusky mauve
 */

export interface TertiaryEmotion {
  id: string;
  label: string;
  emoji: string;
}

export interface SecondaryEmotion {
  id: string;
  label: string;
  emoji: string;
  tertiaries: TertiaryEmotion[];
  /** Clarifying question shown when this secondary is selected */
  question: string;
}

export interface PrimaryEmotion {
  id: string;
  label: string;
  emoji: string;
  color: string;          // hex accent
  gradient: string;       // tailwind gradient classes
  secondaries: SecondaryEmotion[];
  /** Clarifying question shown when this primary is selected */
  question: string;
}

export const EMOTIONS: PrimaryEmotion[] = [
  {
    id: "joy",
    label: "Joy",
    emoji: "\u{1F60A}",
    color: "#f59e0b",
    gradient: "from-amber-400 to-yellow-500",
    question: "What kind of joy are you feeling? Is it calm and content, or bright and excited?",
    secondaries: [
      {
        id: "joy-happy", label: "Happy", emoji: "\u{1F604}",
        question: "What shade of happiness is this? Playful, grateful, or something else?",
        tertiaries: [
          { id: "joy-happy-playful", label: "Playful", emoji: "\u{1F938}" },
          { id: "joy-happy-content", label: "Content", emoji: "\u{263A}\uFE0F" },
          { id: "joy-happy-cheerful", label: "Cheerful", emoji: "\u{1F31E}" },
        ],
      },
      {
        id: "joy-grateful", label: "Grateful", emoji: "\u{1F64F}",
        question: "Is this gratitude directed at someone specific, or a broader feeling of thankfulness?",
        tertiaries: [
          { id: "joy-grateful-thankful", label: "Thankful", emoji: "\u{1F49B}" },
          { id: "joy-grateful-appreciative", label: "Appreciative", emoji: "\u{2728}" },
          { id: "joy-grateful-blessed", label: "Blessed", emoji: "\u{1F31F}" },
        ],
      },
      {
        id: "joy-proud", label: "Proud", emoji: "\u{1F4AA}",
        question: "What are you proud of? Is it something you did, or something about who you are?",
        tertiaries: [
          { id: "joy-proud-accomplished", label: "Accomplished", emoji: "\u{1F3C6}" },
          { id: "joy-proud-confident", label: "Confident", emoji: "\u{1F451}" },
          { id: "joy-proud-triumphant", label: "Triumphant", emoji: "\u{270A}" },
        ],
      },
      {
        id: "joy-optimistic", label: "Optimistic", emoji: "\u{1F308}",
        question: "Is this hopefulness about something specific, or a general sense that things will be okay?",
        tertiaries: [
          { id: "joy-optimistic-hopeful", label: "Hopeful", emoji: "\u{1F331}" },
          { id: "joy-optimistic-inspired", label: "Inspired", emoji: "\u{1F4A1}" },
          { id: "joy-optimistic-eager", label: "Eager", emoji: "\u{1F680}" },
        ],
      },
      {
        id: "joy-peaceful", label: "Peaceful", emoji: "\u{1F54A}\uFE0F",
        question: "Is this peace coming from the outside world being calm, or from something settling inside you?",
        tertiaries: [
          { id: "joy-peaceful-calm", label: "Calm", emoji: "\u{1F30A}" },
          { id: "joy-peaceful-serene", label: "Serene", emoji: "\u{1F338}" },
          { id: "joy-peaceful-relieved", label: "Relieved", emoji: "\u{1F60C}" },
        ],
      },
    ],
  },
  {
    id: "sadness",
    label: "Sadness",
    emoji: "\u{1F622}",
    color: "#3b82f6",
    gradient: "from-blue-400 to-blue-600",
    question: "What kind of sadness is this? Heavy and deep, or more of a quiet ache?",
    secondaries: [
      {
        id: "sadness-lonely", label: "Lonely", emoji: "\u{1F614}",
        question: "Is this about missing someone specific, or a broader feeling of being alone?",
        tertiaries: [
          { id: "sadness-lonely-isolated", label: "Isolated", emoji: "\u{1F3DD}\uFE0F" },
          { id: "sadness-lonely-abandoned", label: "Abandoned", emoji: "\u{1F6AA}" },
          { id: "sadness-lonely-invisible", label: "Invisible", emoji: "\u{1F47B}" },
        ],
      },
      {
        id: "sadness-hurt", label: "Hurt", emoji: "\u{1F494}",
        question: "Did someone cause this hurt, or does it come from something you're carrying inside?",
        tertiaries: [
          { id: "sadness-hurt-betrayed", label: "Betrayed", emoji: "\u{1F5E1}\uFE0F" },
          { id: "sadness-hurt-disappointed", label: "Disappointed", emoji: "\u{1F61E}" },
          { id: "sadness-hurt-let-down", label: "Let Down", emoji: "\u{1F4A7}" },
        ],
      },
      {
        id: "sadness-grief", label: "Grief", emoji: "\u{1F5A4}",
        question: "Is this grief about losing someone, losing something, or losing a version of yourself?",
        tertiaries: [
          { id: "sadness-grief-bereaved", label: "Bereaved", emoji: "\u{1F56F}\uFE0F" },
          { id: "sadness-grief-mourning", label: "Mourning", emoji: "\u{1F3B5}" },
          { id: "sadness-grief-heartbroken", label: "Heartbroken", emoji: "\u{1F48D}" },
        ],
      },
      {
        id: "sadness-hopeless", label: "Hopeless", emoji: "\u{1F636}\u200D\u{1F32B}\uFE0F",
        question: "Does hopeless mean you can't see a way forward, or that you're too tired to keep looking?",
        tertiaries: [
          { id: "sadness-hopeless-defeated", label: "Defeated", emoji: "\u{1F3F3}\uFE0F" },
          { id: "sadness-hopeless-powerless", label: "Powerless", emoji: "\u{26D3}\uFE0F" },
          { id: "sadness-hopeless-empty", label: "Empty", emoji: "\u{1F573}\uFE0F" },
        ],
      },
      {
        id: "sadness-guilty", label: "Guilty", emoji: "\u{1F625}",
        question: "Is this guilt about something you did, or something you believe you should have done?",
        tertiaries: [
          { id: "sadness-guilty-remorseful", label: "Remorseful", emoji: "\u{1F614}" },
          { id: "sadness-guilty-regretful", label: "Regretful", emoji: "\u{1F615}" },
          { id: "sadness-guilty-responsible", label: "Responsible", emoji: "\u{2696}\uFE0F" },
        ],
      },
    ],
  },
  {
    id: "anger",
    label: "Anger",
    emoji: "\u{1F621}",
    color: "#ef4444",
    gradient: "from-red-400 to-red-600",
    question: "What's driving this anger? Is it directed outward at someone, or burning inside you?",
    secondaries: [
      {
        id: "anger-frustrated", label: "Frustrated", emoji: "\u{1F624}",
        question: "Is this frustration about a specific situation, or a pattern that keeps repeating?",
        tertiaries: [
          { id: "anger-frustrated-annoyed", label: "Annoyed", emoji: "\u{1F612}" },
          { id: "anger-frustrated-exasperated", label: "Exasperated", emoji: "\u{1F62E}\u200D\u{1F4A8}" },
          { id: "anger-frustrated-stuck", label: "Stuck", emoji: "\u{1F9F1}" },
        ],
      },
      {
        id: "anger-resentful", label: "Resentful", emoji: "\u{1F620}",
        question: "Is this resentment building over time, or is it a response to something recent?",
        tertiaries: [
          { id: "anger-resentful-bitter", label: "Bitter", emoji: "\u{1F48A}" },
          { id: "anger-resentful-jealous", label: "Jealous", emoji: "\u{1F49A}" },
          { id: "anger-resentful-envious", label: "Envious", emoji: "\u{1F440}" },
        ],
      },
      {
        id: "anger-furious", label: "Furious", emoji: "\u{1F525}",
        question: "Does this fury feel explosive, or more like a slow burn you can barely contain?",
        tertiaries: [
          { id: "anger-furious-enraged", label: "Enraged", emoji: "\u{1F4A2}" },
          { id: "anger-furious-hostile", label: "Hostile", emoji: "\u{26A1}" },
          { id: "anger-furious-livid", label: "Livid", emoji: "\u{1F92C}" },
        ],
      },
      {
        id: "anger-defensive", label: "Defensive", emoji: "\u{1F6E1}\uFE0F",
        question: "What are you protecting? Is it your sense of self, your boundaries, or something else?",
        tertiaries: [
          { id: "anger-defensive-guarded", label: "Guarded", emoji: "\u{1F512}" },
          { id: "anger-defensive-provoked", label: "Provoked", emoji: "\u{1F3AF}" },
          { id: "anger-defensive-offended", label: "Offended", emoji: "\u{1F645}" },
        ],
      },
    ],
  },
  {
    id: "fear",
    label: "Fear",
    emoji: "\u{1F628}",
    color: "#8b5cf6",
    gradient: "from-violet-400 to-purple-600",
    question: "What kind of fear is this? A specific threat, or something harder to name?",
    secondaries: [
      {
        id: "fear-anxious", label: "Anxious", emoji: "\u{1F630}",
        question: "Is this anxiety about something that might happen, or a feeling that won't go away?",
        tertiaries: [
          { id: "fear-anxious-worried", label: "Worried", emoji: "\u{1F61F}" },
          { id: "fear-anxious-overwhelmed", label: "Overwhelmed", emoji: "\u{1F4A8}" },
          { id: "fear-anxious-restless", label: "Restless", emoji: "\u{1F300}" },
        ],
      },
      {
        id: "fear-scared", label: "Scared", emoji: "\u{1F631}",
        question: "Can you name what scares you, or is it more of a feeling in your body?",
        tertiaries: [
          { id: "fear-scared-frightened", label: "Frightened", emoji: "\u{1F47E}" },
          { id: "fear-scared-terrified", label: "Terrified", emoji: "\u{1F480}" },
          { id: "fear-scared-panicked", label: "Panicked", emoji: "\u{1F6A8}" },
        ],
      },
      {
        id: "fear-insecure", label: "Insecure", emoji: "\u{1F636}",
        question: "Is this insecurity about how others see you, or about your own self-doubt?",
        tertiaries: [
          { id: "fear-insecure-inadequate", label: "Inadequate", emoji: "\u{1F4CF}" },
          { id: "fear-insecure-self-doubt", label: "Self-Doubting", emoji: "\u{2753}" },
          { id: "fear-insecure-vulnerable", label: "Vulnerable", emoji: "\u{1F90D}" },
        ],
      },
      {
        id: "fear-helpless", label: "Helpless", emoji: "\u{1F62D}",
        question: "Does helpless mean you can't change the situation, or that you don't know how?",
        tertiaries: [
          { id: "fear-helpless-trapped", label: "Trapped", emoji: "\u{1F6AA}" },
          { id: "fear-helpless-paralyzed", label: "Paralyzed", emoji: "\u{1F9CA}" },
          { id: "fear-helpless-exposed", label: "Exposed", emoji: "\u{1F441}\uFE0F" },
        ],
      },
    ],
  },
  {
    id: "disgust",
    label: "Disgust",
    emoji: "\u{1F922}",
    color: "#22c55e",
    gradient: "from-green-500 to-emerald-600",
    question: "Is this disgust aimed at something outside of you, or directed inward?",
    secondaries: [
      {
        id: "disgust-repulsed", label: "Repulsed", emoji: "\u{1F92E}",
        question: "What triggered this feeling? Is it a person, a situation, or a memory?",
        tertiaries: [
          { id: "disgust-repulsed-revolted", label: "Revolted", emoji: "\u{1F645}" },
          { id: "disgust-repulsed-sickened", label: "Sickened", emoji: "\u{1F912}" },
          { id: "disgust-repulsed-horrified", label: "Horrified", emoji: "\u{1F62F}" },
        ],
      },
      {
        id: "disgust-contempt", label: "Contemptuous", emoji: "\u{1F612}",
        question: "Is this contempt protecting you from something, or is it a judgment you're holding?",
        tertiaries: [
          { id: "disgust-contempt-disdainful", label: "Disdainful", emoji: "\u{1F928}" },
          { id: "disgust-contempt-judgmental", label: "Judgmental", emoji: "\u{2696}\uFE0F" },
          { id: "disgust-contempt-scornful", label: "Scornful", emoji: "\u{1F644}" },
        ],
      },
      {
        id: "disgust-aversion", label: "Aversion", emoji: "\u{1F645}",
        question: "Are you pulling away from something specific, or is it a general need for distance?",
        tertiaries: [
          { id: "disgust-aversion-avoidant", label: "Avoidant", emoji: "\u{1F6AB}" },
          { id: "disgust-aversion-withdrawn", label: "Withdrawn", emoji: "\u{1F422}" },
          { id: "disgust-aversion-detached", label: "Detached", emoji: "\u{1F9CA}" },
        ],
      },
    ],
  },
  {
    id: "surprise",
    label: "Surprise",
    emoji: "\u{1F62E}",
    color: "#f97316",
    gradient: "from-orange-400 to-amber-500",
    question: "Was this surprise welcome or unwelcome? Did it shift something inside you?",
    secondaries: [
      {
        id: "surprise-amazed", label: "Amazed", emoji: "\u{1F929}",
        question: "What amazed you? Was it something you saw in yourself, or in someone else?",
        tertiaries: [
          { id: "surprise-amazed-awestruck", label: "Awestruck", emoji: "\u{1F30C}" },
          { id: "surprise-amazed-astonished", label: "Astonished", emoji: "\u{1F4AB}" },
          { id: "surprise-amazed-wonder", label: "Wonderstruck", emoji: "\u{2728}" },
        ],
      },
      {
        id: "surprise-confused", label: "Confused", emoji: "\u{1F615}",
        question: "Is this confusion about what happened, or about how you feel about it?",
        tertiaries: [
          { id: "surprise-confused-disoriented", label: "Disoriented", emoji: "\u{1F4AB}" },
          { id: "surprise-confused-perplexed", label: "Perplexed", emoji: "\u{1F914}" },
          { id: "surprise-confused-bewildered", label: "Bewildered", emoji: "\u{1F62F}" },
        ],
      },
      {
        id: "surprise-startled", label: "Startled", emoji: "\u{1F633}",
        question: "Was the startle physical, emotional, or both? Where do you feel it now?",
        tertiaries: [
          { id: "surprise-startled-shocked", label: "Shocked", emoji: "\u{26A1}" },
          { id: "surprise-startled-jolted", label: "Jolted", emoji: "\u{1F4A5}" },
          { id: "surprise-startled-alarmed", label: "Alarmed", emoji: "\u{1F514}" },
        ],
      },
    ],
  },
  {
    id: "love",
    label: "Love",
    emoji: "\u{2764}\uFE0F",
    color: "#ec4899",
    gradient: "from-pink-400 to-rose-500",
    question: "What kind of love is this? Warm and gentle, fierce and protective, or something else?",
    secondaries: [
      {
        id: "love-affectionate", label: "Affectionate", emoji: "\u{1F917}",
        question: "Is this affection for someone in your life, or a warmth toward yourself?",
        tertiaries: [
          { id: "love-affectionate-warm", label: "Warm", emoji: "\u{2615}" },
          { id: "love-affectionate-tender", label: "Tender", emoji: "\u{1F33C}" },
          { id: "love-affectionate-caring", label: "Caring", emoji: "\u{1F49E}" },
        ],
      },
      {
        id: "love-connected", label: "Connected", emoji: "\u{1F91D}",
        question: "Who or what do you feel connected to right now? How does that connection feel?",
        tertiaries: [
          { id: "love-connected-belonging", label: "Belonging", emoji: "\u{1F3E0}" },
          { id: "love-connected-understood", label: "Understood", emoji: "\u{1F4AC}" },
          { id: "love-connected-accepted", label: "Accepted", emoji: "\u{1F49A}" },
        ],
      },
      {
        id: "love-romantic", label: "Romantic", emoji: "\u{1F495}",
        question: "Is this romantic feeling exciting, comforting, or bittersweet?",
        tertiaries: [
          { id: "love-romantic-passionate", label: "Passionate", emoji: "\u{1F525}" },
          { id: "love-romantic-devoted", label: "Devoted", emoji: "\u{1F490}" },
          { id: "love-romantic-longing", label: "Longing", emoji: "\u{1F319}" },
        ],
      },
      {
        id: "love-compassionate", label: "Compassionate", emoji: "\u{1F49C}",
        question: "Is this compassion directed outward toward someone, or inward toward yourself?",
        tertiaries: [
          { id: "love-compassionate-empathetic", label: "Empathetic", emoji: "\u{1F90F}" },
          { id: "love-compassionate-nurturing", label: "Nurturing", emoji: "\u{1F33F}" },
          { id: "love-compassionate-forgiving", label: "Forgiving", emoji: "\u{1F54A}\uFE0F" },
        ],
      },
    ],
  },
  {
    id: "shame",
    label: "Shame",
    emoji: "\u{1F636}",
    color: "#a855f7",
    gradient: "from-purple-400 to-fuchsia-500",
    question: "Is this shame about something you did, or about who you believe you are?",
    secondaries: [
      {
        id: "shame-embarrassed", label: "Embarrassed", emoji: "\u{1F633}",
        question: "Is this embarrassment about being seen, or about not living up to an expectation?",
        tertiaries: [
          { id: "shame-embarrassed-humiliated", label: "Humiliated", emoji: "\u{1F61F}" },
          { id: "shame-embarrassed-self-conscious", label: "Self-Conscious", emoji: "\u{1F64A}" },
          { id: "shame-embarrassed-flustered", label: "Flustered", emoji: "\u{1F975}" },
        ],
      },
      {
        id: "shame-worthless", label: "Worthless", emoji: "\u{1F614}",
        question: "Does worthless feel like a fact to you, or like a voice telling you that?",
        tertiaries: [
          { id: "shame-worthless-unlovable", label: "Unlovable", emoji: "\u{1F494}" },
          { id: "shame-worthless-defective", label: "Defective", emoji: "\u{1F6E0}\uFE0F" },
          { id: "shame-worthless-not-enough", label: "Not Enough", emoji: "\u{1F4C9}" },
        ],
      },
      {
        id: "shame-exposed", label: "Exposed", emoji: "\u{1F441}\uFE0F",
        question: "What feels exposed? Is it something you've been hiding, or something that was taken from you?",
        tertiaries: [
          { id: "shame-exposed-naked", label: "Exposed", emoji: "\u{1F50D}" },
          { id: "shame-exposed-judged", label: "Judged", emoji: "\u{1F9D0}" },
          { id: "shame-exposed-scrutinized", label: "Scrutinized", emoji: "\u{1F52C}" },
        ],
      },
      {
        id: "shame-small", label: "Small", emoji: "\u{1F90F}",
        question: "Does 'small' mean you feel diminished by someone, or like you've shrunk yourself?",
        tertiaries: [
          { id: "shame-small-insignificant", label: "Insignificant", emoji: "\u{1F4A8}" },
          { id: "shame-small-invisible", label: "Invisible", emoji: "\u{1F47B}" },
          { id: "shame-small-diminished", label: "Diminished", emoji: "\u{1F53D}" },
        ],
      },
    ],
  },
];

/** Flat lookup: id → emotion data at any tier */
export function findEmotionById(id: string): { primary: PrimaryEmotion; secondary?: SecondaryEmotion; tertiary?: TertiaryEmotion } | null {
  for (const primary of EMOTIONS) {
    if (primary.id === id) return { primary };
    for (const secondary of primary.secondaries) {
      if (secondary.id === id) return { primary, secondary };
      for (const tertiary of secondary.tertiaries) {
        if (tertiary.id === id) return { primary, secondary, tertiary };
      }
    }
  }
  return null;
}
