import { Product } from '../../../domain/models/product.model';
import { ProductItemDto } from '../../dtos/product-response.dto';

export class ProductMapper {
  static fromDto(dto: ProductItemDto): Product {
    return {
      id: dto.id,
      name: dto.name,
      description: dto.description,
      logo: dto.logo,
      date_release: dto.date_release,
      date_revision: dto.date_revision,
    };
  }

  static toDto(product: Product): ProductItemDto {
    return { ...product };
  }
}
