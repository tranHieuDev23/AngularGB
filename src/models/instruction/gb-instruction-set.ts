import { RegisterName } from "../register/gb-registers";
import { Gb16BitArg, Gb8BitArg, Gb16BitDecArg, Gb16BitIncArg, GbMemArg, GbRegisterArg } from "./gb-instruction";
import { AdcInstruction } from "./gb-instruction/adc";
import { Add16BitRegisterInstruction, Add8BitInstruction, GbE8Instruction } from "./gb-instruction/add";
import { AndInstruction } from "./gb-instruction/and";
import { CpInstruction } from "./gb-instruction/cp";
import { Dec16BitInstruction, Dec8BitInstruction } from "./gb-instruction/dec";
import { Inc16BitInstruction, Inc8BitInstruction } from "./gb-instruction/inc";
import { GbF8Instruction, LdInstruction } from "./gb-instruction/ld";
import { NopInstruction } from "./gb-instruction/nop";
import { OrInstruction } from "./gb-instruction/or";
import { SbcInstruction } from "./gb-instruction/sbc";
import { StopInstruction } from "./gb-instruction/stop";
import { SubInstruction } from "./gb-instruction/sub";
import { XorInstruction } from "./gb-instruction/xor";

const REG_ARG_A = new GbRegisterArg(RegisterName.A);
const REG_ARG_B = new GbRegisterArg(RegisterName.B);
const REG_ARG_C = new GbRegisterArg(RegisterName.C);
const REG_ARG_D = new GbRegisterArg(RegisterName.D);
const REG_ARG_E = new GbRegisterArg(RegisterName.E);
const REG_ARG_F = new GbRegisterArg(RegisterName.F);
const REG_ARG_H = new GbRegisterArg(RegisterName.H);
const REG_ARG_L = new GbRegisterArg(RegisterName.L);
const REG_ARG_SP = new GbRegisterArg(RegisterName.SP);
const REG_ARG_PC = new GbRegisterArg(RegisterName.PC);
const REG_ARG_AF = new GbRegisterArg(RegisterName.AF);
const REG_ARG_BC = new GbRegisterArg(RegisterName.BC);
const REG_ARG_DE = new GbRegisterArg(RegisterName.DE);
const REG_ARG_HL = new GbRegisterArg(RegisterName.HL);

const REG_ARG_HL_INC = new Gb16BitIncArg(REG_ARG_HL);
const REG_ARG_HL_DEC = new Gb16BitDecArg(REG_ARG_HL);

const D8_ARG = new Gb8BitArg(0);
const D16_ARG = new Gb16BitArg(0);

const MEM_REG_ARG_C = new GbMemArg(REG_ARG_C);
const MEM_REG_ARG_BC = new GbMemArg(REG_ARG_BC);
const MEM_REG_ARG_DE = new GbMemArg(REG_ARG_DE);
const MEM_REG_ARG_HL = new GbMemArg(REG_ARG_HL);
const MEM_REG_ARG_HL_INC = new GbMemArg(REG_ARG_HL_INC);
const MEM_REG_ARG_HL_DEC = new GbMemArg(REG_ARG_HL_DEC);

const MEM_D8_ARG = new GbMemArg(D8_ARG);
const MEM_D16_ARG = new GbMemArg(D16_ARG);

