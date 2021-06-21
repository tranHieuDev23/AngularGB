const CYCLE_PER_FS_STEP = 2048;

export class GbFrameSequencer {
    private totalCycleCount = CYCLE_PER_FS_STEP;
    private currentStep = 7;
    private shouldClockLength = false;
    private shouldClockEnvelop = false;
    private shouldClockSweep = false;

    public reset(): void {
        // Setting this value like this allow the following step to become step 0
        this.currentStep = 7;
    }

    public step(deltaCycleCount: number): void {
        this.totalCycleCount += deltaCycleCount;
        this.shouldClockLength = false;
        this.shouldClockEnvelop = false;
        this.shouldClockSweep = false;
        if (this.totalCycleCount >= CYCLE_PER_FS_STEP) {
            this.currentStep = (this.currentStep + 1) & 0x7;
            // Step 0, 2, 4, 6
            this.shouldClockLength = (this.currentStep & 1) === 0;
            // Step 7
            this.shouldClockEnvelop = this.currentStep === 7;
            // Step 2, 6
            this.shouldClockSweep = (this.currentStep & 3) === 2;
            this.totalCycleCount &= 0x7ff;
        }
    }

    public shouldNextStepClockLength(): boolean {
        return (this.currentStep & 1) === 1;
    }

    public getShouldClockLength(): boolean {
        return this.shouldClockLength;
    }

    public getShouldClockEnvelop(): boolean {
        return this.shouldClockEnvelop;
    }

    public getShouldClockSweep(): boolean {
        return this.shouldClockSweep;
    }
}