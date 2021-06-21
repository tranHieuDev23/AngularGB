import { getBit } from "src/utils/arithmetic-utils";
import { WAVE_RAM_START } from "../mmu/gb-mmu-constants";
import { GbFrameSequencer } from "./gb-frame-sequencer";
import { GbLengthFunction } from "./gb-length-func";

export class GbChannel3 {
    private nr30 = 0;
    private nr31 = new GbLengthFunction(8);
    private nr32 = 0;
    private nr33 = 0;
    private nr34 = 0;
    private waveRam = new Array<number>(16).fill(0);

    private isChannelDisabled = true;
    private outputLevelShift = 4;
    private frequencyTimer = 0;
    private frequencyPosition = 0;

    constructor(
        private readonly fs: GbFrameSequencer
    ) { }

    public getNr30(): number {
        return this.nr30;
    }

    public getNr31(): number {
        return this.nr31.getRegister();
    }

    public getNr32(): number {
        return this.nr32;
    }

    public getNr33(): number {
        return this.nr33;
    }

    public getNr34(): number {
        return this.nr34;
    }

    public getWaveRam(address: number): number {
        return this.waveRam[address - WAVE_RAM_START];
    }

    public setNr30(value: number): void {
        this.nr30 = value & 0x80;
        this.isChannelDisabled ||= this.nr30 === 0;
    }

    public setNr31(value: number): void {
        this.nr31.setRegister(value);
    }

    public setNr32(value: number): void {
        this.nr32 = value & 0x60;
        switch (this.nr32 >> 5) {
            case 0:
                this.outputLevelShift = 4;
                this.isChannelDisabled = true;
                break;
            case 1:
                this.outputLevelShift = 0;
                break;
            case 2:
                this.outputLevelShift = 1;
                break;
            case 3:
                this.outputLevelShift = 2;
                break;
        }
    }

    public setNr33(value: number): void {
        this.nr33 = value;
    }

    public setNr34(value: number): void {
        const wasLengthDisabled = !this.shouldStopWhenLengthExpire() || this.nr31.shouldDisableChannel();
        this.nr34 = value & 0xc7;
        if (getBit(this.nr34, 7) === 1) {
            this.nr31.onTriggerEvent();
            this.frequencyTimer = this.getInitialFrequencyTimer();
            this.frequencyPosition = 0;
            this.isChannelDisabled = this.nr30 === 0
                || this.nr31.shouldDisableChannel();
        }
        // Extra length clocking occurs when writing to NRx4 when the frame
        // sequencer's next step is one that doesn't clock the length counter.
        if (wasLengthDisabled && this.shouldStopWhenLengthExpire() && !this.fs.shouldNextStepClockLength()) {
            this.nr31.onClock();
            this.isChannelDisabled ||= this.nr31.shouldDisableChannel();
        }
    }

    public setWaveRam(address: number, value: number): void {
        this.waveRam[address - WAVE_RAM_START] = value;
    }

    public reset(): void {
        this.nr30 = 0;
        this.nr31.setRegister(0);
        this.nr32 = 0;
        this.nr33 = 0;
        this.nr34 = 0;
        // this.waveRam.fill(0);
        this.isChannelDisabled = true;
        this.outputLevelShift = 4;
        this.frequencyTimer = 0;
        this.frequencyPosition = 0;
    }

    public step(deltaCycleCount: number): void {
        if (this.fs.getShouldClockLength() && this.shouldStopWhenLengthExpire()) {
            this.nr31.onClock();
            this.isChannelDisabled ||= this.nr31.shouldDisableChannel();
        }
        if (!this.isChannelDisabled) {
            this.frequencyTimer = this.frequencyTimer - deltaCycleCount;
            const initialFrequencyTimer = this.getInitialFrequencyTimer();
            while (this.frequencyTimer <= 0) {
                this.frequencyPosition = (this.frequencyPosition + 1) & 0x1f;
                this.frequencyTimer += initialFrequencyTimer;
            }
        }
    }

    public getIsChannelDisabled(): boolean {
        return this.isChannelDisabled;
    }

    public getCurrentOutput(): number {
        const currentWaveByte = this.getCurrentWaveByte();
        const shouldPlayUpper = (this.frequencyPosition & 1) === 0;
        const waveValue = shouldPlayUpper
            ? currentWaveByte >> 4
            : currentWaveByte & 0xf;
        return waveValue >> this.outputLevelShift;
    }

    public getCurrentWaveByte(): number {
        const waveIndex = this.frequencyPosition >> 1;
        return this.waveRam[waveIndex];
    }

    private getCurrentFrequency(): number {
        const upper3Bits = this.nr34 & 0x7;
        return (upper3Bits << 8) | this.nr33;
    }

    private getInitialFrequencyTimer(): number {
        return 2048 - this.getCurrentFrequency();
    }

    private shouldStopWhenLengthExpire(): boolean {
        return getBit(this.nr34, 6) === 1;
    }
}