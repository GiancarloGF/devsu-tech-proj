import { ActivatedRoute, Router } from '@angular/router';
import { Product } from '@features/products/domain/models/product.model';
import { CreateProductUseCase } from '@features/products/domain/use-cases/create-product/create-product.use-case';
import { GetProductsUseCase } from '@features/products/domain/use-cases/get-products/get-products.use-case';
import { UpdateProductUseCase } from '@features/products/domain/use-cases/update-product/update-product.use-case';
import { VerifyProductIdUseCase } from '@features/products/domain/use-cases/verify-product-id/verify-product-id.use-case';
import { MockBuilder, MockRender } from 'ng-mocks';
import { Observable, of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProductFormComponent } from './product-form.component';

describe('ProductFormComponent', () => {
  const product: Product = {
    id: 'trj-crd',
    name: 'Tarjeta Credito',
    description: 'Tarjeta de credito',
    logo: 'logo.png',
    date_release: '2027-01-01',
    date_revision: '2028-01-01',
  };

  let routeParams: Record<string, string>;
  let createExecute: ReturnType<
    typeof vi.fn<(product: Omit<Product, 'date_revision'>) => Observable<Product>>
  >;
  let updateExecute: ReturnType<
    typeof vi.fn<(id: string, product: Omit<Product, 'id'>) => Observable<Product>>
  >;
  let verifyExecute: ReturnType<typeof vi.fn<(id: string) => Observable<boolean>>>;
  let getProductsExecute: ReturnType<typeof vi.fn<() => Observable<Product[]>>>;
  let navigate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    routeParams = {};
    createExecute = vi.fn(() => of(product));
    updateExecute = vi.fn(() => of(product));
    verifyExecute = vi.fn(() => of(false));
    getProductsExecute = vi.fn(() => of([product]));
    navigate = vi.fn();

    return MockBuilder(ProductFormComponent)
      .provide({
        provide: ActivatedRoute,
        useValue: { snapshot: { params: routeParams } },
      })
      .provide({
        provide: Router,
        useValue: { navigate },
      })
      .provide({
        provide: CreateProductUseCase,
        useValue: { execute: createExecute },
      })
      .provide({
        provide: UpdateProductUseCase,
        useValue: { execute: updateExecute },
      })
      .provide({
        provide: VerifyProductIdUseCase,
        useValue: { execute: verifyExecute },
      })
      .provide({
        provide: GetProductsUseCase,
        useValue: { execute: getProductsExecute },
      });
  });

  it('starts in create mode without an edit id', () => {
    const fixture = MockRender(ProductFormComponent);
    const component = fixture.point.componentInstance;

    expect(component.isEditMode()).toBe(false);
    expect(component.pageTitle()).toBe('Formulario de Registro');
    expect(component.form.get('id')?.enabled).toBe(true);
  });

  it('loads edit mode data and disables the id field', () => {
    routeParams['id'] = product.id;

    const fixture = MockRender(ProductFormComponent);
    const component = fixture.point.componentInstance;

    expect(component.isEditMode()).toBe(true);
    expect(component.pageTitle()).toBe('Formulario de Edición');
    expect(component.form.get('id')?.disabled).toBe(true);
    expect(component.form.get('name')?.value).toBe(product.name);
  });

  it('calculates review date when release date changes', () => {
    const fixture = MockRender(ProductFormComponent);
    const component = fixture.point.componentInstance;

    component.form.get('date_release')?.setValue('04/06/2027');

    expect(component.form.get('date_revision')?.value).toBe('04/06/2028');
  });

  it('marks all fields as touched when submitting an invalid form', () => {
    const fixture = MockRender(ProductFormComponent);
    const component = fixture.point.componentInstance;

    component.onSubmit();

    expect(component.form.get('id')?.touched).toBe(true);
    expect(createExecute).not.toHaveBeenCalled();
  });

  it('submits a valid create payload with ISO dates', async () => {
    const fixture = MockRender(ProductFormComponent);
    const component = fixture.point.componentInstance;

    component.form.patchValue({
      id: 'abc',
      name: 'Producto Nuevo',
      description: 'Descripcion valida',
      logo: 'logo.png',
      date_release: '04/06/2027',
    });
    await new Promise(resolve => setTimeout(resolve, 450));

    component.onSubmit();

    expect(createExecute).toHaveBeenCalledWith({
      id: 'abc',
      name: 'Producto Nuevo',
      description: 'Descripcion valida',
      logo: 'logo.png',
      date_release: '2027-06-04',
      date_revision: '2028-06-04',
    });
    expect(navigate).toHaveBeenCalledWith(['/products']);
  });

  it('sets an error message when create fails', async () => {
    createExecute.mockReturnValue(throwError(() => new Error('Create failed')));
    const fixture = MockRender(ProductFormComponent);
    const component = fixture.point.componentInstance;

    component.form.patchValue({
      id: 'abc',
      name: 'Producto Nuevo',
      description: 'Descripcion valida',
      logo: 'logo.png',
      date_release: '04/06/2027',
    });
    await new Promise(resolve => setTimeout(resolve, 450));

    component.onSubmit();

    expect(component.errorMessage()).toBe('Create failed');
    expect(component.isSubmitting()).toBe(false);
  });

  it('resets the form and clears local errors', () => {
    const fixture = MockRender(ProductFormComponent);
    const component = fixture.point.componentInstance;
    component.errorMessage.set('Failed');

    component.onReset();

    expect(component.errorMessage()).toBe('');
    expect(component.dateRevisionValue()).toBe('');
  });
});
