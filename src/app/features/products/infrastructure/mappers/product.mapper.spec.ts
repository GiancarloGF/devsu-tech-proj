import { describe, expect, it } from 'vitest';
import { Product } from '../../domain/models/product.model';
import { ProductItemDto } from '../dtos/product-response.dto';
import { ProductMapper } from './product.mapper';

describe('ProductMapper', () => {
  const productDto: ProductItemDto = {
    id: 'trj-crd',
    name: 'Tarjeta Credito',
    description: 'Tarjeta de credito',
    logo: 'logo.png',
    date_release: '2027-01-01',
    date_revision: '2028-01-01',
  };

  it('maps a product dto to a domain product', () => {
    const product = ProductMapper.fromDto(productDto);

    expect(product).toEqual<Product>({
      id: 'trj-crd',
      name: 'Tarjeta Credito',
      description: 'Tarjeta de credito',
      logo: 'logo.png',
      date_release: '2027-01-01',
      date_revision: '2028-01-01',
    });
  });

  it('maps a domain product to a product dto', () => {
    const product = ProductMapper.fromDto(productDto);

    expect(ProductMapper.toDto(product)).toEqual(productDto);
  });
});
