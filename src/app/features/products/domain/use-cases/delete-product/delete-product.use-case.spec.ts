import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi, type Mocked } from 'vitest';
import { ProductRepository } from '../../repositories/product.repository';
import { DeleteProductUseCase } from './delete-product.use-case';

describe('DeleteProductUseCase', () => {
  let useCase: DeleteProductUseCase;
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
        DeleteProductUseCase,
        {
          provide: ProductRepository,
          useValue: mockRepo,
        },
      ],
    });

    useCase = TestBed.inject(DeleteProductUseCase);
  });

  it('calls repository delete with the provided id', async () => {
    mockRepo.delete.mockReturnValue(of(void 0));

    const result = await new Promise<void>(resolve => {
      useCase.execute('p1').subscribe(() => resolve());
    });

    expect(result).toBeUndefined();
    expect(mockRepo.delete).toHaveBeenCalledOnce();
    expect(mockRepo.delete).toHaveBeenCalledWith('p1');
  });
});
