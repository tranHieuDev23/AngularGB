export class GbPalettes {
    private bgPalette: number = 0;
    private objPalette: number[] = [0, 0];

    public getBgPalette() {
        return this.bgPalette;
    }

    public getBgPaletteColor(index: number) {
        return (this.bgPalette >> (index << 1)) & 3;
    }

    public setBgPalette(value: number): void {
        this.bgPalette = value;
    }

    public getObjPalette(paletteNumber: number) {
        return this.objPalette[paletteNumber];
    }

    public getObjPaletteColor(paletteNumber: number, index: number) {
        return (this.objPalette[paletteNumber] >> (index << 1)) & 3;
    }

    public setObjPalette(paletteNumber: number, value: number): void {
        this.objPalette[paletteNumber] = value;
    }
}
