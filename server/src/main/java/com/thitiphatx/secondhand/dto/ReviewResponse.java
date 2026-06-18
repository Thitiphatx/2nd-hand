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
public class ReviewResponse {
    private String id;
    private String userId;
    private String username;
    private String productId;
    private ProductResultResponse product;
    private String comment;
    private int score;
    private String reply;
    private LocalDateTime createdAt;
}
