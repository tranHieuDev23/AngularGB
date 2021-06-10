import { Component, Input, OnInit } from "@angular/core";
import { MemorySamplerService } from "src/app/services/memory-sampler/memory-sampler.service";
import { GameboyComponent } from "../../gameboy/gameboy.component";

@Component({
  selector: "app-memory-sampler",
  templateUrl: "./memory-sampler.component.html",
  styleUrls: ["./memory-sampler.component.scss"]
})
export class MemorySamplerComponent implements OnInit {
  @Input("gameboy") gameboy: GameboyComponent;

  public readonly hexDigits: string[] = [
    "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"
  ];

  public memoryData: number[][];
  private fromAddress: number;
  private toAddress: number;

  constructor(
    private readonly memorySampler: MemorySamplerService
  ) {
    this.clear();
  }

  ngOnInit(): void {
    this.gameboy.paused.subscribe(() => this.sampleMemory());
    this.gameboy.stepSkipped.subscribe(() => this.sampleMemory());
    this.gameboy.frameSkipped.subscribe(() => this.sampleMemory());
    this.gameboy.stopped.subscribe(() => this.clear());
  }

  public jumpToAddress(hexAddress: string): void {
    const address = parseInt(hexAddress, 16);
    if (address < 0 || address > 0xff) {
      return;
    }
    this.fromAddress = address << 8;
    this.toAddress = (address + 1) << 8;
    this.sampleMemory();
  }

  public clear(): void {
    this.memoryData = [];
    this.fromAddress = 0;
    this.toAddress = 0x100;
  }

  public getRowLabel(rowId: number): string {
    const firstAddress = this.fromAddress + rowId * 16;
    const firstAddressString = firstAddress.toString(16).toUpperCase().padStart(4, "0");
    return `0x${firstAddressString.substr(0, 3)}x`;
  }

  private sampleMemory(): void {
    if (!this.gameboy.isDebugging) {
      return;
    }
    const memory = this.memorySampler.sampleMemory(
      this.gameboy.gameboy, this.fromAddress, this.toAddress);
    this.memoryData = [];
    let iterator = 0;
    for (let i = 0; i < 16; i++) {
      const row = [];
      for (let j = 0; j < 16; j++) {
        row.push(memory[iterator]);
        iterator++;
      }
      this.memoryData.push(row);
    }
  }
}
