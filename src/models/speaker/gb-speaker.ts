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
    private readonly leftHpf: HighPassFilter;
    private readonly rightHpf: HighPassFilter;
    private readonly cyclePerSample: number;
    private readonly player: PcmPlayer;

    private isMute = false;
    private totalCycleCount = 0;

    constructor(
        readonly sampleRate: number,
    ) {
        this.leftHpf = new HighPassFilter(sampleRate);
        this.rightHpf = new HighPassFilter(sampleRate);
        this.cyclePerSample = Math.floor(CYCLE_PER_SECOND / sampleRate);
        this.player = new PcmPlayer(new PcmPlayerOptions(
            2, sampleRate
        ));
    }

    step(deltaCycleCount: number, input: GbSpeakerInput): void {
        this.totalCycleCount += deltaCycleCount;
        if (this.totalCycleCount < this.cyclePerSample) {
            return;
        }
        this.totalCycleCount -= this.cyclePerSample;
        const samples = [
            this.leftHpf.filter(input.left),
            this.rightHpf.filter(input.right)
        ];
        this.player.feed(samples);
    }

    public toggleAudio(): void {
        this.isMute = !this.isMute;
        this.player.toggleAudio(this.isMute);
    }

    public release(): void {
        this.player.release();
    }
}