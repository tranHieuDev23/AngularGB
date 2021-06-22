import { Component, ElementRef, ViewChild } from "@angular/core";
import { GameboyComponent } from "./components/gameboy/gameboy.component";
import { RomFileLoaderService } from "./services/rom-file-loader/rom-file-loader.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent {
  @ViewChild("gameboy", { static: true }) gameboy: GameboyComponent;
  @ViewChild("fileInput", { static: true }) fileInput: ElementRef<HTMLInputElement>;

  constructor(
    private readonly romLoader: RomFileLoaderService
  ) { }

  public openSelectRomDialog(): void {
    this.fileInput?.nativeElement.click();
  }

  public handleChange(event: Event): void {
    const files = (event.target as HTMLInputElement).files;
    const file = files.item(0);
    this.romLoader.loadRom(file).then((rom) => {
      this.gameboy.loadRom(rom);
    });
  }
}
