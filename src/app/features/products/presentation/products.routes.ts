import { Routes } from '@angular/router';
import { ProductRepository } from '../domain/repositories/product.repository';
import { ProductHttpRepository } from '../infrastructure/repositories/product-http.repository';

export const routes: Routes = [
  {
    path: '',
    providers: [
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
