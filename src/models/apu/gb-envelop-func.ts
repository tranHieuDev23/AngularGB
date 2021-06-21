import { getBit } from "src/utils/arithmetic-utils";

export class GbEnvelopFunction {
    private register = 0;
    private periodTimer = 0;
    private currentVolume = 0;

    public getRegister(): number {
        return this.register;
    }

    public setRegister(value: number) {
        this.register = value;
    }

    public onTriggerEvent(): void {
        this.periodTimer = this.getEnvelopStepPeriod();
        this.currentVolume = this.getInitialVolume();
    }

    public onClock(): void {
        if (this.getEnvelopStepPeriod() === 0) {
            return;
        }
        if (this.periodTimer !== 0) {
            this.periodTimer--;
        }
        if (this.periodTimer !== 0) {
            return;
        }
        this.periodTimer = this.getEnvelopStepPeriod();
        if (this.isIncreasing()) {
            if (this.currentVolume < 0xf) {
                this.currentVolume++;
            }
        } else {
            if (this.currentVolume > 0) {
                this.currentVolume--;
            }
        }
    }

    public getCurrentVolume(): number {
        return this.currentVolume;
    }

    public isDacDisabled(): boolean {
        return (this.register & 0xf8) === 0;
    }

    private getInitialVolume(): number {
        return this.register >> 4;
    }

    private isIncreasing(): boolean {
        return getBit(this.register, 3) === 1;
    }

    private getEnvelopStepPeriod(): number {
        return this.register & 0x7;
    }
}