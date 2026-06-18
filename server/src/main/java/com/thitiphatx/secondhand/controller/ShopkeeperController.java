package com.thitiphatx.secondhand.controller;

import com.thitiphatx.secondhand.dto.ShopkeeperStatsResponse;
import com.thitiphatx.secondhand.dto.ShopkeeperPublicStatsResponse;
import com.thitiphatx.secondhand.model.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/shopkeeper")
@RequiredArgsConstructor
public class ShopkeeperController {

    private final MongoTemplate mongoTemplate;

    @GetMapping("stats")
    public ShopkeeperStatsResponse getStats(@AuthenticationPrincipal User user) {
        String shopkeeperId = user.getId();

        // 1. Calculate total sales (sum of total for PENDING, SHIPPED, DELIVERED orders)
        Query salesQuery = new Query();
        salesQuery.addCriteria(Criteria.where("item.shopkeeperId").is(shopkeeperId)
                .and("status").in(OrderStatus.PENDING, OrderStatus.SHIPPED, OrderStatus.DELIVERED));
        List<Order> paidOrders = mongoTemplate.find(salesQuery, Order.class);
        BigDecimal totalSales = paidOrders.stream()
                .map(Order::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 2. Count total orders for this shopkeeper
        Query totalOrdersQuery = new Query();
        totalOrdersQuery.addCriteria(Criteria.where("item.shopkeeperId").is(shopkeeperId));
        long totalOrders = mongoTemplate.count(totalOrdersQuery, Order.class);

        // 3. Count active (LISTED) products for this shopkeeper
        Query activeProductsQuery = new Query();
        activeProductsQuery.addCriteria(Criteria.where("shopkeeperId").is(shopkeeperId)
                .and("state").is(ProductState.LISTED));
        long activeProducts = mongoTemplate.count(activeProductsQuery, Product.class);

        // 4. Calculate average rating of shopkeeper reviews
        Query reviewsQuery = new Query();
        reviewsQuery.addCriteria(Criteria.where("shopkeeperId").is(shopkeeperId));
        List<Review> allReviews = mongoTemplate.find(reviewsQuery, Review.class);
        double averageRating = allReviews.stream()
                .filter(r -> r.getReplyId() == null)
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);

        return ShopkeeperStatsResponse.builder()
                .totalSales(totalSales)
                .totalOrders(totalOrders)
                .activeProducts(activeProducts)
                .averageRating(averageRating)
                .build();
    }

    @GetMapping("/{id}/stats")
    public ShopkeeperPublicStatsResponse getPublicStats(@PathVariable String id) {
        // 1. Calculate success orders (status in PENDING, SHIPPED, DELIVERED)
        Query salesQuery = new Query();
        salesQuery.addCriteria(Criteria.where("item.shopkeeperId").is(id)
                .and("status").in(OrderStatus.PENDING, OrderStatus.SHIPPED, OrderStatus.DELIVERED));
        long successOrderCount = mongoTemplate.count(salesQuery, Order.class);

        // 2. Count active (LISTED) products for this shopkeeper
        Query activeProductsQuery = new Query();
        activeProductsQuery.addCriteria(Criteria.where("shopkeeperId").is(id)
                .and("state").is(ProductState.LISTED));
        long totalProducts = mongoTemplate.count(activeProductsQuery, Product.class);

        // 3. Calculate average rating of shopkeeper reviews
        Query reviewsQuery = new Query();
        reviewsQuery.addCriteria(Criteria.where("shopkeeperId").is(id));
        List<Review> allReviews = mongoTemplate.find(reviewsQuery, Review.class);
        double averageRating = allReviews.stream()
                .filter(r -> r.getReplyId() == null)
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);

        return ShopkeeperPublicStatsResponse.builder()
                .successOrderCount(successOrderCount)
                .totalProducts(totalProducts)
                .averageRating(averageRating)
                .build();
    }
}
