let achievementAudioContext: AudioContext | null = null;

interface WindowWithWebkitAudio extends Window {
  webkitAudioContext?: typeof AudioContext;
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (achievementAudioContext && achievementAudioContext.state !== 'closed') {
    return achievementAudioContext;
  }

  const AudioContextConstructor =
    window.AudioContext ?? (window as WindowWithWebkitAudio).webkitAudioContext;

  if (!AudioContextConstructor) return null;

  achievementAudioContext = new AudioContextConstructor();
  return achievementAudioContext;
}

function addTone(
  context: AudioContext,
  destinations: AudioNode[],
  frequency: number,
  startsAt: number,
  duration: number,
  volume: number,
  type: OscillatorType,
  detune = 0
): void {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const endsAt = startsAt + duration;

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startsAt);
  oscillator.detune.setValueAtTime(detune, startsAt);
  gain.gain.setValueAtTime(0.0001, startsAt);
  gain.gain.exponentialRampToValueAtTime(volume, startsAt + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, endsAt);

  oscillator.connect(gain);
  destinations.forEach((destination) => gain.connect(destination));
  oscillator.start(startsAt);
  oscillator.stop(endsAt + 0.02);
}

function addRisingSweep(context: AudioContext, destinations: AudioNode[], startsAt: number): void {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const endsAt = startsAt + 0.3;

  oscillator.type = 'triangle';
  oscillator.frequency.setValueAtTime(180, startsAt);
  oscillator.frequency.exponentialRampToValueAtTime(620, endsAt);
  gain.gain.setValueAtTime(0.0001, startsAt);
  gain.gain.exponentialRampToValueAtTime(0.26, startsAt + 0.035);
  gain.gain.exponentialRampToValueAtTime(0.0001, endsAt);

  oscillator.connect(gain);
  destinations.forEach((destination) => gain.connect(destination));
  oscillator.start(startsAt);
  oscillator.stop(endsAt + 0.02);
}

function addImpactBurst(context: AudioContext, destination: AudioNode, startsAt: number): void {
  const duration = 0.18;
  const frameCount = Math.floor(context.sampleRate * duration);
  const buffer = context.createBuffer(1, frameCount, context.sampleRate);
  const samples = buffer.getChannelData(0);

  for (let index = 0; index < frameCount; index += 1) {
    const progress = index / frameCount;
    samples[index] = (Math.random() * 2 - 1) * (1 - progress) ** 2.7;
  }

  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();

  source.buffer = buffer;
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(2600, startsAt);
  filter.frequency.exponentialRampToValueAtTime(900, startsAt + duration);
  filter.Q.setValueAtTime(0.7, startsAt);
  gain.gain.setValueAtTime(0.34, startsAt);
  gain.gain.exponentialRampToValueAtTime(0.0001, startsAt + duration);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(destination);
  source.start(startsAt);
  source.stop(startsAt + duration);
}

function createReverb(context: AudioContext): ConvolverNode {
  const duration = 0.85;
  const frameCount = Math.floor(context.sampleRate * duration);
  const impulse = context.createBuffer(2, frameCount, context.sampleRate);

  for (let channel = 0; channel < impulse.numberOfChannels; channel += 1) {
    const samples = impulse.getChannelData(channel);
    for (let index = 0; index < frameCount; index += 1) {
      const progress = index / frameCount;
      samples[index] = (Math.random() * 2 - 1) * (1 - progress) ** 3.2;
    }
  }

  const reverb = context.createConvolver();
  reverb.buffer = impulse;
  return reverb;
}

function scheduleAchievementSound(context: AudioContext): void {
  const masterGain = context.createGain();
  const compressor = context.createDynamicsCompressor();
  const dryBus = context.createGain();
  const reverb = createReverb(context);
  const reverbGain = context.createGain();
  const startsAt = context.currentTime + 0.025;

  masterGain.gain.setValueAtTime(0.24, startsAt);
  compressor.threshold.setValueAtTime(-18, startsAt);
  compressor.knee.setValueAtTime(12, startsAt);
  compressor.ratio.setValueAtTime(4, startsAt);
  compressor.attack.setValueAtTime(0.003, startsAt);
  compressor.release.setValueAtTime(0.25, startsAt);
  dryBus.gain.setValueAtTime(1, startsAt);
  reverbGain.gain.setValueAtTime(0.22, startsAt);

  dryBus.connect(masterGain);
  reverb.connect(reverbGain);
  reverbGain.connect(masterGain);
  masterGain.connect(compressor);
  compressor.connect(context.destination);

  const resonantDestinations = [dryBus, reverb];

  addImpactBurst(context, dryBus, startsAt);
  addRisingSweep(context, resonantDestinations, startsAt);
  addTone(context, resonantDestinations, 110, startsAt, 0.24, 0.38, 'sine');

  addTone(context, resonantDestinations, 293.66, startsAt + 0.025, 0.66, 0.2, 'triangle');
  addTone(context, resonantDestinations, 440, startsAt + 0.035, 0.72, 0.16, 'sine');
  addTone(context, resonantDestinations, 587.33, startsAt + 0.045, 0.78, 0.24, 'sine');
  addTone(context, resonantDestinations, 739.99, startsAt + 0.06, 0.86, 0.16, 'sine');
  addTone(context, resonantDestinations, 1174.66, startsAt + 0.105, 0.9, 0.1, 'sine', -4);
  addTone(context, resonantDestinations, 1174.66, startsAt + 0.105, 0.9, 0.1, 'sine', 4);

  window.setTimeout(() => {
    dryBus.disconnect();
    reverb.disconnect();
    reverbGain.disconnect();
    masterGain.disconnect();
    compressor.disconnect();
  }, 1800);
}

export function primeAchievementSound(): void {
  const context = getAudioContext();
  if (context?.state === 'suspended') {
    void context.resume().catch(() => undefined);
  }
}

export function playAchievementSound(): void {
  const context = getAudioContext();
  if (!context) return;

  if (context.state === 'suspended') {
    void context
      .resume()
      .then(() => scheduleAchievementSound(context))
      .catch(() => undefined);
    return;
  }

  scheduleAchievementSound(context);
}
