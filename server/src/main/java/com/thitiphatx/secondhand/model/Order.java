package com.thitiphatx.secondhand.model;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {
    @Id
    private String id;
    private String userId;
    private Address shippingAddress;
    private OrderItem item;
    @Field(targetType = FieldType.DECIMAL128)
    private BigDecimal total;
    private LocalDateTime purchasedDate;
    private OrderStatus status;

    @Builder.Default
    private List<OrderStatusHistory> statusHistory = new ArrayList<>();

    private String shippingCode;
    private String deliveryUrl;

    private String paymentMethod;
    private String clientSecret;
    private String paymentIntentId;
    private String refundEmail;

    public void updateStatus(OrderStatus newStatus) {
        this.status = newStatus;
        if (this.statusHistory == null) {
            this.statusHistory = new ArrayList<>();
        }
        this.statusHistory.add(OrderStatusHistory.builder()
                .status(newStatus)
                .timestamp(LocalDateTime.now())
                .build());
    }

    public void updateStatus(OrderStatus newStatus, String shippingCode, String deliveryUrl) {
        this.status = newStatus;
        if (this.statusHistory == null) {
            this.statusHistory = new ArrayList<>();
        }
        this.statusHistory.add(OrderStatusHistory.builder()
                .status(newStatus)
                .timestamp(LocalDateTime.now())
                .shippingCode(shippingCode)
                .deliveryUrl(deliveryUrl)
                .build());
        if (newStatus == OrderStatus.SHIPPED) {
            this.shippingCode = shippingCode;
            this.deliveryUrl = deliveryUrl;
        }
    }

    public OrderStatus getPreviousStatusBeforeRefund() {
        if (this.statusHistory == null || this.statusHistory.isEmpty()) {
            return null;
        }
        
        int pendingRefundIndex = -1;
        for (int i = this.statusHistory.size() - 1; i >= 0; i--) {
            if (this.statusHistory.get(i).getStatus() == OrderStatus.PENDING_REFUND) {
                pendingRefundIndex = i;
                break;
            }
        }
        
        if (pendingRefundIndex > 0) {
            return this.statusHistory.get(pendingRefundIndex - 1).getStatus();
        }
        
        return null;
    }
}
