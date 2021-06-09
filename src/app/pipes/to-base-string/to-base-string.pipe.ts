import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'toBaseString'
})
export class ToBaseStringPipe implements PipeTransform {

  transform(value: number | number[], base: number, bitCount: number): string {
    if (value instanceof Array) {
      return value.map((item) => this.transform(item, base, bitCount)).join(", ");
    }
    let result = value.toString(base);
    if (base === 2 || base === 16) {
      const expectedLength = base === 2 ? bitCount : bitCount / 4;
      result = result.padStart(expectedLength, "0");
    }
    if (base === 16) {
      return `0x${result.toUpperCase()}`;
    }
    return result;
  }

}
