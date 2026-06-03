import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../../domain/models/product.model';
import { ProductRowComponent } from '../product-row/product-row.component';

@Component({
  selector: 'app-product-table',
  standalone: true,
  imports: [CommonModule, ProductRowComponent],
  templateUrl: './product-table.component.html',
  styleUrl: './product-table.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductTableComponent {
  products = input<Product[]>([]);

  edit = output<Product>();
  delete = output<Product>();
}
