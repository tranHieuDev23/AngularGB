import { Speaker, SpeakerInput } from "./speaker";
import { PcmPlayer, PcmPlayerOptions } from "./pcm-player";

export class GbSpeakerInput implements SpeakerInput {
    constructor(
        public readonly left: number,
        public readonly right: number
    ) { }

    public getChannelSample(index: number): number {
        return index === 0 ? this.left : this.right;
    }
}

const CYCLE_PER_SECOND = 4194304;
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
        this.capacitor = input - output * this.chargeFactor;
        return Math.fround(output);
    }
}

export class GbSpeaker implements Speaker<GbSpeakerInput> {
    public readonly sampleRate: number;
    private readonly leftHpf: HighPassFilter;
    private readonly rightHpf: HighPassFilter;
    // Kept as a float — Math.floor() here loses ~0.1 cycles per sample, which
    // is enough drift (~1-5ms/sec) to grow audible SFX latency over time.
    private readonly cyclesPerSample: number;
    private readonly player: PcmPlayer;

    private isMute = false;
    private cycleAccumulator = 0;

    constructor() {
        // Construct the player first so its AudioContext determines the actual
        // device sample rate; everything downstream uses that.
        this.player = new PcmPlayer(new PcmPlayerOptions(2));
        this.sampleRate = this.player.sampleRate;
        this.leftHpf = new HighPassFilter(this.sampleRate);
        this.rightHpf = new HighPassFilter(this.sampleRate);
        this.cyclesPerSample = CYCLE_PER_SECOND / this.sampleRate;
    }

    step(deltaCycleCount: number, input: GbSpeakerInput): void {
        this.cycleAccumulator += deltaCycleCount;
        while (this.cycleAccumulator >= this.cyclesPerSample) {
            this.cycleAccumulator -= this.cyclesPerSample;
            const samples = [
                this.leftHpf.filter(input.left),
                this.rightHpf.filter(input.right)
            ];
            this.player.feed(samples);
        }
    }

    public toggleAudio(): void {
        this.isMute = !this.isMute;
        this.player.toggleAudio(this.isMute);
    }

    public resume(): Promise<void> {
        return this.player.resume();
    }

    public release(): void {
        this.player.release();
    }
}
