/**
 * Volume Mixer — "Acoustic Warmth" Web Audio Engine
 *
 * Subtractive synthesis with soft envelopes for therapeutic audio.
 * Uses triangle waves, low-pass filters, brownian noise texture,
 * and a master compressor to prevent pops/clicks.
 */

let audioCtx: AudioContext | null = null;
let masterCompressor: DynamicsCompressorNode | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
    // Master compressor — prevents pops and sudden volume spikes
    masterCompressor = audioCtx.createDynamicsCompressor();
    masterCompressor.threshold.setValueAtTime(-24, audioCtx.currentTime);
    masterCompressor.knee.setValueAtTime(30, audioCtx.currentTime);
    masterCompressor.ratio.setValueAtTime(4, audioCtx.currentTime);
    masterCompressor.attack.setValueAtTime(0.003, audioCtx.currentTime);
    masterCompressor.release.setValueAtTime(0.25, audioCtx.currentTime);
    masterCompressor.connect(audioCtx.destination);
  }
  return audioCtx;
}

function getMaster(): AudioNode {
  getAudioContext();
  return masterCompressor || audioCtx!.destination;
}

// ─── Brownian Noise Buffer ──────────────────────────────────────────────────

let noiseBuffer: AudioBuffer | null = null;

function getBrownianNoise(ctx: AudioContext): AudioBuffer {
  if (noiseBuffer) return noiseBuffer;
  const sampleRate = ctx.sampleRate;
  const length = sampleRate * 2; // 2 seconds, looped
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);
  let lastOut = 0;
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1;
    // Brownian: integrate white noise with leak
    lastOut = (lastOut + 0.02 * white) / 1.02;
    data[i] = lastOut * 3.5; // Normalize
  }
  noiseBuffer = buffer;
  return buffer;
}

// ─── Active Drones ──────────────────────────────────────────────────────────

interface DroneNodes {
  osc: OscillatorNode;
  oscGain: GainNode;
  filter: BiquadFilterNode;
  noiseSource: AudioBufferSourceNode;
  noiseGain: GainNode;
  panner: StereoPannerNode;
}

const activeDrones: Map<string, DroneNodes> = new Map();

// Global frequency multiplier for "Drone Resonance" tuning
let globalFreqMultiplier = 1.0;

/**
 * Set the global drone resonance (0-1).
 * 0 = Deep/Grounded (0.5x freq, more noise), 1 = Light/Urgent (2x freq, brighter filter)
 */
export function setDroneResonance(value: number) {
  const clamped = Math.max(0, Math.min(1, value));
  // Map 0-1 to 0.5x-2x frequency multiplier
  globalFreqMultiplier = 0.5 + clamped * 1.5;

  // Update all active drones
  try {
    const ctx = audioCtx;
    if (!ctx) return;
    const t = ctx.currentTime;
    for (const drone of Array.from(activeDrones.values())) {
      // Adjust base frequency
      drone.osc.frequency.exponentialRampToValueAtTime(60 * globalFreqMultiplier, t + 0.1);
      // Lower resonance = more noise weight, higher = brighter filter
      if (clamped < 0.5) {
        drone.noiseGain.gain.exponentialRampToValueAtTime(0.01 + (0.5 - clamped) * 0.02, t + 0.1);
      }
      if (clamped > 0.5) {
        drone.filter.frequency.exponentialRampToValueAtTime(
          drone.filter.frequency.value * (1 + (clamped - 0.5) * 0.5), t + 0.1
        );
      }
    }
  } catch {}
}

/**
 * Start a warm drone for a channel entering the warm zone (>85%).
 * Triangle wave + brownian noise through a low-pass filter.
 */
