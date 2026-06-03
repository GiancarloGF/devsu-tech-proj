import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { map, Observable } from 'rxjs';
import { Product } from '../../domain/models/product.model';
import { ProductRepository } from '../../domain/repositories/product.repository';
import { ProductResponseDto } from '../dtos/product-response.dto';
import { ProductMapper } from '../mappers/product.mapper';

@Injectable()
export class ProductHttpRepository implements ProductRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/bp/products`;

  getAll(): Observable<Product[]> {
    return this.http
      .get<ProductResponseDto>(this.baseUrl)
      .pipe(map(response => response.data.map(ProductMapper.fromDto)));
  }

  create(product: Omit<Product, 'date_revision'>): Observable<Product> {
    return this.http
      .post<{ data: Product }>(this.baseUrl, product)
      .pipe(map(response => response.data));
  }

  update(id: string, product: Omit<Product, 'id'>): Observable<Product> {
    return this.http
      .put<{ data: Product }>(`${this.baseUrl}/${id}`, product)
      .pipe(map(response => response.data));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  verifyId(id: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/verification/${id}`);
  }
}
