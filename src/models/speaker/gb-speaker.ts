import { Speaker, SpeakerInput } from "./speaker";
import { AudioContext, AudioBuffer } from "standardized-audio-context";

export class GbSpeakerInput implements SpeakerInput {
    constructor(
        public readonly left: number,
        public readonly right: number
    ) { }

    public getChannelSample(index: number): number {
        return index === 0 ? this.left : this.right;
    }
}

const CYCLE_PER_SECOND = 4213440;
const PLAY_RATE = 10;
const HPF_CHARGE_FACTOR = 0.999958;

class HighPassFilter {
    private readonly chargeFactor: number;
    private capacitor = 0.0;

    constructor(
        readonly sampleRate: number
    ) {
        this.chargeFactor = Math.pow(HPF_CHARGE_FACTOR, 4194304 / sampleRate);
    }

    public filter(input: number): number {
        const output = input - this.capacitor;
        this.capacitor = input - output * HPF_CHARGE_FACTOR;
        return Math.fround(output);
    }
}

export class GbSpeaker implements Speaker<GbSpeakerInput> {
    private readonly audioCtx = new AudioContext();

    private readonly leftHpf: HighPassFilter;
    private readonly rightHpf: HighPassFilter;
    private readonly cyclePerSample: number;
    private readonly bufferSize: number;
    private readonly buffer: AudioBuffer;

    private lastAudioSources = null;
    private totalCycleCount = 0;
    private currentBufferId = 0;

    constructor(
        readonly sampleRate: number,
    ) {
        this.leftHpf = new HighPassFilter(sampleRate);
        this.rightHpf = new HighPassFilter(sampleRate);
        this.cyclePerSample = Math.floor(CYCLE_PER_SECOND / sampleRate);
        this.bufferSize = sampleRate / PLAY_RATE;
        this.buffer = this.audioCtx.createBuffer(2, this.bufferSize, sampleRate);
    }

    step(deltaCycleCount: number, input: GbSpeakerInput): void {
        this.totalCycleCount += deltaCycleCount;
        if (this.totalCycleCount < this.cyclePerSample) {
            return;
        }
        this.totalCycleCount -= this.cyclePerSample;
        this.buffer.getChannelData(0)[this.currentBufferId] = this.leftHpf.filter(input.left);
        this.buffer.getChannelData(1)[this.currentBufferId] = this.rightHpf.filter(input.right);
        this.currentBufferId++;
        if (this.currentBufferId === this.bufferSize) {
            this.playCurrentBuffer();
            this.currentBufferId = 0;
        }
    }

    private playCurrentBuffer(): void {
        if (this.lastAudioSources !== null) {
            this.lastAudioSources.stop();
        }
        this.lastAudioSources = this.audioCtx.createBufferSource();
        this.lastAudioSources.buffer = this.buffer;
        this.lastAudioSources.connect(this.audioCtx.destination);
        this.lastAudioSources.start();
    }
}