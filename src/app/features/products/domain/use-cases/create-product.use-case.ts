import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';
import { ProductRepository } from '../repositories/product.repository';

@Injectable({ providedIn: 'root' })
export class CreateProductUseCase {
  private readonly repo = inject(ProductRepository);

  execute(product: Omit<Product, 'date_revision'>): Observable<Product> {
    return this.repo.create(product);
  }
}
