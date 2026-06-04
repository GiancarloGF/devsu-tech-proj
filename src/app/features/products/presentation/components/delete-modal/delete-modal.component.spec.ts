import { MockBuilder, MockRender } from 'ng-mocks';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DeleteModalComponent } from './delete-modal.component';

describe('DeleteModalComponent', () => {
  beforeEach(() => MockBuilder(DeleteModalComponent));

  it('does not render when closed', () => {
    const fixture = MockRender(DeleteModalComponent, { isOpen: false });

    expect(fixture.nativeElement.querySelector('.modal-overlay')).toBeNull();
  });

  it('renders the product name when open', () => {
    const fixture = MockRender(DeleteModalComponent, {
      isOpen: true,
      productName: 'Tarjeta Credito',
    });

    expect(fixture.nativeElement.textContent).toContain('Tarjeta Credito');
  });

  it('emits confirm when the primary action is clicked', () => {
    const fixture = MockRender(DeleteModalComponent, {
      isOpen: true,
      productName: 'Tarjeta Credito',
    });
    const confirmSpy = vi.fn();
    fixture.point.componentInstance.confirm.subscribe(confirmSpy);

    const button = fixture.nativeElement.querySelector('.btn-primary') as HTMLButtonElement;
    button.click();

    expect(confirmSpy).toHaveBeenCalledOnce();
  });

  it('emits canceled when the secondary action is clicked', () => {
    const fixture = MockRender(DeleteModalComponent, {
      isOpen: true,
      productName: 'Tarjeta Credito',
    });
    const cancelSpy = vi.fn();
    fixture.point.componentInstance.canceled.subscribe(cancelSpy);

    const button = fixture.nativeElement.querySelector('.btn-secondary') as HTMLButtonElement;
    button.click();

    expect(cancelSpy).toHaveBeenCalledOnce();
  });
});
