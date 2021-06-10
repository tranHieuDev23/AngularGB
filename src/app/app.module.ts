import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { NZ_I18N } from "ng-zorro-antd/i18n";
import { en_US } from "ng-zorro-antd/i18n";
import { registerLocaleData } from "@angular/common";
import en from "@angular/common/locales/en";
import { FormsModule } from "@angular/forms";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { GameboyModule } from "./components/gameboy/gameboy.module";
import { NzLayoutModule } from "ng-zorro-antd/layout";
import { NzMenuModule } from "ng-zorro-antd/menu";
import { NzUploadModule } from "ng-zorro-antd/upload";
import { NzButtonModule } from "ng-zorro-antd/button";
import { NzIconModule } from "ng-zorro-antd/icon";
import { NzGridModule } from "ng-zorro-antd/grid";
import { NzListModule } from "ng-zorro-antd/list";
import { NzTabsModule } from "ng-zorro-antd/tabs";
import { NzInputNumberModule } from "ng-zorro-antd/input-number";
import { NzInputModule } from "ng-zorro-antd/input";
import { StringOnMobileModule } from "./pipes/string-on-mobile/string-on-mobile.module";
import { InterceptorService } from "./services/interceptor/interceptor.service";
import { CpuStateModule } from "./components/debug/cpu-state/cpu-state.module";
import { DisassemblerModule } from "./components/debug/disassembler/disassembler.module";
import { MemorySamplerModule } from "./components/debug/memory-sampler/memory-sampler.module";
import { GpuStateModule } from "./components/debug/gpu-state/gpu-state.module";
import { BgMapViewerModule } from "./components/debug/bg-map-viewer/bg-map-viewer.module";

registerLocaleData(en);

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    GameboyModule,
    NzLayoutModule,
    NzMenuModule,
    NzUploadModule,
    NzButtonModule,
    NzIconModule,
    NzGridModule,
    StringOnMobileModule,
    NzListModule,
    NzTabsModule,
    NzInputNumberModule,
    NzInputModule,
    CpuStateModule,
    DisassemblerModule,
    MemorySamplerModule,
    GpuStateModule,
    BgMapViewerModule
  ],
  providers: [
    { provide: NZ_I18N, useValue: en_US },
    { provide: HTTP_INTERCEPTORS, useClass: InterceptorService, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
