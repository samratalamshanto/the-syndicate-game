// Lightweight synthesized game audio (no asset files) + haptics. Honors the mute flag.
export type SoundName = 'coin' | 'reveal' | 'eliminate' | 'turn' | 'challenge' | 'win';

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

let ctx: AudioContext | null = null;

const getCtx = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  const AC = window.AudioContext ?? (window as WebkitWindow).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
};

type ToneOptions = {
  freq: number;
  type?: OscillatorType;
  start?: number;
  dur?: number;
  gain?: number;
  freqEnd?: number;
};

const tone = (audio: AudioContext, { freq, type = 'sine', start = 0, dur = 0.12, gain = 0.2, freqEnd }: ToneOptions) => {
  const t0 = audio.currentTime + start;
  const osc = audio.createOscillator();
  const env = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (freqEnd) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, freqEnd), t0 + dur);
  }
  env.gain.setValueAtTime(0.0001, t0);
  env.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
  env.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(env).connect(audio.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.03);
};

const patterns: Record<SoundName, (audio: AudioContext) => void> = {
  coin: (a) => {
    tone(a, { freq: 1180, type: 'triangle', dur: 0.06, gain: 0.16 });
    tone(a, { freq: 1560, type: 'triangle', start: 0.05, dur: 0.08, gain: 0.12 });
  },
  turn: (a) => tone(a, { freq: 520, type: 'sine', dur: 0.12, gain: 0.1, freqEnd: 680 }),
  reveal: (a) => tone(a, { freq: 320, type: 'sine', dur: 0.26, gain: 0.14, freqEnd: 780 }),
  eliminate: (a) => {
    tone(a, { freq: 200, type: 'sine', dur: 0.32, gain: 0.22, freqEnd: 70 });
    tone(a, { freq: 140, type: 'square', dur: 0.16, gain: 0.07 });
  },
  challenge: (a) => {
    tone(a, { freq: 330, type: 'sawtooth', dur: 0.16, gain: 0.14 });
    tone(a, { freq: 247, type: 'sawtooth', start: 0.08, dur: 0.2, gain: 0.14 });
  },
  win: (a) => [523, 659, 784, 1047].forEach((f, i) => tone(a, { freq: f, type: 'triangle', start: i * 0.1, dur: 0.22, gain: 0.15 })),
};

// Haptics only for the dramatic beats — buzzing on every coin would be annoying.
const vibration: Partial<Record<SoundName, number | number[]>> = {
  eliminate: [25, 40, 25],
  challenge: [15, 30, 15],
  win: [10, 30, 10, 30, 45],
};

export const playSound = (name: SoundName, muted: boolean): void => {
  if (muted) return;
  try {
    const audio = getCtx();
    if (audio) patterns[name]?.(audio);
  } catch {
    // audio unavailable — ignore
  }
  try {
    const pattern = vibration[name];
    if (pattern !== undefined && typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(pattern);
    }
  } catch {
    // vibration unsupported — ignore
  }
};
