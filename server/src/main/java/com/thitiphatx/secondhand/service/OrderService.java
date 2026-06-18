package com.thitiphatx.secondhand.service;

import com.stripe.model.PaymentIntent;
import com.thitiphatx.secondhand.dto.CreateOrderRequest;
import com.thitiphatx.secondhand.dto.OrderRequest;
import com.thitiphatx.secondhand.dto.UpdateOrderStatusRequest;
import com.thitiphatx.secondhand.model.*;
import com.thitiphatx.secondhand.repository.OrderRepository;
import com.thitiphatx.secondhand.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderService {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final MongoTemplate mongoTemplate;
    private final PaymentService paymentService;

    public Page<Order> getMyPurchasedOrders(OrderRequest request, Pageable pageable, User user) {
        Query query = new Query();
        List<Criteria> criteria = new ArrayList<>();

        // 1. Always filter by the current user
        criteria.add(Criteria.where("userId").is(user.getId()));

        // 2. Status takes priority. If status exists, use it.
        if (request.getStatus() != null) {
            criteria.add(Criteria.where("status").is(request.getStatus()));
        }
        // 3. ONLY if status is null/not provided, support keyword search
        else if (request.getKeyword() != null && !request.getKeyword().isBlank()) {
            Criteria productCriteria = Criteria.where("item.productName").regex(request.getKeyword(), "i");
            Criteria shopkeeperCriteria = Criteria.where("item.shopkeeperName").regex(request.getKeyword(), "i");

            // Correctly apply the OR condition for the keyword
            criteria.add(new Criteria().orOperator(productCriteria, shopkeeperCriteria));
        }

        // Combine all criteria using AND
        query.addCriteria(new Criteria().andOperator(criteria.toArray(new Criteria[0])));

        // Apply default sort if none provided
        if (pageable.getSort().isUnsorted()) {
            query.with(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "purchasedDate"));
        }

        long total = mongoTemplate.count(query, Order.class);
        query.with(pageable);
        List<Order> orders = mongoTemplate.find(query, Order.class);

        return new PageImpl<>(orders, pageable, total);
    }

    public Page<Order> getShopOrders(OrderRequest request, Pageable pageable, User user) {
        Query query = new Query();
        List<Criteria> criteria = new ArrayList<>();

        // 1. Always filter by the current user
        criteria.add(Criteria.where("item.shopkeeperId").is(user.getId()));

        // 2. Status takes priority. If status exists, use it.
        if (request.getStatus() != null) {
            criteria.add(Criteria.where("status").is(request.getStatus()));
        }
        // 3. ONLY if status is null/not provided, support keyword search
        else if (request.getKeyword() != null && !request.getKeyword().isBlank()) {
            Criteria productCriteria = Criteria.where("item.productName").regex(request.getKeyword(), "i");

            criteria.add(new Criteria().orOperator(productCriteria));
        }

        // Combine all criteria using AND
        query.addCriteria(new Criteria().andOperator(criteria.toArray(new Criteria[0])));

        // Apply default sort if none provided
        if (pageable.getSort().isUnsorted()) {
            query.with(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "purchasedDate"));
        }

        long total = mongoTemplate.count(query, Order.class);
        query.with(pageable);
        List<Order> orders = mongoTemplate.find(query, Order.class);

        return new PageImpl<>(orders, pageable, total);
    }

    @Transactional
    public void updateOrderStatus(String id, UpdateOrderStatusRequest request, User user) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found by id: " + id));

        if (!order.getItem().getShopkeeperId().equals(user.getId())) {
            throw new AccessDeniedException("Only product owner can update order status");
        }

        OrderStatus current = order.getStatus();
        OrderStatus target = request.getStatus();

        if (target == null) {
            throw new IllegalArgumentException("Target status is required");
        }

        // Define valid transitions for the shopkeeper
        if (current == OrderStatus.PENDING) {
            if (target != OrderStatus.SHIPPED) {
                throw new IllegalArgumentException("From PENDING, you can only transition to SHIPPED");
            }
        } else if (current == OrderStatus.SHIPPED) {
            if (target != OrderStatus.DELIVERED && target != OrderStatus.PENDING) {
                throw new IllegalArgumentException("From SHIPPED, you can only transition to DELIVERED or roll back to PENDING");
            }
        } else if (current == OrderStatus.DELIVERED) {
            throw new IllegalArgumentException("Cannot change status of a DELIVERED order");
        } else if (current == OrderStatus.PENDING_REFUND) {
            OrderStatus previous = order.getPreviousStatusBeforeRefund();
            if (target != OrderStatus.CANCELLED && target != previous) {
                throw new IllegalArgumentException("From PENDING_REFUND, you can only transition to CANCELLED (Approve) or back to " + previous + " (Decline)");
            }
            if (target == OrderStatus.CANCELLED) {
                paymentService.createRefund(order);
                order.updateStatus(OrderStatus.REFUND_APPROVED);
                orderRepository.save(order);
                return;
            }
        } else {
            throw new IllegalArgumentException("Cannot update order status when current status is " + current);
        }

        if (target == OrderStatus.SHIPPED) {
            if (request.getShippingCode() == null || request.getShippingCode().isBlank()) {
                throw new IllegalArgumentException("Shipping code is required when marking as shipped.");
            }
            if (request.getDeliveryUrl() == null || request.getDeliveryUrl().isBlank()) {
                throw new IllegalArgumentException("Delivery URL is required when marking as shipped.");
            }
            order.updateStatus(target, request.getShippingCode(), request.getDeliveryUrl());
        } else {
            order.updateStatus(target);
        }

        orderRepository.save(order);
    }

    public Order getOrderDetail(String id, User user) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found for id " + id));
        
        boolean isBuyer = order.getUserId().equals(user.getId());
        boolean isShopkeeper = order.getItem().getShopkeeperId().equals(user.getId());

        if (!isBuyer && !isShopkeeper) {
            throw new AccessDeniedException("Access Denied: You cannot access this order detail. [User: " + user.getId() + ", Buyer: " + order.getUserId() + ", Shopkeeper: " + order.getItem().getShopkeeperId() + "]");
        }
        return order;
    }

    public Order createOrder(CreateOrderRequest request, User user) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found with ID: " + request.getProductId()));

        if (product.getState() != ProductState.LISTED) {
            throw new RuntimeException("Product is not available: " + product.getName());
        }

        if (product.getShopkeeperId().equals(user.getId())) {
            throw new RuntimeException("You cannot buy your own product: " + product.getName());
        }

        if (user.getAddresses().isEmpty()) {
            throw new RuntimeException("You must have at least one shipping address saved to place an order");
        }

        Address address = user.getAddresses().stream()
                .filter(addr -> addr.getId().equals(
                        request.getAddressId() != null ? request.getAddressId() : user.getDefaultAddressId()
                ))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Selected or default address not found"));

        OrderItem orderItem = OrderItem.builder()
                .productId(product.getId())
                .productName(product.getName())
                .productImage(product.getImages().getFirst())
                .shopkeeperId(product.getShopkeeperId())
                .shopkeeperName(product.getShopkeeperName())
                .price(product.getPrice())
                .build();

        Order order = Order.builder()
                .userId(user.getId())
                .shippingAddress(address)
                .item(orderItem)
                .total(product.getPrice())
                .purchasedDate(LocalDateTime.now())
                .paymentMethod(request.getPaymentMethod())
                .build();

        order.updateStatus(OrderStatus.PAY_WAITING);
        order = orderRepository.save(order);

        // Mark product as unavailable (Sold)
