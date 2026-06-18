package com.thitiphatx.secondhand.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShopkeeperPublicStatsResponse {
    private long successOrderCount;
    private long totalProducts;
    private double averageRating;
}
