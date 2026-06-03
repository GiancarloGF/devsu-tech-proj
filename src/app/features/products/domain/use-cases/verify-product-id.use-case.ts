import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductRepository } from '../repositories/product.repository';

@Injectable({ providedIn: 'root' })
export class VerifyProductIdUseCase {
  private readonly repo = inject(ProductRepository);

  execute(id: string): Observable<boolean> {
    return this.repo.verifyId(id);
  }
}