export function startDrone(channelId: string, pan: number = 0) {
  try {
    if (activeDrones.has(channelId)) return;
    const ctx = getAudioContext();
    if (ctx.state === "suspended") ctx.resume();

    // Panner for spatial positioning
    const panner = ctx.createStereoPanner();
    panner.pan.setValueAtTime(Math.max(-1, Math.min(1, pan)), ctx.currentTime);
    panner.connect(getMaster());

    // Low-pass filter — controls "brightness"
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(120, ctx.currentTime); // Start dark
    filter.Q.setValueAtTime(1, ctx.currentTime);
    filter.connect(panner);

    // Main oscillator — triangle wave for warmth
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(60, ctx.currentTime);
    oscGain.gain.setValueAtTime(0, ctx.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.04, ctx.currentTime + 0.5);
    osc.connect(oscGain);
    oscGain.connect(filter);
    osc.start(ctx.currentTime);

    // Brownian noise — breath-like texture at 3-5% volume
    const noiseSource = ctx.createBufferSource();
    const noiseGain = ctx.createGain();
    noiseSource.buffer = getBrownianNoise(ctx);
    noiseSource.loop = true;
    noiseGain.gain.setValueAtTime(0, ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.008, ctx.currentTime + 0.5);
    noiseSource.connect(noiseGain);
    noiseGain.connect(filter);
    noiseSource.start(ctx.currentTime);

    activeDrones.set(channelId, { osc, oscGain, filter, noiseSource, noiseGain, panner });
  } catch {}
}

/**
 * Update drone intensity based on fader position within the warm zone.
 * Opens the low-pass filter to "brighten" as intensity increases.
 * @param channelId - channel to update
 * @param intensity - 0 (just entered 85%) to 1 (at 100%)
 */
export function updateDrone(channelId: string, intensity: number) {
  try {
    const drone = activeDrones.get(channelId);
    if (!drone) return;
    const ctx = getAudioContext();
    const t = ctx.currentTime;
    const clamped = Math.max(0.001, Math.min(1, intensity));

    // Open the low-pass filter as intensity increases (120Hz → 600Hz)
    drone.filter.frequency.exponentialRampToValueAtTime(120 + clamped * 480, t + 0.08);
    // Main tone gain increases subtly
    drone.oscGain.gain.exponentialRampToValueAtTime(0.03 + clamped * 0.04, t + 0.08);
    // Slight frequency shift for tension
    drone.osc.frequency.exponentialRampToValueAtTime(60 + clamped * 30, t + 0.08);
    // Noise texture increases with intensity
    drone.noiseGain.gain.exponentialRampToValueAtTime(0.005 + clamped * 0.015, t + 0.08);
  } catch {}
}

/**
 * Stop and clean up a channel's drone with smooth fade-out.
 */
export function stopDrone(channelId: string) {
  try {
    const drone = activeDrones.get(channelId);
    if (!drone) return;
    const ctx = getAudioContext();
    const t = ctx.currentTime;

    drone.oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    drone.noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    drone.filter.frequency.exponentialRampToValueAtTime(60, t + 0.3);

    setTimeout(() => {
      try {
        drone.osc.stop();
        drone.noiseSource.stop();
        drone.osc.disconnect();
        drone.noiseSource.disconnect();
        drone.oscGain.disconnect();
        drone.noiseGain.disconnect();
        drone.filter.disconnect();
        drone.panner.disconnect();
      } catch {}
      activeDrones.delete(channelId);
    }, 400);
  } catch {}
}

/**
 * Stop all active drones.
 */
export function stopAllDrones() {
  for (const id of Array.from(activeDrones.keys())) {
    stopDrone(id);
  }
}

/**
 * Solo Ping — soft crystal bowl / Rhodes-like tone.
 * Fast attack, long shimmering release (2-3s) with reverb-like decay.
 */
