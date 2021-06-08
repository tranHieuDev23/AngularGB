import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Gameboy } from 'src/models/gameboy/gameboy';
import { CanvasLcd } from 'src/models/lcd/canvas-lcd';
import { GbMmuImpl } from 'src/models/mmu/gb-mmu';
import { getMbc } from 'src/models/mmu/mcb/mbc-factory';

@Component({
  selector: 'app-gameboy',
  templateUrl: './gameboy.component.html',
  styleUrls: ['./gameboy.component.scss']
})
export class GameboyComponent implements OnInit {
  @ViewChild("battery", { static: true }) batter: ElementRef<HTMLElement>;
  @ViewChild("canvas", { static: true }) canvas: ElementRef<HTMLCanvasElement>;

  public palettes: string[] = [
    "#ffffff",
    "#c0c0c0",
    "#606060",
    "#000000"
  ];

  private lcd: CanvasLcd = null;
  private gameboy: Gameboy = null;
  private gameboyIntervalId = null;

  constructor() { }

  ngOnInit() {
    this.lcd = new CanvasLcd(this.canvas.nativeElement, 1, this.palettes);
    this.lcd.clear();
  }

  public reset(): void {
    this.lcd.clear();
    if (this.gameboy) {
      clearInterval(this.gameboyIntervalId);
      this.gameboy = null;
    }
  }

  public runRom(rom: number[]): void {
    if (rom === null) {
      this.reset();
      return;
    }
    const mbc = getMbc(rom);
    this.gameboy = new Gameboy(new GbMmuImpl(mbc), this.lcd);
    this.gameboyIntervalId = setInterval(() => {
      this.gameboy.frame();
    }, 1.0 / 60);
  }
}
