// ── Cognitive Distortions Data ──────────────────────────────────────────────
// Clinically accurate descriptions of the 12 common cognitive distortions,
// adapted for three age groups with age-appropriate examples and humor.

export interface CognitiveDistortion {
  id: string;
  name: string;
  icon: string;
  description: { child: string; teen: string; adult: string };
  example: { child: string; teen: string; adult: string };
  humor: { child: string; teen: string; adult: string };
}

export const COGNITIVE_DISTORTIONS: CognitiveDistortion[] = [
  {
    id: "all-or-nothing",
    name: "All-or-Nothing Thinking",
    icon: "\u2B1B",
    description: {
      child:
        "This is when you think things can only be totally great or totally terrible, with nothing in between. Like a light switch that's only ON or OFF — but real life has dimmer switches too!",
      teen:
        "You see things in only two categories — perfect or a total disaster. There's no middle ground. If something isn't flawless, your brain labels it as a complete failure, ignoring all the gray area where most of life actually happens.",
      adult:
        "Also known as black-and-white thinking, this distortion forces complex situations into binary categories. If your performance isn't perfect, you see yourself as a total failure. You struggle to see the spectrum between extremes, losing the nuance that characterizes most real-world outcomes.",
    },
    example: {
      child:
        "You miss one question on a spelling test and think, 'I'm terrible at spelling!' even though you got 9 out of 10 right.",
      teen:
        "You don't get invited to one party and think, 'I have no social life at all,' even though you hung out with friends three times this week.",
      adult:
        "You make a small error in a presentation and conclude, 'That was a complete disaster,' even though the audience responded positively to everything else.",
    },
    humor: {
      child:
        "It's like saying if you can't eat the WHOLE pizza, you won't eat ANY pizza!",
      teen:
        "You got a 92 on the test? Might as well have failed, right? Your brain is literally in black-and-white mode",
      adult:
        "The world's most extreme binary thinker: 'If I'm not employee of the year, I must be getting fired'",
    },
  },
  {
    id: "overgeneralization",
    name: "Overgeneralization",
    icon: "\uD83D\uDD01",
    description: {
      child:
        "This is when one bad thing happens and you think it will ALWAYS happen. You use words like 'always,' 'never,' and 'every time' to describe one single event.",
      teen:
        "You take a single negative event and treat it as a never-ending pattern of defeat. One setback becomes proof that things will always go wrong. Words like 'always,' 'never,' and 'everyone' start showing up a lot.",
      adult:
        "This distortion involves drawing broad, sweeping conclusions from a single incident. One rejection becomes 'I always get rejected.' One mistake becomes 'I never do anything right.' You extrapolate a pattern from insufficient evidence, creating a narrative of inevitable failure.",
    },
    example: {
      child:
        "You trip once during recess and say, 'I ALWAYS fall down! I'm the clumsiest kid ever!'",
      teen:
        "One friend cancels plans and you think, 'Nobody ever wants to hang out with me. This always happens.'",
      adult:
        "A first date doesn't go well, and you conclude, 'I'll never find someone. Every date I go on is a disaster.'",
    },
    humor: {
      child:
        "One rainy day = 'It ALWAYS rains! It'll NEVER be sunny again!' Spoiler: the sun comes back",
      teen:
        "Got left on read once? 'Nobody EVER texts me back. I'm literally invisible.' Sample size: 1",
      adult:
        "Ah yes, the classic 'I burned dinner once, therefore I am a hazard to all kitchens worldwide'",
    },
  },
  {
    id: "mental-filter",
    name: "Mental Filter",
    icon: "\uD83D\uDD0D",
    description: {
      child:
        "This is like wearing special glasses that only let you see the bad stuff. Even when lots of good things happen, your brain zooms in on the one thing that went wrong and ignores everything else.",
      teen:
        "Your brain picks out one negative detail and dwells on it exclusively, so your whole view of reality becomes darkened — like a single drop of ink coloring an entire glass of water. The positive stuff is still there; your brain just refuses to see it.",
      adult:
        "Also called selective abstraction, this distortion causes you to fixate on a single negative detail while filtering out all the positive aspects of a situation. Your perception becomes skewed as you mentally magnify what went wrong and ignore what went right.",
    },
    example: {
      child:
        "Your birthday party was super fun, but one game didn't work out, and that's all you can think about when you remember the party.",
      teen:
        "You post a photo and get tons of nice comments, but one person says something slightly critical, and that's the only comment you think about all night.",
      adult:
        "After a glowing annual review with one area flagged for development, you spend the entire weekend fixating on that single piece of constructive feedback.",
    },
    humor: {
      child:
        "It's like getting 10 gold stars and one sad face, and only seeing the sad face!",
      teen:
        "50 likes and one weird comment? Time to screenshot and obsess over just that one",
      adult:
        "Performance review: 12 positive points, 1 suggestion for improvement. Guess which one you'll think about at 3am?",
    },
  },
  {
    id: "disqualifying-positive",
    name: "Disqualifying the Positive",
    icon: "\uD83D\uDEAB",
    description: {
      child:
        "This is when something good happens but your brain says it doesn't count. It's like getting a present and saying, 'That doesn't matter.' You reject good experiences by insisting they don't count for some reason.",
      teen:
        "You don't just ignore positive experiences — you actively reject them. When something good happens, you find a way to twist it into something negative or dismiss it. Compliments become lies, achievements become flukes, and good days become exceptions.",
      adult:
        "This goes beyond simply ignoring positives — you actively transform neutral or positive experiences into negative ones. You maintain a negative belief by contradicting positive evidence. This is one of the most destructive distortions because it makes you feel inadequate no matter what happens.",
    },
    example: {
      child:
        "Your teacher says your drawing is beautiful, but you think, 'She says that to everyone. My drawing isn't really good.'",
      teen:
        "You ace a test and tell yourself, 'The teacher made it too easy. It doesn't prove I'm actually smart.'",
      adult:
        "A colleague praises your work, and you think, 'They're just being polite' or 'They don't know my work well enough to judge.'",
    },
    humor: {
      child:
        "Someone says 'great job!' and your brain says 'they're just being nice.' Your brain is being a party pooper!",
      teen:
        "Got a compliment? Must be a prank. Good grade? The test was easy. Your brain is basically a compliment bouncer",
      adult:
        "Promotion? 'They just couldn't find anyone else.' Your brain runs a full-time operation discounting every good thing",
    },
  },
  {
    id: "jumping-to-conclusions",
    name: "Jumping to Conclusions",
    icon: "\uD83E\uDD38",
    description: {
      child:
        "This is when you decide something bad is true even though you don't actually know for sure. You might think you know what someone else is thinking (mind reading) or believe you know something bad will happen in the future (fortune telling).",
      teen:
        "You make negative interpretations without any actual evidence. This shows up two ways: Mind Reading, where you assume you know what others are thinking about you, and Fortune Telling, where you predict things will turn out badly. Neither is based on facts.",
      adult:
        "This distortion manifests as Mind Reading — arbitrarily concluding that someone is reacting negatively to you without checking — and Fortune Telling — predicting that things will turn out badly as though it were an established fact. Both involve treating unverified assumptions as certainties.",
    },
    example: {
      child:
        "Your friend is quiet at lunch and you think, 'They're mad at me!' But really they just have a stomachache.",
      teen:
        "You see two friends whispering and immediately assume they're talking about you, when they're actually planning a surprise for someone else.",
      adult:
        "You email your boss a proposal and don't hear back by end of day. You conclude they hated it, when they simply haven't read it yet.",
    },
    humor: {
      child:
        "Your friend didn't wave at you, so obviously they hate you now... or maybe they just didn't see you!",
      teen:
        "They left you on read for 10 minutes. They definitely hate you. OR... hear me out... they're in the shower",
      adult:
        "Boss says 'Can we talk tomorrow?' Your brain: 'I'm fired.' Actual topic: office birthday cake preferences",
    },
  },
  {
    id: "magnification-minimization",
    name: "Magnification / Minimization",
    icon: "\uD83D\uDD2D",
    description: {
      child:
        "This is like having a magic magnifying glass for bad things that makes them look HUGE, and a shrink ray for good things that makes them look tiny. Your mistakes seem enormous while your wins seem to barely exist.",
      teen:
        "You exaggerate the importance of negative things (your mistakes, someone else's achievements) and shrink the significance of positive things (your strengths, other people's flaws). It's like looking through binoculars — one end magnifies, the other minimizes.",
      adult:
        "Sometimes called the 'binocular trick,' this distortion involves disproportionately enlarging your shortcomings and failures while diminishing your strengths and successes. You may also magnify others' positive qualities while minimizing their imperfections, fueling unfavorable comparisons.",
    },
    example: {
      child:
        "You scored two goals in soccer but missed one shot, and you keep thinking about the one you missed as if it was the biggest deal ever.",
      teen:
        "You nailed your class presentation except for one small stumble, but you act like that stumble was the only thing anyone noticed.",
      adult:
        "You successfully manage a complex project but fixate on one missed deadline, while dismissing the overall achievement as 'just part of the job.'",
    },
    humor: {
      child:
        "Making your mistakes look HUGE like through a magnifying glass, but your wins look teeny-tiny!",
      teen:
        "Your mistake is on a billboard. Your accomplishment is in size 2 font at the bottom of page 47",
      adult:
        "One typo in a 50-page report = career-ending catastrophe. Completing the 50-page report = 'just doing my job'",
    },
  },
  {
    id: "emotional-reasoning",
    name: "Emotional Reasoning",
    icon: "\uD83D\uDCA7",
    description: {
      child:
        "This is when you think that just because you FEEL something, it must be TRUE. Like if you feel scared, you believe something scary is really there. Your feelings are important, but they aren't always facts!",
      teen:
        "You take your emotions as evidence of truth. 'I feel it, therefore it must be true.' If you feel stupid, you must be stupid. If you feel hopeless, the situation must be hopeless. But emotions, while valid, aren't reliable reporters of reality.",
      adult:
        "This distortion assumes that your negative emotions necessarily reflect the way things really are. You treat feelings as facts: 'I feel it, so it must be true.' While emotions are valid experiences, they are not evidence. Feeling incompetent doesn't mean you are incompetent.",
    },
    example: {
      child:
        "You feel nervous about the school play, so you think, 'Something bad is going to happen on stage!' But feeling nervous doesn't mean something bad will happen.",
      teen:
        "You feel like a burden to your friends, so you believe you actually are one — even though they keep inviting you to hang out.",
      adult:
        "You feel overwhelmed at work and conclude, 'I can't handle this job,' even though your track record shows consistent competence.",
    },
    humor: {
      child:
        "Feeling scared doesn't mean the monster is real! Your feelings are real, but they're not always telling the truth",
      teen:
        "I FEEL stupid, therefore I AM stupid. That's like saying 'I feel like a potato, therefore I am a potato'",
      adult:
        "I feel like a failure, ergo I have failed. By that logic, I also feel like ordering pizza, so I must be a pizza",
    },
  },
  {
    id: "should-statements",
    name: "Should Statements",
    icon: "\u261D\uFE0F",
    description: {
      child:
        "This is when you have a bunch of strict rules in your head about how things SHOULD be. 'I should always be the best,' 'Everyone should be nice to me,' 'Things should always be fair.' These rules make you feel bad when real life doesn't follow them.",
      teen:
        "You have a list of ironclad rules about how you and others ought to behave. When you direct 'shoulds' at yourself, you feel guilt and frustration. When you direct them at others, you feel anger and resentment. These rigid expectations set you up for constant disappointment.",
      adult:
        "You operate from a fixed set of rules about how you, others, and the world should function. 'Should,' 'must,' and 'ought' statements generate guilt when self-directed and resentment when other-directed. They replace flexible preferences with rigid demands that reality rarely satisfies.",
    },
    example: {
      child:
        "You think, 'I should NEVER make mistakes,' so when you mess up even a little, you feel really awful about it.",
      teen:
        "You think, 'I should be over this breakup by now,' and feel ashamed that you're still processing your feelings on your own timeline.",
      adult:
        "You think, 'I should be able to handle everything without asking for help,' and feel guilty every time you need support.",
    },
    humor: {
      child:
        "Should-ing all over yourself! 'I SHOULD be better, I SHOULD know this' -- says who??",
      teen:
        "'I should be studying' 'I should have more friends' 'I should be over this' -- congrats, you just should'd yourself into feeling terrible",
      adult:
        "'I should be further along by now.' Ah yes, the life timeline that apparently everyone else got and you missed",
    },
  },
  {
    id: "labeling",
    name: "Labeling",
    icon: "\uD83C\uDFF7\uFE0F",
    description: {
      child:
        "This is when you take one thing that happened and use it to give yourself (or someone else) a big, permanent label. Instead of saying 'I made a mistake,' you say 'I'm a loser.' A label is like a sticker that's really hard to peel off!",
      teen:
        "Instead of describing a specific behavior, you attach a sweeping label to yourself or others. 'I failed the test' becomes 'I'm a failure.' 'They were rude' becomes 'They're a terrible person.' It's overgeneralization taken to the extreme — reducing a whole person to one word.",
      adult:
        "Labeling is an extreme form of overgeneralization. Instead of describing an error or situation, you attach a global, emotionally loaded label to yourself or others. Rather than 'I made a mistake in that interaction,' it becomes 'I'm socially inept.' This creates a fixed, distorted self-image based on isolated events.",
    },
    example: {
      child:
        "You forget your homework once and call yourself 'a bad student,' even though you usually remember it.",
      teen:
        "You say something awkward in a conversation and label yourself 'socially hopeless' instead of recognizing it as one moment.",
      adult:
        "After a failed project, you label yourself 'incompetent' rather than acknowledging the specific factors that contributed to the outcome.",
    },
    humor: {
      child:
        "Making one mistake and calling yourself 'a loser' is like dropping one cookie and calling yourself 'a cookie destroyer!'",
      teen:
        "Failed one test? Not 'I failed a test.' Nope, straight to 'I'm an idiot.' Your brain skipped a few steps there",
      adult:
        "Forgot an appointment? You're not 'someone who forgot.' You're now officially 'an unreliable person.' Thanks, brain",
    },
  },
  {
    id: "personalization",
    name: "Personalization",
    icon: "\uD83C\uDFAF",
    description: {
      child:
        "This is when you think everything is about you. If something bad happens, you think it's your fault, even when it has nothing to do with you. It's like thinking you made it rain because you forgot your umbrella!",
      teen:
        "You see yourself as the cause of negative events that you weren't primarily responsible for. If a friend is in a bad mood, you assume it's because of something you did. You take on responsibility for things that are mostly or entirely outside your control.",
      adult:
        "You take excessive personal responsibility for events outside your control. This distortion causes you to see yourself as the primary cause of negative external events, leading to inappropriate guilt and self-blame. You underestimate the role of other factors and other people's agency.",
    },
    example: {
      child:
        "Your parents are arguing and you think, 'It's because I didn't clean my room.' But their argument has nothing to do with you.",
      teen:
        "Your friend group's plans fall apart and you think, 'If I had just picked a better restaurant, everyone would've had fun.'",
      adult:
        "Your team's project gets criticized, and you shoulder all the blame even though the issues were systemic and involved many people's decisions.",
    },
    humor: {
      child:
        "Your team lost the game and you think it's ALL your fault? Were you all 11 players?",
      teen:
        "Group chat went quiet after you texted? Must be YOUR fault. Not that everyone went to dinner or anything",
      adult:
        "Department had a bad quarter. You: 'This is clearly because of that one email I sent in March.' Main character syndrome, but make it anxious",
    },
  },
  {
    id: "catastrophizing",
    name: "Catastrophizing",
    icon: "\uD83C\uDF0B",
    description: {
      child:
        "This is when your brain takes a small problem and turns it into the BIGGEST, SCARIEST thing ever. A tiny worry gets blown up like a balloon until it feels like the end of the world — but it's almost never as bad as your brain says!",
      teen:
        "Your brain takes a situation and immediately fast-forwards to the absolute worst-case scenario. A minor setback spirals into a full-blown catastrophe in your mind. You skip past all the realistic, moderate outcomes and land straight on disaster.",
      adult:
        "Also known as 'magnifying' or 'awfulizing,' catastrophizing is the tendency to immediately assume the worst possible outcome. You overestimate the probability and impact of negative events while underestimating your ability to cope. Small problems snowball into existential crises in your mind.",
    },
    example: {
      child:
        "You get a small stomachache and think, 'I'm really sick! I might have to go to the hospital!' when you probably just need a glass of water.",
      teen:
        "You bomb one quiz and your brain goes: bad grade \u2192 failing the class \u2192 not getting into college \u2192 ruining your entire future. All from one quiz.",
      adult:
        "You make an error in a client email and spiral: they'll lose trust \u2192 drop the account \u2192 you'll be fired \u2192 you'll never work in this industry again.",
    },
    humor: {
      child:
        "Making a mountain out of a molehill -- like thinking one bad grade means you'll never learn anything ever!",
      teen:
        "Your brain's drama queen mode -- one bad text and suddenly nobody likes you and you'll be alone forever",
      adult:
        "The mental equivalent of reading WebMD at 2am -- a headache becomes a rare tropical disease",
    },
  },
  {
    id: "blame",
    name: "Blame",
    icon: "\uD83D\uDC49",
    description: {
      child:
        "This comes in two flavors: blaming yourself for everything (even things that aren't your fault) or blaming everyone else (even when you played a part). It's like a seesaw that's stuck on one side — the truth is usually somewhere in the middle.",
      teen:
        "You either hold other people entirely responsible for your pain, or you blame yourself entirely for every problem. Both extremes miss the truth. Life is complicated, and responsibility is almost always shared. Blame oversimplifies things to make someone the villain.",
      adult:
        "This distortion operates in two directions: externalizing all blame onto others ('You made me feel this way') or internalizing all responsibility ('Everything is my fault'). Both patterns avoid the nuanced reality that most situations involve shared responsibility and complex contributing factors.",
    },
    example: {
      child:
        "Either 'It's all my brother's fault we're late!' when you also weren't ready, or 'It's all MY fault we're late!' when your brother was the one who lost his shoes.",
      teen:
        "After a fight with a friend, you either think 'They're 100% wrong and I did nothing' or 'I'm 100% the worst friend ever and it's all on me.'",
      adult:
        "In a relationship conflict, you either think 'My partner is entirely to blame for our problems' or 'I've single-handedly ruined this relationship.'",
    },
    humor: {
      child:
        "Blaming the dog for eating your homework... when you didn't do your homework! Or blaming yourself for the rain",
      teen:
        "Either 'everything is everyone else's fault' or 'everything is MY fault.' There's no in-between with this one",
      adult:
        "'My partner MADE me angry' or 'I ruined everyone's evening.' Plot twist: situations are usually more complex than one person's fault",
    },
  },
];
