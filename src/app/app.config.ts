import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { UrlSerializer } from '@angular/router';
import { ObfuscatedUrlSerializer } from '../obfuscated-url.serializer';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(), // HTTPClient
    {  provide: UrlSerializer, useClass: ObfuscatedUrlSerializer }
  ]
};