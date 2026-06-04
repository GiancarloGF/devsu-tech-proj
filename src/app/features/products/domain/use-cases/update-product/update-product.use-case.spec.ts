import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi, type Mocked } from 'vitest';
import { Product } from '../../models/product.model';
import { ProductRepository } from '../../repositories/product.repository';
import { UpdateProductUseCase } from './update-product.use-case';

describe('UpdateProductUseCase', () => {
  let useCase: UpdateProductUseCase;
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
        UpdateProductUseCase,
        {
          provide: ProductRepository,
          useValue: mockRepo,
        },
      ],
    });

    useCase = TestBed.inject(UpdateProductUseCase);
  });

  it('calls repository update with id and product data', async () => {
    const payload: Omit<Product, 'id'> = {
      name: 'Producto actualizado',
      description: 'Descripcion actualizada',
      logo: 'logo.png',
      date_release: '2027-01-01',
      date_revision: '2028-01-01',
    };
    const updatedProduct: Product = {
      id: 'p1',
      ...payload,
    };
    mockRepo.update.mockReturnValue(of(updatedProduct));

    const result = await new Promise<Product>(resolve => {
      useCase.execute('p1', payload).subscribe(product => resolve(product));
    });

    expect(result).toEqual(updatedProduct);
    expect(mockRepo.update).toHaveBeenCalledOnce();
    expect(mockRepo.update).toHaveBeenCalledWith('p1', payload);
  });
});
