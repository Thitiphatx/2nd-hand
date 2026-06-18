package com.thitiphatx.secondhand.repository;

import com.thitiphatx.secondhand.model.Order;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.thitiphatx.secondhand.model.OrderStatus;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends MongoRepository<Order, String> {
    List<Order> findByStatus(OrderStatus status);
    Optional<Order> findByPaymentIntentId(String paymentIntentId);
}
