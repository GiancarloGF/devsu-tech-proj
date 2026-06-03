import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError(error => {
      const message = error?.error?.message ?? 'Ha ocurrido un error inesperado';
      //TODO: agregar toast service global
      console.error('[errorInterceptor][HTTP Error]', message);
      return throwError(() => new Error(message));
    }),
  );
};
