import { MockBuilder, MockRender } from 'ng-mocks';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Product } from '../../../domain/models/product.model';
import { ProductRowComponent } from '../product-row/product-row.component';
import { ProductTableComponent } from './product-table.component';

describe('ProductTableComponent', () => {
  const product: Product = {
    id: 'trj-crd',
    name: 'Tarjeta Credito',
    description: 'Tarjeta de credito',
    logo: 'logo.png',
    date_release: '2027-01-01',
    date_revision: '2028-01-01',
  };

  beforeEach(() => MockBuilder(ProductTableComponent).keep(ProductRowComponent));

  it('renders products in the table body', () => {
    const fixture = MockRender(ProductTableComponent, { products: [product] });

    expect(fixture.nativeElement.textContent).toContain('Tarjeta Credito');
    expect(fixture.nativeElement.textContent).toContain('2027-01-01');
  });

  it('renders an empty state when there are no products', () => {
    const fixture = MockRender(ProductTableComponent, { products: [] });

    expect(fixture.nativeElement.textContent).toContain('No se encontraron productos');
  });

  it('propagates edit events from a product row', () => {
    const fixture = MockRender(ProductTableComponent, { products: [product] });
    const editSpy = vi.fn();
    fixture.point.componentInstance.edit.subscribe(editSpy);
    const menuButton = fixture.nativeElement.querySelector('.menu-trigger') as HTMLButtonElement;

    menuButton.click();
    fixture.detectChanges();
    const editButton = fixture.nativeElement.querySelector('.dropdown-item') as HTMLButtonElement;
    editButton.click();

    expect(editSpy).toHaveBeenCalledWith(product);
  });
});
