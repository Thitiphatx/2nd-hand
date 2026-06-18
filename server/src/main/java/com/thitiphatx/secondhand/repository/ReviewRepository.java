package com.thitiphatx.secondhand.repository;

import com.thitiphatx.secondhand.model.Review;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends MongoRepository<Review, String> {
    List<Review> findByProductId(String productId);
    List<Review> findByShopkeeperId(String shopkeeperId);
}