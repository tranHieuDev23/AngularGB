import { Flag, RegisterName } from "../register/gb-registers";
import { Gb16BitArg, Gb8BitArg, Gb16BitDecArg, Gb16BitIncArg, GbMemArg, GbRegisterArg, GbFlagArg, GbNotArg } from "./gb-instruction";
import { AdcInstruction } from "./gb-instruction/adc/adc";
import { Add16BitRegisterInstruction, Add8BitInstruction, GbE8Instruction } from "./gb-instruction/add/add";
import { AndInstruction } from "./gb-instruction/and/and";
import { BitInstruction } from "./gb-instruction/bit/bit";
import { CallFlagInstruction, CallInstruction } from "./gb-instruction/call/call";
import { CcfInstruction } from "./gb-instruction/ccf/ccf";
import { CpInstruction } from "./gb-instruction/cp/cp";
import { CplInstruction } from "./gb-instruction/cpl/cpl";
import { DaaInstruction } from "./gb-instruction/daa/daa";
import { Dec16BitInstruction, Dec8BitInstruction } from "./gb-instruction/dec/dec";
import { DiInstruction } from "./gb-instruction/di/di";
import { EiInstruction } from "./gb-instruction/ei/ei";
import { HaltInstruction } from "./gb-instruction/halt/halt";
import { Inc16BitInstruction, Inc8BitInstruction } from "./gb-instruction/inc/inc";
import { JpFlagInstruction, JpInstruction } from "./gb-instruction/jp/jp";
import { JrFlagInstruction, JrInstruction } from "./gb-instruction/jr/jr";
import { GbF8Instruction, LdInstruction } from "./gb-instruction/ld/ld";
import { NopInstruction } from "./gb-instruction/nop/nop";
import { OrInstruction } from "./gb-instruction/or/or";
import { PopInstruction } from "./gb-instruction/pop/pop";
import { PushInstruction } from "./gb-instruction/push/push";
import { ResInstruction } from "./gb-instruction/res/res";
import { RetFlagInstruction, RetInstruction } from "./gb-instruction/ret/ret";
import { RetiInstruction } from "./gb-instruction/reti/reti";
import { RlInstruction } from "./gb-instruction/rl/rl";
import { Gb07Instruction, RlcInstruction } from "./gb-instruction/rlc/rlc";
import { RrInstruction } from "./gb-instruction/rr/rr";
import { Gb0fInstruction, RrcInstruction } from "./gb-instruction/rrc/rrc";
import { RstInstruction } from "./gb-instruction/rst/rst";
import { SbcInstruction } from "./gb-instruction/sbc/sbc";
import { ScfInstruction } from "./gb-instruction/scf/scf";
import { SetInstruction } from "./gb-instruction/set/set";
import { SlaInstruction } from "./gb-instruction/sl/sl";
import { SraInstruction, SrlInstruction } from "./gb-instruction/sr/sr";
import { StopInstruction } from "./gb-instruction/stop/stop";
import { SubInstruction } from "./gb-instruction/sub/sub";
import { SwapInstruction } from "./gb-instruction/swap/swap";
import { XorInstruction } from "./gb-instruction/xor/xor";

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

const FLAG_ARG_Z = new GbFlagArg(Flag.Zero);
const FLAG_ARG_C = new GbFlagArg(Flag.Carry);
const FLAG_ARG_NOT_Z = new GbNotArg(FLAG_ARG_Z);
const FLAG_ARG_NOT_C = new GbNotArg(FLAG_ARG_C);

