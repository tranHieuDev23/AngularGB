import { Component, Input } from '@angular/core';
import { RomDisassemblerService } from 'src/app/services/rom-disassembler/rom-disassembler.service';
import { GbDisassembledInstruction } from 'src/models/cpu/gb-cpu';
import { GameboyComponent } from '../gameboy/gameboy.component';

@Component({
  selector: 'app-disassembler',
  templateUrl: './disassembler.component.html',
  styleUrls: ['./disassembler.component.scss']
})
export class DisassemblerComponent {
  @Input("gameboy") gameboy: GameboyComponent;

  public disassembledInstructions: GbDisassembledInstruction[] = [];
  public breakpointIndex: number = null;

  constructor(
    private readonly disassembler: RomDisassemblerService
  ) { }

  public async runDisassembler(): Promise<void> {
    if (!this.gameboy.isPaused()) {
      return;
    }
    this.disassembledInstructions = await this.disassembler.disassembleCurrentRomMemory(this.gameboy.gameboy);
  }

  public async step(): Promise<void> {
    if (!this.gameboy.isPaused()) {
      return;
    }
    this.gameboy.step();
    this.disassembledInstructions = await this.disassembler.disassembleCurrentRomMemory(this.gameboy.gameboy);
  }

  public setBreakpoint(index: number): void {
    this.breakpointIndex = index;
  }

  private scrollToIndex(index: number): void {

  }
}
