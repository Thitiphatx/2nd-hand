package com.thitiphatx.secondhand.controller;

import com.thitiphatx.secondhand.dto.*;
import com.thitiphatx.secondhand.model.Product;
import com.thitiphatx.secondhand.model.User;
import com.thitiphatx.secondhand.model.Review;
import com.thitiphatx.secondhand.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public Page<ProductResultResponse> searchProducts(
            @ModelAttribute ProductRequest request,
            Pageable pageable) {
        return productService.searchProducts(request, pageable);
    }

    @GetMapping("/tag")
    public List<String> getProductTags() {
        return productService.getProductTags();
    }

    @GetMapping("/my")
    public Page<ProductResultResponse> getMyProducts(
            @ModelAttribute ProductRequest request,
            Pageable pageable,
            @AuthenticationPrincipal User user
    ) {
        return productService.getMyProducts(request, pageable, user);
    }

    @GetMapping("/{id}")
    public Product getProductDetail(
            @PathVariable String id
    ) {
        return productService.getProductDetail(id);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public Product createProduct(
            @Valid @ModelAttribute CreateProductRequest request,
            @AuthenticationPrincipal User shopkeeper) {
        return productService.createProduct(request, shopkeeper);
    }

    @DeleteMapping("/{id}")
    public void deleteProduct(
            @PathVariable String id,
            @AuthenticationPrincipal User shopkeeper
    ) {
        productService.deleteProduct(id, shopkeeper);
    }

    @PutMapping("/{id}")
    public void updateProduct(
            @Valid @ModelAttribute UpdateProductRequest request,
            @PathVariable String id,
            @AuthenticationPrincipal User shopkeeper
    ) {
        productService.updateProduct(id, request, shopkeeper);
    }

    @PostMapping("/{id}/reviews")
    public void addReview(
            @PathVariable String id,
            @Valid @RequestBody ReviewRequest request,
            @AuthenticationPrincipal User user
    ) {
        productService.addReview(id, request, user);
    }

    @GetMapping("/{id}/reviews")
    public List<Review> getProductReviews(@PathVariable String id) {
        return productService.getProductReviews(id);
    }

    @GetMapping("/shopkeeper/{id}/public")
    public ShopResponse getShopDetails(@PathVariable String id) {
        return productService.getShopDetails(id);
    }

    @GetMapping("/shopkeeper/{id}/reviews")
    public List<ReviewResponse> getShopReviews(@PathVariable String id) {
        return productService.getShopReviews(id);
    }
}
