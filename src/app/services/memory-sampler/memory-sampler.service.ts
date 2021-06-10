import { Injectable } from '@angular/core';
import { Gameboy } from 'src/models/gameboy/gameboy';
import { GbMmu } from 'src/models/mmu/gb-mmu';
import { TWO_POW_SIXTEEN } from 'src/utils/constants';

@Injectable({
  providedIn: 'root'
})
export class MemorySamplerService {
  public sampleMemory(gameboy: Gameboy, fromAddress: number = 0, toAddress: number = TWO_POW_SIXTEEN): number[] {
    const { mmu } = gameboy.cpu;
    const memory = new Array<number>(TWO_POW_SIXTEEN);
    for (let address = fromAddress; address < toAddress; address++) {
      memory[address - fromAddress] = this.readByte(mmu, address);
    }
    return memory;
  }

  private readByte(mmu: GbMmu, address: number): number {
    try {
      return mmu.readByte(address);
    } catch (e) {
      return 0;
    }
  }
}
