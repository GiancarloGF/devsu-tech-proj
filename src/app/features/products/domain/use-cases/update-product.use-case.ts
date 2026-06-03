import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';
import { ProductRepository } from '../ports/product.repository';

@Injectable({ providedIn: 'root' })
export class UpdateProductUseCase {
  private readonly repo = inject(ProductRepository);

  execute(id: string, product: Omit<Product, 'id'>): Observable<Product> {
    return this.repo.update(id, product);
  }
}
