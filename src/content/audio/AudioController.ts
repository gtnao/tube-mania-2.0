import { EQ_FREQUENCIES, type AudioState, type EQBandIndex } from "../../shared/messaging";
import { Jungle, semitonesToPitchOffset } from "./jungle";

const EQ_Q_FACTOR = 2.0;
const EQ_MIN_GAIN = -16;
const EQ_MAX_GAIN = 16;

export class AudioController {
  private video: HTMLVideoElement | null = null;
  private audioContext: AudioContext | null = null;
  private mediaSource: MediaElementAudioSourceNode | null = null;

  private inputGain: GainNode | null = null;
  private outputGain: GainNode | null = null;
  private eqFilters: BiquadFilterNode[] = [];
  private jungle: Jungle | null = null;

  private pitchModeGain: GainNode | null = null;
  private nonPitchModeGain: GainNode | null = null;

  private pitch = 0;
  private eqGains: number[] = new Array(10).fill(0);
  private loopEnabled = false;
  private loopStart = 0;
  private loopEnd = 0;

  private initialized = false;

  async initialize(): Promise<boolean> {
    const video = this.findVideoElement();
    if (!video) return false;

    if (this.video === video && this.initialized) {
      return true;
    }

    this.video = video;

    try {
      this.audioContext = new AudioContext();
      this.mediaSource = this.audioContext.createMediaElementSource(video);

      this.inputGain = this.audioContext.createGain();
      this.outputGain = this.audioContext.createGain();

      this.createEqualizer();
      this.createPitchShifter();
      this.connectAudioGraph();
      this.setupLoopHandler();

      this.initialized = true;
      return true;
    } catch (error) {
      console.error("AudioController initialization failed:", error);
      return false;
    }
  }

  private findVideoElement(): HTMLVideoElement | null {
    return document.querySelector("video.html5-main-video") ?? document.querySelector("video");
  }

  private createEqualizer(): void {
    if (!this.audioContext) return;

    this.eqFilters = EQ_FREQUENCIES.map((freq, index) => {
      const filter = this.audioContext!.createBiquadFilter();
      filter.type = "peaking";
      filter.frequency.value = freq;
      filter.Q.value = EQ_Q_FACTOR;
      filter.gain.value = this.eqGains[index];
      return filter;
    });
  }

  private createPitchShifter(): void {
    if (!this.audioContext) return;

    this.jungle = new Jungle(this.audioContext);
    this.pitchModeGain = this.audioContext.createGain();
    this.nonPitchModeGain = this.audioContext.createGain();

    this.pitchModeGain.gain.value = 0;
    this.nonPitchModeGain.gain.value = 1;
  }

  private connectAudioGraph(): void {
    if (
      !this.audioContext ||
      !this.mediaSource ||
      !this.inputGain ||
      !this.outputGain ||
      !this.jungle ||
      !this.pitchModeGain ||
      !this.nonPitchModeGain
    ) {
      return;
    }

    // Media source -> Input gain
    this.mediaSource.connect(this.inputGain);

    // Input gain -> EQ chain
    let currentNode: AudioNode = this.inputGain;
    for (const filter of this.eqFilters) {
      currentNode.connect(filter);
      currentNode = filter;
    }

    // EQ chain -> Pitch mode (Jungle) and Non-pitch mode (direct)
    currentNode.connect(this.jungle.input);
    this.jungle.output.connect(this.pitchModeGain);
    this.pitchModeGain.connect(this.outputGain);

    currentNode.connect(this.nonPitchModeGain);
    this.nonPitchModeGain.connect(this.outputGain);

    // Output gain -> Destination
    this.outputGain.connect(this.audioContext.destination);
  }

  private setupLoopHandler(): void {
    if (!this.video) return;

    this.video.addEventListener("timeupdate", () => {
      if (!this.video || !this.loopEnabled) return;

      if (this.video.currentTime >= this.loopEnd) {
        this.video.currentTime = this.loopStart;
        if (this.video.paused) {
          this.video.play();
        }
      }
    });
  }

  getState(): AudioState {
    const video = this.video;
    const duration = video?.duration ?? 0;

    return {
      currentTime: video?.currentTime ?? 0,
      duration: duration,
      volume: video?.volume ?? 1,
      speed: video?.playbackRate ?? 1,
      pitch: this.pitch,
      eqGains: [...this.eqGains],
      loopEnabled: this.loopEnabled,
      loopStart: this.loopStart,
      loopEnd: this.loopEnd || duration,
      isPlaying: video ? !video.paused : false,
      isReady: this.initialized && !!video,
    };
  }

  play(): boolean {
    if (!this.video) return false;
    this.video.play();
    return true;
  }

  pause(): boolean {
    if (!this.video) return false;
    this.video.pause();
    return true;
  }

  back(seconds: number): number {
    if (!this.video) return 0;
    this.video.currentTime = Math.max(0, this.video.currentTime - seconds);
    return this.video.currentTime;
  }

  setCurrentTime(time: number): number {
    if (!this.video) return 0;
    this.video.currentTime = Math.max(0, Math.min(time, this.video.duration || 0));
    return this.video.currentTime;
  }

  setVolume(volume: number): number {
    if (!this.video) return 1;
    this.video.volume = Math.max(0, Math.min(1, volume));
    return this.video.volume;
  }

  setSpeed(speed: number): number {
    if (!this.video) return 1;
    this.video.playbackRate = Math.max(0.25, Math.min(5, speed));
    return this.video.playbackRate;
  }

  setPitch(semitones: number): number {
    this.pitch = Math.max(-12, Math.min(12, semitones));

    if (!this.jungle || !this.pitchModeGain || !this.nonPitchModeGain) {
      return this.pitch;
    }

    if (this.pitch === 0) {
      this.pitchModeGain.gain.value = 0;
      this.nonPitchModeGain.gain.value = 1;
    } else {
      this.pitchModeGain.gain.value = 1;
      this.nonPitchModeGain.gain.value = 0;
      this.jungle.setPitchOffset(semitonesToPitchOffset(this.pitch));
    }

    return this.pitch;
  }

  setEqBand(bandIndex: EQBandIndex, gain: number): number {
    const clampedGain = Math.max(EQ_MIN_GAIN, Math.min(EQ_MAX_GAIN, gain));
    this.eqGains[bandIndex] = clampedGain;

    if (this.eqFilters[bandIndex]) {
      this.eqFilters[bandIndex].gain.value = clampedGain;
    }

    return clampedGain;
  }

  resetEq(): number[] {
    this.eqGains = new Array(10).fill(0);
    for (const filter of this.eqFilters) {
      filter.gain.value = 0;
    }
    return [...this.eqGains];
  }

  setLoopEnabled(enabled: boolean): boolean {
    this.loopEnabled = enabled;
    if (enabled && this.video) {
      if (this.loopEnd === 0) {
        this.loopEnd = this.video.duration || 0;
      }
    }
    return this.loopEnabled;
  }

  setLoopStart(time: number): number {
    if (!this.video) return 0;
    this.loopStart = Math.max(0, Math.min(time, this.loopEnd || this.video.duration || 0));
    return this.loopStart;
  }

  setLoopEnd(time: number): number {
    if (!this.video) return 0;
    this.loopEnd = Math.max(this.loopStart, Math.min(time, this.video.duration || 0));
    return this.loopEnd;
  }

  getTimeUpdate(): { currentTime: number; duration: number; isPlaying: boolean } {
    return {
      currentTime: this.video?.currentTime ?? 0,
      duration: this.video?.duration ?? 0,
      isPlaying: this.video ? !this.video.paused : false,
    };
  }
}
