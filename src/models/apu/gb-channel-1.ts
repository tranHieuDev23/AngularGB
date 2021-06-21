import { getBit } from "src/utils/arithmetic-utils";
import { WAVE_DUTIES } from "./gb-apu-utils";
import { GbEnvelopFunction } from "./gb-envelop-func";
import { GbFrameSequencer } from "./gb-frame-sequencer";
import { GbLengthFunction } from "./gb-length-func";
import { GbSweepFunction } from "./gb-sweep-func";

export class GbChannel1 {
    private nr10 = new GbSweepFunction();
    private nr11 = new GbLengthFunction(6);
    private nr12 = new GbEnvelopFunction();
    private nr13 = 0;
    private nr14 = 0;

    private isChannelDisabled = true;
    private selectedWaveDuty = 0;
    private frequencyTimer = 0;
    private frequencyPosition = 0;

    constructor(
        private readonly fs: GbFrameSequencer
    ) { }

    public getNr10(): number {
        return this.nr10.getRegister();
    }

    public getNr11(): number {
        return (this.selectedWaveDuty << 6) | this.nr11.getRegister();
    }

    public getNr12(): number {
        return this.nr12.getRegister();
    }

    public getNr13(): number {
        return this.nr13;
    }

    public getNr14(): number {
        return this.nr14;
    }

    public setNr10(value: number): void {
        this.nr10.setRegister(value);
        this.isChannelDisabled ||= this.nr10.getShouldDisableChannel();
    }

    public setNr11(value: number): void {
        this.selectedWaveDuty = value >> 6;
        this.nr11.setRegister(value);
    }

    public setNr12(value: number): void {
        this.nr12.setRegister(value);
        if (this.nr12.isDacDisabled()) {
            this.isChannelDisabled = true;
        }
    }

    public setNr13(value: number): void {
        this.nr13 = value;
    }

    public setNr14(value: number): void {
        this.nr14 = value & 0xc7;
        if (getBit(this.nr14, 7) === 1) {
            this.nr10.onTriggerEvent(this.getCurrentFrequency());
            this.nr11.onTriggerEvent();
            this.nr12.onTriggerEvent();
            this.frequencyTimer = this.getInitialFrequencyTimer();
            this.frequencyPosition = 0;
            this.isChannelDisabled = this.nr10.getShouldDisableChannel()
                || this.nr11.shouldDisableChannel()
                || this.nr12.isDacDisabled();
        }
    }

    public reset(): void {
        this.nr10.setRegister(0);
        this.nr11.setRegister(0);
        this.nr12.setRegister(0);
        this.nr13 = 0;
        this.nr14 = 0;
        this.isChannelDisabled = true;
        this.selectedWaveDuty = 0;
        this.frequencyTimer = 0;
        this.frequencyPosition = 0;
    }

    public step(deltaCycleCount: number): void {
        if (this.fs.getShouldClockSweep()) {
            if (this.nr10.onClock()) {
                this.setCurrentFrequency(this.nr10.getShadowFrequency());
            }
            this.isChannelDisabled ||= this.nr10.getShouldDisableChannel();
        }
        if (this.fs.getShouldClockLength() && this.shouldStopWhenLengthExpire()) {
            this.nr11.onClock();
            this.isChannelDisabled ||= this.nr11.shouldDisableChannel();
        }
        if (this.fs.getShouldClockEnvelop()) {
            this.nr12.onClock();
        }
        if (!this.isChannelDisabled) {
            this.frequencyTimer = this.frequencyTimer - deltaCycleCount;
            const initialFrequencyTimer = this.getInitialFrequencyTimer();
            while (this.frequencyTimer <= 0) {
                this.frequencyPosition = (this.frequencyPosition + 1) & 0x7;
                this.frequencyTimer += initialFrequencyTimer;
            }
        }
    }

    public getIsChannelDisabled(): boolean {
        return this.isChannelDisabled;
    }

    public getCurrentOutput(): number {
        const amplitude = WAVE_DUTIES[this.selectedWaveDuty][this.frequencyPosition];
        return amplitude === 1 ? this.nr12.getCurrentVolume() : 0;
    }

    private getCurrentFrequency(): number {
        const upper3Bits = this.nr14 & 0x7;
        return (upper3Bits << 8) | this.nr13;
    }

    private getInitialFrequencyTimer(): number {
        return 2048 - this.getCurrentFrequency();
    }

    private setCurrentFrequency(value: number) {
        const upper3Bits = value >> 8;
        const lower8Bits = value & 0xff;
        this.nr13 = lower8Bits;
        this.nr14 = (this.nr14 & 0xf8) | upper3Bits;
    }

    private shouldStopWhenLengthExpire(): boolean {
        return getBit(this.nr14, 6) === 1;
    }
}