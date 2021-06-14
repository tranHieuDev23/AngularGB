export class GbJoypad {
    private buttonStates: number[] = [0x0f, 0x0f];
    private selectedRow = 0;

    constructor() { }

    public getValue(): number {
        switch (this.selectedRow) {
            case 0x10:
                return this.buttonStates[0];
            case 0x20:
                return this.buttonStates[1];
            default:
                return 0x0f;
        }
    }

    public setValue(value: number): void {
        this.selectedRow = value & 0x30;
    }
}