export function playSoloPing() {
  try {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") ctx.resume();
    const t = ctx.currentTime;

    // Main tone — sine for purity
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, t);
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.03, t + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 2.5);
    osc.connect(gain);
    gain.connect(getMaster());
    osc.start(t);
    osc.stop(t + 2.5);

    // Shimmer overtone — octave above
    const shimmer = ctx.createOscillator();
    const shimmerGain = ctx.createGain();
    shimmer.type = "sine";
    shimmer.frequency.setValueAtTime(1760, t);
    shimmerGain.gain.setValueAtTime(0.02, t);
    shimmerGain.gain.exponentialRampToValueAtTime(0.001, t + 2.0);
    shimmer.connect(shimmerGain);
    shimmerGain.connect(getMaster());
    shimmer.start(t);
    shimmer.stop(t + 2.0);

    // Fifth overtone for "room" feel
    const fifth = ctx.createOscillator();
    const fifthGain = ctx.createGain();
    fifth.type = "sine";
    fifth.frequency.setValueAtTime(1320, t);
    fifthGain.gain.setValueAtTime(0.012, t);
    fifthGain.gain.exponentialRampToValueAtTime(0.001, t + 1.8);
    fifth.connect(fifthGain);
    fifthGain.connect(getMaster());
    fifth.start(t);
    fifth.stop(t + 1.8);
  } catch {}
}

/**
 * Mute Thud — soft felt mallet on low drum.
 */
export function playMuteThud() {
  try {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") ctx.resume();
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(200, t);
    filter.frequency.exponentialRampToValueAtTime(60, t + 0.15);

    osc.type = "triangle";
    osc.frequency.setValueAtTime(100, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.15);
    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(getMaster());
    osc.start(t);
    osc.stop(t + 0.25);
  } catch {}
}

/**
 * Reset Sweep — deep breath / descending whoosh.
 * Wide-spectrum brownian noise sweep with low-pass filter closing.
 */
export function playResetSweep() {
  try {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") ctx.resume();
    const t = ctx.currentTime;

    // Descending tone
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.exponentialRampToValueAtTime(60, t + 1.0);

    osc.type = "triangle";
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 1.0);
    gain.gain.setValueAtTime(0.05, t);
    gain.gain.linearRampToValueAtTime(0.02, t + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(getMaster());
    osc.start(t);
    osc.stop(t + 1.3);

    // Brownian noise layer for "breath" texture
    const noiseSource = ctx.createBufferSource();
    const noiseGain = ctx.createGain();
    const noiseFilter = ctx.createBiquadFilter();
    noiseSource.buffer = getBrownianNoise(ctx);
    noiseFilter.type = "lowpass";
    noiseFilter.frequency.setValueAtTime(600, t);
    noiseFilter.frequency.exponentialRampToValueAtTime(40, t + 1.0);
    noiseGain.gain.setValueAtTime(0.04, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 1.0);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(getMaster());
    noiseSource.start(t);
    noiseSource.stop(t + 1.3);
  } catch {}
}

/**
 * Harmonic Chime — soft bell for boost spring-back.
 * 100ms attack, gentle sine at 660Hz with overtone.
 */
export function playBoostChime() {
  try {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") ctx.resume();
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(660, t);
    gain.gain.setValueAtTime(0.06, t);
    gain.gain.exponentialRampToValueAtTime(0.02, t + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
    osc.connect(gain);
    gain.connect(getMaster());
    osc.start(t);
    osc.stop(t + 0.8);

    // Overtone for shimmer
    const ov = ctx.createOscillator();
    const ovGain = ctx.createGain();
    ov.type = "sine";
    ov.frequency.setValueAtTime(1320, t);
    ovGain.gain.setValueAtTime(0.015, t);
    ovGain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
    ov.connect(ovGain);
    ovGain.connect(getMaster());
    ov.start(t);
    ov.stop(t + 0.6);
  } catch {}
}

/**
 * Fizzle — soft dissolve for channel deletion.
 */
export function playFizzle() {
  try {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") ctx.resume();
    const t = ctx.currentTime;

    const noiseSource = ctx.createBufferSource();
    const noiseGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    noiseSource.buffer = getBrownianNoise(ctx);
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(400, t);
    filter.frequency.exponentialRampToValueAtTime(30, t + 0.4);
    noiseGain.gain.setValueAtTime(0.05, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    noiseSource.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(getMaster());
    noiseSource.start(t);
    noiseSource.stop(t + 0.5);
  } catch {}
}
