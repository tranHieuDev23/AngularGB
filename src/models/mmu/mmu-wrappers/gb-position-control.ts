export class GbPositionControl {
    private scrollY = 0;
    private scrollX = 0;
    private lyc = 0;
    private windowY = 0;
    private windowX = 0;

    public getScrollY(): number {
        return this.scrollY;
    }

    public getScrollX(): number {
        return this.scrollX;
    }

    public getLyc(): number {
        return this.lyc;
    }

    public getWindowY(): number {
        return this.windowY;
    }

    public getWindowX(): number {
        return this.windowX;
    }

    public setScrollY(value: number): void {
        this.scrollY = value;
    }

    public setScrollX(value: number): void {
        this.scrollX = value;
    }

    public setLyc(value: number): void {
        this.lyc = value;
    }

    public setWindowY(value: number): void {
        this.windowY = value;
    }

    public setWindowX(value: number): void {
        this.windowX = value;
    }
}
