import { of } from 'rxjs';
import { Product } from '../../models/product.model';
import { ProductRepository } from '../../repositories/product.repository';
import { GetProductsUseCase } from './get-products.use-case';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi, type Mocked } from 'vitest';

describe('GetProductsUseCase', () => {
  let useCase: GetProductsUseCase;
  let mockRepo: Mocked<ProductRepository>;

  beforeEach(() => {
    mockRepo = {
      getAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      verifyId: vi.fn(),
    } as unknown as Mocked<ProductRepository>;

    TestBed.configureTestingModule({
      providers: [
        GetProductsUseCase,
        {
          provide: ProductRepository,
          useValue: mockRepo,
        },
      ],
    });

    useCase = TestBed.inject(GetProductsUseCase);
  });

  it('calls repository getAll and returns products', async () => {
    const mockProducts: Product[] = [
      {
        id: 'p1',
        name: 'Producto 1',
        description: 'Descripcion valida',
        logo: 'url',
        date_release: '2025-01-01',
        date_revision: '2026-01-01',
      },
    ];
    mockRepo.getAll.mockReturnValue(of(mockProducts));

    const result = await new Promise<Product[]>(resolve => {
      useCase.execute().subscribe(products => resolve(products));
    });

    expect(result).toEqual(mockProducts);
    expect(mockRepo.getAll).toHaveBeenCalledTimes(1);
  });
});
