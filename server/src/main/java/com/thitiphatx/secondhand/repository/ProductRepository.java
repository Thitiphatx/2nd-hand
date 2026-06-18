package com.thitiphatx.secondhand.repository;

import com.thitiphatx.secondhand.model.Product;
import com.thitiphatx.secondhand.model.ProductState;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

import org.springframework.data.domain.Sort;

@Repository
public interface ProductRepository extends MongoRepository<Product, String> {
    List<Product> findByState(ProductState state, Sort sort);
}