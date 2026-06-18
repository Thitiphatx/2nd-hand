package com.thitiphatx.secondhand.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@Data
public class CreateProductRequest {
    @NotNull
    private String name;
    private String description;
    @NotNull
    @Field(targetType = FieldType.DECIMAL128)
    private BigDecimal price;
    @NotNull
    private List<String> tags;
    private List<MultipartFile> images;
}
