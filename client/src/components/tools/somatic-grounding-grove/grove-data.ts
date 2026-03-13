export interface BodyRegion {
  id: string;
  name: string;
  emoji: string;
  x: number;
  y: number;
  width: number;
  height: number;
  groundingTechniques: GroundingTechnique[];
}

export interface GroundingTechnique {
  id: string;
  name: string;
  emoji: string;
  instruction: string;
  duration: string;
  discussionPrompt: string;
}

export const BODY_REGIONS: BodyRegion[] = [
  {
    id: "head",
    name: "Head & Mind",
    emoji: "\u{1F9E0}",
    x: 42, y: 2, width: 16, height: 12,
    groundingTechniques: [
      { id: "head-1", name: "5-4-3-2-1 Senses", emoji: "\u{1F440}", instruction: "Name 5 things you see, 4 you hear, 3 you can touch, 2 you smell, 1 you taste. Take your time with each one.", duration: "2-3 min", discussionPrompt: "What was easiest to notice? What was hardest? When our mind is racing, grounding through the senses brings us back to right now." },
      { id: "head-2", name: "Cool Water Reset", emoji: "\u{1F4A7}", instruction: "Imagine splashing cool water on your face. Feel the temperature shift, the alertness it brings. Take three slow breaths.", duration: "1-2 min", discussionPrompt: "The dive reflex is a real physiological tool — cold activates the parasympathetic nervous system. When do you notice your mind feels the most 'overheated'?" },
      { id: "head-3", name: "Mental Safe Room", emoji: "\u{1F6CB}\uFE0F", instruction: "Close your eyes. Picture a room where you feel completely safe. Notice the colors, textures, sounds, and temperature. Stay there for a moment.", duration: "2-3 min", discussionPrompt: "What did your safe room look like? This visualization is always available to you — you can return there anytime you need a mental reset." },
    ],
  },
  {
    id: "throat",
    name: "Throat & Voice",
    emoji: "\u{1F5E3}\uFE0F",
    x: 44, y: 15, width: 12, height: 7,
    groundingTechniques: [
      { id: "throat-1", name: "Humming Vibration", emoji: "\u{1F3B6}", instruction: "Hum a low, steady note. Feel the vibration in your throat and chest. Try humming for 10 seconds, pause, and repeat.", duration: "1-2 min", discussionPrompt: "Humming stimulates the vagus nerve, which calms the nervous system. Did you notice any shift in how your body felt after humming?" },
      { id: "throat-2", name: "Voice Check-In", emoji: "\u{1F399}\uFE0F", instruction: "Say out loud: 'I am here. I am safe. I am present.' Notice how your voice sounds — is it tight, shaky, or steady?", duration: "1 min", discussionPrompt: "Our voice often reflects our emotional state before we're conscious of it. What did you notice about your voice? What would a grounded voice sound like for you?" },
    ],
  },
  {
    id: "shoulders",
    name: "Shoulders & Neck",
    emoji: "\u{1F4AA}",
    x: 30, y: 18, width: 40, height: 8,
    groundingTechniques: [
      { id: "shoulders-1", name: "Tension Release", emoji: "\u{2728}", instruction: "Raise your shoulders up to your ears. Hold for 5 seconds, squeezing tight. Then drop them completely. Repeat 3 times.", duration: "1-2 min", discussionPrompt: "Many of us carry stress in our shoulders without realizing it. On a scale of 1-10, how tense were your shoulders before we started? How about now?" },
      { id: "shoulders-2", name: "Neck Circles", emoji: "\u{1F504}", instruction: "Slowly roll your head in a gentle circle — forward, right, back, left. Do 3 circles each direction. Move with your breath.", duration: "1-2 min", discussionPrompt: "Did you notice any spots that felt stuck or crunchy? Our body stores emotions physically. What might your neck be holding onto?" },
    ],
  },
  {
    id: "chest",
    name: "Chest & Heart",
    emoji: "\u{1F49A}",
    x: 38, y: 26, width: 24, height: 12,
    groundingTechniques: [
      { id: "chest-1", name: "Box Breathing", emoji: "\u{1F4E6}", instruction: "Breathe in for 4 counts. Hold for 4 counts. Breathe out for 4 counts. Hold for 4 counts. Repeat 4 times.", duration: "2-3 min", discussionPrompt: "Box breathing is used by Navy SEALs to stay calm under pressure. Did you notice your heartbeat shift? When could this technique be most useful for you?" },
      { id: "chest-2", name: "Hand on Heart", emoji: "\u{1F91A}", instruction: "Place one or both hands over your heart. Feel the warmth and gentle pressure. Notice your heartbeat. Send yourself a kind thought.", duration: "1-2 min", discussionPrompt: "Self-touch releases oxytocin, the bonding hormone. What kind thought did you offer yourself? Was it easy or difficult to direct compassion inward?" },
      { id: "chest-3", name: "Open Chest Stretch", emoji: "\u{1F932}", instruction: "Clasp your hands behind your back. Gently lift your arms while opening your chest. Hold for 10 seconds and breathe deeply.", duration: "1 min", discussionPrompt: "When we feel anxious or protective, we tend to close our chest inward. Opening it sends a signal of safety to the brain. What did you notice?" },
    ],
  },
  {
    id: "stomach",
    name: "Stomach & Gut",
    emoji: "\u{1F31F}",
    x: 40, y: 38, width: 20, height: 10,
    groundingTechniques: [
      { id: "stomach-1", name: "Belly Breathing", emoji: "\u{1F32C}\uFE0F",instruction: "Place a hand on your belly. Breathe in deeply so your hand rises. Breathe out slowly so it falls. Focus only on the rise and fall.", duration: "2-3 min", discussionPrompt: "Diaphragmatic breathing activates the 'rest and digest' system. Did your belly move, or did your chest rise instead? Many people breathe shallowly when stressed." },
      { id: "stomach-2", name: "Gut Check", emoji: "\u{1F9ED}", instruction: "Tune into your stomach area. Is there tightness, butterflies, emptiness, warmth? Just notice without trying to change anything.", duration: "1-2 min", discussionPrompt: "The gut is sometimes called the 'second brain' — it has its own nervous system. What was your gut telling you today? We can learn to trust these signals." },
    ],
  },
  {
    id: "hands",
    name: "Hands & Fingers",
    emoji: "\u{270B}",
    x: 18, y: 38, width: 14, height: 12,
    groundingTechniques: [
      { id: "hands-1", name: "Finger Breathing", emoji: "\u{1F590}\uFE0F", instruction: "Hold one hand up, fingers spread. With the other hand, trace up and down each finger. Breathe in going up, out going down.", duration: "1-2 min", discussionPrompt: "This combines tactile sensation with breath work. It's a discreet grounding tool you can use anywhere. Where could you see yourself using this?" },
      { id: "hands-2", name: "Texture Hunt", emoji: "\u{1F9F6}", instruction: "Touch 3 different textures near you. Focus completely on each one — is it rough, smooth, warm, cool, soft, hard?", duration: "1-2 min", discussionPrompt: "When we fully focus on a physical sensation, there's no room left for the anxious thought. Which texture was most grounding for you?" },
    ],
  },
  {
    id: "legs",
    name: "Legs & Thighs",
    emoji: "\u{1F9B5}",
    x: 34, y: 52, width: 14, height: 18,
    groundingTechniques: [
      { id: "legs-1", name: "Seated Press", emoji: "\u{1FA91}", instruction: "While sitting, press your feet firmly into the floor. Squeeze your thigh muscles for 5 seconds, then release. Repeat 3 times.", duration: "1-2 min", discussionPrompt: "Engaging large muscle groups can discharge nervous energy. Did you feel a difference between the squeezing and the releasing? Many people find the release is where the calm lives." },
      { id: "legs-2", name: "Leg Scan", emoji: "\u{1F50D}", instruction: "Starting from your hips, slowly scan down through your thighs, knees, and calves. Notice any tension, warmth, tingling, or numbness.", duration: "1-2 min", discussionPrompt: "Our legs are connected to our fight-or-flight response — they're literally built to run from danger. What did you notice? Any urge to move?" },
    ],
  },
  {
    id: "feet",
    name: "Feet & Roots",
    emoji: "\u{1F463}",
    x: 34, y: 72, width: 14, height: 10,
    groundingTechniques: [
      { id: "feet-1", name: "Root Down", emoji: "\u{1F333}", instruction: "Press your feet flat on the floor. Imagine roots growing from the soles of your feet deep into the earth. Feel the stability and support.", duration: "2-3 min", discussionPrompt: "Grounding literally means connecting to the ground. When life feels chaotic, your feet are always touching something solid. How did that visualization land for you?" },
      { id: "feet-2", name: "Toe Wiggle", emoji: "\u{1F43E}", instruction: "Wiggle your toes inside your shoes or socks. Spread them wide, then curl them tight. Notice the sensations. Repeat 5 times.", duration: "1 min", discussionPrompt: "This tiny movement reconnects you to your physical body instantly. It's the most discreet grounding tool — no one even knows you're doing it. When might you use this?" },
    ],
  },
];
