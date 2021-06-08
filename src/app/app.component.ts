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

  public isDebugging: boolean = false;

  constructor(
    private readonly romLoader: RomFileLoaderService
  ) { }

  public toggleDebug(): void {
    this.isDebugging = !this.isDebugging;
  }

  public handleChange(info: NzUploadChangeParam): void {
    if (info.file.status !== "uploading") {
      return;
    }
    const file = info.file;
    this.romLoader.loadRom(file.originFileObj).then((rom) => {
      this.gameboy.runRom(rom);
    });
  };
}
