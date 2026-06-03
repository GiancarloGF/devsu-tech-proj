import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
// import { provideHttpClient, withInterceptors } from '@angular/common/http';
// import { errorInterceptor } from '@core/interceptors/error.interceptor';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // provideHttpClient(withInterceptors([errorInterceptor])),
  ],
};
