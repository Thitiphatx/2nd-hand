import type { IProduct, IReview } from '../../interface';

export interface IShop {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  totalReviews: number;
  joinDate: string;
  location: string;
}

export interface IShopState {
  shop: IShop;
  products: IProduct[];
  reviews: IReview[];
  isLoading: boolean;
}
