import { Component, Input } from '@angular/core';
import { Gameboy } from 'src/models/gameboy/gameboy';

@Component({
  selector: 'app-cpu-state',
  templateUrl: './cpu-state.component.html',
  styleUrls: ['./cpu-state.component.scss']
})
export class CpuStateComponent {
  @Input("gameboy") gameboy: Gameboy;
}
