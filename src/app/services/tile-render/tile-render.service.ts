import { Injectable } from "@angular/core";
import { CanvasLcd } from "src/models/lcd/canvas-lcd";
import { GbOam } from "src/models/mmu/mmu-wrappers/gb-oam";
import { GbPalettes } from "src/models/mmu/mmu-wrappers/gb-palettes";

const PIXEL_SIZE = 3;

@Injectable({
  providedIn: "root"
})
export class TileRenderService {

  public async renderSpriteTile(index: number, oam: GbOam, palettes: GbPalettes, paletteColors: string[]): Promise<string> {
    return new Promise<string>((resolve) => {
      const tile = oam.getSpriteTile(index);
      const tilePaletteNumber = oam.getSpriteFlags(index).paletteNumber;

      const canvas = document.createElement("canvas");
      canvas.width = tile.getWidth() * PIXEL_SIZE;
      canvas.height = tile.getHeight() * PIXEL_SIZE;
      const lcd = new CanvasLcd(canvas, tile.getWidth(), tile.getHeight(), PIXEL_SIZE, paletteColors);
      for (let x = 0; x < tile.getWidth(); x++) {
        for (let y = 0; y < tile.getHeight(); y++) {
          const color = palettes.getObjPaletteColor(tilePaletteNumber, tile.getColorIndex(x, y));
          lcd.updatePixel(x, y, color);
        }
      }

      lcd.draw();
      const content = lcd.getContentAsBase64();
      resolve(content);
    });
  }

}
