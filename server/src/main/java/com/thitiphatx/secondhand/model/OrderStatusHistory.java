package com.thitiphatx.secondhand.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderStatusHistory {
    private OrderStatus status;
    private LocalDateTime timestamp;
    private String shippingCode;
    private String deliveryUrl;
}
