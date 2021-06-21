export class GbLengthFunction {
    private readonly maxTimer: number;
    private readonly registerMask: number;

    private register = 0;
    private lengthTimer = 0;
    private disableChannel = true;

    constructor(
        readonly bitCnt: number
    ) {
        this.maxTimer = 1 << bitCnt;
        this.registerMask = this.maxTimer - 1;
    }

    public getRegister(): number {
        return this.register;
    }

    public setRegister(value: number) {
        this.register = value & this.registerMask;
        this.lengthTimer = this.maxTimer - this.register;
        this.disableChannel = false;
    }

    public onTriggerEvent(): void {
        if (this.lengthTimer === 0) {
            this.lengthTimer = this.maxTimer;
            this.disableChannel = false;
        }
    }

    public onClock(): void {
        if (this.lengthTimer > 0) {
            this.lengthTimer--;
            if (this.lengthTimer === 0) {
                this.disableChannel = true;
            }
        }
    }

    public shouldDisableChannel(): boolean {
        return this.disableChannel;
    }
}