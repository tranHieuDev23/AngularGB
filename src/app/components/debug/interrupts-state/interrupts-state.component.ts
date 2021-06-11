import { Component, Input } from '@angular/core';
import { GameboyComponent } from '../../gameboy/gameboy.component';

export class InterruptStateRow {
  constructor(
    public readonly title: string,
    public readonly value: () => number
  ) { }
}

@Component({
  selector: 'app-interrupts-state',
  templateUrl: './interrupts-state.component.html',
  styleUrls: ['./interrupts-state.component.scss']
})
export class InterruptsStateComponent {
  @Input("gameboy") gameboy: GameboyComponent;

  public rows: InterruptStateRow[] = [
    new InterruptStateRow("IME", () => this.gameboy.gameboy.cpu.rs.getIme() ? 1 : 0),
    new InterruptStateRow("VBlank Enable", () => this.gameboy.gameboy.cpu.interrupts.getVBlankInterruptEnable()),
    new InterruptStateRow("VBlank Flag", () => this.gameboy.gameboy.cpu.interrupts.getVBlankInterruptFlag()),
    new InterruptStateRow("LCD STAT Enable", () => this.gameboy.gameboy.cpu.interrupts.getLcdStatInterruptEnable()),
    new InterruptStateRow("LCD STAT Flag", () => this.gameboy.gameboy.cpu.interrupts.getLcdStatInterruptFlag()),
    new InterruptStateRow("Timer Enable", () => this.gameboy.gameboy.cpu.interrupts.getTimerInterruptEnable()),
    new InterruptStateRow("Timer Flag", () => this.gameboy.gameboy.cpu.interrupts.getTimerInterruptFlag()),
    new InterruptStateRow("Serial Enable", () => this.gameboy.gameboy.cpu.interrupts.getSerialInterruptEnable()),
    new InterruptStateRow("Serial Flag", () => this.gameboy.gameboy.cpu.interrupts.getSerialInterruptFlag()),
    new InterruptStateRow("Joypad Enable", () => this.gameboy.gameboy.cpu.interrupts.getJoypadInterruptEnable()),
    new InterruptStateRow("Joypad Flag", () => this.gameboy.gameboy.cpu.interrupts.getJoypadInterruptFlag())
  ];
}
