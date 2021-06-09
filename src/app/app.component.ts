import { Component, ViewChild } from "@angular/core";
import { NzUploadChangeParam, NzUploadFile } from "ng-zorro-antd/upload";
import { GameboyComponent } from "./components/gameboy/gameboy.component";
import { RomFileLoaderService } from "./services/rom-file-loader/rom-file-loader.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent {
  @ViewChild("gameboy", { static: true }) gameboy: GameboyComponent;

  public fileList: NzUploadFile[] = [];

  public isDebugging: boolean = false;
  public skipStepCnt: number = 1;
  public skipFrameCnt: number = 1;

  constructor(
    private readonly romLoader: RomFileLoaderService
  ) { }

  public toggleDebug(): void {
    this.isDebugging = !this.isDebugging;
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
  };
}
