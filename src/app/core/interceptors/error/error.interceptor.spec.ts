import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { errorInterceptor } from './error.interceptor';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    consoleErrorSpy.mockRestore();
  });

  it('propagates the server error message with request context', async () => {
    const resultPromise = new Promise<Error>(resolve => {
      http.get('/products').subscribe({
        error: (error: Error) => resolve(error),
      });
    });

    const request = httpMock.expectOne('/products');
    request.flush({ message: 'Invalid request' }, { status: 400, statusText: 'Bad Request' });

    const error = await resultPromise;

    expect(error.message).toBe('Invalid request [GET /products status=400]');
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[errorInterceptor][HTTP Error]',
      expect.objectContaining({
        method: 'GET',
        url: '/products',
        status: 400,
      }),
    );
  });

  it('uses the default message when the server body has no message', async () => {
    const resultPromise = new Promise<Error>(resolve => {
      http.get('/products').subscribe({
        error: (error: Error) => resolve(error),
      });
    });

    const request = httpMock.expectOne('/products');
    request.flush({}, { status: 500, statusText: 'Server Error' });

    const error = await resultPromise;

    expect(error.message).toBe('Ha ocurrido un error inesperado [GET /products status=500]');
  });
});
