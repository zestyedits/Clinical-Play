let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

// Sandtray: Soft thud for placing items
export function playPlaceSound() {
  try {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);

    // Subtle noise layer for texture
    const noise = ctx.createOscillator();
    const noiseGain = ctx.createGain();
    noise.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.type = "triangle";
    noise.frequency.setValueAtTime(80, ctx.currentTime);
    noiseGain.gain.setValueAtTime(0.03, ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    noise.start(ctx.currentTime);
    noise.stop(ctx.currentTime + 0.08);
  } catch {}
}

export function playSelectSound() {
  try {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(500, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.06);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.08);
  } catch {}
}

export function playLiftSound() {
  try {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(450, ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.07);
  } catch {}
}

// Feeling Wheel: Melodic click with resonance
export function playClickSound() {
  try {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(660, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.06);
    gain.gain.setValueAtTime(0.07, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.08);

    // Harmonic overtone
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1320, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.04);
    gain2.gain.setValueAtTime(0.02, ctx.currentTime);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc2.start(ctx.currentTime);
    osc2.stop(ctx.currentTime + 0.05);
  } catch {}
}

// Parts Theater: Deep resonant tone
export function playTheaterSound() {
  try {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(180, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 0.25);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);

    // Warm second voice
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(270, ctx.currentTime + 0.02);
    osc2.frequency.exponentialRampToValueAtTime(135, ctx.currentTime + 0.22);
    gain2.gain.setValueAtTime(0.03, ctx.currentTime + 0.02);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc2.start(ctx.currentTime + 0.02);
    osc2.stop(ctx.currentTime + 0.22);
  } catch {}
}

// Values Card Sort: Satisfying snap
export function playSortSound() {
  try {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "triangle";
    osc.frequency.setValueAtTime(350, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(550, ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.07, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);

    // Crisp attack transient
    const click = ctx.createOscillator();
    const clickGain = ctx.createGain();
    click.connect(clickGain);
    clickGain.connect(ctx.destination);
    click.type = "square";
    click.frequency.setValueAtTime(2000, ctx.currentTime);
    clickGain.gain.setValueAtTime(0.015, ctx.currentTime);
    clickGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);
    click.start(ctx.currentTime);
    click.stop(ctx.currentTime + 0.02);
  } catch {}
}

// Breathing guide: Soft whoosh
export function playBreathSound() {
  try {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(120, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.5);
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  } catch {}
}

// Themed breathing sounds
export function playThemedBreathSound(theme: string, phase: "inhale" | "exhale") {
  try {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") ctx.resume();

    switch (theme) {
      case "ocean": {
        // Low sine sweep — reuse existing whoosh pattern
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        if (phase === "inhale") {
          osc.frequency.setValueAtTime(80, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.5);
        } else {
          osc.frequency.setValueAtTime(120, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.5);
        }
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.5);
        break;
      }
      case "balloon": {
        // Higher, lighter sine — airy
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = phase === "exhale" ? "triangle" : "sine";
        if (phase === "inhale") {
          osc.frequency.setValueAtTime(160, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.4);
        } else {
          osc.frequency.setValueAtTime(200, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + 0.4);
        }
        gain.gain.setValueAtTime(0.03, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.4);
        break;
      }
      case "stars": {
        // Ethereal sine chord (fundamental + perfect fifth)
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        const gain2 = ctx.createGain();
        osc1.connect(gain1);
        osc2.connect(gain2);
        gain1.connect(ctx.destination);
        gain2.connect(ctx.destination);
        osc1.type = "sine";
        osc2.type = "sine";
        const base = phase === "inhale" ? 150 : 120;
        osc1.frequency.setValueAtTime(base, ctx.currentTime);
        osc2.frequency.setValueAtTime(base * 1.5, ctx.currentTime);
        gain1.gain.setValueAtTime(0.001, ctx.currentTime);
        gain1.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.2);
        gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        gain2.gain.setValueAtTime(0.001, ctx.currentTime);
        gain2.gain.linearRampToValueAtTime(0.02, ctx.currentTime + 0.25);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        osc1.start(ctx.currentTime);
        osc1.stop(ctx.currentTime + 0.6);
        osc2.start(ctx.currentTime);
        osc2.stop(ctx.currentTime + 0.6);
        break;
      }
      case "campfire": {
        // Warm low triangle wave + brief crackle noise burst
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "triangle";
        osc.frequency.setValueAtTime(phase === "inhale" ? 100 : 130, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(phase === "inhale" ? 130 : 100, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.4);
        // Crackle
        const crackle = ctx.createOscillator();
        const crackleGain = ctx.createGain();
        crackle.connect(crackleGain);
        crackleGain.connect(ctx.destination);
        crackle.type = "sawtooth";
        crackle.frequency.setValueAtTime(3000, ctx.currentTime);
        crackle.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.05);
        crackleGain.gain.setValueAtTime(0.015, ctx.currentTime);
        crackleGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
        crackle.start(ctx.currentTime);
        crackle.stop(ctx.currentTime + 0.06);
        break;
      }
      case "aurora": {
        // Shimmering sine with slow frequency wobble
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        lfo.type = "sine";
        const freq = phase === "inhale" ? 140 : 110;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        lfo.frequency.setValueAtTime(4, ctx.currentTime);
        lfoGain.gain.setValueAtTime(8, ctx.currentTime);
        gain.gain.setValueAtTime(0.001, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.5);
        lfo.start(ctx.currentTime);
        lfo.stop(ctx.currentTime + 0.5);
        break;
      }
      default:
        // Fallback to existing breath sound
        playBreathSound();
    }
  } catch {}
}

// Timeline: Water ripple / stone drop
export function playRippleSound() {
  try {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.25);

    // Water shimmer
    const shimmer = ctx.createOscillator();
    const shimmerGain = ctx.createGain();
    shimmer.connect(shimmerGain);
    shimmerGain.connect(ctx.destination);
    shimmer.type = "sine";
    shimmer.frequency.setValueAtTime(800, ctx.currentTime + 0.05);
    shimmer.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.15);
    shimmerGain.gain.setValueAtTime(0.02, ctx.currentTime + 0.05);
    shimmerGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    shimmer.start(ctx.currentTime + 0.05);
    shimmer.stop(ctx.currentTime + 0.15);
  } catch {}
}
