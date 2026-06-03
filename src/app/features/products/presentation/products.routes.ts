import { Routes } from '@angular/router';
import { ProductRepository } from '../domain/repositories/product.repository';
import { CreateProductUseCase } from '../domain/use-cases/create-product.use-case';
import { DeleteProductUseCase } from '../domain/use-cases/delete-product.use-case';
import { GetProductsUseCase } from '../domain/use-cases/get-products.use-case';
import { UpdateProductUseCase } from '../domain/use-cases/update-product.use-case';
import { VerifyProductIdUseCase } from '../domain/use-cases/verify-product-id.use-case';
import { ProductHttpRepository } from '../infrastructure/repositories/product-http.repository';

export const routes: Routes = [
  {
    path: '',
    providers: [
      CreateProductUseCase,
      DeleteProductUseCase,
      GetProductsUseCase,
      UpdateProductUseCase,
      VerifyProductIdUseCase,
      {
        provide: ProductRepository,
        useClass: ProductHttpRepository,
      },
    ],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/product-list/product-list.component').then(m => m.ProductListComponent),
      },
    ],
  },
];
