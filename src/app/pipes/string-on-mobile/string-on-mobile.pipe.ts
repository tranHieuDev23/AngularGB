import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'stringOnMobile',
    pure: false
})
export class StringOnMobilePipe implements PipeTransform {
    private viewportWidth = 0;

    constructor() {
        this.viewportWidth = window.innerWidth;
        window.addEventListener('resize', () => {
            this.viewportWidth = window.innerWidth;
        });
    }

    transform(text: string, mobileString: string = ''): string {
        return this.viewportWidth < 768 ? mobileString : text;
    }

}
