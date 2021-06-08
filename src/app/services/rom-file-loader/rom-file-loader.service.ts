import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RomFileLoaderService {
  constructor() { }

  public async loadRom(file: File): Promise<number[]> {
    return new Promise<number[]>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const rom = Array.from(new Uint8Array(reader.result as ArrayBuffer));
        resolve(rom);
      };
      reader.readAsArrayBuffer(file);
    });
  }
}
