import { Component, ViewChild } from "@angular/core";
import { NzUploadChangeParam, NzUploadFile } from "ng-zorro-antd/upload";
import { environment } from "src/environments/environment";
import { GameboyComponent } from "./components/gameboy/gameboy.component";
import { RomFileLoaderService } from "./services/rom-file-loader/rom-file-loader.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent {
  public readonly CPU_STATE_WIDGET = 0;
  public readonly DISASSEMBLER_WIDGET = 1;
  public readonly MEMORY_STATE_WIDGET = 2;
  public readonly GPU_STATE_WIDGET = 3;
  public readonly BG_MAP_WIDGET = 4;
  public readonly TILE_DATA_WIDGET = 5;

  @ViewChild("gameboy", { static: true }) gameboy: GameboyComponent;

  public fileList: NzUploadFile[] = [];

  public currentDebugWidget: number = environment.production ? null : this.CPU_STATE_WIDGET;
  public skipStepCnt = 1;
  public skipFrameCnt = 1;

  constructor(
    private readonly romLoader: RomFileLoaderService
  ) { }

  public openDebugWidget(widgetId: number): void {
    this.currentDebugWidget = widgetId;
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
