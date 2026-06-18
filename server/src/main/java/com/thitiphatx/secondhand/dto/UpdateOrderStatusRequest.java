package com.thitiphatx.secondhand.dto;

import com.thitiphatx.secondhand.model.OrderStatus;
import lombok.Data;

@Data
public class UpdateOrderStatusRequest {
    private OrderStatus status;
    private String shippingCode;
    private String deliveryUrl;
}
