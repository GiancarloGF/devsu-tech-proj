import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductRepository } from '../repositories/product.repository';

@Injectable({ providedIn: 'root' })
export class DeleteProductUseCase {
  private readonly repo = inject(ProductRepository);

  execute(id: string): Observable<void> {
    return this.repo.delete(id);
  }
}
