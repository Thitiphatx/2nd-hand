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
public class ProductVariant {
    private String name;
    
    @Field(targetType = FieldType.DECIMAL128)
    private BigDecimal price; // Optional price if different from base
    private int stock;
    private String image; // Added: Single image for this variant
}
