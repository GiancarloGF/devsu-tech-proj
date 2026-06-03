import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  resource,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { Product } from '@features/products/domain/models/product.model';
import { DeleteProductUseCase } from '@features/products/domain/use-cases/delete-product.use-case';
import { GetProductsUseCase } from '@features/products/domain/use-cases/get-products.use-case';
import { SkeletonComponent } from '@shared/components/skeleton/skeleton.component';
import { firstValueFrom } from 'rxjs';
import { DeleteModalComponent } from '../../components/delete-modal/delete-modal.component';
import { ProductTableComponent } from '../../components/product-table/product-table.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, ProductTableComponent, SkeletonComponent, DeleteModalComponent],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListComponent {
  private readonly getProductsUseCase = inject(GetProductsUseCase);
  private readonly deleteProductUseCase = inject(DeleteProductUseCase);
  private readonly router = inject(Router);

  // ── Controles de usuario y estado derivado
  readonly searchTerm = signal('');
  readonly pageSize = signal(5);
  readonly pageSizeOptions = [5, 10, 20];

  readonly currentPage = linkedSignal<number>(() => {
    this.searchTerm();
    this.pageSize();
    return 1;
  });

  readonly productsResource = resource({
    loader: () => firstValueFrom(this.getProductsUseCase.execute()),
  });

  readonly filteredProducts = computed(() => {
    const products = this.productsResource.value() ?? [];
    const term = this.searchTerm().toLowerCase();

    if (!term) return products;

    return products.filter(
      p => p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term),
    );
  });

  readonly totalResults = computed(() => this.filteredProducts().length);

  readonly pagedProducts = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();

    return this.filteredProducts().slice(start, start + this.pageSize());
  });

  readonly totalPages = computed(() => Math.ceil(this.totalResults() / this.pageSize()));

  readonly pagesArray = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  // ── Estado del modal de eliminación ──────────────────────────────────────
  readonly productToDelete = signal<Product | null>(null);
  readonly isDeleteModalOpen = signal(false);
  readonly deleteErrorMessage = signal('');

  // ── Acciones
  onSearch(term: string): void {
    this.searchTerm.set(term);
    // currentPage se resetea automáticamente via linkedSignal
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    // currentPage se resetea automáticamente via linkedSignal
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  navigateToAdd(): void {
    this.router.navigate(['/products/add']);
  }

  onEditRequest(product: Product): void {
    this.router.navigate(['/products/edit', product.id], { state: { product } });
  }

  onDeleteRequest(product: Product): void {
    this.productToDelete.set(product);
    this.isDeleteModalOpen.set(true);
    this.deleteErrorMessage.set('');
  }

  onDeleteConfirm(): void {
    const product = this.productToDelete();
    if (!product) return;

    this.deleteProductUseCase.execute(product.id).subscribe({
      next: () => {
        this.isDeleteModalOpen.set(false);
        this.productToDelete.set(null);
        this.productsResource.reload(); // ← recarga el resource en lugar de llamar loadProducts()
      },
      error: (err: Error) => {
        this.deleteErrorMessage.set(err.message);
        this.isDeleteModalOpen.set(false);
      },
    });
  }

  onDeleteCancel(): void {
    this.isDeleteModalOpen.set(false);
    this.productToDelete.set(null);
  }
}
