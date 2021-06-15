import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from "@angular/core";
import { Gameboy } from "src/models/gameboy/gameboy";
import { CanvasLcd } from "src/models/lcd/canvas-lcd";
import { getMbc } from "src/models/mmu/mcb/mbc-factory";

const ONE_SECOND = 1000;

@Component({
  selector: "app-gameboy",
  templateUrl: "./gameboy.component.html",
  styleUrls: ["./gameboy.component.scss"]
})
export class GameboyComponent implements OnInit {
  @ViewChild("battery", { static: true }) batter: ElementRef<HTMLElement>;
  @ViewChild("canvas", { static: true }) canvas: ElementRef<HTMLCanvasElement>;

  @Output("frameEnded") public frameEnded = new EventEmitter<void>();
  @Output("resumed") public resumed = new EventEmitter<void>();
  @Output("paused") public paused = new EventEmitter<void>();
  @Output("stepSkipped") public stepSkipped = new EventEmitter<void>();
  @Output("frameSkipped") public frameSkipped = new EventEmitter<void>();
  @Output("stopped") public stopped = new EventEmitter<void>();

  public rom: number[] = null;
  public gameboy: Gameboy = null;
  public palettes: string[] = [
    "#9bbc0f",
    "#8bac0f",
    "#306230",
    "#0f380f"
  ];

  private lcd: CanvasLcd = null;
  private gameboyIntervalId = null;

  ngOnInit(): void {
    this.lcd = new CanvasLcd(this.canvas.nativeElement, 160, 144, 1, this.palettes);
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
    this.gameboy = new Gameboy(mbc, this.lcd);
    this.resume();
  }

  public resume(breakpointAddress: number = null): void {
    if (!this.isPaused()) {
      return;
    }
    if (breakpointAddress === null) {
      this.setGameboyIntervalId(setInterval(() => {
        this.gameboy.frame();
        this.frameEnded.emit();
      }, ONE_SECOND / 60));
    } else {
      this.setGameboyIntervalId(setInterval(() => {
        const metBreakpoint = this.gameboy.frameWithBreakpoint(breakpointAddress);
        this.frameEnded.emit();
        if (metBreakpoint) {
          this.pause();
        }
      }, ONE_SECOND / 60));
    }
    this.resumed.emit();
  }

  public pause(): void {
    if (this.isPaused()) {
      return;
    }
    this.setGameboyIntervalId(null);
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
    if (this.isPlaying()) {
      this.pause();
    }
    this.lcd.clear();
    this.rom = null;
    this.gameboy = null;
    this.stopped.emit();
  }

  @HostListener("document:keydown", ["$event"])
  public handleKeyDownEvent(event: KeyboardEvent): void {
    if (this.gameboy === null) {
      return;
    }
    switch (event.code) {
      case "KeyX":
        this.gameboy.pressA();
        break;
      case "KeyZ":
        this.gameboy.pressB();
        break;
      case "Enter":
        this.gameboy.pressStart();
        break;
      case "Space":
        this.gameboy.pressSelect();
        break;
      case "ArrowRight":
        this.gameboy.pressRight();
        break;
      case "ArrowLeft":
        this.gameboy.pressLeft();
        break;
      case "ArrowUp":
        this.gameboy.pressUp();
        break;
      case "ArrowDown":
        this.gameboy.pressDown();
        break;
    }
  }

  @HostListener("document:keyup", ["$event"])
  public handleKeyUpEvent(event: KeyboardEvent): void {
    if (this.gameboy === null) {
      return;
    }
    switch (event.code) {
      case "KeyX":
        this.gameboy.releaseA();
        break;
      case "KeyZ":
        this.gameboy.releaseB();
        break;
      case "Enter":
        this.gameboy.releaseStart();
        break;
      case "Space":
        this.gameboy.releaseSelect();
        break;
      case "ArrowRight":
        this.gameboy.releaseRight();
        break;
      case "ArrowLeft":
        this.gameboy.releaseLeft();
        break;
      case "ArrowUp":
        this.gameboy.releaseUp();
        break;
      case "ArrowDown":
        this.gameboy.releaseDown();
        break;
    }
  }

  private setGameboyIntervalId(id: any): void {
    if (this.gameboyIntervalId !== null) {
      clearInterval(this.gameboyIntervalId);
    }
    this.gameboyIntervalId = id;
  }
}
