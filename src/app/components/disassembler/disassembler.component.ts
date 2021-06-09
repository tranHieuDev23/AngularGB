import { Component, Input, OnInit } from '@angular/core';
import { RomDisassemblerService } from 'src/app/services/rom-disassembler/rom-disassembler.service';
import { GbDisassembledInstruction } from 'src/models/cpu/gb-cpu';
import { GameboyComponent } from '../gameboy/gameboy.component';

@Component({
  selector: 'app-disassembler',
  templateUrl: './disassembler.component.html',
  styleUrls: ['./disassembler.component.scss']
})
export class DisassemblerComponent implements OnInit {
  @Input("gameboy") gameboy: GameboyComponent;

  public disassembledInstructions: GbDisassembledInstruction[];
  public breakpointIndex: number;

  constructor(
    private readonly disassembler: RomDisassemblerService
  ) {
    this.clear();
  }

  ngOnInit(): void {
    this.gameboy.paused.subscribe(() => this.runDisassembler());
    this.gameboy.stepped.subscribe(() => this.runDisassembler());
    this.gameboy.framed.subscribe(() => this.runDisassembler());
    this.gameboy.stopped.subscribe(() => this.clear());
  }

  public async runDisassembler(): Promise<void> {
    if (!this.gameboy.isPaused()) {
      return;
    }
    this.disassembledInstructions = await this.disassembler.disassembleCurrentRomMemory(this.gameboy.gameboy);
  }

  public clear(): void {
    this.disassembledInstructions = [];
    this.breakpointIndex = null;
  }

  public setBreakpoint(index: number): void {
    this.breakpointIndex = index;
  }

  public clearBreakpoint(): void {
    this.setBreakpoint(null);
  }

  private scrollToIndex(index: number): void {

  }
}
