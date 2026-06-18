package com.thitiphatx.secondhand.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.springframework.data.annotation.Id;

@Data
public class ReviewRequest {
    @NotBlank
    private String comment;

    @Min(1)
    @Max(5)
    private int rating;
    @NotBlank
    private String productId;
    private String repliedId;
}
