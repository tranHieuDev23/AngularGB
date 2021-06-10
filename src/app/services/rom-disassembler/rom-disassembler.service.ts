import { Injectable } from "@angular/core";
import { GbDisassembledInstruction } from "src/models/cpu/gb-cpu";
import { Gameboy } from "src/models/gameboy/gameboy";
import { MemorySamplerService } from "../memory-sampler/memory-sampler.service";
import { disassemblyRom, RomDisassemblerInput, RomDisassemblerOutput } from "./rom-disassembler.common";

@Injectable({
  providedIn: "root"
})
export class RomDisassemblerService {
  constructor(
    private readonly memorySampler: MemorySamplerService
  ) { }

  public async disassembleCurrentRomMemory(gameboy: Gameboy): Promise<GbDisassembledInstruction[]> {
    const memory = this.memorySampler.sampleMemory(gameboy);
    const input = new RomDisassemblerInput(memory);
    return new Promise<GbDisassembledInstruction[]>((resolve) => {
      if (typeof Worker !== "undefined") {
        const worker = new Worker("./rom-disassembler.worker", { type: "module" });
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