export const GB_INSTRUCTION_SET = [
    // 0x0x
    new NopInstruction(), new LdInstruction(0x01, 3, REG_ARG_BC, D16_ARG),
    new LdInstruction(0x02, 2, MEM_REG_ARG_BC, REG_ARG_A), new Inc16BitInstruction(0x03, REG_ARG_BC),
    new Inc8BitInstruction(0x04, REG_ARG_B), new Dec8BitInstruction(0x05, REG_ARG_B),
    new LdInstruction(0x06, 2, REG_ARG_B, D8_ARG), new Gb07Instruction(),
    new LdInstruction(0x08, 5, MEM_D16_ARG, REG_ARG_SP), new Add16BitRegisterInstruction(0x09, REG_ARG_HL, REG_ARG_BC),
    new LdInstruction(0x0a, 2, REG_ARG_A, MEM_REG_ARG_BC), new Dec16BitInstruction(0x0b, REG_ARG_BC),
    new Inc8BitInstruction(0x0c, REG_ARG_C), new Dec8BitInstruction(0x0d, REG_ARG_C),
    new LdInstruction(0x0e, 2, REG_ARG_C, D8_ARG), new Gb0fInstruction(),

    // 0x1x
    new StopInstruction(), new LdInstruction(0x11, 3, REG_ARG_DE, D16_ARG),
    new LdInstruction(0x12, 2, MEM_REG_ARG_DE, REG_ARG_A), new Inc16BitInstruction(0x13, REG_ARG_DE),
    new Inc8BitInstruction(0x14, REG_ARG_D), new Dec8BitInstruction(0x15, REG_ARG_D),
    new LdInstruction(0x16, 2, REG_ARG_D, D8_ARG), new RlInstruction(0x17, REG_ARG_A),
    new JrInstruction(), new Add16BitRegisterInstruction(0x19, REG_ARG_HL, REG_ARG_DE),
    new LdInstruction(0x1a, 2, REG_ARG_A, MEM_REG_ARG_DE), new Dec16BitInstruction(0x1b, REG_ARG_DE),
    new Inc8BitInstruction(0x1c, REG_ARG_E), new Dec8BitInstruction(0x1d, REG_ARG_E),
    new LdInstruction(0x1e, 2, REG_ARG_E, D8_ARG), new RrInstruction(0x1f, REG_ARG_A),

    // 0x2x
    new JrFlagInstruction(0x20, FLAG_ARG_NOT_Z), new LdInstruction(0x21, 3, REG_ARG_HL, D16_ARG),
    new LdInstruction(0x22, 2, MEM_REG_ARG_HL_INC, REG_ARG_A), new Inc16BitInstruction(0x23, REG_ARG_HL),
    new Inc8BitInstruction(0x24, REG_ARG_H), new Dec8BitInstruction(0x25, REG_ARG_H),
    new LdInstruction(0x26, 2, REG_ARG_H, D8_ARG), new DaaInstruction(),
    new JrFlagInstruction(0x28, FLAG_ARG_Z), new Add16BitRegisterInstruction(0x29, REG_ARG_HL, REG_ARG_HL),
    new LdInstruction(0x2a, 2, REG_ARG_A, MEM_REG_ARG_HL_INC), new Dec16BitInstruction(0x2b, REG_ARG_HL),
    new Inc8BitInstruction(0x2c, REG_ARG_L), new Dec8BitInstruction(0x2d, REG_ARG_L),
    new LdInstruction(0x2e, 2, REG_ARG_L, D8_ARG), new CplInstruction(),

    // 0x3x
    new JrFlagInstruction(0x30, FLAG_ARG_NOT_C), new LdInstruction(0x31, 3, REG_ARG_SP, D16_ARG),
    new LdInstruction(0x32, 2, MEM_REG_ARG_HL_DEC, REG_ARG_A), new Inc16BitInstruction(0x33, REG_ARG_SP),
    new Inc8BitInstruction(0x34, MEM_REG_ARG_HL), new Dec8BitInstruction(0x35, MEM_REG_ARG_HL),
    new LdInstruction(0x36, 3, MEM_REG_ARG_HL, D8_ARG), new ScfInstruction(),
    new JrFlagInstruction(0x38, FLAG_ARG_C), new Add16BitRegisterInstruction(0x39, REG_ARG_HL, REG_ARG_SP),
    new LdInstruction(0x3a, 2, REG_ARG_A, MEM_REG_ARG_HL_DEC), new Dec16BitInstruction(0x3b, REG_ARG_SP),
    new Inc8BitInstruction(0x3c, REG_ARG_A), new Inc8BitInstruction(0x3d, REG_ARG_A),
    new LdInstruction(0x3e, 2, REG_ARG_A, D8_ARG), new CcfInstruction(),

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
    new HaltInstruction(), new LdInstruction(0x77, 1, MEM_REG_ARG_HL, REG_ARG_A),
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
    new SubInstruction(0x90, REG_ARG_B), new SubInstruction(0x91, REG_ARG_C),
    new SubInstruction(0x92, REG_ARG_D), new SubInstruction(0x93, REG_ARG_E),
    new SubInstruction(0x94, REG_ARG_H), new SubInstruction(0x95, REG_ARG_L),
    new SubInstruction(0x96, MEM_REG_ARG_HL), new SubInstruction(0x97, REG_ARG_A),
    new SbcInstruction(0x98, REG_ARG_B), new SbcInstruction(0x99, REG_ARG_C),
    new SbcInstruction(0x9a, REG_ARG_D), new SbcInstruction(0x9b, REG_ARG_E),
    new SbcInstruction(0x9c, REG_ARG_H), new SbcInstruction(0x9d, REG_ARG_L),
    new SbcInstruction(0x9e, MEM_REG_ARG_HL), new SbcInstruction(0x9f, REG_ARG_A),

    // 0xax
    new AndInstruction(0xa0, REG_ARG_B), new AndInstruction(0xa1, REG_ARG_C),
    new AndInstruction(0xa2, REG_ARG_D), new AndInstruction(0xa3, REG_ARG_E),
    new AndInstruction(0xa4, REG_ARG_H), new AndInstruction(0xa5, REG_ARG_L),
    new AndInstruction(0xa6, MEM_REG_ARG_HL), new AndInstruction(0xa7, REG_ARG_A),
    new XorInstruction(0xa8, REG_ARG_B), new XorInstruction(0xa9, REG_ARG_C),
    new XorInstruction(0xaa, REG_ARG_D), new XorInstruction(0xab, REG_ARG_E),
    new XorInstruction(0xac, REG_ARG_H), new XorInstruction(0xad, REG_ARG_L),
    new XorInstruction(0xae, MEM_REG_ARG_HL), new XorInstruction(0xaf, REG_ARG_A),

    // 0xbx
    new OrInstruction(0xb0, REG_ARG_B), new OrInstruction(0xb1, REG_ARG_C),
    new OrInstruction(0xb2, REG_ARG_D), new OrInstruction(0xb3, REG_ARG_E),
    new OrInstruction(0xb4, REG_ARG_H), new OrInstruction(0xb5, REG_ARG_L),
    new OrInstruction(0xb6, MEM_REG_ARG_HL), new OrInstruction(0xb7, REG_ARG_A),
    new CpInstruction(0xb8, REG_ARG_B), new CpInstruction(0xb9, REG_ARG_C),
    new CpInstruction(0xba, REG_ARG_D), new CpInstruction(0xbb, REG_ARG_E),
    new SbcInstruction(0xbc, REG_ARG_H), new CpInstruction(0xbd, REG_ARG_L),
    new CpInstruction(0xbe, MEM_REG_ARG_HL), new CpInstruction(0xbf, REG_ARG_A),

    // 0xcx
    new RetFlagInstruction(0xc0, FLAG_ARG_NOT_Z), new PopInstruction(0xc1, REG_ARG_BC),
    new JpFlagInstruction(0xc2, FLAG_ARG_NOT_Z, D16_ARG), new JpInstruction(0xc3, D16_ARG),
    new CallFlagInstruction(0xc4, FLAG_ARG_NOT_Z, D16_ARG), new PushInstruction(0xc5, REG_ARG_BC),
    new Add8BitInstruction(0xc6, REG_ARG_A, D8_ARG), new RstInstruction(0xc7, 0x00),
    new RetFlagInstruction(0xc8, FLAG_ARG_Z), new RetInstruction(),
    new JpFlagInstruction(0xca, FLAG_ARG_Z, D16_ARG), null,
    new CallFlagInstruction(0xcc, FLAG_ARG_Z, D16_ARG), new CallInstruction(D16_ARG),
    new AdcInstruction(0xce, D8_ARG), new RstInstruction(0xcf, 0x08),

    // 0xdx
    new RetFlagInstruction(0xd0, FLAG_ARG_NOT_C), new PopInstruction(0xd1, REG_ARG_DE),
    new JpFlagInstruction(0xd2, FLAG_ARG_NOT_C, D16_ARG), null,
    new CallFlagInstruction(0xd4, FLAG_ARG_NOT_C, D16_ARG), new PushInstruction(0xd5, REG_ARG_DE),
    new SubInstruction(0xd6, D8_ARG), new RstInstruction(0xd7, 0x10),
    new RetFlagInstruction(0xd8, FLAG_ARG_C), new RetiInstruction(),
    new JpFlagInstruction(0xda, FLAG_ARG_C, D16_ARG), null,
    new CallFlagInstruction(0xdc, FLAG_ARG_C, D16_ARG), null,
    new SbcInstruction(0xde, D8_ARG), new RstInstruction(0xdf, 0x18),

    // 0xex
    new LdInstruction(0xe0, 3, MEM_D8_ARG, REG_ARG_A), new PopInstruction(0xe1, REG_ARG_HL),
    new LdInstruction(0xe2, 2, MEM_REG_ARG_C, REG_ARG_A), null,
    null, new PushInstruction(0xe5, REG_ARG_HL),
    new AndInstruction(0xe6, D8_ARG), new RstInstruction(0xe7, 0x20),
    new GbE8Instruction(), new JpInstruction(0xe9, REG_ARG_HL),
    new LdInstruction(0xea, 4, MEM_D16_ARG, REG_ARG_A), null,
    null, null,
    new XorInstruction(0xee, D8_ARG), new RstInstruction(0xef, 0x28),

    // 0xfx
    new LdInstruction(0xf0, 3, REG_ARG_A, MEM_D8_ARG), new PopInstruction(0xf1, REG_ARG_AF),
    new LdInstruction(0xf2, 2, REG_ARG_A, MEM_REG_ARG_C), new DiInstruction(),
    null, new PushInstruction(0xf5, REG_ARG_AF),
    new OrInstruction(0xf6, D8_ARG), new RstInstruction(0xf7, 0x30),
    new GbF8Instruction(), new LdInstruction(0xf9, 2, REG_ARG_SP, REG_ARG_HL),
    new LdInstruction(0xfa, 4, REG_ARG_A, MEM_D16_ARG), new EiInstruction(),
    null, null,
    new CpInstruction(0xfe, D8_ARG), new RstInstruction(0xff, 0x38)
];


