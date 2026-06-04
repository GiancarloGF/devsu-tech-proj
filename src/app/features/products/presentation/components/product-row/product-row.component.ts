import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClickOutsideDirective } from '@shared/directives/click-outside/click-outside.directive';
import { Product } from '../../../domain/models/product.model';

@Component({
  selector: 'app-product-row',
  standalone: true,
  imports: [CommonModule, ClickOutsideDirective],
  templateUrl: './product-row.component.html',
  styleUrl: './product-row.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductRowComponent {
  product = input.required<Product>();

  edit = output<Product>();
  delete = output<Product>();

  readonly isMenuOpen = signal(false);
  readonly menuPosition = signal({ top: 0, left: 0 });

  getLogoText(product: Product): string {
    return product.name.slice(0, 2).toUpperCase();
  }

  onLogoError(event: Event): void {
    const image = event.target as HTMLImageElement;
    image.hidden = true;
  }

  toggleMenu(event: MouseEvent): void {
    if (this.isMenuOpen()) {
      this.closeMenu();
      return;
    }

    const trigger = event.currentTarget as HTMLElement;
    const triggerRect = trigger.getBoundingClientRect();
    const menuWidth = 130;

    this.menuPosition.set({
      top: triggerRect.bottom + 4,
      left: Math.max(8, Math.min(triggerRect.right - menuWidth, window.innerWidth - menuWidth - 8)),
    });
    this.isMenuOpen.set(true);
  }

  closeMenu(): void {
    this.isMenuOpen.set(false);
  }

  onEdit(): void {
    this.edit.emit(this.product());
    this.closeMenu();
  }

  onDelete(): void {
    this.delete.emit(this.product());
    this.closeMenu();
  }
}
