package com.thitiphatx.secondhand.dto;

import com.thitiphatx.secondhand.model.ProductState;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ProductRequest {
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private List<String> tags;
    private String shopkeeper;
    private String shopkeeperId;
    private ProductState state;
    private String keyword;
}
