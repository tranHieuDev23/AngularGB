import { Component, ViewChild } from "@angular/core";
import { NzUploadChangeParam, NzUploadFile } from "ng-zorro-antd/upload";
import { environment } from "src/environments/environment";
import { GameboyComponent } from "./components/gameboy/gameboy.component";
import { RomFileLoaderService } from "./services/rom-file-loader/rom-file-loader.service";

export class DebugWidget {
  constructor(
    public readonly subMenu: string,
    public readonly title: string,
    public readonly id: number
  ) { }
}

const CPU_STATE_WIDGET = 0;
const DISASSEMBLER_WIDGET = 1;
const MEMORY_STATE_WIDGET = 2;
const GPU_STATE_WIDGET = 3;
const BG_MAP_WIDGET = 4;
const TILE_DATA_WIDGET = 5;
const OAM_VIEWER_WIDGET = 6;
const INTERRUPTS_STATE_WIDGET = 7;

const DEBUG_WIDGETS = [
  new DebugWidget("CPU", "CPU State", CPU_STATE_WIDGET),
  new DebugWidget("CPU", "Disassembler", DISASSEMBLER_WIDGET),
  new DebugWidget("Memory", "Memory State", MEMORY_STATE_WIDGET),
  new DebugWidget("Graphic", "GPU State", GPU_STATE_WIDGET),
  new DebugWidget("Graphic", "Background Map Viewer", BG_MAP_WIDGET),
  new DebugWidget("Graphic", "Tile Data Viewer", TILE_DATA_WIDGET),
  new DebugWidget("Graphic", "OAM Viewer", OAM_VIEWER_WIDGET),
  new DebugWidget("Interrupts", "Interrupts State", INTERRUPTS_STATE_WIDGET),
];

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent {
  public readonly CPU_STATE_WIDGET = CPU_STATE_WIDGET;
  public readonly DISASSEMBLER_WIDGET = DISASSEMBLER_WIDGET;
  public readonly MEMORY_STATE_WIDGET = MEMORY_STATE_WIDGET;
  public readonly GPU_STATE_WIDGET = GPU_STATE_WIDGET;
  public readonly BG_MAP_WIDGET = BG_MAP_WIDGET;
  public readonly TILE_DATA_WIDGET = TILE_DATA_WIDGET;
  public readonly OAM_VIEWER_WIDGET = OAM_VIEWER_WIDGET;
  public readonly INTERRUPTS_STATE_WIDGET = INTERRUPTS_STATE_WIDGET;
  public readonly DEBUG_MENU_ITEMS: { subMenu: string, items: DebugWidget[] }[] = [];

  @ViewChild("gameboy", { static: true }) gameboy: GameboyComponent;

  public fileList: NzUploadFile[] = [];

  public currentDebugWidget: DebugWidget = environment.production ? null : DEBUG_WIDGETS[0];
  public skipStepCnt = 1;
  public skipFrameCnt = 1;

  constructor(
    private readonly romLoader: RomFileLoaderService
  ) {
    let currentSubMenu = "";
    DEBUG_WIDGETS.forEach((item) => {
      if (item.subMenu !== currentSubMenu) {
        currentSubMenu = item.subMenu;
        this.DEBUG_MENU_ITEMS.push({ subMenu: currentSubMenu, items: [] });
      }
      this.DEBUG_MENU_ITEMS[this.DEBUG_MENU_ITEMS.length - 1].items.push(item);
    });
  }

  public openDebugWidget(widget: DebugWidget): void {
    this.currentDebugWidget = widget;
  }

  public isDebugging(): boolean {
    return this.currentDebugWidget !== null;
  }

  public handleChange(info: NzUploadChangeParam): void {
    // HACK: Disable upload file list
    if (info.file.status !== "done") {
      return;
    }
    this.fileList = [];
    const file = info.file;
    this.romLoader.loadRom(file.originFileObj).then((rom) => {
      this.gameboy.loadRom(rom);
    });
  }
}
