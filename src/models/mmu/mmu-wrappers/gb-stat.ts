import { GbGpu } from "src/models/gpu/gb-gpu";
import { getBit } from "src/utils/arithmetic-utils";
import { GbPositionControl } from "./gb-position-control";

export class GbStat {
    private lyEqualLycInterruptEnable: number = 0;
    private modeInterruptEnable: number[] = [0, 0, 0];

    constructor(
        private readonly gpu: GbGpu,
        private readonly positionControl: GbPositionControl
    ) { }

    public getValue(): number {
        return (this.lyEqualLycInterruptEnable << 6)
            | (this.modeInterruptEnable[2] << 5)
            | (this.modeInterruptEnable[1] << 4)
            | (this.modeInterruptEnable[0] << 3)
            | (this.getLycEqualLy() << 2)
            | this.gpu.getMode();
    }

    public getLycEqualLyInterruptEnable(): number {
        return this.lyEqualLycInterruptEnable;
    }

    public getModeInterruptEnable(mode: number): number {
        return this.modeInterruptEnable[mode];
    }

    public getLycEqualLy(): number {
        return this.gpu.getLy() === this.positionControl.getLyc() ? 1 : 0;
    }

    public setValue(value: number): void {
        this.lyEqualLycInterruptEnable = getBit(value, 6);
        this.modeInterruptEnable[2] = getBit(value, 5);
        this.modeInterruptEnable[1] = getBit(value, 4);
        this.modeInterruptEnable[0] = getBit(value, 3);
    }
}
