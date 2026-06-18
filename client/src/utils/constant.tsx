import { Ban, CheckCircle, Clock, CreditCard, Package, Truck } from "lucide-react";
import type { OrderStatus } from "../pages/orders/interface";
import type { ProductState } from "../interface";

export const productStateInfo: Record<ProductState, { label: string; color: string }> = {
    LISTED: { label: 'Listed', color: 'success' },
    WAIT_APPROVE: { label: 'Pending Approval', color: 'warning' },
    PURCHASED: { label: 'Purchased', color: 'blue' },
};

export const orderStatusInfo: Record<OrderStatus, any> = {
    "PAY_WAITING": {
        label: "Waiting for Payment",
        color: 'warning',
        icon: <CreditCard size={16} />,
        step: 0,
        description: "Please complete payment to process your order."
    },
    "PENDING": {
        label: "Pending",
        color: 'processing',
        icon: <Clock size={16} />,
        step: 1,
        description: "Seller is preparing your parcel."
    },
    "SHIPPED": {
        label: "Shipped",
        color: 'blue',
        icon: <Truck size={16} />,
        step: 2,
        description: "Parcel has been handed over to the carrier."
    },
    "DELIVERED": {
        label: "Delivered",
        color: 'success',
        icon: <Package size={16} />,
        step: 3,
        description: "Parcel has been successfully delivered."
    },
    "CANCELLED": {
        label: "Cancelled",
        color: 'error',
        icon: <Ban size={16} />,
        step: 4,
        description: "This order has been cancelled."
    },
    "PENDING_REFUND": {
        label: "Pending Refund",
        color: 'purple',
        icon: <Clock size={16} />,
        step: 5,
        description: "Your refund request is being processed."
    },
    "REFUND_APPROVED": {
        label: "Refund Approved",
        color: 'success',
        icon: <CheckCircle size={16} />,
        step: 5,
        description: "Refund approved. Waiting for payment gateway to process."
    },
    "REFUNDED": {
        label: "Refunded",
        color: 'success',
        icon: <Ban size={16} />,
        step: 6,
        description: "This order has been fully refunded."
    }
}