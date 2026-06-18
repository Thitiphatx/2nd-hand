package com.thitiphatx.secondhand.dto;

import lombok.Data;

@Data
public class CreateOrderItemRequest {
    private String productId;
    private String productName;
}
