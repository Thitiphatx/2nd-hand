package com.thitiphatx.secondhand.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {
    @Id
    private String id;
    private String name;
    private String description;

    @Field(targetType = FieldType.DECIMAL128)
    private BigDecimal price;
    private List<String> images;
    private List<String> tags;
    private String shopkeeperId;
    private String shopkeeperName;
    private LocalDateTime createdDate;
    private ProductState state;
    private Double averageRating;
}
