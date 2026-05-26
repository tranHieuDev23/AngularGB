import { GbLengthFunction } from "./gb-length-func";

describe("GbLengthFunction (6-bit, channels 1/2/4)", () => {
    let lf: GbLengthFunction;

    beforeEach(() => {
        lf = new GbLengthFunction(6); // maxTimer = 64
    });

    it("does not request channel disable before trigger", () => {
        expect(lf.shouldDisableChannel()).toBe(true); // initial state
    });

    it("setRegister loads counter to maxTimer - value", () => {
        lf.setRegister(60);
        // 64 - 60 = 4 ticks remaining
        for (let i = 0; i < 3; i++) {
            lf.onClock();
            expect(lf.shouldDisableChannel()).toBe(false);
        }
        lf.onClock();
        expect(lf.shouldDisableChannel()).toBe(true);
    });

    it("masks register to 6 bits", () => {
        lf.setRegister(0xff); // upper 2 bits should be masked away
        expect(lf.getRegister()).toBe(0x3f);
    });

    it("onTriggerEvent reloads counter only when it has expired", () => {
        lf.setRegister(63); // 1 tick remaining
        lf.onClock(); // → 0, disable
        expect(lf.shouldDisableChannel()).toBe(true);

        lf.onTriggerEvent(); // counter was 0, reload to 64

        for (let i = 0; i < 63; i++) {
            lf.onClock();
        }
        expect(lf.shouldDisableChannel()).toBe(false);
        lf.onClock();
        expect(lf.shouldDisableChannel()).toBe(true);
    });

    it("onTriggerEvent leaves a non-zero counter alone", () => {
        lf.setRegister(60); // 4 ticks remaining
        lf.onTriggerEvent();
        // Still 4 ticks remaining, not reloaded to 64
        for (let i = 0; i < 3; i++) {
            lf.onClock();
        }
        expect(lf.shouldDisableChannel()).toBe(false);
        lf.onClock();
        expect(lf.shouldDisableChannel()).toBe(true);
    });
});

describe("GbLengthFunction (8-bit, channel 3)", () => {
    it("counts to 256 for the wave channel", () => {
        const lf = new GbLengthFunction(8); // maxTimer = 256
        lf.setRegister(0); // 256 ticks remaining
        for (let i = 0; i < 255; i++) {
            lf.onClock();
        }
        expect(lf.shouldDisableChannel()).toBe(false);
        lf.onClock();
        expect(lf.shouldDisableChannel()).toBe(true);
    });
});
