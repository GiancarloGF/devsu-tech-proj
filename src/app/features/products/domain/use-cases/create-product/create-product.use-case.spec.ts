import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi, type Mocked } from 'vitest';
import { Product } from '../../models/product.model';
import { ProductRepository } from '../../repositories/product.repository';
import { CreateProductUseCase } from './create-product.use-case';

describe('CreateProductUseCase', () => {
  let useCase: CreateProductUseCase;
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
        CreateProductUseCase,
        {
          provide: ProductRepository,
          useValue: mockRepo,
        },
      ],
    });

    useCase = TestBed.inject(CreateProductUseCase);
  });

  it('calls repository create with the provided product', async () => {
    const payload: Omit<Product, 'date_revision'> = {
      id: 'p1',
      name: 'Producto 1',
      description: 'Descripcion valida',
      logo: 'logo.png',
      date_release: '2027-01-01',
    };
    const createdProduct: Product = {
      ...payload,
      date_revision: '2028-01-01',
    };
    mockRepo.create.mockReturnValue(of(createdProduct));

    const result = await new Promise<Product>(resolve => {
      useCase.execute(payload).subscribe(product => resolve(product));
    });

    expect(result).toEqual(createdProduct);
    expect(mockRepo.create).toHaveBeenCalledOnce();
    expect(mockRepo.create).toHaveBeenCalledWith(payload);
  });
});
