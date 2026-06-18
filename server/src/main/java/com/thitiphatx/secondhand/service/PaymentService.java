package com.thitiphatx.secondhand.service;

import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Refund;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.RefundCreateParams;
import com.thitiphatx.secondhand.model.Order;
import com.thitiphatx.secondhand.model.OrderStatus;
import com.thitiphatx.secondhand.model.Product;
import com.thitiphatx.secondhand.model.ProductState;
import com.thitiphatx.secondhand.model.User;
import com.thitiphatx.secondhand.repository.OrderRepository;
import com.thitiphatx.secondhand.repository.ProductRepository;
import com.thitiphatx.secondhand.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class PaymentService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public void confirmPayment(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));
        if (order.getStatus() == OrderStatus.PAY_WAITING) {
            order.updateStatus(OrderStatus.PENDING);
            orderRepository.save(order);
        }
    }

    public PaymentIntent createPaymentIntent(Order order) {
        PaymentIntentCreateParams.Builder paramsBuilder = PaymentIntentCreateParams.builder()
                .setAmount(order.getTotal().multiply(new BigDecimal("100").setScale(0, RoundingMode.HALF_UP)).longValue())
                .setCurrency("thb")
                .putMetadata("orderId", order.getId() != null ? order.getId() : "")
                .putMetadata("userId", order.getUserId() != null ? order.getUserId() : "")
                .putMetadata("productId", (order.getItem() != null && order.getItem().getProductId() != null) ? order.getItem().getProductId() : "")
                .putMetadata("productName", (order.getItem() != null && order.getItem().getProductName() != null) ? order.getItem().getProductName() : "")
                .putMetadata("shopkeeperId", (order.getItem() != null && order.getItem().getShopkeeperId() != null) ? order.getItem().getShopkeeperId() : "")
                .putMetadata("shopkeeperName", (order.getItem() != null && order.getItem().getShopkeeperName() != null) ? order.getItem().getShopkeeperName() : "")
                .putMetadata("total", order.getTotal() != null ? order.getTotal().toString() : "");

        if ("PROMPTPAY".equalsIgnoreCase(order.getPaymentMethod())) {
            paramsBuilder.addPaymentMethodType("promptpay");
        } else if ("CREDIT_CARD".equalsIgnoreCase(order.getPaymentMethod())) {
            paramsBuilder.addPaymentMethodType("card");
        } else {
            paramsBuilder.addPaymentMethodType("card").addPaymentMethodType("promptpay");
        }

        try {
            PaymentIntent intent = PaymentIntent.create(paramsBuilder.build());
            System.out.println("PaymentIntent Created Successfully!");
            System.out.println("PaymentIntent ID: " + intent.getId());
            System.out.println("Client Secret: " + intent.getClientSecret());
            return intent;
        } catch (StripeException e) {
            System.out.println("Stripe Error creating PaymentIntent: " + e.getMessage());
            throw new RuntimeException("Stripe error: " + e.getMessage(), e);
        }
    }

    public void cancelPaymentIntent(String paymentIntentId) {
        if (paymentIntentId == null || paymentIntentId.isBlank()) return;
        try {
            PaymentIntent intent = PaymentIntent.retrieve(paymentIntentId);
            // Cancel only if it's still cancelable (not succeeded or already canceled)
            if (!"canceled".equals(intent.getStatus()) && !"succeeded".equals(intent.getStatus())) {
                intent.cancel();
                System.out.println("PaymentIntent Canceled: " + paymentIntentId);
            }
        } catch (StripeException e) {
            System.out.println("Stripe Error canceling PaymentIntent: " + e.getMessage());
        }
    }

    @Transactional
    private boolean isValidEmail(String email) {
        if (email == null) return false;
        return email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$");
    }

    public void createRefund(Order order) {
        if (order.getPaymentIntentId() == null || order.getPaymentIntentId().isBlank()) {
            throw new IllegalArgumentException("Cannot refund order without a valid PaymentIntent ID");
        }
        try {
            RefundCreateParams.Builder paramsBuilder = RefundCreateParams.builder()
                    .setPaymentIntent(order.getPaymentIntentId());

            if ("PROMPTPAY".equalsIgnoreCase(order.getPaymentMethod())) {
                String email = order.getRefundEmail();
                if (email == null || email.isBlank()) {
                    email = userRepository.findById(order.getUserId())
                            .map(User::getEmail)
                            .orElse(null);
                }
                
                if (email != null && !email.isBlank() && isValidEmail(email)) {
                    paramsBuilder.setInstructionsEmail(email);
                } else {
                    System.out.println("Warning: Customer email '" + email + "' is empty or invalid. Using fallback mock email for PromptPay refund testing.");
                    paramsBuilder.setInstructionsEmail("test-refund@example.com");
                }
            }

            Refund refund = Refund.create(paramsBuilder.build());
            System.out.println("Refund created successfully for order: " + order.getId() + ", refund ID: " + refund.getId());
        } catch (StripeException e) {
            System.out.println("Stripe Error creating Refund: " + e.getMessage());
            throw new RuntimeException("Stripe error creating refund: " + e.getMessage(), e);
        }
    }

    public void handleWebhookEvent(Event event) {
        String eventType = event.getType();
        System.out.println("Received webhook event type: " + eventType);

        switch (eventType) {
            case "payment_intent.succeeded": {
                PaymentIntent paymentIntent = (PaymentIntent) event.getDataObjectDeserializer().getObject().orElse(null);
                if (paymentIntent != null) {
                    handlePaymentIntentSucceeded(paymentIntent);
                }
                break;
            }
            case "payment_intent.canceled": {
                PaymentIntent paymentIntent = (PaymentIntent) event.getDataObjectDeserializer().getObject().orElse(null);
                if (paymentIntent != null) {
                    handlePaymentIntentCanceled(paymentIntent);
                }
                break;
            }
            case "refund.created":
            case "refund.updated": {
                Refund refund = (Refund) event.getDataObjectDeserializer().getObject().orElse(null);
                if (refund != null) {
                    handleRefundUpdated(refund);
                }
                break;
            }
            case "refund.failed": {
                Refund refund = (Refund) event.getDataObjectDeserializer().getObject().orElse(null);
                if (refund != null) {
                    handleRefundFailed(refund);
                }
                break;
            }
            default:
                System.out.println("Unhandled event type: " + eventType);
        }
    }

    private void handlePaymentIntentSucceeded(PaymentIntent paymentIntent) {
        String paymentIntentId = paymentIntent.getId();
        Optional<Order> optionalOrder = orderRepository.findByPaymentIntentId(paymentIntentId);
        
        if (optionalOrder.isPresent()) {
            Order order = optionalOrder.get();
            if (order.getStatus() == OrderStatus.PAY_WAITING) {
                order.updateStatus(OrderStatus.PENDING);
                orderRepository.save(order);
                System.out.println("Order status updated to PENDING for order ID: " + order.getId());
            } else {
                System.out.println("Order ID: " + order.getId() + " is already in state " + order.getStatus() + ", ignoring update to PENDING");
            }
        } else {
            System.out.println("Order not found for PaymentIntent ID: " + paymentIntentId);
        }
    }

    private void handlePaymentIntentCanceled(PaymentIntent paymentIntent) {
        String paymentIntentId = paymentIntent.getId();
        Optional<Order> optionalOrder = orderRepository.findByPaymentIntentId(paymentIntentId);
        
        if (optionalOrder.isPresent()) {
            Order order = optionalOrder.get();
            if (order.getStatus() != OrderStatus.CANCELLED) {
                order.updateStatus(OrderStatus.CANCELLED);
                orderRepository.save(order);
                System.out.println("Order status updated to CANCELLED for order ID: " + order.getId());

                // Release product back to LISTED state
                releaseProduct(order.getItem().getProductId());
            }
        } else {
            System.out.println("Order not found for PaymentIntent ID: " + paymentIntentId);
        }
    }

    private void handleRefundUpdated(Refund refund) {
        String paymentIntentId = refund.getPaymentIntent();
        if (paymentIntentId == null || paymentIntentId.isBlank()) {
            System.out.println("Refund " + refund.getId() + " does not have an associated PaymentIntent ID");
            return;
        }

        Optional<Order> optionalOrder = orderRepository.findByPaymentIntentId(paymentIntentId);
        if (optionalOrder.isPresent()) {
            Order order = optionalOrder.get();
            String status = refund.getStatus();
            System.out.println("Processing refund " + refund.getId() + " status: " + status + " for order: " + order.getId());

            if ("succeeded".equalsIgnoreCase(status)) {
                if (order.getStatus() != OrderStatus.REFUNDED) {
                    order.updateStatus(OrderStatus.REFUNDED);
                    orderRepository.save(order);
                    System.out.println("Order " + order.getId() + " status updated to REFUNDED due to successful refund");
                    
                    // Release product back to LISTED state
                    releaseProduct(order.getItem().getProductId());
                }
            } else if ("failed".equalsIgnoreCase(status)) {
                revertRefundOrder(order);
            }
        } else {
            System.out.println("Order not found for PaymentIntent ID: " + paymentIntentId + " associated with Refund: " + refund.getId());
        }
    }

    private void handleRefundFailed(Refund refund) {
        String paymentIntentId = refund.getPaymentIntent();
        if (paymentIntentId == null || paymentIntentId.isBlank()) {
            return;
        }

        Optional<Order> optionalOrder = orderRepository.findByPaymentIntentId(paymentIntentId);
        if (optionalOrder.isPresent()) {
            revertRefundOrder(optionalOrder.get());
        }
    }

    private void revertRefundOrder(Order order) {
        if (order.getStatus() == OrderStatus.REFUND_APPROVED || order.getStatus() == OrderStatus.PENDING_REFUND) {
            OrderStatus previous = order.getPreviousStatusBeforeRefund();
            if (previous != null) {
                order.updateStatus(previous);
                orderRepository.save(order);
                System.out.println("Refund failed. Order " + order.getId() + " reverted to previous status: " + previous);
            } else {
                System.out.println("Refund failed. No previous status found for order " + order.getId() + ". Reverting to PENDING by default");
                order.updateStatus(OrderStatus.PENDING);
                orderRepository.save(order);
            }
        }
    }

    private void releaseProduct(String productId) {
        if (productId == null || productId.isBlank()) return;
        try {
            Optional<Product> optionalProduct = productRepository.findById(productId);
            if (optionalProduct.isPresent()) {
                Product product = optionalProduct.get();
                product.setState(ProductState.LISTED);
                productRepository.save(product);
                System.out.println("Released product " + product.getId() + " (" + product.getName() + ") back to LISTED state");
            } else {
                System.out.println("Product not found with ID: " + productId);
            }
        } catch (Exception e) {
            System.out.println("Error releasing product back to LISTED state: " + e.getMessage());
        }
    }
}
