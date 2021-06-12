import { Component, Input } from '@angular/core';
import { GameboyComponent } from '../../gameboy/gameboy.component';

export class TimerStateRow {
  constructor(
    public readonly title: string,
    public readonly value: () => number
  ) { }
}

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss']
})
export class TimerComponent {
  @Input("gameboy") gameboy: GameboyComponent;

  public rows: TimerStateRow[] = [
    new TimerStateRow("Divide Timer - 0xFF05", () => this.gameboy.gameboy.timerWrappers.getDivTimer()),
    new TimerStateRow("Counter Timer - 0xFF06", () => this.gameboy.gameboy.timerWrappers.getCounterTimer()),
    new TimerStateRow("Module Timer - 0xFF07", () => this.gameboy.gameboy.timerWrappers.getModuloTimer()),
    new TimerStateRow("Timer Enabled", () => this.gameboy.gameboy.timerWrappers.getTimerEnable()),
    new TimerStateRow("Timer Mode", () => this.gameboy.gameboy.timerWrappers.getTimerMode())
  ];
}
