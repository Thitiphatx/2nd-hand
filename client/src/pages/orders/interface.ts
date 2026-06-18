import type { IModalFormProps } from '../../interface';
import type { IAddress } from '../account/interface';

export type OrderStatus = 'PAY_WAITING' | 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'PENDING_REFUND' | 'REFUND_APPROVED' | 'REFUNDED';

export interface IPurchasesProps {}

export interface IOrderItem {
  productId: string;
  productName: string;
  productImage: string;
  shopkeeperId: string;
  shopkeeperName: string;
  price: number;
}

export interface IOrderStatusHistory {
  status: OrderStatus;
  timestamp: string;
  shippingCode?: string;
  deliveryUrl?: string;
}

export interface IOrder {
  id: string;
  userId: string;
  shippingAddress?: IAddress;
  item: IOrderItem;
  total: number;
  purchasedDate: string;
  status: OrderStatus;
  statusHistory?: IOrderStatusHistory[];
  shippingCode?: string;
  deliveryUrl?: string;
  paymentMethod?: string;
  clientSecret?: string;
  paymentIntentId?: string;
}

export interface IPurchasesTabProps {
  status: OrderStatus | 'ALL';
  keyword?: string;
}

export interface IUpdateOrderStatusRequest {
  status: OrderStatus;
  shippingCode?: string;
  deliveryUrl?: string;
}

export interface IFormShipping {
  shippingCode: string;
  deliveryUrl: string;
}

export interface IModalShippingDetailProps extends IModalFormProps<IFormShipping> {
  
}