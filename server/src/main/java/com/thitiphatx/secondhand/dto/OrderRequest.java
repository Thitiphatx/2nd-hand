package com.thitiphatx.secondhand.dto;

import com.thitiphatx.secondhand.model.OrderStatus;
import lombok.Data;

@Data
public class OrderRequest {
    private OrderStatus status;
    private String keyword;
}
