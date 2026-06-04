import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from '../../models/product.model';
import { ProductRepository } from '../../repositories/product.repository';

@Injectable()
export class GetProductsUseCase {
  private readonly repo = inject(ProductRepository);

  execute(): Observable<Product[]> {
    return this.repo.getAll();
  }
}
