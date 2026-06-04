import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError(error => {
      if (!(error instanceof HttpErrorResponse)) {
        return throwError(() => error);
      }

      const responseBody = error.error as { message?: string } | string | null;
      const serverMessage =
        typeof responseBody === 'object' && responseBody !== null
          ? responseBody.message
          : undefined;
      const message = serverMessage ?? 'Ha ocurrido un error inesperado';
      const contextualMessage = `${message} [${req.method} ${req.urlWithParams} status=${error.status}]`;

      console.error('[errorInterceptor][HTTP Error]', {
        method: req.method,
        url: req.urlWithParams,
        status: error.status,
        responseBody,
        message,
      });

      return throwError(() => new Error(contextualMessage));
    }),
  );
};
