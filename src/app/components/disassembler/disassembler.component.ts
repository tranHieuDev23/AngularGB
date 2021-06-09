import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { NzTableComponent } from 'ng-zorro-antd/table';
import { RomDisassemblerService } from 'src/app/services/rom-disassembler/rom-disassembler.service';
import { GbDisassembledInstruction } from 'src/models/cpu/gb-cpu';
import { GameboyComponent } from '../gameboy/gameboy.component';

@Component({
  selector: 'app-disassembler',
  templateUrl: './disassembler.component.html',
  styleUrls: ['./disassembler.component.scss']
})
export class DisassemblerComponent implements OnInit {
  @ViewChild("disassembled") disassembledTable: NzTableComponent;
  @Input("gameboy") gameboy: GameboyComponent;

  public disassembledInstructions: GbDisassembledInstruction[];
  public breakpointIndex: number;
  public breakpointInstruction: GbDisassembledInstruction;

  constructor(
    private readonly disassembler: RomDisassemblerService
  ) {
    this.clear();
  }

  ngOnInit(): void {
    this.gameboy.paused.subscribe(() => this.runDisassembler());
    this.gameboy.stepSkipped.subscribe(() => this.runDisassembler());
    this.gameboy.frameSkipped.subscribe(() => this.runDisassembler());
    this.gameboy.stopped.subscribe(() => this.clear());
  }

  public async runDisassembler(): Promise<void> {
    if (!this.gameboy.isPaused()) {
      return;
    }
    this.disassembledInstructions = await this.disassembler.disassembleCurrentRomMemory(this.gameboy.gameboy);
    this.clearBreakpoint();
  }

  public checkBreakpoint(): void {
    if (this.breakpointIndex === null) {
      return;
    }
    const { gameboy } = this.gameboy;
    const pc = gameboy.cpu.rs.pc.getValue();
    if (pc === this.breakpointInstruction.address) {
      this.gameboy.pause();
    }
  }

  public clear(): void {
    this.disassembledInstructions = [];
    this.breakpointIndex = null;
    this.breakpointInstruction = null;
  }

  public setBreakpoint(index: number): void {
    this.breakpointIndex = index;
    if (index === null) {
      this.breakpointInstruction = null
    } else {
      this.breakpointInstruction = this.disassembledInstructions[index];
    }
  }

  public clearBreakpoint(): void {
    this.setBreakpoint(null);
  }

  public scrollToAddress(hexAddress: string): void {
    const address = parseInt(hexAddress, 16);
    // Binary search to find the first instruction at address not lower than required.
    let lastLower = -1;
    let firstHigher = this.disassembledInstructions.length;
    while (firstHigher - lastLower > 1) {
      const middle = Math.floor((lastLower + firstHigher) / 2);
      const middleAddress = this.disassembledInstructions[middle].address;
      if (middleAddress === address) {
        firstHigher = middle;
        break;
      }
      if (middleAddress < address) {
        lastLower = middle;
      } else {
        firstHigher = middle;
      }
    }
    if (firstHigher < this.disassembledInstructions.length) {
      this.scrollToIndex(firstHigher);
    }
  }

  public scrollToBreakpoint(): void {
    if (this.breakpointIndex !== null) {
      this.scrollToIndex(this.breakpointIndex);
    }
  }

  private scrollToIndex(index: number): void {
    this.disassembledTable?.cdkVirtualScrollViewport?.scrollToIndex(index);
  }
}
