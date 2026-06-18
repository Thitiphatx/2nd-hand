import type { IUser } from '../auth/interface';
import type { IProduct } from '../../interface';

export interface IAdminUser extends IUser {
  enabled?: boolean;
}

export interface IAdminProduct extends IProduct {}

export interface IAdminStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  revenueTrend: IChartPoint[];
  userRegistrationTrend: IChartPoint[];
  productTagDistribution: IChartPoint[];
  orderStatusDistribution: IChartPoint[];
}

export interface IChartPoint {
  label: string;
  value: number;
}

export interface IAdminProduct extends IProduct {}

export interface IAdminOrderItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface IAdminOrder {
  id: string;
  userId: string;
  total: number;
  purchasedDate: string;
  status: string;
  paymentMethod: string;
  paymentIntentId?: string;
  shippingAddress?: {
    receiverName: string;
    phone: string;
    address: string;
    province: string;
    district: string;
    subDistrict: string;
    zipcode: string;
  };
  item?: IAdminOrderItem;
}
