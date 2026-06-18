import type { IOrder as ICommonOrder } from '../orders/interface';

export interface IOrder extends ICommonOrder {
  // Add any shopkeeper-specific order fields if necessary
}

export interface IShopkeeperStats {
  totalSales: number;
  totalOrders: number;
  activeProducts: number;
  averageRating: number;
}