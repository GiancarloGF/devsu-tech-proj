import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClickOutsideDirective } from '@shared/directives/click-outside.directive';
import { Product } from '../../../domain/models/product.model';

@Component({
  selector: 'app-product-row',
  standalone: true,
  imports: [CommonModule, ClickOutsideDirective],
  templateUrl: './product-row.component.html',
  styleUrl: './product-row.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductRowComponent {
  product = input.required<Product>();

  edit = output<Product>();
  delete = output<Product>();

  readonly isMenuOpen = signal(false);

  toggleMenu(): void {
    this.isMenuOpen.update(open => !open);
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
