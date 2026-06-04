import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi, type Mocked } from 'vitest';
import { ProductRepository } from '../repositories/product.repository';
import { VerifyProductIdUseCase } from './verify-product-id.use-case';

describe('VerifyProductIdUseCase', () => {
  let useCase: VerifyProductIdUseCase;
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
        VerifyProductIdUseCase,
        {
          provide: ProductRepository,
          useValue: mockRepo,
        },
      ],
    });

    useCase = TestBed.inject(VerifyProductIdUseCase);
  });

  it('calls repository verifyId and returns the existence flag', async () => {
    mockRepo.verifyId.mockReturnValue(of(true));

    const result = await new Promise<boolean>(resolve => {
      useCase.execute('p1').subscribe(exists => resolve(exists));
    });

    expect(result).toBe(true);
    expect(mockRepo.verifyId).toHaveBeenCalledOnce();
    expect(mockRepo.verifyId).toHaveBeenCalledWith('p1');
  });
});
