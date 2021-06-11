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
    new InterruptStateRow("IME", () => this.gameboy.gameboy.rs.getIme() ? 1 : 0),
    new InterruptStateRow("VBlank Enable", () => this.gameboy.gameboy.interrupts.getVBlankInterruptEnable()),
    new InterruptStateRow("VBlank Flag", () => this.gameboy.gameboy.interrupts.getVBlankInterruptFlag()),
    new InterruptStateRow("LCD STAT Enable", () => this.gameboy.gameboy.interrupts.getLcdStatInterruptEnable()),
    new InterruptStateRow("LCD STAT Flag", () => this.gameboy.gameboy.interrupts.getLcdStatInterruptFlag()),
    new InterruptStateRow("Timer Enable", () => this.gameboy.gameboy.interrupts.getTimerInterruptEnable()),
    new InterruptStateRow("Timer Flag", () => this.gameboy.gameboy.interrupts.getTimerInterruptFlag()),
    new InterruptStateRow("Serial Enable", () => this.gameboy.gameboy.interrupts.getSerialInterruptEnable()),
    new InterruptStateRow("Serial Flag", () => this.gameboy.gameboy.interrupts.getSerialInterruptFlag()),
    new InterruptStateRow("Joypad Enable", () => this.gameboy.gameboy.interrupts.getJoypadInterruptEnable()),
    new InterruptStateRow("Joypad Flag", () => this.gameboy.gameboy.interrupts.getJoypadInterruptFlag())
  ];
}
