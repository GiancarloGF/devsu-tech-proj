import { Router } from '@angular/router';
import { Product } from '@features/products/domain/models/product.model';
import { DeleteProductUseCase } from '@features/products/domain/use-cases/delete-product/delete-product.use-case';
import { GetProductsUseCase } from '@features/products/domain/use-cases/get-products/get-products.use-case';
import { MockBuilder, MockRender } from 'ng-mocks';
import { Observable, of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProductListComponent } from './product-list.component';

describe('ProductListComponent', () => {
  const products: Product[] = [
    {
      id: 'trj-crd',
      name: 'Tarjeta Credito',
      description: 'Tarjeta de credito',
      logo: 'logo.png',
      date_release: '2027-01-01',
      date_revision: '2028-01-01',
    },
    {
      id: 'cta-ah',
      name: 'Cuenta Ahorros',
      description: 'Cuenta bancaria',
      logo: 'logo.png',
      date_release: '2027-02-01',
      date_revision: '2028-02-01',
    },
  ];

  let getProductsExecute: ReturnType<typeof vi.fn<() => Observable<Product[]>>>;
  let deleteProductExecute: ReturnType<typeof vi.fn<(id: string) => Observable<void>>>;
  let navigate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    getProductsExecute = vi.fn(() => of(products));
    deleteProductExecute = vi.fn(() => of(void 0));
    navigate = vi.fn();

    return MockBuilder(ProductListComponent)
      .provide({
        provide: GetProductsUseCase,
        useValue: { execute: getProductsExecute },
      })
      .provide({
        provide: DeleteProductUseCase,
        useValue: { execute: deleteProductExecute },
      })
      .provide({
        provide: Router,
        useValue: { navigate },
      });
  });

  it('filters products by name and description', async () => {
    const fixture = MockRender(ProductListComponent);
    await fixture.whenStable();
    const component = fixture.point.componentInstance;

    component.onSearch('ahorros');

    expect(component.filteredProducts()).toEqual([products[1]]);
  });

  it('resets current page when search term or page size changes', async () => {
    const fixture = MockRender(ProductListComponent);
    await fixture.whenStable();
    const component = fixture.point.componentInstance;

    component.onPageChange(2);
    component.onSearch('tarjeta');

    expect(component.currentPage()).toBe(1);

    component.onPageChange(2);
    component.onPageSizeChange(10);

    expect(component.currentPage()).toBe(1);
  });

  it('navigates to add and edit routes', () => {
    const fixture = MockRender(ProductListComponent);
    const component = fixture.point.componentInstance;

    component.navigateToAdd();
    component.onEditRequest(products[0]);

    expect(navigate).toHaveBeenCalledWith(['/products/add']);
    expect(navigate).toHaveBeenCalledWith(['/products/edit', products[0].id], {
      state: { product: products[0] },
    });
  });

  it('opens, cancels and clears the delete modal state', () => {
    const fixture = MockRender(ProductListComponent);
    const component = fixture.point.componentInstance;

    component.onDeleteRequest(products[0]);
    expect(component.isDeleteModalOpen()).toBe(true);
    expect(component.productToDelete()).toEqual(products[0]);

    component.onDeleteCancel();
    expect(component.isDeleteModalOpen()).toBe(false);
    expect(component.productToDelete()).toBeNull();
  });

  it('deletes the selected product and reloads the resource', () => {
    const fixture = MockRender(ProductListComponent);
    const component = fixture.point.componentInstance;
    const reloadSpy = vi.spyOn(component.productsResource, 'reload');

    component.onDeleteRequest(products[0]);
    component.onDeleteConfirm();

    expect(deleteProductExecute).toHaveBeenCalledWith(products[0].id);
    expect(component.isDeleteModalOpen()).toBe(false);
    expect(component.productToDelete()).toBeNull();
    expect(reloadSpy).toHaveBeenCalledOnce();
  });

  it('shows a delete error when deletion fails', () => {
    deleteProductExecute.mockReturnValue(throwError(() => new Error('Delete failed')));
    const fixture = MockRender(ProductListComponent);
    const component = fixture.point.componentInstance;

    component.onDeleteRequest(products[0]);
    component.onDeleteConfirm();

    expect(component.deleteErrorMessage()).toBe('Delete failed');
    expect(component.isDeleteModalOpen()).toBe(false);
  });
});
