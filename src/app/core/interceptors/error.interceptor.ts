// import { Injectable } from '@angular/core';
// import {
//   HttpEvent,
//   HttpHandler,
//   HttpInterceptor,
//   HttpRequest,
//   HttpErrorResponse
// } from '@angular/common/http';
// import { Observable, throwError } from 'rxjs';
// import { catchError } from 'rxjs/operators';

// @Injectable()
// export class ErrorInterceptor implements HttpInterceptor {
//   intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
//     return next.handle(req).pipe(
//       catchError((error: HttpErrorResponse) => {
//         let errorMessage = 'An unexpected error occurred.';

//         if (error.error && error.error.message) {
//           errorMessage = error.error.message;
//         } else if (error.message) {
//           errorMessage = error.message;
//         }

//         console.error('HTTP Error:', error);
//         return throwError(() => new Error(errorMessage));
//       })
//     );
//   }
// }
