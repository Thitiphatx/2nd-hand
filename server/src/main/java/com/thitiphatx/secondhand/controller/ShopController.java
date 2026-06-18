package com.thitiphatx.secondhand.controller;

import com.thitiphatx.secondhand.model.Product;
import com.thitiphatx.secondhand.service.ShopService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class ShopController {

    private final ShopService shopService;

    @GetMapping
    public Page<Product> getProducts() {
        return shopService.getProducts();
    }
}
