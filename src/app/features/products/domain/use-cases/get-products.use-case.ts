import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';
import { ProductRepository } from '../ports/product.repository';

@Injectable({ providedIn: 'root' })
export class GetProductsUseCase {
  private readonly repo = inject(ProductRepository);

  execute(): Observable<Product[]> {
    return this.repo.getAll();
  }
}
