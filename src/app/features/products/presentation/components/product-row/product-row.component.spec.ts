import { MockBuilder, MockRender } from 'ng-mocks';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Product } from '../../../domain/models/product.model';
import { ProductRowComponent } from './product-row.component';

describe('ProductRowComponent', () => {
  const product: Product = {
    id: 'trj-crd',
    name: 'Tarjeta Credito',
    description: 'Tarjeta de credito',
    logo: 'logo.png',
    date_release: '2027-01-01',
    date_revision: '2028-01-01',
  };

  beforeEach(() => MockBuilder(ProductRowComponent));

  it('starts with the menu closed', () => {
    const fixture = MockRender(ProductRowComponent, { product });

    expect(fixture.point.componentInstance.isMenuOpen()).toBe(false);
  });

  it('renders product values in the row', () => {
    const fixture = MockRender(ProductRowComponent, { product });

    expect(fixture.nativeElement.textContent).toContain(product.name);
    expect(fixture.nativeElement.textContent).toContain(product.date_revision);
  });

  it('opens and closes the contextual menu', () => {
    const fixture = MockRender(ProductRowComponent, { product });
    const button = fixture.nativeElement.querySelector('.menu-trigger') as HTMLButtonElement;

    button.click();
    fixture.detectChanges();

    expect(fixture.point.componentInstance.isMenuOpen()).toBe(true);
    expect(fixture.nativeElement.querySelector('.dropdown-menu')).not.toBeNull();

    fixture.point.componentInstance.closeMenu();

    expect(fixture.point.componentInstance.isMenuOpen()).toBe(false);
  });

  it('emits edit with the current product', () => {
    const fixture = MockRender(ProductRowComponent, { product });
    const editSpy = vi.fn();
    fixture.point.componentInstance.edit.subscribe(editSpy);

    fixture.point.componentInstance.onEdit();

    expect(editSpy).toHaveBeenCalledWith(product);
    expect(fixture.point.componentInstance.isMenuOpen()).toBe(false);
  });

  it('emits delete with the current product', () => {
    const fixture = MockRender(ProductRowComponent, { product });
    const deleteSpy = vi.fn();
    fixture.point.componentInstance.delete.subscribe(deleteSpy);

    fixture.point.componentInstance.onDelete();

    expect(deleteSpy).toHaveBeenCalledWith(product);
    expect(fixture.point.componentInstance.isMenuOpen()).toBe(false);
  });
});
