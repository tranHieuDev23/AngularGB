import { Injectable } from '@angular/core';
import { GbDisassembledInstruction } from 'src/models/cpu/gb-cpu';
import { Gameboy } from 'src/models/gameboy/gameboy';
import { VRAM_START } from 'src/models/mmu/gb-mmu';
import { TWO_POW_SIXTEEN } from 'src/utils/constants';
import { disassemblyRom, RomDisassemblerInput, RomDisassemblerOutput } from './rom-disassembler.common';

@Injectable({
  providedIn: 'root'
})
export class RomDisassemblerService {
  public async disassembleCurrentRomMemory(gameboy: Gameboy): Promise<GbDisassembledInstruction[]> {
    return new Promise<GbDisassembledInstruction[]>((resolve) => {
      const memory = new Array<number>(TWO_POW_SIXTEEN).fill(0);
      for (let address = 0; address < VRAM_START; address++) {
        memory[address] = gameboy.cpu.mmu.readByte(address);
      }
      const input = new RomDisassemblerInput(memory);

      if (typeof Worker !== 'undefined') {
        const worker = new Worker('./rom-disassembler.worker', { type: "module" });
        worker.onmessage = ({ data }) => {
          const output = data as RomDisassemblerOutput;
          resolve(output.instructions);
        };
        worker.postMessage(input);
      } else {
        const output = disassemblyRom(input);
        resolve(output.instructions);
      }
    });
  }
}
