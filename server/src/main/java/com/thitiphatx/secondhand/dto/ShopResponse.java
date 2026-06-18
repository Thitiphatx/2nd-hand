package com.thitiphatx.secondhand.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShopResponse {
    private String id;
    private String name;
    private String email;
    private String phone;
    private String avatar;
    private String location;
    private LocalDateTime joinDate;
    private double rating;
    private long totalReviews;
}
