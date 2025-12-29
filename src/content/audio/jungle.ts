// Jungle - Pitch Shifter using Web Audio API
// Based on Google's implementation (BSD license)
// TypeScript port for Tube Mania 2.0

const DELAY_TIME = 0.1;
const FADE_TIME = 0.05;
const BUFFER_TIME = 0.1;

function createFadeBuffer(context: AudioContext, activeTime: number, fadeTime: number): AudioBuffer {
  const length1 = activeTime * context.sampleRate;
  const length2 = (activeTime - 2 * fadeTime) * context.sampleRate;
  const length = length1 + length2;
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const p = buffer.getChannelData(0);

  const fadeLength = fadeTime * context.sampleRate;
  const fadeIndex1 = fadeLength;
  const fadeIndex2 = length1 - fadeLength;

  for (let i = 0; i < length1; ++i) {
    let value: number;
    if (i < fadeIndex1) {
      value = Math.sqrt(i / fadeLength);
    } else if (i >= fadeIndex2) {
      value = Math.sqrt(1 - (i - fadeIndex2) / fadeLength);
    } else {
      value = 1;
    }
    p[i] = value;
  }

  for (let i = length1; i < length; ++i) {
    p[i] = 0;
  }

  return buffer;
}

function createDelayTimeBuffer(
  context: AudioContext,
  activeTime: number,
  fadeTime: number,
  shiftUp: boolean,
): AudioBuffer {
  const length1 = activeTime * context.sampleRate;
  const length2 = (activeTime - 2 * fadeTime) * context.sampleRate;
  const length = length1 + length2;
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const p = buffer.getChannelData(0);

  for (let i = 0; i < length1; ++i) {
    if (shiftUp) {
      p[i] = (length1 - i) / length;
    } else {
      p[i] = i / length1;
    }
  }

  for (let i = length1; i < length; ++i) {
    p[i] = 0;
  }

  return buffer;
}

export class Jungle {
  readonly input: GainNode;
  readonly output: GainNode;

  private context: AudioContext;
  private mod1Gain: GainNode;
  private mod2Gain: GainNode;
  private mod3Gain: GainNode;
  private mod4Gain: GainNode;
  private modGain1: GainNode;
  private modGain2: GainNode;

  constructor(context: AudioContext) {
    this.context = context;

    this.input = context.createGain();
    this.output = context.createGain();

    const shiftDownBuffer = createDelayTimeBuffer(context, BUFFER_TIME, FADE_TIME, false);
    const shiftUpBuffer = createDelayTimeBuffer(context, BUFFER_TIME, FADE_TIME, true);

    const mod1 = context.createBufferSource();
    const mod2 = context.createBufferSource();
    const mod3 = context.createBufferSource();
    const mod4 = context.createBufferSource();

    mod1.buffer = shiftDownBuffer;
    mod2.buffer = shiftDownBuffer;
    mod3.buffer = shiftUpBuffer;
    mod4.buffer = shiftUpBuffer;
    mod1.loop = true;
    mod2.loop = true;
    mod3.loop = true;
    mod4.loop = true;

    this.mod1Gain = context.createGain();
    this.mod2Gain = context.createGain();
    this.mod3Gain = context.createGain();
    this.mod3Gain.gain.value = 0;
    this.mod4Gain = context.createGain();
    this.mod4Gain.gain.value = 0;

    mod1.connect(this.mod1Gain);
    mod2.connect(this.mod2Gain);
    mod3.connect(this.mod3Gain);
    mod4.connect(this.mod4Gain);

    this.modGain1 = context.createGain();
    this.modGain2 = context.createGain();

    const delay1 = context.createDelay();
    const delay2 = context.createDelay();

    this.mod1Gain.connect(this.modGain1);
    this.mod2Gain.connect(this.modGain2);
    this.mod3Gain.connect(this.modGain1);
    this.mod4Gain.connect(this.modGain2);
    this.modGain1.connect(delay1.delayTime);
    this.modGain2.connect(delay2.delayTime);

    const fadeBuffer = createFadeBuffer(context, BUFFER_TIME, FADE_TIME);

    const fade1 = context.createBufferSource();
    const fade2 = context.createBufferSource();
    fade1.buffer = fadeBuffer;
    fade2.buffer = fadeBuffer;
    fade1.loop = true;
    fade2.loop = true;

    const mix1 = context.createGain();
    const mix2 = context.createGain();
    mix1.gain.value = 0;
    mix2.gain.value = 0;

    fade1.connect(mix1.gain);
    fade2.connect(mix2.gain);

    this.input.connect(delay1);
    this.input.connect(delay2);
    delay1.connect(mix1);
    delay2.connect(mix2);
    mix1.connect(this.output);
    mix2.connect(this.output);

    const t = context.currentTime + 0.05;
    const t2 = t + BUFFER_TIME - FADE_TIME;
    mod1.start(t);
    mod2.start(t2);
    mod3.start(t);
    mod4.start(t2);
    fade1.start(t);
    fade2.start(t2);

    this.setDelay(DELAY_TIME);
  }

  private setDelay(delayTime: number): void {
    this.modGain1.gain.setTargetAtTime(0.5 * delayTime, 0, 0.01);
    this.modGain2.gain.setTargetAtTime(0.5 * delayTime, 0, 0.01);
  }

  setPitchOffset(mult: number): void {
    if (mult > 0) {
      this.mod1Gain.gain.value = 0;
      this.mod2Gain.gain.value = 0;
      this.mod3Gain.gain.value = 1;
      this.mod4Gain.gain.value = 1;
    } else {
      this.mod1Gain.gain.value = 1;
      this.mod2Gain.gain.value = 1;
      this.mod3Gain.gain.value = 0;
      this.mod4Gain.gain.value = 0;
    }
    this.setDelay(DELAY_TIME * Math.abs(mult));
  }
}

// Convert semitones to Jungle pitch offset value
export function semitonesToPitchOffset(semitones: number): number {
  if (semitones === 0) return 0;
  if (semitones > 0) {
    return (Math.pow(Math.pow(2, 1 / 12), semitones) - 1) * 2;
  }
  return -1 + (Math.pow(Math.pow(2, 1 / 12), 12 + semitones) - 1);
}
