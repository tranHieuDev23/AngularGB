import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
    providedIn: "root"
})
export class InterceptorService implements HttpInterceptor {
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (!req.url.endsWith("/intercepted")) {
            return next.handle(req);
        }
        return new Observable<HttpEvent<any>>((subscriber) => {
            setTimeout(() => {
                subscriber.next(new HttpResponse({ status: 200 }));
                subscriber.complete();
            }, 20);
        });
    }
}
