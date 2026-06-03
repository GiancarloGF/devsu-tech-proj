import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'products',
    pathMatch: 'full',
  },
  {
    path: 'products',
    loadChildren: () =>
      import('@features/products/presentation/products.routes').then(m => m.routes),
  },
  {
    path: '**',
    redirectTo: 'products',
  },
];
