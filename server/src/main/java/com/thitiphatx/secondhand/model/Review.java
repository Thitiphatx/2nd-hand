package com.thitiphatx.secondhand.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {
    @Id
    private String id;
    private String userId;
    private String userName;
    private String productId;
    private String shopkeeperId;
    private String replyId;
    private String comment;
    private int rating; // 1-5
    private LocalDateTime createdDate;
}
