import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import {provideHttpClient} from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient() // Нужен, чтобы Angular мог делать GET, POST и другие HTTP-запросы
  ]
};
