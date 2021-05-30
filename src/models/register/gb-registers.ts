import { Register, RegisterSet } from "./register";

export class Register8Bit extends Register {
    public bitCount(): number {
        return 8;
    }
}

export class Register16Bit extends Register {
    public bitCount(): number {
        return 16;
    }
}

const EIGHT_ONE_BITS = ((1 << 8) - 1);

export class DualRegister extends Register16Bit {
    constructor(
        protected readonly name: string,
        private readonly subRegister1: Register8Bit,
        private readonly subRegister2: Register8Bit
    ) {
        super(name);
    }

    public getName(): string {
        return this.name;
    }

    getValue(): number {
        return (this.subRegister2.getValue() << 8) | this.subRegister1.getValue();
    }

    setValue(value: number): void {
        const subRegister2Value = (value >> 8) & EIGHT_ONE_BITS;
        const subRegister1Value = value & EIGHT_ONE_BITS;
        this.subRegister1.setValue(subRegister1Value);
        this.subRegister2.setValue(subRegister2Value);
    }
}

export class GbRegisterSet implements RegisterSet {
    public readonly a = new Register8Bit("A");
    public readonly b = new Register8Bit("B");
    public readonly c = new Register8Bit("C");
    public readonly d = new Register8Bit("D");
    public readonly e = new Register8Bit("E");
    public readonly f = new Register8Bit("F");
    public readonly h = new Register8Bit("H");
    public readonly l = new Register8Bit("L");
    public readonly sp = new Register16Bit("SP");
    public readonly pc = new Register16Bit("PC");

    public readonly af = new DualRegister("AF", this.a, this.f);
    public readonly bc = new DualRegister("BC", this.b, this.c);
    public readonly de = new DualRegister("DE", this.d, this.e);
    public readonly hl = new DualRegister("HL", this.h, this.l);

    constructor() { }

    public getPc(): Register {
        return this.pc;
    }

    public getAllRegister(): Register[] {
        return [
            this.a, this.b, this.c, this.d,
            this.e, this.f, this.h, this.l,
            this.sp, this.pc
        ];
    }
}
