export enum DirectionButton {
    RIGHT = 0,
    LEFT = 1,
    UP = 2,
    DOWN = 3
}

export enum ActionButton {
    A = 0,
    B = 1,
    SELECT = 2,
    START = 3
}

export class GbJoypad {
    private directionButtonState = 0xf;
    private actionButtonState = 0xf;
    private selectedRow = 0;

    constructor() { }

    public getValue(): number {
        switch (this.selectedRow) {
            case 0x20:
                return this.selectedRow | this.directionButtonState;
            case 0x10:
                return this.selectedRow | this.actionButtonState;
            default:
                return this.selectedRow | 0xf;
        }
    }

    public setValue(value: number): void {
        this.selectedRow = value & 0x30;
    }

    public pressDirectionButton(button: DirectionButton): void {
        this.directionButtonState &= 0xf ^ (1 << button.valueOf());
    }

    public pressActionButton(button: ActionButton): void {
        this.actionButtonState &= 0xf ^ (1 << button.valueOf());
    }

    public releaseDirectionButton(button: DirectionButton): void {
        this.directionButtonState |= (1 << button.valueOf());
    }

    public releaseActionButton(button: ActionButton): void {
        this.actionButtonState |= (1 << button.valueOf());
    }
}
