import { GB_INSTRUCTION_SET } from "./gb-instruction-set";

describe("gb-instruction-set", () => {
    it("should have correct opcode", () => {
        GB_INSTRUCTION_SET.forEach((item, index) => {
            if (item === null) {
                return;
            }
            expect(item.getOpcode()).toEqual(index);
        });
    });
});
