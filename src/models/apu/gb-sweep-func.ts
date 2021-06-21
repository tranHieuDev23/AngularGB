import { getBit } from "src/utils/arithmetic-utils";

export class GbSweepFunction {
    private register = 0;

    private sweepEnabled = false;
    private shouldDisableChannel = false;
    private shadowFrequency = 0;
    private sweepTimer = 0;
    private decreasingDone = false;

    public getRegister(): number {
        return this.register;
    }

    public setRegister(value: number) {
        const wasDecreasing = !this.isIncreasing();
        this.register = value & 0x7f;
        // Clearing the sweep negate mode bit in NR10 after at least one sweep
        // calculation has been made using the negate mode since the last 
        // trigger causes the channel to be immediately disabled. This prevents
        // you from having the sweep lower the frequency then raise the 
        // frequency without a trigger in between.
        if (wasDecreasing && this.decreasingDone && this.isIncreasing()) {
            this.shouldDisableChannel = true;
        }
    }

    public onTriggerEvent(currentFrequency: number): void {
        this.decreasingDone = false;
        this.shadowFrequency = currentFrequency;
        const sweepPeriod = this.getSweepStepPeriod();
        if (sweepPeriod === 0) {
            this.sweepTimer = 8;
        } else {
            this.sweepTimer = sweepPeriod;
        }
        const sweepShift = this.getSweepShift();
        this.sweepEnabled = sweepPeriod !== 0 || sweepShift !== 0;
        if (sweepShift !== 0) {
            // Overflow check
            const newFrequency = this.calculateNewFrequency(sweepShift);
            if (newFrequency > 2047) {
                this.sweepEnabled = false;
                this.shouldDisableChannel = true;
            } else {
                this.shouldDisableChannel = false;
            }
        } else {
            this.shouldDisableChannel = false;
        }
    }

    public onClock(): boolean {
        if (this.sweepTimer !== 0) {
            this.sweepTimer--;
        }
        if (this.sweepTimer !== 0) {
            return false;
        }
        const sweepPeriod = this.getSweepStepPeriod();
        if (sweepPeriod === 0) {
            this.sweepTimer = 8;
        } else {
            this.sweepTimer = sweepPeriod;
        }
        if (!this.sweepEnabled || sweepPeriod === 0) {
            return false;
        }
        const sweepShift = this.getSweepShift();
        const newFrequency = this.calculateNewFrequency(sweepShift);
        // Overflow check
        if (newFrequency > 2047) {
            this.sweepEnabled = false;
            this.shouldDisableChannel = true;
            return false;
        }
        if (sweepShift === 0) {
            return false;
        }
        this.shadowFrequency = newFrequency;
        const laterFrequency = this.calculateNewFrequency(sweepShift);
        // Overflow check again
        if (laterFrequency > 2047) {
            this.sweepEnabled = false;
            this.shouldDisableChannel = true;
        }
        return true;
    }

    public getShadowFrequency(): number {
        return this.shadowFrequency;
    }

    public getShouldDisableChannel(): boolean {
        return this.shouldDisableChannel;
    }

    private calculateNewFrequency(sweepShift: number): number {
        // This is used to trigger negate mode's obscure behavior
        const isIncreasing = this.isIncreasing();
        this.decreasingDone ||= !isIncreasing;
        const delta = this.shadowFrequency >> sweepShift;
        return isIncreasing ? this.shadowFrequency + delta : this.shadowFrequency - delta;
    }

    private getSweepStepPeriod(): number {
        return this.register >> 4;
    }

    private isIncreasing(): boolean {
        return getBit(this.register, 3) === 0;
    }

    private getSweepShift(): number {
        return this.register & 0x7;
    }
}