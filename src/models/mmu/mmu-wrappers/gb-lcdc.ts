import { getBit } from "src/utils/arithmetic-utils";

export class GbLcdc {
    private lcdc = 0;
    constructor() { }

    public getValue(): number {
        return this.lcdc;
    }

    public setValue(value: number): void {
        this.lcdc = value;
    }

    public getLcdAndPpuEnable(): number {
        return getBit(this.lcdc, 7);
    }

    public getWindowTitleMap(): number {
        return getBit(this.lcdc, 6);
    }

    public getWindowEnable(): number {
        return getBit(this.lcdc, 5);
    }

    public getBgAndWindowTileDataArea(): number {
        return getBit(this.lcdc, 4);
    }

    public getBgTitleMap(): number {
        return getBit(this.lcdc, 3);
    }

    public getObjSize(): number {
        return getBit(this.lcdc, 2);
    }

    public getObjEnable(): number {
        return getBit(this.lcdc, 1);
    }

    public getBgAndWindowEnable(): number {
        return getBit(this.lcdc, 0);
    }
}
