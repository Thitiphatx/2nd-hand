package com.thitiphatx.secondhand.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShopkeeperStatsResponse {
    private BigDecimal totalSales;
    private long totalOrders;
    private long activeProducts;
    private double averageRating;
}