export const GB_INSTRUCTION_SET = [
    // 0x0x
    new NopInstruction(), new LdInstruction(0x01, 3, REG_ARG_BC, D16_ARG),
    new LdInstruction(0x02, 2, MEM_REG_ARG_BC, REG_ARG_A), new Inc16BitInstruction(0x03, REG_ARG_BC),
    new Inc8BitInstruction(0x04, REG_ARG_B), new Dec8BitInstruction(0x05, REG_ARG_B),
    new LdInstruction(0x06, 2, REG_ARG_B, D8_ARG), null,
    new LdInstruction(0x08, 5, MEM_D16_ARG, REG_ARG_SP), new Add16BitRegisterInstruction(0x09, REG_ARG_HL, REG_ARG_BC),
    new LdInstruction(0x0a, 2, REG_ARG_A, MEM_REG_ARG_BC), new Dec16BitInstruction(0x0b, REG_ARG_BC),
    new Inc8BitInstruction(0x0c, REG_ARG_C), new Dec8BitInstruction(0x0d, REG_ARG_C),
    new LdInstruction(0x0e, 2, REG_ARG_C, D8_ARG), null,

    // 0x1x
    new StopInstruction(), new LdInstruction(0x11, 3, REG_ARG_DE, D16_ARG),
    new LdInstruction(0x12, 2, MEM_REG_ARG_DE, REG_ARG_A), new Inc16BitInstruction(0x13, REG_ARG_DE),
    new Inc8BitInstruction(0x14, REG_ARG_D), new Dec8BitInstruction(0x15, REG_ARG_D),
    new LdInstruction(0x16, 2, REG_ARG_D, D8_ARG), null,
    null, new Add16BitRegisterInstruction(0x19, REG_ARG_HL, REG_ARG_DE),
    new LdInstruction(0x1a, 2, REG_ARG_A, MEM_REG_ARG_DE), new Dec16BitInstruction(0x1b, REG_ARG_DE),
    new Inc8BitInstruction(0x1c, REG_ARG_E), new Dec8BitInstruction(0x1d, REG_ARG_E),
    new LdInstruction(0x1e, 2, REG_ARG_E, D8_ARG), null,

    // 0x2x
    null, new LdInstruction(0x21, 3, REG_ARG_HL, D16_ARG),
    new LdInstruction(0x22, 2, MEM_REG_ARG_HL_INC, REG_ARG_A), new Inc16BitInstruction(0x23, REG_ARG_HL),
    new Inc8BitInstruction(0x24, REG_ARG_H), new Dec8BitInstruction(0x25, REG_ARG_H),
    new LdInstruction(0x26, 2, REG_ARG_H, D8_ARG), null,
    null, new Add16BitRegisterInstruction(0x29, REG_ARG_HL, REG_ARG_HL),
    new LdInstruction(0x2a, 2, REG_ARG_A, MEM_REG_ARG_HL_INC), new Dec16BitInstruction(0x2b, REG_ARG_HL),
    new Inc8BitInstruction(0x2c, REG_ARG_L), new Dec8BitInstruction(0x2d, REG_ARG_L),
    new LdInstruction(0x2e, 2, REG_ARG_L, D8_ARG), null,

    // 0x3x
    null, new LdInstruction(0x31, 3, REG_ARG_SP, D16_ARG),
    new LdInstruction(0x32, 2, MEM_REG_ARG_HL_DEC, REG_ARG_A), new Inc16BitInstruction(0x33, REG_ARG_SP),
    new Inc8BitInstruction(0x34, MEM_REG_ARG_HL), new Dec8BitInstruction(0x35, MEM_REG_ARG_HL),
    new LdInstruction(0x36, 3, MEM_REG_ARG_HL, D8_ARG), null,
    null, new Add16BitRegisterInstruction(0x39, REG_ARG_HL, REG_ARG_SP),
    new LdInstruction(0x3a, 2, REG_ARG_A, MEM_REG_ARG_HL_DEC), new Dec16BitInstruction(0x3b, REG_ARG_SP),
    new Inc8BitInstruction(0x3c, REG_ARG_A), new Inc8BitInstruction(0x3d, REG_ARG_A),
    new LdInstruction(0x3e, 2, REG_ARG_A, D8_ARG), null,

    // 0x4x
    new LdInstruction(0x40, 1, REG_ARG_B, REG_ARG_B), new LdInstruction(0x41, 1, REG_ARG_B, REG_ARG_C),
    new LdInstruction(0x42, 1, REG_ARG_B, REG_ARG_D), new LdInstruction(0x43, 1, REG_ARG_B, REG_ARG_E),
    new LdInstruction(0x44, 1, REG_ARG_B, REG_ARG_H), new LdInstruction(0x45, 1, REG_ARG_B, REG_ARG_L),
    new LdInstruction(0x46, 2, REG_ARG_B, MEM_REG_ARG_HL), new LdInstruction(0x47, 1, REG_ARG_B, REG_ARG_A),
    new LdInstruction(0x48, 1, REG_ARG_C, REG_ARG_B), new LdInstruction(0x49, 1, REG_ARG_C, REG_ARG_C),
    new LdInstruction(0x4a, 1, REG_ARG_C, REG_ARG_D), new LdInstruction(0x4b, 1, REG_ARG_C, REG_ARG_E),
    new LdInstruction(0x4c, 1, REG_ARG_C, REG_ARG_H), new LdInstruction(0x4d, 1, REG_ARG_C, REG_ARG_L),
    new LdInstruction(0x4e, 2, REG_ARG_C, MEM_REG_ARG_HL), new LdInstruction(0x4f, 1, REG_ARG_C, REG_ARG_A),

    // 0x5x
    new LdInstruction(0x50, 1, REG_ARG_D, REG_ARG_B), new LdInstruction(0x51, 1, REG_ARG_D, REG_ARG_C),
    new LdInstruction(0x52, 1, REG_ARG_D, REG_ARG_D), new LdInstruction(0x53, 1, REG_ARG_D, REG_ARG_E),
    new LdInstruction(0x54, 1, REG_ARG_D, REG_ARG_H), new LdInstruction(0x55, 1, REG_ARG_D, REG_ARG_L),
    new LdInstruction(0x56, 2, REG_ARG_D, MEM_REG_ARG_HL), new LdInstruction(0x57, 1, REG_ARG_D, REG_ARG_A),
    new LdInstruction(0x58, 1, REG_ARG_E, REG_ARG_B), new LdInstruction(0x59, 1, REG_ARG_E, REG_ARG_C),
    new LdInstruction(0x5a, 1, REG_ARG_E, REG_ARG_D), new LdInstruction(0x5b, 1, REG_ARG_E, REG_ARG_E),
    new LdInstruction(0x5c, 1, REG_ARG_E, REG_ARG_H), new LdInstruction(0x5d, 1, REG_ARG_E, REG_ARG_L),
    new LdInstruction(0x5e, 2, REG_ARG_E, MEM_REG_ARG_HL), new LdInstruction(0x5f, 1, REG_ARG_E, REG_ARG_A),

    // 0x6x
    new LdInstruction(0x60, 1, REG_ARG_H, REG_ARG_B), new LdInstruction(0x61, 1, REG_ARG_H, REG_ARG_C),
    new LdInstruction(0x62, 1, REG_ARG_H, REG_ARG_D), new LdInstruction(0x63, 1, REG_ARG_H, REG_ARG_E),
    new LdInstruction(0x64, 1, REG_ARG_H, REG_ARG_H), new LdInstruction(0x65, 1, REG_ARG_H, REG_ARG_L),
    new LdInstruction(0x66, 2, REG_ARG_H, MEM_REG_ARG_HL), new LdInstruction(0x67, 1, REG_ARG_H, REG_ARG_A),
    new LdInstruction(0x68, 1, REG_ARG_L, REG_ARG_B), new LdInstruction(0x69, 1, REG_ARG_L, REG_ARG_C),
    new LdInstruction(0x6a, 1, REG_ARG_L, REG_ARG_D), new LdInstruction(0x6b, 1, REG_ARG_L, REG_ARG_E),
    new LdInstruction(0x6c, 1, REG_ARG_L, REG_ARG_H), new LdInstruction(0x6d, 1, REG_ARG_L, REG_ARG_L),
    new LdInstruction(0x6e, 2, REG_ARG_L, MEM_REG_ARG_HL), new LdInstruction(0x6f, 1, REG_ARG_L, REG_ARG_A),

    // 0x7x
    new LdInstruction(0x70, 1, MEM_REG_ARG_HL, REG_ARG_B), new LdInstruction(0x71, 1, MEM_REG_ARG_HL, REG_ARG_C),
    new LdInstruction(0x72, 1, MEM_REG_ARG_HL, REG_ARG_D), new LdInstruction(0x73, 1, MEM_REG_ARG_HL, REG_ARG_E),
    new LdInstruction(0x74, 1, MEM_REG_ARG_HL, REG_ARG_H), new LdInstruction(0x75, 1, MEM_REG_ARG_HL, REG_ARG_L),
    null, new LdInstruction(0x77, 1, MEM_REG_ARG_HL, REG_ARG_A),
    new LdInstruction(0x78, 1, REG_ARG_A, REG_ARG_B), new LdInstruction(0x79, 1, REG_ARG_A, REG_ARG_C),
    new LdInstruction(0x7a, 1, REG_ARG_A, REG_ARG_D), new LdInstruction(0x7b, 1, REG_ARG_A, REG_ARG_E),
    new LdInstruction(0x7c, 1, REG_ARG_A, REG_ARG_H), new LdInstruction(0x7d, 1, REG_ARG_A, REG_ARG_L),
    new LdInstruction(0x7e, 2, REG_ARG_A, MEM_REG_ARG_HL), new LdInstruction(0x7f, 1, REG_ARG_A, REG_ARG_A),

    // 0x8x
    new Add8BitInstruction(0x80, REG_ARG_A, REG_ARG_B), new Add8BitInstruction(0x81, REG_ARG_A, REG_ARG_C),
    new Add8BitInstruction(0x82, REG_ARG_A, REG_ARG_D), new Add8BitInstruction(0x83, REG_ARG_A, REG_ARG_E),
    new Add8BitInstruction(0x84, REG_ARG_A, REG_ARG_H), new Add8BitInstruction(0x85, REG_ARG_A, REG_ARG_L),
    new Add8BitInstruction(0x86, REG_ARG_A, MEM_REG_ARG_HL), new Add8BitInstruction(0x87, REG_ARG_A, REG_ARG_A),
    new AdcInstruction(0x88, REG_ARG_B), new AdcInstruction(0x89, REG_ARG_C),
    new AdcInstruction(0x8a, REG_ARG_D), new AdcInstruction(0x8b, REG_ARG_E),
    new AdcInstruction(0x8c, REG_ARG_H), new AdcInstruction(0x8d, REG_ARG_L),
    new AdcInstruction(0x8e, MEM_REG_ARG_HL), new AdcInstruction(0x8f, REG_ARG_A),

    // 0x9x
    new SubInstruction(0x80, REG_ARG_B), new SubInstruction(0x81, REG_ARG_C),
    new SubInstruction(0x82, REG_ARG_D), new SubInstruction(0x83, REG_ARG_E),
    new SubInstruction(0x84, REG_ARG_H), new SubInstruction(0x85, REG_ARG_L),
    new SubInstruction(0x86, MEM_REG_ARG_HL), new SubInstruction(0x87, REG_ARG_A),
    new SbcInstruction(0x88, REG_ARG_B), new SbcInstruction(0x89, REG_ARG_C),
    new SbcInstruction(0x8a, REG_ARG_D), new SbcInstruction(0x8b, REG_ARG_E),
    new SbcInstruction(0x8c, REG_ARG_H), new SbcInstruction(0x8d, REG_ARG_L),
    new SbcInstruction(0x8e, MEM_REG_ARG_HL), new SbcInstruction(0x8f, REG_ARG_A),

    // 0xax
    new AndInstruction(0x80, REG_ARG_B), new AndInstruction(0x81, REG_ARG_C),
    new AndInstruction(0x82, REG_ARG_D), new AndInstruction(0x83, REG_ARG_E),
    new AndInstruction(0x84, REG_ARG_H), new AndInstruction(0x85, REG_ARG_L),
    new AndInstruction(0x86, MEM_REG_ARG_HL), new AndInstruction(0x87, REG_ARG_A),
    new XorInstruction(0x88, REG_ARG_B), new XorInstruction(0x89, REG_ARG_C),
    new XorInstruction(0x8a, REG_ARG_D), new XorInstruction(0x8b, REG_ARG_E),
    new XorInstruction(0x8c, REG_ARG_H), new XorInstruction(0x8d, REG_ARG_L),
    new XorInstruction(0x8e, MEM_REG_ARG_HL), new XorInstruction(0x8f, REG_ARG_A),

    // 0xbx
    new OrInstruction(0x80, REG_ARG_B), new OrInstruction(0x81, REG_ARG_C),
    new OrInstruction(0x82, REG_ARG_D), new OrInstruction(0x83, REG_ARG_E),
    new OrInstruction(0x84, REG_ARG_H), new OrInstruction(0x85, REG_ARG_L),
    new OrInstruction(0x86, MEM_REG_ARG_HL), new OrInstruction(0x87, REG_ARG_A),
    new CpInstruction(0x88, REG_ARG_B), new CpInstruction(0x89, REG_ARG_C),
    new CpInstruction(0x8a, REG_ARG_D), new CpInstruction(0x8b, REG_ARG_E),
    new SbcInstruction(0x8c, REG_ARG_H), new CpInstruction(0x8d, REG_ARG_L),
    new CpInstruction(0x8e, MEM_REG_ARG_HL), new CpInstruction(0x8f, REG_ARG_A),

    // 0xcx
    null, null,
    null, null,
    null, null,
    new Add8BitInstruction(0xc6, REG_ARG_A, D8_ARG), null,
    null, null,
    null, null,
    null, null,
    new AdcInstruction(0xce, D8_ARG), null,

    // 0xdx
    null, null,
    null, null,
    null, null,
    new SubInstruction(0xd6, D8_ARG), null,
    null, null,
    null, null,
    null, null,
    new SbcInstruction(0xde, D8_ARG), null,

    // 0xex
    new LdInstruction(0xe0, 3, MEM_D8_ARG, REG_ARG_A), null,
    new LdInstruction(0xe0, 2, MEM_REG_ARG_C, REG_ARG_A), null,
    null, null,
    new AndInstruction(0xe6, D8_ARG), null,
    new GbE8Instruction(), null,
    new LdInstruction(0xea, 4, MEM_D16_ARG, REG_ARG_A), null,
    null, null,
    new XorInstruction(0xee, D8_ARG), null,

    // 0xfx
    new LdInstruction(0xf0, 3, REG_ARG_A, MEM_D8_ARG), null,
    new LdInstruction(0xf0, 2, REG_ARG_A, MEM_REG_ARG_C), null,
    null, null,
    new OrInstruction(0xf6, D8_ARG), null,
    new GbF8Instruction(), null,
    new LdInstruction(0xea, 4, REG_ARG_A, MEM_D16_ARG), null,
    null, null,
    new CpInstruction(0xfe, D8_ARG), null,
];