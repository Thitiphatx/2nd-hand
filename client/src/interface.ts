import type { FormInstance } from "antd";

export interface ITag {
  id: string;
  name: string;
}

export interface IProductVariant {
  name: string;
  price?: number;
  stock: number;
  image?: string;
}

export type ProductState = 'LISTED' | 'PURCHASED' | 'WAIT_APPROVE';

export interface IProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  tags: string[];
  shopkeeperId: string;
  shopkeeperName: string;
  createdDate: string;
  state: ProductState;
  averageRating?: number;
}

export interface IProductItem extends Omit<IProduct, "averageRating" | "images" | "shopkeeperName" | "shopkeeperId"> {
  image: string;
}

export interface ICartItem extends IProduct {
  quantity: number;
}

export interface IReview {
  id: string;
  productId: string;
  userId: string;
  username: string;
  score: number;
  comment: string;
  images?: string[];
  reply?: string;
  createdAt: string;
  product?: IProductItem;
}

export interface IPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
}

export interface IFormProps<T> {
  isEdit?: boolean
  onSubmit: (values: T) => Promise<void>
  formInfo?: T
  form: FormInstance<T>
}

export interface IModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean)=> void;
}

export interface IModalFormProps<T> extends IModalProps, IFormProps<T> {
}

export interface ILastMessage {
  content: string;
  timestamp: string;
}

export interface IParticipant {
  id: string;
  name: string;
}

export interface IConversation {
  id: string;
  participants: IParticipant[];
  lastMessage?: ILastMessage;
  unreadCount: Record<string, number>;
  updatedAt: string;
}

export interface IMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'ORDER_REF';
  read: boolean;
  createdAt: string;
}