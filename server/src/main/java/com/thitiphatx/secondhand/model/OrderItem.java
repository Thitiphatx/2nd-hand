package com.thitiphatx.secondhand.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {
    private String productId;
    private String productName;
    private String productImage;
    private String shopkeeperId;
    private String shopkeeperName;
    @Field(targetType = FieldType.DECIMAL128)
    private BigDecimal price;
}
