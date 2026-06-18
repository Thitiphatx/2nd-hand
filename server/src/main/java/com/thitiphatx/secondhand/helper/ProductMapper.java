package com.thitiphatx.secondhand.helper;

import com.thitiphatx.secondhand.dto.ProductResultResponse;
import com.thitiphatx.secondhand.model.Product;
import com.thitiphatx.secondhand.model.ProductState;
import org.springframework.stereotype.Component;

@Component
public class ProductMapper {

    public ProductResultResponse mapToProductResponse(Product product) {
        return ProductResultResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .price(product.getPrice())
                .image(product.getImages().getFirst())
                .tags(product.getTags())
                .createdDate(product.getCreatedDate())
                .description(product.getDescription())
                .shopkeeperId(product.getShopkeeperId())
                .shopkeeperName(product.getShopkeeperName())
                .state(product.getState() != null ? product.getState() : ProductState.LISTED)
                .build();
    }
}

