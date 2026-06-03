export interface ProductResponseDto {
  data: ProductItemDto[];
}

export interface ProductItemDto {
  id: string;
  name: string;
  description: string;
  logo: string;
  date_release: string;
  date_revision: string;
}
