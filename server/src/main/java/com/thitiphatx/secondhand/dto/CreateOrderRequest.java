package com.thitiphatx.secondhand.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateOrderRequest {
    @NotNull
    private String productId;
    private String addressId;
    @NotNull
    private String paymentMethod;
}
