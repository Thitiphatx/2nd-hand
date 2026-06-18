package com.thitiphatx.secondhand.dto;

import com.thitiphatx.secondhand.model.ProductState;
import lombok.Data;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@Data
public class UpdateProductRequest {
    private String name;
    private String description;
    @Field(targetType = FieldType.DECIMAL128)
    private BigDecimal price;
    private List<MultipartFile> images;
    private List<String> existingImages;
    private List<String> tags;
    private ProductState state;
}
