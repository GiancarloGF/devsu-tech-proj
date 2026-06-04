import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '@env/environment';
import { beforeEach, describe, expect, it } from 'vitest';
import { Product } from '../../../domain/models/product.model';
import { ProductHttpRepository } from './product-http.repository';

describe('ProductHttpRepository', () => {
  let repository: ProductHttpRepository;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/bp/products`;

  const product: Product = {
    id: 'trj-crd',
    name: 'Tarjeta Credito',
    description: 'Tarjeta de credito',
    logo: 'logo.png',
    date_release: '2027-01-01',
    date_revision: '2028-01-01',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProductHttpRepository, provideHttpClient(), provideHttpClientTesting()],
    });

    repository = TestBed.inject(ProductHttpRepository);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('gets all products from the configured endpoint', async () => {
    const resultPromise = new Promise<Product[]>(resolve => {
      repository.getAll().subscribe(products => resolve(products));
    });

    const request = httpMock.expectOne(baseUrl);
    expect(request.request.method).toBe('GET');
    request.flush({ data: [product] });

    await expect(resultPromise).resolves.toEqual([product]);
  });

  it('creates a product with POST', async () => {
    const payload: Omit<Product, 'date_revision'> = {
      id: product.id,
      name: product.name,
      description: product.description,
      logo: product.logo,
      date_release: product.date_release,
    };
    const resultPromise = new Promise<Product>(resolve => {
      repository.create(payload).subscribe(createdProduct => resolve(createdProduct));
    });

    const request = httpMock.expectOne(baseUrl);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush({ data: product });

    await expect(resultPromise).resolves.toEqual(product);
  });

  it('updates a product with PUT', async () => {
    const payload: Omit<Product, 'id'> = {
      name: product.name,
      description: product.description,
      logo: product.logo,
      date_release: product.date_release,
      date_revision: product.date_revision,
    };
    const resultPromise = new Promise<Product>(resolve => {
      repository.update(product.id, payload).subscribe(updatedProduct => resolve(updatedProduct));
    });

    const request = httpMock.expectOne(`${baseUrl}/${product.id}`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(payload);
    request.flush({ data: product });

    await expect(resultPromise).resolves.toEqual(product);
  });

  it('deletes a product with DELETE', async () => {
    const resultPromise = new Promise<void>(resolve => {
      repository.delete(product.id).subscribe(() => resolve());
    });

    const request = httpMock.expectOne(`${baseUrl}/${product.id}`);
    expect(request.request.method).toBe('DELETE');
    request.flush({ message: 'Product removed successfully' });

    await expect(resultPromise).resolves.toBeUndefined();
  });

  it('verifies a product id with GET', async () => {
    const resultPromise = new Promise<boolean>(resolve => {
      repository.verifyId(product.id).subscribe(exists => resolve(exists));
    });

    const request = httpMock.expectOne(`${baseUrl}/verification/${product.id}`);
    expect(request.request.method).toBe('GET');
    request.flush(true);

    await expect(resultPromise).resolves.toBe(true);
  });
});
