import type { IProduct, IReview } from '../../interface';

export interface IProductDetailState {
  product: IProduct;
  reviews: IReview[];
  isLoading: boolean;
}
