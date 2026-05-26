import { GbEnvelopFunction } from "./gb-envelop-func";

describe("GbEnvelopFunction", () => {
    let env: GbEnvelopFunction;

    beforeEach(() => {
        env = new GbEnvelopFunction();
    });

    it("isDacDisabled returns true when upper 5 bits are zero", () => {
        env.setRegister(0x00);
        expect(env.isDacDisabled()).toBe(true);

        env.setRegister(0x07); // only period bits set
        expect(env.isDacDisabled()).toBe(true);

        env.setRegister(0x08); // direction bit only
        expect(env.isDacDisabled()).toBe(false);

        env.setRegister(0xf0); // initial volume bits set
        expect(env.isDacDisabled()).toBe(false);
    });

    it("trigger loads initial volume from upper 4 bits", () => {
        env.setRegister(0xa3); // volume=10, increasing=0, period=3
        env.onTriggerEvent();
        expect(env.getCurrentVolume()).toBe(10);
    });

    it("decreasing envelope counts volume down by 1 every period clocks", () => {
        env.setRegister(0xf2); // volume=15, direction=decreasing, period=2
        env.onTriggerEvent();
        expect(env.getCurrentVolume()).toBe(15);

        env.onClock();
        expect(env.getCurrentVolume()).toBe(15);
        env.onClock();
        expect(env.getCurrentVolume()).toBe(14);
        env.onClock();
        expect(env.getCurrentVolume()).toBe(14);
        env.onClock();
        expect(env.getCurrentVolume()).toBe(13);
    });

    it("increasing envelope counts volume up", () => {
        env.setRegister(0x0a); // volume=0, increasing, period=2
        env.onTriggerEvent();
        expect(env.getCurrentVolume()).toBe(0);

        env.onClock();
        env.onClock();
        expect(env.getCurrentVolume()).toBe(1);
    });

    it("period=0 disables envelope clocking", () => {
        env.setRegister(0x80); // volume=8, decreasing, period=0
        env.onTriggerEvent();
        for (let i = 0; i < 20; i++) {
            env.onClock();
        }
        expect(env.getCurrentVolume()).toBe(8);
    });

    it("volume saturates at 0 and 15", () => {
        env.setRegister(0x01); // volume=0, decreasing, period=1
        env.onTriggerEvent();
        for (let i = 0; i < 10; i++) {
            env.onClock();
        }
        expect(env.getCurrentVolume()).toBe(0); // doesn't underflow

        env.setRegister(0xf9); // volume=15, increasing, period=1
        env.onTriggerEvent();
        for (let i = 0; i < 10; i++) {
            env.onClock();
        }
        expect(env.getCurrentVolume()).toBe(15); // doesn't overflow
    });
});
