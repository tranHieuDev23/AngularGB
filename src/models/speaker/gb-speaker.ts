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

export class GbSpeaker implements Speaker<GbSpeakerInput> {
    private readonly audioCtx = new AudioContext();
    private readonly cyclePerSample: number;
    private readonly bufferSize: number;
    private readonly buffer: AudioBuffer;

    private totalCycleCount = 0;
    private currentBufferId = 0;

    constructor(
        readonly sampleRate: number,
        readonly playRate: number = 60
    ) {
        this.cyclePerSample = Math.floor(CYCLE_PER_SECOND / sampleRate);
        this.bufferSize = sampleRate / playRate;
        this.buffer = this.audioCtx.createBuffer(2, this.bufferSize, sampleRate);
    }

    step(deltaCycleCount: number, input: GbSpeakerInput): void {
        this.totalCycleCount += deltaCycleCount;
        if (this.totalCycleCount < this.cyclePerSample) {
            return;
        }
        this.totalCycleCount -= this.cyclePerSample;
        this.buffer.getChannelData(0)[this.currentBufferId] = input.left;
        this.buffer.getChannelData(1)[this.currentBufferId] = input.right;
        this.currentBufferId++;
        if (this.currentBufferId === this.bufferSize) {
            this.playCurrentBuffer();
            this.currentBufferId = 0;
        }
    }

    private playCurrentBuffer(): void {
        const source = this.audioCtx.createBufferSource();
        source.buffer = this.buffer;
        source.connect(this.audioCtx.destination);
        source.start();
    }
}