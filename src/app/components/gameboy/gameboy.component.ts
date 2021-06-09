import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
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

  @Output("resumed") public resumed = new EventEmitter<void>();
  @Output("paused") public paused = new EventEmitter<void>();
  @Output("stepSkipped") public stepSkipped = new EventEmitter<void>();
  @Output("frameSkipped") public frameSkipped = new EventEmitter<void>();
  @Output("stopped") public stopped = new EventEmitter<void>();

  public rom: number[] = null;
  public gameboy: Gameboy = null;
  public palettes: string[] = [
    "#ffffff",
    "#c0c0c0",
    "#606060",
    "#000000"
  ];

  private lcd: CanvasLcd = null;
  private gameboyIntervalId = null;

  ngOnInit() {
    this.lcd = new CanvasLcd(this.canvas.nativeElement, 1, this.palettes);
    this.lcd.clear();
  }

  public isRomLoaded(): boolean { return this.gameboy !== null; }

  public isPlaying(): boolean { return this.gameboyIntervalId !== null; }

  public isPaused(): boolean { return this.isRomLoaded() && !this.isPlaying(); }

  public loadRom(rom: number[]): void {
    this.reset();
    if (rom === null) {
      return;
    }
    this.rom = rom;
    const mbc = getMbc(rom);
    this.gameboy = new Gameboy(new GbMmuImpl(mbc), this.lcd);
    this.resume();
  }

  public resume(): void {
    if (!this.isPaused()) {
      return;
    }
    this.gameboyIntervalId = setInterval(() => {
      this.gameboy.frame();
    }, 1.0 / 60);
    this.resumed.emit();
  }

  public pause(): void {
    if (this.isPaused()) {
      return;
    }
    clearInterval(this.gameboyIntervalId);
    this.gameboyIntervalId = null;
    this.paused.emit();
  }

  public step(stepCnt: number = 1): void {
    if (!this.isPaused()) {
      return;
    }
    for (let i = 0; i < stepCnt; i++) {
      this.gameboy.step();
    }
    this.stepSkipped.emit();
  }

  public frame(frameCnt: number = 1): void {
    if (!this.isPaused()) {
      return;
    }
    for (let i = 0; i < frameCnt; i++) {
      this.gameboy.frame();
    }
    this.frameSkipped.emit();
  }

  public reset(): void {
    if (!this.isRomLoaded()) {
      return;
    }
    this.lcd.clear();
    if (this.isPlaying()) {
      this.pause();
    }
    this.rom = null;
    this.gameboy = null;
    this.stopped.emit();
  }
}
