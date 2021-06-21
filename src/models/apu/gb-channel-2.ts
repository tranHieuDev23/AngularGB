import { getBit } from "src/utils/arithmetic-utils";
import { WAVE_DUTIES } from "./gb-apu-utils";
import { GbEnvelopFunction } from "./gb-envelop-func";
import { GbFrameSequencer } from "./gb-frame-sequencer";
import { GbLengthFunction } from "./gb-length-func";

export class GbChannel2 {
    private nr21 = new GbLengthFunction(6);
    private nr22 = new GbEnvelopFunction();
    private nr23 = 0;
    private nr24 = 0;

    private isChannelDisabled = true;
    private selectedWaveDuty = 0;
    private frequencyTimer = 0;
    private frequencyPosition = 0;

    constructor(
        private readonly fs: GbFrameSequencer
    ) { }

    public getNr21(): number {
        return (this.selectedWaveDuty << 6) | this.nr21.getRegister();
    }

    public getNr22(): number {
        return this.nr22.getRegister();
    }

    public getNr23(): number {
        return this.nr23;
    }

    public getNr24(): number {
        return this.nr24;
    }

    public setNr21(value: number): void {
        this.selectedWaveDuty = value >> 6;
        this.nr21.setRegister(value);
    }

    public setNr22(value: number): void {
        this.nr22.setRegister(value);
        if (this.nr22.isDacDisabled()) {
            this.isChannelDisabled = true;
        }
    }

    public setNr23(value: number): void {
        this.nr23 = value;
    }

    public setNr24(value: number): void {
        const wasLengthDisabled = !this.shouldStopWhenLengthExpire() || this.nr21.shouldDisableChannel();
        this.nr24 = value & 0xc7;
        if (getBit(this.nr24, 7) === 1) {
            this.nr21.onTriggerEvent();
            this.nr22.onTriggerEvent();
            this.frequencyTimer = this.getInitialFrequencyTimer();
            this.frequencyPosition = 0;
            this.isChannelDisabled = this.nr21.shouldDisableChannel()
                || this.nr22.isDacDisabled();;
        }
        // Extra length clocking occurs when writing to NRx4 when the frame
        // sequencer's next step is one that doesn't clock the length counter.
        if (wasLengthDisabled && this.shouldStopWhenLengthExpire() && !this.fs.shouldNextStepClockLength()) {
            this.nr21.onClock();
            this.isChannelDisabled ||= this.nr21.shouldDisableChannel();
        }
    }

    public reset(): void {
        this.nr21.setRegister(0);
        this.nr22.setRegister(0);
        this.nr23 = 0;
        this.nr24 = 0;
        this.isChannelDisabled = true;
        this.selectedWaveDuty = 0;
        this.frequencyTimer = 0;
        this.frequencyPosition = 0;
    }

    public step(deltaCycleCount: number): void {
        if (this.fs.getShouldClockLength() && this.shouldStopWhenLengthExpire()) {
            this.nr21.onClock();
            this.isChannelDisabled ||= this.nr21.shouldDisableChannel();
        }
        if (this.fs.getShouldClockEnvelop()) {
            this.nr22.onClock();
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
        return amplitude === 1 ? this.nr22.getCurrentVolume() : 0;
    }

    private getCurrentFrequency(): number {
        const upper3Bits = this.nr24 & 0x7;
        return (upper3Bits << 8) | this.nr23;
    }

    private getInitialFrequencyTimer(): number {
        return 2048 - this.getCurrentFrequency();
    }

    private shouldStopWhenLengthExpire(): boolean {
        return getBit(this.nr24, 6) === 1;
    }
}