package com.thitiphatx.secondhand.dto;

import com.thitiphatx.secondhand.model.ProductState;
import lombok.Builder;
import lombok.Data;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ProductResultResponse {
    private String id;
    private String name;
    private String description;
    @Field(targetType = FieldType.DECIMAL128)
    private BigDecimal price;
    private String image;
    private List<String> tags;
    private String shopkeeperId;
    private String shopkeeperName;
    private LocalDateTime createdDate;
    private ProductState state;
}
