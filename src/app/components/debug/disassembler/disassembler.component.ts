import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { NzTableComponent } from "ng-zorro-antd/table";
import { RomDisassemblerService } from "src/app/services/rom-disassembler/rom-disassembler.service";
import { GbDisassembledInstruction } from "src/models/cpu/gb-cpu";
import { GameboyComponent } from "../../gameboy/gameboy.component";

@Component({
  selector: "app-disassembler",
  templateUrl: "./disassembler.component.html",
  styleUrls: ["./disassembler.component.scss"]
})
export class DisassemblerComponent implements OnInit {
  @ViewChild("disassembled") disassembledTable: NzTableComponent;

  @Input("gameboy") gameboy: GameboyComponent;

  public disassembledInstructions: GbDisassembledInstruction[];
  private breakpointIndex: number;
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

  private async runDisassembler(): Promise<void> {
    if (!this.gameboy.isDebugging) {
      return;
    }
    this.disassembledInstructions = await this.disassembler.disassembleCurrentRomMemory(this.gameboy.gameboy);
    if (this.breakpointInstruction !== null) {
      this.breakpointIndex = this.findInstructionIndex(this.breakpointInstruction.address);
    }
  }

  private clear(): void {
    this.disassembledInstructions = [];
    this.breakpointIndex = null;
    this.breakpointInstruction = null;
  }

  public setBreakpoint(index: number): void {
    if (!this.gameboy.isPaused()) {
      return;
    }
    this.breakpointIndex = index;
    if (index === null) {
      this.breakpointInstruction = null;
    } else {
      this.breakpointInstruction = this.disassembledInstructions[index];
    }
  }

  public clearBreakpoint(): void {
    if (this.breakpointIndex === null) {
      return;
    }
    this.setBreakpoint(null);
    if (this.gameboy.isPlaying()) {
      this.gameboy.pause();
      this.gameboy.resume();
    }
  }

  public runToBreakpoint(): void {
    if (this.breakpointIndex === null || !this.gameboy.isPaused()) {
      return;
    }
    this.gameboy.resume(this.breakpointInstruction.address);
  }

  public scrollToAddress(hexAddress: string): void {
    const address = parseInt(hexAddress, 16);
    const targetIndex = this.findInstructionIndex(address);
    if (targetIndex !== null) {
      this.scrollToIndex(targetIndex);
    }
  }

  public getPc(): number {
    return this.gameboy.gameboy.cpu.rs.pc.getValue();
  }

  public scrollToPc(): void {
    const targetIndex = this.findInstructionIndex(this.getPc());
    if (targetIndex !== null) {
      this.scrollToIndex(targetIndex);
    }
  }

  public scrollToBreakpoint(): void {
    if (this.breakpointIndex !== null) {
      this.scrollToIndex(this.breakpointIndex);
    }
  }

  /**
   * Binary search to find the first instruction at address not lower than `address`.
   *
   * @param address The instruction address.
   */
  private findInstructionIndex(address: number): number {
    let lastLower = -1;
    let firstHigher = this.disassembledInstructions.length;
    while (firstHigher - lastLower > 1) {
      const middle = Math.floor((lastLower + firstHigher) / 2);
      const middleAddress = this.disassembledInstructions[middle].address;
      if (middleAddress === address) {
        return middle;
      }
      if (middleAddress < address) {
        lastLower = middle;
      } else {
        firstHigher = middle;
      }
    }
    return firstHigher === this.disassembledInstructions.length ? null : firstHigher;
  }

  private scrollToIndex(index: number): void {
    this.disassembledTable?.cdkVirtualScrollViewport?.scrollToIndex(index);
  }
}