export const GB_0XCB_INSTRUCTION_SET = [
    // 0x0x
    new RlcInstruction(0x00, REG_ARG_B), new RlcInstruction(0x01, REG_ARG_C),
    new RlcInstruction(0x02, REG_ARG_D), new RlcInstruction(0x03, REG_ARG_E),
    new RlcInstruction(0x04, REG_ARG_H), new RlcInstruction(0x05, REG_ARG_L),
    new RlcInstruction(0x06, MEM_REG_ARG_HL), new RlcInstruction(0x07, REG_ARG_A),
    new RrcInstruction(0x08, REG_ARG_B), new RrcInstruction(0x09, REG_ARG_C),
    new RrcInstruction(0x0a, REG_ARG_D), new RrcInstruction(0x0b, REG_ARG_E),
    new RrcInstruction(0x0c, REG_ARG_H), new RrcInstruction(0x0d, REG_ARG_L),
    new RrcInstruction(0x0e, MEM_REG_ARG_HL), new RrcInstruction(0x0f, REG_ARG_A),

    // 0x1x
    new RlInstruction(0x10, REG_ARG_B), new RlInstruction(0x11, REG_ARG_C),
    new RlInstruction(0x12, REG_ARG_D), new RlInstruction(0x13, REG_ARG_E),
    new RlInstruction(0x14, REG_ARG_H), new RlInstruction(0x15, REG_ARG_L),
    new RlInstruction(0x16, MEM_REG_ARG_HL), new RlInstruction(0x17, REG_ARG_A),
    new RrInstruction(0x18, REG_ARG_B), new RrInstruction(0x19, REG_ARG_C),
    new RrInstruction(0x1a, REG_ARG_D), new RrInstruction(0x1b, REG_ARG_E),
    new RrInstruction(0x1c, REG_ARG_H), new RrInstruction(0x1d, REG_ARG_L),
    new RrInstruction(0x1e, MEM_REG_ARG_HL), new RrInstruction(0x1f, REG_ARG_A),

    // 0x2x
    new SlaInstruction(0x20, REG_ARG_B), new SlaInstruction(0x21, REG_ARG_C),
    new SlaInstruction(0x22, REG_ARG_D), new SlaInstruction(0x23, REG_ARG_E),
    new SlaInstruction(0x24, REG_ARG_H), new SlaInstruction(0x25, REG_ARG_L),
    new SlaInstruction(0x26, MEM_REG_ARG_HL), new SlaInstruction(0x27, REG_ARG_A),
    new SraInstruction(0x28, REG_ARG_B), new SraInstruction(0x29, REG_ARG_C),
    new SraInstruction(0x2a, REG_ARG_D), new SraInstruction(0x2b, REG_ARG_E),
    new SraInstruction(0x2c, REG_ARG_H), new SraInstruction(0x2d, REG_ARG_L),
    new SraInstruction(0x2e, MEM_REG_ARG_HL), new SraInstruction(0x2f, REG_ARG_A),

    // 0x3x
    new SwapInstruction(0x30, REG_ARG_B), new SwapInstruction(0x31, REG_ARG_C),
    new SwapInstruction(0x32, REG_ARG_D), new SwapInstruction(0x33, REG_ARG_E),
    new SwapInstruction(0x34, REG_ARG_H), new SwapInstruction(0x35, REG_ARG_L),
    new SwapInstruction(0x36, MEM_REG_ARG_HL), new SwapInstruction(0x37, REG_ARG_A),
    new SrlInstruction(0x38, REG_ARG_B), new SrlInstruction(0x39, REG_ARG_C),
    new SrlInstruction(0x3a, REG_ARG_D), new SrlInstruction(0x3b, REG_ARG_E),
    new SrlInstruction(0x3c, REG_ARG_H), new SrlInstruction(0x3d, REG_ARG_L),
    new SrlInstruction(0x3e, MEM_REG_ARG_HL), new SrlInstruction(0x3f, REG_ARG_A),

    // 0x4x
    new BitInstruction(0x40, 0, REG_ARG_B), new BitInstruction(0x41, 0, REG_ARG_C),
    new BitInstruction(0x42, 0, REG_ARG_D), new BitInstruction(0x43, 0, REG_ARG_F),
    new BitInstruction(0x44, 0, REG_ARG_H), new BitInstruction(0x45, 0, REG_ARG_L),
    new BitInstruction(0x46, 0, MEM_REG_ARG_HL), new BitInstruction(0x47, 0, REG_ARG_A),
    new BitInstruction(0x48, 1, REG_ARG_B), new BitInstruction(0x49, 1, REG_ARG_C),
    new BitInstruction(0x4a, 1, REG_ARG_D), new BitInstruction(0x4b, 1, REG_ARG_F),
    new BitInstruction(0x4c, 1, REG_ARG_H), new BitInstruction(0x4d, 1, REG_ARG_L),
    new BitInstruction(0x4e, 1, MEM_REG_ARG_HL), new BitInstruction(0x4f, 1, REG_ARG_A),

    // 0x5x
    new BitInstruction(0x50, 2, REG_ARG_B), new BitInstruction(0x51, 2, REG_ARG_C),
    new BitInstruction(0x52, 2, REG_ARG_D), new BitInstruction(0x53, 2, REG_ARG_F),
    new BitInstruction(0x54, 2, REG_ARG_H), new BitInstruction(0x55, 2, REG_ARG_L),
    new BitInstruction(0x56, 2, MEM_REG_ARG_HL), new BitInstruction(0x57, 2, REG_ARG_A),
    new BitInstruction(0x58, 3, REG_ARG_B), new BitInstruction(0x59, 3, REG_ARG_C),
    new BitInstruction(0x5a, 3, REG_ARG_D), new BitInstruction(0x5b, 3, REG_ARG_F),
    new BitInstruction(0x5c, 3, REG_ARG_H), new BitInstruction(0x5d, 3, REG_ARG_L),
    new BitInstruction(0x5e, 3, MEM_REG_ARG_HL), new BitInstruction(0x5f, 3, REG_ARG_A),

    // 0x6x
    new BitInstruction(0x60, 4, REG_ARG_B), new BitInstruction(0x61, 4, REG_ARG_C),
    new BitInstruction(0x62, 4, REG_ARG_D), new BitInstruction(0x63, 4, REG_ARG_F),
    new BitInstruction(0x64, 4, REG_ARG_H), new BitInstruction(0x65, 4, REG_ARG_L),
    new BitInstruction(0x66, 4, MEM_REG_ARG_HL), new BitInstruction(0x67, 4, REG_ARG_A),
    new BitInstruction(0x68, 5, REG_ARG_B), new BitInstruction(0x69, 5, REG_ARG_C),
    new BitInstruction(0x6a, 5, REG_ARG_D), new BitInstruction(0x6b, 5, REG_ARG_F),
    new BitInstruction(0x6c, 5, REG_ARG_H), new BitInstruction(0x6d, 5, REG_ARG_L),
    new BitInstruction(0x6e, 5, MEM_REG_ARG_HL), new BitInstruction(0x6f, 5, REG_ARG_A),

    // 0x7x
    new BitInstruction(0x70, 6, REG_ARG_B), new BitInstruction(0x71, 6, REG_ARG_C),
    new BitInstruction(0x72, 6, REG_ARG_D), new BitInstruction(0x73, 6, REG_ARG_F),
    new BitInstruction(0x74, 6, REG_ARG_H), new BitInstruction(0x75, 6, REG_ARG_L),
    new BitInstruction(0x76, 6, MEM_REG_ARG_HL), new BitInstruction(0x77, 6, REG_ARG_A),
    new BitInstruction(0x78, 7, REG_ARG_B), new BitInstruction(0x79, 7, REG_ARG_C),
    new BitInstruction(0x7a, 7, REG_ARG_D), new BitInstruction(0x7b, 7, REG_ARG_F),
    new BitInstruction(0x7c, 7, REG_ARG_H), new BitInstruction(0x7d, 7, REG_ARG_L),
    new BitInstruction(0x7e, 7, MEM_REG_ARG_HL), new BitInstruction(0x7f, 7, REG_ARG_A),

    // 0x8x
    new ResInstruction(0x80, 0, REG_ARG_B), new ResInstruction(0x81, 0, REG_ARG_C),
    new ResInstruction(0x82, 0, REG_ARG_D), new ResInstruction(0x83, 0, REG_ARG_F),
    new ResInstruction(0x84, 0, REG_ARG_H), new ResInstruction(0x85, 0, REG_ARG_L),
    new ResInstruction(0x86, 0, MEM_REG_ARG_HL), new ResInstruction(0x87, 0, REG_ARG_A),
    new ResInstruction(0x88, 1, REG_ARG_B), new ResInstruction(0x89, 1, REG_ARG_C),
    new ResInstruction(0x8a, 1, REG_ARG_D), new ResInstruction(0x8b, 1, REG_ARG_F),
    new ResInstruction(0x8c, 1, REG_ARG_H), new ResInstruction(0x8d, 1, REG_ARG_L),
    new ResInstruction(0x8e, 1, MEM_REG_ARG_HL), new ResInstruction(0x8f, 1, REG_ARG_A),

    // 0x9x
    new ResInstruction(0x90, 2, REG_ARG_B), new ResInstruction(0x91, 2, REG_ARG_C),
    new ResInstruction(0x92, 2, REG_ARG_D), new ResInstruction(0x93, 2, REG_ARG_F),
    new ResInstruction(0x94, 2, REG_ARG_H), new ResInstruction(0x95, 2, REG_ARG_L),
    new ResInstruction(0x96, 2, MEM_REG_ARG_HL), new ResInstruction(0x97, 2, REG_ARG_A),
    new ResInstruction(0x98, 3, REG_ARG_B), new ResInstruction(0x99, 3, REG_ARG_C),
    new ResInstruction(0x9a, 3, REG_ARG_D), new ResInstruction(0x9b, 3, REG_ARG_F),
    new ResInstruction(0x9c, 3, REG_ARG_H), new ResInstruction(0x9d, 3, REG_ARG_L),
    new ResInstruction(0x9e, 3, MEM_REG_ARG_HL), new ResInstruction(0x9f, 3, REG_ARG_A),

    // 0xax
    new ResInstruction(0xa0, 4, REG_ARG_B), new ResInstruction(0xa1, 4, REG_ARG_C),
    new ResInstruction(0xa2, 4, REG_ARG_D), new ResInstruction(0xa3, 4, REG_ARG_F),
    new ResInstruction(0xa4, 4, REG_ARG_H), new ResInstruction(0xa5, 4, REG_ARG_L),
    new ResInstruction(0xa6, 4, MEM_REG_ARG_HL), new ResInstruction(0xa7, 4, REG_ARG_A),
    new ResInstruction(0xa8, 5, REG_ARG_B), new ResInstruction(0xa9, 5, REG_ARG_C),
    new ResInstruction(0xaa, 5, REG_ARG_D), new ResInstruction(0xab, 5, REG_ARG_F),
    new ResInstruction(0xac, 5, REG_ARG_H), new ResInstruction(0xad, 5, REG_ARG_L),
    new ResInstruction(0xae, 5, MEM_REG_ARG_HL), new ResInstruction(0xaf, 5, REG_ARG_A),

    // 0xbx
    new ResInstruction(0xb0, 6, REG_ARG_B), new ResInstruction(0xb1, 6, REG_ARG_C),
    new ResInstruction(0xb2, 6, REG_ARG_D), new ResInstruction(0xb3, 6, REG_ARG_F),
    new ResInstruction(0xb4, 6, REG_ARG_H), new ResInstruction(0xb5, 6, REG_ARG_L),
    new ResInstruction(0xb6, 6, MEM_REG_ARG_HL), new ResInstruction(0xb7, 6, REG_ARG_A),
    new ResInstruction(0xb8, 7, REG_ARG_B), new ResInstruction(0xb9, 7, REG_ARG_C),
    new ResInstruction(0xba, 7, REG_ARG_D), new ResInstruction(0xbb, 7, REG_ARG_F),
    new ResInstruction(0xbc, 7, REG_ARG_H), new ResInstruction(0xbd, 7, REG_ARG_L),
    new ResInstruction(0xbe, 7, MEM_REG_ARG_HL), new ResInstruction(0xbf, 7, REG_ARG_A),

    // 0xcx
    new SetInstruction(0xc0, 0, REG_ARG_B), new SetInstruction(0xc1, 0, REG_ARG_C),
    new SetInstruction(0xc2, 0, REG_ARG_D), new SetInstruction(0xc3, 0, REG_ARG_F),
    new SetInstruction(0xc4, 0, REG_ARG_H), new SetInstruction(0xc5, 0, REG_ARG_L),
    new SetInstruction(0xc6, 0, MEM_REG_ARG_HL), new SetInstruction(0xc7, 0, REG_ARG_A),
    new SetInstruction(0xc8, 1, REG_ARG_B), new SetInstruction(0xc9, 1, REG_ARG_C),
    new SetInstruction(0xca, 1, REG_ARG_D), new SetInstruction(0xcb, 1, REG_ARG_F),
    new SetInstruction(0xcc, 1, REG_ARG_H), new SetInstruction(0xcd, 1, REG_ARG_L),
    new SetInstruction(0xce, 1, MEM_REG_ARG_HL), new SetInstruction(0xcf, 1, REG_ARG_A),

    // 0xdx
    new SetInstruction(0xd0, 2, REG_ARG_B), new SetInstruction(0xd1, 2, REG_ARG_C),
    new SetInstruction(0xd2, 2, REG_ARG_D), new SetInstruction(0xd3, 2, REG_ARG_F),
    new SetInstruction(0xd4, 2, REG_ARG_H), new SetInstruction(0xd5, 2, REG_ARG_L),
    new SetInstruction(0xd6, 2, MEM_REG_ARG_HL), new SetInstruction(0xd7, 2, REG_ARG_A),
    new SetInstruction(0xd8, 3, REG_ARG_B), new SetInstruction(0xd9, 3, REG_ARG_C),
    new SetInstruction(0xda, 3, REG_ARG_D), new SetInstruction(0xdb, 3, REG_ARG_F),
    new SetInstruction(0xdc, 3, REG_ARG_H), new SetInstruction(0xdd, 3, REG_ARG_L),
    new SetInstruction(0xde, 3, MEM_REG_ARG_HL), new SetInstruction(0xdf, 3, REG_ARG_A),

    // 0xex
    new SetInstruction(0xe0, 4, REG_ARG_B), new SetInstruction(0xe1, 4, REG_ARG_C),
    new SetInstruction(0xe2, 4, REG_ARG_D), new SetInstruction(0xe3, 4, REG_ARG_F),
    new SetInstruction(0xe4, 4, REG_ARG_H), new SetInstruction(0xe5, 4, REG_ARG_L),
    new SetInstruction(0xe6, 4, MEM_REG_ARG_HL), new SetInstruction(0xe7, 4, REG_ARG_A),
    new SetInstruction(0xe8, 5, REG_ARG_B), new SetInstruction(0xe9, 5, REG_ARG_C),
    new SetInstruction(0xea, 5, REG_ARG_D), new SetInstruction(0xeb, 5, REG_ARG_F),
    new SetInstruction(0xec, 5, REG_ARG_H), new SetInstruction(0xed, 5, REG_ARG_L),
    new SetInstruction(0xee, 5, MEM_REG_ARG_HL), new SetInstruction(0xef, 5, REG_ARG_A),

    // 0xfx
    new SetInstruction(0xf0, 6, REG_ARG_B), new SetInstruction(0xf1, 6, REG_ARG_C),
    new SetInstruction(0xf2, 6, REG_ARG_D), new SetInstruction(0xf3, 6, REG_ARG_F),
    new SetInstruction(0xf4, 6, REG_ARG_H), new SetInstruction(0xf5, 6, REG_ARG_L),
    new SetInstruction(0xf6, 6, MEM_REG_ARG_HL), new SetInstruction(0xf7, 6, REG_ARG_A),
    new SetInstruction(0xf8, 7, REG_ARG_B), new SetInstruction(0xf9, 7, REG_ARG_C),
    new SetInstruction(0xfa, 7, REG_ARG_D), new SetInstruction(0xfb, 7, REG_ARG_F),
    new SetInstruction(0xfc, 7, REG_ARG_H), new SetInstruction(0xfd, 7, REG_ARG_L),
    new SetInstruction(0xfe, 7, MEM_REG_ARG_HL), new SetInstruction(0xff, 7, REG_ARG_A),
];
