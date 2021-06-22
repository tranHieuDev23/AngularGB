import { getBit } from "src/utils/arithmetic-utils";
import { GbEnvelopFunction } from "./gb-envelop-func";
import { GbFrameSequencer } from "./gb-frame-sequencer";
import { GbLengthFunction } from "./gb-length-func";

const DIVISORS = [2, 4, 8, 12, 16, 20, 24, 28];

export class GbChannel4 {
    private nr41 = new GbLengthFunction(6);
    private nr42 = new GbEnvelopFunction();
    private nr43 = 0;
    private nr44 = 0;

    private isChannelDisabled = true;
    private frequencyTimer = 0;
    private lfsr = 0;

    constructor(
        private readonly fs: GbFrameSequencer
    ) { }

    public getNr41(): number {
        return this.nr41.getRegister();
    }

    public getNr42(): number {
        return this.nr42.getRegister();
    }

    public getNr43(): number {
        return this.nr43;
    }

    public getNr44(): number {
        return this.nr44;
    }

    public setNr41(value: number): void {
        this.nr41.setRegister(value);
    }

    public setNr42(value: number): void {
        this.nr42.setRegister(value);
        if (this.nr42.isDacDisabled()) {
            this.isChannelDisabled = true;
        }
    }

    public setNr43(value: number): void {
        this.nr43 = value;
    }

    public setNr44(value: number): void {
        const wasLengthDisabled = !this.shouldStopWhenLengthExpire() || this.nr41.shouldDisableChannel();
        this.nr44 = value & 0xc0;
        if (getBit(this.nr44, 7) === 1) {
            this.nr41.onTriggerEvent();
            this.lfsr = 0xffff;
            this.isChannelDisabled = this.nr41.shouldDisableChannel()
                || this.nr42.isDacDisabled();
        }
        // Extra length clocking occurs when writing to NRx4 when the frame
        // sequencer's next step is one that doesn't clock the length counter.
        if (wasLengthDisabled && this.shouldStopWhenLengthExpire() && !this.fs.shouldNextStepClockLength()) {
            this.nr41.onClock();
            this.isChannelDisabled ||= this.nr41.shouldDisableChannel();
        }
    }

    public reset(): void {
        this.nr41.setRegister(0);
        this.nr42.setRegister(0);
        this.nr43 = 0;
        this.nr44 = 0;
        this.isChannelDisabled = true;
        this.frequencyTimer = 0;
        this.lfsr = 0;
    }

    public step(deltaCycleCount: number): void {
        if (this.fs.getShouldClockLength() && this.shouldStopWhenLengthExpire()) {
            this.nr41.onClock();
            this.isChannelDisabled ||= this.nr41.shouldDisableChannel();
        }
        if (this.fs.getShouldClockEnvelop()) {
            this.nr42.onClock();
        }
        if (!this.isChannelDisabled) {
            this.frequencyTimer = this.frequencyTimer - deltaCycleCount;
            const initialFrequencyTimer = this.getInitialFrequencyTimer();
            while (this.frequencyTimer <= 0) {
                this.onFrequencyTimerOverflow();
                this.frequencyTimer += initialFrequencyTimer;
            }
        }
    }

    public getIsChannelDisabled(): boolean {
        return this.isChannelDisabled;
    }

    public getCurrentOutput(): number {
        return getBit(this.lfsr, 0) === 1 ? this.nr42.getCurrentVolume() : 0;
    }

    private onFrequencyTimerOverflow(): void {
        const xorBit = getBit(this.lfsr, 0) ^ getBit(this.lfsr, 1);
        this.lfsr = (this.lfsr >> 1) | (xorBit << 14);
        if (this.shouldApplyBit6()) {
            this.lfsr = ((this.lfsr) & 0xffbf) | (xorBit << 6);
        }
    }

    private getInitialFrequencyTimer(): number {
        return DIVISORS[this.getClockDivisorCode()] << this.getClockFrequencyShift();
    }

    private getClockFrequencyShift(): number {
        return this.nr43 >> 4;
    }

    private shouldApplyBit6(): boolean {
        return getBit(this.nr43, 3) === 1;
    }

    private getClockDivisorCode(): number {
        return this.nr43 & 0x7;
    }

    private shouldStopWhenLengthExpire(): boolean {
        return getBit(this.nr44, 6) === 1;
    }
}