//        product.setState(ProductState.PURCHASED);
//        productRepository.save(product);

        try {
            PaymentIntent intent = paymentService.createPaymentIntent(order);
            order.setClientSecret(intent.getClientSecret());
            order.setPaymentIntentId(intent.getId());
            order = orderRepository.save(order);
        } catch (Exception e) {
            // Rollback order and product state in case of Stripe error
            System.out.println("Rolling back order and product state due to payment intent creation error: " + e.getMessage());
            orderRepository.delete(order);
            product.setState(ProductState.LISTED);
            productRepository.save(product);
            throw new RuntimeException("Failed to place order: " + e.getMessage(), e);
        }

        return order;
    }

    public void cancelOrder(String id, String refundEmail, User user) {
        Order order = orderRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Order not found by id: "+ id));

        // Check permission: Buyer or Shopkeeper
        boolean isBuyer = order.getUserId().equals(user.getId());
        boolean isShopkeeper = order.getItem().getShopkeeperId().equals(user.getId());

        if (!isBuyer && !isShopkeeper) {
            throw new AccessDeniedException("You don't have permission to cancel this order");
        }

        if (order.getStatus() == OrderStatus.CANCELLED || order.getStatus() == OrderStatus.PENDING_REFUND) {
            throw new RuntimeException("Order is already cancelled or pending refund");
        }

        // If not paid yet, just cancel
        if (order.getStatus() == OrderStatus.PAY_WAITING) {
            order.updateStatus(OrderStatus.CANCELLED);

            // Cancel Stripe PaymentIntent if exists
            if (order.getPaymentIntentId() != null && !order.getPaymentIntentId().isBlank()) {
                paymentService.cancelPaymentIntent(order.getPaymentIntentId());
            }

            // Also need to make the product available again
            Product product = productRepository.findById(order.getItem().getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));
            product.setState(ProductState.LISTED);
            productRepository.save(product);
        } else {
            // Paid, needs refund
            order.updateStatus(OrderStatus.PENDING_REFUND);
            if (refundEmail != null && !refundEmail.isBlank()) {
                order.setRefundEmail(refundEmail);
            }
        }

        orderRepository.save(order);
    }

    @Scheduled(cron = "0 */5 * * * *")
    public void cancelExpiredUnpaidOrders() {
        LocalDateTime expirationTime = LocalDateTime.now().minusMinutes(15);
        List<Order> payWaitingOrders = orderRepository.findByStatus(OrderStatus.PAY_WAITING);

        for (Order order : payWaitingOrders) {
            if (order.getPurchasedDate().isBefore(expirationTime)) {
                try {
                    System.out.println("Canceling expired unpaid order: " + order.getId());
                    
                    // 1. Revert order status
                    order.updateStatus(OrderStatus.CANCELLED);
                    orderRepository.save(order);

                    // 2. Cancel the Stripe PaymentIntent
                    paymentService.cancelPaymentIntent(order.getPaymentIntentId());

                    // 3. Release the product back to LISTED state
                    Product product = productRepository.findById(order.getItem().getProductId()).orElse(null);
                    if (product != null) {
                        product.setState(ProductState.LISTED);
                        productRepository.save(product);
                        System.out.println("Released product: " + product.getName() + " back to LISTED state.");
                    }
                } catch (Exception e) {
                    System.out.println("Error canceling expired order " + order.getId() + ": " + e.getMessage());
                }
            }
        }
    }
}
